#!/usr/bin/env node
// 칼선(재단선) 포함 인쇄 데이터 생성: 작업 216x303mm + 사방 5mm 여백 = 226x313mm, 재단 210x297mm
// 1) 칼선 포함 PDF  2) pdftocairo 로 글자를 패스(윤곽선)로 변환한 SVG  3) 다시 PDF 로 출력 → .ai 로 저장
// 사용: node flyer/build-ai.js
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
function requirePlaywright() {
  try { return require('playwright'); } catch (e) {}
  const g = execSync('npm root -g').toString().trim();
  return require(path.join(g, 'playwright'));
}
const MARK_LEN = 4, MARK_GAP = 3.5; // mm: 재단선 길이 / 재단 모서리에서 떨어진 거리(재단여백 3mm 바깥)
const PAD = 5; // mm: 작업 사이즈 바깥 여백
const W = 216 + PAD * 2, H = 303 + PAD * 2; // 226 x 313
const marksCSS = `
html,body{width:${W}mm!important;height:${H}mm!important;background:#fff!important;position:relative}
.page{position:absolute!important;left:${PAD}mm;top:${PAD}mm}
.mk{position:absolute;background:#000}
.mk.h{height:0.25pt;width:${MARK_LEN}mm}.mk.v{width:0.25pt;height:${MARK_LEN}mm}
`;
function marksHTML() {
  const t = PAD + 3, b = PAD + 3 + 297, l = PAD + 3, r = PAD + 3 + 210; // 재단선 좌표(mm)
  const m = [];
  const h = (x, y) => m.push(`<div class="mk h" style="left:${x}mm;top:${y}mm"></div>`);
  const v = (x, y) => m.push(`<div class="mk v" style="left:${x}mm;top:${y}mm"></div>`);
  for (const y of [t, b]) { h(l - MARK_GAP - MARK_LEN, y); h(r + MARK_GAP, y); }
  for (const x of [l, r]) { v(x, t - MARK_GAP - MARK_LEN); v(x, b + MARK_GAP); }
  return m.join('');
}
(async () => {
  const { chromium } = requirePlaywright();
  const dir = __dirname, out = path.join(dir, 'output');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let page = await browser.newPage();
  await page.goto('file://' + path.join(dir, '초등논술_전단지.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: `@page{size:${W}mm ${H}mm;margin:0}` + marksCSS });
  await page.evaluate(html => document.body.insertAdjacentHTML('beforeend', html), marksHTML());
  await page.waitForTimeout(300);
  const pdfMarks = path.join(out, '초등논술_전단지_칼선포함_226x313mm.pdf');
  await page.pdf({ path: pdfMarks, width: `${W}mm`, height: `${H}mm`, printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });

  // 글자 → 패스 변환 (cairo SVG 는 글리프를 path 로 내보냄)
  const svg = path.join(out, '_outlined.svg');
  execSync(`pdftocairo -svg "${pdfMarks}" "${svg}"`);
  page = await browser.newPage();
  await page.setContent(`<!doctype html><html><head><style>@page{size:${W}mm ${H}mm;margin:0}html,body{margin:0;width:${W}mm;height:${H}mm}svg{width:${W}mm;height:${H}mm;display:block}</style></head><body>${fs.readFileSync(svg, 'utf8').replace(/^<\?xml[^>]*>\s*/, '')}</body></html>`);
  await page.waitForTimeout(300);
  const pdfOutlined = path.join(out, '초등논술_전단지_칼선포함_윤곽선_226x313mm.pdf');
  await page.pdf({ path: pdfOutlined, width: `${W}mm`, height: `${H}mm`, printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  fs.copyFileSync(pdfOutlined, path.join(out, '초등논술_전단지_칼선포함_226x313mm.ai'));
  fs.unlinkSync(svg);
  await browser.close();
  console.log('done →', out);
})();
