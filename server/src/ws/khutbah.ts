import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyAccessToken, AuthUser } from "../middleware/auth.js";
import { translateSegment, TranslationResult } from "../services/translator.js";
import { setSocketIO } from "../services/notifications.js";
import { childLogger } from "../logger.js";

const log = childLogger("socket-io");

export interface KhutbahRoom {
  code: string;
  mosqueId: string;
  status: "idle" | "live" | "paused" | "stopped";
  broadcaster: Socket | null;
  listeners: Map<string, Set<Socket>>; // lang -> sockets
  history: KhutbahSegment[];
  seq: number;
  topic?: string;
  imamName?: string;
  languages: string[];
  startedAt?: Date;
  endedAt?: Date;
}

export interface KhutbahSegment {
  seq: number;
  ts: number;
  arabic: string;
  translations: Record<string, string>;
  isQuran: boolean;
  quranRef: string | null;
  quranRefGuessed: boolean;
  isHadith: boolean;
  degraded: boolean;
  corrected: boolean;
  confidence: "high" | "medium" | "low";
}

const rooms = new Map<string, KhutbahRoom>();

export function getRoom(code: string): KhutbahRoom | undefined {
  return rooms.get(code);
}

export function getAllRooms(): Map<string, KhutbahRoom> {
  return rooms;
}

export function setupSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingInterval: 20000,
    pingTimeout: 10000,
    maxHttpBufferSize: 5e6, // 5MB for audio chunks
  });

  // ── Khutbah Namespace ──────────────────────────────────────────────

  const khutbah = io.of("/khutbah");

  khutbah.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (token) {
      const user = verifyAccessToken(token as string);
      if (user) {
        (socket as any).user = user;
      }
    }
    next();
  });

  khutbah.on("connection", (socket: Socket) => {
    log.debug(`Client connected: ${socket.id}`);

    socket.on("join-broadcast", ({ code, token }: { code: string; token: string }) => {
      const room = rooms.get(code);
      if (!room) {
        return socket.emit("error", { message: "Session not found" });
      }
      if (room.broadcaster && room.broadcaster.id !== socket.id) {
        return socket.emit("error", { message: "Session already has a broadcaster" });
      }

      room.broadcaster = socket;
      room.status = "live";
      if (!room.startedAt) room.startedAt = new Date();
      socket.join(`bc:${code}`);

      socket.emit("hello", {
        code,
        status: room.status,
        listeners: countListeners(room),
        languages: room.languages,
        topic: room.topic,
        imamName: room.imamName,
        seq: room.seq,
      });

      log.info(`Broadcaster joined session ${code}`);
    });

    socket.on("join-listen", ({ code, lang, since }: { code: string; lang: string; since?: number }) => {
      let room = rooms.get(code);
      if (!room) {
        room = createRoom(code);
      }

      if (!room.listeners.has(lang)) {
        room.listeners.set(lang, new Set());
      }
      room.listeners.get(lang)!.add(socket);
      socket.join(`listen:${code}:${lang}`);

      const history = since
        ? room.history.filter((s) => s.seq > since)
        : room.history;

      socket.emit("hello", {
        code,
        status: room.status,
        lang,
        history,
        mosqueName: room.topic || "",
        seq: room.seq,
        listeners: countListeners(room),
      });

      log.debug(`Listener joined session ${code} lang=${lang}`);
    });

    socket.on("transcript", async (data: { code: string; text: string; is_final?: boolean }) => {
      const room = rooms.get(data.code);
      if (!room || room.broadcaster?.id !== socket.id) return;

      const segment: KhutbahSegment = {
        seq: ++room.seq,
        ts: Date.now(),
        arabic: data.text,
        translations: {},
        isQuran: false,
        quranRef: null,
        quranRefGuessed: false,
        isHadith: false,
        degraded: false,
        corrected: false,
        confidence: "high",
      };

      // Translate to all active languages
      const activeLangs = [...room.listeners.keys()];
      if (activeLangs.length > 0) {
        try {
          const result = await translateSegment(data.text, activeLangs);
          if (result) {
            segment.translations = result.translations;
            segment.isQuran = result.is_quran;
            segment.quranRef = result.quran_ref;
            segment.isHadith = result.is_hadith;
          } else {
            segment.degraded = true;
          }
        } catch (err: any) {
          log.warn(`Translation failed: ${err.message}`);
          segment.degraded = true;
        }
      }

      room.history.push(segment);
      if (room.history.length > 40) room.history.shift();

      // Broadcast to all listeners with per-language text
      for (const [lang, sockets] of room.listeners) {
        for (const s of sockets) {
          s.emit("phrase", {
            seq: segment.seq,
            ts: segment.ts,
            lang,
            arabic: segment.arabic,
            text: segment.translations[lang] || segment.arabic,
            is_quran: segment.isQuran,
            quran_ref: segment.quranRef,
            degraded: segment.degraded,
            corrected: segment.corrected,
            confidence: segment.confidence,
          });
        }
      }

      // Notify broadcaster
      socket.emit("monitor", {
        seq: segment.seq,
        arabic: segment.arabic,
        is_quran: segment.isQuran,
        quran_ref: segment.quranRef,
        degraded: segment.degraded,
        listeners: countListeners(room),
        provider: segment.degraded ? "degraded" : "active",
      });
    });

    socket.on("correct", (data: { code: string; seq: number; arabic: string }) => {
      const room = rooms.get(data.code);
      if (!room || room.broadcaster?.id !== socket.id) return;

      const seg = room.history.find((s) => s.seq === data.seq);
      if (seg) {
        seg.arabic = data.arabic;
        seg.corrected = true;

        for (const [, sockets] of room.listeners) {
          for (const s of sockets) {
            s.emit("corrected", { seq: seg.seq, arabic: seg.arabic });
          }
        }
      }
    });

    socket.on("control", (data: { code: string; action: "pause" | "resume" | "stop" }) => {
      const room = rooms.get(data.code);
      if (!room || room.broadcaster?.id !== socket.id) return;

      if (data.action === "pause") room.status = "paused";
      else if (data.action === "resume") room.status = "live";
      else if (data.action === "stop") {
        room.status = "stopped";
        room.endedAt = new Date();
      }

      khutbah.to(`listen:${data.code}`).emit("session", {
        status: room.status,
      });

      socket.emit("status", { status: room.status });
    });

    socket.on("set-lang", (data: { code: string; lang: string }) => {
      // Remove from old language rooms
      for (const [lang, sockets] of (socket as any)._currentRooms || new Map()) {
        sockets.delete(socket);
        socket.leave(`listen:${data.code}:${lang}`);
      }

      // Add to new language
      const room = rooms.get(data.code);
      if (room) {
        if (!room.listeners.has(data.lang)) {
          room.listeners.set(data.lang, new Set());
        }
        room.listeners.get(data.lang)!.add(socket);
        socket.join(`listen:${data.code}:${data.lang}`);

        socket.emit("lang_changed", {
          lang: data.lang,
          history: room.history,
        });
      }
    });

    socket.on("disconnect", () => {
      // Clean up listener references
      for (const [, room] of rooms) {
        for (const [lang, sockets] of room.listeners) {
          if (sockets.has(socket)) {
            sockets.delete(socket);
            if (sockets.size === 0) room.listeners.delete(lang);
          }
        }
        if (room.broadcaster?.id === socket.id) {
          room.broadcaster = null;
          if (room.status === "live") room.status = "paused";
        }
      }
      log.debug(`Client disconnected: ${socket.id}`);
    });
  });

  // ── Notifications Namespace ────────────────────────────────────────

  const notifications = io.of("/notifications");

  notifications.on("connection", (socket: Socket) => {
    socket.on("subscribe-mosque", ({ mosqueId }: { mosqueId: string }) => {
      socket.join(`mosque:${mosqueId}`);
      log.debug(`Client subscribed to mosque ${mosqueId}`);
    });

    socket.on("subscribe-user", ({ userId }: { userId: string }) => {
      socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => {
      log.debug(`Notification client disconnected: ${socket.id}`);
    });
  });

  // ── Janitor: cleanup idle rooms ────────────────────────────────────

  setInterval(() => {
    const now = Date.now();
    const ttl = 20 * 60 * 1000; // 20 min idle
    for (const [code, room] of rooms) {
      if (room.status === "idle" && now - room.seq > ttl) {
        rooms.delete(code);
        log.debug(`Purged idle room ${code}`);
      } else if (room.status === "stopped" && room.endedAt) {
        const ended = room.endedAt.getTime();
        if (now - ended > 12 * 60 * 60 * 1000) { // 12h after stop
          rooms.delete(code);
          log.debug(`Purged stopped room ${code}`);
        }
      }
    }
  }, 120_000);

  return io;
}

function createRoom(code: string): KhutbahRoom {
  const room: KhutbahRoom = {
    code,
    mosqueId: "",
    status: "idle",
    broadcaster: null,
    listeners: new Map(),
    history: [],
    seq: 0,
    languages: ["fr", "en"],
  };
  rooms.set(code, room);
  return room;
}

function countListeners(room: KhutbahRoom): number {
  let count = 0;
  for (const sockets of room.listeners.values()) {
    count += sockets.size;
  }
  return count;
}
