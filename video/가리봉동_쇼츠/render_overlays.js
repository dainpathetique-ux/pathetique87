const path=require('path');const fs=require('fs');
function pw(){try{return require('playwright')}catch(e){};const g=require('child_process').execSync('npm root -g').toString().trim();return require(path.join(g,'playwright'))}
(async()=>{const {chromium}=pw();const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+path.resolve('overlays.html'));await p.evaluate(()=>document.fonts.ready);
for(const id of ['sub1','sub2','outro']){await p.locator('#'+id).screenshot({path:id+'.png',omitBackground:id!=='outro'});console.log(id+'.png')}
await b.close()})();
