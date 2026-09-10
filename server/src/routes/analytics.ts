import { Router } from "express";
import { getDashboardStats } from "../services/analytics.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { childLogger } from "../logger.js";

const log = childLogger("analytics-route");
const router = Router();

// ── Dashboard Stats ────────────────────────────────────────────────────

router.get("/:mosqueId/dashboard", authMiddleware, requireRole("mosque_admin"), async (req, res, next) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const stats = await getDashboardStats(req.params.mosqueId as string, days);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;
