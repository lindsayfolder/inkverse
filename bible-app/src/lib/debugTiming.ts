// Temporary, on-device diagnostic overlay. Synthetic Playwright tests
// under throttling (this project's usual cache/opening-time audit tool)
// can't reproduce a multi-second cold open on real iOS hardware, so this
// surfaces real Navigation Timing plus a few custom marks directly on
// screen, to screenshot and send back. Remove once the investigation
// into slow cold opens concludes.

type MarkName = "scriptStart" | "settingsReady" | "firstVersesLoaded";

const marks: Partial<Record<MarkName, number>> = {};
const listeners = new Set<() => void>();

// First occurrence only, so chapter navigation after the initial load
// never overwrites firstVersesLoaded with a later chapter's timing.
export function markTiming(name: MarkName): void {
  if (name in marks) return;
  marks[name] = performance.now();
  for (const l of listeners) l();
}

export function subscribeTiming(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// All values are time-since-navigation-start (standard Navigation Timing
// semantics), not deltas between consecutive lines.
export function getDebugTimingLines(): string[] {
  const lines: string[] = [];
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav) {
    // Breaks the single navigationStart->responseStart span from before
    // into its DNS/TCP/TLS/server-wait parts, to tell a slow network/host
    // apart from something else entirely eating that time. 0 for a value
    // means "same as fetchStart" (no separate phase occurred -- e.g. a
    // reused connection has no new DNS/TCP/TLS step), not a measurement
    // failure.
    lines.push(`fetchStart: ${Math.round(nav.fetchStart)}ms`);
    lines.push(`→domainLookupStart: ${Math.round(nav.domainLookupStart)}ms`);
    lines.push(`→domainLookupEnd: ${Math.round(nav.domainLookupEnd)}ms`);
    lines.push(`→connectStart: ${Math.round(nav.connectStart)}ms`);
    lines.push(`→secureConnectionStart: ${Math.round(nav.secureConnectionStart)}ms`);
    lines.push(`→connectEnd: ${Math.round(nav.connectEnd)}ms`);
    lines.push(`→requestStart: ${Math.round(nav.requestStart)}ms`);
    lines.push(`→responseStart: ${Math.round(nav.responseStart)}ms`);
    lines.push(`→domInteractive: ${Math.round(nav.domInteractive)}ms`);
    lines.push(`→domContentLoaded: ${Math.round(nav.domContentLoadedEventEnd)}ms`);
    lines.push(`→loadEvent: ${Math.round(nav.loadEventEnd)}ms`);
    // deliveryType isn't in every TS DOM lib version yet; read it
    // defensively rather than widening the whole entry's type.
    const deliveryType = (nav as unknown as { deliveryType?: string }).deliveryType;
    lines.push(`deliveryType: ${deliveryType || "(empty)"}`);
    lines.push(`transferSize: ${nav.transferSize}`);
  }
  const fcp = performance.getEntriesByName("first-contentful-paint")[0];
  if (fcp) lines.push(`→firstContentfulPaint: ${Math.round(fcp.startTime)}ms`);
  if (marks.scriptStart !== undefined) lines.push(`→scriptStart: ${Math.round(marks.scriptStart)}ms`);
  if (marks.settingsReady !== undefined) lines.push(`→settingsReady: ${Math.round(marks.settingsReady)}ms`);
  if (marks.firstVersesLoaded !== undefined) lines.push(`→firstVersesLoaded: ${Math.round(marks.firstVersesLoaded)}ms`);
  lines.push(`SW controlled: ${typeof navigator !== "undefined" && !!navigator.serviceWorker?.controller}`);
  return lines;
}
