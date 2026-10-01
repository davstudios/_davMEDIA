import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const packageJson=JSON.parse(fs.readFileSync('package.json','utf8'));
const packageLock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
const tauri=JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json','utf8'));
const cargo=fs.readFileSync('src-tauri/Cargo.toml','utf8');
const cargoLock=fs.readFileSync('src-tauri/Cargo.lock','utf8');
const main=fs.readFileSync('src/main.js','utf8');

test('versioni tecniche sincronizzate',()=>{
  const rust=cargo.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
  const locked=cargoLock.match(/\[\[package\]\]\nname = "davmedia"\nversion = "([^"]+)"/)?.[1];
  assert.equal(packageJson.version,tauri.version);
  assert.equal(packageJson.version,rust);
  assert.equal(packageLock.version,packageJson.version);
  assert.equal(packageLock.packages[''].version,packageJson.version);
  assert.equal(locked,packageJson.version);
});

test('interfaccia legge versione da Tauri',()=>{
  assert.match(main,/getVersion/);
  assert.doesNotMatch(main,/v\d+\.\d+\.\d+/);
});

test('release stabile v26.10.1',()=>{
  assert.equal(packageJson.version,'26.10.1');
  assert.match(main,/Release stabile/);
  assert.doesNotMatch(main,/Preview locale|Local preview/);
});
