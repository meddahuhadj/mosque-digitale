// ── Mosqué Digital — Main App Entry ────────────────────────────────

import { addRoute, startRouter, navigate } from "./router.js";
import { initI18n, t, setLanguage, getCurrentLang, getSupportedLanguages, getLangInfo } from "./i18n.js";
import { initTheme, toggleTheme, setTheme, setSeniorMode, setHighContrast } from "./theme.js";
import { isAuthenticated, setAuthChangeCallback, api, clearTokens } from "./api.js";
import { toast, renderMain, showModal } from "./components.js";

// ── Modules (lazy loaded) ─────────────────────────────────────────────

const moduleLoaders = import.meta.glob("../modules/*/index.js");

async function loadModule(path) {
  const load = moduleLoaders[`../modules/${path}.js`];
  if (!load) throw new Error(`Module introuvable: ${path}`);
  return load();
}

// ── Page Handlers ──────────────────────────────────────────────────────

async function homePage() {
  const { renderHome } = await loadModule("home/index");
  await renderHome();
}

async function prayerPage(params) {
  const { renderPrayer } = await loadModule("prayer/index");
  await renderPrayer(params);
}

async function quranPage(params) {
  const { renderQuran } = await loadModule("quran/index");
  await renderQuran(params);
}

async function khutbahPage(params) {
  const { renderKhutbah } = await loadModule("khutbah/index");
  await renderKhutbah(params);
}

async function announcementsPage(params) {
  const { renderAnnouncements } = await loadModule("announcements/index");
  await renderAnnouncements(params);
}

async function eventsPage(params) {
  const { renderEvents } = await loadModule("events/index");
  await renderEvents(params);
}

async function ramadanPage(params) {
  const { renderRamadan } = await loadModule("ramadan/index");
  await renderRamadan(params);
}

async function adminPage(params) {
  const { renderAdmin } = await loadModule("admin/index");
  await renderAdmin(params);
}

async function imamPage(params) {
  const { renderImam } = await loadModule("imam/index");
  await renderImam(params);
}

async function authPage(params) {
  const { renderAuth } = await loadModule("auth/index");
  await renderAuth(params);
}

async function displayPage(params) {
  const { renderDisplay } = await loadModule("display/index");
  await renderDisplay(params);
}

async function settingsPage() {
  renderMain(`
    <div class="card">
      <h2 class="card-header">⚙️ ${t("settings", "Paramètres")}</h2>

      <div class="form-group">
        <label>${t("language", "Langue")}</label>
        <select id="settings-lang">
          ${getSupportedLanguages().map(l => `<option value="${l}" ${l === getCurrentLang() ? "selected" : ""}>${getLangInfo(l)?.label || l}</option>`).join("")}
        </select>
      </div>

      <div class="form-group">
        <label>${t("theme", "Thème")}</label>
        <select id="settings-theme">
          <option value="auto" ${!localStorage.getItem("theme") ? "selected" : ""}>${t("auto", "Automatique")}</option>
          <option value="dark" ${localStorage.getItem("theme") === "dark" ? "selected" : ""}>${t("dark", "Sombre")}</option>
          <option value="light" ${localStorage.getItem("theme") === "light" ? "selected" : ""}>${t("light", "Clair")}</option>
        </select>
      </div>

      <div class="form-group">
        <label>${t("accessibility", "Accessibilité")}</label>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <input type="checkbox" id="senior-mode" ${localStorage.getItem("senior-mode") === "true" ? "checked" : ""} />
          ${t("senior_mode", "Mode senior (gros texte)")}
        </label>
        <label style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" id="high-contrast" ${localStorage.getItem("contrast") === "high" ? "checked" : ""} />
          ${t("high_contrast", "Contraste élevé")}
        </label>
      </div>

      <button class="btn btn-secondary" id="settings-clear" style="margin-top:16px;">${t("clear_cache", "Vider le cache")}</button>
    </div>
  `);

  document.getElementById("settings-lang").onchange = (e) => setLanguage(e.target.value);
  document.getElementById("settings-theme").onchange = (e) => setTheme(e.target.value);
  document.getElementById("senior-mode").onchange = (e) => setSeniorMode(e.target.checked);
  document.getElementById("high-contrast").onchange = (e) => setHighContrast(e.target.checked);
  document.getElementById("settings-clear").onclick = () => {
    if (caches) caches.keys().then(ks => ks.forEach(k => caches.delete(k)));
    toast(t("cache_cleared", "Cache vidé"), "success");
  };
}

// ── Routes ─────────────────────────────────────────────────────────────

addRoute("/", homePage);
addRoute("/prayer", prayerPage);
addRoute("/prayer/:mosqueId", prayerPage);
addRoute("/quran", quranPage);
addRoute("/quran/surah/:number", quranPage);
addRoute("/quran/verse/:ref", quranPage);
addRoute("/khutbah", khutbahPage);
addRoute("/khutbah/:code", khutbahPage);
addRoute("/announcements", announcementsPage);
addRoute("/events", eventsPage);
addRoute("/ramadan", ramadanPage);
addRoute("/admin", adminPage);
addRoute("/admin/:mosqueId", adminPage);
addRoute("/imam", imamPage);
addRoute("/imam/:code", imamPage);
addRoute("/auth", authPage);
addRoute("/auth/:action", authPage);
addRoute("/display", displayPage);
addRoute("/display/:mosqueId", displayPage);
addRoute("/settings", settingsPage);

// ── Nav ────────────────────────────────────────────────────────────────

function updateNavigation() {
  const navLinks = [
    { href: "#/", icon: "🏠", label: t("home", "Accueil") },
    { href: "#/prayer", icon: "🕌", label: t("prayers", "Prières") },
    { href: "#/quran", icon: "📖", label: t("quran", "Coran") },
    { href: "#/khutbah", icon: "🎙️", label: t("khutbah_live", "Khutbah Live") },
    { href: "#/announcements", icon: "📢", label: t("announcements", "Annonces") },
    { href: "#/events", icon: "📅", label: t("events", "Événements") },
    { href: "#/settings", icon: "⚙️", label: t("settings", "Paramètres") },
  ];

  const mainNav = document.getElementById("main-nav");
  const mobileNav = document.getElementById("mobile-nav");

  mainNav.innerHTML = navLinks
    .filter((_, i) => i < 5)
    .map(l => `<a href="${l.href}">${l.icon} ${l.label}</a>`)
    .join("");

  mobileNav.innerHTML = navLinks
    .map(l => `<a href="${l.href}"><span class="icon">${l.icon}</span>${l.label}</a>`)
    .join("");
}

// ── Init ───────────────────────────────────────────────────────────────

async function init() {
  initTheme();
  await initI18n();
  updateNavigation();
  setAuthChangeCallback(() => updateNavigation());

  // Listen for language changes
  window.addEventListener("language-changed", () => {
    updateNavigation();
    // Re-render current page
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });

  startRouter();
}

init().catch(err => {
  console.error("App init failed:", err);
  renderMain(`<div style="text-align:center;padding:60px;"><h2>⚠️ Initialization Error</h2><p>${err.message}</p></div>`);
});

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
