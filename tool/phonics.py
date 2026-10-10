#!/usr/bin/env python3
"""ON글터 파닉스 블로그 도구 (음성·발음 확인·그림).

  python3 tool/phonics.py setup
      미국식 영어 음성 엔진(piper-tts)과 음성 모델(LibriTTS, CC BY 4.0)을 준비한다. 세션마다 한 번.
  python3 tool/phonics.py ipa ball rabbit crab
      음성 엔진이 실제로 읽을 미국식 발음(espeak IPA)을 보여 준다. 사전 발음기호와 대조하는 용도.
  python3 tool/phonics.py emoji "CRAB" blog/<폴더>/src
      Noto 이모지 SVG(Apache 2.0)를 유니코드 이름으로 찾아 내려받는다. 이름이 정확하지 않으면 후보를 보여 준다.
  python3 tool/phonics.py voice blog/<폴더>/src/음성.json blog/<폴더>/src/음성.wav
      음성.json 의 타임라인대로 30초 음성 트랙(WAV)을 만든다. 겹치거나 너무 짧은 줄이 있으면 ⚠ 와 종료 코드 2.
  python3 tool/phonics.py samples <출력.wav> [화자번호,...]
      화자 후보를 차례로 읽힌 비교용 샘플을 만든다 (원장이 목소리를 고를 때).

음성.json 형식:
  {"speaker": 46, "length": 30,
   "lines": [{"t": 0.4, "say": "The letter B."},
             {"t": 1.8, "say": "[[ bə ]]", "slow": 1.5},
             {"t": 2.0, "say": "[[ mmm ]]", "dur": 0.7}, ...]}
  t 는 시작 초, say 는 영어 문장 또는 [[ ]] 안의 IPA 음소, slow 는 말 속도 배율(기본 1.3, 클수록 느림),
  stretch 는 음높이를 유지한 채 길이를 늘리는 배율, dur 는 그 줄을 음높이를 유지한 채 정확히 이 초로 맞춘다
  (지속음 m·s·f·모음 등 낱소리용. dur 가 있으면 stretch 는 무시).
"""
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import unicodedata
import wave

VOICE_URL = 'https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-en-us-libritts-high.tar.gz'
VOICE_SHA256 = '328e3e9cb573a43a6c5e1aeca386e971232bdb1418a74d4674cf726c973a0ea8'
VOICE_DIR = os.environ.get('ONGLTER_VOICE_DIR', os.path.expanduser('~/.cache/onglter/voices'))
VOICE_MODEL = os.path.join(VOICE_DIR, 'en-us-libritts-high.onnx')
PIPER_VERSION = '1.8.0'
DEFAULT_SPEAKER = 46
# 이모지가 있는 유니코드 구역 (기호·수학 구역은 이름 검색에서 걸러지고, Noto SVG 가 없으면 내려받기에서 걸러진다)
EMOJI_BLOCKS = [(0x2190, 0x2BFF), (0x3030, 0x303D), (0x1F000, 0x1F64F), (0x1F680, 0x1F6FF), (0x1F7E0, 0x1F7FF), (0x1F900, 0x1FAFF)]
EMOJI_URL = 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/2D/svg/emoji_u{cp}.svg'
SR = 22050


def fail(msg):
    print('실패: ' + msg, file=sys.stderr)
    sys.exit(1)


# ---------------------------------------------------------------- setup
def setup():
    try:
        import piper  # noqa: F401
    except ImportError:
        print(f'piper-tts {PIPER_VERSION} 설치 중…')
        cmd = [sys.executable, '-m', 'pip', 'install', '-q', f'piper-tts=={PIPER_VERSION}']
        if subprocess.run(cmd).returncode != 0:
            if subprocess.run(cmd + ['--break-system-packages']).returncode != 0:
                fail('piper-tts 설치 실패 (pip 출력 참조)')
    if not os.path.exists(VOICE_MODEL):
        os.makedirs(VOICE_DIR, exist_ok=True)
        with tempfile.TemporaryDirectory() as tmp:
            tgz = os.path.join(tmp, 'voice.tgz')
            print('음성 모델(약 120MB) 내려받는 중…')
            if subprocess.run(['curl', '-sSL', '--fail', '-o', tgz, VOICE_URL]).returncode != 0:
                fail('음성 모델 내려받기 실패: ' + VOICE_URL)
            sha = subprocess.run(['sha256sum', tgz], capture_output=True, text=True).stdout.split()[0]
            if sha != VOICE_SHA256:
                fail(f'음성 모델 체크섬 불일치 ({sha})')
            with tarfile.open(tgz) as t:
                for m in t.getmembers():
                    base = os.path.basename(m.name)
                    if base.endswith(('.onnx', '.onnx.json')) or base == 'MODEL_CARD':
                        m.name = base
                        try:
                            t.extract(m, VOICE_DIR, filter='data')
                        except TypeError:
                            t.extract(m, VOICE_DIR)
    if not os.path.exists(VOICE_MODEL + '.json'):
        fail('음성 모델 설정 파일이 없습니다: ' + VOICE_MODEL + '.json')
    print(f'✓ 준비됨: piper-tts, {VOICE_MODEL} (LibriTTS 미국식 영어, CC BY 4.0)')


def load_voice():
    try:
        from piper import PiperVoice
    except ImportError:
        fail('piper-tts 가 없습니다. 먼저 python3 tool/phonics.py setup')
    if not os.path.exists(VOICE_MODEL):
        fail('음성 모델이 없습니다. 먼저 python3 tool/phonics.py setup')
    return PiperVoice.load(VOICE_MODEL)


# ---------------------------------------------------------------- ipa
def ipa(words):
    v = load_voice()
    print('음성 엔진이 읽을 발음 (espeak 미국식). 사전 표기와 기호 관습이 다를 수 있으니 목표 소리가 같은지를 본다.')
    print('  참고: ɹ=r, ɾ=모음 사이 t/d(플랩), ɚ=강세 없는 er, ː=길게 (사전에는 보통 안 씀)')
    for w in words:
        ph = ''.join(''.join(s) for s in v.phonemize(w))
        print(f'  {w:14} /{ph}/')


# ---------------------------------------------------------------- emoji
def emoji(query, outdir):
    q = query.strip()
    cp = None
    if q.upper().startswith('U+') or all(c in '0123456789abcdefABCDEF' for c in q):
        cp = int(q[2:] if q.upper().startswith('U+') else q, 16)
    else:
        names = {}
        for lo, hi in EMOJI_BLOCKS:
            for c in range(lo, hi + 1):
                try:
                    n = unicodedata.name(chr(c))
                except ValueError:
                    continue
                if not n.startswith(('APL ', 'ALCHEMICAL ')):
                    names[n] = c
        cp = names.get(q.upper())
        if cp is None:
            word = re.compile(r'\b' + re.escape(q.upper()) + r'\b')
            hits = [(n, c) for n, c in names.items() if word.search(n)] or \
                   [(n, c) for n, c in names.items() if q.upper() in n]
            hits.sort(key=lambda x: (len(x[0]), x[0]))
            cands = [f'  {n} (U+{c:X})' for n, c in hits[:30]]
            fail(f'"{q}" 와 정확히 같은 이름의 이모지가 없습니다.' + ('\n후보 (짧은 이름 순, 이모지가 아닌 기호는 내려받기에서 걸러진다):\n' + '\n'.join(cands) if cands else ' 다른 단어를 고른다.'))
    os.makedirs(outdir, exist_ok=True)
    out = os.path.join(outdir, f'emoji_u{cp:x}.svg')
    r = subprocess.run(['curl', '-sSL', '--fail', '-o', out, EMOJI_URL.format(cp=f'{cp:x}')])
    if r.returncode != 0 or not open(out, 'rb').read(200).lstrip().startswith((b'<svg', b'<?xml')):
        if os.path.exists(out):
            os.remove(out)
        fail(f'Noto 이모지 SVG 가 없습니다 (U+{cp:X}). 다른 이모지나 다른 단어를 고른다.')
    try:
        name = unicodedata.name(chr(cp))
    except ValueError:
        name = '?'
    print(f'✓ {out}  (U+{cp:X} {name}, Noto Emoji · Apache 2.0)')


# ---------------------------------------------------------------- voice
def synth(v, text, speaker, slow):
    from piper import SynthesisConfig
    import numpy as np
    buf = io.BytesIO()
    cfg = SynthesisConfig(speaker_id=speaker, length_scale=slow, noise_w_scale=0.0)
    with wave.open(buf, 'wb') as w:
        v.synthesize_wav(text, w, syn_config=cfg)
    buf.seek(0)
    with wave.open(buf) as w:
        sr = w.getframerate()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    if sr != SR:
        fail(f'음성 모델 샘플레이트가 {sr} 입니다 ({SR} 기대)')
    return a


def stretch(a, factor):
    """음높이를 유지한 채 길이를 factor 배로 (ffmpeg atempo)."""
    import numpy as np
    with tempfile.TemporaryDirectory() as tmp:
        src, dst = os.path.join(tmp, 'a.wav'), os.path.join(tmp, 'b.wav')
        with wave.open(src, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
        chain, f = [], 1 / factor
        while f < 0.5:
            chain.append('atempo=0.5'); f /= 0.5
        chain.append(f'atempo={f:.4f}')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', ','.join(chain), dst], check=True)
        with wave.open(dst) as w:
            return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def trim(a, thr=0.01):
    import numpy as np
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - 200): idx[-1] + 400] if len(idx) else a


def voice(spec_path, out_path):
    import numpy as np
    spec = json.load(open(spec_path, encoding='utf-8'))
    speaker = int(spec.get('speaker', DEFAULT_SPEAKER))
    length = float(spec.get('length', 30))
    lines = sorted(spec['lines'], key=lambda l: l['t'])
    v = load_voice()
    track = np.zeros(int(length * SR), dtype=np.float32)
    warn, rows = [], []
    for i, l in enumerate(lines):
        a = trim(synth(v, l['say'], speaker, float(l.get('slow', 1.3))))
        if l.get('dur'):
            a = trim(stretch(a, float(l['dur']) / (len(a) / SR)))
        elif l.get('stretch'):
            a = trim(stretch(a, float(l['stretch'])))
        peak = float(np.abs(a).max()) if len(a) else 0
        if peak > 0:
            a = a * (0.8 / peak)                      # 줄마다 같은 크기로
        start = int(l['t'] * SR)
        end_t = l['t'] + len(a) / SR
        nxt = lines[i + 1]['t'] if i + 1 < len(lines) else length
        note = ''
        if len(a) / SR < 0.18:
            note = '⚠ 너무 짧음 (0.18초 미만: [[ ]] 음소에 짧은 ə 를 붙이거나 dur 를 준다)'
        if end_t > nxt - 0.1:
            note = f'⚠ 다음 줄({nxt:.2f}s)과 겹침 또는 0.1초 미만 간격'
        if start + len(a) > len(track):
            note = '⚠ 영상 길이를 넘음'
            a = a[:max(0, len(track) - start)]
        track[start:start + len(a)] += a
        rows.append(f'  {l["t"]:5.2f}–{end_t:5.2f}s  {l["say"]:<28} {note}')
        if note:
            warn.append(note)
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(track, -1, 1) * 32767).astype(np.int16).tobytes())
    print(f'음성 트랙 {length:.0f}초, 화자 {speaker} (LibriTTS 미국식 영어)')
    print('\n'.join(rows))
    print(('⚠ 경고 있음 — 음성.json 을 고쳐 다시 만든다 ' if warn else '✓ ') + out_path)
    if warn:
        sys.exit(2)


def samples(out_path, speakers):
    import numpy as np
    v = load_voice()
    parts = []
    for i, s in enumerate(speakers, 1):
        a = trim(synth(v, f'Voice {i}. The letter B. Ball. Rabbit. Crab. Great job!', s, 1.15))
        parts += [a * (0.8 / float(np.abs(a).max())), np.zeros(int(0.8 * SR), dtype=np.float32)]
        print(f'  {i}번 = 화자 {s}')
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(np.concatenate(parts), -1, 1) * 32767).astype(np.int16).tobytes())
    print('✓ ' + out_path)


def main():
    a = sys.argv[1:]
    if not a:
        print(__doc__); sys.exit(1)
    cmd = a[0]
    if cmd == 'setup':
        setup()
    elif cmd == 'ipa' and len(a) > 1:
        ipa(a[1:])
    elif cmd == 'emoji' and len(a) == 3:
        emoji(a[1], a[2])
    elif cmd == 'voice' and len(a) == 3:
        if not shutil.which('ffmpeg'):
            fail('ffmpeg 가 없습니다')
        voice(a[1], a[2])
    elif cmd == 'samples' and len(a) >= 2:
        sp = [int(x) for x in a[2].split(',')] if len(a) > 2 else [46, 138, 207, 322, 529, 23]
        samples(a[1], sp)
    else:
        print(__doc__); sys.exit(1)


if __name__ == '__main__':
    main()
