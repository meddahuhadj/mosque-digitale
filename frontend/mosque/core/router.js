// ── Hash Router ────────────────────────────────────────────────────────
// Simple hash-based SPA router with params and guards.

const routes = [];
let _currentRoute = null;
let _guard = null;

export function addRoute(pattern, handler, meta = {}) {
  // pattern: "/home" or "/prayer/:mosqueId"
  const paramNames = [];
  const regex = pattern.replace(/:([^/]+)/g, (_, name) => {
    paramNames.push(name);
    return "([^/]+)";
  });
  routes.push({ pattern, regex: new RegExp(`^${regex}$`), paramNames, handler, meta });
}

export function setGuard(fn) { _guard = fn; }

export function navigate(path) {
  location.hash = `#${path}`;
}

export function getCurrentRoute() { return _currentRoute; }

function matchRoute(hash) {
  const path = hash.replace(/^#/, "") || "/";
  for (const route of routes) {
    const m = path.match(route.regex);
    if (m) {
      const params = {};
      route.paramNames.forEach((name, i) => { params[name] = m[i + 1]; });
      return { route, params, path };
    }
  }
  return null;
}

async function handleRoute() {
  const hash = location.hash || "#/";
  const match = matchRoute(hash);

  if (!match) {
    document.getElementById("main").innerHTML = `
      <div style="text-align:center; padding:60px 20px;">
        <div style="font-size:3em; margin-bottom:16px;">🕌</div>
        <h2>404 — Page not found</h2>
        <p style="color:var(--muted); margin:12px 0;">This page doesn't exist.</p>
        <a href="#/" class="btn btn-primary">← Home</a>
      </div>`;
    return;
  }

  // Guard check
  if (_guard) {
    const allowed = await _guard(match.route, match.params);
    if (!allowed) return;
  }

  _currentRoute = match;
  await match.route.handler(match.params);
  updateNav(match.path);
}

function updateNav(currentPath) {
  document.querySelectorAll("#main-nav a, #mobile-nav a").forEach(a => {
    const href = a.getAttribute("href")?.replace("#", "") || "";
    a.classList.toggle("active", currentPath.startsWith(href) && href !== "/");
  });
}

export function startRouter() {
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}
