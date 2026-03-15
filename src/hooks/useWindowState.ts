import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { saveWindowState, type WindowState } from "@/services/tauri/commands";

/**
 * 窗口状态管理 Hook
 * 自动保存和恢复窗口位置、大小等状态
 * 注意：窗口关闭时的状态保存已在 Rust 端处理，这里只做定期保存
 */
export function useWindowState() {
  useEffect(() => {
    const setupWindowState = async () => {
      try {
        const appWindow = getCurrentWindow();
        
        // 定期保存窗口状态（每30秒，减少频率）
        const interval = setInterval(async () => {
          try {
            const position = await appWindow.outerPosition();
            const size = await appWindow.outerSize();
            const isMaximized = await appWindow.isMaximized();
            const isFullscreen = await appWindow.isFullscreen();
            
            const state: WindowState = {
              x: position.x,
              y: position.y,
              width: size.width,
              height: size.height,
              maximized: isMaximized,
              fullscreen: isFullscreen,
            };
            
            // 静默保存，不记录日志
            await saveWindowState(state).catch(() => {
              // 静默失败
            });
          } catch (error) {
            // 静默失败，不记录日志
          }
        }, 30000); // 改为30秒保存一次
        
        return () => {
          clearInterval(interval);
        };
      } catch (error) {
        // 静默失败
        console.warn("设置窗口状态管理失败:", error);
      }
    };
    
    setupWindowState();
  }, []);
}
