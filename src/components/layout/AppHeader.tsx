import { useState, useCallback, useEffect } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { useAppStore } from "@/store/useAppStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useShortcutStore } from "@/store/useShortcutStore";
import { useTranslation } from "@/locales";
import ExportDialog from "@/components/export/ExportDialog";
import { exportPng, exportJpg, loadProject, loadImage } from "@/services/tauri/commands";
import { saveFileDialog, openProjectDialog } from "@/services/tauri/dialog";
import { saveProject } from "@/services/tauri/commands";
import { createProjectFromState } from "@/services/serializers/projectSerializer";
import { useToastStore } from "@/store/useToastStore";
import type { ExportFormat, ExportSize } from "@/components/export/ExportDialog";
import HelpDialog from "@/components/help/HelpDialog";
import AboutDialog from "@/components/about/AboutDialog";
import MenuDropdown from "./MenuDropdown";
import type { MenuItem } from "./MenuDropdown";
import "./AppHeader.css";

function AppHeader() {
  const { zoom, zoomIn, zoomOut, resetZoom, resetOffset, setOffset, showGrid, setShowGrid } = useEditorStore();
  const { pixelDocument, transformSettings, setPixelDocument, importedImage, setImportedImage, setTransformSettings } = useAppStore();
  const { undo, redo, canUndo, canRedo, clearHistory, pushHistory } = useHistoryStore();
  const { setCurrentProjectPath, setHasUnsavedChanges, addRecentProject, currentProjectPath } = useProjectStore();
  const { showToast } = useToastStore();
  const { shortcuts } = useShortcutStore();
  const t = useTranslation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 居中画布函数
  const centerCanvas = useCallback(() => {
    if (!pixelDocument) return;
    
    const pixelSize = transformSettings.pixelScale;
    const canvasWidth = transformSettings.canvasWidth || pixelDocument.width;
    const canvasHeight = transformSettings.canvasHeight || pixelDocument.height;
    const stageWidth = canvasWidth * pixelSize;
    const stageHeight = canvasHeight * pixelSize;
    
    setTimeout(() => {
      const container = document.querySelector('.pixel-stage-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        const scaledWidth = stageWidth * zoom;
        const scaledHeight = stageHeight * zoom;
        const centerX = (rect.width - scaledWidth) / 2;
        const centerY = (rect.height - scaledHeight) / 2;
        
        if (!isNaN(centerX) && !isNaN(centerY) && isFinite(centerX) && isFinite(centerY)) {
          setOffset(centerX, centerY);
        }
      }
    }, 100);
  }, [pixelDocument, transformSettings, zoom, setOffset]);

  // 重置缩放并居中
  const resetZoomAndCenter = useCallback(() => {
    resetZoom();
    setTimeout(() => {
      if (!pixelDocument) return;
      
      const pixelSize = transformSettings.pixelScale;
      const canvasWidth = transformSettings.canvasWidth || pixelDocument.width;
      const canvasHeight = transformSettings.canvasHeight || pixelDocument.height;
      const stageWidth = canvasWidth * pixelSize;
      const stageHeight = canvasHeight * pixelSize;
      
      const container = document.querySelector('.pixel-stage-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        const scaledWidth = stageWidth * 1;
        const scaledHeight = stageHeight * 1;
        const centerX = (rect.width - scaledWidth) / 2;
        const centerY = (rect.height - scaledHeight) / 2;
        
        if (!isNaN(centerX) && !isNaN(centerY) && isFinite(centerX) && isFinite(centerY)) {
          setOffset(centerX, centerY);
        }
      }
    }, 0);
  }, [pixelDocument, transformSettings, resetZoom, setOffset]);

  // 新建工程
  const handleNewProject = useCallback(() => {
    // 检查是否有未保存的更改
    const { hasUnsavedChanges } = useProjectStore.getState();
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        t.ui.pleaseImportAndGenerate ? "当前工程有未保存的更改，确定要新建工程吗？\n未保存的更改将丢失。" : "Current project has unsaved changes. Are you sure you want to create a new project?\nUnsaved changes will be lost."
      );
      if (!confirmed) {
        return;
      }
    }

    setImportedImage(null);
    setPixelDocument(null);
    setTransformSettings({
      targetWidth: 64,
      targetHeight: 64,
      pixelScale: 4,
      canvasWidth: 64,
      canvasHeight: 64,
      colorCount: 16,
      dithering: false,
      backgroundMode: "transparent",
      backgroundColor: undefined,
    });
    clearHistory();
    setCurrentProjectPath(null);
    setHasUnsavedChanges(false);
    resetZoom();
    resetOffset();
  }, [setImportedImage, setPixelDocument, setTransformSettings, clearHistory, setCurrentProjectPath, setHasUnsavedChanges, resetZoom, resetOffset, t]);

  // 打开工程
  const handleLoadProject = useCallback(async () => {
    // 检查是否有未保存的更改
    const { hasUnsavedChanges } = useProjectStore.getState();
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        t.ui.pleaseImportAndGenerate ? "当前工程有未保存的更改，确定要打开新工程吗？\n未保存的更改将丢失。" : "Current project has unsaved changes. Are you sure you want to open a new project?\nUnsaved changes will be lost."
      );
      if (!confirmed) {
        return;
      }
    }

    try {
      const selected = await openProjectDialog();
      if (!selected) {
        return;
      }

      const project = await loadProject(selected);

      // 恢复状态
      if (project.sourceImage) {
        try {
          const imageMeta = await loadImage(project.sourceImage);
          setImportedImage({
            path: imageMeta.path,
            width: imageMeta.width,
            height: imageMeta.height,
          });
        } catch (error) {
          console.warn("源图片加载失败，继续加载工程:", error);
        }
      }

      setTransformSettings(project.settings);
      setPixelDocument(project.document);
      clearHistory();
      pushHistory(project.document);

      const fileName = selected.split(/[/\\]/).pop() || selected;
      addRecentProject(selected, fileName);
      setCurrentProjectPath(selected);
      setHasUnsavedChanges(false);

      showToast(t.ui.pleaseImportAndGenerate ? `工程文件加载成功！版本: ${project.version}` : `Project loaded successfully! Version: ${project.version}`, "success");
    } catch (error) {
      console.error("加载工程文件失败:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      showToast(t.ui.pleaseImportAndGenerate ? `加载工程文件失败: ${errorMsg}` : `Failed to load project: ${errorMsg}`, "error");
    }
  }, [setImportedImage, setTransformSettings, setPixelDocument, clearHistory, pushHistory, addRecentProject, setCurrentProjectPath, setHasUnsavedChanges, showToast, t]);

  // 另存为工程（总是弹出保存对话框）
  const handleSaveProjectAs = useCallback(async () => {
    if (!pixelDocument) {
      showToast(t.ui.pleaseImportAndGenerate ? "没有可保存的像素画" : "No pixel art to save", "warning");
      return;
    }

    setIsSaving(true);
    try {
      // 如果有当前工程路径，使用当前文件名；否则生成新文件名
      let defaultName = `pixel-art-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)}.pixproj`;
      if (currentProjectPath) {
        const fileName = currentProjectPath.split(/[/\\]/).pop() || defaultName;
        defaultName = fileName;
      }

      const filters = [
        {
          name: "PixelCraft 工程",
          extensions: ["pixproj"],
        },
      ];

      const outputPath = await saveFileDialog(defaultName, filters);
      if (!outputPath) {
        setIsSaving(false);
        return;
      }

      const project = createProjectFromState(
        importedImage?.path || null,
        transformSettings,
        pixelDocument
      );

      await saveProject(project, outputPath);

      setCurrentProjectPath(outputPath);
      setHasUnsavedChanges(false);

      const fileName = outputPath.split(/[/\\]/).pop() || outputPath;
      useProjectStore.getState().addRecentProject(outputPath, fileName);

      showToast(t.ui.pleaseImportAndGenerate ? `工程文件保存成功！文件已保存到: ${outputPath}` : `Project saved successfully! File saved to: ${outputPath}`, "success", 5000);
    } catch (error) {
      console.error("保存工程文件失败:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      showToast(t.ui.pleaseImportAndGenerate ? `保存工程文件失败: ${errorMsg}` : `Failed to save project: ${errorMsg}`, "error");
    } finally {
      setIsSaving(false);
    }
  }, [pixelDocument, importedImage, transformSettings, currentProjectPath, setCurrentProjectPath, setHasUnsavedChanges, showToast, t]);

  // 保存工程（如果有路径直接保存，否则另存为）
  const handleSaveProject = useCallback(async () => {
    if (!pixelDocument) {
      showToast(t.ui.pleaseImportAndGenerate ? "没有可保存的像素画" : "No pixel art to save", "warning");
      return;
    }

    // 如果已有保存路径，直接保存
    if (currentProjectPath) {
      setIsSaving(true);
      try {
        const project = createProjectFromState(
          importedImage?.path || null,
          transformSettings,
          pixelDocument
        );

        await saveProject(project, currentProjectPath);
        setHasUnsavedChanges(false);

        showToast(t.ui.pleaseImportAndGenerate ? "工程文件保存成功！" : "Project saved successfully!", "success");
      } catch (error) {
        console.error("保存工程文件失败:", error);
        const errorMsg = error instanceof Error ? error.message : String(error);
        showToast(t.ui.pleaseImportAndGenerate ? `保存工程文件失败: ${errorMsg}` : `Failed to save project: ${errorMsg}`, "error");
      } finally {
        setIsSaving(false);
      }
    } else {
      // 没有保存路径，执行另存为
      handleSaveProjectAs();
    }
  }, [pixelDocument, importedImage, transformSettings, currentProjectPath, setHasUnsavedChanges, showToast, t, handleSaveProjectAs]);

  // 监听全局事件（快捷键触发）
  useEffect(() => {
    const handleNewProjectEvent = () => handleNewProject();
    const handleLoadProjectEvent = () => handleLoadProject();
    const handleSaveProjectEvent = () => {
      if (pixelDocument && !isSaving) {
        handleSaveProject();
      }
    };
    const handleSaveAsEvent = () => {
      if (pixelDocument && !isSaving) {
        handleSaveProjectAs();
      }
    };

    window.addEventListener("new-project", handleNewProjectEvent);
    window.addEventListener("load-project", handleLoadProjectEvent);
    window.addEventListener("save-project", handleSaveProjectEvent);
    window.addEventListener("save-project-as", handleSaveAsEvent);

    return () => {
      window.removeEventListener("new-project", handleNewProjectEvent);
      window.removeEventListener("load-project", handleLoadProjectEvent);
      window.removeEventListener("save-project", handleSaveProjectEvent);
      window.removeEventListener("save-project-as", handleSaveAsEvent);
    };
  }, [handleNewProject, handleLoadProject, handleSaveProject, handleSaveProjectAs, pixelDocument, isSaving]);

  // 文件菜单项
  const fileMenuItems: MenuItem[] = [
    {
      label: t.fileMenu.newProject,
      action: handleNewProject,
      shortcut: shortcuts.newProject,
    },
    {
      label: t.fileMenu.openProject,
      action: handleLoadProject,
      shortcut: shortcuts.openProject,
    },
    {
      label: t.fileMenu.saveProject,
      action: handleSaveProject,
      shortcut: shortcuts.saveProject,
      disabled: !pixelDocument || isSaving,
    },
    {
      label: t.fileMenu.saveAs,
      action: handleSaveProjectAs,
      shortcut: shortcuts.saveAs,
      disabled: !pixelDocument || isSaving,
    },
    { separator: true },
    {
      label: t.fileMenu.export,
      action: () => {
        if (pixelDocument) {
          setIsExportDialogOpen(true);
        }
      },
      shortcut: shortcuts.export,
      disabled: !pixelDocument,
    },
  ];

  // 编辑菜单项
  const editMenuItems: MenuItem[] = [
    {
      label: t.editMenu.undo,
      action: () => {
        const doc = undo();
        if (doc) setPixelDocument(doc);
      },
      shortcut: shortcuts.undo,
      disabled: !canUndo(),
    },
    {
      label: t.editMenu.redo,
      action: () => {
        const doc = redo();
        if (doc) setPixelDocument(doc);
      },
      shortcut: shortcuts.redo,
      disabled: !canRedo(),
    },
    { separator: true },
    {
      label: t.editMenu.deleteSelection,
      action: () => {
        // TODO: 实现删除选中区域功能
        console.log("删除选中区域");
      },
      shortcut: shortcuts.deleteSelection,
      disabled: true, // 暂时禁用，待实现
    },
  ];

  // 视图菜单项
  const viewMenuItems: MenuItem[] = [
    {
      label: t.viewMenu.zoomIn,
      action: zoomIn,
      shortcut: shortcuts.zoomIn,
    },
    {
      label: t.viewMenu.zoomOut,
      action: zoomOut,
      shortcut: shortcuts.zoomOut,
    },
    {
      label: t.viewMenu.resetZoom,
      action: resetZoomAndCenter,
      shortcut: shortcuts.resetZoom,
    },
    { separator: true },
    {
      label: t.viewMenu.centerCanvas,
      action: centerCanvas,
      disabled: !pixelDocument,
    },
    { separator: true },
    {
      label: showGrid ? t.viewMenu.hideGrid : t.viewMenu.showGrid,
      action: () => setShowGrid(!showGrid),
      shortcut: shortcuts.toggleGrid,
    },
  ];

  return (
    <header className="app-header">
      <div className="header-left">
        <h2 className="app-title">PixelCraft</h2>
      </div>
      <nav className="header-menu">
        <MenuDropdown label={t.menu.file} items={fileMenuItems} />
        <MenuDropdown label={t.menu.edit} items={editMenuItems} />
        <MenuDropdown label={t.menu.view} items={viewMenuItems} />
        <MenuDropdown 
          label={t.menu.help} 
          items={[
            {
              label: t.helpMenu.help,
              action: () => setIsHelpOpen(true),
            },
            { separator: true },
            {
              label: t.helpMenu.about,
              action: () => setIsAboutOpen(true),
            },
          ]} 
        />
      </nav>
      <div className="header-right">
        <div className="zoom-controls">
          <button
            className="zoom-button"
            onClick={zoomOut}
            title="缩小 (Ctrl+-)"
          >
            −
          </button>
          <span className="zoom-display" title="缩放比例">
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="zoom-button"
            onClick={zoomIn}
            title="放大 (Ctrl++)"
          >
            +
          </button>
          <button
            className="zoom-button"
            onClick={() => {
              resetZoom();
              // 延迟居中，确保缩放已重置
              setTimeout(() => {
                if (!pixelDocument) return;
                
                const pixelSize = transformSettings.pixelScale;
                const canvasWidth = transformSettings.canvasWidth || pixelDocument.width;
                const canvasHeight = transformSettings.canvasHeight || pixelDocument.height;
                const stageWidth = canvasWidth * pixelSize;
                const stageHeight = canvasHeight * pixelSize;
                
                const container = document.querySelector('.pixel-stage-container');
                if (container) {
                  const rect = container.getBoundingClientRect();
                  const scaledWidth = stageWidth * 1; // 缩放已重置为 1
                  const scaledHeight = stageHeight * 1;
                  const centerX = (rect.width - scaledWidth) / 2;
                  const centerY = (rect.height - scaledHeight) / 2;
                  
                  if (!isNaN(centerX) && !isNaN(centerY) && isFinite(centerX) && isFinite(centerY)) {
                    setOffset(centerX, centerY);
                  }
                }
              }, 0);
            }}
            title="重置缩放并居中 (Ctrl+0)"
          >
            1:1
          </button>
          <button
            className="zoom-button"
            onClick={() => {
              if (!pixelDocument) return;
              
              // 计算居中位置
              const pixelSize = transformSettings.pixelScale;
              const canvasWidth = transformSettings.canvasWidth || pixelDocument.width;
              const canvasHeight = transformSettings.canvasHeight || pixelDocument.height;
              const stageWidth = canvasWidth * pixelSize;
              const stageHeight = canvasHeight * pixelSize;
              
              // 延迟执行，确保容器已渲染
              setTimeout(() => {
                const container = document.querySelector('.pixel-stage-container');
                if (container) {
                  const rect = container.getBoundingClientRect();
                  const scaledWidth = stageWidth * zoom;
                  const scaledHeight = stageHeight * zoom;
                  const centerX = (rect.width - scaledWidth) / 2;
                  const centerY = (rect.height - scaledHeight) / 2;
                  
                  if (!isNaN(centerX) && !isNaN(centerY) && isFinite(centerX) && isFinite(centerY)) {
                    setOffset(centerX, centerY);
                  }
                }
              }, 100);
            }}
            title="居中画布"
          >
            ⌂
          </button>
        </div>
      </div>
      <HelpDialog isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <AboutDialog isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      {pixelDocument && (
        <ExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          onExport={async (format: ExportFormat, size: ExportSize, scale?: number) => {
            if (!pixelDocument) {
              throw new Error("没有可导出的像素画");
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
            const extension = format === "png" ? "png" : "jpg";
            const defaultName = `pixel-art-${timestamp}.${extension}`;

            const filters = [
              {
                name: format === "png" ? "PNG 图片" : "JPG 图片",
                extensions: [extension],
              },
            ];

            const outputPath = await saveFileDialog(defaultName, filters);
            if (!outputPath) {
              throw new Error("未选择保存路径");
            }

            const exportScale = size === "scaled" ? scale : 1;
            
            try {
              if (format === "png") {
                await exportPng(pixelDocument, outputPath, exportScale);
              } else {
                await exportJpg(pixelDocument, outputPath, exportScale, 90, "#FFFFFF");
              }
              showToast(`导出成功！文件已保存到: ${outputPath}`, "success", 5000);
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              showToast(`导出失败：${errorMsg}`, "error");
              throw error;
            }
          }}
        />
      )}
    </header>
  );
}

export default AppHeader;
