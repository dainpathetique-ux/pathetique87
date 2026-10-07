// 시험 전날 동그라미 점검지 — 데이터 + HTML 생성
// 표기: [*정답 / 오답] (괄호 안 둘 중 고르기, 렌더링 때 순서를 섞음) · ox:'O'|'X' · 어휘: {w, m:[*정답뜻, 오답뜻]}
const fs = require('fs');

const S = []; // sections
S.push({ title:'1. 교과서 어법 고르기', sub:'L1 Two Heroes · L2 Science Is for Everyone — 밑줄 어법 3문항 연속 대비', type:'pick', items:[
 'Pertussis is a bacterial disease [*characterized / characterizing] by serious coughing.',
 '[*Because of / Because] this distinct sound, people started to call the disease "whooping cough."',
 'The cause of the disease [*had been / was] identified in 1906, but the vaccines that [*had been developed / have developed] were ineffective.',
 'It was there [*that / where] Kendrick met fellow bacteriologist Grace Eldering.',
 'They had each survived whooping cough as children [*themselves / them].',
 'It was like a second job [*for which / which] they never received any payment.',
 'The difficulties did not stop them from [*persisting / persist] toward their goal.',
 'The sight of the young victims coughing and struggling to breathe [*was / were] a powerful reminder.',
 'They even injected the vaccine into [*themselves / them] to confirm that it was safe.',
 '[*Despite / Although] the apparent success of the vaccine, they wanted further confirmation.',
 'With thousands of children [*continuing / continued] to suffer, they found themselves in a desperate situation.',
 'Eleanor Roosevelt, [*whose / who] husband suffered from polio, [*was / were] interested in fighting infectious diseases.',
 'In 1940, the vaccine started [*being distributed / distributing] all across the United States.',
 'The number of annual deaths caused by whooping cough [*dropped / dropping] to under 10.',
 'They could have become wealthy if they [*had patented / patented] their vaccine.',
 'They replied that it [*had not been created / was not creating] by them alone.',
 'The excessive praise they received made them [*uncomfortable / uncomfortably].',
 'Knowing that so many lives were being saved [*was / were] enough of a reward.',
 'Science [*belongs / is belonged] to everyone.',
 'There have been many projects [*in which / which] ordinary people have made contributions.',
 'This might sound [*exciting / excited], but his job was dull and time-consuming.',
 'It took Schawinski a whole week [*to classify / classifying] just 50,000 galaxies.',
 'Lintott suggested that he [*turn / turned] to the Internet to ask for help.',
 'The website was kept as [*simple / simply] as possible.',
 'It was online media [*that / what] helped spread the word about Galaxy Zoo.',
 'If it had not been for those participants, Schawinski [*couldn’t have classified / couldn’t classify] that many images.',
 'The group members noticed something strange [*appearing / appeared] in the night sky.',
 'There were ribbons of light, some of [*which / them] seemed to stretch for thousands of kilometers.',
 'It is the dedicated members of the group that [*deserve / deserves] the credit for discovering STEVE.',
 'If it had not been for them, it might have remained [*unnoticed / unnoticing] forever.',
 'Most of the individuals involved in these projects [*are / is] not professional scientists.',
]});

S.push({ title:'2. 교과서 내용 O / X', sub:'본문·After You Read 세부 내용', type:'ox', items:[
 ['Kendrick과 Eldering은 대공황이 한창이던 1932년에 백신 연구를 시작했다.','O'],
 ['1930년대 미국 백일해 사망자의 95%는 5세 미만 어린이였다.','O'],
 ['두 사람은 백신 개발을 부업으로 하면서 추가 보수를 받았다.','X'],
 ['두 사람은 임상 시험 전에 백신을 자신들에게 직접 주사해 안전성을 확인했다.','O'],
 ['첫 현장 실험(1934~35)에서 접종한 712명 중 4명만 백일해에 걸렸고 중증은 없었다.','O'],
 ['두 사람이 연구를 확대하지 못한 이유는 시간 부족이었다.','X'],
 ['Eleanor Roosevelt는 1936년에 연구실을 직접 방문했다.','O'],
 ['백신은 1940년에 미국의사협회 권장 목록에 올랐고, 그 4년 뒤 전국 배포가 시작됐다.','X'],
 ['1970년대 중반 연간 백일해 사망자는 10명 미만이었다.','O'],
 ['두 사람은 백신 특허로 큰 부자가 되었다.','X'],
 ['Schawinski는 1주일 동안 은하 이미지 5만 개를 분류했다.','O'],
 ['Galaxy Zoo는 복잡한 전문가용 인터페이스로 설계되었다.','X'],
 ['Galaxy Zoo는 1년 반 동안 8만 명 이상이 참여해 7,500만 건 이상을 분류했다.','O'],
 ['Zooniverse에는 천문학 외 분야의 프로젝트도 있다.','O'],
 ['‘Steve’라는 이름은 NASA 과학자가 붙였다.','X'],
 ['STEVE에 관한 이론 중 하나는 NASA가 확실히 입증했다.','X'],
 ['시민 과학자가 되려면 과학 학위가 필요하다.','X'],
 ['STEVE는 Strong Thermal Emission Velocity Enhancement의 약자다.','O'],
]});

S.push({ title:'3. Booster 어법·어휘 고르기', sub:'11·12·14·15강 — 분석지 어법 포인트와 반의어 함정', type:'pick', items:[
 '11-1 [*What / That] researchers are trying to understand is how IQ and EQ complement each other.',
 '11-1 EQ is not the opposite of IQ; the two [*complement / contradict] each other.',
 '11-2 Self-disclosure is a process [*by which / which] one person reveals information to another.',
 '11-2 If the speaker does not feel [*accepted / accepting], they may not disclose anything again.',
 '11-3 Cones open and release their seeds only when they are [*exposed / exposing] to intense heat.',
 '11-3 Hotter summers make it [*harder / hardly] for new spruce to sprout.',
 '11-4 A stock of dynamite accidentally [*exploded / was exploded].',
 '11-4 Doctors have found no [*plausible / implausible] explanation for his recovery.',
 '12-1 Almost 70 miles west of Key West [*lies / lays] a cluster of seven islands.',
 '12-1 The park is [*accessible / inaccessible] only by boat or seaplane.',
 '12-2 Cane toads were used [*to control / to controlling] insect infestations.',
 '12-2 It directs the glands behind its eyes, [*which / that] hold the venom, toward the threat.',
 '12-3 She painted huge compositions [*in which / which] horses played a major role.',
 '12-3 At ten she [*refused / agreed] to become an apprentice to a dressmaker.',
 '12-4 If they feel threatened, they will [*lie / lay] low in the grass.',
 '12-4 They chase away any other steenboks that [*enter / enters] their territory.',
 '14-1 [*Although / Despite] I have been in technology for 20 years, my software is outdated.',
 '14-1 Then content went [*digital / digitally], and it seemed promising.',
 '14-2 The humor comes from a character who is easily perceived as [*angry / angrily] at the core.',
 '14-2 Those using sarcasm can express displeasure and avoid [*being criticized / criticizing].',
 '14-3 [*Rarely / Often] a week passes when some new phenomenon about China is not mentioned.',
 '14-3 Rising dairy consumption in China could cause prices elsewhere to [*rise / raise].',
 '14-4 Marketers may discourage consumers [*from making / to make] purchases.',
 '14-4 A demarketing strategy would be to [*restrict / expand] availability.',
 '15-1 They seemed quite upset and [*certainly / certain] not appreciative.',
 '15-1 She bought a present for her host family [*with whom / with that] she would be living.',
 '15-2 [*That’s why / That’s because] sharks are regarded as one of the most successful animals.',
 '15-2 Their brains are perfectly designed for [*how / what] they hunt, find mates, and reproduce.',
 '15-3 Their domestication of plants and animals [*was / were] completely independent.',
 '15-3 It was not until 1500 BCE that most of their food came from farming. = [*Not until / Until] 1500 BCE did most of their food come from farming.',
 '15-4 … a lipid bilayer where membrane proteins [*are firmly fixed / firmly fixed].',
 '15-4 The cell membrane keeps its components [*separate / separately] from outside cells.',
]});

S.push({ title:'4. Booster 내용 O / X', sub:'12강 내용 일치 수치 포함', type:'ox', items:[
 ['연구자들은 성공에서 IQ가 차지하는 비중을 약 20%로 본다.','O'],
 ['‘그저 잘 듣는 사람’으로 여겨지는 사람은 진짜 친구가 많은 편이다.','X'],
 ['검은가문비는 산불에 적응한 덕분에 북방림에서 널리 퍼졌다.','O'],
 ['Phineas Gage는 사고 후 몇 달 동안 의식을 잃은 상태였다.','X'],
 ['Dry Tortugas 국립공원은 자동차로도 갈 수 있다.','X'],
 ['Fort Jefferson은 벽돌 1,600만 개 이상으로 지어졌으나 완공되지 못했다.','O'],
 ['수수두꺼비는 앞다리에 물갈퀴가 있다.','X'],
 ['수수두꺼비는 사육 상태에서 20년까지 살 수 있다.','O'],
 ['Rosa Bonheur는 7살에 파리로 이사했고 10살에 재봉사 견습을 거부했다.','O'],
 ['스틴복은 물을 자주 마신다.','X'],
 ['스틴복의 영역은 4~5헥타르이며 배설물로 표시한다.','O'],
 ['Olivia는 캐나다 토론토 출신이다.','O'],
 ['아메리카에서 길들인 동물은 개·오리·기니피그뿐이었다.','O'],
 ['상어는 약 4억 년, 호모 사피엔스는 약 20만 년 동안 지구에 있어 왔다.','O'],
 ['세포막은 대부분의 분자를 자유롭게 통과시킨다.','X'],
]});

S.push({ title:'5. 모의고사 어법·어휘 고르기', sub:'9월 고2 학평 20~24·29~42번 — 분석본 TEST 포인트', type:'pick', items:[
 '20 Only when you are happy with your story [*should you / you should] show it to someone else.',
 '20 Don’t imagine that any writer will do. = not every writer will be [*sufficient / inadequate].',
 '21 Interruptions and agenda changes [*are / is] seen as [*natural and necessary / naturally and necessarily].',
 '21 The effective manager is [*flexible and professional enough / enough flexible and professional] to capitalize on changing needs.',
 '21 The most productive meetings grow in [*unpredictable / predictable] ways.',
 '22 It’s easy to eat a sandwich in a minute while [*talking / talked] on the phone.',
 '22 Our mental forces are diverted from the [*physical / virtual] content, our food.',
 '23 There needs to be a process [*that / what] creates tension and [*drives / drive] the movement.',
 '23 The fluid movement in the prelude creates a tension that can be [*released / accumulated] later.',
 '24 This means [*helping / to help] students recognize how a feed is deliberately [*designed / designing].',
 '24 Media literacy classes cover how to evaluate the [*credibility / fallacy] of sources.',
 '29 Frontiers offer places [*where / which] the new cheap things can be [*seized / seize].',
 '29 Production processes [*burn through / conserve] an island, and energy is no longer [*cheap / pricey].',
 '30 When people [*are reminded / reminded] of harmful deeds, they may feel eco-guilt.',
 '30 People change attitudes to reduce [*inconsistencies / consistencies] between attitudes and behavior.',
 '30 People are [*inclined / reluctant] to believe in quick-fixes.',
 '31 As people find [*themselves / them] regularly on the move, we are experiencing a phase shift.',
 '31 Human geography is becoming [*blurred / clear].',
 '32 People prefer to develop meanings that [*are shared / shared] with other people.',
 '32 Living in campus hotels is [*problematic / beneficial] because residents are not part of a [*stable / unstable] group.',
 '33 When we grieve for [*what / that] is lost, it clears the way towards a [*strengthening / strengthen] of love.',
 '33 Grief can make us both very [*sad / sadly] and very [*motivated / motivating] to act.',
 '34 The effects of the microwave oven [*were / was] not anticipated and would [*have been / be] difficult to foresee.',
 '34 We notice the [*obvious / subtle] aspects of a new technology while missing the more [*subtle / obvious] ones.',
 '35 The sensor data can be used to continuously [*update / updating] the digital twin.',
 '35 Digital twins are common when assets are very [*valuable / valueless] and downtime would be [*costly / economical].',
 '36 The warbler [*establishes / establishing] territories [*preferentially / preferential] among red spruce trees.',
 '36 It settles where its [*future / present] parenting needs are served better than its [*present / future] ones.',
 '37 Children learn patterns that [*enable / enables] them [*to function / functioning] as competent communicators.',
 '37 Collectivists use [*implicit / explicit] and even [*ambiguous / clear] words like maybe or perhaps.',
 '38 High density is [*needed / needing] for crowding, [*which / that] makes people [*experience / to experience] overload.',
 '38 Some psychologists see crowding as [*neutral / natural] rather than [*invariably / variably] negative.',
 '39 Precautions need [*to be taken / to take] regarding exclusion, [*which / that] is very important for business.',
 '39 Excluded individuals [*grow away from / integrate into] communication, so their contribution may [*decline / increase].',
 '40 Subjects gave almost twice as [*much / many] as those who had [*been instructed / instructed] to recall bad deeds.',
 '40 People concerned about appearances were [*less / more] generous than those who did good for its [*own / foreign] sake.',
 '41 It involves remembering [*that / what] these systems are designed by humans.',
 '41 Nudges can be beneficial, but they also carry the potential for [*manipulation / liberation].',
]});

S.push({ title:'6. 모의고사 내용 O / X', sub:'분석본 O/X를 한국어로', type:'ox', items:[
 ['(20) 가까운 사람에게 초고를 보여 주는 것 자체는 괜찮다.','O'],
 ['(21) 유연한 시간 문화에서는 의제를 미리 돌리지 않는다.','X'],
 ['(22) 글쓴이는 식사를 마친 뒤에 문자를 보내라고 조언한다.','O'],
 ['(23) 리듬이 분명하고 예측 가능한 부분에서는 긴장이 전혀 생기지 않는다.','X'],
 ['(24) 과제 중 폰 확인 횟수를 기록하는 활동은 자기 인식을 높이기 위한 것이다.','O'],
 ['(29) 현금 체계 안에서 삶을 재생산하는 비용은 시간이 지날수록 줄어든다.','X'],
 ['(30) 친환경 제품을 산 뒤 오히려 부정행위를 더 하는 경향이 관찰되었다.','O'],
 ['(31) 이주 노동자는 ‘양자 인간’에 포함되지 않는다.','X'],
 ['(32) 캠퍼스 호텔에 사는 학생들의 문제는 시설이 나쁘다는 것이다.','X'],
 ['(33) 애도는 슬픔을 주는 동시에 행동할 동기도 준다.','O'],
 ['(34) 전자레인지는 1980년대 초에 도입되어 음식 준비에 혁명을 일으켰다.','O'],
 ['(35) 디지털 트윈은 최근에 처음 등장한 완전히 새로운 개념이다.','X'],
 ['(36) 초여름에는 흰가문비가 붉은가문비보다 먹이를 더 많이 제공한다.','O'],
 ['(37) 영어는 I를 대문자로 쓰는 유일한 언어다.','O'],
 ['(38) 콘서트를 기대하는 사람에게 혼잡함은 즐거움을 떨어뜨린다.','X'],
 ['(39) 조직심리학자들은 배제 문제를 오래전부터 중요하게 다뤄 왔다.','X'],
 ['(40) 타인의 반응까지 애써 묘사한 참가자가 더 많이 기부했다.','X'],
 ['(41) 글쓴이는 알고리즘의 데이터가 미래를 위한 처방이라고 본다.','X'],
]});

S.push({ title:'7. 워드마스터 뜻 고르기', sub:'Day 18~22 — 오답은 반의어 또는 철자 혼동어의 뜻', type:'voc', items:[
 ['intrinsic','내재적인','외재적인'],['dissent','반대','찬성'],['lodge','머무르다; 제기하다','비우다; 철회하다'],['reconcile','화해시키다','갈라놓다'],['eligible','자격이 있는','읽기 쉬운'],['exaggerate','과장하다','축소하다'],['conform','순응하다','벗어나다'],['deliberate','의도적인','우연한'],['ambiguous','모호한','분명한'],['elated','아주 기뻐하는','낙담한'],['secular','세속적인','종교적인'],['at stake','위태로운','안전한'],
 ['autonomy','자율성','의존'],['disclose','드러내다','감추다'],['dismal','음울한','쾌활한'],['uphold','옹호하다','뒤집다'],['procrastinate','미루다','서두르다'],['persecute','박해하다','기소하다'],['contagious','전염성의','면역의'],['empower','권한을 주다','박탈하다'],['prompt','즉각적인','지연된'],['catastrophic','파멸적인','유익한'],['illiterate','문맹의','박식한'],['render','(~하게) 만들다','거절하다'],
 ['impending','임박한','지나간'],['substitute','대체하다','유지하다'],['delicate','섬세한','튼튼한'],['exotic','이국적인','토착의'],['evoke','떠올리게 하다','억누르다'],['vain','헛된','효과적인'],['contrive','고안하다','포기하다'],['discrepancy','불일치','일치'],['formidable','만만찮은','하찮은'],['degrade','저하시키다','향상시키다'],['retrospect','회상','전망'],['provision','공급; 조항','결핍'],
 ['discern','알아차리다','무시하다'],['outweigh','~보다 더 크다','~에 못 미치다'],['amend','수정하다','폐지하다'],['exemplary','모범적인','형편없는'],['recurrent','되풀이되는','일회성의'],['comprise','구성되다','배제하다'],['versatile','다재다능한','한정된'],['subsidy','보조금','벌금'],['prescribe','처방하다','금지하다'],['furious','몹시 화가 난','차분한'],['legislation','법률 제정','법률 폐지'],['displace','대신하다; 쫓아내다','고정하다'],
 ['predominant','지배적인','열세의'],['reluctant','꺼리는','기꺼이 하는'],['profound','심오한','얕은'],['reciprocal','상호 간의','일방적인'],['allege','(증거 없이) 주장하다','입증하다'],['refrain','삼가다','탐닉하다'],['inhibit','억제하다','촉진하다'],['empirical','경험적인','이론적인'],['consistent','일관된','모순된'],['compel','강요하다','허락하다'],['at the outset','처음에','마지막에'],['linger','오래 머물다','급히 떠나다'],
]});

S.push({ title:'8. 언어 형식 4개 — 전환·구별', sub:'had been p.p. · 재귀대명사 · It is ~ that · If it had not been for', type:'pick', items:[
 'If it had not been for your help, I would have failed. = [*Without / With] your help, I would have failed.',
 'Had it not been for the volunteers = If it [*had not been / were not] for the volunteers',
 'It was not until 1500 BCE that most food came from farming. = Not until 1500 BCE [*did most food come / most food came] from farming.',
 'Marie Curie herself drove one. → 이 herself는 [*생략 가능(강조용법) / 생략 불가(재귀용법)]',
 'They injected it into themselves. → 이 themselves는 [*재귀용법 / 강조용법]',
 'It was on Fifth Street [*that / which] the man crashed into a taxi.',
 'Dinner [*had been prepared / was preparing] by the time the guests arrived.',
 'Pets that [*had been abandoned / have abandoned] were living at the shelter.',
 'Experts acknowledged that it [*is / are] the aurora chasers that deserve the credit.',
 'Without careful observation, many discoveries would never [*have been made / be made].',
]});

// ───────── 렌더링 ─────────
function hash(s){ let h=2166136261; for(const c of s){ h^=c.charCodeAt(0); h=Math.imul(h,16777619)>>>0; } return h; }
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
let n = 0; const key = []; let body = '';
for (const sec of S) {
  const start = n + 1;
  let html = `<h2>${esc(sec.title)} <span class="sub">${esc(sec.sub)}</span></h2>`;
  if (sec.type === 'pick') {
    html += '<ol start="'+start+'">';
    for (const it of sec.items) {
      n++; const answers = [];
      const text = esc(it).replace(/\[\*([^\/\]]+?)\s*\/\s*([^\]]+?)\]/g, (m,a,b) => {
        a=a.trim(); b=b.trim(); answers.push(a);
        const swap = hash(n + a + b) % 2 === 1;
        const [x,y] = swap ? [b,a] : [a,b];
        return `<span class="br">[ ${x} / ${y} ]</span>`;
      });
      if (!answers.length) throw new Error('no bracket: ' + it);
      key.push([n, answers.join(', ')]);
      html += `<li>${text}</li>`;
    }
    html += '</ol>';
  } else if (sec.type === 'ox') {
    html += '<ol start="'+start+'" class="ox">';
    for (const [t,a] of sec.items) { n++; key.push([n, a]); html += `<li><span class="oxb">( O / X )</span>${esc(t)}</li>`; }
    html += '</ol>';
  } else {
    html += '<div class="vg">';
    for (const [w,a,b] of sec.items) {
      n++; const swap = hash(n + w) % 2 === 1; const [x,y] = swap ? [b,a] : [a,b];
      key.push([n, a]);
      html += `<div class="vi"><span class="vn">${n}.</span><span class="vt"><b>${esc(w)}</b> <span class="vb">( ${esc(x)} / ${esc(y)} )</span></span></div>`;
    }
    html += '</div>';
  }
  body += html;
}
// 정답표
let keyHtml = '</div><div class="cols pg"><h2>정답 <span class="sub">가리고 푼 뒤 확인 · 틀린 번호는 정리본의 해당 지문으로</span></h2><div class="key">';
let cur = 0;
for (const sec of S) {
  const cnt = sec.items.length;
  keyHtml += `<div class="kt">${esc(sec.title)}</div><div class="kr">`;
  for (let i = 0; i < cnt; i++) { const [num, a] = key[cur++]; keyHtml += `<span><b>${num}</b> ${esc(a)}</span>`; }
  keyHtml += '</div>';
}
keyHtml += '</div>';

const css = fs.readFileSync('head.html','utf8').match(/<style>[\s\S]*<\/style>/)[0];
const doc = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>시험 전날 동그라미 점검지</title>${css}
<style>
@page{margin:9mm 9mm 11mm 9mm;}
body{font-size:8.9pt;line-height:1.38;}
.cols{column-gap:6mm;}
ol{margin:0 0 4pt 0;padding-left:17pt;}
ol li{margin:0 0 2.2pt;padding-left:1pt;}
ol li::marker{color:var(--ac);font-weight:700;}
.br{color:#000;font-weight:700;background:var(--tint);padding:0 2pt;border-radius:2pt;}
ol.ox li{padding-left:0;}
.oxb{display:inline-block;width:40pt;font-weight:700;color:var(--ac);}
.vg{display:grid;grid-template-columns:1fr 1fr;column-gap:3mm;row-gap:1.5pt;margin:0 0 4pt;}
.vi{break-inside:avoid;display:flex;align-items:flex-start;gap:3pt;line-height:1.32;}
.vn{color:var(--ac);font-weight:700;flex:0 0 19pt;text-align:right;white-space:nowrap;}
.vt{flex:1 1 auto;min-width:0;}
.vb{color:#222;}
.key{font-size:8pt;line-height:1.4;}
.kt{font-weight:700;color:var(--ac);margin:4pt 0 1pt;border-bottom:0.5pt solid var(--ac2);}
.kr span{display:inline-block;margin:0 7pt 1pt 0;}
.kr b{color:var(--ac);}
.intro{font-size:8.2pt;color:#333;margin:0 0 4pt;}
</style></head><body>
<h1>시험 전날 동그라미 점검지</h1>
<div class="scope"><b>범위 전체</b> 교과서 L1·L2 ｜ Booster 11·12·14·15강 ｜ 9월 고2 학평 18지문 ｜ 워드마스터 Day 18~22 · 총 ${n}문항 · 괄호 안 둘 중 하나에 동그라미, O/X는 하나에 동그라미 · 정답은 마지막 쪽 · ON글터 내부용</div>
<div class="cols">
<p class="intro">30~40분. 막히는 문항에 표시만 하고 넘어간 뒤, 정답표에서 틀린 번호의 지문을 통합 정리본에서 다시 본다. 어법 문장은 지문 내용을 바탕으로 짧게 고쳐 쓴 것이다.</p>
${body}
${keyHtml}
</div></body></html>`;
fs.writeFileSync('quiz.html', doc);
console.log('items:', n);
