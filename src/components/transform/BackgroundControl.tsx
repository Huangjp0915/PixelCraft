import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/locales";
import "./TransformControl.css";

function BackgroundControl() {
  const { transformSettings, setTransformSettings } = useAppStore();
  const t = useTranslation();

  return (
    <div className="transform-control">
      <label className="control-label">{t.ui.backgroundMode}</label>
      
      <div className="control-radio-group">
        <label>
          <input
            type="radio"
            name="backgroundMode"
            value="transparent"
            checked={transformSettings.backgroundMode === "transparent"}
            onChange={(e) => {
              const mode = e.target.value as "transparent" | "solid";
              console.log("背景模式变更:", mode);
              setTransformSettings({ backgroundMode: mode });
            }}
          />
          <span>{t.ui.transparent}</span>
        </label>
        <label>
          <input
            type="radio"
            name="backgroundMode"
            value="solid"
            checked={transformSettings.backgroundMode === "solid"}
            onChange={(e) => {
              const mode = e.target.value as "transparent" | "solid";
              console.log("背景模式变更:", mode);
              setTransformSettings({ backgroundMode: mode });
            }}
          />
          <span>{t.ui.solid}</span>
        </label>
      </div>

      {transformSettings.backgroundMode === "solid" && (
        <div className="control-field">
          <label>{t.ui.backgroundColor}</label>
          <div className="color-picker-row">
            <input
              type="color"
              value={transformSettings.backgroundColor || "#FFFFFF"}
              onChange={(e) => {
                console.log("背景色变更:", e.target.value);
                setTransformSettings({ backgroundColor: e.target.value });
              }}
            />
            <input
              type="text"
              value={transformSettings.backgroundColor || "#FFFFFF"}
              onChange={(e) => {
                console.log("背景色文本变更:", e.target.value);
                setTransformSettings({ backgroundColor: e.target.value });
              }}
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BackgroundControl;
