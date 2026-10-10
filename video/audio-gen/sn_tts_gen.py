"""이중자음 sn 숏폼 내레이션 합성 + 타임라인 배치. 결과: video/public/sn/voice/*.wav, video/src/sn/voiceCues.ts

사용: python3 audio-gen/sn_tts_gen.py <models> public/sn/voice src/sn/voiceCues.ts
"""
import json, os, sys
import numpy as np, soundfile as sf, sherpa_onnx

DL = sys.argv[1]            # 모델 다운로드 폴더
OUT = sys.argv[2]           # video/public/sn/voice
TS = sys.argv[3]            # video/src/sn/voiceCues.ts
FPS = 30
os.makedirs(OUT, exist_ok=True)

def load(dirname, model, lexicon=''):
    d = os.path.join(DL, dirname)
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=os.path.join(d, model),
                lexicon=lexicon,
                tokens=os.path.join(d, 'tokens.txt'),
                data_dir=os.path.join(d, 'espeak-ng-data'),
            ),
            num_threads=2, provider='cpu'),
        max_num_sentences=1)
    assert cfg.validate(), dirname
    return sherpa_onnx.OfflineTts(cfg)

EN = load('vits-piper-en_US-amy-medium', 'en_US-amy-medium.onnx')

def synth(tts, text, name, speed, pad=0.06):
    a = tts.generate(text, sid=0, speed=speed)
    x = np.asarray(a.samples, dtype=np.float32)
    x = x / (np.max(np.abs(x)) + 1e-6) * 0.85
    sr = a.sample_rate
    silence = np.zeros(int(sr * pad), dtype=np.float32)
    x = np.concatenate([silence, x, silence])
    path = os.path.join(OUT, name + '.wav')
    sf.write(path, x, sr)
    return len(x) / sr

# (그룹 시작 프레임, 그룹 마감 프레임, [(음성, 텍스트, 파일명, 속도)])
GROUPS = [
    (25, 140,  [(EN, "Today's sound is the blend S, N.", 'sn_intro', 0.95)]),
    (152, 250, [(EN, 'Beginning sound.', 'sn_first', 1.0), (EN, 'Snake. Snake.', 'sn_snake', 0.95)]),
    (258, 355, [(EN, 'Snail. Snail.', 'sn_snail', 0.95)]),
    (362, 480, [(EN, 'Middle sound.', 'sn_middle', 1.0), (EN, 'Parsnip. Parsnip.', 'sn_parsnip', 0.95)]),
    (485, 568, [(EN, 'Gingersnap. Gingersnap.', 'sn_gingersnap', 0.95)]),
    # sn 은 단어 끝에 오지 않는다. 끝소리 자리는 "없다"는 것을 알려 준다.
    (573, 690, [(EN, 'Ending sound?', 'sn_end', 1.05), (EN, 'No words end with S, N.', 'sn_noend', 1.0)]),
    (684, 770, [(EN, 'Snake, Snail, Parsnip, Gingersnap.', 'sn_recap', 1.2)]),
    (768, 888, [(EN, 'Great job! See you next time.', 'sn_outro', 1.0)]),
]
GAP = 4  # 클립 사이 간격(프레임)

cues = []
cursor = 0
for start, deadline, items in GROUPS:
    f = max(start, cursor)  # 앞 그룹이 길면 뒤로 민다
    for tts, text, name, speed in items:
        dur = synth(tts, text, name, speed)
        frames = int(np.ceil(dur * FPS))
        cues.append({'src': f'sn/voice/{name}.wav', 'from': f, 'durationInFrames': frames, 'text': text})
        print(f'{name:12s} {dur:5.2f}s  from={f:4d}  to={f+frames:4d}  {"⚠ 넘침" if f+frames > deadline else ""}')
        f += frames + GAP
    cursor = f

with open(TS, 'w', encoding='utf-8') as fp:
    fp.write('// sn_tts_gen.py 가 생성한 파일. 직접 수정하지 말 것.\n')
    fp.write("import type {VoiceCue} from '../voiceCues';\n")
    fp.write('export const SN_VOICE_CUES: VoiceCue[] = ' + json.dumps(cues, ensure_ascii=False, indent=2) + ';\n')
print('wrote', TS)
