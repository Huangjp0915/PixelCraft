import { useEditorStore } from "@/store/useEditorStore";
import { useTranslation } from "@/locales";
import "./LeftToolbar.css";

function LeftToolbar() {
  const { currentTool, setCurrentTool } = useEditorStore();
  const t = useTranslation();

  return (
    <aside className="left-toolbar">
      <div className="toolbar-section">
        <h3 className="toolbar-title">{t.ui.tools}</h3>
        <div className="toolbar-tools">
          <button
            className={`tool-button ${currentTool === "brush" ? "active" : ""}`}
            title={`${t.ui.brush} (B)`}
            onClick={() => setCurrentTool("brush")}
          >
            🖌️
          </button>
          <button
            className={`tool-button ${currentTool === "eraser" ? "active" : ""}`}
            title={`${t.ui.eraser} (E)`}
            onClick={() => setCurrentTool("eraser")}
          >
            🧹
          </button>
          <button
            className={`tool-button ${currentTool === "eyedropper" ? "active" : ""}`}
            title={`${t.ui.eyedropper} (I)`}
            onClick={() => setCurrentTool("eyedropper")}
          >
            🎨
          </button>
          <button
            className={`tool-button ${currentTool === "paintbucket" ? "active" : ""}`}
            title={`${t.ui.paintbucket} (P)`}
            onClick={() => setCurrentTool("paintbucket")}
          >
            🪣
          </button>
          <button
            className={`tool-button ${currentTool === "select" ? "active" : ""}`}
            title={`${t.ui.select} (S)`}
            onClick={() => setCurrentTool("select")}
          >
            🔲
          </button>
        </div>
      </div>
    </aside>
  );
}

export default LeftToolbar;
