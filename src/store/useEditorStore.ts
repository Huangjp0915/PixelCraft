import { create } from "zustand";

export type Tool = "brush" | "eraser" | "eyedropper" | "paintbucket" | "select";

interface EditorState {
  // 当前工具
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  
  // 当前颜色（调色板索引）
  currentColorIndex: number;
  setCurrentColorIndex: (index: number) => void;
  
  // 画布缩放
  zoom: number;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  
  // 画布偏移
  offsetX: number;
  offsetY: number;
  setOffset: (x: number, y: number) => void;
  resetOffset: () => void;
  
  // 网格显示
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  
  // 是否正在绘制
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  
  // 框选区域
  selection: { x: number; y: number; width: number; height: number } | null;
  setSelection: (selection: { x: number; y: number; width: number; height: number } | null) => void;
  clearSelection: () => void;
  
  // 镜像模式
  mirrorMode: "none" | "horizontal" | "vertical" | "both";
  setMirrorMode: (mode: "none" | "horizontal" | "vertical" | "both") => void;
}

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 10];
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 10;

export const useEditorStore = create<EditorState>((set, get) => ({
  currentTool: "brush",
  setCurrentTool: (tool) => set({ currentTool: tool }),
  
  currentColorIndex: 0,
  setCurrentColorIndex: (index) => set({ currentColorIndex: index }),
  
  zoom: 1,
  setZoom: (zoom) => set({ zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)) }),
  zoomIn: () => {
    const currentZoom = get().zoom;
    const nextZoom = ZOOM_STEPS.find((z) => z > currentZoom) || MAX_ZOOM;
    set({ zoom: Math.min(nextZoom, MAX_ZOOM) });
  },
  zoomOut: () => {
    const currentZoom = get().zoom;
    const prevZoom = ZOOM_STEPS.slice().reverse().find((z) => z < currentZoom) || MIN_ZOOM;
    set({ zoom: Math.max(prevZoom, MIN_ZOOM) });
  },
  resetZoom: () => set({ zoom: 1 }),
  
  offsetX: 0,
  offsetY: 0,
  setOffset: (x, y) => set({ offsetX: x, offsetY: y }),
  resetOffset: () => {
    // 重置偏移，居中逻辑在 PixelStage 中实现
    set({ offsetX: 0, offsetY: 0 });
  },
  
  showGrid: true,
  setShowGrid: (show) => set({ showGrid: show }),
  
  isDrawing: false,
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),
  
  selection: null,
  setSelection: (selection) => set({ selection }),
  clearSelection: () => set({ selection: null }),
  
  mirrorMode: "none",
  setMirrorMode: (mode) => set({ mirrorMode: mode }),
}));
