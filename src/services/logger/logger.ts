import { invoke } from "@tauri-apps/api/core";

/**
 * 日志服务
 * 用于记录应用运行时的错误、警告和信息
 */

export async function logError(message: string): Promise<void> {
  try {
    await invoke("log_error", { message });
  } catch (error) {
    console.error("记录错误日志失败:", error);
  }
}

export async function logWarning(message: string): Promise<void> {
  try {
    await invoke("log_warning", { message });
  } catch (error) {
    console.warn("记录警告日志失败:", error);
  }
}

export async function logInfo(message: string): Promise<void> {
  try {
    await invoke("log_info", { message });
  } catch (error) {
    console.log("记录信息日志失败:", error);
  }
}

export async function logDebug(message: string): Promise<void> {
  try {
    await invoke("log_debug", { message });
  } catch (error) {
    console.debug("记录调试日志失败:", error);
  }
}
