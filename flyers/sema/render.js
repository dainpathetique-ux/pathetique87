#!/usr/bin/env node
// 전단 렌더: flyer.html → PNG(2x) + PDF.  사용: node flyers/sema/render.js
const path = require('path');
function pw(){ try{return require('playwright')}catch(e){} const g=require('child_process').execSync('npm root -g').toString().trim(); return require(path.join(g,'playwright')); }
(async () => {
  const { chromium } = pw();
  const dir = __dirname;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const pg = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  await pg.goto('file://' + path.join(dir, 'flyer.html'));
  await pg.evaluate(() => document.fonts.ready);
  const over = await pg.evaluate(() => { const p=document.querySelector('.page'); return p.scrollHeight - p.clientHeight; });
  console.log(over > 0 ? `⚠ 넘침 ${over}px` : '✓ 한 쪽에 맞음');
  await pg.locator('.page').screenshot({ path: path.join(dir, 'sema_flyer.png') });
  await pg.pdf({ path: path.join(dir, 'sema_flyer.pdf'), format: 'A4', printBackground: true, margin: {top:0,right:0,bottom:0,left:0} });
  await b.close();
})();
