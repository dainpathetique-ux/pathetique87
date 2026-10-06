// node video/sw/build_video.js specs/<주제>.json [preview]
// 사양(JSON) 하나로 프레임 렌더 → 내레이션(piper) → BGM → 합성 → 장면표까지 만든다.
const fs=require('fs'), path=require('path'), {execSync}=require('child_process');
function pw(){ try{return require('playwright')}catch(e){} const g=execSync('npm root -g').toString().trim(); return require(path.join(g,'playwright')); }
const {chromium}=pw();
const [specPath, mode]=process.argv.slice(2); const preview=mode==='preview';
const spec=specPath.endsWith('.js')?require(path.resolve(specPath)):JSON.parse(fs.readFileSync(specPath,'utf8'));
const here=__dirname, root=path.join(here,'..','..'), out=path.join(root,'output',spec.outName), frames=path.join(out,'frames');
const FPS=24, DUR=30;
(async()=>{
  fs.mkdirSync(frames,{recursive:true});
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const pg=await b.newPage({viewport:{width:1080,height:1920}});
  pg.on('pageerror',e=>{console.error('PAGE ERROR',e.message);process.exit(1)});
  await pg.goto('file://'+path.join(here,'scene_tpl.html')); await pg.evaluate(()=>document.fonts.ready); await pg.waitForTimeout(200);
  await pg.evaluate(s=>window.setup(s), spec);
  const times = preview ? [2.6,6,9,13,16,22] : Array.from({length:FPS*DUR},(_,i)=>i/FPS);
  for(let i=0;i<times.length;i++){
    await pg.evaluate(t=>window.render(t), times[i]);
    await pg.screenshot({path:path.join(preview?out:frames, preview?`preview_${String(times[i]).replace('.','_')}.png`:`f${String(i).padStart(4,'0')}.png`)});
  }
  await b.close();
  if(preview){ const files=times.map(t=>`-i "${path.join(out,`preview_${String(t).replace('.','_')}.png`)}"`).join(' ');
    execSync(`ffmpeg -y -loglevel error ${files} -filter_complex "[0][1][2][3][4][5]hstack=6,scale=2160:-1" "${path.join(out,'preview_sheet.png')}"`); console.log('preview', path.join(out,'preview_sheet.png')); return; }
  // 내레이션
  const model=process.env.PIPER_MODEL; if(!model) throw new Error('PIPER_MODEL 미지정');
  const vdir=path.join(out,'voice'); fs.mkdirSync(vdir,{recursive:true});
  spec.cues.forEach((c,i)=>{ c.file=path.join(vdir,`v${i}.wav`);
    execSync(`piper -m "${model}" -f "${c.file}" --length-scale 1.15 --sentence-silence 0.35`,{input:c.text,stdio:['pipe','ignore','ignore']});
    c.dur=+execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${c.file}"`).toString().trim();
    console.log(c.at.toFixed(1).padStart(5),'+',c.dur.toFixed(2),'→',(c.at+c.dur).toFixed(2), c.text); });
  fs.writeFileSync(path.join(vdir,'cues.json'),JSON.stringify(spec.cues,null,1));
  execSync(`node "${path.join(here,'bgm.js')}" "${path.join(out,'bgm.wav')}"`);
  const mp4=path.join(out,spec.outName.replace(/^영상_/,'')+'_30초.mp4');
  execSync(`"${path.join(here,'mix.sh')}" "${out}" "${mp4}"`,{stdio:'inherit'});
  execSync(`ffmpeg -y -loglevel error -i "${mp4}" -vf "fps=1/3,scale=270:-1,tile=10x1" -frames:v 1 "${path.join(out,'contact_sheet.png')}"`);
  fs.rmSync(frames,{recursive:true,force:true}); fs.readdirSync(out).filter(f=>f.startsWith('preview_')).forEach(f=>fs.unlinkSync(path.join(out,f)));
  console.log('done', mp4);
})();
