# _davMEDIA v26.10.1 build notes

## Requirements

- Node.js LTS
- Rust 1.85 or newer
- Tauri 2 platform prerequisites

## FFmpeg / FFprobe

`npm install` installs the packages that provide FFmpeg and FFprobe for the current platform. Before `tauri dev` and `tauri build`, `npm run prepare:ffmpeg` copies the platform-specific binaries into `src-tauri/resources/ffmpeg`.

## Windows

Run `RUN-WINDOWS.bat` or `BUILD-WINDOWS.bat`.

## macOS

Run `./RUN-MACOS.sh` or `./BUILD-MACOS.sh`.

The GitHub release pipeline intentionally uses separate Apple Silicon and Intel runners so each DMG receives the correct FFmpeg/FFprobe architecture.

## Linux

On Ubuntu/Debian run `./INSTALL-LINUX-DEPS-UBUNTU.sh` first, then use `./RUN-LINUX.sh` or `./BUILD-LINUX.sh`.

## Release scope

Version 26.10.1 adopts the `_davstudios` `YY.M.REVISIONE` release standard, standardized package metadata and automatic bilingual GitHub Release descriptions. The media engine, Rust backend and existing UI behavior are unchanged from the previous stable release.

The release is intentionally not signed with a trusted commercial Windows certificate or Apple Developer ID/notarization. See `README.md` for user-facing installation guidance.
