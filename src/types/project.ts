import type { PixelDocument, PixelTransformSettings } from "./pixel";

/**
 * 工程文件数据结构
 */
export interface ProjectFile {
  version: string; // 版本号，用于兼容性检查
  sourceImage?: string; // 源图片路径（可选）
  settings: PixelTransformSettings; // 转换参数
  document: PixelDocument; // 像素文档
  createdAt?: string; // 创建时间（ISO 8601）
  updatedAt?: string; // 更新时间（ISO 8601）
}

/**
 * 当前支持的工程文件版本
 */
export const CURRENT_PROJECT_VERSION = "1.0.0";

/**
 * 检查工程文件版本兼容性
 */
export function isProjectVersionCompatible(version: string): boolean {
  // 简单版本检查：主版本号相同即可
  const currentMajor = CURRENT_PROJECT_VERSION.split(".")[0];
  const fileMajor = version.split(".")[0];
  return currentMajor === fileMajor;
}
