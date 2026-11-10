import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { UI, fmt } from "../data/languages";
import { BOOKS, bookAbbr, type BookMeta } from "../data/books";
import { loadChapterVerses } from "../lib/scripture";

const COLUMNS = 4;

function chunk(items: BookMeta[], size: number): BookMeta[][] {
  const rows: BookMeta[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}
const ROWS = chunk(BOOKS, COLUMNS);

export function ContentsModal({
  open,
  onClose,
  onSelectChapter,
}: {
  open: boolean;
  onClose: () => void;
  onSelectChapter: (bookId: string, chapter: number, verse?: number) => void;
}) {
  const { lang } = useApp();
  const t = UI[lang];
  const [step, setStep] = useState<"books" | "chapters" | "verses">("books");
  const [selectedBookId, setSelectedBookId] = useState("gen");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verseCount, setVerseCount] = useState<number | null>(null);
  const selectedBook = BOOKS.find((b) => b.id === selectedBookId) ?? BOOKS[0];
  const chapters = Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);
  const verseNums = verseCount ? Array.from({ length: verseCount }, (_, i) => i + 1) : [];

  // Each screen (book grid, chapter grid, verse grid) stays small on its own,
  // so it can't trigger the WebKit paint bug that showed up when several
  // lived together in one long scrolling list. Reset to the book list every
  // time the modal reopens.
  useEffect(() => {
    if (open) setStep("books");
  }, [open]);

  function openBook(bookId: string) {
    setSelectedBookId(bookId);
    setStep("chapters");
  }

  function openChapter(c: number) {
    setSelectedChapter(c);
    setStep("verses");
    setVerseCount(null);
    loadChapterVerses(selectedBookId, c, lang).then((verses) => setVerseCount(verses.length));
  }

  function pick(verse?: number) {
    onSelectChapter(selectedBookId, selectedChapter, verse);
    onClose();
  }

  return (
    <div className={`modal-screen${open ? " open" : ""}`}>
      <div className="modal-head plain-title">
        <h2>{t.contentsTitle}</h2>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          &#10005;
        </button>
      </div>

      {step === "books" ? (
        <>
          <div className="book-strip">
            {BOOKS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`book-chip ${b.testament === "OT" ? "ot" : "nt"}`}
                onClick={() => openBook(b.id)}
              >
                {bookAbbr(b, lang)}
              </button>
            ))}
          </div>

          <div className="modal-body">
            <div className="contents-hint">{t.contentsHint}</div>
            <div className="book-rows">
              {ROWS.map((rowBooks, rowIndex) => (
                <div className="book-row" key={rowIndex}>
                  {rowBooks.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className={`book-cell ${b.testament === "OT" ? "ot" : "nt"}${
                        lang === "zh-hant" || lang === "zh-hans" ? " zh" : ""
                      }`}
                      onClick={() => openBook(b.id)}
                    >
                      <span className="glyph">{bookAbbr(b, lang)}</span>
                      <span className="code">{b.id.slice(0, 3).toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : step === "chapters" ? (
        <div className="modal-body">
          <button type="button" className="back-tab" onClick={() => setStep("books")}>
            <span aria-hidden="true">&larr;</span> {t.contentsTitle}
          </button>
          <div className="chapter-head">
            <div className="chapter-title">{selectedBook.label[lang]}</div>
          </div>
          <div className="chapter-grid">
            {chapters.map((c) => (
              <button key={c} type="button" className="chapter-cell" onClick={() => openChapter(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="modal-body">
          <button type="button" className="back-tab" onClick={() => setStep("chapters")}>
            <span aria-hidden="true">&larr;</span> {selectedBook.label[lang]}
          </button>
          <div className="chapter-head">
            <div className="chapter-title">{fmt(t.chapterEyebrow, { book: selectedBook.label[lang], c: selectedChapter })}</div>
          </div>
          <button type="button" className="goto-chapter-btn" onClick={() => pick()}>
            {fmt(t.goToChapterTpl, { c: selectedChapter })}
          </button>
          {verseCount === null ? (
            <div className="empty-note">{t.loadingLabel}</div>
          ) : (
            <div className="chapter-grid">
              {verseNums.map((v) => (
                <button key={v} type="button" className="chapter-cell verse-cell" onClick={() => pick(v)}>
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
