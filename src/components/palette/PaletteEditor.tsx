import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useToastStore } from "@/store/useToastStore";
import { useTranslation } from "@/locales";
import "./PaletteEditor.css";

function PaletteEditor() {
  const { pixelDocument, setPixelDocument } = useAppStore();
  const { currentColorIndex, setCurrentColorIndex } = useEditorStore();
  const { showToast } = useToastStore();
  const t = useTranslation();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editColor, setEditColor] = useState<string>("");

  if (!pixelDocument) {
    return null;
  }

  const handleColorClick = (index: number) => {
    setCurrentColorIndex(index);
  };

  const handleColorEdit = (index: number) => {
    setEditingIndex(index);
    setEditColor(pixelDocument.palette[index]);
  };

  const handleColorSave = (index: number) => {
    if (!pixelDocument) return;
    
    // 验证颜色格式
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
    if (!colorRegex.test(editColor)) {
      showToast(t.ui.invalidColorFormat, "warning");
      return;
    }

    // 更新调色板
    const newPalette = [...pixelDocument.palette];
    newPalette[index] = editColor;

    const newDocument = {
      ...pixelDocument,
      palette: newPalette,
    };

    setPixelDocument(newDocument);
    setEditingIndex(null);
    setEditColor("");
  };

  const handleColorDelete = (index: number) => {
    if (!pixelDocument) return;
    if (pixelDocument.palette.length <= 1) {
      showToast(t.ui.paletteMinColors, "warning");
      return;
    }

    // 从调色板中移除颜色
    const newPalette = pixelDocument.palette.filter((_, i) => i !== index);
    
    // 更新所有使用该颜色的像素（使用索引 0）
    const newPixels = pixelDocument.pixels.map((pixelIndex) => {
      if (pixelIndex === index) {
        return 0; // 使用第一个颜色
      } else if (pixelIndex > index) {
        return pixelIndex - 1; // 调整索引
      }
      return pixelIndex;
    });

    const newDocument = {
      ...pixelDocument,
      palette: newPalette,
      pixels: newPixels,
    };

    setPixelDocument(newDocument);
    
    // 如果删除的是当前颜色，切换到第一个颜色
    if (currentColorIndex === index) {
      setCurrentColorIndex(0);
    } else if (currentColorIndex > index) {
      setCurrentColorIndex(currentColorIndex - 1);
    }
  };

  const handleAddColor = () => {
    if (!pixelDocument) return;
    
    const newPalette = [...pixelDocument.palette, "#000000"];
    const newDocument = {
      ...pixelDocument,
      palette: newPalette,
    };
    setPixelDocument(newDocument);
  };

  const handleSortPalette = () => {
    if (!pixelDocument) return;
    
    // 按颜色值排序（RGB）
    const indexedPalette = pixelDocument.palette.map((color, index) => ({ color, index }));
    indexedPalette.sort((a, b) => {
      const aRgb = parseInt(a.color.slice(1, 7), 16);
      const bRgb = parseInt(b.color.slice(1, 7), 16);
      return aRgb - bRgb;
    });

    // 创建新的调色板和像素映射
    const newPalette = indexedPalette.map((item) => item.color);
    const indexMap = new Map(indexedPalette.map((item, newIndex) => [item.index, newIndex]));
    
    const newPixels = pixelDocument.pixels.map((oldIndex) => indexMap.get(oldIndex) || 0);

    const newDocument = {
      ...pixelDocument,
      palette: newPalette,
      pixels: newPixels,
    };

    setPixelDocument(newDocument);
    
    // 更新当前颜色索引
    const newCurrentIndex = indexMap.get(currentColorIndex) || 0;
    setCurrentColorIndex(newCurrentIndex);
  };

  const handleRemoveDuplicates = () => {
    if (!pixelDocument) return;
    
    const seen = new Map<string, number>();
    const newPalette: string[] = [];
    const indexMap = new Map<number, number>();

    pixelDocument.palette.forEach((color, oldIndex) => {
      const normalizedColor = color.toUpperCase();
      if (!seen.has(normalizedColor)) {
        const newIndex = newPalette.length;
        seen.set(normalizedColor, newIndex);
        newPalette.push(color);
        indexMap.set(oldIndex, newIndex);
      } else {
        indexMap.set(oldIndex, seen.get(normalizedColor)!);
      }
    });

    const newPixels = pixelDocument.pixels.map((oldIndex) => indexMap.get(oldIndex) || 0);

    const newDocument = {
      ...pixelDocument,
      palette: newPalette,
      pixels: newPixels,
    };

    setPixelDocument(newDocument);
    
    // 更新当前颜色索引
    const newCurrentIndex = indexMap.get(currentColorIndex) || 0;
    setCurrentColorIndex(newCurrentIndex);
  };

  return (
    <div className="palette-editor">
      <div className="palette-editor-header">
        <h3>{t.ui.paletteEditor}</h3>
        <div className="palette-editor-actions">
          <button onClick={handleSortPalette} title={t.ui.sortByColor}>
            {t.ui.sort}
          </button>
          <button onClick={handleRemoveDuplicates} title={t.ui.removeDuplicates}>
            {t.ui.deduplicate}
          </button>
          <button onClick={handleAddColor} title={t.ui.addColor}>
            {t.ui.add}
          </button>
        </div>
      </div>
      <div className="palette-editor-colors">
        {pixelDocument.palette.map((color, index) => (
          <div
            key={index}
            className={`palette-editor-color-item ${
              currentColorIndex === index ? "active" : ""
            }`}
          >
            <div
              className="palette-editor-color-swatch"
              style={{ backgroundColor: color }}
              onClick={() => handleColorClick(index)}
              title={`${t.ui.colorIndex} ${index}: ${color}`}
            />
            {editingIndex === index ? (
              <div className="palette-editor-color-edit">
                <input
                  type="text"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleColorSave(index);
                    } else if (e.key === "Escape") {
                      setEditingIndex(null);
                      setEditColor("");
                    }
                  }}
                  autoFocus
                />
                <button onClick={() => handleColorSave(index)}>✓</button>
                <button onClick={() => {
                  setEditingIndex(null);
                  setEditColor("");
                }}>×</button>
              </div>
            ) : (
              <div className="palette-editor-color-info">
                <span className="palette-editor-color-value">{color}</span>
                <div className="palette-editor-color-buttons">
                  <button
                    onClick={() => handleColorEdit(index)}
                    title={t.ui.editColor}
                  >
                    ✎
                  </button>
                  {pixelDocument.palette.length > 1 && (
                    <button
                      onClick={() => handleColorDelete(index)}
                      title={t.ui.deleteColor}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaletteEditor;
