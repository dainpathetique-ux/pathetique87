import json, sherpa_onnx, soundfile as sf, numpy as np, subprocess, os
M='models/vits-mimic3-ko_KO-kss_low'
cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f'{M}/ko_KO-kss_low.onnx', tokens=f'{M}/tokens.txt', data_dir=f'{M}/espeak-ng-data'), num_threads=4), max_num_sentences=1)
tts = sherpa_onnx.OfflineTts(cfg)
segs = json.load(open('script.json'))
os.makedirs('seg', exist_ok=True)
meta=[]
SR=22050
gap = np.zeros(int(0.45*SR), dtype=np.float32)
for s in segs:
    a = tts.generate(s['say'], sid=0, speed=0.92)
    samp = np.array(a.samples, dtype=np.float32)
    # 세그먼트 끝에 짧은 숨 고르기
    pause=np.zeros(int(float(s.get('pause',0.4))*a.sample_rate),dtype=np.float32); out=np.concatenate([samp,pause])
    fn=f"seg/{s['id']:02d}.wav"
    sf.write(fn, out, a.sample_rate)
    dur=len(out)/a.sample_rate
    meta.append({**s,'wav':fn,'dur':round(dur,3),'sr':a.sample_rate})
json.dump(meta, open('meta.json','w'), ensure_ascii=False, indent=1)
print('total', round(sum(m['dur'] for m in meta),2),'s')
for m in meta: print(m['id'], m['dur'], m['slide'])
