#!/usr/bin/env node
// 온글터 영문법 산책 블로그 렌더러 (정리본 PNG, 무음 영상 MP4).
//
//   node tool/blog_render.js png [-o <출력폴더>] <a.html> [b.html ...]
//       → 1080×1350 PNG. 출력 파일명은 HTML 과 같고, -o 가 없으면 HTML 옆에 쓴다.
//         글자가 캔버스 밖으로 나가거나(세로·가로) 안쪽 박스에서 잘리면 "⚠ 넘침" 과 요소를 출력한다.
//   node tool/blog_render.js mp4 <영상.html> <out.mp4> [초=30] [fps=30] [검수초=1.5,5,8.5,11,13.5,17,21,25,29]
//       → 1080×1920 무음 mp4. 검수초마다 정지 화면을 <out>_검수/ 에 저장하고 그 시각의 넘침도 검사한다.
//         900프레임을 한 장씩 캡처하므로 약 2~3분 걸린다 (Bash timeout 600000 권장).
//
// HTML 은 글꼴을 url(kr400.woff2) / url(kr700.woff2), 로고를 logo.jpg 로 같은 폴더처럼 참조한다.
// 세 파일은 tool/ 에서 직접 응답하므로 HTML 폴더에 복사본이 생기지 않는다 (브라우저로 직접 열면 글꼴이 안 보이는 것이 정상).
// 영상 HTML 의 움직임은 CSS animation 으로만 만든다 (렌더러가 애니메이션 시각을 직접 넘겨 프레임을 캡처한다).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const { execFileSync } = require('child_process');

const ASSETS = ['kr400.woff2', 'kr700.woff2', 'logo.jpg'];
const TMP_PREFIX = 'onblog-frames-';

function requirePlaywright() {
  try { return require('playwright'); } catch (e) {}
  const g = execFileSync('npm', ['root', '-g']).toString().trim();
  return require(path.join(g, 'playwright'));
}

async function launch() {
  const { chromium } = requirePlaywright();
  const exe = process.env.PLAYWRIGHT_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  return chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
}

async function open(browser, html, width, height) {
  const abs = path.resolve(html);
  if (!fs.existsSync(abs)) throw new Error('HTML 파일이 없습니다: ' + abs + ' (저장소 루트 기준 경로인지 확인)');
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const warn = [];
  page.on('requestfailed', r => warn.push('⚠ 파일 없음 ' + r.url()));
  // tool/ 의 글꼴·로고를 HTML 폴더에 있는 것처럼 응답한다 (복사하지 않음)
  await page.route(/\/(kr400\.woff2|kr700\.woff2|logo\.jpg)$/, r =>
    r.fulfill({ path: path.join(__dirname, path.basename(new URL(r.request().url()).pathname)) }));
  await page.goto(pathToFileURL(abs).href);
  await page.evaluate(() => document.fonts.ready);
  const faces = await page.evaluate(() => [...document.fonts].filter(f => f.family.replace(/["']/g, '') === 'NKR').map(f => f.weight + ':' + f.status));
  const err = faces.filter(s => s.endsWith(':error'));
  if (err.length) warn.push('⚠ 글꼴 미로드 NKR ' + err.join(' ') + ' (woff2 경로가 url(kr400.woff2) 형태인지 확인)');
  else if (!faces.some(s => s.endsWith(':loaded'))) warn.push('⚠ 글꼴 NKR 미사용 (@font-face 없음 또는 font-family 에 NKR 미지정) → 시스템 글꼴로 그려짐');
  return { page, warn, abs };
}

// 브라우저 안에서 실행되는 넘침 검사. [W, H, doc]: doc=true 면 문서 전체 scrollHeight/Width 도 본다(정리본).
// 영상은 대기 중인 장면이 transform 으로 문서를 늘릴 수 있어 doc=false 로 요소 단위만 본다.
const OVERFLOW_CHECK = ([W, H, doc]) => {
  const out = [];
  const nm = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : (el.classList && el.classList[0] ? '.' + el.classList[0] : ''));
  const txt = el => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 14);
  const vis = new Map();
  const visible = el => {
    if (!el || el === document.documentElement) return true;
    if (vis.has(el)) return vis.get(el);
    const cs = getComputedStyle(el);
    const v = cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) >= 0.01 && visible(el.parentElement);
    vis.set(el, v); return v;
  };
  if (doc) {
    const dh = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - H;
    const dw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - W;
    if (dh > 0) out.push(`문서 세로 ${dh}px 넘침 (body margin:0 과 box-sizing 확인)`);
    if (dw > 0) out.push(`문서 가로 ${dw}px 넘침`);
  }
  for (const el of document.querySelectorAll('body *')) {
    if (el.tagName !== 'IMG' && !/\S/.test(el.textContent || '')) continue; // 글자 없는 장식 도형 제외
    if (!visible(el)) continue;                                               // 아직 안 나왔거나 사라진 장면 제외
    const cs = getComputedStyle(el);
    if (cs.overflowY !== 'visible' && el.scrollHeight > el.clientHeight + 8) out.push(`${nm(el)} "${txt(el)}" 안쪽 세로 ${el.scrollHeight - el.clientHeight}px 잘림`);
    if (cs.overflowX !== 'visible' && el.scrollWidth > el.clientWidth + 1) out.push(`${nm(el)} "${txt(el)}" 안쪽 가로 ${el.scrollWidth - el.clientWidth}px 잘림`);
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const m = [];
    if (r.left < -0.5) m.push(`left=${Math.round(r.left)}`);
    if (r.right > W + 0.5) m.push(`right=${Math.round(r.right)}`);
    if (r.top < -0.5) m.push(`top=${Math.round(r.top)}`);
    if (r.bottom > H + 0.5) m.push(`bottom=${Math.round(r.bottom)}`);
    if (m.length) out.push(`${nm(el)} "${txt(el)}" 캔버스 밖 ${m.join(' ')}`);
  }
  return [...new Set(out)];
};

function report(label, warn) {
  if (!warn.length) { console.log('✓ ' + label); return false; }
  console.log('⚠ 넘침 ' + label + '\n    ' + warn.slice(0, 8).join('\n    '));
  return true;
}

async function png(files, outDir) {
  const b = await launch();
  try {
    for (const html of files) {
      const { page, warn, abs } = await open(b, html, 1080, 1350);
      const over = await page.evaluate(OVERFLOW_CHECK, [1080, 1350, true]);
      const base = path.basename(abs).replace(/\.html?$/i, '') + '.png';
      const out = outDir ? path.join(path.resolve(outDir), base) : abs.replace(/\.html?$/i, '') + '.png';
      if (outDir) fs.mkdirSync(path.resolve(outDir), { recursive: true });
      await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
      for (const w of warn) console.log(w + '  ' + html);
      report(out, over);
      await page.close();
    }
  } finally { await b.close(); }
}

async function mp4(html, out, seconds, fps, checkSecs) {
  for (const d of fs.readdirSync(os.tmpdir()).filter(d => d.startsWith(TMP_PREFIX)))
    fs.rmSync(path.join(os.tmpdir(), d), { recursive: true, force: true }); // 이전 실행 잔해 정리
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), TMP_PREFIX));
  const outAbs = path.resolve(out);
  const checkDir = outAbs.replace(/\.mp4$/i, '') + '_검수';
  fs.rmSync(checkDir, { recursive: true, force: true });
  fs.rmSync(outAbs, { force: true });
  fs.mkdirSync(checkDir, { recursive: true });
  const checks = new Map(checkSecs.filter(t => t >= 0 && t < seconds).map(t => [Math.round(t * fps), t]));
  const n = Math.round(seconds * fps);
  console.log(`${n}프레임 캡처 + 인코딩 (약 2~3분, Bash timeout 600000 권장)`);
  let b, bad = false;
  try {
    b = await launch();
    const { page, warn } = await open(b, html, 1080, 1920);
    for (const w of warn) { console.log(w); bad = true; }
    await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
    for (let i = 0; i < n; i++) {
      await page.evaluate(t => document.getAnimations().forEach(a => { a.currentTime = t; }), i * 1000 / fps);
      const f = path.join(tmp, `f_${String(i).padStart(5, '0')}.png`);
      await page.screenshot({ path: f });
      if (checks.has(i)) {
        const t = checks.get(i);
        const name = `${t.toFixed(1).padStart(4, '0')}s.png`;
        fs.copyFileSync(f, path.join(checkDir, name));
        const over = await page.evaluate(OVERFLOW_CHECK, [1080, 1920, false]);
        if (report(`${name}`, over)) bad = true;
      }
      if (i % (fps * 5) === 0) process.stdout.write(`  ${i / fps}s\n`);
    }
    await b.close(); b = null;
    const part = outAbs + '.part.mp4';
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(tmp, 'f_%05d.png'),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(fps), '-movflags', '+faststart', '-an', part],
      { stdio: ['ignore', 'inherit', 'inherit'] });
    fs.renameSync(part, outAbs);
  } finally {
    if (b) await b.close().catch(() => {});
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(`${bad ? '⚠ 경고 있음 — 위 항목을 고쳐 다시 렌더링' : '✓'} ${out} (${seconds}s, ${fps}fps, 무음) / 검수 화면: ${checkDir}`);
}

(async () => {
  const [mode, ...rest] = process.argv.slice(2);
  if (mode === 'png' && rest.length) {
    let outDir = null;
    const files = [];
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === '-o') { outDir = rest[++i]; if (!outDir) throw new Error('-o 뒤에 출력 폴더를 적어야 합니다'); }
      else files.push(rest[i]);
    }
    if (!files.length) throw new Error('렌더링할 HTML 이 없습니다');
    await png(files, outDir);
  } else if (mode === 'mp4' && rest.length >= 2) {
    const sec = Number(rest[2] ?? 30), fps = Number(rest[3] ?? 30);
    if (!(Number.isFinite(sec) && sec > 0 && Number.isFinite(fps) && fps > 0)) throw new Error('초·fps 는 양수여야 합니다: ' + rest.slice(2, 4).join(' '));
    const checkSecs = (rest[4] || '1.5,5,8.5,11,13.5,17,21,25,29').split(',').map(Number).filter(Number.isFinite);
    await mp4(rest[0], rest[1], sec, fps, checkSecs);
  } else {
    console.error('사용법: blog_render.js png [-o 출력폴더] <html...> | mp4 <html> <out.mp4> [초] [fps] [검수초,...]');
    process.exit(1);
  }
})().catch(e => { console.error('실패: ' + String(e && e.message || e).split('\n')[0]); process.exit(1); });
