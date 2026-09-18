import test from 'node:test';
import assert from 'node:assert/strict';
import { exportedPath } from '../scripts/binary-paths.mjs';

test('ffprobe-static export string viene riconosciuto',()=>{
  assert.equal(exportedPath('C:/tools/ffprobe.exe'),'C:/tools/ffprobe.exe');
});

test('export path legacy viene riconosciuto',()=>{
  assert.equal(exportedPath({path:'/tools/ffprobe'}),'/tools/ffprobe');
});

test('export default viene riconosciuto',()=>{
  assert.equal(exportedPath({default:'/tools/ffprobe'}),'/tools/ffprobe');
});
