import { useEffect } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { useAppStore } from "@/store/useAppStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useShortcutStore } from "@/store/useShortcutStore";

/**
 * 统一的快捷键系统
 */
export function useKeyboardShortcuts() {
  const { setCurrentTool } = useEditorStore();
  const { setPixelDocument } = useAppStore();
  const { undo, redo } = useHistoryStore();
  const { shortcuts } = useShortcutStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果用户在输入框中，不处理快捷键
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // 解析快捷键字符串（例如 "Ctrl+N" -> 检查 Ctrl 和 N）
      const parseShortcut = (shortcut: string): { ctrl: boolean; shift: boolean; alt: boolean; key: string } => {
        const parts = shortcut.split("+").map(s => s.trim());
        const keyPart = parts.find(p => !["ctrl", "cmd", "shift", "alt"].includes(p.toLowerCase()));
        return {
          ctrl: parts.some(p => p.toLowerCase() === "ctrl" || p.toLowerCase() === "cmd"),
          shift: parts.some(p => p.toLowerCase() === "shift"),
          alt: parts.some(p => p.toLowerCase() === "alt"),
          key: keyPart || "",
        };
      };

      // 检查快捷键是否匹配
      const matchesShortcut = (shortcut: string): boolean => {
        if (!shortcut) return false;
        const parsed = parseShortcut(shortcut);
        
        // 处理特殊键
        let keyMatch = false;
        if (parsed.key === "++") {
          keyMatch = e.key === "=" || e.key === "+";
        } else if (parsed.key === "+-") {
          keyMatch = e.key === "-";
        } else if (parsed.key.toLowerCase() === "delete") {
          keyMatch = e.key === "Delete";
        } else if (parsed.key.toLowerCase() === "backspace") {
          keyMatch = e.key === "Backspace";
        } else {
          keyMatch = parsed.key.toLowerCase() === e.key.toLowerCase();
        }
        
        const ctrlMatch = parsed.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
        const shiftMatch = parsed.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = parsed.alt ? e.altKey : !e.altKey;
        
        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      };

      // 工具切换快捷键
      if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        if (matchesShortcut(shortcuts.brush)) {
          e.preventDefault();
          setCurrentTool("brush");
          return;
        }
        if (matchesShortcut(shortcuts.eraser)) {
          e.preventDefault();
          setCurrentTool("eraser");
          return;
        }
        if (matchesShortcut(shortcuts.eyedropper)) {
          e.preventDefault();
          setCurrentTool("eyedropper");
          return;
        }
        if (matchesShortcut(shortcuts.paintbucket)) {
          e.preventDefault();
          setCurrentTool("paintbucket");
          return;
        }
        if (matchesShortcut(shortcuts.select)) {
          e.preventDefault();
          setCurrentTool("select");
          return;
        }
        if (matchesShortcut(shortcuts.toggleGrid)) {
          e.preventDefault();
          useEditorStore.getState().setShowGrid(!useEditorStore.getState().showGrid);
          return;
        }
      }

      // 文件操作快捷键
      if (matchesShortcut(shortcuts.newProject)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("new-project"));
        return;
      }
      if (matchesShortcut(shortcuts.openProject)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("load-project"));
        return;
      }
      if (matchesShortcut(shortcuts.saveProject)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("save-project"));
        return;
      }
      if (matchesShortcut(shortcuts.saveAs)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("save-project-as"));
        return;
      }
      if (matchesShortcut(shortcuts.export)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("open-export-dialog"));
        return;
      }

      // 编辑操作快捷键
      if (matchesShortcut(shortcuts.undo)) {
        e.preventDefault();
        const doc = undo();
        if (doc) {
          setPixelDocument(doc);
        }
        return;
      }
      if (matchesShortcut(shortcuts.redo)) {
        e.preventDefault();
        const doc = redo();
        if (doc) {
          setPixelDocument(doc);
        }
        return;
      }

      // 视图操作快捷键
      if (matchesShortcut(shortcuts.zoomIn)) {
        e.preventDefault();
        useEditorStore.getState().zoomIn();
        return;
      }
      if (matchesShortcut(shortcuts.zoomOut)) {
        e.preventDefault();
        useEditorStore.getState().zoomOut();
        return;
      }
      if (matchesShortcut(shortcuts.resetZoom)) {
        e.preventDefault();
        useEditorStore.getState().resetZoom();
        window.dispatchEvent(new CustomEvent("center-canvas"));
        return;
      }

      // Delete: 删除选中（如果有选中区域）
      if (e.key === "Delete" || e.key === "Backspace") {
        // 这里需要检查是否有选中区域，暂时留空
        // 未来实现框选工具后，可以删除选中区域
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCurrentTool, setPixelDocument, undo, redo, shortcuts]);
}
