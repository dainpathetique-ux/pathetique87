# 경화여고 2학년 2학기 중간고사 영어 대비 통합 정리본

- `경화여고_2-2_중간_영어_통합정리본.pdf` — A4 13쪽, 2단, Noto Sans KR 내장. 학원 내부 수업용(외부 배포 금지).
- `src/` — 조판 원본(HTML)과 서술형 문항 데이터·검증 스크립트.

## 다시 만들기

```
cd src
# 글꼴: fonts/NotoSansKR-Regular.otf, fonts/NotoSansKR-Bold.otf 를 넣는다
#   (https://github.com/notofonts/noto-cjk → Sans/SubsetOTF/KR/).
#   Windows에서는 head.html의 @font-face 두 줄을 지우고 font-family를 "Malgun Gothic"으로 바꿔도 된다.
node render.cjs          # 서술형 문항 검증(verify_report.txt) + main.html 조립
node build.cjs main.html out.pdf   # Playwright(Chromium)로 PDF 인쇄
```

- `items.cjs` — 서술형 문항 60개(어구 배열·어형 변화·찾아 쓰기). 어구 배열은 `render.cjs`가 "어구를 정답 순서로 이으면 정답과 단어가 일치하는지, 어구가 중복 없이 한 번씩 쓰였는지"를 검사한다.
- 영어 요약문·서술형 문장은 원문·분석지를 바탕으로 새로 쓴 재진술문이다. 원문 인용은 어법·빈칸 포인트에 필요한 짧은 구절만 실었다.
