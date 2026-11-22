import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { UI } from "../data/languages";
import { loadBookMap, loadBookMapZh, bookHasTempleDiagram, getTempleDiagramUrl, getTempleDiagramUrlZh } from "../lib/maps";

export function MapModal({ open, bookId, bookLabel, onClose }: { open: boolean; bookId: string; bookLabel: string; onClose: () => void }) {
  const { lang } = useApp();
  const t = UI[lang];
  const [svg, setSvg] = useState<string | null>(null);
  const [svgZh, setSvgZh] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setSvg(null);
    setSvgZh(null);
    loadBookMap(bookId).then((s) => {
      if (!cancelled) setSvg(s);
    });
    loadBookMapZh(bookId).then((s) => {
      if (!cancelled) setSvgZh(s);
    });
    return () => {
      cancelled = true;
    };
  }, [open, bookId]);

  return (
    <div className={`modal-screen${open ? " open" : ""}`}>
      <div className="modal-head">
        <h2>{bookLabel}</h2>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          &#10005;
        </button>
      </div>
      <div className="modal-body">
        {svg ? (
          <>
            <div className="map-section-label">{t.mapEnglishSection}</div>
            <div className="maparea" dangerouslySetInnerHTML={{ __html: svg }} />
          </>
        ) : (
          <div className="empty-note">{t.loadingLabel}</div>
        )}
        {svgZh && (
          <>
            <div className="map-section-label">{t.mapChineseSection}</div>
            <div className="maparea" dangerouslySetInnerHTML={{ __html: svgZh }} />
          </>
        )}
        {bookHasTempleDiagram(bookId) && (
          <>
            <div className="map-section-label">{t.mapTempleSection}</div>
            <img className="maparea" src={getTempleDiagramUrl(bookId) ?? undefined} alt="" />
            <img className="maparea" src={getTempleDiagramUrlZh(bookId) ?? undefined} alt="" />
          </>
        )}
      </div>
    </div>
  );
}
