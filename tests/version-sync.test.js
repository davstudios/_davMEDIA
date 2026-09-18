import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const packageJson=JSON.parse(fs.readFileSync('package.json','utf8'));
const tauri=JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json','utf8'));
const cargo=fs.readFileSync('src-tauri/Cargo.toml','utf8');
const main=fs.readFileSync('src/main.js','utf8');

test('versioni tecniche sincronizzate',()=>{const rust=cargo.match(/^version\s*=\s*"([^"]+)"/m)?.[1];assert.equal(packageJson.version,tauri.version);assert.equal(packageJson.version,rust);});
test('interfaccia legge versione da Tauri',()=>{assert.match(main,/getVersion/);assert.doesNotMatch(main,/v\d+\.\d+\.\d+/);});

test('release stabile v1.0.0',()=>{assert.equal(packageJson.version,'1.0.0');assert.match(main,/Release stabile/);assert.doesNotMatch(main,/Preview locale|Local preview/);});
