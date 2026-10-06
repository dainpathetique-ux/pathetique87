const C=require('./_common');
const shop=`<g data-anim="bob" data-amp="0.2"><rect x="-300" y="-120" width="600" height="380" rx="16" fill="#fff3e6"/><rect x="-300" y="-120" width="600" height="30" fill="#e2543c"/>
<path d="M-330,-120 L-300,-230 L300,-230 L330,-120Z" fill="#e2543c"/><g fill="#fff"><path d="M-270,-120 L-250,-230 L-190,-230 L-200,-120Z"/><path d="M-110,-120 L-100,-230 L-40,-230 L-40,-120Z"/><path d="M40,-120 L40,-230 L100,-230 L110,-120Z"/><path d="M200,-120 L190,-230 L250,-230 L270,-120Z"/></g>
<rect x="-80" y="40" width="160" height="220" rx="10" fill="#8a6a52"/><circle cx="50" cy="150" r="10" fill="#f5c542"/>
<rect x="-270" y="20" width="150" height="130" rx="10" fill="#8fd3f0"/><rect x="120" y="20" width="150" height="130" rx="10" fill="#8fd3f0"/>
<rect x="-140" y="-300" width="280" height="90" rx="20" fill="#2b7ea1"/><text x="0" y="-235" text-anchor="middle" font-size="60" font-weight="700" fill="#fff" font-family="KR">OPEN</text></g>`;
const sell=`<g data-anim="bob" data-amp="0.2"><rect x="-280" y="0" width="560" height="60" rx="12" fill="#c48a5a"/><rect x="-250" y="60" width="500" height="200" fill="#f5a623"/><rect x="-250" y="60" width="500" height="200" fill="url(#none)" opacity="0"/>
<g fill="#fff"><rect x="-230" y="60" width="60" height="200"/><rect x="-110" y="60" width="60" height="200"/><rect x="10" y="60" width="60" height="200"/><rect x="130" y="60" width="60" height="200"/></g>
<path d="M-120,-90 L-90,0 L90,0 L120,-90Z" fill="#ffe59a"/><rect x="-10" y="-200" width="20" height="120" fill="#e2543c" transform="rotate(10)"/>
<rect x="150" y="-150" width="130" height="90" rx="12" fill="#fff" stroke="#243b36" stroke-width="6"/><text x="215" y="-85" text-anchor="middle" font-size="56" font-weight="700" fill="#e2543c" font-family="KR">$1</text>
<circle cx="-220" cy="-120" r="48" fill="#f5c542"/><circle cx="-220" cy="-120" r="30" fill="none" stroke="#d9a420" stroke-width="6"/></g>`;
const shell=`<g data-anim="sway" data-origin="0 180" data-amp="0.3"><path d="M-260,160 Q-280,-120 0,-200 Q280,-120 260,160 Z" fill="#ff9ec4"/>
<g stroke="#fff" stroke-width="12" fill="none" opacity=".8"><path d="M0,160 L-200,-80"/><path d="M0,160 L-100,-150"/><path d="M0,160 L0,-190"/><path d="M0,160 L100,-150"/><path d="M0,160 L200,-80"/></g>
<path d="M-260,160 Q0,230 260,160 L200,230 L-200,230Z" fill="#f08a6b"/></g><ellipse cx="0" cy="260" rx="380" ry="40" fill="#f5deb3"/>`;
const fish=`<g data-anim="slide" data-amp="0.6"><ellipse cx="0" cy="0" rx="230" ry="140" fill="#f5a623"/><path d="M200,0 L340,-120 L340,120Z" fill="#e2543c"/>
<path d="M-40,-130 L0,-220 L80,-130Z" fill="#e2543c"/><ellipse cx="-110" cy="-30" rx="22" ry="22" fill="#fff"/><circle cx="-105" cy="-30" r="11" fill="#243b36"/>
<path d="M-180,40 Q-150,80 -110,50" stroke="#243b36" stroke-width="6" fill="none"/><g fill="#ffd06b"><circle cx="60" cy="-30" r="22"/><circle cx="120" cy="20" r="22"/><circle cx="40" cy="50" r="22"/></g></g>`;
const shoe=`<g data-anim="sway" data-origin="0 150" data-amp="0.3"><path d="M-300,120 L-300,-60 Q-300,-160 -200,-160 L-80,-160 Q-20,-160 20,-100 L120,30 Q230,60 300,80 L300,140 L-300,140Z" fill="#e2543c"/>
<path d="M-300,100 L300,100 L300,170 Q0,200 -300,170Z" fill="#fff"/><path d="M-200,-100 L-80,-100 L-60,-60 L-200,-60Z" fill="#fff"/>
<g stroke="#fff" stroke-width="10" fill="none"><path d="M-180,-130 L-110,-80"/><path d="M-110,-130 L-180,-80"/><path d="M-100,-110 L-40,-50"/></g><circle cx="-250" cy="40" r="30" fill="#fff"/></g>`;
module.exports={
  outName:'영상_SH_이중자음_숏폼', letters:['S','H'],
  A:{bg:['#fff3e6','#ffe4d6'], ground:C.sky, svg:shop, particles:'sparkle', hint:'두 글자가 한 소리 /ʃ/', l1:'이중자음(다이그래프) <span class="kw">SH</span> <span class="ipa">/ʃ/</span>', word:'Shop', hl:[0,2], ipa:'/ʃɑːp/', ko:'숍 (가게)'},
  B:{bg:['#d9f1ff','#eef9f3'], ground:C.grass, tag:'소리 바꾸기', hint:'s + h = 한 소리 /ʃ/ (쉿!)',
     stages:[{at:0,text:'<span class="s">s</span>ell',svg:sell},{at:4,text:'<span class="s">s</span><span class="w">h</span>ell',svg:shell,particles:'sparkle'}],
     l1:'sell → <span class="kw">shell</span> <span class="ipa">/ʃel/</span>', l2:'셸 (조개) · <b>s</b>와 <b>h</b>가 합쳐 한 소리가 돼요'},
  C:{tag:'SH 단어 더 알아보기', words:[
     {text:'Fish',hl:[2,4],ipa:'/fɪʃ/',ko:'피시 (물고기)',bg:['#dbeeff','#7fd0f2'],svg:fish,particles:'bubbles'},
     {text:'Shoe',hl:[0,2],ipa:'/ʃuː/',ko:'슈 (신발)',bg:['#fff3e6','#ffe4d6'],ground:C.room,svg:shoe}]},
  cues:[
    {at:0.8,text:"Today's sound is S, H.  Shop.  Shop."},
    {at:5.4,text:"Sell."},{at:9.4,text:"Shell!"},
    {at:11.0,text:"Sell, shell.  S and H say sh.  Shell."},
    {at:15.6,text:"Fish.  Fish."},{at:20.6,text:"Shoe.  Shoe."},
    {at:25.6,text:"Great job!  See you next time."}]
};
