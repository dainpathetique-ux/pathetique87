const C=require('./_common');
const drink=`<g data-anim="sway" data-origin="0 250" data-amp="0.3"><path d="M-170,-160 L-130,260 L130,260 L170,-160Z" fill="#8fd3f0" opacity=".9"/><path d="M-150,-60 L-125,240 L125,240 L150,-60Z" fill="#f5a623"/>
<ellipse cx="0" cy="-160" rx="170" ry="30" fill="#c9ecfa"/><rect x="40" y="-330" width="26" height="230" rx="10" fill="#e2543c" transform="rotate(12 50 -220)"/>
<circle cx="-60" cy="-120" r="36" fill="#fff" opacity=".8"/><circle cx="30" cy="-110" r="28" fill="#fff" opacity=".8"/><path d="M110,-150 l40,-60 l30,30 l-50,50z" fill="#5fb86a"/></g>`;
const ink=`<g data-anim="bob" data-amp="0.3"><rect x="-160" y="-60" width="320" height="300" rx="40" fill="#243b36"/><rect x="-70" y="-200" width="140" height="150" rx="16" fill="#6c757d"/><rect x="-90" y="-230" width="180" height="40" rx="12" fill="#243b36"/>
<rect x="-110" y="40" width="220" height="130" rx="18" fill="#fff"/><text x="0" y="135" text-anchor="middle" font-size="90" font-weight="700" fill="#243b36" font-family="KR">ink</text></g>
<g data-anim="drip" data-amp="0.6"><path d="M240,-120 q-30,40 0,70 q30,-30 0,-70z" fill="#243b36"/></g><path d="M200,120 q40,-30 80,0 q40,30 80,0" fill="#243b36"/>`;
const pink=`<g data-anim="sway" data-origin="0 200" data-amp="0.3"><path d="M-220,-80 L-180,260 L180,260 L220,-80Z" fill="#9aa5ad"/><ellipse cx="0" cy="-80" rx="220" ry="40" fill="#ff86b6"/>
<path d="M-240,-120 Q-200,-60 -170,-110 Q-120,-40 -60,-120 Q0,-50 60,-120 Q120,-40 170,-110 Q200,-60 240,-120 L240,-80 Q0,-40 -240,-80Z" fill="#ff9ec4"/>
<path d="M-250,-110 L-280,80 Q-285,130 -245,120 Q-230,80 -250,-110Z" fill="#ff86b6"/><path d="M-200,-280 Q0,-360 200,-280" fill="none" stroke="#6c757d" stroke-width="18"/>
<circle cx="-120" cy="-260" r="30" fill="#ff86b6" data-anim="bob" data-speed="2"/><circle cx="150" cy="-230" r="22" fill="#ff9ec4" data-anim="bob" data-speed="1.6"/></g>`;
const winkFace=`<g data-anim="sway" data-origin="0 300" data-amp="0.3">${C.face('<path d="M-60,70 Q0,130 60,70" stroke="#243b36" stroke-width="8" fill="none"/><circle cx="-55" cy="-10" r="13" fill="#243b36"/><g data-anim="wink"><path d="M25,-10 Q55,-35 85,-10" stroke="#243b36" stroke-width="9" fill="none"/></g><circle cx="-105" cy="40" r="20" fill="#ffb3a0" opacity=".7"/><circle cx="105" cy="40" r="20" fill="#ffb3a0" opacity=".7"/>')}
<path d="M-190,340 Q-170,160 0,150 Q170,160 190,340Z" fill="#2b7ea1"/><path d="M230,-120 l12,36 l36,12 l-36,12 l-12,36 l-12,-36 l-36,-12 l36,-12z" fill="#ffd54a"/></g>`;
const bank=`<g data-anim="sway" data-origin="0 250" data-amp="0.3"><ellipse cx="0" cy="60" rx="260" ry="190" fill="#ff9ec4"/><circle cx="230" cy="-20" r="90" fill="#ff9ec4"/><ellipse cx="300" cy="-10" rx="40" ry="52" fill="#ff86b6"/><circle cx="285" cy="-20" r="8" fill="#243b36"/><circle cx="315" cy="-20" r="8" fill="#243b36"/>
<circle cx="200" cy="-70" r="12" fill="#243b36"/><path d="M190,-130 L230,-110 L200,-90Z" fill="#ff86b6"/>
<rect x="-180" y="200" width="60" height="90" rx="20" fill="#ff86b6"/><rect x="-60" y="220" width="60" height="90" rx="20" fill="#ff86b6"/><rect x="60" y="220" width="60" height="90" rx="20" fill="#ff86b6"/><rect x="170" y="200" width="60" height="90" rx="20" fill="#ff86b6"/>
<rect x="-70" y="-140" width="140" height="22" rx="10" fill="#c94f84"/><path d="M-240,120 q-60,-40 -30,-90" fill="none" stroke="#ff86b6" stroke-width="14" stroke-linecap="round"/></g>
<g data-anim="drip" data-amp="0.5"><circle cx="0" cy="-330" r="48" fill="#f5c542"/><circle cx="0" cy="-330" r="30" fill="none" stroke="#d9a420" stroke-width="6"/></g>`;
const think=`<g data-anim="sway" data-origin="0 300" data-amp="0.2">${C.face('<path d="M-30,80 Q0,70 40,80" stroke="#243b36" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="-55" cy="-10" r="13" fill="#243b36"/><circle cx="55" cy="-10" r="13" fill="#243b36"/><path d="M-90,-50 Q-55,-70 -20,-50" stroke="#243b36" stroke-width="7" fill="none"/><path d="M20,-60 Q55,-85 90,-60" stroke="#243b36" stroke-width="7" fill="none"/>')}
<path d="M-190,340 Q-170,160 0,150 Q170,160 190,340Z" fill="#5fb86a"/><circle cx="110" cy="150" r="40" fill="#ffd9b8"/>
<circle cx="190" cy="-180" r="22" fill="#fff"/><circle cx="240" cy="-250" r="34" fill="#fff"/><circle cx="320" cy="-360" r="110" fill="#fff"/>
<g data-anim="bob" data-amp="0.4" data-speed="1.5"><circle cx="320" cy="-380" r="48" fill="#ffd54a"/><rect x="300" y="-335" width="40" height="30" rx="8" fill="#9aa5ad"/><path d="M270,-410 l-25,-15 M370,-410 l25,-15 M320,-450 l0,-25" stroke="#ffd54a" stroke-width="8" stroke-linecap="round"/></g></g>`;
module.exports={
  outName:'영상_NK_끝소리자음군_숏폼', letters:['N','K'],
  A:{bg:['#fff3e6','#ffe4d6'], ground:C.table, svg:drink, particles:'bubbles', hint:'끝에서 만나는 /ŋk/', l1:'끝소리 자음군 <span class="kw">NK</span> <span class="ipa">/ŋk/</span>', word:'Drink', hl:[3,5], ipa:'/drɪŋk/', ko:'드링크 (마시다)'},
  B:{bg:['#eef2ff','#e3eaff'], ground:C.table, tag:'단어 가족 -ink', hint:'-ink 가족 단어',
     stages:[{at:0,text:'i<span class="s">nk</span>',svg:ink},{at:2.5,text:'<span class="w">p</span>i<span class="s">nk</span>',svg:pink},{at:5,text:'<span class="w">w</span>i<span class="s">nk</span>',svg:winkFace,particles:'sparkle'}],
     l1:'ink → pink → <span class="kw">wink</span> <span class="ipa">/wɪŋk/</span>', l2:'윙크 · 끝소리 <b>nk</b>는 /ŋk/ 로 소리나요'},
  C:{tag:'NK 단어 더 알아보기', words:[
     {text:'Bank',hl:[2,4],ipa:'/bæŋk/',ko:'뱅크 (은행·저금통)',bg:['#ffeef5','#ffe0ec'],ground:C.table,svg:bank,particles:'sparkle'},
     {text:'Think',hl:[3,5],ipa:'/θɪŋk/',ko:'싱크 (생각하다)',bg:['#e3f6ee','#bfe8da'],ground:C.grass,svg:think}]},
  cues:[
    {at:0.8,text:"Today's sound is N, K.  Drink.  Drink."},
    {at:5.4,text:"Ink."},{at:7.9,text:"Pink."},{at:10.4,text:"Wink!"},
    {at:11.5,text:"Ink, pink, wink.  Listen to the end: nk."},
    {at:15.6,text:"Bank.  Bank."},{at:20.6,text:"Think.  Think."},
    {at:25.6,text:"Great job!  See you next time."}]
};
