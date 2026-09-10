import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { db } from "../db/index.js";
import { users, mosqueMembers } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { childLogger } from "../logger.js";

const log = childLogger("auth");

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function generateAccessToken(user: AuthUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: "refresh" }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as AuthPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { sub: string } | null {
  try {
    const payload = jwt.verify(token, config.jwt.secret) as { sub: string; type: string };
    if (payload.type !== "refresh") return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.access_token;

  let token: string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = { id: payload.sub, email: payload.email, name: payload.name };
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.access_token;

  let token: string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = { id: payload.sub, email: payload.email, name: payload.name };
    }
  }
  next();
}

export async function requireMosqueRole(role: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const mosqueId = req.params.mosqueId || req.body.mosqueId;
    if (!mosqueId || !req.user) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const member = await db
      .select()
      .from(mosqueMembers)
      .where(
        eq(mosqueMembers.mosqueId, mosqueId) &&
        eq(mosqueMembers.userId, req.user.id)
      )
      .limit(1);

    if (!member.length) {
      return res.status(403).json({ error: "Not a member of this mosque" });
    }

    const hierarchy = ["super_admin", "mosque_admin", "imam", "operator", "moderator", "worshipper"];
    const userLevel = hierarchy.indexOf(member[0].role);
    const requiredLevel = hierarchy.indexOf(role);

    if (userLevel > requiredLevel) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}
