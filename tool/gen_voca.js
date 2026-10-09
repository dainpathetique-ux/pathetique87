#!/usr/bin/env node
// 소리표(txt) → vocab/VOCA_Starter2_DayNN.json 생성
// 사용: node tool/gen_voca.js vocab/VOCA_Starter2_소리표.txt
const fs = require('fs'); const path = require('path');
const src = process.argv[2];
const lines = fs.readFileSync(src, 'utf8').split('\n');
let day = null, words = [], out = [];
const flush = () => { if (day) { 
  const slug = `VOCA_Starter2_Day${day}`;
  const spec = { slug, course: '영어 단어 · 주니어 능률 VOCA', grade: '초2 수준 · 소리로 외우기', title: `VOCA Starter 2 — DAY ${day}`, words };
  fs.writeFileSync(path.join(path.dirname(src), slug + '.json'), JSON.stringify(spec, null, 1) + '\n');
  if (words.length !== 12) console.error(`DAY ${day}: 단어 ${words.length}개`);
  out.push(slug); } words = []; };
for (const raw of lines) {
  const l = raw.trim(); if (!l || l.startsWith('#')) continue;
  const m = l.match(/^\[DAY (\d+)\]$/); if (m) { flush(); day = m[1]; continue; }
  const [en, ch, sound, ko] = l.split('|').map(s => s.trim());
  const chunks = ch.split(/\s+/).map(c => { const i = c.indexOf(':'); const s = c.slice(i + 1); return [c.slice(0, i), s === '-' ? '' : s]; });
  const joined = chunks.map(c => c[0]).join('');
  if (joined !== en) console.error(`${en}: 조각 합계 "${joined}" 불일치`);
  words.push({ en, chunks, sound, ko });
}
flush();
console.log(out.length + '개 JSON 생성');
