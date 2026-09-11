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

  const view = params?.view || params?.mosqueId;

  switch (view) {
    case "mosques": return renderAdminMosques();
    case "users": return renderAdminUsers();
    case "sessions": return renderAdminSessions();
    case "analytics": return renderAdminAnalytics();
    case "settings": return renderAdminSettings();
    case "announcements": return renderAdminAnnouncements();
  }

  // Default: dashboard
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

// ── Mosques ────────────────────────────────────────────────────────────

async function renderAdminMosques() {
  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard", "Retour au tableau de bord")}</a>
      <h2>🕌 ${t("mosques", "Mosquées")}</h2>
    </div>
    <div id="mosques-list"><div class="loading-center"><div class="spinner"></div></div></div>

    <div class="card" style="max-width:500px; margin-top:16px;">
      <h3 class="card-header">➕ ${t("create_mosque", "Nouvelle mosquée")}</h3>
      <div class="form-group">
        <label>${t("name", "Nom")}</label>
        <input type="text" id="mosque-name" placeholder="${t("mosque_name", "Nom de la mosquée")}" />
      </div>
      <div class="form-group">
        <label>${t("city", "Ville")}</label>
        <input type="text" id="mosque-city" placeholder="${t("city_name", "Ville")}" />
      </div>
      <div class="form-group">
        <label>${t("latitude", "Latitude")}</label>
        <input type="number" step="any" id="mosque-lat" placeholder="48.8566" />
      </div>
      <div class="form-group">
        <label>${t("longitude", "Longitude")}</label>
        <input type="number" step="any" id="mosque-lng" placeholder="2.3522" />
      </div>
      <button class="btn btn-primary btn-block" id="create-mosque">${t("create", "Créer")}</button>
    </div>
  `);

  async function loadMosques() {
    const container = document.getElementById("mosques-list");
    try {
      const mosques = await api("/api/mosques");
      if (!mosques.length) {
        container.innerHTML = `<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_mosques", "Aucune mosquée")}</div>`;
        return;
      }
      container.innerHTML = `<div class="card-grid">${mosques.map(m => `
        <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600;">🕌 ${m.name}</div>
            <div style="font-size:0.85em; color:var(--muted);">📍 ${m.city || "—"}</div>
          </div>
          <button class="btn btn-danger btn-sm delete-mosque" data-id="${m.id}">🗑️</button>
        </div>
      `).join("")}</div>`;

      container.querySelectorAll(".delete-mosque").forEach(btn => {
        btn.onclick = async () => {
          if (!confirm(t("confirm_delete", "Supprimer cette mosquée ?"))) return;
          try {
            await api(`/api/mosques/${btn.dataset.id}`, { method: "DELETE" });
            toast(t("deleted", "Supprimé"), "success");
            loadMosques();
          } catch (err) {
            toast(err.message, "error");
          }
        };
      });
    } catch (err) {
      container.innerHTML = `<div class="card" style="color:var(--danger);">${err.message}</div>`;
    }
  }

  loadMosques();

  document.getElementById("create-mosque").onclick = async () => {
    const name = document.getElementById("mosque-name").value.trim();
    const city = document.getElementById("mosque-city").value.trim();
    const latitude = parseFloat(document.getElementById("mosque-lat").value) || null;
    const longitude = parseFloat(document.getElementById("mosque-lng").value) || null;
    if (!name) { toast(t("name_required", "Nom requis"), "error"); return; }
    try {
      await api("/api/mosques", { method: "POST", body: { name, city, latitude, longitude } });
      toast(t("mosque_created", "Mosquée créée"), "success");
      document.getElementById("mosque-name").value = "";
      document.getElementById("mosque-city").value = "";
      document.getElementById("mosque-lat").value = "";
      document.getElementById("mosque-lng").value = "";
      loadMosques();
    } catch (err) {
      toast(err.message, "error");
    }
  };
}

// ── Users ──────────────────────────────────────────────────────────────

async function renderAdminUsers() {
  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard", "Retour au tableau de bord")}</a>
      <h2>👥 ${t("users", "Utilisateurs")}</h2>
    </div>
    <div id="users-list"><div class="loading-center"><div class="spinner"></div></div></div>
  `);

  const container = document.getElementById("users-list");
  try {
    const users = await api("/api/admin/users");
    if (!users.length) {
      container.innerHTML = `<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_users", "Aucun utilisateur")}</div>`;
      return;
    }
    container.innerHTML = `
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="text-align:left; border-bottom:2px solid var(--line);">
              <th style="padding:10px 12px;">${t("name", "Nom")}</th>
              <th style="padding:10px 12px;">${t("email", "Email")}</th>
              <th style="padding:10px 12px;">${t("role", "Rôle")}</th>
              <th style="padding:10px 12px;">${t("created", "Créé le")}</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr style="border-bottom:1px solid var(--line);">
                <td style="padding:10px 12px; font-weight:600;">${u.name || "—"}</td>
                <td style="padding:10px 12px; color:var(--muted);">${u.email || "—"}</td>
                <td style="padding:10px 12px;"><span style="background:var(--bg2); padding:2px 8px; border-radius:6px; font-size:0.85em;">${u.role || "user"}</span></td>
                <td style="padding:10px 12px; color:var(--muted); font-size:0.85em;">${u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="card" style="color:var(--danger);">${err.message}</div>`;
  }
}

// ── Sessions ───────────────────────────────────────────────────────────

async function renderAdminSessions() {
  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard", "Retour au tableau de bord")}</a>
      <h2>🎙️ ${t("sessions", "Sessions")}</h2>
    </div>
    <div id="sessions-list"><div class="loading-center"><div class="spinner"></div></div></div>
  `);

  const container = document.getElementById("sessions-list");
  try {
    const [healthz, stats] = await Promise.all([
      api("/api/healthz").catch(() => null),
      api("/api/admin/stats").catch(() => ({})),
    ]);

    let html = "";

    if (healthz?.sessions) {
      html += `
        <div class="card" style="margin-bottom:16px;">
          <h3 class="card-header">🟢 ${t("active_sessions", "Sessions actives")}</h3>
          ${healthz.sessions.length ? healthz.sessions.map(s => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--line);">
              <div>
                <span style="font-weight:600;">${s.code || "—"}</span>
                <span style="font-size:0.85em; color:var(--muted); margin-left:8px;">${s.status || ""}</span>
              </div>
              <a href="#/imam/${s.code}" class="btn btn-sm btn-secondary">${t("manage", "Gérer")}</a>
            </div>
          `).join("") : `<div style="color:var(--muted); padding:16px 0;">${t("no_active_sessions", "Aucune session active")}</div>`}
        </div>
      `;
    }

    if (stats?.sessions_count !== undefined) {
      html += `
        <div class="card">
          <h3 class="card-header">📊 ${t("session_summary", "Résumé des sessions")}</h3>
          <div style="padding:16px 0; font-size:1.1em;">
            <div style="display:flex; justify-content:space-between; padding:6px 0;">
              <span style="color:var(--muted);">${t("total_sessions", "Sessions totales")}</span>
              <span style="font-weight:600;">${stats.sessions_count}</span>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html || `<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_data", "Aucune donnée disponible")}</div>`;
  } catch (err) {
    container.innerHTML = `<div class="card" style="color:var(--danger);">${err.message}</div>`;
  }
}

// ── Analytics ──────────────────────────────────────────────────────────

async function renderAdminAnalytics() {
  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard", "Retour au tableau de bord")}</a>
      <h2>📊 ${t("analytics", "Statistiques")}</h2>
    </div>
    <div id="analytics-content"><div class="loading-center"><div class="spinner"></div></div></div>
  `);

  const container = document.getElementById("analytics-content");
  try {
    const stats = await api("/api/admin/stats");
    container.innerHTML = `
      <div class="card-grid">
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${stats.users_count ?? 0}</div>
          <div style="color:var(--muted); margin-top:4px;">👥 ${t("users", "Utilisateurs")}</div>
        </div>
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${stats.announcements_count ?? stats.announcements ?? 0}</div>
          <div style="color:var(--muted); margin-top:4px;">📢 ${t("announcements", "Annonces")}</div>
        </div>
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${stats.events_count ?? stats.events ?? 0}</div>
          <div style="color:var(--muted); margin-top:4px;">📅 ${t("events", "Événements")}</div>
        </div>
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${stats.sessions_count ?? stats.sessions ?? 0}</div>
          <div style="color:var(--muted); margin-top:4px;">🎙️ ${t("sessions", "Sessions")}</div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="card" style="color:var(--danger);">${err.message}</div>`;
  }
}

// ── Settings ───────────────────────────────────────────────────────────

async function renderAdminSettings() {
  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard", "Retour au tableau de bord")}</a>
      <h2>⚙️ ${t("settings", "Paramètres")}</h2>
    </div>
    <div class="card" style="max-width:500px;">
      <div class="form-group">
        <label>${t("mosque_name", "Nom de la mosquée")}</label>
        <input type="text" id="cfg-name" placeholder="${t("mosque_name_placeholder", "Al-Fath")}" />
      </div>
      <div class="form-group">
        <label>${t("city", "Ville")}</label>
        <input type="text" id="cfg-city" placeholder="${t("city_name", "Ville")}" />
      </div>
      <div class="form-group">
        <label>${t("prayer_method", "Méthode de prière")}</label>
        <select id="cfg-method">
          <option value="1">${t("method_mwl", "MWL (Muslim World League)")}</option>
          <option value="2">${t("method_islamic_society", "Islamic Society of North America)")}</option>
          <option value="3">${t("method_egypt", "Egyptian General Authority)")}</option>
          <option value="5">${t("method_turkey", "Diyanet (Turquie)")}</option>
          <option value="7">${t("method_jakim", "JAKIM (Malaisie)")}</option>
          <option value="12">${t("method_umm_al_qura", "Umm Al-Qura (Arabie Saoudite)")}</option>
        </select>
      </div>
      <div class="form-group">
        <label>${t("default_language", "Langue par défaut")}</label>
        <select id="cfg-lang">
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="nl">Nederlands</option>
          <option value="ar">العربية</option>
        </select>
      </div>
      <button class="btn btn-primary btn-block" id="save-settings">${t("save", "Enregistrer")}</button>
    </div>
  `);

  try {
    const cfg = await api("/api/admin/config");
    if (cfg) {
      if (cfg.name) document.getElementById("cfg-name").value = cfg.name;
      if (cfg.city) document.getElementById("cfg-city").value = cfg.city;
      if (cfg.prayer_method) document.getElementById("cfg-method").value = cfg.prayer_method;
      if (cfg.default_language) document.getElementById("cfg-lang").value = cfg.default_language;
    }
  } catch {
    // Config not yet set — form stays empty
  }

  document.getElementById("save-settings").onclick = async () => {
    const body = {
      name: document.getElementById("cfg-name").value.trim(),
      city: document.getElementById("cfg-city").value.trim(),
      prayer_method: document.getElementById("cfg-method").value,
      default_language: document.getElementById("cfg-lang").value,
    };
    try {
      await api("/api/admin/config", { method: "PUT", body });
      toast(t("settings_saved", "Paramètres enregistrés"), "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };
}

// ── Announcements ──────────────────────────────────────────────────────

async function renderAdminAnnouncements() {
  renderMain(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard", "Retour au tableau de bord")}</a>
      <h2>📢 ${t("announcements", "Annonces")}</h2>
    </div>

    <div class="card" style="max-width:500px; margin-bottom:16px;">
      <h3 class="card-header">➕ ${t("new_announcement", "Nouvelle annonce")}</h3>
      <div class="form-group">
        <label>${t("title", "Titre")}</label>
        <input type="text" id="ann-title" placeholder="${t("announcement_title", "Titre de l'annonce")}" />
      </div>
      <div class="form-group">
        <label>${t("body", "Contenu")}</label>
        <textarea id="ann-body" rows="4" placeholder="${t("announcement_body", "Texte de l'annonce...")}" style="width:100%; padding:10px; border:1px solid var(--line); border-radius:10px; background:var(--bg2); color:var(--fg);"></textarea>
      </div>
      <div style="display:flex; gap:12px;">
        <div class="form-group" style="flex:1;">
          <label>${t("category", "Catégorie")}</label>
          <select id="ann-category">
            <option value="general">${t("general", "Général")}</option>
            <option value="prayer">${t("prayer", "Prière")}</option>
            <option value="event">${t("event", "Événement")}</option>
            <option value="urgent">${t("urgent", "Urgent")}</option>
          </select>
        </div>
        <div class="form-group" style="flex:1;">
          <label>${t("priority", "Priorité")}</label>
          <select id="ann-priority">
            <option value="low">${t("low", "Basse")}</option>
            <option value="normal" selected>${t("normal", "Normale")}</option>
            <option value="high">${t("high", "Haute")}</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary btn-block" id="create-ann">${t("publish", "Publier")}</button>
    </div>

    <div id="ann-list"><div class="loading-center"><div class="spinner"></div></div></div>
  `);

  let mosqueId = null;

  async function loadAnnouncements() {
    const container = document.getElementById("ann-list");
    try {
      const mosques = await api("/api/mosques");
      mosqueId = mosques?.[0]?.id;
      if (!mosqueId) {
        container.innerHTML = `<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_mosques", "Aucune mosquée configurée")}</div>`;
        return;
      }
      const announcements = await api(`/api/announcements/${mosqueId}`);
      if (!announcements.length) {
        container.innerHTML = `<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_announcements", "Aucune annonce")}</div>`;
        return;
      }
      container.innerHTML = `<div class="card-grid">${announcements.map(a => `
        <div class="card" style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
          <div style="flex:1;">
            <div style="font-weight:600;">${a.title}</div>
            <div style="font-size:0.85em; color:var(--muted); margin-top:4px; white-space:pre-line;">${a.body || ""}</div>
            <div style="margin-top:8px; display:flex; gap:8px; font-size:0.8em;">
              <span style="background:var(--bg2); padding:2px 8px; border-radius:6px;">${a.category || "general"}</span>
              <span style="background:var(--bg2); padding:2px 8px; border-radius:6px;">${a.priority || "normal"}</span>
              ${a.created_at ? `<span style="color:var(--muted);">${new Date(a.created_at).toLocaleDateString("fr-FR")}</span>` : ""}
            </div>
          </div>
          <button class="btn btn-danger btn-sm delete-ann" data-id="${a.id}">🗑️</button>
        </div>
      `).join("")}</div>`;

      container.querySelectorAll(".delete-ann").forEach(btn => {
        btn.onclick = async () => {
          if (!confirm(t("confirm_delete_announcement", "Supprimer cette annonce ?"))) return;
          try {
            await api(`/api/announcements/${mosqueId}/${btn.dataset.id}`, { method: "DELETE" });
            toast(t("deleted", "Supprimé"), "success");
            loadAnnouncements();
          } catch (err) {
            toast(err.message, "error");
          }
        };
      });
    } catch (err) {
      container.innerHTML = `<div class="card" style="color:var(--danger);">${err.message}</div>`;
    }
  }

  loadAnnouncements();

  document.getElementById("create-ann").onclick = async () => {
    if (!mosqueId) { toast(t("no_mosques", "Aucune mosquée configurée"), "error"); return; }
    const title = document.getElementById("ann-title").value.trim();
    const body = document.getElementById("ann-body").value.trim();
    const category = document.getElementById("ann-category").value;
    const priority = document.getElementById("ann-priority").value;
    if (!title) { toast(t("title_required", "Titre requis"), "error"); return; }
    try {
      await api(`/api/announcements/${mosqueId}`, {
        method: "POST",
        body: { title, body, category, priority },
      });
      toast(t("announcement_created", "Annonce publiée"), "success");
      document.getElementById("ann-title").value = "";
      document.getElementById("ann-body").value = "";
      loadAnnouncements();
    } catch (err) {
      toast(err.message, "error");
    }
  };
}
