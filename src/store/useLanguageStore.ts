import { create } from "zustand";

export type Language = "zh" | "en";

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

const STORAGE_KEY = "pixelcraft-language-storage";

function loadLanguageFromStorage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const lang = JSON.parse(stored) as Language;
      if (lang === "zh" || lang === "en") {
        return lang;
      }
    }
  } catch (error) {
    console.warn("加载语言设置失败:", error);
  }
  return "zh"; // 默认中文
}

function saveLanguageToStorage(language: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(language));
  } catch (error) {
    console.warn("保存语言设置失败:", error);
  }
}

export const useLanguageStore = create<LanguageState>((set) => {
  const initialLanguage = loadLanguageFromStorage();

  return {
    language: initialLanguage,
    setLanguage: (language) => {
      set({ language });
      saveLanguageToStorage(language);
    },
  };
});
