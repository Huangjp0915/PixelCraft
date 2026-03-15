import { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer } from "react-konva";
import { useAppStore } from "@/store/useAppStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useTranslation } from "@/locales";
import PixelGridLayer from "./PixelGridLayer";
import GridLayer from "./GridLayer";
import SelectionLayer from "./SelectionLayer";
import { usePointerDraw } from "@/hooks/usePointerDraw";
import "./PixelStage.css";

function PixelStage() {
  const stageRef = useRef<any>(null);
  const { pixelDocument, transformSettings } = useAppStore();
  const { zoom, offsetX, offsetY, showGrid, setZoom, setOffset } = useEditorStore();
  const { pushHistory } = useHistoryStore();
  const t = useTranslation();

  // 初始化历史记录（仅在文档首次加载时）
  const isInitializedRef = useRef(false);
  useEffect(() => {
    if (pixelDocument && !isInitializedRef.current) {
      const { clearHistory } = useHistoryStore.getState();
      clearHistory(); // 清空旧历史
      pushHistory(pixelDocument);
      isInitializedRef.current = true;
    }
  }, [pixelDocument, pushHistory]);

  // 居中画布
  const centerCanvas = useCallback((targetZoom?: number) => {
    if (!stageRef.current || !pixelDocument) return;
    const container = stageRef.current.container().parentElement;
    if (!container) return;

    const pixelSize = transformSettings.pixelScale;
    const canvasWidth = transformSettings.canvasWidth || pixelDocument.width;
    const canvasHeight = transformSettings.canvasHeight || pixelDocument.height;
    const stageWidth = canvasWidth * pixelSize;
    const stageHeight = canvasHeight * pixelSize;

    const containerRect = container.getBoundingClientRect();
    // 如果指定了目标缩放，使用它；否则使用当前的 zoom
    const currentZoom = targetZoom !== undefined ? targetZoom : zoom;
    const scaledWidth = stageWidth * currentZoom;
    const scaledHeight = stageHeight * currentZoom;
    const centerX = (containerRect.width - scaledWidth) / 2;
    const centerY = (containerRect.height - scaledHeight) / 2;
    
    // 确保偏移量有效
    if (!isNaN(centerX) && !isNaN(centerY) && isFinite(centerX) && isFinite(centerY)) {
      setOffset(centerX, centerY);
    }
  }, [pixelDocument, transformSettings, zoom, setOffset]);

  // 监听居中画布事件（由快捷键系统触发）
  useEffect(() => {
    const handleCenterCanvas = () => {
      centerCanvas(1);
    };
    window.addEventListener("center-canvas", handleCenterCanvas);
    return () => window.removeEventListener("center-canvas", handleCenterCanvas);
  }, [centerCanvas]);

  // 鼠标滚轮缩放
  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = zoom;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // 获取鼠标在Stage中的相对位置（考虑缩放和平移）
    const stageBox = stage.container().getBoundingClientRect();
    const mouseX = e.evt.clientX - stageBox.left;
    const mouseY = e.evt.clientY - stageBox.top;
    
    // 计算鼠标在Stage内容中的位置（不考虑缩放和平移）
    const mousePointTo = {
      x: (mouseX - offsetX) / oldScale,
      y: (mouseY - offsetY) / oldScale,
    };

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.25, Math.min(10, newScale));
    setZoom(clampedScale);

    // 计算新的偏移，使鼠标指向的点保持不变
    const newPos = {
      x: mouseX - mousePointTo.x * clampedScale,
      y: mouseY - mousePointTo.y * clampedScale,
    };

    setOffset(newPos.x, newPos.y);
  }, [zoom, offsetX, offsetY, setZoom, setOffset]);

  // 指针绘制
  const pixelSize = transformSettings.pixelScale;
  const { handleMouseDown, handleMouseMove, handleMouseUp } = usePointerDraw({
    stageRef,
    pixelSize,
  });

  // 拖拽平移
  const isDraggingRef = useRef(false);
  const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleStageMouseDown = useCallback((e: any) => {
    // 如果按住空格键或中键，启用拖拽
    if (e.evt.button === 1 || e.evt.spaceKey) {
      isDraggingRef.current = true;
      lastPointerPosRef.current = { x: e.evt.clientX, y: e.evt.clientY };
      e.evt.preventDefault();
    } else {
      // 否则调用绘制处理
      handleMouseDown(e);
    }
  }, [handleMouseDown]);

  // 确保拖拽事件不会阻止文件拖拽
  const handleStageDragOver = useCallback((e: any) => {
    // 只有在不是文件拖拽时才阻止默认行为
    if (!e.evt.dataTransfer?.types?.includes('Files')) {
      e.evt.preventDefault();
    }
  }, []);

  const handleStageDrop = useCallback((e: any) => {
    // 只有在不是文件拖拽时才阻止默认行为
    if (!e.evt.dataTransfer?.types?.includes('Files')) {
      e.evt.preventDefault();
    }
  }, []);

  const handleStageMouseMove = useCallback((e: any) => {
    if (isDraggingRef.current && lastPointerPosRef.current) {
      const dx = e.evt.clientX - lastPointerPosRef.current.x;
      const dy = e.evt.clientY - lastPointerPosRef.current.y;
      setOffset(offsetX + dx, offsetY + dy);
      lastPointerPosRef.current = { x: e.evt.clientX, y: e.evt.clientY };
    } else {
      handleMouseMove(e);
    }
  }, [isDraggingRef.current, offsetX, offsetY, setOffset, handleMouseMove]);

  const handleStageMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      lastPointerPosRef.current = null;
    } else {
      handleMouseUp();
    }
  }, [handleMouseUp]);

  // 获取容器尺寸，用于设置 Stage 的尺寸（覆盖整个容器）
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    const updateSize = () => {
      const container = stageRef.current?.container()?.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerSize({ width: rect.width, height: rect.height });
        }
      }
    };
    
    // 初始更新
    updateSize();
    
    // 使用 ResizeObserver 监听容器尺寸变化
    const container = stageRef.current?.container()?.parentElement;
    let resizeObserver: ResizeObserver | null = null;
    
    if (container && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(container);
    }
    
    // 也监听窗口大小变化
    window.addEventListener('resize', updateSize);
    
    // 定期检查（作为后备方案）
    const interval = setInterval(updateSize, 100);
    
    return () => {
      window.removeEventListener('resize', updateSize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearInterval(interval);
    };
  }, [pixelDocument]); // 当文档变化时重新初始化

  // 如果没有像素文档，显示占位符
  if (!pixelDocument) {
    return (
      <div className="pixel-stage-placeholder">
        <p>{t.ui.pleaseImportAndGenerate}</p>
      </div>
    );
  }

  // 计算背景色样式和类名
  const containerStyle: React.CSSProperties = {};
  const containerClassName = "pixel-stage-container";
  
  if (transformSettings.backgroundMode === "solid" && transformSettings.backgroundColor) {
    // 纯色模式：使用设置的背景色，移除棋盘格图案
    containerStyle.backgroundColor = transformSettings.backgroundColor;
    containerStyle.backgroundImage = "none";
    console.log("纯色背景模式:", transformSettings.backgroundColor);
  } else {
    // 透明模式：使用棋盘格图案表示透明
    containerStyle.backgroundColor = "var(--bg-tertiary)";
    // backgroundImage 由 CSS 类提供（棋盘格图案）
    console.log("透明背景模式: 使用棋盘格图案");
  }

  return (
    <div 
      className={`${containerClassName} ${
        transformSettings.backgroundMode === "solid" ? "solid-background" : ""
      }`}
      style={containerStyle}
    >
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onMouseLeave={handleStageMouseUp}
        onWheel={handleWheel}
        onDragOver={handleStageDragOver}
        onDrop={handleStageDrop}
      >
        <Layer
          scaleX={zoom}
          scaleY={zoom}
          x={offsetX}
          y={offsetY}
        >
          <PixelGridLayer
            document={pixelDocument}
            pixelSize={pixelSize}
            showGrid={false}
            canvasWidth={transformSettings.canvasWidth}
            canvasHeight={transformSettings.canvasHeight}
            backgroundMode={transformSettings.backgroundMode}
            backgroundColor={
              transformSettings.backgroundMode === "solid"
                ? transformSettings.backgroundColor || "#FFFFFF"
                : undefined
            }
          />
          {showGrid && (
            <GridLayer
              document={pixelDocument}
              pixelSize={pixelSize}
              canvasWidth={transformSettings.canvasWidth}
              canvasHeight={transformSettings.canvasHeight}
              showGrid={showGrid}
            />
          )}
          <SelectionLayer />
        </Layer>
      </Stage>
    </div>
  );
}

export default PixelStage;
