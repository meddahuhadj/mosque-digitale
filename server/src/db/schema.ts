import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  time,
  boolean,
  integer,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", [
  "super_admin",
  "mosque_admin",
  "imam",
  "operator",
  "moderator",
  "worshipper",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "idle",
  "live",
  "paused",
  "stopped",
]);

export const announcementCategoryEnum = pgEnum("announcement_category", [
  "general",
  "prayer_change",
  "course",
  "event",
  "urgent",
  "ramadan",
]);

export const announcementPriorityEnum = pgEnum("announcement_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

export const eventCategoryEnum = pgEnum("event_category", [
  "prayer",
  "quran",
  "course",
  "ramadan",
  "conference",
  "family",
  "children",
  "community",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "announcement",
  "event",
  "prayer",
  "khutbah",
  "reminder",
  "system",
]);

export const analyticsEventTypeEnum = pgEnum("analytics_event_type", [
  "session_start",
  "session_end",
  "user_connect",
  "user_disconnect",
  "language_switch",
  "verse_view",
  "announcement_view",
  "notification_open",
  "quran_search",
  "quran_read",
]);

// ── Mosques ────────────────────────────────────────────────────────────

export const mosques = pgTable("mosques", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  lat: varchar("lat", { length: 20 }),
  lng: varchar("lng", { length: 20 }),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  calculationMethod: varchar("calculation_method", { length: 50 }).default("MuslimWorldLeague"),
  juristicMethod: varchar("juristic_method", { length: 50 }).default("Standard"),
  adhanLanguages: jsonb("adhan_languages").$type<string[]>().default(["ar"]),
  defaultTargetLangs: jsonb("default_target_langs").$type<string[]>().default([]),
  glossary: text("glossary").default(""),
  logoUrl: text("logo_url"),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 255 }),
  website: text("website"),
  settings: jsonb("settings").$type<MosqueSettings>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_mosques_slug").on(t.slug),
  index("idx_mosques_city").on(t.city),
]);

export interface MosqueSettings {
  displayMode?: "standard" | "kiosk";
  announcementRotationSeconds?: number;
  allowAnonymousListeners?: boolean;
  enableTasbih?: boolean;
  enableVersePopup?: boolean;
  customCss?: string;
  [key: string]: unknown;
}

// ── Users ──────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  avatarUrl: text("avatar_url"),
  language: varchar("language", { length: 10 }).default("fr"),
  accessibilitySettings: jsonb("accessibility_settings").$type<AccessibilitySettings>().default({}),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_users_email").on(t.email),
]);

export interface AccessibilitySettings {
  seniorMode?: boolean;
  highContrast?: boolean;
  fontSize?: "normal" | "large" | "xlarge";
  screenReader?: boolean;
  [key: string]: unknown;
}

// ── Mosque Members (RBAC) ──────────────────────────────────────────────

export const mosqueMembers = pgTable("mosque_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  mosqueId: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull().default("worshipper"),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("idx_mosque_members_unique").on(t.mosqueId, t.userId),
  index("idx_mosque_members_mosque").on(t.mosqueId),
  index("idx_mosque_members_user").on(t.userId),
]);

// ── Sessions (Khutbah) ─────────────────────────────────────────────────

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  mosqueId: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 10 }).notNull().unique(),
  token: varchar("token", { length: 64 }).notNull(),
  status: sessionStatusEnum("status").default("idle").notNull(),
  topic: text("topic"),
  imamName: varchar("imam_name", { length: 255 }),
  languages: jsonb("languages").$type<string[]>().default(["fr", "en"]),
  listenerCount: integer("listener_count").default(0),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  settings: jsonb("settings").$type<SessionSettings>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_sessions_mosque").on(t.mosqueId),
  index("idx_sessions_code").on(t.code),
  index("idx_sessions_status").on(t.status),
]);

export interface SessionSettings {
  glossary?: string;
  allowCorrections?: boolean;
  showConfidence?: boolean;
  [key: string]: unknown;
}

// ── Session Segments ───────────────────────────────────────────────────

export const sessionSegments = pgTable("session_segments", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  seq: integer("seq").notNull(),
  arabicText: text("arabic_text").notNull(),
  translations: jsonb("translations").$type<Record<string, string>>().default({}),
  isQuran: boolean("is_quran").default(false),
  quranRef: varchar("quran_ref", { length: 20 }),
  quranRefGuessed: boolean("quran_ref_guessed").default(false),
  isHadith: boolean("is_hadith").default(false),
  confidenceScore: varchar("confidence_score", { length: 10 }).default("high"),
  isFinal: boolean("is_final").default(true),
  isCorrected: boolean("is_corrected").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_segments_session").on(t.sessionId),
  uniqueIndex("idx_segments_session_seq").on(t.sessionId, t.seq),
]);

// ── Prayer Times ───────────────────────────────────────────────────────

export const prayerTimes = pgTable("prayer_times", {
  id: uuid("id").primaryKey().defaultRandom(),
  mosqueId: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  fajr: time("fajr").notNull(),
  sunrise: time("sunrise"),
  dhuhr: time("dhuhr").notNull(),
  asr: time("asr").notNull(),
  maghrib: time("maghrib").notNull(),
  isha: time("isha").notNull(),
  jummahTime: time("jummah_time"),
  fajrAdhan: time("fajr_adhan"),
  fajrIqama: time("fajr_iqama"),
  dhuhrAdhan: time("dhuhr_adhan"),
  dhuhrIqama: time("dhuhr_iqama"),
  asrAdhan: time("asr_adhan"),
  asrIqama: time("asr_iqama"),
  maghribAdhan: time("maghrib_adhan"),
  maghribIqama: time("maghrib_iqama"),
  ishaAdhan: time("isha_adhan"),
  ishaIqama: time("isha_iqama"),
  jummahAdhan: time("jummah_adhan"),
  jummahIqama: time("jummah_iqama"),
  special: jsonb("special").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("idx_prayer_times_mosque_date").on(t.mosqueId, t.date),
  index("idx_prayer_times_date").on(t.date),
]);

// ── Announcements ──────────────────────────────────────────────────────

export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  mosqueId: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  category: announcementCategoryEnum("category").default("general"),
  priority: announcementPriorityEnum("priority").default("normal"),
  authorId: uuid("author_id").references(() => users.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  imageUrl: text("image_url"),
  pinned: boolean("pinned").default(false),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_announcements_mosque").on(t.mosqueId),
  index("idx_announcements_published").on(t.publishedAt),
]);

// ── Events / Calendar ──────────────────────────────────────────────────

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  mosqueId: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: eventCategoryEnum("category").default("prayer"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }),
  location: varchar("location", { length: 255 }),
  speaker: varchar("speaker", { length: 255 }),
  imageUrl: text("image_url"),
  reminderMinutes: integer("reminder_minutes").default(30),
  recurrence: jsonb("recurrence").$type<EventRecurrence>(),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  isCancelled: boolean("is_cancelled").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_events_mosque").on(t.mosqueId),
  index("idx_events_start").on(t.startTime),
  index("idx_events_category").on(t.category),
]);

export interface EventRecurrence {
  type?: "none" | "daily" | "weekly" | "monthly" | "yearly";
  days?: string[];
  until?: string;
  count?: number;
}

// ── Quran Surahs ───────────────────────────────────────────────────────

export const quranSurahs = pgTable("quran_surahs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  number: integer("number").notNull().unique(),
  nameArabic: varchar("name_arabic", { length: 50 }).notNull(),
  nameEnglish: varchar("name_english", { length: 100 }).notNull(),
  nameTransliteration: varchar("name_transliteration", { length: 100 }).notNull(),
  totalAyahs: integer("total_ayahs").notNull(),
  revelationType: varchar("revelation_type", { length: 20 }).notNull(),
});

// ── Quran Ayahs ────────────────────────────────────────────────────────

export const quranAyahs = pgTable("quran_ayahs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  surahNumber: integer("surah_number").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  textArabic: text("text_arabic").notNull(),
  textTransliteration: text("text_transliteration"),
  page: integer("page"),
  juz: integer("juz"),
  hizb: integer("hizb"),
  version: varchar("version", { length: 10 }).default("uthmani"),
}, (t) => [
  uniqueIndex("idx_ayahs_surah_ayah").on(t.surahNumber, t.ayahNumber),
  index("idx_ayahs_page").on(t.page),
  index("idx_ayahs_juz").on(t.juz),
]);

// ── Quran Translations ─────────────────────────────────────────────────

export const quranTranslations = pgTable("quran_translations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ayahId: integer("ayah_id").notNull().references(() => quranAyahs.id, { onDelete: "cascade" }),
  language: varchar("language", { length: 10 }).notNull(),
  text: text("text").notNull(),
}, (t) => [
  uniqueIndex("idx_translations_ayah_lang").on(t.ayahId, t.language),
  index("idx_translations_lang").on(t.language),
]);

// ── Quran Favorites ────────────────────────────────────────────────────

export const quranFavorites = pgTable("quran_favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  surahNumber: integer("surah_number").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("idx_favorites_user_ayah").on(t.userId, t.surahNumber, t.ayahNumber),
]);

// ── Notifications ──────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  mosqueId: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  type: notificationTypeEnum("type").default("system"),
  data: jsonb("data").$type<Record<string, unknown>>(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_notifications_mosque").on(t.mosqueId),
  index("idx_notifications_user").on(t.userId),
  index("idx_notifications_read").on(t.isRead),
]);

// ── Refresh Tokens ─────────────────────────────────────────────────────

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_refresh_tokens_user").on(t.userId),
  index("idx_refresh_tokens_token").on(t.token),
]);

// ── Analytics Events ───────────────────────────────────────────────────

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  mosqueId: uuid("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  eventType: analyticsEventTypeEnum("event_type").notNull(),
  sessionId: uuid("session_id"),
  data: jsonb("data").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_analytics_mosque").on(t.mosqueId),
  index("idx_analytics_type").on(t.eventType),
  index("idx_analytics_created").on(t.createdAt),
]);
