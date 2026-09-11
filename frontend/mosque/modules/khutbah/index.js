// ── Khutbah Live Module ────────────────────────────────────────────────

import { getSocket, setBroadcasterToken } from "../../core/socket.js";
import { t, getLocaleTag } from "../../core/i18n.js";
import { renderMain, toast, ornamentHtml } from "../../core/components.js";
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
        if (data.broadcaster_token) setBroadcasterToken(data.code, data.broadcaster_token);
        toast(`${t("session_created", "Session créée")}: ${data.code}`, "success");
        location.hash = `#/imam/${data.code}`;
      } catch (err) {
        toast(err.message, "error");
      }
    };
  }
}

// Taille de sous-titre persistée (échelle appliquée via --khutbah-fs).
const FS_STEPS = [0.85, 1, 1.15, 1.35, 1.6];
let _fsIndex = clampFsIndex(parseInt(localStorage.getItem("khutbah-fs-idx"), 10));
let _ttsOn = localStorage.getItem("khutbah-tts") === "1";
let _ttsLang = "fr";
const _ttsQueue = [];
const TTS_QUEUE_MAX = 3; // la file saute le retard pour rester proche du direct

function clampFsIndex(i) {
  return Number.isFinite(i) && i >= 0 && i < FS_STEPS.length ? i : 1;
}

async function renderListener(code) {
  renderMain(`
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
      <a href="#/khutbah" class="btn btn-sm btn-secondary">←</a>
      <span style="font-weight:600; font-family:var(--font-heading);">🎙️ Khutbah Live</span>
      <span id="khutbah-status" class="badge-live" style="margin-left:4px;">${t("connecting", "Connexion...")}</span>
      <span style="margin-left:auto; font-size:0.85em; color:var(--muted);" id="listener-count">0 👤</span>
    </div>

    <div class="card" style="padding:12px 16px; margin-bottom:12px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
      <select id="lang-select" style="width:auto; flex:1; min-width:140px;">
        <option value="fr">Français</option>
        <option value="en">English</option>
        <option value="nl">Nederlands</option>
        <option value="de">Deutsch</option>
        <option value="es">Español</option>
        <option value="tr">Türkçe</option>
        <option value="ar">العربية</option>
      </select>
      <button class="icon-btn" id="fs-minus" type="button" title="${t("text_smaller", "Texte plus petit")}" aria-label="${t("text_smaller", "Texte plus petit")}">A−</button>
      <button class="icon-btn" id="fs-plus" type="button" title="${t("text_larger", "Texte plus grand")}" aria-label="${t("text_larger", "Texte plus grand")}">A+</button>
      <button class="icon-btn" id="tts-toggle" type="button" title="${t("voice_playback", "Lecture vocale")}" aria-label="${t("voice_playback", "Lecture vocale")}" aria-pressed="${_ttsOn}">${_ttsOn ? "🔊" : "🔇"}</button>
    </div>

    <div id="interim-line" style="direction:rtl; text-align:right; font-family:var(--font-arabic); font-size:1.5em; color:var(--accent2); min-height:1.4em; margin-bottom:8px;"></div>

    ${ornamentHtml("۞")}

    <div id="segments" style="--khutbah-fs:${FS_STEPS[_fsIndex]}; max-height:60vh; overflow-y:auto; padding:4px 0 12px;"></div>
  `);

  const socket = getSocket("/khutbah");
  let lastSeq = 0;
  const statusEl = () => document.getElementById("khutbah-status");

  function setLive(isLive, label) {
    const el = statusEl();
    if (!el) return;
    el.textContent = label;
    el.classList.toggle("live", !!isLive);
  }

  socket.on("connect", () => setLive(false, t("connected", "Connecté")));

  socket.on("hello", (data) => {
    setLive(data.status === "live", data.status === "live" ? `🔴 ${t("live", "LIVE")}` : `⏸ ${data.status}`);
    lastSeq = data.seq || 0;

    // Replay history
    if (data.history?.length) {
      for (const seg of data.history) addSegment(seg, { speak: false });
    }
  });

  socket.on("interim", (data) => {
    const el = document.getElementById("interim-line");
    if (el) el.textContent = data.arabic || "";
  });

  socket.on("phrase", (data) => {
    if (data.corrected) {
      const el = document.querySelector(`[data-seq="${data.seq}"] .arabic`);
      if (el) el.textContent = data.arabic || el.textContent;
    } else {
      addSegment(data, { speak: true });
      lastSeq = data.seq;
    }
  });

  socket.on("session", (data) => {
    setLive(data.status === "live", data.status === "live" ? `🔴 ${t("live", "LIVE")}` : `⏸ ${data.status}`);
  });

  socket.on("disconnect", () => setLive(false, `⚠️ ${t("disconnected", "Déconnecté")} — ${t("reconnecting", "Reconnexion...")}`));

  const langSelect = document.getElementById("lang-select");
  _ttsLang = langSelect.value;
  langSelect.onchange = (e) => {
    _ttsLang = e.target.value;
    stopSpeaking();
    socket.emit("set-lang", { lang: e.target.value });
  };

  document.getElementById("fs-minus").onclick = () => setFontScale(_fsIndex - 1);
  document.getElementById("fs-plus").onclick = () => setFontScale(_fsIndex + 1);
  document.getElementById("tts-toggle").onclick = () => setTtsEnabled(!_ttsOn);

  // Join : the connection itself carries the code + lang
  socket.emit("join-listen", { code, lang: langSelect.value });

  // Le TTS ne doit pas survivre à un changement de page.
  window.addEventListener("hashchange", stopSpeaking, { once: true });
}

function setFontScale(index) {
  _fsIndex = clampFsIndex(index);
  localStorage.setItem("khutbah-fs-idx", String(_fsIndex));
  const el = document.getElementById("segments");
  if (el) el.style.setProperty("--khutbah-fs", FS_STEPS[_fsIndex]);
}

function setTtsEnabled(on) {
  _ttsOn = on;
  localStorage.setItem("khutbah-tts", on ? "1" : "0");
  const btn = document.getElementById("tts-toggle");
  if (btn) { btn.textContent = on ? "🔊" : "🔇"; btn.setAttribute("aria-pressed", String(on)); }
  if (!on) stopSpeaking();
}

function stopSpeaking() {
  _ttsQueue.length = 0;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function speak(text) {
  if (!_ttsOn || !text || !window.speechSynthesis) return;
  // Reste proche du direct : on saute les segments en attente plutôt que de prendre du retard.
  if (_ttsQueue.length >= TTS_QUEUE_MAX) _ttsQueue.shift();
  _ttsQueue.push(text);
  if (!window.speechSynthesis.speaking) pumpTtsQueue();
}

function pumpTtsQueue() {
  const next = _ttsQueue.shift();
  if (next === undefined) return;
  const utt = new SpeechSynthesisUtterance(next);
  utt.lang = getLocaleTag(_ttsLang);
  utt.onend = pumpTtsQueue;
  utt.onerror = pumpTtsQueue;
  window.speechSynthesis.speak(utt);
}

function addSegment(data, { speak: shouldSpeak = false } = {}) {
  const el = document.getElementById("segments");
  if (!el) return;

  const div = document.createElement("div");
  div.className = `khutbah-segment ${data.is_quran ? "quran" : ""} ${data.degraded ? "degraded" : ""}`;
  div.setAttribute("data-seq", data.seq);
  div.innerHTML = `
    ${data.arabic ? `<div class="arabic">${data.arabic}</div>` : ""}
    <div class="translation" style="font-size:var(--khutbah-fs, 1em);">${data.text || ""}</div>
    ${data.is_quran && data.quran_ref ? `<div style="font-size:0.8em; color:var(--accent); margin-top:4px;">📖 ${data.quran_ref}</div>` : ""}
    ${data.degraded ? `<div style="font-size:0.75em; color:var(--warn);">⚠️ ${t("degraded", "Mode dégradé")}</div>` : ""}
  `;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;

  if (shouldSpeak) speak(data.text);
}
