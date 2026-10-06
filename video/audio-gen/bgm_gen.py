"""키즈 에듀용 밝은 BGM 합성 (numpy). 112 BPM, C장조 I-V-vi-IV, 마림바 아르페지오 + 패드 + 가벼운 타악."""
import sys, numpy as np, soundfile as sf
SR = 44100; BPM = 112; BEAT = 60 / BPM; DUR = 30.0
N = int(SR * DUR); t_all = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)

def note(f): return 440 * 2 ** ((f - 69) / 12)
def add(buf, start, sig, pan=0.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if i >= N: return
    g = sig[:j - i]
    L[i:j] += g * (1 - pan) / 2 * 2 ** 0.5 * 0.5 + g * 0.5 * (1 - max(pan, 0))
    R[i:j] += g * (1 + pan) / 2 * 2 ** 0.5 * 0.5 + g * 0.5 * (1 + min(pan, 0))

def marimba(midi, dur, vel=0.5):
    n = int(SR * dur); t = np.arange(n) / SR; f = note(midi)
    env = np.exp(-t * 7.0) * (1 - np.exp(-t * 900))
    sig = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 18)
           + 0.12 * np.sin(2 * np.pi * f * 9.9 * t) * np.exp(-t * 30))
    return sig * env * vel

def pad(midis, dur, vel=0.09):
    n = int(SR * dur); t = np.arange(n) / SR
    env = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.8)
    sig = np.zeros(n)
    for m in midis:
        f = note(m)
        sig += np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.4 * t)) + 0.4 * np.sin(2 * np.pi * f * 2 * t + 1)
    return sig * env * vel

def bass(midi, dur, vel=0.28):
    n = int(SR * dur); t = np.arange(n) / SR; f = note(midi)
    env = np.exp(-t * 4) * np.minimum(1, t / 0.01)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * env * vel

def kick(vel=0.35):
    n = int(SR * 0.18); t = np.arange(n) / SR
    f = 120 * np.exp(-t * 22) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 16) * vel

rng = np.random.default_rng(7)
def hat(vel=0.05, dur=0.035):
    n = int(SR * dur); noise = rng.standard_normal(n)
    # 간단한 하이패스(차분)
    noise = np.diff(noise, prepend=0)
    return noise * np.exp(-np.arange(n) / SR * 120) * vel
def shaker(vel=0.035):
    n = int(SR * 0.09); noise = np.diff(rng.standard_normal(n), prepend=0)
    t = np.arange(n) / SR
    return noise * np.sin(np.pi * t / 0.09) * vel

# 코드 진행: C G Am F (각 1마디, 4박)
CHORDS = [([60, 64, 67], 48), ([59, 62, 67], 55), ([60, 64, 69], 57), ([60, 65, 69], 53)]
ARP = [0, 1, 2, 1, 0, 1, 2, 3]  # 8분음표 패턴 (3 = 옥타브 위 루트)
MELODY = [  # (마디 내 박, 피치) 2마디마다 짧은 종소리 모티프
    [(0, 76), (1.5, 79), (2, 81)], [(0, 79), (1, 76), (2.5, 74)],
]
bar = 0; tm = 0.0
while tm < DUR:
    chord, root = CHORDS[bar % 4]
    tones = chord + [chord[0] + 12]
    add(L, tm, pad(chord, BEAT * 4))
    for b in range(4):
        add(L, tm + b * BEAT, kick(0.33 if b in (0, 2) else 0.18))
        add(L, tm + b * BEAT, hat(0.045), pan=0.3)
        add(L, tm + (b + 0.5) * BEAT, hat(0.03), pan=0.3)
        add(L, tm + (b + 0.5) * BEAT, shaker(), pan=-0.3)
        if b in (0, 2):
            add(L, tm + b * BEAT, bass(root - 12, BEAT * 1.6))
    for k, idx in enumerate(ARP):
        m = tones[idx]
        add(L, tm + k * BEAT / 2, marimba(m, 0.6, 0.22 if k % 2 == 0 else 0.16), pan=(-0.45 if k % 2 == 0 else 0.45))
    if bar % 2 == 0 and bar >= 2:
        for beat, p in MELODY[(bar // 2) % 2]:
            add(L, tm + beat * BEAT, marimba(p, 1.2, 0.2), pan=0.1)
    bar += 1; tm += BEAT * 4

# 간단한 스테레오 딜레이 리버브
def delay(x, sec, fb, mix):
    d = int(SR * sec); out = x.copy()
    for n in range(1, 4):
        out[d * n:] += x[:len(x) - d * n] * (fb ** n) * mix
    return out
L = delay(L, 0.27, 0.45, 0.35); R = delay(R, 0.33, 0.45, 0.35)
mix = np.stack([L, R], axis=1)
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.7
# 끝 0.3초 페이드(루프 이음새용)
f = np.ones(N); f[-int(SR * 0.3):] = np.linspace(1, 0, int(SR * 0.3))
mix *= f[:, None]
sf.write(sys.argv[1], mix.astype(np.float32), SR)
print('bgm written', sys.argv[1], mix.shape)
