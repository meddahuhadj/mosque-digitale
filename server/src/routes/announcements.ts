import { Router } from "express";
import { db } from "../db/index.js";
import { announcements } from "../db/schema.js";
import { eq, and, or, isNull, gte } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { announcementSchema, paginationSchema } from "../utils/validators.js";
import { createNotification } from "../services/notifications.js";
import { childLogger } from "../logger.js";

const log = childLogger("announcement-route");
const router = Router();

// ── Get Announcements for Mosque ───────────────────────────────────────

router.get("/:mosqueId", async (req, res, next) => {
  try {
    const mosqueId = req.params.mosqueId as string;
    const limit = parseInt(req.query.limit as string) || 20;

    const now = new Date();
    const items = await db
      .select()
      .from(announcements)
      .where(
        and(
          eq(announcements.mosqueId, mosqueId),
          or(
            isNull(announcements.expiresAt),
            gte(announcements.expiresAt, now)
          )
        )
      )
      .orderBy(announcements.createdAt)
      .limit(limit);

    res.json(items);
  } catch (err) {
    next(err);
  }
});

// ── Create Announcement ────────────────────────────────────────────────

router.post("/:mosqueId", authMiddleware, requireRole("moderator"), validate(announcementSchema), async (req, res, next) => {
  try {
    const [item] = await db
      .insert(announcements)
      .values({
        mosqueId: req.params.mosqueId as string,
        ...req.body,
        authorId: req.user!.id,
        publishedAt: req.body.publishedAt || new Date(),
      })
      .returning();

    // Send notification
    await createNotification({
      mosqueId: req.params.mosqueId as string,
      title: req.body.title,
      body: req.body.body,
      type: "announcement",
      data: { announcementId: item.id },
    });

    log.info(`Announcement created: ${item.title}`);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// ── Update Announcement ────────────────────────────────────────────────

router.put("/:mosqueId/:id", authMiddleware, requireRole("moderator"), async (req, res, next) => {
  try {
    const [updated] = await db
      .update(announcements)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(announcements.id, req.params.id as string))
      .returning();
    if (!updated) return res.status(404).json({ error: "Announcement not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── Delete Announcement ────────────────────────────────────────────────

router.delete("/:mosqueId/:id", authMiddleware, requireRole("moderator"), async (req, res, next) => {
  try {
    await db.delete(announcements).where(eq(announcements.id, req.params.id as string));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
