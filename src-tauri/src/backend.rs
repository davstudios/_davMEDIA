use crate::core::{result, ActionOptions, ActionResult};
use std::{path::Path, process::Command};

fn available(name: &str) -> bool { Command::new(name).arg("-version").output().map(|o| o.status.success()).unwrap_or(false) }

#[tauri::command]
pub fn run_action(action: String, paths: Vec<String>, options: ActionOptions) -> ActionResult {
    if !available("ffmpeg") || !available("ffprobe") { return result(false,"FFmpeg not detected","Install FFmpeg and ensure ffmpeg/ffprobe are available in PATH for this preview",String::new()); }
    let Some(input) = paths.first() else { return result(false,"Media required","Choose a media file",String::new()); };
    if action == "probe" {
        return match Command::new("ffprobe").args(["-v","quiet","-print_format","json","-show_format","-show_streams",input]).output() { Ok(out) if out.status.success()=>result(true,"Media inspected","FFprobe completed",String::from_utf8_lossy(&out.stdout).into_owned()),Ok(out)=>result(false,"Probe failed","FFprobe returned an error",String::from_utf8_lossy(&out.stderr).into_owned()),Err(e)=>result(false,"Probe failed","Unable to start FFprobe",e.to_string()) };
    }
    let Some(dest) = options.destination.as_deref() else { return result(false,"Destination required","Choose an output file",String::new()); };
    let mut cmd = Command::new("ffmpeg");
    cmd.args(["-y","-i",input]);
    match action.as_str() {
        "convert_mp4" => { cmd.args(["-c:v","libx264","-crf","20","-c:a","aac",dest]); },
        "extract_audio" => { cmd.args(["-vn","-c:a","libmp3lame","-q:a","2",dest]); },
        "remux" => { cmd.args(["-c","copy",dest]); },
        _ => return result(false,"Preview feature","This workflow is not enabled yet",action)
    }
    match cmd.output() { Ok(out) if out.status.success()=>result(true,"Media operation completed","A new output file was created",dest.into()),Ok(out)=>result(false,"Media operation failed","FFmpeg returned an error",String::from_utf8_lossy(&out.stderr).into_owned()),Err(e)=>result(false,"Media operation failed","Unable to start FFmpeg",e.to_string()) }
}
