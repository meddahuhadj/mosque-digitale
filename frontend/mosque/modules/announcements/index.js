// ── Announcements Module ───────────────────────────────────────────────

import { api } from "../../core/api.js";
import { t } from "../../core/i18n.js";
import { renderMain, toast } from "../../core/components.js";

export async function renderAnnouncements(params) {
  const mosqueId = params?.mosqueId;

  renderMain(`
    <div class="card">
      <h2 class="card-header">📢 ${t("announcements", "Annonces")}</h2>
      <div id="announcements-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);

  if (mosqueId) {
    try {
      const items = await api(`/api/announcements/${mosqueId}`, { auth: false });
      renderAnnouncementList(items);
    } catch (err) {
      document.getElementById("announcements-list").innerHTML =
        `<p style="color:var(--muted); text-align:center; padding:20px;">${t("no_announcements", "Aucune annonce pour le moment")}</p>`;
    }
  } else {
    document.getElementById("announcements-list").innerHTML = `
      <p style="color:var(--muted); text-align:center; padding:20px;">
        ${t("select_mosque", "Sélectionnez une mosquée pour voir les annonces")}
      </p>
    `;
  }
}

function renderAnnouncementList(items) {
  const el = document.getElementById("announcements-list");
  if (!el) return;

  if (!items?.length) {
    el.innerHTML = `<p style="color:var(--muted); text-align:center;">${t("no_announcements", "Aucune annonce")}</p>`;
    return;
  }

  el.innerHTML = items.map(a => `
    <div class="announcement-item ${a.priority === "urgent" ? "urgent" : ""}">
      <div class="title">
        ${a.priority === "urgent" ? "🔴 " : a.pinned ? "📌 " : ""}${a.title}
      </div>
      <div class="body">${a.body}</div>
      <div class="meta">
        ${a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ""}
        ${a.category ? ` · ${a.category}` : ""}
      </div>
    </div>
  `).join("");
}
