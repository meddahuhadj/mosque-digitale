// ── Home Page ──────────────────────────────────────────────────────────

import { api, isAuthenticated } from "../../core/api.js";
import { t, getCurrentLang } from "../../core/i18n.js";
import { toast, renderMain, ornamentHtml } from "../../core/components.js";
import { navigate } from "../../core/router.js";
import { isInstallable, canPromptInstall, promptInstall, isIos } from "../../core/pwa.js";

let _countdownInterval = null;
let _installListener = null;

// Petit florilège de dhikr / rappels — affiché sans dépendance réseau.
// ar = texte arabe ; fr/en = traduction ou sens, selon la langue active
// (repli sur le français si la langue de l'interface n'a pas de traduction dédiée).
const DHIKR = [
  { ar: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", fr: "Gloire et pureté à Allah, et louange à Lui.", en: "Glory and praise be to Allah." },
  { ar: "لَا إِلَٰهَ إِلَّا اللَّهُ", fr: "Il n'y a de divinité digne d'adoration qu'Allah.", en: "There is no deity worthy of worship but Allah." },
  { ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", fr: "Louange à Allah, Seigneur des mondes.", en: "Praise be to Allah, Lord of the worlds." },
  { ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", fr: "Ô Allah, prie sur Muhammad ﷺ.", en: "O Allah, send blessings upon Muhammad ﷺ." },
  { ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً", fr: "Seigneur, accorde-nous belle part ici-bas et belle part dans l'au-delà.", en: "Our Lord, grant us good in this world and good in the Hereafter." },
  { ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", fr: "Allah nous suffit, Il est le meilleur garant.", en: "Allah is sufficient for us, and He is the best disposer of affairs." },
  { ar: "أَسْتَغْفِرُ اللَّهَ", fr: "Je demande pardon à Allah.", en: "I seek forgiveness from Allah." },
  { ar: "وَقُل رَّبِّ زِدْنِي عِلْمًا", fr: "Et dis : « Seigneur, accrois mes connaissances. »", en: "And say: \"My Lord, increase me in knowledge.\"" },
];

function dhikrOfTheDay() {
  const dayIndex = Math.floor(Date.now() / 86400000);
  const entry = DHIKR[dayIndex % DHIKR.length];
  const lang = getCurrentLang();
  // En arabe, l'arabe EST déjà le texte principal — pas de doublon en traduction.
  const translation = lang === "ar" ? null : (entry[lang] || entry.en || entry.fr);
  return { ar: entry.ar, translation };
}

function greetingKey(hour) {
  if (hour < 5) return ["greeting_night", "Que cette nuit vous soit bénie"];
  if (hour < 12) return ["greeting_morning", "Que votre matinée soit bénie"];
  if (hour < 18) return ["greeting_afternoon", "Que votre journée soit bénie"];
  return ["greeting_evening", "Que votre soirée soit bénie"];
}

export async function renderHome() {
  if (_countdownInterval) { clearInterval(_countdownInterval); _countdownInterval = null; }
  _usingMyPosition = false; // repart sur les horaires de la mosquée à chaque (re)chargement de l'accueil

  const userName = localStorage.getItem("userName") || "";
  const [gKey, gFallback] = greetingKey(new Date().getHours());
  const dhikr = dhikrOfTheDay();

  const shortcuts = [
    { href: "#/khutbah", icon: "🎙️", titleKey: "khutbah_live", title: "Khutbah Live", subKey: "join_or_start", sub: "Rejoindre ou démarrer" },
    { href: "#/quran", icon: "📖", titleKey: "quran", title: "Coran", subKey: "read_listen", sub: "Lire et écouter" },
    { href: "#/hadith", icon: "📜", titleKey: "hadith", title: "Hadith", subKey: "sahih_bukhari", sub: "Sahih al-Bukhari" },
    { href: "#/prayer", icon: "🕌", titleKey: "prayers", title: "Horaires de prière", subKey: "adhan_iqama", sub: "Adhan & Iqama" },
    { href: "#/announcements", icon: "📢", titleKey: "announcements", title: "Annonces", subKey: "latest_news", sub: "Dernières nouvelles" },
    { href: "#/events", icon: "📅", titleKey: "events", title: "Événements", subKey: "upcoming", sub: "À venir" },
    { href: "#/support", icon: "🤲", titleKey: "donate", title: "Faire un don", subKey: "support_mosque", sub: "Soutenir la mosquée" },
    { href: "#/ramadan", icon: "🌙", titleKey: "ramadan", title: "Ramadan", subKey: "program", sub: "Programme" },
  ];

  renderMain(`
    <div class="hero-mosque">
      <div class="bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
      <h1 style="font-size:1.6em; margin:10px 0 4px;">${t("app_name", "Mosqué Digital")}</h1>
      <p style="color:var(--muted);">
        ${userName
          ? `${t("assalamu_alaykum", "As-salâmu ʿalaykum")}, <strong style="color:var(--fg)">${userName}</strong> — ${t(gKey, gFallback)}`
          : `${t("assalamu_alaykum", "As-salâmu ʿalaykum")} — ${t(gKey, gFallback)}`}
      </p>
      <p style="color:var(--accent2); font-size:1.05em; margin-top:2px;" id="home-hijri"></p>
    </div>

    <div id="install-banner"></div>

    <div id="prayer-countdown" class="card" style="margin-bottom:8px;">
      <div class="loading-center"><div class="spinner"></div></div>
    </div>

    <div class="card card-accent" style="text-align:center;">
      <div class="bismillah" style="font-size:1.15em;" dir="rtl">${dhikr.ar}</div>
      ${dhikr.translation ? `<div style="color:var(--muted); font-size:.92em; margin-top:6px;">${dhikr.translation}</div>` : ""}
    </div>

    ${ornamentHtml("✦ ✦ ✦")}

    <div class="card-grid">
      ${shortcuts.map(s => `
        <a href="${s.href}" class="card card-link" style="display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
          <span class="icon-badge">${s.icon}</span>
          <div>
            <div style="font-weight:600;">${t(s.titleKey, s.title)}</div>
            <div style="font-size:0.85em; color:var(--muted);">${t(s.subKey, s.sub)}</div>
          </div>
        </a>
      `).join("")}
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

  renderInstallBanner();
  if (_installListener) window.removeEventListener("pwa-installable-changed", _installListener);
  _installListener = renderInstallBanner;
  window.addEventListener("pwa-installable-changed", _installListener);

  const date = new Date().toISOString().split("T")[0];
  // Charge le calendrier hégirien du jour
  api(`/api/hijri?date=${date}`, { auth: false })
    .then(h => {
      const el = document.getElementById("home-hijri");
      if (el && h?.hijri) {
        const isAr = getCurrentLang() === "ar";
        const primary = isAr ? h.hijri.monthNameAr : h.hijri.monthNameFr;
        el.textContent = isAr
          ? `${h.hijri.day} ${primary} ${h.hijri.year} هـ`
          : `${h.hijri.day} ${primary} ${h.hijri.year} AH (${h.hijri.monthNameAr})`;
      }
    })
    .catch(() => {});

  startPrayerCountdown();
}

function renderInstallBanner() {
  const el = document.getElementById("install-banner");
  if (!el) return;

  if (localStorage.getItem("pwa-banner-dismissed") === "1" || !isInstallable()) {
    el.innerHTML = "";
    return;
  }

  el.innerHTML = `
    <div class="card card-accent" style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
      <span class="icon-badge">📲</span>
      <div style="flex:1; min-width:180px;">
        <div style="font-weight:600;">${t("install_app", "Installer l'application")}</div>
        <div style="font-size:.85em; color:var(--muted);">
          ${isIos()
            ? t("install_ios_hint", "Partager (⬆️) puis « Sur l'écran d'accueil »")
            : t("install_hint", "Accès rapide, plein écran, fonctionne hors-ligne")}
        </div>
      </div>
      ${canPromptInstall() ? `<button class="btn btn-sm btn-primary" id="btn-install">${t("install", "Installer")}</button>` : ""}
      <button class="icon-btn" id="btn-dismiss-install" title="${t("dismiss", "Ignorer")}" aria-label="${t("dismiss", "Ignorer")}">✕</button>
    </div>
  `;

  const installBtn = document.getElementById("btn-install");
  if (installBtn) installBtn.onclick = async () => {
    const outcome = await promptInstall();
    if (outcome === "accepted") el.innerHTML = "";
  };
  document.getElementById("btn-dismiss-install").onclick = () => {
    localStorage.setItem("pwa-banner-dismissed", "1");
    el.innerHTML = "";
  };
}

let _prayerData = null;
let _prayerMosqueId = null;
let _usingMyPosition = false;

async function startPrayerCountdown() {
  try {
    const mosques = await api("/api/mosques", { auth: false });
    _prayerMosqueId = mosques?.[0]?.id || null;
    if (_prayerMosqueId) {
      const date = new Date().toISOString().split("T")[0];
      _prayerData = await api(`/api/prayer-times/${_prayerMosqueId}?date=${date}`, { auth: false });
    }
  } catch { _prayerData = null; }

  updateCountdown();
  _countdownInterval = setInterval(updateCountdown, 60000);
}

// ── « Utiliser ma position exacte » depuis l'accueil — recalcule le compte
// à rebours sur la géolocalisation réelle plutôt que sur la mosquée par défaut ──
function useMyPositionFromHome() {
  const btn = document.getElementById("btn-home-my-position");
  if (!navigator.geolocation) { toast(t("geolocation_unavailable", "Géolocalisation non disponible"), "error"); return; }
  if (!btn) return;

  btn.disabled = true;
  const originalLabel = btn.textContent;
  btn.textContent = "📡 " + t("locating", "Localisation...");

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const date = new Date().toISOString().split("T")[0];
        _prayerData = await api(
          `/api/prayer-times/${_prayerMosqueId || "geo"}?date=${date}&lat=${latitude}&lng=${longitude}`,
          { auth: false }
        );
        _usingMyPosition = true;
        updateCountdown();
        toast(t("position_used", "Position exacte utilisée"), "success");
      } catch {
        toast(t("geolocation_unavailable", "Géolocalisation non disponible"), "error");
        btn.disabled = false;
        btn.textContent = originalLabel;
      }
    },
    () => {
      toast(t("geolocation_unavailable", "Géolocalisation non disponible"), "error");
      btn.disabled = false;
      btn.textContent = originalLabel;
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

function updateCountdown() {
  const el = document.getElementById("prayer-countdown");
  if (!el) { clearInterval(_countdownInterval); return; }

  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

  const prayers = _prayerData
    ? [
        { name: t("fajr", "Fajr"), time: _prayerData.fajr?.time || "--:--" },
        { name: t("sunrise", "Sunrise"), time: _prayerData.sunrise?.time || "--:--" },
        { name: t("dhuhr", "Dhuhr"), time: _prayerData.dhuhr?.time || "--:--" },
        { name: t("asr", "Asr"), time: _prayerData.asr?.time || "--:--" },
        { name: t("maghrib", "Maghrib"), time: _prayerData.maghrib?.time || "--:--" },
        { name: t("isha", "Isha"), time: _prayerData.isha?.time || "--:--" },
      ]
    : [
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

  // Progression de la jauge : part du plein (100%) juste après la prière précédente,
  // se vide vers 0 à mesure qu'on approche la suivante (fenêtre ~6h, plafonnée).
  const pct = Math.max(4, Math.min(100, Math.round((diffMin / (6 * 60)) * 100)));

  el.className = "card";
  el.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:center; gap:24px; flex-wrap:wrap; padding:8px 0;">
      <div class="gauge" style="--gauge-pct:${pct};">
        <div class="gauge-inner">
          <div class="timer">${countdown}</div>
          <div class="label">${t("remaining", "restant")}</div>
        </div>
      </div>
      <div>
        <div class="label">${t("next_prayer", "Prochaine prière")}</div>
        <div class="next-prayer">${nextPrayer.name}</div>
        <div class="label">${t("at", "à")} ${nextPrayer.time} · ${timeStr}</div>
      </div>
    </div>
    <div style="text-align:center; margin-top:6px;">
      ${_usingMyPosition
        ? `<span style="font-size:.8em; color:var(--accent);">📍 ${t("times_for_your_position", "Horaires calculés pour votre position exacte")}</span>`
        : `<button class="btn btn-sm btn-secondary" id="btn-home-my-position">📍 ${t("use_my_position", "Utiliser ma position exacte")}</button>`}
    </div>
  `;

  const posBtn = document.getElementById("btn-home-my-position");
  if (posBtn) posBtn.onclick = useMyPositionFromHome;
}
