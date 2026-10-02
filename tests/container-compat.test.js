import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync('src-tauri/src/media_tools.rs','utf8');
const main=fs.readFileSync('src/main.js','utf8');

test('copertine incorporate non vengono trattate come vero video',()=>{
  assert.match(source,/attached_pic/);
  assert.match(source,/is_video && !attached/);
});

test('FFmpeg usa gli indici reali degli stream',()=>{
  assert.match(source,/video_stream_index/);
  assert.match(source,/audio_stream_index/);
  assert.match(source,/format!\("0:\{\}", video_index\)/);
  assert.match(main,/videoStreamIndex:file\.videoStreamIndex/);
  assert.match(main,/audioStreamIndex:file\.audioStreamIndex/);
});

test('MP4 e MOV normalizzano H264 AAC per compatibilita',()=>{
  assert.match(source,/"libx264"/);
  assert.match(source,/"yuv420p"/);
  assert.match(source,/"aac"/);
  assert.match(source,/"avc1"/);
  assert.match(source,/"\+faststart"/);
});

test('framerate anomalo viene normalizzato',()=>{
  assert.match(source,/frame_rate > 120\.0/);
  assert.match(source,/"fps=30"/);
});

