const C=require('./_common');
const phone=`<g data-anim="sway" data-origin="0 250" data-amp="0.3"><rect x="-150" y="-280" width="300" height="540" rx="40" fill="#243b36"/><rect x="-130" y="-230" width="260" height="420" rx="16" fill="#8fd3f0"/>
<rect x="-50" y="-262" width="100" height="14" rx="7" fill="#6c757d"/><circle cx="0" cy="225" r="18" fill="#6c757d"/>
<path d="M-60,-40 Q-60,-120 0,-120 Q60,-120 60,-40 L40,0 L-40,0Z" fill="#5fb86a"/><rect x="-30" y="0" width="60" height="30" rx="6" fill="#5fb86a"/>
<g data-anim="bob" data-amp="0.4" data-speed="2"><path d="M90,-150 q40,20 40,60 M110,-190 q70,30 70,100" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/></g></g>`;
const fan=`<g data-anim="bob" data-amp="0.2"><rect x="-30" y="140" width="60" height="100" fill="#6c757d"/><rect x="-140" y="230" width="280" height="30" rx="12" fill="#243b36"/><circle cx="0" cy="-20" r="220" fill="#c7cfd4"/><circle cx="0" cy="-20" r="190" fill="#eef3f6"/>
<g data-anim="spin" data-origin="0 -20" data-speed="3"><g fill="#2b7ea1"><path d="M0,-20 Q-40,-120 0,-190 Q40,-120 0,-20Z"/><path d="M0,-20 Q-40,-120 0,-190 Q40,-120 0,-20Z" transform="rotate(120 0 -20)"/><path d="M0,-20 Q-40,-120 0,-190 Q40,-120 0,-20Z" transform="rotate(240 0 -20)"/></g><circle cx="0" cy="-20" r="30" fill="#243b36"/></g>
<g stroke="#9aa5ad" stroke-width="4" fill="none" opacity=".6"><circle cx="0" cy="-20" r="100"/><circle cx="0" cy="-20" r="150"/></g></g>`;
const photo=`<g data-anim="bob" data-amp="0.3"><rect x="-280" y="-120" width="560" height="340" rx="40" fill="#243b36"/><rect x="-120" y="-180" width="240" height="80" rx="20" fill="#243b36"/>
<circle cx="0" cy="50" r="130" fill="#6c757d"/><circle cx="0" cy="50" r="95" fill="#2b7ea1"/><circle cx="0" cy="50" r="55" fill="#243b36"/><circle cx="-30" cy="20" r="18" fill="#fff" opacity=".8"/>
<circle cx="200" cy="-40" r="26" fill="#e2543c" data-anim="blink" data-speed="1"/><rect x="-250" y="-60" width="80" height="40" rx="10" fill="#9aa5ad"/>
<g data-anim="blink" data-speed="0.7"><path d="M-330,-200 l20,0 M-320,-210 l0,-20 M-345,-215 l-15,-15 M-295,-215 l15,-15" stroke="#ffd54a" stroke-width="8" stroke-linecap="round"/></g></g>`;
const dolphin=`<g data-anim="bob" data-amp="0.8"><path d="M-300,40 Q-200,-120 0,-120 Q220,-120 320,-20 Q260,60 120,80 Q-100,120 -300,40Z" fill="#5cb8e0"/>
<path d="M-40,-110 Q-20,-220 60,-200 Q20,-150 40,-110Z" fill="#2b7ea1"/><path d="M-300,40 L-400,-60 L-380,120Z" fill="#2b7ea1"/><path d="M60,70 Q80,160 140,160 Q100,110 120,70Z" fill="#2b7ea1"/>
<path d="M-140,80 Q0,130 140,80 Q0,60 -140,80Z" fill="#c9ecfa"/><circle cx="200" cy="-40" r="12" fill="#243b36"/><path d="M300,-10 Q330,10 360,-10" stroke="#243b36" stroke-width="6" fill="none"/></g>`;
module.exports={
  outName:'영상_PH_이중자음_숏폼', letters:['P','H'],
  A:{bg:['#eef2ff','#e3eaff'], ground:C.room, svg:phone, hint:'p + h = /f/ 소리', l1:'이중자음(다이그래프) <span class="kw">PH</span> <span class="ipa">/f/</span>', word:'Phone', hl:[0,2], ipa:'/foʊn/', ko:'폰 (전화)'},
  B:{bg:['#fff8e1','#ffecb3'], ground:C.room, tag:'같은 소리, 다른 글자', hint:'f 와 ph 는 같은 소리 /f/',
     stages:[{at:0,text:'<span class="w">f</span>an',svg:fan},{at:4,text:'<span class="s">ph</span>one',svg:phone}],
     l1:'<span class="kw">f</span>an = <span class="kw">ph</span>one <span class="ipa">/f/</span>', l2:'팬 (선풍기) · 폰 (전화) — 소리는 같아요'},
  C:{tag:'PH 단어 더 알아보기', words:[
     {text:'Photo',hl:[0,2],ipa:'/ˈfoʊtoʊ/',ko:'포토 (사진)',bg:['#fff3e6','#ffe4d6'],ground:C.room,svg:photo,particles:'sparkle'},
     {text:'Dolphin',hl:[3,5],ipa:'/ˈdɑːlfɪn/',ko:'돌핀 (돌고래)',bg:['#dbeeff','#7fd0f2'],svg:dolphin,particles:'bubbles'}]},
  cues:[
    {at:0.8,text:"Today's sound is P, H.  Phone.  Phone."},
    {at:5.4,text:"Fan."},{at:9.4,text:"Phone!"},
    {at:11.0,text:"Fan, phone.  P and H say f, just like the letter F."},
    {at:15.6,text:"Photo.  Photo."},{at:20.6,text:"Dolphin.  Dolphin."},
    {at:25.6,text:"Great job!  See you next time."}]
};
