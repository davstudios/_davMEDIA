import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('gli errori FFmpeg restano visibili nella UI',()=>{
  const source=fs.readFileSync('src/main.js','utf8');
  assert.match(source,/lastError/);
  assert.match(source,/Copia errore/);
  assert.match(source,/Show FFmpeg error/);
  assert.match(source,/error:message/);
});

test('il backend restituisce exit code e dettagli FFmpeg',()=>{
  const source=fs.readFileSync('src-tauri/src/media_tools.rs','utf8');
  assert.match(source,/FFmpeg exit code/);
  assert.match(source,/take\(24\)/);
});

