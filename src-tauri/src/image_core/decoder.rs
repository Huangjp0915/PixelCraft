use image::{GenericImageView, ImageReader, DynamicImage};
use std::path::Path;

/// 解码图片并返回尺寸信息
/// 返回 (width, height)
pub fn decode_image<P: AsRef<Path>>(path: P) -> Result<(u32, u32), String> {
    let img: DynamicImage = ImageReader::open(path)
        .map_err(|e| format!("无法打开图片文件: {}", e))?
        .decode()
        .map_err(|e| format!("无法解码图片: {}", e))?;

    let (width, height) = img.dimensions();
    Ok((width, height))
}

/// 解码图片并返回 RGBA 数据
#[allow(dead_code)] // 可能将来会使用
pub fn decode_image_rgba<P: AsRef<Path>>(path: P) -> Result<(u32, u32, Vec<u8>), String> {
    let img: DynamicImage = ImageReader::open(path)
        .map_err(|e| format!("无法打开图片文件: {}", e))?
        .decode()
        .map_err(|e| format!("无法解码图片: {}", e))?;

    let (width, height) = img.dimensions();
    let rgba = img.to_rgba8();
    let pixels = rgba.as_raw().to_vec();

    Ok((width, height, pixels))
}
