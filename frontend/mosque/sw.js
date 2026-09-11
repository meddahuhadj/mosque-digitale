// ── Service Worker — Mosqué Digital ──────────────────────────────────
const CACHE_NAME = "mosque-os-v2";
const API_CACHE = "mosque-api-v1";
const SHELL = [
  "./",
  "./index.html",
  "./core/app.js",
  "./core/api.js",
  "./core/router.js",
  "./core/i18n.js",
  "./core/theme.js",
  "./core/socket.js",
  "./core/components.js",
  "./lang/fr.json",
  "./lang/en.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) =>
      Promise.all(ks.filter((k) => k !== CACHE_NAME && k !== API_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Network-first with cache fallback for prayer-times and hijri APIs
  if (url.pathname.startsWith("/api/prayer-times") || url.pathname.startsWith("/api/hijri")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(API_CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Never cache other API or WebSocket calls
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/ws")) return;

  // Cache-first for shell assets, network-first for navigation
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          if (res.ok && url.origin === self.location.origin) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
  }
});
