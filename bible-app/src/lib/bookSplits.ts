// A handful of books are big enough on their own that opening any one
// chapter meant downloading the entire book first — Genesis alone is
// ~216KB for 50 chapters, just to show chapter 1. These are the ~15
// books where that was worst (anything whose whole-book file ran past
// roughly 120KB); everything else stays a single file per book, since
// splitting a 4KB book (Philemon, Obadiah, ...) into parts would just
// add file-count overhead for no real benefit.
//
// Values are how many roughly-equal parts each book is divided into —
// 3 for the handful of true outliers (Psalms, Jeremiah, Ezekiel,
// Genesis, Isaiah, all over ~210KB), 2 for the next tier down
// (~135-195KB). Chapters are divided evenly via Math.ceil, so only the
// final part is ever smaller than the rest.
export const SPLIT_BOOKS: Record<string, number> = {
  psa: 3,
  jer: 3,
  eze: 3,
  gen: 3,
  isa: 3,
  num: 2,
  exo: 2,
  deu: 2,
  luk: 2,
  "2ch": 2,
  act: 2,
  mat: 2,
  lev: 2,
  "1sa": 2,
  "1ki": 2,
};

export interface ChapterLocation {
  /** 1-based part number. */
  part: number;
  /** 1-based chapter this part's own file starts at. */
  startChapter: number;
}

// Given a chapter number and the book's total chapter count, works out
// which part file holds it and where that part's own chapter range
// begins — purely arithmetic (no I/O), so this can't itself block or
// fail; an out-of-range chapter just clamps to the nearest valid part
// rather than throwing, consistent with loadChapterVerses' existing
// "return an empty array rather than crash" behavior for a bad chapter
// number.
export function locateChapter(bookId: string, chapter: number, totalChapters: number): ChapterLocation | null {
  const parts = SPLIT_BOOKS[bookId];
  if (!parts) return null;
  const perPart = Math.ceil(totalChapters / parts);
  const part = Math.min(parts, Math.max(1, Math.ceil(chapter / perPart)));
  return { part, startChapter: (part - 1) * perPart + 1 };
}

// Every part file a split book expands into, e.g. "gen" -> ["gen-1",
// "gen-2", "gen-3"] — used by the bulk offline-downloader to list one
// task per part instead of one per book.
export function splitFileStems(bookId: string): string[] {
  const parts = SPLIT_BOOKS[bookId];
  if (!parts) return [bookId];
  return Array.from({ length: parts }, (_, i) => `${bookId}-${i + 1}`);
}
