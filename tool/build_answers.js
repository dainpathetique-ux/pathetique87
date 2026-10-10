#!/usr/bin/env node
// 답지 빌더: 워크시트 JSON의 answer 필드 → 정답·예시 답안 PDF (+ 쪽별 PNG)
// 사용: node tool/build_answers.js worksheets/<이름>.json
// 결과: output/<slug>/<slug>_답지.pdf, <slug>_답지_N쪽.png
const fs = require('fs');
const path = require('path');
const { CSS, esc, requirePlaywright, ROOT } = require('./build.js');

const ACSS = `
.ans{margin:0 0 7px 0;padding-left:1.8em;text-indent:-1.8em;word-break:keep-all;font-size:11pt;line-height:1.6}
.ans .n{font-weight:700;display:inline-block;width:1.8em;text-indent:0}
.ans .qq{color:#6b7790;font-size:9.5pt}
.ans .a{display:block;text-indent:0;font-weight:700;color:#1d3f7a}
.ans .a.ex{font-weight:400;color:var(--ink)}
.tag{display:inline-block;font-size:8.5pt;font-weight:700;color:#fff;background:var(--rose);border-radius:8px;padding:0 6px;margin-right:5px;vertical-align:1px}
.ans table{width:100%;margin:3px 0 2px 0;font-size:10.5pt}
.ans td,.ans th{text-indent:0;padding:3px 7px}
.model{white-space:pre-line;border:1.5px solid var(--green);border-radius:6px;padding:6px 10px;margin:4px 0 0 0;font-size:10.5pt;line-height:1.7;text-indent:0;font-weight:400;color:var(--ink)}
.rub th{background:var(--green-l)}
.box.key{font-size:10.5pt}
`;

const ROUND = '①②③④⑤⑥';
const PAREN = '⑴⑵⑶⑷⑸⑹';
const short = q => { const s = String(q||''); return s.length > 60 ? s.slice(0, 58) + '…' : s; };
const arr = a => Array.isArray(a) ? a : (a == null ? [] : [a]);

function answerHtml(it) {
  const a = it.answer;
  const ex = !!it.example;
  const tag = ex ? '<span class="tag">예시 답안</span>' : '';
  if (a == null) return `<span class="a ex">${tag}학생의 생각에 따라 답이 다릅니다.</span>`;
  const withChoice = s => { // "②" → "② 선택지 글"
    const i = ROUND.indexOf(String(s).trim()[0]);
    return (it.choices && i >= 0 && String(s).trim().length === 1) ? `${ROUND[i]} ${it.choices[i]}` : s;
  };
  switch (it.type) {
    case 'choice':
      return `<span class="a">${arr(a).map(s=>esc(withChoice(s))).join(', ')}</span>`;
    case 'choice_lines': {
      const [c, ...why] = arr(a);
      return `<span class="a">${esc(withChoice(c))}</span>${why.length?`<span class="a ex">${ex?tag:''}${why.map(esc).join('<br>')}</span>`:''}`;
    }
    case 'fill':
      return `<span class="a">${arr(a).map((s,i)=>`${PAREN[i]} ${esc(s)}`).join(' &nbsp; ')}</span>`;
    case 'table':
      return `<table>${it.rows.map((r,i)=>`<tr><th style="width:${it.labelWidth||16}%">${esc(r)}</th><td>${tag}${esc(arr(a)[i]||'')}</td></tr>`).join('')}</table>`;
    case 'flow':
      return `<table>${it.boxes.map((b,i)=>`<tr><th style="width:30%">${esc(b)}</th><td>${tag}${esc(arr(a)[i]||'')}</td></tr>`).join('')}</table>`;
    case 'numbered_lines': {
      const ls = it.labels || ['①','②'];
      return `<span class="a${ex?' ex':''}">${tag}${arr(a).map((s,i)=>`${esc(ls[i]||'')} ${esc(s)}`).join('<br>')}</span>`;
    }
    case 'yesno':
      return `<span class="a ex">${tag}${arr(a).map(esc).join('<br>')}</span>`;
    default:
      return `<span class="a${ex?' ex':''}">${tag}${arr(a).map(esc).join('<br>')}</span>`;
  }
}

function build(spec) {
  let qn = 0;
  const blocks = [];
  blocks.push(`<div class="box key"><div class="ref">📝 정답과 예시 답안</div>객관식·단답형은 정답, 생각을 묻는 문항은 <span class="tag">예시 답안</span>입니다. 예시와 달라도 글의 내용에 맞고 까닭이 분명하면 정답으로 인정해 주세요.</div>`);
  for (const pg of spec.pages) {
    for (const sec of (pg.sections || [])) {
      blocks.push(`<div class="c-${sec.color||'blue'}"><h2>${esc(sec.title)}</h2></div>`);
      for (const it of sec.items || []) {
        const n = ++qn;
        blocks.push(`<div class="c-${sec.color||'blue'}"><div class="ans"><span class="n">${n}</span><span class="qq">${esc(short(it.q))}</span>${answerHtml(it)}</div></div>`);
      }
    }
    if (pg.writing) {
      const w = pg.writing;
      const n = ++qn;
      blocks.push(`<div class="c-green"><h2>${esc(w.title)}</h2></div>`);
      const out = w.answerOutline ? `<table>${w.answerOutline.map(([k,v])=>`<tr><th style="width:16%">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>` : '';
      const model = w.answer ? `<div class="model">${esc(w.answer)}</div>` : '';
      blocks.push(`<div class="c-green"><div class="ans"><span class="n">${n}</span><span class="qq">${esc(short(w.instruction))}</span><span class="a ex"><span class="tag">예시 답안</span>${out}${model}</span></div></div>`);
      const rub = w.rubric || [
        ['내용', '주제에 맞는 주장(생각)과 까닭 두 가지 이상, 글 속 내용을 근거로 들었다.'],
        ['조직', '처음(주장) – 가운데(까닭·예시) – 끝(마무리)의 짜임이 드러난다.'],
        ['표현', '글 속 핵심 낱말을 알맞게 쓰고, 문장이 자연스럽게 이어진다.'],
        ['맞춤법', '맞춤법·띄어쓰기·문장 부호가 바르고, 요구한 분량을 채웠다.'],
      ];
      blocks.push(`<div class="c-green"><div class="ans" style="padding-left:0;text-indent:0"><b>글쓰기 채점 기준</b> (항목마다 상·중·하)<table class="rub">${rub.map(([k,v])=>`<tr><th style="width:14%">${esc(k)}</th><td>${esc(v)}</td><td style="width:22%;text-align:center">상 · 중 · 하</td></tr>`).join('')}</table></div></div>`);
    }
  }
  const logo = `<div class="logo"><img src="logo.jpg"></div>`;
  const hdr = `<div class="hdr"><div class="hl">${logo}<div><div class="l">${esc(spec.course||'초등논술')} · ${esc(spec.grade||'')} · 답지</div><div class="t">${esc(spec.title)}</div></div></div><div class="r" style="color:var(--rose);font-weight:700">정답과 예시 답안</div></div>`;
  // 블록을 쪽에 차례로 담고, 넘치면 다음 쪽으로 (브라우저에서 측정)
  const script = `
  (function(){
    const blocks = ${JSON.stringify(blocks)};
    const hdr = ${JSON.stringify(hdr)};
    const body = document.body;
    let page, inner;
    const newPage = () => { page = document.createElement('div'); page.className='page'; page.style.cssText='--ln:9mm;--sp:12px;--qm:7px;--td:11mm;--flow:26mm;--h2:10px 0 6px';
      page.innerHTML = hdr; inner = document.createElement('div'); page.appendChild(inner); body.appendChild(page); };
    newPage();
    const limit = () => page.clientHeight - parseFloat(getComputedStyle(page).paddingBottom) - 18;
    for (let i = 0; i < blocks.length; i++) {
      const d = document.createElement('div'); d.innerHTML = blocks[i]; inner.appendChild(d);
      const isHead = /<h2>/.test(blocks[i]) && !/class="ans"/.test(blocks[i]);
      if (d.offsetTop + d.offsetHeight > limit() && inner.children.length > 1) {
        inner.removeChild(d);
        // 영역 제목이 쪽 끝에 홀로 남지 않게
        const last = inner.lastElementChild;
        const carry = last && /<h2>/.test(last.innerHTML) && !/class="ans"/.test(last.innerHTML) ? last : null;
        if (carry) inner.removeChild(carry);
        newPage();
        if (carry) inner.appendChild(carry);
        inner.appendChild(d);
      }
    }
    const pages = document.querySelectorAll('.page');
    pages.forEach((p,i)=>{ const f=document.createElement('div'); f.className='pg'; f.textContent='답지 '+(i+1)+' / '+pages.length; p.appendChild(f); });
    document.body.dataset.done = '1';
  })();`;
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(spec.title)} 답지</title><style>${CSS}${ACSS}</style></head><body><script>document.fonts.ready.then(()=>{${script}})</script></body></html>`;
}

async function main() {
  const file = process.argv[2];
  if (!file) { console.error('사용: node tool/build_answers.js worksheets/<이름>.json'); process.exit(1); }
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  const slug = spec.slug || path.basename(file, '.json');
  const out = path.join(ROOT, 'output', slug);
  fs.mkdirSync(out, { recursive: true });
  for (const f of ['kr400.woff2','kr700.woff2','logo.jpg']) fs.copyFileSync(path.join(__dirname, f), path.join(out, f));
  const htmlPath = path.join(out, 'answers.html');
  fs.writeFileSync(htmlPath, build(spec));
  const { chromium } = requirePlaywright();
  const exe = process.env.PLAYWRIGHT_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 820, height: 1200 }, deviceScaleFactor: 2 });
  await p.goto('file://' + htmlPath);
  await p.waitForFunction(() => document.body.dataset.done === '1');
  const pages = p.locator('.page');
  const n = await pages.count();
  for (let i = 0; i < n; i++) {
    const png = path.join(out, `${slug}_답지_${i+1}쪽.png`);
    await pages.nth(i).screenshot({ path: png });
    console.log(`답지 ${i+1}쪽: ${path.relative(ROOT, png)}`);
  }
  await p.emulateMedia({ media: 'print' });
  const pdf = path.join(out, `${slug}_답지.pdf`);
  await p.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log(`답지 PDF: ${path.relative(ROOT, pdf)}`);
  await b.close();
}
main().catch(e => { console.error(e); process.exit(1); });
