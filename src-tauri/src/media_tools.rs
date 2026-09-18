use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::io::{BufRead, BufReader, Read};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, State};
use walkdir::WalkDir;

#[derive(Clone, Default)]
pub struct MediaState {
    children: Arc<Mutex<HashMap<String, Child>>>,
    cancelled: Arc<Mutex<HashSet<String>>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaInfo {
    pub path: String,
    pub name: String,
    pub kind: String,
    pub size: u64,
    pub duration: f64,
    pub format: String,
    pub video_codec: String,
    pub audio_codec: String,
    pub width: u32,
    pub height: u32,
    pub frame_rate: f64,
    pub sample_rate: u32,
    pub channels: u32,
    pub video_stream_index: Option<u32>,
    pub audio_stream_index: Option<u32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JobRequest {
    pub job_id: String,
    pub input_path: String,
    pub output_dir: String,
    pub operation: String,
    pub target: String,
    pub quality: String,
    pub resolution: String,
    pub audio_bitrate: u32,
    pub duration: f64,
    pub kind: String,
    pub frame_rate: f64,
    pub video_stream_index: Option<u32>,
    pub audio_stream_index: Option<u32>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JobResult {
    pub output_path: String,
    pub size: u64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ProgressEvent {
    job_id: String,
    input_path: String,
    percent: f64,
}

fn supported_extension(path: &Path) -> bool {
    let extension = path.extension().and_then(|value| value.to_str()).unwrap_or("").to_lowercase();
    matches!(extension.as_str(), "mp4" | "mkv" | "mov" | "avi" | "webm" | "m4v" | "mpeg" | "mpg" | "ts" | "mts" | "m2ts" | "mp3" | "m4a" | "aac" | "wav" | "flac" | "ogg" | "opus" | "wma")
}

fn resolve_binary(app: &AppHandle, name: &str) -> Result<PathBuf, String> {
    let suffix = if cfg!(target_os = "windows") { ".exe" } else { "" };
    let filename = format!("{}{}", name, suffix);
    if let Ok(directory) = std::env::var("DAVMEDIA_FFMPEG_DIR") {
        let path = PathBuf::from(directory).join(&filename);
        if path.exists() {
            return Ok(path);
        }
    }
    if cfg!(debug_assertions) {
        let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources").join("ffmpeg").join(&filename);
        if path.exists() {
            return Ok(path);
        }
    }
    if let Ok(resource_dir) = app.path().resource_dir() {
        for directory in [resource_dir.join("resources").join("ffmpeg"), resource_dir.join("ffmpeg")] {
            let path = directory.join(&filename);
            if path.exists() {
                return Ok(path);
            }
        }
    }
    Err(format!("{} non trovato. Esegui npm run prepare:ffmpeg.", filename))
}

fn collect_paths(paths: Vec<String>, recursive: bool) -> Vec<PathBuf> {
    let mut output = Vec::new();
    let mut seen = HashSet::new();
    for raw in paths {
        let path = PathBuf::from(raw);
        if path.is_file() && supported_extension(&path) {
            let key = path.to_string_lossy().to_string();
            if seen.insert(key) {
                output.push(path);
            }
            continue;
        }
        if path.is_dir() {
            let walker = WalkDir::new(path).follow_links(false).max_depth(if recursive { usize::MAX } else { 1 });
            for entry in walker.into_iter().filter_map(Result::ok) {
                let candidate = entry.path();
                if candidate.is_file() && supported_extension(candidate) {
                    let key = candidate.to_string_lossy().to_string();
                    if seen.insert(key) {
                        output.push(candidate.to_path_buf());
                    }
                }
            }
        }
    }
    output
}

fn parse_rate(value: &str) -> f64 {
    let mut parts = value.split('/');
    let numerator = parts.next().and_then(|part| part.parse::<f64>().ok()).unwrap_or(0.0);
    let denominator = parts.next().and_then(|part| part.parse::<f64>().ok()).unwrap_or(1.0);
    if denominator == 0.0 { 0.0 } else { numerator / denominator }
}

fn probe_one(app: &AppHandle, path: &Path) -> Result<MediaInfo, String> {
    let ffprobe = resolve_binary(app, "ffprobe")?;
    let output = Command::new(ffprobe)
        .args(["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams"])
        .arg(path)
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_string());
    }
    let json: Value = serde_json::from_slice(&output.stdout).map_err(|error| error.to_string())?;
    let streams = json.get("streams").and_then(Value::as_array).cloned().unwrap_or_default();
    let video = streams.iter().find(|stream| {
        let is_video = stream.get("codec_type").and_then(Value::as_str) == Some("video");
        let attached = stream.get("disposition").and_then(|value| value.get("attached_pic")).and_then(Value::as_u64).unwrap_or(0) == 1;
        is_video && !attached
    });
    let audio = streams.iter().find(|stream| stream.get("codec_type").and_then(Value::as_str) == Some("audio"));
    let format = json.get("format").cloned().unwrap_or(Value::Null);
    let metadata = fs::metadata(path).map_err(|error| error.to_string())?;
    let duration = format.get("duration").and_then(Value::as_str).and_then(|value| value.parse::<f64>().ok()).unwrap_or(0.0);
    let size = format.get("size").and_then(Value::as_str).and_then(|value| value.parse::<u64>().ok()).unwrap_or(metadata.len());
    let name = path.file_name().and_then(|value| value.to_str()).unwrap_or("media").to_string();
    Ok(MediaInfo {
        path: path.to_string_lossy().to_string(),
        name,
        kind: if video.is_some() { "video".into() } else { "audio".into() },
        size,
        duration,
        format: format.get("format_name").and_then(Value::as_str).unwrap_or("").to_string(),
        video_codec: video.and_then(|stream| stream.get("codec_name")).and_then(Value::as_str).unwrap_or("").to_string(),
        audio_codec: audio.and_then(|stream| stream.get("codec_name")).and_then(Value::as_str).unwrap_or("").to_string(),
        width: video.and_then(|stream| stream.get("width")).and_then(Value::as_u64).unwrap_or(0) as u32,
        height: video.and_then(|stream| stream.get("height")).and_then(Value::as_u64).unwrap_or(0) as u32,
        frame_rate: video.and_then(|stream| stream.get("avg_frame_rate").or_else(|| stream.get("r_frame_rate"))).and_then(Value::as_str).map(parse_rate).unwrap_or(0.0),
        sample_rate: audio.and_then(|stream| stream.get("sample_rate")).and_then(Value::as_str).and_then(|value| value.parse::<u32>().ok()).unwrap_or(0),
        channels: audio.and_then(|stream| stream.get("channels")).and_then(Value::as_u64).unwrap_or(0) as u32,
        video_stream_index: video.and_then(|stream| stream.get("index")).and_then(Value::as_u64).map(|value| value as u32),
        audio_stream_index: audio.and_then(|stream| stream.get("index")).and_then(Value::as_u64).map(|value| value as u32),
    })
}

#[tauri::command]
pub fn scan_media(app: AppHandle, paths: Vec<String>, recursive: bool) -> Result<Vec<MediaInfo>, String> {
    collect_paths(paths, recursive).iter().map(|path| probe_one(&app, path)).collect()
}

fn quality_values(quality: &str, compress: bool) -> (&'static str, &'static str) {
    if compress {
        match quality {
            "fast" => ("veryfast", "26"),
            "small" => ("slow", "32"),
            _ => ("medium", "29"),
        }
    } else {
        match quality {
            "fast" => ("veryfast", "21"),
            "small" => ("slow", "28"),
            _ => ("medium", "23"),
        }
    }
}

fn scale_filter(resolution: &str, force_even: bool) -> Option<String> {
    match resolution {
        "1080" | "720" | "480" => Some(format!("scale=-2:{}", resolution)),
        _ if force_even => Some("scale=trunc(iw/2)*2:trunc(ih/2)*2".into()),
        _ => None,
    }
}

fn audio_args(target: &str, bitrate: u32) -> Vec<String> {
    let rate = format!("{}k", bitrate.clamp(64, 320));
    match target {
        "m4a" => vec!["-vn".into(), "-c:a".into(), "aac".into(), "-b:a".into(), rate],
        "wav" => vec!["-vn".into(), "-c:a".into(), "pcm_s16le".into()],
        "flac" => vec!["-vn".into(), "-c:a".into(), "flac".into()],
        "opus" => vec!["-vn".into(), "-c:a".into(), "libopus".into(), "-b:a".into(), rate],
        _ => vec!["-vn".into(), "-c:a".into(), "libmp3lame".into(), "-b:a".into(), rate],
    }
}

fn video_args(target: &str, quality: &str, resolution: &str, compress: bool, video_stream_index: Option<u32>, audio_stream_index: Option<u32>, frame_rate: f64) -> Result<Vec<String>, String> {
    let video_index = video_stream_index.ok_or_else(|| "Nessun vero stream video trovato. Il file potrebbe contenere soltanto audio e una copertina incorporata.".to_string())?;
    let (preset, crf) = quality_values(quality, compress);
    let mov_family = target == "mp4" || target == "mov";
    let mut args = vec!["-map".into(), format!("0:{}", video_index)];
    if let Some(audio_index) = audio_stream_index {
        args.extend(["-map".into(), format!("0:{}?", audio_index)]);
    }
    args.extend(["-sn".into(), "-dn".into()]);
    if mov_family {
        args.extend(["-map_metadata", "-1", "-map_chapters", "-1"].iter().map(|value| value.to_string()));
    } else {
        args.extend(["-map_metadata", "0"].iter().map(|value| value.to_string()));
    }
    let mut filters = Vec::new();
    if let Some(filter) = scale_filter(resolution, mov_family) {
        filters.push(filter);
    }
    if !frame_rate.is_finite() || frame_rate <= 0.0 || frame_rate > 120.0 {
        filters.push("fps=30".into());
    }
    if !filters.is_empty() {
        args.extend(["-vf".into(), filters.join(",")]);
    }
    if target == "webm" {
        args.extend(["-c:v", "libvpx-vp9", "-crf", crf, "-b:v", "0", "-c:a", "libopus", "-b:a", "160k"].iter().map(|value| value.to_string()));
        return Ok(args);
    }
    args.extend(["-c:v", "libx264", "-preset", preset, "-crf", crf, "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k"].iter().map(|value| value.to_string()));
    if mov_family {
        args.extend(["-ar", "48000", "-tag:v", "avc1", "-movflags", "+faststart", "-max_muxing_queue_size", "4096", "-f", target].iter().map(|value| value.to_string()));
    }
    Ok(args)
}

fn output_extension(request: &JobRequest) -> String {
    if request.operation == "compress" {
        return if request.kind == "video" { "mp4".into() } else { "m4a".into() };
    }
    request.target.clone()
}

fn unique_output(input: &Path, output_dir: &str, extension: &str, operation: &str) -> Result<PathBuf, String> {
    let directory = if output_dir.trim().is_empty() {
        input.parent().unwrap_or_else(|| Path::new(".")).to_path_buf()
    } else {
        PathBuf::from(output_dir)
    };
    fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
    let stem = input.file_stem().and_then(|value| value.to_str()).unwrap_or("media");
    let suffix = match operation { "extract" => "audio", "compress" => "compressed", _ => "converted" };
    let base = format!("{}_{}", stem, suffix);
    let mut candidate = directory.join(format!("{}.{}", base, extension));
    let mut counter = 2;
    while candidate.exists() {
        candidate = directory.join(format!("{}-{}.{}", base, counter, extension));
        counter += 1;
    }
    Ok(candidate)
}

fn build_arguments(request: &JobRequest, output: &Path) -> Result<Vec<String>, String> {
    let mut args = vec!["-hide_banner".into(), "-nostdin".into(), "-i".into(), request.input_path.clone()];
    if request.operation == "extract" {
        if let Some(audio_index) = request.audio_stream_index {
            args.extend(["-map".into(), format!("0:{}", audio_index)]);
        }
        args.extend(["-map_metadata".into(), "0".into()]);
        args.extend(audio_args(&request.target, request.audio_bitrate));
    } else if request.operation == "compress" {
        if request.kind == "video" {
            args.extend(video_args("mp4", &request.quality, &request.resolution, true, request.video_stream_index, request.audio_stream_index, request.frame_rate)?);
        } else {
            if let Some(audio_index) = request.audio_stream_index {
                args.extend(["-map".into(), format!("0:{}", audio_index)]);
            }
            args.extend(["-map_metadata".into(), "0".into()]);
            let rate = match request.quality.as_str() { "fast" => 160, "small" => 96, _ => 128 };
            args.extend(audio_args("m4a", rate));
        }
    } else if request.kind == "video" {
        args.extend(video_args(&request.target, &request.quality, &request.resolution, false, request.video_stream_index, request.audio_stream_index, request.frame_rate)?);
    } else {
        if let Some(audio_index) = request.audio_stream_index {
            args.extend(["-map".into(), format!("0:{}", audio_index)]);
        }
        args.extend(["-map_metadata".into(), "0".into()]);
        args.extend(audio_args(&request.target, request.audio_bitrate));
    }
    args.extend(["-progress".into(), "pipe:1".into(), "-nostats".into(), "-n".into(), output.to_string_lossy().to_string()]);
    Ok(args)
}

fn execute_job(app: AppHandle, children: Arc<Mutex<HashMap<String, Child>>>, cancelled: Arc<Mutex<HashSet<String>>>, request: JobRequest) -> Result<JobResult, String> {
    let ffmpeg = resolve_binary(&app, "ffmpeg")?;
    let input = PathBuf::from(&request.input_path);
    let extension = output_extension(&request);
    let output = unique_output(&input, &request.output_dir, &extension, &request.operation)?;
    let args = build_arguments(&request, &output)?;
    let mut child = Command::new(ffmpeg)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| error.to_string())?;
    let stdout = child.stdout.take().ok_or_else(|| "Impossibile leggere il progresso FFmpeg".to_string())?;
    let stderr = child.stderr.take().ok_or_else(|| "Impossibile leggere l'output FFmpeg".to_string())?;
    children.lock().map_err(|_| "Stato processi non disponibile".to_string())?.insert(request.job_id.clone(), child);
    let app_progress = app.clone();
    let progress_job = request.job_id.clone();
    let progress_input = request.input_path.clone();
    let duration = request.duration;
    let progress_thread = thread::spawn(move || {
        for line in BufReader::new(stdout).lines().map_while(Result::ok) {
            if let Some(raw) = line.strip_prefix("out_time_us=") {
                if let Ok(value) = raw.parse::<f64>() {
                    let percent = if duration > 0.0 { (value / (duration * 1_000_000.0) * 100.0).clamp(0.0, 99.5) } else { 0.0 };
                    let _ = app_progress.emit("media-progress", ProgressEvent { job_id: progress_job.clone(), input_path: progress_input.clone(), percent });
                }
            }
        }
    });
    let error_thread = thread::spawn(move || {
        let mut reader = BufReader::new(stderr);
        let mut buffer = String::new();
        let _ = reader.read_to_string(&mut buffer);
        buffer
    });
    let status = loop {
        thread::sleep(Duration::from_millis(120));
        let mut map = children.lock().map_err(|_| "Stato processi non disponibile".to_string())?;
        let Some(active) = map.get_mut(&request.job_id) else {
            break None;
        };
        match active.try_wait().map_err(|error| error.to_string())? {
            Some(status) => {
                map.remove(&request.job_id);
                break Some(status);
            }
            None => {}
        }
    };
    let _ = progress_thread.join();
    let error_log = error_thread.join().unwrap_or_default();
    let was_cancelled = cancelled.lock().map_err(|_| "Stato annullamento non disponibile".to_string())?.remove(&request.job_id);
    if was_cancelled {
        let _ = fs::remove_file(&output);
        return Err("cancelled".into());
    }
    let Some(status) = status else {
        let _ = fs::remove_file(&output);
        return Err("cancelled".into());
    };
    if !status.success() {
        let _ = fs::remove_file(&output);
        let tail = error_log.lines().filter(|line| !line.trim().is_empty()).rev().take(24).collect::<Vec<_>>().into_iter().rev().collect::<Vec<_>>().join("\n");
        let code = status.code().map(|value| value.to_string()).unwrap_or_else(|| "unknown".into());
        let detail = if tail.is_empty() { "FFmpeg non ha restituito dettagli aggiuntivi".into() } else { tail };
        return Err(format!("FFmpeg exit code: {}\nOperazione: {}\nFormato destinazione: {}\n\n{}", code, request.operation, if request.target.is_empty() { output_extension(&request) } else { request.target.clone() }, detail));
    }
    let size = fs::metadata(&output).map(|metadata| metadata.len()).unwrap_or(0);
    let _ = app.emit("media-progress", ProgressEvent { job_id: request.job_id, input_path: request.input_path, percent: 100.0 });
    Ok(JobResult { output_path: output.to_string_lossy().to_string(), size })
}

#[tauri::command]
pub async fn run_media_job(app: AppHandle, state: State<'_, MediaState>, request: JobRequest) -> Result<JobResult, String> {
    let children = state.children.clone();
    let cancelled = state.cancelled.clone();
    tauri::async_runtime::spawn_blocking(move || execute_job(app, children, cancelled, request)).await.map_err(|error| error.to_string())?
}

#[tauri::command]
pub fn cancel_media_job(state: State<'_, MediaState>, job_id: String) -> Result<(), String> {
    state.cancelled.lock().map_err(|_| "Stato annullamento non disponibile".to_string())?.insert(job_id.clone());
    if let Some(child) = state.children.lock().map_err(|_| "Stato processi non disponibile".to_string())?.get_mut(&job_id) {
        child.kill().map_err(|error| error.to_string())?;
    }
    Ok(())
}
