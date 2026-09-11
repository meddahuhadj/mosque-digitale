// ── Khutbah Live Module ────────────────────────────────────────────────

import { getSocket } from "../../core/socket.js";
import { t } from "../../core/i18n.js";
import { renderMain, toast } from "../../core/components.js";
import { isAuthenticated, api } from "../../core/api.js";

export async function renderKhutbah(params) {
  const code = params?.code;

  if (code) {
    await renderListener(code);
  } else {
    await renderLobby();
  }
}

async function renderLobby() {
  renderMain(`
    <div class="card" style="max-width:500px; margin:20px auto; text-align:center;">
      <h2 class="card-header" style="justify-content:center;">🎙️ ${t("khutbah_live", "Khutbah Live")}</h2>

      <div style="background:var(--bg2); border-radius:12px; padding:20px; margin-bottom:16px;">
        <div style="font-size:1.5em; margin-bottom:8px;">📱</div>
        <h3 style="margin:0 0 8px;">${t("scan_qr_title", "Scannez le QR Code")}</h3>
        <p style="color:var(--muted); margin:0; line-height:1.5;">
          ${t("scan_qr_instructions", "Affichez le QR Code projeté à l'écran de la mosquée. Ouvrez l'appareil photo de votre téléphone et scannez-le pour rejoindre la session automatiquement.")}
        </p>
      </div>

      <div style="margin:20px 0; color:var(--muted);">— ${t("or", "ou")} —</div>

      <div class="form-group">
        <input type="text" id="session-code" placeholder="${t("session_code", "Code de session")}"
               maxlength="6" style="text-align:center; font-size:1.3em; letter-spacing:0.15em; text-transform:uppercase;" />
      </div>

      <button class="btn btn-primary btn-block" id="join-btn">${t("join", "Rejoindre")}</button>
    </div>

    ${isAuthenticated() ? `
      <div class="card" style="max-width:500px; margin:0 auto;">
        <h3 class="card-header">👑 ${t("imam_tools", "Outils Imam")}</h3>
        <button class="btn btn-primary btn-block" id="start-session">${t("start_session", "Démarrer une Khutbah")}</button>
      </div>
    ` : ""}
  `);

  document.getElementById("join-btn").onclick = () => {
    const code = document.getElementById("session-code").value.trim().toUpperCase();
    if (code.length >= 4) location.hash = `#/khutbah/${code}`;
  };

  document.getElementById("session-code").onkeydown = (e) => {
    if (e.key === "Enter") document.getElementById("join-btn").click();
  };

  if (document.getElementById("start-session")) {
    document.getElementById("start-session").onclick = async () => {
      try {
        const data = await api("/api/session", {
          method: "POST",
          body: { target_langs: ["fr", "en"] },
        });
        toast(`${t("session_created", "Session créée")}: ${data.code}`, "success");
        location.hash = `#/imam/${data.code}`;
      } catch (err) {
        toast(err.message, "error");
      }
    };
  }
}

async function renderListener(code) {
  renderMain(`
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
      <a href="#/khutbah" class="btn btn-sm btn-secondary">←</a>
      <span style="font-weight:600;">🎙️ Khutbah Live</span>
      <span style="margin-left:auto; font-size:0.85em; color:var(--muted);" id="listener-count">0 👤</span>
    </div>

    <div class="form-group" style="margin-bottom:12px;">
      <select id="lang-select" style="width:auto;">
        <option value="fr">Français</option>
        <option value="en">English</option>
        <option value="nl">Nederlands</option>
        <option value="de">Deutsch</option>
        <option value="es">Español</option>
        <option value="tr">Türkçe</option>
        <option value="ar">العربية</option>
      </select>
    </div>

    <div id="khutbah-status" style="text-align:center; padding:8px; color:var(--muted);">
      ${t("connecting", "Connexion...")} <div class="spinner" style="width:16px;height:16px;"></div>
    </div>

    <div id="segments" style="max-height:60vh; overflow-y:auto; padding:4px 0;"></div>
  `);

  const socket = getSocket("/khutbah");
  let lastSeq = 0;

  socket.on("connect", () => {
    document.getElementById("khutbah-status").textContent = t("connected", "Connecté");
    socket.emit("join-listen", { code, lang: document.getElementById("lang-select").value });
  });

  socket.on("hello", (data) => {
    document.getElementById("khutbah-status").textContent =
      data.status === "live" ? "🔴 LIVE" : `⏸ ${data.status}`;
    document.getElementById("listener-count").textContent = `${data.listeners || 0} 👤`;
    lastSeq = data.seq || 0;

    // Replay history
    if (data.history?.length) {
      for (const seg of data.history) {
        addSegment(seg);
      }
    }
  });

  socket.on("phrase", (data) => {
    addSegment(data);
    lastSeq = data.seq;
  });

  socket.on("corrected", (data) => {
    const el = document.querySelector(`[data-seq="${data.seq}"] .arabic`);
    if (el) el.textContent = data.arabic;
  });

  socket.on("session", (data) => {
    document.getElementById("khutbah-status").textContent =
      data.status === "live" ? "🔴 LIVE" : `⏸ ${data.status}`;
  });

  socket.on("disconnect", () => {
    document.getElementById("khutbah-status").textContent = `⚠️ ${t("disconnected", "Déconnecté")} — ${t("reconnecting", "Reconnexion...")}`;
  });

  document.getElementById("lang-select").onchange = (e) => {
    socket.emit("set-lang", { code, lang: e.target.value });
  };
}

function addSegment(data) {
  const el = document.getElementById("segments");
  if (!el) return;

  const div = document.createElement("div");
  div.className = `khutbah-segment ${data.is_quran ? "quran" : ""} ${data.degraded ? "degraded" : ""}`;
  div.setAttribute("data-seq", data.seq);
  div.innerHTML = `
    ${data.arabic ? `<div class="arabic">${data.arabic}</div>` : ""}
    <div class="translation">${data.text || ""}</div>
    ${data.is_quran && data.quran_ref ? `<div style="font-size:0.8em; color:var(--accent); margin-top:4px;">📖 ${data.quran_ref}</div>` : ""}
    ${data.degraded ? `<div style="font-size:0.75em; color:var(--warn);">⚠️ ${t("degraded", "Mode dégradé")}</div>` : ""}
  `;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}
