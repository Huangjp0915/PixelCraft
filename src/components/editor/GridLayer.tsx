import { useMemo } from "react";
import { Line } from "react-konva";
import type { PixelDocument } from "@/types/pixel";

interface GridLayerProps {
  document: PixelDocument;
  pixelSize: number;
  canvasWidth?: number;
  canvasHeight?: number;
  showGrid: boolean;
}

function GridLayer({
  document,
  pixelSize,
  canvasWidth,
  canvasHeight,
  showGrid,
}: GridLayerProps) {
  const lines = useMemo(() => {
    if (!showGrid) return [];

    const width = canvasWidth || document.width;
    const height = canvasHeight || document.height;
    const gridLines: JSX.Element[] = [];

    // 垂直线
    for (let x = 0; x <= width; x++) {
      gridLines.push(
        <Line
          key={`v-${x}`}
          points={[x * pixelSize, 0, x * pixelSize, height * pixelSize]}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={0.5}
          listening={false}
          perfectDrawEnabled={false}
          shadowForStrokeEnabled={false}
          hitStrokeWidth={0}
        />
      );
    }

    // 水平线
    for (let y = 0; y <= height; y++) {
      gridLines.push(
        <Line
          key={`h-${y}`}
          points={[0, y * pixelSize, width * pixelSize, y * pixelSize]}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={0.5}
          listening={false}
          perfectDrawEnabled={false}
          shadowForStrokeEnabled={false}
          hitStrokeWidth={0}
        />
      );
    }

    return gridLines;
  }, [document, pixelSize, canvasWidth, canvasHeight, showGrid]);

  return <>{lines}</>;
}

export default GridLayer;
