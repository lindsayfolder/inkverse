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
              // Bumped again to v4: the ~15 largest books (Genesis, Psalms,
              // ...) were split into 2-3 part files each (see
              // lib/bookSplits.ts) so opening one chapter no longer
              // downloads the whole book — the URL set changed, so the old
              // whole-book files need to be dropped, not just added to.
              // maxEntries raised to match: 51 unsplit books + 35 part
              // files across the ~15 split ones = 86 files/version x 4
              // versions = 344, with headroom.
              // Bumped again to v5: the Chinese text used the archaic 1919
              // transliteration 利巴嫩 for "Lebanon" throughout, instead of
              // 黎巴嫩 (the modern standard spelling every current CUV
              // reprint and mainstream Bible app uses) -- see
              // scripts/fix-lebanon-spelling.py.
              // Bumped again to v6: three more archaic place-name spellings
              // (Spain, Damascus, Crete, Cyprus) fixed the same way -- see
              // scripts/fix-archaic-placenames.py.
              // Bumped again to v7: 该撒/該撒 (Caesar) -> 凯撒/凱撒, same
              // way again.
              // Bumped again to v8: v6's Damascus fix only had the
              // Simplified pair (大马色 -> 大马士革) -- missed every
              // Traditional Chinese file (大馬色, with the traditional 馬
              // character) entirely. A reader's screenshot in 繁體 mode
              // caught it.
              // Bumped again to v9: zh-hans used 义大利 for "Italy" -- a
              // naive character-by-character simplification of Taiwan's
              // 義大利, not the actual Mainland standard term, which is an
              // entirely different word, 意大利. A different category of
              // bug from the others above (wrong word, not an old word) --
              // see scripts/fix-italy-spelling.py.
              cacheName: "bible-text-v9",
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/insights\/.*\.json$/,
            handler: "CacheFirst",
            options: {
              // Bumped to v2: the zh-hans insights content had the same
              // 著/着 particle bug as bible-text-v3 above.
              // Bumped again to v3: a few insights entries used the archaic
              // 大马色/居比路 place-name spellings -- see
              // scripts/fix-archaic-placenames.py.
              // Bumped again to v4: 该撒/該撒 (Caesar) fixed the same way,
              // plus one insights file (1ki) using 泰尔/泰爾 for Tyre
              // instead of the app's own 推罗/推羅 convention -- see
              // scripts/fix-tyre-stragglers.py.
              // Bumped again to v5 alongside bible-text-v8 (the missed
              // Traditional-Chinese Damascus fix).
              cacheName: "bible-insights-v5",
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
              // Bumped to v2: the 1 Kings map's artwork changed (Tyre and
              // the cedar-timber route added) — CacheFirst never re-checks
              // the network once a URL is cached, so a reader who'd already
              // opened that map would otherwise keep seeing the old version
              // forever. Renaming the bucket forces every client to re-fetch.
              // Bumped again to v3: the Acts map's Chinese label used the
              // archaic 居比路 spelling for Cyprus -- see
              // scripts/fix-archaic-placenames.py.
              // Bumped again to v4: the same map's simplified-Chinese Italy
              // label used 义大利 instead of the real Mainland standard
              // 意大利 -- see scripts/fix-italy-spelling.py.
              cacheName: "bible-maps-v4",
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
              // Bumped to v2 during the archaic-place-name audit (see
              // scripts/fix-archaic-placenames.py) on the assumption these
              // intros needed the same fix as the other content tracks --
              // double-checked afterward and they never actually contained
              // any of the affected spellings, so this bump turned out to
              // be unneeded. Left as v2 rather than reverted, since
              // reverting now would just be a second unnecessary bump.
              cacheName: "bible-book-intro-v2",
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
              // Bumped again to v4 alongside bible-text-v5 (利巴嫩 ->
              // 黎巴嫩 fix) -- the index is built from the scripture text.
              // Bumped again to v5 alongside bible-text-v6.
              // Bumped again to v6 alongside bible-text-v7.
              // Bumped again to v7 alongside bible-text-v8.
              // Bumped again to v8 alongside bible-text-v9.
              cacheName: "bible-search-index-v8",
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
              // Bumped again to v3 alongside bible-insights-v3.
              cacheName: "bible-explain-v4",
              expiration: { maxEntries: 260, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Devotional tab (lib/devotional.ts) — only Genesis is populated
            // so far (see scripts/.devo-batch for the generation batches),
            // more books to follow. maxEntries sized for the eventual full
            // 66 books x 3 languages, same headroom pattern as bible-explain.
            urlPattern: /\/devotional\/.*\.json$/,
            handler: "CacheFirst",
            options: {
              cacheName: "bible-devotional-v1",
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
              //
              // Bumped to v3: Solomon's and Adoram's bios used the archaic
              // 利巴嫩 spelling for Lebanon -- see scripts/fix-lebanon-spelling.py.
              //
              // Bumped to v4: many more bios had a mix of archaic/modern
              // spellings for the same place (e.g. some used 大马色, others
              // 大马士革, for Damascus) -- see scripts/fix-archaic-placenames.py.
              //
              // Bumped to v5: 该撒/該撒 (Caesar) fixed the same way.
              //
              // Bumped to v6: v4's Damascus fix missed every Traditional
              // Chinese bio (大馬色, the traditional 馬 character) -- see
              // bible-text-v8's note above.
              //
              // Bumped to v7: Julius's bio used 意大利 for "Italy" while
              // every other zh-hant file in this app uses 義大利 -- see
              // scripts/fix-italy-spelling.py.
              cacheName: "bible-characters-v7",
              expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
