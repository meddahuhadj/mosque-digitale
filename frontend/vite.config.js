import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  root: 'mosque',
  base: './',
  publicDir: 'assets',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: 'esbuild',
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, 'mosque/index.html'),
      output: {
        // NB: no `dir` here — an explicit relative `dir` is resolved by Rollup
        // against process.cwd(), not against Vite's `root`, which silently sent
        // the build to <repo>/dist instead of <repo>/frontend/dist (the path
        // backend/main.py actually serves). `build.outDir` above already
        // resolves correctly relative to `root` — let it drive the output dir.
        inlineDynamicImports: true,
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'mosque-bg.jpg'],
      manifest: {
        name: 'Mosqué Digital',
        short_name: 'Mosqué',
        description: 'Plateforme numérique complète pour les mosquées',
        theme_color: '#1a6b4a',
        background_color: '#080e1a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'assets/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'assets/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['lifestyle', 'utilities'],
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,json,png,ico,jpg,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.alquran\.cloud\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-api',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/everyayah\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-audio',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'mosque'),
    },
  },
});