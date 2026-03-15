import { invoke } from "@tauri-apps/api/core";
import type { PixelDocument, PixelTransformSettings } from "@/types/pixel";

export interface ImageMeta {
  path: string;
  width: number;
  height: number;
}

/**
 * 加载图片并获取基本信息
 */
export async function loadImage(path: string): Promise<ImageMeta> {
  return await invoke<ImageMeta>("load_image", { path });
}

/**
 * 测试 command - 验证前后端通信
 */
export async function testCommand(message: string): Promise<string> {
  return await invoke<string>("test_command", { message });
}

/**
 * 生成像素画
 */
export async function generatePixelArt(
  imagePath: string,
  settings: PixelTransformSettings
): Promise<PixelDocument> {
  console.log("调用 generatePixelArt:", { imagePath, settings });
  try {
    // Tauri 会自动将驼峰命名转换为蛇形命名匹配 Rust 参数
    const result = await invoke<PixelDocument>("generate_pixel_art", {
      imagePath, // Tauri 会自动转换为 image_path
      settings,
    });
    console.log("generatePixelArt 返回:", result);
    return result;
  } catch (error) {
    console.error("generatePixelArt 调用失败:", error);
    throw error;
  }
}

/**
 * 导出 PNG
 */
export async function exportPng(
  document: PixelDocument,
  outputPath: string,
  scale?: number
): Promise<void> {
  console.log("调用 exportPng:", { outputPath, scale });
  try {
    await invoke("export_png", {
      document,
      outputPath,
      scale,
    });
    console.log("PNG 导出成功");
  } catch (error) {
    console.error("PNG 导出失败:", error);
    throw error;
  }
}

/**
 * 导出 JPG
 */
export async function exportJpg(
  document: PixelDocument,
  outputPath: string,
  scale?: number,
  quality?: number,
  backgroundColor?: string
): Promise<void> {
  console.log("调用 exportJpg:", { outputPath, scale, quality, backgroundColor });
  try {
    await invoke("export_jpg", {
      document,
      outputPath,
      scale,
      quality,
      backgroundColor,
    });
    console.log("JPG 导出成功");
  } catch (error) {
    console.error("JPG 导出失败:", error);
    throw error;
  }
}

/**
 * 读取图片文件并返回 base64 编码的 data URL
 */
export async function readImageBase64(path: string): Promise<string> {
  console.log("调用 readImageBase64:", path);
  try {
    const result = await invoke<string>("read_image_base64", { path });
    console.log("readImageBase64 成功");
    return result;
  } catch (error) {
    console.error("readImageBase64 失败:", error);
    throw error;
  }
}

/**
 * 保存工程文件
 */
export async function saveProject(
  project: import("@/types").ProjectFile,
  outputPath: string
): Promise<void> {
  console.log("调用 saveProject:", { outputPath });
  try {
    await invoke("save_project", {
      project,
      outputPath,
    });
    console.log("工程文件保存成功");
  } catch (error) {
    console.error("工程文件保存失败:", error);
    throw error;
  }
}

/**
 * 加载工程文件
 */
export async function loadProject(
  path: string
): Promise<import("@/types").ProjectFile> {
  console.log("调用 loadProject:", path);
  try {
    const result = await invoke<import("@/types").ProjectFile>("load_project", {
      path,
    });
    console.log("工程文件加载成功");
    return result;
  } catch (error) {
    console.error("工程文件加载失败:", error);
    throw error;
  }
}

/**
 * 保存拖拽的文件到临时目录
 */
export async function saveDroppedFile(
  fileName: string,
  fileData: Uint8Array
): Promise<string> {
  console.log("调用 saveDroppedFile:", fileName, "文件大小:", fileData.length);
  try {
    const result = await invoke<string>("save_dropped_file", {
      fileName,
      fileData: Array.from(fileData),
    });
    console.log("文件保存到临时目录成功:", result);
    return result;
  } catch (error) {
    console.error("保存拖拽文件失败:", error);
    throw error;
  }
}

/**
 * 窗口状态接口
 */
export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  maximized: boolean;
  fullscreen: boolean;
}

/**
 * 保存窗口状态
 */
export async function saveWindowState(state: WindowState): Promise<void> {
  return await invoke("save_window_state", { state });
}

/**
 * 加载窗口状态
 */
export async function loadWindowState(): Promise<WindowState> {
  return await invoke<WindowState>("load_window_state");
}
