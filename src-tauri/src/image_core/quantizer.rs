use color_quant::NeuQuant;
use image::{DynamicImage, Rgba};
use crate::image_core::dithering;

/// 颜色量化结果
#[derive(Debug, Clone)]
pub struct QuantizedImage {
    pub palette: Vec<Rgba<u8>>,
    pub indices: Vec<u8>,
    pub width: u32,
    pub height: u32,
}

/// 使用 NeuQuant 算法进行颜色量化
pub fn quantize_image(
    img: &DynamicImage,
    color_count: usize,
    use_dithering: bool,
) -> Result<QuantizedImage, String> {
    let rgba8 = img.to_rgba8();
    let (width, height) = rgba8.dimensions();
    
    // 准备像素数据（NeuQuant 需要 RGB 格式，3字节）
    let mut rgb_pixels = Vec::with_capacity((width * height * 3) as usize);
    let mut original_pixels = Vec::with_capacity((width * height) as usize);
    
    for pixel in rgba8.pixels() {
        rgb_pixels.push(pixel[0]); // R
        rgb_pixels.push(pixel[1]); // G
        rgb_pixels.push(pixel[2]); // B
        original_pixels.push(*pixel); // 保存原始 RGBA 像素
    }

    // 创建量化器（sample_fac=10, colors=color_count）
    let nq = NeuQuant::new(10, color_count, &rgb_pixels);
    
    // 生成调色板
    let mut palette = Vec::with_capacity(color_count);
    let color_map = nq.color_map_rgb();
    for i in 0..color_count {
        let rgb = &color_map[i * 3..(i + 1) * 3];
        palette.push(Rgba([rgb[0], rgb[1], rgb[2], 255]));
    }

    // 量化所有像素
    let mut indices = Vec::with_capacity((width * height) as usize);
    
    if use_dithering {
        // 使用抖动：先创建临时图像，应用抖动，然后量化
        let mut temp_img = rgba8.clone();
        let palette_slice: Vec<Rgba<u8>> = palette.clone();
        dithering::apply_floyd_steinberg_dithering(&mut temp_img, &palette_slice)
            .map_err(|e| format!("抖动处理失败: {}", e))?;
        
        // 从抖动后的图像中提取像素索引
        for pixel in temp_img.pixels() {
            let best_index = map_to_palette(*pixel, &palette);
            indices.push(best_index as u8);
        }
    } else {
        // 不使用抖动：直接映射
        for pixel in original_pixels.iter() {
            let best_index = map_to_palette(*pixel, &palette);
            indices.push(best_index as u8);
        }
    }

    Ok(QuantizedImage {
        palette,
        indices,
        width,
        height,
    })
}

/// 将像素颜色映射到调色板中最接近的颜色
pub fn map_to_palette(
    pixel: Rgba<u8>,
    palette: &[Rgba<u8>],
) -> usize {
    let mut min_distance = u32::MAX;
    let mut best_index = 0;

    for (i, palette_color) in palette.iter().enumerate() {
        let distance = color_distance(pixel, *palette_color);
        if distance < min_distance {
            min_distance = distance;
            best_index = i;
        }
    }

    best_index
}

/// 计算两个颜色之间的欧几里得距离
fn color_distance(c1: Rgba<u8>, c2: Rgba<u8>) -> u32 {
    let r_diff = c1[0] as i32 - c2[0] as i32;
    let g_diff = c1[1] as i32 - c2[1] as i32;
    let b_diff = c1[2] as i32 - c2[2] as i32;
    
    (r_diff * r_diff + g_diff * g_diff + b_diff * b_diff) as u32
}
