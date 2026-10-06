const C=require('./_common');
const duck=`<g data-anim="bob" data-amp="0.5"><ellipse cx="0" cy="60" rx="210" ry="140" fill="#ffd54a"/><circle cx="150" cy="-100" r="100" fill="#ffd54a"/><circle cx="180" cy="-120" r="12" fill="#243b36"/><path d="M245,-100 Q310,-110 320,-80 Q310,-50 245,-60Z" fill="#f5a623"/>
<path d="M-60,20 Q-170,0 -160,100 Q-80,120 -20,70Z" fill="#f5c542" data-anim="flap" data-origin="-20 40" data-amp="0.4"/><path d="M-210,40 L-300,-20 L-280,100Z" fill="#ffd54a"/>
<ellipse cx="0" cy="200" rx="300" ry="30" fill="#5cb8e0" opacity=".6"/></g>`;
const sock=`<g data-anim="sway" data-origin="0 -200" data-amp="0.5"><path d="M-110,-260 L110,-260 L110,20 Q110,140 220,160 Q300,180 280,260 L120,260 Q-40,260 -110,120Z" fill="#e2543c"/>
<rect x="-110" y="-280" width="220" height="70" rx="14" fill="#fff"/><path d="M120,260 Q220,260 280,260 Q300,180 220,160 Q160,180 120,230Z" fill="#fff"/>
<g fill="#fff" opacity=".9"><circle cx="-20" cy="-120" r="20"/><circle cx="40" cy="-40" r="20"/><circle cx="-40" cy="20" r="20"/></g></g>`;
const rock=`<g data-anim="bob" data-amp="0.15"><path d="M-300,200 Q-320,40 -180,-60 Q-60,-180 120,-140 Q300,-90 300,80 Q320,220 160,220 L-240,220 Q-310,220 -300,200Z" fill="#6c757d"/>
<path d="M-180,-60 Q-60,-180 120,-140 Q200,-110 240,-40 Q80,-90 -120,0Z" fill="#9aa5ad"/><circle cx="60" cy="90" r="14" fill="#4b545b"/><circle cx="-120" cy="120" r="10" fill="#4b545b"/>
<path d="M-230,220 q10,-60 20,0 M-200,222 q10,-70 20,0 M250,220 q10,-60 20,0" stroke="#5fb86a" stroke-width="8" fill="none" stroke-linecap="round"/></g>`;
const clock=`<g data-anim="sway" data-origin="0 0" data-amp="0.2"><circle cx="0" cy="0" r="260" fill="#e2543c"/><circle cx="0" cy="0" r="220" fill="#fff"/>
<g fill="#243b36"><circle cx="0" cy="-180" r="12"/><circle cx="180" cy="0" r="12"/><circle cx="0" cy="180" r="12"/><circle cx="-180" cy="0" r="12"/></g>
<path d="M0,0 L0,-120" stroke="#243b36" stroke-width="18" stroke-linecap="round" data-anim="spin" data-origin="0 0" data-speed="0.05"/><path d="M0,0 L110,60" stroke="#243b36" stroke-width="14" stroke-linecap="round"/><path d="M0,0 L0,-170" stroke="#e2543c" stroke-width="6" stroke-linecap="round" data-anim="spin" data-origin="0 0" data-speed="0.5"/>
<circle cx="0" cy="0" r="16" fill="#243b36"/><circle cx="-180" cy="-200" r="50" fill="#f5c542"/><circle cx="180" cy="-200" r="50" fill="#f5c542"/></g>`;
const truck=`<g data-anim="bob" data-amp="0.3" data-speed="3"><rect x="-320" y="-120" width="400" height="240" rx="20" fill="#2b7ea1"/><path d="M80,-40 L220,-40 L300,60 L300,120 L80,120Z" fill="#e2543c"/><rect x="110" y="-20" width="110" height="80" rx="10" fill="#8fd3f0"/>
<rect x="-340" y="120" width="660" height="30" fill="#243b36"/></g><g data-anim="spin" data-origin="-200 170" data-speed="2"><circle cx="-200" cy="170" r="70" fill="#243b36"/><circle cx="-200" cy="170" r="30" fill="#c7cfd4"/><path d="M-200,170 L-200,110" stroke="#9aa5ad" stroke-width="8"/></g><g data-anim="spin" data-origin="200 170" data-speed="2"><circle cx="200" cy="170" r="70" fill="#243b36"/><circle cx="200" cy="170" r="30" fill="#c7cfd4"/><path d="M200,170 L200,110" stroke="#9aa5ad" stroke-width="8"/></g>`;
const kick=`<g transform="translate(0,-170)"><g data-anim="sway" data-origin="0 300" data-amp="0.2" transform="translate(-80,-40)">${C.face(C.smile)}<path d="M-150,340 Q-140,160 0,150 Q140,160 150,340Z" fill="#e2543c"/></g>
<path d="M-60,300 L-80,420" stroke="#2b7ea1" stroke-width="40" stroke-linecap="round"/><path d="M-20,300 L160,320" stroke="#2b7ea1" stroke-width="40" stroke-linecap="round" data-anim="sway" data-origin="-20 300" data-amp="2" data-speed="2"/>
<g data-anim="slide" data-amp="1.5" data-speed="2"><circle cx="280" cy="330" r="70" fill="#fff" stroke="#243b36" stroke-width="6"/><path d="M280,290 L310,310 L300,350 L260,350 L250,310Z" fill="#243b36"/></g></g>`;
module.exports={
  outName:'영상_CK_이중자음_숏폼', letters:['C','K'],
  A:{bg:['#dbeeff','#7fd0f2'], ground:C.water, svg:duck, particles:'bubbles', hint:'끝소리 /k/ · 짧은 모음 뒤', l1:'이중자음(다이그래프) <span class="kw">CK</span> <span class="ipa">/k/</span>', word:'Duck', hl:[2,4], ipa:'/dʌk/', ko:'덕 (오리)'},
  B:{bg:['#fff8e1','#ffecb3'], ground:C.grass, tag:'단어 가족 -ock', hint:'짧은 모음 뒤에는 ck',
     stages:[{at:0,text:'<span class="w">s</span>o<span class="s">ck</span>',svg:sock},{at:2.5,text:'<span class="w">r</span>o<span class="s">ck</span>',svg:rock},{at:5,text:'<span class="w">cl</span>o<span class="s">ck</span>',svg:clock}],
     l1:'sock → rock → <span class="kw">clock</span> <span class="ipa">/klɑːk/</span>', l2:'클락 (시계) · 끝소리 <b>ck</b>는 /k/ 한 소리'},
  C:{tag:'CK 단어 더 알아보기', words:[
     {text:'Truck',hl:[3,5],ipa:'/trʌk/',ko:'트럭',bg:['#e3f6ee','#bfe8da'],ground:C.grass,svg:truck},
     {text:'Kick',hl:[2,4],ipa:'/kɪk/',ko:'킥 (차다)',bg:['#d9f1ff','#eef9f3'],ground:C.grass,svg:kick}]},
  cues:[
    {at:0.8,text:"Today's sound is C, K.  Duck.  Duck."},
    {at:5.4,text:"Sock."},{at:7.9,text:"Rock."},{at:10.4,text:"Clock!"},
    {at:11.5,text:"Sock, rock, clock.  C and K make one sound: k."},
    {at:15.6,text:"Truck.  Truck."},{at:20.6,text:"Kick.  Kick."},
    {at:25.6,text:"Great job!  See you next time."}]
};
