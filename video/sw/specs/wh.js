const C=require('./_common');
const whale=`<g data-anim="bob" data-amp="0.6"><path d="M-280,40 Q-260,-160 0,-160 Q260,-160 300,0 Q280,120 100,140 L-200,140 Q-300,120 -280,40Z" fill="#2b7ea1"/>
<path d="M-220,140 Q-100,170 100,140 L60,180 L-180,180Z" fill="#8fd3f0"/><path d="M280,40 L400,-60 L420,60 L360,120Z" fill="#2b7ea1"/>
<circle cx="-150" cy="-30" r="16" fill="#fff"/><circle cx="-146" cy="-30" r="9" fill="#243b36"/><path d="M-230,40 Q-180,80 -120,50" stroke="#fff" stroke-width="6" fill="none"/>
<g data-anim="spin" data-origin="-60 -160" data-speed="0"><path d="M-60,-160 Q-100,-280 -40,-300 M-60,-160 Q-20,-280 20,-280" stroke="#8fd3f0" stroke-width="14" fill="none" stroke-linecap="round" data-anim="bob" data-amp="0.8"/></g></g>`;
const q=(sym,extra='')=>`${C.child('<path d="M-30,80 Q0,100 40,80" stroke="#243b36" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="-55" cy="-10" r="13" fill="#243b36"/><circle cx="55" cy="-10" r="13" fill="#243b36"/><path d="M-90,-50 Q-55,-70 -20,-50" stroke="#243b36" stroke-width="7" fill="none"/><path d="M20,-60 Q55,-85 90,-60" stroke="#243b36" stroke-width="7" fill="none"/>','#f5a623')}
<g data-anim="bob" data-amp="0.5" data-speed="1.5"><circle cx="190" cy="-180" r="22" fill="#fff"/><circle cx="240" cy="-250" r="34" fill="#fff"/><circle cx="330" cy="-360" r="120" fill="#fff"/>${sym}</g>${extra}`;
const what=q('<text x="330" y="-310" text-anchor="middle" font-size="150" font-weight="700" fill="#e2543c" font-family="KR">?</text>');
const when=q('<circle cx="330" cy="-360" r="80" fill="#fff" stroke="#243b36" stroke-width="10"/><path d="M330,-360 L330,-420 M330,-360 L370,-340" stroke="#e2543c" stroke-width="10" stroke-linecap="round"/><circle cx="330" cy="-360" r="8" fill="#243b36"/>');
const where=q('<path d="M330,-290 Q250,-380 250,-420 Q250,-480 330,-480 Q410,-480 410,-420 Q410,-380 330,-290Z" fill="#e2543c"/><circle cx="330" cy="-420" r="28" fill="#fff"/>');
const wheel=`<g data-anim="spin" data-origin="0 0" data-speed="0.6"><circle cx="0" cy="0" r="260" fill="#243b36"/><circle cx="0" cy="0" r="200" fill="#c7cfd4"/><circle cx="0" cy="0" r="50" fill="#6c757d"/>
<g stroke="#6c757d" stroke-width="26"><path d="M0,-190 L0,190"/><path d="M-190,0 L190,0"/><path d="M-135,-135 L135,135"/><path d="M135,-135 L-135,135"/></g><g fill="#243b36"><circle cx="0" cy="-230" r="10"/><circle cx="0" cy="230" r="10"/><circle cx="230" cy="0" r="10"/><circle cx="-230" cy="0" r="10"/></g></g>`;
const white=`<g data-anim="bob" data-amp="0.4"><ellipse cx="0" cy="120" rx="200" ry="150" fill="#fff"/><circle cx="0" cy="-80" r="130" fill="#fff"/>
<ellipse cx="-60" cy="-260" rx="40" ry="130" fill="#fff" data-anim="sway" data-origin="-60 -150" data-amp="0.6"/><ellipse cx="60" cy="-260" rx="40" ry="130" fill="#fff" data-anim="sway" data-origin="60 -150" data-amp="0.6" data-speed="1.3"/>
<ellipse cx="-60" cy="-260" rx="18" ry="90" fill="#ffb3c6"/><ellipse cx="60" cy="-260" rx="18" ry="90" fill="#ffb3c6"/>
<circle cx="-45" cy="-100" r="12" fill="#243b36"/><circle cx="45" cy="-100" r="12" fill="#243b36"/><ellipse cx="0" cy="-55" rx="16" ry="10" fill="#ffb3c6"/><path d="M-30,-30 Q0,-10 30,-30" stroke="#243b36" stroke-width="5" fill="none"/>
<g stroke="#243b36" stroke-width="4"><path d="M-30,-50 L-120,-70 M-30,-45 L-120,-30 M30,-50 L120,-70 M30,-45 L120,-30"/></g><circle cx="-220" cy="140" r="40" fill="#f0f0f0"/></g>`;
module.exports={
  outName:'영상_WH_이중자음_숏폼', letters:['W','H'],
  A:{bg:['#dbeeff','#7fd0f2'], svg:whale, particles:'bubbles', hint:'두 글자가 한 소리 /w/', l1:'이중자음(다이그래프) <span class="kw">WH</span> <span class="ipa">/w/</span>', word:'Whale', hl:[0,2], ipa:'/weɪl/', ko:'웨일 (고래)'},
  B:{bg:['#fff8e1','#ffecb3'], ground:C.grass, tag:'질문 단어', hint:'질문 단어는 wh로 시작해요',
     stages:[{at:0,text:'<span class="s">wh</span>at',svg:what},{at:2.5,text:'<span class="s">wh</span>en',svg:when},{at:5,text:'<span class="s">wh</span>ere',svg:where}],
     l1:'<span class="kw">wh</span>at · <span class="kw">wh</span>en · <span class="kw">wh</span>ere', l2:'무엇 · 언제 · 어디 — 묻는 말은 <b>wh</b> /w/'},
  C:{tag:'WH 단어 더 알아보기', words:[
     {text:'Wheel',hl:[0,2],ipa:'/wiːl/',ko:'휠 (바퀴)',bg:['#eef2ff','#e3eaff'],ground:C.room,svg:wheel},
     {text:'White',hl:[0,2],ipa:'/waɪt/',ko:'화이트 (흰색)',bg:['#e3f6ee','#bfe8da'],ground:C.grass,svg:white}]},
  cues:[
    {at:0.8,text:"Today's sound is W, H.  Whale.  Whale."},
    {at:5.4,text:"What?"},{at:7.9,text:"When?"},{at:10.4,text:"Where?"},
    {at:11.5,text:"What, when, where.  Question words start with W, H."},
    {at:15.6,text:"Wheel.  Wheel."},{at:20.6,text:"White.  White."},
    {at:25.6,text:"Great job!  See you next time."}]
};
