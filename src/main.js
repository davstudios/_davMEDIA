import './styles.css';
import './motion.css';
import { invoke } from '@tauri-apps/api/core';
import { getVersion } from '@tauri-apps/api/app';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-dialog';
import { openUrl } from '@tauri-apps/plugin-opener';
import { audioTargets, formatBytes, formatDuration, guessedKind, mediaExtensions, resetQueueItems, videoTargets } from './media-engine.js';

const icons={
  convert:'<svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3M17 17H6l3 3M18 7l-3 3M6 17l3-3"/></svg>',
  music:'<svg viewBox="0 0 24 24"><path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>',
  compress:'<svg viewBox="0 0 24 24"><path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5"/><path d="m3 8 5-5M21 8l-5-5M3 16l5 5M21 16l-5 5"/></svg>',
  history:'<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>',
  settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/></svg>',
  folder:'<svg viewBox="0 0 24 24"><path d="M3 6.5h6l2 2h10V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  file:'<svg viewBox="0 0 24 24"><path d="M7 2h7l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M14 2v5h5"/></svg>',
  film:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M17 9h4M3 15h4M17 15h4"/></svg>',
  audio:'<svg viewBox="0 0 24 24"><path d="M9 17V6l9-2v11"/><circle cx="6" cy="17" r="3"/><circle cx="15" cy="15" r="3"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  trash:'<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/></svg>',
  play:'<svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z"/></svg>',
  stop:'<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="m5 12 4 4 10-10"/></svg>',
  sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon:'<svg viewBox="0 0 24 24"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z"/></svg>',
  globe:'<svg class="globe-icon" viewBox="0 0 390 390" aria-hidden="true"><path d="M195,0C87.305,0,0,87.304,0,195s87.305,195,195,195s195-87.304,195-195S302.695,0,195,0z M119.524,45.678c-3.493,4.838-6.838,10.033-10.007,15.6c-4.841,8.503-9.16,17.656-12.945,27.33c-8.064-2.22-16.089-4.713-24.064-7.483C85.91,66.718,101.813,54.667,119.524,45.678z M52.298,107.694c11.438,4.293,22.976,8.056,34.591,11.293c-4.78,18.934-7.744,39.182-8.745,60.087h-49.72C30.888,153.108,39.305,128.852,52.298,107.694z M52.298,282.306c-12.994-21.159-21.411-45.414-23.874-71.38h49.72c1.002,20.905,3.965,41.153,8.745,60.087C75.274,274.25,63.736,278.013,52.298,282.306z M72.508,308.876c7.975-2.77,16-5.265,24.063-7.483c3.786,9.674,8.105,18.827,12.946,27.33c3.168,5.566,6.514,10.762,10.007,15.6C101.813,335.333,85.91,323.283,72.508,308.876z M179.074,354.07c-20.393-7.648-38.458-29.593-51.05-59.894c16.931-3.125,33.977-5.059,51.05-5.8V354.07z M179.074,256.454c-20.448,0.818-40.862,3.221-61.117,7.191c-4.16-16.355-6.908-34.13-7.915-52.72h69.032V256.454z M179.074,179.074h-69.032c1.007-18.59,3.755-36.365,7.915-52.72c20.254,3.971,40.669,6.373,61.117,7.191V179.074z M179.074,101.623c-17.073-.741-34.118-2.675-51.05-5.8c12.592-30.301,30.657-52.245,51.05-59.894V101.623z M337.703,107.697c12.993,21.157,21.409,45.412,23.872,71.377h-49.72c-1.001-20.903-3.965-41.151-8.744-60.083C314.727,115.754,326.266,111.992,337.703,107.697z M317.495,81.128c-7.975,2.77-16,5.265-24.065,7.484c-3.786-9.676-8.105-18.831-12.947-27.335c-3.169-5.566-6.514-10.762-10.006-15.6C288.189,54.668,304.092,66.72,317.495,81.128z M210.926,35.93c20.393,7.648,38.459,29.595,51.051,59.898c-16.931,3.124-33.977,5.057-51.051,5.797V35.93z M210.926,133.547c20.45-.817,40.865-3.219,61.118-7.188c4.16,16.354,6.907,34.128,7.914,52.716h-69.032V133.547z M210.926,210.926h69.032c-1.007,18.588-3.754,36.362-7.914,52.716c-20.253-3.97-40.668-6.371-61.118-7.189V210.926z M210.926,354.07v-65.694c17.075.741,34.121,2.673,51.051,5.798C249.385,324.475,231.319,346.422,210.926,354.07z M270.477,344.322c3.493-4.838,6.838-10.033,10.006-15.6c4.842-8.504,9.161-17.659,12.947-27.334c8.064,2.22,16.089,4.714,24.065,7.484C304.092,323.28,288.189,335.332,270.477,344.322z M337.703,282.304c-11.437-4.296-22.976-8.058-34.591-11.296c4.779-18.932,7.742-39.179,8.744-60.082h49.72C359.112,236.891,350.696,261.146,337.703,282.304z"/></svg>',
  coffee:'<svg class="coffee-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m20.216 6.415-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 0 0-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 0 0-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 0 1-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 0 1 3.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 0 1-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 0 1-4.743.295 37.059 37.059 0 0 1-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0 0 11.343.376.483.483 0 0 1 .535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 0 1 .39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 0 1-.169.364zm-6.159 3.9c-.862.37-1.84.788-3.109.788a5.884 5.884 0 0 1-1.569-.217l.877 9.004c.065.78.717 1.38 1.5 1.38 0 0 1.243.065 1.658.065.447 0 1.786-.065 1.786-.065.783 0 1.434-.6 1.499-1.38l.94-9.95a3.996 3.996 0 0 0-1.322-.238c-.826 0-1.491.284-2.26.613z"/></svg>'
};

const app=document.querySelector('#app');
const isTauri='__TAURI_INTERNALS__' in window;
const saved=JSON.parse(localStorage.getItem('davmedia-settings')||'{}');
const state={
  page:'convert',
  version:'—',
  settings:{theme:saved.theme||'system',language:saved.language||'it',recursive:saved.recursive!==false},
  files:[],
  targetVideo:'mp4',
  targetAudio:'mp3',
  quality:'balanced',
  resolution:'original',
  audioBitrate:'192',
  outputDir:'',
  running:false,
  currentJob:'',
  activity:JSON.parse(localStorage.getItem('davmedia-activity')||'[]'),
  lastError:null
};

const t=(it,en)=>state.settings.language==='en'?en:it;
const escapeHtml=(value)=>String(value??'').replace(/[&<>'"]/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[char]);
const basename=(path)=>String(path||'').split(/[\\/]/).filter(Boolean).at(-1)||'';

function persistSettings(){localStorage.setItem('davmedia-settings',JSON.stringify(state.settings));}
function persistActivity(){localStorage.setItem('davmedia-activity',JSON.stringify(state.activity.slice(0,80)));}
function resolvedTheme(){return state.settings.theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):state.settings.theme;}
function applyTheme(){document.documentElement.dataset.theme=resolvedTheme();document.documentElement.lang=state.settings.language;}
function runUiTransition(kind,change){document.documentElement.dataset.uiTransition=kind;if(document.startViewTransition){const transition=document.startViewTransition(change);transition.finished.finally(()=>delete document.documentElement.dataset.uiTransition);return;}document.documentElement.dataset.uiTransition=`${kind}-out`;setTimeout(()=>{change();document.documentElement.dataset.uiTransition=`${kind}-in`;setTimeout(()=>delete document.documentElement.dataset.uiTransition,430);},180);}
function navButton(page,icon,label){return `<button class="nav-item ${state.page===page?'active':''}" data-page="${page}">${icon}<span>${label}</span></button>`;}
function shell(content,motion='page'){
  applyTheme();
  app.innerHTML=`<div class="shell" data-motion-mode="${motion}"><aside class="sidebar"><div class="brand"><span>_dav</span>MEDIA</div><nav>${navButton('convert',icons.convert,t('Converti','Convert'))}${navButton('extract',icons.music,t('Estrai audio','Extract audio'))}${navButton('compress',icons.compress,t('Comprimi','Compress'))}${navButton('activity',icons.history,t('Attività','Activity'))}${navButton('settings',icons.settings,t('Impostazioni','Settings'))}</nav><div class="sidebar-bottom"><button class="coffee-button" data-action="coffee">${icons.coffee}<span>${t('Comprami Un Caffè','Buy Me A Coffee')}</span></button><button class="icon-button theme-toggle" data-action="theme"><span class="theme-icon theme-icon-sun">${icons.sun}</span><span class="theme-icon theme-icon-moon">${icons.moon}</span></button></div></aside><main class="main">${content}</main></div><div id="toast-region"></div>`;
  bindGlobal();
}
function header(eyebrow,title,actions=''){return `<header class="topbar"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1></div><div class="top-actions">${actions}</div></header>`;}
function render(motion='page'){if(state.page==='activity') return renderActivity(motion);if(state.page==='settings') return renderSettings(motion);return renderTool(motion);}
function operationCopy(){if(state.page==='extract') return [t('Estrazione audio','Audio extraction'),t('Estrai la traccia audio dai video o converti file audio in un formato diverso.','Extract audio tracks from videos or convert audio files to another format.')];if(state.page==='compress') return [t('Compressione media','Media compression'),t('Riduci le dimensioni mantenendo un controllo chiaro su qualità e risoluzione.','Reduce file size while keeping clear control over quality and resolution.')];return [t('Conversione audio e video','Audio and video conversion'),t('Cambia container e codec in locale con elaborazione batch.','Change containers and codecs locally with batch processing.')];}
function renderTool(motion='page'){
  const [eyebrow,copy]=operationCopy();
  const title=state.page==='extract'?t('Estrai audio','Extract audio'):state.page==='compress'?t('Comprimi media','Compress media'):t('Converti media','Convert media');
  const actions=`<button class="button secondary" data-action="pick-folder">${icons.folder}${t('Cartella','Folder')}</button><button class="button primary" data-action="pick-files">${icons.plus}${t('Aggiungi file','Add files')}</button>`;
  if(!state.files.length){
    shell(`${header(eyebrow,title,actions)}<section class="workspace empty-wrap"><div class="drop-zone" data-drop><div class="drop-icon">${state.page==='extract'?icons.music:icons.film}</div><h2>${t('Trascina qui audio e video','Drop audio and video here')}</h2><p>${copy}</p><div class="drop-actions"><button class="button primary" data-action="pick-files">${icons.plus}${t('Scegli file','Choose files')}</button><button class="button secondary" data-action="pick-folder">${icons.folder}${t('Scegli cartella','Choose folder')}</button></div><div class="format-note">MP4 · MKV · MOV · AVI · WebM · MP3 · M4A · WAV · FLAC · OGG · Opus</div></div><div class="trust-row"><div><strong>${t('Tutto locale','Fully local')}</strong><span>${t('Nessun upload dei tuoi contenuti.','No uploads of your content.')}</span></div><div><strong>FFmpeg</strong><span>${t('Motore preparato automaticamente insieme all’app.','Engine prepared automatically with the app.')}</span></div><div><strong>${t('Batch reale','Real batch')}</strong><span>${t('Coda sequenziale con progresso e annullamento.','Sequential queue with progress and cancellation.')}</span></div></div></section>`,motion);
    bindTool();
    return;
  }
  const runnable=state.files.filter((file)=>file.status!=='running');
  shell(`${header(eyebrow,title,actions)}${errorPanel()}<section class="workspace media-workspace"><div class="panel file-panel"><div class="panel-head"><div><h2>${t('Coda','Queue')}</h2><span>${state.files.length} ${t('elementi','items')}</span></div><button class="icon-button" data-action="clear" ${state.running?'disabled':''}>${icons.trash}</button></div><div class="file-list">${state.files.map(fileRow).join('')}</div></div><div class="workspace-center"><div class="panel summary-panel">${summaryContent(copy)}</div>${state.running?progressCard():''}</div><aside class="panel controls-panel">${controlsContent()}</aside></section>`,motion);
  bindTool();
  document.querySelector('[data-action="process"]')?.toggleAttribute('disabled',!runnable.length||state.running);
}
function errorPanel(){
  if(!state.lastError) return '';
  return `<section class="panel error-panel"><div class="error-panel-head"><div><strong>${t('Conversione non riuscita','Conversion failed')}</strong><span>${escapeHtml(state.lastError.name||'')}</span></div><div class="error-actions"><button class="button secondary" data-action="copy-error">${t('Copia errore','Copy error')}</button><button class="icon-button" data-action="close-error">×</button></div></div><pre>${escapeHtml(state.lastError.message||'')}</pre></section>`;
}
function fileRow(file,index){
  const kind=file.kind||guessedKind(file.name);
  const codec=[file.videoCodec,file.audioCodec].filter(Boolean).join(' + ')||'—';
  const detail=kind==='video'?[file.width&&file.height?`${file.width}×${file.height}`:'',codec,formatDuration(file.duration)].filter(Boolean).join(' · '):[codec,formatDuration(file.duration)].filter(Boolean).join(' · ');
  const status=file.status==='running'?t('Elaborazione','Processing'):file.status==='done'?t('Completato','Done'):file.status==='failed'?t('Errore','Error'):t('Pronto','Ready');
  return `<div class="file-row ${file.status||'ready'}"><div class="media-kind">${kind==='video'?icons.film:icons.audio}</div><div class="file-copy"><strong title="${escapeHtml(file.path)}">${escapeHtml(file.name)}</strong><span>${escapeHtml(detail)} · ${formatBytes(file.size)}</span><div class="mini-progress"><i style="width:${Math.round(file.progress||0)}%"></i></div></div><span class="status ${file.status||'ready'}">${status}</span><button class="icon-button compact-icon" data-remove="${index}" ${state.running?'disabled':''}>${icons.trash}</button></div>`;
}
function summaryContent(copy){
  const videos=state.files.filter((f)=>f.kind==='video').length;
  const audios=state.files.filter((f)=>f.kind==='audio').length;
  const total=state.files.reduce((sum,file)=>sum+(Number(file.size)||0),0);
  return `<div class="summary-hero"><div class="summary-mark">${state.page==='extract'?icons.music:state.page==='compress'?icons.compress:icons.convert}</div><div><h2>${operationCopy()[0]}</h2><p>${copy}</p></div></div><div class="stats-grid"><div><span>${t('Video','Video')}</span><strong>${videos}</strong></div><div><span>${t('Audio','Audio')}</span><strong>${audios}</strong></div><div><span>${t('Dimensione totale','Total size')}</span><strong>${formatBytes(total)}</strong></div></div><div class="output-note"><strong>${t('Output sicuro','Safe output')}</strong><span>${state.outputDir?escapeHtml(state.outputDir):t('Stessa cartella del file originale, con nome univoco.','Same folder as the original, with a unique name.')}</span></div>`;
}
function controlsContent(){
  if(state.page==='extract') return `<h2>${t('Formato audio','Audio format')}</h2>${targetGrid(audioTargets(),state.targetAudio,'audio-target')}<div class="control-block"><label>${t('Bitrate','Bitrate')}</label>${segmented([['320','320k'],['192','192k'],['128','128k'],['96','96k']],state.audioBitrate,'bitrate')}</div>${outputControls()}${processButton(t('Estrai audio','Extract audio'))}`;
  if(state.page==='compress') return `<h2>${t('Compressione','Compression')}</h2><div class="control-block"><label>${t('Profilo','Profile')}</label>${segmented([['fast',t('Rapido','Fast')],['balanced',t('Bilanciato','Balanced')],['small',t('Compatto','Small')]],state.quality,'quality')}</div><div class="control-block"><label>${t('Risoluzione video','Video resolution')}</label>${segmented([['original',t('Originale','Original')],['1080','1080p'],['720','720p'],['480','480p']],state.resolution,'resolution')}</div><div class="control-tip">${t('I file video vengono compressi in MP4 H.264/AAC. I file audio vengono compressi in M4A AAC.','Video files are compressed to MP4 H.264/AAC. Audio files are compressed to M4A AAC.')}</div>${outputControls()}${processButton(t('Avvia compressione','Start compression'))}`;
  const hasVideo=state.files.some((file)=>file.kind==='video');
  const hasAudio=state.files.some((file)=>file.kind==='audio');
  return `<h2>${t('Formato output','Output format')}</h2>${hasVideo?`<div class="control-block"><label>${t('Per i video','For videos')}</label>${targetGrid(videoTargets(),state.targetVideo,'video-target')}</div>`:''}${hasAudio?`<div class="control-block"><label>${t('Per gli audio','For audio')}</label>${targetGrid(audioTargets(),state.targetAudio,'audio-target')}</div>`:''}<div class="control-block"><label>${t('Profilo','Profile')}</label>${segmented([['fast',t('Rapido','Fast')],['balanced',t('Bilanciato','Balanced')],['small',t('Compatto','Small')]],state.quality,'quality')}</div>${hasVideo?`<div class="control-block"><label>${t('Risoluzione','Resolution')}</label>${segmented([['original',t('Originale','Original')],['1080','1080p'],['720','720p'],['480','480p']],state.resolution,'resolution')}</div>`:''}${outputControls()}${processButton(t('Converti coda','Convert queue'))}`;
}
function targetGrid(items,selected,key){return `<div class="target-grid">${items.map(([value,label,detail])=>`<button class="target-tile ${selected===value?'active':''}" data-${key}="${value}"><strong>${label}</strong><span>${detail}</span></button>`).join('')}</div>`;}
function segmented(items,selected,key){return `<div class="segmented">${items.map(([value,label])=>`<button class="${selected===value?'active':''}" data-${key}="${value}">${label}</button>`).join('')}</div>`;}
function outputControls(){return `<div class="control-block"><label>${t('Destinazione','Destination')}</label><button class="folder-choice" data-action="output-folder">${icons.folder}<span><strong>${state.outputDir?t('Cartella personalizzata','Custom folder'):t('Accanto agli originali','Next to originals')}</strong><small>${escapeHtml(state.outputDir||t('Nessun originale viene sovrascritto','Original files are never overwritten'))}</small></span></button>${state.outputDir?`<button class="text-button" data-action="output-reset">${t('Usa cartella originale','Use original folder')}</button>`:''}</div>`;}
function processButton(label){return `<div class="process-zone"><button class="button primary full" data-action="process" ${state.running?'disabled':''}>${icons.play}${label}</button>${state.running?`<button class="button danger full" data-action="cancel">${icons.stop}${t('Annulla corrente','Cancel current')}</button>`:''}</div>`;}
function progressCard(){const current=state.files.find((file)=>file.status==='running');return `<div class="panel progress-card"><div><strong>${t('Elaborazione in corso','Processing')}</strong><span>${escapeHtml(current?.name||'')}</span></div><div class="progress-line"><i style="width:${Math.round(current?.progress||0)}%"></i></div><b>${Math.round(current?.progress||0)}%</b></div>`;}
function renderActivity(motion='page'){
  const items=state.activity;
  shell(`${header('_davMEDIA',t('Attività','Activity'),items.length?`<button class="button secondary" data-action="clear-activity">${t('Svuota','Clear')}</button>`:'')}<section class="history-page panel">${items.length?items.map((item,index)=>`<div class="activity-item"><div class="activity-icon">${item.ok?icons.check:icons.stop}</div><div><strong>${escapeHtml(item.name)}</strong><span>${activityLabel(item)} · ${new Date(item.at).toLocaleString(state.settings.language==='it'?'it-IT':'en-US')}</span>${!item.ok&&item.error?`<button class="text-button activity-error-button" data-error-index="${index}">${t('Mostra errore FFmpeg','Show FFmpeg error')}</button>`:''}</div><small>${escapeHtml(item.output||'')}</small></div>`).join(''):`<div class="empty-mini"><h2>${t('Nessuna attività','No activity yet')}</h2><p>${t('Le conversioni completate appariranno qui.','Completed conversions will appear here.')}</p></div>`}</section>`,motion);
  document.querySelector('[data-action="clear-activity"]')?.addEventListener('click',()=>{state.activity=[];persistActivity();render('content');});
  document.querySelectorAll('[data-error-index]').forEach((node)=>node.addEventListener('click',()=>{const item=state.activity[Number(node.dataset.errorIndex)];if(item?.error){state.lastError={name:item.name,message:item.error};state.page='convert';render('page');}}));
}
function activityLabel(item){const labels={convert:t('Conversione','Conversion'),extract:t('Estrazione audio','Audio extraction'),compress:t('Compressione','Compression')};return `${labels[item.operation]||item.operation} · ${item.ok?t('Completato','Completed'):t('Errore','Failed')}`;}
function renderSettings(motion='page'){
  shell(`${header('_davMEDIA',t('Impostazioni','Settings'))}<section class="settings-grid"><div class="panel settings-card"><h2>${t('Generali','General')}</h2><div class="setting-row"><div><strong>${t('Scansione ricorsiva','Recursive scanning')}</strong><span>${t('Include le sottocartelle quando aggiungi una cartella.','Includes subfolders when you add a folder.')}</span></div><label class="switch"><input type="checkbox" data-setting="recursive" ${state.settings.recursive?'checked':''}><span></span></label></div><div class="setting-control"><span>${t('Tema','Theme')}</span>${davSelect('theme',state.settings.theme,[['system',t('Sistema','System')],['light',t('Chiaro','Light')],['dark',t('Scuro','Dark')]])}</div><div class="setting-control"><span>${t('Lingua','Language')}</span>${davSelect('language',state.settings.language,[['it','Italiano'],['en','English']])}</div></div><div class="panel about-card"><div class="brand big"><span>_dav</span>MEDIA</div><p>${t('Toolbox locale per audio e video basata su FFmpeg. Nessun account, pubblicità o upload.','Local audio and video toolbox powered by FFmpeg. No accounts, ads, or uploads.')}</p><div class="about-links"><button class="website-button" data-action="website">${icons.globe}<span>davstudios.it</span></button><button class="coffee-button wide" data-action="coffee">${icons.coffee}<span>${t('Comprami Un Caffè','Buy Me A Coffee')}</span></button></div><div class="version">v${escapeHtml(state.version)} · ${t('Release stabile','Stable release')}</div></div><div class="panel capability-card"><h2>${t('Stato motore','Engine status')}</h2><div class="capability-list"><div><strong>FFmpeg + FFprobe</strong><span>${t('Preparati automaticamente per la piattaforma corrente.','Prepared automatically for the current platform.')}</span></div><div><strong>${t('Formati principali','Main formats')}</strong><span>MP4 · MKV · WebM · MOV · MP3 · M4A · WAV · FLAC · Opus</span></div><div><strong>${t('Elaborazione','Processing')}</strong><span>${t('Batch sequenziale, progresso reale, annullamento e nomi output senza sovrascrittura.','Sequential batch, real progress, cancellation, and non-overwriting output names.')}</span></div></div></div></section>`,motion);
  bindSettings();
}
function davSelect(key,value,items){const selected=items.find(([v])=>v===value)?.[1]||value;return `<div class="dav-select" data-select="${key}"><button class="dav-select-trigger"><span>${selected}</span><span>⌄</span></button><div class="dav-select-menu">${items.map(([v,label])=>`<button class="dav-select-option ${v===value?'is-selected':''}" data-value="${v}"><span>${label}</span>${v===value?icons.check:''}</button>`).join('')}</div></div>`;}
function bindGlobal(){
  document.querySelectorAll('[data-page]').forEach((node)=>node.addEventListener('click',()=>{if(state.running){toast(t('Attendi la fine o annulla il processo corrente.','Wait for the current process or cancel it.'));return;}state.page=node.dataset.page;render('page');}));
  document.querySelectorAll('[data-action="coffee"]').forEach((node)=>node.addEventListener('click',()=>openExternal('https://buymeacoffee.com/davstudios')));
  document.querySelectorAll('[data-action="website"]').forEach((node)=>node.addEventListener('click',()=>openExternal(state.settings.language==='en'?'https://www.davstudios.it/en':'https://www.davstudios.it')));
  document.querySelectorAll('[data-action="theme"]').forEach((node)=>node.addEventListener('click',()=>{const next=resolvedTheme()==='dark'?'light':'dark';runUiTransition('theme',()=>{state.settings.theme=next;persistSettings();render('content');});}));
}
function bindTool(){
  document.querySelectorAll('[data-action="pick-files"]').forEach((node)=>node.addEventListener('click',pickFiles));
  document.querySelectorAll('[data-action="pick-folder"]').forEach((node)=>node.addEventListener('click',pickFolder));
  document.querySelectorAll('[data-remove]').forEach((node)=>node.addEventListener('click',()=>{state.files.splice(Number(node.dataset.remove),1);render('content');}));
  document.querySelector('[data-action="clear"]')?.addEventListener('click',()=>{state.files=[];render('content');});
  document.querySelectorAll('[data-video-target]').forEach((node)=>node.addEventListener('click',()=>{state.targetVideo=node.dataset.videoTarget;resetQueueForNewSettings();render('content');}));
  document.querySelectorAll('[data-audio-target]').forEach((node)=>node.addEventListener('click',()=>{state.targetAudio=node.dataset.audioTarget;resetQueueForNewSettings();render('content');}));
  document.querySelectorAll('[data-quality]').forEach((node)=>node.addEventListener('click',()=>{state.quality=node.dataset.quality;resetQueueForNewSettings();render('content');}));
  document.querySelectorAll('[data-resolution]').forEach((node)=>node.addEventListener('click',()=>{state.resolution=node.dataset.resolution;resetQueueForNewSettings();render('content');}));
  document.querySelectorAll('[data-bitrate]').forEach((node)=>node.addEventListener('click',()=>{state.audioBitrate=node.dataset.bitrate;resetQueueForNewSettings();render('content');}));
  document.querySelector('[data-action="output-folder"]')?.addEventListener('click',chooseOutputFolder);
  document.querySelector('[data-action="output-reset"]')?.addEventListener('click',()=>{state.outputDir='';render('content');});
  document.querySelector('[data-action="process"]')?.addEventListener('click',processQueue);
  document.querySelector('[data-action="cancel"]')?.addEventListener('click',cancelCurrent);
  document.querySelector('[data-action="close-error"]')?.addEventListener('click',()=>{state.lastError=null;render('content');});
  document.querySelector('[data-action="copy-error"]')?.addEventListener('click',async()=>{if(!state.lastError) return;const value=`${state.lastError.name}\n${state.lastError.message}`;try{await navigator.clipboard.writeText(value);toast(t('Errore copiato.','Error copied.'));}catch{toast(t('Impossibile copiare automaticamente.','Could not copy automatically.'));}});
}
function resetQueueForNewSettings(){
  if(state.running) return;
  state.files=resetQueueItems(state.files);
  state.lastError=null;
}
function bindSettings(){
  document.querySelector('[data-setting="recursive"]')?.addEventListener('change',(event)=>{state.settings.recursive=event.target.checked;persistSettings();});
  document.querySelectorAll('.dav-select-trigger').forEach((node)=>node.addEventListener('click',()=>node.closest('.dav-select').classList.toggle('is-open')));
  document.querySelectorAll('.dav-select-option').forEach((node)=>node.addEventListener('click',()=>{const select=node.closest('.dav-select');const key=select.dataset.select;const value=node.dataset.value;runUiTransition(key==='theme'?'theme':'language',()=>{state.settings[key]=value;persistSettings();render('content');});}));
}
async function pickFiles(){if(!isTauri){toast(t('Apri l’app desktop per scegliere file reali.','Open the desktop app to choose real files.'));return;}const result=await open({multiple:true,directory:false,filters:[{name:'Media',extensions:mediaExtensions()}]});if(result) await addPaths(Array.isArray(result)?result:[result]);}
async function pickFolder(){if(!isTauri) return;const result=await open({multiple:true,directory:true});if(result) await addPaths(Array.isArray(result)?result:[result]);}
async function chooseOutputFolder(){if(!isTauri) return;const result=await open({multiple:false,directory:true});if(result){state.outputDir=result;render('content');}}
async function addPaths(paths){
  const unique=[...new Set(paths.filter(Boolean))];
  if(!unique.length) return;
  try{
    const found=isTauri?await invoke('scan_media',{paths:unique,recursive:state.settings.recursive}):unique.map((path)=>({path,name:basename(path),kind:guessedKind(path),size:0,duration:0}));
    const existing=new Set(state.files.map((file)=>file.path));
    const accepted=found.filter((file)=>!existing.has(file.path)).map((file)=>({...file,status:'ready',progress:0}));
    state.files.push(...accepted);
    if(!accepted.length) toast(t('Nessun nuovo file multimediale trovato.','No new media files found.'));
    render('content');
  }catch(error){toast(String(error));}
}
async function processQueue(){
  if(!state.files.length||state.running) return;
  state.running=true;
  state.files=resetQueueItems(state.files);
  render('content');
  for(const file of state.files){
    const jobId=crypto.randomUUID();
    state.currentJob=jobId;
    file.status='running';
    file.progress=0;
    render('content');
    const target=state.page==='extract'?state.targetAudio:state.page==='compress'?'':file.kind==='video'?state.targetVideo:state.targetAudio;
    try{
      const result=await invoke('run_media_job',{request:{jobId,inputPath:file.path,outputDir:state.outputDir,operation:state.page,target,quality:state.quality,resolution:state.resolution,audioBitrate:Number(state.audioBitrate),duration:file.duration,kind:file.kind,frameRate:Number(file.frameRate)||0,videoStreamIndex:file.videoStreamIndex??null,audioStreamIndex:file.audioStreamIndex??null}});
      file.status='done';
      file.progress=100;
      state.lastError=null;
      state.activity.unshift({at:Date.now(),name:file.name,operation:state.page,ok:true,output:result.outputPath,error:''});
      persistActivity();
    }catch(error){
      const cancelled=String(error).toLowerCase().includes('cancel');
      file.status=cancelled?'ready':'failed';
      file.progress=0;
      if(!cancelled){const message=String(error);state.lastError={name:file.name,message};state.activity.unshift({at:Date.now(),name:file.name,operation:state.page,ok:false,output:'',error:message});persistActivity();toast(t('Conversione non riuscita: apri i dettagli mostrati sopra.','Conversion failed: see the error details shown above.'));}
      if(cancelled) break;
    }
    render('content');
  }
  state.running=false;
  state.currentJob='';
  render('content');
}
async function cancelCurrent(){if(!state.currentJob) return;try{await invoke('cancel_media_job',{jobId:state.currentJob});}catch(error){toast(String(error));}}
async function openExternal(url){try{await openUrl(url);}catch{window.open(url,'_blank','noopener,noreferrer');}}
function toast(message){const region=document.querySelector('#toast-region');if(!region) return;const node=document.createElement('div');node.className='toast';node.textContent=message;region.appendChild(node);setTimeout(()=>{node.classList.add('is-leaving');setTimeout(()=>node.remove(),190);},3600);}
async function init(){
  applyTheme();
  if(isTauri){try{state.version=await getVersion();}catch{}try{await listen('media-progress',(event)=>{const payload=event.payload||{};const file=state.files.find((item)=>item.path===payload.inputPath);if(file){file.progress=Number(payload.percent)||0;const bar=document.querySelector('.progress-line i');const mini=[...document.querySelectorAll('.file-row')][state.files.indexOf(file)]?.querySelector('.mini-progress i');if(bar) bar.style.width=`${file.progress}%`;if(mini) mini.style.width=`${file.progress}%`;const label=document.querySelector('.progress-card b');if(label) label.textContent=`${Math.round(file.progress)}%`;}});}catch{}try{getCurrentWebview().onDragDropEvent(async(event)=>{if(event.payload?.type==='enter') document.querySelector('[data-drop]')?.classList.add('drag-over');if(event.payload?.type==='leave') document.querySelector('[data-drop]')?.classList.remove('drag-over');if(event.payload?.type==='drop'){document.querySelector('[data-drop]')?.classList.remove('drag-over');await addPaths(event.payload.paths||[]);}});}catch{}}
  render('startup');
}

init();

