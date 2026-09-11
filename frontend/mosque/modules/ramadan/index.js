// ── Ramadan Module ─────────────────────────────────────────────────────
// Calendrier hégirien réel + horaires Fajr/Maghrib via l'API.

import { api } from "../../core/api.js";
import { t, getCurrentLang, getLocaleTag } from "../../core/i18n.js";
import { renderMain, ornamentHtml } from "../../core/components.js";

export async function renderRamadan(params) {
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat(getLocaleTag(), { day: "numeric", month: "long", year: "numeric" }).format(now);
  let hijriLine = "";
  let ramadanDay = null;
  const hijri = await api("/api/hijri", { auth: false }).catch(() => null);
  if (hijri?.hijri) {
    const isAr = getCurrentLang() === "ar";
    const monthName = isAr ? hijri.hijri.monthNameAr : hijri.hijri.monthNameFr;
    hijriLine = isAr ? `${hijri.hijri.day} ${monthName} ${hijri.hijri.year} هـ` : `${hijri.hijri.day} ${monthName} ${hijri.hijri.year} AH`;
    if (hijri.hijri.month === 9) { hijriLine += ` · ${t("ramadan", "Ramadan")}`; ramadanDay = hijri.hijri.day; }
  }

  let prayerData = null;
  try {
    const mosques = await api("/api/mosques", { auth: false });
    const mosqueId = mosques?.[0]?.id;
    if (mosqueId) {
      const date = new Date().toISOString().split("T")[0];
      prayerData = await api(`/api/prayer-times/${mosqueId}?date=${date}`, { auth: false });
    }
  } catch { prayerData = null; }

  const fajr = prayerData?.fajr?.time || "--:--";
  const maghrib = prayerData?.maghrib?.time || "--:--";

  renderMain(`
    <div class="hero-mosque" style="padding-top:24px;">
      <div style="font-size:3em;">🌙</div>
      ${ramadanDay ? `<div class="badge-live live" style="display:inline-block; margin:8px 0 2px;">${t("ramadan_day", "Jour")} ${ramadanDay}</div>` : ""}
      <h2 style="margin:8px 0 4px;">${t("ramadan", "Ramadan")}</h2>
      <p style="color:var(--muted);">${dateStr}</p>
      ${hijriLine ? `<p style="color:var(--accent2); font-weight:600;">${hijriLine}</p>` : ""}
    </div>

    ${ornamentHtml("✦ ✦ ✦")}

    <div class="card-grid">
      <div class="card card-accent">
        <h3 class="card-header">🌅 ${t("fajr", "Fajr")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">${fajr}</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("dawn_prayer", "Prière de l'aube")}</div>
      </div>

      <div class="card card-accent">
        <h3 class="card-header">🌇 ${t("maghrib", "Maghrib")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">${maghrib}</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("iftar", "Iftar")}</div>
      </div>

      <div class="card">
        <h3 class="card-header">🌙 ${t("tarawih", "Tarawih")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">21:30</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("night_prayer", "Prière de la nuit")} · <em>${t("indicative", "indicatif")}</em></div>
      </div>

      <div class="card">
        <h3 class="card-header">📖 ${t("juz_of_day", "Juz du jour")}</h3>
        <div style="font-size:1.1em; text-align:center; color:var(--accent);">${t("juz_info", "Consultez le programme de la mosquée")}</div>
      </div>
    </div>
  `);
}