"""Render the 23 s past-perfect shorts video (1080x1920, 30 fps) from the
stitched watercolor illustration, with floating keyword captions, a logo
outro and a soft synthesized piano BGM."""
import math, subprocess, sys, wave, struct
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
DUR = 23.0
SRC = Image.open("stitched_1200.png").convert("RGB")          # 1200 x 2136
SW, SH = SRC.size
BASE = SW / W                                                 # 1.111

FONT_B = "kr700.ttf"
FONT_R = "kr400.ttf"

# ---------- camera -------------------------------------------------------
def ease(u):
    u = min(max(u, 0.0), 1.0)
    return u * u * (3 - 2 * u)

def view(z, cx, cy):
    """Return the 1080x1920 frame for zoom z centred at (cx,cy) in base coords."""
    a = BASE / z
    c = (cx - 540 / z) * BASE
    f = (cy - 960 / z) * BASE
    return SRC.transform((W, H), Image.AFFINE, (a, 0, c, 0, a, f), resample=Image.BICUBIC)

def clip1(t):                       # 0 - 10.5 s : slow push-in
    u = ease(t / 10.5)
    z = 1.0 + 0.10 * u
    return view(z, 540 - 52 * u, 960 + 8 * u)

def clip2(t):                       # 9.5 - 20.5 s : slow pan left -> right
    z = 1.12
    half = 540 / z
    u = ease((t - 9.75) / 10.5)
    cx = half + (W - 2 * half) * u
    return view(z, cx, 960)

# gentle sunlight shimmer: a soft warm band that drifts slowly (screen blend)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
def shimmer(t):
    phase = t / 7.0
    d = ((xx + yy * 0.6) / 2200.0 - 0.15 - 0.25 * math.sin(2 * math.pi * phase))
    band = np.exp(-(d * d) / (2 * 0.12 ** 2)) * (0.06 + 0.02 * math.sin(2 * math.pi * t / 5.3))
    return band[..., None]

def warm_glow(img, t):
    arr = np.asarray(img).astype(np.float32) / 255.0
    arr = arr + (1 - arr) * shimmer(t)                      # screen-like lift
    arr = arr * (1.0 + 0.012 * math.sin(2 * math.pi * t / 9.0))
    return Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8))

# ---------- logo outro ---------------------------------------------------
import os
LOGO = Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "logo.jpg")).convert("RGB")
lw = 760
LOGO = LOGO.resize((lw, round(LOGO.height * lw / LOGO.width)), Image.LANCZOS)
def outro_frame(t):
    img = Image.new("RGB", (W, H), (255, 255, 255))
    # soft cream vignette so it matches the illustration palette
    img.paste(LOGO, ((W - LOGO.width) // 2, 760))
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(FONT_B, 54)
    msg = "자세한 내용은 블로그에서 확인하세요"
    bb = d.textbbox((0, 0), msg, font=f)
    d.text(((W - (bb[2] - bb[0])) / 2 - bb[0], 760 + LOGO.height + 90), msg, font=f, fill=(74, 55, 40))
    f2 = ImageFont.truetype(FONT_R, 40)
    msg2 = "ON글터 영어 국어 전문학원"
    bb = d.textbbox((0, 0), msg2, font=f2)
    d.text(((W - (bb[2] - bb[0])) / 2 - bb[0], 760 + LOGO.height + 180), msg2, font=f2, fill=(140, 120, 100))
    return img

# ---------- captions -----------------------------------------------------
BROWN = (74, 55, 40)
CORAL = (226, 110, 82)
CAPTIONS = [
    # text,            t0,  t1,   anchor x (center), y (center), color, size
    ("과거완료  had p.p",  1.0, 4.0, 540, 380, BROWN, 78),
    ("Mina smiled",      5.0, 8.0, 300, 300, BROWN, 76),
    ("the letter",       9.0, 12.0, 790, 300, BROWN, 76),
    ("had written",     13.0, 16.0, 540, 1700, CORAL, 92),
    ("years ago",       17.0, 20.0, 800, 1780, BROWN, 76),
]
_cache = {}
def caption_sprite(text, color, size):
    key = (text, color, size)
    if key in _cache:
        return _cache[key]
    f = ImageFont.truetype(FONT_B, size)
    d = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    bb = d.textbbox((0, 0), text, font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    pad = 40
    layer = Image.new("RGBA", (tw + 2 * pad, th + 2 * pad), (0, 0, 0, 0))
    # soft white glow for legibility over the watercolor
    glow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.text((pad - bb[0], pad - bb[1]), text, font=f, fill=(255, 250, 240, 230))
    glow = glow.filter(ImageFilter.GaussianBlur(14))
    layer = Image.alpha_composite(layer, glow)
    layer = Image.alpha_composite(layer, glow)
    d = ImageDraw.Draw(layer)
    d.text((pad - bb[0], pad - bb[1]), text, font=f, fill=color + (255,))
    _cache[key] = layer
    return layer

def draw_captions(img, t):
    out = None
    for text, t0, t1, cx, cy, color, size in CAPTIONS:
        if t < t0 - 0.05 or t > t1 + 0.05:
            continue
        fade = 0.7
        a = min(1.0, (t - t0) / fade, (t1 - t) / fade)
        a = max(0.0, a)
        if a <= 0:
            continue
        a = ease(a)
        dy = 9 * math.sin(2 * math.pi * (t - t0) / 3.2)
        sp = caption_sprite(text, color, size)
        if out is None:
            out = img.convert("RGBA")
        s = sp.copy()
        alpha = s.getchannel("A").point(lambda v: int(v * a))
        s.putalpha(alpha)
        out.alpha_composite(s, (int(cx - sp.width / 2), int(cy - sp.height / 2 + dy)))
    return out.convert("RGB") if out is not None else img

# ---------- timeline -----------------------------------------------------
def blend(a, b, w):
    return Image.blend(a, b, w)

def frame(t):
    if t < 9.75:
        img = warm_glow(clip1(t), t)
    elif t < 10.25:                                 # 0.5 s dissolve clip1 -> clip2
        w = ease((t - 9.75) / 0.5)
        img = blend(warm_glow(clip1(t), t), warm_glow(clip2(t), t), w)
    elif t < 19.75:
        img = warm_glow(clip2(t), t)
    elif t < 20.5:                                  # 0.75 s dissolve -> logo
        w = ease((t - 19.75) / 0.75)
        img = blend(warm_glow(clip2(t), t), outro_frame(t), w)
    else:
        img = outro_frame(t)
    return draw_captions(img, t)

# ---------- BGM : soft piano-like arpeggio, ~72 BPM ----------------------
def make_bgm(path, dur=DUR, sr=44100):
    bpm = 72
    eighth = 60 / bpm / 2
    def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
    # C major: C  Am  F  G  (warm mid register), arpeggiated
    chords = [[48, 55, 60, 64, 67], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62]]
    pattern = [0, 2, 3, 4, 3, 2, 1, 2]
    total = int(dur * sr)
    out = np.zeros(total, dtype=np.float64)
    t_note = 0.0
    bar = 0
    rng = np.random.default_rng(7)
    while t_note < dur - 0.5:
        ch = chords[bar % 4]
        for k, idx in enumerate(pattern):
            start = t_note + k * eighth
            if start >= dur - 0.5:
                break
            n = ch[idx] + (12 if k in (3, 4) else 0)
            f0 = midi(n)
            length = eighth * 3.2
            N = int(length * sr)
            tt = np.arange(N) / sr
            env = np.exp(-tt * 2.6) * (1 - np.exp(-tt * 400))
            vel = 0.55 + 0.12 * rng.random() - (0.1 if k % 2 else 0)
            tone = (np.sin(2 * np.pi * f0 * tt)
                    + 0.45 * np.sin(2 * np.pi * 2 * f0 * tt) * np.exp(-tt * 1.5)
                    + 0.18 * np.sin(2 * np.pi * 3 * f0 * tt) * np.exp(-tt * 3)
                    + 0.08 * np.sin(2 * np.pi * 4 * f0 * tt) * np.exp(-tt * 5))
            s0 = int(start * sr)
            seg = (tone * env * vel)[: total - s0]
            out[s0:s0 + len(seg)] += seg
        # soft sustained pad under each bar
        N = int(eighth * 8 * sr)
        tt = np.arange(N) / sr
        padenv = np.minimum(tt / 0.8, 1.0) * np.minimum((eighth * 8 - tt) / 0.8, 1.0)
        pad = sum(np.sin(2 * np.pi * midi(n - 12) * tt) for n in ch[:3]) * 0.06 * padenv
        s0 = int(t_note * sr)
        seg = pad[: total - s0]
        out[s0:s0 + len(seg)] += seg
        t_note += eighth * 8
        bar += 1
    # simple reverb: a few feedback delays
    rev = out.copy()
    for d_ms, g in ((97, 0.32), (151, 0.26), (223, 0.2), (331, 0.15)):
        d = int(sr * d_ms / 1000)
        rev[d:] += out[:-d] * g
    out = 0.75 * out + 0.45 * rev
    # gentle low-pass (moving average) to soften highs
    k = 6
    out = np.convolve(out, np.ones(k) / k, mode="same")
    # fades
    fi = int(1.5 * sr); fo = int(2.5 * sr)
    out[:fi] *= np.linspace(0, 1, fi)
    out[-fo:] *= np.linspace(1, 0, fo)
    out = out / np.max(np.abs(out)) * 0.28         # quiet, background level
    pcm = (out * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(pcm.tobytes())

# ---------- main ---------------------------------------------------------
if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "video"
    if mode == "stills":
        for t in (0.0, 2.5, 6.5, 10.0, 14.5, 18.5, 21.5):
            frame(t).save(f"still_{t:04.1f}.jpg", quality=90)
        print("stills done")
        sys.exit()
    if mode == "bgm":
        make_bgm("bgm.wav"); print("bgm done"); sys.exit()
    nframes = int(DUR * FPS)
    cmd = ["ffmpeg", "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-i", "bgm.wav",
           "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart",
           sys.argv[2] if len(sys.argv) > 2 else "out.mp4"]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(nframes):
        t = i / FPS
        p.stdin.write(frame(t).tobytes())
        if i % 150 == 0:
            print(f"frame {i}/{nframes}", flush=True)
    p.stdin.close(); p.wait()
    print("video done", p.returncode)
