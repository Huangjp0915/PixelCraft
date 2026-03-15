/**
 * 窗口状态管理
 * 用于保存和恢复窗口位置、大小等状态
 */

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  maximized?: boolean;
  fullscreen?: boolean;
}

const STORAGE_KEY = "pixelcraft-window-state";

export function saveWindowState(state: WindowState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("保存窗口状态失败:", error);
  }
}

export function loadWindowState(): WindowState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as WindowState;
    }
  } catch (error) {
    console.warn("加载窗口状态失败:", error);
  }
  return null;
}

export function getDefaultWindowState(): WindowState {
  return {
    width: 1200,
    height: 800,
    maximized: false,
    fullscreen: false,
  };
}
