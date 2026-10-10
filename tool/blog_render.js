#!/usr/bin/env node
// 온글터 블로그 렌더러 (영문법 산책 정리본·파닉스 카드 PNG, 영상 MP4).
//
//   node tool/blog_render.js png [-o <출력폴더>] [--size 1080x1080] <a.html> [b.html ...]
//       → PNG (기본 1080×1350). 출력 파일명은 HTML 과 같고, -o 가 없으면 HTML 옆에 쓴다.
//   node tool/blog_render.js mp4 <영상.html> <out.mp4> [초=30] [fps=30] [검수초=1.5,5,9,11,13.5,17,21,25,29] [--audio 음성.wav]
//       → 1080×1920 mp4. --audio 가 없으면 무음, 있으면 그 WAV 를 영상 길이에 맞춰 AAC 로 넣는다.
//         검수초마다 정지 화면을 <out>_검수/ 에 저장하고 그 시각의 넘침도 검사한다.
//         900프레임을 한 장씩 캡처하므로 약 2분 걸린다 (Bash timeout 600000 권장).
//
// 파일마다 문제가 없으면 "✓ <파일>", 있으면 "⚠ <파일> — …" 아래에 항목을 출력하고 종료 코드 2 로 끝난다.
//   ⚠ 넘침    글자가 캔버스 밖·박스 밖으로 나가거나 안쪽 박스에서 잘림
//   ⚠ 글꼴    NKR 글꼴이 안 잡히거나, 글꼴에 없는 글자가 다른 서체로 대체됨
//   ⚠ 파일 없음  HTML 이 참조한 파일을 찾지 못함
// 인자·환경 오류는 "실패: …" 한 줄과 종료 코드 1.
//
// HTML 은 글꼴을 url(kr400.woff2) / url(kr700.woff2) (발음기호는 url(ipa400.woff2) / url(ipa700.woff2)),
// 로고를 logo.png(투명 배경) 또는 logo.jpg 로 HTML 과 같은 폴더 이름으로만 참조한다. 이 파일들은 tool/ 에서 직접 응답하므로 복사본이 생기지 않는다
// (브라우저로 HTML 을 직접 열면 글꼴이 안 보이는 것이 정상). 다른 폴더 경로로 참조하면 "⚠ 파일 없음" 이 된다.
// 영상 HTML 의 움직임은 CSS animation 으로만 만든다 (렌더러가 애니메이션 시각을 직접 넘겨 프레임을 캡처한다).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const { execFileSync } = require('child_process');

const ASSETS = ['kr400.woff2', 'kr700.woff2', 'ipa400.woff2', 'ipa700.woff2', 'logo.jpg', 'logo.png'];
const OUR_FONTS = /^(Noto Sans KR|ONGLTER IPA)/;  // 이 저장소 글꼴의 실제 family 이름
const TMP_PREFIX = 'onblog-frames-';
const DEFAULT_CHECKS = '1.5,5,9,11,13.5,17,21,25,29';

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

function htmlPath(html) {
  const abs = path.resolve(html);
  if (!fs.existsSync(abs)) throw new Error('HTML 파일이 없습니다: ' + abs + ' (저장소 루트 기준 경로인지 확인)');
  return abs;
}

async function open(browser, abs, width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const warn = [];
  page.on('requestfailed', r => {
    let u = r.url();
    try { u = decodeURIComponent(u); } catch (e) {}
    warn.push('⚠ 파일 없음 ' + u);
  });
  // tool/ 의 글꼴·로고를 HTML 과 같은 폴더에 있는 것처럼 응답한다 (복사하지 않음)
  const dir = path.dirname(abs);
  await page.route(u => {
    if (u.protocol !== 'file:') return false;
    const p = decodeURIComponent(u.pathname);
    return path.dirname(p) === dir && ASSETS.includes(path.basename(p));
  }, async r => {
    const f = path.join(__dirname, path.basename(decodeURIComponent(new URL(r.request().url()).pathname)));
    if (fs.existsSync(f)) await r.fulfill({ path: f }); else await r.abort('failed');
  });
  await page.goto(pathToFileURL(abs).href);
  await page.evaluate(() => document.fonts.ready);
  const faces = await page.evaluate(() => [...document.fonts].filter(f => f.family.replace(/["']/g, '') === 'NKR').map(f => f.weight + ':' + f.status));
  const err = faces.filter(s => s.endsWith(':error'));
  if (err.length) warn.push('⚠ 글꼴 미로드 NKR ' + err.join(' ') + ' (HTML 과 같은 폴더 이름 url(kr400.woff2) 로만 참조했는지 확인)');
  else if (!faces.some(s => s.endsWith(':loaded'))) warn.push('⚠ 글꼴 NKR 미사용 (@font-face 없음 또는 font-family 에 NKR 미지정) → 시스템 글꼴로 그려짐');
  else warn.push(...await glyphFallback(page));
  return { page, warn };
}

// 글꼴에 없는 글자가 다른 서체(WenQuanYi, Unifont, 이모지 등)로 조용히 대체된 요소를 CDP 로 찾는다.
async function glyphFallback(page) {
  const out = [];
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
    const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: 'body *' });
    for (const id of nodeIds) {
      let fonts;
      try { ({ fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: id })); } catch (e) { continue; }
      const bad = fonts.filter(f => !OUR_FONTS.test(f.familyName));
      if (!bad.length) continue;
      const { outerHTML } = await cdp.send('DOM.getOuterHTML', { nodeId: id });
      const txt = outerHTML.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
      out.push(`⚠ 글꼴 대체 "${txt}" → ${bad.map(f => f.familyName + ':' + f.glyphCount + '자').join(', ')} (글꼴에 없는 글자 — 목록에 있는 글자로 바꾼다)`);
    }
  } finally { await cdp.detach().catch(() => {}); }
  return [...new Set(out)].slice(0, 8);
}

// 브라우저 안에서 실행되는 넘침 검사. [W, H, doc]: doc=true 면 문서 전체와 박스 밖 넘침도 본다(정리본).
// 영상은 대기 중인 장면·.rise 의 translateY 가 오탐을 내므로 doc=false 로 잘림·캔버스 밖만 본다.
const OVERFLOW_CHECK = ([W, H, doc]) => {
  const out = [];
  const nm = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : (el.classList && el.classList[0] ? '.' + el.classList[0] : ''));
  const txt = el => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 14);
  const maxFont = el => Math.max(parseFloat(getComputedStyle(el).fontSize), ...[...el.querySelectorAll('*')].map(c => parseFloat(getComputedStyle(c).fontSize) || 0));
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
    if (dh > 0) out.push(`⚠ 넘침 문서 세로 ${dh}px (body margin:0 과 box-sizing 확인)`);
    if (dw > 0) out.push(`⚠ 넘침 문서 가로 ${dw}px`);
  }
  for (const el of document.querySelectorAll('body *')) {
    if (el.tagName !== 'IMG' && !/\S/.test(el.textContent || '')) continue; // 글자 없는 장식 도형 제외
    if (!visible(el)) continue;                                               // 아직 안 나왔거나 사라진 장면 제외
    const cs = getComputedStyle(el);
    if (cs.display !== 'inline') {
      // scrollWidth/Height 는 overflow:visible 이어도 넘친 자식·nowrap 글자 폭을 돌려준다
      const dh = el.scrollHeight - el.clientHeight, dw = el.scrollWidth - el.clientWidth;
      if (cs.overflowY !== 'visible' && dh > 8) out.push(`⚠ 넘침 ${nm(el)} "${txt(el)}" 안쪽 세로 ${dh}px 잘림`);
      else if (doc && dh > Math.max(8, 0.35 * maxFont(el))) out.push(`⚠ 넘침 ${nm(el)} "${txt(el)}" 박스 아래로 ${dh}px`); // 줄 간격이 촘촘한 큰 글자의 글꼴 여백은 넘침으로 보지 않는다
      if (cs.overflowX !== 'visible' && dw > 1) out.push(`⚠ 넘침 ${nm(el)} "${txt(el)}" 안쪽 가로 ${dw}px 잘림`);
      else if (doc && dw > 2) out.push(`⚠ 넘침 ${nm(el)} "${txt(el)}" 박스 옆으로 ${dw}px (한 줄에 안 들어감. 가운데 정렬이면 왼쪽도 같은 만큼)`);
    }
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const m = [];
    if (r.left < -0.5) m.push(`left=${Math.round(r.left)}`);
    if (r.right > W + 0.5) m.push(`right=${Math.round(r.right)}`);
    if (r.top < -0.5) m.push(`top=${Math.round(r.top)}`);
    if (r.bottom > H + 0.5) m.push(`bottom=${Math.round(r.bottom)}`);
    if (m.length) out.push(`⚠ 넘침 ${nm(el)} "${txt(el)}" 캔버스 밖 ${m.join(' ')}`);
  }
  return [...new Set(out)];
};

// 파일 하나의 결과 출력. 항목이 있으면 ⚠ 블록, 없으면 ✓. 문제가 있었는지 돌려준다.
function report(label, items) {
  if (!items.length) { console.log('✓ ' + label); return false; }
  console.log('⚠ ' + label + ' — 아래 항목을 고쳐 다시 렌더링\n    ' + items.slice(0, 10).join('\n    ') +
    (items.length > 10 ? `\n    … 외 ${items.length - 10}건` : ''));
  return true;
}

async function png(files, outDir, W = 1080, H = 1350) {
  const list = files.map(htmlPath);
  if (outDir) { // -o 는 한 폴더이므로 HTML 이름이 겹치면 PNG 가 서로 덮어쓴다
    const seen = new Map();
    for (const f of new Set(list)) {
      const name = path.basename(f).replace(/\.html?$/i, '') + '.png';
      if (seen.has(name)) throw new Error(`-o 를 쓸 때는 HTML 이름이 겹치면 안 됩니다 (${name}): ${seen.get(name)} / ${f} — 폴더마다 따로 실행`);
      seen.set(name, f);
    }
    fs.mkdirSync(path.resolve(outDir), { recursive: true });
  }
  const b = await launch();
  let bad = false;
  try {
    for (const abs of list) {
      const { page, warn } = await open(b, abs, W, H);
      const over = await page.evaluate(OVERFLOW_CHECK, [W, H, true]);
      const base = path.basename(abs).replace(/\.html?$/i, '') + '.png';
      const out = outDir ? path.join(path.resolve(outDir), base) : abs.replace(/\.html?$/i, '') + '.png';
      await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } });
      if (report(out, [...warn, ...over])) bad = true;
      await page.close();
    }
  } finally { await b.close(); }
  if (bad) process.exitCode = 2;
}

async function mp4(html, out, seconds, fps, checkSecs, audio) {
  const abs = htmlPath(html);                                         // 입력이 없으면 아무것도 지우지 않고 멈춘다
  const audioAbs = audio ? path.resolve(audio) : null;
  if (audioAbs && !fs.existsSync(audioAbs)) throw new Error('음성 파일이 없습니다: ' + audioAbs);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), TMP_PREFIX));     // 실행마다 고유 폴더 (동시 실행 안전)
  const outAbs = path.resolve(out);
  const checkDir = outAbs.replace(/\.mp4$/i, '') + '_검수';
  const checkNew = checkDir + '.new';                                 // 성공했을 때만 기존 검수 폴더·mp4 를 교체한다
  fs.rmSync(checkNew, { recursive: true, force: true });
  fs.mkdirSync(checkNew, { recursive: true });
  const checks = new Map(checkSecs.filter(t => t < seconds).map(t => [Math.round(t * fps), t]));
  const n = Math.round(seconds * fps);
  console.log(`${n}프레임 캡처 + 인코딩 (약 ${Math.max(1, Math.round(n / 7 / 60))}분${n > 300 ? ', Bash timeout 600000 권장' : ''})`);
  let b, bad = false;
  try {
    b = await launch();
    const { page, warn } = await open(b, abs, 1080, 1920);
    if (warn.length) { report(path.basename(abs), warn); bad = true; }
    await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
    for (let i = 0; i < n; i++) {
      await page.evaluate(t => document.getAnimations().forEach(a => { a.currentTime = t; }), i * 1000 / fps);
      const f = path.join(tmp, `f_${String(i).padStart(5, '0')}.png`);
      await page.screenshot({ path: f });
      if (checks.has(i)) {
        const name = `${checks.get(i).toFixed(1).padStart(4, '0')}s.png`;
        fs.copyFileSync(f, path.join(checkNew, name));
        if (report(name, await page.evaluate(OVERFLOW_CHECK, [1080, 1920, false]))) bad = true;
      }
      if (i % (fps * 5) === 0) process.stdout.write(`  ${i / fps}s\n`);
    }
    await b.close(); b = null;
    const part = outAbs + '.part.mp4';
    try {
      const audioArgs = audioAbs
        ? ['-i', audioAbs, '-map', '0:v', '-map', '1:a', '-af', 'apad', '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-t', String(seconds)]
        : ['-an'];
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(tmp, 'f_%05d.png'),
        ...audioArgs, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(fps), '-movflags', '+faststart', part],
        { stdio: ['ignore', 'inherit', 'inherit'] });
    } catch (e) {
      fs.rmSync(part, { force: true });
      throw new Error('ffmpeg 인코딩 실패 (위 ffmpeg 메시지 참조). 직전 영상과 검수 화면은 그대로 남아 있다');
    }
    fs.renameSync(part, outAbs);
    fs.rmSync(checkDir, { recursive: true, force: true });
    fs.renameSync(checkNew, checkDir);
  } finally {
    if (b) await b.close().catch(() => {});
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.rmSync(checkNew, { recursive: true, force: true });
  }
  console.log(`${bad ? '⚠ 경고 있음 — 위 항목을 고쳐 다시 렌더링' : '✓'} ${out} (${seconds}s, ${fps}fps, ${audioAbs ? '음성 포함' : '무음'}) / 검수 화면: ${checkDir}`);
  if (bad) process.exitCode = 2;
}

(async () => {
  const [mode, ...args] = process.argv.slice(2);
  const flags = {}, rest = [];
  for (let i = 0; i < args.length; i++) {
    if (['-o', '--size', '--audio'].includes(args[i])) {
      if (!args[i + 1]) throw new Error(args[i] + ' 뒤에 값을 적어야 합니다');
      flags[args[i]] = args[++i];
    } else rest.push(args[i]);
  }
  if (mode === 'png' && rest.length) {
    let W = 1080, H = 1350;
    if (flags['--size']) {
      const m = /^(\d+)x(\d+)$/.exec(flags['--size']);
      if (!m) throw new Error('--size 는 1080x1080 형식이어야 합니다: ' + flags['--size']);
      W = +m[1]; H = +m[2];
    }
    await png(rest, flags['-o'] || null, W, H);
  } else if (mode === 'mp4' && rest.length >= 2) {
    const sec = Number(rest[2] ?? 30), fps = Number(rest[3] ?? 30);
    if (!(Number.isFinite(sec) && sec > 0 && Number.isFinite(fps) && fps > 0)) throw new Error('초·fps 는 양수여야 합니다: ' + rest.slice(2, 4).join(' '));
    const checkSecs = (rest[4] || DEFAULT_CHECKS).split(',').map(s => (s.trim() === '' ? NaN : Number(s)));
    if (checkSecs.some(t => !Number.isFinite(t) || t < 0)) throw new Error('검수초는 쉼표로 나눈 0 이상의 숫자여야 합니다: ' + rest[4]);
    if (!checkSecs.some(t => t < sec)) throw new Error(`검수초가 전부 영상 길이(${sec}s) 밖입니다 (검수 화면 0장): ` + checkSecs.join(','));
    await mp4(rest[0], rest[1], sec, fps, checkSecs, flags['--audio'] || null);
  } else {
    console.error('사용법: blog_render.js png [-o 출력폴더] [--size WxH] <html...> | mp4 <html> <out.mp4> [초] [fps] [검수초,...] [--audio 음성.wav]');
    process.exit(1);
  }
})().catch(e => { console.error('실패: ' + String(e && e.message || e).split('\n')[0]); process.exit(1); });
