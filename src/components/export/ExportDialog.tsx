import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useToastStore } from "@/store/useToastStore";
import PreviewCompare from "./PreviewCompare";
import "./ExportDialog.css";

export type ExportFormat = "png" | "jpg";
export type ExportSize = "logical" | "scaled";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, size: ExportSize, scale?: number) => Promise<void>;
}

function ExportDialog({ isOpen, onClose, onExport }: ExportDialogProps) {
  const { pixelDocument, transformSettings } = useAppStore();
  const { showToast } = useToastStore();
  const [format, setFormat] = useState<ExportFormat>("png");
  const [size, setSize] = useState<ExportSize>("scaled");
  const [scale, setScale] = useState<number>(transformSettings.pixelScale);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !pixelDocument) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(format, size, size === "scaled" ? scale : undefined);
      onClose();
    } catch (error) {
      console.error("导出失败:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      showToast(`导出失败: ${errorMsg}`, "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-dialog-overlay" onClick={onClose}>
      <div className="export-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="export-dialog-header">
          <h2>导出像素画</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="export-dialog-content">
          <div className="export-preview-section">
            <PreviewCompare scale={size === "scaled" ? scale : 1} />
          </div>

          <div className="export-options-section">
            <div className="export-option-group">
              <label className="export-label">导出格式</label>
              <div className="export-radio-group">
                <label>
                  <input
                    type="radio"
                    name="format"
                    value="png"
                    checked={format === "png"}
                    onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  />
                  <span>PNG（支持透明）</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="format"
                    value="jpg"
                    checked={format === "jpg"}
                    onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  />
                  <span>JPG（纯色背景）</span>
                </label>
              </div>
            </div>

            <div className="export-option-group">
              <label className="export-label">导出尺寸</label>
              <div className="export-radio-group">
                <label>
                  <input
                    type="radio"
                    name="size"
                    value="logical"
                    checked={size === "logical"}
                    onChange={(e) => setSize(e.target.value as ExportSize)}
                  />
                  <span>逻辑尺寸（{pixelDocument.width} × {pixelDocument.height}）</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="size"
                    value="scaled"
                    checked={size === "scaled"}
                    onChange={(e) => setSize(e.target.value as ExportSize)}
                  />
                  <span>放大尺寸</span>
                </label>
              </div>
              {size === "scaled" && (
                <div className="export-scale-input">
                  <label>放大倍数：</label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={scale}
                    onChange={(e) => setScale(parseInt(e.target.value) || 1)}
                  />
                  <span>×</span>
                  <span className="export-size-preview">
                    ({pixelDocument.width * scale} × {pixelDocument.height * scale} 像素)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="export-dialog-footer">
          <button className="export-button cancel" onClick={onClose}>
            取消
          </button>
          <button
            className="export-button primary"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? "导出中..." : "导出"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportDialog;
