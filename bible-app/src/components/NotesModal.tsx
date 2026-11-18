import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { UI } from "../data/languages";
import { BOOKS, bookAbbr } from "../data/books";
import type { VerseNote } from "../lib/db";
import { loadChapterVerses } from "../lib/scripture";

function noteKey(n: VerseNote): string {
  return `${n.bookId}/${n.chapter}/${n.verse}`;
}

export function NotesModal({
  open,
  notes,
  onClose,
  onSelect,
  onRemove,
}: {
  open: boolean;
  notes: VerseNote[];
  onClose: () => void;
  onSelect: (bookId: string, chapter: number, verse: number) => void;
  onRemove: (note: VerseNote) => void;
}) {
  const { lang } = useApp();
  const t = UI[lang];
  // Verse text snippets, fetched on demand same as BookmarksModal — kept
  // in whatever version the reader is currently using, not frozen to
  // whatever was active when the note was written.
  const [snippets, setSnippets] = useState<Record<string, string>>({});

  const sorted = [...notes].sort((a, b) => {
    const ai = BOOKS.findIndex((bk) => bk.id === a.bookId);
    const bi = BOOKS.findIndex((bk) => bk.id === b.bookId);
    if (ai !== bi) return ai - bi;
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.verse - b.verse;
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setSnippets({});
    for (const n of notes) {
      loadChapterVerses(n.bookId, n.chapter, lang).then((verses) => {
        if (cancelled) return;
        const verse = verses.find((v) => v.n === n.verse);
        if (verse) setSnippets((prev) => ({ ...prev, [noteKey(n)]: verse.t }));
      });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lang, notes]);

  return (
    <div className={`modal-screen${open ? " open" : ""}`}>
      <div className="modal-head">
        <h2>{t.notesTitle}</h2>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          &#10005;
        </button>
      </div>
      <div className="modal-body">
        {sorted.length === 0 ? (
          <div className="empty-note">{t.notesEmptyLabel}</div>
        ) : (
          sorted.map((n) => {
            const book = BOOKS.find((bk) => bk.id === n.bookId);
            const key = noteKey(n);
            return (
              <div className="bookmark-row" key={key}>
                <button
                  type="button"
                  className="result-item"
                  onClick={() => {
                    onSelect(n.bookId, n.chapter, n.verse);
                    onClose();
                  }}
                >
                  <span className="result-ref">
                    {n.color && <span className={`note-dot ${n.color}`} aria-hidden="true" />}
                    {book ? bookAbbr(book, lang) : n.bookId} {n.chapter}:{n.verse}
                  </span>
                  <div className="result-snippet">{snippets[key] ?? "…"}</div>
                  {n.text && <div className="note-list-text">{n.text}</div>}
                </button>
                <button type="button" className="bookmark-remove-btn" aria-label={t.noteDeleteLabel} onClick={() => onRemove(n)}>
                  &#10005;
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
