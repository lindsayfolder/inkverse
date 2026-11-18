import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { UI, fmt } from "../data/languages";
import { noteCharLimit, type HighlightColor, type VerseNote } from "../lib/db";

const COLORS: HighlightColor[] = ["yellow", "green", "blue", "pink"];

// Opened by tapping a verse's text (see App.tsx) — a small, focused editor
// for one verse at a time, not a drawer-navigable screen, so it isn't part
// of the ModalKey union the way Settings/Search/etc. are. Reuses the same
// .modal-screen slide-up mechanic as every other modal in this app rather
// than inventing a lighter-weight popover/bottom-sheet component, since
// that mechanic is already proven (safe-area handling, animation,
// keyboard behavior) and this is exactly the kind of thing a fresh
// gesture/animation implementation risks getting subtly wrong.
export function NoteEditorModal({
  open,
  reference,
  verseText,
  existing,
  onSave,
  onDelete,
  onClose,
}: {
  open: boolean;
  reference: string;
  verseText: string;
  existing: VerseNote | undefined;
  onSave: (color: HighlightColor | undefined, text: string) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { lang } = useApp();
  const t = UI[lang];
  const limit = noteCharLimit(lang);

  const [color, setColor] = useState<HighlightColor | undefined>(existing?.color);
  const [text, setText] = useState(existing?.text ?? "");

  // Resets to whatever's actually saved each time the editor opens for a
  // (possibly different) verse, rather than carrying over the previous
  // verse's in-progress edit.
  useEffect(() => {
    if (!open) return;
    setColor(existing?.color);
    setText(existing?.text ?? "");
  }, [open, existing]);

  function save() {
    onSave(color, text.trim());
  }

  const hasExisting = !!existing;

  return (
    <div className={`modal-screen${open ? " open" : ""}`}>
      <div className="modal-head">
        <h2>{t.noteEditorTitle}</h2>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          &#10005;
        </button>
      </div>
      <div className="modal-body">
        <div className="note-verse-ref">{reference}</div>
        <div className="note-verse-snippet">{verseText}</div>

        <div className="section-label">
          <span>{t.noteColorLabel}</span>
        </div>
        <div className="note-color-row">
          <button
            type="button"
            className={`note-color-swatch none${color === undefined ? " active" : ""}`}
            aria-label={t.noteColorNone}
            onClick={() => setColor(undefined)}
          >
            &#10005;
          </button>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`note-color-swatch ${c}${color === c ? " active" : ""}`}
              aria-label={
                c === "yellow" ? t.noteColorYellow : c === "green" ? t.noteColorGreen : c === "blue" ? t.noteColorBlue : t.noteColorPink
              }
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <div className="section-label">
          <span>{t.noteTextPlaceholder}</span>
        </div>
        <textarea
          className="note-textarea"
          value={text}
          maxLength={limit}
          placeholder={t.noteTextPlaceholder}
          onChange={(e) => setText(e.target.value.slice(0, limit))}
        />
        <div className="note-char-count">{fmt(t.noteCharCountTpl, { n: text.length, max: limit })}</div>

        <div className="note-editor-actions">
          {hasExisting && (
            <button type="button" className="note-delete-btn" onClick={onDelete}>
              {t.noteDeleteLabel}
            </button>
          )}
          <button type="button" className="note-save-btn" onClick={save}>
            {t.noteSaveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
