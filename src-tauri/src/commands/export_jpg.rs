use crate::models::pixel_document::PixelDocument;
use crate::image_core::exporter;

/// 导出 JPG
#[tauri::command]
pub fn export_jpg(
    document: PixelDocument,
    output_path: String,
    scale: Option<u32>,
    quality: Option<u8>,
    background_color: Option<String>, // HEX 格式，如 "#FFFFFF"
) -> Result<(), String> {
    println!("导出 JPG: path={}, scale={:?}, quality={:?}, bg={:?}", 
        output_path, scale, quality, background_color);
    
    let bg_color = if let Some(bg_hex) = background_color {
        Some(exporter::hex_to_rgba(&bg_hex)
            .map_err(|e| format!("无效的背景色: {}", e))?)
    } else {
        None // 默认白色
    };
    
    let options = exporter::ExportOptions {
        scale: scale.unwrap_or(1),
        background_color: bg_color,
    };
    
    let quality = quality.unwrap_or(90).min(100).max(1);
    
    exporter::export_jpg(&document, &output_path, &options, quality)
        .map_err(|e| {
            let err = format!("导出 JPG 失败: {}", e);
            println!("错误: {}", err);
            err
        })?;
    
    println!("JPG 导出成功: {}", output_path);
    Ok(())
}
