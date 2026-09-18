mod media_tools;

use media_tools::{cancel_media_job, run_media_job, scan_media, MediaState};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(target_os = "windows")]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.set_icon(tauri::include_image!("./icons/icon.ico"))?;
                }
            }
            Ok(())
        })
        .manage(MediaState::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![scan_media, run_media_job, cancel_media_job])
        .run(tauri::generate_context!())
        .expect("error while running _davMEDIA");
}
