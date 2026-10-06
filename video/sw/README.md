# 파닉스 숏폼 영상 제작 파이프라인

주제별 사양 파일(`specs/<주제>.js`) 하나로 30초 세로형(1080×1920) 영상을 만든다.
외부 AI 영상 도구를 쓰지 않고 Chromium(Playwright)으로 프레임을 그려 ffmpeg로 묶는다.

## 준비 (세션마다 1회)
```bash
pip install --break-system-packages piper-tts
V=/tmp/voices && mkdir -p $V && cd $V
curl -L -o v.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-hfc_female-medium.tar.bz2
tar xjf v.tar.bz2
export PIPER_MODEL=$V/vits-piper-en_US-hfc_female-medium/en_US-hfc_female-medium.onnx
```
(허깅페이스는 이 환경에서 막혀 있어 GitHub 릴리스에서 받는다.)

## 제작
```bash
node video/sw/build_video.js video/sw/specs/sn.js preview   # 장면표만 확인
node video/sw/build_video.js video/sw/specs/sn.js           # 전체 제작 → output/<outName>/<이름>_30초.mp4
```

## 파일
- `scene_tpl.html` 범용 장면 템플릿 (A 소개 → B 소리 만들기 → C 단어 2개 → 로고 아웃트로)
- `specs/*.js` 주제별 사양: 글자, 단어, IPA, 한국어 뜻, SVG 그림, 내레이션 큐(초 단위)
- `build_video.js` 프레임 렌더 → 내레이션(piper) → BGM(`bgm.js`) → 합성(`mix.sh`) → 장면표
- `scene.html`, `scene_v.html`, `render.js` SW 영상 초기 버전(가로형·세로형 전용 장면)

## 타임라인 (고정)
| 구간 | 장면 | 내레이션 큐 |
|---|---|---|
| 0–5초 | 두 글자가 합쳐지며 대표 단어 | 0.8초 |
| 5–15초 | 소리 만들기 (단어 2~3단계) | 5.4 / 7.9 / 10.4 / 11.5초 |
| 15–25초 | 확장 단어 2개 (가로 전환) | 15.6 / 20.6초 |
| 25–30초 | 로고 아웃트로 | 25.6초 |

새 주제를 만들 때는 `specs/sn.js`를 복사해 단어·그림·큐만 바꾼다.
그림은 (0,0)을 중심으로 ±300px 안에 그리며, `data-anim="bob|sway|flap|spin|drip|wink"`로 간단한 움직임을 준다.
