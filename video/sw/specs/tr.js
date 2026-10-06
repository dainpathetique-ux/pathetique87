const C=require('./_common'), L=require('./_lib');
const train=`<g data-anim="bob" data-amp="0.3" data-speed="3"><rect x="-340" y="-60" width="260" height="200" rx="20" fill="#2b7ea1"/><rect x="-100" y="-160" width="300" height="300" rx="24" fill="#e2543c"/><rect x="-60" y="-120" width="100" height="100" rx="12" fill="#8fd3f0"/><rect x="80" y="-120" width="90" height="100" rx="12" fill="#8fd3f0"/>
<rect x="200" y="20" width="140" height="120" rx="16" fill="#e2543c"/><rect x="230" y="-120" width="60" height="140" rx="14" fill="#243b36"/><rect x="-360" y="140" width="720" height="26" fill="#243b36"/>
<g data-anim="bob" data-amp="1.5" data-speed="0.9"><circle cx="260" cy="-170" r="34" fill="#fff" opacity=".9"/><circle cx="300" cy="-240" r="44" fill="#fff" opacity=".8"/><circle cx="360" cy="-320" r="54" fill="#fff" opacity=".6"/></g></g>
<g data-anim="spin" data-origin="-250 170" data-speed="2"><circle cx="-250" cy="170" r="50" fill="#243b36"/><circle cx="-250" cy="170" r="20" fill="#c7cfd4"/></g><g data-anim="spin" data-origin="-20 170" data-speed="2"><circle cx="-20" cy="170" r="50" fill="#243b36"/><circle cx="-20" cy="170" r="20" fill="#c7cfd4"/></g><g data-anim="spin" data-origin="200 170" data-speed="2"><circle cx="200" cy="170" r="50" fill="#243b36"/><circle cx="200" cy="170" r="20" fill="#c7cfd4"/></g>`;
const rain=`${L.rainCloud(true)}<g data-anim="bob" data-amp="0.3"><path d="M-100,260 Q-200,120 0,120 Q200,120 100,260Z" fill="#8fd3f0" opacity=".5"/></g>`;
const trumpet=`<g data-anim="sway" data-origin="-200 0" data-amp="0.5" transform="rotate(-15)"><rect x="-320" y="-30" width="420" height="60" rx="30" fill="#f5c542"/><path d="M100,-120 Q260,-160 320,-200 L320,200 Q260,160 100,120Z" fill="#f5c542"/><path d="M320,-200 Q360,0 320,200" fill="#d9a420"/>
<g fill="#d9a420"><rect x="-200" y="-100" width="30" height="70" rx="10"/><rect x="-140" y="-100" width="30" height="70" rx="10"/><rect x="-80" y="-100" width="30" height="70" rx="10"/></g><rect x="-240" y="-60" width="200" height="30" rx="15" fill="#d9a420"/><ellipse cx="-320" cy="0" rx="20" ry="36" fill="#d9a420"/></g>
<g data-anim="blink" data-speed="1"><text x="300" y="-230" font-size="80" font-weight="700" fill="#e2543c" font-family="KR">♪</text><text x="360" y="-120" font-size="60" font-weight="700" fill="#2b7ea1" font-family="KR">♫</text></g>`;
module.exports={
  outName:'영상_TR_자음군_숏폼', letters:['T','R'],
  A:{bg:['#dbeeff','#e4f6ff'], ground:C.grass, svg:train, hint:'두 글자가 만나면 /tr/', l1:'자음군(블렌드) <span class="kw">TR</span> <span class="ipa">/tr/</span>', word:'Train', hl:[0,2], ipa:'/treɪn/', ko:'트레인 (기차)'},
  B:{bg:['#e6edf2','#d9e3ea'], ground:C.grass, tag:'자음군 만들기', hint:'t + r = tr',
     stages:[{at:0,text:'<span class="w">r</span>ain',svg:rain},{at:4,text:'<span class="s">t</span><span class="w">r</span>ain',svg:train}],
     l1:'rain → <span class="kw">train</span> <span class="ipa">/treɪn/</span>', l2:'트레인 (기차) · <b>t</b>와 <b>r</b> 두 소리가 모두 들려요'},
  C:{tag:'TR 단어 더 알아보기', words:[
     {text:'Tree',hl:[0,2],ipa:'/triː/',ko:'트리 (나무)',bg:['#e3f6ee','#bfe8da'],ground:C.grass,svg:L.tree,particles:'leaves'},
     {text:'Trumpet',hl:[0,2],ipa:'/ˈtrʌmpɪt/',ko:'트럼펫',bg:['#fff8e1','#ffecb3'],ground:C.room,svg:trumpet,particles:'notes'}]},
  cues:[{at:0.8,text:"Today's sound is T, R.  Train.  Train."},{at:5.4,text:"Rain."},{at:9.4,text:"Train!"},{at:11.0,text:"Rain, train.  Can you hear both sounds?  Train."},{at:15.6,text:"Tree.  Tree."},{at:20.6,text:"Trumpet.  Trumpet."},{at:25.6,text:"Great job!  See you next time."}]
};
