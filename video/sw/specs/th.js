const C=require('./_common');
const thumb=`<g data-anim="sway" data-origin="0 250" data-amp="0.3"><rect x="-170" y="-20" width="340" height="280" rx="60" fill="#ffd9b8"/>
<path d="M-60,-20 Q-70,-240 20,-250 Q110,-250 90,-120 L90,-20Z" fill="#ffd9b8"/><path d="M-60,-20 L90,-20" stroke="#e8b893" stroke-width="6"/>
<g stroke="#e8b893" stroke-width="6" fill="none"><path d="M-170,60 L170,60"/><path d="M-170,130 L170,130"/><path d="M-170,200 L170,200"/></g>
<rect x="-170" y="240" width="340" height="60" fill="#2b7ea1"/></g>`;
const tree=`<g data-anim="sway" data-origin="0 250" data-amp="0.2"><rect x="-45" y="60" width="90" height="220" rx="20" fill="#9a6b4a"/><circle cx="0" cy="-60" r="190" fill="#5fb86a"/><circle cx="-130" cy="20" r="120" fill="#6fc47a"/><circle cx="130" cy="20" r="120" fill="#55ad60"/><circle cx="0" cy="-200" r="100" fill="#79cc85"/>
<g fill="#e8384f"><circle cx="-80" cy="-80" r="22"/><circle cx="90" cy="-40" r="22"/><circle cx="0" cy="40" r="22"/></g></g>`;
const three=`<g data-anim="bob" data-amp="0.3"><text x="0" y="60" text-anchor="middle" font-size="420" font-weight="700" fill="#e2543c" font-family="KR">3</text>
<g fill="#e8384f"><circle cx="-220" cy="200" r="60"/><circle cx="0" cy="200" r="60"/><circle cx="220" cy="200" r="60"/></g><g stroke="#5c8a3a" stroke-width="8" fill="none"><path d="M-220,140 q10,-40 30,-50"/><path d="M0,140 q10,-40 30,-50"/><path d="M220,140 q10,-40 30,-50"/></g></g>`;
const bath=`<g data-anim="bob" data-amp="0.2"><path d="M-320,-40 L320,-40 L280,200 Q0,260 -280,200Z" fill="#fff"/><rect x="-340" y="-70" width="680" height="50" rx="20" fill="#c7cfd4"/>
<path d="M-220,-70 L-220,-220 Q-220,-280 -150,-280 L-120,-280" stroke="#9aa5ad" stroke-width="22" fill="none" stroke-linecap="round"/><rect x="-130" y="-300" width="40" height="50" rx="10" fill="#9aa5ad"/>
<g fill="#8fd3f0" opacity=".8"><ellipse cx="0" cy="-20" rx="300" ry="30"/></g>
<circle cx="60" cy="-120" r="70" fill="#ffd9b8"/><path d="M-10,-140 Q60,-220 130,-140 Q100,-180 60,-180 Q20,-180 -10,-140Z" fill="#4a3324"/><circle cx="40" cy="-125" r="8" fill="#243b36"/><circle cx="85" cy="-125" r="8" fill="#243b36"/><path d="M40,-95 Q60,-80 85,-95" stroke="#243b36" stroke-width="5" fill="none"/>
<g fill="#fff" stroke="#8fd3f0" stroke-width="4"><circle cx="-160" cy="-120" r="26"/><circle cx="-110" cy="-180" r="18"/><circle cx="200" cy="-110" r="22"/></g>
<rect x="-280" y="200" width="30" height="60" fill="#c7cfd4"/><rect x="250" y="200" width="30" height="60" fill="#c7cfd4"/></g>`;
const feather=`<g data-anim="sway" data-origin="0 250" data-amp="0.6"><path d="M0,260 Q-160,60 -40,-240 Q40,-300 60,-240 Q180,40 0,260Z" fill="#8fd3f0"/><path d="M0,260 Q-20,-20 10,-250" stroke="#2b7ea1" stroke-width="10" fill="none"/>
<g stroke="#fff" stroke-width="6" fill="none" opacity=".8"><path d="M-10,0 L-120,60"/><path d="M-5,-80 L-100,-30"/><path d="M0,-160 L-70,-120"/><path d="M10,0 L120,70"/><path d="M12,-80 L110,-30"/><path d="M14,-160 L80,-120"/></g></g>`;
module.exports={
  outName:'영상_TH_이중자음_숏폼', letters:['T','H'],
  A:{bg:['#e3f6ee','#bfe8da'], svg:thumb, particles:'sparkle', hint:'혀를 살짝 내밀고 /θ/', l1:'이중자음(다이그래프) <span class="kw">TH</span> <span class="ipa">/θ/ · /ð/</span>', word:'Thumb', hl:[0,2], ipa:'/θʌm/', ko:'섬 (엄지)'},
  B:{bg:['#d9f1ff','#eef9f3'], ground:C.grass, tag:'소리 바꾸기', hint:'t + h = 한 소리 /θ/',
     stages:[{at:0,text:'<span class="s">t</span>ree',svg:tree,particles:'leaves'},{at:4,text:'<span class="s">t</span><span class="w">h</span>ree',svg:three}],
     l1:'tree → <span class="kw">three</span> <span class="ipa">/θriː/</span>', l2:'스리 (셋) · <b>t</b>와 <b>h</b>가 합쳐 한 소리가 돼요'},
  C:{tag:'TH 단어 더 알아보기', words:[
     {text:'Bath',hl:[2,4],ipa:'/bæθ/',ko:'배스 (목욕)',bg:['#e4f6ff','#cfeeff'],ground:C.room,svg:bath,particles:'bubbles'},
     {text:'Feather',hl:[3,5],ipa:'/ˈfeðər/',ko:'페더 (깃털) · 유성음 /ð/',bg:['#fff3e6','#ffe4d6'],svg:feather}]},
  cues:[
    {at:0.8,text:"Today's sound is T, H.  Thumb.  Thumb."},
    {at:5.4,text:"Tree."},{at:9.4,text:"Three!"},
    {at:11.0,text:"Tree, three.  T and H say th.  Three."},
    {at:15.6,text:"Bath.  Bath."},{at:20.6,text:"Feather.  Feather."},
    {at:25.6,text:"Great job!  See you next time."}]
};
