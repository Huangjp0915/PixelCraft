use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageMeta {
    pub path: String,
    pub width: u32,
    pub height: u32,
}
