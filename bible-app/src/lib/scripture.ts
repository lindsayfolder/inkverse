import type { LangKey } from "../data/languages";
import type { Verse } from "../data/genesis1";
import { BOOKS } from "../data/books";
import { locateChapter } from "./bookSplits";

interface BookFile {
  id: string;
  chapters: Verse[][];
}

const memCache = new Map<string, Promise<BookFile>>();

// Bundled per-book (or, for the ~15 largest books, per-part — see
// bookSplits.ts) JSON is fetched lazily — only the part actually being
// read — and kept in memory for the session. The service worker's
// runtime-caching rule (see vite.config.ts) persists it to disk after
// that, so re-opening a chapter later doesn't re-download it, but
// nothing is ever pre-downloaded for parts that haven't been opened.
// Caching per-part rather than per-book for a split book is a genuine
// memory win on top of the download-size one: opening Genesis 1 used to
// hold all 50 chapters (~216KB parsed) in memory for the rest of the
// session just to read one; now it holds only the ~17-chapter part that
// chapter actually lives in.
function loadBookFile(fileStem: string, lang: LangKey): Promise<BookFile> {
  const key = `${lang}-${fileStem}`;
  let p = memCache.get(key);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}bible/${lang}/${fileStem}.json`).then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${key}: ${res.status}`);
      return res.json() as Promise<BookFile>;
    });
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
