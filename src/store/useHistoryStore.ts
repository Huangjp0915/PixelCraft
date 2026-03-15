import { create } from "zustand";
import type { PixelDocument } from "@/types/pixel";

interface HistoryState {
  // 历史记录
  history: PixelDocument[];
  currentIndex: number;
  
  // 操作
  pushHistory: (document: PixelDocument) => void;
  undo: () => PixelDocument | null;
  redo: () => PixelDocument | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 50;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],
  currentIndex: -1,
  
  pushHistory: (document) => {
    const { history, currentIndex } = get();
    // 移除当前位置之后的历史（如果有重做操作）
    const newHistory = history.slice(0, currentIndex + 1);
    // 添加新状态
    newHistory.push(JSON.parse(JSON.stringify(document))); // 深拷贝
    // 限制历史记录大小
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
      set({ history: newHistory, currentIndex: newHistory.length - 1 });
    } else {
      set({ history: newHistory, currentIndex: newHistory.length - 1 });
    }
  },
  
  undo: () => {
    const { history, currentIndex } = get();
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      set({ currentIndex: newIndex });
      return history[newIndex];
    }
    return null;
  },
  
  redo: () => {
    const { history, currentIndex } = get();
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      set({ currentIndex: newIndex });
      return history[newIndex];
    }
    return null;
  },
  
  canUndo: () => {
    const { currentIndex } = get();
    return currentIndex > 0;
  },
  
  canRedo: () => {
    const { history, currentIndex } = get();
    return currentIndex < history.length - 1;
  },
  
  clearHistory: () => {
    set({ history: [], currentIndex: -1 });
  },
}));
