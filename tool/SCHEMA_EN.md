# 영어 단원 워크시트 JSON 작성 규격

`worksheets/영어<학년학기>_<단원>_<제목>.json` 한 파일이 워크시트 한 벌입니다.
빌드: `node tool/build_en.js worksheets/<이름>.json` → `output/<slug>/` 에 쪽별 PNG + PDF + HTML.
(국어 논술용은 `tool/build.js` + `tool/SCHEMA.md`)

## 최상위
| 키 | 설명 |
|---|---|
| slug | 출력 폴더·파일 이름 |
| logo | 머리글 로고. 생략하면 `tool/logo.jpg`(ON글터), `false`면 로고 없이 academy 글자 표시 |
| academy | 로고가 없을 때 머리글 학원명 (예: `윤선생 IGSE 성당어학원`) |
| course | 머리글 과정명 (기본 `초등영어`) |
| grade | 머리글 교재·단원 (예: `천재교육 3-2 · 7단원`) |
| title / subtitle | 큰 제목(영어 단원명) / 작은 제목(우리말 뜻 등) |
| plan | 1쪽 머리글 아래 수업 순서 띠. 예: `["단어 익히기 10분", "문장 익히기 15분", ...]` |
| pages | 쪽 배열. 2~3개 |

## 쪽 (pages[])
| 키 | 설명 |
|---|---|
| spacing | `loose` / `normal` / `tight` |
| intro | (1쪽) 단원 단어·문장 상자: `{"note": "...", "words": [["dog","개"], ...], "sentences": [["Is it a zebra?","그것은 얼룩말이니?"], ...]}` |
| sections | 영역 배열 |

### section
`{"title": "1. 단어 익히기", "color": "teal", "tip": "도움말(선택)", "items": [...], "checklist": [...], "stamp": "선생님 한마디"}`
- color: `teal`(단어) `blue`(문장) `violet`(문법) `orange`(쓰기) `green`(받아쓰기·점검)
- `checklist` 가 있으면 ☐ 목록, `stamp` 가 있으면 선생님 한마디 + 도장 칸이 영역 끝에 붙습니다.

### item type (문항 번호는 자동으로 이어짐)
| type | 필드 | 모양 |
|---|---|---|
| table | q, columns[], rows[[셀...]] | 표. 셀이 `""` 이면 답 쓰는 빈칸 |
| spell | q, items[] | 2열 격자. 홑 `_` 는 글자 한 칸 상자 (예: `d _ g (개)`) |
| sort | q, box[], columns[2], rows | 보기 상자 + 분류 표 (rows × 9mm 높이) |
| match | q, left[], right[] | 선 잇기 (⑴⑵… ↔ ⓐⓑ…) |
| list | q, box[](선택), items[], lines(선택) | 문장 목록. `___` 는 긴 빈칸 |
| select | q, items[] | ○표 고르기, 2열 |
| fourlines | q, box[](선택), items[] | 영어 4선. 항목은 `"zebra"`(회색 따라쓰기 글자) 또는 `{"label","model","pre","text"}` — `pre` 는 4선 안 앞머리 글자(Q:), `text` 는 4선 위 문제 글 |
| lines | q, lines | 일반 답 줄 |

`___`(밑줄 3개 이상) → 밑줄 개수 × 6mm 빈칸. 홑 `_` → 6.5mm 글자 상자.

## 쪽 넘침
빌드가 `⚠ 넘침` 을 표시하면 그 쪽 spacing을 낮추거나 항목을 줄인 뒤 다시 빌드합니다.
`(여백 0px)` 은 넘치지 않았다는 뜻이며 실제 남은 공간은 PNG로 확인합니다.
