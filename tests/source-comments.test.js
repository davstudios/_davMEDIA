import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const roots=['src','src-tauri/src','scripts'];
const extensions=new Set(['.js','.mjs','.css','.rs','.html']);
const files=[];
for(const root of roots){for(const entry of fs.readdirSync(root,{recursive:true,withFileTypes:true})){if(!entry.isFile()) continue;const full=path.join(entry.parentPath,entry.name);if(extensions.has(path.extname(entry.name))) files.push(full);}}

test('sorgenti senza commenti',()=>{for(const file of files){const text=fs.readFileSync(file,'utf8').replace(/https?:\/\/[^\s'"<)]+/g,'');assert.doesNotMatch(text,/\/\*|\*\//,file);assert.doesNotMatch(text,/^\s*\/\//m,file);assert.doesNotMatch(text,/<!--|-->/,file);}});

