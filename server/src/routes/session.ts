import { Router } from "express";
import crypto from "crypto";
import { db } from "../db/index.js";
import { sessions, mosques } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createSessionSchema } from "../utils/validators.js";
import { generateSessionCode } from "../services/qrcode.js";
import { generateQRCode } from "../services/qrcode.js";
import { config } from "../config.js";
import { childLogger } from "../logger.js";

const log = childLogger("session-route");
const router = Router();

// ── Create Session ─────────────────────────────────────────────────────

router.post("/", authMiddleware, validate(createSessionSchema), async (req, res, next) => {
  try {
    const { mosqueId, topic, imamName, languages } = req.body;

    const code = generateSessionCode();
    const token = crypto.randomBytes(24).toString("base64url");
    const [session] = await db
      .insert(sessions)
      .values({
        mosqueId,
        code,
        token,
        topic,
        imamName,
        languages,
        status: "idle",
      })
      .returning();

    const baseUrl = config.publicBaseUrl || `http://localhost:${config.port}`;
    const joinUrl = `${baseUrl}/?s=${code}`;

    log.info(`Session created: ${code} for mosque ${mosqueId}`);
    res.status(201).json({
      id: session.id,
      code: session.code,
      joinUrl,
      status: session.status,
      topic: session.topic,
      languages: session.languages,
    });
  } catch (err) {
    next(err);
  }
});

// ── Get Session by Code ────────────────────────────────────────────────

router.get("/:code", async (req, res, next) => {
  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.code, (req.params.code as string).toUpperCase()))
      .limit(1);

    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// ── Get Session QR Code ────────────────────────────────────────────────

router.get("/:code/qr.png", async (req, res, next) => {
  try {
    const code = (req.params.code as string).toUpperCase();
    const [session] = await db.select().from(sessions).where(eq(sessions.code, code)).limit(1);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const baseUrl = config.publicBaseUrl || `http://localhost:${config.port}`;
    const joinUrl = `${baseUrl}/?s=${code}`;
    const qrBuffer = await generateQRCode(joinUrl);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    res.send(qrBuffer);
  } catch (err) {
    next(err);
  }
});

// ── Update Session Status ──────────────────────────────────────────────

router.put("/:code/status", authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["idle", "live", "paused", "stopped"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updates: any = { status };
    if (status === "live") updates.startedAt = new Date();
    if (status === "stopped") updates.endedAt = new Date();

    const [updated] = await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.code, (req.params.code as string).toUpperCase()))
      .returning();

    if (!updated) return res.status(404).json({ error: "Session not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── Get Session History ────────────────────────────────────────────────

router.get("/:code/history", async (req, res, next) => {
  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.code, (req.params.code as string).toUpperCase()))
      .limit(1);

    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({
      code: session.code,
      topic: session.topic,
      languages: session.languages,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
