# 초등논술 워크시트 제작 저장소

영어·국어학원 원장이 교재 사진을 올리면 학생용 워크시트(A4 3~4장, 컬러)를 만드는 저장소입니다.

## 작업 흐름 (사진이 올라오면 이 순서대로)
1. `prompts/초등논술_워크시트_루틴_프롬프트.md` 의 절차와 작성 규칙을 따른다. (판독 → 분석 → 문항 설계)
2. 내용을 `worksheets/<학년>_<주제>.json` 으로 쓴다. 규격은 `tool/SCHEMA.md`. 서식은 바꾸지 않는다.
3. `node tool/build.js worksheets/<파일>.json` 으로 빌드한다. `⚠ 넘침` 이 나오면 JSON을 고쳐 다시 빌드한다.
4. `output/<slug>/` 의 PNG 쪽별 이미지를 눈으로 확인한 뒤, PNG와 PDF를 사용자에게 보낸다 (SendUserFile).
5. JSON과 output을 커밋·푸시한다.

## 고정 사항
- 교사용·정답지는 요청받을 때만 만든다.
- 지문 원문은 통째로 싣지 않는다. 교재 쪽수를 가리키고 1~2문장만 인용한다 (`passage.ref` 형식).
- 글쓰기는 마지막 한 쪽 전체를 쓴다 (개요표 + 원고지).
- 디자인(색, 글꼴, 여백)은 `tool/build.js` 의 CSS가 기준이다. 원장이 서식 변경을 요청할 때만 수정한다.

## 환경
- 렌더링: Playwright + Chromium (`/opt/pw-browsers/chromium`). 전역 playwright 패키지를 자동으로 찾는다.
- 로고: `tool/logo.jpg` (ON글터 영어 국어 전문학원). 머리글에 자동으로 들어간다.
- 한글 글꼴: `tool/kr400.woff2`, `tool/kr700.woff2` (Noto Sans KR). 빌드 시 output 폴더로 복사된다.
- 실제 제작 예: `worksheets/4학년_1일차_색의무게감.json` (교재 10쪽, 설명문)
- 참고 샘플: `worksheets/샘플_4학년_급식잔반.json` → `output/샘플_4학년_급식잔반/`

## 영어 단어 '소리로 외우기' 워크북 (철자 암기 없음)
- 원본 데이터: `vocab/VOCA_Starter2_소리표.txt`. 한 줄에 `단어 | 글자:소리 글자:소리 … | 합친 소리 | 뜻`. 소리 없는 글자는 `-`. `[DAY nn]` 으로 날짜를 나눈다.
- 생성: `node tool/gen_voca.js vocab/VOCA_Starter2_소리표.txt` → `vocab/VOCA_Starter2_DayNN.json` 40개 (조각을 이어 붙인 철자가 단어와 다르면 오류를 낸다).
- 빌드: `node tool/build_voca.js vocab/<파일>.json` → `output/<slug>/` 에 PNG 4쪽 + PDF. 전체는 `for f in vocab/VOCA_Starter2_Day*.json; do node tool/build_voca.js "$f"; done`.
- 합본: `pdfunite output/VOCA_Starter2_Day*/VOCA_Starter2_Day*.pdf output/VOCA_Starter2_전체/VOCA_Starter2_Day01-40_전체.pdf`.
- 구성(고정 4쪽): ①학습 카드(단어·소리 조각·합친 소리·뜻·읽기 체크 ○○○) ②소리 합치기 연습 ③짝 맞추기 + 뜻 보고 소리 쓰기 ④미니 테스트 + 말하기 확인.
- 소리 조각 원칙: 한 글자(또는 ea·ch·aigh·or 같은 한 덩어리)에 한글 소리 하나. 조각 8개 이상이면 자동으로 작게, 10개 이상이면 더 작게 찍힌다. 학생은 영어 발음(한글)과 뜻만 외운다.
- 소리 표기를 바꾸고 싶으면 소리표 txt 한 줄만 고치고 생성·빌드를 다시 한다.
