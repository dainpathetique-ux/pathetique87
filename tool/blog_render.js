#!/usr/bin/env node
// 온글터 블로그용 렌더러 (정리본 PNG, 무음 영상 MP4).
//   node tool/blog_render.js png <a.html> [b.html ...]
//       → 같은 이름의 .png (1080×1350). 내용이 넘치면 "⚠ 넘침" 출력.
//   node tool/blog_render.js mp4 <영상.html> <out.mp4> [초=30] [fps=30]
//       → 무음 mp4 (1080×1920). 검수용 정지 화면을 <out>_검수/ 폴더에 저장.
// HTML 은 글꼴을 url(kr400.woff2)/url(kr700.woff2), 로고를 url(logo.jpg) 로 참조한다.
// 세 파일은 HTML 이 있는 폴더로 자동 복사된다.
// 영상 HTML 의 움직임은 CSS animation 으로만 만든다 (렌더러가 currentTime 을 직접 넘긴다).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

function requirePlaywright() {
  try { return require('playwright'); } catch (e) {}
  const g = execFileSync('npm', ['root', '-g']).toString().trim();
  return require(path.join(g, 'playwright'));
}

function copyAssets(dir) {
  for (const f of ['kr400.woff2', 'kr700.woff2', 'logo.jpg']) {
    const dst = path.join(dir, f);
    if (!fs.existsSync(dst)) fs.copyFileSync(path.join(__dirname, f), dst);
  }
}

async function launch() {
  const { chromium } = requirePlaywright();
  const exe = process.env.PLAYWRIGHT_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  return chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
}

async function open(browser, html, width, height) {
  const abs = path.resolve(html);
  copyAssets(path.dirname(abs));
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto('file://' + abs);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function png(files) {
  const b = await launch();
  for (const html of files) {
    const page = await open(b, html, 1080, 1350);
    const over = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - 1350);
    const out = html.replace(/\.html?$/i, '') + '.png';
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    console.log((over > 0 ? `⚠ 넘침 ${over}px  ` : '✓ ') + out);
    await page.close();
  }
  await b.close();
}

async function mp4(html, out, seconds, fps) {
  const b = await launch();
  const page = await open(b, html, 1080, 1920);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'frames-'));
  const checkDir = path.resolve(out).replace(/\.mp4$/i, '') + '_검수';
  fs.mkdirSync(checkDir, { recursive: true });
  const checks = new Set([2, 6, 12, 16, 20, 25, 29].filter(t => t < seconds).map(t => t * fps));
  await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
  const n = Math.round(seconds * fps);
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => document.getAnimations().forEach(a => { a.currentTime = t; }), i * 1000 / fps);
    const f = path.join(tmp, `f_${String(i).padStart(5, '0')}.png`);
    await page.screenshot({ path: f });
    if (checks.has(i)) fs.copyFileSync(f, path.join(checkDir, `${String(i / fps).padStart(2, '0')}s.png`));
    if (i % (fps * 5) === 0) process.stdout.write(`  ${i / fps}s\n`);
  }
  await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(tmp, 'f_%05d.png'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(fps), '-movflags', '+faststart', '-an', path.resolve(out)]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`✓ ${out} (${seconds}s, ${fps}fps, 무음) / 검수 화면: ${checkDir}`);
}

(async () => {
  const [mode, ...rest] = process.argv.slice(2);
  if (mode === 'png' && rest.length) await png(rest);
  else if (mode === 'mp4' && rest.length >= 2) await mp4(rest[0], rest[1], Number(rest[2] || 30), Number(rest[3] || 30));
  else { console.error('사용법: blog_render.js png <html...> | mp4 <html> <out.mp4> [초] [fps]'); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
