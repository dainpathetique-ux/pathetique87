"""'빙그레의 영역' 티저 BGM: 느린 3/4 왈츠, 피아노 + 첼로 (numpy 합성). 사용: python3 gift_bgm_gen.py out.wav"""
import sys, numpy as np, soundfile as sf
SR = 44100; BPM = 72; BEAT = 60 / BPM; BAR = BEAT * 3; DUR = 24.0
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)

def note(m): return 440 * 2 ** ((m - 69) / 12)
def add(start, sig, pan=0.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if i >= N: return
    g = sig[: j - i]
    L[i:j] += g * (0.5 - pan * 0.5) * 2 ** 0.5
    R[i:j] += g * (0.5 + pan * 0.5) * 2 ** 0.5

def piano(m, dur, vel=0.3):
    n = int(SR * (dur + 1.2)); t = np.arange(n) / SR; f = note(m); sig = np.zeros(n)
    for k in range(1, 8):
        inh = 1 + 0.0004 * k * k
        amp = 1 / k ** 1.4 * np.exp(-t * (1.1 + 0.8 * k))
        sig += amp * np.sin(2 * np.pi * f * k * inh * t)
    env = (1 - np.exp(-t * 2500))
    rel = np.ones(n); i = int(SR * dur); rel[i:] = np.exp(-(t[i:] - t[i]) * 6)
    return sig * env * rel * vel

def cello(m, dur, vel=0.12):
    n = int(SR * (dur + 0.5)); t = np.arange(n) / SR; f = note(m)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.5)
    phase = 2 * np.pi * f * np.cumsum(vib) / SR
    sig = np.zeros(n)
    for k in range(1, 14):
        sig += np.sin(phase * k) / k * np.exp(-k / 6)
    att = np.minimum(1, t / 0.35)
    rel = np.ones(n); i = int(SR * dur); rel[i:] = np.exp(-(t[i:] - t[i]) * 5)
    return sig * att * rel * vel

# 코드 진행 (마디당 1코드): C  Am  F  G  C  Em  F  G  C  C
CHORDS = [
    (48, [60, 64, 67]), (45, [60, 64, 69]), (41, [60, 65, 69]), (43, [59, 62, 67]),
    (48, [60, 64, 67]), (40, [59, 64, 67]), (41, [60, 65, 69]), (43, [59, 62, 67]),
    (48, [60, 64, 67]), (48, [60, 64, 67]),
]
# 멜로디: (마디, 박 오프셋, 피치, 길이(박))
MELODY = [
    (0, 0, 67, 1), (0, 1, 76, 1), (0, 2, 74, 1),
    (1, 0, 72, 2), (1, 2, 69, 1),
    (2, 0, 69, 1), (2, 1, 72, 1), (2, 2, 77, 1),
    (3, 0, 74, 3),
    (4, 0, 76, 1), (4, 1, 79, 1), (4, 2, 76, 1),
    (5, 0, 72, 2), (5, 2, 74, 1),
    (6, 0, 69, 1), (6, 1, 77, 1), (6, 2, 76, 1),
    (7, 0, 74, 2), (7, 2, 71, 1),
    (8, 0, 72, 3),
]
CELLO = [(0, 36), (1, 33), (2, 29), (3, 31), (4, 36), (5, 40), (6, 41), (7, 43), (8, 36), (9, 36)]

for b, (root, chord) in enumerate(CHORDS):
    t0 = b * BAR
    add(t0, piano(root, BEAT * 2.8, 0.26), pan=-0.3)                 # 왼손 베이스 (1박)
    for beat in (1, 2):                                               # 왼손 화음 (2·3박)
        for m in chord:
            add(t0 + beat * BEAT, piano(m, BEAT * 0.9, 0.09), pan=-0.15)
for bar, off, p, ln in MELODY:
    add(bar * BAR + off * BEAT, piano(p, BEAT * ln, 0.3), pan=0.25)
    add(bar * BAR + off * BEAT + 0.012, piano(p + 12, BEAT * ln, 0.05), pan=0.35)  # 옥타브 배음
for bar, p in CELLO:
    add(bar * BAR, cello(p, BAR * 0.98, 0.11), pan=-0.1)

def reverb(x, taps=((0.031, 0.5), (0.067, 0.4), (0.113, 0.3), (0.191, 0.25), (0.277, 0.18), (0.389, 0.12))):
    out = x.copy()
    for sec, g in taps:
        d = int(SR * sec); out[d:] += x[:-d] * g
    return out
L = reverb(L); R = reverb(R)
mix = np.stack([L, R], axis=1)
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.75
sf.write(sys.argv[1], mix.astype(np.float32), SR)
print('written', sys.argv[1])
