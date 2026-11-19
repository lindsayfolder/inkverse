import { useEffect, useState } from "react";
import { getDebugTimingLines, subscribeTiming } from "../lib/debugTiming";

// Temporary on-device diagnostic -- see lib/debugTiming.ts. Remove once
// the slow-cold-open investigation concludes.
export default function DebugTimingOverlay() {
  const [dismissed, setDismissed] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => subscribeTiming(() => forceUpdate((n) => n + 1)), []);

  // SW controlled can flip from false to true shortly after load, and
  // isn't driven by the mark-based listener above -- poll briefly so
  // that line stays current too, not just the one-shot marks.
  useEffect(() => {
    const id = window.setInterval(() => forceUpdate((n) => n + 1), 300);
    const timer = window.setTimeout(() => window.clearInterval(id), 10000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(timer);
    };
  }, []);

  if (dismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "rgba(10, 14, 10, 0.92)",
        color: "#4ee44e",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        lineHeight: 1.55,
        padding: "10px 46px 10px 12px",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 2 }}>DEBUG load timing</div>
      {getDebugTimingLines().map((line) => (
        <div key={line}>{line}</div>
      ))}
      <button
        type="button"
        aria-label="Dismiss debug overlay"
        onClick={() => setDismissed(true)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: "1.5px solid #4ee44e",
          background: "transparent",
          color: "#4ee44e",
          fontSize: 14,
          lineHeight: 1,
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
}
