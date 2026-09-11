// ── Quran Module ───────────────────────────────────────────────────────

import { api } from "../../core/api.js";
import { t, getLocaleTag } from "../../core/i18n.js";
import { renderMain, toast, ornamentHtml } from "../../core/components.js";

let _surahs = [];

// ── Favoris & reprise de lecture (localStorage, par appareil) ───────────

function getFavorites() {
  try { return JSON.parse(localStorage.getItem("quran-favorites") || "[]"); }
  catch { return []; }
}

function isFavorite(number) { return getFavorites().includes(number); }

function toggleFavorite(number) {
  const favs = getFavorites();
  const i = favs.indexOf(number);
  if (i >= 0) favs.splice(i, 1); else favs.push(number);
  localStorage.setItem("quran-favorites", JSON.stringify(favs));
  return favs.includes(number);
}

function getLastRead() {
  try { return JSON.parse(localStorage.getItem("quran-last-read") || "null"); }
  catch { return null; }
}

function setLastRead(number, name) {
  localStorage.setItem("quran-last-read", JSON.stringify({ number, name, at: Date.now() }));
}

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
  const lastRead = getLastRead();

  renderMain(`
    <div class="card">
      <h2 class="card-header">📖 ${t("quran", "Coran")}</h2>

      ${lastRead ? `
        <a href="#/quran/surah/${lastRead.number}" class="card card-link card-accent" style="display:flex; align-items:center; gap:12px; margin:0 0 16px; text-decoration:none; color:var(--fg);">
          <span class="icon-badge">📖</span>
          <div>
            <div style="font-size:.78em; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;">${t("resume_reading", "Reprendre la lecture")}</div>
            <div style="font-weight:600;">${lastRead.name}</div>
          </div>
        </a>
      ` : ""}

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
    const el = document.getElementById("surah-list");
    el.className = "";
    el.innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }

  document.getElementById("quran-search").oninput = async (e) => {
    const q = e.target.value.trim();
    if (q.length < 2) {
      renderSurahGrid(_surahs);
      return;
    }
    const ql = q.toLowerCase();
    const filtered = _surahs.filter(s =>
      s.nameEnglish.toLowerCase().includes(ql) ||
      s.nameTransliteration.toLowerCase().includes(ql) ||
      s.nameArabic.includes(ql) ||
      String(s.number).includes(ql)
    );
    if (filtered.length) {
      renderSurahGrid(filtered);
      return;
    }
    // Sinon : recherche plein-texte des versets via l'API
    const el = document.getElementById("surah-list");
    el.innerHTML = `<div class="loading-center"><div class="spinner"></div></div>`;
    try {
      const data = await api(`/api/quran/search?q=${encodeURIComponent(q)}`, { auth: false });
      const results = data?.results || [];
      el.className = "";
      if (!results.length) {
        el.innerHTML = `<p style="color:var(--muted); text-align:center; padding:20px;">${t("no_results", "Aucun résultat")}</p>`;
        return;
      }
      el.innerHTML = results.map(r => r.type === "verse"
        ? `<a href="#/quran/verse/${r.ref}" class="card card-link" style="display:block; padding:12px; text-decoration:none; color:var(--fg); margin:0;">
             <div style="direction:rtl; text-align:right; font-family:var(--font-arabic); font-size:1.1em;">${r.text}</div>
             <div style="font-size:0.8em; color:var(--accent); margin-top:4px;">📖 ${r.ref}</div>
           </a>`
        : `<a href="#/quran/surah/${r.ref}" class="card card-link" style="display:block; padding:12px; text-decoration:none; color:var(--fg); margin:0;">
             <div style="font-weight:600;">📖 ${r.text}</div>
           </a>`).join("");
    } catch {
      renderSurahGrid(_surahs);
    }
  };
}

function renderSurahGrid(surahs) {
  const el = document.getElementById("surah-list");
  if (!el) return;
  el.className = ""; // retire "loading-center" (flex centré, hérité du spinner initial)

  const favs = getFavorites();
  // Favoris d'abord (ordre de sourate conservé dans chaque groupe), sans dupliquer la liste.
  const sorted = favs.length
    ? [...surahs].sort((a, b) => (favs.includes(b.number) ? 1 : 0) - (favs.includes(a.number) ? 1 : 0))
    : surahs;

  el.innerHTML = `
    <div class="card-grid" style="gap:8px;">
      ${sorted.map(s => `
        <div class="card card-link" style="display:flex; align-items:center; gap:8px; padding:12px; margin:0;">
          <a href="#/quran/surah/${s.number}" style="display:flex; align-items:center; gap:12px; flex:1; min-width:0; text-decoration:none; color:var(--fg);">
            <div style="width:36px; height:36px; border-radius:50%; background:var(--accent-grad); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.85em; font-weight:700; flex-shrink:0;">${s.number}</div>
            <div style="flex:1; min-width:0;">
              <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.nameTransliteration}</div>
              <div style="font-size:0.8em; color:var(--muted);">${s.nameEnglish} · ${s.totalAyahs} ayahs</div>
            </div>
            <div style="font-size:1.3em; color:var(--accent2); direction:rtl;">${s.nameArabic}</div>
          </a>
          <button class="icon-btn btn-fav" data-number="${s.number}" title="${t("favorite", "Favori")}" aria-label="${t("favorite", "Favori")}" aria-pressed="${favs.includes(s.number)}">${favs.includes(s.number) ? "⭐" : "☆"}</button>
        </div>
      `).join("")}
    </div>
  `;

  el.querySelectorAll(".btn-fav").forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const num = Number(btn.dataset.number);
      const on = toggleFavorite(num);
      btn.textContent = on ? "⭐" : "☆";
      btn.setAttribute("aria-pressed", String(on));
    };
  });
}

async function renderSurah(number) {
  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/quran" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;" id="surah-title"><div class="spinner"></div></h2>
      <button class="btn btn-sm btn-secondary" id="btn-play-all">▶ ${t("play_all", "Tout écouter")}</button>
    </div>
    <div id="surah-content" class="loading-center"><div class="spinner"></div></div>
    <audio id="ayah-audio" style="width:100%; margin-top:12px; display:none;" controls></audio>
  `);

  try {
    const data = await api(`/api/quran/surahs/${number}`, { auth: false });
    document.getElementById("surah-title").textContent = `${data.nameTransliteration} — ${data.nameEnglish}`;
    setLastRead(number, `${data.nameTransliteration} — ${data.nameEnglish}`);

    const el = document.getElementById("surah-content");
    el.className = ""; // retire "loading-center" (flex centré, hérité du spinner initial)
    el.innerHTML = `
      <div style="text-align:center; font-size:1.8em; color:var(--accent2); direction:rtl; font-family:var(--font-arabic); margin-bottom:24px; line-height:1.8;">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
      </div>
      ${(data.ayahs || []).map(a => `
        <div class="ayah" id="ayah-${a.ayahNumber}">
          <div class="arabic">${a.textArabic} <span class="ref">(${a.ayahNumber})</span></div>
          ${a.translation ? `<div class="translation">${a.translation}</div>` : ""}
          <div style="display:flex; gap:8px; margin-top:6px;">
            <button class="btn btn-sm btn-secondary btn-play-ayah" data-ayah="${a.ayahNumber}">▶ ${t("listen", "Écouter")}</button>
            <button class="btn btn-sm btn-secondary btn-tts-ayah" data-ayah="${a.ayahNumber}" data-ref="${number}:${a.ayahNumber}">🔊 ${t("read_aloud", "Lire")}</button>
          </div>
        </div>
      `).join("")}
    `;

    const audio = document.getElementById("ayah-audio");
    el.querySelectorAll(".btn-play-ayah").forEach(btn => {
      btn.onclick = () => {
        const pad = (n) => String(n).padStart(3, "0");
        audio.src = `https://everyayah.com/data/Alafasy_128kbps/${pad(number)}${pad(Number(btn.dataset.ayah))}.mp3`;
        audio.style.display = "block";
        audio.play();
      };
    });
    el.querySelectorAll(".btn-tts-ayah").forEach(btn => {
      btn.onclick = () => speakAyah(btn.dataset.ref);
    });

    document.getElementById("btn-play-all").onclick = () => {
      const pad = (n) => String(n).padStart(3, "0");
      audio.src = `https://everyayah.com/data/Alafasy_128kbps/${pad(number)}001.mp3`;
      audio.style.display = "block";
      audio.play();
    };
  } catch (err) {
    const el = document.getElementById("surah-content");
    el.className = "";
    el.innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
}

async function renderVerse(ref) {
  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/quran" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;">📖 Sourate ${ref}</h2>
    </div>
    <div id="verse-content" class="loading-center"><div class="spinner"></div></div>
    <audio id="verse-audio" style="width:100%; margin-top:12px; display:none;" controls></audio>
  `);

  try {
    const data = await api(`/api/quran/verse/${ref}`, { auth: false });
    const el = document.getElementById("verse-content");
    el.className = ""; // retire "loading-center" (flex centré, hérité du spinner initial)
    const surahNo = ref.split(/[:.]/)[0];
    const ayahNo = ref.split(/[:.]/)[1];
    el.innerHTML = `
      <div class="card">
        <div style="text-align:center; margin-bottom:8px; color:var(--muted);">${data.surah?.nameTransliteration || ""} — Ayah ${data.ayah?.ayahNumber || ""}</div>
        <div class="ayah">
          <div class="arabic" style="font-size:1.6em; line-height:2;">${data.ayah?.textArabic || ""}</div>
          ${data.ayah?.translation ? `<div class="translation" style="font-size:1.1em;">${data.ayah.translation}</div>` : ""}
        </div>
        <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
          <button class="btn btn-primary" id="btn-play">▶ ${t("listen", "Écouter")}</button>
          <button class="btn btn-secondary" id="btn-tts">🔊 ${t("read_aloud", "Lire")}</button>
        </div>
      </div>
    `;

    const audio = document.getElementById("verse-audio");
    document.getElementById("btn-play").onclick = () => {
      const pad = (n) => String(n).padStart(3, "0");
      audio.src = `https://everyayah.com/data/Alafasy_128kbps/${pad(Number(surahNo))}${pad(Number(ayahNo))}.mp3`;
      audio.style.display = "block";
      audio.play();
    };
    document.getElementById("btn-tts").onclick = () => speakAyah(ref);
  } catch (err) {
    const el = document.getElementById("verse-content");
    el.className = "";
    el.innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
}

// Lecture de la traduction à voix haute (Web Speech API)
function speakAyah(ref) {
  if (!("speechSynthesis" in window)) { toast(t("tts_unsupported", "Lecture vocale non supportée"), "error"); return; }
  api(`/api/quran/verse/${ref}`, { auth: false })
    .then(data => {
      const text = data?.ayah?.translation || data?.ayah?.textArabic || "";
      if (!text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = data?.ayah?.translation ? getLocaleTag() : "ar-SA";
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    })
    .catch(() => toast(t("tts_failed", "Impossible de lire ce verset"), "error"));
}
