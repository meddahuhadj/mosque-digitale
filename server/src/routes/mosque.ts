import { Router } from "express";
import { db } from "../db/index.js";
import { mosques, mosqueMembers } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { createMosqueSchema, updateMosqueSchema } from "../utils/validators.js";
import { generateSessionCode } from "../services/qrcode.js";
import { generateQRCode } from "../services/qrcode.js";
import { childLogger } from "../logger.js";

const log = childLogger("mosque-route");
const router = Router();

// ── Create Mosque ──────────────────────────────────────────────────────

router.post("/", authMiddleware, validate(createMosqueSchema), async (req, res, next) => {
  try {
    const [mosque] = await db
      .insert(mosques)
      .values(req.body)
      .returning();

    // Add creator as mosque_admin
    await db.insert(mosqueMembers).values({
      mosqueId: mosque.id,
      userId: req.user!.id,
      role: "mosque_admin",
    });

    log.info(`Mosque created: ${mosque.name} (${mosque.slug})`);
    res.status(201).json(mosque);
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Mosque slug already exists" });
    }
    next(err);
  }
});

// ── Get All Mosques (public listing) ──────────────────────────────────

router.get("/", async (_req, res, next) => {
  try {
    const list = await db.select({
      id: mosques.id,
      name: mosques.name,
      slug: mosques.slug,
      city: mosques.city,
      country: mosques.country,
    }).from(mosques);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// ── Get Mosque by ID or Slug ───────────────────────────────────────────

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
    const [mosque] = await db
      .select()
      .from(mosques)
      .where(isUuid ? eq(mosques.id, id) : eq(mosques.slug, id))
      .limit(1);

    if (!mosque) return res.status(404).json({ error: "Mosque not found" });
    res.json(mosque);
  } catch (err) {
    next(err);
  }
});

// ── Update Mosque ──────────────────────────────────────────────────────

router.put("/:id", authMiddleware, requireRole("mosque_admin"), validate(updateMosqueSchema), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const [updated] = await db
      .update(mosques)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(mosques.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Mosque not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── Get Mosque Members ─────────────────────────────────────────────────

router.get("/:id/members", authMiddleware, requireRole("mosque_admin"), async (req, res, next) => {
  try {
    const members = await db
      .select({
        id: mosqueMembers.id,
        userId: mosqueMembers.userId,
        role: mosqueMembers.role,
        joinedAt: mosqueMembers.joinedAt,
      })
      .from(mosqueMembers)
      .where(eq(mosqueMembers.mosqueId, req.params.id as string));
    res.json(members);
  } catch (err) {
    next(err);
  }
});

// ── Add Member ─────────────────────────────────────────────────────────

router.post("/:id/members", authMiddleware, requireRole("mosque_admin"), async (req, res, next) => {
  try {
    const [member] = await db
      .insert(mosqueMembers)
      .values({
        mosqueId: req.params.id as string,
        userId: req.body.userId,
        role: req.body.role || "worshipper",
      })
      .returning();
    res.status(201).json(member);
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "User already a member" });
    }
    next(err);
  }
});

// ── Update Member Role ─────────────────────────────────────────────────

router.put("/:id/members/:memberId", authMiddleware, requireRole("mosque_admin"), async (req, res, next) => {
  try {
    const [updated] = await db
      .update(mosqueMembers)
      .set({ role: req.body.role })
      .where(eq(mosqueMembers.id, req.params.memberId as string))
      .returning();
    if (!updated) return res.status(404).json({ error: "Member not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── Remove Member ──────────────────────────────────────────────────────

router.delete("/:id/members/:memberId", authMiddleware, requireRole("mosque_admin"), async (req, res, next) => {
  try {
    await db.delete(mosqueMembers).where(eq(mosqueMembers.id, req.params.memberId as string));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ── Get Mosque QR Code ─────────────────────────────────────────────────

router.get("/:id/qr", async (req, res, next) => {
  try {
    const [mosque] = await db.select().from(mosques).where(eq(mosques.id, req.params.id as string)).limit(1);
    if (!mosque) return res.status(404).json({ error: "Mosque not found" });

    const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const joinUrl = `${baseUrl}/?mosque=${mosque.slug}`;
    const qrBuffer = await generateQRCode(joinUrl);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(qrBuffer);
  } catch (err) {
    next(err);
  }
});

export default router;
