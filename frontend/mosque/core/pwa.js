// ── PWA install prompt ────────────────────────────────────────────────
// Chrome/Edge/Android fire `beforeinstallprompt`; we must capture it at
// startup (before any UI asks for it) and replay it later on user tap.
// iOS Safari never fires it — there we can only point at "Partager › Sur
// l'écran d'accueil", detected via `navigator.standalone`.

let _deferredPrompt = null;
let _installed = false;

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

export function canPromptInstall() {
  return !!_deferredPrompt && !_installed && !isStandalone();
}

export function canShowIosHint() {
  return isIos() && !_installed && !isStandalone();
}

export function isInstallable() {
  return canPromptInstall() || canShowIosHint();
}

export async function promptInstall() {
  if (!_deferredPrompt) return "unavailable";
  _deferredPrompt.prompt();
  const { outcome } = await _deferredPrompt.userChoice;
  _deferredPrompt = null;
  window.dispatchEvent(new CustomEvent("pwa-installable-changed"));
  return outcome; // "accepted" | "dismissed"
}

export function initPwaInstall() {
  if (isStandalone()) _installed = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    _deferredPrompt = e;
    window.dispatchEvent(new CustomEvent("pwa-installable-changed"));
  });

  window.addEventListener("appinstalled", () => {
    _installed = true;
    _deferredPrompt = null;
    window.dispatchEvent(new CustomEvent("pwa-installable-changed"));
  });
}
