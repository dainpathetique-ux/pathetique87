"""내레이션 합성 + 타임라인 배치. 결과: video/public/voice/*.wav, video/src/voiceCues.ts"""
import json, os, sys
import numpy as np, soundfile as sf, sherpa_onnx

DL = sys.argv[1]            # 모델 다운로드 폴더
OUT = sys.argv[2]           # video/public/voice
TS = sys.argv[3]            # video/src/voiceCues.ts
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
    (25, 140,  [(EN, "Today's sound is the blend S, M.", 'en_intro', 0.95)]),
    (152, 250, [(EN, 'Beginning sound.', 'en_first', 1.0), (EN, 'Small. Small.', 'en_small', 0.95)]),
    (258, 355, [(EN, 'Smile. Smile.', 'en_smile', 0.95)]),
    (362, 480, [(EN, 'Middle sound.', 'en_middle', 1.0), (EN, 'Cosmic. Cosmic.', 'en_cosmic', 0.95)]),
    (485, 568, [(EN, 'Jasmine. Jasmine.', 'en_jasmine', 0.95)]),
    (573, 650, [(EN, 'Ending sound.', 'en_end', 1.0), (EN, 'Prism. Prism.', 'en_prism', 0.95)]),
    (665, 760, [(EN, 'Small, Smile, Cosmic, Jasmine, Prism.', 'en_recap', 1.15)]),
    (768, 888, [(EN, 'Great job! See you next time.', 'en_outro', 1.0)]),
]
GAP = 4  # 클립 사이 간격(프레임)

cues = []
cursor = 0
for start, deadline, items in GROUPS:
    f = max(start, cursor)  # 앞 그룹이 길면 뒤로 민다
    for tts, text, name, speed in items:
        dur = synth(tts, text, name, speed)
        frames = int(np.ceil(dur * FPS))
        cues.append({'src': f'voice/{name}.wav', 'from': f, 'durationInFrames': frames, 'text': text})
        print(f'{name:12s} {dur:5.2f}s  from={f:4d}  to={f+frames:4d}  {"⚠ 넘침" if f+frames > deadline else ""}')
        f += frames + GAP
    cursor = f

with open(TS, 'w', encoding='utf-8') as fp:
    fp.write('// tts_gen.py 가 생성한 파일. 직접 수정하지 말 것.\n')
    fp.write('export type VoiceCue = {src: string; from: number; durationInFrames: number; text: string};\n')
    fp.write('export const VOICE_CUES: VoiceCue[] = ' + json.dumps(cues, ensure_ascii=False, indent=2) + ';\n')
print('wrote', TS)
