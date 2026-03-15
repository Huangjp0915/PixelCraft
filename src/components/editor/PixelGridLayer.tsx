import { useMemo } from "react";
import { Rect } from "react-konva";
import type { PixelDocument } from "@/types/pixel";

// 检查颜色是否是透明的（alpha = 0）
function checkIfTransparent(color: string): boolean {
  // 支持 #RRGGBBAA 格式
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color);
  if (result && result[4]) {
    const alpha = parseInt(result[4], 16);
    return alpha === 0;
  }
  // 如果是 #00000000 格式（完全透明黑色）
  if (color.toUpperCase() === '#00000000' || color.toUpperCase() === '00000000') {
    return true;
  }
  return false;
}

interface PixelGridLayerProps {
  document: PixelDocument;
  pixelSize: number;
  showGrid: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundMode?: "transparent" | "solid";
  backgroundColor?: string;
}

function PixelGridLayer({ 
  document, 
  pixelSize, 
  showGrid, 
  canvasWidth, 
  canvasHeight,
  backgroundMode = "transparent",
  backgroundColor 
}: PixelGridLayerProps) {
  const pixels = useMemo(() => {
    const rects: JSX.Element[] = [];
    const width = canvasWidth || document.width;
    const height = canvasHeight || document.height;
    
    // 纯色模式下，先渲染整个背景层
    if (backgroundMode === "solid" && backgroundColor) {
      const bgColor = backgroundColor || "#FFFFFF";
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          rects.push(
            <Rect
              key={`bg-${x}-${y}`}
              x={x * pixelSize}
              y={y * pixelSize}
              width={pixelSize}
              height={pixelSize}
              fill={bgColor}
              stroke={showGrid ? "#333333" : undefined}
              strokeWidth={showGrid ? 1 : 0}
            />
          );
        }
      }
    }
    
    // 渲染文档像素（覆盖在背景上）
    for (let y = 0; y < document.height; y++) {
      for (let x = 0; x < document.width; x++) {
        const index = y * document.width + x;
        const paletteIndex = document.pixels[index];
        
        // 确保索引在有效范围内
        const safeIndex = Math.min(paletteIndex, document.palette.length - 1);
        const color = document.palette[safeIndex] || "#000000";
        
        // 检查是否是透明色（alpha = 0）
        const isTransparent = checkIfTransparent(color);
        
        // 如果是透明色，在透明模式下不渲染（让背景显示），在纯色模式下也不渲染
        if (isTransparent && backgroundMode === "transparent") {
          // 不渲染，让容器的棋盘格背景显示
          continue;
        }
        
        // 如果是透明色但在纯色模式下，也不渲染（让纯色背景显示）
        if (isTransparent && backgroundMode === "solid") {
          continue;
        }
        
        rects.push(
          <Rect
            key={`pixel-${x}-${y}`}
            x={x * pixelSize}
            y={y * pixelSize}
            width={pixelSize}
            height={pixelSize}
            fill={color}
            stroke={showGrid ? "#333333" : undefined}
            strokeWidth={showGrid ? 1 : 0}
          />
        );
      }
    }
    
    
    return rects;
  }, [document, pixelSize, showGrid, canvasWidth, canvasHeight, backgroundMode, backgroundColor]);

  return <>{pixels}</>;
}

export default PixelGridLayer;
