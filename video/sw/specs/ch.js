const C=require('./_common');
const cheese=`<g data-anim="sway" data-origin="0 150" data-amp="0.3"><path d="M-280,160 L0,-200 L280,160Z" fill="#ffd54a"/><path d="M-280,160 L280,160 L280,230 L-280,230Z" fill="#f5c542"/>
<g fill="#f0a500"><circle cx="-60" cy="60" r="34"/><circle cx="90" cy="100" r="26"/><circle cx="20" cy="-40" r="20"/><circle cx="-150" cy="130" r="20"/><circle cx="160" cy="40" r="14"/></g></g>`;
const tin=`<g data-anim="bob" data-amp="0.3"><rect x="-150" y="-180" width="300" height="400" rx="20" fill="#9aa5ad"/><ellipse cx="0" cy="-180" rx="150" ry="40" fill="#c7cfd4"/><ellipse cx="0" cy="-180" rx="110" ry="26" fill="#6c757d"/>
<rect x="-150" y="-80" width="300" height="200" fill="#2b7ea1"/><rect x="-150" y="-80" width="300" height="200" fill="#fff" opacity=".15"/><text x="0" y="40" text-anchor="middle" font-size="70" font-weight="700" fill="#fff" font-family="KR">tin</text>
<path d="M-60,-200 Q0,-240 60,-200" stroke="#6c757d" stroke-width="10" fill="none"/></g>`;
const chin=`${C.child(C.smile,'#5fb86a')}<g data-anim="bob" data-amp="0.4"><path d="M250,230 L130,150" stroke="#e2543c" stroke-width="10" stroke-linecap="round"/><circle cx="260" cy="240" r="26" fill="#e2543c"/></g><path d="M-40,135 Q0,165 40,135" stroke="#e2543c" stroke-width="10" fill="none" stroke-linecap="round" data-anim="blink" data-speed="1"/>`;
const chick=`<g data-anim="bob" data-amp="0.5"><ellipse cx="0" cy="60" rx="190" ry="160" fill="#ffd54a"/><circle cx="120" cy="-90" r="110" fill="#ffd54a"/><circle cx="150" cy="-110" r="12" fill="#243b36"/><path d="M225,-80 l60,20 l-60,20z" fill="#f5a623"/>
<path d="M-110,20 Q-200,0 -190,110 Q-110,120 -60,80Z" fill="#f5c542" data-anim="flap" data-origin="-60 50" data-amp="0.5"/>
<path d="M90,-200 q10,-30 20,0 M110,-205 q10,-30 20,0" stroke="#f5a623" stroke-width="6" fill="none"/>
<line x1="-40" y1="210" x2="-40" y2="270" stroke="#f5a623" stroke-width="12"/><line x1="40" y1="210" x2="40" y2="270" stroke="#f5a623" stroke-width="12"/><path d="M-70,270 L-40,270 L-10,270 M10,270 L40,270 L70,270" stroke="#f5a623" stroke-width="10"/></g>`;
const lunch=`<g data-anim="bob" data-amp="0.2"><rect x="-300" y="-120" width="600" height="340" rx="30" fill="#e2543c"/><rect x="-300" y="-120" width="600" height="60" rx="30" fill="#c43c28"/><rect x="-120" y="-200" width="240" height="90" rx="30" fill="none" stroke="#c43c28" stroke-width="22"/>
<rect x="-270" y="-40" width="540" height="230" rx="18" fill="#fff"/><rect x="-250" y="-20" width="200" height="190" rx="12" fill="#ffe59a"/><circle cx="110" cy="30" r="40" fill="#5fb86a"/><circle cx="200" cy="30" r="40" fill="#e8384f"/>
<rect x="60" y="90" width="190" height="70" rx="12" fill="#f0a868"/><path d="M-230,0 L-70,0 M-230,40 L-70,40 M-230,80 L-70,80" stroke="#f5a623" stroke-width="12"/></g>`;
module.exports={
  outName:'영상_CH_이중자음_숏폼', letters:['C','H'],
  A:{bg:['#fff8e1','#ffecb3'], ground:C.table, svg:cheese, particles:'sparkle', hint:'두 글자가 한 소리 /tʃ/', l1:'이중자음(다이그래프) <span class="kw">CH</span> <span class="ipa">/tʃ/</span>', word:'Cheese', hl:[0,2], ipa:'/tʃiːz/', ko:'치즈'},
  B:{bg:['#d9f1ff','#eef9f3'], ground:C.grass, tag:'소리 바꾸기', hint:'c + h = 한 소리 /tʃ/ (칙!)',
     stages:[{at:0,text:'<span class="s">t</span>in',svg:tin},{at:4,text:'<span class="s">c</span><span class="w">h</span>in',svg:chin}],
     l1:'tin → <span class="kw">chin</span> <span class="ipa">/tʃɪn/</span>', l2:'친 (턱) · <b>c</b>와 <b>h</b>가 합쳐 한 소리가 돼요'},
  C:{tag:'CH 단어 더 알아보기', words:[
     {text:'Chick',hl:[0,2],ipa:'/tʃɪk/',ko:'칙 (병아리)',bg:['#e3f6ee','#bfe8da'],ground:C.grass,svg:chick},
     {text:'Lunch',hl:[3,5],ipa:'/lʌntʃ/',ko:'런치 (점심)',bg:['#fff3e6','#ffe4d6'],ground:C.table,svg:lunch}]},
  cues:[
    {at:0.8,text:"Today's sound is C, H.  Cheese.  Cheese."},
    {at:5.4,text:"Tin."},{at:9.4,text:"Chin!"},
    {at:11.0,text:"Tin, chin.  C and H make one sound: ch.  Chin."},
    {at:15.6,text:"Chick.  Chick."},{at:20.6,text:"Lunch.  Lunch."},
    {at:25.6,text:"Great job!  See you next time."}]
};
