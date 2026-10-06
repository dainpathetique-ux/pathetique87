const C=require('./_common'), L=require('./_lib');
const flag=`<g><rect x="-200" y="-320" width="24" height="620" fill="#9aa5ad"/><circle cx="-188" cy="-330" r="20" fill="#f5c542"/></g><g data-anim="sway" data-origin="-176 -300" data-amp="0.5" data-speed="2"><path d="M-176,-300 Q0,-340 180,-300 L180,-60 Q0,-20 -176,-60Z" fill="#e2543c"/><path d="M-176,-220 Q0,-260 180,-220 L180,-140 Q0,-100 -176,-140Z" fill="#fff"/><circle cx="0" cy="-180" r="40" fill="#2b7ea1"/></g>`;
const flip=`<g data-anim="sway" data-origin="0 200" data-amp="0.6" data-speed="2"><ellipse cx="0" cy="120" rx="240" ry="60" fill="#243b36"/><ellipse cx="0" cy="100" rx="220" ry="50" fill="#6c757d"/><rect x="220" y="80" width="200" height="34" rx="14" fill="#243b36"/></g>
<g data-anim="bob" data-amp="2" data-speed="2"><g data-anim="spin" data-origin="0 -140" data-speed="2"><ellipse cx="0" cy="-140" rx="150" ry="36" fill="#f0a868"/><ellipse cx="0" cy="-150" rx="150" ry="36" fill="#f5c16c"/></g></g>`;
const flower=`<g data-anim="sway" data-origin="0 260" data-amp="0.4"><rect x="-14" y="0" width="28" height="270" rx="12" fill="#5fb86a"/><ellipse cx="-70" cy="160" rx="70" ry="30" fill="#6fc47a" transform="rotate(-30 -70 160)"/><ellipse cx="70" cy="110" rx="70" ry="30" fill="#6fc47a" transform="rotate(30 70 110)"/>
<g fill="#ff9ec4"><ellipse cx="0" cy="-150" rx="55" ry="90"/><ellipse cx="0" cy="-150" rx="55" ry="90" transform="rotate(60 0 -40)"/><ellipse cx="0" cy="-150" rx="55" ry="90" transform="rotate(120 0 -40)"/><ellipse cx="0" cy="-150" rx="55" ry="90" transform="rotate(180 0 -40)"/><ellipse cx="0" cy="-150" rx="55" ry="90" transform="rotate(240 0 -40)"/><ellipse cx="0" cy="-150" rx="55" ry="90" transform="rotate(300 0 -40)"/></g><circle cx="0" cy="-40" r="60" fill="#ffd54a"/></g>`;
const fly=`<g data-anim="bob" data-amp="0.8"><path d="M-300,40 L200,40 Q320,40 340,-10 Q320,-60 200,-60 L-240,-60 Q-320,-60 -300,40Z" fill="#fff" stroke="#9aa5ad" stroke-width="6"/><path d="M-60,-60 L-180,-200 L-80,-200 L40,-60Z" fill="#2b7ea1"/><path d="M-40,40 L-140,160 L-50,160 L50,40Z" fill="#2b7ea1"/><path d="M-300,40 L-340,-120 L-260,-120 L-230,-60Z" fill="#e2543c"/><g fill="#8fd3f0"><circle cx="-80" cy="-10" r="18"/><circle cx="-10" cy="-10" r="18"/><circle cx="60" cy="-10" r="18"/><circle cx="130" cy="-10" r="18"/></g></g>
<g data-anim="slide" data-amp="0.5"><ellipse cx="-260" cy="220" rx="140" ry="40" fill="#fff" opacity=".8"/><ellipse cx="200" cy="-240" rx="120" ry="34" fill="#fff" opacity=".8"/></g>`;
module.exports={
  outName:'영상_FL_자음군_숏폼', letters:['F','L'],
  A:{bg:['#dbeeff','#7fd0f2'], ground:C.grass, svg:flag, hint:'두 글자가 만나면 /fl/', l1:'자음군(블렌드) <span class="kw">FL</span> <span class="ipa">/fl/</span>', word:'Flag', hl:[0,2], ipa:'/flæɡ/', ko:'플래그 (깃발)'},
  B:{bg:['#fff8e1','#ffecb3'], ground:C.table, tag:'자음군 만들기', hint:'f + l = fl',
     stages:[{at:0,text:'<span class="w">l</span>ip',svg:L.lips},{at:4,text:'<span class="s">f</span><span class="w">l</span>ip',svg:flip}],
     l1:'lip → <span class="kw">flip</span> <span class="ipa">/flɪp/</span>', l2:'플립 (뒤집다) · <b>f</b>와 <b>l</b> 두 소리가 모두 들려요'},
  C:{tag:'FL 단어 더 알아보기', words:[
     {text:'Flower',hl:[0,2],ipa:'/ˈflaʊər/',ko:'플라워 (꽃)',bg:['#e3f6ee','#bfe8da'],ground:C.grass,svg:flower,particles:'leaves'},
     {text:'Fly',hl:[0,2],ipa:'/flaɪ/',ko:'플라이 (날다)',bg:['#dbeeff','#7fd0f2'],svg:fly}]},
  cues:[{at:0.8,text:"Today's sound is F, L.  Flag.  Flag."},{at:5.4,text:"Lip."},{at:9.4,text:"Flip!"},{at:11.0,text:"Lip, flip.  Can you hear both sounds?  Flip."},{at:15.6,text:"Flower.  Flower."},{at:20.6,text:"Fly.  Fly."},{at:25.6,text:"Great job!  See you next time."}]
};
