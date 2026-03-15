import { create } from "zustand";
import type { PixelDocument, PixelTransformSettings } from "@/types/pixel";
import { useProjectStore } from "./useProjectStore";

export interface ImportImage {
  path: string;
  width: number;
  height: number;
  rgba?: Uint8Array;
}

interface AppState {
  importedImage: ImportImage | null;
  setImportedImage: (image: ImportImage | null) => void;
  
  // 像素化设置
  transformSettings: PixelTransformSettings;
  setTransformSettings: (settings: Partial<PixelTransformSettings>) => void;
  
  // 像素文档
  pixelDocument: PixelDocument | null;
  setPixelDocument: (document: PixelDocument | null) => void;
  
  // 是否正在生成
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

const defaultSettings: PixelTransformSettings = {
  targetWidth: 64,
  targetHeight: 64,
  pixelScale: 4,
  canvasWidth: 64,
  canvasHeight: 64,
  colorCount: 16,
  dithering: false,
  backgroundMode: "transparent",
  backgroundColor: undefined,
};

export const useAppStore = create<AppState>((set) => ({
  importedImage: null,
  setImportedImage: (image) => set({ importedImage: image }),
  
  transformSettings: defaultSettings,
  setTransformSettings: (settings) =>
    set((state) => ({
      transformSettings: { ...state.transformSettings, ...settings },
    })),
  
  pixelDocument: null,
  setPixelDocument: (document) => {
    set({ pixelDocument: document });
    // 标记有未保存的更改
    // 如果文档存在，且当前有工程路径，则标记为未保存
    if (document) {
      const { currentProjectPath } = useProjectStore.getState();
      if (currentProjectPath) {
        // 立即设置未保存状态
        useProjectStore.getState().setHasUnsavedChanges(true);
      }
    }
  },
  
  isGenerating: false,
  setIsGenerating: (generating) => set({ isGenerating: generating }),
}));
