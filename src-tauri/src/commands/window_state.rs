use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

/// 窗口状态
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowState {
    pub x: Option<f64>,
    pub y: Option<f64>,
    pub width: f64,
    pub height: f64,
    pub maximized: bool,
    pub fullscreen: bool,
}

impl Default for WindowState {
    fn default() -> Self {
        Self {
            x: None,
            y: None,
            width: 1200.0,
            height: 800.0,
            maximized: false,
            fullscreen: false,
        }
    }
}

/// 获取窗口状态文件路径
fn get_window_state_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    // 获取应用数据目录
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("无法获取应用数据目录: {}", e))?;
    
    // 确保目录存在
    fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("无法创建应用数据目录: {}", e))?;
    
    Ok(app_data_dir.join("window_state.json"))
}

/// 保存窗口状态
#[tauri::command]
pub fn save_window_state(
    app: tauri::AppHandle,
    state: WindowState,
) -> Result<(), String> {
    let path = get_window_state_path(&app)?;
    let json = serde_json::to_string_pretty(&state)
        .map_err(|e| format!("序列化窗口状态失败: {}", e))?;
    fs::write(&path, json)
        .map_err(|e| format!("写入窗口状态文件失败: {}", e))?;
    Ok(())
}

/// 加载窗口状态
#[tauri::command]
pub fn load_window_state(app: tauri::AppHandle) -> Result<WindowState, String> {
    let path = get_window_state_path(&app)?;
    if !path.exists() {
        return Ok(WindowState::default());
    }
    let json = fs::read_to_string(&path)
        .map_err(|e| format!("读取窗口状态文件失败: {}", e))?;
    let state: WindowState = serde_json::from_str(&json)
        .map_err(|e| format!("解析窗口状态失败: {}", e))?;
    Ok(state)
}
