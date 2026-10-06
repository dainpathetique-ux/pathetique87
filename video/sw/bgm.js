// 간단한 마림바풍 BGM 생성 (112 BPM, C 펜타토닉, 30초, 자체 제작이라 저작권 문제 없음)
const fs=require('fs'); const SR=44100, DUR=30, BPM=112, N=SR*DUR; const buf=new Float32Array(N);
const beat=60/BPM, eighth=beat/2;
const scale=[261.63,293.66,329.63,392.0,440.0,523.25,587.33,659.26,783.99]; // C D E G A C D E G
const pattern=[0,2,4,5,4,2,1,3, 0,2,4,7,5,4,2,1, 3,5,7,8,7,5,3,2, 0,4,5,7,5,4,2,0];
function tone(t0,f,len,amp){ const s=Math.floor(t0*SR), L=Math.floor(len*SR); for(let i=0;i<L&&s+i<N;i++){ const t=i/SR; const env=Math.exp(-t*6)*(1-Math.exp(-t*400)); buf[s+i]+=amp*env*(Math.sin(2*Math.PI*f*t)+0.35*Math.sin(2*Math.PI*f*4*t)*Math.exp(-t*18)); } }
function block(t0,amp){ const s=Math.floor(t0*SR); for(let i=0;i<SR*0.05&&s+i<N;i++){ const t=i/SR; buf[s+i]+=amp*Math.exp(-t*90)*(Math.random()*2-1)*0.5+amp*Math.exp(-t*60)*Math.sin(2*Math.PI*900*t)*0.5; } }
for(let k=0,t=0;t<DUR-0.5;k++,t+=eighth){ tone(t,scale[pattern[k%pattern.length]],0.6,0.18); if(k%8===2||k%8===6) block(t,0.12); if(k%8===0) tone(t,scale[0]/2,1.0,0.12); }
// 1.2초 페이드인 / 2초 페이드아웃, 마스터 게인
for(let i=0;i<N;i++){ const t=i/SR; let g=0.55; if(t<1.2) g*=t/1.2; if(t>DUR-2) g*=(DUR-t)/2; buf[i]=Math.max(-1,Math.min(1,buf[i]*g)); }
const wav=Buffer.alloc(44+N*2); const w=(o,s)=>wav.write(s,o);
w(0,'RIFF'); wav.writeUInt32LE(36+N*2,4); w(8,'WAVE'); w(12,'fmt '); wav.writeUInt32LE(16,16); wav.writeUInt16LE(1,20); wav.writeUInt16LE(1,22); wav.writeUInt32LE(SR,24); wav.writeUInt32LE(SR*2,28); wav.writeUInt16LE(2,32); wav.writeUInt16LE(16,34); w(36,'data'); wav.writeUInt32LE(N*2,40);
for(let i=0;i<N;i++) wav.writeInt16LE(Math.round(buf[i]*32767),44+i*2);
const out=process.argv[2]||'bgm.wav'; fs.writeFileSync(out,wav); console.log('wrote',out);
