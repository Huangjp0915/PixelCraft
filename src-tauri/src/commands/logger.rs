use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::Manager;

/// 日志级别
#[derive(Debug, Clone, Copy)]
#[allow(dead_code)] // Warning 和 Debug 可能将来会使用
pub enum LogLevel {
    Error,
    Warning,
    Info,
    Debug,
}

impl LogLevel {
    fn as_str(&self) -> &'static str {
        match self {
            LogLevel::Error => "ERROR",
            LogLevel::Warning => "WARN",
            LogLevel::Info => "INFO",
            LogLevel::Debug => "DEBUG",
        }
    }
}

/// 获取当前时间戳字符串（简化版）
fn get_timestamp() -> String {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => {
            let secs = duration.as_secs();
            // 简化的时间戳格式
            format!("{}", secs)
        }
        Err(_) => "unknown".to_string(),
    }
}

/// 获取日志文件路径
fn get_log_file_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    // 获取应用数据目录
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("无法获取应用数据目录: {}", e))?;
    
    // 创建 logs 子目录
    let logs_dir = app_data_dir.join("logs");
    fs::create_dir_all(&logs_dir)
        .map_err(|e| format!("无法创建日志目录: {}", e))?;
    
    // 使用日期作为日志文件名（简化版，使用时间戳）
    let today = get_timestamp();
    Ok(logs_dir.join(format!("pixelcraft-{}.log", today)))
}

/// 写入日志
fn write_log(app: &tauri::AppHandle, level: LogLevel, message: &str) {
    if let Ok(log_path) = get_log_file_path(app) {
        let timestamp = get_timestamp();
        let log_entry = format!("[{}] [{}] {}\n", timestamp, level.as_str(), message);
        
        // 追加写入日志文件
        if let Err(e) = fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&log_path)
            .and_then(|mut file| {
                use std::io::Write;
                file.write_all(log_entry.as_bytes())
            })
        {
            eprintln!("写入日志失败: {}", e);
        }
    }
}

/// 记录错误日志
#[tauri::command]
pub fn log_error(app: tauri::AppHandle, message: String) {
    write_log(&app, LogLevel::Error, &message);
    eprintln!("[ERROR] {}", message);
}

/// 记录警告日志
#[tauri::command]
#[allow(dead_code)] // 可能将来会使用
pub fn log_warning(app: tauri::AppHandle, message: String) {
    write_log(&app, LogLevel::Warning, &message);
    eprintln!("[WARN] {}", message);
}

/// 记录信息日志
#[tauri::command]
pub fn log_info(app: tauri::AppHandle, message: String) {
    write_log(&app, LogLevel::Info, &message);
    println!("[INFO] {}", message);
}

/// 记录调试日志
#[tauri::command]
#[allow(dead_code)] // 可能将来会使用
pub fn log_debug(_app: tauri::AppHandle, _message: String) {
    #[cfg(debug_assertions)]
    {
        write_log(&app, LogLevel::Debug, &message);
        println!("[DEBUG] {}", message);
    }
}
