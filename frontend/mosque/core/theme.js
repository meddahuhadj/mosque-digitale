// ── Theme System ───────────────────────────────────────────────────────

export function getTheme() {
  return localStorage.getItem("theme") || "auto";
}

export function setTheme(theme) {
  if (theme === "auto") {
    localStorage.removeItem("theme");
    document.documentElement.removeAttribute("data-theme");
  } else {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export function toggleTheme() {
  setTheme(isDarkEffective() ? "light" : "dark");
}

export function isDarkEffective() {
  const current = document.documentElement.getAttribute("data-theme");
  return current === "dark" || (!current && matchMedia("(prefers-color-scheme: dark)").matches);
}

export function setHighContrast(on) {
  if (on) {
    localStorage.setItem("contrast", "high");
    document.documentElement.setAttribute("data-contrast", "high");
  } else {
    localStorage.removeItem("contrast");
    document.documentElement.removeAttribute("data-contrast");
  }
}

export function setSeniorMode(on) {
  if (on) {
    localStorage.setItem("senior-mode", "true");
    document.documentElement.setAttribute("data-senior", "true");
  } else {
    localStorage.removeItem("senior-mode");
    document.documentElement.removeAttribute("data-senior");
  }
}

export function initTheme() {
  // Already applied via inline script in <head> to prevent flash
  const theme = localStorage.getItem("theme");
  if (theme) document.documentElement.setAttribute("data-theme", theme);
  const contrast = localStorage.getItem("contrast");
  if (contrast === "high") document.documentElement.setAttribute("data-contrast", "high");
  const senior = localStorage.getItem("senior-mode");
  if (senior === "true") document.documentElement.setAttribute("data-senior", "true");
}
