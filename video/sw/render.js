// node video/sw/render.js [preview]  → output/영상_SW_자음군/
const fs=require('fs'), path=require('path'), {execSync}=require('child_process');
function pw(){ try{return require('playwright')}catch(e){} const g=execSync('npm root -g').toString().trim(); return require(path.join(g,'playwright')); }
const {chromium}=pw();
const here=__dirname, out=path.join(here,'..','..','output','영상_SW_자음군'), frames=path.join(out,'frames');
const FPS=24, DUR=30, preview=process.argv[2]==='preview';
(async()=>{
  fs.mkdirSync(frames,{recursive:true});
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const pg=await b.newPage({viewport:{width:1920,height:1080}});
  await pg.goto('file://'+path.join(here,'scene.html')); await pg.evaluate(()=>document.fonts.ready); await pg.waitForTimeout(300);
  const times = preview ? [0.3,2.5,4.5,6,9,13,16,22,27.5] : Array.from({length:FPS*DUR},(_,i)=>i/FPS);
  for(let i=0;i<times.length;i++){
    await pg.evaluate(t=>window.render(t), times[i]);
    const name = preview ? `preview_${String(times[i]).replace('.','_')}.png` : `f${String(i).padStart(4,'0')}.png`;
    await pg.screenshot({path:path.join(preview?out:frames,name)});
    if(!preview && i%120===0) console.log('frame',i);
  }
  await b.close(); console.log('done', times.length);
})();
