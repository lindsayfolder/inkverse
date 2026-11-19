import type { LangKey } from "../data/languages";
import type { Verse } from "../data/genesis1";
import { BOOKS } from "../data/books";
import { locateChapter } from "./bookSplits";

interface BookFile {
  id: string;
  chapters: Verse[][];
}

const memCache = new Map<string, Promise<BookFile>>();

// Must match vite.config.ts's bible-text runtime-caching rule's cacheName.
const BIBLE_TEXT_CACHE = "bible-text-v9";

// A cold-launched iOS home-screen app's service worker can take a moment
// to actually take control of the page after boot. Until it does, a plain
// fetch() bypasses the SW's fetch-interception entirely and goes straight
// to the network -- even for a URL that's already sitting in Cache
// Storage from a previous session -- which turns every cold open on iOS
// into a full network round-trip for content that was supposedly already
// offline. Reading Cache Storage directly here sidesteps that: the `caches`
// API itself doesn't require an active SW controller, only the SW's own
// interception of fetch() does. Falls back to network + writes the cache
// itself on a miss, so this doesn't depend on the SW's own runtime-caching
// rule having actually run either.
async function fetchBookFile(fileStem: string, lang: LangKey): Promise<BookFile> {
  const url = `${import.meta.env.BASE_URL}bible/${lang}/${fileStem}.json`;
  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(BIBLE_TEXT_CACHE);
      const cached = await cache.match(url);
      if (cached) return cached.json() as Promise<BookFile>;
    } catch {
      // Cache Storage unavailable or errored -- fall through to network.
    }
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${lang}-${fileStem}: ${res.status}`);
  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(BIBLE_TEXT_CACHE);
      await cache.put(url, res.clone());
    } catch {
      // ignore -- the fetch itself still succeeded.
    }
  }
  return res.json() as Promise<BookFile>;
}

// Bundled per-book (or, for the ~15 largest books, per-part — see
// bookSplits.ts) JSON is fetched lazily — only the part actually being
// read — and kept in memory for the session, so re-opening a chapter
// later doesn't re-download it, but nothing is ever pre-downloaded for
// parts that haven't been opened. Caching per-part rather than per-book
// for a split book is a genuine memory win on top of the download-size
// one: opening Genesis 1 used to hold all 50 chapters (~216KB parsed) in
// memory for the rest of the session just to read one; now it holds only
// the ~17-chapter part that chapter actually lives in.
function loadBookFile(fileStem: string, lang: LangKey): Promise<BookFile> {
  const key = `${lang}-${fileStem}`;
  let p = memCache.get(key);
  if (!p) {
    p = fetchBookFile(fileStem, lang);
    memCache.set(key, p);
    p.catch(() => memCache.delete(key));
  }
  return p;
}

export async function loadChapterVerses(bookId: string, chapter: number, lang: LangKey): Promise<Verse[]> {
  const totalChapters = BOOKS.find((b) => b.id === bookId)?.chapters ?? Infinity;
  const location = locateChapter(bookId, chapter, totalChapters);
  const fileStem = location ? `${bookId}-${location.part}` : bookId;
  const book = await loadBookFile(fileStem, lang);
  const localIndex = location ? chapter - location.startChapter : chapter - 1;
  return book.chapters[localIndex] ?? [];
}
