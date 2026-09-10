// ── Config — Backend URL centralisée ──────────────────────────────────
// La variable BACKEND_URL peut être injectée via un <script> dans index.html
// ou via une variable d'environnement au build time.
// Par défaut : même origine (fonctionne quand backend + frontend sont sur le même domaine).

const BACKEND_URL = window.__CONFIG__?.BACKEND_URL
  || (location.hostname === "localhost" ? "http://localhost:8000" : location.origin);

export default BACKEND_URL;
