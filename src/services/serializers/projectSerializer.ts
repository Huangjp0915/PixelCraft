import type { ProjectFile, PixelDocument, PixelTransformSettings } from "@/types";
import { CURRENT_PROJECT_VERSION } from "@/types/project";

/**
 * 序列化工程文件为 JSON 字符串
 */
export function serializeProject(project: ProjectFile): string {
  const projectData: ProjectFile = {
    ...project,
    version: project.version || CURRENT_PROJECT_VERSION,
    updatedAt: new Date().toISOString(),
    createdAt: project.createdAt || new Date().toISOString(),
  };

  return JSON.stringify(projectData, null, 2);
}

/**
 * 反序列化 JSON 字符串为工程文件
 */
export function deserializeProject(json: string): ProjectFile {
  try {
    const data = JSON.parse(json) as ProjectFile;

    // 验证必需字段
    if (!data.version) {
      throw new Error("工程文件缺少版本号");
    }
    if (!data.settings) {
      throw new Error("工程文件缺少转换参数");
    }
    if (!data.document) {
      throw new Error("工程文件缺少像素文档");
    }

    // 验证文档结构
    if (!data.document.width || !data.document.height) {
      throw new Error("像素文档尺寸无效");
    }
    if (!data.document.palette || data.document.palette.length === 0) {
      throw new Error("调色板为空");
    }
    if (!data.document.pixels || data.document.pixels.length === 0) {
      throw new Error("像素数据为空");
    }

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`工程文件 JSON 格式错误: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 从当前应用状态创建工程文件
 */
export function createProjectFromState(
  sourceImage: string | null,
  settings: PixelTransformSettings,
  document: PixelDocument
): ProjectFile {
  return {
    version: CURRENT_PROJECT_VERSION,
    sourceImage: sourceImage || undefined,
    settings,
    document,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
