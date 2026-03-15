use std::fs;
use std::io::Write;

/// 保存拖拽的文件到临时目录并返回路径
#[tauri::command]
pub fn save_dropped_file(file_name: String, file_data: Vec<u8>) -> Result<String, String> {
    // 获取临时目录
    let temp_dir = std::env::temp_dir();
    let temp_file_path = temp_dir.join(&file_name);
    
    // 写入文件
    let mut file = fs::File::create(&temp_file_path)
        .map_err(|e| format!("无法创建临时文件: {}", e))?;
    
    file.write_all(&file_data)
        .map_err(|e| format!("无法写入临时文件: {}", e))?;
    
    // 返回文件路径（转换为字符串）
    temp_file_path
        .to_str()
        .ok_or_else(|| "无法将路径转换为字符串".to_string())
        .map(|s| s.to_string())
}
