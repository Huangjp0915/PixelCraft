use image::{Rgba, RgbaImage};

/// Floyd-Steinberg 误差扩散抖动
/// 
/// 将量化误差扩散到相邻像素，使颜色过渡更平滑
pub fn apply_floyd_steinberg_dithering(
    img: &mut RgbaImage,
    palette: &[Rgba<u8>],
) -> Result<(), String> {
    let (width, height) = img.dimensions();
    
    // 创建临时缓冲区存储误差
    let mut error_buffer = vec![vec![[0i16; 4]; width as usize]; height as usize];
    
    for y in 0..height {
        for x in 0..width {
            let pixel = img.get_pixel(x, y);
            
            // 添加累积的误差
            let adjusted_pixel = [
                (pixel[0] as i16 + error_buffer[y as usize][x as usize][0]).clamp(0, 255) as u8,
                (pixel[1] as i16 + error_buffer[y as usize][x as usize][1]).clamp(0, 255) as u8,
                (pixel[2] as i16 + error_buffer[y as usize][x as usize][2]).clamp(0, 255) as u8,
                pixel[3],
            ];
            
            // 找到调色板中最接近的颜色
            let best_color = find_closest_color(Rgba(adjusted_pixel), palette);
            
            // 计算量化误差
            let error = [
                adjusted_pixel[0] as i16 - best_color[0] as i16,
                adjusted_pixel[1] as i16 - best_color[1] as i16,
                adjusted_pixel[2] as i16 - best_color[2] as i16,
                0, // Alpha 通道不参与抖动
            ];
            
            // 设置当前像素为调色板颜色
            img.put_pixel(x, y, Rgba(best_color));
            
            // 扩散误差到相邻像素（Floyd-Steinberg 算法）
            // 右: 7/16
            if x + 1 < width {
                error_buffer[y as usize][(x + 1) as usize][0] += error[0] * 7 / 16;
                error_buffer[y as usize][(x + 1) as usize][1] += error[1] * 7 / 16;
                error_buffer[y as usize][(x + 1) as usize][2] += error[2] * 7 / 16;
            }
            
            // 左下: 3/16
            if y + 1 < height && x > 0 {
                error_buffer[(y + 1) as usize][(x - 1) as usize][0] += error[0] * 3 / 16;
                error_buffer[(y + 1) as usize][(x - 1) as usize][1] += error[1] * 3 / 16;
                error_buffer[(y + 1) as usize][(x - 1) as usize][2] += error[2] * 3 / 16;
            }
            
            // 下: 5/16
            if y + 1 < height {
                error_buffer[(y + 1) as usize][x as usize][0] += error[0] * 5 / 16;
                error_buffer[(y + 1) as usize][x as usize][1] += error[1] * 5 / 16;
                error_buffer[(y + 1) as usize][x as usize][2] += error[2] * 5 / 16;
            }
            
            // 右下: 1/16
            if y + 1 < height && x + 1 < width {
                error_buffer[(y + 1) as usize][(x + 1) as usize][0] += error[0] * 1 / 16;
                error_buffer[(y + 1) as usize][(x + 1) as usize][1] += error[1] * 1 / 16;
                error_buffer[(y + 1) as usize][(x + 1) as usize][2] += error[2] * 1 / 16;
            }
        }
    }
    
    Ok(())
}

/// 找到调色板中最接近的颜色
fn find_closest_color(pixel: Rgba<u8>, palette: &[Rgba<u8>]) -> [u8; 4] {
    let mut min_distance = u32::MAX;
    let mut best_color = palette[0];
    
    for &palette_color in palette {
        let distance = color_distance(pixel, palette_color);
        if distance < min_distance {
            min_distance = distance;
            best_color = palette_color;
        }
    }
    
    [best_color[0], best_color[1], best_color[2], best_color[3]]
}

/// 计算两个颜色之间的欧几里得距离
fn color_distance(c1: Rgba<u8>, c2: Rgba<u8>) -> u32 {
    let r_diff = c1[0] as i32 - c2[0] as i32;
    let g_diff = c1[1] as i32 - c2[1] as i32;
    let b_diff = c1[2] as i32 - c2[2] as i32;
    
    (r_diff * r_diff + g_diff * g_diff + b_diff * b_diff) as u32
}
