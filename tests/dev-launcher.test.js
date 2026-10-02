import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const packageJson=JSON.parse(fs.readFileSync('package.json','utf8'));
const tauri=JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json','utf8'));
const vite=fs.readFileSync('vite.config.js','utf8');
const bat=fs.readFileSync('RUN-WINDOWS.bat','utf8');

test('Vite ignora completamente src-tauri',()=>{
  assert.match(vite,/ignored:\s*\[\s*['"]\*\*\/src-tauri\/\*\*['"]\s*\]/);
});

test('FFmpeg viene preparato una sola volta nel flusso Tauri',()=>{
  assert.equal(tauri.build.beforeDevCommand,'npm run dev');
  assert.equal(tauri.build.beforeBuildCommand,'npm run build');
  assert.match(packageJson.scripts.desktop,/prepare:ffmpeg/);
  assert.match(packageJson.scripts.bundle,/prepare:ffmpeg/);
});

test('launcher Windows evita la doppia preparazione FFmpeg',()=>{
  assert.match(bat,/call npm run prepare:ffmpeg/);
  assert.match(bat,/call npx tauri dev/);
  assert.doesNotMatch(bat,/call npm run desktop/);
});

