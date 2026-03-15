use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PixelDocument {
    pub width: u32,
    pub height: u32,
    pub palette: Vec<String>, // 颜色数组，格式为 "#RRGGBB" 或 "#RRGGBBAA"
    pub pixels: Vec<u8>,      // 调色板索引数组
}

impl PixelDocument {
    /// 从像素网格创建文档
    pub fn from_grid(grid: &crate::image_core::grid_builder::PixelGrid) -> Self {
        let mut palette: Vec<String> = grid
            .palette
            .iter()
            .map(|rgba| {
                // 如果 Alpha 是完全不透明（255），使用 #RRGGBB 格式
                // 否则使用 #RRGGBBAA 格式
                if rgba[3] == 255 {
                    format!("#{:02X}{:02X}{:02X}", rgba[0], rgba[1], rgba[2])
                } else {
                    format!("#{:02X}{:02X}{:02X}{:02X}", rgba[0], rgba[1], rgba[2], rgba[3])
                }
            })
            .collect();
        
        // 在调色板末尾固定添加透明色 #00000000
        palette.push("#00000000".to_string());

        Self {
            width: grid.width,
            height: grid.height,
            palette,
            pixels: grid.pixels.clone(),
        }
    }
}
