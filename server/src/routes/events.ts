import { Router } from "express";
import { db } from "../db/index.js";
import { events } from "../db/schema.js";
import { eq, and, gte } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { eventSchema } from "../utils/validators.js";
import { createNotification } from "../services/notifications.js";
import { childLogger } from "../logger.js";

const log = childLogger("event-route");
const router = Router();

// ── Get Events for Mosque ──────────────────────────────────────────────

router.get("/:mosqueId", async (req, res, next) => {
  try {
    const mosqueId = req.params.mosqueId as string;
    const category = req.query.category as string;
    const limit = parseInt(req.query.limit as string) || 20;

    const conditions = [eq(events.mosqueId, mosqueId), eq(events.isCancelled, false)];
    if (category) conditions.push(eq(events.category, category as any));

    const items = await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(events.startTime)
      .limit(limit);

    res.json(items);
  } catch (err) {
    next(err);
  }
});

// ── Create Event ───────────────────────────────────────────────────────

router.post("/:mosqueId", authMiddleware, requireRole("moderator"), validate(eventSchema), async (req, res, next) => {
  try {
    const [event] = await db
      .insert(events)
      .values({
        mosqueId: req.params.mosqueId as string,
        ...req.body,
      })
      .returning();

    // Send notification if reminder is set
    if (event.reminderMinutes && event.reminderMinutes > 0) {
      await createNotification({
        mosqueId: req.params.mosqueId as string,
        title: `New Event: ${event.title}`,
        body: event.description || `Event on ${new Date(event.startTime).toLocaleDateString()}`,
        type: "event",
        data: { eventId: event.id },
      });
    }

    log.info(`Event created: ${event.title}`);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

// ── Update Event ───────────────────────────────────────────────────────

router.put("/:mosqueId/:id", authMiddleware, requireRole("moderator"), async (req, res, next) => {
  try {
    const [updated] = await db
      .update(events)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(events.id, req.params.id as string))
      .returning();
    if (!updated) return res.status(404).json({ error: "Event not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── Cancel Event ───────────────────────────────────────────────────────

router.put("/:mosqueId/:id/cancel", authMiddleware, requireRole("moderator"), async (req, res, next) => {
  try {
    const [updated] = await db
      .update(events)
      .set({ isCancelled: true, updatedAt: new Date() })
      .where(eq(events.id, req.params.id as string))
      .returning();
    if (!updated) return res.status(404).json({ error: "Event not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── Delete Event ───────────────────────────────────────────────────────

router.delete("/:mosqueId/:id", authMiddleware, requireRole("mosque_admin"), async (req, res, next) => {
  try {
    await db.delete(events).where(eq(events.id, req.params.id as string));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
