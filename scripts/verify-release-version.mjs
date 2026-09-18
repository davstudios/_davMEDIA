import fs from 'node:fs';

const packageJson=JSON.parse(fs.readFileSync('package.json','utf8'));
const tauri=JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json','utf8'));
const cargo=fs.readFileSync('src-tauri/Cargo.toml','utf8');
const rust=cargo.match(/^version\s*=\s*"([^"]+)"/m)?.[1]||'';
const tag=(process.env.RELEASE_TAG||'').replace(/^v/,'');
const values=[packageJson.version,tauri.version,rust];

if(new Set(values).size!==1) throw new Error(`Versioni non sincronizzate: ${values.join(', ')}`);
if(tag&&tag!==packageJson.version) throw new Error(`Tag ${tag} diverso dalla versione ${packageJson.version}`);
console.log(`Versione release verificata: ${packageJson.version}`);
