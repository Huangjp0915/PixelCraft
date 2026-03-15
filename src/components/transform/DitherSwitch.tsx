import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/locales";
import "./TransformControl.css";

function DitherSwitch() {
  const { transformSettings, setTransformSettings } = useAppStore();
  const t = useTranslation();

  return (
    <div className="transform-control">
      <label className="control-label">{t.ui.dithering}</label>
      <div className="control-checkbox">
        <label>
          <input
            type="checkbox"
            checked={transformSettings.dithering}
            onChange={(e) =>
              setTransformSettings({ dithering: e.target.checked })
            }
          />
          <span>{t.ui.enableDithering}</span>
        </label>
      </div>
      <span className="control-hint">
        {t.ui.ditheringHint}
      </span>
    </div>
  );
}

export default DitherSwitch;
