import { useState, useMemo } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useShortcutStore } from "@/store/useShortcutStore";
import { useTranslation } from "@/locales";
import "./HelpDialog.css";

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  const { language, setLanguage } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();
  const { shortcuts, setShortcut, resetShortcuts } = useShortcutStore();
  const t = useTranslation();
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const shortcutList = useMemo(() => [
    { 
      category: t.help.fileOperations, 
      key: "fileOperations" as const,
      items: [
        { key: "newProject" as const, desc: t.help.newProject },
        { key: "openProject" as const, desc: t.help.openProject },
        { key: "saveProject" as const, desc: t.help.saveProject },
        { key: "saveAs" as const, desc: t.help.saveAs },
        { key: "export" as const, desc: t.help.exportImage },
      ]
    },
    { 
      category: t.help.editOperations, 
      key: "editOperations" as const,
      items: [
        { key: "undo" as const, desc: t.help.undo },
        { key: "redo" as const, desc: t.help.redo },
        { key: "deleteSelection" as const, desc: t.help.deleteSelection },
      ]
    },
    { 
      category: t.help.toolSwitch, 
      key: "toolSwitch" as const,
      items: [
        { key: "brush" as const, desc: t.help.brushTool },
        { key: "eraser" as const, desc: t.help.eraserTool },
        { key: "eyedropper" as const, desc: t.help.eyedropperTool },
        { key: "paintbucket" as const, desc: t.help.paintbucketTool },
        { key: "select" as const, desc: t.help.selectTool },
      ]
    },
    { 
      category: t.help.viewOperations, 
      key: "viewOperations" as const,
      items: [
        { key: "zoomIn" as const, desc: t.help.zoomIn },
        { key: "zoomOut" as const, desc: t.help.zoomOut },
        { key: "resetZoom" as const, desc: t.help.resetZoom },
        { key: "toggleGrid" as const, desc: t.help.toggleGrid },
      ]
    },
  ], [t, language]);

  const handleStartEdit = (shortcutKey: keyof typeof shortcuts) => {
    setEditingShortcut(shortcutKey);
    setEditingValue(shortcuts[shortcutKey]);
  };

  const handleSaveShortcut = (shortcutKey: keyof typeof shortcuts) => {
    if (editingValue.trim()) {
      setShortcut(shortcutKey, editingValue.trim());
    }
    setEditingShortcut(null);
    setEditingValue("");
  };

  const handleCancelEdit = () => {
    setEditingShortcut(null);
    setEditingValue("");
  };

  if (!isOpen) return null;

  return (
    <div className="help-dialog-overlay" onClick={onClose}>
      <div className="help-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="help-dialog-header">
          <h2>{t.help.title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="help-dialog-content">
          <div className="help-section">
            <h3>{t.help.shortcuts}</h3>
            <div className="help-shortcut-controls">
              <button onClick={resetShortcuts} className="reset-shortcuts-button">
                {language === "zh" ? "重置为默认" : "Reset to Default"}
              </button>
            </div>
            {shortcutList.map((section) => (
              <div key={section.key} className="help-shortcut-section">
                <h4>{section.category}</h4>
                <div className="help-shortcut-list">
                  {section.items.map((item) => {
                    const shortcutKey = item.key;
                    const isEditing = editingShortcut === shortcutKey;
                    return (
                      <div key={shortcutKey} className="help-shortcut-item">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              className="help-shortcut-edit-input"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveShortcut(shortcutKey);
                                } else if (e.key === "Escape") {
                                  handleCancelEdit();
                                }
                              }}
                              autoFocus
                            />
                            <button
                              className="help-shortcut-save-button"
                              onClick={() => handleSaveShortcut(shortcutKey)}
                            >
                              ✓
                            </button>
                            <button
                              className="help-shortcut-cancel-button"
                              onClick={handleCancelEdit}
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <>
                            <kbd className="help-shortcut-key">{shortcuts[shortcutKey]}</kbd>
                            <span className="help-shortcut-desc">{item.desc}</span>
                            <button
                              className="help-shortcut-edit-button"
                              onClick={() => handleStartEdit(shortcutKey)}
                              title={language === "zh" ? "点击编辑" : "Click to edit"}
                            >
                              ✏️
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="help-section">
            <h3>{t.help.tips}</h3>
            <ul className="help-tips">
              <li>{language === "zh" ? "导入图片后，调整参数并点击\"生成像素画\"进行转换" : "After importing an image, adjust parameters and click \"Generate Pixel Art\" to convert"}</li>
              <li>{language === "zh" ? "使用画笔工具可以自由绘制像素" : "Use the brush tool to freely draw pixels"}</li>
              <li>{language === "zh" ? "使用油漆桶工具可以快速填充相同颜色的区域" : "Use the paint bucket tool to quickly fill areas of the same color"}</li>
              <li>{language === "zh" ? "启用镜像绘制可以同时绘制对称图案" : "Enable mirror drawing to draw symmetric patterns simultaneously"}</li>
              <li>{language === "zh" ? "调色板编辑器可以自定义、排序和去重颜色" : "The palette editor allows you to customize, sort, and deduplicate colors"}</li>
              <li>{language === "zh" ? "工程文件可以保存当前的工作状态，方便后续继续编辑" : "Project files can save the current work state for easy continuation of editing later"}</li>
            </ul>
          </div>
          <div className="help-section">
            <h3>{t.help.language}</h3>
            <div className="help-language-controls">
              <button
                className={`language-button ${language === "zh" ? "active" : ""}`}
                onClick={() => setLanguage("zh")}
              >
                {t.help.chinese}
              </button>
              <button
                className={`language-button ${language === "en" ? "active" : ""}`}
                onClick={() => setLanguage("en")}
              >
                {t.help.english}
              </button>
            </div>
          </div>
          <div className="help-section">
            <h3>{t.help.theme}</h3>
            <div className="help-theme-controls">
              <button
                className={`theme-button ${theme === "light" ? "active" : ""}`}
                onClick={() => theme !== "light" && toggleTheme()}
              >
                {t.help.switchToLight}
              </button>
              <button
                className={`theme-button ${theme === "dark" ? "active" : ""}`}
                onClick={() => theme !== "dark" && toggleTheme()}
              >
                {t.help.switchToDark}
              </button>
            </div>
          </div>
        </div>
        <div className="help-dialog-footer">
          <button onClick={onClose}>{language === "zh" ? "关闭" : "Close"}</button>
        </div>
      </div>
    </div>
  );
}

export default HelpDialog;
