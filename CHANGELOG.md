# Changelog

## 1.0.1

- Build frontend migrata da esbuild a Oxc per compatibilità con Vite 8.
- Corrette le build GitHub Actions su Windows, macOS e Linux.
- Versione UI aggiornata automaticamente tramite Tauri.

## 1.0.0

Prima release stabile di `_davMEDIA`.

- Conversione audio/video locale con FFmpeg e FFprobe inclusi.
- MP4, MKV, WebM, MOV, MP3, M4A, WAV, FLAC e Opus.
- Estrazione audio, compressione, resize e batch processing.
- Correzione del mapping stream con esclusione delle copertine `attached_pic`.
- Diagnostica FFmpeg persistente per gli errori.
- Coda riutilizzabile per convertire più volte lo stesso file in formati diversi.
- Output sicuro con nomi univoci.
- Versione UI letta automaticamente da Tauri.
- Icona ufficiale `_davMEDIA`.
- Release GitHub multipiattaforma.
