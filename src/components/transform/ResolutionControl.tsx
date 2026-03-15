import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/locales";
import "./TransformControl.css";

const PRESET_RESOLUTIONS = [
  { label: "16×16", width: 16, height: 16 },
  { label: "32×32", width: 32, height: 32 },
  { label: "64×64", width: 64, height: 64 },
  { label: "128×128", width: 128, height: 128 },
  { label: "256×256", width: 256, height: 256 },
];

function ResolutionControl() {
  const { importedImage, transformSettings, setTransformSettings } = useAppStore();
  const t = useTranslation();
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(false);
  const [lastAspectRatio, setLastAspectRatio] = useState(1);

  const handleWidthChange = (newWidth: number) => {
    if (maintainAspectRatio && lastAspectRatio > 0) {
      const newHeight = Math.round(newWidth / lastAspectRatio);
      setTransformSettings({
        targetWidth: newWidth,
        targetHeight: newHeight,
      });
    } else {
      setTransformSettings({ targetWidth: newWidth });
    }
  };

  const handleHeightChange = (newHeight: number) => {
    if (maintainAspectRatio && lastAspectRatio > 0) {
      const newWidth = Math.round(newHeight * lastAspectRatio);
      setTransformSettings({
        targetWidth: newWidth,
        targetHeight: newHeight,
      });
    } else {
      setTransformSettings({ targetHeight: newHeight });
    }
  };

  const handlePresetClick = (width: number, height: number) => {
    const aspectRatio = width / height;
    setLastAspectRatio(aspectRatio);
    setTransformSettings({
      targetWidth: width,
      targetHeight: height,
    });
  };

  const handleAspectRatioToggle = (checked: boolean) => {
    setMaintainAspectRatio(checked);
    if (checked && transformSettings.targetHeight > 0) {
      const aspectRatio = transformSettings.targetWidth / transformSettings.targetHeight;
      setLastAspectRatio(aspectRatio);
    }
  };

  return (
    <div className="transform-control">
      <label className="control-label">{t.ui.resolution}</label>
      
      {/* 预设分辨率 */}
      <div className="preset-buttons">
        {PRESET_RESOLUTIONS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="preset-button"
            onClick={() => handlePresetClick(preset.width, preset.height)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* 宽高输入 */}
      <div className="control-row">
        <div className="control-field">
          <label>{t.ui.width}</label>
          <input
            type="number"
            min="8"
            max="512"
            value={transformSettings.targetWidth}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 8;
              handleWidthChange(value);
            }}
          />
        </div>
        <div className="control-field">
          <label>{t.ui.height}</label>
          <input
            type="number"
            min="8"
            max="512"
            value={transformSettings.targetHeight}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 8;
              handleHeightChange(value);
            }}
          />
        </div>
      </div>

      {/* 保持宽高比选项 */}
      {importedImage && (
        <div className="control-checkbox">
          <label>
            <input
              type="checkbox"
              checked={maintainAspectRatio}
              onChange={(e) => handleAspectRatioToggle(e.target.checked)}
            />
            <span>{t.ui.maintainAspectRatio}</span>
          </label>
        </div>
      )}
    </div>
  );
}

export default ResolutionControl;
