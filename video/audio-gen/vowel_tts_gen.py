"""단모음·장모음 숏폼 내레이션 합성(영어 전용) + 타임라인. 사용:
python3 vowel_tts_gen.py <models> <vowels.json> <public/abc/voice> <src/abc/voiceCuesVowel.ts>"""
import json, os, sys
import numpy as np, soundfile as sf, sherpa_onnx

DL, DATA, OUT, TS = sys.argv[1:5]
FPS = 30; GAP = 4
os.makedirs(OUT, exist_ok=True)

def load(dirname, model):
    d = os.path.join(DL, dirname)
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=os.path.join(d, model), lexicon='', tokens=os.path.join(d, 'tokens.txt'),
                data_dir=os.path.join(d, 'espeak-ng-data')),
            num_threads=4, provider='cpu'),
        max_num_sentences=1)
    assert cfg.validate(), dirname
    return sherpa_onnx.OfflineTts(cfg)

EN = load('vits-piper-en_US-amy-medium', 'en_US-amy-medium.onnx')

def synth(tts, text, name, speed, pad=0.06):
    a = tts.generate(text, sid=0, speed=speed)
    x = np.asarray(a.samples, dtype=np.float32)
    x = x / (np.max(np.abs(x)) + 1e-6) * 0.85
    sr = a.sample_rate
    sil = np.zeros(int(sr * pad), dtype=np.float32)
    x = np.concatenate([sil, x, sil])
    sf.write(os.path.join(OUT, name + '.wav'), x, sr)
    return len(x) / sr

data = json.load(open(DATA, encoding='utf-8'))
cues = {}
for item in data:
    L = item['letter']; ws = item['words']
    name = item['name']  # 예: Short A
    groups = [
        (12, 148, [(EN, f"Today's sound is {name}.", f'{L}_en_intro', 1.0),
                   (EN, item['intro2'], f'{L}_en_intro2', 1.0)]),
    ]
    for i, w in enumerate(ws):
        start = [155, 365, 575][i]; end = [350, 560, 740][i]
        groups.append((start, end, [(EN, f"{w['word']}.", f'{L}_en_w{i+1}a', 0.9),
                                    (EN, f"{w['word']}.", f'{L}_en_w{i+1}b', 0.9)]))
    groups.append((752, 892, [(EN, f"{name}: " + ', '.join(w['word'] for w in ws) + '.', f'{L}_en_recap', 1.1),
                              (EN, 'Great job! See you soon.', f'{L}_en_outro', 1.1)]))
    lst = []
    cursor = 0
    for start, deadline, items in groups:
        f = max(start, cursor)  # 앞 그룹이 길면 뒤로 민다
        for tts, text, name, speed in items:
            dur = synth(tts, text, name, speed)
            frames = int(np.ceil(dur * FPS))
            lst.append({'src': f'abc/voice/{name}.wav', 'from': f, 'durationInFrames': frames, 'text': text})
            if f + frames > deadline:
                print(f'⚠ {name} 넘침: {f + frames} > {deadline}')
            f += frames + GAP
        cursor = f
    cues[L] = lst
    print(L, 'done', flush=True)

with open(TS, 'w', encoding='utf-8') as fp:
    fp.write('// abc_tts_gen.py 가 생성한 파일. 직접 수정하지 말 것.\n')
    fp.write("import type {VoiceCue} from '../voiceCues';\n")
    fp.write('export const VOWEL_VOICE: Record<string, VoiceCue[]> = ' + json.dumps(cues, ensure_ascii=False) + ';\n')
print('wrote', TS)
