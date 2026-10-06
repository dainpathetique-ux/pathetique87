const C=require('./_common'), L=require('./_lib');
const grapes=`<g data-anim="sway" data-origin="0 -260" data-amp="0.3"><path d="M0,-260 Q20,-320 60,-330" stroke="#5c8a3a" stroke-width="12" fill="none" stroke-linecap="round"/><ellipse cx="90" cy="-280" rx="80" ry="40" fill="#5fb86a" transform="rotate(-20 90 -280)"/>
<g fill="#8e44ad"><circle cx="-120" cy="-180" r="55"/><circle cx="0" cy="-190" r="55"/><circle cx="120" cy="-180" r="55"/><circle cx="-60" cy="-90" r="55"/><circle cx="60" cy="-90" r="55"/><circle cx="-120" cy="0" r="55"/><circle cx="0" cy="0" r="55"/><circle cx="120" cy="0" r="55"/><circle cx="-60" cy="90" r="55"/><circle cx="60" cy="90" r="55"/><circle cx="0" cy="180" r="55"/></g>
<g fill="#b07cc6" opacity=".8"><circle cx="-135" cy="-195" r="14"/><circle cx="-15" cy="-205" r="14"/><circle cx="105" cy="-195" r="14"/><circle cx="-75" cy="-105" r="14"/><circle cx="45" cy="-105" r="14"/><circle cx="-15" cy="-15" r="14"/><circle cx="-15" cy="165" r="14"/></g></g>`;
const duckSmall=(x,y)=>`<g transform="translate(${x},${y}) scale(.45)"><ellipse cx="0" cy="60" rx="210" ry="140" fill="#ffd54a"/><circle cx="150" cy="-100" r="100" fill="#ffd54a"/><circle cx="180" cy="-120" r="12" fill="#243b36"/><path d="M245,-100 Q310,-110 320,-80 Q310,-50 245,-60Z" fill="#f5a623"/><path d="M-210,40 L-300,-20 L-280,100Z" fill="#ffd54a"/></g>`;
const row=`<g data-anim="slide" data-amp="0.4" data-speed="0.8">${duckSmall(-260,60)}${duckSmall(0,60)}${duckSmall(260,60)}</g><ellipse cx="0" cy="200" rx="420" ry="30" fill="#5cb8e0" opacity=".6"/>`;
const grow=L.plant(300);
const green=`<g data-anim="sway" data-origin="0 260" data-amp="0.4"><path d="M0,260 Q-260,160 -200,-120 Q-60,-320 60,-280 Q260,-200 160,80 Q100,220 0,260Z" fill="#5fb86a"/><path d="M0,260 Q20,0 40,-240" stroke="#3f9550" stroke-width="10" fill="none"/><g stroke="#3f9550" stroke-width="6" fill="none" opacity=".8"><path d="M20,60 L-120,0"/><path d="M28,-40 L-100,-100"/><path d="M34,-140 L-60,-200"/><path d="M22,40 L140,-20"/><path d="M30,-60 L150,-120"/></g></g>`;
const grandma=`<g data-anim="sway" data-origin="0 300" data-amp="0.2"><circle cx="0" cy="0" r="150" fill="#ffd9b8"/><path d="M-160,-10 Q-150,-190 0,-180 Q150,-190 160,-10 Q120,-130 0,-120 Q-120,-130 -160,-10Z" fill="#c7cfd4"/><circle cx="0" cy="-170" r="50" fill="#c7cfd4"/>
<path d="M-50,70 Q0,110 50,70" stroke="#243b36" stroke-width="7" fill="none"/><circle cx="-55" cy="-10" r="10" fill="#243b36"/><circle cx="55" cy="-10" r="10" fill="#243b36"/>
<g stroke="#6c757d" stroke-width="8" fill="none"><circle cx="-55" cy="-10" r="40"/><circle cx="55" cy="-10" r="40"/><path d="M-15,-10 L15,-10 M-95,-15 L-150,-30 M95,-15 L150,-30"/></g>
<circle cx="-100" cy="40" r="18" fill="#ffb3a0" opacity=".7"/><circle cx="100" cy="40" r="18" fill="#ffb3a0" opacity=".7"/><path d="M-190,340 Q-170,160 0,150 Q170,160 190,340Z" fill="#8e44ad"/><path d="M-120,180 Q0,230 120,180" stroke="#fff" stroke-width="8" fill="none"/></g>`;
module.exports={
  outName:'영상_GR_자음군_숏폼', letters:['G','R'],
  A:{bg:['#efe6fb','#dcd0f5'], ground:C.table, svg:grapes, hint:'두 글자가 만나면 /gr/', l1:'자음군(블렌드) <span class="kw">GR</span> <span class="ipa">/ɡr/</span>', word:'Grapes', hl:[0,2], ipa:'/ɡreɪps/', ko:'그레이프스 (포도)'},
  B:{bg:['#dbeeff','#e4f6ff'], ground:C.grass, tag:'자음군 만들기', hint:'g + r = gr',
     stages:[{at:0,text:'<span class="w">r</span>ow',svg:row},{at:4,text:'<span class="s">g</span><span class="w">r</span>ow',svg:grow,particles:'sparkle'}],
     l1:'row → <span class="kw">grow</span> <span class="ipa">/ɡroʊ/</span>', l2:'그로 (자라다) · <b>g</b>와 <b>r</b> 두 소리가 모두 들려요'},
  C:{tag:'GR 단어 더 알아보기', words:[
     {text:'Green',hl:[0,2],ipa:'/ɡriːn/',ko:'그린 (초록)',bg:['#e3f6ee','#bfe8da'],ground:C.grass,svg:green,particles:'leaves'},
     {text:'Grandma',hl:[0,2],ipa:'/ˈɡrænmɑː/',ko:'그랜마 (할머니)',bg:['#fff3e6','#ffe4d6'],ground:C.room,svg:grandma}]},
  cues:[{at:0.8,text:"Today's sound is G, R.  Grapes.  Grapes."},{at:5.4,text:"Row."},{at:9.4,text:"Grow!"},{at:11.0,text:"Row, grow.  Can you hear both sounds?  Grow."},{at:15.6,text:"Green.  Green."},{at:20.6,text:"Grandma.  Grandma."},{at:25.6,text:"Great job!  See you next time."}]
};
