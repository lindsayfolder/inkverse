import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { UI, LANGUAGES, type LangKey } from "../data/languages";
import { BOOKS, bookAbbr } from "../data/books";
import { searchScripture, type SearchHit } from "../lib/search";

function refLabel(hit: SearchHit, lang: LangKey): string {
  const book = BOOKS.find((b) => b.id === hit.bookId);
  const code = lang === "en" || lang === "web" ? hit.bookId.slice(0, 3).toUpperCase() : book ? bookAbbr(book, lang) : hit.bookId;
  return `${code} ${hit.chapter}:${hit.verse}`;
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

const RECENT_SEEDS: Record<LangKey, string[]> = {
  en: ["light", "image"],
  web: ["light", "image"],
  "zh-hant": ["光", "形像"],
  "zh-hans": ["光", "形像"],
};

export function SearchModal({
  open,
  onClose,
  onResult,
}: {
  open: boolean;
  onClose: () => void;
  onResult: (lang: LangKey, bookId: string, chapter: number, verse: number) => void;
}) {
  const { lang, setLang, settings, updateSettings } = useApp();
  const t = UI[lang];
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [scope, setScope] = useState<"all" | "ot" | "nt">("all");
  // Single-select rather than independently-toggled chips: only one version
  // is ever searched at a time, and everything on screen (the rail's book
  // abbreviations, recent-search seeds) follows whichever one is lit up here.
  const [activeLang, setActiveLang] = useState<LangKey>(lang);
  // Result-panel copy (loading/no-results) follows the version being
  // searched rather than the app's reading language — showing a Chinese
  // "no results" message while searching KJV read as broken.
  const searchT = UI[activeLang];
  // Real history once the reader has searched in this version; the seed
  // words are only an illustrative placeholder shown before that, so they
  // must not reappear once history has been explicitly cleared to [].
  const recent = settings.recentSearches[activeLang] ?? RECENT_SEEDS[activeLang];
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [loading, setLoading] = useState(false);
  // Distinct from "ran the search and found zero hits": the search index
  // itself only ever gets cached the first time Search is opened while
  // online (see bulkOfflineDownload.ts's comment on why it's included
  // there too) or after that first time. A reader offline before either of
  // those has nothing to search against, and searchScripture's fetch
  // rejects -- without this, that looked identical to "no matches found,"
  // which reads as "your search term isn't in the Bible" rather than the
  // true "this device hasn't got Search's data yet."
  const [indexFailed, setIndexFailed] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  function recordSearch(l: LangKey, q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    const existing = settings.recentSearches[l] ?? [];
    const next = [trimmed, ...existing.filter((s) => s !== trimmed)].slice(0, 8);
    updateSettings({ recentSearches: { ...settings.recentSearches, [l]: next } });
  }

  // Scroll only the results list itself, rather than Element.scrollIntoView
  // (which walks every scroll-container ancestor in the DOM chain, including
  // .app-shell — overflow:hidden still lets it be scrolled programmatically,
  // so scrollIntoView was shoving the whole app up instead of just the list).
  function jumpToBook(bookId: string) {
    const container = bodyRef.current;
    const target = document.getElementById(`search-book-${bookId}`);
    if (!container || !target) return;
    const delta = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTop += delta;
  }

  // Small debounce so every keystroke doesn't trigger a fresh whole-Bible
  // scan across up to 4 versions — the index files are large (a few MB
  // each), and typing is faster than that's worth re-running per character.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const activeLangs = useMemo(() => [activeLang], [activeLang]);
  const bookIds = useMemo(() => {
    if (scope === "all") return null;
    return BOOKS.filter((b) => b.testament === (scope === "ot" ? "OT" : "NT")).map((b) => b.id);
  }, [scope]);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q || activeLangs.length === 0) {
      setHits(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setIndexFailed(false);
    searchScripture(q, activeLangs, bookIds)
      .then((results) => {
        if (!cancelled) {
          setHits(results);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHits([]);
          setIndexFailed(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, activeLangs, bookIds]);

  return (
    <div className={`modal-screen${open ? " open" : ""}`}>
      <div className="modal-head">
        <h2>{t.searchTitle}</h2>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          &#10005;
        </button>
      </div>
      <div className="search-controls">
        <div className="scope-row">
          <button type="button" className={`scope-btn${scope === "all" ? " active" : ""}`} onClick={() => setScope("all")}>
            {t.scopeAll}
          </button>
          <button type="button" className={`scope-btn${scope === "ot" ? " active" : ""}`} onClick={() => setScope("ot")}>
            {t.scopeOT}
          </button>
          <button type="button" className={`scope-btn${scope === "nt" ? " active" : ""}`} onClick={() => setScope("nt")}>
            {t.scopeNT}
          </button>
        </div>
        <div className="lang-chip-row">
          {LANGUAGES.map((l) => (
            <button
              key={l.key}
              type="button"
              className={`lang-chip${activeLang === l.key ? " on" : ""}`}
              onClick={() => setActiveLang(l.key)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="search-input-row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="6" stroke="var(--ink-faint)" strokeWidth="2" />
            <path d="M20 20l-4.5-4.5" stroke="var(--ink-faint)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="modal-content-row">
        <div className="modal-body" ref={bodyRef}>
        {query.trim() ? (
          loading ? (
            <div className="empty-note">{searchT.loadingLabel}</div>
          ) : hits && hits.length ? (
            <div className="results-list">
              {hits.map((hit, i) => {
                const firstOfBook = i === 0 || hits[i - 1].bookId !== hit.bookId;
                return (
                  <button
                    key={i}
                    type="button"
                    id={firstOfBook ? `search-book-${hit.bookId}` : undefined}
                    className="result-item"
                    onClick={() => {
                      recordSearch(hit.lang, debouncedQuery);
                      setLang(hit.lang);
                      onResult(hit.lang, hit.bookId, hit.chapter, hit.verse);
                      onClose();
                    }}
                  >
                    <span className="result-tag">{LANGUAGES.find((l) => l.key === hit.lang)?.label}</span>
                    <span className="result-ref">{refLabel(hit, hit.lang)}</span>
                    <div className="result-snippet">{highlight(hit.text, debouncedQuery)}</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="empty-note">{indexFailed ? searchT.searchUnavailableOffline : searchT.noResults}</div>
          )
        ) : (
          <div>
            <div className="recent-head">
              <span>{t.recentLabel}</span>
              <button
                type="button"
                className="trash-btn"
                onClick={() => updateSettings({ recentSearches: { ...settings.recentSearches, [activeLang]: [] } })}
                aria-label="Clear recent searches"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 13a1 1 0 001 1h6a1 1 0 001-1l1-13"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="recent-list">
              {recent.map((s) => (
                <button key={s} type="button" className="recent-item" onClick={() => setQuery(s)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
                    <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {query.trim() && !loading && hits && hits.length > 0 && (
        <div className="results-rail">
          {Array.from(new Set(hits.map((h) => h.bookId))).map((bookId) => {
            const book = BOOKS.find((b) => b.id === bookId);
            return (
              <button
                key={bookId}
                type="button"
                className="rail-btn"
                onClick={() => jumpToBook(bookId)}
              >
                {book ? bookAbbr(book, activeLang) : bookId}
              </button>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
