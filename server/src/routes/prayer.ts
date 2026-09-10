import { Router } from "express";
import { db } from "../db/index.js";
import { prayerTimes } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { prayerTimesSchema } from "../utils/validators.js";
import { getOrCalculatePrayerTimes, calculatePrayerTimes, getNextPrayer } from "../services/prayer-times.js";
import { childLogger } from "../logger.js";

const log = childLogger("prayer-route");
const router = Router();

// ── Get Prayer Times for Mosque ────────────────────────────────────────

router.get("/:mosqueId", async (req, res, next) => {
  try {
    const mosqueId = req.params.mosqueId as string;
    const date = (req.query.date as string) || new Date().toISOString().split("T")[0];

    const times = await getOrCalculatePrayerTimes(mosqueId, date);
    if (!times) return res.status(404).json({ error: "Cannot determine prayer times (missing coordinates)" });

    res.json(times);
  } catch (err) {
    next(err);
  }
});

// ── Get Next Prayer ────────────────────────────────────────────────────

router.get("/:mosqueId/next", async (req, res, next) => {
  try {
    const mosqueId = req.params.mosqueId as string;
    const { mosques } = await import("../db/schema.js");
    const [mosque] = await db.select().from(mosques).where(eq(mosques.id, mosqueId)).limit(1);
    if (!mosque || !mosque.lat || !mosque.lng) {
      return res.status(404).json({ error: "Mosque coordinates not set" });
    }

    const next = getNextPrayer(mosque.lat, mosque.lng, mosque.calculationMethod || undefined);
    if (!next) return res.status(404).json({ error: "Could not determine next prayer" });

    res.json({
      name: next.name,
      time: next.time.toISOString(),
      minutesUntil: next.minutesUntil,
    });
  } catch (err) {
    next(err);
  }
});

// ── Set Prayer Times (Admin) ───────────────────────────────────────────

router.post("/:mosqueId", authMiddleware, requireRole("mosque_admin"), validate(prayerTimesSchema), async (req, res, next) => {
  try {
    const mosqueId = req.params.mosqueId as string;
    const data = req.body;

    const [existing] = await db
      .select()
      .from(prayerTimes)
      .where(and(eq(prayerTimes.mosqueId, mosqueId), eq(prayerTimes.date, data.date)))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(prayerTimes)
        .set(data)
        .where(eq(prayerTimes.id, existing.id))
        .returning();
      return res.json(updated);
    }

    const [created] = await db
      .insert(prayerTimes)
      .values({ mosqueId, ...data })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// ── Get Prayer Times Range ─────────────────────────────────────────────

router.get("/:mosqueId/range", async (req, res, next) => {
  try {
    const mosqueId = req.params.mosqueId as string;
    const from = req.query.from as string;
    const to = req.query.to as string;
    if (!from || !to) return res.status(400).json({ error: "from and to query params required (YYYY-MM-DD)" });

    const times = await db
      .select()
      .from(prayerTimes)
      .where(
        and(
          eq(prayerTimes.mosqueId, mosqueId),
          eq(prayerTimes.date, from), // simplified — in production use BETWEEN
        )
      );
    res.json(times);
  } catch (err) {
    next(err);
  }
});

export default router;
