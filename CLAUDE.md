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

## 파닉스 블로그 + 15초 영상 (원장이 "오늘은 A 소리"처럼 알파벳만 말하면 이 순서대로)
1. `prompts/파닉스_블로그_루틴_프롬프트.md` 의 규칙을 따른다. 글이 먼저, 영상은 그 다음이다.
2. 블로그 글을 `blog/<알파벳>_파닉스.md` 로 쓰고 바로 사용자에게 보낸다 (SendUserFile). 이 단계 전에 영상 작업을 시작하지 않는다.
3. `video/<알파벳>_phonics.json` 을 쓰고 `node tool/video.js video/<알파벳>_phonics.json` 으로 빌드한다. 형식은 프롬프트 7-1 참고.
4. `output/video/<slug>/` 의 미리보기 PNG 3장을 눈으로 확인한 뒤, MP4와 PNG를 사용자에게 보낸다.
5. 영상 단계가 실패해도 글은 그대로 둔다. 오류를 한 줄로 보고하고 blog·video·output 을 커밋·푸시한다.
- 영상은 영어 전용·무음이다. 한글 자막이나 한국어 음성을 넣지 않는다. 영어 내레이션 대본과 BGM 제안은 글 파일 끝에 텍스트로만 적는다.
- 실제 제작 예: `blog/A_파닉스.md`, `video/A_phonics.json` → `output/video/A_phonics/`
