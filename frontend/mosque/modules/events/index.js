// ── Events Module ──────────────────────────────────────────────────────

import { api } from "../../core/api.js";
import { t } from "../../core/i18n.js";
import { renderMain } from "../../core/components.js";

const CATEGORY_ICONS = {
  prayer: "🕌", quran: "📖", course: "🎓", ramadan: "🌙",
  conference: "🎤", family: "👨‍👩‍👧", children: "🧒", community: "🤝",
};

export async function renderEvents(params) {
  const mosqueId = params?.mosqueId;

  renderMain(`
    <div class="card">
      <h2 class="card-header">📅 ${t("events", "Événements")}</h2>
      <div id="events-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);

  if (mosqueId) {
    try {
      const items = await api(`/api/events/${mosqueId}`, { auth: false });
      renderEventList(items);
    } catch {
      showEmpty();
    }
  } else {
    showEmpty();
  }
}

function showEmpty() {
  document.getElementById("events-list").innerHTML = `
    <p style="color:var(--muted); text-align:center; padding:20px;">
      ${t("no_events", "Aucun événement à venir")}
    </p>`;
}

function renderEventList(items) {
  const el = document.getElementById("events-list");
  if (!el) return;

  if (!items?.length) { showEmpty(); return; }

  el.innerHTML = items.map(ev => `
    <div class="card" style="padding:16px; display:flex; gap:16px; align-items:start;">
      <div style="font-size:2em; flex-shrink:0;">${CATEGORY_ICONS[ev.category] || "📅"}</div>
      <div style="flex:1;">
        <div style="font-weight:600;">${ev.title}</div>
        ${ev.description ? `<div style="color:var(--muted); margin-top:4px;">${ev.description}</div>` : ""}
        <div style="font-size:0.85em; color:var(--accent); margin-top:8px;">
          📅 ${new Date(ev.startTime).toLocaleDateString()} ${new Date(ev.startTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          ${ev.location ? ` · 📍 ${ev.location}` : ""}
          ${ev.speaker ? ` · 🎤 ${ev.speaker}` : ""}
        </div>
      </div>
    </div>
  `).join("");
}
