# ON글터 숏폼 영상 (Remotion)

한 프로젝트에 두 개의 컴포지션이 있다. 모두 1080x1920 세로형, 30fps.

| 컴포지션 | 내용 | 렌더 명령 | 결과 |
|---|---|---|---|
| `SmShorts` | 이중자음 `sm` 교육 숏폼 30초 (내레이션 + BGM) | `npm run render` | `output.mp4` |
| `GiftTeaser` | '빙그레의 영역 / 김소연' 북 티저 23초 (수채화 창가 책상 일러스트, 돌리인·팬 카메라, 피아노·첼로 왈츠 BGM, 로고 아웃트로) | `npm run render:gift` | `output-gift.mp4` |

모든 그래픽은 SVG + Remotion spring/interpolate 모션으로 그렸다.
`GiftTeaser` 의 장면은 `src/gift/DeskScene.tsx` 에 있고, 카메라는 `useCamera`(0~10초 돌리인, 10~20초 팬),
수채화 질감은 SVG `feTurbulence`+`feDisplacementMap` 필터와 종이 그레인 오버레이로 낸다.
BGM은 `audio-gen/gift_bgm_gen.py` 가 합성한다 (`public/gift/bgm.mp3`).

## 실행

```bash
cd video
npm install
npm run render      # → video/output.mp4
npm run studio      # 브라우저 미리보기 (Remotion Studio)
```

렌더링 명령의 원형: `npx remotion render src/index.ts SmShorts output.mp4`

## 오디오

| 파일 | 역할 | 생성 방법 |
|---|---|---|
| `public/bgm.mp3` | 배경음악 (루프, 28~30초 페이드아웃, 내레이션 중 자동 더킹) | `audio-gen/bgm_gen.py` 가 numpy 로 직접 합성 (112 BPM, C장조) |
| `public/voice/*.wav` | 내레이션 (영어: Piper amy, 한국어: Mimic3 kss) | `audio-gen/tts_gen.py` (sherpa-onnx 오프라인 TTS) |
| `src/voiceCues.ts` | 내레이션 클립의 시작 프레임·길이 | `tts_gen.py` 가 자동 생성 |
| `public/로고.jpg` | 아웃트로 로고 (`tool/logo.jpg` 복사본) | 없으면 'ON글터' 플레이스홀더 렌더링 |

BGM 파일 유무는 `src/Root.tsx`의 `calculateMetadata`가 빌드 시 자동 감지한다.
다른 음원으로 바꾸려면 `public/bgm.mp3`만 교체하고 다시 렌더링하면 된다.

### 내레이션 다시 만들기

```bash
pip install sherpa-onnx numpy soundfile
# 모델 3종을 받아 한 폴더(<models>)에 푼다 (k2-fsa/sherpa-onnx GitHub 릴리스 tts-models):
#   vits-piper-en_US-amy-medium, vits-mimic3-ko_KO-kss_low
python3 audio-gen/tts_gen.py <models> public/voice src/voiceCues.ts
python3 audio-gen/bgm_gen.py bgm.wav && ffmpeg -i bgm.wav -b:a 192k public/bgm.mp3
```

대본과 타이밍은 `tts_gen.py`의 `GROUPS` 표에서 바꾼다.

## 구조

- `src/SmShorts.tsx` 씬 타임라인 + BGM
- `src/Subtitles.tsx` 자막 큐 (절대 프레임 기준) · `sm` 코랄 강조
- `src/scenes/` Intro(스마일) · FirstSound(공/미소) · MiddleSound(우주/재스민) · EndSound(프리즘) · Outro(로고)
- `src/constants.ts` 규격·씬 경계·색상
- `remotion.config.ts` 컨테이너에 설치된 Chromium 자동 사용
