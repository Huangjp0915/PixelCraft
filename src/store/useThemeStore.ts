import { create } from "zustand";

export type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// 简单的本地存储实现（不使用 persist 中间件，避免依赖问题）
const STORAGE_KEY = "pixelcraft-theme-storage";

function loadThemeFromStorage(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const theme = JSON.parse(stored) as Theme;
      if (theme === "dark" || theme === "light") {
        return theme;
      }
    }
  } catch (error) {
    console.warn("加载主题设置失败:", error);
  }
  return "dark";
}

function saveThemeToStorage(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch (error) {
    console.warn("保存主题设置失败:", error);
  }
}

export const useThemeStore = create<ThemeState>((set) => {
  // 初始化时加载存储的主题
  const initialTheme = loadThemeFromStorage();
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", initialTheme);
  }

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      set({ theme });
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", theme);
      }
      saveThemeToStorage(theme);
    },
    toggleTheme: () => {
      set((state) => {
        const newTheme = state.theme === "dark" ? "light" : "dark";
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", newTheme);
        }
        saveThemeToStorage(newTheme);
        return { theme: newTheme };
      });
    },
  };
});
