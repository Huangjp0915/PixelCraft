use std::path::Path;

use crate::image_core::decoder;
use crate::models::image_meta::ImageMeta;

/// 加载图片并返回基本信息
#[tauri::command]
pub fn load_image(path: String) -> Result<ImageMeta, String> {
    // 验证文件是否存在
    if !Path::new(&path).exists() {
        return Err(format!("文件不存在: {}", path));
    }

    // 使用 decoder 模块读取图片
    match decoder::decode_image(&path) {
        Ok((width, height)) => Ok(ImageMeta {
            path: path.clone(),
            width,
            height,
        }),
        Err(e) => Err(format!("读取图片失败: {}", e)),
    }
}
