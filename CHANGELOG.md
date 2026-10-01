# Changelog

## 26.10.1

- Adottato il nuovo standard di versioning `_davstudios` `YY.M.REVISIONE`.
- Sincronizzata la versione dell'app su npm, Tauri, Cargo, lockfile, documentazione e test.
- Standardizzati i metadata ufficiali del pacchetto con publisher `_davstudios`, homepage, copyright, licenza MIT e metadata Debian.
- Mantenuto l'identifier storico `studio.dav.media` per preservare la continuità dell'identità applicativa.
- Aggiunte al README le istruzioni per le release GitHub non firmate su Windows, macOS e Linux.
- Il workflow GitHub Actions usa ora automaticamente la Description bilingue del commit associato al tag come descrizione della GitHub Release.
- Rafforzata l'installazione delle dipendenze Linux contro repository Microsoft non raggiungibili sui runner Ubuntu.
- Preservate le build macOS separate per Apple Silicon e Intel, necessarie per includere i binari FFmpeg/FFprobe corretti.
- Nessuna modifica al motore di conversione, al backend Rust o al comportamento dell'interfaccia.

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
