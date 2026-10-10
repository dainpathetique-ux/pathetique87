# 워크시트 JSON 작성 규격

`worksheets/<이름>.json` 한 파일이 워크시트 한 벌입니다. 빌드: `node tool/build.js worksheets/<이름>.json`
결과: `output/<slug>/` 에 쪽별 PNG + PDF + HTML.

## 최상위
| 키 | 설명 |
|---|---|
| slug | 출력 폴더·파일 이름 (예: `4학년_급식잔반`) |
| logo | 머리글 로고. 생략하면 `tool/logo.jpg`(ON글터) 사용, `false`면 로고 없이 academy 글자 표시 |
| academy | 로고가 없을 때 머리글 학원명 |
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

## 답지 (정답지) — `--answers`
원장이 정답지를 요청하면 각 문항에 답을 적고 `node tool/build.js <파일>.json --answers` 로 빌드합니다.
학생용과 같은 서식에 답이 빨간 글씨로 들어간 `<slug>_답지.pdf` (+ 쪽별 PNG)가 같은 폴더에 생깁니다.
학생용 빌드에서는 아래 필드가 무시됩니다.

| type | answer 형식 | 비고 |
|---|---|---|
| choice | 정답 번호 (1~4) | 해당 보기에 빨간 동그라미 |
| choice_lines | 정답 번호 + `why`(까닭 예시 문장) | why 앞에 '예시' 표시 (`whyExample:false`로 끔) |
| lines | 문자열 | |
| label_lines | `[라벨 빈칸 답, 줄에 쓸 답]` | |
| fill | `[빈칸1 답, 빈칸2 답, …]` | items 순서 |
| table | `[행1 답, 행2 답, …]` | rows 순서 |
| numbered_lines | `[① 답, ② 답, …]` | labels 순서 |
| flow | `[상자1 답, 상자2 답, 상자3 답]` | |
| yesno | `{"pick":"찬성","reasons":["…","…"]}` | 항상 '예시' 표시 |

- 열린 문항(정답이 하나가 아닌 문항)은 `"example": true` 를 붙여 '예시' 표시를 단다.
- 답은 학생 답 칸 안에 들어갈 만큼만 쓴다. 칸을 넘으면 빌드가 `⚠ 답이 칸을 넘침` 을 표시한다.
- writing: `"example": {"outline": [개요표 각 행의 예시 (행 수와 같게)], "text": "예시 글 (원고지에 한 칸 한 글자, 줄바꿈 \n 은 새 문단)"}`.
  답지의 선생님 한마디 칸은 채점 기준(내용·조직·표현·맞춤법)으로 바뀐다. `rubric: [["내용","…"],…]` 로 바꿀 수 있다.
- 최상위 `group` 을 쓰면 출력이 `output/<group>/<slug>/` 로 간다 (예: 교재 권 단위 묶음).
