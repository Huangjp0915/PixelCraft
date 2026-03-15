use serde::{Deserialize, Serialize};
use crate::models::settings::PixelTransformSettings;
use crate::models::pixel_document::PixelDocument;

/// 工程文件数据结构
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectFile {
    pub version: String,              // 版本号，用于兼容性检查
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_image: Option<String>, // 源图片路径（可选）
    pub settings: PixelTransformSettings, // 转换参数
    pub document: PixelDocument,       // 像素文档
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,   // 创建时间（ISO 8601）
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,   // 更新时间（ISO 8601）
}

impl ProjectFile {
    /// 当前支持的工程文件版本
    pub const CURRENT_VERSION: &'static str = "1.0.0";

    /// 检查版本兼容性
    pub fn is_version_compatible(&self) -> bool {
        // 简单版本检查：主版本号相同即可
        let current_major = Self::CURRENT_VERSION.split('.').next().unwrap_or("1");
        let file_major = self.version.split('.').next().unwrap_or("0");
        current_major == file_major
    }
}
