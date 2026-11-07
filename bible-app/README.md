# Inkverse — comic-styled AI Bible reader

**Live:** https://lindsayfolder.github.io/inkverse/ — open on any
phone and use "Add to Home Screen" to install it (see below).

A phone-installable Bible reader: the **complete Bible, all 66 books**, in
four public-domain versions (KJV, WEB, 和合本 Traditional, 和合本
Simplified), 5 AI-drawn main points per chapter with tap-to-deep-dive,
on-device text-to-speech, cross-language search, and Previous/Next chapter
navigation.

**Everything works fully offline, with zero setup and no API key:** the
entire Bible — every book, every chapter, every one of the four
versions — plus all 5-point AI Deep Dive insights for all 1,189 chapters,
in English and both Traditional and Simplified Chinese, ships pre-written
and bundled in the app. There's no "Generate" step and nothing to
configure; install it and it all just works, including for someone who
doesn't have an AI account of their own.

## Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL. The whole Bible — scripture and AI insights —
is readable immediately, no configuration needed.

## Build for deployment

```bash
npm run build
```

Output goes to `dist/` — the service worker precaches only the small app
shell (~300 KB) at install time, so the app boots fast and reliably even
on iOS Safari, which doesn't guarantee a service worker's install step can
run indefinitely in the background. The full ~30 MB library (all 66 books
× 4 scripture versions, all 66 books × 3 languages of AI insights, all 21
book maps) downloads separately from ordinary page code right after the
app boots (see `src/lib/bulkOfflineDownload.ts`), in small batches that
skip anything already cached, pause while the tab is hidden, and retry
individual failures — so it survives being backgrounded, interrupted, or
reopened mid-download without losing progress or restarting from zero. A
live "Downloading… X / 504" → "Ready — works with no connection" status is
shown in Settings, with a one-time toast on completion. Once finished, the
app works fully offline, including for a book/chapter/version a reader has
never opened before, not just content they've already visited — that
one-time download is the deliberate tradeoff for an app meant to be
installed once (e.g. on wifi at home) and read anywhere after, with zero
live network dependency ever again.

Future redeploys don't need reinstalling. The app detects a new build in
the background and shows an **"Update available"** button in Settings ("App
updates" section, next to "Offline copy") rather than reloading on its own —
a silent reload could interrupt someone mid-chapter. Tap it to apply the new
version (reloads once). There's also a manual "Check for updates" button
for confirming you're current without waiting for the browser's own
periodic check. See `src/lib/appUpdate.ts`. Deploy `dist/` to any static host with
HTTPS: [Vercel](https://vercel.com),
[Netlify](https://netlify.com), or [Cloudflare
Pages](https://pages.cloudflare.com) all have free tiers that are more than
enough for this.

## Installing it on a phone (yes — your daughter's too)

This is a PWA (Progressive Web App), not an app-store app. Once it's
deployed to any HTTPS URL:

- **iPhone (Safari):** open the URL → tap the Share icon → **Add to Home
  Screen**.
- **Android (Chrome):** open the URL → tap the **⋮** menu → **Install app**
  (or "Add to Home Screen").

Either way it installs a real app icon that launches full-screen (no
browser bar) and needs no App Store, no Apple Developer account, and no
Google Play listing — just the URL. You can install it on as many phones
as you like, including hers, for free. If you later want it listed in the
actual App Store/Play Store, that's a separate step (wrapping it with
something like Capacitor) — not required for personal installs.

## Translation licensing notes

- **KJV** and **World English Bible (WEB)**: public domain, free to bundle
  and distribute without permission.
- **和合本 (Chinese Union Version)**, Traditional & Simplified: public
  domain (published 1919), same as KJV. The Simplified text is derived
  from the Traditional original via OpenCC, the standard tool for this
  conversion (matching how most digital Simplified 和合本 editions are
  produced).
- **NASB** was considered but is **not** public domain — it's copyrighted
  by The Lockman Foundation and requires their written permission for
  full-text use in an app (see their [Permission to Quote
  form](https://www.lockman.org/permission-to-quote-request-form/)).
  Swapping it in later is a small data change, not a rearchitecture — the
  version picker already supports adding a 5th version.

### Source data

The bundled scripture text was assembled from three public-domain datasets
(see each project for their own licensing details):

- KJV: [aruljohn/Bible-kjv](https://github.com/aruljohn/Bible-kjv)
- WEB: [TehShrike/world-english-bible](https://github.com/TehShrike/world-english-bible)
- 和合本 (Traditional): the `zh/cuv` dataset from
  [MaatheusGois/bible](https://github.com/MaatheusGois/bible)

The 5 AI-insight points for every chapter (English and Traditional
Chinese; Simplified Chinese is mechanically derived from Traditional via
OpenCC, same as the scripture text) are original commentary written for
this app, not sourced from any translation.

## Adding text-to-speech voices

Listen uses the device/browser's built-in `speechSynthesis` — free, works
offline, no API calls, no bundled audio. Voice quality and availability
depend on the phone's OS voice packs (iOS and Android both ship English
and Chinese voices by default). See `src/lib/tts.ts`.

## Project structure

```
src/
  data/          book list (all 66), language/UI strings, Genesis 1 seed
                 insights
  lib/           scripture.ts (lazy per-book fetch), insights.ts (lazy
                 per-book AI insights fetch), explain.ts (lazy per-book
                 fetch for the second, summary/themes/application-style AI
                 explanation — see below), maps.ts (lazy per-book map
                 fetch), bulkOfflineDownload.ts (the resumable one-time
                 offline download), offlineStatus.ts (ready/not-ready
                 check for the Settings indicator), appUpdate.ts (manual
                 "check for updates" / "update available" state for
                 Settings), db.ts (font/theme/language settings
                 persistence via localStorage), tts.ts (speech synthesis)
  context/       app-wide state (language, settings, toast, offline status)
  components/    Drawer, ContentsModal, SearchModal, SettingsModal,
                 MapModal, etc.
  App.tsx        screen layout and navigation
public/
  bible/<version>/<bookId>.json     all 66 books × 4 versions
  insights/<lang>/<bookId>.json     all 66 books × 3 languages of AI Deep
                                     Dive insights (trimmed to the first 3
                                     points on screen — see explain/ below)
  explain/<lang>/<bookId>.json      second AI-explanation track, merged
                                     below the 3 trimmed insight points on
                                     the same Insights tab: a summary,
                                     themes, key verses, and a personal
                                     application line. Simplified Chinese
                                     is the source of truth here — real
                                     DeepSeek-generated content (see
                                     scripts/generate_deepseek_explain.py,
                                     run locally since this content
                                     pipeline needs live API access).
                                     Traditional Chinese is mechanically
                                     derived from it via OpenCC (see
                                     scripts/explain-zhhant-convert.py);
                                     English is a faithful translation of
                                     the same Simplified Chinese content,
                                     so all four language tabs say the
                                     same thing. Only a Genesis 1-3 pilot
                                     exists so far — not yet in the bulk
                                     offline download.
  maps/<bookId>[-zh].svg            21 books × English + bilingual Chinese
                                     illustrative maps
scripts/
  gen-icons.mjs        regenerates public/icons/*.png from the SVG mark
  zh-hans-convert.py   derives public/insights/zh-hans from zh-hant via OpenCC
  qa.mjs               Playwright smoke test — Genesis 1 screens
  qa-full-bible.mjs    Playwright smoke test — spot-checks books/chapters
                        across all 66 books and all 4 versions
  qa-contents-zh.mjs   Playwright smoke test — Contents grid in Chinese
```
