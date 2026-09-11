// ── Display / Kiosk Module ─────────────────────────────────────────────
// Afficheur plein écran : horaires réels, calendrier hégirien,
// prochain événement et adhan. Utilisable sur un écran d'entrée de mosquée.

import { api } from "../../core/api.js";
import { t } from "../../core/i18n.js";
import { renderMain } from "../../core/components.js";

export async function renderDisplay(params) {
  const mosqueId = params?.mosqueId;

  renderMain(`
    <div style="min-height:80vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:20px;">
      <div style="font-size:4em; margin-bottom:12px;">🕌</div>
      <h1 style="font-size:2em; margin-bottom:24px;">Mosqué Digital</h1>

      <div style="font-size:1.3em; color:var(--accent2); margin-bottom:24px;" id="display-hijri">…</div>

      <div id="display-prayer" style="margin-bottom:30px;">
        <div style="font-size:1.2em; color:var(--muted);" id="display-prayer-name">${t("loading", "...")}</div>
        <div style="font-size:4em; font-weight:700; color:var(--accent);" id="display-prayer-time">--:--</div>
        <div style="font-size:1.2em; color:var(--muted);" id="display-countdown"></div>
      </div>

      <div style="width:100%; max-width:600px; border-top:1px solid var(--line); padding-top:20px;">
        <div style="color:var(--muted);" id="display-next-activity">${t("loading", "...")}</div>
      </div>

      <div style="position:fixed; bottom:16px; right:16px; color:var(--muted); font-size:0.8em;" id="display-clock"></div>
    </div>
  `);

  let actualMosqueId = mosqueId || null;
  if (!actualMosqueId) {
    try {
      const mosques = await api("/api/mosques", { auth: false });
      actualMosqueId = mosques?.[0]?.id || null;
    } catch { actualMosqueId = null; }
  }

  // Hijri date
  api(`/api/hijri`, { auth: false })
    .then(h => {
      const el = document.getElementById("display-hijri");
      if (el && h?.hijri) el.textContent = `${h.hijri.day} ${h.hijri.monthNameFr} ${h.hijri.year} AH`;
    })
    .catch(() => {});

  // Fetch real prayer times
  let prayerData = null;
  if (actualMosqueId) {
    try {
      const date = new Date().toISOString().split("T")[0];
      prayerData = await api(`/api/prayer-times/${actualMosqueId}?date=${date}`, { auth: false });
    } catch { prayerData = null; }
  }

  const prayers = prayerData
    ? [
        { name: t("fajr", "Fajr"), time: prayerData.fajr?.time || "--:--" },
        { name: t("sunrise", "Sunrise"), time: prayerData.sunrise?.time || "--:--" },
        { name: t("dhuhr", "Dhuhr"), time: prayerData.dhuhr?.time || "--:--" },
        { name: t("asr", "Asr"), time: prayerData.asr?.time || "--:--" },
        { name: t("maghrib", "Maghrib"), time: prayerData.maghrib?.time || "--:--" },
        { name: t("isha", "Isha"), time: prayerData.isha?.time || "--:--" },
      ]
    : [
        { name: "Fajr", time: "05:30" },
        { name: "Dhuhr", time: "13:00" },
        { name: "Asr", time: "16:30" },
        { name: "Maghrib", time: "19:45" },
        { name: "Isha", time: "21:15" },
      ];

  // Next upcoming event
  if (actualMosqueId) {
    api(`/api/events/upcoming/${actualMosqueId}?limit=1`, { auth: false })
      .then(evs => {
        const el = document.getElementById("display-next-activity");
        if (!el) return;
        const ev = evs?.[0];
        if (!ev) {
          el.textContent = "";
          return;
        }
        let when = "";
        if (ev.date) {
          when = new Date(ev.date + (ev.time ? "T" + ev.time : "")).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
          if (ev.time) when += " à " + ev.time;
        }
        el.innerHTML = `<div style="font-size:0.9em; color:var(--muted);">${t("next_activity", "Prochain temps fort")}</div>
                        <div style="font-size:1.6em; font-weight:700; margin-top:4px;">${ev.title}</div>
                        ${when ? `<div style="color:var(--accent); margin-top:4px;">${when}</div>` : ""}`;
      })
      .catch(() => {});
  }

  // Kiosk clock
  function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById("display-clock");
    if (clockEl) clockEl.textContent = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  updateClock();
  setInterval(updateClock, 10000);

  function updateDisplay() {
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    let next = prayers[0];
    for (const p of prayers) {
      const [h, m] = p.time.split(":").map(Number);
      if (!isNaN(h) && h * 60 + m > currentMin) { next = p; break; }
    }
    const [nh, nm] = next.time.split(":").map(Number);
    const diff = Math.max(0, (isNaN(nh) ? 0 : nh * 60 + (isNaN(nm) ? 0 : nm)) - currentMin);
    const h = Math.floor(diff / 60);
    const m = diff % 60;

    document.getElementById("display-prayer-name").textContent = next.name;
    document.getElementById("display-prayer-time").textContent = next.time;
    document.getElementById("display-countdown").textContent =
      next.time !== "--:--"
        ? `IQAMA DANS ${h > 0 ? h + "H" : ""}${m.toString().padStart(2, "0")}`
        : "";
  }
  updateDisplay();
  setInterval(updateDisplay, 30000);
}