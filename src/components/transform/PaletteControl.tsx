import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/locales";
import "./TransformControl.css";

function PaletteControl() {
  const { transformSettings, setTransformSettings } = useAppStore();
  const t = useTranslation();

  return (
    <div className="transform-control">
      <label className="control-label">{t.ui.paletteCount}</label>
      <div className="control-field">
        <input
          type="number"
          min="2"
          max="256"
          value={transformSettings.colorCount}
          onChange={(e) =>
            setTransformSettings({
              colorCount: parseInt(e.target.value) || 16,
            })
          }
        />
        <span className="control-hint">{t.ui.paletteCountHint}</span>
      </div>
    </div>
  );
}

export default PaletteControl;
