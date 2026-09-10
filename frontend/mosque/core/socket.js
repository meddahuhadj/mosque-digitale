// ── Socket.IO Client Wrapper ───────────────────────────────────────────

import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
import BACKEND_URL from "./config.js";

const _sockets = {};

export function getSocket(namespace = "/khutbah") {
  if (_sockets[namespace]) return _sockets[namespace];

  const url = BACKEND_URL;

  const socket = io(`${url}${namespace}`, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 12000,
    reconnectionAttempts: Infinity,
    timeout: 10000,
  });

  _sockets[namespace] = socket;
  return socket;
}

export function disconnectSocket(namespace) {
  if (_sockets[namespace]) {
    _sockets[namespace].disconnect();
    delete _sockets[namespace];
  }
}

export function disconnectAll() {
  for (const ns of Object.keys(_sockets)) {
    _sockets[ns].disconnect();
    delete _sockets[ns];
  }
}
