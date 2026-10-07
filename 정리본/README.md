# 경화여고 2학년 2학기 중간고사 영어 대비 통합 정리본

- `경화여고_2-2_중간_영어_통합정리본.pdf` — A4 14쪽, 2단, Noto Sans KR 내장. 학원 내부 수업용(외부 배포 금지).
- `src/` — 조판 원본(HTML)과 서술형 문항 데이터·검증 스크립트.

## 다시 만들기

```
cd src
# 글꼴: fonts/NotoSansKR-Regular.otf, -Medium.otf, -Bold.otf 를 넣는다
#   (https://github.com/notofonts/noto-cjk → Sans/SubsetOTF/KR/).
#   Windows에서는 head.html의 @font-face 두 줄을 지우고 font-family를 "Malgun Gothic"으로 바꿔도 된다.
node render.cjs          # 서술형 문항 검증(verify_report.txt) + main.html 조립
node build.cjs main.html out.pdf   # Playwright(Chromium)로 PDF 인쇄
```

- `items.cjs` — 서술형 문항 60개(어구 배열·어형 변화·찾아 쓰기). 어구 배열은 `render.cjs`가 "어구를 정답 순서로 이으면 정답과 단어가 일치하는지, 어구가 중복 없이 한 번씩 쓰였는지"를 검사한다.
- 영어 요약문·서술형 문장은 원문·분석지를 바탕으로 새로 쓴 재진술문이다. 원문 인용은 어법·빈칸 포인트에 필요한 짧은 구절만 실었다.

## 보충 자료

- `보충_Booster15강_2-4번_내용이해.pdf` — Booster 15강 2·3·4번(상어와 자연선택 / 아메리카 농경 지연 / 세포막)의 배경 지식·흐름·비유·오해·어법 연결·이해 점검. A4 2쪽.
  다시 만들기: `node build.cjs supp.html out.pdf "Booster 15강 2·3·4번 내용 이해 보충 · ON글터 내부용"` (세 번째 인자는 쪽 번호 옆 문구).
- `시험전날_동그라미_점검지.pdf` — 범위 전체 222문항(괄호 고르기·O/X·단어 뜻 고르기), 문제 4쪽 + 정답 1쪽.
  다시 만들기: `node quiz.cjs && node build.cjs quiz.html out.pdf "시험 전날 동그라미 점검지 · ON글터 내부용"`. 문항은 `quiz.cjs`에서 `[*정답 / 오답]` 표기로 고치면 보기 순서와 정답표가 자동으로 맞춰진다.
