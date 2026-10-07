const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs=require('fs'), path=require('path');
(async()=>{
 const meta=JSON.parse(fs.readFileSync('meta.json'));
 const slides=[...new Set(meta.map(m=>m.slide))];
 fs.mkdirSync('frames',{recursive:true});
 const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
 await pg.goto('file://'+path.resolve('slides.html'),{waitUntil:'load'});
 await pg.evaluate(()=>document.fonts.ready);
 for(const s of slides){ await pg.evaluate(id=>window.__show(id), s); await pg.waitForTimeout(120); await pg.screenshot({path:`frames/${s}.png`}); }
 await b.close(); console.log('frames:',slides.length);
})();
