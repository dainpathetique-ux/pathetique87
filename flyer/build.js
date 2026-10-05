#!/usr/bin/env node
// 전단지 빌더: flyer/초등논술_전단지.html → PDF(216x303mm, 재단여백 3mm 포함) + PNG 미리보기
// 사용: node flyer/build.js
const path = require('path');
const fs = require('fs');
function requirePlaywright() {
  try { return require('playwright'); } catch (e) {}
  const g = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(g, 'playwright'));
}
(async () => {
  const { chromium } = requirePlaywright();
  const dir = __dirname;
  const html = path.join(dir, '초등논술_전단지.html');
  const out = path.join(dir, 'output');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 816, height: 1145 }, deviceScaleFactor: 3 });
  await page.goto('file://' + html);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, '초등논술_전단지.png'), fullPage: false, clip: { x: 0, y: 0, width: 816.4, height: 1145.2 } });
  await page.pdf({ path: path.join(out, '초등논술_전단지_인쇄용_216x303mm.pdf'), width: '216mm', height: '303mm', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close();
  console.log('done →', out);
})();
