# ON글터 숏폼 영상 (Remotion)

이중자음 `sm` 교육용 30초 세로형 숏폼(1080x1920, 30fps, 900프레임).
모든 그래픽은 SVG + Remotion spring/interpolate 모션으로 그렸다.

## 실행

```bash
cd video
npm install
npm run render      # → video/output.mp4
npm run studio      # 브라우저 미리보기 (Remotion Studio)
```

렌더링 명령의 원형: `npx remotion render src/index.ts SmShorts output.mp4`

## 선택 파일 (public/)

| 파일 | 역할 | 없을 때 |
|---|---|---|
| `public/로고.jpg` | 아웃트로 로고 (`tool/logo.jpg` 복사본) | 'ON글터' 플레이스홀더 엠블럼 렌더링 |
| `public/bgm.mp3` | 배경음악 (루프, 28~30초 페이드아웃) | 무음 |

파일 유무는 `src/Root.tsx`의 `calculateMetadata`가 빌드 시 자동 감지한다.

## 구조

- `src/SmShorts.tsx` 씬 타임라인 + BGM
- `src/Subtitles.tsx` 자막 큐 (절대 프레임 기준) · `sm` 코랄 강조
- `src/scenes/` Intro(스마일) · FirstSound(공/미소) · MiddleSound(우주/재스민) · EndSound(프리즘) · Outro(로고)
- `src/constants.ts` 규격·씬 경계·색상
- `remotion.config.ts` 컨테이너에 설치된 Chromium 자동 사용
