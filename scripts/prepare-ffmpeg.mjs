import { createRequire } from 'node:module';
import { chmodSync, copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { firstExisting, packageBinaryCandidates } from './binary-paths.mjs';

const require=createRequire(import.meta.url);
const target=join(process.cwd(),'src-tauri','resources','ffmpeg');
const suffix=process.platform==='win32'?'.exe':'';

function locate(packageName,binaryName,envName){
  return firstExisting(packageBinaryCandidates(require,packageName,binaryName,suffix,process.env[envName]||''));
}

let ffmpegPath=locate('ffmpeg-static','ffmpeg','FFMPEG_BIN');
let ffprobePath=locate('@derhuerst/ffprobe-static','ffprobe','FFPROBE_BIN');
const packages=[];

if(!ffmpegPath) packages.push('ffmpeg-static');
if(!ffprobePath) packages.push('@derhuerst/ffprobe-static');

if(packages.length){
  console.log(`Ripristino binari mancanti: ${packages.join(', ')}`);
  const result=spawnSync('npm',['rebuild',...packages,'--foreground-scripts'],{
    cwd:process.cwd(),
    env:{...process.env},
    stdio:'inherit',
    shell:process.platform==='win32'
  });
  if(result.status!==0) throw new Error('Ripristino automatico dei binari FFmpeg non riuscito.');
  ffmpegPath=locate('ffmpeg-static','ffmpeg','FFMPEG_BIN');
  ffprobePath=locate('@derhuerst/ffprobe-static','ffprobe','FFPROBE_BIN');
}

mkdirSync(target,{recursive:true});
const targets=[
  [ffmpegPath,join(target,`ffmpeg${suffix}`),'ffmpeg'],
  [ffprobePath,join(target,`ffprobe${suffix}`),'ffprobe']
];

for(const [source,destination,name] of targets){
  if(!source||!existsSync(source)) throw new Error(`Binary ${name} non trovato dopo la preparazione.`);
  const same=existsSync(destination)&&statSync(destination).size===statSync(source).size;
  if(!same) copyFileSync(source,destination);
  if(process.platform!=='win32') chmodSync(destination,0o755);
  if(!existsSync(destination)||statSync(destination).size===0) throw new Error(`Verifica finale fallita per ${name}.`);
  console.log(`${name}: ${destination} (${statSync(destination).size} bytes)`);
}

console.log(`FFmpeg e FFprobe pronti in ${target}`);

