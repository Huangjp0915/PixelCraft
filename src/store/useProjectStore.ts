import { create } from "zustand";

/**
 * 最近打开的项目记录
 */
export interface RecentProject {
  path: string;
  name: string;
  openedAt: string; // ISO 8601 时间戳
}

interface ProjectState {
  // 当前工程路径
  currentProjectPath: string | null;
  setCurrentProjectPath: (path: string | null) => void;

  // 最近打开的项目列表
  recentProjects: RecentProject[];
  addRecentProject: (path: string, name: string) => void;
  removeRecentProject: (path: string) => void;
  clearRecentProjects: () => void;

  // 是否有未保存的更改
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

// 简单的本地存储实现（不使用 persist 中间件，避免依赖问题）
const STORAGE_KEY = "pixelcraft-project-storage";

function loadFromStorage(): Partial<ProjectState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("加载本地存储失败:", error);
  }
  return {};
}

function saveToStorage(state: Partial<ProjectState>) {
  try {
    const toSave = {
      recentProjects: state.recentProjects || [],
      currentProjectPath: state.currentProjectPath || null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.warn("保存到本地存储失败:", error);
  }
}

export const useProjectStore = create<ProjectState>((set, get) => {
  // 初始化时加载存储的数据
  const stored = loadFromStorage();

  return {
    currentProjectPath: stored.currentProjectPath || null,
    setCurrentProjectPath: (path) => {
      set({ currentProjectPath: path });
      saveToStorage(get());
    },

    recentProjects: (stored.recentProjects && Array.isArray(stored.recentProjects)) ? stored.recentProjects : [],
    addRecentProject: (path, name) => {
      set((state) => {
        // 确保 recentProjects 是数组
        const currentProjects = Array.isArray(state.recentProjects) ? state.recentProjects : [];
        // 移除已存在的相同路径
        const filtered = currentProjects.filter((p) => p.path !== path);
        // 添加到最前面
        const updated = [
          { path, name, openedAt: new Date().toISOString() },
          ...filtered,
        ].slice(0, 10); // 最多保留 10 条
        const newState = { ...state, recentProjects: updated };
        saveToStorage(newState);
        return newState;
      });
    },
    removeRecentProject: (path) => {
      set((state) => {
        const currentProjects = Array.isArray(state.recentProjects) ? state.recentProjects : [];
        const updated = currentProjects.filter((p) => p.path !== path);
        const newState = { ...state, recentProjects: updated };
        saveToStorage(newState);
        return newState;
      });
    },
    clearRecentProjects: () => {
      set((state) => {
        const newState = { ...state, recentProjects: [] };
        saveToStorage(newState);
        return newState;
      });
    },

    hasUnsavedChanges: false,
    setHasUnsavedChanges: (hasChanges) => {
      set({ hasUnsavedChanges: hasChanges });
    },
  };
});
