use std::fs;
use std::path::Path;
use crate::models::project_file::ProjectFile;

/// 加载工程文件
#[tauri::command]
pub fn load_project(path: String) -> Result<ProjectFile, String> {
    println!("加载工程文件: path={}", path);
    
    // 验证文件是否存在
    if !Path::new(&path).exists() {
        return Err(format!("工程文件不存在: {}", path));
    }

    // 读取文件内容
    let json = fs::read_to_string(&path)
        .map_err(|e| format!("读取工程文件失败: {}", e))?;

    // 反序列化 JSON
    let project: ProjectFile = serde_json::from_str(&json)
        .map_err(|e| format!("解析工程文件失败: {}", e))?;

    // 验证版本兼容性
    if !project.is_version_compatible() {
        return Err(format!(
            "工程文件版本不兼容: 文件版本 {}, 当前版本 {}",
            project.version,
            ProjectFile::CURRENT_VERSION
        ));
    }

    // 验证必需字段
    if project.document.width == 0 || project.document.height == 0 {
        return Err("工程文件包含无效的像素文档尺寸".to_string());
    }

    if project.document.palette.is_empty() {
        return Err("工程文件调色板为空".to_string());
    }

    if project.document.pixels.is_empty() {
        return Err("工程文件像素数据为空".to_string());
    }

    println!("工程文件加载成功: {}", path);
    Ok(project)
}
