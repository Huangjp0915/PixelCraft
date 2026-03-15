import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/locales";
import "./TransformControl.css";

function CanvasSizeControl() {
  const { transformSettings, setTransformSettings } = useAppStore();
  const t = useTranslation();

  const handleSyncToResolution = () => {
    setTransformSettings({
      canvasWidth: transformSettings.targetWidth,
      canvasHeight: transformSettings.targetHeight,
    });
  };

  return (
    <div className="transform-control">
      <label className="control-label">{t.ui.canvasSize}</label>
      <div className="control-row">
        <div className="control-field">
          <label>{t.ui.width}</label>
          <input
            type="number"
            min="8"
            max="1024"
            value={transformSettings.canvasWidth}
            onChange={(e) =>
              setTransformSettings({
                canvasWidth: parseInt(e.target.value) || transformSettings.targetWidth,
              })
            }
          />
        </div>
        <div className="control-field">
          <label>{t.ui.height}</label>
          <input
            type="number"
            min="8"
            max="1024"
            value={transformSettings.canvasHeight}
            onChange={(e) =>
              setTransformSettings({
                canvasHeight: parseInt(e.target.value) || transformSettings.targetHeight,
              })
            }
          />
        </div>
      </div>
      <button
        type="button"
        className="sync-button"
        onClick={handleSyncToResolution}
      >
        {t.ui.syncToResolution}
      </button>
      <span className="control-hint">
        {t.ui.canvasSizeHint}
      </span>
    </div>
  );
}

export default CanvasSizeControl;
