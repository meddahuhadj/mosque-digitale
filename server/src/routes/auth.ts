import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "../db/index.js";
import { users, refreshTokens, mosqueMembers } from "../db/schema.js";
import { eq, and, gt } from "drizzle-orm";
import { config } from "../config.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  authMiddleware,
} from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "../utils/validators.js";
import { childLogger } from "../logger.js";

const log = childLogger("auth-route");
const router = Router();

// ── Register ───────────────────────────────────────────────────────────

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name, phone, language } = req.body;

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    const [user] = await db
      .insert(users)
      .values({ email, passwordHash, name, phone, language })
      .returning({ id: users.id, email: users.email, name: users.name });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    log.info(`User registered: ${email}`);
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// ── Login ──────────────────────────────────────────────────────────────

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account deactivated" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    const authUser = { id: user.id, email: user.email, name: user.name };
    const accessToken = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    log.info(`User logged in: ${email}`);
    res.json({
      user: authUser,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// ── Refresh Token ──────────────────────────────────────────────────────

router.post("/refresh", validate(refreshTokenSchema), async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    const payload = verifyRefreshToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const [stored] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, token),
          gt(refreshTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!stored) {
      return res.status(401).json({ error: "Refresh token expired or revoked" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User not found or deactivated" });
    }

    const authUser = { id: user.id, email: user.email, name: user.name };
    const newAccessToken = generateAccessToken(authUser);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
});

// ── Logout ─────────────────────────────────────────────────────────────

router.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ── Me (current user) ─────────────────────────────────────────────────

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        language: users.language,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const memberships = await db
      .select({
        mosqueId: mosqueMembers.mosqueId,
        role: mosqueMembers.role,
      })
      .from(mosqueMembers)
      .where(eq(mosqueMembers.userId, req.user!.id));

    res.json({ ...user, memberships });
  } catch (err) {
    next(err);
  }
});

// ── Cleanup expired refresh tokens ─────────────────────────────────────

router.post("/cleanup-tokens", authMiddleware, async (_req, res, next) => {
  try {
    await db.delete(refreshTokens).where(gt(refreshTokens.expiresAt, new Date()));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
