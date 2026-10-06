const C=require('./_common');
const ring=`<g data-anim="sway" data-origin="0 60" data-amp="0.4"><circle cx="0" cy="80" r="190" fill="none" stroke="#f5c542" stroke-width="56"/><circle cx="0" cy="80" r="190" fill="none" stroke="#fff" stroke-width="10" opacity=".5" stroke-dasharray="60 400"/>
<path d="M0,-200 L80,-130 L0,-20 L-80,-130Z" fill="#8fd3f0"/><path d="M0,-200 L80,-130 L0,-130Z" fill="#c9ecfa"/><path d="M-80,-130 L0,-130 L0,-20Z" fill="#5cb8e0"/>
<rect x="-110" y="-150" width="220" height="40" rx="12" fill="#f5c542"/></g>`;
const trophy=`<g data-anim="bob" data-amp="0.4"><path d="M-170,-240 L170,-240 L140,-20 Q120,80 0,90 Q-120,80 -140,-20Z" fill="#f5c542"/>
<path d="M-170,-220 Q-290,-200 -270,-100 Q-250,-30 -150,-40" fill="none" stroke="#f5c542" stroke-width="30"/><path d="M170,-220 Q290,-200 270,-100 Q250,-30 150,-40" fill="none" stroke="#f5c542" stroke-width="30"/>
<rect x="-30" y="90" width="60" height="80" fill="#d9a420"/><rect x="-130" y="170" width="260" height="60" rx="14" fill="#8a6a52"/><text x="0" y="-80" text-anchor="middle" font-size="110" font-weight="700" fill="#fff" font-family="KR">1</text></g>`;
const bird=`<g data-anim="bob" data-amp="0.6"><ellipse cx="0" cy="40" rx="190" ry="130" fill="#5cb8e0"/><circle cx="170" cy="-60" r="95" fill="#5cb8e0"/><circle cx="195" cy="-80" r="12" fill="#243b36"/><path d="M255,-60 l70,20 l-70,20z" fill="#f5a623"/>
<path d="M-190,40 L-330,-30 L-320,100Z" fill="#2b7ea1"/>
<path d="M-40,20 Q-80,-220 160,-240 Q120,-120 40,20Z" fill="#2b7ea1" data-anim="flap" data-origin="-20 20" data-amp="1"/>
<line x1="-30" y1="160" x2="-40" y2="230" stroke="#f5a623" stroke-width="12"/><line x1="40" y1="160" x2="50" y2="230" stroke="#f5a623" stroke-width="12"/></g>`;
const king=`<g data-anim="sway" data-origin="0 300" data-amp="0.2">${C.face('<path d="M-50,70 Q0,120 50,70" stroke="#243b36" stroke-width="7" fill="none"/><circle cx="-50" cy="-10" r="11" fill="#243b36"/><circle cx="50" cy="-10" r="11" fill="#243b36"/><circle cx="-95" cy="40" r="18" fill="#ffb3a0" opacity=".7"/><circle cx="95" cy="40" r="18" fill="#ffb3a0" opacity=".7"/>')}
<path d="M-150,-120 L-110,-280 L-40,-180 L0,-300 L40,-180 L110,-280 L150,-120Z" fill="#f5c542"/><rect x="-150" y="-140" width="300" height="40" fill="#e2543c"/><circle cx="-110" cy="-290" r="16" fill="#e2543c"/><circle cx="0" cy="-310" r="16" fill="#8fd3f0"/><circle cx="110" cy="-290" r="16" fill="#e2543c"/>
<path d="M-200,340 Q-180,160 0,150 Q180,160 200,340Z" fill="#8e44ad"/><path d="M-60,340 L-40,170 L40,170 L60,340Z" fill="#fff"/></g>`;
const song=`<g data-anim="sway" data-origin="0 300" data-amp="0.4">${C.face('<ellipse cx="0" cy="70" rx="38" ry="48" fill="#8b2e2e"/><ellipse cx="0" cy="60" rx="24" ry="20" fill="#fff"/><path d="M-70,-20 Q-50,-40 -30,-20" stroke="#243b36" stroke-width="7" fill="none"/><path d="M30,-20 Q50,-40 70,-20" stroke="#243b36" stroke-width="7" fill="none"/>')}
<path d="M-190,340 Q-170,160 0,150 Q170,160 190,340Z" fill="#f5a623"/>
<g transform="translate(200,120)"><rect x="-20" y="0" width="40" height="200" rx="14" fill="#6c757d"/><circle cx="0" cy="-20" r="60" fill="#243b36"/><circle cx="0" cy="-20" r="60" fill="none" stroke="#9aa5ad" stroke-width="6" stroke-dasharray="8 8"/></g></g>`;
module.exports={
  outName:'영상_NG_이중자음_숏폼', letters:['N','G'],
  A:{bg:['#efe6fb','#dcd0f5'], svg:ring, particles:'sparkle', hint:'두 글자가 한 소리 /ŋ/', l1:'이중자음(다이그래프) <span class="kw">NG</span> <span class="ipa">/ŋ/</span>', word:'Ring', hl:[2,4], ipa:'/rɪŋ/', ko:'링 (반지)'},
  B:{bg:['#d9f1ff','#eef9f3'], ground:C.grass, tag:'소리 바꾸기', hint:'n + g = 한 소리 /ŋ/',
     stages:[{at:0,text:'wi<span class="s">n</span>',svg:trophy,particles:'sparkle'},{at:4,text:'wi<span class="s">n</span><span class="w">g</span>',svg:bird}],
     l1:'win → <span class="kw">wing</span> <span class="ipa">/wɪŋ/</span>', l2:'윙 (날개) · <b>n</b>과 <b>g</b>가 합쳐 한 소리가 돼요'},
  C:{tag:'NG 단어 더 알아보기', words:[
     {text:'King',hl:[2,4],ipa:'/kɪŋ/',ko:'킹 (왕)',bg:['#fff3e6','#ffe4d6'],svg:king,particles:'sparkle'},
     {text:'Song',hl:[2,4],ipa:'/sɔːŋ/',ko:'송 (노래)',bg:['#ffeef5','#ffe0ec'],svg:song,particles:'notes'}]},
  cues:[
    {at:0.8,text:"Today's sound is N, G.  Ring.  Ring."},
    {at:5.4,text:"Win."},{at:9.4,text:"Wing!"},
    {at:11.0,text:"Win, wing.  N and G make one sound.  Wing."},
    {at:15.6,text:"King.  King."},{at:20.6,text:"Song.  Song."},
    {at:25.6,text:"Great job!  See you next time."}]
};
