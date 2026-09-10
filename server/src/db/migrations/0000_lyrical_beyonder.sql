CREATE TYPE "public"."analytics_event_type" AS ENUM('session_start', 'session_end', 'user_connect', 'user_disconnect', 'language_switch', 'verse_view', 'announcement_view', 'notification_open', 'quran_search', 'quran_read');--> statement-breakpoint
CREATE TYPE "public"."announcement_category" AS ENUM('general', 'prayer_change', 'course', 'event', 'urgent', 'ramadan');--> statement-breakpoint
CREATE TYPE "public"."announcement_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."event_category" AS ENUM('prayer', 'quran', 'course', 'ramadan', 'conference', 'family', 'children', 'community');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('announcement', 'event', 'prayer', 'khutbah', 'reminder', 'system');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('super_admin', 'mosque_admin', 'imam', 'operator', 'moderator', 'worshipper');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('idle', 'live', 'paused', 'stopped');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"event_type" "analytics_event_type" NOT NULL,
	"session_id" uuid,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"category" "announcement_category" DEFAULT 'general',
	"priority" "announcement_priority" DEFAULT 'normal',
	"author_id" uuid,
	"published_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"image_url" text,
	"pinned" boolean DEFAULT false,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" "event_category" DEFAULT 'prayer',
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"location" varchar(255),
	"speaker" varchar(255),
	"image_url" text,
	"reminder_minutes" integer DEFAULT 30,
	"recurrence" jsonb,
	"max_attendees" integer,
	"current_attendees" integer DEFAULT 0,
	"is_cancelled" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mosque_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "role" DEFAULT 'worshipper' NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mosques" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"lat" varchar(20),
	"lng" varchar(20),
	"timezone" varchar(50) DEFAULT 'UTC',
	"calculation_method" varchar(50) DEFAULT 'MuslimWorldLeague',
	"juristic_method" varchar(50) DEFAULT 'Standard',
	"adhan_languages" jsonb DEFAULT '["ar"]'::jsonb,
	"default_target_langs" jsonb DEFAULT '[]'::jsonb,
	"glossary" text DEFAULT '',
	"logo_url" text,
	"phone" varchar(30),
	"email" varchar(255),
	"website" text,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mosques_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"user_id" uuid,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"type" "notification_type" DEFAULT 'system',
	"data" jsonb,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prayer_times" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"date" date NOT NULL,
	"fajr" time NOT NULL,
	"sunrise" time,
	"dhuhr" time NOT NULL,
	"asr" time NOT NULL,
	"maghrib" time NOT NULL,
	"isha" time NOT NULL,
	"jummah_time" time,
	"fajr_adhan" time,
	"fajr_iqama" time,
	"dhuhr_adhan" time,
	"dhuhr_iqama" time,
	"asr_adhan" time,
	"asr_iqama" time,
	"maghrib_adhan" time,
	"maghrib_iqama" time,
	"isha_adhan" time,
	"isha_iqama" time,
	"jummah_adhan" time,
	"jummah_iqama" time,
	"special" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quran_ayahs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quran_ayahs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"surah_number" integer NOT NULL,
	"ayah_number" integer NOT NULL,
	"text_arabic" text NOT NULL,
	"text_transliteration" text,
	"page" integer,
	"juz" integer,
	"hizb" integer,
	"version" varchar(10) DEFAULT 'uthmani'
);
--> statement-breakpoint
CREATE TABLE "quran_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"surah_number" integer NOT NULL,
	"ayah_number" integer NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quran_surahs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quran_surahs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"number" integer NOT NULL,
	"name_arabic" varchar(50) NOT NULL,
	"name_english" varchar(100) NOT NULL,
	"name_transliteration" varchar(100) NOT NULL,
	"total_ayahs" integer NOT NULL,
	"revelation_type" varchar(20) NOT NULL,
	CONSTRAINT "quran_surahs_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "quran_translations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quran_translations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ayah_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "session_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"seq" integer NOT NULL,
	"arabic_text" text NOT NULL,
	"translations" jsonb DEFAULT '{}'::jsonb,
	"is_quran" boolean DEFAULT false,
	"quran_ref" varchar(20),
	"quran_ref_guessed" boolean DEFAULT false,
	"is_hadith" boolean DEFAULT false,
	"confidence_score" varchar(10) DEFAULT 'high',
	"is_final" boolean DEFAULT true,
	"is_corrected" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mosque_id" uuid NOT NULL,
	"code" varchar(10) NOT NULL,
	"token" varchar(64) NOT NULL,
	"status" "session_status" DEFAULT 'idle' NOT NULL,
	"topic" text,
	"imam_name" varchar(255),
	"languages" jsonb DEFAULT '["fr","en"]'::jsonb,
	"listener_count" integer DEFAULT 0,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(30),
	"avatar_url" text,
	"language" varchar(10) DEFAULT 'fr',
	"accessibility_settings" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mosque_members" ADD CONSTRAINT "mosque_members_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mosque_members" ADD CONSTRAINT "mosque_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_times" ADD CONSTRAINT "prayer_times_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quran_favorites" ADD CONSTRAINT "quran_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quran_translations" ADD CONSTRAINT "quran_translations_ayah_id_quran_ayahs_id_fk" FOREIGN KEY ("ayah_id") REFERENCES "public"."quran_ayahs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_segments" ADD CONSTRAINT "session_segments_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analytics_mosque" ON "analytics_events" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_type" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_analytics_created" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_announcements_mosque" ON "announcements" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "idx_announcements_published" ON "announcements" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_events_mosque" ON "events" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "idx_events_start" ON "events" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "idx_events_category" ON "events" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_mosque_members_unique" ON "mosque_members" USING btree ("mosque_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_mosque_members_mosque" ON "mosque_members" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "idx_mosque_members_user" ON "mosque_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_mosques_slug" ON "mosques" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_mosques_city" ON "mosques" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_notifications_mosque" ON "notifications" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_read" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_prayer_times_mosque_date" ON "prayer_times" USING btree ("mosque_id","date");--> statement-breakpoint
CREATE INDEX "idx_prayer_times_date" ON "prayer_times" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_ayahs_surah_ayah" ON "quran_ayahs" USING btree ("surah_number","ayah_number");--> statement-breakpoint
CREATE INDEX "idx_ayahs_page" ON "quran_ayahs" USING btree ("page");--> statement-breakpoint
CREATE INDEX "idx_ayahs_juz" ON "quran_ayahs" USING btree ("juz");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_favorites_user_ayah" ON "quran_favorites" USING btree ("user_id","surah_number","ayah_number");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_translations_ayah_lang" ON "quran_translations" USING btree ("ayah_id","language");--> statement-breakpoint
CREATE INDEX "idx_translations_lang" ON "quran_translations" USING btree ("language");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_user" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_token" ON "refresh_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_segments_session" ON "session_segments" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_segments_session_seq" ON "session_segments" USING btree ("session_id","seq");--> statement-breakpoint
CREATE INDEX "idx_sessions_mosque" ON "sessions" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_code" ON "sessions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_sessions_status" ON "sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");