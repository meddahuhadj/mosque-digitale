import { db } from "../db/index.js";
import { analyticsEvents } from "../db/schema.js";
import { eq, and, sql, gte } from "drizzle-orm";
import { childLogger } from "../logger.js";

const log = childLogger("analytics");

export async function trackEvent(params: {
  mosqueId: string;
  eventType: string;
  sessionId?: string;
  data?: Record<string, unknown>;
}) {
  try {
    await db.insert(analyticsEvents).values({
      mosqueId: params.mosqueId,
      eventType: params.eventType as any,
      sessionId: params.sessionId || null,
      data: params.data || {},
    });
  } catch (err: any) {
    log.warn(`Failed to track analytics: ${err.message}`);
  }
}

export async function getDashboardStats(mosqueId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const events = await db
    .select({
      eventType: analyticsEvents.eventType,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.mosqueId, mosqueId),
        gte(analyticsEvents.createdAt, since)
      )
    )
    .groupBy(analyticsEvents.eventType);

  const stats: Record<string, number> = {};
  for (const e of events) {
    stats[e.eventType] = e.count;
  }

  const totalSessions = stats["session_start"] || 0;
  const totalConnections = stats["user_connect"] || 0;
  const totalVerseViews = stats["verse_view"] || 0;
  const totalQuranSearches = stats["quran_search"] || 0;

  return {
    period: `${days} days`,
    totalSessions,
    totalConnections,
    totalVerseViews,
    totalQuranSearches,
    breakdown: stats,
  };
}
