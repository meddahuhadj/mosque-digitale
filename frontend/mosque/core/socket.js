// ── Raw WebSocket Client Wrapper ───────────────────────────────────────
// Implémente le protocole natif du backend FastAPI :
//   GET /ws/listen/{code}?lang={lang}       (auditeur)
//   GET /ws/broadcast/{code}?token={token}  (diffuseur)
// Plus de dépendance socket.io : les messages JSON du backend sont
// dispatchés par leur champ `type` sur les gestionnaires `on(event, cb)`.

import BACKEND_URL from "./config.js";

const _clients = {};

function _wsBase() {
  return BACKEND_URL.replace(/^http/, "ws");
}

export function getSocket(namespace = "/khutbah") {
  if (_clients[namespace]) return _clients[namespace];

  const client = {
    _handlers: {},
    _ws: null,
    _reconnectTimer: null,
    _mode: null,
    _code: null,
    _lang: null,
    _token: null,

    on(event, cb) {
      (this._handlers[event] = this._handlers[event] || []).push(cb);
      return this;
    },

    _dispatch(event, data) {
      (this._handlers[event] || []).forEach((cb) => {
        try { cb(data); } catch (err) { console.error("[ws]", err); }
      });
    },

    _connect() {
      if (this._ws) { try { this._ws.close(); } catch {} this._ws = null; }
      const path = this._mode === "broadcast"
        ? `/ws/broadcast/${encodeURIComponent(this._code)}?token=${encodeURIComponent(this._token || "")}`
        : `/ws/listen/${encodeURIComponent(this._code)}?lang=${encodeURIComponent(this._lang || "fr")}`;
      const ws = new WebSocket(_wsBase() + path);
      this._ws = ws;

      ws.onopen = () => {
        this._dispatch("connect", {});
      };
      ws.onmessage = (ev) => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch { return; }
        this._dispatch(msg.type, msg);
      };
      ws.onclose = () => {
        this._ws = null;
        this._dispatch("disconnect", {});
        if (this._mode) this._scheduleReconnect();
      };
      ws.onerror = () => {};
    },

    _scheduleReconnect() {
      if (this._reconnectTimer) return;
      this._reconnectTimer = setTimeout(() => {
        this._reconnectTimer = null;
        if (this._mode) this._connect();
      }, 2000);
    },

    emit(type, payload = {}) {
      if (type === "join-listen") {
        this._mode = "listen";
        this._code = payload.code;
        this._lang = payload.lang || "fr";
        this._connect();
        return this;
      }
      if (type === "join-broadcast") {
        this._mode = "broadcast";
        this._code = payload.code;
        this._token = payload.token || "";
        this._connect();
        return this;
      }
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        this._ws.send(JSON.stringify({ type, ...payload }));
      }
      return this;
    },

    disconnect() {
      this._mode = null;
      if (this._reconnectTimer) { clearTimeout(this._reconnectTimer); this._reconnectTimer = null; }
      if (this._ws) { try { this._ws.close(); } catch {} this._ws = null; }
      this._handlers = {};
    },
  };

  _clients[namespace] = client;
  return client;
}

export function getBroadcasterToken(code) {
  try { return localStorage.getItem(`imam_token_${code}`) || ""; } catch { return ""; }
}

export function setBroadcasterToken(code, token) {
  try { localStorage.setItem(`imam_token_${code}`, token); } catch {}
}

export function disconnectSocket(namespace) {
  if (_clients[namespace]) {
    _clients[namespace].disconnect();
    delete _clients[namespace];
  }
}

export function disconnectAll() {
  for (const ns of Object.keys(_clients)) disconnectSocket(ns);
}