// A~Z 알파벳 숏폼 26편 일괄 렌더링. 번들은 한 번만 만들고 컴포지션만 바꿔 렌더한다.
// 사용: node scripts/render-abc.mjs [A B C ...]
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const letters = process.argv.slice(2).length ? process.argv.slice(2) : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const outDir = path.resolve('output-abc');
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p));

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
for (const L of letters) {
  const id = `ABC-${L}`;
  const t0 = Date.now();
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  const outputLocation = path.join(outDir, `${L}${L.toLowerCase()}_alphabet.mp4`);
  await renderMedia({composition, serveUrl, codec: 'h264', crf: 18, outputLocation, browserExecutable, concurrency: 2, logLevel: 'error'});
  console.log(`${id} → ${outputLocation} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
