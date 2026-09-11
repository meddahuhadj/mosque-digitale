import { resolve } from 'path';
import { readFileSync, writeFileSync, existsSync, cpSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = resolve(__dirname, '..', 'dist');
const indexPath = resolve(distDir, 'index.html');
const mosqueDir = resolve(__dirname, 'mosque');

if (!existsSync(indexPath)) {
  console.error('index.html not found in dist at:', indexPath);
  process.exit(1);
}

let html = readFileSync(indexPath, 'utf-8');

// Inline all CSS (link rel="stylesheet")
const cssMatches = html.match(/<link rel="stylesheet" href="([^"]+)">/g);
if (cssMatches) {
  for (const match of cssMatches) {
    const hrefMatch = match.match(/href="([^"]+)"/);
    if (hrefMatch) {
      const cssPath = resolve(distDir, hrefMatch[1]);
      if (existsSync(cssPath)) {
        const css = readFileSync(cssPath, 'utf-8');
        html = html.replace(match, () => `<style>${css}</style>`);
      }
    }
  }
}

// Inline all JS modules (script type="module" ... src="...")
const jsMatches = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g);
if (jsMatches) {
  for (const match of jsMatches) {
    const srcMatch = match.match(/src="([^"]+)"/);
    if (srcMatch) {
      const jsPath = resolve(distDir, srcMatch[1]);
      if (existsSync(jsPath)) {
        const js = readFileSync(jsPath, 'utf-8');
        html = html.replace(match, () => `<script type="module">${js}</script>`);
      }
    }
  }
}

// Remove preload/prefetch/modulepreload links
html = html.replace(/<link rel="(preload|prefetch|modulepreload)"[^>]*>/g, '');

// Fix duplicate manifest link (PWA plugin adds one, we have one in HTML)
const manifestLinks = html.match(/<link rel="manifest"[^>]*>/g);
if (manifestLinks && manifestLinks.length > 1) {
  let first = true;
  html = html.replace(/<link rel="manifest"[^>]*>/g, (match) => {
    if (first) {
      first = false;
      return match;
    }
    return '';
  });
}

// Remove PWA registerSW script (inline it instead)
const regSwMatch = html.match(/<script id="vite-plugin-pwa:register-sw"[^>]*><\/script>/);
if (regSwMatch) {
  const regSwPath = resolve(distDir, 'registerSW.js');
  if (existsSync(regSwPath)) {
    const regSwJs = readFileSync(regSwPath, 'utf-8');
    html = html.replace(regSwMatch[0], () => `<script>${regSwJs}</script>`);
  } else {
    html = html.replace(regSwMatch[0], '');
  }
}

// Remove duplicate HTML that might have been injected
// (look for a second <!DOCTYPE html> appearing AFTER the real document end)
const firstHtmlEnd = html.indexOf('</html>');
const secondDoctype = html.indexOf('<!DOCTYPE html>', 10);
if (secondDoctype > 0 && firstHtmlEnd > 0 && secondDoctype > firstHtmlEnd) {
  html = html.substring(0, secondDoctype);
}

writeFileSync(indexPath, html);
console.log('Inlined CSS and JS into index.html');

// Copy mosque assets
const assetsSrc = resolve(mosqueDir, 'assets');
const assetsDest = resolve(distDir, 'assets');

if (existsSync(assetsSrc)) {
  cpSync(assetsSrc, assetsDest, { recursive: true });
}

const manifestSrc = resolve(mosqueDir, 'manifest.webmanifest');
const manifestDest = resolve(distDir, 'manifest.webmanifest');
if (existsSync(manifestSrc)) {
  cpSync(manifestSrc, manifestDest);
}

const swSrc = resolve(mosqueDir, 'sw.js');
const swDest = resolve(distDir, 'sw.js');
if (existsSync(swSrc)) {
  let swContent = readFileSync(swSrc, 'utf-8');
  swContent = swContent.replace(/const CACHE_VERSION = \d+;/, 'const CACHE_VERSION = 4;');
  writeFileSync(swDest, swContent);
}

console.log('Post-build completed successfully');