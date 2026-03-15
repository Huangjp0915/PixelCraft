import { useProjectStore } from "@/store/useProjectStore";
import "./StatusBar.css";

function StatusBar() {
  const { currentProjectPath, hasUnsavedChanges } = useProjectStore();

  return (
    <footer className="status-bar">
      <div className="status-left">
        {hasUnsavedChanges && (
          <span className="status-unsaved">● 未保存</span>
        )}
        {currentProjectPath && (
          <span className="status-project">
            {currentProjectPath.split(/[/\\]/).pop()}
          </span>
        )}
        {!hasUnsavedChanges && !currentProjectPath && (
          <span className="status-item">就绪</span>
        )}
      </div>
      <div className="status-right">
        <span className="status-item">PixelCraft v0.1.0</span>
      </div>
    </footer>
  );
}

export default StatusBar;
