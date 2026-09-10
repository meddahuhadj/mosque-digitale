// ── Imam Module ────────────────────────────────────────────────────────

import { api, isAuthenticated } from "../../core/api.js";
import { getSocket } from "../../core/socket.js";
import { t } from "../../core/i18n.js";
import { renderMain, toast } from "../../core/components.js";

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
      const data = await api("/api/sessions", {
        method: "POST",
        body: { topic, languages: ["fr", "en"] },
      });
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
      <span style="font-weight:600;">👳 ${t("imam_control", "Contrôle Imam")}</span>
      <span style="margin-left:auto; font-size:0.85em; color:var(--muted);" id="imam-status">⏳</span>
    </div>

    <div class="card">
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
        <button class="btn btn-primary" id="btn-pause">⏸ ${t("pause", "Pause")}</button>
        <button class="btn btn-secondary" id="btn-resume">▶ ${t("resume", "Reprendre")}</button>
        <button class="btn btn-danger" id="btn-stop">⏹ ${t("stop", "Terminer")}</button>
      </div>

      <div class="form-group">
        <label>${t("type_arabic", "Saisir du texte arabe")}</label>
        <textarea id="manual-text" rows="3" placeholder="${t("arabic_placeholder", "Texte arabe...")}" style="direction:rtl; text-align:right; font-family:'Noto Naskh Arabic',serif; font-size:1.2em;"></textarea>
      </div>
      <button class="btn btn-primary btn-block" id="send-text">${t("send", "Envoyer")}</button>
    </div>

    <div class="card">
      <h4 class="card-header">📊 ${t("live_stats", "Statistiques en direct")}</h4>
      <div id="imam-stats" style="color:var(--muted);">${t("listeners", "Auditeurs")}: <span id="listener-count">0</span></div>
      <div id="imam-quran" style="margin-top:8px;"></div>
    </div>

    <div class="card">
      <h4 class="card-header">📝 ${t("segments", "Segments")}</h4>
      <div id="imam-segments" style="max-height:40vh; overflow-y:auto;"></div>
    </div>
  `);

  const socket = getSocket("/khutbah");

  socket.on("connect", () => {
    document.getElementById("imam-status").textContent = "🟢 " + t("connected", "Connecté");
    socket.emit("join-broadcast", { code });
  });

  socket.on("hello", (data) => {
    document.getElementById("imam-status").textContent = data.status === "live" ? "🔴 LIVE" : `⏸ ${data.status}`;
    document.getElementById("listener-count").textContent = data.listeners;
  });

  socket.on("monitor", (data) => {
    document.getElementById("listener-count").textContent = data.listeners;
    if (data.is_quran && data.quran_ref) {
      document.getElementById("imam-quran").innerHTML = `<div class="card" style="padding:12px; border-left:3px solid var(--accent);">📖 ${data.quran_ref}</div>`;
    }
    addImamSegment(data);
  });

  socket.on("status", (data) => {
    document.getElementById("imam-status").textContent = data.status === "live" ? "🔴 LIVE" : `⏸ ${data.status}`;
  });

  document.getElementById("btn-pause").onclick = () => socket.emit("control", { code, action: "pause" });
  document.getElementById("btn-resume").onclick = () => socket.emit("control", { code, action: "resume" });
  document.getElementById("btn-stop").onclick = () => socket.emit("control", { code, action: "stop" });

  document.getElementById("send-text").onclick = () => {
    const text = document.getElementById("manual-text").value.trim();
    if (text) {
      socket.emit("transcript", { code, text, is_final: true });
      document.getElementById("manual-text").value = "";
    }
  };
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
