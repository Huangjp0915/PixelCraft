import { create } from "zustand";

export interface ShortcutConfig {
  newProject: string;
  openProject: string;
  saveProject: string;
  saveAs: string;
  export: string;
  undo: string;
  redo: string;
  deleteSelection: string;
  brush: string;
  eraser: string;
  eyedropper: string;
  paintbucket: string;
  select: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  toggleGrid: string;
}

const STORAGE_KEY = "pixelcraft-shortcuts-storage";

const defaultShortcuts: ShortcutConfig = {
  newProject: "Ctrl+N",
  openProject: "Ctrl+O",
  saveProject: "Ctrl+S",
  saveAs: "Ctrl+Shift+S",
  export: "Ctrl+E",
  undo: "Ctrl+Z",
  redo: "Ctrl+Y",
  deleteSelection: "Delete",
  brush: "B",
  eraser: "E",
  eyedropper: "I",
  paintbucket: "P",
  select: "S",
  zoomIn: "Ctrl++",
  zoomOut: "Ctrl+-",
  resetZoom: "Ctrl+0",
  toggleGrid: "G",
};

function loadShortcutsFromStorage(): Partial<ShortcutConfig> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("加载快捷键设置失败:", error);
  }
  return {};
}

function saveShortcutsToStorage(shortcuts: ShortcutConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
  } catch (error) {
    console.warn("保存快捷键设置失败:", error);
  }
}

interface ShortcutState {
  shortcuts: ShortcutConfig;
  setShortcut: (key: keyof ShortcutConfig, value: string) => void;
  resetShortcuts: () => void;
}

export const useShortcutStore = create<ShortcutState>((set, get) => {
  const stored = loadShortcutsFromStorage();
  const shortcuts = { ...defaultShortcuts, ...stored };

  return {
    shortcuts,
    setShortcut: (key, value) => {
      const newShortcuts = { ...get().shortcuts, [key]: value };
      set({ shortcuts: newShortcuts });
      saveShortcutsToStorage(newShortcuts);
    },
    resetShortcuts: () => {
      set({ shortcuts: defaultShortcuts });
      saveShortcutsToStorage(defaultShortcuts);
    },
  };
});
