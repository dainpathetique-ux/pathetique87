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
