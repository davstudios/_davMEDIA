@echo off
setlocal EnableExtensions
set "DAVMEDIA_ROOT=%~dp0"
cd /d "%DAVMEDIA_ROOT%"

where node >nul 2>nul || (echo [ERRORE] Node.js non trovato.& pause & exit /b 1)
where cargo >nul 2>nul || (echo [ERRORE] Rust/Cargo non trovato.& pause & exit /b 1)

echo Verifica dipendenze npm...
if exist "node_modules\@tauri-apps\cli\tauri.js" goto deps_ready
call npm install --no-audit --no-fund
if errorlevel 1 goto error
:deps_ready

echo Preparazione FFmpeg e FFprobe...
call npm run prepare:ffmpeg
if errorlevel 1 goto error

echo Build _davMEDIA...
call npx tauri build
if errorlevel 1 goto error
echo.
echo Build completata. Controlla: src-tauri\target\release\bundle\
exit /b 0

:error
echo.
echo Build non completata. Controlla l'errore mostrato sopra.
pause
exit /b 1

