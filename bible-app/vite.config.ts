import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves project sites from a /<repo-name>/ subpath, not root.
// Set DEPLOY_BASE=/inkverse/ when building for that target; leave
// unset (defaults to "/") for Vercel/Netlify/Cloudflare Pages or local use,
// where the app is served from the domain root.
const BASE = process.env.DEPLOY_BASE || "/";

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      // "autoUpdate" makes vite-plugin-pwa's client script silently
      // auto-activate and reload on its own schedule, which completely
      // bypasses onNeedRefresh — the manual "Check for updates" / "Update
      // available" flow in lib/appUpdate.ts would never fire. "prompt" is
      // required for that flow: a new service worker installs and waits,
      // onNeedRefresh fires so Settings can show "Update available," and
      // activation only happens when the reader taps "Update now" (see
      // main.tsx / lib/appUpdate.ts).
      registerType: "prompt",
      // Registered manually in main.tsx via virtual:pwa-register.
      injectRegister: false,
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "Inkverse — AI Bible Reader",
        short_name: "Inkverse",
        description: "A comic-styled, AI-assisted Bible reader with English and Chinese versions.",
        theme_color: "#c97a12",
        background_color: "#f1e9d8",
        display: "standalone",
        orientation: "portrait",
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: `${BASE}icons/icon-192.png`, sizes: "192x192", type: "image/png" },
          { src: `${BASE}icons/icon-512.png`, sizes: "512x512", type: "image/png" },
          { src: `${BASE}icons/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Only the small app shell is precached at install time (~300KB) —
        // deliberately, so the service worker installs fast and reliably
        // even on iOS Safari, which doesn't guarantee an install event can
        // run indefinitely in the background. The rest of the library —
        // scripture (66 books x 4 versions), insights and explain (66
        // books x 3 languages each), character bios (every named
        // individual x 3 languages, plus a per-book appearance manifest),
        // book intros, and all 21 maps — is instead downloaded from
        // ordinary page code after the app has booted (see
        // lib/bulkOfflineDownload.ts), in small resumable batches that
        // write into the exact same cache names these runtime-caching
        // rules read from — so a lazy fetch from scripture.ts/insights.ts/
        // maps.ts transparently finds it already cached, same as before.
        // An earlier version tried to precache everything atomically
        // inside the install event and got stuck partway on iOS with no
        // way to resume; this version can pause/resume around backgrounding
        // and retries failed files individually instead of all-or-nothing.
        globPatterns: ["**/*.{js,css,html,woff2,png}"],
        runtimeCaching: [
          {
            urlPattern: /\/bible\/.*\.json$/,
            handler: "CacheFirst",
            options: {
              // Bumped to v2 because the scripture text itself changed (the
              // 他/祂 divine-pronoun pass) — CacheFirst never re-checks the
              // network once a URL is cached, so a reader who'd already
              // opened a book pre-pass would otherwise keep seeing the old
              // wording forever, even after updating the app shell. Renaming
              // the cache bucket is what actually forces a re-fetch; bump
              // the suffix again for any future correction to shipped
              // scripture text.
              // Bumped again to v3: the zh-hans text used the Traditional
              // particle 著 (帶著/接著/照著) throughout instead of the
              // correct Simplified 着 — see scripts/fix-zhuo-particle.py.
              cacheName: "bible-text-v3",
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/insights\/.*\.json$/,
            handler: "CacheFirst",
            options: {
              // Bumped to v2: the zh-hans insights content had the same
              // 著/着 particle bug as bible-text-v3 above.
              cacheName: "bible-insights-v2",
              // 66 books x 3 languages = 198 — maxEntries was also 200,
              // leaving almost no headroom before LRU eviction started
              // dropping already-cached books. Bumped for breathing room.
              expiration: { maxEntries: 260, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/maps\/.*\.svg$/,
            handler: "CacheFirst",
            options: {
              cacheName: "bible-maps",
              // 21 mapped books x 2 files (en + zh) = 42 — maxEntries was
              // 30, under the real count, so the bulk downloader's own
              // storage was silently evicting earlier maps as later ones
              // were cached. Bumped with headroom for more mapped books.
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Per-book intro (background + key points), one small combined
            // file per language — see lib/bookIntro.ts.
            urlPattern: /\/bookintro\/.*\.json$/,
            handler: "CacheFirst",
            options: {
              cacheName: "bible-book-intro",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Whole-Bible search index (lib/search.ts, scripts/build-search-
            // index.mjs) — one compact file per version, fetched lazily the
            // first time Search opens rather than precached, same as the
            // scripture/insights/explain rules below.
            urlPattern: /\/search-index\/.*\.json$/,
            handler: "CacheFirst",
            options: {
              // Bumped to v2 alongside bible-text-v2 above -- the index was
              // rebuilt from the corrected scripture text.
              // Bumped again to v3 alongside bible-text-v3.
              cacheName: "bible-search-index-v3",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Second AI-explanation track (lib/explain.ts), now covering all
            // 66 books in all 3 languages and included in the bulk offline
            // manifest (see lib/bulkOfflineDownload.ts).
            urlPattern: /\/explain\/.*\.json$/,
            handler: "CacheFirst",
            options: {
              // Bumped to v2 -- a couple of Genesis entries had a wording
              // fix (形象 -> 形像) land after some readers had already
              // cached the old text.
              // 66 books x 3 languages = 198 — maxEntries was 200, leaving
              // almost no headroom; bumped alongside bible-insights-v2.
              cacheName: "bible-explain-v2",
              expiration: { maxEntries: 260, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Character bios + per-book appearance manifests
            // (lib/characters.ts), now covering every named individual in
            // every book of the Bible — included in the bulk offline
            // manifest via lib/bulkOfflineDownload.ts's runtime discovery
            // (character ids aren't enumerable from the book list alone,
            // unlike every other track above, so they're read out of each
            // book's own appearance manifest at download time).
            urlPattern: /\/characters\/.*\.json$/,
            handler: "CacheFirst",
            options: {
              // 684 character ids x 3 languages + 66 appearance manifests
              // = 2,118 — maxEntries was 200, so the vast majority of
              // bios were being evicted under LRU almost as soon as they
              // were cached. Bumped with generous headroom for more
              // characters to be added over time.
              //
              // Bumped to v2: bios were written incrementally, book by
              // book, over several days — e.g. David's own bio started as
              // a two-sentence stub (his mention in Ruth's closing
              // genealogy) when Ruth shipped, then was rewritten and
              // expanded repeatedly as 1-2 Samuel, 1 Chronicles, and 1
              // Kings were added. CacheFirst never re-checks the network
              // once a URL is cached, so a reader who opened a character's
              // bio early (while a book covering them was still being
              // built out) would keep seeing that old, incomplete version
              // forever — same class of bug already hit and fixed for
              // bible-text and bible-insights/explain above. Renaming the
              // bucket forces every client to re-fetch fresh.
              cacheName: "bible-characters-v2",
              expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
