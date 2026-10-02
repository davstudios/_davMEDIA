import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const packageJson=JSON.parse(fs.readFileSync('package.json','utf8'));

test('script install FFmpeg approvati esplicitamente',()=>{
  assert.equal(packageJson.allowScripts?.['ffmpeg-static'],true);
  assert.equal(packageJson.allowScripts?.['@derhuerst/ffprobe-static'],true);
});

