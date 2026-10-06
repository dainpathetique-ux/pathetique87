// node video/sw/voice.js <출력폴더> : 영어 내레이션 클립 생성 + 큐 시트(JSON) 저장
// 음성: piper (en_US-hfc_female-medium). 모델 경로는 PIPER_MODEL 환경변수로 지정.
const fs=require('fs'), path=require('path'), {execSync}=require('child_process');
const out=process.argv[2]; const model=process.env.PIPER_MODEL; if(!model) throw new Error('PIPER_MODEL 미지정');
const cues=[
  {at:0.8,  text:"Today's sound is S, W.  Swan.  Swan."},
  {at:5.4,  text:"Sing."},
  {at:7.9,  text:"Wing."},
  {at:10.4, text:"Swing!"},
  {at:11.5, text:"Sing, wing, swing.  Can you hear both sounds?"},
  {at:15.6, text:"Sweet.  Sweet."},
  {at:20.6, text:"Swim.  Swim."},
  {at:25.6, text:"Great job!  See you next time."},
];
const dir=path.join(out,'voice'); fs.mkdirSync(dir,{recursive:true});
cues.forEach((c,i)=>{ c.file=path.join(dir,`v${i}.wav`);
  execSync(`piper -m "${model}" -f "${c.file}" --length-scale 1.15 --sentence-silence 0.35`,{input:c.text,stdio:['pipe','ignore','ignore']});
  c.dur=+execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${c.file}"`).toString().trim();
  console.log(c.at.toFixed(1).padStart(5),'+',c.dur.toFixed(2),'→',(c.at+c.dur).toFixed(2), c.text); });
fs.writeFileSync(path.join(dir,'cues.json'),JSON.stringify(cues,null,1));
