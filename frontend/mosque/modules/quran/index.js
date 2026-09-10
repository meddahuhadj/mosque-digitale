// ── Quran Module ───────────────────────────────────────────────────────

import { api } from "../../core/api.js";
import { t } from "../../core/i18n.js";
import { renderMain, toast } from "../../core/components.js";

let _surahs = [];

export async function renderQuran(params) {
  const surahNumber = params?.number;
  const verseRef = params?.ref;

  if (verseRef) {
    await renderVerse(verseRef);
    return;
  }

  if (surahNumber) {
    await renderSurah(parseInt(surahNumber));
    return;
  }

  await renderSurahList();
}

async function renderSurahList() {
  renderMain(`
    <div class="card">
      <h2 class="card-header">📖 ${t("quran", "Coran")}</h2>
      <div class="form-group">
        <input type="search" id="quran-search" placeholder="${t("search_surah", "Rechercher une sourate...")}" />
      </div>
      <div id="surah-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);

  try {
    _surahs = await api("/api/quran/surahs", { auth: false });
    renderSurahGrid(_surahs);
  } catch (err) {
    document.getElementById("surah-list").innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }

  document.getElementById("quran-search").oninput = (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = _surahs.filter(s =>
      s.nameEnglish.toLowerCase().includes(q) ||
      s.nameTransliteration.toLowerCase().includes(q) ||
      s.nameArabic.includes(q) ||
      String(s.number).includes(q)
    );
    renderSurahGrid(filtered);
  };
}

function renderSurahGrid(surahs) {
  const el = document.getElementById("surah-list");
  if (!el) return;
  el.innerHTML = `
    <div class="card-grid" style="gap:8px;">
      ${surahs.map(s => `
        <a href="#/quran/surah/${s.number}" class="card" style="display:flex; align-items:center; gap:12px; padding:12px; text-decoration:none; color:var(--fg); margin:0;">
          <div style="width:36px; height:36px; border-radius:50%; background:var(--accent); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.85em; font-weight:700; flex-shrink:0;">${s.number}</div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.nameTransliteration}</div>
            <div style="font-size:0.8em; color:var(--muted);">${s.nameEnglish} · ${s.totalAyahs} ayahs</div>
          </div>
          <div style="font-size:1.3em; color:var(--accent2); direction:rtl;">${s.nameArabic}</div>
        </a>
      `).join("")}
    </div>
  `;
}

async function renderSurah(number) {
  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/quran" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;" id="surah-title"><div class="spinner"></div></h2>
    </div>
    <div id="surah-content" class="loading-center"><div class="spinner"></div></div>
  `);

  try {
    const data = await api(`/api/quran/surahs/${number}`, { auth: false });
    document.getElementById("surah-title").textContent = `${data.nameTransliteration} — ${data.nameEnglish}`;

    const el = document.getElementById("surah-content");
    el.innerHTML = `
      <div style="text-align:center; font-size:1.8em; color:var(--accent2); direction:rtl; font-family:'Noto Naskh Arabic',serif; margin-bottom:24px; line-height:1.8;">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
      </div>
      ${(data.ayahs || []).map(a => `
        <div class="ayah">
          <div class="arabic">${a.textArabic} <span class="ref">(${a.ayahNumber})</span></div>
          ${a.translation ? `<div class="translation">${a.translation}</div>` : ""}
        </div>
      `).join("")}
    `;
  } catch (err) {
    document.getElementById("surah-content").innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
}

async function renderVerse(ref) {
  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/quran" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;">📖 Sourate ${ref}</h2>
    </div>
    <div id="verse-content" class="loading-center"><div class="spinner"></div></div>
  `);

  try {
    const data = await api(`/api/quran/verse/${ref}`, { auth: false });
    const el = document.getElementById("verse-content");
    el.innerHTML = `
      <div class="card">
        <div style="text-align:center; margin-bottom:8px; color:var(--muted);">${data.surah?.nameTransliteration || ""} — Ayah ${data.ayah?.ayahNumber || ""}</div>
        <div class="ayah">
          <div class="arabic" style="font-size:1.6em; line-height:2;">${data.ayah?.textArabic || ""}</div>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById("verse-content").innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
}
