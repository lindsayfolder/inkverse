import { useApp } from "../context/AppContext";
import { UI } from "../data/languages";
import { tts } from "../lib/tts";
import type { ModalKey } from "../App";

export function Drawer({
  open,
  current,
  onClose,
  onNavigate,
}: {
  open: boolean;
  current: ModalKey | "home";
  onClose: () => void;
  onNavigate: (modal: ModalKey | "home") => void;
}) {
  const { lang } = useApp();
  const t = UI[lang];

  function go(modal: ModalKey | "home") {
    tts.stop();
    onNavigate(modal);
    onClose();
  }

  function itemClass(modal: ModalKey | "home") {
    return `drawer-item${current === modal ? " active" : ""}`;
  }

  return (
    <>
      <div className={`scrim${open ? " open" : ""}`} onClick={() => go("home")} />
      <nav className={`drawer${open ? " open" : ""}`}>
        <div className="drawer-brand">Inkverse</div>
        <button type="button" className={itemClass("home")} onClick={() => go("home")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 11L12 4l8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 10v9h12v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{t.drawerHome}</span>
        </button>
        <button type="button" className={itemClass("contents")} onClick={() => go("contents")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{t.drawerContents}</span>
        </button>
        <button type="button" className={itemClass("search")} onClick={() => go("search")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{t.drawerSearch}</span>
        </button>
        <button type="button" className={itemClass("bookmarks")} onClick={() => go("bookmarks")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 4h12v16l-6-4-6 4V4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <span>{t.drawerBookmarks}</span>
        </button>
        <button type="button" className={itemClass("notes")} onClick={() => go("notes")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M13 3l3 3-9 9-4 1 1-4 9-9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{t.drawerNotes}</span>
        </button>
        <button type="button" className={itemClass("plans")} onClick={() => go("plans")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 4h8l6 6v10H5V4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M13 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M8.5 14l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{t.drawerPlans}</span>
        </button>
        <button type="button" className={itemClass("settings")} onClick={() => go("settings")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <path
              d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 00-2.1-1.2L14 3h-4l-.5 2.6a7 7 0 00-2.1 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2.1 1.2L10 21h4l.5-2.6a7 7 0 002.1-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t.drawerSettings}</span>
        </button>
      </nav>
    </>
  );
}
