import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { UI } from "../data/languages";
import { BOOKS } from "../data/books";
import type { BookIntro } from "../data/bookIntro";
import { loadBookIntro } from "../lib/bookIntro";
import { tts } from "../lib/tts";
import { ListenButton } from "./ListenButton";

export function BookIntroModal({
  open,
  bookId,
  onClose,
}: {
  open: boolean;
  bookId: string;
  onClose: () => void;
}) {
  const { lang } = useApp();
  const t = UI[lang];
  const [currentBookId, setCurrentBookId] = useState(bookId);
  const [intro, setIntro] = useState<BookIntro | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  // Resets to the app's current book each time the modal is freshly opened,
  // so browsing to another book's intro and closing doesn't leave the next
  // open landing somewhere unexpected.
  useEffect(() => {
    if (open) setCurrentBookId(bookId);
  }, [open, bookId]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStatus("loading");
    setIntro(null);
    loadBookIntro(currentBookId, lang).then((i) => {
      if (cancelled) return;
      setIntro(i);
      setStatus(i ? "ready" : "missing");
    });
    return () => {
      cancelled = true;
    };
  }, [open, currentBookId, lang]);

  const index = BOOKS.findIndex((b) => b.id === currentBookId);
  const book = BOOKS[index];
  const prevBook = index > 0 ? BOOKS[index - 1] : null;
  const nextBook = index >= 0 && index < BOOKS.length - 1 ? BOOKS[index + 1] : null;

  function goToBook(target: typeof prevBook) {
    if (!target) return;
    tts.stop();
    setCurrentBookId(target.id);
  }

  return (
    <div className={`modal-screen${open ? " open" : ""}`}>
      <div className="modal-head">
        <h2>{book?.label[lang] ?? ""}</h2>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          &#10005;
        </button>
      </div>
      <div className="modal-body">
        {status === "ready" && intro ? (
          <>
            <div className="section-label">
              <span>{t.introBackgroundLabel}</span>
            </div>
            <div className="caption-box">{intro.background}</div>
            <div className="section-label">
              <span>{t.introKeyPointsLabel}</span>
            </div>
            <div className="caption-box callout">{intro.keyPoints}</div>
          </>
        ) : status === "missing" ? (
          <div className="empty-note">{t.introUnavailableLabel}</div>
        ) : (
          <div className="empty-note">{t.loadingLabel}</div>
        )}
      </div>
      <div className="intro-nav-bar">
        <button
          type="button"
          className="toolbar-nav-btn"
          aria-label={t.prevBookLabel}
          disabled={!prevBook}
          onClick={() => goToBook(prevBook)}
        >
          <span aria-hidden="true">&larr;</span>
        </button>
        <ListenButton
          id="book-intro"
          text={intro ? `${intro.background} ${intro.keyPoints}` : ""}
          disabled={status !== "ready" || !intro}
        />
        <button
          type="button"
          className="toolbar-nav-btn"
          aria-label={t.nextBookLabel}
          disabled={!nextBook}
          onClick={() => goToBook(nextBook)}
        >
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
