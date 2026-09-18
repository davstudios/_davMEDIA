# _davMEDIA v1.0.0

Questa è una preview locale. Non è prevista la pubblicazione GitHub fino alla v1.0.0.

`npm install` installa i pacchetti che forniscono FFmpeg e FFprobe per la piattaforma corrente. Prima di `tauri dev` e `tauri build`, lo script `prepare:ffmpeg` copia i binari in `src-tauri/resources/ffmpeg`.

Per Windows usa `RUN-WINDOWS.bat`. Su macOS e Linux usa gli script `RUN-MACOS.sh` e `RUN-LINUX.sh`.

La build nativa richiede Rust, Node.js e le dipendenze Tauri della piattaforma.
## Windows development watcher

Vite ignores `src-tauri/**` during development so Rust build artifacts in `src-tauri/target` are never watched by Node. This avoids Windows `EBUSY` errors while Cargo is compiling executables.

