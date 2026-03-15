use std::fs;
use std::path::Path;
use base64::{Engine as _, engine::general_purpose};

/// 读取图片文件并返回 base64 编码
#[tauri::command]
pub fn read_image_base64(path: String) -> Result<String, String> {
    // 验证文件是否存在
    if !Path::new(&path).exists() {
        return Err(format!("文件不存在: {}", path));
    }

    // 读取文件内容
    let file_data = fs::read(&path)
        .map_err(|e| format!("无法读取文件: {}", e))?;

    // 转换为 base64（使用新的 API）
    let base64 = general_purpose::STANDARD.encode(&file_data);
    
    // 根据文件扩展名确定 MIME 类型
    let mime_type = if path.to_lowercase().ends_with(".png") {
        "image/png"
    } else if path.to_lowercase().ends_with(".jpg") || path.to_lowercase().ends_with(".jpeg") {
        "image/jpeg"
    } else {
        "image/png" // 默认
    };

    // 返回 data URL
    Ok(format!("data:{};base64,{}", mime_type, base64))
}
