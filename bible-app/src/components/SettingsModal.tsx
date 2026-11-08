import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { UI, LANGUAGES, fmt } from "../data/languages";
import { GENESIS_1 } from "../data/genesis1";
import { tts } from "../lib/tts";
import type { RetentionUnit } from "../lib/db";

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    lang,
    settings,
    updateSettings,
    offlineReady,
    offlineCount,
    offlineTotal,
    updateAvailable,
    checkingForUpdate,
    checkForUpdate,
    applyUpdate,
  } = useApp();
  const t = UI[lang];

  // Voices load asynchronously on some browsers (empty on first paint,
  // populated once "voiceschanged" fires), so this re-reads the list on
  // that event rather than assuming it's ready immediately.
  const speechLang = LANGUAGES.find((l) => l.key === lang)?.speechLang ?? "en-US";
  const langPrefix = speechLang.split("-")[0];
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => tts.listVoices(langPrefix));
  useEffect(() => {
    setVoices(tts.listVoices(langPrefix));
    return tts.subscribeVoicesChanged(() => setVoices(tts.listVoices(langPrefix)));
  }, [langPrefix]);
  // If the saved choice no longer appears in the (now novelty-filtered)
  // voice list — e.g. it was a novelty voice picked before that filter
  // existed — treat it as unset rather than showing a dropdown selection
  // that doesn't match any option.
  const savedVoiceURI = settings.voiceByLang[lang] ?? "";
  const chosenVoiceURI = voices.some((v) => v.voiceURI === savedVoiceURI) ? savedVoiceURI : "";

  // Buffered separately from settings.planRetention.amount: committing
  // Math.max(1, ...) on every keystroke made the field impossible to
  // clear and retype into, since a controlled input immediately snaps
  // back to displaying "1" the instant the user deletes the digit,
  // before they get a chance to type a new one. This lets the field
  // sit empty (or mid-edit) while typing, and only clamps/commits a
  // real value to settings once there's a valid number to commit — or
  // falls back to the last saved value on blur if left empty/invalid.
  const [retentionAmountText, setRetentionAmountText] = useState(String(settings.planRetention.amount));
  useEffect(() => {
    setRetentionAmountText(String(settings.planRetention.amount));
  }, [settings.planRetention.amount]);

  return (
    <div className={`modal-screen${open ? " open" : ""}`}>
      <div className="modal-head">
        <h2>{t.drawerSettings}</h2>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          &#10005;
        </button>
      </div>
      <div className="modal-body settings-body">
        <div className="settings-section">
          <div className="settings-label">{t.fontSizeLabel}</div>
          <input
            className="settings-slider"
            type="range"
            min={0.85}
            max={5}
            step={0.05}
            value={settings.fontScale}
            onChange={(e) => {
              const v = Number(e.target.value);
              updateSettings({ fontScale: v });
              document.documentElement.style.setProperty("--font-scale", String(v));
            }}
          />
          <div className="font-preview">{`1:1  ${GENESIS_1[lang].verses[0].t}`}</div>
        </div>

        <div className="settings-section">
          <div className="settings-label">{t.themeLabel}</div>
          <div className="seg-row">
            {(["light", "dark", "auto"] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                className={`seg-btn${settings.theme === choice ? " active" : ""}`}
                onClick={() => updateSettings({ theme: choice })}
              >
                {choice === "light" ? t.themeLight : choice === "dark" ? t.themeDark : t.themeAuto}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-label">{t.voiceLabel}</div>
          {voices.length > 0 ? (
            <div className="voice-row">
              <select
                className="voice-select"
                value={chosenVoiceURI}
                onChange={(e) => updateSettings({ voiceByLang: { ...settings.voiceByLang, [lang]: e.target.value || undefined } })}
              >
                <option value="">{t.voiceAutoLabel}</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="voice-preview-btn"
                onClick={() => tts.toggle("voice-preview", GENESIS_1[lang].verses[0].t, lang, chosenVoiceURI || undefined)}
              >
                {t.voicePreviewLabel}
              </button>
            </div>
          ) : (
            <div className="empty-note">{t.voiceNoneLabel}</div>
          )}
        </div>

        <div className="settings-section">
          <div className="settings-label">{t.offlineStatusLabel}</div>
          <div className={`offline-status${offlineReady ? " ready" : ""}`}>
            <span className="dot" />
            {offlineReady ? t.offlineReadyLabel : fmt(t.offlinePreparingTpl, { n: offlineCount, total: offlineTotal })}
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-label">{t.planRetentionSectionLabel}</div>
          <label className="retention-toggle-row">
            <input
              type="checkbox"
              checked={settings.planRetention.enabled}
              onChange={(e) => updateSettings({ planRetention: { ...settings.planRetention, enabled: e.target.checked } })}
            />
            <span>{t.planRetentionToggleLabel}</span>
          </label>
          {settings.planRetention.enabled && (
            <div className="retention-detail-row">
              <span>{t.planRetentionAfterLabel}</span>
              <input
                type="number"
                min={1}
                className="retention-amount-input"
                value={retentionAmountText}
                onChange={(e) => {
                  const text = e.target.value;
                  setRetentionAmountText(text);
                  const n = Number(text);
                  if (text !== "" && Number.isFinite(n) && n >= 1) {
                    updateSettings({ planRetention: { ...settings.planRetention, amount: Math.floor(n) } });
                  }
                }}
                onBlur={() => setRetentionAmountText(String(settings.planRetention.amount))}
              />
              <select
                className="voice-select retention-unit-select"
                value={settings.planRetention.unit}
                onChange={(e) => updateSettings({ planRetention: { ...settings.planRetention, unit: e.target.value as RetentionUnit } })}
              >
                <option value="days">{t.planRetentionUnitDays}</option>
                <option value="months">{t.planRetentionUnitMonths}</option>
                <option value="years">{t.planRetentionUnitYears}</option>
              </select>
            </div>
          )}
        </div>

        <div className="settings-section">
          <div className="settings-label">{t.updateStatusLabel}</div>
          {updateAvailable ? (
            <button type="button" className="update-btn available" onClick={() => applyUpdate()}>
              {t.updateAvailableLabel} — {t.updateApplyButton}
            </button>
          ) : (
            <button type="button" className="update-btn" disabled={checkingForUpdate} onClick={() => checkForUpdate()}>
              {checkingForUpdate ? t.updateCheckingLabel : t.updateCheckButton}
            </button>
          )}
          {!updateAvailable && !checkingForUpdate && (
            <div className="update-hint">{t.updateUpToDateLabel}</div>
          )}
        </div>

        <div className="settings-section settings-about">
          <div className="settings-label">{t.aboutLabel}</div>
          <div className="about-row">
            <span>{t.versionLabel}</span>
            <span className="v">0.1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
