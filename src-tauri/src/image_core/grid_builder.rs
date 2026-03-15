use crate::image_core::quantizer::QuantizedImage;

/// 像素文档数据结构
#[derive(Debug, Clone)]
pub struct PixelGrid {
    pub width: u32,
    pub height: u32,
    pub palette: Vec<[u8; 4]>, // RGBA 颜色数组
    pub pixels: Vec<u8>,       // 调色板索引数组
}

impl PixelGrid {
    /// 从量化结果创建像素网格
    pub fn from_quantized(quantized: QuantizedImage) -> Self {
        let palette: Vec<[u8; 4]> = quantized
            .palette
            .iter()
            .map(|rgba| [rgba[0], rgba[1], rgba[2], rgba[3]])
            .collect();

        Self {
            width: quantized.width,
            height: quantized.height,
            palette,
            pixels: quantized.indices,
        }
    }

    /// 获取指定位置的像素颜色
    #[allow(dead_code)] // 可能将来会使用
    pub fn get_pixel(&self, x: u32, y: u32) -> Option<[u8; 4]> {
        if x >= self.width || y >= self.height {
            return None;
        }

        let index = (y * self.width + x) as usize;
        let palette_index = self.pixels.get(index)?;
        self.palette.get(*palette_index as usize).copied()
    }

    /// 设置指定位置的像素颜色
    #[allow(dead_code)] // 可能将来会使用
    pub fn set_pixel(&mut self, x: u32, y: u32, palette_index: u8) -> Result<(), String> {
        if x >= self.width || y >= self.height {
            return Err(format!("坐标超出范围: ({}, {})", x, y));
        }

        if palette_index as usize >= self.palette.len() {
            return Err(format!("调色板索引超出范围: {}", palette_index));
        }

        let index = (y * self.width + x) as usize;
        if let Some(pixel) = self.pixels.get_mut(index) {
            *pixel = palette_index;
            Ok(())
        } else {
            Err("无法设置像素".to_string())
        }
    }
}
