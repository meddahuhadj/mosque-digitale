// ── Support / Donation Module ──────────────────────────────────────────
// Page publique : coordonnées bancaires / PayPal / QR code de la mosquée.

import { api, API_BASE } from "../../core/api.js";
import { t } from "../../core/i18n.js";
import { renderMain, toast } from "../../core/components.js";

export async function renderSupport() {
  renderMain(`
    <div class="card" style="text-align:center; padding:30px;">
      <div style="font-size:3em;">🤲</div>
      <h2 style="margin:12px 0;">${t("donate", "Faire un don")}</h2>
      <p style="color:var(--muted); margin-bottom:20px;">${t("donate_subtitle", "Votre soutien est essentiel pour la vie de la mosquée. Qu'Allah vous récompense.")}</p>
      <div id="donation-content" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);

  let mosqueName = "";
  try {
    const settings = await api("/api/settings/public", { auth: false });
    mosqueName = settings?.name || "";
    const donation = settings?.donation || {};

    const canScan = donation.paypal || donation.iban || donation.text;
    const el = document.getElementById("donation-content");
    el.className = ""; // retire "loading-center" (flex centré, hérité du spinner initial)

    el.innerHTML = `
      ${donation.title ? `<h3 style="color:var(--accent); margin-bottom:12px;">${donation.title}</h3>` : ""}

      ${donation.iban ? `
        <div class="card" style="background:var(--bg2); text-align:left;">
          <div style="font-weight:600; margin-bottom:6px;">🏦 ${t("bank_transfer", "Virement bancaire")}</div>
          <div style="font-family:monospace; font-size:1.05em; word-break:break-all;">${donation.iban}</div>
          ${donation.bankName ? `<div style="color:var(--muted); font-size:0.85em; margin-top:4px;">${donation.bankName}</div>` : ""}
          <button class="btn btn-sm btn-secondary" id="copy-iban" style="margin-top:12px;">📋 ${t("copy", "Copier")}</button>
        </div>
      ` : ""}

      ${donation.paypal ? `
        <a class="btn btn-primary btn-block" style="margin:8px 0;" href="${donation.paypal}" target="_blank" rel="noopener">
          💳 PayPal ${t("donate", "— Faire un don")}
        </a>
      ` : ""}

      ${donation.text ? `
        <div class="card" style="text-align:center;">
          <div style="font-size:0.9em; color:var(--muted); margin-bottom:8px;">${donation.text}</div>
          <button class="btn btn-sm btn-secondary" id="copy-text" style="cursor:pointer;">📋 ${t("copy", "Copier")}</button>
        </div>
      ` : ""}

      ${canScan ? `
        <div style="margin-top:16px;">
          ${donation.paypal || donation.iban ? `
            <img src="${API_BASE}/api/qr.png?text=${encodeURIComponent(donation.paypal || donation.iban)}&size=9"
                 style="width:180px; background:#fff; padding:8px; border-radius:12px;"
                 alt="QR don" />
            <div style="color:var(--muted); font-size:0.85em; margin-top:6px;">${t("donate_qr_hint", "Scannez avec l'appareil photo de votre téléphone")}</div>
          ` : ""}
        </div>
      ` : `
        <p style="color:var(--muted); font-size:0.9em; margin-top:8px;">
          ${t("donate_contact", "Contactez la mosquée pour connaître les moyens de soutien.")}
        </p>
      `}
    `;

    const copyIban = document.getElementById("copy-iban");
    if (copyIban) copyIban.onclick = () => {
      navigator.clipboard?.writeText(donation.iban).then(() => toast(t("copied", "Copié"), "success"));
    };
    const copyText = document.getElementById("copy-text");
    if (copyText) copyText.onclick = () => {
      navigator.clipboard?.writeText(donation.text || "").then(() => toast(t("copied", "Copié"), "success"));
    };
  } catch {
    const el = document.getElementById("donation-content");
    el.className = "";
    el.innerHTML = `<p style="color:var(--muted);">${t("donate_contact", "Contactez la mosquée pour connaître les moyens de soutien.")}</p>`;
  }

  if (mosqueName) {
    const h2 = document.querySelector("#main h2");
    if (h2) h2.textContent += ` — ${mosqueName}`;
  }
}