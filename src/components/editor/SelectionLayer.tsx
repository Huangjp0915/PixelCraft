import { Rect } from "react-konva";
import { useEditorStore } from "@/store/useEditorStore";
import { useAppStore } from "@/store/useAppStore";

function SelectionLayer() {
  const { selection } = useEditorStore();
  const { transformSettings } = useAppStore();
  const pixelSize = transformSettings.pixelScale;

  if (!selection) {
    return null;
  }

  return (
    <Rect
      x={selection.x * pixelSize}
      y={selection.y * pixelSize}
      width={selection.width * pixelSize}
      height={selection.height * pixelSize}
      stroke="#007acc"
      strokeWidth={2}
      fill="rgba(0, 122, 204, 0.1)"
      dash={[5, 5]}
      listening={false}
    />
  );
}

export default SelectionLayer;
