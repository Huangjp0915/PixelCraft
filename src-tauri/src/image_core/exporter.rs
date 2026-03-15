use crate::models::pixel_document::PixelDocument;
use image::{Rgba, RgbaImage, DynamicImage, ImageFormat};
use std::fs::File;
use std::io::BufWriter;

/// 导出选项
#[derive(Debug, Clone)]
pub struct ExportOptions {
    pub scale: u32,              // 放大倍数（1 = 逻辑尺寸）
    pub background_color: Option<Rgba<u8>>, // JPG 背景色（透明转此色）
}

impl Default for ExportOptions {
    fn default() -> Self {
        Self {
            scale: 1,
            background_color: None,
        }
    }
}

/// 将 HEX 颜色字符串转换为 Rgba
pub fn hex_to_rgba(hex: &str) -> Result<Rgba<u8>, String> {
    let hex = hex.trim().trim_start_matches('#');
    
    if hex.len() == 6 {
        // #RRGGBB 格式
        let r = u8::from_str_radix(&hex[0..2], 16)
            .map_err(|_| "无效的红色值")?;
        let g = u8::from_str_radix(&hex[2..4], 16)
            .map_err(|_| "无效的绿色值")?;
        let b = u8::from_str_radix(&hex[4..6], 16)
            .map_err(|_| "无效的蓝色值")?;
        Ok(Rgba([r, g, b, 255]))
    } else if hex.len() == 8 {
        // #RRGGBBAA 格式
        let r = u8::from_str_radix(&hex[0..2], 16)
            .map_err(|_| "无效的红色值")?;
        let g = u8::from_str_radix(&hex[2..4], 16)
            .map_err(|_| "无效的绿色值")?;
        let b = u8::from_str_radix(&hex[4..6], 16)
            .map_err(|_| "无效的蓝色值")?;
        let a = u8::from_str_radix(&hex[6..8], 16)
            .map_err(|_| "无效的 Alpha 值")?;
        Ok(Rgba([r, g, b, a]))
    } else {
        Err(format!("无效的颜色格式: {}", hex))
    }
}

/// 从 PixelDocument 创建 RgbaImage
pub fn document_to_image(
    document: &PixelDocument,
    options: &ExportOptions,
) -> Result<RgbaImage, String> {
    let output_width = document.width * options.scale;
    let output_height = document.height * options.scale;
    
    let mut img = RgbaImage::new(output_width, output_height);
    
    // 解析调色板
    let palette: Vec<Rgba<u8>> = document
        .palette
        .iter()
        .map(|color_str| {
            hex_to_rgba(color_str).unwrap_or(Rgba([0, 0, 0, 255]))
        })
        .collect();
    
    // 渲染像素
    for y in 0..document.height {
        for x in 0..document.width {
            let index = (y * document.width + x) as usize;
            if index >= document.pixels.len() {
                continue;
            }
            
            let palette_index = document.pixels[index] as usize;
            let safe_index = palette_index.min(palette.len().saturating_sub(1));
            let color = palette.get(safe_index).copied().unwrap_or(Rgba([0, 0, 0, 255]));
            
            // 如果是透明色且指定了背景色，使用背景色
            let final_color = if color[3] == 0 && options.background_color.is_some() {
                options.background_color.unwrap()
            } else {
                color
            };
            
            // 放大绘制
            for dy in 0..options.scale {
                for dx in 0..options.scale {
                    let px = x * options.scale + dx;
                    let py = y * options.scale + dy;
                    if px < output_width && py < output_height {
                        img.put_pixel(px, py, final_color);
                    }
                }
            }
        }
    }
    
    Ok(img)
}

/// 导出 PNG
pub fn export_png(
    document: &PixelDocument,
    output_path: &str,
    options: &ExportOptions,
) -> Result<(), String> {
    let img = document_to_image(document, options)?;
    
    let file = File::create(output_path)
        .map_err(|e| format!("无法创建文件: {}", e))?;
    let mut writer = BufWriter::new(file);
    
    let dynamic_img = DynamicImage::ImageRgba8(img);
    dynamic_img
        .write_to(&mut writer, ImageFormat::Png)
        .map_err(|e| format!("无法写入 PNG: {}", e))?;
    
    Ok(())
}

/// 导出 JPG
pub fn export_jpg(
    document: &PixelDocument,
    output_path: &str,
    options: &ExportOptions,
    _quality: u8, // 质量参数（目前未使用，image 0.25 的 Jpeg 编码器可能不支持）
) -> Result<(), String> {
    // JPG 不支持透明，使用白色背景
    let mut jpg_options = options.clone();
    if jpg_options.background_color.is_none() {
        jpg_options.background_color = Some(Rgba([255, 255, 255, 255]));
    }
    
    let img = document_to_image(document, &jpg_options)?;
    
    let file = File::create(output_path)
        .map_err(|e| format!("无法创建文件: {}", e))?;
    let mut writer = BufWriter::new(file);
    
    let dynamic_img = DynamicImage::ImageRgba8(img);
    // image 0.25 使用 ImageFormat::Jpeg，质量参数在编码器中处理
    // 注意：image 0.25 的 Jpeg 编码器可能不支持质量参数，需要检查
    dynamic_img
        .write_to(&mut writer, ImageFormat::Jpeg)
        .map_err(|e| format!("无法写入 JPG: {}", e))?;
    
    Ok(())
}
