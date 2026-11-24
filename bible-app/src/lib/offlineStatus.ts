// Ground-truth check of how much of the app's one-time offline download
// has actually landed in Cache Storage — not just "is a service worker
// registered," which can be true long before the content actually finishes
// downloading. Used to show the reader a real "ready to go offline" signal
// instead of leaving them to guess (see the app's Settings screen).
//
// Counts the same named caches lib/bulkOfflineDownload.ts writes into (and
// vite.config.ts's runtime-caching rules also read from), not the workbox
// app-shell precache — content is downloaded separately from the small,
// fast app-shell precache. See TOTAL_CONTENT_FILES in
// bulkOfflineDownload.ts for the expected (fixed-size) total; the real
// total used by the actual download run is reported dynamically from
// there instead, since it also includes however many character bios exist.

const CONTENT_CACHE_NAMES = [
  "bible-text-v11",
  "bible-insights-v6",
  "bible-explain-v4",
  "bible-devotional-v1",
  "bible-characters-v7",
  "bible-book-intro-v2",
  "bible-maps-v5",
  "bible-search-index-v9",
];

export async function getCachedEntryCount(): Promise<number> {
  if (typeof caches === "undefined") return 0;
  let total = 0;
  for (const name of CONTENT_CACHE_NAMES) {
    try {
      const cache = await caches.open(name);
      total += (await cache.keys()).length;
    } catch {
      // ignore
    }
  }
  return total;
}

export function isReadyCount(count: number, total: number): boolean {
  return count >= Math.floor(total * 0.98);
}

// Cache buckets renamed with a -v2 (etc.) suffix when their content changes
// (see vite.config.ts) leave their old-named bucket orphaned — nothing ever
// reads from it again, but the browser won't free that storage on its own.
// Runs once at startup to reclaim it; deleting a cache that doesn't exist is
// a harmless no-op, so this is safe to call unconditionally on every boot.
const RETIRED_CACHE_NAMES = [
  "bible-text",
  "bible-text-v2",
  "bible-text-v3",
  "bible-text-v4",
  "bible-text-v5",
  "bible-text-v6",
  "bible-text-v7",
  "bible-text-v8",
  "bible-text-v9",
  "bible-text-v10",
  "bible-search-index",
  "bible-search-index-v2",
  "bible-search-index-v3",
  "bible-search-index-v4",
  "bible-search-index-v5",
  "bible-search-index-v6",
  "bible-search-index-v7",
  "bible-search-index-v8",
  "bible-explain",
  "bible-explain-v2",
  "bible-explain-v3",
  "bible-insights",
  "bible-insights-v2",
  "bible-insights-v3",
  "bible-insights-v4",
  "bible-insights-v5",
  "bible-characters-v1",
  "bible-characters-v2",
  "bible-characters-v3",
  "bible-characters-v4",
  "bible-characters-v5",
  "bible-characters-v6",
  "bible-maps",
  "bible-maps-v2",
  "bible-maps-v3",
  "bible-maps-v4",
  "bible-book-intro",
];

export async function cleanupLegacyCaches(): Promise<void> {
  if (typeof caches === "undefined") return;
  for (const name of RETIRED_CACHE_NAMES) {
    try {
      await caches.delete(name);
    } catch {
      // ignore
    }
  }
}

// Chrome treats an installed (home-screen) PWA's origin as implicitly
// persistent, but iOS Safari does not -- it keeps Cache Storage for a
// standalone web app "best-effort" by default, evictable under storage
// pressure the same as any other site's data. For a reader whose whole
// point is to have the Bible available offline, losing that cache between
// launches means every cold open on iOS has to re-fetch content from
// scratch over whatever connection is available, which is especially
// painful on cellular. Requesting persistence is the standard way to ask
// the browser not to do that; it's a best-effort request (the browser can
// still say no, and older/non-standard WebKit versions may not implement
// it at all), so this is a strict improvement with no downside, never a
// guarantee.
export async function requestPersistentStorage(): Promise<void> {
  try {
    await navigator.storage?.persist?.();
  } catch {
    // Not supported or refused -- fine, this is best-effort.
  }
}
