// ── Internationalization (i18n) ────────────────────────────────────────

const LANGUAGES = {
  ar: { dir: "rtl", label: "العربية" },
  fr: { dir: "ltr", label: "Français" },
  en: { dir: "ltr", label: "English" },
  nl: { dir: "ltr", label: "Nederlands" },
  de: { dir: "ltr", label: "Deutsch" },
  es: { dir: "ltr", label: "Español" },
  tr: { dir: "ltr", label: "Türkçe" },
  ur: { dir: "rtl", label: "اردو" },
  bn: { dir: "ltr", label: "বাংলা" },
  ha: { dir: "ltr", label: "Hausa" },
  wo: { dir: "ltr", label: "Wolof" },
  it: { dir: "ltr", label: "Italiano" },
  pt: { dir: "ltr", label: "Português" },
  id: { dir: "ltr", label: "Bahasa Indonesia" },
};

let _currentLang = localStorage.getItem("uiLang") || "fr";
let _translations = {};
let _loaded = {};

export function getCurrentLang() { return _currentLang; }
export function isRTL() { return LANGUAGES[_currentLang]?.dir === "rtl"; }
export function getLangInfo(code) { return LANGUAGES[code]; }
export function getSupportedLanguages() { return Object.keys(LANGUAGES); }

export async function setLanguage(lang) {
  if (!LANGUAGES[lang]) return;
  _currentLang = lang;
  localStorage.setItem("uiLang", lang);
  if (!_loaded[lang]) await loadTranslations(lang);
  applyTranslations();
  document.documentElement.lang = lang;
  document.documentElement.dir = LANGUAGES[lang].dir;
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
