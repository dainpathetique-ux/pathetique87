#!/usr/bin/env node
// 파닉스 15초 영상 빌더: JSON → HTML 장면 → 프레임 캡처(Playwright) → MP4(ffmpeg)
// 사용: node tool/video.js video/<이름>.json  [--preview]   (--preview: PNG 3장만, MP4 생략)
// 출력: output/video/<slug>/<slug>.mp4, <slug>_도입.png, <slug>_본편.png, <slug>_아웃트로.png
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function requirePlaywright() {
  try { return require('playwright'); } catch (e) {}
  const { execSync } = require('child_process');
  const g = execSync('npm root -g').toString().trim();
  return require(path.join(g, 'playwright'));
}

const ROOT = path.resolve(__dirname, '..');
const W = 1080, H = 1920, FPS = 30, DUR = 15;
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 기본 제공 사물 일러스트(인라인 SVG). JSON의 word.svg 가 있으면 그것을 우선 사용.
const ICONS = {
  apple: `<svg viewBox="0 0 200 200"><path d="M104 46c0-18 10-30 26-34-2 16-10 28-26 34z" fill="#5fa84d"/><path d="M100 60c-14-12-40-12-54 8-18 26-8 76 14 100 12 12 24 8 40 2 16 6 28 10 40-2 22-24 32-74 14-100-14-20-40-20-54-8z" fill="#e8483a"/><path d="M100 60v-8c0-8 2-14 6-18" stroke="#6b3d1e" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="72" cy="92" rx="10" ry="18" fill="#fff" opacity=".35"/></svg>`,
  cat: `<svg viewBox="0 0 200 200"><path d="M40 70 50 24l34 30zM160 70l-10-46-34 30z" fill="#f2a24a"/><circle cx="100" cy="100" r="60" fill="#f7b35e"/><circle cx="78" cy="92" r="8" fill="#2b2f3a"/><circle cx="122" cy="92" r="8" fill="#2b2f3a"/><path d="M94 112h12l-6 8z" fill="#e06a5a"/><path d="M100 120c-6 8-14 10-22 8M100 120c6 8 14 10 22 8" stroke="#2b2f3a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M40 104h28M40 116h28M132 104h28M132 116h28" stroke="#2b2f3a" stroke-width="3" stroke-linecap="round"/></svg>`,
  banana: `<svg viewBox="0 0 200 200"><path d="M42 58c10 50 48 86 104 94 14 2 26-4 30-14-50 0-96-32-116-86-4-10-20-8-18 6z" fill="#f6d33c"/><path d="M42 58c-2-10 10-14 16-8 14 48 56 82 106 84 6 0 8 6 4 10-54-2-108-36-126-86z" fill="#e9b920"/><path d="M34 52c2-8 6-14 10-16l8 8c-6 2-10 6-12 12z" fill="#6b4a1e"/></svg>`,
  ant: `<svg viewBox="0 0 200 200"><ellipse cx="54" cy="110" rx="26" ry="20" fill="#3a3a3a"/><ellipse cx="100" cy="106" rx="22" ry="17" fill="#3a3a3a"/><ellipse cx="150" cy="104" rx="30" ry="22" fill="#3a3a3a"/><path d="M40 92 24 70M60 90l-6-28M96 90l-14-30M112 92l10-30M70 124l-20 30M100 122l0 32M130 122l22 28" stroke="#3a3a3a" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="36" cy="106" r="4" fill="#fff"/></svg>`,
  bag: `<svg viewBox="0 0 200 200"><path d="M70 70V56c0-18 12-30 30-30s30 12 30 30v14" stroke="#7a57c9" stroke-width="10" fill="none" stroke-linecap="round"/><rect x="34" y="70" width="132" height="100" rx="14" fill="#9b7bdc"/><rect x="34" y="70" width="132" height="22" rx="8" fill="#7a57c9"/><rect x="86" y="112" width="28" height="18" rx="4" fill="#fff" opacity=".8"/></svg>`,
  hat: `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="134" rx="80" ry="20" fill="#2f6fcb"/><path d="M60 134V84c0-22 18-40 40-40s40 18 40 40v50z" fill="#3f86e6"/><rect x="60" y="112" width="80" height="14" fill="#f6d33c"/></svg>`,
  map: `<svg viewBox="0 0 200 200"><path d="M30 50l46-16 48 16 46-16v120l-46 16-48-16-46 16z" fill="#e7f4e8" stroke="#3f9a48" stroke-width="6" stroke-linejoin="round"/><path d="M76 34v120M124 50v120" stroke="#3f9a48" stroke-width="5"/><path d="M50 120c20-30 40-30 60 0s40 30 40 0" stroke="#2f6fcb" stroke-width="6" fill="none"/><circle cx="100" cy="84" r="10" fill="#e8483a"/></svg>`,
  sofa: `<svg viewBox="0 0 200 200"><rect x="30" y="80" width="140" height="70" rx="16" fill="#e07b2a"/><rect x="20" y="96" width="30" height="60" rx="10" fill="#c9661c"/><rect x="150" y="96" width="30" height="60" rx="10" fill="#c9661c"/><rect x="40" y="150" width="12" height="18" fill="#6b3d1e"/><rect x="148" y="150" width="12" height="18" fill="#6b3d1e"/><rect x="48" y="96" width="50" height="40" rx="8" fill="#f2a24a"/><rect x="102" y="96" width="50" height="40" rx="8" fill="#f2a24a"/></svg>`,
  panda: `<svg viewBox="0 0 200 200"><circle cx="58" cy="52" r="22" fill="#2b2f3a"/><circle cx="142" cy="52" r="22" fill="#2b2f3a"/><circle cx="100" cy="104" r="66" fill="#fff"/><ellipse cx="74" cy="96" rx="18" ry="22" fill="#2b2f3a"/><ellipse cx="126" cy="96" rx="18" ry="22" fill="#2b2f3a"/><circle cx="78" cy="98" r="6" fill="#fff"/><circle cx="122" cy="98" r="6" fill="#fff"/><ellipse cx="100" cy="128" rx="10" ry="7" fill="#2b2f3a"/><path d="M90 140c6 6 14 6 20 0" stroke="#2b2f3a" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
};

// 글자(폴백) 아이콘: 사물 일러스트가 없을 때 단어 첫 글자 배지
const fallbackIcon = (ch, color) =>
  `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="84" fill="${color}" opacity=".18"/><circle cx="100" cy="100" r="64" fill="${color}"/><text x="100" y="128" text-anchor="middle" font-family="Inter, 'DejaVu Sans', sans-serif" font-weight="800" font-size="86" fill="#fff">${esc(ch)}</text></svg>`;

const ACCENTS = ['#e8483a', '#2f6fcb', '#3f9a48', '#7a57c9'];

function wordHtml(w, accent) {
  const hl = Number.isInteger(w.hl) ? w.hl : w.word.toLowerCase().indexOf(String(w.letter || '').toLowerCase());
  return [...w.word].map((c, i) => i === hl ? `<span class="hl" style="color:${accent}">${esc(c)}</span>` : esc(c)).join('');
}

function buildHtml(d) {
  const words = d.words.slice(0, 3);
  const letterUp = d.letter.toUpperCase(), letterLo = d.letter.toLowerCase();
  const heroIcon = words[0]?.svg || ICONS[words[0]?.icon] || fallbackIcon(letterUp, ACCENTS[0]);
  const scenes = words.map((w, i) => {
    const accent = ACCENTS[(i + 1) % ACCENTS.length];
    const icon = w.svg || ICONS[w.icon] || fallbackIcon(w.word[0].toUpperCase(), accent);
    return `
    <section class="scene word" data-i="${i}">
      <div class="pill" style="background:${accent}">${esc(w.pos)}</div>
      <div class="icon">${icon}</div>
      <div class="word-txt">${wordHtml({ ...w, letter: d.letter }, accent)}</div>
      <div class="ipa">${esc(w.ipa)}</div>
    </section>`;
  }).join('');
  const logo = fs.readFileSync(path.join(ROOT, 'tool', 'logo.jpg')).toString('base64');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"NKR";src:url(file://${path.join(ROOT, 'tool', 'kr700.woff2')}) format("woff2");font-weight:700}
*{box-sizing:border-box;margin:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#fff}
body{font-family:Inter,"DejaVu Sans",sans-serif;color:#2b2f3a;
  background:linear-gradient(170deg,#fff8e8 0%,#e6eefb 100%)}
.scene{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;padding:${Math.round(H * .15)}px 60px}
.scene>*{transition:none}
.cap{font-size:64px;font-weight:600;color:#5a6b85;letter-spacing:.02em;position:absolute;top:${Math.round(H * .17)}px}
.pill{position:absolute;top:${Math.round(H * .17)}px;font-size:60px;font-weight:700;color:#fff;padding:14px 56px;border-radius:999px}
.big{font-size:460px;font-weight:800;line-height:1;letter-spacing:-.02em;color:#1d3f7a;margin-top:-80px}
.big .lo{font-weight:600;color:#2f6fcb}
.icon{width:460px;height:460px;margin-bottom:40px}
.icon svg{width:100%;height:100%}
.intro .icon{width:380px;height:380px;margin-top:40px;margin-bottom:0}
.word-txt{font-size:180px;font-weight:800;letter-spacing:-.01em;line-height:1.1;color:#1d3f7a;white-space:nowrap}
.word-txt.small{font-size:140px}
.hl{display:inline-block}
.ipa{font-family:"DejaVu Sans",Inter,sans-serif;font-size:84px;color:#3a4a66;margin-top:24px}
.outro .logo{width:760px;border-radius:24px;box-shadow:0 20px 60px rgba(29,63,122,.15);background:#fff}
.outro .name{font-family:"NKR",sans-serif;font-weight:700;font-size:62px;color:#1d3f7a;margin-top:56px}
</style></head><body>
<section class="scene intro">
  <div class="cap">Today's Sound</div>
  <div class="big">${esc(letterUp)} <span class="lo">${esc(letterLo)}</span></div>
  <div class="sound">${esc(d.sound || '')}</div>
  <div class="icon">${heroIcon}</div>
</section>
${scenes}
<section class="scene outro">
  <img class="logo" src="data:image/jpeg;base64,${logo}">
  <div class="name">ON글터영어국어학원</div>
</section>
<style>.sound{font-family:"DejaVu Sans",Inter,sans-serif;font-size:110px;color:#e8483a;font-weight:700;margin-top:10px}</style>
<script>
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ease=t=>1-Math.pow(1-clamp(t,0,1),3);
// 장면 타임라인(초): 도입 0-3, 단어 3-6 / 6-9 / 9-12, 아웃트로 12-15
const SC=[['intro',0,3],['w0',3,6],['w1',6,9],['w2',9,12],['outro',12,15]];
const el={intro:document.querySelector('.intro'),outro:document.querySelector('.outro')};
document.querySelectorAll('.scene.word').forEach(s=>el['w'+s.dataset.i]=s);
window.seek=function(t){
  for(const [k,a,b] of SC){
    const s=el[k]; if(!s) continue;
    const inT=ease((t-a)/0.45), outT=ease((t-(b-0.3))/0.3);
    const on=t>=a-0.001&&t<b;
    s.style.opacity=on?String(inT*(1-outT)):'0';
    const dir=k==='intro'?0:k==='outro'?0:1;
    s.style.transform=on?'translateX('+((1-inT)*120*dir)+'px)':'none';
    if(on){
      const kids=s.children;
      for(let i=0;i<kids.length;i++){
        const d=i*0.12, p=ease((t-a-d)/0.5);
        kids[i].style.opacity=String(p);
        kids[i].style.transform='translateY('+((1-p)*40)+'px)';
      }
      const ic=s.querySelector('.icon');
      if(ic){const w=t-a; ic.style.transform='translateY('+(Math.sin(w*2.2)*10)+'px) scale('+(0.92+0.08*ease(w/0.6))+')';}
      const hl=s.querySelector('.hl');
      if(hl){const w=t-a-0.6; const p=w>0?1+0.12*Math.sin(clamp(w,0,0.5)*Math.PI*2):1; hl.style.transform='scale('+p+')';}
    }
  }
};
</script></body></html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const file = args.find(a => !a.startsWith('--'));
  if (!file) { console.error('사용: node tool/video.js video/<이름>.json [--preview]'); process.exit(1); }
  const preview = args.includes('--preview');
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!d.letter || !Array.isArray(d.words) || d.words.length < 3) throw new Error('letter 와 words(3개: Beginning/Middle/Ending) 가 필요합니다');
  const slug = d.slug || path.basename(file, '.json');
  const out = path.join(ROOT, 'output', 'video', slug);
  fs.mkdirSync(out, { recursive: true });
  const html = buildHtml(d);
  fs.writeFileSync(path.join(out, 'scene.html'), html);

  const { chromium } = requirePlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(out, 'scene.html'));
  await page.evaluate(() => document.fonts.ready);
  // 긴 단어는 글자 크기 축소
  await page.evaluate(() => document.querySelectorAll('.word-txt').forEach(e => { if (e.textContent.length > 7) e.classList.add('small'); }));

  const previews = [['도입', 1.6], ['본편', 4.6], ['아웃트로', 13.8]];
  for (const [name, t] of previews) {
    await page.evaluate(t => window.seek(t), t);
    await page.screenshot({ path: path.join(out, `${slug}_${name}.png`), type: 'png' });
  }
  console.log('미리보기 PNG 3장 저장:', out);
  if (preview) { await browser.close(); return; }

  const mp4 = path.join(out, `${slug}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', mp4]);
  ff.stderr.on('data', b => process.stderr.write(b));
  const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg 종료 코드 ' + c))));
  const total = FPS * DUR;
  for (let i = 0; i < total; i++) {
    await page.evaluate(t => window.seek(t), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 90 === 0) console.log(`프레임 ${i}/${total}`);
  }
  ff.stdin.end();
  await done;
  await browser.close();
  console.log('MP4 저장:', mp4);
}

main().catch(e => { console.error(e); process.exit(1); });
