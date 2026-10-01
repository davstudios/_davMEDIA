<div align="center">
  <img src="src-tauri/icons/app-icon.png" width="112" alt="_davMEDIA icon">

# _davMEDIA

**Toolbox locale per convertire, estrarre e comprimere audio e video.**  
**Local toolbox for converting, extracting and compressing audio and video.**

`v26.10.1` · Windows · macOS · Linux · Local-first · Open source

[![Italiano](https://img.shields.io/badge/Italiano-006EDB?style=for-the-badge)](#-italiano)
[![English](https://img.shields.io/badge/English-141416?style=for-the-badge)](#-english)

</div>

---

# 🇮🇹 Italiano

`_davMEDIA` è un'app desktop multipiattaforma di **_davstudios** per lavorare localmente con file audio e video. Usa FFmpeg e FFprobe inclusi nell'app: i file restano sul dispositivo e gli originali non vengono sovrascritti automaticamente.

<p>
  <a href="https://www.davstudios.it"><img src=".github/assets/website-it.svg" height="46" alt="Visita il sito"></a>
  <a href="https://buymeacoffee.com/davstudios"><img src=".github/assets/buy-coffee-it.svg" height="46" alt="Comprami Un Caffè"></a>
</p>

## Funzioni principali

- conversione batch video: MP4, MKV, WebM e MOV;
- conversione batch audio: MP3, M4A, WAV, FLAC e Opus;
- distinzione reale tra stream video e copertine `attached_pic`;
- estrazione audio dai video;
- compressione video H.264/AAC e audio AAC;
- profili Rapido, Bilanciato e Compatto;
- resize video Originale, 1080p, 720p e 480p;
- lettura tecnica con FFprobe: codec, durata, risoluzione, sample rate e dimensione;
- drag & drop, scelta file/cartelle e scansione ricorsiva;
- progresso reale, annullamento e diagnostica FFmpeg leggibile;
- riutilizzo della stessa coda per conversioni successive;
- output con nomi univoci e nessuna sovrascrittura automatica;
- tema chiaro/scuro e interfaccia Italiano/English;
- versione mostrata automaticamente dal runtime Tauri;
- nessun account, pubblicità o telemetria.

<details>
<summary><strong>Privacy</strong></summary>

- nessun account;
- nessun upload dei file;
- nessuna elaborazione cloud;
- nessuna telemetria integrata;
- conversione ed elaborazione eseguite localmente tramite FFmpeg/FFprobe.

</details>

## Installazione delle release GitHub non firmate

Le release di `_davMEDIA` sono distribuite direttamente tramite GitHub e, al momento, non utilizzano un certificato commerciale di code signing o la notarizzazione Apple.

### Windows

Windows SmartScreen può mostrare l'avviso **“Windows ha protetto il PC”** perché l'installer non è firmato con un certificato di publisher attendibile. Se hai scaricato il file dalla repository GitHub ufficiale di `_davstudios`, seleziona **Ulteriori informazioni** e poi **Esegui comunque**.

### macOS

Gatekeeper può impedire la prima apertura perché l'app non è firmata con Developer ID e non è notarizzata da Apple. Dopo aver tentato di aprire l'app, vai in **Impostazioni di Sistema → Privacy e Sicurezza**, individua il messaggio relativo a `_davMEDIA` e scegli **Apri comunque**.

### Linux

Per un'AppImage può essere necessario rendere il file eseguibile prima dell'avvio:

```bash
chmod +x _davMEDIA*.AppImage
```

Scarica sempre le release dalla repository GitHub ufficiale di `_davstudios`. Quando viene pubblicato un hash SHA-256, puoi usarlo per verificare l'integrità del file scaricato.

## Piattaforme

| Sistema | Architettura | Pacchetto |
| --- | --- | --- |
| Windows 10/11 | x64 | NSIS `.exe` |
| macOS | Apple Silicon | `.dmg` |
| macOS | Intel | `.dmg` |
| Linux | x64 | `.AppImage` / `.deb` |

Le build macOS sono separate perché ogni pacchetto include i binari FFmpeg/FFprobe appropriati per l'architettura del runner.

## Sviluppo locale

Windows:

```text
RUN-WINDOWS.bat
```

Oppure:

```bash
npm install
npm run desktop
```

Test:

```bash
npm test
```

Build:

```bash
npm run bundle
```

`npm install` installa i pacchetti che forniscono FFmpeg e FFprobe per la piattaforma corrente. Prima di `tauri dev` e `tauri build`, `prepare:ffmpeg` copia i binari corretti in `src-tauri/resources/ffmpeg`.

## Informazioni pacchetto

- Developer / Publisher: `_davstudios`
- Homepage: https://davstudios.it
- Licenza del codice `_davMEDIA`: MIT
- Bundle identifier: `studio.dav.media`
- Versione corrente: `26.10.1`

## Licenza

Il codice sorgente di `_davMEDIA` è distribuito con licenza **MIT**. Consulta [`LICENSE`](LICENSE). FFmpeg, FFprobe e le altre dipendenze di terze parti mantengono le rispettive licenze.

<div align="right"><a href="#davmedia">↑ Torna all'inizio</a></div>

---

# 🇬🇧 English

`_davMEDIA` is a cross-platform desktop app by **_davstudios** for working locally with audio and video files. It ships with FFmpeg and FFprobe: files stay on the device and originals are never overwritten automatically.

<p>
  <a href="https://www.davstudios.it/en"><img src=".github/assets/website-en.svg" height="46" alt="Visit website"></a>
  <a href="https://buymeacoffee.com/davstudios"><img src=".github/assets/buy-coffee-en.svg" height="46" alt="Buy Me A Coffee"></a>
</p>

## Main features

- batch video conversion: MP4, MKV, WebM and MOV;
- batch audio conversion: MP3, M4A, WAV, FLAC and Opus;
- real distinction between video streams and `attached_pic` cover artwork;
- audio extraction from video;
- H.264/AAC video compression and AAC audio compression;
- Fast, Balanced and Small presets;
- Original, 1080p, 720p and 480p resize;
- FFprobe inspection for codecs, duration, resolution, sample rate and size;
- drag and drop, file/folder selection and recursive scanning;
- real progress, cancellation and readable FFmpeg diagnostics;
- reusable queue for subsequent conversions;
- unique output naming with no automatic overwrite;
- light/dark theme and Italiano/English interface;
- version displayed automatically from the Tauri runtime;
- no accounts, ads or telemetry.

<details>
<summary><strong>Privacy</strong></summary>

- no account;
- no file uploads;
- no cloud processing;
- no built-in telemetry;
- conversion and processing run locally through FFmpeg/FFprobe.

</details>

## Installing unsigned GitHub releases

`_davMEDIA` releases are distributed directly through GitHub and currently do not use a commercial trusted code-signing certificate or Apple notarization.

### Windows

Windows SmartScreen may display **“Windows protected your PC”** because the installer is not signed by a trusted publisher certificate. If you downloaded the file from the official `_davstudios` GitHub repository, select **More info** and then **Run anyway**.

### macOS

Gatekeeper may block the first launch because the app is not signed with Developer ID and notarized by Apple. After attempting to open the app, go to **System Settings → Privacy & Security**, locate the message for `_davMEDIA` and choose **Open Anyway**.

### Linux

An AppImage may need to be marked as executable before launch:

```bash
chmod +x _davMEDIA*.AppImage
```

Always download releases from the official `_davstudios` GitHub repository. When a SHA-256 hash is published, you can use it to verify download integrity.

## Platforms

| System | Architecture | Package |
| --- | --- | --- |
| Windows 10/11 | x64 | NSIS `.exe` |
| macOS | Apple Silicon | `.dmg` |
| macOS | Intel | `.dmg` |
| Linux | x64 | `.AppImage` / `.deb` |

macOS builds are separate because each package bundles the FFmpeg/FFprobe binaries appropriate for the runner architecture.

## Local development

Windows:

```text
RUN-WINDOWS.bat
```

Or:

```bash
npm install
npm run desktop
```

Tests:

```bash
npm test
```

Build:

```bash
npm run bundle
```

`npm install` installs the packages that provide FFmpeg and FFprobe for the current platform. Before `tauri dev` and `tauri build`, `prepare:ffmpeg` copies the correct binaries into `src-tauri/resources/ffmpeg`.

## Package information

- Developer / Publisher: `_davstudios`
- Homepage: https://davstudios.it
- `_davMEDIA` source-code license: MIT
- Bundle identifier: `studio.dav.media`
- Current version: `26.10.1`

## License

The `_davMEDIA` source code is distributed under the **MIT License**. See [`LICENSE`](LICENSE). FFmpeg, FFprobe and other third-party dependencies retain their respective licenses.

<div align="right"><a href="#davmedia">↑ Back to top</a></div>
