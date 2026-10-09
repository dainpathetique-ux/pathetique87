#!/usr/bin/env node
// 영어 단어 '소리로 외우기' 워크북 빌더: JSON → HTML → PNG(쪽별) + PDF
// 사용: node tool/build_voca.js vocab/<이름>.json [--no-pdf]
// 철자 암기 없이 (1) 글자별 소리 조각 → (2) 합친 소리(한글) → (3) 우리말 뜻 만 외우게 하는 4쪽 구성.
const fs = require('fs');
const path = require('path');

function requirePlaywright() {
  try { return require('playwright'); } catch (e) {}
  const { execSync } = require('child_process');
  const g = execSync('npm root -g').toString().trim();
  return require(path.join(g, 'playwright'));
}

const ROOT = path.resolve(__dirname, '..');
const A4_PX = 1123;
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const CIRC = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';

// 재현 가능한 섞기 (같은 JSON이면 항상 같은 순서)
function shuffled(arr, seed) {
  let s = seed >>> 0 || 1;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const CSS = `
@font-face{font-family:"NKR";src:url(kr400.woff2) format("woff2");font-weight:400}
@font-face{font-family:"NKR";src:url(kr700.woff2) format("woff2");font-weight:700}
:root{--ink:#2b2f3a;--line:#9fb3c8;--teal:#1f8a86;--blue:#2f6fcb;--violet:#7a57c9;--orange:#e07b2a;--green:#3f9a48;--rose:#c9507a;
--teal-l:#e3f4f3;--blue-l:#e6eefb;--violet-l:#eee8fa;--orange-l:#fdeee0;--green-l:#e7f4e8;--rose-l:#fbe7ee;--cream:#fff8e8}
*{box-sizing:border-box}
body{margin:0;background:#888;font-family:"NKR",sans-serif;color:var(--ink);font-size:12pt;line-height:1.5}
.page{width:210mm;height:297mm;background:#fff;padding:13mm 15mm 12mm;margin:0 auto 10px;position:relative;overflow:hidden}
@page{size:A4;margin:0}
@media print{body{background:none}.page{margin:0;page-break-after:always;break-after:page}}
.hdr{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid var(--blue);padding-bottom:5px;margin-bottom:9px}
.hdr .hl{display:flex;align-items:center;gap:4mm}
.hdr .logo{width:45mm;height:13mm;overflow:hidden;flex:none}
.hdr .logo img{width:56mm;margin:-6.2mm 0 0 -5.6mm;display:block}
.hdr .l{font-size:9.5pt;color:#5a6b85}.hdr .t{font-size:15pt;font-weight:700;line-height:1.25;color:#1d3f7a;white-space:nowrap}
.hdr .r{font-size:10.5pt;text-align:right;color:#3a4a66;white-space:nowrap}
.hdr .r span{display:inline-block;border-bottom:1px solid #3a4a66;min-width:34mm;margin-left:4px}
.pg{position:absolute;bottom:7mm;left:0;right:0;text-align:center;font-size:8.5pt;color:#8a97ab}
h2{font-size:13pt;margin:6px 0 6px;padding:3px 12px;color:#fff;display:inline-block;border-radius:14px}
.c-teal h2{background:var(--teal)}.c-blue h2{background:var(--blue)}.c-violet h2{background:var(--violet)}.c-orange h2{background:var(--orange)}.c-green h2{background:var(--green)}.c-rose h2{background:var(--rose)}
.c-teal .tip{background:var(--teal-l)}.c-blue .tip{background:var(--blue-l)}.c-violet .tip{background:var(--violet-l)}.c-orange .tip{background:var(--orange-l)}.c-green .tip{background:var(--green-l)}.c-rose .tip{background:var(--rose-l)}
.c-teal th{background:var(--teal-l)}.c-blue th{background:var(--blue-l)}.c-violet th{background:var(--violet-l)}.c-orange th{background:var(--orange-l)}.c-green th{background:var(--green-l)}.c-rose th{background:var(--rose-l)}
.tip{border-radius:6px;padding:5px 10px;font-size:10.5pt;color:#4a3a7a;margin:0 0 8px 0;word-break:keep-all}
.legend{font-size:9.5pt;color:#5a6b85;margin:0 0 6px 2px}
.legend .sil{color:#b0b7c3}
/* 1쪽 학습 카드 */
.cards{display:grid;grid-template-columns:1fr 1fr;gap:2.4mm 4mm}
.card{border:1.5px solid #cfd9e6;border-radius:8px;padding:3px 8px 4px;position:relative;background:#fff}
.card .no{position:absolute;left:-1px;top:-1px;background:var(--blue);color:#fff;font-weight:700;font-size:10pt;border-radius:8px 0 8px 0;padding:1px 8px}
.card .en{font-size:18pt;font-weight:700;color:#1d3f7a;letter-spacing:.02em;margin:7px 0 0 0;line-height:1.1;text-align:center;font-family:"Trebuchet MS","Segoe UI",Arial,sans-serif}
.ph{display:flex;justify-content:center;gap:2px;margin:3px 0 1px;flex-wrap:wrap}
.ph div{text-align:center;min-width:8mm;padding:1px 3px;border-radius:5px;background:#f3f6fa}
.ph b{display:block;font-size:12pt;color:#1d3f7a;line-height:1.15;font-family:"Trebuchet MS","Segoe UI",Arial,sans-serif}
.ph i{display:block;font-style:normal;font-size:10.5pt;color:var(--teal);font-weight:700;line-height:1.2}
.ph div.sil{background:#f6f6f6}.ph div.sil b{color:#b0b7c3}.ph div.sil i{color:#b0b7c3;font-weight:400;font-size:9pt}
.card .sd{text-align:center;font-size:13pt;color:var(--rose);font-weight:700;margin-top:0;line-height:1.35}
.card .sd small{font-size:9pt;color:#8a97ab;font-weight:400;margin-right:4px}
.card .ko{text-align:center;font-size:12pt;font-weight:700;color:var(--orange);margin-top:0;line-height:1.35;word-break:keep-all}
.card .rd{position:absolute;right:7px;top:4px;font-size:9pt;color:#8a97ab}
.card .rd span{display:inline-block;width:4.2mm;height:4.2mm;border:1.2px solid #9fb3c8;border-radius:50%;vertical-align:middle;margin-left:2px}
/* 표 공통 */
table{border-collapse:collapse;width:100%;font-size:11.5pt}
td,th{border:1px solid var(--line);padding:3px 6px;vertical-align:middle}
th{font-weight:700;text-align:center;font-size:10.5pt}
td.n{text-align:center;font-weight:700;color:var(--blue);width:7mm}
td.en{font-size:16pt;font-weight:700;color:#1d3f7a;font-family:"Trebuchet MS","Segoe UI",Arial,sans-serif;text-align:center;white-space:nowrap}
td.ko{font-size:12pt;font-weight:700;color:var(--orange);word-break:keep-all}
td.w{background:#fff}
td.chunk .ph{justify-content:flex-start;margin:0}
td.chunk .ph div{min-width:6.5mm;padding:0 2px}
td.chunk .ph b{font-size:11pt}td.chunk .ph i{font-size:10pt}
.h17 td{height:17.2mm}.h14 td{height:14mm}.h12 td{height:12.2mm}
/* 짝 맞추기 */
.match{display:grid;grid-template-columns:1fr 1fr;gap:0 8mm;margin:2px 0 6px}
.match .col{display:grid;grid-template-columns:1fr 14mm 1fr;align-items:center;row-gap:3.3mm}
.match .w{font-size:15pt;font-weight:700;color:#1d3f7a;font-family:"Trebuchet MS","Segoe UI",Arial,sans-serif;border:1.5px solid #cfd9e6;border-radius:6px;padding:2px 6px;text-align:center}
.match .d{font-size:10.5pt;text-align:center;color:#8a97ab}
.match .k{font-size:11.5pt;font-weight:700;color:var(--orange);border:1.5px solid #f3d4b8;background:#fff8f1;border-radius:6px;padding:3px 6px;text-align:center;word-break:keep-all;line-height:1.3}
/* 보기 상자 */
.bank{border:1.5px solid #e2c98a;background:var(--cream);border-radius:6px;padding:5px 10px;margin:0 0 6px;font-size:14pt;font-weight:700;color:#5c4511;font-family:"Trebuchet MS","Segoe UI",Arial,sans-serif;display:flex;flex-wrap:wrap;gap:2px 14px;justify-content:center}
.bank small{font-family:"NKR";font-size:9.5pt;font-weight:400;color:#8a6d2b;width:100%;text-align:left}
/* 테스트 쪽 */
.score{display:flex;gap:4mm;margin-top:6px}
.score div{flex:1;border:1.5px dashed var(--green);border-radius:6px;padding:5px 10px;font-size:10.5pt;color:#3a4a66;min-height:16mm}
.score b{color:var(--green)}
.score .ck span{display:inline-block;width:5mm;height:5mm;border:1.2px solid #9fb3c8;border-radius:50%;vertical-align:middle;margin:0 1px}
`;

function phonics(w, opt = {}) {
  const cells = w.chunks.map(([l, s]) => s
    ? `<div><b>${esc(l)}</b><i>${esc(s)}</i></div>`
    : `<div class="sil"><b>${esc(l)}</b><i>(소리 없음)</i></div>`).join('');
  return `<div class="ph">${cells}</div>`;
}

function hdr(spec, i, logo) {
  return `<div class="hdr"><div class="hl">${logo}<div><div class="l">${esc(spec.course||'영어 단어')} · ${esc(spec.grade||'')}</div><div class="t">${esc(spec.title)}</div></div></div>
   <div class="r">이름<span></span>${i===0?'<br>날짜 <span style="min-width:40mm"></span>':''}</div></div>`;
}

// 1쪽: 학습 카드
function page1(W) {
  const cards = W.map((w, i) => `<div class="card"><div class="no">${i+1}</div><div class="rd">읽기 <span></span><span></span><span></span></div>
    <div class="en">${esc(w.en)}</div>${phonics(w)}
    <div class="sd"><small>합치면</small>${esc(w.sound)}</div><div class="ko">${esc(w.ko)}</div></div>`).join('');
  return `<div class="c-blue"><h2>1. 오늘의 단어 — 소리로 읽고 뜻 외우기</h2>
  <div class="tip">💡 글자 아래 <b style="color:var(--teal)">초록 소리</b>를 차례로 읽고, 빨리 이어 읽으면 <b style="color:var(--rose)">분홍 소리</b>가 돼요. 한 번 읽을 때마다 ○에 색칠하세요. 철자는 안 외워도 돼요.</div>
  <div class="legend"><span class="sil">회색 글자</span>는 소리가 나지 않는 글자예요. &nbsp; 소리 → 뜻 순서로 외우세요.</div>
  <div class="cards">${cards}</div></div>`;
}

// 2쪽: 소리 합치기 연습 (조각 → 합친 소리 쓰기 → 뜻 쓰기)
function page2(W) {
  const rows = W.map((w, i) => `<tr><td class="n">${i+1}</td><td class="en">${esc(w.en)}</td><td class="chunk">${phonics(w)}</td><td class="w"></td><td class="w"></td></tr>`).join('');
  return `<div class="c-teal"><h2>2. 소리 합치기 연습</h2>
  <div class="tip">💡 소리 조각을 보고 입으로 세 번 읽은 다음, <b>합친 소리를 한글로</b> 쓰고 <b>뜻</b>을 쓰세요. 1쪽을 보고 써도 괜찮아요.</div>
  <table class="h17"><tr><th></th><th style="width:30mm">단어</th><th>소리 조각</th><th style="width:34mm">합친 소리 (한글)</th><th style="width:40mm">뜻</th></tr>${rows}</table></div>`;
}

// 3쪽: 짝 맞추기 + 뜻 보고 소리 쓰기
function page3(W) {
  const half = Math.ceil(W.length / 2);
  const col = (ws, seed) => {
    const ks = shuffled(ws, seed);
    return `<div class="col">${ws.map((w, i) => `<div class="w">${esc(w.en)}</div><div class="d">•&nbsp;&nbsp;&nbsp;&nbsp;•</div><div class="k">${esc(ks[i].ko)}</div>`).join('')}</div>`;
  };
  const match = `<div class="match">${col(W.slice(0, half), 25)}${col(W.slice(half), 52)}</div>`;
  const pick = shuffled(W, 7).slice(0, 6);
  const bank = `<div class="bank"><small>보기 · 뜻에 맞는 단어에 ○ 하세요</small>${shuffled(pick, 3).map(w => `<span>${esc(w.en)}</span>`).join('')}</div>`;
  const rows = pick.map((w, i) => `<tr><td class="n">${i+1}</td><td class="ko">${esc(w.ko)}</td><td class="w"></td></tr>`).join('');
  return `<div class="c-violet"><h2>3. 짝 맞추기 — 단어와 뜻을 선으로 이으세요</h2>
  <div class="tip">💡 단어를 먼저 소리 내어 읽은 다음, 뜻과 이어 보세요.</div>${match}</div>
  <div class="c-orange"><h2>4. 뜻 보고 소리 쓰기</h2>
  <div class="tip">💡 뜻을 보고 영어 소리를 <b>한글로</b> 쓰세요. 그다음 보기에서 그 단어를 찾아 ○ 하세요.</div>${bank}
  <table class="h14"><tr><th></th><th>뜻</th><th style="width:62mm">영어 소리 (한글로)</th></tr>${rows}</table></div>`;
}

// 4쪽: 미니 테스트
function page4(W) {
  const half = Math.ceil(W.length / 2);
  const A = shuffled(W, 11).slice(0, half);
  const B = W.filter(w => !A.includes(w));
  const rowsA = A.map((w, i) => `<tr><td class="n">${i+1}</td><td class="en">${esc(w.en)}</td><td class="w"></td><td class="w"></td></tr>`).join('');
  const rowsB = B.map((w, i) => `<tr><td class="n">${half+i+1}</td><td class="ko">${esc(w.ko)}</td><td class="w"></td></tr>`).join('');
  const bank = `<div class="bank"><small>보기 · 소리를 쓴 뒤, 맞는 단어에 ○ 하세요</small>${shuffled(B, 9).map(w => `<span>${esc(w.en)}</span>`).join('')}</div>`;
  return `<div class="c-rose"><h2>5. 미니 테스트 ① — 단어를 보고 소리와 뜻 쓰기</h2>
  <table class="h14"><tr><th></th><th style="width:34mm">단어</th><th>영어 소리 (한글로)</th><th>뜻</th></tr>${rowsA}</table></div>
  <div class="c-rose"><h2 style="margin-top:10px">6. 미니 테스트 ② — 뜻을 보고 소리 쓰기</h2>${bank}
  <table class="h14"><tr><th></th><th>뜻</th><th style="width:62mm">영어 소리 (한글로)</th></tr>${rowsB}</table></div>
  <div class="c-green"><div class="score"><div><b>점수</b> &nbsp; ____ / ${W.length}</div>
  <div class="ck"><b>말하기 확인</b> 선생님 앞에서 읽기<br><span></span><span></span><span></span> 3번 통과하면 끝!</div>
  <div><b>선생님 한마디</b></div></div></div>`;
}

function build(spec) {
  const logoSrc = spec.logo === false ? null : (spec.logo || (fs.existsSync(path.join(__dirname,'logo.jpg')) ? 'logo.jpg' : null));
  const logo = logoSrc ? `<div class="logo"><img src="logo.jpg"></div>` : '';
  const W = spec.words;
  const bodies = [page1(W), page2(W), page3(W), page4(W)];
  const pages = bodies.map((b, i) => `<div class="page">${hdr(spec, i, logo)}${b}<div class="pg">${i+1} / ${bodies.length}</div></div>`).join('\n');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(spec.title)}</title><style>${CSS}</style></head><body>${pages}</body></html>`;
}

async function main() {
  const file = process.argv[2];
  if (!file) { console.error('사용: node tool/build_voca.js vocab/<이름>.json [--no-pdf]'); process.exit(1); }
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  const slug = spec.slug || path.basename(file, '.json');
  const out = path.join(ROOT, 'output', slug);
  fs.mkdirSync(out, { recursive: true });
  for (const f of ['kr400.woff2','kr700.woff2']) fs.copyFileSync(path.join(__dirname, f), path.join(out, f));
  if (spec.logo !== false) { const lp = spec.logo ? path.resolve(ROOT, spec.logo) : path.join(__dirname,'logo.jpg'); if (fs.existsSync(lp)) fs.copyFileSync(lp, path.join(out,'logo.jpg')); }
  const htmlPath = path.join(out, 'workbook.html');
  fs.writeFileSync(htmlPath, build(spec));

  const { chromium } = requirePlaywright();
  const exe = process.env.PLAYWRIGHT_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 820, height: 1200 }, deviceScaleFactor: 2 });
  await p.goto('file://' + htmlPath);
  await p.evaluate(() => document.fonts.ready);
  const pages = p.locator('.page');
  const n = await pages.count();
  let overflow = false;
  for (let i = 0; i < n; i++) {
    const h = await pages.nth(i).evaluate(e => e.scrollHeight);
    const png = path.join(out, `${slug}_${i+1}쪽.png`);
    await pages.nth(i).screenshot({ path: png });
    const flag = h > A4_PX ? `  ⚠ 넘침 ${h-A4_PX}px` : '';
    if (h > A4_PX) overflow = true;
    console.log(`${i+1}쪽: ${path.relative(ROOT, png)}${flag}`);
  }
  if (!process.argv.includes('--no-pdf')) {
    await p.emulateMedia({ media: 'print' });
    const pdf = path.join(out, `${slug}.pdf`);
    await p.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(`PDF: ${path.relative(ROOT, pdf)}`);
  }
  await b.close();
  if (overflow) { console.error('일부 쪽이 A4를 넘었습니다.'); process.exit(2); }
}
main().catch(e => { console.error(e); process.exit(1); });
