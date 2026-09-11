// ── Hadith Module — Sahih al-Bukhari ────────────────────────────────────
// Même schéma que le module Coran : liste des livres → détail d'un livre
// (tous ses hadiths, arabe + traduction) → hadith isolé (lien de recherche).

import { api } from "../../core/api.js";
import { t, getLocaleTag, getCurrentLang } from "../../core/i18n.js";
import { renderMain, toast, ornamentHtml } from "../../core/components.js";

let _books = [];

// Traductions disponibles côté backend : arabe, français, anglais (repli sur
// le français pour toute autre langue de l'interface — cf. content.py).
function hadithLang() {
  const l = getCurrentLang();
  return (l === "ar" || l === "en") ? l : "fr";
}

// ── Reprise de lecture (localStorage, par appareil) ──────────────────────

function getLastRead() {
  try { return JSON.parse(localStorage.getItem("hadith-last-read") || "null"); }
  catch { return null; }
}

function setLastRead(number, name) {
  localStorage.setItem("hadith-last-read", JSON.stringify({ number, name, at: Date.now() }));
}

export async function renderHadith(params) {
  const bookNumber = params?.book;
  const hadithNumber = params?.number;

  if (hadithNumber) {
    await renderSingleHadith(parseInt(hadithNumber));
    return;
  }
  if (bookNumber) {
    await renderBook(parseInt(bookNumber));
    return;
  }
  await renderBookList();
}

async function renderBookList() {
  const lastRead = getLastRead();

  renderMain(`
    <div class="card">
      <h2 class="card-header">📜 ${t("hadith", "Hadith")} — ${t("sahih_bukhari", "Sahih al-Bukhari")}</h2>

      ${lastRead ? `
        <a href="#/hadith/book/${lastRead.number}" class="card card-link card-accent" style="display:flex; align-items:center; gap:12px; margin:0 0 16px; text-decoration:none; color:var(--fg);">
          <span class="icon-badge">📜</span>
          <div>
            <div style="font-size:.78em; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;">${t("resume_reading", "Reprendre la lecture")}</div>
            <div style="font-weight:600;">${lastRead.name}</div>
          </div>
        </a>
      ` : ""}

      <div class="form-group">
        <input type="search" id="hadith-search" placeholder="${t("search_hadith", "Rechercher un hadith...")}" />
      </div>
      <div id="hadith-book-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);

  try {
    _books = await api(`/api/hadith/books?lang=${hadithLang()}`, { auth: false });
    renderBookGrid(_books);
  } catch (err) {
    const el = document.getElementById("hadith-book-list");
    el.className = "";
    el.innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }

  document.getElementById("hadith-search").oninput = async (e) => {
    const q = e.target.value.trim();
    if (q.length < 2) {
      renderBookGrid(_books);
      return;
    }
    const ql = q.toLowerCase();
    const filtered = _books.filter(b => b.name.toLowerCase().includes(ql) || String(b.number).includes(ql));
    if (filtered.length) {
      renderBookGrid(filtered);
      return;
    }
    // Sinon : recherche plein-texte parmi les 7589 hadiths via l'API
    const el = document.getElementById("hadith-book-list");
    el.innerHTML = `<div class="loading-center"><div class="spinner"></div></div>`;
    try {
      const data = await api(`/api/hadith/search?q=${encodeURIComponent(q)}&lang=${hadithLang()}`, { auth: false });
      const results = data?.results || [];
      el.className = "";
      if (!results.length) {
        el.innerHTML = `<p style="color:var(--muted); text-align:center; padding:20px;">${t("no_results", "Aucun résultat")}</p>`;
        return;
      }
      el.innerHTML = results.map(r => `
        <a href="#/hadith/read/${r.hadithNumber}" class="card card-link" style="display:block; padding:12px; text-decoration:none; color:var(--fg); margin:0;">
          <div style="font-size:.8em; color:var(--accent); margin-bottom:2px;">📜 ${t("hadith_no", "Hadith n°")}${r.hadithNumber}</div>
          <div>${r.text}…</div>
        </a>
      `).join("");
    } catch {
      renderBookGrid(_books);
    }
  };
}

function renderBookGrid(books) {
  const el = document.getElementById("hadith-book-list");
  if (!el) return;
  el.className = ""; // retire "loading-center" (flex centré, hérité du spinner initial)

  if (!books.length) {
    el.innerHTML = `<p style="color:var(--muted); text-align:center; padding:20px;">${t("no_results", "Aucun résultat")}</p>`;
    return;
  }

  el.innerHTML = `
    <div class="card-grid" style="gap:8px;">
      ${books.map(b => `
        <a href="#/hadith/book/${b.number}" class="card card-link" style="display:flex; align-items:center; gap:12px; padding:12px; margin:0; text-decoration:none; color:var(--fg);">
          <div style="width:36px; height:36px; border-radius:50%; background:var(--accent-grad); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.85em; font-weight:700; flex-shrink:0;">${b.number}</div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${b.name}</div>
            <div style="font-size:0.8em; color:var(--muted);">${b.count} ${t("hadiths_count", "hadiths")}</div>
          </div>
        </a>
      `).join("")}
    </div>
  `;
}

async function renderBook(number) {
  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/hadith" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;" id="hadith-book-title"><div class="spinner"></div></h2>
    </div>
    <div id="hadith-book-content" class="loading-center"><div class="spinner"></div></div>
  `);

  try {
    const data = await api(`/api/hadith/books/${number}?lang=${hadithLang()}`, { auth: false });
    document.getElementById("hadith-book-title").textContent = `📜 ${data.name}`;
    setLastRead(number, data.name);

    const el = document.getElementById("hadith-book-content");
    el.className = ""; // retire "loading-center" (flex centré, hérité du spinner initial)
    el.innerHTML = (data.hadiths || []).map(h => `
      <div class="ayah" id="hadith-${h.hadithNumber}">
        <div style="font-size:.78em; color:var(--accent); margin-bottom:4px;">${t("hadith_no", "Hadith n°")}${h.hadithNumber}</div>
        <div class="arabic" dir="rtl">${h.textArabic}</div>
        ${h.translation && hadithLang() !== "ar" ? `<div class="translation">${h.translation}</div>` : ""}
        <div style="display:flex; gap:8px; margin-top:6px;">
          <button class="btn btn-sm btn-secondary btn-tts-hadith" data-hadith="${h.hadithNumber}">🔊 ${t("read_aloud", "Lire")}</button>
        </div>
      </div>
    `).join("");

    el.querySelectorAll(".btn-tts-hadith").forEach(btn => {
      btn.onclick = () => speakHadith(Number(btn.dataset.hadith));
    });
  } catch (err) {
    const el = document.getElementById("hadith-book-content");
    el.className = "";
    el.innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
}

async function renderSingleHadith(number) {
  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/hadith" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;">📜 ${t("hadith", "Hadith")} n°${number}</h2>
    </div>
    <div id="hadith-single-content" class="loading-center"><div class="spinner"></div></div>
  `);

  try {
    const data = await api(`/api/hadith/${number}?lang=${hadithLang()}`, { auth: false });
    const el = document.getElementById("hadith-single-content");
    el.className = ""; // retire "loading-center" (flex centré, hérité du spinner initial)
    el.innerHTML = `
      <div class="card">
        ${data.book?.name ? `<a href="#/hadith/book/${data.book.number}" style="font-size:.85em; color:var(--accent);">📜 ${data.book.name}</a>` : ""}
        <div class="ayah" style="margin-top:8px;">
          <div class="arabic" dir="rtl" style="font-size:1.3em; line-height:2;">${data.textArabic}</div>
          ${data.translation && hadithLang() !== "ar" ? `<div class="translation" style="font-size:1.05em;">${data.translation}</div>` : ""}
        </div>
        <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
          <button class="btn btn-secondary" id="btn-tts-single">🔊 ${t("read_aloud", "Lire")}</button>
        </div>
      </div>
    `;
    document.getElementById("btn-tts-single").onclick = () => speakHadith(number);
  } catch (err) {
    const el = document.getElementById("hadith-single-content");
    el.className = "";
    el.innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
}

// Lecture de la traduction à voix haute (Web Speech API)
function speakHadith(number) {
  if (!("speechSynthesis" in window)) { toast(t("tts_unsupported", "Lecture vocale non supportée"), "error"); return; }
  api(`/api/hadith/${number}?lang=${hadithLang()}`, { auth: false })
    .then(data => {
      const text = data?.translation || data?.textArabic || "";
      if (!text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = data?.translation ? getLocaleTag() : "ar-SA";
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    })
    .catch(() => toast(t("tts_failed_hadith", "Impossible de lire ce hadith"), "error"));
}
