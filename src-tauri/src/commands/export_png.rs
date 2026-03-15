use crate::models::pixel_document::PixelDocument;
use crate::image_core::exporter;

/// 导出 PNG
#[tauri::command]
pub fn export_png(
    document: PixelDocument,
    output_path: String,
    scale: Option<u32>,
) -> Result<(), String> {
    println!("导出 PNG: path={}, scale={:?}", output_path, scale);
    
    let options = exporter::ExportOptions {
        scale: scale.unwrap_or(1),
        background_color: None, // PNG 支持透明
    };
    
    exporter::export_png(&document, &output_path, &options)
        .map_err(|e| {
            let err = format!("导出 PNG 失败: {}", e);
            println!("错误: {}", err);
            err
        })?;
    
    println!("PNG 导出成功: {}", output_path);
    Ok(())
}
