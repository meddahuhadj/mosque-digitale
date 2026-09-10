import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { mosqueMembers } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

type Role = "super_admin" | "mosque_admin" | "imam" | "operator" | "moderator" | "worshipper";

const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 0,
  mosque_admin: 1,
  imam: 2,
  operator: 3,
  moderator: 4,
  worshipper: 5,
};

export function requireRole(minimumRole: Role) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const mosqueId = req.params.mosqueId || (req.body as any)?.mosqueId || (req.query as any)?.mosqueId;
    if (!mosqueId) {
      return res.status(400).json({ error: "mosqueId required" });
    }

    const [member] = await db
      .select()
      .from(mosqueMembers)
      .where(
        and(
          eq(mosqueMembers.mosqueId, mosqueId),
          eq(mosqueMembers.userId, req.user.id)
        )
      )
      .limit(1);

    if (!member) {
      return res.status(403).json({ error: "Not a member of this mosque" });
    }

    const userLevel = ROLE_HIERARCHY[member.role as Role] ?? 99;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 99;

    if (userLevel > requiredLevel) {
      return res.status(403).json({ error: `Requires ${minimumRole} or higher` });
    }

    (req as any).mosqueRole = member.role;
    (req as any).mosqueId = mosqueId;
    next();
  };
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  (req as any).requireSuperAdmin = true;
  next();
}

export { ROLE_HIERARCHY };
