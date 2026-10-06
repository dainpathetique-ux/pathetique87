const C=require('./_common'), L=require('./_lib');
const slide=`<g data-anim="bob" data-amp="0.15"><rect x="-300" y="-200" width="60" height="460" fill="#9aa5ad"/><rect x="-330" y="-230" width="160" height="50" rx="10" fill="#6c757d"/><path d="M-240,-200 Q-100,-180 60,60 Q180,220 320,240 L320,270 Q140,270 20,110 Q-100,-130 -240,-140Z" fill="#e2543c"/><path d="M-240,-170 Q-100,-150 50,80 Q170,230 320,250" stroke="#fff" stroke-width="8" fill="none"/>
<g data-anim="slide" data-amp="0.8"><circle cx="-60" cy="-80" r="40" fill="#ffd9b8"/><path d="M-100,-95 Q-60,-150 -20,-95 Q-40,-120 -60,-120 Q-80,-120 -100,-95Z" fill="#4a3324"/><rect x="-90" y="-40" width="60" height="70" rx="18" fill="#2b7ea1"/><circle cx="-70" cy="-85" r="4" fill="#243b36"/><circle cx="-50" cy="-85" r="4" fill="#243b36"/></g></g>`;
const slip=`<g data-anim="sway" data-origin="0 250" data-amp="0.6" data-speed="2"><g transform="rotate(-25)">${C.face('<ellipse cx="0" cy="60" rx="28" ry="36" fill="#8b2e2e"/><circle cx="-50" cy="-10" r="14" fill="#243b36"/><circle cx="50" cy="-10" r="14" fill="#243b36"/>')}<path d="M-190,340 Q-170,160 0,150 Q170,160 190,340Z" fill="#f5a623"/></g>
<line x1="-150" y1="300" x2="-330" y2="200" stroke="#ffd9b8" stroke-width="30" stroke-linecap="round"/><line x1="140" y1="280" x2="300" y2="160" stroke="#ffd9b8" stroke-width="30" stroke-linecap="round"/></g>
<g><path d="M-320,300 Q-280,200 -200,240 Q-260,270 -240,320 Q-300,330 -320,300Z" fill="#ffd54a"/><path d="M-320,300 Q-350,240 -300,200" stroke="#a86f45" stroke-width="10" fill="none"/></g>`;
const sleep=`<g data-anim="bob" data-amp="0.15"><rect x="-320" y="60" width="640" height="200" rx="30" fill="#8a6a52"/><rect x="-320" y="0" width="640" height="120" rx="30" fill="#2b7ea1"/><rect x="-300" y="-60" width="200" height="90" rx="30" fill="#fff"/>
<circle cx="-200" cy="-40" r="70" fill="#ffd9b8"/><path d="M-270,-60 Q-200,-130 -130,-60 Q-160,-100 -200,-100 Q-240,-100 -270,-60Z" fill="#4a3324"/><path d="M-230,-35 Q-215,-25 -200,-35 M-190,-35 Q-175,-25 -160,-35" stroke="#243b36" stroke-width="5" fill="none"/>
<g data-anim="bob" data-amp="1" data-speed="0.8"><text x="-60" y="-120" font-size="70" font-weight="700" fill="#2b7ea1" font-family="KR">z</text><text x="10" y="-190" font-size="90" font-weight="700" fill="#2b7ea1" font-family="KR">z</text><text x="100" y="-280" font-size="110" font-weight="700" fill="#2b7ea1" font-family="KR">Z</text></g></g>`;
const slow=`<g data-anim="slide" data-amp="0.3" data-speed="0.5"><ellipse cx="0" cy="40" rx="230" ry="140" fill="#5fb86a"/><g fill="#3f9550"><circle cx="-80" cy="20" r="40"/><circle cx="40" cy="-20" r="45"/><circle cx="110" cy="60" r="35"/><circle cx="-30" cy="100" r="30"/></g>
<ellipse cx="260" cy="120" rx="70" ry="55" fill="#8fbf5a"/><circle cx="280" cy="105" r="8" fill="#243b36"/><path d="M300,135 Q320,145 335,130" stroke="#243b36" stroke-width="5" fill="none"/>
<rect x="-180" y="140" width="70" height="60" rx="20" fill="#8fbf5a"/><rect x="60" y="150" width="70" height="60" rx="20" fill="#8fbf5a"/></g>`;
module.exports={
  outName:'영상_SL_자음군_숏폼', letters:['S','L'],
  A:{bg:['#e3f6ee','#bfe8da'], ground:C.grass, svg:slide, hint:'두 글자가 만나면 /sl/', l1:'자음군(블렌드) <span class="kw">SL</span> <span class="ipa">/sl/</span>', word:'Slide', hl:[0,2], ipa:'/slaɪd/', ko:'슬라이드 (미끄럼틀)'},
  B:{bg:['#d9f1ff','#eef9f3'], ground:C.grass, tag:'자음군 만들기', hint:'s + l = sl',
     stages:[{at:0,text:'<span class="s">s</span>ip',svg:L.cup},{at:2.5,text:'<span class="w">l</span>ip',svg:L.lips},{at:5,text:'<span class="s">s</span><span class="w">l</span>ip',svg:slip}],
     l1:'sip → lip → <span class="kw">slip</span> <span class="ipa">/slɪp/</span>', l2:'슬립 (미끄러지다) · <b>s</b>와 <b>l</b> 두 소리가 모두 들려요'},
  C:{tag:'SL 단어 더 알아보기', words:[
     {text:'Sleep',hl:[0,2],ipa:'/sliːp/',ko:'슬립 (자다)',bg:['#2d3a5a','#4a5a8a'],svg:sleep},
     {text:'Slow',hl:[0,2],ipa:'/sloʊ/',ko:'슬로 (느린)',bg:['#e3f6ee','#bfe8da'],ground:C.grass,svg:slow}]},
  cues:[{at:0.8,text:"Today's sound is S, L.  Slide.  Slide."},{at:5.4,text:"Sip."},{at:7.9,text:"Lip."},{at:10.4,text:"Slip!"},{at:11.5,text:"Sip, lip, slip.  Can you hear both sounds?"},{at:15.6,text:"Sleep.  Sleep."},{at:20.6,text:"Slow.  Slow."},{at:25.6,text:"Great job!  See you next time."}]
};
