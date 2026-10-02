import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=(path)=>fs.readFileSync(resolve(root,path),'utf8');
const packageJson=JSON.parse(read('package.json'));
const packageLock=JSON.parse(read('package-lock.json'));
const tauri=JSON.parse(read('src-tauri/tauri.conf.json'));
const cargo=read('src-tauri/Cargo.toml');
const cargoLock=read('src-tauri/Cargo.lock');
const rust=cargo.match(/^version\s*=\s*"([^"]+)"/m)?.[1]||'';
const locked=cargoLock.match(/\[\[package\]\]\r?\nname = "davmedia"\r?\nversion = "([^"]+)"/)?.[1]||'';
const tag=(process.env.RELEASE_TAG||'').replace(/^v/,'');
const values=[packageJson.version,packageLock.version,packageLock.packages?.['']?.version,tauri.version,rust,locked];

if(values.some((value)=>!value)||new Set(values).size!==1) throw new Error(`Versioni non sincronizzate: ${values.join(', ')}`);
if(tag&&tag!==packageJson.version) throw new Error(`Tag ${tag} diverso dalla versione ${packageJson.version}`);
console.log(`Versione release verificata: ${packageJson.version}`);

