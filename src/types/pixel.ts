export interface PixelTransformSettings {
  targetWidth: number;
  targetHeight: number;
  pixelScale: number; // 像素显示倍数（1x, 2x, 4x, 8x）
  canvasWidth: number; // 画布宽度（可大于目标分辨率）
  canvasHeight: number; // 画布高度（可大于目标分辨率）
  colorCount: number; // 调色板颜色数量
  dithering: boolean; // 是否启用抖动
  backgroundMode: "transparent" | "solid";
  backgroundColor?: string; // 背景色（HEX格式）
}

export interface PixelDocument {
  width: number;
  height: number;
  palette: string[]; // 颜色数组，格式为 "#RRGGBB" 或 "#RRGGBBAA"
  pixels: number[]; // 调色板索引数组（注意：Rust 端是 u8，前端是 number）
}

// 导出所有类型
export * from "./project";
