import { useApp } from "../context/AppContext";
import { UI } from "../data/languages";

export function CreditsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useApp();
  const t = UI[lang];

  return (
    <div className={`modal-screen${open ? " open" : ""}`}>
      <div className="modal-head">
        <h2>{t.creditsTitle}</h2>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          &#10005;
        </button>
      </div>
      <div className="modal-body settings-body">
        <p className="empty-note">{t.creditsIntro}</p>

        <div className="settings-section">
          <div className="settings-label">{t.creditsKjvHeading}</div>
          <p className="credits-box">{t.creditsKjvBody}</p>
        </div>

        <div className="settings-section">
          <div className="settings-label">{t.creditsWebHeading}</div>
          <p className="credits-box">{t.creditsWebBody}</p>
        </div>

        <div className="settings-section">
          <div className="settings-label">{t.creditsCuvHeading}</div>
          <p className="credits-box">{t.creditsCuvBody}</p>
        </div>

        <div className="settings-section">
          <div className="settings-label">{t.creditsInsightsHeading}</div>
          <p className="credits-box">{t.creditsInsightsBody}</p>
        </div>

        <div className="settings-section">
          <div className="settings-label">{t.creditsXrefHeading}</div>
          <p className="credits-box">{t.creditsXrefBody}</p>
        </div>
      </div>
    </div>
  );
}
