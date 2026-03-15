import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { loadProject, loadImage, saveDroppedFile } from "@/services/tauri/commands";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useToastStore } from "@/store/useToastStore";

/**
 * 处理文件拖拽功能
 */
export function useFileDrop() {
  const {
    setImportedImage,
    setTransformSettings,
    setPixelDocument,
  } = useAppStore();
  const { clearHistory, pushHistory } = useHistoryStore();
  const { addRecentProject, setCurrentProjectPath, setHasUnsavedChanges } =
    useProjectStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    console.log("文件拖拽功能已启用");

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("拖拽文件进入窗口");
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("文件拖拽到窗口，开始处理");

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) {
        console.log("没有检测到文件");
        return;
      }

      const file = files[0];
      const fileName = file.name.toLowerCase();
      console.log("检测到文件:", fileName, "文件对象:", file);
      
      // 检查是否有未保存的更改
      const { hasUnsavedChanges } = useProjectStore.getState();
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(
          "当前工程有未保存的更改，确定要打开新文件吗？\n未保存的更改将丢失。"
        );
        if (!confirmed) {
          console.log("用户取消了拖拽文件打开操作");
          return;
        }
        console.log("用户确认了拖拽文件打开操作");
      }
      
      // 在 Tauri 中，拖拽的文件对象可能包含 path 属性
      // 尝试多种方法获取文件路径
      let filePath: string | null = null;
      
      // 方法1: 尝试从文件对象获取路径（Tauri 可能提供）
      if ((file as any).path) {
        filePath = (file as any).path;
        console.log("从 file.path 获取路径:", filePath);
      }
      // 方法2: 如果无法获取路径，使用 FileReader 读取文件内容，然后保存到临时文件
      else {
        console.log("无法从文件对象获取路径，使用 FileReader 读取文件内容");
        try {
          // 使用 FileReader 读取文件内容
          const fileData = await new Promise<Uint8Array>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const arrayBuffer = e.target?.result as ArrayBuffer;
              resolve(new Uint8Array(arrayBuffer));
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
          });
          
          console.log("文件内容读取成功，大小:", fileData.length);
          
          // 保存到临时文件并获取路径
          filePath = await saveDroppedFile(file.name, fileData);
          console.log("文件已保存到临时目录:", filePath);
        } catch (error) {
          console.error("读取或保存文件失败:", error);
          alert(`无法处理拖拽的文件: ${error}\n请使用文件对话框打开文件。`);
          return;
        }
      }
      
      if (!filePath) {
        console.error("无法获取文件路径");
        return;
      }

      console.log("准备打开文件:", filePath);

      // 检查文件类型
      if (fileName.endsWith(".pixproj")) {
        // 加载工程文件
        try {
          const project = await loadProject(filePath);

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
              console.warn("源图片加载失败:", error);
            }
          }

          setTransformSettings(project.settings);
          setPixelDocument(project.document);
          clearHistory();
          pushHistory(project.document);

          // 更新最近打开列表
          addRecentProject(filePath, file.name);
          setCurrentProjectPath(filePath);
          setHasUnsavedChanges(false);
          showToast("工程文件打开成功", "success");
        } catch (error) {
          console.error("加载工程文件失败:", error);
          const errorMsg = error instanceof Error ? error.message : String(error);
          showToast(`加载工程文件失败: ${errorMsg}`, "error");
        }
      } else if (
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".jpeg") ||
        fileName.endsWith(".png")
      ) {
        // 加载图片文件
        try {
          const imageMeta = await loadImage(filePath);
          setImportedImage({
            path: imageMeta.path,
            width: imageMeta.width,
            height: imageMeta.height,
          });
          showToast("图片导入成功", "success");
        } catch (error) {
          console.error("加载图片失败:", error);
          const errorMsg = error instanceof Error ? error.message : String(error);
          showToast(`加载图片失败: ${errorMsg}`, "error");
        }
      }
    };

    // 绑定到 window 和 document
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("drop", handleDrop);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("drop", handleDrop);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("drop", handleDrop);
    };
  }, [
    setImportedImage,
    setTransformSettings,
    setPixelDocument,
    clearHistory,
    pushHistory,
    addRecentProject,
    setCurrentProjectPath,
    setHasUnsavedChanges,
    showToast,
  ]);
}
