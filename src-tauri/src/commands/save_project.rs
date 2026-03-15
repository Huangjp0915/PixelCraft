use std::fs;
use std::path::Path;
use crate::models::project_file::ProjectFile;

/// 保存工程文件
#[tauri::command]
pub fn save_project(
    project: ProjectFile,
    output_path: String,
) -> Result<(), String> {
    println!("保存工程文件: path={}", output_path);
    
    // 验证输出路径
    if output_path.is_empty() {
        return Err("保存路径不能为空".to_string());
    }

    // 确保输出目录存在
    if let Some(parent) = Path::new(&output_path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("无法创建目录: {}", e))?;
    }

    // 序列化为 JSON
    let json = serde_json::to_string_pretty(&project)
        .map_err(|e| format!("序列化工程文件失败: {}", e))?;

    // 写入文件
    fs::write(&output_path, json)
        .map_err(|e| format!("写入工程文件失败: {}", e))?;

    println!("工程文件保存成功: {}", output_path);
    Ok(())
}
