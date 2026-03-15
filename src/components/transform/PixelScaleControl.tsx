import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/locales";
import "./TransformControl.css";

const PIXEL_SCALE_OPTIONS = [1, 2, 4, 8, 16];

function PixelScaleControl() {
  const { transformSettings, setTransformSettings } = useAppStore();
  const t = useTranslation();

  return (
    <div className="transform-control">
      <label className="control-label">{t.ui.pixelSize}</label>
      <div className="control-field">
        <div className="scale-buttons">
          {PIXEL_SCALE_OPTIONS.map((scale) => (
            <button
              key={scale}
              type="button"
              className={`scale-button ${
                transformSettings.pixelScale === scale ? "active" : ""
              }`}
              onClick={() => setTransformSettings({ pixelScale: scale })}
            >
              {scale}x
            </button>
          ))}
        </div>
        <span className="control-hint">{t.ui.pixelSizeHint}</span>
      </div>
    </div>
  );
}

export default PixelScaleControl;
