const VIDEO_EXTENSIONS=new Set(['mp4','mkv','mov','avi','webm','m4v','mpeg','mpg','ts','mts','m2ts']);
const AUDIO_EXTENSIONS=new Set(['mp3','m4a','aac','wav','flac','ogg','opus','wma']);

export const mediaExtensions=()=>[...VIDEO_EXTENSIONS,...AUDIO_EXTENSIONS];
export const extensionOf=(name)=>String(name||'').split('.').pop()?.toLowerCase()||'';
export const guessedKind=(name)=>VIDEO_EXTENSIONS.has(extensionOf(name))?'video':AUDIO_EXTENSIONS.has(extensionOf(name))?'audio':'unknown';
export const formatDuration=(seconds)=>{
  const value=Math.max(0,Math.round(Number(seconds)||0));
  const h=Math.floor(value/3600);
  const m=Math.floor((value%3600)/60);
  const s=value%60;
  return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`;
};
export const formatBytes=(bytes)=>{
  const value=Number(bytes)||0;
  if(value<1024) return `${value} B`;
  const units=['KB','MB','GB','TB'];
  let amount=value/1024;
  let index=0;
  while(amount>=1024&&index<units.length-1){amount/=1024;index+=1;}
  return `${amount.toFixed(amount>=100?0:amount>=10?1:2)} ${units[index]}`;
};
export const videoTargets=()=>[
  ['mp4','MP4','H.264 + AAC'],
  ['mkv','MKV','H.264 + AAC'],
  ['webm','WebM','VP9 + Opus'],
  ['mov','MOV','H.264 + AAC']
];
export const audioTargets=()=>[
  ['mp3','MP3','MP3 320/192/128 kbps'],
  ['m4a','M4A','AAC'],
  ['wav','WAV','PCM lossless'],
  ['flac','FLAC','Lossless'],
  ['opus','Opus','Opus']
];
export const operationOutputExtension=(operation,target,kind)=>{
  if(operation==='compress') return kind==='video'?'mp4':'m4a';
  return target;
};
export const safeBaseName=(name)=>{
  const value=String(name||'media').replace(/\.[^.]+$/,'').trim();
  return value||'media';
};
export const progressPercent=(outTimeUs,durationSeconds)=>{
  const duration=Math.max(0,Number(durationSeconds)||0);
  if(!duration) return 0;
  return Math.max(0,Math.min(100,(Number(outTimeUs)||0)/(duration*1000000)*100));
};

export const resetQueueItems=(files)=>Array.isArray(files)?files.map((file)=>({...file,status:'ready',progress:0})):[];
