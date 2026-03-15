import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/locales";
import "./ImageInfoCard.css";

function ImageInfoCard() {
  const { importedImage } = useAppStore();
  const t = useTranslation();

  if (!importedImage) {
    return null;
  }

  return (
    <div className="image-info-card">
      <h3>{t.ui.imageInfo}</h3>
      <div className="info-row">
        <span className="info-label">{t.ui.path}:</span>
        <span className="info-value">{importedImage.path}</span>
      </div>
      <div className="info-row">
        <span className="info-label">{t.ui.dimensions}:</span>
        <span className="info-value">
          {importedImage.width} × {importedImage.height} {t.ui.pixels}
        </span>
      </div>
    </div>
  );
}

export default ImageInfoCard;
