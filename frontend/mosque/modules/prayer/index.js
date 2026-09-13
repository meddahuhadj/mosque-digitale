// ── Prayer Times Module ────────────────────────────────────────────────

import { api } from "../../core/api.js";
import { t } from "../../core/i18n.js";
import { renderMain, toast, ornamentHtml } from "../../core/components.js";

export async function renderPrayer(params) {
  const mosqueId = params?.mosqueId;

  renderMain(`
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
        <h2 class="card-header" style="margin-bottom:0;">🕌 ${t("prayer_times", "Horaires de prière")}</h2>
        <button class="btn btn-sm btn-gold" id="btn-use-my-position">📍 ${t("use_my_position", "Utiliser ma position exacte")}</button>
      </div>
      <div id="prayer-source-note" style="font-size:.82em; color:var(--muted); margin-bottom:10px;"></div>
      <div id="prayer-mosque-wrap" class="form-group" style="display:none;">
        <label>${t("mosque", "Mosquée")}</label>
        <select id="prayer-mosque"></select>
      </div>
      <div id="prayer-content" class="loading-center"><div class="spinner"></div></div>
    </div>

    <div id="mosque-location"></div>
  `);

  const date = new Date().toISOString().split("T")[0];
  let mosques = [];
  let actualMosqueId = mosqueId;
  let mosque = null;

  try {
    mosques = await api("/api/mosques", { auth: false });
    if (!actualMosqueId) actualMosqueId = mosques?.[0]?.id || null;
    mosque = mosques?.find(m => m.id === actualMosqueId) || mosques?.[0] || null;

    // Sélecteur de mosquée si plusieurs existent
    if (mosques && mosques.length > 1) {
      const wrap = document.getElementById("prayer-mosque-wrap");
      const sel = document.getElementById("prayer-mosque");
      wrap.style.display = "block";
      mosques.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.name;
        opt.selected = m.id === actualMosqueId;
        sel.appendChild(opt);
      });
      sel.onchange = () => { location.hash = `#/prayer/${sel.value}`; };
    }

    await loadForMosque(actualMosqueId, date);
    renderMosqueLocation(mosque);
  } catch (err) {
    renderPrayerTimes(getBrowserPrayerTimes());
  }

  document.getElementById("btn-use-my-position").onclick = () => useMyPosition(actualMosqueId, date);
}

async function loadForMosque(mosqueId, date) {
  let data;
  let saved = null;
  try {
    const raw = localStorage.getItem("userGeo") || localStorage.getItem("prayerSet");
    if (raw) saved = JSON.parse(raw);
  } catch {}

  try {
    if (saved && saved.lat && saved.lng) {
      data = await api(`/api/prayer-times/${mosqueId || "geo"}?date=${date}&lat=${saved.lat}&lng=${saved.lng}`, { auth: false });
      setSourceNote("📍 " + t("times_for_your_position", "Horaires calculés pour votre position exacte") +
        ` (${(+saved.lat).toFixed(3)}, ${(+saved.lng).toFixed(3)})`);
    } else {
      data = mosqueId
        ? await api(`/api/prayer-times/${mosqueId}?date=${date}`, { auth: false })
        : getBrowserPrayerTimes();
      setSourceNote(null);
    }
  } catch {
    data = getBrowserPrayerTimes();
    setSourceNote(null);
  }
  renderPrayerTimes(data);
}

function setSourceNote(text) {
  const el = document.getElementById("prayer-source-note");
  if (el) el.textContent = text || "";
}

// ── « Utiliser ma position exacte » : horaires calculés sur les coordonnées
// GPS réelles de l'utilisateur plutôt que sur celles de la mosquée ──────────

function useMyPosition(mosqueId, date) {
  const btn = document.getElementById("btn-use-my-position");
  btn.disabled = true;
  const originalLabel = btn.textContent;
  btn.textContent = "📡 " + t("locating", "Localisation...");

  const applyGeoData = async (latitude, longitude, sourceLabel = "") => {
    try {
      localStorage.setItem("userGeo", JSON.stringify({ lat: latitude, lng: longitude }));
      const data = await api(
        `/api/prayer-times/${mosqueId || "geo"}?date=${date}&lat=${latitude}&lng=${longitude}`,
        { auth: false }
      );
      renderPrayerTimes(data);
      setSourceNote("📍 " + t("times_for_your_position", "Horaires calculés pour votre position exacte") +
        (sourceLabel ? ` ${sourceLabel}` : "") + ` (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
      toast(t("position_used", "Position exacte utilisée"), "success");
    } catch {
      toast(t("geolocation_unavailable", "Géolocalisation non disponible"), "error");
    } finally {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  };

  if (!navigator.geolocation) {
    tryIPGeo(applyGeoData, () => {
      toast(t("geolocation_unavailable", "Géolocalisation non disponible"), "error");
      btn.disabled = false;
      btn.textContent = originalLabel;
    });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      applyGeoData(pos.coords.latitude, pos.coords.longitude);
    },
    () => {
      tryIPGeo(applyGeoData, () => {
        toast(t("geolocation_unavailable", "Géolocalisation non disponible"), "error");
        btn.disabled = false;
        btn.textContent = originalLabel;
      });
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

function tryIPGeo(onSuccess, onError) {
  fetch("https://ipapi.co/json/")
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then((data) => {
      if (isFinite(+data.latitude) && isFinite(+data.longitude)) {
        const city = data.city ? `(${data.city})` : "";
        onSuccess(+data.latitude, +data.longitude, `[IP ${city}]`);
      } else {
        onError();
      }
    })
    .catch(onError);
}

// ── Localisation de la mosquée : itinéraire + distance (géolocalisation navigateur) ──

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function renderMosqueLocation(mosque) {
  const el = document.getElementById("mosque-location");
  if (!el || !mosque || (mosque.lat == null && !mosque.address)) { if (el) el.innerHTML = ""; return; }

  const mapsUrl = mosque.lat != null && mosque.lng != null
    ? `https://www.google.com/maps/search/?api=1&query=${mosque.lat},${mosque.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mosque.address || mosque.name || "")}`;

  el.innerHTML = `
    <div class="card" style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
      <span class="icon-badge">📍</span>
      <div style="flex:1; min-width:180px;">
        <div style="font-weight:600;">${mosque.name || t("mosque_location", "Localisation de la mosquée")}</div>
        ${mosque.address ? `<div style="font-size:.85em; color:var(--muted);">${mosque.address}</div>` : ""}
        <div id="mosque-distance" style="font-size:.85em; color:var(--accent); margin-top:2px;"></div>
      </div>
      <a class="btn btn-sm btn-secondary" href="${mapsUrl}" target="_blank" rel="noopener">🗺️ ${t("get_directions", "Itinéraire")}</a>
      ${mosque.lat != null ? `<button class="btn btn-sm btn-secondary" id="btn-locate-me">📡 ${t("locate_me", "Me localiser")}</button>` : ""}
    </div>
  `;

  const btn = document.getElementById("btn-locate-me");
  if (btn) btn.onclick = () => {
    if (!navigator.geolocation) { toast(t("geolocation_unavailable", "Géolocalisation non disponible"), "error"); return; }
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const km = haversineKm(pos.coords.latitude, pos.coords.longitude, mosque.lat, mosque.lng);
        const distEl = document.getElementById("mosque-distance");
        if (distEl) distEl.textContent = "📏 " + t("distance_away", "à {km} km de vous").replace("{km}", km < 1 ? km.toFixed(2) : km.toFixed(1));
        btn.disabled = false;
      },
      () => { toast(t("geolocation_unavailable", "Géolocalisation non disponible"), "error"); btn.disabled = false; },
      { timeout: 10000 }
    );
  };
}

function getBrowserPrayerTimes() {
  // Fallback: basic calculation for demo
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  return {
    date,
    fajr: { name: "Fajr", time: "05:30", type: "adhan" },
    sunrise: { name: "Sunrise", time: "07:15", type: "adhan" },
    dhuhr: { name: "Dhuhr", time: "13:00", type: "adhan" },
    asr: { name: "Asr", time: "16:30", type: "adhan" },
    maghrib: { name: "Maghrib", time: "19:45", type: "adhan" },
    isha: { name: "Isha", time: "21:15", type: "adhan" },
  };
}

function renderPrayerTimes(data) {
  const el = document.getElementById("prayer-content");
  if (!el) return;
  el.className = ""; // le HTML initial porte "loading-center" (flex centré) pour le spinner — à retirer une fois le contenu réel injecté

  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { key: "fajr", name: t("fajr", "Fajr"), icon: "🌅" },
    { key: "sunrise", name: t("sunrise", "Sunrise"), icon: "☀️" },
    { key: "dhuhr", name: t("dhuhr", "Dhuhr"), icon: "🌤️" },
    { key: "asr", name: t("asr", "Asr"), icon: "🌇" },
    { key: "maghrib", name: t("maghrib", "Maghrib"), icon: "🌙" },
    { key: "isha", name: t("isha", "Isha"), icon: "🌑" },
  ];

  // Prochaine prière = premier horaire encore à venir aujourd'hui (sinon Fajr demain).
  const withMin = prayers.map(p => {
    const timeData = data[p.key];
    const time = timeData?.time || timeData || "--:--";
    const [h, m] = (typeof time === "string" ? time : "--:--").split(":").map(Number);
    return { ...p, time, min: (Number.isFinite(h) && Number.isFinite(m)) ? h * 60 + m : null };
  });
  let nextKey = null;
  for (const p of withMin) {
    if (p.min !== null && p.min > currentMin) { nextKey = p.key; break; }
  }
  if (!nextKey && withMin.some(p => p.min !== null)) nextKey = withMin.find(p => p.min !== null).key;

  el.innerHTML = `
    <div style="text-align:center; margin-bottom:16px; color:var(--muted);">${data.date || new Date().toISOString().split("T")[0]}</div>
    <div class="prayer-times-grid">
      ${withMin.map(p => {
        const isNext = p.key === nextKey;
        const iqama = data[`${p.key}Iqama`]?.time || data[`${p.key}_iqama`] || null;
        return `
          <div class="prayer-card ${isNext ? "active" : ""}">
            ${isNext ? `<div style="font-size:.68em; color:var(--accent2); font-weight:700; letter-spacing:.05em; margin-bottom:2px;">${t("next_prayer", "Prochaine prière").toUpperCase()}</div>` : ""}
            <div class="name">${p.icon} ${p.name}</div>
            <div class="time">${p.time}</div>
            ${iqama ? `<div class="type">${t("iqama", "Iqama")}: ${iqama}</div>` : ""}
          </div>
        `;
      }).join("")}
    </div>

    ${data.jummahTime ? `
      ${ornamentHtml("۞")}
      <div class="card card-accent" style="text-align:center;">
        <div class="name" style="font-weight:600;">🕌 Jumu'ah</div>
        <div class="time" style="font-size:1.4em; font-weight:700;">${data.jummahTime?.time || data.jummahTime}</div>
      </div>
    ` : ""}
  `;
}
