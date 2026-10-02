# Multiplatform

`_davMEDIA` v26.10.2 uses one Tauri codebase for Windows, macOS and Linux and bundles FFmpeg/FFprobe for the build platform.

- Windows x64: NSIS installer
- macOS Apple Silicon: DMG
- macOS Intel: DMG
- Linux x64: AppImage and DEB

The included GitHub Actions workflow builds each package on its native runner. macOS intentionally uses separate Apple Silicon and Intel jobs so the bundled FFmpeg/FFprobe binaries match each architecture.

Releases are currently not signed with a trusted commercial Windows certificate or Apple Developer ID/notarization. Installation guidance for Windows SmartScreen, macOS Gatekeeper and Linux AppImage permissions is documented in `README.md`.

