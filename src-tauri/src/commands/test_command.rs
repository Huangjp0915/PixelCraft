/// 测试 command - 验证前后端通信
#[tauri::command]
pub fn test_command(message: String) -> Result<String, String> {
    Ok(format!("Rust 收到消息: {}", message))
}
