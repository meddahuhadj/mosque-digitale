// ── Shared UI Components ───────────────────────────────────────────────

import { t } from "./i18n.js";

// ── Toast ──────────────────────────────────────────────────────────────

export function toast(message, type = "info", duration = 4000) {
  const container = document.getElementById("toast-container");
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 300); }, duration);
}

// ── Modal ──────────────────────────────────────────────────────────────

export function showModal(title, content, onClose) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <span>${title}</span>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">${content}</div>
    </div>`;

  overlay.querySelector(".modal-close").onclick = () => {
    overlay.remove();
    if (onClose) onClose();
  };
  overlay.onclick = (e) => {
    if (e.target === overlay) { overlay.remove(); if (onClose) onClose(); }
  };

  document.body.appendChild(overlay);
  return overlay;
}

// ── Render Helpers ─────────────────────────────────────────────────────

export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === "class") element.className = val;
    else if (key === "style" && typeof val === "object") Object.assign(element.style, val);
    else if (key.startsWith("on")) element.addEventListener(key.slice(2).toLowerCase(), val);
    else if (key === "html") element.innerHTML = val;
    else element.setAttribute(key, val);
  }
  for (const child of children) {
    if (typeof child === "string") element.appendChild(document.createTextNode(child));
    else if (child) element.appendChild(child);
  }
  return element;
}

export function html(strings, ...values) {
  const template = document.createElement("template");
  template.innerHTML = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");
  return template.content;
}

export function renderMain(content) {
  const main = document.getElementById("main");
  if (typeof content === "string") main.innerHTML = content;
  else if (content instanceof HTMLElement) { main.innerHTML = ""; main.appendChild(content); }
  // Retrigger the page-enter transition on every navigation/render.
  main.classList.remove("page-enter");
  void main.offsetWidth;
  main.classList.add("page-enter");
}

// ── Ornamental divider (۞ separator used throughout the app) ────────────

export function ornament(symbol = "۞") {
  const div = document.createElement("div");
  div.className = "ornament";
  div.setAttribute("aria-hidden", "true");
  div.textContent = symbol;
  return div;
}

export function ornamentHtml(symbol = "۞") {
  return `<div class="ornament" aria-hidden="true">${symbol}</div>`;
}
