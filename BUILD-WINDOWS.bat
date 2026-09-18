@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo Verifica dipendenze npm...
if exist "node_modules\@tauri-apps\cli\tauri.js" goto deps_ready
call npm install
if errorlevel 1 goto error
:deps_ready

echo Preparazione FFmpeg e FFprobe...
call npm run prepare:ffmpeg
if errorlevel 1 goto error

echo Build _davMEDIA...
call npm run bundle
if errorlevel 1 goto error
exit /b 0

:error
echo.
echo Build non completata. Controlla l'errore mostrato sopra.
pause
exit /b 1
