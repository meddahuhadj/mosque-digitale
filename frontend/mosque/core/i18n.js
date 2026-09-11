// ── Internationalization (i18n) ────────────────────────────────────────

// `tag` = BCP-47 locale for Intl.* (dates, clock) and speechSynthesis voices.
const LANGUAGES = {
  ar: { dir: "rtl", label: "العربية", tag: "ar-SA" },
  fr: { dir: "ltr", label: "Français", tag: "fr-FR" },
  en: { dir: "ltr", label: "English", tag: "en-US" },
  nl: { dir: "ltr", label: "Nederlands", tag: "nl-NL" },
  de: { dir: "ltr", label: "Deutsch", tag: "de-DE" },
  es: { dir: "ltr", label: "Español", tag: "es-ES" },
  tr: { dir: "ltr", label: "Türkçe", tag: "tr-TR" },
  ur: { dir: "rtl", label: "اردو", tag: "ur-PK" },
  bn: { dir: "ltr", label: "বাংলা", tag: "bn-BD" },
  ha: { dir: "ltr", label: "Hausa", tag: "ha-NG" },
  wo: { dir: "ltr", label: "Wolof", tag: "fr-FR" }, // pas de locale ICU dédiée : le français reste le plus proche
  it: { dir: "ltr", label: "Italiano", tag: "it-IT" },
  pt: { dir: "ltr", label: "Português", tag: "pt-PT" },
  id: { dir: "ltr", label: "Bahasa Indonesia", tag: "id-ID" },
};

let _currentLang = localStorage.getItem("uiLang") || "fr";
let _translations = {};
let _loaded = {};

export function getCurrentLang() { return _currentLang; }
export function isRTL() { return LANGUAGES[_currentLang]?.dir === "rtl"; }
export function getLangInfo(code) { return LANGUAGES[code]; }
export function getSupportedLanguages() { return Object.keys(LANGUAGES); }
export function getLocaleTag(lang = _currentLang) { return LANGUAGES[lang]?.tag || "fr-FR"; }

export async function setLanguage(lang) {
  if (!LANGUAGES[lang]) return;
  _currentLang = lang;
  localStorage.setItem("uiLang", lang);
  if (!_loaded[lang]) await loadTranslations(lang);
  applyTranslations();
  document.documentElement.lang = lang;
  document.documentElement.dir = LANGUAGES[lang].dir;
  window.dispatchEvent(new CustomEvent("language-changed", { detail: { lang } }));
}

async function loadTranslations(lang) {
  try {
    const r = await fetch(`../lang/${lang}.json`);
    if (r.ok) {
      _translations[lang] = await r.json();
      _loaded[lang] = true;
    }
  } catch { /* fallback to keys */ }
  _loaded[lang] = _loaded[lang] || true;
}

export function t(key, fallback) {
  const val = _translations[_currentLang]?.[key];
  return val || fallback || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const val = t(key);
    if (val !== key) el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const val = t(key);
    if (val !== key) el.placeholder = val;
  });
}

export async function initI18n() {
  await loadTranslations(_currentLang);
  applyTranslations();
  document.documentElement.lang = _currentLang;
  if (LANGUAGES[_currentLang]) {
    document.documentElement.dir = LANGUAGES[_currentLang].dir;
  }
}
