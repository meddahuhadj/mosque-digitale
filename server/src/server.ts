import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { config } from "./config.js";
import { logger, childLogger } from "./logger.js";
import { db, testConnection } from "./db/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { setupSocketIO } from "./ws/khutbah.js";
import { setSocketIO } from "./services/notifications.js";

import authRoutes from "./routes/auth.js";
import mosqueRoutes from "./routes/mosque.js";
import sessionRoutes from "./routes/session.js";
import prayerRoutes from "./routes/prayer.js";
import quranRoutes from "./routes/quran.js";
import announcementRoutes from "./routes/announcements.js";
import eventRoutes from "./routes/events.js";
import analyticsRoutes from "./routes/analytics.js";
import aiRoutes from "./routes/ai.js";

const log = childLogger("server");
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

// ── Middleware ──────────────────────────────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("combined", {
  stream: { write: (msg: string) => log.http(msg.trim()) },
}));

// ── Health Check ───────────────────────────────────────────────────────

app.get("/healthz", async (_req, res) => {
  const dbOk = await testConnection();
  res.json({
    status: dbOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    database: dbOk ? "connected" : "disconnected",
    version: "1.0.0",
  });
});

// ── API Routes ─────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/mosques", mosqueRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/prayer-times", prayerRoutes);
app.use("/api/quran", quranRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);

// Placeholder routes (to be implemented in Groups C-G)
app.get("/api/languages", (_req, res) => {
  res.json({
    ar: "العربية (original)",
    fr: "Français",
    en: "English",
    nl: "Nederlands",
    tr: "Türkçe",
    ur: "اردو",
    es: "Español",
    de: "Deutsch",
    darija: "Darija — الدارجة",
    wo: "Wolof",
    bn: "বাংলা",
    ha: "Hausa",
  });
});

// ── Serve Frontend ─────────────────────────────────────────────────────

const frontendDir = join(__dirname, config.frontendDir);
app.use(express.static(frontendDir));

// SPA fallback — serve index.html for all non-API routes
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/ws/")) {
    return next();
  }
  res.sendFile(join(frontendDir, "index.html"));
});

// ── Error Handling ─────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ── Socket.IO ──────────────────────────────────────────────────────────

const io = setupSocketIO(httpServer);
setSocketIO(io);

// ── Start Server ───────────────────────────────────────────────────────

async function start() {
  const dbOk = await testConnection();
  if (!dbOk) {
    log.error("Failed to connect to database");
    process.exit(1);
  }
  log.info("Database connected");

  httpServer.listen(config.port, config.host, () => {
    log.info(`🕌 Mosque Digital OS running at http://${config.host}:${config.port}`);
    log.info(`   Environment: ${config.nodeEnv}`);
    log.info(`   Database: connected`);
    log.info(`   Socket.IO: enabled`);
  });
}

start().catch((err) => {
  log.error("Failed to start server", { error: err.message });
  process.exit(1);
});

export { app, httpServer, io };
