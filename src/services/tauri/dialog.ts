import { open, save } from "@tauri-apps/plugin-dialog";

/**
 * 打开图片文件对话框
 */
export async function openImageDialog(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    filters: [
      {
        name: "图片",
        extensions: ["jpg", "jpeg", "png"],
      },
    ],
  });

  if (selected && typeof selected === "string") {
    return selected;
  }
  return null;
}

/**
 * 打开工程文件对话框
 */
export async function openProjectDialog(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    filters: [
      {
        name: "PixelCraft 工程",
        extensions: ["pixproj"],
      },
    ],
  });

  if (selected && typeof selected === "string") {
    return selected;
  }
  return null;
}

/**
 * 保存文件对话框
 */
export async function saveFileDialog(
  defaultName?: string,
  filters?: Array<{ name: string; extensions: string[] }>
): Promise<string | null> {
  const selected = await save({
    defaultPath: defaultName,
    filters: filters || [
      {
        name: "所有文件",
        extensions: ["*"],
      },
    ],
  });

  if (selected && typeof selected === "string") {
    return selected;
  }
  return null;
}
