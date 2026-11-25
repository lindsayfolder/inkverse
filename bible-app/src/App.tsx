import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useApp } from "./context/AppContext";
import { UI, LANGUAGES, fmt, type LangKey } from "./data/languages";
import { GENESIS_1, type Verse, type Point } from "./data/genesis1";
import type { ChapterExplain } from "./data/explain";
import type { ChapterDevotional } from "./data/devotional";
import { BOOKS } from "./data/books";
import { ChapterPlayerButton, type ChapterPlayerState } from "./components/ChapterPlayerButton";
import { Toast } from "./components/Toast";
import { loadChapterVerses } from "./lib/scripture";
import { loadChapterPoints } from "./lib/insights";
import { loadChapterExplain } from "./lib/explain";
import { loadChapterDevotional } from "./lib/devotional";
import { loadChapterCharacters, type CharacterBio } from "./lib/characters";
import { loadChapterCrossRefs, type CrossRef } from "./lib/crossrefs";
import { renderBioHtml, stripBioMarkdown } from "./lib/bioMarkdown";
import { bookHasMap } from "./lib/maps";
import { stripHtml, tts } from "./lib/tts";
import type { Bookmark, HighlightColor, VerseNote } from "./lib/db";
import { markDayComplete, startOrRestartPlan } from "./lib/readingPlans";
import { shareVerse, shareVerses, formatVerseRange } from "./lib/share";
import { isJesusWords } from "./data/jesusWords";

// Lazy-loaded rather than imported statically: none of these render
// anything visible until the reader actually opens them (drawer, Contents,
// Search, Settings, a book's map, a book's intro), so their code has no
// reason to be part of the one bundle that has to be fully fetched and
// parsed before the scripture view itself can render — on a real phone
// that parse time is the dominant cost of opening the app at all. Each
// resolves from its own small separate chunk, which the browser fetches
// in parallel with (not blocking) the initial paint.
const Drawer = lazy(() => import("./components/Drawer").then((m) => ({ default: m.Drawer })));
const ContentsModal = lazy(() => import("./components/ContentsModal").then((m) => ({ default: m.ContentsModal })));
const SearchModal = lazy(() => import("./components/SearchModal").then((m) => ({ default: m.SearchModal })));
const BookmarksModal = lazy(() => import("./components/BookmarksModal").then((m) => ({ default: m.BookmarksModal })));
const NotesModal = lazy(() => import("./components/NotesModal").then((m) => ({ default: m.NotesModal })));
const NoteEditorModal = lazy(() => import("./components/NoteEditorModal").then((m) => ({ default: m.NoteEditorModal })));
const PlansModal = lazy(() => import("./components/PlansModal").then((m) => ({ default: m.PlansModal })));
const SettingsModal = lazy(() => import("./components/SettingsModal").then((m) => ({ default: m.SettingsModal })));
const MapModal = lazy(() => import("./components/MapModal").then((m) => ({ default: m.MapModal })));
const BookIntroModal = lazy(() => import("./components/BookIntroModal").then((m) => ({ default: m.BookIntroModal })));
const CreditsModal = lazy(() => import("./components/CreditsModal").then((m) => ({ default: m.CreditsModal })));

export type ModalKey = "contents" | "search" | "bookmarks" | "plans" | "notes" | "settings";

// Genealogy-heavy chapters (Genesis 10, 36, 46...) can list dozens of
// people; showing them all before verse 1 would bury the actual text. Cap
// the row and let a "+N more" toggle reveal the rest in place instead.
const PEOPLE_ROW_CAP = 6;

export default function App() {
  const { lang, setLang, settings, updateSettings, ready, markContentReady, toast } = useApp();
  const t = UI[lang];

  const [bookId, setBookId] = useState("gen");
  const [chapter, setChapter] = useState(1);
  const [tab, setTab] = useState<"scripture" | "insights" | "devotional">("scripture");
  const [openPointIndex, setOpenPointIndex] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState<ModalKey | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  // Which verse (if any) has the highlight/note editor open — a per-verse
  // contextual editor like map/bookIntro above, not a drawer-navigable
  // ModalKey screen, since it's always tied to one specific verse number
  // rather than being a standalone destination.
  const [noteEditorVerse, setNoteEditorVerse] = useState<number | null>(null);
  // Which of the lazy-loaded drawer/modals have ever been opened — each
  // only mounts (and so only fetches its own chunk) the first time it's
  // actually needed, then stays mounted so closing/reopening it is instant
  // and its close transition can still play. Rendering all of them
  // unconditionally from the first paint (even hidden behind `open={false}`)
  // would make React resolve every one of their lazy() imports immediately,
  // which is exactly backwards: it was each one competing for bandwidth
  // with the reader's actual chapter load, on a slow connection, that
  // lazy-loading them was meant to avoid in the first place.
  const everOpenedRef = useRef(new Set<string>());
  if (drawerOpen) everOpenedRef.current.add("drawer");
  if (modal) everOpenedRef.current.add(modal);
  if (mapOpen) everOpenedRef.current.add("map");
  if (introOpen) everOpenedRef.current.add("bookIntro");
  if (creditsOpen) everOpenedRef.current.add("credits");
  if (noteEditorVerse !== null) everOpenedRef.current.add("noteEditor");
  const everOpened = everOpenedRef.current;
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [compareLang, setCompareLang] = useState<LangKey | null>(null);
  const [compareVerses, setCompareVerses] = useState<Verse[] | null>(null);
  const [comparePickerOpen, setComparePickerOpen] = useState(false);
  const [points, setPoints] = useState<Point[] | null>(null);
  const [explain, setExplain] = useState<ChapterExplain | null>(null);
  const [devotional, setDevotional] = useState<ChapterDevotional | null>(null);
  const [chapterCharacters, setChapterCharacters] = useState<CharacterBio[]>([]);
  const [chapterCrossRefs, setChapterCrossRefs] = useState<Record<string, CrossRef[]>>({});
  const [returnTo, setReturnTo] = useState<{ bookId: string; chapter: number; verse: number } | null>(null);
  const [openCharacterId, setOpenCharacterId] = useState<string | null>(null);
  const [peopleExpanded, setPeopleExpanded] = useState(false);
  // Which verse (if any) has a share in flight — just enough state to
  // disable that one button for the duration, so a second tap while the
  // OS share sheet is opening can't fire an overlapping share() call.
  const [sharingVerse, setSharingVerse] = useState<number | null>(null);
  // Multi-verse selection: off by default, toggled on from a button near
  // the chapter header. While on, each verse row's share icon toggles
  // that verse into/out of selectedVerses instead of sharing it
  // immediately — plain button taps throughout, no drag/touch-tracking,
  // so there's no custom gesture code to get stuck mid-touch the way a
  // press-and-drag range picker could.
  const [selectMode, setSelectMode] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [sharingSelection, setSharingSelection] = useState(false);
  // "Listen" reading more than one chapter: idle -> playing (speaking,
  // advances to the next chapter and keeps going when one finishes on its
  // own) -> paused (tap to resume) -> back to playing, or idle again on
  // any manual navigation/interruption elsewhere in the app. playToken is
  // bumped to request a fresh tts.speak() call (initial start, or after an
  // auto-advance once the new chapter's verses have loaded); spokenTokenRef
  // makes sure each bump only ever triggers speak() once, so a pause/resume
  // cycle (which also touches chapterPlayerState) can't accidentally
  // restart the chapter from the beginning.
  const [chapterPlayerState, setChapterPlayerState] = useState<ChapterPlayerState>("idle");
  const [playToken, setPlayToken] = useState(0);
  const spokenTokenRef = useRef(-1);
  // Which bookId/chapter the current `verses` state actually holds, set
  // alongside setVerses() in the loader effect below. Advancing to the
  // next chapter bumps playToken and sets bookId/chapter in the same
  // batch, but that's a *separate* effect from the one that nulls out and
  // reloads `verses` — on the very next render, bookId/chapter are already
  // new while `verses` is still the old chapter's data (not yet nulled;
  // effects run after the render, not during it), and the driving effect
  // below would otherwise speak that stale array under the new chapter's
  // label. Comparing against this ref is what actually waits for the real
  // reload instead of just checking `verses` isn't null.
  const versesKeyRef = useRef<string | null>(null);
  // Read inside the natural-end settling delay (below) to check the
  // player is still "playing" once that timeout actually fires — a plain
  // closure over chapterPlayerState would see the stale value from
  // whichever render scheduled the timeout, not a manual pause/stop that
  // happened during the wait.
  const chapterPlayerStateRef = useRef(chapterPlayerState);
  chapterPlayerStateRef.current = chapterPlayerState;
  // Holds a deferred "advance to the next chapter" action when the reader
  // pauses during the brief settling gap between chapters (see the driving
  // effect below) — at that exact moment nothing is actually playing, so
  // pause/resume have nothing live to act on, and without this the pending
  // advance was simply dropped, leaving the button showing "playing" with
  // nothing queued until the reader navigated away manually. Cleared by
  // resetPlayers() alongside every interrupt below so a resume long
  // after an abandoned/interrupted gap can never fire a stale advance.
  const pendingAdvanceRef = useRef<(() => void) | null>(null);
  // Generic "listen to this page" player for Insights content (a highlight
  // detail, a character bio, or the list view's Further Insight block) —
  // the same toolbar play/pause slot as the chapter player above, but
  // simpler: one block of text, no auto-advance. Which content it drives
  // is derived from the current view in `pageContent` below.
  const [pagePlayerState, setPagePlayerState] = useState<ChapterPlayerState>("idle");
  // Which verse (by number, matching each row's data-verse) the chapter
  // player is currently speaking, so the scripture view can highlight and
  // gently scroll to it as playback moves through the chapter — cleared on
  // every interrupt alongside the rest of the player state, and also the
  // instant a new chapter starts loading (see the verses effect below),
  // so a stale highlight from the chapter just left can never flash under
  // the next one while it loads.
  const [spokenVerseNum, setSpokenVerseNum] = useState<number | null>(null);
  function resetPlayers() {
    setChapterPlayerState("idle");
    pendingAdvanceRef.current = null;
    setPagePlayerState("idle");
    setSpokenVerseNum(null);
  }

  const book = BOOKS.find((b) => b.id === bookId)!;
  const listScrollRef = useRef<HTMLDivElement>(null);
  const [pendingVerse, setPendingVerse] = useState<number | null>(null);
  const restoredRef = useRef(false);

  // Resume where the reader left off instead of always opening on Genesis
  // 1. Settings load from localStorage asynchronously (see lib/db.ts), so
  // this waits for `ready` rather than reading settings on first render,
  // and only fires once — later settings changes (e.g. our own writes
  // below) must not keep jumping the reader back.
  useEffect(() => {
    if (!ready || restoredRef.current) return;
    restoredRef.current = true;
    setBookId(settings.lastBookId);
    setChapter(settings.lastChapter);
  }, [ready, settings.lastBookId, settings.lastChapter]);

  useEffect(() => {
    if (!restoredRef.current) return;
    updateSettings({ lastBookId: bookId, lastChapter: chapter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, chapter]);

  // Jumping chapters (via the fixed toolbar, the drawer, or a search result)
  // reuses the same scrollable div, so without this the reader would land
  // mid-scroll in the new chapter instead of at its first verse. A search
  // result overrides this with a scroll-to-that-verse below once the new
  // chapter's text has actually loaded.
  useEffect(() => {
    listScrollRef.current?.scrollTo({ top: 0 });
  }, [bookId, chapter]);

  // Scrolls to and briefly highlights the verse a search result (or a
  // key-verse cross-reference tag) pointed at. Depends on both verses and
  // pendingVerse, not just verses: a cross-chapter jump needs to wait for
  // the new chapter's verses to actually load before its row exists (verses
  // arrives async), but a same-chapter jump (e.g. a cross-reference tag
  // pointing within the chapter already on screen) never changes `verses`
  // at all — depending on it alone meant that case silently never scrolled
  // anywhere, leaving the reader wherever the Insights tab happened to be
  // scrolled when they tapped the tag.
  useEffect(() => {
    if (!verses || pendingVerse === null) return;
    const target = pendingVerse;
    requestAnimationFrame(() => {
      // Manual delta-scroll rather than Element.scrollIntoView: scrollIntoView
      // walks every scroll-container ancestor in the DOM chain, including
      // .app-shell (overflow:hidden still allows programmatic scrollTop), so
      // it was shoving the whole app up instead of just this list.
      const container = listScrollRef.current;
      const row = container?.querySelector<HTMLElement>(`[data-verse="${target}"]`);
      if (container && row) {
        const containerRect = container.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        const delta = rowRect.top - containerRect.top - (containerRect.height - rowRect.height) / 2;
        container.scrollTop += delta;
      }
    });
    const timer = setTimeout(() => setPendingVerse(null), 2200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verses, pendingVerse]);

  // Chapter player: gently scrolls to keep whichever verse is currently
  // being read in view as playback moves through the chapter, rolling
  // down verse by verse — same manual delta-scroll approach as the
  // search-result effect above, but smooth rather than an instant jump,
  // and placing the row a bit above center so upcoming verses stay
  // visible below it rather than splitting evenly. Skipped when the row's
  // already close enough to that position so short, quick verses don't
  // cause jittery back-to-back micro-scrolls.
  useEffect(() => {
    if (spokenVerseNum === null) return;
    const container = listScrollRef.current;
    const row = container?.querySelector<HTMLElement>(`[data-verse="${spokenVerseNum}"]`);
    if (!container || !row) return;
    const containerRect = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const delta = rowRect.top - containerRect.top - containerRect.height * 0.3;
    if (Math.abs(delta) > 40) {
      container.scrollBy({ top: delta, behavior: "smooth" });
    }
  }, [spokenVerseNum]);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(settings.fontScale));
  }, [settings.fontScale]);

  useEffect(() => {
    if (settings.theme === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  // scripture: always loaded from the bundled per-book JSON (all 66 books)
  useEffect(() => {
    let cancelled = false;
    setVerses(null);
    setSpokenVerseNum(null);
    // A verse selection (and the mode itself) only makes sense against
    // the chapter it was built from — carrying it into a new chapter
    // would silently share the wrong verses under the old selection's
    // numbers.
    setSelectMode(false);
    setSelectedVerses([]);
    loadChapterVerses(bookId, chapter, lang)
      .then((v) => {
        if (!cancelled) {
          setVerses(v);
          versesKeyRef.current = `${bookId}/${chapter}`;
        }
      })
      .catch(() => {
        if (!cancelled) toast("Couldn't load that chapter's text — check your connection.");
      })
      .finally(() => {
        // Lets the background offline-library download start, whether this
        // chapter load succeeded or not — see AppContext's bulk-download
        // effect: it's deliberately held back until the reader's own
        // chapter is done competing for bandwidth, not held back forever.
        markContentReady();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, chapter, lang]);

  // Side-by-side version comparison: a second, read-only text track shown
  // under each primary verse. Comparing a version against itself makes no
  // sense, so switching the primary version to match the active compare
  // version turns comparison off instead of leaving a no-op picked.
  useEffect(() => {
    if (compareLang === lang) {
      setCompareLang(null);
    }
  }, [lang, compareLang]);

  useEffect(() => {
    if (!compareLang) {
      setCompareVerses(null);
      return;
    }
    let cancelled = false;
    setCompareVerses(null);
    loadChapterVerses(bookId, chapter, compareLang).then((v) => {
      if (!cancelled) setCompareVerses(v);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId, chapter, compareLang]);

  // One-time "tap a verse number to bookmark it" tip: the feature isn't
  // obvious at a glance on its own (see the dashed-ring hint on .verse-num
  // in theme.css), so this surfaces it once, the first time a chapter's
  // text actually lands on screen — but only for a reader who hasn't
  // already found it themselves (no bookmarks saved yet). Fires at most
  // once ever per device; settings.seenBookmarkHint flips to true right
  // after, which removes this effect's own trigger condition.
  useEffect(() => {
    if (!ready || !verses || settings.seenBookmarkHint || settings.bookmarks.length > 0) return;
    toast(t.bookmarkHintToast, 4000);
    updateSettings({ seenBookmarkHint: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, verses]);

  // Drives the chapter player: fires once per playToken bump, as soon as
  // that chapter's verses are actually loaded (immediately for the initial
  // tap, or once an auto-advance's fetch resolves). Guarded by
  // spokenTokenRef so a pause/resume toggle — which also changes
  // chapterPlayerState — can't re-trigger this and restart the chapter.
  // versesKeyRef must also match the current bookId/chapter — see its
  // declaration above for why `verses` alone being non-null isn't enough.
  useEffect(() => {
    if (chapterPlayerState !== "playing" || !verses) return;
    if (versesKeyRef.current !== `${bookId}/${chapter}`) return;
    if (spokenTokenRef.current === playToken) return;
    spokenTokenRef.current = playToken;
    tts.speak("chapter-player", verses.map((v) => v.t), lang, settings.voiceByLang[lang], (reason) => {
      if (reason !== "natural") {
        resetPlayers();
        return;
      }
      const next = adjacentChapter(1);
      if (!next) {
        resetPlayers();
        toast(t.listenFinishedToast);
        return;
      }
      const advance = () => {
        setBookId(next.bookId);
        setChapter(next.chapter);
        setTab("scripture");
        setOpenPointIndex(null);
        setOpenCharacterId(null);
        setPlayToken((v) => v + 1);
      };
      // Real speechSynthesis engines can fire an utterance's onend slightly
      // before the hardware audio buffer has actually finished draining —
      // queuing the next chapter's speech immediately then overlaps with
      // the tail end of the chapter that just "finished", audible as the
      // old chapter briefly repeating under the new one. A short pause
      // here gives the engine time to fully settle before anything new is
      // queued; the chapter flip (UI) and the next speak() both wait for
      // it together so they stay in sync with each other.
      window.setTimeout(() => {
        // The natural end already happened, so by now tts's activeId is
        // already null — a manual interrupt during this wait (tapping
        // Contents, Search, prev/next, a detail card, etc.) has nothing
        // live to stop and can't reach this closure, so it's handled by
        // resetPlayers() in each of those handlers instead; the idle
        // case here means one of those already fired and correctly wants
        // no advance at all.
        if (chapterPlayerStateRef.current === "playing") {
          advance();
        } else if (chapterPlayerStateRef.current === "paused") {
          // The reader paused during this exact settling gap — nothing
          // was actually playing yet for pause/resume to act on, so defer
          // the advance itself until they resume (toggleChapterPlayer)
          // instead of just dropping it, which used to leave the button
          // showing "playing" with nothing queued and no way to progress.
          pendingAdvanceRef.current = advance;
        }
      }, 400);
    }, (itemIndex) => setSpokenVerseNum(verses[itemIndex].n));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterPlayerState, verses, playToken]);

  // AI insights: every chapter ships pre-generated in the bundle (see
  // lib/insights.ts); the Genesis 1 seed is kept as a defensive fallback.
  //
  // Gated on `verses` (this chapter's actual scripture text) rather than
  // firing immediately alongside it: on a slow connection, starting this
  // plus the explain/characters fetches below at the exact same moment
  // as the bible-text fetch makes all four compete for the same limited
  // bandwidth — exactly the bug already fixed once for the background
  // offline-download (see AppContext's markContentReady). Insights isn't
  // even the visible tab by default, so it can wait the short extra beat
  // for the reader's own chapter text to land first.
  useEffect(() => {
    if (!verses) return;
    let cancelled = false;
    async function load() {
      const pre = await loadChapterPoints(bookId, chapter, lang);
      if (cancelled) return;
      if (pre) {
        setPoints(pre);
      } else if (bookId === "gen" && chapter === 1) {
        setPoints(GENESIS_1[lang].points);
      } else {
        setPoints(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [bookId, chapter, lang, verses]);

  // Second AI voice (see lib/explain.ts): summary/themes/application style,
  // merged below the trimmed 3-point list rather than a separate tab. Not
  // every chapter/language is covered yet, so this quietly resolves to
  // null and the section is simply omitted. Gated on `verses` — see the
  // insights effect above for why.
  useEffect(() => {
    if (!verses) return;
    let cancelled = false;
    loadChapterExplain(bookId, chapter, lang).then((e) => {
      if (!cancelled) setExplain(e);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId, chapter, lang, verses]);

  // Devotional tab (lib/devotional.ts): a short, gently-toned reflection on
  // the chapter, separate from Insights' study notes and Explain's
  // summary/application — see its own tab rather than Insights' merged
  // list, since it's meant to be read slowly on its own rather than
  // scanned alongside study notes. Only a small sample is generated so
  // far; most chapters resolve to null and the tab shows a "coming soon"
  // state instead of a permanent loading spinner.
  useEffect(() => {
    if (!verses) return;
    let cancelled = false;
    loadChapterDevotional(bookId, chapter, lang).then((d) => {
      if (!cancelled) setDevotional(d);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId, chapter, lang, verses]);

  // Character bios (lib/characters.ts): which named figures the appearance
  // manifest lists for this chapter, driving the "People in this chapter"
  // chip row below. Not every book has a manifest yet, so this quietly
  // resolves to an empty list rather than throwing. Gated on `verses` —
  // see the insights effect above for why; the chip row already pops in
  // asynchronously today, so starting it a beat later than the verse
  // text is no visible change in how it already behaves.
  useEffect(() => {
    setChapterCharacters([]);
    setPeopleExpanded(false);
    if (!verses) return;
    let cancelled = false;
    loadChapterCharacters(bookId, chapter, lang).then((list) => {
      if (!cancelled) setChapterCharacters(list);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId, chapter, lang, verses]);

  // Cross-references (lib/crossrefs.ts): verse-address pairs, the same for
  // every translation, so this only depends on bookId/chapter, not lang.
  // Gated on `verses` for the same reason as the characters effect above,
  // and skipped entirely while the Settings toggle is off -- a reader who
  // just wants to read straight through shouldn't pay even the fetch cost
  // for a feature they've turned off.
  useEffect(() => {
    setChapterCrossRefs({});
    if (!verses || !settings.crossRefsEnabled) return;
    let cancelled = false;
    loadChapterCrossRefs(bookId, chapter).then((map) => {
      if (!cancelled) setChapterCrossRefs(map);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId, chapter, verses, settings.crossRefsEnabled]);

  function openDetail(i: number) {
    tts.stop();
    resetPlayers();
    setOpenCharacterId(null);
    setOpenPointIndex(i);
  }
  function closeDetail() {
    tts.stop();
    resetPlayers();
    setOpenPointIndex(null);
  }
  function openCharacter(id: string) {
    tts.stop();
    resetPlayers();
    setOpenPointIndex(null);
    setOpenCharacterId(id);
  }
  function closeCharacter() {
    tts.stop();
    resetPlayers();
    setOpenCharacterId(null);
  }
  function switchLang(l: LangKey) {
    tts.stop();
    resetPlayers();
    setLang(l);
    setOpenPointIndex(null);
    setOpenCharacterId(null);
  }
  function switchTab(next: "scripture" | "insights" | "devotional") {
    tts.stop();
    resetPlayers();
    setTab(next);
  }
  function navigateFromDrawer(target: ModalKey | "home") {
    if (target === "home") {
      setModal(null);
      setOpenPointIndex(null);
      setOpenCharacterId(null);
    } else {
      setModal(target);
    }
  }
  // rememberFrom lets a jump-away (a key-verse tag or a cross-reference)
  // leave a "Back to X" breadcrumb the reader can tap to return -- pass the
  // verse they jumped *from* (so the chip can scroll back to that exact
  // verse), or `true` when there's no single originating verse (a key-verse
  // tag lives in the Insights panel, not a verse row). Every *other* way of
  // changing chapter (Contents, Search, Bookmarks, a Plan) calls goToChapter
  // with this omitted, which clears any stale breadcrumb -- those are
  // deliberate navigation, not a "jump and come back" detour.
  function goToChapter(bId: string, c: number, verse?: number, rememberFrom?: number | true) {
    tts.stop();
    resetPlayers();
    setReturnTo(rememberFrom === undefined ? null : { bookId, chapter, verse: rememberFrom === true ? 0 : rememberFrom });
    if (verse) setPendingVerse(verse);
    setBookId(bId);
    setChapter(c);
    setTab("scripture");
    setOpenPointIndex(null);
    setOpenCharacterId(null);
  }

  // The Further Insight block's "key verses" tags (e.g. "9:9", "38:5-6")
  // always reference a chapter:verse[-verse] in the *current* book — see
  // scripts that generate explain/ content — so there's no book to parse
  // out, just the chapter and the range's starting verse.
  function goToKeyVerse(ref: string) {
    const [chapterStr, verseStr] = ref.split(":");
    goToChapter(bookId, Number(chapterStr), Number(verseStr.split("-")[0]), true);
  }

  function isVerseBookmarked(verse: number): boolean {
    return settings.bookmarks.some((b) => b.bookId === bookId && b.chapter === chapter && b.verse === verse);
  }
  function toggleBookmark(verse: number) {
    const existing = settings.bookmarks.find((b) => b.bookId === bookId && b.chapter === chapter && b.verse === verse);
    if (existing) {
      updateSettings({ bookmarks: settings.bookmarks.filter((b) => b !== existing) });
      toast(t.bookmarkRemovedToast);
    } else {
      const next: Bookmark = { bookId, chapter, verse, addedAt: Date.now() };
      updateSettings({ bookmarks: [...settings.bookmarks, next] });
      toast(t.bookmarkAddedToast);
    }
  }

  function getVerseNote(verse: number): VerseNote | undefined {
    return settings.notes.find((n) => n.bookId === bookId && n.chapter === chapter && n.verse === verse);
  }

  // Saving with neither a color nor any text removes the record entirely,
  // same spirit as a bookmark that's been un-bookmarked — there's nothing
  // left worth keeping a row for.
  function saveVerseNote(verse: number, color: HighlightColor | undefined, text: string) {
    const rest = settings.notes.filter((n) => !(n.bookId === bookId && n.chapter === chapter && n.verse === verse));
    if (!color && !text) {
      updateSettings({ notes: rest });
      toast(t.noteDeletedToast);
    } else {
      const next: VerseNote = { bookId, chapter, verse, color, text: text || undefined, updatedAt: Date.now() };
      updateSettings({ notes: [...rest, next] });
      toast(t.noteSavedToast);
    }
    setNoteEditorVerse(null);
  }

  function deleteVerseNote(verse: number) {
    updateSettings({ notes: settings.notes.filter((n) => !(n.bookId === bookId && n.chapter === chapter && n.verse === verse)) });
    toast(t.noteDeletedToast);
    setNoteEditorVerse(null);
  }

  async function shareVerseText(verse: number) {
    if (sharingVerse !== null) return;
    const v = verses?.find((vv) => vv.n === verse);
    if (!v) return;
    setSharingVerse(verse);
    const reference = `${book.label[lang]} ${chapter}:${verse}`;
    const outcome = await shareVerse({ reference, text: v.t });
    setSharingVerse(null);
    if (outcome === "copied") toast(t.shareCopiedToast);
    else if (outcome === "failed" || outcome === "unavailable") toast(t.shareFailedToast);
  }

  function toggleSelectMode() {
    setSelectMode((on) => !on);
    setSelectedVerses([]);
  }
  function toggleVerseSelected(verse: number) {
    setSelectedVerses((prev) => (prev.includes(verse) ? prev.filter((n) => n !== verse) : [...prev, verse]));
  }
  async function shareSelectedVerses() {
    if (sharingSelection || selectedVerses.length === 0 || !verses) return;
    setSharingSelection(true);
    const chosen = verses
      .filter((v) => selectedVerses.includes(v.n))
      .map((v) => ({ n: v.n, text: v.t }));
    const reference = `${book.label[lang]} ${chapter}:${formatVerseRange(selectedVerses)}`;
    const outcome = await shareVerses({ reference, verses: chosen });
    setSharingSelection(false);
    if (outcome === "copied") toast(t.shareCopiedToast);
    else if (outcome === "failed" || outcome === "unavailable") toast(t.shareFailedToast);
    // Only clears the selection on an outcome that actually finished the
    // job (shared, or copied to clipboard as the no-Web-Share fallback) —
    // a cancelled share sheet or a failure leaves the selection in place
    // so the reader can just retry rather than re-tapping every verse.
    // Either way, nothing here keeps building up: the next tap always
    // starts a fresh, independent share() call, never queued behind this
    // one.
    if (outcome === "shared" || outcome === "copied") {
      setSelectMode(false);
      setSelectedVerses([]);
    }
  }

  function startPlan(planId: string) {
    updateSettings({ readingPlans: startOrRestartPlan(settings.readingPlans, planId) });
  }
  function markPlanDayComplete(planId: string, dayIndex: number) {
    const { plans, justCompleted } = markDayComplete(settings.readingPlans, planId, dayIndex);
    updateSettings({ readingPlans: plans });
    if (justCompleted) toast(t.planAllDoneToast);
  }

  const bookIndex = BOOKS.findIndex((b) => b.id === bookId);
  function adjacentChapter(direction: 1 | -1): { bookId: string; chapter: number } | null {
    if (direction === -1) {
      if (chapter > 1) return { bookId, chapter: chapter - 1 };
      const prevBook = BOOKS[bookIndex - 1];
      return prevBook ? { bookId: prevBook.id, chapter: prevBook.chapters } : null;
    }
    if (chapter < book.chapters) return { bookId, chapter: chapter + 1 };
    const nextBook = BOOKS[bookIndex + 1];
    return nextBook ? { bookId: nextBook.id, chapter: 1 } : null;
  }
  const prevTarget = adjacentChapter(-1);
  const nextTarget = adjacentChapter(1);
  function goAdjacent(direction: 1 | -1) {
    const target = direction === -1 ? prevTarget : nextTarget;
    if (!target) return;
    tts.stop();
    resetPlayers();
    setBookId(target.bookId);
    setChapter(target.chapter);
    setOpenPointIndex(null);
    setOpenCharacterId(null);
  }

  function toggleChapterPlayer() {
    if (!tts.isSupported) {
      toast(t.ttsUnavailable);
      return;
    }
    if (chapterPlayerState === "playing") {
      tts.pause("chapter-player");
      setChapterPlayerState("paused");
    } else if (chapterPlayerState === "paused") {
      if (pendingAdvanceRef.current) {
        const advance = pendingAdvanceRef.current;
        pendingAdvanceRef.current = null;
        setChapterPlayerState("playing");
        advance();
      } else {
        tts.resume("chapter-player");
        setChapterPlayerState("playing");
      }
    } else if (verses) {
      setChapterPlayerState("playing");
      setPlayToken((v) => v + 1);
    }
  }

  const point = points && openPointIndex !== null ? points[openPointIndex] : null;
  const characterIndex = chapterCharacters.findIndex((c) => c.id === openCharacterId);
  const character = characterIndex !== -1 ? chapterCharacters[characterIndex] : null;
  const prevCharacter = characterIndex > 0 ? chapterCharacters[characterIndex - 1] : null;
  const nextCharacter = characterIndex !== -1 && characterIndex < chapterCharacters.length - 1 ? chapterCharacters[characterIndex + 1] : null;
  const detailOpen = openPointIndex !== null || openCharacterId !== null;
  const chapterEyebrow = fmt(t.chapterEyebrow, { book: book.label[lang], c: chapter });

  function xrefLabel(ref: CrossRef): string {
    const refBook = BOOKS.find((b) => b.id === ref.b)?.label[lang] ?? ref.b;
    return ref.e
      ? fmt(t.xrefRefRangeTpl, { book: refBook, c: ref.c, v: ref.v, e: ref.e })
      : fmt(t.xrefRefTpl, { book: refBook, c: ref.c, v: ref.v });
  }
  const returnToLabel = returnTo
    ? fmt(t.backToTpl, {
        ref: returnTo.verse
          ? fmt(t.xrefRefTpl, { book: BOOKS.find((b) => b.id === returnTo.bookId)?.label[lang] ?? returnTo.bookId, c: returnTo.chapter, v: returnTo.verse })
          : fmt(t.chapterEyebrow, { book: BOOKS.find((b) => b.id === returnTo.bookId)?.label[lang] ?? returnTo.bookId, c: returnTo.chapter }),
      })
    : null;

  // Whichever Insights content is on screen, if any — a highlight detail
  // takes priority over a character bio (both live in the same detail
  // view, but only one is ever open at once), and the Further Insight
  // block only counts while the Insights tab's list view is showing (not
  // behind an open detail). Scripture never has page content: the toolbar
  // button falls back to the chapter player in that case.
  const pageContent: { id: string; text: string | string[] } | null = point
    ? { id: "detail", text: [point.title, ...point.body.map(stripHtml)] }
    : character
    ? { id: "character", text: stripBioMarkdown(character.bio) }
    : tab === "insights" && explain
    ? { id: "explain", text: [explain.summary, ...explain.keyPoints, explain.application] }
    : tab === "devotional" && devotional
    ? { id: "devotional", text: [devotional.title, ...devotional.body] }
    : null;

  function togglePagePlayer() {
    if (!pageContent) return;
    if (!tts.isSupported) {
      toast(t.ttsUnavailable);
      return;
    }
    if (pagePlayerState === "playing") {
      tts.pause(pageContent.id);
      setPagePlayerState("paused");
    } else if (pagePlayerState === "paused") {
      tts.resume(pageContent.id);
      setPagePlayerState("playing");
    } else {
      setPagePlayerState("playing");
      tts.speak(pageContent.id, pageContent.text, lang, settings.voiceByLang[lang], () => {
        setPagePlayerState("idle");
      });
    }
  }

  return (
    <div className="app-shell">
      {/* iOS's status-bar-style is black-translucent (see index.html), which lets
          the page render under the notch instead of the OS drawing a status bar --
          Safari has no theme-color support to tint it, so without this it just
          shows whatever's behind it. Paints that one strip the app's own orange,
          to roughly match what Android Chrome already does with theme-color. */}
      <div className="status-bar-fill" aria-hidden="true" />
      <div className="appbar">
        <button className="menu-btn" type="button" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
          <span />
        </button>
        <button className="wordmark-btn" type="button" onClick={() => setModal("contents")}>
          <svg className="mark" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="var(--gold)" stroke="var(--ink)" strokeWidth="2.5" />
            <path d="M11 14c3-2 6-2 9 0v13c-3-2-6-2-9 0V14z" fill="var(--paper-panel)" stroke="var(--ink)" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M29 14c-3-2-6-2-9 0v13c3-2 6-2 9 0V14z" fill="var(--paper-panel)" stroke="var(--ink)" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M20 14v13" stroke="var(--ink)" strokeWidth="1.6" />
          </svg>
          <span className="wordmark">{t.drawerContents}</span>
        </button>
        <button className="search-btn" type="button" aria-label={t.drawerSearch} onClick={() => setModal("search")}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="7" stroke="var(--ink)" strokeWidth="2.4" />
            <line x1="16.2" y1="16.2" x2="21" y2="21" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="lang-row">
        {LANGUAGES.map((l) => (
          <button
            key={l.key}
            type="button"
            className={`lang-pill${lang === l.key ? " active" : ""}`}
            onClick={() => switchLang(l.key)}
          >
            {l.label}
          </button>
        ))}
        {tab === "scripture" && (
          <button
            type="button"
            className={`compare-toggle-btn${comparePickerOpen || compareLang ? " active" : ""}`}
            aria-label={t.compareToggleLabel}
            onClick={() => {
              // A compare language already chosen means the button reads as
              // "on" (gold) -- tapping it again should turn comparison off
              // entirely, not just hide the picker row while compareLang
              // (and the gold button) silently stays active underneath.
              if (compareLang) {
                setCompareLang(null);
                setComparePickerOpen(false);
              } else {
                setComparePickerOpen((v) => !v);
              }
            }}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="7" height="14" rx="1.5" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="5" width="7" height="14" rx="1.5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        )}
      </div>

      {tab === "scripture" && comparePickerOpen && (
        <div className="lang-row compare-row">
          <span className="compare-row-label">{t.compareLabel}</span>
          {LANGUAGES.filter((l) => l.key !== lang).map((l) => (
            <button
              key={l.key}
              type="button"
              className={`lang-pill${compareLang === l.key ? " active" : ""}`}
              onClick={() => setCompareLang((cur) => (cur === l.key ? null : l.key))}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      {returnTo && (
        <button
          type="button"
          className="return-to-chip"
          onClick={() => goToChapter(returnTo.bookId, returnTo.chapter, returnTo.verse || undefined)}
        >
          &larr; {returnToLabel}
        </button>
      )}
      <div className="chapter-bar">
        <span className="chapter-eyebrow">{chapterEyebrow}</span>
        {tab === "scripture" && verses && (
          <button
            type="button"
            className={`select-toggle-btn${selectMode ? " active" : ""}`}
            aria-label={selectMode ? t.selectModeExitLabel : t.selectModeLabel}
            onClick={toggleSelectMode}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
              <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
              <line x1="8.6" y1="10.7" x2="15.4" y2="6.3" stroke="currentColor" strokeWidth="2" />
              <line x1="8.6" y1="13.3" x2="15.4" y2="17.7" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        )}
      </div>

      <div className="panels">
        <div className={`view list${detailOpen ? " is-hidden" : ""}`}>
          <div className="view-scroll" ref={listScrollRef}>
          <div className="chapter-head">
            <div>
              <div className="chapter-title">{book.label[lang]}</div>
            </div>
            <div className="chapter-head-actions">
              <button type="button" className="map-btn" onClick={() => setIntroOpen(true)}>
                <span aria-hidden="true">&#128214;</span> {t.introLabel}
              </button>
              {bookHasMap(bookId) && (
                <button type="button" className="map-btn" onClick={() => setMapOpen(true)}>
                  <span aria-hidden="true">&#128506;</span> {t.mapLabel}
                </button>
              )}
            </div>
          </div>

          <div className="tabbar">
            <button type="button" className={`tab-btn${tab === "scripture" ? " active" : ""}`} onClick={() => switchTab("scripture")}>
              {t.tabScripture}
            </button>
            <button type="button" className={`tab-btn${tab === "insights" ? " active" : ""}`} onClick={() => switchTab("insights")}>
              {t.tabInsights}
            </button>
            <button type="button" className={`tab-btn${tab === "devotional" ? " active" : ""}`} onClick={() => switchTab("devotional")}>
              {t.tabDevotional}
            </button>
          </div>

          {tab === "scripture" ? (
            verses ? (
              <div>
                {chapterCharacters.length > 0 && (
                  <div className="people-row">
                    <div className="people-row-label">{t.peopleInChapterLabel}</div>
                    <div className="tag-row">
                      {(peopleExpanded ? chapterCharacters : chapterCharacters.slice(0, PEOPLE_ROW_CAP)).map((c) => (
                        <button key={c.id} type="button" className="person-tag" onClick={() => openCharacter(c.id)}>
                          {c.name}
                        </button>
                      ))}
                      {chapterCharacters.length > PEOPLE_ROW_CAP && (
                        <button
                          type="button"
                          className="person-tag more"
                          onClick={() => setPeopleExpanded((v) => !v)}
                        >
                          {peopleExpanded ? t.peopleShowLessLabel : fmt(t.peopleShowMoreTpl, { n: chapterCharacters.length - PEOPLE_ROW_CAP })}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div className="verse-list">
                  {verses.map((v) => {
                    const note = getVerseNote(v.n);
                    const compareText = compareLang ? compareVerses?.find((cv) => cv.n === v.n)?.t : undefined;
                    return (
                    <div key={v.n}>
                    <div
                      className={`verse-row${v.n === pendingVerse || v.n === spokenVerseNum ? " highlighted" : ""}`}
                      data-verse={v.n}
                    >
                      <button
                        type="button"
                        className={`verse-num${isVerseBookmarked(v.n) ? " bookmarked" : ""}`}
                        aria-label={isVerseBookmarked(v.n) ? t.unbookmarkLabel : t.bookmarkLabel}
                        onClick={() => toggleBookmark(v.n)}
                      >
                        {v.n}
                      </button>
                      <button
                        type="button"
                        className="verse-text"
                        data-mark={note?.color}
                        data-redletter={settings.redLetterEnabled && isJesusWords(bookId, chapter, v.n) ? "true" : undefined}
                        aria-label={t.verseNoteLabel}
                        onClick={() => setNoteEditorVerse(v.n)}
                      >
                        {v.t}
                        {note?.text && <span className="note-indicator" aria-hidden="true" />}
                      </button>
                      {selectMode ? (
                        <button
                          type="button"
                          className={`verse-select-btn${selectedVerses.includes(v.n) ? " selected" : ""}`}
                          aria-label={selectedVerses.includes(v.n) ? t.selectedVerseLabel : t.selectVerseLabel}
                          onClick={() => toggleVerseSelected(v.n)}
                        >
                          {selectedVerses.includes(v.n) && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 13l5 5L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="verse-share-btn"
                          aria-label={t.shareLabel}
                          disabled={sharingVerse === v.n}
                          onClick={() => shareVerseText(v.n)}
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
                            <line x1="8.6" y1="10.7" x2="15.4" y2="6.3" stroke="currentColor" strokeWidth="2" />
                            <line x1="8.6" y1="13.3" x2="15.4" y2="17.7" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {compareLang && (
                      <div className="verse-compare-row">
                        <span className="verse-compare-label">{LANGUAGES.find((l) => l.key === compareLang)?.label}</span>
                        <span className="verse-compare-text">{compareText ?? t.loadingLabel}</span>
                      </div>
                    )}
                    {chapterCrossRefs[String(v.n)] && (
                      <div className="xref-row">
                        <span className="xref-label">{t.xrefSeeAlsoLabel}</span>
                        {chapterCrossRefs[String(v.n)].map((ref, i) => (
                          <button
                            key={i}
                            type="button"
                            className="xref-tag"
                            onClick={() => goToChapter(ref.b, ref.c, ref.v, v.n)}
                          >
                            {xrefLabel(ref)}
                          </button>
                        ))}
                      </div>
                    )}
                    </div>
                    );
                  })}
                </div>
                <div className="scripture-note">{t.scriptureNote}</div>
              </div>
            ) : (
              <div className="empty-note">{t.loadingLabel}</div>
            )
          ) : tab === "devotional" ? (
            <div>
              {devotional ? (
                <div className="devotional-block">
                  <h3 className="devotional-title">
                    {devotional.title.split(/(\d+)/).map((part, i) =>
                      /^\d+$/.test(part) ? (
                        <span key={i} className="devotional-title-num">
                          {part}
                        </span>
                      ) : (
                        part
                      )
                    )}
                  </h3>
                  {devotional.body.map((p, i) => (
                    <p key={i} className="devotional-para">
                      {p}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="empty-note">{t.devotionalEmptyLabel}</div>
              )}
            </div>
          ) : (
            <div>
              <div className="section-label">
                <span>{t.sectionLeft}</span>
                <span>{t.sectionRight}</span>
              </div>
              {points ? (
                <div className="point-list">
                  {points.slice(0, 3).map((p, i) => (
                    <button key={i} type="button" className="point-card" onClick={() => openDetail(i)}>
                      <div className="point-num">{i + 1}</div>
                      <div className="point-body">
                        <p className="point-title">{p.title}</p>
                        <p className="point-teaser">{p.teaser}</p>
                      </div>
                      <div className="point-arrow" aria-hidden="true">
                        &rarr;
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-note">{t.loadingLabel}</div>
              )}
              {explain && (
                <div className="explain-block">
                  <div className="section-label">
                    <span>{t.explainSectionLabel}</span>
                  </div>
                  <div className="caption-box">{explain.summary}</div>
                  {explain.themes.length > 0 && (
                    <div className="tag-row">
                      {explain.themes.map((th) => (
                        <span key={th} className="theme-tag">{th}</span>
                      ))}
                    </div>
                  )}
                  <ul className="explain-points">
                    {explain.keyPoints.map((kp, i) => (
                      <li key={i}>{kp}</li>
                    ))}
                  </ul>
                  {explain.keyVerses.length > 0 && (
                    <div className="tag-row">
                      {explain.keyVerses.map((v) => (
                        <button key={v} type="button" className="verse-tag" onClick={() => goToKeyVerse(v)}>
                          {v}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="caption-box callout">
                    <b>{t.explainApplicationLabel}</b> {explain.application}
                  </div>
                </div>
              )}
            </div>
          )}

          </div>
        </div>

        <div className={`view detail${detailOpen ? " is-active" : ""}`}>
          <div className="view-scroll">
          {point && (
            <>
              <button type="button" className="back-tab" onClick={closeDetail}>
                <span aria-hidden="true">&larr;</span> {t.backTab}
              </button>
              <div className="splash-banner">
                <div className="point-num">{(openPointIndex ?? 0) + 1}</div>
                <div className="splash-title">{point.title}</div>
              </div>
              <div className="ai-tag">
                <span className="dot" /> {t.aiTag}
              </div>
              <div>
                {point.body.map((para, idx) => (
                  <div
                    key={idx}
                    className={`caption-box${idx === point.body.length - 1 ? " callout" : ""}`}
                    dangerouslySetInnerHTML={{ __html: para }}
                  />
                ))}
              </div>
            </>
          )}
          {character && (
            <>
              <button type="button" className="back-tab" onClick={closeCharacter}>
                <span aria-hidden="true">&larr;</span> {t.backTab}
              </button>
              <div className="splash-banner">
                <div className="splash-title">{character.name}</div>
              </div>
              <div className="caption-box bio-box" dangerouslySetInnerHTML={{ __html: renderBioHtml(character.bio) }} />
              <div className="character-nav-row">
                <button
                  type="button"
                  className="character-nav-btn prev"
                  disabled={!prevCharacter}
                  onClick={() => prevCharacter && setOpenCharacterId(prevCharacter.id)}
                >
                  <span aria-hidden="true">&larr;</span>
                  <span className="name">{prevCharacter?.name}</span>
                </button>
                <button
                  type="button"
                  className="character-nav-btn next"
                  disabled={!nextCharacter}
                  onClick={() => nextCharacter && setOpenCharacterId(nextCharacter.id)}
                >
                  <span className="name">{nextCharacter?.name}</span>
                  <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      {selectMode && selectedVerses.length > 0 ? (
        <div className="select-share-bar">
          <button type="button" className="select-share-cancel" onClick={toggleSelectMode}>
            {t.selectModeExitLabel}
          </button>
          <button type="button" className="select-share-btn" disabled={sharingSelection} onClick={shareSelectedVerses}>
            {t.shareSelectedLabel}
          </button>
        </div>
      ) : (
        <div className="chapter-toolbar">
          <button
            type="button"
            className="toolbar-nav-btn"
            aria-label={t.prevChapterLabel}
            disabled={!prevTarget}
            onClick={() => goAdjacent(-1)}
          >
            <span aria-hidden="true">&larr;</span>
          </button>
          <ChapterPlayerButton
            lang={lang}
            state={pageContent ? pagePlayerState : chapterPlayerState}
            disabled={pageContent ? false : tab !== "scripture" || (chapterPlayerState === "idle" && !verses)}
            onToggle={pageContent ? togglePagePlayer : toggleChapterPlayer}
          />
          <button
            type="button"
            className="toolbar-nav-btn"
            aria-label={t.nextChapterLabel}
            disabled={!nextTarget}
            onClick={() => goAdjacent(1)}
          >
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      )}

      <Suspense fallback={null}>
        {everOpened.has("drawer") && (
          <Drawer open={drawerOpen} current={modal ?? "home"} onClose={() => setDrawerOpen(false)} onNavigate={navigateFromDrawer} />
        )}

        {everOpened.has("contents") && (
          <ContentsModal
            open={modal === "contents"}
            onClose={() => setModal(null)}
            onSelectChapter={(bId, c, verse) => goToChapter(bId, c, verse)}
          />
        )}

        {everOpened.has("search") && (
          <SearchModal
            open={modal === "search"}
            onClose={() => setModal(null)}
            onResult={(_resultLang, resultBookId, resultChapter, verse) => {
              tts.stop();
              resetPlayers();
              setPendingVerse(verse);
              setBookId(resultBookId);
              setChapter(resultChapter);
              setTab("scripture");
              setOpenPointIndex(null);
              setOpenCharacterId(null);
            }}
          />
        )}

        {everOpened.has("bookmarks") && (
          <BookmarksModal
            open={modal === "bookmarks"}
            bookmarks={settings.bookmarks}
            onClose={() => setModal(null)}
            onSelect={(bId, c, verse) => goToChapter(bId, c, verse)}
            onRemove={(bm) => updateSettings({ bookmarks: settings.bookmarks.filter((b) => b !== bm) })}
          />
        )}

        {everOpened.has("notes") && (
          <NotesModal
            open={modal === "notes"}
            notes={settings.notes}
            onClose={() => setModal(null)}
            onSelect={(bId, c, verse) => goToChapter(bId, c, verse)}
            onRemove={(n) => updateSettings({ notes: settings.notes.filter((x) => x !== n) })}
          />
        )}

        {everOpened.has("noteEditor") && (
          <NoteEditorModal
            open={noteEditorVerse !== null}
            reference={noteEditorVerse !== null ? `${book.label[lang]} ${chapter}:${noteEditorVerse}` : ""}
            verseText={noteEditorVerse !== null ? (verses?.find((v) => v.n === noteEditorVerse)?.t ?? "") : ""}
            existing={noteEditorVerse !== null ? getVerseNote(noteEditorVerse) : undefined}
            onSave={(color, text) => noteEditorVerse !== null && saveVerseNote(noteEditorVerse, color, text)}
            onDelete={() => noteEditorVerse !== null && deleteVerseNote(noteEditorVerse)}
            onClose={() => setNoteEditorVerse(null)}
          />
        )}

        {everOpened.has("plans") && (
          <PlansModal
            open={modal === "plans"}
            plans={settings.readingPlans}
            onClose={() => setModal(null)}
            onStart={startPlan}
            onRestart={startPlan}
            onMarkDayComplete={markPlanDayComplete}
            onGoToChapter={(bId, c) => goToChapter(bId, c)}
          />
        )}

        {everOpened.has("settings") && (
          <SettingsModal open={modal === "settings"} onClose={() => setModal(null)} onOpenCredits={() => setCreditsOpen(true)} />
        )}

        {everOpened.has("credits") && <CreditsModal open={creditsOpen} onClose={() => setCreditsOpen(false)} />}

        {everOpened.has("map") && (
          <MapModal open={mapOpen} bookId={bookId} bookLabel={book.label[lang]} onClose={() => setMapOpen(false)} />
        )}

        {everOpened.has("bookIntro") && (
          <BookIntroModal open={introOpen} bookId={bookId} onClose={() => setIntroOpen(false)} />
        )}
      </Suspense>

      <Toast />
    </div>
  );
}
