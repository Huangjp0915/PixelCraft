// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod errors;
mod image_core;
mod models;

use tauri::{Manager, Emitter};
use commands::{test_command, load_image, generate_pixel_art, export_png, export_jpg, read_image_base64, save_project, load_project, save_dropped_file, load_window_state, save_window_state, WindowState, log_error, log_info};
use std::env;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }

            // 处理命令行参数（文件关联打开）
            let args: Vec<String> = env::args().collect();
            if args.len() > 1 {
                let file_path = &args[1];
                // 检查是否是支持的文件类型
                if file_path.ends_with(".pixproj") || 
                   file_path.ends_with(".jpg") || 
                   file_path.ends_with(".jpeg") || 
                   file_path.ends_with(".png") {
                    // 发送事件到前端
                    if let Some(window) = app.get_webview_window("main") {
                        window.emit("open-file", file_path).unwrap_or_default();
                    }
                }
            }

            // 窗口状态记忆：恢复窗口位置和大小
            let app_handle = app.handle().clone();
            if let Some(window) = app.get_webview_window("main") {
                match load_window_state(app_handle.clone()) {
                    Ok(state) => {
                        if let Some(x) = state.x {
                            if let Some(y) = state.y {
                                let _ = window.set_position(tauri::LogicalPosition::new(x as i32, y as i32));
                            }
                        }
                        let _ = window.set_size(tauri::LogicalSize::new(state.width as u32, state.height as u32));
                        if state.maximized {
                            let _ = window.maximize();
                        }
                        if state.fullscreen {
                            let _ = window.set_fullscreen(true);
                        }
                    }
                    Err(e) => {
                        // 如果加载失败，使用默认设置（居中）
                        log_error(app_handle.clone(), format!("加载窗口状态失败: {}", e));
                        let _ = window.center();
                    }
                }
            }
            
            // 记录应用启动
            log_info(app_handle, "PixelCraft 应用启动".to_string());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            test_command,
            load_image,
            generate_pixel_art,
            export_png,
            export_jpg,
            read_image_base64,
            save_project,
            load_project,
            save_dropped_file,
            load_window_state,
            save_window_state,
            log_error,
            log_info,
        ])
        .on_window_event(|window, event| {
            // 监听窗口事件，保存窗口状态
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // 保存窗口状态（静默保存，不阻塞关闭）
                if let Ok(pos) = window.outer_position() {
                    if let Ok(size) = window.outer_size() {
                        let state = WindowState {
                            x: Some(pos.x as f64),
                            y: Some(pos.y as f64),
                            width: size.width as f64,
                            height: size.height as f64,
                            maximized: window.is_maximized().unwrap_or(false),
                            fullscreen: window.is_fullscreen().unwrap_or(false),
                        };
                        // 异步保存，不阻塞窗口关闭
                        let app_handle = window.app_handle().clone();
                        std::thread::spawn(move || {
                            let _ = save_window_state(app_handle, state);
                        });
                    }
                }
                // 在 Tauri 2 中，CloseRequested 事件默认允许关闭，不需要显式调用 api.close()
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
