<div align="center">
  <img src="src-tauri/icons/app-icon.png" width="112" alt="_davMEDIA icon">
</div>

# `_davMEDIA`

Toolbox locale per convertire, estrarre e comprimere audio e video.  
Local toolbox for converting, extracting and compressing audio and video.

**Windows · macOS · Linux · Local-first · Open source**

## Italiano

`_davMEDIA` usa FFmpeg e FFprobe inclusi nell'app: i file restano sul dispositivo e gli originali non vengono sovrascritti.

### Funzioni principali

- Conversione batch video: MP4, MKV, WebM e MOV.
- Conversione batch audio: MP3, M4A, WAV, FLAC e Opus.
- Distinzione reale tra stream video e copertine `attached_pic`.
- Estrazione audio dai video.
- Compressione video H.264/AAC e audio AAC.
- Profili Rapido, Bilanciato e Compatto.
- Resize video Originale, 1080p, 720p e 480p.
- Lettura tecnica con FFprobe: codec, durata, risoluzione, sample rate e dimensione.
- Drag & drop, scelta file/cartelle e scansione ricorsiva.
- Progresso reale, annullamento e diagnostica FFmpeg leggibile.
- Riutilizzo della stessa coda: dopo una conversione puoi scegliere un altro formato e convertire di nuovo senza ricaricare i file.
- Output con nomi univoci e nessuna sovrascrittura automatica.
- Tema chiaro/scuro e interfaccia Italiano/English.
- Versione mostrata automaticamente dal runtime Tauri.
- Nessun account, pubblicità o telemetria.

### Avvio locale

Windows: `RUN-WINDOWS.bat`

Oppure:

```bash
npm install
npm run desktop
```

### Release

Le release GitHub partono dalla v1.0.0. Il workflow genera Windows NSIS, Linux AppImage/DEB e due build macOS separate per Apple Silicon e Intel, ciascuna con FFmpeg della propria architettura.

## English

`_davMEDIA` ships with FFmpeg and FFprobe: files stay on the device and originals are never overwritten.

### Main features

- Batch video conversion: MP4, MKV, WebM and MOV.
- Batch audio conversion: MP3, M4A, WAV, FLAC and Opus.
- Real distinction between video streams and `attached_pic` cover artwork.
- Audio extraction from video.
- H.264/AAC video compression and AAC audio compression.
- Fast, Balanced and Small presets.
- Original, 1080p, 720p and 480p resize.
- FFprobe inspection for codecs, duration, resolution, sample rate and size.
- Drag and drop, file/folder selection and recursive scanning.
- Real progress, cancellation and readable FFmpeg diagnostics.
- Reusable queue: after one conversion, choose another format and convert the same sources again without reloading them.
- Unique output naming with no automatic overwrite.
- Light/dark theme and Italiano/English interface.
- Version displayed automatically from the Tauri runtime.
- No accounts, ads or telemetry.

### Local development

Windows: `RUN-WINDOWS.bat`

Or:

```bash
npm install
npm run desktop
```

### Releases

GitHub releases start at v1.0.0. The workflow builds Windows NSIS, Linux AppImage/DEB and separate macOS Apple Silicon and Intel packages so each app ships with the correct FFmpeg architecture.

## Support _davstudios

Website: https://www.davstudios.it  
Buy Me A Coffee: https://buymeacoffee.com/davstudios

## License

MIT
