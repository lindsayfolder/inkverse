import type { LangKey } from "../data/languages";
import type { ChapterDevotional } from "../data/devotional";

interface DevotionalFile {
  id: string;
  chapters: (ChapterDevotional | null)[];
}

const memCache = new Map<string, Promise<DevotionalFile>>();

// KJV and WEB share the same devotional text, same reasoning as
// lib/insights.ts and lib/explain.ts: it's a reflection on the passage's
// meaning, not a rendering of either translation's specific wording.
function devotionalLang(lang: LangKey): "en" | "zh-hant" | "zh-hans" {
  return lang === "web" ? "en" : lang;
}

function loadDevotionalFile(bookId: string, lang: LangKey): Promise<DevotionalFile> {
  const dlang = devotionalLang(lang);
  const key = `${dlang}-${bookId}`;
  let p = memCache.get(key);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}devotional/${dlang}/${bookId}.json`).then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${key}: ${res.status}`);
      return res.json() as Promise<DevotionalFile>;
    });
    memCache.set(key, p);
    p.catch(() => memCache.delete(key));
  }
  return p;
}

// Not every chapter (or book) is covered yet — this is a new, small sample
// set while the devotional feature itself is still being reviewed — so this
// resolves to null rather than throwing, same as loadChapterExplain.
export async function loadChapterDevotional(bookId: string, chapter: number, lang: LangKey): Promise<ChapterDevotional | null> {
  try {
    const book = await loadDevotionalFile(bookId, lang);
    return book.chapters[chapter - 1] ?? null;
  } catch {
    return null;
  }
}
