export interface CrossRef {
  b: string;
  c: number;
  v: number;
  /** Present only for a target range (e.g. Rom.8.32 -> 1Jo.4.9-10). */
  e?: number;
}

type CrossRefFile = Record<string, Record<string, CrossRef[]>>;

const memCache = new Map<string, Promise<CrossRefFile>>();

// Cross-references are verse-address pairs, not translated prose, so one
// dataset serves all 4 translations -- unlike insights/explain/characters
// there's no per-language variant, which keeps this a fraction of their
// size despite covering the whole Bible.
function loadCrossRefFile(bookId: string): Promise<CrossRefFile> {
  let p = memCache.get(bookId);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}crossrefs/${bookId}.json`).then((res) => {
      if (!res.ok) throw new Error(`Failed to load crossrefs-${bookId}: ${res.status}`);
      return res.json() as Promise<CrossRefFile>;
    });
    memCache.set(bookId, p);
    p.catch(() => memCache.delete(bookId));
  }
  return p;
}

// Not every book has cross-references yet (books with no coverage in the
// source dataset have no file at all), and not every verse within a
// covered book has them either -- both quietly resolve to an empty map
// rather than breaking the chapter view.
export async function loadChapterCrossRefs(bookId: string, chapter: number): Promise<Record<string, CrossRef[]>> {
  try {
    const book = await loadCrossRefFile(bookId);
    return book[String(chapter)] ?? {};
  } catch {
    return {};
  }
}
