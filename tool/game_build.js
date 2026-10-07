#!/usr/bin/env node
// 초등영어 게임 매뉴얼 + 머트리얼 빌더: games/초등영어게임_데이터.js → HTML → PNG(쪽별) + PDF
// 사용: node tool/game_build.js [--no-png] [--only manual|materials]
const fs = require('fs');
const path = require('path');
function requirePlaywright() {
  try { return require('playwright'); } catch (e) {}
  const g = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(g, 'playwright'));
}
const ROOT = path.resolve(__dirname, '..');
const DATA = require(path.join(ROOT, 'games', '초등영어게임_데이터.js'));
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const DATE = '2026. 10.';

// ───────────────────────── 공통 CSS ─────────────────────────
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
.hdr{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid var(--blue);padding-bottom:4px;margin-bottom:6mm;flex:none}
.hdr .hl{display:flex;align-items:center;gap:4mm}
.hdr .logo{width:40mm;height:11.5mm;overflow:hidden;flex:none}
.hdr .logo img{width:50mm;margin:-5.5mm 0 0 -5mm;display:block}
.hdr .l{font-size:8.5pt;color:#5a6b85}.hdr .t{font-size:13pt;font-weight:700;line-height:1.2;color:var(--navy)}
.hdr .r{font-size:10pt;text-align:right;color:#3a4a66;font-weight:700}
.hdr .r small{display:block;font-weight:400;font-size:8.5pt;color:#5a6b85}
.pg{position:absolute;bottom:5.5mm;left:0;right:0;text-align:center;font-size:8.5pt;color:#8a97ab}
.c-teal{--c:var(--teal);--cl:var(--teal-l)}.c-blue{--c:var(--blue);--cl:var(--blue-l)}.c-violet{--c:var(--violet);--cl:var(--violet-l)}
.c-orange{--c:var(--orange);--cl:var(--orange-l)}.c-green{--c:var(--green);--cl:var(--green-l)}.c-rose{--c:var(--rose);--cl:var(--rose-l)}

/* 챕터 배너 */
.ban{border-radius:8px;background:var(--cl);border-left:8px solid var(--c);padding:5mm 6mm;margin-bottom:5mm}
.ban .bid{font-size:9pt;color:var(--c);font-weight:700;letter-spacing:.1em}
.ban .bt{font-size:17pt;font-weight:700;color:var(--navy);line-height:1.2}
.ban .bt small{font-size:11pt;color:#5a6b85;font-weight:400;margin-left:8px}
.ban .bd{font-size:9.5pt;color:#3a4a66;margin-top:2px}

/* 게임 블록 */
.g{border:1.5px solid var(--c);border-radius:8px;overflow:hidden;margin-bottom:5mm;word-break:keep-all;page-break-inside:avoid}
.g .gh{display:flex;align-items:center;gap:3mm;background:var(--c);color:#fff;padding:2mm 4mm}
.g .gid{font-weight:700;font-size:10pt;background:rgba(255,255,255,.25);border-radius:4px;padding:0 6px;white-space:nowrap;flex:none}
.g .gen{font-weight:700;font-size:13.5pt;letter-spacing:.01em;white-space:nowrap;flex:none}
.g .gko{font-size:10.5pt;opacity:.95;white-space:nowrap;flex:none}
.g .tags{margin-left:auto;display:flex;gap:2mm;align-items:center;min-width:0}
.g .tags i{font-style:normal;font-size:8.5pt;background:#fff;color:var(--c);border-radius:10px;padding:0 7px;font-weight:700;white-space:nowrap}
.g .tags i:first-child{white-space:normal;line-height:1.2;padding:1px 7px;text-align:center;max-width:62mm}
.g .meta{display:flex;flex-wrap:wrap;gap:1mm 5mm;background:var(--cl);padding:1.5mm 4mm;font-size:9.5pt;color:#3a4a66}
.g .meta b{color:var(--c);font-weight:700;margin-right:3px}
.g .aim{padding:1.5mm 4mm 0;font-size:10pt}
.g .aim b{color:var(--c)}
.g .body{display:flex;gap:4mm;padding:1.5mm 4mm 0}
.g .steps{flex:1.45}.g .talk{flex:1;border-left:1px dashed var(--line);padding-left:3.5mm}
.g .lab{font-weight:700;font-size:9.5pt;color:var(--c);margin-bottom:1mm}
.g ol{margin:0;padding-left:1.6em;font-size:9.8pt;line-height:1.45}
.g ol li{margin-bottom:.8mm;padding-left:.2em}
.g ol li::marker{color:var(--c);font-weight:700}
.g .dl{display:flex;gap:2mm;font-size:9.6pt;line-height:1.4;margin-bottom:.8mm}
.g .dl .who{flex:none;min-width:7mm;font-weight:700;color:var(--c);font-size:9pt;text-align:right}
.g .dl .say{font-family:"NKR","Noto Color Emoji",sans-serif}
.g .tips{margin:2mm 4mm 2.5mm;background:var(--cream);border-radius:6px;padding:1.5mm 3mm;font-size:9.3pt;color:#5c4511;line-height:1.45}
.g .tips b{color:#b07a1a}
.g .tips div{padding-left:1.1em;text-indent:-1.1em}
.g.compact ol,.g.compact .dl{font-size:9pt;line-height:1.35}.g.compact .tips{font-size:8.7pt}.g.compact .aim{font-size:9.3pt}

/* 표지·안내·목차·부록 */
.cover{display:flex;flex-direction:column;height:100%}
.cover .big{margin-top:30mm;text-align:center}
.cover .big .en{font-size:22pt;color:var(--blue);font-weight:700;letter-spacing:.02em}
.cover .big .ko{font-size:36pt;font-weight:700;color:var(--navy);line-height:1.2;margin:4mm 0}
.cover .big .sub{font-size:13pt;color:#3a4a66}
.cover .chips{display:grid;grid-template-columns:repeat(2,1fr);gap:4mm;margin:16mm 10mm 0}
.cover .chip{border-radius:8px;padding:3mm 5mm;background:var(--cl);border-left:6px solid var(--c)}
.cover .chip b{display:block;color:var(--navy);font-size:12pt}
.cover .chip span{font-size:9.5pt;color:#3a4a66}
.cover .foot{margin-top:auto;text-align:center;color:#5a6b85;font-size:10pt;line-height:1.7}
.cover .logo-big{text-align:center;margin-top:6mm}
.cover .logo-big img{width:95mm}
h2.sec{font-size:13pt;margin:0 0 3mm;padding:1mm 12px;color:#fff;display:inline-block;border-radius:14px;background:var(--blue)}
.guide p{margin:0 0 2mm;font-size:10.5pt}
.guide ul{margin:0 0 3mm;padding-left:1.4em;font-size:10.2pt}
.guide li{margin-bottom:1mm}
.anat{border:1.5px solid var(--line);border-radius:8px;padding:3mm 4mm;margin-bottom:4mm;font-size:9.8pt;background:#fafcff}
.anat table{width:100%;border-collapse:collapse}
.anat td{border:1px solid var(--line);padding:1.5mm 2.5mm;vertical-align:top}
.anat td:first-child{width:28mm;font-weight:700;color:var(--navy);background:var(--blue-l)}
.toc{columns:2;column-gap:8mm;font-size:9.6pt}
.toc .tch{break-inside:avoid;margin:0 0 1.5mm;padding:1mm 3mm;border-radius:5px;background:var(--cl);border-left:5px solid var(--c);font-weight:700;color:var(--navy);font-size:10.5pt}
.toc .tch:not(:first-child){margin-top:3mm}
.toc .tr{display:flex;align-items:baseline;gap:1.5mm;line-height:1.35;margin-bottom:.9mm;break-inside:avoid}
.toc .tr .id{flex:none;width:10mm;font-weight:700;color:var(--c);font-size:9pt}
.toc .tr .nm{flex:none;max-width:62mm;display:flex;align-items:baseline;min-width:0}
.toc .tr .nm .en{flex:none;white-space:nowrap}
.toc .tr .nm small{color:#5a6b85;margin-left:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.toc .tr .dots{flex:1;border-bottom:1px dotted #9fb3c8;min-width:4mm;transform:translateY(-3px)}
.toc .tr .pn{flex:none;font-weight:700;color:#3a4a66;font-size:9pt}
.apx table{width:100%;border-collapse:collapse;font-size:9.6pt;margin-bottom:4mm}
.apx th,.apx td{border:1px solid var(--line);padding:1.5mm 2.5mm;vertical-align:top;text-align:left}
.apx th{background:var(--blue-l);color:var(--navy);white-space:nowrap}
.apx .ids span{display:inline-block;margin:0 3px 1px 0;font-weight:700;color:var(--blue);font-size:9pt}
.apx .ids small{color:#3a4a66;font-weight:400}

/* 머트리얼 */
.mh{display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid var(--navy);padding-bottom:2mm;margin-bottom:4mm;flex:none}
.mh .hl{display:flex;align-items:center;gap:4mm;flex:1;min-width:0;padding-right:4mm}
.mh .logo{width:34mm;height:10mm;overflow:hidden;flex:none}
.mh .logo img{width:43mm;margin:-4.8mm 0 0 -4.3mm;display:block}
.mh .mid{display:inline-block;background:var(--navy);color:#fff;font-weight:700;border-radius:5px;padding:0 7px;font-size:10.5pt;margin-right:6px}
.mh .mt{font-size:12.5pt;font-weight:700;color:var(--navy)}
.mh .use{font-size:8.5pt;color:#3a4a66;text-align:right;max-width:62mm;line-height:1.35;flex:none}
.mh .use b{color:var(--navy)}
.cut{font-size:8.5pt;color:#8a97ab;text-align:right;margin-bottom:2mm;flex:none}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.card{border:1.2px dashed #8a97ab;border-radius:6px;height:57mm;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;background:#fff;page-break-inside:avoid}
.card .emo{font-size:58pt;margin-bottom:2.5mm}
.card .w{font-size:16pt;font-weight:700;color:var(--navy);line-height:1.1;text-align:center}
.card .k{font-size:9.5pt;color:#5a6b85;margin-top:1mm}
.card .cat{position:absolute;top:2mm;left:2.5mm;font-size:7.5pt;color:#fff;background:var(--c);border-radius:8px;padding:0 6px;font-weight:700}
.card .tag{position:absolute;top:2mm;right:2.5mm;font-size:8.5pt;color:#8a97ab;font-weight:700}
.card.num .w{font-size:64pt;color:var(--navy)}
.card.num .k{font-size:14pt;color:var(--blue);font-weight:700}
.card .sw{width:34mm;height:34mm;border-radius:50%;border:1px solid #c7ccd6;margin-bottom:3mm}
.cards2{display:grid;grid-template-columns:repeat(2,1fr);gap:4mm}
.cards2 .card{height:58mm}
.sign{height:calc(50% - 2mm);border:1.5px dashed #8a97ab;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.sign .big{font-size:150pt;font-weight:700;line-height:1}
.sign .sm{font-size:16pt;color:#3a4a66;margin-top:2mm}
.half{height:calc(50% - 2mm);border:1.2px dashed #8a97ab;border-radius:8px;padding:3mm;display:flex;flex-direction:column}
.half .ttl{font-weight:700;color:var(--navy);font-size:11pt;margin-bottom:1.5mm}
.grid3{display:grid;grid-template-columns:repeat(3,1fr)}
.grid3 i{display:block;border:1.5px solid var(--navy);height:27mm}
.grid4{display:grid;grid-template-columns:repeat(4,1fr)}
.grid4 i{display:block;border:1.5px solid var(--navy);height:27mm}
.bingo{display:grid;grid-template-columns:1fr 1fr;gap:6mm}
.bingo .b{border:1.2px dashed #8a97ab;border-radius:8px;padding:3mm}
.bingo .b .ttl{font-weight:700;color:var(--navy);text-align:center;margin-bottom:2mm}
table.sheet{width:100%;border-collapse:collapse;font-size:10pt;margin-bottom:5mm}
table.sheet th,table.sheet td{border:1.2px solid var(--navy);padding:1.5mm 2mm;text-align:center;height:9mm}
table.sheet th{background:var(--blue-l);color:var(--navy)}
table.sheet td.nm{text-align:left;width:30mm}
table.mcov th,table.mcov td{height:auto;padding:1mm 2mm;line-height:1.3}
.sheet-ttl{font-weight:700;color:var(--navy);font-size:11.5pt;margin-bottom:1.5mm}
.labels .lb{border:1.2px dashed #8a97ab;border-radius:8px;height:36mm;margin-bottom:4mm;display:flex;align-items:center;justify-content:center;gap:8mm}
.labels .lb .emo{font-size:40pt}.labels .lb .w{font-size:30pt;font-weight:700;color:var(--navy)}.labels .lb .k{font-size:14pt;color:#5a6b85}
.poster h3{margin:0 0 2mm;font-size:16pt;color:var(--navy);text-align:center}
.poster .row{display:flex;gap:3mm;margin-bottom:3mm}
.poster .q{flex:1;border:1.5px solid var(--c);border-radius:8px;padding:2mm 3mm}
.poster .q b{display:block;color:var(--c);font-size:11pt;margin-bottom:1mm}
.poster .q div{font-size:10.5pt;line-height:1.5}
.tally{display:grid;grid-template-columns:repeat(10,1fr);gap:2mm;margin-top:2mm}
.tally i{display:block;border:1.5px solid var(--navy);height:10mm;border-radius:4px}
.slips{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm}
.slip{border:1px dashed #8a97ab;border-radius:5px;padding:1mm 3mm;font-size:9.5pt;height:19.5mm;display:flex;flex-direction:column;justify-content:center}
.slip .nmz{display:flex;flex-wrap:wrap;gap:1mm 3mm}
.slip .nmz span{padding:0 2px}.slip .nmz span.on{border:2px solid var(--rose);border-radius:50%;font-weight:700}
.slip .ox{font-size:28pt;text-align:center;font-weight:700}
.menu{border:2px solid var(--navy);border-radius:10px;padding:5mm 7mm;height:100%}
.menu h3{text-align:center;margin:0 0 4mm;font-size:22pt;color:var(--navy)}
.menu .it{display:flex;align-items:center;gap:5mm;border-bottom:1px dotted #9fb3c8;padding:2mm 0;font-size:14pt}
.menu .it .emo{font-size:26pt}.menu .it .pr{margin-left:auto;font-weight:700;color:var(--rose)}
.menu .dlg{margin-top:5mm;background:var(--cream);border-radius:8px;padding:3mm 4mm;font-size:11.5pt;line-height:1.7}
svg text{font-family:"NKR","Noto Color Emoji",sans-serif}
`;

// ───────────────────────── 렌더 보조 ─────────────────────────
const CH = Object.fromEntries(DATA.chapters.map(c => [c.id, c]));
const games = DATA.games.map((g, i) => ({ ...g }));
// 챕터 내 일련번호 (A-01 …)
{ const cnt = {}; for (const g of games) { cnt[g.ch] = (cnt[g.ch] || 0) + 1; g.id = `${g.ch}-${String(cnt[g.ch]).padStart(2, '0')}`; } }
const byId = Object.fromEntries(games.map(g => [g.id, g]));
const matUse = {}; for (const g of games) for (const m of g.mats) (matUse[m] = matUse[m] || []).push(g.id);

const hdr = (title, right, sub) => `<div class="hdr"><div class="hl"><div class="logo"><img src="logo.jpg"></div><div><div class="l">ON글터 영어·국어 전문학원 · 초등영어 게임 자료</div><div class="t">${esc(title)}</div></div></div><div class="r">${esc(right||'')}${sub?`<small>${esc(sub)}</small>`:''}</div></div>`;

function renderGame(g, compact) {
  const c = CH[g.ch];
  const tags = [g.lang, g.lv, g.time].filter(Boolean).map(t => `<i>${esc(t)}</i>`).join('');
  const mats = g.mats.length ? g.mats.map(m => `${m}`).join(' · ') : '없음';
  const steps = g.steps.map(s => `<li>${esc(s)}</li>`).join('');
  const talk = g.talk.map(([w, s]) => `<div class="dl"><span class="who">${esc(w)}</span><span class="say">${esc(s)}</span></div>`).join('');
  const tips = g.tips && g.tips.length ? `<div class="tips"><b>💡 변형·팁</b>${g.tips.map(t => `<div>· ${esc(t)}</div>`).join('')}</div>` : '';
  return `<div class="g c-${c.color}${compact?' compact':''}" data-id="${g.id}">
  <div class="gh"><span class="gid">${g.id}</span><span class="gen">${esc(g.en)}</span><span class="gko">${esc(g.ko)}</span><span class="tags">${tags}</span></div>
  <div class="meta"><span><b>대형</b>${esc(g.form)}</span><span><b>준비물</b>${esc(g.prep.join(', '))}</span><span><b>머트리얼</b>${esc(mats)}</span><span><b>원본</b>p.${g.src}</span></div>
  <div class="aim"><b>🎯 목표</b> &nbsp;${esc(g.aim)}</div>
  <div class="body"><div class="steps"><div class="lab">▶ 진행</div><ol>${steps}</ol></div><div class="talk"><div class="lab">💬 교실 영어</div>${talk}</div></div>
  ${tips}</div>`;
}
const banner = c => `<div class="ban c-${c.color}"><div class="bid">CHAPTER ${c.id}</div><div class="bt">${esc(c.title)}<small>${esc(c.en)}</small></div><div class="bd">${esc(c.desc)}</div></div>`;

// ───────────────────────── 매뉴얼 앞·뒤 쪽 ─────────────────────────
function coverPage() {
  const chips = DATA.chapters.map(c => { const n = games.filter(g => g.ch === c.id).length; return `<div class="chip c-${c.color}"><b>${c.id}. ${esc(c.title)} <span style="font-weight:400">· ${n}개</span></b><span>${esc(c.en)} — ${esc(c.desc)}</span></div>`; }).join('');
  return `<div class="page"><div class="cover"><div class="logo-big"><img src="logo.jpg"></div>
  <div class="big"><div class="en">Let's Play a Game!</div><div class="ko">초등영어 게임 매뉴얼</div><div class="sub">교사용 진행 안내 · 95개 게임 · 머트리얼 25종 연동</div></div>
  <div class="chips">${chips}</div>
  <div class="foot">ON글터 영어·국어 전문학원 &nbsp;|&nbsp; ${DATE} 제작<br><span style="font-size:9pt">원본: 「Let's play a game!」 초등영어 게임 룰 모음(53쪽, 100건)을 내용 기준으로 정리·통합·보완</span></div></div></div>`;
}
function guidePage(total) {
  const noPrep = games.filter(g => g.prep.length === 1 && g.prep[0] === '없음').length;
  return `<div class="page">${hdr('이 매뉴얼 보는 법', '사용 안내')}<div class="content guide">
  <h2 class="sec">1. 게임 블록 읽는 법</h2>
  <div class="anat"><table>
  <tr><td>머리띠</td><td><b>게임 번호(A-01)</b> · 영문명 · 국문명 · 오른쪽 태그 3개 = <b>언어 기능</b>(연습되는 표현) / <b>권장 학년</b> / <b>권장 시간</b>. 학년·시간은 학원 수업 기준의 추정치이므로 반 수준에 맞게 조절하세요.</td></tr>
  <tr><td>대형 · 준비물</td><td>인원 구성과 실물 준비물. <b>머트리얼</b>은 별책 「머트리얼」의 번호(M01~M25)이며, 해당 쪽을 인쇄해 바로 쓸 수 있습니다. <b>원본 p.</b>는 올려 주신 PDF의 쪽 번호입니다.</td></tr>
  <tr><td>🎯 목표</td><td>이 게임으로 아이들이 실제로 연습하게 되는 것. 수업 계획서의 활동 목표로 그대로 옮겨 쓸 수 있습니다.</td></tr>
  <tr><td>▶ 진행</td><td>원본 룰을 순서대로 정리한 것. 원본에 빠진 세부 절차(점수 처리, 역할 교대)는 보완했습니다.</td></tr>
  <tr><td>💬 교실 영어</td><td>T=교사, S=학생, Ss=학생 전체. 교사가 먼저 시범을 보이고 학생이 따라 하는 핵심 문장만 실었습니다.</td></tr>
  <tr><td>💡 변형·팁</td><td>난이도 조절, 다른 단원으로 바꾸는 법, 안전·운영 유의점, 원본 자료 정리 메모.</td></tr>
  </table></div>
  <h2 class="sec">2. 운영 원칙 다섯 가지</h2>
  <ul>
  <li><b>영어로 말해야 점수.</b> 카드를 집거나 행동만 해서는 점수를 주지 않고, 반드시 해당 낱말·문장을 말하게 합니다. 게임의 목적은 '발화 횟수'입니다.</li>
  <li><b>탈락은 역할로 바꾼다.</b> 탈락한 학생에게 심판·점수 기록·다음 출제자 역할을 주면 끝까지 참여합니다. 원본의 탈락 규칙은 저학년에서 특히 점수제로 바꾸길 권합니다.</li>
  <li><b>시범 1회 → 전체 1회 → 모둠.</b> 새 게임은 교사가 학생 한 명과 시범을 보인 뒤 전체로 한 판, 그다음 모둠으로 넘깁니다.</li>
  <li><b>안전.</b> 달리기·눈가리개·공 던지기 게임(C-06, C-16, A-13, G-10)은 책상을 치우고, 부드러운 공과 넓은 공간에서 진행합니다.</li>
  <li><b>머트리얼은 코팅해 재사용.</b> 그림카드(M02)와 숫자카드(M01)는 두꺼운 종이에 인쇄해 코팅하면 대부분의 게임에 반복 사용할 수 있습니다.</li>
  </ul>
  <h2 class="sec">3. 원본 자료 정리 메모</h2>
  <ul>
  <li>원본 100건 중 완전 중복 4건을 통합했습니다: 주사위 놀이 2종 → F-01, Whisper Chain + Pass the word → D-04, Memory Game = Memory Game 2 → A-04, Magic basket(p.16) 본문 = Action Chains(p.8) → C-05.</li>
  <li>제목과 본문이 어긋난 2건은 내용 기준으로 바로잡았습니다: p.17 'Action Chains'(바구니 맞히기 내용) → B-03 Magic Basket, p.10 Information Gap(본문이 Action Chains) → p.38 본문으로 대체(F-08).</li>
  <li>OHP·TP 필름(p.45)은 종이 가리개 또는 태블릿 화면으로 대체하도록 적었습니다.</li>
  <li>준비물 없이 바로 할 수 있는 게임은 ${noPrep}개이며, 부록의 '빠른 찾기 표'에서 확인할 수 있습니다.</li>
  </ul>
  </div><div class="pg">2 / ${total}</div></div>`;
}
function tocPages(pageOf, total) {
  const groups = [['A','B','C'], ['D','E','F','G']];
  return groups.map((chs, pi) => {
    const inner = chs.map(id => { const c = CH[id]; const rows = games.filter(g => g.ch === id).map(g => `<div class="tr c-${c.color}"><span class="id">${g.id}</span><span class="nm"><span class="en">${esc(g.en)}</span><small>${esc(g.ko)}</small></span><span class="dots"></span><span class="pn">${pageOf[g.id]}</span></div>`).join('');
      return `<div class="tch c-${c.color}">${c.id}. ${esc(c.title)} <span style="font-weight:400;font-size:9pt;color:#5a6b85">${esc(c.en)}</span></div>${rows}`; }).join('');
    const extra = pi === 1 ? `<div class="tch c-blue" style="margin-top:3mm">부록 <span style="font-weight:400;font-size:9pt;color:#5a6b85">Appendix</span></div><div class="tr"><span class="id"></span><span class="nm">빠른 찾기 표 (준비물 없음 · 5분 · 학년 · 기능별)</span><span class="dots"></span><span class="pn">${pageOf.apx1}</span></div><div class="tr"><span class="id"></span><span class="nm">머트리얼 색인 (M01~M25 – 게임)</span><span class="dots"></span><span class="pn">${pageOf.apx2}</span></div>` : '';
    return `<div class="page">${hdr('차례', `목차 ${pi+1}/2`)}<div class="content"><div class="toc">${inner}${extra}</div></div><div class="pg">${3+pi} / ${total}</div></div>`;
  });
}
function appendixPages(startNo, total) {
  const ids = arr => `<div class="ids">${arr.map(g => `<span>${g.id} <small>${esc(g.en)}</small></span>`).join('')}</div>`;
  const noPrep = games.filter(g => g.prep.length === 1 && g.prep[0] === '없음');
  const quick = games.filter(g => /^5분|5~/.test(g.time));
  const lv = { '전학년': [], '초3~4': [], '초4~6 · 초5~6': [], '초3~6': [] };
  for (const g of games) { if (g.lv === '전학년') lv['전학년'].push(g); else if (g.lv === '초3~4') lv['초3~4'].push(g); else if (g.lv === '초3~6') lv['초3~6'].push(g); else lv['초4~6 · 초5~6'].push(g); }
  const fn = [
    ['Yes / No 의문문 (Is it ~? Are you ~? Do you like ~?)', games.filter(g => /Is it|Is this|Are you|Do you like|Can you/.test(g.lang))],
    ['명령문 · TPR (Stand up, Draw ~, Put ~)', games.filter(g => g.ch === 'C')],
    ['숫자 · 시각 (How many? How old? What time?)', games.filter(g => g.ch === 'E' || /How many|숫자/.test(g.lang))],
    ['인사 · 감사 · 사과 표현', games.filter(g => /Good|Hi|Thank|sorry|Nice to meet/.test(g.lang))],
    ['위치 전치사 (on / in / under)', games.filter(g => /Where|on the|under/.test(g.lang) || g.mats.includes('M23'))],
  ];
  const p1 = `<div class="page">${hdr('부록 1 · 빠른 찾기 표 (1)', '부록')}<div class="content apx">
  <table><tr><th style="width:38mm">준비물 없이 바로</th><td>${ids(noPrep)}</td></tr>
  <tr><th>5분 안에 끝나는 게임</th><td>${ids(quick)}</td></tr></table>
  <table><tr><th style="width:38mm">학년별</th><th>게임</th></tr>${Object.entries(lv).map(([k, v]) => `<tr><th>${k}</th><td>${ids(v)}</td></tr>`).join('')}</table>
  </div><div class="pg">${startNo} / ${total}</div></div>`;
  const p1b = `<div class="page">${hdr('부록 1 · 빠른 찾기 표 (2)', '부록')}<div class="content apx">
  <table><tr><th style="width:52mm">언어 기능별</th><th>게임</th></tr>${fn.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${ids(v)}</td></tr>`).join('')}</table>
  <p style="font-size:9.5pt;color:#5a6b85;margin:0">같은 게임이 여러 기능에 중복 표시될 수 있습니다. 태그는 매뉴얼 각 블록의 첫 번째 태그(언어 기능)를 기준으로 분류했습니다.</p>
  </div><div class="pg">${startNo+1} / ${total}</div></div>`;
  const rows = DATA.materials.map(m => `<tr><th><span style="display:inline-block;background:var(--navy);color:#fff;border-radius:4px;padding:0 5px;margin-right:4px">${m.id}</span>${esc(m.name)}</th><td>${(matUse[m.id] || []).map(id => `<span style="font-weight:700;color:var(--blue);margin-right:5px">${id}</span>`).join('') || '<span style="color:#8a97ab">—</span>'}</td></tr>`).join('');
  const p2 = `<div class="page">${hdr('부록 2 · 머트리얼 색인', '부록')}<div class="content apx">
  <p style="margin:0 0 3mm;font-size:10pt">별책 「초등영어 게임 머트리얼」의 번호와 그것을 쓰는 게임입니다. 머트리얼 각 쪽 머리글에도 사용 게임 번호가 적혀 있습니다.</p>
  <table><tr><th style="width:78mm">머트리얼</th><th>사용 게임</th></tr>${rows}</table></div><div class="pg">${startNo+2} / ${total}</div></div>`;
  return [p1, p1b, p2];
}

// ───────────────────────── 머트리얼 ─────────────────────────
const CARDS = [
  ['Animals', '동물', 'teal', [['dog','개','🐶'],['cat','고양이','🐱'],['pig','돼지','🐷'],['cow','소','🐮'],['horse','말','🐴'],['tiger','호랑이','🐯'],['bear','곰','🐻'],['lion','사자','🦁'],['monkey','원숭이','🐵'],['rabbit','토끼','🐰'],['elephant','코끼리','🐘'],['duck','오리','🦆']]],
  ['Fruits', '과일', 'rose', [['apple','사과','🍎'],['banana','바나나','🍌'],['orange','오렌지','🍊'],['grapes','포도','🍇'],['strawberry','딸기','🍓'],['watermelon','수박','🍉'],['pear','배','🍐'],['peach','복숭아','🍑']]],
  ['Food', '음식', 'orange', [['hamburger','햄버거','🍔'],['pizza','피자','🍕'],['ice cream','아이스크림','🍦'],['cake','케이크','🎂'],['bread','빵','🍞'],['rice','밥','🍚'],['chicken','치킨','🍗'],['milk','우유','🥛']]],
  ['School things', '학용품', 'blue', [['book','책','📘'],['pencil','연필','✏️'],['ruler','자','📏'],['bag','가방','🎒'],['scissors','가위','✂️'],['crayon','크레용','🖍️'],['notebook','공책','📓'],['pen','펜','🖊️']]],
  ['Clothes', '옷', 'violet', [['shirt','셔츠','👕'],['pants','바지','👖'],['dress','원피스','👗'],['socks','양말','🧦'],['shoes','신발','👟'],['hat','모자','🧢']]],
  ['Family', '가족', 'green', [['dad','아빠','👨'],['mom','엄마','👩'],['brother','형·오빠·남동생','👦'],['sister','누나·언니·여동생','👧'],['grandpa','할아버지','👴'],['grandma','할머니','👵']]],
  ['Jobs', '직업', 'teal', [['doctor','의사','👨‍⚕️'],['teacher','선생님','👩‍🏫'],['cook','요리사','👨‍🍳'],['police officer','경찰관','👮'],['firefighter','소방관','👩‍🚒'],['farmer','농부','👨‍🌾'],['singer','가수','👩‍🎤'],['pilot','조종사','👨‍✈️']]],
  ['Weather', '날씨', 'blue', [['sunny','맑은','☀️'],['cloudy','흐린','☁️'],['rainy','비 오는','🌧️'],['snowy','눈 오는','❄️'],['windy','바람 부는','🌬️'],['stormy','폭풍우','⛈️']]],
  ['Sports', '운동', 'orange', [['soccer','축구','⚽'],['baseball','야구','⚾'],['basketball','농구','🏀'],['tennis','테니스','🎾'],['badminton','배드민턴','🏸'],['swimming','수영','🏊']]],
  ['Toys', '장난감', 'rose', [['doll','인형','🧸'],['robot','로봇','🤖'],['car','자동차','🚗'],['ball','공','🏐'],['train','기차','🚂'],['plane','비행기','✈️']]],
  ['Colors', '색깔', 'violet', [['red','빨강','#e03b3b'],['blue','파랑','#2f6fcb'],['yellow','노랑','#f2c21b'],['green','초록','#3f9a48'],['black','검정','#222'],['white','하양','#fff'],['orange','주황','#ef8a2a'],['purple','보라','#7a57c9']]],
  ['Actions', '동작', 'green', [['singing','노래하기','🎤'],['dancing','춤추기','💃'],['cooking','요리하기','🍳'],['reading','책 읽기','📖'],['swimming','수영하기','🏊'],['sleeping','잠자기','😴'],['running','달리기','🏃'],['jumping','점프하기','🤸']]],
];
const allCards = CARDS.flatMap(([cat, catKo, color, items]) => items.map(([w, k, e]) => ({ cat, catKo, color, w, k, e })));

const useText = (id, max) => { const u = matUse[id] || []; if (!u.length) return '—'; if (u.length <= max) return u.join(', '); return `${u.slice(0, max).join(', ')} 외 ${u.length - max}개 (총 ${u.length}개 게임)`; };
const mhdr = (id, title, note) => `<div class="mh"><div class="hl"><div class="logo"><img src="logo.jpg"></div><div><span class="mid">${id}</span><span class="mt">${esc(title)}</span></div></div><div class="use"><b>사용 게임</b> ${useText(id, 10)}</div></div><div class="cut">${esc(note || '✂ 점선을 따라 자르세요 · 두꺼운 종이 권장')}</div>`;
const mpage = (id, title, inner, note) => `<div class="page">${mhdr(id, title, note)}<div class="content">${inner}</div><div class="pg">__PG__</div></div>`;
const chunk = (a, n) => { const r = []; for (let i = 0; i < a.length; i += n) r.push(a.slice(i, i + n)); return r; };
const svgOpen = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}" style="display:block">`;

function clockSVG(hour, size, blank) { // size mm
  const r = size / 2, cx = r, cy = r;
  let s = `${svgOpen(size, size)}<circle cx="${cx}" cy="${cy}" r="${r-1}" fill="#fff" stroke="#1d3f7a" stroke-width="1.2"/>`;
  for (let i = 1; i <= 12; i++) { const a = (i / 12) * 2 * Math.PI; const tx = cx + Math.sin(a) * (r - 6), ty = cy - Math.cos(a) * (r - 6) + 1.6; s += `<text x="${tx}" y="${ty}" font-size="4.6" text-anchor="middle" fill="#1d3f7a" font-weight="700">${i}</text>`; const x1 = cx + Math.sin(a) * (r - 2.5), y1 = cy - Math.cos(a) * (r - 2.5), x2 = cx + Math.sin(a) * (r - 1.2), y2 = cy - Math.cos(a) * (r - 1.2); s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1d3f7a" stroke-width=".8"/>`; }
  if (!blank) { const a = (hour / 12) * 2 * Math.PI; s += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.sin(a) * (r * .5)}" y2="${cy - Math.cos(a) * (r * .5)}" stroke="#c9507a" stroke-width="2" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r * .72}" stroke="#2f6fcb" stroke-width="1.4" stroke-linecap="round"/>`; }
  s += `<circle cx="${cx}" cy="${cy}" r="1.3" fill="#1d3f7a"/></svg>`; return s;
}
const cardBox = (inner, cls) => `<div class="card ${cls||''}">${inner}</div>`;

function materialPages() {
  const P = [];
  // M01 숫자 카드 0~20 + 질문 카드 3
  { const nums = Array.from({ length: 21 }, (_, i) => i); const words = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
    const cards = nums.map(n => cardBox(`<div class="w">${n}</div><div class="k">${words[n]}</div>`, 'num'));
    cards.push(cardBox(`<div class="emo">🔢</div><div class="w" style="font-size:14pt">How many?</div><div class="k">몇 개?</div>`), cardBox(`<div class="emo">🎂</div><div class="w" style="font-size:14pt">How old are you?</div><div class="k">몇 살?</div>`), cardBox(`<div class="emo">⏰</div><div class="w" style="font-size:14pt">What time is it?</div><div class="k">몇 시?</div>`));
    chunk(cards, 12).forEach((cs, i) => P.push(mpage('M01', `숫자 카드 0~20 (${i+1}/2)`, `<div class="cards">${cs.join('')}</div>`))); }
  // M02 그림 단어 카드
  { const cards = allCards.map(c => { const pic = c.cat === 'Colors' ? `<div class="sw" style="background:${c.e}"></div>` : `<div class="emo">${c.e}</div>`; return `<div class="card c-${c.color}"><span class="cat">${c.cat}</span>${pic}<div class="w">${esc(c.w)}</div><div class="k">${esc(c.k)}</div></div>`; });
    const pages = chunk(cards, 12); pages.forEach((cs, i) => { const cats = [...new Set(allCards.slice(i*12, i*12+12).map(c => c.cat))].join(' · '); P.push(mpage('M02', `그림 단어 카드 ${i+1}/${pages.length} · ${cats}`, `<div class="cards">${cs.join('')}</div>`, '✂ 점선을 따라 자르세요 · 기억 게임(A-03)·공 잡기(A-13)는 2벌 인쇄')); }); }
  // M03 시계 카드
  { const letters = 'ABCDEFGHIJKL';
    const an = Array.from({ length: 12 }, (_, i) => cardBox(`<span class="tag">${letters[i]}</span>${clockSVG(i + 1, 40)}<div class="k" style="margin-top:2mm">What time is it?</div>`));
    const bl = Array.from({ length: 12 }, () => cardBox(`${clockSVG(0, 40, true)}<div class="k" style="margin-top:2mm">It's ______ o'clock.</div>`));
    const words = ['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
    const tx = words.map((w, i) => cardBox(`<span class="tag">${i+1}</span><div class="w" style="font-size:15pt;line-height:1.3">It's ${w}<br>o'clock.</div><div class="k" style="font-size:22pt;color:var(--navy);font-weight:700;margin-top:3mm">${i+1}:00</div>`));
    P.push(mpage('M03', '시계 카드 1/3 · 아날로그 시계 (A~L)', `<div class="cards">${an.join('')}</div>`));
    P.push(mpage('M03', '시계 카드 2/3 · 빈 시계 (바늘 그리기)', `<div class="cards">${bl.join('')}</div>`, '✂ 점선을 따라 자르세요 · 코팅 후 보드마커로 바늘을 그리면 반복 사용'));
    P.push(mpage('M03', '시계 카드 3/3 · 시각 문장 카드 (1~12)', `<div class="cards">${tx.join('')}</div>`)); }
  // M04 빙고판
  { const b3 = Array.from({ length: 4 }, () => `<div class="b"><div class="ttl">BINGO 3×3</div><div class="grid3">${'<i></i>'.repeat(9)}</div></div>`).join('');
    P.push(mpage('M04', '빙고판 1/2 · 3×3 (시계 빙고 · 삼목)', `<div class="bingo">${b3}</div>`, '숫자(1~12)나 낱말을 아홉 칸에 자유롭게 써 넣게 하세요'));
    const b4 = Array.from({ length: 2 }, () => `<div class="b"><div class="ttl">BINGO 4×4</div><div class="grid4">${'<i></i>'.repeat(16)}</div></div>`).join('');
    P.push(mpage('M04', '빙고판 2/2 · 4×4 (어휘 빙고)', `<div class="bingo" style="grid-template-columns:1fr">${b4}</div>`, '단원 낱말 16개를 써 넣고 교사가 부르는 낱말에 ×표')); }
  // M05 Snakes and Ladders (5열 × 6행 = 30칸)
  { const W = 182, cols = 5, rows = 6, cw = W / cols, chh = 40, H = rows * chh;
    const tasks = { 2: 'Say 3 animals', 3: 'Count 1 to 10', 5: "What's your\nname?", 6: 'Touch your\nnose', 8: 'Say 3 fruits', 10: 'How old are\nyou?', 13: 'Jump 3 times', 22: 'What time\nis it?', 29: 'Say 3 colors' };
    const pos = n => { const r = Math.floor((n - 1) / cols); const c0 = (n - 1) % cols; const c = r % 2 === 0 ? c0 : cols - 1 - c0; return { x: c * cw, y: H - (r + 1) * chh, cx: c * cw + cw / 2, cy: H - (r + 1) * chh + chh / 2 }; };
    let s = svgOpen(W, H);
    for (let n = 1; n <= 30; n++) { const p = pos(n); const fill = n === 1 ? '#e7f4e8' : n === 30 ? '#fbe7ee' : (tasks[n] ? '#fff8e8' : (n % 2 ? '#fff' : '#f3f6fb')); s += `<rect x="${p.x}" y="${p.y}" width="${cw}" height="${chh}" fill="${fill}" stroke="#1d3f7a" stroke-width=".9"/><text x="${p.x + 2.5}" y="${p.y + 6}" font-size="5.5" font-weight="700" fill="#1d3f7a">${n}</text>`;
      const t = n === 1 ? 'START' : n === 30 ? 'FINISH' : tasks[n]; if (t) { const ls = t.split('\n'); ls.forEach((l, i) => s += `<text x="${p.cx}" y="${p.cy + 6 + (i - (ls.length - 1) / 2) * 6}" font-size="4.6" text-anchor="middle" fill="#2b2f3a" font-weight="700">${esc(l)}</text>`); } if (n === 1) s += `<text x="${p.cx}" y="${p.cy - 4}" font-size="9" text-anchor="middle">🏁</text>`; if (n === 30) s += `<text x="${p.cx}" y="${p.cy - 4}" font-size="9" text-anchor="middle">🏆</text>`; }
    const ladder = (a, b) => { const A = pos(a), B = pos(b); const x = A.cx, w = 5; let r = `<line x1="${x - w}" y1="${A.cy + 8}" x2="${x - w}" y2="${B.cy - 6}" stroke="#e07b2a" stroke-width="1.8"/><line x1="${x + w}" y1="${A.cy + 8}" x2="${x + w}" y2="${B.cy - 6}" stroke="#e07b2a" stroke-width="1.8"/>`; for (let y = A.cy + 4; y > B.cy - 4; y -= 7) r += `<line x1="${x - w}" y1="${y}" x2="${x + w}" y2="${y}" stroke="#e07b2a" stroke-width="1.4"/>`; r += `<text x="${x + w + 2}" y="${A.cy + 10}" font-size="4" fill="#e07b2a" font-weight="700">▲ ${b}</text>`; return r; };
    const snake = (a, b) => { const A = pos(a), B = pos(b); const x = A.cx; const d = `M${x},${A.cy + 6} C${x + 12},${A.cy + 22} ${x - 12},${B.cy - 22} ${x},${B.cy - 4}`; return `<path d="${d}" fill="none" stroke="#3f9a48" stroke-width="3.4" stroke-linecap="round" opacity=".9"/><circle cx="${x}" cy="${A.cy + 6}" r="3.4" fill="#3f9a48"/><circle cx="${x + 1.2}" cy="${A.cy + 5}" r=".8" fill="#fff"/><text x="${x + 5}" y="${B.cy - 6}" font-size="4" fill="#3f9a48" font-weight="700">▼ ${b}</text>`; };
    // 사다리: 같은 열 아래→위 / 뱀: 같은 열 위→아래 (과제 칸을 지나지 않도록 배치)
    s += ladder(4, 14) + ladder(9, 19) + ladder(18, 28) + snake(26, 15) + snake(21, 11) + snake(27, 17) + '</svg>';
    const legend = `<div style="font-size:9pt;margin-top:2.5mm;color:#3a4a66;line-height:1.5"><b style="color:#e07b2a">▲ 사다리</b> 4→14 · 9→19 · 18→28 (올라가기) &nbsp;&nbsp; <b style="color:#3f9a48">▼ 뱀</b> 26→15 · 21→11 · 27→17 (내려가기) &nbsp;&nbsp; 노란 칸 = 과제 칸 (영어로 말해야 머물 수 있음)</div>`;
    P.push(mpage('M05', 'Snakes and Ladders 게임판', s + legend, '주사위 1개 · 말(지우개·단추) 사용 · 과제 칸은 포스트잇으로 단원에 맞게 교체 가능')); }
  // M06 Twenty Boxes
  { const cells = Array.from({ length: 20 }, (_, i) => `<div style="border:1.5px solid #1d3f7a;height:47mm;position:relative"><span style="position:absolute;top:1.5mm;left:2mm;font-weight:700;color:#1d3f7a;font-size:11pt">${i+1}</span></div>`).join('');
    P.push(mpage('M06', 'Twenty Boxes 게임판 (짝당 2장 인쇄)', `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0">${cells}</div>`, '"Number 7, a cat." 듣고 해당 칸에 그리기 · 짝과 비교')); }
  // M07 Time Grid
  { const slots = [['7:00','🛏️','get up'],['7:30→8','🍳','breakfast'],['8:00','🏫','go to school'],['9:00','📖','study'],['10:00','🎨','art class'],['11:00','🎵','music class'],['12:00','🍱','lunch'],['1:00','⚽','play soccer'],['2:00','📚','read a book'],['3:00','🏠','go home'],['4:00','🍪','snack time'],['5:00','🎮','play games'],['6:00','🍽️','dinner'],['7:00','📺','watch TV'],['8:00','🛁','take a bath'],['9:00','📓','homework'],['10:00','😴','go to bed'],['11:00','🌙','sleep']];
    slots[1][0] = '8:00';
    const cell = (t, e, a, extra) => `<div style="border:1.5px solid #1d3f7a;height:58mm;display:flex;flex-direction:column;align-items:center;justify-content:center;background:${extra||'#fff'}"><div style="font-size:19pt;font-weight:700;color:#1d3f7a">${t}</div><div class="emo" style="font-size:30pt;margin:1.5mm 0">${e}</div><div style="font-size:10pt;color:#3a4a66">${a}</div></div>`;
    const cells = [cell('START','🏁','주사위를 던지세요','#e7f4e8'), ...slots.map(([t, e, a]) => cell(t, e, a)), cell('FINISH','🏆','Good job!','#fbe7ee')];
    P.push(mpage('M07', 'Time Grid 게임판', `<div style="display:grid;grid-template-columns:repeat(5,1fr)">${cells.join('')}</div><div style="font-size:9.5pt;color:#3a4a66;margin-top:3mm">말이 멈춘 칸: 나머지 학생 "What time is it?" → 던진 학생 "It's seven o'clock. I get up." · 3학년은 시각만 말해도 인정</div>`, '주사위 1개 · 말 4개 · 1~4번 뱀처럼 왼쪽→오른쪽, 다음 줄은 다시 왼쪽부터')); }
  // M08 주사위 전개도 (2개/쪽)
  { const net = (faces, title) => { const a = 36; const cells = [[1,0],[0,1],[1,1],[2,1],[3,1],[1,2]]; // cross net 4x3
      let s = svgOpen(4 * a + 6, 3 * a + 6) + `<g transform="translate(3,3)">`;
      cells.forEach(([cx, cy], i) => { const f = faces[i]; s += `<rect x="${cx*a}" y="${cy*a}" width="${a}" height="${a}" fill="#fff" stroke="#1d3f7a" stroke-width="1"/>`; if (f) { s += `<text x="${cx*a + a/2}" y="${cy*a + a/2 + 2}" font-size="16" text-anchor="middle">${f[0]}</text><text x="${cx*a + a/2}" y="${cy*a + a - 4}" font-size="4.6" text-anchor="middle" font-weight="700" fill="#1d3f7a">${esc(f[1])}</text>`; } });
      // 풀칠 탭
      const tab = (x, y, w, h) => `<path d="M${x},${y} l${w},0 l${-w*0.15},${h} l${-w*0.7},0 z" fill="#eef3fb" stroke="#9fb3c8" stroke-width=".6" stroke-dasharray="2 1.5"/>`;
      s += tab(a, 0, a, -6).replace('l0,0','') ;
      s += `<path d="M${a},0 l${a},0 l-5,-6 l${-a+10},0 z" fill="#eef3fb" stroke="#9fb3c8" stroke-width=".6" stroke-dasharray="2 1.5"/>`;
      s += `<path d="M${a},${3*a} l${a},0 l-5,6 l${-a+10},0 z" fill="#eef3fb" stroke="#9fb3c8" stroke-width=".6" stroke-dasharray="2 1.5"/>`;
      s += `<path d="M${4*a},${a} l0,${a} l6,-5 l0,${-a+10} z" fill="#eef3fb" stroke="#9fb3c8" stroke-width=".6" stroke-dasharray="2 1.5"/>`;
      s += `<path d="M0,${a} l0,${a} l-6,-5 l0,${-a+10} z" fill="#eef3fb" stroke="#9fb3c8" stroke-width=".6" stroke-dasharray="2 1.5"/>`;
      s += `</g></svg>`;
      return `<div style="display:flex;align-items:center;gap:6mm;border:1.2px dashed #8a97ab;border-radius:8px;padding:3mm;height:calc(50% - 2mm)"><div style="width:32mm;font-weight:700;color:#1d3f7a;font-size:12pt;line-height:1.3">${title}</div>${s}</div>`; };
    const blank = Array(6).fill(null);
    const food = [['🍔','hamburger'],['🍕','pizza'],['🍦','ice cream'],['🎂','cake'],['🍎','apple'],['🥛','milk']];
    const toys = [['🚂','train'],['✈️','plane'],['🚗','car'],['🤖','robot'],['🧸','bear'],['🏐','ball']];
    const anim = [['🐶','dog'],['🐱','cat'],['🐷','pig'],['🐮','cow'],['🐰','rabbit'],['🐯','tiger']];
    P.push(mpage('M08', '주사위 전개도 1/2 · 빈 칸 · 음식', `<div style="display:flex;flex-direction:column;gap:4mm;height:100%">${net(blank, '빈 주사위<br><span style="font-size:9pt;font-weight:400;color:#5a6b85">학생이 직접 그려 넣기</span>')}${net(food, '음식 주사위<br><span style="font-size:9pt;font-weight:400;color:#5a6b85">It\'s pizza. / I like pizza.</span>')}</div>`, '두꺼운 종이에 인쇄 → 실선 자르기 → 점선 접기 → 탭에 풀칠'));
    P.push(mpage('M08', '주사위 전개도 2/2 · 장난감 · 동물', `<div style="display:flex;flex-direction:column;gap:4mm;height:100%">${net(toys, '장난감 주사위<br><span style="font-size:9pt;font-weight:400;color:#5a6b85">What\'s in the box? It\'s a ball.</span>')}${net(anim, '동물 주사위<br><span style="font-size:9pt;font-weight:400;color:#5a6b85">It\'s a dog. / I like dogs.</span>')}</div>`, '두꺼운 종이에 인쇄 → 실선 자르기 → 점선 접기 → 탭에 풀칠')); }
  // M09 점수표
  { const team = `<div class="sheet-ttl">팀 점수표 Team Score</div><table class="sheet"><tr><th style="width:30mm">Team</th>${Array.from({length:10},(_,i)=>`<th>${i+1}</th>`).join('')}<th style="width:16mm">Total</th></tr>${['A','B','C','D'].map(t=>`<tr><td class="nm">Team ${t}</td>${'<td></td>'.repeat(11)}</tr>`).join('')}</table>`;
    const pair = `<div class="sheet-ttl">짝 점수표 Pair Score (B-19 Ring a number 등)</div><div style="display:flex;gap:5mm">${[0,1].map(()=>`<table class="sheet"><tr><th>Name</th><th>1회</th><th>2회</th><th>3회</th><th>합계</th></tr>${'<tr><td class="nm"></td><td></td><td></td><td></td><td></td></tr>'.repeat(2)}</table>`).join('')}</div>`;
    const dice = `<div class="sheet-ttl">주사위 · 개인 점수표 (F-01 주사위 놀이, A-03 기억 게임 등)</div><table class="sheet"><tr><th style="width:30mm">Name</th><th>1회</th><th>2회</th><th>3회</th><th>4회</th><th>5회</th><th>합계</th><th style="width:20mm">순위</th></tr>${'<tr><td class="nm"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'.repeat(6)}</table>`;
    P.push(mpage('M09', '점수표 (팀 · 짝 · 개인)', team + pair + dice, '필요한 표만 잘라 쓰거나 전체를 코팅해 보드마커로 사용')); }
  // M10 표지판
  { const sign = (a, ac, as, b, bc, bs) => `<div style="display:flex;flex-direction:column;gap:4mm;height:100%"><div class="sign"><div class="big" style="color:${ac}">${a}</div><div class="sm">${as}</div></div><div class="sign"><div class="big" style="color:${bc}">${b}</div><div class="sm">${bs}</div></div></div>`;
    P.push(mpage('M10', '표지판 1/3 · O / X', sign('O','#2f6fcb','맞아요 Right!','X','#c9507a','틀려요 Wrong!'), '반으로 잘라 교실 양쪽 벽에 붙이거나 막대에 붙여 들기'));
    P.push(mpage('M10', '표지판 2/3 · YES / NO', sign('YES','#3f9a48','사실이에요','NO','#c9507a','사실이 아니에요'), '의자 등받이에 붙이기 (C-19 Champion\'s chair)'));
    P.push(mpage('M10', '표지판 3/3 · UP / DOWN', sign('UP ↑','#e07b2a','더 큰 수!','DOWN ↓','#7a57c9','더 작은 수!'), '학생 출제자가 들고 힌트 주기 (E-01 Up and Down)')); }
  // M11 Information Gap
  { const scene = (withItems) => { const W = 182, H = 118; let s = svgOpen(W, H) + `<rect x="0" y="0" width="${W}" height="${H}" fill="#fbfcfe" stroke="#1d3f7a" stroke-width="1"/><line x1="0" y1="92" x2="${W}" y2="92" stroke="#9fb3c8" stroke-width=".8"/>`;
      // desk
      s += `<rect x="12" y="52" width="46" height="5" fill="#d9b37a" stroke="#7a5a2a" stroke-width=".8"/><rect x="15" y="57" width="4" height="35" fill="#c49a5c"/><rect x="51" y="57" width="4" height="35" fill="#c49a5c"/><rect x="30" y="47" width="14" height="5" fill="#2f6fcb" stroke="#1d3f7a" stroke-width=".6"/><text x="35" y="100" font-size="4.6" text-anchor="middle" fill="#3a4a66">desk / book</text>`;
      // chair
      s += `<rect x="70" y="60" width="18" height="3.5" fill="#d9b37a" stroke="#7a5a2a" stroke-width=".8"/><rect x="71" y="63.5" width="2.5" height="28" fill="#c49a5c"/><rect x="84.5" y="63.5" width="2.5" height="28" fill="#c49a5c"/><rect x="84.5" y="38" width="2.5" height="22" fill="#c49a5c"/><rect x="72" y="40" width="15" height="3" fill="#d9b37a"/><text x="79" y="100" font-size="4.6" text-anchor="middle" fill="#3a4a66">chair</text>`;
      // table
      s += `<rect x="100" y="56" width="34" height="4" fill="#d9b37a" stroke="#7a5a2a" stroke-width=".8"/><rect x="103" y="60" width="3" height="32" fill="#c49a5c"/><rect x="128" y="60" width="3" height="32" fill="#c49a5c"/><text x="117" y="100" font-size="4.6" text-anchor="middle" fill="#3a4a66">table</text>`;
      // box
      s += `<rect x="142" y="70" width="28" height="22" fill="#f1d9a7" stroke="#7a5a2a" stroke-width=".8"/><path d="M142,70 l5,-7 l28,0 l-5,7" fill="#e6c98c" stroke="#7a5a2a" stroke-width=".8"/><text x="156" y="100" font-size="4.6" text-anchor="middle" fill="#3a4a66">box</text>`;
      // bed (right bottom)
      s += `<rect x="100" y="99" width="70" height="8" rx="1.5" fill="#cfe0f5" stroke="#2f6fcb" stroke-width=".8"/><rect x="100" y="95" width="12" height="4" fill="#fff" stroke="#2f6fcb" stroke-width=".6"/><rect x="100" y="107" width="3" height="6" fill="#2f6fcb"/><rect x="167" y="107" width="3" height="6" fill="#2f6fcb"/><text x="94" y="106" font-size="4.6" text-anchor="end" fill="#3a4a66">bed</text>`;
      if (withItems) { s += `<text x="37" y="46" font-size="7" text-anchor="middle">✏️</text><text x="79" y="84" font-size="9" text-anchor="middle">🐱</text><text x="117" y="54" font-size="8" text-anchor="middle">📱</text><text x="156" y="86" font-size="9" text-anchor="middle">🐶</text><text x="135" y="115.5" font-size="7" text-anchor="middle">⚽</text>`; }
      return s + '</svg>'; };
    const tbl = `<table class="sheet" style="margin-top:4mm"><tr><th style="width:12mm"></th><th>pencil ✏️</th><th>cat 🐱</th><th>phone 📱</th><th>dog 🐶</th><th>ball ⚽</th></tr><tr><td class="nm" style="width:auto">Where?</td><td style="height:12mm"></td><td></td><td></td><td></td><td></td></tr></table>`;
    const dlgA = `<div style="background:var(--cream);border-radius:8px;padding:3mm 4mm;font-size:11pt;line-height:1.7"><b>A가 묻기:</b> "Where's the pencil?" → B의 대답을 듣고 그림에 그려 넣으세요.<br><b>힌트 낱말:</b> on (위에) · in (안에) · under (아래에) · next to (옆에)</div>`;
    const dlgB = `<div style="background:var(--cream);border-radius:8px;padding:3mm 4mm;font-size:11pt;line-height:1.7"><b>B가 답하기:</b> "It's on the book." / "It's under the chair." / "It's on the table." / "It's in the box." / "It's under the bed."<br>그림을 A에게 보여 주지 마세요! 🙈</div>`;
    P.push(mpage('M11', 'Information Gap 그림 A (장소만)', `<div style="font-weight:700;color:var(--navy);font-size:13pt;margin-bottom:2mm">Picture A — 사물을 그려 넣으세요</div>${scene(false)}${tbl}${dlgA}`, '짝 중 한 명에게만 주세요'));
    P.push(mpage('M11', 'Information Gap 그림 B (완성 그림)', `<div style="font-weight:700;color:var(--navy);font-size:13pt;margin-bottom:2mm">Picture B — 위치를 알려 주세요</div>${scene(true)}${tbl.replace('Where?','Answer')}${dlgB}`, '짝 중 다른 한 명에게만 주세요')); }
  // M12 Board Game 섬 지도
  { const W = 182, H = 200; let s = svgOpen(W, H) + `<rect x="0" y="0" width="${W}" height="${H}" fill="#dceefb" stroke="#1d3f7a" stroke-width="1"/>`;
    const cols = ['A','B','C'], cw = (W - 14) / 3, ch = (H - 14 - 22) / 3;
    cols.forEach((c, i) => s += `<text x="${14 + i*cw + cw/2}" y="9" font-size="7" text-anchor="middle" font-weight="700" fill="#1d3f7a">${c}</text>`);
    for (let r = 0; r < 3; r++) { s += `<text x="7" y="${14 + r*ch + ch/2 + 2.5}" font-size="7" text-anchor="middle" font-weight="700" fill="#1d3f7a">${r+1}</text>`; for (let i = 0; i < 3; i++) { const x = 14 + i*cw, y = 14 + r*ch; s += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="none" stroke="#9fb3c8" stroke-width=".6" stroke-dasharray="2 2"/>`; const ex = x + cw/2, ey = y + ch/2; s += `<ellipse cx="${ex}" cy="${ey+2}" rx="${cw*.38}" ry="${ch*.33}" fill="#f6e7b4" stroke="#b5945a" stroke-width=".9"/><ellipse cx="${ex}" cy="${ey+2}" rx="${cw*.3}" ry="${ch*.25}" fill="#cfe8b8" stroke="none"/><text x="${ex}" y="${y + ch - 5}" font-size="5.5" text-anchor="middle" font-weight="700" fill="#1d3f7a">${cols[i]}${r+1}</text>`; } }
    s += `<text x="14" y="${H - 8}" font-size="5" fill="#1d3f7a" font-weight="700">🌊 Island Map</text><text x="60" y="${H - 8}" font-size="4.2" fill="#3a4a66">Name: ______________</text><g transform="translate(${W-16},${H-11})"><circle r="9" fill="#fff" stroke="#1d3f7a" stroke-width=".8"/><text y="-4.5" font-size="4" text-anchor="middle" font-weight="700" fill="#c9507a">N</text><text y="8" font-size="4" text-anchor="middle" font-weight="700">S</text><text x="-6" y="1.5" font-size="4" text-anchor="middle" font-weight="700">W</text><text x="6" y="1.5" font-size="4" text-anchor="middle" font-weight="700">E</text><path d="M0,-3 l1.5,3 l-1.5,3 l-1.5,-3 z" fill="#1d3f7a"/></g></svg>`;
    const dlg = `<div style="background:var(--cream);border-radius:8px;padding:3mm 4mm;font-size:11pt;line-height:1.7;margin-top:3mm">① 섬 3곳에 그림을 그리세요(동물·과일·학용품). ② 짝에게 말하세요: <b>"A cat is on island B2."</b> ③ 짝이 말한 그림을 그 섬에 그리세요. ④ 다 끝나면 지도를 비교하세요. &nbsp;<span style="color:#5a6b85">고학년: north / south / east / west 로 말하기</span></div>`;
    P.push(mpage('M12', 'Board Game 섬 지도 (짝당 2장 인쇄)', s + dlg, '짝에게 지도를 보여 주지 않고 말로만 전달')); }
  // M13 동전 던지기 놀이판
  { const W = 182, cols = 6, rows = 4, cw = W / cols, chh = 46, H = rows * chh; const N = cols * rows;
    const special = { 5: ['🐕','Go back 1','뒤로 1칸'], 9: ['🚌','Go ahead 2','앞으로 2칸'], 12: ['🌧️','Go back to the start','처음으로'], 15: ['🍦','Go ahead 5','앞으로 5칸'], 18: ['⏰','Go back 3','뒤로 3칸'], 21: ['🚦','Stop 1 turn','한 번 쉬기'] };
    const pos = n => { const r = Math.floor((n - 1) / cols); const c0 = (n - 1) % cols; const c = r % 2 === 0 ? c0 : cols - 1 - c0; return { x: c * cw, y: r * chh }; };
    let s = svgOpen(W, H);
    for (let n = 1; n <= N; n++) { const p = pos(n); const sp = special[n]; const fill = n === 1 ? '#e7f4e8' : n === N ? '#fbe7ee' : sp ? '#fdeee0' : '#fff'; s += `<rect x="${p.x}" y="${p.y}" width="${cw}" height="${chh}" fill="${fill}" stroke="#1d3f7a" stroke-width=".9"/><text x="${p.x + 2.5}" y="${p.y + 6}" font-size="5.5" font-weight="700" fill="#1d3f7a">${n}</text>`;
      if (n === 1) s += `<text x="${p.x + cw/2}" y="${p.y + 24}" font-size="12" text-anchor="middle">🏠</text><text x="${p.x + cw/2}" y="${p.y + 34}" font-size="5.5" text-anchor="middle" font-weight="700">HOME</text><text x="${p.x + cw/2}" y="${p.y + 40}" font-size="4.2" text-anchor="middle" fill="#3a4a66">Start · 출발</text>`;
      else if (n === N) s += `<text x="${p.x + cw/2}" y="${p.y + 24}" font-size="12" text-anchor="middle">🏫</text><text x="${p.x + cw/2}" y="${p.y + 34}" font-size="5.5" text-anchor="middle" font-weight="700">SCHOOL</text><text x="${p.x + cw/2}" y="${p.y + 40}" font-size="4.2" text-anchor="middle" fill="#3a4a66">Finish · 도착</text>`;
      else if (sp) { const ls = sp[1].length > 12 ? [sp[1].replace(' to the ', ' to\nthe ')] .join('').split('\n') : [sp[1]]; s += `<text x="${p.x + cw/2}" y="${p.y + 21}" font-size="10" text-anchor="middle">${sp[0]}</text>`; ls.forEach((l, i) => s += `<text x="${p.x + cw/2}" y="${p.y + 30 + i * 5}" font-size="4.4" text-anchor="middle" font-weight="700" fill="#b5531a">${esc(l)}</text>`); s += `<text x="${p.x + cw/2}" y="${p.y + 42}" font-size="3.8" text-anchor="middle" fill="#5a6b85">${sp[2]}</text>`; }
      // 방향 화살표 (SVG 삼각형)
      if (n < N) { const q = pos(n + 1); const ax = (p.x + q.x) / 2 + cw / 2, ay = (p.y + q.y) / 2 + chh / 2; const tri = q.y > p.y ? `M${ax-2.2},${ay-1.5} l4.4,0 l-2.2,3 z` : (q.x > p.x ? `M${ax-1.5},${ay-2.2} l3,2.2 l-3,2.2 z` : `M${ax+1.5},${ay-2.2} l-3,2.2 l3,2.2 z`); s += `<path d="${tri}" fill="#9fb3c8"/>`; } }
    s += '</svg>';
    const rule = `<div style="display:flex;gap:4mm;margin-top:4mm;font-size:11pt"><div style="flex:1;background:var(--cream);border-radius:8px;padding:3mm 4mm;line-height:1.7"><b>🪙 Head (앞면)</b> → 2칸<br><b>🪙 Tail (뒷면)</b> → 1칸<br>그림 칸에 멈추면 지시대로 이동</div><div style="flex:1;background:var(--blue-l);border-radius:8px;padding:3mm 4mm;line-height:1.7">말을 옮길 때마다 말하기:<br>"Head! Two steps." / "Tail! One step."<br>학교에 먼저 도착한 사람이 승리 🏆</div></div>`;
    P.push(mpage('M13', '동전 던지기 놀이판 · 집에서 학교까지', s + rule, '동전 1개 · 말(지우개·단추) · 2~4명')); }
  // M14 삼목 보드 + 수 찾기
  { const ttt = `<div style="display:grid;grid-template-columns:repeat(3,1fr);width:150mm;margin:4mm auto 0">${Array.from({length:9},(_,i)=>`<div style="border:2px solid #1d3f7a;height:50mm;position:relative"><span style="position:absolute;top:2mm;left:3mm;font-size:16pt;font-weight:700;color:#9fb3c8">${i+1}</span></div>`).join('')}</div>`;
    const rule1 = `<div style="background:var(--cream);border-radius:8px;padding:3mm 4mm;font-size:11pt;line-height:1.7;margin-top:5mm;width:150mm;margin-left:auto;margin-right:auto">질문에 바르게 답한 팀이 칸 번호를 고르고 ○ 또는 ×를 그립니다. 가로·세로·대각선 3개를 먼저 만든 팀이 승리. (B-07 Who am I? 는 ○× 대신 사과·별 그리기)</div>`;
    P.push(mpage('M14', '삼목(三目) 보드 1/2', ttt + rule1, '코팅해 보드마커로 사용하면 반복 가능'));
    const nums = [[11,8,8],[18,20,6],[8,62,6],[3,72,6],[15,30,18],[13,48,18],[17,84,18],[16,6,30],[1,20,30],[12,30,30],[9,12,42],[7,42,42],[14,68,42],[20,22,54],[2,88,54],[4,46,66],[10,90,66],[5,10,78],[19,32,78],[6,70,88]];
    let s = svgOpen(182, 170) + `<rect x="0" y="0" width="182" height="170" fill="#fff" stroke="#1d3f7a" stroke-width="1"/>`;
    nums.forEach(([n, x, y]) => s += `<text x="${x*1.82}" y="${y*1.75+10}" font-size="15" font-weight="700" fill="#1d3f7a" text-anchor="middle">${n}</text>`);
    s += '</svg>';
    const rule2 = `<div style="background:var(--cream);border-radius:8px;padding:3mm 4mm;font-size:11pt;line-height:1.7;margin-top:4mm">교사가 숫자를 1~3개 영어로 말하면 두 팀 대표가 서로 다른 색으로 동그라미. 숫자가 다 끝났을 때 동그라미가 많은 팀이 승리. 짝 활동: 한 명이 부르고 한 명이 찾기.</div>`;
    P.push(mpage('M14', '수 찾기 숫자판 2/2 (1~20)', s + rule2, '칠판 대신 인쇄해 짝 활동으로 · 코팅 후 보드마커')); }
  // M15 Word Family 라벨
  { const L = [['🐾','Animals','동물'],['🍎','Fruits','과일'],['🍔','Food','음식'],['✏️','School things','학용품'],['👕','Clothes','옷'],['⚽','Sports','운동']];
    P.push(mpage('M15', 'Word Family 분류 라벨', `<div class="labels">${L.map(([e,w,k])=>`<div class="lb"><span class="emo">${e}</span><span class="w">${w}</span><span class="k">${k}</span></div>`).join('')}</div>`, '봉투·주머니·바구니 앞에 붙이기 (A-01 Word Family Game)')); }
  // M16 표시해 보세요
  { const scene = () => { const W = 182, H = 108; let s = svgOpen(W, H) + `<rect x="0" y="0" width="${W}" height="${H}" fill="#fff" stroke="#1d3f7a" stroke-width=".8"/>`;
      s += `<rect x="10" y="48" width="48" height="5" fill="#d9b37a" stroke="#7a5a2a" stroke-width=".8"/><rect x="13" y="53" width="4" height="36" fill="#c49a5c"/><rect x="51" y="53" width="4" height="36" fill="#c49a5c"/><text x="34" y="98" font-size="5" text-anchor="middle" fill="#3a4a66">desk</text>`;
      s += `<circle cx="86" cy="52" r="22" fill="#fff5e6" stroke="#7a5a2a" stroke-width=".9"/><path d="M64,45 q22,-30 44,0" fill="none" stroke="#7a5a2a" stroke-width=".9"/><text x="86" y="98" font-size="5" text-anchor="middle" fill="#3a4a66">face</text>`;
      s += `<path d="M112,88 l0,-32 q0,-6 6,-6 l20,0 q6,0 6,6 l0,32 z" fill="#f8d7dd" stroke="#c9507a" stroke-width=".9"/><path d="M120,50 q8,-14 16,0" fill="none" stroke="#c9507a" stroke-width="1.6"/><text x="128" y="98" font-size="5" text-anchor="middle" fill="#3a4a66">bag</text>`;
      s += `<rect x="152" y="56" width="20" height="3.5" fill="#d9b37a" stroke="#7a5a2a" stroke-width=".8"/><rect x="153" y="59.5" width="2.5" height="29" fill="#c49a5c"/><rect x="168.5" y="59.5" width="2.5" height="29" fill="#c49a5c"/><rect x="168.5" y="34" width="2.5" height="22" fill="#c49a5c"/><rect x="154" y="36" width="15" height="3" fill="#d9b37a"/><text x="162" y="98" font-size="5" text-anchor="middle" fill="#3a4a66">chair</text>`;
      return s + '</svg>'; };
    const half = `<div class="half"><div class="ttl">표시해 보세요 — Listen and draw. &nbsp;<span style="font-weight:400;color:#5a6b85;font-size:9.5pt">Name: ____________</span></div>${scene()}<div style="font-size:9.5pt;color:#5a6b85;margin-top:1.5mm">예) Draw a pencil on the desk. · Draw a nose on the face. · Draw two apples in the bag. · Draw a banana under the chair.</div></div>`;
    P.push(mpage('M16', '표시해 보세요 그림 (짝당 1장 → 반으로 자르기)', `<div style="display:flex;flex-direction:column;gap:4mm;height:100%">${half}${half}</div>`, '✂ 가운데를 잘라 짝에게 한 장씩')); }
  // M17 이름 쪽지 · ○× 쪽지
  { const KO = ['민호','민수','민혁','민지','민영'], EN = ['Mike','Mary','Susan','Johnny','Jennifer']; const all = [...KO, ...EN];
    const slips = all.map(n => `<div class="slip"><div class="nmz">${all.map(x => `<span class="${x===n?'on':''}">${x}</span>`).join('')}</div><div style="font-size:8.5pt;color:#5a6b85;margin-top:1mm">○표 이름이 내 이름 · "I'm ${n}. What's your name?"</div></div>`);
    const ox = [`<div class="slip" style="border-color:#c9507a"><div class="ox" style="color:#c9507a">○</div><div style="font-size:9pt;text-align:center">Today's my birthday! &nbsp; I'm <b>____</b> years old.</div></div>`, ...Array(9).fill(`<div class="slip"><div class="ox" style="color:#9fb3c8">×</div><div style="font-size:9pt;text-align:center;color:#5a6b85">Happy birthday! How old are you?</div></div>`)];
    P.push(mpage('M17', '이름 쪽지 (가족찾기) · ○× 쪽지 (생일 축하)', `<div class="sheet-ttl">① 이름 쪽지 10장 — 한국 이름끼리, 외국 이름끼리 가족</div><div class="slips">${slips.join('')}</div><div class="sheet-ttl" style="margin-top:4mm">② ○× 쪽지 10장 — ○ 1장 + × 9장</div><div class="slips">${ox.join('')}</div>`, '✂ 잘라서 접은 뒤 책상 위에 흩어 놓기')); }
  // M18 가면 도안
  { const s = svgOpen(182, 215) + `<ellipse cx="91" cy="105" rx="68" ry="85" fill="#fff8e8" stroke="#1d3f7a" stroke-width="1.4"/>
      <ellipse cx="64" cy="88" rx="13" ry="8" fill="#fff" stroke="#1d3f7a" stroke-width="1" stroke-dasharray="2.5 1.5"/><ellipse cx="118" cy="88" rx="13" ry="8" fill="#fff" stroke="#1d3f7a" stroke-width="1" stroke-dasharray="2.5 1.5"/>
      <text x="64" y="90" font-size="4" text-anchor="middle" fill="#8a97ab">eye · 오려내기</text><text x="118" y="90" font-size="4" text-anchor="middle" fill="#8a97ab">eye · 오려내기</text>
      <path d="M91,100 l-7,22 l14,0 z" fill="none" stroke="#9fb3c8" stroke-width=".9" stroke-dasharray="2 2"/><text x="91" y="130" font-size="4" text-anchor="middle" fill="#8a97ab">nose</text>
      <path d="M68,150 q23,22 46,0" fill="none" stroke="#9fb3c8" stroke-width=".9" stroke-dasharray="2 2"/><text x="91" y="166" font-size="4" text-anchor="middle" fill="#8a97ab">mouth</text>
      <circle cx="26" cy="105" r="2.2" fill="none" stroke="#1d3f7a" stroke-width=".8"/><circle cx="156" cy="105" r="2.2" fill="none" stroke="#1d3f7a" stroke-width=".8"/>
      <text x="26" y="114" font-size="3.6" text-anchor="middle" fill="#8a97ab">고무줄 구멍</text><text x="156" y="114" font-size="3.6" text-anchor="middle" fill="#8a97ab">고무줄 구멍</text></svg>`;
    const rule = `<div style="background:var(--cream);border-radius:8px;padding:3mm 4mm;font-size:10.5pt;line-height:1.6;margin-top:3mm"><b>교사 지시 예:</b> Draw two ears and color them. · Draw a red nose. · Draw a black mouth. · Draw yellow hair. &nbsp;<b>역할놀이:</b> "Put on your face." → "You have a red nose and a black mouth." / "How many ears can you see?"</div>`;
    P.push(mpage('M18', '가면 도안 (Make a mask)', s + rule, '두꺼운 종이에 인쇄 · 눈 오려내기 · 뒤에 막대 붙이기 또는 구멍에 고무줄')); }
  // M19 Twenty Questions 포스터
  { const Q = [['색 Color','Is it red? / blue? / yellow? / green? / black? / white?','teal'],['크기·모양 Size · Shape','Is it big? / small? / long? / short? / round? / Is it like a stick?','blue'],['재료 Material','Is it made of plastic? / wood? / paper? / cloth? / metal? / glass?','violet'],['장소 Place','Is it in the house? / in the kitchen? / at school? / in the pool?','orange'],['쓰임 Use','Can you eat it? / wear it? / play with it? / Is it made in a factory?','green'],['마지막 Final Guess','Is it a(n) ______?','rose']];
    const rows = chunk(Q, 2).map(pair => `<div class="row">${pair.map(([t, q, c]) => `<div class="q c-${c}"><b>${esc(t)}</b><div>${esc(q)}</div></div>`).join('')}</div>`).join('');
    P.push(mpage('M19', 'Twenty Questions 질문 힌트 포스터', `<div class="poster"><h3>What's in the box? 🎁 — 스무 번 안에 맞혀라!</h3><div style="text-align:center;color:#3a4a66;font-size:10.5pt;margin-bottom:3mm">대답은 <b>Yes</b> / <b>No</b> 로만!</div>${rows}<div class="sheet-ttl">질문 횟수 세기 (한 번 물을 때마다 ✓)</div><div class="tally">${'<i></i>'.repeat(20)}</div></div>`, '칠판에 붙여 두고 학생이 질문 틀을 고르게 하기')); }
  // M20 얼굴판
  { P.push(mpage('M20', "I like / I don't like 얼굴판", `<div style="display:flex;flex-direction:column;gap:4mm;height:100%"><div class="sign" style="border-color:#3f9a48"><div class="emo" style="font-size:120pt">😋</div><div class="sm" style="font-size:24pt;font-weight:700;color:#3f9a48">I like ______.</div><div class="sm">A · 좋아요</div></div><div class="sign" style="border-color:#c9507a"><div class="emo" style="font-size:120pt">😖</div><div class="sm" style="font-size:24pt;font-weight:700;color:#c9507a">I don't like ______.</div><div class="sm">B · 싫어요</div></div></div>`, '반으로 잘라 책상에 놓고, 음식 카드(M02)를 아래에 놓기')); }
  // M21 명령어 카드
  { const TPR = [['Stand up.','일어서세요','🧍'],['Sit down.','앉으세요','🪑'],['Point to the door.','문을 가리키세요','🚪'],['Jump three times.','세 번 뛰세요','🦘'],['Clap your hands twice.','손뼉 두 번','👏'],['Touch your nose.','코를 만지세요','👃'],['Raise your left hand.','왼손을 드세요','✋'],['Open your book.','책을 펴세요','📖'],['Close your eyes.','눈을 감으세요','🙈'],['Turn around.','한 바퀴 도세요','🔄'],['Go to the desk.','책상으로 가세요','🚶'],['Put the book on the desk.','책을 책상 위에','📘'],['Sing a song.','노래하세요','🎵'],['Walk slowly.','천천히 걸으세요','🐢'],['Shake hands.','악수하세요','🤝'],['Say hello.','인사하세요','👋']];
    const cards = TPR.map(([e, k, i]) => `<div class="card"><div class="emo" style="font-size:44pt">${i}</div><div class="w" style="font-size:15pt">${esc(e)}</div><div class="k">${k}</div></div>`);
    chunk(cards, 8).forEach((cs, i) => P.push(mpage('M21', `명령어 카드 ${i+1}/3 · TPR (${i*8+1}~${i*8+8})`, `<div class="cards2">${cs.join('')}</div>`, '주장·리더가 카드를 뽑아 읽기 (C-01, C-02, C-03, C-18)')));
    const DRV = [['Go!','앞으로 전진','등 두드리기','🚗'],['Turn right!','오른쪽으로','오른쪽 어깨 치기','➡️'],['Turn left!','왼쪽으로','왼쪽 어깨 치기','⬅️'],['Sit down!','앉기','머리 만지기','⬇️'],['Stand up!','서기','엉덩이 두드리기','⬆️']];
    const dc = DRV.map(([e, k, a, i]) => `<div class="card" style="height:46mm"><div class="emo" style="font-size:34pt">${i}</div><div class="w" style="font-size:16pt">${e}</div><div class="k">${k} → <b style="color:var(--rose)">신호: ${a}</b></div></div>`);
    dc.push(`<div class="card" style="height:46mm;background:var(--cream)"><div class="w" style="font-size:12pt;line-height:1.5;padding:0 4mm;text-align:left">맨 뒷사람만 눈을 뜸.<br>신호는 말 없이 몸으로만 전달.<br>맨 앞사람이 신호대로 움직임.</div></div>`);
    P.push(mpage('M21', '명령어 카드 3/3 · Driving 신호', `<div class="cards2">${dc.join('')}</div>`, '게임 전 신호 규칙 익히기 (C-06 Driving Game)')); }
  // M22 메뉴판
  { const items = [['🍔','Hamburger','햄버거','3,000원'],['🍕','Pizza','피자','4,000원'],['🍗','Chicken','치킨','5,000원'],['🍚','Rice','밥','2,000원'],['🍞','Bread','빵','1,500원'],['🍦','Ice cream','아이스크림','1,000원'],['🎂','Cake','케이크','3,500원'],['🥛','Milk','우유','1,000원'],['🍎','Apple juice','사과주스','1,500원']];
    P.push(mpage('M22', '식당 메뉴판 (Restaurant Role-play)', `<div class="menu"><h3>🍽️ Let's Eat! Restaurant — MENU</h3>${items.map(([e,w,k,p])=>`<div class="it"><span class="emo">${e}</span><span>${w} <span style="font-size:10.5pt;color:#5a6b85">${k}</span></span><span class="pr">${p}</span></div>`).join('')}<div class="dlg"><b>손님:</b> Pizza, please. &nbsp;→&nbsp; <b>주인:</b> Here you are. &nbsp;→&nbsp; <b>손님:</b> Thank you. &nbsp;→&nbsp; <b>주인:</b> You're welcome.<br><span style="color:#5a6b85">확장: "How much is it?" — "It's four thousand won."</span></div></div>`, '그룹당 1장 · 음식 카드(M02)와 함께 사용 (G-01)')); }
  // M23 위치 전치사 카드
  { const box = (fn) => { let s = svgOpen(60, 56) + `<rect x="14" y="18" width="32" height="22" fill="#f1d9a7" stroke="#7a5a2a" stroke-width=".9"/><path d="M14,18 l5,-6 l32,0 l-5,6" fill="#e6c98c" stroke="#7a5a2a" stroke-width=".9"/>`; s += fn(); return s + '</svg>'; };
    const ball = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#c9507a" stroke="#8a2a4a" stroke-width=".8"/>`;
    const PR = [['on','위에', () => ball(30, 7)], ['in','안에', () => ball(30, 29)], ['under','아래에', () => ball(30, 47)], ['behind','뒤에', () => `${ball(50, 7)}<path d="M14,18 l5,-6 l32,0 l-5,6" fill="#e6c98c" stroke="#7a5a2a" stroke-width=".9"/>`], ['next to','옆에', () => ball(53, 35)], ['in front of','앞에', () => ball(22, 46)]];
    const cards = PR.map(([w, k, fn]) => `<div class="card" style="height:78mm">${box(fn)}<div class="w" style="font-size:20pt;margin-top:2mm">${w}</div><div class="k" style="font-size:11pt">${k} · The ball is <b>${w}</b> the box.</div></div>`);
    P.push(mpage('M23', '위치 전치사 카드', `<div class="cards2">${cards.join('')}</div>`, 'B-16, B-17, C-12, F-08 에서 먼저 익히기')); }
  // M24 요일 카드
  { const D = [['Monday','월요일','🌙'],['Tuesday','화요일','🔥'],['Wednesday','수요일','💧'],['Thursday','목요일','🌳'],['Friday','금요일','⭐'],['Saturday','토요일','🏔️'],['Sunday','일요일','☀️'],['Today is ______.','오늘은 … 요일','📅']];
    P.push(mpage('M24', '요일 카드 (What day is it today?)', `<div class="cards2">${D.map(([w,k,e])=>`<div class="card"><div class="emo" style="font-size:40pt">${e}</div><div class="w" style="font-size:22pt">${w}</div><div class="k" style="font-size:11pt">${k}</div></div>`).join('')}</div>`, '칠판에 가로로 붙여 달력처럼 사용 (C-08)')); }
  // M25 사과 개수 카드
  { const cards = Array.from({ length: 10 }, (_, i) => `<div class="card" style="height:46mm"><div class="emo" style="font-size:${i < 5 ? 26 : 20}pt;letter-spacing:1px;text-align:center;line-height:1.15;max-width:80mm">${'🍎'.repeat(i + 1)}</div><div class="k" style="font-size:12pt;margin-top:2mm">How many? &nbsp;<b style="color:var(--navy)">${['one','two','three','four','five','six','seven','eight','nine','ten'][i]}</b></div></div>`);
    P.push(mpage('M25', '사과 개수 카드 1~10 (숫자 따라 줄서기)', `<div class="cards2">${cards.join('')}</div>`, '✂ 잘라서 접은 뒤 한 장씩 뽑기 (E-03)')); }
  return P;
}
function materialsCover(total) {
  const rows = DATA.materials.map(m => `<tr><td style="width:14mm;font-weight:700;color:#fff;background:var(--navy);text-align:center">${m.id}</td><td style="text-align:left;white-space:nowrap">${esc(m.name)}</td><td style="width:14mm;text-align:center">${m.pageNo}</td><td style="font-size:8pt;color:#3a4a66;text-align:left">${useText(m.id, 14)}</td></tr>`).join('');
  return `<div class="page"><div class="cover"><div class="logo-big" style="margin-top:0"><img src="logo.jpg" style="width:60mm"></div>
  <div class="big" style="margin-top:2mm"><div class="en">Let's Play a Game!</div><div class="ko" style="font-size:28pt">초등영어 게임 머트리얼</div><div class="sub">인쇄용 교구 25종 · 매뉴얼 95개 게임 연동</div></div>
  <table class="sheet mcov" style="margin-top:5mm;font-size:9pt"><tr><th>번호</th><th>머트리얼</th><th>쪽</th><th>사용 게임</th></tr>${rows}</table>
  <div class="foot" style="font-size:9pt">두꺼운 종이(180g 이상) 인쇄 · 코팅 권장 · 그림카드(M02)는 기억 게임용으로 2벌 &nbsp;|&nbsp; ON글터 영어·국어 전문학원 · ${DATE}</div></div></div>`;
}

// ───────────────────────── 빌드 ─────────────────────────
const doc = (title, body) => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head><body>${body}</body></html>`;

async function main() {
  const argv = process.argv.slice(2);
  const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1] : null;
  const noPng = argv.includes('--no-png');
  const { chromium } = requirePlaywright();
  const exe = process.env.PLAYWRIGHT_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const page = await b.newPage({ viewport: { width: 820, height: 1200 }, deviceScaleFactor: 1.5 });
  const outDir = slug => { const d = path.join(ROOT, 'output', slug); fs.mkdirSync(d, { recursive: true }); for (const f of ['kr400.woff2', 'kr700.woff2', 'logo.jpg']) fs.copyFileSync(path.join(__dirname, f), path.join(d, f)); return d; };
  async function renderOut(slug, html, label) {
    const d = outDir(slug); for (const f of fs.readdirSync(d)) if (/쪽\.png$/.test(f)) fs.unlinkSync(path.join(d, f));
    const hp = path.join(d, 'index.html'); fs.writeFileSync(hp, html);
    await page.goto('file://' + hp); await page.evaluate(() => document.fonts.ready);
    const pages = page.locator('.page'); const n = await pages.count(); let over = 0;
    for (let i = 0; i < n; i++) {
      const info = await pages.nth(i).evaluate(e => { const c = e.querySelector('.content'); return c ? { sh: c.scrollHeight, ch: c.clientHeight } : { sh: e.scrollHeight, ch: e.clientHeight }; });
      const flag = info.sh > info.ch + 1 ? `  ⚠ 넘침 ${info.sh - info.ch}px` : ''; if (flag) over++;
      if (!noPng) await pages.nth(i).screenshot({ path: path.join(d, `${slug}_${String(i + 1).padStart(2, '0')}쪽.png`) });
      if (flag) console.log(`${label} ${i + 1}쪽${flag}`);
    }
    await page.emulateMedia({ media: 'print' });
    const pdf = path.join(d, `${slug}.pdf`); await page.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.emulateMedia({ media: 'screen' });
    console.log(`${label}: ${n}쪽 → ${path.relative(ROOT, pdf)}${over ? ` (넘침 ${over}쪽)` : ''}`);
    return n;
  }

  if (!only || only === 'manual') {
    // 1) 측정: 블록 높이 + 본문 용량
    const d = outDir('초등영어게임_매뉴얼');
    const measure = async (compactSet) => {
      const blocks = games.map(g => `<div class="mb" data-id="${g.id}">${renderGame(g, compactSet.has(g.id))}</div>`).join('');
      const bans = DATA.chapters.map(c => `<div class="mban" data-id="${c.id}">${banner(c)}</div>`).join('');
      const html = doc('measure', `<div class="page">${hdr('x', 'x')}<div class="content" id="cap"></div></div><div style="width:182mm;background:#fff;margin:0 auto">${bans}${blocks}</div>`);
      const hp = path.join(d, '_measure.html'); fs.writeFileSync(hp, html);
      await page.goto('file://' + hp); await page.evaluate(() => document.fonts.ready);
      const r = await page.evaluate(() => ({ cap: document.getElementById('cap').clientHeight, h: Object.fromEntries([...document.querySelectorAll('.mb,.mban')].map(e => [e.dataset.id, e.firstElementChild.getBoundingClientRect().height])) }));
      fs.unlinkSync(hp); return r;
    };
    let compact = new Set(); let m = await measure(compact);
    const mmPx = 96 / 25.4, gap = 5 * mmPx;
    // 혼자서도 넘치는 블록 → compact
    for (const g of games) if (m.h[g.id] > m.cap) compact.add(g.id);
    if (compact.size) m = await measure(compact);
    // 2) 쪽 배치 (챕터별, 그리디)
    const pagesSpec = []; const pageOf = {};
    for (const c of DATA.chapters) {
      let cur = { ch: c, banner: true, items: [], used: m.h[c.id] + gap };
      for (const g of games.filter(x => x.ch === c.id)) {
        const h = m.h[g.id] + gap;
        if (cur.items.length && cur.used + h > m.cap + 2) { pagesSpec.push(cur); cur = { ch: c, banner: false, items: [], used: 0 }; }
        cur.items.push(g.id); cur.used += h;
      }
      pagesSpec.push(cur);
    }
    const FRONT = 4; const total = FRONT + pagesSpec.length + 3;
    pagesSpec.forEach((p, i) => p.items.forEach(id => pageOf[id] = FRONT + i + 1));
    pageOf.apx1 = FRONT + pagesSpec.length + 1; pageOf.apx2 = pageOf.apx1 + 2;
    const body = [coverPage(), guidePage(total), ...tocPages(pageOf, total),
      ...pagesSpec.map((p, i) => `<div class="page">${hdr(`${p.ch.id}. ${p.ch.title}`, 'Let\'s Play a Game!', p.ch.en)}<div class="content">${p.banner ? banner(p.ch) : ''}${p.items.map(id => renderGame(byId[id], compact.has(id))).join('')}</div><div class="pg">${FRONT + i + 1} / ${total}</div></div>`),
      ...appendixPages(pageOf.apx1, total)].join('\n');
    await renderOut('초등영어게임_매뉴얼', doc('초등영어 게임 매뉴얼', body), '매뉴얼');
    console.log(`  (compact 적용: ${[...compact].join(', ') || '없음'}; 게임 쪽 ${pagesSpec.length})`);
  }
  if (!only || only === 'materials') {
    const mp = materialPages();
    // 머트리얼별 시작 쪽 번호 (표지 1쪽)
    let pn = 2; const seen = {};
    mp.forEach((h, i) => { const id = h.match(/class="mid">(M\d+)</)[1]; if (!seen[id]) { seen[id] = pn; } pn++; });
    DATA.materials.forEach(mm => mm.pageNo = seen[mm.id] || '-');
    const total = mp.length + 1;
    const body = [materialsCover(total), ...mp.map((h, i) => h.replace('__PG__', `${i + 2} / ${total}`))].join('\n');
    await renderOut('초등영어게임_머트리얼', doc('초등영어 게임 머트리얼', body), '머트리얼');
  }
  await b.close();
}
main().catch(e => { console.error(e); process.exit(1); });
