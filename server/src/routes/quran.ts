import { Router } from "express";
import { db } from "../db/index.js";
import { quranSurahs, quranAyahs, quranTranslations, quranFavorites } from "../db/schema.js";
import { eq, and, or, like, sql } from "drizzle-orm";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { quranSearchSchema, paginationSchema } from "../utils/validators.js";
import { childLogger } from "../logger.js";

const log = childLogger("quran-route");
const router = Router();

// ── Get All Surahs ─────────────────────────────────────────────────────

router.get("/surahs", async (_req, res, next) => {
  try {
    const surahs = await db.select().from(quranSurahs).orderBy(quranSurahs.number);
    res.json(surahs);
  } catch (err) {
    next(err);
  }
});

// ── Get Single Surah ───────────────────────────────────────────────────

router.get("/surahs/:number", async (req, res, next) => {
  try {
    const num = parseInt(req.params.number as string, 10);
    const [surah] = await db
      .select()
      .from(quranSurahs)
      .where(eq(quranSurahs.number, num))
      .limit(1);

    if (!surah) return res.status(404).json({ error: "Surah not found" });

    const ayahs = await db
      .select()
      .from(quranAyahs)
      .where(eq(quranAyahs.surahNumber, num))
      .orderBy(quranAyahs.ayahNumber);

    res.json({ ...surah, ayahs });
  } catch (err) {
    next(err);
  }
});

// ── Get Ayahs by Surah ─────────────────────────────────────────────────

router.get("/surahs/:number/ayahs", async (req, res, next) => {
  try {
    const num = parseInt(req.params.number as string, 10);
    const language = (req.query.lang as string) || "ar";

    const ayahs = await db
      .select({
        id: quranAyahs.id,
        surahNumber: quranAyahs.surahNumber,
        ayahNumber: quranAyahs.ayahNumber,
        textArabic: quranAyahs.textArabic,
        page: quranAyahs.page,
        juz: quranAyahs.juz,
      })
      .from(quranAyahs)
      .where(eq(quranAyahs.surahNumber, num))
      .orderBy(quranAyahs.ayahNumber);

    if (language !== "ar") {
      // Fetch translations
      for (const ayah of ayahs) {
        const [translation] = await db
          .select()
          .from(quranTranslations)
          .where(
            and(
              eq(quranTranslations.ayahId, ayah.id),
              eq(quranTranslations.language, language)
            )
          )
          .limit(1);
        (ayah as any).translation = translation?.text || null;
      }
    }

    res.json(ayahs);
  } catch (err) {
    next(err);
  }
});

// ── Search Quran ───────────────────────────────────────────────────────

router.get("/search", validate(quranSearchSchema, "query"), async (req, res, next) => {
  try {
    const { q, language, surah, juz, page: pageNum, limit: lim } = req.query as any;

    const conditions = [];
    if (surah) conditions.push(eq(quranAyahs.surahNumber, surah));
    if (juz) conditions.push(eq(quranAyahs.juz, juz));
    if (q) {
      if (language === "ar") {
        conditions.push(sql`${quranAyahs.textArabic} ILIKE ${"%" + q + "%"}`);
      } else {
        // Search in translations
        conditions.push(sql`${quranTranslations.text} ILIKE ${"%" + q + "%"}`);
      }
    }

    if (conditions.length === 0) {
      return res.json({ results: [], total: 0 });
    }

    // Simplified search — in production, use full-text search
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    const results = await db
      .select({
        surahNumber: quranAyahs.surahNumber,
        ayahNumber: quranAyahs.ayahNumber,
        textArabic: quranAyahs.textArabic,
        page: quranAyahs.page,
        juz: quranAyahs.juz,
      })
      .from(quranAyahs)
      .where(whereClause)
      .limit(lim)
      .offset((pageNum - 1) * lim);

    res.json({ results, total: results.length });
  } catch (err) {
    next(err);
  }
});

// ── Get Verse by Reference (e.g., "2:255") ─────────────────────────────

router.get("/verse/:ref", async (req, res, next) => {
  try {
    const [surahStr, ayahStr] = (req.params.ref as string).split(":");
    const surahNum = parseInt(surahStr, 10);
    const ayahNum = parseInt(ayahStr, 10);

    if (isNaN(surahNum) || isNaN(ayahNum)) {
      return res.status(400).json({ error: "Invalid reference format. Use S:A (e.g., 2:255)" });
    }

    const [ayah] = await db
      .select()
      .from(quranAyahs)
      .where(
        and(
          eq(quranAyahs.surahNumber, surahNum),
          eq(quranAyahs.ayahNumber, ayahNum)
        )
      )
      .limit(1);

    if (!ayah) return res.status(404).json({ error: "Verse not found" });

    const [surah] = await db
      .select()
      .from(quranSurahs)
      .where(eq(quranSurahs.number, surahNum))
      .limit(1);

    res.json({ surah, ayah });
  } catch (err) {
    next(err);
  }
});

// ── Favorites ──────────────────────────────────────────────────────────

router.get("/favorites", authMiddleware, async (req, res, next) => {
  try {
    const favs = await db
      .select()
      .from(quranFavorites)
      .where(eq(quranFavorites.userId, req.user!.id));
    res.json(favs);
  } catch (err) {
    next(err);
  }
});

router.post("/favorites", authMiddleware, async (req, res, next) => {
  try {
    const { surahNumber, ayahNumber, note } = req.body;
    const [fav] = await db
      .insert(quranFavorites)
      .values({
        userId: req.user!.id,
        surahNumber,
        ayahNumber,
        note,
      })
      .returning();
    res.status(201).json(fav);
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Already in favorites" });
    }
    next(err);
  }
});

router.delete("/favorites/:id", authMiddleware, async (req, res, next) => {
  try {
    await db.delete(quranFavorites).where(eq(quranFavorites.id, req.params.id as string));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
