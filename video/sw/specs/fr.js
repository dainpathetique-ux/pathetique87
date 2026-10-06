const C=require('./_common'), L=require('./_lib');
const frog=`<g data-anim="bob" data-amp="0.5"><ellipse cx="0" cy="60" rx="230" ry="150" fill="#5fb86a"/><ellipse cx="0" cy="110" rx="150" ry="80" fill="#9ad97f"/><circle cx="-110" cy="-100" r="70" fill="#5fb86a"/><circle cx="110" cy="-100" r="70" fill="#5fb86a"/><circle cx="-110" cy="-100" r="40" fill="#fff"/><circle cx="110" cy="-100" r="40" fill="#fff"/><circle cx="-100" cy="-100" r="18" fill="#243b36"/><circle cx="120" cy="-100" r="18" fill="#243b36"/>
<path d="M-100,10 Q0,80 100,10" stroke="#243b36" stroke-width="8" fill="none"/><circle cx="-150" cy="40" r="22" fill="#ffb3a0" opacity=".6"/><circle cx="150" cy="40" r="22" fill="#ffb3a0" opacity=".6"/>
<path d="M-200,160 Q-320,200 -300,260 M200,160 Q320,200 300,260" stroke="#5fb86a" stroke-width="40" fill="none" stroke-linecap="round"/><ellipse cx="-300" cy="270" rx="60" ry="24" fill="#5fb86a"/><ellipse cx="300" cy="270" rx="60" ry="24" fill="#5fb86a"/></g>`;
const fog=`<g opacity=".45">${L.tree}</g><g transform="translate(-260,40) scale(.7)" opacity=".3">${L.tree}</g><g transform="translate(250,60) scale(.6)" opacity=".3">${L.tree}</g>
<g data-anim="slide" data-amp="0.8" data-speed="0.6"><ellipse cx="0" cy="40" rx="400" ry="60" fill="#fff" opacity=".8"/><ellipse cx="-120" cy="150" rx="360" ry="55" fill="#fff" opacity=".85"/><ellipse cx="150" cy="-80" rx="300" ry="45" fill="#fff" opacity=".7"/></g>`;
const fruit=`<g data-anim="bob" data-amp="0.2"><path d="M-300,40 Q-300,240 0,240 Q300,240 300,40Z" fill="#c48a5a"/><ellipse cx="0" cy="40" rx="300" ry="50" fill="#a86f45"/>
<circle cx="-150" cy="-40" r="90" fill="#e8384f"/><path d="M-150,-130 q10,-40 30,-50" stroke="#5c8a3a" stroke-width="8" fill="none"/><circle cx="20" cy="-70" r="100" fill="#f5a623"/><circle cx="190" cy="-30" r="80" fill="#5fb86a"/>
<path d="M-40,-200 Q-10,-280 60,-260 Q30,-220 -40,-200Z" fill="#5fb86a"/><ellipse cx="90" cy="-170" rx="70" ry="40" fill="#ffd54a" transform="rotate(-30 90 -170)"/><g fill="#8e44ad"><circle cx="-60" cy="60" r="22"/><circle cx="-20" cy="90" r="22"/><circle cx="-100" cy="90" r="22"/><circle cx="-60" cy="120" r="22"/></g></g>`;
const friend=`<g transform="translate(-150,0) scale(.85)">${C.child(C.smile,'#e2543c')}</g><g transform="translate(150,0) scale(.85)">${C.child(C.smile,'#2b7ea1')}</g>
<path d="M-60,250 Q0,200 60,250" stroke="#ffd9b8" stroke-width="30" fill="none" stroke-linecap="round"/><g data-anim="bob" data-amp="0.6"><path d="M0,-280 C-60,-360 -140,-300 -100,-230 L0,-150 L100,-230 C140,-300 60,-360 0,-280Z" fill="#ff6b8a"/></g>`;
module.exports={
  outName:'영상_FR_자음군_숏폼', letters:['F','R'],
  A:{bg:['#e3f6ee','#bfe8da'], ground:C.water, svg:frog, particles:'bubbles', hint:'두 글자가 만나면 /fr/', l1:'자음군(블렌드) <span class="kw">FR</span> <span class="ipa">/fr/</span>', word:'Frog', hl:[0,2], ipa:'/frɔːɡ/', ko:'프로그 (개구리)'},
  B:{bg:['#e6edf2','#f3f6f8'], ground:C.grass, tag:'자음군 만들기', hint:'f + r = fr',
     stages:[{at:0,text:'<span class="s">f</span>og',svg:fog},{at:4,text:'<span class="s">f</span><span class="w">r</span>og',svg:frog}],
     l1:'fog → <span class="kw">frog</span> <span class="ipa">/frɔːɡ/</span>', l2:'프로그 (개구리) · <b>f</b> 뒤에 <b>r</b> 소리를 더해요'},
  C:{tag:'FR 단어 더 알아보기', words:[
     {text:'Fruit',hl:[0,2],ipa:'/fruːt/',ko:'프루트 (과일)',bg:['#fff3e6','#ffe4d6'],ground:C.table,svg:fruit},
     {text:'Friend',hl:[0,2],ipa:'/frend/',ko:'프렌드 (친구)',bg:['#fff8e1','#ffecb3'],ground:C.grass,svg:friend,particles:'sparkle'}]},
  cues:[{at:0.8,text:"Today's sound is F, R.  Frog.  Frog."},{at:5.4,text:"Fog."},{at:9.4,text:"Frog!"},{at:11.0,text:"Fog, frog.  Can you hear both sounds?  Frog."},{at:15.6,text:"Fruit.  Fruit."},{at:20.6,text:"Friend.  Friend."},{at:25.6,text:"Great job!  See you next time."}]
};
