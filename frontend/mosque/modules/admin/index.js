// ── Admin Module ───────────────────────────────────────────────────────

import { api, isAuthenticated } from "../../core/api.js";
import { t } from "../../core/i18n.js";
import { renderMain, toast } from "../../core/components.js";
import { navigate } from "../../core/router.js";

export async function renderAdmin(params) {
  if (!isAuthenticated()) {
    renderMain(`
      <div class="card" style="max-width:420px; margin:40px auto; text-align:center;">
        <h2>🧑‍💼 ${t("admin", "Administration")}</h2>
        <p style="color:var(--muted); margin:12px 0;">${t("login_required", "Connexion requise")}</p>
        <a href="#/auth/login" class="btn btn-primary">${t("login", "Se connecter")}</a>
      </div>
    `);
    return;
  }

  const mosqueId = params?.mosqueId;

  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/" class="btn btn-sm btn-secondary">←</a>
      <h2>🧑‍💼 ${t("admin_dashboard", "Tableau de bord")}</h2>
    </div>

    <div class="card-grid">
      <a href="#/admin/mosques" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">🕌</span>
        <div><div style="font-weight:600;">${t("mosques", "Mosquées")}</div><div style="font-size:0.85em; color:var(--muted);">${t("manage_mosques", "Gérer les mosquées")}</div></div>
      </a>

      <a href="#/admin/users" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">👥</span>
        <div><div style="font-weight:600;">${t("users", "Utilisateurs")}</div><div style="font-size:0.85em; color:var(--muted);">${t("manage_users", "Gérer les rôles")}</div></div>
      </a>

      <a href="#/admin/sessions" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">🎙️</span>
        <div><div style="font-weight:600;">${t("sessions", "Sessions")}</div><div style="font-size:0.85em; color:var(--muted);">${t("session_history", "Historique des khutbahs")}</div></div>
      </a>

      <a href="#/admin/analytics" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">📊</span>
        <div><div style="font-weight:600;">${t("analytics", "Statistiques")}</div><div style="font-size:0.85em; color:var(--muted);">${t("view_stats", "Voir les statistiques")}</div></div>
      </a>

      <a href="#/admin/settings" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">⚙️</span>
        <div><div style="font-weight:600;">${t("settings", "Paramètres")}</div><div style="font-size:0.85em; color:var(--muted);">${t("mosque_config", "Configuration de la mosquée")}</div></div>
      </a>

      <a href="#/admin/announcements" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">📢</span>
        <div><div style="font-weight:600;">${t("announcements", "Annonces")}</div><div style="font-size:0.85em; color:var(--muted);">${t("create_announcement", "Créer une annonce")}</div></div>
      </a>
    </div>
  `);
}
