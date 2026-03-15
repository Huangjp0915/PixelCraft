/**
 * 洪水填充算法（Flood Fill）
 * 用于实现油漆桶工具
 */

export interface FloodFillOptions {
  pixels: number[];
  width: number;
  height: number;
  startX: number;
  startY: number;
  targetColorIndex: number;
  fillColorIndex: number;
}

/**
 * 洪水填充算法实现
 * 使用队列（BFS）方式实现，性能更好
 */
export function floodFill({
  pixels,
  width,
  height,
  startX,
  startY,
  targetColorIndex,
  fillColorIndex,
}: FloodFillOptions): number[] {
  // 如果目标颜色和填充颜色相同，直接返回
  if (targetColorIndex === fillColorIndex) {
    return pixels;
  }

  // 边界检查
  if (
    startX < 0 ||
    startX >= width ||
    startY < 0 ||
    startY >= height
  ) {
    return pixels;
  }

  // 检查起始点是否已经是目标颜色
  const startIndex = startY * width + startX;
  if (pixels[startIndex] !== targetColorIndex) {
    return pixels;
  }

  // 创建新像素数组
  const newPixels = [...pixels];
  
  // 使用队列实现 BFS
  const queue: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
  const visited = new Set<number>();
  
  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    const index = y * width + x;
    
    // 检查是否已访问
    if (visited.has(index)) {
      continue;
    }
    
    // 检查是否在边界内且颜色匹配
    if (
      x < 0 ||
      x >= width ||
      y < 0 ||
      y >= height ||
      newPixels[index] !== targetColorIndex
    ) {
      continue;
    }
    
    // 填充颜色
    newPixels[index] = fillColorIndex;
    visited.add(index);
    
    // 添加相邻像素到队列（4方向）
    queue.push({ x: x + 1, y });
    queue.push({ x: x - 1, y });
    queue.push({ x, y: y + 1 });
    queue.push({ x, y: y - 1 });
  }
  
  return newPixels;
}
