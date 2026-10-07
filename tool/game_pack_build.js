#!/usr/bin/env node
// 초등영어 게임 패키지 빌더: 게임마다 PDF 1개 (매뉴얼 1~2쪽 + 전용 머트리얼)
// 사용: node tool/game_pack_build.js [--png] [--only A-01,B-03] [--out output/초등영어게임]
const fs = require('fs');
const path = require('path');
function requirePlaywright() { try { return require('playwright'); } catch (e) {} const g = require('child_process').execSync('npm root -g').toString().trim(); return require(path.join(g, 'playwright')); }
const ROOT = path.resolve(__dirname, '..');
const BASE = require(path.join(ROOT, 'games', '초등영어게임_데이터.js'));
const EXTRA = require(path.join(ROOT, 'games', '초등영어게임_보강.js'));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const DATE = '2026. 10.';
const CH = Object.fromEntries(BASE.chapters.map(c => [c.id, c]));
const games = BASE.games.map(g => ({ ...g, ...(EXTRA[g.en] || {}) }));
{ const cnt = {}; for (const g of games) { cnt[g.ch] = (cnt[g.ch] || 0) + 1; g.id = `${g.ch}-${String(cnt[g.ch]).padStart(2, '0')}`; g.no = games.indexOf(g) + 1; } }

// ───────────── CSS ─────────────
const CSS = `
@font-face{font-family:"NKR";src:url(kr400.woff2) format("woff2");font-weight:400}
@font-face{font-family:"NKR";src:url(kr700.woff2) format("woff2");font-weight:700}
:root{--ink:#2b2f3a;--line:#9fb3c8;--teal:#1f8a86;--blue:#2f6fcb;--violet:#7a57c9;--orange:#e07b2a;--green:#3f9a48;--rose:#c9507a;
--teal-l:#e3f4f3;--blue-l:#e6eefb;--violet-l:#eee8fa;--orange-l:#fdeee0;--green-l:#e7f4e8;--rose-l:#fbe7ee;--cream:#fff8e8;--navy:#1d3f7a}
*{box-sizing:border-box}
body{margin:0;background:#888;font-family:"NKR","Noto Color Emoji",sans-serif;color:var(--ink);font-size:10.5pt;line-height:1.5}
.emo{font-family:"Noto Color Emoji","NKR",sans-serif;line-height:1}
.page{width:210mm;height:297mm;background:#fff;padding:11mm 14mm 10mm;margin:0 auto 10px;position:relative;overflow:hidden;display:flex;flex-direction:column}
@page{size:A4;margin:0}
@media print{body{background:none}.page{margin:0;page-break-after:always;break-after:page}}
.content{flex:1;overflow:hidden;position:relative}
.c-teal{--c:var(--teal);--cl:var(--teal-l)}.c-blue{--c:var(--blue);--cl:var(--blue-l)}.c-violet{--c:var(--violet);--cl:var(--violet-l)}
.c-orange{--c:var(--orange);--cl:var(--orange-l)}.c-green{--c:var(--green);--cl:var(--green-l)}.c-rose{--c:var(--rose);--cl:var(--rose-l)}
.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid var(--c);padding-bottom:4px;margin-bottom:5mm;flex:none}
.hdr .hl{display:flex;align-items:center;gap:4mm;min-width:0}
.hdr .logo{width:38mm;height:11mm;overflow:hidden;flex:none}
.hdr .logo img{width:47.5mm;margin:-5.2mm 0 0 -4.7mm;display:block}
.hdr .l{font-size:8.5pt;color:#5a6b85}.hdr .t{font-size:12pt;font-weight:700;color:var(--navy);line-height:1.2}
.hdr .badge{flex:none;background:var(--c);color:#fff;font-weight:700;font-size:13pt;border-radius:8px;padding:1mm 4mm;text-align:center;line-height:1.2}
.hdr .badge small{display:block;font-size:7.5pt;font-weight:400;opacity:.9}
.pg{position:absolute;bottom:5.5mm;left:0;right:0;text-align:center;font-size:8.5pt;color:#8a97ab}
/* 매뉴얼 */
.ttl{display:flex;align-items:flex-end;gap:5mm;border-left:8px solid var(--c);padding:1mm 0 1mm 5mm;margin-bottom:4mm}
.ttl .en{font-size:24pt;font-weight:700;color:var(--navy);line-height:1.15}
.ttl .ko{font-size:14pt;color:#3a4a66;padding-bottom:1.5mm}
.ttl .tags{margin-left:auto;display:flex;gap:2mm;padding-bottom:2mm;flex:none}
.ttl .tags i{font-style:normal;font-size:9pt;background:var(--c);color:#fff;border-radius:10px;padding:1px 8px;font-weight:700;white-space:nowrap}
.meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2mm;margin-bottom:4mm}
.meta div{background:var(--cl);border-radius:6px;padding:1.5mm 3mm;font-size:9.8pt;line-height:1.4;word-break:keep-all}
.meta b{display:block;font-size:8.5pt;color:var(--c)}
.meta .w2{grid-column:span 2}
.aim{font-size:11pt;padding:2mm 3.5mm;border:1.5px solid var(--c);border-radius:6px;margin-bottom:4mm;word-break:keep-all}
.aim b{color:var(--c);margin-right:2mm}
.sec{font-weight:700;font-size:11pt;color:var(--c);margin-bottom:1.5mm;display:flex;align-items:center;gap:2mm}
.sec::after{content:"";flex:1;border-top:1.5px solid var(--cl)}
.body{display:flex;gap:5mm;margin-bottom:4mm}
.body .steps{flex:1.4}.body .talk{flex:1}
ol.st{margin:0;padding-left:1.7em;font-size:10.3pt;line-height:1.5;word-break:keep-all}
ol.st li{margin-bottom:1.2mm;padding-left:.2em}ol.st li::marker{color:var(--c);font-weight:700}
.dl{display:flex;gap:2mm;font-size:10pt;line-height:1.45;margin-bottom:1mm;word-break:keep-all}
.dl .who{flex:none;min-width:9mm;font-weight:700;color:var(--c);font-size:9pt;text-align:right;padding-top:.3mm}
.exbox{background:#fbfcfe;border:1.5px solid var(--line);border-radius:8px;padding:2.5mm 3.5mm;margin-bottom:4mm}
.exbox .set{font-size:9.5pt;color:#3a4a66;margin-bottom:1.5mm}.exbox .set b{color:var(--navy)}
.ex{display:flex;gap:2.5mm;margin-bottom:1.1mm;font-size:10pt;line-height:1.45;word-break:keep-all}
.ex .who{flex:none;width:17mm;text-align:center;font-size:8.5pt;font-weight:700;border-radius:9px;padding:.2mm 1mm;background:var(--cl);color:var(--navy);align-self:flex-start;margin-top:.4mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ex.t .who{background:var(--c);color:#fff}.ex.n .who{background:#eef1f6;color:#5a6b85}.ex.r .who{background:#fde9c4;color:#8a5a00}
.ex.n .say{color:#5a6b85}.ex.r .say{color:#5c4511;font-weight:700}
.two{display:flex;gap:5mm;margin-bottom:4mm}.two>div{flex:1}
ul.tp{margin:0;padding-left:1.1em;font-size:9.8pt;line-height:1.45;word-break:keep-all}ul.tp li{margin-bottom:1mm}ul.tp li::marker{color:var(--c)}
.inc{border-top:1.5px dashed var(--line);padding-top:2mm;font-size:9.5pt;color:#3a4a66;display:flex;flex-wrap:wrap;gap:1.5mm 4mm;align-items:center}
.inc b{color:var(--navy)}.inc span{background:var(--cl);border-radius:5px;padding:0 6px;white-space:nowrap}
/* 머트리얼 공통 */
.mh{display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid var(--c);padding-bottom:2mm;margin-bottom:3mm;flex:none}
.mh .hl{display:flex;align-items:center;gap:3mm;flex:1;min-width:0}
.mh .logo{width:30mm;height:9mm;overflow:hidden;flex:none}.mh .logo img{width:38mm;margin:-4.2mm 0 0 -3.8mm;display:block}
.mh .mid{display:inline-block;background:var(--c);color:#fff;font-weight:700;border-radius:5px;padding:0 7px;font-size:10pt;margin-right:5px;white-space:nowrap}
.mh .mt{font-size:12pt;font-weight:700;color:var(--navy)}
.mh .gm{font-size:8.5pt;color:#5a6b85;text-align:right;flex:none;max-width:60mm;line-height:1.3}
.cut{font-size:8.5pt;color:#8a97ab;text-align:right;margin-bottom:2mm;flex:none}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.card{border:1.2px dashed #8a97ab;border-radius:6px;height:57mm;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;background:#fff;text-align:center;padding:2mm}
.card .emo{font-size:58pt;margin-bottom:2.5mm}
.card .w{font-size:16pt;font-weight:700;color:var(--navy);line-height:1.1}
.card .k{font-size:9.5pt;color:#5a6b85;margin-top:1mm}
.card .cat{position:absolute;top:2mm;left:2.5mm;font-size:7.5pt;color:#fff;background:var(--c);border-radius:8px;padding:0 6px;font-weight:700}
.card .tag{position:absolute;top:2mm;right:2.5mm;font-size:8.5pt;color:#8a97ab;font-weight:700}
.card.num .w{font-size:64pt}.card.num .k{font-size:14pt;color:var(--blue);font-weight:700}
.card .sw{width:34mm;height:34mm;border-radius:50%;border:1px solid #c7ccd6;margin-bottom:3mm}
.cards2{display:grid;grid-template-columns:repeat(2,1fr);gap:4mm}
.cards2 .card{height:58mm}
.cue .card{height:58mm;padding:3mm}
.cue .card .emo{font-size:36pt;margin-bottom:2mm}
.cue .card .w{font-size:15.5pt;line-height:1.25}
.cue .card .k{font-size:10pt;margin-top:1.5mm}
.dlg .row{display:flex;align-items:center;gap:4mm;border:1.2px dashed #8a97ab;border-radius:8px;padding:3mm 5mm;margin-bottom:3.5mm;min-height:24mm}
.dlg .who{flex:none;width:22mm;text-align:center;font-weight:700;color:#fff;background:var(--c);border-radius:8px;padding:1.5mm 1mm;font-size:11pt;line-height:1.2}
.dlg .en{font-size:17pt;font-weight:700;color:var(--navy);line-height:1.25;word-break:keep-all}
.dlg .ko{font-size:10.5pt;color:#5a6b85;margin-top:1mm}
.role .card{height:58mm;background:linear-gradient(180deg,var(--cl),#fff)}
.role .card .emo{font-size:52pt}.role .card .w{font-size:22pt}.role .card .k{font-size:11pt}
.role .card::before{content:"";position:absolute;top:3mm;left:50%;width:5mm;height:5mm;margin-left:-2.5mm;border:1.2px solid #8a97ab;border-radius:50%;background:#fff}
.sign{height:calc(50% - 2mm);border:1.5px dashed #8a97ab;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.sign .big{font-size:130pt;font-weight:700;line-height:1}.sign .sm{font-size:16pt;color:#3a4a66;margin-top:2mm}
.half{height:calc(50% - 2mm);border:1.2px dashed #8a97ab;border-radius:8px;padding:3mm;display:flex;flex-direction:column}
.half .ttl2{font-weight:700;color:var(--navy);font-size:11pt;margin-bottom:1.5mm}
.grid3{display:grid;grid-template-columns:repeat(3,1fr)}.grid3 i{display:flex;align-items:center;justify-content:center;border:1.5px solid var(--navy);height:27mm;font-style:normal;font-weight:700;font-size:18pt;color:var(--navy)}
.grid4{display:grid;grid-template-columns:repeat(4,1fr)}.grid4 i{display:flex;align-items:center;justify-content:center;border:1.5px solid var(--navy);height:26mm;font-style:normal;font-weight:700;font-size:13pt;color:var(--navy)}
.bingo{display:grid;grid-template-columns:1fr 1fr;gap:6mm}.bingo .b{border:1.2px dashed #8a97ab;border-radius:8px;padding:3mm}.bingo .b .ttl2{font-weight:700;color:var(--navy);text-align:center;margin-bottom:2mm}
table.sheet{width:100%;border-collapse:collapse;font-size:10pt;margin-bottom:5mm}
table.sheet th,table.sheet td{border:1.2px solid var(--navy);padding:1.5mm 2mm;text-align:center;height:9.5mm}
table.sheet th{background:var(--cl);color:var(--navy)}table.sheet td.nm{text-align:left;width:30mm}
.sheet-ttl{font-weight:700;color:var(--navy);font-size:11.5pt;margin-bottom:1.5mm}
.labels .lb{border:1.2px dashed #8a97ab;border-radius:8px;height:36mm;margin-bottom:4mm;display:flex;align-items:center;justify-content:center;gap:8mm}
.labels .lb .emo{font-size:40pt}.labels .lb .w{font-size:30pt;font-weight:700;color:var(--navy)}.labels .lb .k{font-size:14pt;color:#5a6b85}
.poster h3{margin:0 0 2mm;font-size:16pt;color:var(--navy);text-align:center}
.poster .row{display:flex;gap:3mm;margin-bottom:3mm}.poster .q{flex:1;border:1.5px solid var(--c);border-radius:8px;padding:2mm 3mm}
.poster .q b{display:block;color:var(--c);font-size:11pt;margin-bottom:1mm}.poster .q div{font-size:10.5pt;line-height:1.5}
.tally{display:grid;grid-template-columns:repeat(10,1fr);gap:2mm;margin-top:2mm}.tally i{display:block;border:1.5px solid var(--navy);height:10mm;border-radius:4px}
.slips{display:grid;grid-template-columns:1fr 1fr;gap:3mm}
.slip{border:1px dashed #8a97ab;border-radius:5px;padding:2mm 3.5mm;font-size:11pt;height:42mm;display:flex;flex-direction:column;justify-content:center}
.slip .nmz{display:flex;flex-wrap:wrap;gap:1.5mm 4mm}.slip .nmz span{padding:0 3px}.slip .nmz span.on{border:2.5px solid var(--rose);border-radius:50%;font-weight:700}
.slip .ox{font-size:40pt;text-align:center;font-weight:700;line-height:1.1}
.menu{border:2px solid var(--navy);border-radius:10px;padding:5mm 7mm;height:100%}
.menu h3{text-align:center;margin:0 0 4mm;font-size:22pt;color:var(--navy)}
.menu .it{display:flex;align-items:center;gap:5mm;border-bottom:1px dotted #9fb3c8;padding:2mm 0;font-size:14pt}
.menu .it .emo{font-size:26pt}.menu .it .pr{margin-left:auto;font-weight:700;color:var(--rose)}
.menu .dlg2{margin-top:5mm;background:var(--cream);border-radius:8px;padding:3mm 4mm;font-size:11.5pt;line-height:1.7}
.note{background:var(--cream);border-radius:8px;padding:3mm 4mm;font-size:10.5pt;line-height:1.65;margin-top:3mm;word-break:keep-all}
.tf .card{height:38mm;padding:3mm 5mm;align-items:flex-start;text-align:left}
.tf .card .w{font-size:15pt;line-height:1.3}
.tf .card .ans{position:absolute;right:3mm;bottom:2.5mm;font-size:9pt;font-weight:700;color:#8a97ab}
.ws .frame{border:1.5px solid var(--navy);border-radius:6px;background:#fff}
.ws .line{border-bottom:1.2px solid var(--navy);height:11mm}
svg text{font-family:"NKR","Noto Color Emoji",sans-serif}
.compact ol.st,.compact .dl,.compact .ex{font-size:9.3pt;line-height:1.38}.compact .ex{margin-bottom:.7mm}.compact ul.tp{font-size:9.2pt;line-height:1.38}.compact .meta div{font-size:9.2pt}.compact .ttl .en{font-size:21pt}.compact .exbox{padding:2mm 3mm}.compact .meta,.compact .aim,.compact .body,.compact .exbox,.compact .two{margin-bottom:3mm}
`;

// ───────────── 카드 데이터 ─────────────
const CARDS = [
  ['Animals','동물','teal',[['dog','개','🐶'],['cat','고양이','🐱'],['pig','돼지','🐷'],['cow','소','🐮'],['horse','말','🐴'],['tiger','호랑이','🐯'],['bear','곰','🐻'],['lion','사자','🦁'],['monkey','원숭이','🐵'],['rabbit','토끼','🐰'],['elephant','코끼리','🐘'],['duck','오리','🦆']]],
  ['Fruits','과일','rose',[['apple','사과','🍎'],['banana','바나나','🍌'],['orange','오렌지','🍊'],['grapes','포도','🍇'],['strawberry','딸기','🍓'],['watermelon','수박','🍉'],['pear','배','🍐'],['peach','복숭아','🍑']]],
  ['Food','음식','orange',[['hamburger','햄버거','🍔'],['pizza','피자','🍕'],['ice cream','아이스크림','🍦'],['cake','케이크','🎂'],['bread','빵','🍞'],['rice','밥','🍚'],['chicken','치킨','🍗'],['milk','우유','🥛']]],
  ['School things','학용품','blue',[['book','책','📘'],['pencil','연필','✏️'],['ruler','자','📏'],['bag','가방','🎒'],['scissors','가위','✂️'],['crayon','크레용','🖍️'],['notebook','공책','📓'],['pen','펜','🖊️']]],
  ['Clothes','옷','violet',[['shirt','셔츠','👕'],['pants','바지','👖'],['dress','원피스','👗'],['socks','양말','🧦'],['shoes','신발','👟'],['hat','모자','🧢']]],
  ['Family','가족','green',[['dad','아빠','👨'],['mom','엄마','👩'],['brother','형·오빠·남동생','👦'],['sister','누나·언니·여동생','👧'],['grandpa','할아버지','👴'],['grandma','할머니','👵']]],
  ['Jobs','직업','teal',[['doctor','의사','👨‍⚕️'],['teacher','선생님','👩‍🏫'],['cook','요리사','👨‍🍳'],['police officer','경찰관','👮'],['firefighter','소방관','👩‍🚒'],['farmer','농부','👨‍🌾'],['singer','가수','👩‍🎤'],['pilot','조종사','👨‍✈️']]],
  ['Weather','날씨','blue',[['sunny','맑은','☀️'],['cloudy','흐린','☁️'],['rainy','비 오는','🌧️'],['snowy','눈 오는','❄️'],['windy','바람 부는','🌬️'],['stormy','폭풍우','⛈️']]],
  ['Sports','운동','orange',[['soccer','축구','⚽'],['baseball','야구','⚾'],['basketball','농구','🏀'],['tennis','테니스','🎾'],['badminton','배드민턴','🏸'],['swimming','수영','🏊']]],
  ['Toys','장난감','rose',[['doll','인형','🧸'],['robot','로봇','🤖'],['car','자동차','🚗'],['ball','공','🏐'],['train','기차','🚂'],['plane','비행기','✈️']]],
  ['Colors','색깔','violet',[['red','빨강','#e03b3b'],['blue','파랑','#2f6fcb'],['yellow','노랑','#f2c21b'],['green','초록','#3f9a48'],['black','검정','#222'],['white','하양','#fff'],['orange','주황','#ef8a2a'],['purple','보라','#7a57c9']]],
  ['Actions','동작','green',[['singing','노래하기','🎤'],['dancing','춤추기','💃'],['cooking','요리하기','🍳'],['reading','책 읽기','📖'],['swimming','수영하기','🏊'],['sleeping','잠자기','😴'],['running','달리기','🏃'],['jumping','점프하기','🤸']]],
];
const CAT = Object.fromEntries(CARDS.map(([en, ko, color, items]) => [en, { en, ko, color, items }]));
const chunk = (a, n) => { const r = []; for (let i = 0; i < a.length; i += n) r.push(a.slice(i, i + n)); return r; };
const svgOpen = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}" style="display:block">`;
let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function clockSVG(hour, size, blank) {
  const r = size / 2, cx = r, cy = r; let s = `${svgOpen(size, size)}<circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="#fff" stroke="#1d3f7a" stroke-width="1.2"/>`;
  for (let i = 1; i <= 12; i++) { const a = (i / 12) * 2 * Math.PI; s += `<text x="${cx + Math.sin(a) * (r - 6)}" y="${cy - Math.cos(a) * (r - 6) + 1.6}" font-size="4.6" text-anchor="middle" fill="#1d3f7a" font-weight="700">${i}</text><line x1="${cx + Math.sin(a) * (r - 2.5)}" y1="${cy - Math.cos(a) * (r - 2.5)}" x2="${cx + Math.sin(a) * (r - 1.2)}" y2="${cy - Math.cos(a) * (r - 1.2)}" stroke="#1d3f7a" stroke-width=".8"/>`; }
  if (!blank) { const a = (hour / 12) * 2 * Math.PI; s += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.sin(a) * r * .5}" y2="${cy - Math.cos(a) * r * .5}" stroke="#c9507a" stroke-width="2" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r * .72}" stroke="#2f6fcb" stroke-width="1.4" stroke-linecap="round"/>`; }
  return s + `<circle cx="${cx}" cy="${cy}" r="1.3" fill="#1d3f7a"/></svg>`;
}
const card = (inner, cls) => `<div class="card ${cls || ''}">${inner}</div>`;
const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];

// ───────────── 머트리얼 생성기: spec → [{title, html, note}] ─────────────
const GEN = {
  cards(sp) {
    let items, title, color = 'blue', catName = '';
    if (sp.cat) { const c = CAT[sp.cat]; items = c.items; color = c.color; catName = c.en; title = sp.title || `그림 카드 · ${c.en} (${c.ko})`; }
    else { items = sp.items; title = sp.title || '그림 카드'; }
    const pages = chunk(items, 12);
    return pages.map((cs, i) => ({ title: pages.length > 1 ? `${title} ${i + 1}/${pages.length}` : title, note: sp.note || '✂ 점선을 따라 자르세요 · 두꺼운 종이에 인쇄하고 코팅하면 반복 사용',
      html: `<div class="cards c-${color}">${cs.map(([w, k, e]) => { const pic = sp.cat === 'Colors' ? `<div class="sw" style="background:${e}"></div>` : `<div class="emo">${e}</div>`; return `<div class="card">${catName ? `<span class="cat">${catName}</span>` : ''}${pic}<div class="w">${esc(w)}</div><div class="k">${esc(k)}</div></div>`; }).join('')}</div>` }));
  },
  nums(sp) {
    const list = []; for (let n = sp.from; n <= sp.to; n++) list.push(n);
    const pages = chunk(list, 12);
    return pages.map((ns, i) => ({ title: `숫자 카드 ${sp.from}~${sp.to}${pages.length > 1 ? ` (${i + 1}/${pages.length})` : ''}`, note: '✂ 점선을 따라 자르세요',
      html: `<div class="cards">${ns.map(n => card(`<div class="w">${n}</div><div class="k">${WORDS[n] || n}</div>`, 'num')).join('')}</div>` }));
  },
  clocks(kind) {
    const L = 'ABCDEFGHIJKL';
    if (kind === 'analog') return [{ title: '시계 카드 · 아날로그 (A~L)', note: '✂ 점선을 따라 자르세요', html: `<div class="cards">${Array.from({ length: 12 }, (_, i) => card(`<span class="tag">${L[i]}</span>${clockSVG(i + 1, 40)}<div class="k" style="margin-top:2mm">What time is it?</div>`)).join('')}</div>` }];
    if (kind === 'blank') return [{ title: '시계 카드 · 빈 시계 (바늘 그리기)', note: '코팅 후 보드마커로 바늘을 그리면 반복 사용', html: `<div class="cards">${Array.from({ length: 12 }, () => card(`${clockSVG(0, 40, true)}<div class="k" style="margin-top:2mm">It's ______ o'clock.</div>`)).join('')}</div>` }];
    return [{ title: '시각 문장 카드 (1~12)', note: '✂ 점선을 따라 자르세요', html: `<div class="cards">${WORDS.slice(1, 13).map((w, i) => card(`<span class="tag">${i + 1}</span><div class="w" style="font-size:15pt;line-height:1.3">It's ${w}<br>o'clock.</div><div class="k" style="font-size:22pt;color:var(--navy);font-weight:700;margin-top:3mm">${i + 1}:00</div>`)).join('')}</div>` }];
  },
  bingo(sp) {
    const size = sp.size || 3, per = size === 3 ? 4 : 2;
    if (sp.blank) { const b = Array.from({ length: per }, () => `<div class="b"><div class="ttl2">BINGO ${size}×${size}</div><div class="grid${size}">${'<i></i>'.repeat(size * size)}</div></div>`).join(''); return [{ title: `빈 빙고판 ${size}×${size}`, note: '숫자나 낱말을 칸에 자유롭게 써 넣게 하세요', html: `<div class="bingo" ${size === 4 ? 'style="grid-template-columns:1fr"' : ''}>${b}</div>` }]; }
    const boards = Array.from({ length: sp.boards || per }, (_, bi) => `<div class="b"><div class="ttl2">BINGO ${size}×${size} · ${String.fromCharCode(65 + bi)}</div><div class="grid${size}">${shuffle(sp.words).slice(0, size * size).map(w => `<i>${esc(w)}</i>`).join('')}</div></div>`);
    return chunk(boards, per).map((bs, i) => ({ title: `${sp.title || '빙고판'}${boards.length > per ? ` ${i + 1}` : ''}`, note: '학생마다 다른 판(A·B·C·D)을 나누어 주세요', html: `<div class="bingo" ${size === 4 ? 'style="grid-template-columns:1fr"' : ''}>${bs.join('')}</div>` }));
  },
  board(kind) { return [BOARDS[kind]()]; },
  dice(faces) { return [{ _dice: true, faces, title: faces ? `주사위 전개도 · ${faces.map(f => f[1]).join(', ')}` : '주사위 전개도 · 빈 칸' }]; },
  score(kind) {
    const team = `<div class="sheet-ttl">팀 점수표 Team Score</div><table class="sheet"><tr><th style="width:30mm">Team</th>${Array.from({ length: 10 }, (_, i) => `<th>${i + 1}</th>`).join('')}<th style="width:16mm">Total</th></tr>${['A', 'B', 'C', 'D'].map(t => `<tr><td class="nm">Team ${t}</td>${'<td></td>'.repeat(11)}</tr>`).join('')}</table>`;
    const pair = `<div class="sheet-ttl">짝 점수표 Pair Score</div><div style="display:flex;gap:5mm">${[0, 1].map(() => `<table class="sheet"><tr><th>Name</th><th>1회</th><th>2회</th><th>3회</th><th>합계</th></tr>${'<tr><td class="nm"></td><td></td><td></td><td></td><td></td></tr>'.repeat(2)}</table>`).join('')}</div>`;
    const indiv = `<div class="sheet-ttl">개인 점수표 Score Sheet</div><table class="sheet"><tr><th style="width:30mm">Name</th><th>1회</th><th>2회</th><th>3회</th><th>4회</th><th>5회</th><th>합계</th><th style="width:20mm">순위</th></tr>${'<tr><td class="nm"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'.repeat(6)}</table>`;
    const html = kind === 'team' ? team + team : kind === 'pair' ? pair + pair + pair : indiv + indiv;
    return [{ title: `점수표 (${kind === 'team' ? '팀' : kind === 'pair' ? '짝' : '개인'})`, note: '코팅해 보드마커로 쓰면 반복 사용', html }];
  },
  signs(list) { const [a, b] = list; return [{ title: `표지판 · ${a[0]} / ${b[0]}`, note: '반으로 잘라 벽에 붙이거나 막대에 붙여 들기', html: `<div style="display:flex;flex-direction:column;gap:4mm;height:100%"><div class="sign"><div class="big" style="color:${a[1]}">${esc(a[0])}</div><div class="sm">${esc(a[2])}</div></div><div class="sign"><div class="big" style="color:${b[1]}">${esc(b[0])}</div><div class="sm">${esc(b[2])}</div></div></div>` }]; },
  scene(kind) { return [SCENES[kind]()]; },
  labels(list) { return [{ title: '분류 라벨', note: '봉투·주머니·바구니 앞에 붙이기', html: `<div class="labels">${list.map(([e, w, k]) => `<div class="lb"><span class="emo">${e}</span><span class="w">${esc(w)}</span><span class="k">${esc(k)}</span></div>`).join('')}</div>` }]; },
  slips(kind) {
    if (kind === 'names') { const KO = ['민호', '민수', '민혁', '민지', '민영'], EN = ['Mike', 'Mary', 'Susan', 'Johnny', 'Jennifer']; const all = [...KO, ...EN];
      return [{ title: '이름 쪽지 10장 (한국 이름 5 · 외국 이름 5)', note: '✂ 잘라서 접은 뒤 책상 위에 흩어 놓기 · ○표 이름이 자기 이름', html: `<div class="slips">${all.map(n => `<div class="slip"><div class="nmz">${all.map(x => `<span class="${x === n ? 'on' : ''}">${x}</span>`).join('')}</div><div style="font-size:9.5pt;color:#5a6b85;margin-top:2mm">"I'm ${n}. What's your name?"</div></div>`).join('')}</div>` }]; }
    return [{ title: '○× 쪽지 10장 (○ 1장 + × 9장)', note: '✂ 잘라서 접은 뒤 던져 각자 1장씩 집기', html: `<div class="slips">${[`<div class="slip" style="border-color:#c9507a"><div class="ox" style="color:#c9507a">○</div><div style="font-size:10pt;text-align:center">Today's my birthday! &nbsp; I'm <b>____</b> years old.</div></div>`, ...Array(9).fill(`<div class="slip"><div class="ox" style="color:#9fb3c8">×</div><div style="font-size:10pt;text-align:center;color:#5a6b85">Happy birthday! How old are you?</div></div>`)].join('')}</div>` }];
  },
  mask() { return [{ title: '가면 도안', note: '두꺼운 종이에 인쇄 · 눈 오려내기 · 뒤에 막대 붙이기 또는 구멍에 고무줄', html: svgOpen(182, 215) + `<ellipse cx="91" cy="105" rx="68" ry="85" fill="#fff8e8" stroke="#1d3f7a" stroke-width="1.4"/><ellipse cx="64" cy="88" rx="13" ry="8" fill="#fff" stroke="#1d3f7a" stroke-width="1" stroke-dasharray="2.5 1.5"/><ellipse cx="118" cy="88" rx="13" ry="8" fill="#fff" stroke="#1d3f7a" stroke-width="1" stroke-dasharray="2.5 1.5"/><text x="64" y="90" font-size="4" text-anchor="middle" fill="#8a97ab">eye · 오려내기</text><text x="118" y="90" font-size="4" text-anchor="middle" fill="#8a97ab">eye · 오려내기</text><path d="M91,100 l-7,22 l14,0 z" fill="none" stroke="#9fb3c8" stroke-width=".9" stroke-dasharray="2 2"/><text x="91" y="130" font-size="4" text-anchor="middle" fill="#8a97ab">nose</text><path d="M68,150 q23,22 46,0" fill="none" stroke="#9fb3c8" stroke-width=".9" stroke-dasharray="2 2"/><text x="91" y="166" font-size="4" text-anchor="middle" fill="#8a97ab">mouth</text><circle cx="26" cy="105" r="2.2" fill="none" stroke="#1d3f7a" stroke-width=".8"/><circle cx="156" cy="105" r="2.2" fill="none" stroke="#1d3f7a" stroke-width=".8"/><text x="26" y="114" font-size="3.6" text-anchor="middle" fill="#8a97ab">고무줄 구멍</text><text x="156" y="114" font-size="3.6" text-anchor="middle" fill="#8a97ab">고무줄 구멍</text></svg>` }]; },
  poster20q() { const Q = [['색 Color', 'Is it red? / blue? / yellow? / green? / black? / white?', 'teal'], ['크기·모양 Size · Shape', 'Is it big? / small? / long? / short? / round? / Is it like a stick?', 'blue'], ['재료 Material', 'Is it made of plastic? / wood? / paper? / cloth? / metal? / glass?', 'violet'], ['장소 Place', 'Is it in the house? / in the kitchen? / at school? / in the pool?', 'orange'], ['쓰임 Use', 'Can you eat it? / wear it? / play with it? / Is it made in a factory?', 'green'], ['마지막 Final Guess', 'Is it a(n) ______?', 'rose']];
    return [{ title: '질문 힌트 포스터 · Twenty Questions', note: '칠판에 붙여 두고 학생이 질문 틀을 고르게 하기', html: `<div class="poster"><h3>What's in the box? 🎁 — 스무 번 안에 맞혀라!</h3><div style="text-align:center;color:#3a4a66;font-size:10.5pt;margin-bottom:3mm">대답은 <b>Yes</b> / <b>No</b> 로만!</div>${chunk(Q, 2).map(p => `<div class="row">${p.map(([t, q, c]) => `<div class="q c-${c}"><b>${esc(t)}</b><div>${esc(q)}</div></div>`).join('')}</div>`).join('')}<div class="sheet-ttl">질문 횟수 세기 (한 번 물을 때마다 ✓)</div><div class="tally">${'<i></i>'.repeat(20)}</div></div>` }]; },
  faces() { return [{ title: "I like / I don't like 얼굴판", note: '반으로 잘라 책상에 놓고, 음식 카드를 아래에 놓기', html: `<div style="display:flex;flex-direction:column;gap:4mm;height:100%"><div class="sign" style="border-color:#3f9a48"><div class="emo" style="font-size:120pt">😋</div><div class="sm" style="font-size:24pt;font-weight:700;color:#3f9a48">I like ______.</div><div class="sm">A · 좋아요</div></div><div class="sign" style="border-color:#c9507a"><div class="emo" style="font-size:120pt">😖</div><div class="sm" style="font-size:24pt;font-weight:700;color:#c9507a">I don't like ______.</div><div class="sm">B · 싫어요</div></div></div>` }]; },
  menu() { const items = [['🍔', 'Hamburger', '햄버거', '3,000원'], ['🍕', 'Pizza', '피자', '4,000원'], ['🍗', 'Chicken', '치킨', '5,000원'], ['🍚', 'Rice', '밥', '2,000원'], ['🍞', 'Bread', '빵', '1,500원'], ['🍦', 'Ice cream', '아이스크림', '1,000원'], ['🎂', 'Cake', '케이크', '3,500원'], ['🥛', 'Milk', '우유', '1,000원'], ['🍎', 'Apple juice', '사과주스', '1,500원']];
    return [{ title: '식당 메뉴판', note: '그룹당 1장 · 음식 카드와 함께 사용', html: `<div class="menu"><h3>🍽️ Let's Eat! Restaurant — MENU</h3>${items.map(([e, w, k, p]) => `<div class="it"><span class="emo">${e}</span><span>${w} <span style="font-size:10.5pt;color:#5a6b85">${k}</span></span><span class="pr">${p}</span></div>`).join('')}<div class="dlg2"><b>손님:</b> Pizza, please. → <b>주인:</b> Here you are. → <b>손님:</b> Thank you. → <b>주인:</b> You're welcome.<br><span style="color:#5a6b85">확장: "How much is it?" — "It's four thousand won."</span></div></div>` }]; },
  preps() { const box = fn => svgOpen(60, 56) + `<rect x="14" y="18" width="32" height="22" fill="#f1d9a7" stroke="#7a5a2a" stroke-width=".9"/><path d="M14,18 l5,-6 l32,0 l-5,6" fill="#e6c98c" stroke="#7a5a2a" stroke-width=".9"/>` + fn() + '</svg>'; const ball = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#c9507a" stroke="#8a2a4a" stroke-width=".8"/>`;
    const PR = [['on', '위에', () => ball(30, 7)], ['in', '안에', () => ball(30, 29)], ['under', '아래에', () => ball(30, 47)], ['behind', '뒤에', () => `${ball(50, 7)}<path d="M14,18 l5,-6 l32,0 l-5,6" fill="#e6c98c" stroke="#7a5a2a" stroke-width=".9"/>`], ['next to', '옆에', () => ball(53, 35)], ['in front of', '앞에', () => ball(22, 46)]];
    return [{ title: '위치 전치사 카드', note: '게임 전에 먼저 익히기 · 칠판에 붙여 두기', html: `<div class="cards2">${PR.map(([w, k, fn]) => `<div class="card" style="height:78mm">${box(fn)}<div class="w" style="font-size:20pt;margin-top:2mm">${w}</div><div class="k" style="font-size:11pt">${k} · The ball is <b>${w}</b> the box.</div></div>`).join('')}</div>` }]; },
  days() { const D = [['Monday', '월요일', '🌙'], ['Tuesday', '화요일', '🔥'], ['Wednesday', '수요일', '💧'], ['Thursday', '목요일', '🌳'], ['Friday', '금요일', '⭐'], ['Saturday', '토요일', '🏔️'], ['Sunday', '일요일', '☀️'], ['Today is ______.', '오늘은 … 요일', '📅']];
    return [{ title: '요일 카드', note: '칠판에 가로로 붙여 달력처럼 사용', html: `<div class="cards2">${D.map(([w, k, e]) => `<div class="card"><div class="emo" style="font-size:40pt">${e}</div><div class="w" style="font-size:22pt">${w}</div><div class="k" style="font-size:11pt">${k}</div></div>`).join('')}</div>` }]; },
  apples() { return [{ title: '사과 개수 카드 1~10', note: '✂ 잘라서 접은 뒤 한 장씩 뽑기', html: `<div class="cards2">${Array.from({ length: 10 }, (_, i) => `<div class="card" style="height:46mm"><div class="emo" style="font-size:${i < 5 ? 26 : 20}pt;letter-spacing:1px;line-height:1.15;max-width:80mm">${'🍎'.repeat(i + 1)}</div><div class="k" style="font-size:12pt;margin-top:2mm">How many? &nbsp;<b style="color:var(--navy)">${WORDS[i + 1]}</b></div></div>`).join('')}</div>` }]; },
  cue(sp) { const pages = chunk(sp.lines, 8); return pages.map((ls, i) => ({ title: `${sp.title}${pages.length > 1 ? ` (${i + 1}/${pages.length})` : ''}`, note: sp.note || '✂ 잘라서 교사·리더가 뽑아 읽기 · 큰 글씨로 멀리서도 보임', html: `<div class="cards2 cue">${ls.map(([en, ko, e]) => `<div class="card">${e ? `<div class="emo">${e}</div>` : ''}<div class="w">${esc(en)}</div><div class="k">${esc(ko)}</div></div>`).join('')}</div>` })); },
  dialog(sp) { return [{ title: sp.title, note: '✂ 가로로 잘라 대화 순서대로 늘어놓기 · 역할을 바꾸어 두 번 연습', html: `<div class="dlg">${sp.lines.map(([who, en, ko]) => `<div class="row"><div class="who">${esc(who)}</div><div><div class="en">${esc(en)}</div><div class="ko">${esc(ko)}</div></div></div>`).join('')}</div>` }]; },
  roles(list) { const h = list.length <= 2 ? 118 : list.length <= 4 ? 88 : 58; return [{ title: '역할 · 이름 카드', note: '✂ 잘라서 위 구멍에 끈을 끼워 목걸이로 · 또는 책상 앞에 세우기', html: `<div class="cards2 role">${list.map(([e, n, k]) => `<div class="card" style="height:${h}mm"><div class="emo">${e}</div><div class="w">${esc(n)}</div><div class="k">${esc(k)}</div></div>`).join('')}</div>` }]; },
  puzzle(sp) { const W = 182, H = 182; let s = svgOpen(W, H) + `<rect x="0" y="0" width="${W}" height="${H}" fill="#fbfcfe" stroke="#1d3f7a" stroke-width="1.2"/><text x="${W / 2}" y="${H / 2 + 52}" font-size="150" text-anchor="middle">${sp.emoji}</text>`;
    for (let i = 1; i < 3; i++) s += `<line x1="${W / 3 * i}" y1="0" x2="${W / 3 * i}" y2="${H}" stroke="#c9507a" stroke-width=".9" stroke-dasharray="3 2"/>`; s += `<line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="#c9507a" stroke-width=".9" stroke-dasharray="3 2"/>`;
    [[1, 1], [2, 1], [3, 1], [4, 2], [5, 2], [6, 2]].forEach(([n, r], i) => s += `<text x="${(i % 3) * W / 3 + 4}" y="${(r - 1) * H / 2 + 7}" font-size="5" fill="#9fb3c8" font-weight="700">${n}</text>`);
    s += '</svg>';
    return [{ title: `조각 그림 · ${sp.word} (${sp.ko})`, note: '✂ 분홍 점선을 따라 6조각으로 자르기 · 한 조각씩 칠판에 붙이며 "What\'s this?"', html: s + `<div class="note">정답: <b>It's a ${esc(sp.word)}.</b> (${esc(sp.ko)}) &nbsp;·&nbsp; 1~2조각에 맞히면 2점, 3조각 이후 1점. 조각 번호 순서를 바꾸어 붙이면 난이도가 달라집니다.</div>` }]; },
  truefalse(sp) { return [{ title: sp.title, note: '교사용 · 오른쪽 아래 ✔/✖가 정답', html: `<div class="cards2 tf">${sp.lines.map(([en, ok]) => `<div class="card"><div class="w">${esc(en)}</div><span class="ans">${ok ? '✔ YES / O' : '✖ NO / X'}</span></div>`).join('')}</div>` }]; },
  sounds(list) { return [{ title: '동물 소리 카드 (영어 의성어)', note: '✂ 잘라서 뽑기 · 소리를 내면 "What am I?" → "You are a ~."', html: `<div class="cards2">${list.map(([e, a, s]) => `<div class="card"><div class="emo" style="font-size:46pt">${e}</div><div class="w" style="font-size:20pt;color:var(--rose)">${esc(s)}</div><div class="k" style="font-size:12pt">You are a <b>${esc(a)}</b>.</div></div>`).join('')}</div>` }]; },
  peek() { const one = svgOpen(182, 118) + `<rect x="1" y="1" width="180" height="116" rx="4" fill="#fde9c4" stroke="#1d3f7a" stroke-width="1.2"/><circle cx="91" cy="59" r="12" fill="#fff" stroke="#c9507a" stroke-width="1.2" stroke-dasharray="3 2"/><text x="91" y="61" font-size="4" text-anchor="middle" fill="#c9507a">오려내기</text><text x="91" y="20" font-size="9" text-anchor="middle" font-weight="700" fill="#1d3f7a">What's it? 🔍</text><text x="91" y="104" font-size="5" text-anchor="middle" fill="#5a6b85">덮개 뒤에 그림카드를 끼우고 구멍으로만 보여 주세요</text></svg>`;
    return [{ title: '구멍 덮개 카드 (2장)', note: '두꺼운 색지에 인쇄 · 가운데 원을 오려내기 · 그림카드 위에 겹쳐 조금씩 움직이기', html: `<div style="display:flex;flex-direction:column;gap:6mm">${one}${one}</div>` }]; },
  house() { const W = 182, H = 128; let s = svgOpen(W, H) + `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="#fff" stroke="#1d3f7a" stroke-width="1.4"/>`;
    const rooms = [[1, 1, 70, 62, 'living room', '거실', '🛋️📺'], [71, 1, 60, 62, 'kitchen', '부엌', '🍳🧊'], [131, 1, 50, 62, 'bathroom', '욕실', '🛁🚽'], [1, 63, 60, 64, 'bedroom', '침실', '🛏️🧸'], [61, 63, 70, 64, 'dining room', '식당', '🍽️🪑'], [131, 63, 50, 64, "kids' room", '아이 방', '📚🖥️']];
    rooms.forEach(([x, y, w, h, en, ko, e]) => s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fbfcfe" stroke="#1d3f7a" stroke-width="1"/><text x="${x + w / 2}" y="${y + h / 2 + 2}" font-size="12" text-anchor="middle">${e}</text><text x="${x + w / 2}" y="${y + h - 10}" font-size="5.5" text-anchor="middle" font-weight="700" fill="#1d3f7a">${en}</text><text x="${x + w / 2}" y="${y + h - 4}" font-size="4" text-anchor="middle" fill="#5a6b85">${ko}</text>`);
    s += '</svg>';
    const cards = rooms.map(([, , , , en, ko, e]) => `<div class="card" style="height:40mm"><div class="emo" style="font-size:26pt">${e}</div><div class="w" style="font-size:14pt">the ${en}</div><div class="k">${ko}</div></div>`).join('');
    return [{ title: '집 평면도 + 방 이름 카드', note: '평면도 각 방을 포스트잇으로 가린 뒤 하나씩 열며 "What\'s this?" → "It\'s the kitchen."', html: s + `<div class="cards2" style="grid-template-columns:repeat(3,1fr);margin-top:4mm">${cards}</div>` }]; },
  faceposter() { const s = svgOpen(182, 170) + `<ellipse cx="91" cy="88" rx="52" ry="62" fill="#fff8e8" stroke="#1d3f7a" stroke-width="1.4"/><path d="M39,70 q52,-60 104,0" fill="#5c4511" opacity=".85"/><ellipse cx="38" cy="90" rx="7" ry="11" fill="#fff8e8" stroke="#1d3f7a" stroke-width="1.2"/><ellipse cx="144" cy="90" rx="7" ry="11" fill="#fff8e8" stroke="#1d3f7a" stroke-width="1.2"/><ellipse cx="72" cy="85" rx="8" ry="5" fill="#fff" stroke="#1d3f7a" stroke-width="1.2"/><ellipse cx="110" cy="85" rx="8" ry="5" fill="#fff" stroke="#1d3f7a" stroke-width="1.2"/><circle cx="72" cy="85" r="2.5" fill="#1d3f7a"/><circle cx="110" cy="85" r="2.5" fill="#1d3f7a"/><path d="M91,95 l-5,16 l10,0 z" fill="none" stroke="#1d3f7a" stroke-width="1.2"/><path d="M74,126 q17,14 34,0" fill="none" stroke="#c9507a" stroke-width="2" stroke-linecap="round"/>`
      + [[72, 85, 'eyes', '눈', 20, 40], [38, 90, 'ear', '귀', 10, 125], [91, 105, 'nose', '코', 140, 118], [91, 128, 'mouth', '입', 150, 150], [91, 45, 'hair', '머리카락', 150, 30], [60, 110, 'cheek', '볼', 10, 155], [91, 148, 'chin', '턱', 60, 166]].map(([x, y, en, ko, lx, ly]) => `<line x1="${x}" y1="${y}" x2="${lx + 8}" y2="${ly - 2}" stroke="#9fb3c8" stroke-width=".7"/><text x="${lx}" y="${ly}" font-size="7" font-weight="700" fill="#1d3f7a">${en} <tspan font-size="4.5" fill="#5a6b85" font-weight="400">${ko}</tspan></text>`).join('') + '</svg>';
    return [{ title: '얼굴 부위 포스터', note: '칠판에 붙여 두고 리더가 가리키며 말하기', html: s + `<div class="note">Nose, nose, nose… <b>ears!</b> &nbsp;·&nbsp; Touch your <b>nose</b>. &nbsp;·&nbsp; Draw two <b>eyes</b>. &nbsp;·&nbsp; Erase the <b>mouth</b>.</div>` }]; },
  worksheet(kind) { return [WS[kind]()]; },
};

// ───────────── 게임판 ─────────────
const BOARDS = {
  snakes() { const W = 182, cols = 5, rows = 6, cw = W / cols, chh = 40, H = rows * chh;
    const tasks = { 2: 'Say 3 animals', 3: 'Count 1 to 10', 5: "What's your\nname?", 6: 'Touch your\nnose', 8: 'Say 3 fruits', 10: 'How old are\nyou?', 13: 'Jump 3 times', 22: 'What time\nis it?', 29: 'Say 3 colors' };
    const pos = n => { const r = Math.floor((n - 1) / cols), c0 = (n - 1) % cols, c = r % 2 === 0 ? c0 : cols - 1 - c0; return { x: c * cw, y: H - (r + 1) * chh, cx: c * cw + cw / 2, cy: H - (r + 1) * chh + chh / 2 }; };
    let s = svgOpen(W, H);
    for (let n = 1; n <= 30; n++) { const p = pos(n); const fill = n === 1 ? '#e7f4e8' : n === 30 ? '#fbe7ee' : tasks[n] ? '#fff8e8' : (n % 2 ? '#fff' : '#f3f6fb'); s += `<rect x="${p.x}" y="${p.y}" width="${cw}" height="${chh}" fill="${fill}" stroke="#1d3f7a" stroke-width=".9"/><text x="${p.x + 2.5}" y="${p.y + 6}" font-size="5.5" font-weight="700" fill="#1d3f7a">${n}</text>`;
      const t = n === 1 ? 'START' : n === 30 ? 'FINISH' : tasks[n]; if (t) t.split('\n').forEach((l, i, a) => s += `<text x="${p.cx}" y="${p.cy + 6 + (i - (a.length - 1) / 2) * 6}" font-size="4.6" text-anchor="middle" fill="#2b2f3a" font-weight="700">${esc(l)}</text>`); if (n === 1) s += `<text x="${p.cx}" y="${p.cy - 4}" font-size="9" text-anchor="middle">🏁</text>`; if (n === 30) s += `<text x="${p.cx}" y="${p.cy - 4}" font-size="9" text-anchor="middle">🏆</text>`; }
    const ladder = (a, b) => { const A = pos(a), B = pos(b), x = A.cx, w = 5; let r = `<line x1="${x - w}" y1="${A.cy + 8}" x2="${x - w}" y2="${B.cy - 6}" stroke="#e07b2a" stroke-width="1.8"/><line x1="${x + w}" y1="${A.cy + 8}" x2="${x + w}" y2="${B.cy - 6}" stroke="#e07b2a" stroke-width="1.8"/>`; for (let y = A.cy + 4; y > B.cy - 4; y -= 7) r += `<line x1="${x - w}" y1="${y}" x2="${x + w}" y2="${y}" stroke="#e07b2a" stroke-width="1.4"/>`; return r + `<text x="${x + w + 2}" y="${A.cy + 10}" font-size="4" fill="#e07b2a" font-weight="700">▲ ${b}</text>`; };
    const snake = (a, b) => { const A = pos(a), B = pos(b), x = A.cx; return `<path d="M${x},${A.cy + 6} C${x + 12},${A.cy + 22} ${x - 12},${B.cy - 22} ${x},${B.cy - 4}" fill="none" stroke="#3f9a48" stroke-width="3.4" stroke-linecap="round" opacity=".9"/><circle cx="${x}" cy="${A.cy + 6}" r="3.4" fill="#3f9a48"/><circle cx="${x + 1.2}" cy="${A.cy + 5}" r=".8" fill="#fff"/><text x="${x + 5}" y="${B.cy - 6}" font-size="4" fill="#3f9a48" font-weight="700">▼ ${b}</text>`; };
    s += ladder(4, 14) + ladder(9, 19) + ladder(18, 28) + snake(26, 15) + snake(21, 11) + snake(27, 17) + '</svg>';
    return { title: 'Snakes and Ladders 게임판', note: '주사위 1개 · 말(지우개·단추) · 과제 칸은 포스트잇으로 교체 가능', html: s + `<div style="font-size:9pt;margin-top:2.5mm;color:#3a4a66;line-height:1.5"><b style="color:#e07b2a">▲ 사다리</b> 4→14 · 9→19 · 18→28 (올라가기) &nbsp; <b style="color:#3f9a48">▼ 뱀</b> 26→15 · 21→11 · 27→17 (내려가기) &nbsp; 노란 칸 = 과제 칸 (영어로 말해야 머물 수 있음)</div>` }; },
  timegrid() { const slots = [['7:00', '🛏️', 'get up'], ['8:00', '🍳', 'breakfast'], ['8:00', '🏫', 'go to school'], ['9:00', '📖', 'study'], ['10:00', '🎨', 'art class'], ['11:00', '🎵', 'music class'], ['12:00', '🍱', 'lunch'], ['1:00', '⚽', 'play soccer'], ['2:00', '📚', 'read a book'], ['3:00', '🏠', 'go home'], ['4:00', '🍪', 'snack time'], ['5:00', '🎮', 'play games'], ['6:00', '🍽️', 'dinner'], ['7:00', '📺', 'watch TV'], ['8:00', '🛁', 'take a bath'], ['9:00', '📓', 'homework'], ['10:00', '😴', 'go to bed'], ['11:00', '🌙', 'sleep']];
    const cell = (t, e, a, bg) => `<div style="border:1.5px solid #1d3f7a;height:58mm;display:flex;flex-direction:column;align-items:center;justify-content:center;background:${bg || '#fff'}"><div style="font-size:19pt;font-weight:700;color:#1d3f7a">${t}</div><div class="emo" style="font-size:30pt;margin:1.5mm 0">${e}</div><div style="font-size:10pt;color:#3a4a66">${a}</div></div>`;
    return { title: 'Time Grid 게임판', note: '주사위 1개 · 말 4개 · 왼쪽→오른쪽, 다음 줄은 다시 왼쪽부터', html: `<div style="display:grid;grid-template-columns:repeat(5,1fr)">${[cell('START', '🏁', '주사위를 던지세요', '#e7f4e8'), ...slots.map(([t, e, a]) => cell(t, e, a)), cell('FINISH', '🏆', 'Good job!', '#fbe7ee')].join('')}</div><div class="note">말이 멈춘 칸: 나머지 학생 "What time is it?" → 던진 학생 "It's seven o'clock. I get up." · 3학년은 시각만 말해도 인정</div>` }; },
  twenty() { return { title: 'Twenty Boxes 게임판', note: '"Number 7, a cat." 듣고 해당 칸에 그리기 · 짝과 비교', html: `<div style="display:grid;grid-template-columns:repeat(4,1fr)">${Array.from({ length: 20 }, (_, i) => `<div style="border:1.5px solid #1d3f7a;height:49mm;position:relative"><span style="position:absolute;top:1.5mm;left:2mm;font-weight:700;color:#1d3f7a;font-size:11pt">${i + 1}</span></div>`).join('')}</div>` }; },
  islands() { const W = 182, H = 200, cols = ['A', 'B', 'C'], cw = (W - 14) / 3, ch = (H - 14 - 22) / 3; let s = svgOpen(W, H) + `<rect x="0" y="0" width="${W}" height="${H}" fill="#dceefb" stroke="#1d3f7a" stroke-width="1"/>`;
    cols.forEach((c, i) => s += `<text x="${14 + i * cw + cw / 2}" y="9" font-size="7" text-anchor="middle" font-weight="700" fill="#1d3f7a">${c}</text>`);
    for (let r = 0; r < 3; r++) { s += `<text x="7" y="${14 + r * ch + ch / 2 + 2.5}" font-size="7" text-anchor="middle" font-weight="700" fill="#1d3f7a">${r + 1}</text>`; for (let i = 0; i < 3; i++) { const x = 14 + i * cw, y = 14 + r * ch, ex = x + cw / 2, ey = y + ch / 2; s += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="none" stroke="#9fb3c8" stroke-width=".6" stroke-dasharray="2 2"/><ellipse cx="${ex}" cy="${ey + 2}" rx="${cw * .38}" ry="${ch * .33}" fill="#f6e7b4" stroke="#b5945a" stroke-width=".9"/><ellipse cx="${ex}" cy="${ey + 2}" rx="${cw * .3}" ry="${ch * .25}" fill="#cfe8b8"/><text x="${ex}" y="${y + ch - 5}" font-size="5.5" text-anchor="middle" font-weight="700" fill="#1d3f7a">${cols[i]}${r + 1}</text>`; } }
    s += `<text x="14" y="${H - 8}" font-size="5" fill="#1d3f7a" font-weight="700">🌊 Island Map</text><text x="60" y="${H - 8}" font-size="4.2" fill="#3a4a66">Name: ______________</text><g transform="translate(${W - 16},${H - 11})"><circle r="9" fill="#fff" stroke="#1d3f7a" stroke-width=".8"/><text y="-4.5" font-size="4" text-anchor="middle" font-weight="700" fill="#c9507a">N</text><text y="8" font-size="4" text-anchor="middle" font-weight="700">S</text><text x="-6" y="1.5" font-size="4" text-anchor="middle" font-weight="700">W</text><text x="6" y="1.5" font-size="4" text-anchor="middle" font-weight="700">E</text><path d="M0,-3 l1.5,3 l-1.5,3 l-1.5,-3 z" fill="#1d3f7a"/></g></svg>`;
    return { title: '섬 지도 게임판', note: '짝에게 지도를 보여 주지 않고 말로만 전달', html: s + `<div class="note">① 섬 3곳에 그림을 그리세요. ② 짝에게 말하세요: <b>"A cat is on island B2."</b> ③ 짝이 말한 그림을 그 섬에 그리세요. ④ 다 끝나면 지도를 비교하세요. <span style="color:#5a6b85">고학년: north / south / east / west 로 말하기</span></div>` }; },
  coin() { const W = 182, cols = 6, rows = 4, cw = W / cols, chh = 46, H = rows * chh, N = 24;
    const special = { 5: ['🐕', 'Go back 1', '뒤로 1칸'], 9: ['🚌', 'Go ahead 2', '앞으로 2칸'], 12: ['🌧️', 'Go back to\nthe start', '처음으로'], 15: ['🍦', 'Go ahead 5', '앞으로 5칸'], 18: ['⏰', 'Go back 3', '뒤로 3칸'], 21: ['🚦', 'Stop 1 turn', '한 번 쉬기'] };
    const pos = n => { const r = Math.floor((n - 1) / cols), c0 = (n - 1) % cols, c = r % 2 === 0 ? c0 : cols - 1 - c0; return { x: c * cw, y: r * chh }; };
    let s = svgOpen(W, H);
    for (let n = 1; n <= N; n++) { const p = pos(n), sp = special[n]; s += `<rect x="${p.x}" y="${p.y}" width="${cw}" height="${chh}" fill="${n === 1 ? '#e7f4e8' : n === N ? '#fbe7ee' : sp ? '#fdeee0' : '#fff'}" stroke="#1d3f7a" stroke-width=".9"/><text x="${p.x + 2.5}" y="${p.y + 6}" font-size="5.5" font-weight="700" fill="#1d3f7a">${n}</text>`;
      if (n === 1) s += `<text x="${p.x + cw / 2}" y="${p.y + 24}" font-size="12" text-anchor="middle">🏠</text><text x="${p.x + cw / 2}" y="${p.y + 34}" font-size="5.5" text-anchor="middle" font-weight="700">HOME</text><text x="${p.x + cw / 2}" y="${p.y + 40}" font-size="4.2" text-anchor="middle" fill="#3a4a66">Start · 출발</text>`;
      else if (n === N) s += `<text x="${p.x + cw / 2}" y="${p.y + 24}" font-size="12" text-anchor="middle">🏫</text><text x="${p.x + cw / 2}" y="${p.y + 34}" font-size="5.5" text-anchor="middle" font-weight="700">SCHOOL</text><text x="${p.x + cw / 2}" y="${p.y + 40}" font-size="4.2" text-anchor="middle" fill="#3a4a66">Finish · 도착</text>`;
      else if (sp) { s += `<text x="${p.x + cw / 2}" y="${p.y + 21}" font-size="10" text-anchor="middle">${sp[0]}</text>`; sp[1].split('\n').forEach((l, i) => s += `<text x="${p.x + cw / 2}" y="${p.y + 30 + i * 5}" font-size="4.4" text-anchor="middle" font-weight="700" fill="#b5531a">${esc(l)}</text>`); s += `<text x="${p.x + cw / 2}" y="${p.y + 42}" font-size="3.8" text-anchor="middle" fill="#5a6b85">${sp[2]}</text>`; }
      if (n < N) { const q = pos(n + 1), ax = (p.x + q.x) / 2 + cw / 2, ay = (p.y + q.y) / 2 + chh / 2; s += `<path d="${q.y > p.y ? `M${ax - 2.2},${ay - 1.5} l4.4,0 l-2.2,3 z` : q.x > p.x ? `M${ax - 1.5},${ay - 2.2} l3,2.2 l-3,2.2 z` : `M${ax + 1.5},${ay - 2.2} l-3,2.2 l3,2.2 z`}" fill="#9fb3c8"/>`; } }
    s += '</svg>';
    return { title: '동전 던지기 놀이판 · 집에서 학교까지', note: '동전 1개 · 말(지우개·단추) · 2~4명', html: s + `<div style="display:flex;gap:4mm;margin-top:4mm;font-size:11pt"><div style="flex:1;background:var(--cream);border-radius:8px;padding:3mm 4mm;line-height:1.7"><b>🪙 Head (앞면)</b> → 2칸<br><b>🪙 Tail (뒷면)</b> → 1칸<br>그림 칸에 멈추면 지시대로 이동</div><div style="flex:1;background:var(--cl);border-radius:8px;padding:3mm 4mm;line-height:1.7">말을 옮길 때마다 말하기:<br>"Head! Two steps." / "Tail! One step."<br>학교에 먼저 도착한 사람이 승리 🏆</div></div>` }; },
  ttt() { return { title: '삼목(三目) 보드 3×3', note: '코팅해 보드마커로 사용하면 반복 가능', html: `<div style="display:grid;grid-template-columns:repeat(3,1fr);width:150mm;margin:4mm auto 0">${Array.from({ length: 9 }, (_, i) => `<div style="border:2px solid #1d3f7a;height:50mm;position:relative"><span style="position:absolute;top:2mm;left:3mm;font-size:16pt;font-weight:700;color:#9fb3c8">${i + 1}</span></div>`).join('')}</div><div class="note" style="width:150mm;margin:5mm auto 0">질문에 바르게 답한 팀이 칸 번호를 고르고 ○ 또는 ×(또는 팀 상징)를 그립니다. 가로·세로·대각선 3개를 먼저 만든 팀이 승리.</div>` }; },
  numboard() { const nums = [[11, 8, 8], [18, 20, 6], [8, 62, 6], [3, 72, 6], [15, 30, 18], [13, 48, 18], [17, 84, 18], [16, 6, 30], [1, 20, 30], [12, 30, 30], [9, 12, 42], [7, 42, 42], [14, 68, 42], [20, 22, 54], [2, 88, 54], [4, 46, 66], [10, 90, 66], [5, 10, 78], [19, 32, 78], [6, 70, 88]];
    let s = svgOpen(182, 170) + `<rect x="0" y="0" width="182" height="170" fill="#fff" stroke="#1d3f7a" stroke-width="1"/>`; nums.forEach(([n, x, y]) => s += `<text x="${x * 1.82}" y="${y * 1.75 + 10}" font-size="15" font-weight="700" fill="#1d3f7a" text-anchor="middle">${n}</text>`); s += '</svg>';
    return { title: '숫자판 1~20 (순서 없이)', note: '칠판 대신 인쇄해 짝 활동으로 · 코팅 후 보드마커', html: s + `<div class="note">교사가 숫자를 1~3개 영어로 말하면 두 팀 대표가 서로 다른 색으로 동그라미. 숫자가 다 끝났을 때 동그라미가 많은 팀이 승리. 짝 활동: 한 명이 부르고 한 명이 찾기.</div>` }; },
};
// ───────────── 장면 그림 ─────────────
const SCENES = {
  _room(withItems) { const W = 182, H = 118; let s = svgOpen(W, H) + `<rect x="0" y="0" width="${W}" height="${H}" fill="#fbfcfe" stroke="#1d3f7a" stroke-width="1"/><line x1="0" y1="92" x2="${W}" y2="92" stroke="#9fb3c8" stroke-width=".8"/>`;
    s += `<rect x="12" y="52" width="46" height="5" fill="#d9b37a" stroke="#7a5a2a" stroke-width=".8"/><rect x="15" y="57" width="4" height="35" fill="#c49a5c"/><rect x="51" y="57" width="4" height="35" fill="#c49a5c"/><rect x="30" y="47" width="14" height="5" fill="#2f6fcb" stroke="#1d3f7a" stroke-width=".6"/><text x="35" y="100" font-size="4.6" text-anchor="middle" fill="#3a4a66">desk / book</text>`;
    s += `<rect x="70" y="60" width="18" height="3.5" fill="#d9b37a" stroke="#7a5a2a" stroke-width=".8"/><rect x="71" y="63.5" width="2.5" height="28" fill="#c49a5c"/><rect x="84.5" y="63.5" width="2.5" height="28" fill="#c49a5c"/><rect x="84.5" y="38" width="2.5" height="22" fill="#c49a5c"/><rect x="72" y="40" width="15" height="3" fill="#d9b37a"/><text x="79" y="100" font-size="4.6" text-anchor="middle" fill="#3a4a66">chair</text>`;
    s += `<rect x="100" y="56" width="34" height="4" fill="#d9b37a" stroke="#7a5a2a" stroke-width=".8"/><rect x="103" y="60" width="3" height="32" fill="#c49a5c"/><rect x="128" y="60" width="3" height="32" fill="#c49a5c"/><text x="117" y="100" font-size="4.6" text-anchor="middle" fill="#3a4a66">table</text>`;
    s += `<rect x="142" y="70" width="28" height="22" fill="#f1d9a7" stroke="#7a5a2a" stroke-width=".8"/><path d="M142,70 l5,-7 l28,0 l-5,7" fill="#e6c98c" stroke="#7a5a2a" stroke-width=".8"/><text x="156" y="100" font-size="4.6" text-anchor="middle" fill="#3a4a66">box</text>`;
    s += `<rect x="100" y="99" width="70" height="8" rx="1.5" fill="#cfe0f5" stroke="#2f6fcb" stroke-width=".8"/><rect x="100" y="95" width="12" height="4" fill="#fff" stroke="#2f6fcb" stroke-width=".6"/><rect x="100" y="107" width="3" height="6" fill="#2f6fcb"/><rect x="167" y="107" width="3" height="6" fill="#2f6fcb"/><text x="94" y="106" font-size="4.6" text-anchor="end" fill="#3a4a66">bed</text>`;
    if (withItems) s += `<text x="37" y="46" font-size="7" text-anchor="middle">✏️</text><text x="79" y="84" font-size="9" text-anchor="middle">🐱</text><text x="117" y="54" font-size="8" text-anchor="middle">📱</text><text x="156" y="86" font-size="9" text-anchor="middle">🐶</text><text x="135" y="115.5" font-size="7" text-anchor="middle">⚽</text>`;
    return s + '</svg>'; },
  gapA() { const tbl = `<table class="sheet" style="margin-top:4mm"><tr><th style="width:14mm"></th><th>pencil ✏️</th><th>cat 🐱</th><th>phone 📱</th><th>dog 🐶</th><th>ball ⚽</th></tr><tr><td class="nm" style="width:auto">Where?</td><td style="height:12mm"></td><td></td><td></td><td></td><td></td></tr></table>`;
    return { title: 'Information Gap 그림 A (장소만)', note: '짝 중 한 명에게만 주세요', html: `<div class="sheet-ttl" style="font-size:13pt">Picture A — 사물을 그려 넣으세요</div>${SCENES._room(false)}${tbl}<div class="note"><b>A가 묻기:</b> "Where's the pencil?" → B의 대답을 듣고 그림에 그려 넣으세요.<br><b>힌트 낱말:</b> on (위에) · in (안에) · under (아래에) · next to (옆에)</div>` }; },
  gapB() { const tbl = `<table class="sheet" style="margin-top:4mm"><tr><th style="width:14mm"></th><th>pencil ✏️</th><th>cat 🐱</th><th>phone 📱</th><th>dog 🐶</th><th>ball ⚽</th></tr><tr><td class="nm" style="width:auto">Answer</td><td style="height:12mm">on the book</td><td>under the chair</td><td>on the table</td><td>in the box</td><td>under the bed</td></tr></table>`;
    return { title: 'Information Gap 그림 B (완성 그림)', note: '짝 중 다른 한 명에게만 주세요', html: `<div class="sheet-ttl" style="font-size:13pt">Picture B — 위치를 알려 주세요</div>${SCENES._room(true)}${tbl}<div class="note"><b>B가 답하기:</b> "It's on the book." / "It's under the chair." / "It's on the table." / "It's in the box." / "It's under the bed."<br>그림을 A에게 보여 주지 마세요! 🙈</div>` }; },
  _drawit() { const W = 182, H = 108; let s = svgOpen(W, H) + `<rect x="0" y="0" width="${W}" height="${H}" fill="#fff" stroke="#1d3f7a" stroke-width=".8"/>`;
    s += `<rect x="10" y="48" width="48" height="5" fill="#d9b37a" stroke="#7a5a2a" stroke-width=".8"/><rect x="13" y="53" width="4" height="36" fill="#c49a5c"/><rect x="51" y="53" width="4" height="36" fill="#c49a5c"/><text x="34" y="98" font-size="5" text-anchor="middle" fill="#3a4a66">desk</text>`;
    s += `<circle cx="86" cy="52" r="22" fill="#fff5e6" stroke="#7a5a2a" stroke-width=".9"/><path d="M64,45 q22,-30 44,0" fill="none" stroke="#7a5a2a" stroke-width=".9"/><text x="86" y="98" font-size="5" text-anchor="middle" fill="#3a4a66">face</text>`;
    s += `<path d="M112,88 l0,-32 q0,-6 6,-6 l20,0 q6,0 6,6 l0,32 z" fill="#f8d7dd" stroke="#c9507a" stroke-width=".9"/><path d="M120,50 q8,-14 16,0" fill="none" stroke="#c9507a" stroke-width="1.6"/><text x="128" y="98" font-size="5" text-anchor="middle" fill="#3a4a66">bag</text>`;
    s += `<rect x="152" y="56" width="20" height="3.5" fill="#d9b37a" stroke="#7a5a2a" stroke-width=".8"/><rect x="153" y="59.5" width="2.5" height="29" fill="#c49a5c"/><rect x="168.5" y="59.5" width="2.5" height="29" fill="#c49a5c"/><rect x="168.5" y="34" width="2.5" height="22" fill="#c49a5c"/><rect x="154" y="36" width="15" height="3" fill="#d9b37a"/><text x="162" y="98" font-size="5" text-anchor="middle" fill="#3a4a66">chair</text>`;
    return s + '</svg>'; },
  drawit() { const half = `<div class="half"><div class="ttl2">표시해 보세요 — Listen and draw. &nbsp;<span style="font-weight:400;color:#5a6b85;font-size:9.5pt">Name: ____________</span></div>${SCENES._drawit()}<div style="font-size:9.5pt;color:#5a6b85;margin-top:1.5mm">예) Draw a pencil on the desk. · Draw a nose on the face. · Draw two apples in the bag. · Draw a banana under the chair.</div></div>`;
    return { title: '표시해 보세요 그림 (반으로 잘라 짝에게 한 장씩)', note: '✂ 가운데를 잘라 사용', html: `<div style="display:flex;flex-direction:column;gap:4mm;height:100%">${half}${half}</div>` }; },
};
// ───────────── 워크시트 ─────────────
const WS = {
  memory() { const round = n => `<div class="sheet-ttl">Round ${n} — I saw: &nbsp;<span style="font-weight:400;color:#5a6b85;font-size:9.5pt">본 것을 영어로 쓰세요</span></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin-bottom:6mm">${'<div class="frame" style="height:20mm"></div>'.repeat(6)}</div>`;
    return { title: '기억 게임 답안지', note: '학생 1인 1장 · 라운드마다 6칸', html: `<div class="ws"><div style="font-size:11pt;margin-bottom:4mm">Name: ______________ &nbsp;&nbsp; Team: __________</div>${round(1)}${round(2)}${round(3)}<div class="note">점수: Round 1 ____ &nbsp; Round 2 ____ &nbsp; Round 3 ____ &nbsp; Total ____</div></div>` }; },
  position() { const W = 182, H = 110; let s = svgOpen(W, H) + `<rect x="0" y="0" width="${W}" height="${H}" fill="#fff" stroke="#1d3f7a" stroke-width=".8"/>`;
    s += `<rect x="12" y="55" width="50" height="5" fill="#d9b37a" stroke="#7a5a2a" stroke-width=".8"/><rect x="15" y="60" width="4" height="40" fill="#c49a5c"/><rect x="55" y="60" width="4" height="40" fill="#c49a5c"/><text x="37" y="106" font-size="5" text-anchor="middle" fill="#3a4a66">desk</text>`;
    s += `<rect x="80" y="66" width="20" height="3.5" fill="#d9b37a" stroke="#7a5a2a" stroke-width=".8"/><rect x="81" y="69.5" width="2.5" height="30" fill="#c49a5c"/><rect x="96.5" y="69.5" width="2.5" height="30" fill="#c49a5c"/><rect x="96.5" y="42" width="2.5" height="24" fill="#c49a5c"/><rect x="82" y="44" width="15" height="3" fill="#d9b37a"/><text x="90" y="106" font-size="5" text-anchor="middle" fill="#3a4a66">chair</text>`;
    s += `<rect x="125" y="70" width="40" height="30" fill="#f1d9a7" stroke="#7a5a2a" stroke-width=".8"/><path d="M125,70 l6,-8 l40,0 l-6,8" fill="#e6c98c" stroke="#7a5a2a" stroke-width=".8"/><text x="145" y="106" font-size="5" text-anchor="middle" fill="#3a4a66">box</text>`;
    s = s.replace('height="110mm"', 'height="84mm" preserveAspectRatio="xMidYMid meet"').replace('width="182mm"', 'width="182mm"');
    return { title: '위치 그리기 워크시트', note: '좋아하는 물건·동물을 한 곳에 그리고 문장을 완성 · 반으로 잘라 2명분', html: `<div class="ws">${[0, 1].map(() => `<div style="border:1.2px dashed #8a97ab;border-radius:8px;padding:3mm;margin-bottom:5mm"><div style="font-size:10pt;margin-bottom:2mm">Name: __________ &nbsp; 그릴 곳: on / under the desk · on / under the chair · on / in / under the box</div>${s}<div style="font-size:13pt;margin-top:3mm;line-height:1.8">Where is my __________? &nbsp;→&nbsp; It's __________ the __________.</div></div>`).join('')}</div>` }; },
  family() { const one = `<div style="border:1.2px dashed #8a97ab;border-radius:8px;padding:3mm;height:calc(50% - 2.5mm);display:flex;gap:4mm"><div class="frame" style="width:85mm;height:100%;display:flex;align-items:flex-end;justify-content:center;color:#9fb3c8;font-size:9pt;padding-bottom:2mm">가족 한 사람을 그리세요</div><div style="flex:1;font-size:13pt;line-height:2.1"><div style="font-size:10pt;color:#5a6b85">Name: __________</div><div><b style="color:var(--navy)">Who's he / she?</b></div><div>He's / She's my __________.</div><div>His / Her name is __________.</div><div>He / She is __________ years old.</div><div>He / She likes __________.</div></div></div>`;
    return { title: '가족 소개 워크시트', note: '✂ 반으로 잘라 2명분 · 그린 뒤 짝과 Who\'s he/she? 묻고 답하기', html: `<div class="ws" style="display:flex;flex-direction:column;gap:5mm;height:100%">${one}${one}</div>` }; },
  addon() { const ladder = n => `<div style="margin-bottom:5mm"><div style="font-size:10pt;color:var(--navy);font-weight:700">${n}. Start: ____________________________</div>${[72, 100, 130, 160].map(w => `<div class="line" style="width:${w}mm;margin-left:${(182 - w) / 2}mm"></div>`).join('')}</div>`;
    return { title: '문장 확장 사다리 (Add-on 워크시트)', note: '시작 문장을 쓰고 한 줄씩 길게 만들기 · 모둠당 1장', html: `<div class="ws"><div style="font-size:10pt;margin-bottom:3mm">Team: __________ &nbsp; 예) I have a dog. → I have a big dog. → I have a big black dog. → I have a big black dog in my house.</div>${ladder(1)}${ladder(2)}${ladder(3)}</div>` }; },
};

// ───────────── 주사위 전개도(2개/쪽) ─────────────
function diceNet(faces, title) { const a = 36, cells = [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]]; let s = svgOpen(4 * a + 6, 3 * a + 6) + `<g transform="translate(3,3)">`;
  cells.forEach(([cx, cy], i) => { const f = faces && faces[i]; s += `<rect x="${cx * a}" y="${cy * a}" width="${a}" height="${a}" fill="#fff" stroke="#1d3f7a" stroke-width="1"/>`; if (f) s += `<text x="${cx * a + a / 2}" y="${cy * a + a / 2 + 2}" font-size="16" text-anchor="middle">${f[0]}</text><text x="${cx * a + a / 2}" y="${cy * a + a - 4}" font-size="4.6" text-anchor="middle" font-weight="700" fill="#1d3f7a">${esc(f[1])}</text>`; });
  const tab = 'fill="#eef3fb" stroke="#9fb3c8" stroke-width=".6" stroke-dasharray="2 1.5"';
  s += `<path d="M${a},0 l${a},0 l-5,-6 l${-a + 10},0 z" ${tab}/><path d="M${a},${3 * a} l${a},0 l-5,6 l${-a + 10},0 z" ${tab}/><path d="M${4 * a},${a} l0,${a} l6,-5 l0,${-a + 10} z" ${tab}/><path d="M0,${a} l0,${a} l-6,-5 l0,${-a + 10} z" ${tab}/></g></svg>`;
  return `<div style="display:flex;align-items:center;gap:6mm;border:1.2px dashed #8a97ab;border-radius:8px;padding:3mm;height:calc(50% - 2mm)"><div style="width:32mm;font-weight:700;color:#1d3f7a;font-size:12pt;line-height:1.3">${title}</div>${s}</div>`; }

// ───────────── 머트리얼 조립 ─────────────
function buildMaterials(g) {
  let items = []; for (const spec of g.mats || []) { const [k, arg] = spec; const gen = GEN[k]; if (!gen) throw new Error(`알 수 없는 머트리얼: ${k} (${g.en})`); items.push(...gen(arg)); }
  // 주사위 2개씩 한 쪽으로 합치기
  const out = []; for (let i = 0; i < items.length; i++) { const it = items[i]; if (it._dice) { const next = items[i + 1] && items[i + 1]._dice ? items[++i] : null; const nets = [it, next].filter(Boolean).map(d => diceNet(d.faces, d.faces ? `${d.faces.map(f => f[0]).join('')}<br><span style="font-size:9pt;font-weight:400;color:#5a6b85">${d.faces.map(f => f[1]).join(' · ')}</span>` : '빈 주사위<br><span style="font-size:9pt;font-weight:400;color:#5a6b85">학생이 직접 그려 넣기</span>')); out.push({ title: '주사위 전개도', note: '두꺼운 종이에 인쇄 → 실선 자르기 → 접기 → 탭에 풀칠', html: `<div style="display:flex;flex-direction:column;gap:4mm;height:100%">${nets.join('')}</div>` }); } else out.push(it); }
  return out;
}

// ───────────── 매뉴얼 ─────────────
const hdr = (g, right) => { const c = CH[g.ch]; return `<div class="hdr"><div class="hl"><div class="logo"><img src="logo.jpg"></div><div><div class="l">ON글터 영어·국어 전문학원 · 초등영어 게임 패키지</div><div class="t">${esc(c.id)}. ${esc(c.title)} <span style="font-weight:400;color:#5a6b85;font-size:9.5pt">${esc(c.en)}</span></div></div></div><div class="badge">${g.id}<small>${esc(right)}</small></div></div>`; };
function manualSections(g, matList) {
  const S = [];
  S.push(`<div class="ttl"><div class="en">${esc(g.en)}</div><div class="ko">${esc(g.ko)}</div><div class="tags"><i>${esc(g.lv)}</i><i>${esc(g.time)}</i></div></div>
  <div class="meta"><div><b>대형 · 인원</b>${esc(g.form)}</div><div><b>언어 기능</b>${esc(g.lang)}</div><div><b>원본</b>「Let's play a game!」 p.${g.src}</div><div class="w2"><b>준비물</b>${esc(g.prep.join(', '))}</div><div><b>포함 머트리얼</b>${matList.length}종 · 뒤쪽 참조</div></div>
  <div class="aim"><b>🎯 목표</b>${esc(g.aim)}</div>`);
  S.push(`<div class="body"><div class="steps"><div class="sec">▶ 진행 순서</div><ol class="st">${g.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div><div class="talk"><div class="sec">💬 교실 영어</div>${g.talk.map(([w, s]) => `<div class="dl"><span class="who">${esc(w)}</span><span>${esc(s)}</span></div>`).join('')}</div></div>`);
  if (g.ex) { const cls = w => w === 'T' ? 't' : w === '상황' ? 'n' : w === '결과' ? 'r' : ''; S.push(`<div class="sec">🎬 예시 진행 — 이렇게 흘러갑니다</div><div class="exbox"><div class="set"><b>수업 설정</b> · ${esc(g.ex.set)}</div>${g.ex.lines.map(([w, s]) => `<div class="ex ${cls(w)}"><span class="who">${esc(w)}</span><span class="say">${esc(s)}</span></div>`).join('')}</div>`); }
  S.push(`<div class="two"><div><div class="sec">💡 변형 · 팁</div><ul class="tp">${(g.tips || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul></div><div><div class="sec">👀 관찰 포인트</div><ul class="tp">${(g.check || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></div>`);
  S.push(`<div class="inc"><b>📎 이 파일의 머트리얼</b>${matList.map((m, i) => `<span>${i + 1}. ${esc(m.title)} <small style="color:#8a97ab">p.${m.page}</small></span>`).join('')}</div>`);
  return S;
}
const mpage = (g, idx, total, m, pageNo, pageTotal) => `<div class="page c-${CH[g.ch].color}"><div class="mh"><div class="hl"><div class="logo"><img src="logo.jpg"></div><div><span class="mid">${g.id} · 머트리얼 ${idx}/${total}</span><span class="mt">${esc(m.title)}</span></div></div><div class="gm">${esc(g.en)}<br>${esc(g.ko)}</div></div><div class="cut">${esc(m.note || '')}</div><div class="content">${m.html}</div><div class="pg">${pageNo} / ${pageTotal}</div></div>`;
const doc = (title, body) => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head><body>${body}</body></html>`;
const safe = s => s.replace(/[\/\\:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();

async function main() {
  const argv = process.argv.slice(2);
  const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1].split(',') : null;
  const png = argv.includes('--png');
  const outRel = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : 'output/초등영어게임';
  const out = path.join(ROOT, outRel); fs.mkdirSync(out, { recursive: true });
  const pngDir = argv.includes('--png-dir') ? argv[argv.indexOf('--png-dir') + 1] : path.join(out, '_preview'); if (png) fs.mkdirSync(pngDir, { recursive: true });
  const work = path.join(out, '_work'); fs.mkdirSync(work, { recursive: true });
  for (const f of ['kr400.woff2', 'kr700.woff2', 'logo.jpg']) fs.copyFileSync(path.join(__dirname, f), path.join(work, f));
  const { chromium } = requirePlaywright();
  const exe = process.env.PLAYWRIGHT_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const page = await b.newPage({ viewport: { width: 820, height: 1200 }, deviceScaleFactor: 1 });
  const index = []; let over = [];
  for (const g of games) {
    if (only && !only.includes(g.id)) continue;
    seed = g.no * 131 + 7;
    const mats = buildMaterials(g);
    // 1) 매뉴얼 섹션 측정 → 쪽 배치
    const tmpList = mats.map(m => ({ ...m, page: 0 }));
    let secs = manualSections(g, tmpList);
    const measure = async (compact) => {
      const measureHtml = doc('m', `<div class="page c-${CH[g.ch].color}">${hdr(g, '교사용 매뉴얼')}<div class="content" id="cap"></div></div><div style="width:182mm;background:#fff;margin:0 auto" class="c-${CH[g.ch].color}${compact ? ' compact' : ''}">${secs.map((s, i) => `<div class="ms" style="display:flow-root" data-i="${i}">${s}</div>`).join('')}</div>`);
      fs.writeFileSync(hp, measureHtml); await page.goto('file://' + hp); await page.evaluate(() => document.fonts.ready);
      return page.evaluate(() => ({ cap: document.getElementById('cap').clientHeight, h: [...document.querySelectorAll('.ms')].map(e => e.getBoundingClientRect().height) }));
    };
    const hp = path.join(work, 'index.html');
    let compact = false; let mm = await measure(false); let CAP = mm.cap - 30; let totalH = mm.h.reduce((a, b) => a + b, 0);
    if (totalH > CAP && totalH <= CAP * 1.12) { compact = true; mm = await measure(true); totalH = mm.h.reduce((a, b) => a + b, 0); if (totalH > CAP) { compact = false; mm = await measure(false); } }
    const pagesSec = []; let cur = [], used = 0;
    mm.h.forEach((h, i) => { if (cur.length && used + h > CAP) { pagesSec.push(cur); cur = []; used = 0; } cur.push(i); used += h; });
    pagesSec.push(cur);
    const manualPages = pagesSec.length, total = manualPages + mats.length;
    mats.forEach((m, i) => m.page = manualPages + i + 1);
    secs = manualSections(g, mats);
    const body = pagesSec.map((ids, pi) => `<div class="page c-${CH[g.ch].color}${compact ? ' compact' : ''}">${hdr(g, pi === 0 ? '교사용 매뉴얼' : '매뉴얼 (계속)')}<div class="content">${ids.map(i => secs[i]).join('')}</div><div class="pg">${pi + 1} / ${total}</div></div>`).join('')
      + mats.map((m, i) => mpage(g, i + 1, mats.length, m, manualPages + i + 1, total)).join('');
    fs.writeFileSync(hp, doc(`${g.id} ${g.en}`, body));
    await page.goto('file://' + hp); await page.evaluate(() => document.fonts.ready);
    const pgs = page.locator('.page'); const n = await pgs.count();
    for (let i = 0; i < n; i++) { const info = await pgs.nth(i).evaluate(e => { const c = e.querySelector('.content'); return { sh: c.scrollHeight, ch: c.clientHeight }; }); if (info.sh > info.ch + 1) over.push(`${g.id} ${i + 1}쪽 +${info.sh - info.ch}px`); if (png) await pgs.nth(i).screenshot({ path: path.join(pngDir, `${g.id}_${String(i + 1).padStart(2, '0')}.png`) }); }
    await page.emulateMedia({ media: 'print' });
    const fname = `${g.id} ${safe(g.en)} (${safe(g.ko)}).pdf`;
    await page.pdf({ path: path.join(out, fname), format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.emulateMedia({ media: 'screen' });
    index.push({ id: g.id, en: g.en, ko: g.ko, ch: g.ch, pages: n, manual: manualPages, mats: mats.length, file: fname, lv: g.lv, time: g.time });
    console.log(`${g.id} ${g.en} — ${n}쪽 (매뉴얼 ${manualPages} + 머트리얼 ${mats.length})`);
  }
  // 목차 PDF
  if (!only) {
    const rows = index.map(r => `<tr><td style="text-align:center;font-weight:700;color:var(--${CH[r.ch].color})">${r.id}</td><td style="text-align:left">${esc(r.en)} <span style="color:#5a6b85;font-size:9pt">${esc(r.ko)}</span></td><td>${esc(r.lv)}</td><td>${esc(r.time)}</td><td>${r.pages}</td></tr>`);
    const pagesHtml = chunk(rows, 26).map((rs, i, a) => `<div class="page c-blue"><div class="hdr"><div class="hl"><div class="logo"><img src="logo.jpg"></div><div><div class="l">ON글터 영어·국어 전문학원 · 초등영어 게임 패키지</div><div class="t">게임 목록 · 97종 (파일 1개 = 게임 1개)</div></div></div><div class="badge">목차<small>${i + 1}/${a.length}</small></div></div><div class="content"><table class="sheet" style="font-size:9.5pt"><tr><th style="width:14mm">번호</th><th>게임</th><th style="width:18mm">학년</th><th style="width:18mm">시간</th><th style="width:12mm">쪽</th></tr>${rs.join('')}</table>${i === a.length - 1 ? `<div class="note">챕터: A 어휘·그림카드 / B 추측 / C TPR·명령어 / D 기억·연쇄 / E 숫자·시간 / F 보드·주사위 / G 대화·역할놀이. 각 파일은 교사용 매뉴얼(목표·진행·교실 영어·예시 진행·변형·관찰 포인트) 1~2쪽 + 그 게임 전용 머트리얼로 구성. 원본 100건 중 같은 내용이 두 번 실린 3건을 제외해 97종. · ${DATE}</div>` : ''}</div><div class="pg">${i + 1} / ${a.length}</div></div>`).join('');
    fs.writeFileSync(hp = path.join(work, 'index.html'), doc('목차', pagesHtml));
    await page.goto('file://' + hp); await page.evaluate(() => document.fonts.ready); await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: path.join(out, '00 게임 목록 (97종).pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
    fs.writeFileSync(path.join(out, '_index.json'), JSON.stringify(index, null, 1));
  }
  await b.close(); fs.rmSync(work, { recursive: true, force: true });
  console.log(`완료: ${index.length}개 · 총 ${index.reduce((a, r) => a + r.pages, 0)}쪽${over.length ? `\n⚠ 넘침: ${over.join(', ')}` : ''}`);
}
let hp; main().catch(e => { console.error(e); process.exit(1); });
