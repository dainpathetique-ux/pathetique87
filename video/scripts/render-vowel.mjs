// 단모음·장모음 숏폼 9편 일괄 렌더링. 사용: node scripts/render-vowel.mjs [short-a long-a ...]
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const all = JSON.parse(fs.readFileSync(path.resolve('src/abc/vowels.json'), 'utf8')).map((v) => v.letter);
const letters = process.argv.slice(2).length ? process.argv.slice(2) : all;
const outDir = path.resolve('output-vowel');
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p));

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
for (const L of letters) {
  const id = `VOWEL-${L}`;
  const t0 = Date.now();
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  const outputLocation = path.join(outDir, `${L}_vowel.mp4`);
  await renderMedia({composition, serveUrl, codec: 'h264', crf: 18, outputLocation, browserExecutable, concurrency: 2, logLevel: 'error'});
  console.log(`${id} → ${outputLocation} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
