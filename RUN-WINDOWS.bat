@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo.
echo ========================================
echo          _davMEDIA
echo ========================================
echo.

echo [1/6] Controllo Node.js...
where node >nul 2>nul
if errorlevel 1 goto missing_node
node --version

echo.
echo [2/6] Controllo npm...
where npm >nul 2>nul
if errorlevel 1 goto missing_npm
call npm --version

echo.
echo [3/6] Controllo Rust/Cargo...
where cargo >nul 2>nul
if errorlevel 1 goto missing_cargo
cargo --version
where rustc >nul 2>nul
if errorlevel 1 goto missing_rustc
rustc --version

echo.
echo [4/6] Verifica dipendenze npm...
if exist "node_modules\@tauri-apps\cli\tauri.js" if exist "node_modules\ffmpeg-static\index.js" if exist "node_modules\@derhuerst\ffprobe-static\index.js" goto deps_ready
call npm install --include=dev
if errorlevel 1 goto npm_error
:deps_ready

echo.
echo [5/6] Preparazione FFmpeg e FFprobe...
echo Se i binari risultano mancanti, verranno ripristinati automaticamente.
call npm run prepare:ffmpeg
if errorlevel 1 goto ffmpeg_error
if not exist "src-tauri\resources\ffmpeg\ffmpeg.exe" goto ffmpeg_missing
if not exist "src-tauri\resources\ffmpeg\ffprobe.exe" goto ffprobe_missing
for %%F in ("src-tauri\resources\ffmpeg\ffmpeg.exe") do echo FFmpeg: %%~zF bytes
for %%F in ("src-tauri\resources\ffmpeg\ffprobe.exe") do echo FFprobe: %%~zF bytes

echo.
echo [6/6] Avvio _davMEDIA...
echo Se la prima compilazione Rust richiede tempo, lascia aperta questa finestra.
echo.
call npx tauri dev
if errorlevel 1 goto desktop_error
exit /b 0

:missing_node
echo.
echo ERRORE: Node.js non e disponibile nel PATH.
goto fail

:missing_npm
echo.
echo ERRORE: npm non e disponibile nel PATH.
goto fail

:missing_cargo
echo.
echo ERRORE: Cargo non e disponibile nel PATH. Installa Rust tramite rustup e riapri il terminale.
goto fail

:missing_rustc
echo.
echo ERRORE: rustc non e disponibile nel PATH.
goto fail

:npm_error
echo.
echo ERRORE: npm install non e stato completato.
echo Copia qui in chat le righe che iniziano con npm ERR.
goto fail

:ffmpeg_error
echo.
echo ERRORE: preparazione FFmpeg non completata.
echo Copia qui in chat il messaggio mostrato sopra.
goto fail

:ffmpeg_missing
echo.
echo ERRORE: ffmpeg.exe non e stato creato nella cartella delle risorse.
goto fail

:ffprobe_missing
echo.
echo ERRORE: ffprobe.exe non e stato creato nella cartella delle risorse.
goto fail

:desktop_error
echo.
echo ERRORE: Tauri non e riuscito ad avviare _davMEDIA.
echo Copia qui in chat da "error" fino alla fine del messaggio.
goto fail

:fail
echo.
echo ========================================
echo L'avvio non e stato completato.
echo ========================================
pause
exit /b 1
