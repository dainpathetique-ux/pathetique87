#!/bin/bash
# mix.sh <출력폴더> <결과mp4> : 프레임 + BGM(덕킹) + 내레이션 → mp4
set -e; OUT=$(realpath "$1"); MP4=$2
CUES=$(node -e "const c=require('$OUT/voice/cues.json');let ins='',f='',n=0;c.forEach((x,i)=>{ins+=\` -i \${x.file}\`;f+=\`[\${i+2}:a]adelay=\${Math.round(x.at*1000)}|\${Math.round(x.at*1000)},aformat=sample_rates=44100:channel_layouts=mono[v\${i}];\`;n++});let mixin='';for(let i=0;i<n;i++)mixin+=\`[v\${i}]\`;f+=\`\${mixin}amix=inputs=\${n}:normalize=0,asplit[vo1][vo2];[1:a]aformat=sample_rates=44100:channel_layouts=mono,volume=0.45[bgm];[bgm][vo1]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=400[duck];[duck][vo2]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]\`;console.log(JSON.stringify({ins,f}))")
INS=$(echo "$CUES" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>process.stdout.write(JSON.parse(d).ins))")
FLT=$(echo "$CUES" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>process.stdout.write(JSON.parse(d).f))")
ffmpeg -y -loglevel error -framerate 24 -i "$OUT/frames/f%04d.png" -i "$OUT/bgm.wav" $INS -filter_complex "$FLT" -map 0:v -map "[a]" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 160k -t 30 -movflags +faststart "$MP4"
