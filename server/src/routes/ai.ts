import { Router } from "express";
import { generateKhutbahPlan, answerMosqueQuestion } from "../services/ai-assistant.js";
import { authMiddleware } from "../middleware/auth.js";
import { childLogger } from "../logger.js";

const log = childLogger("ai-route");
const router = Router();

// ── Generate Khutbah Plan ──────────────────────────────────────────────

router.post("/assistant/plan", authMiddleware, async (req, res, next) => {
  try {
    const { topic, language } = req.body;
    if (!topic) return res.status(400).json({ error: "topic required" });

    const plan = await generateKhutbahPlan(topic, language || "fr");
    if (!plan) return res.status(503).json({ error: "AI service unavailable" });
    res.json(plan);
  } catch (err) {
    next(err);
  }
});

// ── Ask Mosque Question ────────────────────────────────────────────────

router.post("/assistant/ask", authMiddleware, async (req, res, next) => {
  try {
    const { question, mosqueContext } = req.body;
    if (!question) return res.status(400).json({ error: "question required" });

    const answer = await answerMosqueQuestion(question, mosqueContext || "");
    if (!answer) return res.status(503).json({ error: "AI service unavailable" });
    res.json({ answer });
  } catch (err) {
    next(err);
  }
});

export default router;
