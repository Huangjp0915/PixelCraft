import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import AppHeader from "@/components/layout/AppHeader";
import LeftToolbar from "@/components/layout/LeftToolbar";
import RightSidebar from "@/components/layout/RightSidebar";
import StatusBar from "@/components/layout/StatusBar";
import ImportButton from "@/components/import/ImportButton";
import ImageInfoCard from "@/components/import/ImageInfoCard";
import PixelStage from "@/components/editor/PixelStage";
import { useAppStore } from "@/store/useAppStore";
import { testCommand, loadProject, loadImage } from "@/services/tauri/commands";
import { useFileDrop } from "@/hooks/useFileDrop";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useWindowState } from "@/hooks/useWindowState";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useToastStore } from "@/store/useToastStore";
import ToastContainer from "@/components/common/ToastContainer";
import "./App.css";

function App() {
  const { importedImage, setImportedImage, setTransformSettings, setPixelDocument } = useAppStore();
  const { clearHistory, pushHistory } = useHistoryStore();
  const { addRecentProject, setCurrentProjectPath, setHasUnsavedChanges } = useProjectStore();
  const { theme } = useThemeStore();
  const { showToast } = useToastStore();
  
  // 启用文件拖拽功能
  useFileDrop();
  
  // 启用快捷键系统
  useKeyboardShortcuts();
  
  // 启用窗口状态管理
  useWindowState();
  
  // 初始化主题
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // 监听命令行参数打开文件
  useEffect(() => {
    const setupFileListener = async () => {
      const unlisten = await listen<string>("open-file", async (event) => {
        const filePath = event.payload;
        const fileName = filePath.toLowerCase();

        try {
          if (fileName.endsWith(".pixproj")) {
            // 打开工程文件
            const project = await loadProject(filePath);
            
            if (project.sourceImage) {
              try {
                const imageMeta = await loadImage(project.sourceImage);
                setImportedImage({
                  path: imageMeta.path,
                  width: imageMeta.width,
                  height: imageMeta.height,
                });
              } catch (error) {
                console.warn("源图片加载失败:", error);
              }
            }

            setTransformSettings(project.settings);
            setPixelDocument(project.document);
            clearHistory();
            pushHistory(project.document);
            addRecentProject(filePath, filePath.split(/[/\\]/).pop() || filePath);
            setCurrentProjectPath(filePath);
            setHasUnsavedChanges(false);
          } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png")) {
            // 打开图片文件
            const imageMeta = await loadImage(filePath);
            setImportedImage({
              path: imageMeta.path,
              width: imageMeta.width,
              height: imageMeta.height,
            });
          }
        } catch (error) {
          console.error("打开文件失败:", error);
          const errorMsg = error instanceof Error ? error.message : String(error);
          showToast(`打开文件失败: ${errorMsg}`, "error");
        }
      });

      return unlisten;
    };

    setupFileListener().then((unlisten) => {
      return () => {
        unlisten();
      };
    });
  }, [setImportedImage, setTransformSettings, setPixelDocument, clearHistory, pushHistory, addRecentProject, setCurrentProjectPath, setHasUnsavedChanges]);

  // 开发模式下，将 testCommand 暴露到全局，方便在控制台测试
  useEffect(() => {
    if (import.meta.env.MODE === "development") {
      (window as any).testCommand = testCommand;
      console.log("💡 提示: 可以在控制台使用 testCommand('Hello') 测试前后端通信");
    }
  }, []);


  return (
    <div className="app-container">
      <AppHeader />
      <div className="app-content">
        <LeftToolbar />
        <main className="app-main">
          {!importedImage ? (
            <div className="welcome-screen">
              <h1>PixelCraft</h1>
              <p>像素画转换与编辑器</p>
              <ImportButton />
            </div>
          ) : (
            <div className="editor-container">
              <ImageInfoCard />
              <PixelStage />
            </div>
          )}
        </main>
        <RightSidebar />
      </div>
      <StatusBar />
      <ToastContainer />
    </div>
  );
}

export default App;
