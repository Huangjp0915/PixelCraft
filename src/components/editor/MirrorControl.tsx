import { useEditorStore } from "@/store/useEditorStore";
import { useTranslation } from "@/locales";
import "./MirrorControl.css";

function MirrorControl() {
  const { mirrorMode, setMirrorMode } = useEditorStore();
  const t = useTranslation();

  return (
    <div className="mirror-control">
      <label className="mirror-label">{t.ui.mirrorDrawing}</label>
      <div className="mirror-options">
        <button
          className={`mirror-button ${mirrorMode === "none" ? "active" : ""}`}
          onClick={() => setMirrorMode("none")}
          title={t.ui.noMirror}
        >
          {t.ui.noMirror}
        </button>
        <button
          className={`mirror-button ${mirrorMode === "horizontal" ? "active" : ""}`}
          onClick={() => setMirrorMode("horizontal")}
          title={t.ui.horizontalMirror}
        >
          ↔
        </button>
        <button
          className={`mirror-button ${mirrorMode === "vertical" ? "active" : ""}`}
          onClick={() => setMirrorMode("vertical")}
          title={t.ui.verticalMirror}
        >
          ↕
        </button>
        <button
          className={`mirror-button ${mirrorMode === "both" ? "active" : ""}`}
          onClick={() => setMirrorMode("both")}
          title={t.ui.bothMirror}
        >
          ⤡
        </button>
      </div>
    </div>
  );
}

export default MirrorControl;
