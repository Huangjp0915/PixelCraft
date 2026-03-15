use crate::image_core::resizer;
use crate::image_core::quantizer;
use crate::image_core::grid_builder;
use crate::models::settings::PixelTransformSettings;
use crate::models::pixel_document::PixelDocument;
use image::GenericImageView;

/// 生成像素画
#[tauri::command]
pub fn generate_pixel_art(
    image_path: String,
    settings: PixelTransformSettings,
) -> Result<PixelDocument, String> {
    println!("收到生成像素画请求: path={}, settings={:?}", image_path, settings);
    
    // 1. 解码图片
    use image::ImageReader;
    println!("正在打开图片文件: {}", image_path);
    let dynamic_img = ImageReader::open(&image_path)
        .map_err(|e| {
            let err = format!("无法打开图片文件: {}", e);
            println!("错误: {}", err);
            err
        })?
        .decode()
        .map_err(|e| {
            let err = format!("无法解码图片: {}", e);
            println!("错误: {}", err);
            err
        })?;
    
    let (img_width, img_height) = dynamic_img.dimensions();
    println!("图片解码成功，尺寸: {}x{}", img_width, img_height);

    // 2. 缩放图片到目标分辨率
    println!("开始缩放图片: {}x{} -> {}x{}", 
        img_width, 
        img_height,
        settings.target_width,
        settings.target_height
    );
    let resized = resizer::resize_nearest(
        &dynamic_img,
        settings.target_width,
        settings.target_height,
    )
    .map_err(|e| {
        let err = format!("缩放图片失败: {}", e);
        println!("错误: {}", err);
        err
    })?;
    println!("图片缩放完成");

    // 3. 颜色量化
    println!("开始颜色量化，调色板数量: {}, 抖动: {}", settings.color_count, settings.dithering);
    let quantized = quantizer::quantize_image(
        &resized,
        settings.color_count as usize,
        settings.dithering,
    )
    .map_err(|e| {
        let err = format!("颜色量化失败: {}", e);
        println!("错误: {}", err);
        err
    })?;
    println!("颜色量化完成，调色板大小: {}", quantized.palette.len());

    // 4. 生成像素网格
    println!("生成像素网格...");
    let grid = grid_builder::PixelGrid::from_quantized(quantized);

    // 5. 转换为文档格式
    println!("转换为文档格式...");
    let document = PixelDocument::from_grid(&grid);
    println!("生成完成！文档尺寸: {}x{}, 调色板: {} 种颜色", 
        document.width, document.height, document.palette.len());

    Ok(document)
}
