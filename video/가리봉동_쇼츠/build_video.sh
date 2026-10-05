#!/usr/bin/env bash
# 사용: bash build_video.sh <배경 일러스트 9:16 이미지>  → 가리봉동_쇼츠.mp4 (1080x1920, 30fps, 22.5초)
set -euo pipefail
cd "$(dirname "$0")"
BG="${1:-bg.jpg}"
FPS=30; D1=10; D2=10; XF=0.5; OUT=3.5
ffmpeg -y -hide_banner -loglevel error \
  -i "$BG" -i "$BG" \
  -loop 1 -t 6   -i sub1.png \
  -loop 1 -t 15  -i sub2.png \
  -loop 1 -t $OUT -i outro.png \
  -f lavfi -t 23 -i "anoisesrc=color=pink:amplitude=0.6:seed=7" \
  -filter_complex "
  [0:v]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,
       zoompan=z='1+0.12*on/($D1*$FPS-1)':x='0.35*iw*(1-1/zoom)':y='0.62*ih*(1-1/zoom)':d=$D1*$FPS:s=1080x1920:fps=$FPS,
       format=yuv420p[c1];
  [1:v]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,
       zoompan=z='1.15':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)*on/($D2*$FPS-1)':d=$D2*$FPS:s=1080x1920:fps=$FPS,
       format=yuv420p[c2];
  [c1][c2]xfade=transition=fade:duration=$XF:offset=$(echo "$D1-$XF"|bc)[body];
  [2:v]format=rgba,fade=in:st=0.4:d=0.5:alpha=1,fade=out:st=4.6:d=0.4:alpha=1[s1];
  [3:v]format=rgba,fade=in:st=0.3:d=0.5:alpha=1,fade=out:st=13.6:d=0.4:alpha=1[s2];
  [body][s1]overlay=0:0:enable='lt(t,5.2)'[b1];
  [b1][s2]overlay=0:0:enable='gte(t,5.2)':eof_action=pass[b2];
  [4:v]scale=1080:1920,format=yuv420p,fps=$FPS[o];
  [b2][o]xfade=transition=fade:duration=$XF:offset=$(echo "$D1+$D2-2*$XF"|bc)[v];
  [5:a]highpass=f=400,lowpass=f=5000,tremolo=f=0.35:d=0.25,volume=-27dB,afade=t=in:d=1.5,afade=t=out:st=20.5:d=2,atrim=0:22.5[a]
  " -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart -shortest 가리봉동_쇼츠.mp4
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate,codec_name -of default=nw=1 가리봉동_쇼츠.mp4
