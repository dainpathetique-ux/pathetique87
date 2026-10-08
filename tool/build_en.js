#!/usr/bin/env node
// 초등영어 단원 워크시트 빌더: JSON 내용 → HTML → PNG(쪽별) + PDF
// 사용: node tool/build_en.js worksheets/<이름>.json  [--no-pdf]
// 규격: tool/SCHEMA_EN.md
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
// ___ (3개 이상) → 긴 빈칸(밑줄 수 × 6mm), 홑 _ → 글자 한 칸 상자
const txt = s => esc(s)
  .replace(/_{3,}/g, m => `<span class="bl" style="min-width:${m.length*6}mm"></span>`)
  .replace(/_/g, '<span class="lb"></span>');

const SPACING = {
  tight:  { ln: '7.5mm', sp: '8px',  qm: '5px', td: '8.5mm', fl: '9mm',  h2: '8px 0 5px' },
  normal: { ln: '9mm',   sp: '12px', qm: '7px', td: '10mm',  fl: '10mm', h2: '11px 0 7px' },
  loose:  { ln: '10.5mm',sp: '16px', qm: '9px', td: '12mm',  fl: '11mm', h2: '14px 0 9px' },
};

const CSS = `
@font-face{font-family:"NKR";src:url(kr400.woff2) format("woff2");font-weight:400}
@font-face{font-family:"NKR";src:url(kr700.woff2) format("woff2");font-weight:700}
:root{--ink:#2b2f3a;--line:#9fb3c8;--teal:#1f8a86;--blue:#2f6fcb;--violet:#7a57c9;--orange:#e07b2a;--green:#3f9a48;--rose:#c9507a;
--teal-l:#e3f4f3;--blue-l:#e6eefb;--violet-l:#eee8fa;--orange-l:#fdeee0;--green-l:#e7f4e8;--rose-l:#fbe7ee;--cream:#fff8e8}
*{box-sizing:border-box}
body{margin:0;background:#888;font-family:"NKR",sans-serif;color:var(--ink);font-size:12pt;line-height:1.55}
.page{width:210mm;height:297mm;background:#fff;padding:12mm 15mm 12mm;margin:0 auto 10px;position:relative;overflow:hidden}
@page{size:A4;margin:0}
@media print{body{background:none}.page{margin:0;page-break-after:always;break-after:page}}
.hdr{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid var(--blue);padding-bottom:5px;margin-bottom:8px}
.hdr .hl{display:flex;align-items:center;gap:4mm}
.hdr .logo{width:45mm;height:13mm;overflow:hidden;flex:none}
.hdr .logo img{width:56mm;margin:-6.2mm 0 0 -5.6mm;display:block}
.hdr .l{font-size:9.5pt;color:#5a6b85}.hdr .t{font-size:15pt;font-weight:700;line-height:1.25;color:#1d3f7a;word-break:keep-all}
.hdr .t small{font-size:11pt;color:#5a6b85;font-weight:400;margin-left:6px}
.hdr .r{font-size:10.5pt;text-align:right;color:#3a4a66;white-space:nowrap}
.hdr .r span{display:inline-block;border-bottom:1px solid #3a4a66;min-width:34mm;margin-left:4px}
.plan{display:flex;gap:6px;margin:0 0 6px;font-size:9.5pt;color:#3a4a66}
.plan div{flex:1;border:1px solid var(--line);border-radius:14px;padding:2px 8px;text-align:center;background:#f5f8fc}
.plan b{color:var(--blue)}
.box{word-break:keep-all;border:1.5px solid #e2c98a;background:var(--cream);border-radius:6px;padding:5px 12px;margin-bottom:6px;font-size:11pt;line-height:1.6}
.box .cap{font-size:9pt;color:#8a6d2b;margin-bottom:2px}
.box .row{display:flex;flex-wrap:wrap;gap:2px 14px}
.box .row span b{color:#5c4511}
h2{font-size:13pt;margin:var(--h2);padding:3px 12px;color:#fff;display:inline-block;border-radius:14px}
.c-teal h2{background:var(--teal)}.c-blue h2{background:var(--blue)}.c-violet h2{background:var(--violet)}.c-orange h2{background:var(--orange)}.c-green h2{background:var(--green)}.c-rose h2{background:var(--rose)}
.c-teal .n{color:var(--teal)}.c-blue .n{color:var(--blue)}.c-violet .n{color:var(--violet)}.c-orange .n{color:var(--orange)}.c-green .n{color:var(--green)}.c-rose .n{color:var(--rose)}
.c-teal th{background:var(--teal-l)}.c-blue th{background:var(--blue-l)}.c-violet th{background:var(--violet-l)}.c-orange th{background:var(--orange-l)}.c-green th{background:var(--green-l)}.c-rose th{background:var(--rose-l)}
.c-teal .tip{background:var(--teal-l)}.c-blue .tip{background:var(--blue-l)}.c-violet .tip{background:var(--violet-l)}.c-orange .tip{background:var(--orange-l)}.c-green .tip{background:var(--green-l)}.c-rose .tip{background:var(--rose-l)}
.q{margin:0 0 var(--qm) 0;padding-left:1.8em;text-indent:-1.8em;word-break:keep-all}
.q .n{font-weight:700;display:inline-block;width:1.8em;text-indent:0}
.bl{display:inline-block;border-bottom:1px solid var(--ink);min-width:28mm;height:1.1em;vertical-align:bottom}
.lb{display:inline-block;width:6.5mm;height:1.25em;border:1px solid var(--ink);border-radius:2px;vertical-align:middle;margin:0 1px;background:#fff}
.ln{border-bottom:1px solid var(--line);height:var(--ln);margin:0 0 0 1.8em}
.sp{margin-bottom:var(--sp)}
.wr{margin-left:1.8em}
table{border-collapse:collapse;width:calc(100% - 1.8em);margin:4px 0 6px 1.8em;font-size:11pt}
td,th{border:1px solid var(--line);padding:2px 8px;vertical-align:middle}
th{font-weight:700;text-align:center}
td.h{height:var(--td)}
td.c{text-align:center}
.tip{border-radius:6px;padding:4px 10px;font-size:10.5pt;color:#4a3a7a;margin:0 0 6px 1.8em}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:2px 24px;margin:2px 0 0 1.8em;font-size:12.5pt}
.grid2 div{padding:2px 0}
.grid2 small{font-size:10pt;color:#5a6b85}
.sel{display:grid;grid-template-columns:1fr 1fr;gap:3px 20px;margin:2px 0 0 1.8em}
.list{margin:0 0 0 1.8em}
.list div{margin:3px 0}
.match{display:flex;justify-content:space-between;margin:4px 0 0 1.8em;gap:30mm}
.match ul{list-style:none;margin:0;padding:0;flex:1}
.match li{border:1px solid var(--line);border-radius:5px;padding:3px 10px;margin:0 0 6px;background:#fff;position:relative;font-size:11.5pt}
.match .L li::after{content:"●";position:absolute;right:-7mm;top:50%;transform:translateY(-50%);font-size:8pt;color:var(--blue)}
.match .R li::before{content:"●";position:absolute;left:-7mm;top:50%;transform:translateY(-50%);font-size:8pt;color:var(--blue)}
.fl{margin:4px 0 0 1.8em}
.fl .r{display:flex;align-items:stretch;gap:6px;margin-bottom:4px}
.fl .lab{width:7mm;flex:none;padding-top:1mm;font-size:11pt}
.fl .four{flex:1;height:var(--fl);position:relative;
  background:linear-gradient(#b7c6d9,#b7c6d9) top/100% 1px no-repeat,
             repeating-linear-gradient(90deg,#c9d4e2 0 4px,transparent 4px 8px) 0 33%/100% 1px no-repeat,
             linear-gradient(#5a6b85,#5a6b85) 0 66%/100% 1px no-repeat,
             linear-gradient(#b7c6d9,#b7c6d9) bottom/100% 1px no-repeat}
.fl .four .m{position:absolute;left:3mm;top:0;height:66%;display:flex;align-items:flex-end;font-size:15pt;color:#b0b8c6;letter-spacing:.5px;line-height:1;padding-bottom:1px}
.fl .four .pre{position:absolute;left:3mm;top:0;height:66%;display:flex;align-items:flex-end;font-size:12.5pt;color:var(--ink);line-height:1;padding-bottom:2px}
.chk{list-style:none;padding:0;margin:0 0 0 1.8em;display:grid;grid-template-columns:1fr 1fr;gap:3px 12px;font-size:11pt}
.chk li::before{content:"☐ ";font-size:12pt;color:var(--green)}
.stamp{display:flex;gap:8px;margin:6px 0 0 1.8em}
.stamp .b{flex:1;border:1.5px dashed var(--green);border-radius:6px;padding:5px 10px;min-height:16mm;font-size:10.5pt;color:#3a4a66}
.stamp .s{width:32mm;flex:none;border:1.5px solid var(--green);border-radius:6px;text-align:center;font-size:10pt;color:var(--green);padding-top:3px}
.stamp b{color:var(--green)}
.pg{position:absolute;bottom:7mm;left:0;right:0;text-align:center;font-size:8.5pt;color:#8a97ab}
`;

let qn = 0;
const lines = n => '<div class="ln"></div>'.repeat(n || 1);
const circ = i => '⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽'[i] || `(${i+1})`;
const four = (pre, model, lab) => `<div class="r"><div class="lab">${lab||''}</div><div class="four">${model?`<span class="m">${esc(model)}</span>`:''}${pre?`<span class="pre">${txt(pre)}</span>`:''}</div></div>`;

function renderItem(it) {
  const n = ++qn;
  const q = `<p class="q"><span class="n">${n}</span>${txt(it.q)}</p>`;
  const box = it.box ? `<table style="margin-top:0"><tr><th style="width:14%">보기</th><td>${it.box.map(esc).join(' &nbsp;·&nbsp; ')}</td></tr></table>` : '';
  switch (it.type) {
    case 'table': { // 열 머리 + 행. 셀이 "" 이면 빈칸
      const head = it.columns ? `<tr>${it.columns.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>` : '';
      const rows = it.rows.map(r=>`<tr>${r.map(c=>`<td class="h${c?' c':''}">${txt(c)}</td>`).join('')}</tr>`).join('');
      return q + `<table class="sp">${head}${rows}</table>`;
    }
    case 'spell': // 2열 격자. 홑 _ 는 글자 상자
      return q + `<div class="grid2 sp">${it.items.map((s,i)=>`<div>${circ(i)} ${txt(s)}</div>`).join('')}</div>`;
    case 'sort': { // 보기 상자 + 분류 표
      const head = `<tr>${it.columns.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>`;
      const rows = `<tr>${it.columns.map(()=>`<td style="height:${(it.rows||4)*9}mm;vertical-align:top"></td>`).join('')}</tr>`;
      return q + box + `<table class="sp">${head}${rows}</table>`;
    }
    case 'match': {
      const L = it.left.map((s,i)=>`<li>${circ(i)} ${esc(s)}</li>`).join('');
      const R = it.right.map((s,i)=>`<li>${'ⓐⓑⓒⓓⓔⓕ'[i]} ${esc(s)}</li>`).join('');
      return q + `<div class="match sp"><ul class="L">${L}</ul><ul class="R">${R}</ul></div>`;
    }
    case 'list': // 문장 목록 (빈칸 ___ 포함), 선택: lines(각 문장 뒤 줄 수)
      return q + box + `<div class="list sp">${it.items.map((s,i)=>`<div>${circ(i)} ${txt(s)}</div>`+(it.lines?lines(it.lines).replace(/margin:0 0 0 1.8em/g,''):'')).join('')}</div>`;
    case 'select': // ○표 고르기
      return q + `<div class="sel sp">${it.items.map((s,i)=>`<div>${circ(i)} ${txt(s)}</div>`).join('')}</div>`;
    case 'fourlines': { // 영어 4선. items: 문자열(모델 글자) 또는 {label, model, pre}
      const rows = it.items.map((x,i)=>{
        const o = typeof x === 'string' ? { model: x } : x;
        const t = o.text ? `<div style="margin:2px 0 1px 2mm">${circ(i)} ${txt(o.text)}</div>` : '';
        return t + four(o.pre, o.model, o.label ?? (it.numbered===false ? '' : circ(i)));
      }).join('');
      return q + box + `<div class="fl sp">${rows}</div>`;
    }
    case 'lines':
      return q + lines(it.lines||2) + `<div class="sp"></div>`;
    default:
      throw new Error(`알 수 없는 문항 type: ${it.type}`);
  }
}

function renderSection(sec) {
  const tip = sec.tip ? `<div class="tip">💡 ${txt(sec.tip)}</div>` : '';
  let body = (sec.items||[]).map(renderItem).join('');
  if (sec.checklist) body += `<ul class="chk">${sec.checklist.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`;
  if (sec.stamp !== undefined) body += `<div class="stamp"><div class="b"><b>${esc(sec.stamp||'선생님 한마디')}</b></div><div class="s">선생님 확인<br>(도장)</div></div>`;
  return `<div class="c-${sec.color||'blue'}"><h2>${esc(sec.title)}</h2>${tip}${body}</div>`;
}

function renderIntro(p) {
  if (!p) return '';
  const cap = p.note ? `<div class="cap">${esc(p.note)}</div>` : '';
  const words = p.words ? `<div class="row">${p.words.map(([w,m])=>`<span><b>${esc(w)}</b> ${esc(m)}</span>`).join('')}</div>` : '';
  const sents = p.sentences ? `<div class="row" style="margin-top:3px">${p.sentences.map(([e,k])=>`<span><b>${esc(e)}</b> ${esc(k)}</span>`).join('')}</div>` : '';
  return `<div class="box">${cap}${words}${sents}</div>`;
}

function build(spec) {
  qn = 0;
  const total = spec.pages.length;
  const logoSrc = spec.logo === false ? null : (spec.logo || (fs.existsSync(path.join(__dirname,'logo.jpg')) ? 'logo.jpg' : null));
  const logo = logoSrc ? `<div class="logo"><img src="logo.jpg"></div>` : '';
  const acad = logoSrc ? '' : esc(spec.academy||'[학원명]')+' ';
  const plan = spec.plan ? `<div class="plan">${spec.plan.map((s,i)=>`<div><b>${i+1}</b> ${esc(s)}</div>`).join('')}</div>` : '';
  const hdr = (i) => `<div class="hdr"><div class="hl">${logo}<div><div class="l">${acad}${esc(spec.course||'초등영어')} · ${esc(spec.grade||'')}</div><div class="t">${esc(spec.title)}${spec.subtitle?`<small>${esc(spec.subtitle)}</small>`:''}</div></div></div>
   <div class="r">이름<span></span>${i===0?'<br>날짜 <span style="min-width:40mm"></span>':''}</div></div>`;
  const pages = spec.pages.map((pg, i) => {
    const sp = SPACING[pg.spacing||'normal'] || SPACING.normal;
    const style = `--ln:${sp.ln};--sp:${sp.sp};--qm:${sp.qm};--td:${sp.td};--fl:${sp.fl};--h2:${sp.h2}`;
    let inner = i===0 ? plan : '';
    if (pg.intro) inner += renderIntro(pg.intro);
    if (pg.sections) inner += pg.sections.map(renderSection).join('');
    return `<div class="page" style="${style}">${hdr(i)}${inner}<div class="pg">${i+1} / ${total}</div></div>`;
  }).join('\n');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(spec.title)}</title><style>${CSS}</style></head><body>${pages}</body></html>`;
}

async function main() {
  const file = process.argv[2];
  if (!file) { console.error('사용: node tool/build_en.js worksheets/<이름>.json [--no-pdf]'); process.exit(1); }
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  const slug = spec.slug || path.basename(file, '.json');
  const out = path.join(ROOT, 'output', slug);
  fs.mkdirSync(out, { recursive: true });
  for (const f of ['kr400.woff2','kr700.woff2']) fs.copyFileSync(path.join(__dirname, f), path.join(out, f));
  if (spec.logo !== false) { const lp = spec.logo ? path.resolve(ROOT, spec.logo) : path.join(__dirname,'logo.jpg'); if (fs.existsSync(lp)) fs.copyFileSync(lp, path.join(out,'logo.jpg')); }
  const htmlPath = path.join(out, 'worksheet.html');
  fs.writeFileSync(htmlPath, build(spec));

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
    const flag = h > A4_PX ? `  ⚠ 넘침 ${h-A4_PX}px` : `  (여백 ${A4_PX-h}px)`;
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
main().catch(e => { console.error(e); process.exit(1); });
