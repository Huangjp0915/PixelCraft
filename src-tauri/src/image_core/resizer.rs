use image::{DynamicImage, GenericImageView, imageops::FilterType};

/// 图片缩放算法
#[derive(Debug, Clone, Copy)]
#[allow(dead_code)] // Triangle 和 CatmullRom 可能将来会使用
pub enum ResizeAlgorithm {
    Nearest,  // 最近邻（适合像素画）
    Triangle, // 三角形（双线性）
    CatmullRom, // Catmull-Rom（双三次）
}

/// 缩放图片到目标分辨率
pub fn resize_image(
    img: &DynamicImage,
    target_width: u32,
    target_height: u32,
    algorithm: ResizeAlgorithm,
) -> Result<DynamicImage, String> {
    let (src_width, src_height) = img.dimensions();
    
    // 如果尺寸相同，直接返回
    if src_width == target_width && src_height == target_height {
        return Ok(img.clone());
    }

    // 选择缩放算法
    let filter_type = match algorithm {
        ResizeAlgorithm::Nearest => FilterType::Nearest,
        ResizeAlgorithm::Triangle => FilterType::Triangle,
        ResizeAlgorithm::CatmullRom => FilterType::CatmullRom,
    };

    // 使用 image crate 的 resize 方法
    let resized = img.resize_exact(target_width, target_height, filter_type);
    Ok(resized)
}

/// 使用最近邻算法缩放（适合像素画）
pub fn resize_nearest(
    img: &DynamicImage,
    target_width: u32,
    target_height: u32,
) -> Result<DynamicImage, String> {
    resize_image(img, target_width, target_height, ResizeAlgorithm::Nearest)
}
