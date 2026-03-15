import { useAppStore } from "@/store/useAppStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useTranslation } from "@/locales";
import "./PaletteSelector.css";

function PaletteSelector() {
  const { pixelDocument } = useAppStore();
  const { currentColorIndex, setCurrentColorIndex } = useEditorStore();
  const t = useTranslation();

  if (!pixelDocument || !pixelDocument.palette || pixelDocument.palette.length === 0) {
    return null;
  }

  // 透明色固定为最后一个，显示为特殊样式
  // transparentIndex 用于标识透明色位置，虽然当前未直接使用，但保留以备将来功能扩展
  // const transparentIndex = pixelDocument.palette.length - 1;
  const isTransparent = (color: string) => {
    return color.toUpperCase() === '#00000000' || color.toUpperCase() === '00000000';
  };

  return (
    <div className="palette-selector">
      <label className="palette-label">{t.ui.palette}</label>
      <div className="palette-grid">
        {pixelDocument.palette.map((color, index) => {
          const isTransparentColor = isTransparent(color);
          // transparentIndex 用于标识透明色位置，虽然当前未直接使用，但保留以备将来功能扩展
          
          return (
            <button
              key={index}
              className={`palette-color ${currentColorIndex === index ? "selected" : ""} ${isTransparentColor ? "transparent-color" : ""}`}
              style={isTransparentColor ? {
                backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              } : { backgroundColor: color }}
              title={isTransparentColor ? `${t.ui.transparentColor} (Index ${index})` : `${t.ui.colorIndex} ${index}: ${color}`}
              onClick={() => setCurrentColorIndex(index)}
            >
              {isTransparentColor && <span className="transparent-label">{t.ui.transparentColor}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PaletteSelector;
