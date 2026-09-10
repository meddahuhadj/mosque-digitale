import { z } from "zod";

// ── Auth ───────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(255),
  phone: z.string().max(30).optional(),
  language: z.string().max(10).default("fr"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required"),
});

// ── Mosque ─────────────────────────────────────────────────────────────

export const createMosqueSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  lat: z.string().max(20).optional(),
  lng: z.string().max(20).optional(),
  timezone: z.string().max(50).default("UTC"),
  calculationMethod: z.string().max(50).default("MuslimWorldLeague"),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

export const updateMosqueSchema = createMosqueSchema.partial();

// ── Prayer Times ───────────────────────────────────────────────────────

export const prayerTimesSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  fajr: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
  sunrise: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  dhuhr: z.string().regex(/^\d{2}:\d{2}$/),
  asr: z.string().regex(/^\d{2}:\d{2}$/),
  maghrib: z.string().regex(/^\d{2}:\d{2}$/),
  isha: z.string().regex(/^\d{2}:\d{2}$/),
  jummahTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  fajrAdhan: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  fajrIqama: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  dhuhrAdhan: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  dhuhrIqama: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  asrAdhan: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  asrIqama: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  maghribAdhan: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  maghribIqama: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  ishaAdhan: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  ishaIqama: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  jummahAdhan: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  jummahIqama: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

// ── Announcements ──────────────────────────────────────────────────────

export const announcementSchema = z.object({
  title: z.string().min(1, "Title required").max(255),
  body: z.string().min(1, "Body required"),
  category: z.enum(["general", "prayer_change", "course", "event", "urgent", "ramadan"]).default("general"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  publishedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
  pinned: z.boolean().default(false),
});

// ── Events ─────────────────────────────────────────────────────────────

export const eventSchema = z.object({
  title: z.string().min(1, "Title required").max(255),
  description: z.string().optional(),
  category: z.enum(["prayer", "quran", "course", "ramadan", "conference", "family", "children", "community"]).default("prayer"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  location: z.string().max(255).optional(),
  speaker: z.string().max(255).optional(),
  imageUrl: z.string().url().optional(),
  reminderMinutes: z.number().int().min(0).default(30),
  maxAttendees: z.number().int().min(1).optional(),
});

// ── Session ────────────────────────────────────────────────────────────

export const createSessionSchema = z.object({
  mosqueId: z.string().uuid(),
  topic: z.string().max(500).optional(),
  imamName: z.string().max(255).optional(),
  languages: z.array(z.string()).min(1).default(["fr", "en"]),
});

// ── User Management ────────────────────────────────────────────────────

export const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["mosque_admin", "imam", "operator", "moderator", "worshipper"]).default("worshipper"),
});

export const updateMemberSchema = z.object({
  role: z.enum(["mosque_admin", "imam", "operator", "moderator", "worshipper"]),
});

// ── Quran ──────────────────────────────────────────────────────────────

export const quranSearchSchema = z.object({
  q: z.string().min(1).max(200),
  language: z.string().max(10).default("ar"),
  surah: z.number().int().min(1).max(114).optional(),
  juz: z.number().int().min(1).max(30).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ── Pagination ─────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
