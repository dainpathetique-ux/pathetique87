const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('node:path');
(async () => {
const [,, inHtml, outPdf] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + path.resolve(inHtml), { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: outPdf, format: 'A4', printBackground: true, preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: '<div style="width:100%;font-size:7.5pt;font-family:sans-serif;color:#444;padding:0 12mm;display:flex;justify-content:space-between;"><span>경화여고 2-2 중간 영어 통합 정리본 · ON글터 내부용</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  margin: { top: '11mm', bottom: '13mm', left: '11mm', right: '11mm' },
});
await browser.close();
console.log('written', outPdf);
})();
