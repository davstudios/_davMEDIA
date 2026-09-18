# GitHub release

`_davMEDIA` pubblica release a partire dalla v1.0.0.

Il workflow parte sui tag `v*` e può anche essere rilanciato manualmente con un tag già esistente.

Build prodotte:
- Windows x64: NSIS
- macOS Apple Silicon: DMG
- macOS Intel: DMG
- Linux x64: AppImage e DEB

Prima della build il workflow scarica FFmpeg e FFprobe per l'architettura del runner, verifica che le tre versioni tecniche coincidano con il tag e avvia i test.
