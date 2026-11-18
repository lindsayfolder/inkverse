import type { LangKey } from "../data/languages";

export interface Bookmark {
  bookId: string;
  chapter: number;
  verse: number;
  addedAt: number;
}

export type HighlightColor = "yellow" | "green" | "blue" | "pink";

// One record per verse that has a highlight color and/or a personal note —
// a record only exists while it holds at least one of the two (see
// App.tsx's save/delete handling), so a highlight-only verse costs a
// handful of bytes, not a whole note's worth.
export interface VerseNote {
  bookId: string;
  chapter: number;
  verse: number;
  color?: HighlightColor;
  text?: string;
  updatedAt: number;
}

// Character caps for the free-form note text, not the highlight color —
// kept deliberately short (a few sentences, not an essay) for two
// reasons: it's a better fit for a small on-screen text box either way,
// and it keeps this reader-written, genuinely unbounded-in-principle data
// from ever being able to approach localStorage's per-origin quota
// (5-10MB depending on browser). A CJK character costs ~3 bytes in UTF-8
// against a Latin character's ~1, so the Chinese cap is tighter in
// characters but lands in the same ballpark in bytes — both caps land
// comfortably under even a few thousand notes' worth of storage.
export const NOTE_CHAR_LIMIT_EN = 300;
export const NOTE_CHAR_LIMIT_ZH = 200;

export function noteCharLimit(lang: LangKey): number {
  return lang === "zh-hant" || lang === "zh-hans" ? NOTE_CHAR_LIMIT_ZH : NOTE_CHAR_LIMIT_EN;
}

// One record per reading plan the reader has ever started (see
// data/readingPlans.ts and components/PlansModal.tsx) — restarting a plan
// resets this same record rather than creating a new one, so the array can
// never hold more entries than the plan library itself (a handful), no
// matter how many times a plan is run. completedAt is set once every day
// is checked off; only completed, aged-out plans are ever pruned (see
// pruneOldPlans below) — a plan still in progress is never auto-deleted
// just for being old, however the retention setting is configured.
export interface PlanProgress {
  planId: string;
  startedAt: number;
  lastActivityAt: number;
  completedDays: number[];
  completedAt?: number;
}

export type RetentionUnit = "days" | "months" | "years";

export interface PlanRetentionSetting {
  enabled: boolean;
  amount: number;
  unit: RetentionUnit;
}

export function retentionMs(r: PlanRetentionSetting): number {
  const DAY = 24 * 60 * 60 * 1000;
  const perUnit: Record<RetentionUnit, number> = { days: DAY, months: DAY * 30, years: DAY * 365 };
  return r.amount * perUnit[r.unit];
}

// A hard backstop independent of the reader's own retention setting (which
// can be turned off entirely) — keeps pruneOldPlans' output bounded even in
// a scenario the time-based rule doesn't cover, e.g. the plan library
// growing much larger in a future update. With today's 5-plan library this
// never actually binds; it exists so growth stays bounded by construction
// rather than by the current library happening to be small.
const MAX_PLAN_RECORDS = 50;

// Removes completed plans older than the configured retention window, plus
// (regardless of that setting) trims down to MAX_PLAN_RECORDS if somehow
// exceeded, oldest-completed-first. A plan still in progress (no
// completedAt) is never removed by age — only a finished plan's history is
// "old data" in the sense this setting means.
export function pruneOldPlans(plans: PlanProgress[], retention: PlanRetentionSetting, now: number): PlanProgress[] {
  let next = plans;
  if (retention.enabled) {
    const maxAge = retentionMs(retention);
    next = next.filter((p) => !p.completedAt || now - p.completedAt < maxAge);
  }
  if (next.length > MAX_PLAN_RECORDS) {
    const completed = next.filter((p) => p.completedAt).sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0));
    const active = next.filter((p) => !p.completedAt);
    const keepCompleted = Math.max(0, MAX_PLAN_RECORDS - active.length);
    next = [...completed.slice(-keepCompleted), ...active];
  }
  return next;
}

// Same hard-backstop philosophy as MAX_PLAN_RECORDS above: this never
// actually binds under realistic use (a note capped at NOTE_CHAR_LIMIT_ZH
// characters times this many records is still only a couple of MB — see
// the byte-math note on NOTE_CHAR_LIMIT_EN/ZH above), but growth stays
// bounded by construction rather than by today's usage happening to be
// light.
const MAX_NOTE_RECORDS = 2000;

// Unlike a reading plan, a note has no "in progress" vs. "finished" state
// — it just exists, so age here means time since it was last written or
// edited (updatedAt), with nothing exempted from the retention window the
// way an active plan is in pruneOldPlans above.
export function pruneOldNotes(notes: VerseNote[], retention: PlanRetentionSetting, now: number): VerseNote[] {
  let next = notes;
  if (retention.enabled) {
    const maxAge = retentionMs(retention);
    next = next.filter((n) => now - n.updatedAt < maxAge);
  }
  if (next.length > MAX_NOTE_RECORDS) {
    next = [...next].sort((a, b) => a.updatedAt - b.updatedAt).slice(-MAX_NOTE_RECORDS);
  }
  return next;
}

export interface AppSettings {
  id: "app";
  fontScale: number;
  theme: "light" | "dark" | "auto";
  lastLang: LangKey;
  // Last book/chapter the reader had open, so relaunching the app resumes
  // there instead of always landing on Genesis 1.
  lastBookId: string;
  lastChapter: number;
  // Chosen SpeechSynthesisVoice.voiceURI per language, when the reader has
  // picked one in Settings — see lib/tts.ts. Unset means "let the browser
  // pick automatically."
  voiceByLang: Partial<Record<LangKey, string>>;
  // Real search history, most-recent-first, per version searched (see
  // components/SearchModal.tsx) — kept separate per language the same way
  // voiceByLang is, since a recent query in one version isn't necessarily
  // meaningful when searching another.
  recentSearches: Partial<Record<LangKey, string[]>>;
  // Saved verses (see BookmarksModal), one entry per bookmarked verse —
  // not keyed by language, since a bookmark is the same place in the text
  // no matter which version the reader is currently viewing it in.
  bookmarks: Bookmark[];
  // Whether the reader has already been shown the one-time "tap a verse
  // number to bookmark it" tip (see App.tsx) — the feature wasn't obvious
  // at a glance (the verse-num circles looked identical before and after
  // this field existed), so this fires the hint once, ever, per device.
  seenBookmarkHint: boolean;
  // Whether the "offline copy ready" toast has already been shown once,
  // ever, on this device. The download itself is correctly skipped once
  // everything's cached, but the ready-percentage calculation can still
  // dip briefly on a fresh launch while the real total (which includes
  // however many character bios exist) is still being worked out — for a
  // reader who's had the app a while with everything already offline,
  // that reads as "download complete!" announcing itself on every single
  // open, which is the actual complaint this flag fixes: the toast is
  // only ever useful the first time a reader crosses into offline-ready.
  seenOfflineReadyToast: boolean;
  // One record per reading plan ever started — see PlanProgress above.
  readingPlans: PlanProgress[];
  // Reader-configured auto-cleanup for completed reading-plan history (see
  // pruneOldPlans above) — off by default, since this data is tiny on its
  // own; the control exists for the reader's own peace of mind, and so the
  // same mechanism is ready to extend to personal notes if that's added
  // later, since notes (free-form, reader-written text) are the one piece
  // of future data that could plausibly grow large.
  planRetention: PlanRetentionSetting;
  // Highlights and personal notes, one record per marked verse — see
  // VerseNote above. Not keyed by language, same reasoning as bookmarks:
  // a highlighted verse is the same place in the text regardless of which
  // version it's currently being read in.
  notes: VerseNote[];
  // Same shape and same "off by default" reasoning as planRetention, but
  // a separate setting — a reader may want their reading-plan history
  // cleaned up automatically while keeping notes forever, or vice versa.
  noteRetention: PlanRetentionSetting;
  // Whether Jesus's words render in red (see data/jesusWords.ts) — on by
  // default like a standard red-letter print edition, with an off switch
  // in Settings for readers who find it distracting.
  redLetterEnabled: boolean;
}

const STORAGE_KEY = "inkverse-settings";

export const DEFAULT_SETTINGS: AppSettings = {
  id: "app",
  fontScale: 1,
  theme: "auto",
  lastLang: "en",
  lastBookId: "gen",
  lastChapter: 1,
  voiceByLang: {},
  recentSearches: {},
  bookmarks: [],
  seenBookmarkHint: false,
  seenOfflineReadyToast: false,
  readingPlans: [],
  planRetention: { enabled: false, amount: 90, unit: "days" },
  notes: [],
  noteRetention: { enabled: false, amount: 90, unit: "days" },
  redLetterEnabled: true,
};

// localStorage, not IndexedDB: writes are synchronous and commit
// immediately, unlike an IndexedDB transaction which resolves on a later
// microtask/event-loop turn. On an installed ("Add to Home Screen") iOS
// app, backgrounding or closing the app can kill its process before an
// in-flight IndexedDB write reaches disk, silently dropping settings
// changes like font size — a reader would see them "not stick" every
// time. localStorage's synchronous write has no such window.
export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Returns whether the write actually landed, rather than swallowing a
// failure silently — a localStorage quota error (or storage being
// unavailable, e.g. private browsing) throws synchronously and is never
// going to crash the app (it's just a thrown JS exception inside a plain
// try/catch), but silently dropping new progress forever without the
// reader ever knowing is its own kind of bug. See AppContext's persistence
// effect for what it does with a false return: an emergency trim-and-retry,
// then a one-time warning if that still doesn't help.
export async function saveSettings(settings: AppSettings): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

// Last-resort trim applied only after a plain save has already failed —
// independent of the reader's own planRetention setting (which might be
// off, or set to a long window): the point here is freeing enough space to
// keep saving at all, not respecting a preference that's already proven
// unaffordable this run. Bookmarks have no reader-facing retention control
// (there's no obvious "old" bookmark the way there's an obviously-finished
// plan), so this is the one place they're ever capped — keeping the most
// recent ones, since those are the most likely to still matter.
const EMERGENCY_BOOKMARK_CAP = 300;
// Notes have a reader-facing retention control (noteRetention), unlike
// bookmarks, but it might be off or set to a long window — same reasoning
// as the plan-retention override below: an emergency trim isn't the place
// to respect a preference that's already proven unaffordable this run.
const EMERGENCY_NOTE_CAP = 300;
export function emergencyTrim(settings: AppSettings): AppSettings {
  return {
    ...settings,
    bookmarks: settings.bookmarks.slice(-EMERGENCY_BOOKMARK_CAP),
    readingPlans: pruneOldPlans(settings.readingPlans, { enabled: true, amount: 7, unit: "days" }, Date.now()),
    notes: [...settings.notes].sort((a, b) => a.updatedAt - b.updatedAt).slice(-EMERGENCY_NOTE_CAP),
  };
}
