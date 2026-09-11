// ── Imam Module ────────────────────────────────────────────────────────

import { api, isAuthenticated, API_BASE } from "../../core/api.js";
import { getSocket, getBroadcasterToken, setBroadcasterToken } from "../../core/socket.js";
import { t } from "../../core/i18n.js";
import { renderMain, toast, ornamentHtml } from "../../core/components.js";

// ── Bibliothèque de phrases de khutbah (formules récurrentes, envoi en un tap) ──

const DEFAULT_PHRASES = [
  "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
  "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
  "يَا أَيُّهَا الَّذِينَ آمَنُوا",
  "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
  "قَالَ اللَّهُ تَعَالَى",
  "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ",
  "أَقُولُ قَوْلِي هَذَا وَأَسْتَغْفِرُ اللَّهَ لِي وَلَكُمْ",
  "اللَّهُمَّ اغْفِرْ لِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ",
  "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
  "أَقِيمُوا الصَّلَاةَ",
  "وَالسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ",
];

function getPhrases() {
  try {
    const stored = JSON.parse(localStorage.getItem("khutbah-phrases") || "null");
    return Array.isArray(stored) && stored.length ? stored : DEFAULT_PHRASES;
  } catch { return DEFAULT_PHRASES; }
}

function savePhrases(list) {
  localStorage.setItem("khutbah-phrases", JSON.stringify(list));
}

export async function renderImam(params) {
  if (!isAuthenticated()) {
    renderMain(`
      <div class="card" style="max-width:420px; margin:40px auto; text-align:center;">
        <h2>👳 ${t("imam_mode", "Mode Imam")}</h2>
        <p style="color:var(--muted); margin:12px 0;">${t("login_required", "Connexion requise")}</p>
        <a href="#/auth/login" class="btn btn-primary">${t("login", "Se connecter")}</a>
      </div>
    `);
    return;
  }

  const code = params?.code;

  if (code) {
    await renderImamControl(code);
  } else {
    await renderImamDashboard();
  }
}

async function renderImamDashboard() {
  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/" class="btn btn-sm btn-secondary">←</a>
      <h2>👳 ${t("imam_dashboard", "Tableau de bord Imam")}</h2>
    </div>

    <div class="card">
      <h3 class="card-header">🎙️ ${t("khutbah_control", "Contrôle Khutbah")}</h3>
      <div class="form-group">
        <label>${t("topic", "Sujet")}</label>
        <input type="text" id="imam-topic" placeholder="${t("khutbah_topic", "Sujet de la khutbah")}" />
      </div>
      <button class="btn btn-primary btn-block" id="start-khutbah">${t("start_session", "Démarrer une session")}</button>
    </div>

    <div class="card">
      <h3 class="card-header">🤖 ${t("ai_assistant", "Assistant IA")}</h3>
      <div class="form-group">
        <label>${t("ask_assistant", "Demander à l'assistant")}</label>
        <textarea id="ai-question" rows="3" placeholder="${t("ai_placeholder", "Préparer un plan de khutbah sur la patience...")}" style="width:100%; padding:10px; border:1px solid var(--line); border-radius:10px; background:var(--bg2); color:var(--fg);"></textarea>
      </div>
      <button class="btn btn-primary" id="ai-generate">${t("generate", "Générer")}</button>
      <div id="ai-result" style="margin-top:16px;"></div>
    </div>
  `);

  document.getElementById("start-khutbah").onclick = async () => {
    const topic = document.getElementById("imam-topic").value.trim();
    try {
      const data = await api("/api/session", {
        method: "POST",
        body: { mosque_name: topic, target_langs: ["fr", "en"] },
      });
      if (data.broadcaster_token) setBroadcasterToken(data.code, data.broadcaster_token);
      toast(`${t("session_created", "Session créée")}: ${data.code}`, "success");
      location.hash = `#/imam/${data.code}`;
    } catch (err) {
      toast(err.message, "error");
    }
  };

  document.getElementById("ai-generate").onclick = async () => {
    const question = document.getElementById("ai-question").value.trim();
    if (!question) return;
    const resultEl = document.getElementById("ai-result");
    resultEl.innerHTML = `<div class="loading-center"><div class="spinner"></div></div>`;
    try {
      const plan = await api("/api/ai/assistant/plan", {
        method: "POST",
        body: { topic: question },
      });
      resultEl.innerHTML = `
        <div class="card" style="background:var(--bg2);">
          <h4>📋 ${plan.topic || question}</h4>
          <div style="margin-top:8px;"><strong>${t("introduction", "Introduction")}:</strong><p>${plan.introduction}</p></div>
          ${plan.mainPoints?.length ? `<div style="margin-top:8px;"><strong>${t("main_points", "Points principaux")}:</strong><ul>${plan.mainPoints.map(p => `<li>${p}</li>`).join("")}</ul></div>` : ""}
          ${plan.references?.length ? `<div style="margin-top:8px;"><strong>${t("references", "Références")}:</strong><ul>${plan.references.map(r => `<li>📖 ${r}</li>`).join("")}</ul></div>` : ""}
          ${plan.conclusion ? `<div style="margin-top:8px;"><strong>${t("conclusion", "Conclusion")}:</strong><p>${plan.conclusion}</p></div>` : ""}
          ${plan.warnings?.length ? `<div style="margin-top:8px; color:var(--warn);"><strong>⚠️ ${t("verify", "À vérifier")}:</strong><ul>${plan.warnings.map(w => `<li>${w}</li>`).join("")}</ul></div>` : ""}
        </div>
      `;
    } catch (err) {
      resultEl.innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
    }
  };
}

async function renderImamControl(code) {
  renderMain(`
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
      <a href="#/imam" class="btn btn-sm btn-secondary">←</a>
      <span style="font-weight:600; font-family:var(--font-heading);">👳 ${t("imam_control", "Contrôle Imam")}</span>
      <span id="imam-status" class="badge-live" style="margin-left:auto;">⏳</span>
    </div>

    <div class="card" style="text-align:center;">
      <h3 class="card-header" style="justify-content:center;">📱 ${t("qr_session", "QR Code de la session")}</h3>
      <img src="${API_BASE}/api/session/${code}/qr.png" style="width:200px; margin:16px auto; border-radius:12px; background:#fff; padding:8px;" id="imam-qr-img" />
      <div style="font-size:0.85em; color:var(--muted); word-break:break-all;" id="join-url"></div>
      <button class="btn btn-sm btn-secondary" id="copy-join-url" style="margin-top:10px;">📋 ${t("copy_link", "Copier le lien")}</button>
    </div>

    <div class="card">
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
        <button class="btn btn-primary" id="btn-pause">⏸ ${t("pause", "Pause")}</button>
        <button class="btn btn-secondary" id="btn-resume">▶ ${t("resume", "Reprendre")}</button>
        <button class="btn btn-danger" id="btn-stop">⏹ ${t("stop", "Terminer")}</button>
      </div>

      <div class="form-group">
        <label>📚 ${t("phrase_library", "Bibliothèque de phrases")}</label>
        <div id="phrase-chips" dir="rtl" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;"></div>
        <div style="display:flex; gap:6px;">
          <input type="text" id="new-phrase" dir="rtl" placeholder="${t("add_phrase", "Ajouter une phrase...")}" style="flex:1; direction:rtl; text-align:right; font-family:var(--font-arabic);" />
          <button class="btn btn-sm btn-secondary" id="add-phrase" title="${t("add", "Ajouter")}">+</button>
        </div>
        <button class="btn btn-sm btn-secondary" id="reset-phrases" style="margin-top:6px; font-size:.78em;">${t("reset_defaults", "Rétablir la liste par défaut")}</button>
      </div>

      <div class="form-group">
        <label>${t("type_arabic", "Saisir du texte arabe")}</label>
        <textarea id="manual-text" rows="3" placeholder="${t("arabic_placeholder", "Texte arabe...")}" style="direction:rtl; text-align:right; font-family:var(--font-arabic); font-size:1.2em;"></textarea>
      </div>
      <button class="btn btn-primary btn-block" id="send-text">${t("send", "Envoyer")}</button>
    </div>

    <div class="card">
      <h4 class="card-header">📊 ${t("live_stats", "Statistiques en direct")}</h4>
      <div id="imam-stats" style="color:var(--muted);">${t("listeners", "Auditeurs")}: <span id="listener-count">0</span></div>
      <div id="imam-quran" style="margin-top:8px;"></div>
    </div>

    ${ornamentHtml("۞")}

    <div class="card">
      <h4 class="card-header">📝 ${t("segments", "Segments")}</h4>
      <div id="imam-segments" style="max-height:40vh; overflow-y:auto;"></div>
    </div>
  `);

  const socket = getSocket("/khutbah");
  const token = getBroadcasterToken(code);
  let joinUrl = `${window.location.origin}/#/khutbah/${code}`;

  try {
    const session = await api(`/api/session/${code}`);
    joinUrl = session.join_url || joinUrl;
    const joinUrlEl = document.getElementById("join-url");
    if (joinUrlEl) joinUrlEl.textContent = joinUrl;
  } catch {
    const joinUrlEl = document.getElementById("join-url");
    if (joinUrlEl) joinUrlEl.textContent = joinUrl;
  }

  document.getElementById("copy-join-url").onclick = () => {
    navigator.clipboard?.writeText(joinUrl).then(() => toast(t("copied", "Copié"), "success"));
  };

  function setStatus(isLive, label) {
    const el = document.getElementById("imam-status");
    if (!el) return;
    el.textContent = label;
    el.classList.toggle("live", !!isLive);
  }

  socket.on("connect", () => setStatus(false, "🟢 " + t("connected", "Connecté")));

  socket.on("hello", (data) => {
    setStatus(data.status === "live", data.status === "live" ? `🔴 ${t("live", "LIVE")}` : `⏸ ${data.status}`);
    document.getElementById("listener-count").textContent = data.listeners ?? 0;
  });

  socket.on("stats", (data) => {
    if (data.listeners !== undefined) document.getElementById("listener-count").textContent = data.listeners;
  });

  socket.on("session", (data) => {
    setStatus(data.status === "live", data.status === "live" ? `🔴 ${t("live", "LIVE")}` : `⏸ ${data.status}`);
  });

  socket.on("monitor", (data) => {
    document.getElementById("listener-count").textContent = data.listeners ?? document.getElementById("listener-count").textContent;
    if (data.is_quran && data.quran_ref) {
      document.getElementById("imam-quran").innerHTML = `<div class="card" style="padding:12px; border-left:3px solid var(--accent);">📖 ${data.quran_ref}</div>`;
    }
    addImamSegment(data);
  });

  socket.on("disconnect", () => setStatus(false, `⚠️ ${t("disconnected", "Déconnecté")}`));

  document.getElementById("btn-pause").onclick = () => socket.emit("control", { action: "pause" });
  document.getElementById("btn-resume").onclick = () => socket.emit("control", { action: "resume" });
  document.getElementById("btn-stop").onclick = () => socket.emit("control", { action: "stop" });

  function sendManual(text) {
    if (!text) return;
    socket.emit("transcript", { text, is_final: true, manual: true });
  }

  document.getElementById("send-text").onclick = () => {
    const text = document.getElementById("manual-text").value.trim();
    sendManual(text);
    document.getElementById("manual-text").value = "";
  };

  // ── Bibliothèque de phrases : un tap = envoi immédiat ──
  function renderPhraseChips() {
    const wrap = document.getElementById("phrase-chips");
    if (!wrap) return;
    const phrases = getPhrases();
    wrap.innerHTML = phrases.map((p, i) => `
      <span class="btn btn-sm btn-secondary phrase-chip" data-i="${i}" style="cursor:pointer; font-family:var(--font-arabic); gap:6px;">
        ${p}
        <button class="phrase-del" data-i="${i}" title="${t("delete", "Supprimer")}" aria-label="${t("delete", "Supprimer")}" style="background:none; border:none; color:inherit; opacity:.6; padding:0; font:inherit; cursor:pointer;">✕</button>
      </span>
    `).join("");
    wrap.querySelectorAll(".phrase-chip").forEach(chip => {
      chip.onclick = (e) => {
        if (e.target.classList.contains("phrase-del")) return;
        sendManual(phrases[Number(chip.dataset.i)]);
      };
    });
    wrap.querySelectorAll(".phrase-del").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const list = getPhrases();
        list.splice(Number(btn.dataset.i), 1);
        savePhrases(list);
        renderPhraseChips();
      };
    });
  }
  renderPhraseChips();

  document.getElementById("add-phrase").onclick = () => {
    const input = document.getElementById("new-phrase");
    const val = input.value.trim();
    if (!val) return;
    const list = getPhrases();
    list.push(val);
    savePhrases(list);
    input.value = "";
    renderPhraseChips();
  };
  document.getElementById("new-phrase").onkeydown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); document.getElementById("add-phrase").click(); }
  };
  document.getElementById("reset-phrases").onclick = () => {
    localStorage.removeItem("khutbah-phrases");
    renderPhraseChips();
    toast(t("defaults_restored", "Liste par défaut rétablie"), "success");
  };

  socket.emit("join-broadcast", { code, token });
}

function addImamSegment(data) {
  const el = document.getElementById("imam-segments");
  if (!el) return;
  const div = document.createElement("div");
  div.className = `khutbah-segment ${data.is_quran ? "quran" : ""}`;
  div.innerHTML = `
    <div class="arabic">${data.arabic || ""}</div>
    <div style="font-size:0.8em; color:var(--muted);">seq #${data.seq} ${data.provider ? `· ${data.provider}` : ""}</div>
  `;
  el.prepend(div);
}
