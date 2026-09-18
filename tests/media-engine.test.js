import test from 'node:test';
import assert from 'node:assert/strict';
import { audioTargets, extensionOf, formatBytes, formatDuration, guessedKind, mediaExtensions, operationOutputExtension, progressPercent, resetQueueItems, safeBaseName, videoTargets } from '../src/media-engine.js';

test('riconosce i video principali',()=>{assert.equal(guessedKind('clip.MP4'),'video');assert.equal(guessedKind('movie.mkv'),'video');});
test('riconosce gli audio principali',()=>{assert.equal(guessedKind('song.mp3'),'audio');assert.equal(guessedKind('track.FLAC'),'audio');});
test('estensione sconosciuta resta unknown',()=>assert.equal(guessedKind('notes.txt'),'unknown'));
test('estrae estensione normalizzata',()=>assert.equal(extensionOf('Movie.WebM'),'webm'));
test('formatta durata breve',()=>assert.equal(formatDuration(125),'2:05'));
test('formatta durata lunga',()=>assert.equal(formatDuration(3661),'1:01:01'));
test('formatta byte',()=>assert.equal(formatBytes(1048576),'1.00 MB'));
test('progress percent viene limitato',()=>{assert.equal(progressPercent(5000000,10),50);assert.equal(progressPercent(20000000,10),100);});
test('compressione sceglie estensione coerente',()=>{assert.equal(operationOutputExtension('compress','', 'video'),'mp4');assert.equal(operationOutputExtension('compress','', 'audio'),'m4a');});
test('conversione mantiene target',()=>assert.equal(operationOutputExtension('convert','webm','video'),'webm'));
test('nome base rimuove estensione',()=>assert.equal(safeBaseName('vacanza.final.mp4'),'vacanza.final'));
test('target principali sono disponibili',()=>{assert.ok(videoTargets().some(([value])=>value==='mp4'));assert.ok(audioTargets().some(([value])=>value==='flac'));assert.ok(mediaExtensions().includes('opus'));});

test('coda completata torna pronta per una nuova conversione',()=>{
  const files=resetQueueItems([{path:'a.mp4',status:'done',progress:100},{path:'b.mp4',status:'failed',progress:0}]);
  assert.deepEqual(files.map((file)=>[file.status,file.progress]),[['ready',0],['ready',0]]);
});
