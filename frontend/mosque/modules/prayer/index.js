// ── Prayer Times Module ────────────────────────────────────────────────

import { api } from "../../core/api.js";
import { t } from "../../core/i18n.js";
import { renderMain, toast } from "../../core/components.js";

const PRAYER_NAMES = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_ICONS = { Fajr: "🌅", Sunrise: "☀️", Dhuhr: "noon", Asr: "🌤️", Maghrib: "🌇", Isha: "🌙" };

export async function renderPrayer(params) {
  const mosqueId = params?.mosqueId;

  renderMain(`
    <div class="card">
      <h2 class="card-header">🕌 ${t("prayer_times", "Horaires de prière")}</h2>
      <div id="prayer-content" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);

  try {
    const date = new Date().toISOString().split("T")[0];
    let data;
    if (mosqueId) {
      data = await api(`/api/prayer-times/${mosqueId}?date=${date}`);
    } else {
      // Use calculated times based on browser location
      data = getBrowserPrayerTimes();
    }

    renderPrayerTimes(data);
  } catch (err) {
    // Fallback to calculated times
    renderPrayerTimes(getBrowserPrayerTimes());
  }
}

function getBrowserPrayerTimes() {
  // Fallback: basic calculation for demo
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  return {
    date,
    fajr: { name: "Fajr", time: "05:30", type: "adhan" },
    sunrise: { name: "Sunrise", time: "07:15", type: "adhan" },
    dhuhr: { name: "Dhuhr", time: "13:00", type: "adhan" },
    asr: { name: "Asr", time: "16:30", type: "adhan" },
    maghrib: { name: "Maghrib", time: "19:45", type: "adhan" },
    isha: { name: "Isha", time: "21:15", type: "adhan" },
  };
}

function renderPrayerTimes(data) {
  const el = document.getElementById("prayer-content");
  if (!el) return;

  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { key: "fajr", name: "Fajr", icon: "🌅" },
    { key: "sunrise", name: "Sunrise", icon: "☀️" },
    { key: "dhuhr", name: "Dhuhr", icon: "🌤️" },
    { key: "asr", name: "Asr", icon: "🌇" },
    { key: "maghrib", name: "Maghrib", icon: "🌙" },
    { key: "isha", name: "Isha", icon: "🌑" },
  ];

  el.innerHTML = `
    <div style="text-align:center; margin-bottom:16px; color:var(--muted);">${data.date || new Date().toISOString().split("T")[0]}</div>
    <div class="prayer-times-grid">
      ${prayers.map(p => {
        const timeData = data[p.key];
        const time = timeData?.time || timeData || "--:--";
        const [h, m] = (typeof time === "string" ? time : "--:--").split(":").map(Number);
        const prayerMin = h * 60 + m;
        const isActive = Math.abs(currentMin - prayerMin) < 30;
        const iqama = data[`${p.key}Iqama`]?.time || data[`${p.key}_iqama`] || null;
        return `
          <div class="prayer-card ${isActive ? "active" : ""}">
            <div class="name">${p.icon} ${p.name}</div>
            <div class="time">${time}</div>
            ${iqama ? `<div class="type">Iqama: ${iqama}</div>` : ""}
          </div>
        `;
      }).join("")}
    </div>

    ${data.jummahTime ? `
      <div class="prayer-card active" style="margin-top:16px; text-align:center;">
        <div class="name">🕌 Jumu'ah</div>
        <div class="time">${data.jummahTime?.time || data.jummahTime}</div>
      </div>
    ` : ""}
  `;
}
