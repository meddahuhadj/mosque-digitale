// ── Config — Backend URL centralisée ──────────────────────────────────
// Résolution, par ordre de priorité :
//  1. window.__CONFIG__.BACKEND_URL — injection runtime via <script> dans index.html
//  2. VITE_BACKEND_URL — variable d'environnement au build time (ex. sur Vercel,
//     quand le frontend statique est déployé séparément d'un backend persistant
//     ailleurs : Render/Railway/Fly/VPS — voir README § 5 Déploiement, Option C).
//  3. Même origine — cas normal quand backend + frontend sont servis ensemble
//     (Docker/Render, cf. Dockerfile + render.yaml).
const BACKEND_URL = window.__CONFIG__?.BACKEND_URL
  || import.meta.env.VITE_BACKEND_URL
  || (location.hostname === "localhost" ? "http://localhost:8000" : location.origin);

export default BACKEND_URL;
