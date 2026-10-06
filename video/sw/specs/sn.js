const C=require('./_common');
const snake=`<g data-anim="bob"><path d="M-320,120 Q-220,-40 -100,80 T140,80 T300,-20" fill="none" stroke="#5fb86a" stroke-width="70" stroke-linecap="round"/>
<path d="M-320,120 Q-220,-40 -100,80 T140,80 T300,-20" fill="none" stroke="#9ad97f" stroke-width="22" stroke-dasharray="30 40" stroke-linecap="round"/>
<circle cx="310" cy="-40" r="62" fill="#5fb86a"/><circle cx="330" cy="-55" r="9" fill="#243b36"/><circle cx="300" cy="-55" r="9" fill="#243b36"/>
<path d="M360,-20 l45,10 l-20,-18 l20,-18 l-45,10z" fill="#e2543c" data-anim="slide" data-amp="0.3" data-speed="4"/></g>`;
const nail=`<rect x="-280" y="60" width="560" height="140" rx="20" fill="#c48a5a"/><rect x="-280" y="60" width="560" height="30" rx="10" fill="#a86f45"/>
<g data-anim="bob" data-amp="0.3"><rect x="-18" y="-230" width="36" height="300" fill="#9aa5ad"/><rect x="-60" y="-260" width="120" height="40" rx="12" fill="#b7c0c6"/><path d="M-18,70 L0,120 L18,70Z" fill="#9aa5ad"/></g>
<g data-anim="sway" data-origin="200 -120" data-amp="1.5"><rect x="190" y="-140" width="30" height="260" rx="10" fill="#c48a5a"/><rect x="120" y="-200" width="170" height="90" rx="20" fill="#6c757d"/></g>`;
const sail=`<g data-anim="sway" data-origin="0 200" data-amp="0.6"><path d="M-260,150 L-200,260 L220,260 L300,150Z" fill="#e2543c"/><rect x="-250" y="110" width="540" height="40" rx="10" fill="#f5a623"/>
<rect x="-10" y="-320" width="20" height="440" fill="#8a6a52"/><path d="M10,-300 L260,100 L10,100Z" fill="#fff"/><path d="M-10,-250 L-200,80 L-10,80Z" fill="#2b7ea1"/><path d="M10,-320 l70,20 l-70,20z" fill="#e2543c"/></g>
<path d="M-420,300 q60,-30 120,0 t120,0 t120,0 t120,0 t120,0 t120,0" fill="none" stroke="#5cb8e0" stroke-width="18" stroke-linecap="round" data-anim="slide" data-amp="0.5"/>`;
const snail=`<ellipse cx="-20" cy="200" rx="330" ry="40" fill="#000" opacity=".08"/><path d="M-330,190 Q-320,60 -180,70 L220,70 Q330,80 320,160 Q300,200 240,200 L-280,200 Q-340,200 -330,190Z" fill="#f5c16c"/>
<g data-anim="sway" data-origin="0 60" data-amp="0.3"><circle cx="0" cy="40" r="170" fill="#e2543c"/><circle cx="0" cy="40" r="125" fill="#f08a6b"/><circle cx="0" cy="40" r="80" fill="#e2543c"/><circle cx="0" cy="40" r="35" fill="#f08a6b"/></g>
<g data-anim="sway" data-origin="230 70" data-amp="0.8"><line x1="230" y1="70" x2="270" y2="-70" stroke="#f5c16c" stroke-width="22" stroke-linecap="round"/><line x1="270" y1="70" x2="330" y2="-50" stroke="#f5c16c" stroke-width="22" stroke-linecap="round"/><circle cx="270" cy="-80" r="20" fill="#243b36"/><circle cx="332" cy="-60" r="20" fill="#243b36"/></g>
<path d="M250,140 Q275,165 300,140" stroke="#243b36" stroke-width="6" fill="none"/>`;
const snowman=`<g data-anim="sway" data-origin="0 250" data-amp="0.3"><circle cx="0" cy="190" r="190" fill="#fff"/><circle cx="0" cy="-60" r="140" fill="#fff"/><circle cx="0" cy="-260" r="105" fill="#fff"/>
<rect x="-110" y="-380" width="220" height="30" rx="10" fill="#243b36"/><rect x="-75" y="-500" width="150" height="130" rx="14" fill="#243b36"/>
<circle cx="-35" cy="-285" r="10" fill="#243b36"/><circle cx="35" cy="-285" r="10" fill="#243b36"/><path d="M0,-260 l110,20 l-110,20z" fill="#f5a623"/>
<path d="M-120,-170 Q0,-110 120,-170 L130,-130 Q0,-70 -130,-130Z" fill="#e2543c"/><rect x="60" y="-150" width="50" height="130" rx="14" fill="#e2543c"/>
<circle cx="0" cy="-90" r="12" fill="#243b36"/><circle cx="0" cy="-30" r="12" fill="#243b36"/><circle cx="0" cy="130" r="12" fill="#243b36"/>
<line x1="-130" y1="-60" x2="-300" y2="-160" stroke="#8a6a52" stroke-width="18" stroke-linecap="round"/><line x1="130" y1="-60" x2="300" y2="-160" stroke="#8a6a52" stroke-width="18" stroke-linecap="round"/></g>`;
const snack=`<ellipse cx="0" cy="150" rx="420" ry="90" fill="#fff"/><ellipse cx="0" cy="150" rx="340" ry="60" fill="#eef3f6"/>
<g data-anim="bob" data-amp="0.4"><circle cx="-110" cy="60" r="150" fill="#d9a066"/><g fill="#5a3a22"><circle cx="-170" cy="20" r="18"/><circle cx="-80" cy="0" r="16"/><circle cx="-130" cy="110" r="17"/><circle cx="-40" cy="90" r="15"/><circle cx="-200" cy="100" r="14"/></g></g>
<g data-anim="bob" data-amp="0.4" data-speed="1.3"><circle cx="150" cy="40" r="120" fill="#f0a868"/><circle cx="150" cy="40" r="60" fill="#fff3e6"/><g stroke="#b56b2a" stroke-width="14" fill="none"><path d="M90,10 Q150,-40 210,10"/><path d="M150,-80 L150,-30"/></g></g>`;
module.exports={
  outName:'영상_SN_자음군_숏폼', letters:['S','N'],
  A:{bg:['#e3f6ee','#bfe8da'], ground:C.grass, svg:snake, particles:'leaves', hint:'두 글자가 만나면 /sn/', l1:'자음군(블렌드) <span class="kw">SN</span> <span class="ipa">/sn/</span>', word:'Snake', hl:[0,2], ipa:'/sneɪk/', ko:'스네이크 (뱀)'},
  B:{bg:['#d9f1ff','#eef9f3'], ground:C.grass, tag:'자음군 만들기', hint:'s + n = sn',
     stages:[{at:0,text:'<span class="s">n</span>ail',svg:nail},{at:2.5,text:'<span class="w">s</span>ail',svg:sail},{at:5,text:'<span class="w">s</span><span class="s">n</span>ail',svg:snail,particles:'leaves'}],
     l1:'nail → sail → <span class="kw">snail</span> <span class="ipa">/sneɪl/</span>', l2:'스네일 (달팽이) · <b>s</b>와 <b>n</b> 두 소리가 모두 들려요'},
  C:{tag:'SN 단어 더 알아보기', words:[
     {text:'Snow',hl:[0,2],ipa:'/snoʊ/',ko:'스노 (눈)',bg:['#dbeeff','#eef6ff'],ground:C.snowGround,svg:snowman,particles:'snow'},
     {text:'Snack',hl:[0,2],ipa:'/snæk/',ko:'스낵 (간식)',bg:['#fff3e6','#ffe4d6'],ground:C.table,svg:snack}]},
  cues:[
    {at:0.8,text:"Today's sound is S, N.  Snake.  Snake."},
    {at:5.4,text:"Nail."},{at:7.9,text:"Sail."},{at:10.4,text:"Snail!"},
    {at:11.5,text:"Nail, sail, snail.  Can you hear both sounds?"},
    {at:15.6,text:"Snow.  Snow."},{at:20.6,text:"Snack.  Snack."},
    {at:25.6,text:"Great job!  See you next time."}]
};
