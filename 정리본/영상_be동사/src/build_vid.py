import json, subprocess, os
meta=json.load(open('meta.json'))
os.makedirs('clips',exist_ok=True)
clips=[]
for m in meta:
    img=f"frames/{m['slide']}.png"; wav=m['wav']; out=f"clips/{m['id']:02d}.mp4"
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-loop','1','-i',img,'-i',wav,
      '-c:v','libx264','-tune','stillimage','-pix_fmt','yuv420p','-r','25',
      '-vf','scale=1920:1080','-c:a','aac','-b:a','160k','-ar','44100','-shortest',out],check=True)
    clips.append(out)
open('concat.txt','w').write('\n'.join(f"file '{c}'" for c in clips))
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i','concat.txt',
  '-c','copy','be_verb_3min.mp4'],check=True)
print('done')
