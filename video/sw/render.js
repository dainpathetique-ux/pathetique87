// node video/sw/render.js <scene.html> <WxH> <출력폴더명> [preview]
const fs=require('fs'), path=require('path'), {execSync}=require('child_process');
function pw(){ try{return require('playwright')}catch(e){} const g=execSync('npm root -g').toString().trim(); return require(path.join(g,'playwright')); }
const {chromium}=pw();
const [scene='scene_v.html', size='1080x1920', outName='영상_SW_자음군_숏폼', mode]=process.argv.slice(2);
const [W,H]=size.split('x').map(Number);
const here=__dirname, out=path.join(here,'..','..','output',outName), frames=path.join(out,'frames');
const FPS=24, DUR=30, preview=mode==='preview';
(async()=>{
  fs.mkdirSync(frames,{recursive:true});
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const pg=await b.newPage({viewport:{width:W,height:H}});
  pg.on('pageerror',e=>{console.error('PAGE ERROR',e.message);process.exit(1)});
  await pg.goto('file://'+path.join(here,scene)); await pg.evaluate(()=>document.fonts.ready); await pg.waitForTimeout(300);
  const times = preview ? [0.3,2.6,4.5,6,9,13,16,22,27.5] : Array.from({length:FPS*DUR},(_,i)=>i/FPS);
  for(let i=0;i<times.length;i++){
    await pg.evaluate(t=>window.render(t), times[i]);
    const name = preview ? `preview_${String(times[i]).replace('.','_')}.png` : `f${String(i).padStart(4,'0')}.png`;
    await pg.screenshot({path:path.join(preview?out:frames,name)});
    if(!preview && i%240===0) console.log('frame',i);
  }
  await b.close(); console.log('done', times.length);
})();
