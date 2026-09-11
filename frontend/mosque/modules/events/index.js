// ── Events Module ──────────────────────────────────────────────────────

import { api } from "../../core/api.js";
import { t, getLocaleTag } from "../../core/i18n.js";
import { renderMain, ornamentHtml } from "../../core/components.js";

const CATEGORY_ICONS = {
  prayer: "🕌", quran: "📖", course: "🎓", ramadan: "🌙",
  conference: "🎤", family: "👨‍👩‍👧", children: "🧒", community: "🤝",
};

function eventDate(ev) {
  if (ev.startTime) return new Date(ev.startTime);
  if (ev.date) return new Date(ev.date + (ev.time ? "T" + ev.time : ""));
  return null;
}

function relativeDayLabel(d) {
  if (!d || isNaN(d)) return "";
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffDays = Math.round((startOfDay(d) - startOfDay(new Date())) / 86400000);
  if (diffDays === 0) return t("today", "Aujourd'hui");
  if (diffDays === 1) return t("tomorrow", "Demain");
  return "";
}

export async function renderEvents(params) {
  const mosqueId = params?.mosqueId;

  renderMain(`
    <div class="card">
      <h2 class="card-header">📅 ${t("events", "Événements")}</h2>
      ${ornamentHtml("۞")}
      <div id="events-list" class="loading-center"><div class="spinner"></div></div>
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
      const items = await api(`/api/events/${actualMosqueId}`, { auth: false });
      renderEventList(items);
    } catch {
      showEmpty();
    }
  } else {
    showEmpty();
  }
}

function showEmpty() {
  const el = document.getElementById("events-list");
  el.className = "";
  el.innerHTML = `
    <p style="color:var(--muted); text-align:center; padding:20px;">
      ${t("no_events", "Aucun événement à venir")}
    </p>`;
}

function renderEventList(items) {
  const el = document.getElementById("events-list");
  if (!el) return;
  el.className = ""; // retire "loading-center" (flex centré, hérité du spinner initial)

  if (!items?.length) { showEmpty(); return; }

  // Prochains événements en premier.
  const sorted = [...items].sort((a, b) => (eventDate(a) || 0) - (eventDate(b) || 0));

  el.innerHTML = sorted.map(ev => {
    const d = eventDate(ev);
    const relLabel = relativeDayLabel(d);
    let when = "";
    if (ev.startTime) {
      when = d.toLocaleDateString(getLocaleTag()) + " " + d.toLocaleTimeString(getLocaleTag(), { hour: "2-digit", minute: "2-digit" });
    } else if (ev.date) {
      when = d.toLocaleDateString(getLocaleTag()) + (ev.time ? " " + t("at", "à") + " " + ev.time : "");
    } else if (ev.time) {
      when = "à " + ev.time;
    }
    return `
    <div class="card card-accent" style="padding:16px; display:flex; gap:16px; align-items:start;">
      ${ev.image ? `<img src="${ev.image}" style="width:80px; height:80px; object-fit:cover; border-radius:12px; flex-shrink:0;" onerror="this.style.display='none'" />` : `<span class="icon-badge" style="font-size:1.6em;">${CATEGORY_ICONS[ev.category] || "📅"}</span>`}
      <div style="flex:1;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <div style="font-weight:600;">${ev.title}</div>
          ${relLabel ? `<span class="badge-live live">${relLabel}</span>` : ""}
        </div>
        ${ev.description ? `<div style="color:var(--muted); margin-top:4px;">${ev.description}</div>` : ""}
        <div style="font-size:0.85em; color:var(--accent); margin-top:8px;">
          📅 ${when}
          ${ev.location ? ` · 📍 ${ev.location}` : ""}
          ${ev.speaker ? ` · 🎤 ${ev.speaker}` : ""}
        </div>
      </div>
    </div>
  `;
  }).join("");
}
