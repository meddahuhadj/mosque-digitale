// ── Display / Kiosk Module ─────────────────────────────────────────────

import { t } from "../../core/i18n.js";
import { renderMain } from "../../core/components.js";

export async function renderDisplay(params) {
  const mosqueId = params?.mosqueId;

  renderMain(`
    <div style="min-height:80vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:20px;">
      <div style="font-size:4em; margin-bottom:12px;">🕌</div>
      <h1 style="font-size:2em; margin-bottom:24px;">Mosqué Digital</h1>

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

  // Kiosk clock
  function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById("display-clock");
    if (clockEl) clockEl.textContent = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  updateClock();
  setInterval(updateClock, 10000);

  // Basic prayer display
  const prayers = [
    { name: "Fajr", time: "05:30" },
    { name: "Dhuhr", time: "13:00" },
    { name: "Asr", time: "16:30" },
    { name: "Maghrib", time: "19:45" },
    { name: "Isha", time: "21:15" },
  ];

  function updateDisplay() {
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    let next = prayers[0];
    for (const p of prayers) {
      const [h, m] = p.time.split(":").map(Number);
      if (h * 60 + m > currentMin) { next = p; break; }
    }
    const [nh, nm] = next.time.split(":").map(Number);
    const diff = Math.max(0, (nh * 60 + nm) - currentMin);
    const h = Math.floor(diff / 60);
    const m = diff % 60;

    document.getElementById("display-prayer-name").textContent = next.name;
    document.getElementById("display-prayer-time").textContent = next.time;
    document.getElementById("display-countdown").textContent =
      diff > 0 ? `IQAMA DANS ${h > 0 ? h + "H" : ""}${m.toString().padStart(2, "0")}` : "MAINTENANT";
  }
  updateDisplay();
  setInterval(updateDisplay, 30000);
}
