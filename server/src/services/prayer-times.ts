import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes, Prayer } from "adhan";
import { db } from "../db/index.js";
import { prayerTimes as prayerTimesTable, mosques } from "../db/schema.js";
import { eq, and, gte, lte } from "drizzle-orm";
import { childLogger } from "../logger.js";

const log = childLogger("prayer-times");

// Map mosque calculation method names to adhan library
const METHOD_MAP: Record<string, () => any> = {
  MuslimWorldLeague: () => CalculationMethod.MuslimWorldLeague(),
  NorthAmerica: () => CalculationMethod.NorthAmerica(),
  Egyptian: () => CalculationMethod.Egyptian(),
  UmmAlQura: () => CalculationMethod.UmmAlQura(),
  Dubai: () => CalculationMethod.Dubai(),
  MoonsightingCommittee: () => CalculationMethod.MoonsightingCommittee(),
  Karachi: () => CalculationMethod.Karachi(),
  Tehran: () => CalculationMethod.Tehran(),
  Turkey: () => CalculationMethod.Turkey(),
  Kuwait: () => CalculationMethod.Kuwait(),
  Qatar: () => CalculationMethod.Qatar(),
  Singapore: () => CalculationMethod.Singapore(),
};

export interface PrayerTimeEntry {
  name: string;
  time: string;
  type: "adhan" | "iqama";
}

export interface DailyPrayerTimes {
  date: string;
  fajr: PrayerTimeEntry;
  sunrise: PrayerTimeEntry;
  dhuhr: PrayerTimeEntry;
  asr: PrayerTimeEntry;
  maghrib: PrayerTimeEntry;
  isha: PrayerTimeEntry;
  jummah?: PrayerTimeEntry;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function calculatePrayerTimes(
  lat: string,
  lng: string,
  date: Date,
  method: string = "MuslimWorldLeague"
): DailyPrayerTimes {
  const coords = new Coordinates(parseFloat(lat), parseFloat(lng));
  const calcMethod = (METHOD_MAP[method] || METHOD_MAP.MuslimWorldLeague)();
  const pt = new PrayerTimes(coords, date, calcMethod);

  return {
    date: date.toISOString().split("T")[0],
    fajr: { name: "Fajr", time: formatTime(pt.timeForPrayer(Prayer.Fajr) || pt.fajr), type: "adhan" },
    sunrise: { name: "Sunrise", time: formatTime(pt.sunrise), type: "adhan" },
    dhuhr: { name: "Dhuhr", time: formatTime(pt.timeForPrayer(Prayer.Dhuhr) || pt.dhuhr), type: "adhan" },
    asr: { name: "Asr", time: formatTime(pt.timeForPrayer(Prayer.Asr) || pt.asr), type: "adhan" },
    maghrib: { name: "Maghrib", time: formatTime(pt.timeForPrayer(Prayer.Maghrib) || pt.maghrib), type: "adhan" },
    isha: { name: "Isha", time: formatTime(pt.timeForPrayer(Prayer.Isha) || pt.isha), type: "adhan" },
  };
}

export function getNextPrayer(lat: string, lng: string, method?: string): { name: string; time: Date; minutesUntil: number } | null {
  const coords = new Coordinates(parseFloat(lat), parseFloat(lng));
  const calcMethod = (METHOD_MAP[method || "MuslimWorldLeague"] || METHOD_MAP.MuslimWorldLeague)();
  const pt = new PrayerTimes(coords, new Date(), calcMethod);

  const now = new Date();
  const prayers = [
    { name: "Fajr", time: pt.timeForPrayer(Prayer.Fajr) || pt.fajr },
    { name: "Sunrise", time: pt.sunrise },
    { name: "Dhuhr", time: pt.timeForPrayer(Prayer.Dhuhr) || pt.dhuhr },
    { name: "Asr", time: pt.timeForPrayer(Prayer.Asr) || pt.asr },
    { name: "Maghrib", time: pt.timeForPrayer(Prayer.Maghrib) || pt.maghrib },
    { name: "Isha", time: pt.timeForPrayer(Prayer.Isha) || pt.isha },
  ];

  for (const prayer of prayers) {
    if (prayer.time > now) {
      const minutesUntil = Math.round((prayer.time.getTime() - now.getTime()) / 60000);
      return { name: prayer.name, time: prayer.time, minutesUntil };
    }
  }
  return null;
}

export async function getOrCalculatePrayerTimes(mosqueId: string, date: string): Promise<any> {
  // Try to get from DB first
  const [stored] = await db
    .select()
    .from(prayerTimesTable)
    .where(and(eq(prayerTimesTable.mosqueId, mosqueId), eq(prayerTimesTable.date, date)))
    .limit(1);

  if (stored) return stored;

  // Calculate from mosque coordinates
  const [mosque] = await db.select().from(mosques).where(eq(mosques.id, mosqueId)).limit(1);
  if (!mosque || !mosque.lat || !mosque.lng) return null;

  const calculated = calculatePrayerTimes(
    mosque.lat, mosque.lng, new Date(date), mosque.calculationMethod || undefined
  );

  // Store for future use
  try {
    await db.insert(prayerTimesTable).values({
      mosqueId,
      date,
      fajr: calculated.fajr.time,
      sunrise: calculated.sunrise.time,
      dhuhr: calculated.dhuhr.time,
      asr: calculated.asr.time,
      maghrib: calculated.maghrib.time,
      isha: calculated.isha.time,
    }).onConflictDoNothing();
  } catch (err: any) {
    log.warn(`Failed to store prayer times: ${err.message}`);
  }

  return calculated;
}

export function formatCountdown(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}`;
  return `${m}min`;
}
