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

## 초등영어 게임 매뉴얼·머트리얼 (별도 흐름)
- 데이터: `games/초등영어게임_데이터.js` (게임 95종, 챕터 A~G, 머트리얼 M01~M25). 게임을 고치거나 추가할 때는 이 파일만 편집한다.
- 빌드: `node tool/game_build.js` (`--only manual` / `--only materials` / `--no-png`). 게임 블록은 높이를 재서 자동으로 쪽에 배치한다.
- 결과: `output/초등영어게임_매뉴얼/` (교사용 매뉴얼 PDF+쪽별 PNG), `output/초등영어게임_머트리얼/` (인쇄용 교구 PDF+PNG).
- 원본: 「Let's play a game!」 게임 룰 모음 PDF 53쪽(100건). 중복 통합·제목 오류 수정 내역은 매뉴얼 2쪽 '원본 자료 정리 메모'에 있다.
