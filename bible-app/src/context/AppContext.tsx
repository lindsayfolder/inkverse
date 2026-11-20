import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { LangKey } from "../data/languages";
import { UI } from "../data/languages";
import { DEFAULT_SETTINGS, emergencyTrim, loadSettings, pruneOldNotes, pruneOldPlans, saveSettings, type AppSettings } from "../lib/db";
import { isReadyCount } from "../lib/offlineStatus";
import { runBulkDownload, TOTAL_CONTENT_FILES } from "../lib/bulkOfflineDownload";
import { applyUpdate, checkForUpdate, getUpdateState, subscribeUpdateState } from "../lib/appUpdate";

interface AppContextValue {
  lang: LangKey;
  setLang: (l: LangKey) => void;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  ready: boolean;
  markContentReady: () => void;
  toast: (msg: string, durationMs?: number) => void;
  toastMsg: string | null;
  offlineReady: boolean;
  offlineCount: number;
  offlineTotal: number;
  updateAvailable: boolean;
  checkingForUpdate: boolean;
  checkForUpdate: () => void;
  applyUpdate: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangKey>("en");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  // Starts at the fixed-size estimate (TOTAL_CONTENT_FILES) so Settings has
  // something sane to show before the first real progress report arrives;
  // runBulkDownload's callback then replaces it with the real total, which
  // also folds in however many character bios actually exist (not knowable
  // up front — see lib/bulkOfflineDownload.ts).
  const [offlineTotal, setOfflineTotal] = useState(TOTAL_CONTENT_FILES);
  const [updateState, setUpdateState] = useState(getUpdateState());
  const langRef = useRef(lang);
  langRef.current = lang;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  // Resolved once the reader's actual chapter has rendered — see
  // markContentReady below and its App.tsx call site. The bulk background
  // download (next effect) waits on this before issuing any of its own
  // requests, so it never competes with the handful of fetches the first
  // paint itself is waiting on for bandwidth on a constrained connection.
  //
  // Built with useState's lazy initializer, not useRef(new Promise(...)):
  // that expression would still run on *every* render (React only
  // discards the result after the first), reassigning the resolver to a
  // new, disconnected Promise each time — so by the time markContentReady
  // actually fires, it would be resolving an orphaned promise instead of
  // the one this effect is awaiting below, and the download would simply
  // never start. useState's initializer function runs exactly once.
  const [contentReadyGate] = useState(() => {
    let resolve: () => void = () => {};
    const promise = new Promise<void>((r) => {
      resolve = r;
    });
    return { promise, resolve };
  });
  const markContentReady = useCallback(() => {
    contentReadyGate.resolve();
  }, [contentReadyGate]);

  useEffect(() => {
    loadSettings().then((s) => {
      // Applies the reader's configured reading-plan retention (Settings)
      // once per app launch — there's no durable background process in a
      // PWA to run this on a true fixed schedule, so "every N days/months/
      // years" means "pruned on the first launch after that window has
      // elapsed," which is the standard pattern for this kind of cleanup
      // in a web app.
      const now = Date.now();
      const prunedPlans = pruneOldPlans(s.readingPlans, s.planRetention, now);
      const prunedNotes = pruneOldNotes(s.notes, s.noteRetention, now);
      const cleaned =
        prunedPlans.length === s.readingPlans.length && prunedNotes.length === s.notes.length
          ? s
          : { ...s, readingPlans: prunedPlans, notes: prunedNotes };
      setSettings(cleaned);
      setLangState(cleaned.lastLang);
      setReady(true);
    });
  }, []);

  // Downloads the offline content library in small resumable batches from
  // ordinary page code (see lib/bulkOfflineDownload.ts for why this isn't
  // done as one atomic service-worker install step). Surfaces real
  // progress in Settings instead of leaving the reader to guess whether
  // it's safe to go offline yet, and toasts once on the transition to
  // fully ready.
  //
  // Waits for markContentReady() first: this fires dozens of requests the
  // moment it starts (one appearance-manifest fetch per book, among
  // others), which on a real mobile connection shares the same limited
  // downlink bandwidth as the handful of fetches the reader's *current*
  // chapter is waiting on — competing with them measurably delays the
  // first paint the reader is actually looking at. Letting the critical
  // chapter load first, then starting the background library download,
  // costs nothing once everything's already cached (the common case,
  // where markContentReady fires within a tick anyway) and meaningfully
  // speeds up the one case that matters: a reader opening the app cold
  // on a slow connection.
  useEffect(() => {
    let cancelled = false;
    let toastedThisSession = false;
    let sawNotReady = false;

    contentReadyGate.promise.then(() => {
      if (cancelled) return;
      runBulkDownload((done, total) => {
        if (cancelled) return;
        setOfflineCount(done);
        setOfflineTotal(total);
        const nowReady = isReadyCount(done, total);
        // Only announce the *transition* into ready — a returning reader
        // who was already fully cached from a previous visit shouldn't get
        // a "ready!" toast every time they simply open the app.
        if (!nowReady) sawNotReady = true;
        if (nowReady && sawNotReady && !toastedThisSession && !settingsRef.current.seenOfflineReadyToast) {
          toastedThisSession = true;
          // Reads the *current* language via a ref rather than closing over
          // `lang` directly — this effect only runs once (see the deps array
          // below), so a plain closure would keep toasting in whatever
          // language was active on mount even after the reader switches,
          // since the transition into "ready" can land well after that.
          toast(UI[langRef.current].offlineReadyToast);
          // Persisted so this never shows again on this device: the
          // not-ready-to-ready "transition" above can still fire on a later
          // launch even when nothing new actually needed downloading (the
          // ready-percentage briefly dips while the real total, including
          // however many character bios exist, is being worked out) — for a
          // reader who's had the app a while with everything already
          // offline, that looked like "download complete!" announcing
          // itself on every single open.
          updateSettings({ seenOfflineReadyToast: true });
        }
        setOfflineReady(nowReady);
      });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => subscribeUpdateState(() => setUpdateState(getUpdateState())), []);

  // Functional setSettings updates, rather than computing `next` from the
  // `settings` closure: callers like SearchModal's result click fire
  // updateSettings and setLang back to back in the same event, and both
  // would otherwise read the same pre-click `settings` snapshot, so the
  // second call's spread would silently drop the first call's change.
  const setLang = useCallback((l: LangKey) => {
    setLangState(l);
    setSettings((prev) => ({ ...prev, lastLang: l }));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  // Persisting here, keyed off the settled `settings` value, means every
  // update path (however many setSettings calls landed in one event) is
  // saved exactly once with its final merged shape. A failed save (storage
  // quota, or unavailable e.g. private browsing) never crashes anything —
  // it's a plain thrown exception inside saveSettings' own try/catch — but
  // silently dropping new progress forever without the reader ever knowing
  // is a real problem on its own, so a failure here gets one retry against
  // an aggressively trimmed copy (emergencyTrim), and only warns if even
  // that doesn't fit.
  useEffect(() => {
    if (!ready) return;
    saveSettings(settings).then((ok) => {
      if (ok) return;
      const trimmed = emergencyTrim(settings);
      saveSettings(trimmed).then((ok2) => {
        if (ok2) setSettings(trimmed);
        else toast(UI[langRef.current].storageFullToast);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, ready]);

  const toast = useCallback((msg: string, durationMs = 2200) => {
    setToastMsg(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), durationMs);
  }, []);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        settings,
        updateSettings,
        ready,
        markContentReady,
        toast,
        toastMsg,
        offlineReady,
        offlineCount,
        offlineTotal,
        updateAvailable: updateState.available,
        checkingForUpdate: updateState.checking,
        checkForUpdate,
        applyUpdate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
