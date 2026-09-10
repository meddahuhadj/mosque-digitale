// ── Home Page ──────────────────────────────────────────────────────────

import { api, isAuthenticated } from "../../core/api.js";
import { t } from "../../core/i18n.js";
import { toast, renderMain } from "../../core/components.js";
import { navigate } from "../../core/router.js";

let _countdownInterval = null;

export async function renderHome() {
  if (_countdownInterval) { clearInterval(_countdownInterval); _countdownInterval = null; }

  const userName = localStorage.getItem("userName") || "";

  renderMain(`
    <div style="text-align:center; padding:20px 0 10px;">
      <div style="font-size:2.5em;">🕌</div>
      <h1 style="font-size:1.5em; margin:8px 0;">${t("app_name", "Mosque Digital OS")}</h1>
      ${userName ? `<p style="color:var(--muted);">Assalamu alaykum, <strong>${userName}</strong></p>` : ""}
    </div>

    <div id="prayer-countdown" class="countdown card" style="margin-bottom:24px;">
      <div class="spinner"></div>
    </div>

    <div class="card-grid">
      <a href="#/khutbah" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">🎙️</span>
        <div>
          <div style="font-weight:600;">${t("khutbah_live", "Khutbah Live")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${t("join_or_start", "Rejoindre ou démarrer")}</div>
        </div>
      </a>

      <a href="#/quran" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">📖</span>
        <div>
          <div style="font-weight:600;">${t("quran", "Coran")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${t("read_listen", "Lire et écouter")}</div>
        </div>
      </a>

      <a href="#/prayer" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">🕌</span>
        <div>
          <div style="font-weight:600;">${t("prayers", "Horaires de prière")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${t("adhan_iqama", "Adhan & Iqama")}</div>
        </div>
      </a>

      <a href="#/announcements" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">📢</span>
        <div>
          <div style="font-weight:600;">${t("announcements", "Annonces")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${t("latest_news", "Dernières nouvelles")}</div>
        </div>
      </a>

      <a href="#/events" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">📅</span>
        <div>
          <div style="font-weight:600;">${t("events", "Événements")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${t("upcoming", "À venir")}</div>
        </div>
      </a>

      <a href="#/ramadan" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">🌙</span>
        <div>
          <div style="font-weight:600;">${t("ramadan", "Ramadan")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${t("program", "Programme")}</div>
        </div>
      </a>
    </div>

    ${!isAuthenticated() ? `
      <div style="text-align:center; margin-top:24px;">
        <a href="#/auth/login" class="btn btn-primary">${t("login", "Connexion")}</a>
        <a href="#/admin" class="btn btn-secondary" style="margin-left:8px;">${t("admin", "Administration")}</a>
      </div>
    ` : `
      <div style="text-align:center; margin-top:24px;">
        <a href="#/admin" class="btn btn-secondary">${t("admin", "Administration")}</a>
        <a href="#/imam" class="btn btn-secondary" style="margin-left:8px;">${t("imam_mode", "Mode Imam")}</a>
      </div>
    `}
  `);

  startPrayerCountdown();
}

function startPrayerCountdown() {
  updateCountdown();
  _countdownInterval = setInterval(updateCountdown, 60000);
}

function updateCountdown() {
  const el = document.getElementById("prayer-countdown");
  if (!el) { clearInterval(_countdownInterval); return; }

  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

  // Default prayer times (will be replaced by API data)
  const prayers = [
    { name: "Fajr", time: "05:30" },
    { name: "Sunrise", time: "07:15" },
    { name: "Dhuhr", time: "13:00" },
    { name: "Asr", time: "16:30" },
    { name: "Maghrib", time: "19:45" },
    { name: "Isha", time: "21:15" },
  ];

  // Find next prayer
  let nextPrayer = null;
  for (const p of prayers) {
    const [ph, pm] = p.time.split(":").map(Number);
    if (ph > h || (ph === h && pm > m)) {
      nextPrayer = p;
      break;
    }
  }
  if (!nextPrayer) nextPrayer = prayers[0]; // Tomorrow's Fajr

  const [nh, nm] = nextPrayer.time.split(":").map(Number);
  let diffMin = (nh * 60 + nm) - (h * 60 + m);
  if (diffMin < 0) diffMin += 24 * 60;

  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  const countdown = hours > 0 ? `${hours}h${mins.toString().padStart(2, "0")}` : `${mins}min`;

  el.innerHTML = `
    <div class="label">${t("next_prayer", "Prochaine prière")}</div>
    <div class="next-prayer">${nextPrayer.name}</div>
    <div class="timer">${countdown}</div>
    <div class="label">${t("at", "à")} ${nextPrayer.time} · ${timeStr}</div>
  `;
}
