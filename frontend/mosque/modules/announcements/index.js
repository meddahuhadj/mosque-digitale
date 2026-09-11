// ── Announcements Module ───────────────────────────────────────────────

import { api } from "../../core/api.js";
import { t, getLocaleTag } from "../../core/i18n.js";
import { renderMain, toast, ornamentHtml } from "../../core/components.js";

export async function renderAnnouncements(params) {
  const mosqueId = params?.mosqueId;

  renderMain(`
    <div class="card">
      <h2 class="card-header">📢 ${t("announcements", "Annonces")}</h2>
      ${ornamentHtml("۞")}
      <div id="announcements-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);

  let actualMosqueId = mosqueId || null;
  if (!actualMosqueId) {
    try {
      const mosques = await api("/api/mosques", { auth: false });
      actualMosqueId = mosques?.[0]?.id || null;
    } catch { actualMosqueId = null; }
  }

  if (actualMosqueId) {
    try {
      const items = await api(`/api/announcements/${actualMosqueId}`, { auth: false });
      renderAnnouncementList(items);
    } catch (err) {
      const el = document.getElementById("announcements-list");
      el.className = "";
      el.innerHTML = `<p style="color:var(--muted); text-align:center; padding:20px;">${t("no_announcements", "Aucune annonce pour le moment")}</p>`;
    }
  } else {
    const el = document.getElementById("announcements-list");
    el.className = "";
    el.innerHTML = `
      <p style="color:var(--muted); text-align:center; padding:20px;">
        ${t("select_mosque", "Sélectionnez une mosquée pour voir les annonces")}
      </p>
    `;
  }
}

function renderAnnouncementList(items) {
  const el = document.getElementById("announcements-list");
  if (!el) return;
  el.className = ""; // retire "loading-center" (flex centré, hérité du spinner initial)

  if (!items?.length) {
    el.innerHTML = `<p style="color:var(--muted); text-align:center;">${t("no_announcements", "Aucune annonce")}</p>`;
    return;
  }

  // Épinglées et urgentes en tête, puis plus récentes d'abord.
  const rank = (a) => (a.priority === "urgent" ? 2 : 0) + (a.pinned ? 1 : 0);
  const sorted = [...items].sort((a, b) => {
    const r = rank(b) - rank(a);
    if (r !== 0) return r;
    return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
  });

  el.innerHTML = sorted.map(a => `
    <div class="announcement-item ${a.priority === "urgent" ? "urgent" : ""}">
      <div class="title">
        ${a.priority === "urgent" ? "🔴 " : a.pinned ? "📌 " : ""}${a.title}
      </div>
      <div class="body">${a.body}</div>
      <div class="meta">
        ${a.publishedAt ? new Date(a.publishedAt).toLocaleDateString(getLocaleTag()) : ""}
        ${a.category ? ` · ${a.category}` : ""}
      </div>
    </div>
  `).join("");
}
