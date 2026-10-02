import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const vite=fs.readFileSync('vite.config.js','utf8');

test('Vite 8 usa Oxc e non esbuild per la minificazione',()=>{
  assert.match(vite,/minify:\s*['"]oxc['"]/);
  assert.doesNotMatch(vite,/minify:\s*['"]esbuild['"]/);
});

