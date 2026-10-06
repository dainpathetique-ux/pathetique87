const C=require('./_common'), L=require('./_lib');
const drum=`<g data-anim="bob" data-amp="0.2"><rect x="-240" y="-80" width="480" height="280" fill="#e2543c"/><ellipse cx="0" cy="200" rx="240" ry="60" fill="#c43c28"/><ellipse cx="0" cy="-80" rx="240" ry="60" fill="#fff3e6"/><ellipse cx="0" cy="-80" rx="240" ry="60" fill="none" stroke="#f5c542" stroke-width="12"/>
<g stroke="#f5c542" stroke-width="10"><path d="M-220,-60 L-120,180 M-120,-60 L-20,180 M-20,-60 L80,180 M80,-60 L180,180 M180,-60 L230,100"/></g></g>
<g data-anim="sway" data-origin="-200 -300" data-amp="1.5" data-speed="3"><line x1="-200" y1="-300" x2="-60" y2="-110" stroke="#c48a5a" stroke-width="14" stroke-linecap="round"/><circle cx="-60" cy="-110" r="22" fill="#fff"/></g><g data-anim="sway" data-origin="200 -300" data-amp="-1.5" data-speed="3"><line x1="200" y1="-300" x2="60" y2="-110" stroke="#c48a5a" stroke-width="14" stroke-linecap="round"/><circle cx="60" cy="-110" r="22" fill="#fff"/></g>`;
const rip=`<g data-anim="sway" data-origin="-120 0" data-amp="0.5"><path d="M-300,-220 L-20,-220 L-10,-150 L-40,-90 L0,-20 L-30,60 L10,130 L-20,220 L-300,220Z" fill="#fff" stroke="#c7cfd4" stroke-width="6"/><g stroke="#8fd3f0" stroke-width="8"><path d="M-260,-150 L-80,-150 M-260,-80 L-90,-80 M-260,-10 L-60,-10 M-260,60 L-80,60 M-260,130 L-50,130"/></g></g>
<g data-anim="sway" data-origin="140 0" data-amp="-0.5"><path d="M20,-220 L300,-220 L300,220 L20,220 L40,130 L10,60 L50,-20 L0,-90 L30,-150Z" fill="#fff" stroke="#c7cfd4" stroke-width="6"/><g stroke="#8fd3f0" stroke-width="8"><path d="M80,-150 L260,-150 M90,-80 L260,-80 M60,-10 L260,-10 M90,60 L260,60 M70,130 L260,130"/></g></g>`;
const dip=`<g data-anim="bob" data-amp="0.2"><path d="M-260,0 Q-260,220 0,220 Q260,220 260,0Z" fill="#fff"/><ellipse cx="0" cy="0" rx="260" ry="50" fill="#e2543c"/><ellipse cx="0" cy="0" rx="220" ry="36" fill="#f08a6b"/></g>
<g data-anim="bob" data-amp="1.2" data-speed="1.2"><path d="M-40,-280 L120,-200 L40,0 L-80,-60Z" fill="#f5c16c"/><path d="M-80,-60 L40,0 L20,40 L-100,-20Z" fill="#e2543c"/></g>`;
const drip=`<g><path d="M-200,-260 L-200,-120 Q-200,-60 -140,-60 L60,-60 Q120,-60 120,0 L120,40" stroke="#9aa5ad" stroke-width="40" fill="none" stroke-linecap="round"/><rect x="-260" y="-320" width="120" height="70" rx="20" fill="#6c757d"/><circle cx="-200" cy="-360" r="40" fill="#e2543c"/><rect x="90" y="30" width="60" height="30" rx="8" fill="#6c757d"/></g>
<g data-anim="drip" data-amp="1.2"><path d="M120,80 q-40,60 0,100 q40,-40 0,-100z" fill="#5cb8e0"/></g><ellipse cx="120" cy="300" rx="120" ry="30" fill="#8fd3f0" opacity=".8"/>`;
const dress=`<g data-anim="sway" data-origin="0 -200" data-amp="0.3"><path d="M-110,-260 L110,-260 L130,-100 L-130,-100Z" fill="#ff86b6"/><path d="M-110,-260 L-90,-320 L-60,-260 M110,-260 L90,-320 L60,-260" stroke="#ff86b6" stroke-width="16" fill="none"/>
<path d="M-130,-100 L-280,260 L280,260 L130,-100Z" fill="#ff9ec4"/><rect x="-140" y="-120" width="280" height="36" rx="12" fill="#e2543c"/><g fill="#fff"><circle cx="-100" cy="80" r="16"/><circle cx="0" cy="140" r="16"/><circle cx="100" cy="80" r="16"/><circle cx="-180" cy="200" r="16"/><circle cx="180" cy="200" r="16"/></g></g>`;
const dragon=`<g data-anim="bob" data-amp="0.6"><path d="M-320,100 Q-280,-20 -180,20 Q-100,-120 60,-120 Q220,-120 280,0 Q230,80 120,100 L-180,120 Q-260,140 -320,100Z" fill="#5fb86a"/>
<path d="M-100,-100 Q-140,-240 -20,-220 Q20,-180 -20,-120Z" fill="#3f9550" data-anim="flap" data-origin="-60 -110" data-amp="0.6"/>
<circle cx="260" cy="-60" r="80" fill="#5fb86a"/><path d="M330,-70 Q400,-60 410,-30 Q380,0 330,-10Z" fill="#3f9550"/><circle cx="280" cy="-80" r="12" fill="#ffd54a"/><circle cx="283" cy="-80" r="6" fill="#243b36"/>
<path d="M240,-140 L260,-200 L280,-140 M290,-135 L320,-185 L330,-130" fill="#f5a623"/><g data-anim="blink" data-speed="0.8"><path d="M410,-20 q50,-20 90,10 q-40,30 -90,10z" fill="#f5a623"/><path d="M420,-15 q30,-10 50,5 q-20,15 -50,5z" fill="#ffd54a"/></g>
<rect x="-120" y="100" width="50" height="80" rx="20" fill="#3f9550"/><rect x="40" y="100" width="50" height="80" rx="20" fill="#3f9550"/></g>`;
module.exports={
  outName:'영상_DR_자음군_숏폼', letters:['D','R'],
  A:{bg:['#fff3e6','#ffe4d6'], ground:C.room, svg:drum, hint:'두 글자가 만나면 /dr/', l1:'자음군(블렌드) <span class="kw">DR</span> <span class="ipa">/dr/</span>', word:'Drum', hl:[0,2], ipa:'/drʌm/', ko:'드럼 (북)'},
  B:{bg:['#eef2ff','#e3eaff'], ground:C.table, tag:'자음군 만들기', hint:'d + r = dr',
     stages:[{at:0,text:'<span class="w">r</span>ip',svg:rip},{at:2.5,text:'<span class="s">d</span>ip',svg:dip},{at:5,text:'<span class="s">d</span><span class="w">r</span>ip',svg:drip}],
     l1:'rip → dip → <span class="kw">drip</span> <span class="ipa">/drɪp/</span>', l2:'드립 (물방울) · <b>d</b>와 <b>r</b> 두 소리가 모두 들려요'},
  C:{tag:'DR 단어 더 알아보기', words:[
     {text:'Dress',hl:[0,2],ipa:'/dres/',ko:'드레스 (원피스)',bg:['#ffeef5','#ffe0ec'],ground:C.room,svg:dress,particles:'sparkle'},
     {text:'Dragon',hl:[0,2],ipa:'/ˈdræɡən/',ko:'드래건 (용)',bg:['#efe6fb','#dcd0f5'],ground:C.grass,svg:dragon}]},
  cues:[{at:0.8,text:"Today's sound is D, R.  Drum.  Drum."},{at:5.4,text:"Rip."},{at:7.9,text:"Dip."},{at:10.4,text:"Drip!"},{at:11.5,text:"Rip, dip, drip.  Can you hear both sounds?"},{at:15.6,text:"Dress.  Dress."},{at:20.6,text:"Dragon.  Dragon."},{at:25.6,text:"Great job!  See you next time."}]
};
