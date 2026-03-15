use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PixelTransformSettings {
    pub target_width: u32,
    pub target_height: u32,
    pub pixel_scale: u32,      // 像素显示倍数（1x, 2x, 4x, 8x）
    pub canvas_width: u32,     // 画布宽度（可大于目标分辨率）
    pub canvas_height: u32,    // 画布高度（可大于目标分辨率）
    pub color_count: usize,    // 调色板颜色数量
    pub dithering: bool,       // 是否启用抖动
    pub background_mode: String, // "transparent" 或 "solid"
    pub background_color: Option<String>, // 背景色（HEX格式）
}

impl Default for PixelTransformSettings {
    fn default() -> Self {
        Self {
            target_width: 64,
            target_height: 64,
            pixel_scale: 4,
            canvas_width: 64,
            canvas_height: 64,
            color_count: 16,
            dithering: false,
            background_mode: "transparent".to_string(),
            background_color: None,
        }
    }
}
