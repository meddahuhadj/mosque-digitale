// ── API Client ─────────────────────────────────────────────────────────
// Wraps fetch with JWT auth, auto-refresh, and error handling.

import BACKEND_URL from "./config.js";

const API_BASE = BACKEND_URL;

let _accessToken = localStorage.getItem("accessToken") || "";
let _refreshToken = localStorage.getItem("refreshToken") || "";
let _onAuthChange = null;

export function setAuthChangeCallback(cb) { _onAuthChange = cb; }

export function getAccessToken() { return _accessToken; }
export function isAuthenticated() { return !!_accessToken; }

export function setTokens(access, refresh) {
  _accessToken = access;
  _refreshToken = refresh;
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
  if (_onAuthChange) _onAuthChange(true);
}

export function clearTokens() {
  _accessToken = "";
  _refreshToken = "";
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  if (_onAuthChange) _onAuthChange(false);
}

async function tryRefresh() {
  if (!_refreshToken) return false;
  try {
    const r = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: _refreshToken }),
    });
    if (!r.ok) { clearTokens(); return false; }
    const data = await r.json();
    _accessToken = data.accessToken;
    localStorage.setItem("accessToken", _accessToken);
    return true;
  } catch {
    return false;
  }
}

export async function api(path, options = {}) {
  const { method = "GET", body, headers = {}, auth = true } = options;
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const h = { ...headers };
  if (auth && _accessToken) h["Authorization"] = `Bearer ${_accessToken}`;
  if (body && !(body instanceof FormData)) {
    h["Content-Type"] = "application/json";
  }

  let r = await fetch(url, {
    method,
    headers: h,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh on 401
  if (r.status === 401 && auth && _refreshToken) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      h["Authorization"] = `Bearer ${_accessToken}`;
      r = await fetch(url, { method, headers: h, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
    }
  }

  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(err.error || `HTTP ${r.status}`);
  }

  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json")) return r.json();
  if (ct.includes("image/")) return r.blob();
  return r.text();
}

export { API_BASE };
