use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)] // 可能将来会使用
pub enum AppError {
    FileNotFound(String),
    InvalidImageFormat(String),
    ProcessingError(String),
    IoError(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::FileNotFound(msg) => write!(f, "文件未找到: {}", msg),
            AppError::InvalidImageFormat(msg) => write!(f, "无效的图片格式: {}", msg),
            AppError::ProcessingError(msg) => write!(f, "处理错误: {}", msg),
            AppError::IoError(msg) => write!(f, "IO 错误: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}
