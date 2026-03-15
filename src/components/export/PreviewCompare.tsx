import { useMemo, useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { readImageBase64 } from "@/services/tauri/commands";
import "./PreviewCompare.css";

interface PreviewCompareProps {
  scale?: number;
}

function PreviewCompare({ scale = 1 }: PreviewCompareProps) {
  const { pixelDocument, importedImage } = useAppStore();
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // 读取原图并转换为 base64
  useEffect(() => {
    if (importedImage?.path) {
      setImageError(false);
      setImageSrc(null);
      
      // 异步读取图片并转换为 base64
      readImageBase64(importedImage.path)
        .then((base64Url) => {
          console.log("原图读取成功:", importedImage.path);
          setImageSrc(base64Url);
          setImageError(false);
        })
        .catch((error) => {
          console.error("原图读取失败:", error);
          setImageError(true);
          setImageSrc(null);
        });
    } else {
      setImageSrc(null);
      setImageError(false);
    }
  }, [importedImage?.path]);

  const previewData = useMemo(() => {
    if (!pixelDocument) return null;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const width = pixelDocument.width * scale;
    const height = pixelDocument.height * scale;
    canvas.width = width;
    canvas.height = height;

    // 渲染像素画
    for (let y = 0; y < pixelDocument.height; y++) {
      for (let x = 0; x < pixelDocument.width; x++) {
        const index = y * pixelDocument.width + x;
        const paletteIndex = pixelDocument.pixels[index];
        const safeIndex = Math.min(paletteIndex, pixelDocument.palette.length - 1);
        const color = pixelDocument.palette[safeIndex] || "#000000";

        // 检查是否是透明色
        const isTransparent = color.toUpperCase() === "#00000000" || color.toUpperCase() === "00000000";
        
        if (!isTransparent) {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }

    return canvas.toDataURL("image/png");
  }, [pixelDocument, scale]);

  if (!pixelDocument) {
    return (
      <div className="preview-compare-placeholder">
        <p>请先生成像素画</p>
      </div>
    );
  }

  return (
    <div className="preview-compare">
      <div className="preview-item">
        <label className="preview-label">原图</label>
        <div className="preview-image-container">
          {importedImage ? (
            imageSrc ? (
              <img
                src={imageSrc}
                alt="原图"
                className="preview-image"
                onError={() => {
                  console.error("图片加载失败:", imageSrc);
                  setImageError(true);
                }}
                onLoad={() => {
                  console.log("图片加载成功:", imageSrc);
                  setImageError(false);
                }}
              />
            ) : imageError ? (
              <div className="preview-placeholder">
                图片加载失败
                <br />
                <small>{importedImage.path}</small>
              </div>
            ) : (
              <div className="preview-placeholder">加载中...</div>
            )
          ) : (
            <div className="preview-placeholder">无原图</div>
          )}
        </div>
      </div>

      <div className="preview-item">
        <label className="preview-label">像素画 ({scale}×)</label>
        <div className="preview-image-container">
          {previewData ? (
            <img
              src={previewData}
              alt="像素画预览"
              className="preview-image"
            />
          ) : (
            <div className="preview-placeholder">生成中...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewCompare;
