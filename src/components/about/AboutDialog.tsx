import { useTranslation } from "@/locales";
import "./AboutDialog.css";

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  const t = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="about-dialog-overlay" onClick={onClose}>
      <div className="about-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="about-dialog-header">
          <h2>{t.about.title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="about-dialog-content">
          <div className="about-logo">
            <div className="about-logo-icon">🎨</div>
            <h1>PixelCraft</h1>
            <p className="about-version">Version 1.0.0</p>
          </div>
          <div className="about-description">
            <p>{t.about.description}</p>
          </div>
          <div className="about-info">
            <div className="about-info-item">
              <strong>{t.about.author}:</strong> PixelCraft Team
            </div>
            <div className="about-info-item">
              <strong>{t.about.license}:</strong> MIT License
            </div>
            <div className="about-info-item">
              <strong>{t.about.repository}:</strong>{" "}
              <a href="https://github.com/pixelcraft/pixelcraft" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </div>
          </div>
          <div className="about-features">
            <h3>{t.about.features}</h3>
            <ul>
              <li>{t.about.feature1}</li>
              <li>{t.about.feature2}</li>
              <li>{t.about.feature3}</li>
              <li>{t.about.feature4}</li>
              <li>{t.about.feature5}</li>
            </ul>
          </div>
        </div>
        <div className="about-dialog-footer">
          <button onClick={onClose}>{t.ui.close}</button>
        </div>
      </div>
    </div>
  );
}

export default AboutDialog;
