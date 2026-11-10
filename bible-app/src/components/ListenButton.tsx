import { useEffect, useState } from "react";
import { tts } from "../lib/tts";
import { useApp } from "../context/AppContext";
import { UI } from "../data/languages";

export function ListenButton({
  id,
  text,
  disabled,
}: {
  id: string;
  text: string | string[];
  disabled?: boolean;
}) {
  const { lang, settings, toast } = useApp();
  const [speaking, setSpeaking] = useState(false);
  const t = UI[lang];

  useEffect(() => {
    return tts.subscribe(id, setSpeaking);
  }, [id]);

  return (
    <div className="toolbar-play-btn-wrap">
      <button
        type="button"
        className={`toolbar-play-btn${speaking ? " active" : ""}`}
        aria-label={speaking ? t.stopLabel : t.listenLabel}
        disabled={disabled}
        onClick={() => {
          if (!tts.isSupported) {
            toast(t.ttsUnavailable);
            return;
          }
          tts.toggle(id, text, lang, settings.voiceByLang[lang]);
        }}
      >
        <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
          {speaking ? (
            <>
              <rect x="5" y="4" width="4" height="12" rx="1" />
              <rect x="11" y="4" width="4" height="12" rx="1" />
            </>
          ) : (
            <path d="M6 4l10 6-10 6V4z" />
          )}
        </svg>
      </button>
    </div>
  );
}
