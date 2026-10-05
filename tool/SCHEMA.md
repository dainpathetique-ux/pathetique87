# 워크시트 JSON 작성 규격

`worksheets/<이름>.json` 한 파일이 워크시트 한 벌입니다. 빌드: `node tool/build.js worksheets/<이름>.json`
결과: `output/<slug>/` 에 쪽별 PNG + PDF + HTML.

## 최상위
| 키 | 설명 |
|---|---|
| slug | 출력 폴더·파일 이름 (예: `4학년_급식잔반`) |
| academy | 머리글 학원명 (기본 `[학원명]`) |
| course | 머리글 과정명 (기본 `초등논술`) |
| grade | 머리글 학년·난이도 (예: `4학년 기본`) |
| title | 머리글 큰 제목 (예: `주장하는 글 읽기 — 급식 잔반을 줄여야 하는 까닭`) |
| pages | 쪽 배열. 3~4개 |

## 쪽 (pages[])
| 키 | 설명 |
|---|---|
| spacing | `loose` / `normal` / `tight`. 줄 높이·여백 프리셋. 1·2쪽은 보통 loose |
| passage | (1쪽) 지문 상자. 아래 참고 |
| sections | 영역 배열 |
| writing | 글쓰기 전용 쪽. 보통 마지막 쪽에 단독 |

### passage (둘 중 하나)
- 교재 참조형(기본): `{"ref": "교재 24~25쪽 '급식 잔반을 줄이자'를 읽고 푸세요.", "quote": "핵심 한 문장(선택)", "note": "작은 안내문(선택)"}`
- 창작 지문형(샘플·자체 제작 글): `{"title": "...", "text": "...", "note": "..."}`

### section
`{"title": "1. 어휘 다지기", "color": "teal", "tip": "도움말(선택)", "items": [...]}`
color: `teal`(어휘) `blue`(내용 확인) `violet`(생각 넓히기) `orange`(나의 생각) `green`(글쓰기) `rose`(예비)

### item type (문항 번호는 자동으로 이어짐)
| type | 필드 | 모양 |
|---|---|---|
| choice | q, choices[4] | 객관식 한 줄 |
| choice_lines | q, choices, lines | 객관식 + 까닭 쓰는 줄 |
| lines | q, lines(1~3) | 서술형 줄 |
| label_lines | q, label, lines | `반대말: _____` 같은 짧은 답 + 줄 |
| fill | q, box[단어들], items[문장들] | 보기 상자 + 빈칸 문장 (빈칸은 `___`) |
| table | q, rows[행 이름들] | 행 라벨 표 (첫째/둘째/셋째) |
| numbered_lines | q, labels(기본 ①②) | 번호마다 한 줄 |
| flow | q, boxes[3] | 글의 짜임 화살표 상자 |
| yesno | q, options(기본 찬성/반대), labels(기본 이유 ①②) | 찬반 체크 + 이유 줄 |

문장 안의 `___`(밑줄 3개 이상)은 답 빈칸으로 바뀝니다. 밑줄 개수 × 6mm 너비.

### writing
```json
{"title": "5. 글쓰기 — \"급식 잔반을 줄이자\"",
 "instruction": "먼저 개요표를 채운 뒤, 한 문단(150~200자)으로 주장하는 글을 쓰세요.",
 "outline": [["주장","급식 잔반을 줄이자. 왜냐하면 …"],["이유 ①",""],["이유 ②",""],["예시·경험",""],["마무리",""]],
 "cells": 300,
 "checklistTitle": "6. 스스로 점검",
 "checklist": ["주장이 첫 문장에 분명하게 드러난다.", "..."]}
```
- `cells`: 원고지 칸 수(20의 배수). 요구 분량의 1.5배. 1~2학년은 `cells` 대신 `"lines": 8` 로 넓은 줄.
- `teacherNote: false` 로 선생님 한마디 칸 제거.

## 쪽 넘침
빌드가 `⚠ 넘침` 을 표시하면 그 쪽의 spacing을 한 단계 낮추거나 줄 수를 줄인 뒤 다시 빌드합니다. 넘침이 없을 때까지 반복하고, 반대로 쪽 아래가 많이 비면 spacing을 올립니다.
