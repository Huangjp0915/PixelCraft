import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { exportPng, exportJpg } from "@/services/tauri/commands";
import { saveFileDialog } from "@/services/tauri/dialog";
import { useToastStore } from "@/store/useToastStore";
import ExportDialog, { ExportFormat, ExportSize } from "./ExportDialog";
import "./ExportButton.css";

interface ExportButtonProps {
  isDialogOpen?: boolean;
  onDialogClose?: () => void;
}

function ExportButton({ isDialogOpen: externalIsOpen, onDialogClose }: ExportButtonProps = {}) {
  const { pixelDocument } = useAppStore();
  const { showToast } = useToastStore();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // 使用外部控制或内部状态
  const isDialogOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsDialogOpen = onDialogClose ? () => { onDialogClose(); } : setInternalIsOpen;

  // 监听全局导出事件（快捷键触发）
  useEffect(() => {
    const handleOpenDialog = () => {
      if (pixelDocument) {
        setIsDialogOpen(true);
      }
    };
    
    window.addEventListener("open-export-dialog", handleOpenDialog);
    return () => window.removeEventListener("open-export-dialog", handleOpenDialog);
  }, [pixelDocument]);

  const handleExport = async (
    format: ExportFormat,
    size: ExportSize,
    scale?: number
  ) => {
    if (!pixelDocument) {
      throw new Error("没有可导出的像素画");
    }

    // 生成默认文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const extension = format === "png" ? "png" : "jpg";
    const defaultName = `pixel-art-${timestamp}.${extension}`;

    // 选择保存路径
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

    // 执行导出
    const exportScale = size === "scaled" ? scale : 1;
    
    try {
      if (format === "png") {
        await exportPng(pixelDocument, outputPath, exportScale);
      } else {
        // JPG 使用白色背景
        await exportJpg(pixelDocument, outputPath, exportScale, 90, "#FFFFFF");
      }

      // 显示成功消息
      showToast(`导出成功！文件已保存到: ${outputPath}`, "success", 5000);
    } catch (error) {
      // 显示错误消息
      const errorMsg = error instanceof Error ? error.message : String(error);
      showToast(`导出失败：${errorMsg}`, "error");
      throw error; // 重新抛出以便 ExportDialog 处理
    }
  };

  if (!pixelDocument) {
    return null;
  }

  return (
    <ExportDialog
      isOpen={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      onExport={handleExport}
    />
  );
}

export default ExportButton;
