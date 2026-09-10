// ── Ramadan Module ─────────────────────────────────────────────────────

import { t } from "../../core/i18n.js";
import { renderMain } from "../../core/components.js";

export async function renderRamadan(params) {
  const now = new Date();
  // Basic Ramadan display (would need proper Hijri date calculation)
  const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  renderMain(`
    <div class="card" style="text-align:center; padding:30px;">
      <div style="font-size:3em;">🌙</div>
      <h2 style="margin:12px 0;">${t("ramadan", "Ramadan")}</h2>
      <p style="color:var(--muted);">${dateStr}</p>
    </div>

    <div class="card-grid">
      <div class="card">
        <h3 class="card-header">🌅 ${t("imsak", "Imsak")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">--:--</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("pre_dawn", "Avant l'aube")}</div>
      </div>

      <div class="card">
        <h3 class="card-header">🌅 ${t("fajr", "Fajr")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">--:--</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("dawn_prayer", "Prière de l'aube")}</div>
      </div>

      <div class="card">
        <h3 class="card-header">🌇 ${t("maghrib", "Maghrib")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">--:--</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("iftar", "Iftar")}</div>
      </div>

      <div class="card">
        <h3 class="card-header">🌙 ${t("tarawih", "Tarawih")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">--:--</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("night_prayer", "Prière de la nuit")}</div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-header">📖 ${t("juz_of_day", "Juz du jour")}</h3>
      <p style="color:var(--muted);">${t("juz_info", "Consultez le programme de la mosquée pour le calendrier de récitation")}</p>
    </div>
  `);
}
