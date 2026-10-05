// 서술형 문항 검증 + HTML 조립
const fs = require('fs');
const items = require('./items.cjs');

function perms(a){ if(a.length<=1) return [a]; const out=[]; a.forEach((x,i)=>{ perms([...a.slice(0,i),...a.slice(i+1)]).forEach(p=>out.push([x,...p])); }); return out; }
function hash(s){ let h=2166136261; for(const c of s){ h^=c.charCodeAt(0); h=Math.imul(h,16777619)>>>0; } return h; }
function scramble(chunks, seed){
  const idx = chunks.map((c,i)=>i).sort((a,b)=>hash(seed+chunks[a])-hash(seed+chunks[b]));
  const same = idx.every((v,i)=>v===i);
  const order = same ? idx.slice(1).concat(idx[0]) : idx;
  return order.map(i=>chunks[i]);
}
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

let problems = 0; const report = [];
const html = {};
const ids = new Set();
for (const it of items) {
  if (ids.has(it.id)) { problems++; report.push(`DUP id ${it.id}`); } ids.add(it.id);
  if (it.type === 'arr') {
    const answer = it.chunks.join(' ');
    // 1) 모든 어구가 정확히 한 번씩: 순열 중 정답 문장을 만드는 것이 정확히 1개여야 함 (중복 어구 탐지)
    const n = perms(it.chunks).filter(p => p.join(' ') === answer).length;
    if (n !== 1) { problems++; report.push(`AMBIG(dup chunk) ${it.id}: ${n}`); }
    // 2) 단어 단위 일치: 어구 토큰 연결 == 정답 토큰
    const toks = it.chunks.flatMap(c => c.split(/\s+/)).join(' ');
    if (toks !== answer.split(/\s+/).join(' ')) { problems++; report.push(`TOKEN ${it.id}`); }
    // 3) 등위접속사로 끝나는 어구 → 교환 가능성 경고(수동 검토용)
    it.chunks.forEach(c => { if (/\b(and|or)$/.test(c) && it.chunks.filter(x=>/\b(and|or)$/.test(x)).length>1) report.push(`WARN coord ${it.id}: "${c}"`); });
    if (it.chunks.some(c => !c.trim())) { problems++; report.push(`EMPTY ${it.id}`); }
    const full = [it.lead, answer, it.tail].filter(Boolean).join(' ').replace(/\s+([,.])/g,'$1');
    report.push(`OK ${it.id.padEnd(5)} | ${full}`);
    const bogi = scramble(it.chunks, it.id).map(esc).join(' / ');
    const blank = it.lead || it.tail ? '<u>&nbsp;(A)&nbsp;</u>' : '<u>&nbsp;(A)&nbsp;</u>';
    const sent = [it.lead ? esc(it.lead) : '', blank, it.tail ? esc(it.tail) : ''].filter(Boolean).join(' ').replace(/\s+([,.])/g,'$1');
    html[it.id] = `<div class="wr"><b class="wl">서술형</b> <span class="kind">${esc(it.kind)}</span> ${sent} <span class="bogi">&lt;보기&gt; ${bogi}</span> <span class="ans">▶ ${esc(answer)}${it.note ? ' · ' + esc(it.note) : ''}</span></div>`;
  } else {
    report.push(`OK ${it.id.padEnd(5)} | ${it.text} => ${it.answer}`);
    html[it.id] = `<div class="wr"><b class="wl">서술형</b> <span class="kind">${esc(it.kind)}</span> ${esc(it.text)} <span class="ans">▶ ${esc(it.answer)}${it.note ? ' · ' + esc(it.note) : ''}</span></div>`;
  }
}
fs.writeFileSync('verify_report.txt', report.join('\n'));
console.log(report.filter(r=>!r.startsWith('OK')).join('\n') || '(no warnings)');
console.log(`items: ${items.length}, problems: ${problems}`);
if (problems) process.exit(1);

// 조립
const parts = ['head.html','p1.html','textbook.html','booster.html','mock.html','vocab.html','final.html','tail.html'];
let doc = parts.map(p => fs.readFileSync(p,'utf8')).join('\n');
const missing = [];
doc = doc.replace(/\{\{W:([a-z0-9]+)\}\}/g, (m,id) => { if(!html[id]){ missing.push(id); return m; } return html[id]; });
const unused = [...ids].filter(id => !doc.includes(html[id]));
if (missing.length) console.log('MISSING tokens:', missing.join(','));
if (unused.length) console.log('UNUSED items:', unused.join(','));
// 가독성 후처리: 어법/어휘/빈칸 블록을 줄 단위로 나누고, 오답 표시 ×와 ★을 강조
doc = doc.replace(/<div class="mc">([\s\S]*?)<\/div>/g, (m, inner) =>
  '<div class="mc">' + inner.split('<span class="sep">|</span>').map(s => '<div class="mcl">' + s.trim() + '</div>').join('') + '</div>');
doc = doc.replace(/×/g, '<span class="x">×</span>').replace(/★/g, '<span class="st">★</span>');
fs.writeFileSync('main.html', doc);
console.log('main.html written', doc.length);

// 마지막 쪽(final.html)은 손으로 조판했으므로 데이터와 교차 검증
const fin = fs.readFileSync('final.html','utf8');
let finProblems = 0;
for (const it of items.filter(i => i.id.startsWith('f'))) {
  if (it.type === 'arr') {
    const answer = it.chunks.join(' ');
    if (!fin.includes(answer)) { finProblems++; console.log('FINAL answer missing:', it.id, answer); }
    for (const c of it.chunks) if (!fin.includes(c)) { finProblems++; console.log('FINAL chunk missing:', it.id, c); }
  } else if (!fin.includes(it.answer.replace(/\(.\) /g,'').split(' ')[0])) { finProblems++; console.log('FINAL answer missing:', it.id); }
}
console.log('final.html cross-check problems:', finProblems);
