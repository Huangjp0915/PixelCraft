import { useCallback, useRef } from "react";
import { Stage } from "konva/lib/Stage";
import { useAppStore } from "@/store/useAppStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { floodFill } from "@/utils/floodFill";

// 将 HEX 颜色转换为 RGB
// 虽然当前未使用，但保留以备将来功能扩展
/*
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
*/

// 计算两个颜色之间的欧几里得距离
// 虽然当前未使用，但保留以备将来功能扩展
/*
function colorDistance(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return Infinity;
  
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  
  return rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;
}
*/

// 在调色板中找到最接近目标颜色的索引
// 虽然当前未使用，但保留以备将来功能扩展
/*
function _findClosestColorIndex(targetColor: string, palette: string[]): number {
  if (palette.length === 0) return 0;
  
  let minDistance = Infinity;
  let closestIndex = 0;
  
  // 确保目标颜色格式正确
  let normalizedTarget = targetColor.trim().toUpperCase();
  if (!normalizedTarget.startsWith('#')) {
    normalizedTarget = '#' + normalizedTarget;
  }
  
  for (let i = 0; i < palette.length; i++) {
    const paletteColor = palette[i];
    let normalizedPalette = paletteColor.trim().toUpperCase();
    if (!normalizedPalette.startsWith('#')) {
      normalizedPalette = '#' + normalizedPalette;
    }
    
    const distance = colorDistance(normalizedTarget, normalizedPalette);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }
  
  return closestIndex;
}
*/

// 解析 HEX 颜色，支持 #RRGGBB 和 #RRGGBBAA 格式
// 虽然当前未使用，但保留以备将来功能扩展
/*
function parseHexColor(hex: string): { r: number; g: number; b: number; a: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: result[4] ? parseInt(result[4], 16) : 255,
    };
  }
  return null;
}
*/

// 在调色板中找到最透明的颜色（alpha 最小的）
// 虽然当前未使用，但保留以备将来功能扩展
/*
function _findTransparentColorIndex(palette: string[]): number {
  if (palette.length === 0) return 0;
  
  let minAlpha = 255;
  let transparentIndex = 0;
  
  for (let i = 0; i < palette.length; i++) {
    const color = palette[i];
    const rgba = parseHexColor(color);
    if (rgba && rgba.a < minAlpha) {
      minAlpha = rgba.a;
      transparentIndex = i;
    }
  }
  
  // 如果所有颜色都是不透明的，尝试添加一个透明色到调色板
  // 但调色板是只读的，所以我们使用第一个颜色，但会在渲染时处理为透明
  // 或者，我们可以创建一个完全透明的颜色字符串
  if (minAlpha === 255) {
    // 检查调色板中是否已经有 #00000000 格式的透明色
    const transparentColor = palette.findIndex(
      (color) => color.toUpperCase() === '#00000000' || color.toUpperCase() === '00000000'
    );
    if (transparentColor >= 0) {
      return transparentColor;
    }
    // 如果没有，返回索引 0，我们会在渲染时特殊处理
    return 0;
  }
  
  return transparentIndex;
}
*/

// 获取透明色索引（固定为调色板最后一个）
function getTransparentColorIndex(palette: string[]): number {
  // 透明色固定为调色板的最后一个索引
  return palette.length > 0 ? palette.length - 1 : 0;
}

// 根据镜像模式获取所有需要绘制的位置
function getMirrorPositions(
  x: number,
  y: number,
  width: number,
  height: number,
  mirrorMode: "none" | "horizontal" | "vertical" | "both"
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [{ x, y }];
  
  if (mirrorMode === "horizontal" || mirrorMode === "both") {
    const mirrorX = width - 1 - x;
    if (mirrorX !== x) {
      positions.push({ x: mirrorX, y });
    }
  }
  
  if (mirrorMode === "vertical" || mirrorMode === "both") {
    const mirrorY = height - 1 - y;
    if (mirrorY !== y) {
      positions.push({ x, y: mirrorY });
    }
  }
  
  if (mirrorMode === "both") {
    const mirrorX = width - 1 - x;
    const mirrorY = height - 1 - y;
    if (mirrorX !== x && mirrorY !== y) {
      positions.push({ x: mirrorX, y: mirrorY });
    }
  }
  
  return positions;
}

interface UsePointerDrawOptions {
  stageRef: React.RefObject<Stage>;
  pixelSize: number;
}

export function usePointerDraw({ stageRef, pixelSize }: UsePointerDrawOptions) {
  const { pixelDocument, setPixelDocument, transformSettings } = useAppStore();
  const { currentTool, currentColorIndex, isDrawing, setIsDrawing, setSelection, mirrorMode } = useEditorStore();
  const { pushHistory } = useHistoryStore();
  const lastPixelRef = useRef<{ x: number; y: number } | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);

  // 将屏幕坐标转换为像素坐标
  const screenToPixel = useCallback(
    (_screenX: number, _screenY: number): { x: number; y: number } | null => {
      if (!stageRef.current || !pixelDocument) return null;

      const stage = stageRef.current;
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return null;

      // 获取 Layer 的变换信息（缩放和平移）
      const layers = stage.getLayers();
      if (layers.length === 0) return null;
      const layer = layers[0];
      const layerScale = layer.scaleX();
      const layerX = layer.x();
      const layerY = layer.y();

      // 将屏幕坐标转换为 Layer 内的坐标（考虑缩放和平移）
      const layerPosX = (pointerPos.x - layerX) / layerScale;
      const layerPosY = (pointerPos.y - layerY) / layerScale;

      // 转换为像素坐标
      const x = Math.floor(layerPosX / pixelSize);
      const y = Math.floor(layerPosY / pixelSize);

      // 检查是否在画布范围内
      const canvasWidth = transformSettings.canvasWidth || pixelDocument.width;
      const canvasHeight = transformSettings.canvasHeight || pixelDocument.height;

      if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) {
        return null;
      }

      return { x, y };
    },
    [stageRef, pixelSize, pixelDocument, transformSettings]
  );

  // 设置单个像素
  const setPixel = useCallback(
    (x: number, y: number, colorIndex: number) => {
      if (!pixelDocument) return;

      // 检查是否在文档范围内
      if (x < 0 || x >= pixelDocument.width || y < 0 || y >= pixelDocument.height) {
        return;
      }

      const index = y * pixelDocument.width + x;
      if (index < 0 || index >= pixelDocument.pixels.length) return;

      // 创建新文档副本
      const newPixels = [...pixelDocument.pixels];
      newPixels[index] = colorIndex;

      const newDocument: typeof pixelDocument = {
        ...pixelDocument,
        pixels: newPixels,
      };

      setPixelDocument(newDocument);
    },
    [pixelDocument, setPixelDocument]
  );

  // 处理鼠标按下
  const handleMouseDown = useCallback(
    (e: any) => {
      if (!pixelDocument) return;

      const pixelPos = screenToPixel(e.evt.clientX, e.evt.clientY);
      if (!pixelPos) return;

      setIsDrawing(true);
      lastPixelRef.current = pixelPos;

      if (currentTool === "brush" || currentTool === "eraser") {
        // 画笔和橡皮：在开始绘制前保存状态
        pushHistory(pixelDocument);
        
        if (currentTool === "brush") {
          setPixel(pixelPos.x, pixelPos.y, currentColorIndex);
        } else if (currentTool === "eraser") {
          // 擦除：总是擦除到透明（使用调色板最后一个索引，固定为透明色）
          const transparentIndex = getTransparentColorIndex(pixelDocument.palette);
          setPixel(pixelPos.x, pixelPos.y, transparentIndex);
        }
      } else if (currentTool === "paintbucket") {
        // 油漆桶：洪水填充
        pushHistory(pixelDocument);
        
        const index = pixelPos.y * pixelDocument.width + pixelPos.x;
        if (index >= 0 && index < pixelDocument.pixels.length) {
          const targetColorIndex = pixelDocument.pixels[index];
          
          // 执行洪水填充
          const newPixels = floodFill({
            pixels: pixelDocument.pixels,
            width: pixelDocument.width,
            height: pixelDocument.height,
            startX: pixelPos.x,
            startY: pixelPos.y,
            targetColorIndex,
            fillColorIndex: currentColorIndex,
          });
          
          // 更新文档
          const newDocument: typeof pixelDocument = {
            ...pixelDocument,
            pixels: newPixels,
          };
          setPixelDocument(newDocument);
        }
      } else if (currentTool === "select") {
        // 框选工具：开始选择
        selectionStartRef.current = pixelPos;
        setSelection(null); // 先清除旧选择
      } else if (currentTool === "eyedropper") {
        // 吸管：获取当前像素的颜色（不需要保存历史）
        const index = pixelPos.y * pixelDocument.width + pixelPos.x;
        if (index >= 0 && index < pixelDocument.pixels.length) {
          const colorIndex = pixelDocument.pixels[index];
          useEditorStore.getState().setCurrentColorIndex(colorIndex);
        }
      }
    },
    [
      pixelDocument,
      screenToPixel,
      currentTool,
      currentColorIndex,
      setPixel,
      setIsDrawing,
      pushHistory,
    ]
  );

  // 处理鼠标移动（拖拽绘制）
  const handleMouseMove = useCallback(
    (e: any) => {
      if (!pixelDocument) return;

      const pixelPos = screenToPixel(e.evt.clientX, e.evt.clientY);
      if (!pixelPos) return;

      if (currentTool === "select" && selectionStartRef.current) {
        // 框选工具：更新选择区域
        const startX = Math.min(selectionStartRef.current.x, pixelPos.x);
        const startY = Math.min(selectionStartRef.current.y, pixelPos.y);
        const endX = Math.max(selectionStartRef.current.x, pixelPos.x);
        const endY = Math.max(selectionStartRef.current.y, pixelPos.y);
        
        const canvasWidth = transformSettings.canvasWidth || pixelDocument.width;
        const canvasHeight = transformSettings.canvasHeight || pixelDocument.height;
        
        setSelection({
          x: Math.max(0, Math.min(startX, canvasWidth - 1)),
          y: Math.max(0, Math.min(startY, canvasHeight - 1)),
          width: Math.min(endX - startX + 1, canvasWidth - startX),
          height: Math.min(endY - startY + 1, canvasHeight - startY),
        });
        return;
      }

      if (!isDrawing) return;

      // 避免重复绘制同一个像素
      if (
        lastPixelRef.current &&
        lastPixelRef.current.x === pixelPos.x &&
        lastPixelRef.current.y === pixelPos.y
      ) {
        return;
      }

      lastPixelRef.current = pixelPos;

      if (currentTool === "brush") {
        // 根据镜像模式绘制
        const positions = getMirrorPositions(pixelPos.x, pixelPos.y, pixelDocument.width, pixelDocument.height, mirrorMode);
        positions.forEach(({ x, y }) => {
          setPixel(x, y, currentColorIndex);
        });
      } else if (currentTool === "eraser") {
        // 擦除：总是擦除到透明（使用调色板最后一个索引，固定为透明色）
        const transparentIndex = getTransparentColorIndex(pixelDocument.palette);
        const positions = getMirrorPositions(pixelPos.x, pixelPos.y, pixelDocument.width, pixelDocument.height, mirrorMode);
        positions.forEach(({ x, y }) => {
          setPixel(x, y, transparentIndex);
        });
      }
    },
    [isDrawing, pixelDocument, screenToPixel, currentTool, currentColorIndex, setPixel, transformSettings, mirrorMode]
  );

  // 处理鼠标抬起
  const handleMouseUp = useCallback(() => {
    if (currentTool === "select") {
      // 框选工具：选择完成，不清除选择区域
      selectionStartRef.current = null;
    } else if (isDrawing) {
      // 操作完成后保存最终状态到历史
      // 使用 setTimeout 确保状态已更新
      setTimeout(() => {
        const currentDoc = useAppStore.getState().pixelDocument;
        if (currentDoc) {
          pushHistory(currentDoc);
        }
      }, 0);
    }
    setIsDrawing(false);
    lastPixelRef.current = null;
  }, [isDrawing, currentTool, pushHistory, setIsDrawing]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
