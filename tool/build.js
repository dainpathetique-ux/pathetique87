#!/usr/bin/env node
// 초등논술 워크시트 빌더: JSON 내용 → HTML → PNG(쪽별) + PDF
// 사용: node tool/build.js worksheets/<이름>.json  [--no-pdf]
const fs = require('fs');
const path = require('path');

function requirePlaywright() {
  try { return require('playwright'); } catch (e) {}
  const { execSync } = require('child_process');
  const g = execSync('npm root -g').toString().trim();
  return require(path.join(g, 'playwright'));
}

const ROOT = path.resolve(__dirname, '..');
const A4_PX = 1123; // 297mm @ 96dpi

const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
// 텍스트 안의 ___ (3개 이상) 는 답 빈칸으로 변환. 밑줄 개수 × 6mm
const txt = s => esc(s).replace(/_{3,}/g, m => `<span class="bl" style="min-width:${m.length*6}mm"></span>`);

const SPACING = {
  tight:  { ln: '7.5mm', sp: '10px', qm: '5px', td: '9mm',  flow: '22mm', h2: '10px 0 6px' },
  normal: { ln: '9mm',   sp: '12px', qm: '7px', td: '11mm', flow: '26mm', h2: '12px 0 8px' },
  loose:  { ln: '10.5mm',sp: '18px', qm: '9px', td: '14mm', flow: '34mm', h2: '14px 0 10px' },
};

const CSS = `
@font-face{font-family:"NKR";src:url(kr400.woff2) format("woff2");font-weight:400}
@font-face{font-family:"NKR";src:url(kr700.woff2) format("woff2");font-weight:700}
:root{--ink:#2b2f3a;--line:#9fb3c8;--teal:#1f8a86;--blue:#2f6fcb;--violet:#7a57c9;--orange:#e07b2a;--green:#3f9a48;--rose:#c9507a;
--teal-l:#e3f4f3;--blue-l:#e6eefb;--violet-l:#eee8fa;--orange-l:#fdeee0;--green-l:#e7f4e8;--rose-l:#fbe7ee;--cream:#fff8e8}
*{box-sizing:border-box}
body{margin:0;background:#888;font-family:"NKR",sans-serif;color:var(--ink);font-size:12pt;line-height:1.55}
.page{width:210mm;height:297mm;background:#fff;padding:13mm 15mm 12mm;margin:0 auto 10px;position:relative;overflow:hidden}
@page{size:A4;margin:0}
@media print{body{background:none}.page{margin:0;page-break-after:always;break-after:page}}
.hdr{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid var(--blue);padding-bottom:5px;margin-bottom:10px}
.hdr .hl{display:flex;align-items:center;gap:4mm}
.hdr .logo{width:45mm;height:13mm;overflow:hidden;flex:none}
.hdr .logo img{width:56mm;margin:-6.2mm 0 0 -5.6mm;display:block}
.hdr .l{font-size:9.5pt;color:#5a6b85}.hdr .t{font-size:15pt;font-weight:700;line-height:1.25;color:#1d3f7a;word-break:keep-all}
.hdr .r{font-size:10.5pt;text-align:right;color:#3a4a66;white-space:nowrap}
.hdr .r span{display:inline-block;border-bottom:1px solid #3a4a66;min-width:34mm;margin-left:4px}
.box{word-break:keep-all;border:1.5px solid #e2c98a;background:var(--cream);border-radius:6px;padding:8px 12px;margin-bottom:12px;font-size:11.5pt;line-height:1.7}
.box .cap{font-size:9pt;color:#8a6d2b;margin-bottom:4px}
.box .ttl{font-weight:700;text-align:center;margin-bottom:3px;color:#5c4511}
.box .ref{font-weight:700;color:#5c4511}
h2{font-size:13pt;margin:var(--h2);padding:3px 12px;color:#fff;display:inline-block;border-radius:14px}
.c-teal h2{background:var(--teal)}.c-blue h2{background:var(--blue)}.c-violet h2{background:var(--violet)}.c-orange h2{background:var(--orange)}.c-green h2{background:var(--green)}.c-rose h2{background:var(--rose)}
.c-teal .n{color:var(--teal)}.c-blue .n{color:var(--blue)}.c-violet .n{color:var(--violet)}.c-orange .n{color:var(--orange)}.c-green .n{color:var(--green)}.c-rose .n{color:var(--rose)}
.c-teal th{background:var(--teal-l)}.c-blue th{background:var(--blue-l)}.c-violet th{background:var(--violet-l)}.c-orange th{background:var(--orange-l)}.c-green th{background:var(--green-l)}.c-rose th{background:var(--rose-l)}
.c-teal .flow .c,.c-teal .flow .a{border-color:var(--teal);color:var(--teal)}.c-blue .flow .c,.c-blue .flow .a{border-color:var(--blue);color:var(--blue)}
.c-violet .flow .c,.c-violet .flow .a{border-color:var(--violet);color:var(--violet)}.c-orange .flow .c,.c-orange .flow .a{border-color:var(--orange);color:var(--orange)}
.c-green .flow .c,.c-green .flow .a{border-color:var(--green);color:var(--green)}.c-rose .flow .c,.c-rose .flow .a{border-color:var(--rose);color:var(--rose)}
.c-teal .tip{background:var(--teal-l)}.c-blue .tip{background:var(--blue-l)}.c-violet .tip{background:var(--violet-l)}.c-orange .tip{background:var(--orange-l)}.c-green .tip{background:var(--green-l)}.c-rose .tip{background:var(--rose-l)}
.q{margin:0 0 var(--qm) 0;padding-left:1.8em;text-indent:-1.8em;word-break:keep-all}
.q .n{font-weight:700;display:inline-block;width:1.8em;text-indent:0}
.ch{margin:2px 0 0 1.8em;text-indent:0;display:flex;flex-wrap:wrap;gap:2px 18px}
.bl{display:inline-block;border-bottom:1px solid var(--ink);min-width:28mm;height:1.1em;vertical-align:bottom}
.ln{border-bottom:1px solid var(--line);height:var(--ln);margin:0 0 0 1.8em}
.sp{margin-bottom:var(--sp)}
table{border-collapse:collapse;width:calc(100% - 1.8em);margin:4px 0 8px 1.8em;font-size:11pt}
td,th{border:1px solid var(--line);padding:4px 8px;vertical-align:top}
th{font-weight:700;text-align:center}
td.h{height:var(--td)}
.wr{margin-left:1.8em}
.grid{margin:6px 0 0 0;border:1.5px solid var(--green)}
.grid .r{display:grid;grid-template-columns:repeat(20,1fr);border-bottom:1px solid #b9d9bc}
.grid .r:nth-child(5n){border-bottom:1.5px solid var(--green)}
.grid .r:last-child{border-bottom:none}
.grid i{display:block;border-right:1px solid #b9d9bc;height:8mm}
.grid i:last-child{border-right:none}
.gcap{text-align:right;font-size:9pt;color:#5a7a5e;margin-top:2px}
.wlines .ln{height:10mm;margin-left:0}
.chk{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:1fr 1fr;gap:3px 12px;font-size:11pt}
.chk li::before{content:"☐ ";font-size:12pt;color:var(--green)}
.pg{position:absolute;bottom:7mm;left:0;right:0;text-align:center;font-size:8.5pt;color:#8a97ab}
.flow{display:flex;align-items:stretch;margin:4px 0 8px 1.8em}
.flow .c{flex:1;border:1.5px solid;border-radius:6px;padding:4px 8px;min-height:var(--flow);font-size:10.5pt;color:var(--ink)!important}
.flow .c b{display:block;font-size:10pt;margin-bottom:2px}
.flow .a{align-self:center;padding:0 5px;font-size:16pt}
.note{border:1.5px dashed var(--green);border-radius:6px;padding:6px 10px;margin-top:8px;font-size:10.5pt;min-height:19mm;color:#3a4a66}
.note b{color:var(--green)}
.tip{border-radius:6px;padding:5px 10px;font-size:10.5pt;color:#4a3a7a;margin:0 0 8px 1.8em}
`;

let qn = 0; // 문항 번호 (영역을 넘어 이어짐)
const lines = n => '<div class="ln"></div>'.repeat(n || 1);

function renderItem(it) {
  const n = ++qn;
  const q = `<p class="q"><span class="n">${n}</span>${txt(it.q)}</p>`;
  const choices = c => `<div class="ch">${c.map((s,i)=>`<span>${'①②③④⑤⑥'[i]} ${txt(s)}</span>`).join('')}</div>`;
  switch (it.type) {
    case 'choice':
      return q + choices(it.choices).replace('class="ch"','class="ch sp"');
    case 'choice_lines':
      return q + choices(it.choices) + lines(it.lines||1) + `<div class="sp"></div>`;
    case 'lines':
      return q + lines(it.lines||2) + `<div class="sp"></div>`;
    case 'label_lines': { // 라벨 + 줄 (예: 반대말: ____ 그 뒤 줄)
      return q + `<div class="wr">${txt(it.label)}</div>` + lines(it.lines||2) + `<div class="sp"></div>`;
    }
    case 'fill': { // 보기 상자 + 문장 빈칸
      const box = it.box ? `<table><tr><th style="width:14%">보기</th><td>${it.box.map(esc).join(' &nbsp;·&nbsp; ')}</td></tr></table>` : '';
      const its = it.items.map((s,i)=>`${'⑴⑵⑶⑷⑸⑹'[i]} ${txt(s)}`).join('<br>');
      return q + box + `<div class="wr sp">${its}</div>`;
    }
    case 'table': { // 행 라벨 표
      const rows = it.rows.map(r=>`<tr><th style="width:${it.labelWidth||14}%">${esc(r)}</th><td class="h"></td></tr>`).join('');
      return q + `<table class="sp">${rows}</table>`;
    }
    case 'numbered_lines': // ①, ② 각각 줄
      return q + (it.labels||['①','②']).map(l=>`<div class="wr">${esc(l)}</div>`+lines(1)).join('') + `<div class="sp"></div>`;
    case 'flow': {
      const boxes = it.boxes.map(b=>`<div class="c"><b>${esc(b)}</b></div>`).join('<div class="a">▶</div>');
      return q + `<div class="flow">${boxes}</div>`;
    }
    case 'yesno': { // 찬성/반대 + 이유 줄
      const opts = (it.options||['찬성','반대']).map(o=>`☐ ${esc(o)}`).join(' &nbsp;&nbsp; ');
      const ls = (it.labels||['이유 ①','이유 ②']).map(l=>`<div class="wr">${esc(l)}</div>`+lines(1)).join('');
      return q + `<div class="wr">${opts}</div>` + ls + `<div class="sp"></div>`;
    }
    default:
      throw new Error(`알 수 없는 문항 type: ${it.type}`);
  }
}

function renderSection(sec) {
  const tip = sec.tip ? `<div class="tip">💡 ${txt(sec.tip)}</div>` : '';
  return `<div class="c-${sec.color||'blue'}"><h2>${esc(sec.title)}</h2>${tip}${(sec.items||[]).map(renderItem).join('')}</div>`;
}

function renderPassage(p) {
  if (!p) return '';
  const cap = p.note ? `<div class="cap">${esc(p.note)}</div>` : '';
  if (p.ref) { // 교재 참조형 (원문 재수록 안 함)
    const quote = p.quote ? `<div style="margin-top:4px">“${txt(p.quote)}”</div>` : '';
    return `<div class="box">${cap}<div class="ref">📖 ${esc(p.ref)}</div>${quote}</div>`;
  }
  return `<div class="box">${cap}<div class="ttl">${esc(p.title||'')}</div>${esc(p.text||'')}</div>`;
}

function renderWriting(w) {
  const n = ++qn;
  const outline = w.outline ? `<table>${w.outline.map(([k,v])=>`<tr><th style="width:16%">${esc(k)}</th><td style="height:10mm">${txt(v||'')}</td></tr>`).join('')}</table>` : '';
  let body;
  if (w.lines) {
    body = `<div class="wlines">${'<div class="ln"></div>'.repeat(w.lines)}</div>`;
  } else {
    const rows = Math.ceil((w.cells||300)/20);
    body = `<div class="grid">${('<div class="r">'+'<i></i>'.repeat(20)+'</div>').repeat(rows)}</div>
    <div class="gcap">한 줄 20자 · 다섯 줄마다 100자 (굵은 선)</div>`;
  }
  const chk = w.checklist ? `<h2 style="margin-top:8px">${esc(w.checklistTitle||'스스로 점검')}</h2><ul class="chk">${w.checklist.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>` : '';
  const note = w.teacherNote===false ? '' : `<div class="note"><b>${esc(w.teacherNoteLabel||'선생님 한마디')}</b></div>`;
  return `<div class="c-green"><h2>${esc(w.title)}</h2><p class="q"><span class="n">${n}</span>${txt(w.instruction)}</p>${outline}${body}${chk}${note}</div>`;
}

function build(spec) {
  qn = 0;
  const total = spec.pages.length;
  const logoSrc = spec.logo === false ? null : (spec.logo || (fs.existsSync(path.join(__dirname,'logo.jpg')) ? 'logo.jpg' : null));
  const logo = logoSrc ? `<div class="logo"><img src="logo.jpg"></div>` : '';
  const acad = logoSrc ? '' : esc(spec.academy||'[학원명]')+' ';
  const hdr = (i) => `<div class="hdr"><div class="hl">${logo}<div><div class="l">${acad}${esc(spec.course||'초등논술')} · ${esc(spec.grade||'')}</div><div class="t">${esc(spec.title)}</div></div></div>
   <div class="r">이름<span></span>${i===0?'<br>날짜 <span style="min-width:40mm"></span>':''}</div></div>`;
  const pages = spec.pages.map((pg, i) => {
    const sp = SPACING[pg.spacing||'normal'] || SPACING.normal;
    const style = `--ln:${sp.ln};--sp:${sp.sp};--qm:${sp.qm};--td:${sp.td};--flow:${sp.flow};--h2:${sp.h2}`;
    let inner = '';
    if (pg.passage) inner += renderPassage(pg.passage);
    if (pg.sections) inner += pg.sections.map(renderSection).join('');
    if (pg.writing) inner += renderWriting(pg.writing);
    return `<div class="page" style="${style}">${hdr(i)}${inner}<div class="pg">${i+1} / ${total}</div></div>`;
  }).join('\n');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(spec.title)}</title><style>${CSS}</style></head><body>${pages}</body></html>`;
}

async function main() {
  const file = process.argv[2];
  if (!file) { console.error('사용: node tool/build.js worksheets/<이름>.json [--no-pdf]'); process.exit(1); }
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  const slug = spec.slug || path.basename(file, '.json');
  const out = path.join(ROOT, 'output', slug);
  fs.mkdirSync(out, { recursive: true });
  for (const f of ['kr400.woff2','kr700.woff2']) fs.copyFileSync(path.join(__dirname, f), path.join(out, f));
  if (spec.logo !== false) { const lp = spec.logo ? path.resolve(ROOT, spec.logo) : path.join(__dirname,'logo.jpg'); if (fs.existsSync(lp)) fs.copyFileSync(lp, path.join(out,'logo.jpg')); }
  const html = build(spec);
  const htmlPath = path.join(out, 'worksheet.html');
  fs.writeFileSync(htmlPath, html);

  const { chromium } = requirePlaywright();
  const exe = process.env.PLAYWRIGHT_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 820, height: 1200 }, deviceScaleFactor: 2 });
  await p.goto('file://' + htmlPath);
  await p.evaluate(() => document.fonts.ready);
  const pages = p.locator('.page');
  const n = await pages.count();
  let overflow = false;
  for (let i = 0; i < n; i++) {
    const h = await pages.nth(i).evaluate(e => e.scrollHeight);
    const png = path.join(out, `${slug}_${i+1}쪽.png`);
    await pages.nth(i).screenshot({ path: png });
    const flag = h > A4_PX ? `  ⚠ 넘침 ${h-A4_PX}px (spacing을 tight로 낮추거나 문항·줄을 줄이세요)` : '';
    if (h > A4_PX) overflow = true;
    console.log(`${i+1}쪽: ${path.relative(ROOT, png)}${flag}`);
  }
  if (!process.argv.includes('--no-pdf')) {
    await p.emulateMedia({ media: 'print' });
    const pdf = path.join(out, `${slug}.pdf`);
    await p.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(`PDF: ${path.relative(ROOT, pdf)}`);
  }
  await b.close();
  if (overflow) { console.error('일부 쪽이 A4를 넘었습니다. JSON을 고친 뒤 다시 빌드하세요.'); process.exit(2); }
}
module.exports = { CSS, SPACING, esc, txt, requirePlaywright, ROOT, A4_PX };
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
