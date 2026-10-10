import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CLAMP, FONT_FAMILY, SCENE, SCENE_FADE} from '../constants';
import {loadFonts} from '../fonts';
import {SubtitleTrack, type Cue} from '../Subtitles';
import {Outro} from '../scenes/Outro';
import {SnIntro} from './scenes/SnIntro';
import {SnFirst} from './scenes/SnFirst';
import {SnMiddle} from './scenes/SnMiddle';
import {SnEnd} from './scenes/SnEnd';
import {SN_VOICE_CUES} from './voiceCues';

export type SnShortsProps = {
  hasBgm: boolean;
  hasLogo: boolean;
};

loadFonts();

const len = (s: {from: number; to: number}) => s.to - s.from;

// sn 은 영어 단어 끝에 오지 않으므로 끝소리 자리는 "없다"는 것을 보여 준다.
const CUES: Cue[] = [
  {from: SCENE.intro.from, to: SCENE.intro.to, text: '오늘의 소리: 이중자음 sn', position: 'top', size: 64},
  {from: 150, to: 255, text: '첫소리: Snake (/sneɪk/) - 스네이크 (뱀)', position: 'bottom'},
  {from: 255, to: 360, text: '첫소리: Snail (/sneɪl/) - 스네일 (달팽이)', position: 'bottom'},
  {from: 360, to: 465, text: '중간소리: Parsnip (/ˈpɑːrsnɪp/) - 파스닙 (뿌리채소)', position: 'bottom'},
  {from: 465, to: 570, text: '중간소리: Gingersnap (/ˈdʒɪndʒərsnæp/) - 진저스냅 (생강 쿠키)', position: 'bottom', size: 48},
  {from: 570, to: 750, text: '끝소리: 없어요! - sn으로 끝나는 영어 단어는 없어요', position: 'bottom'},
  {from: 750, to: 900, text: '언어의 깊이를 더하는 배움터 | ON글터영어국어학원', position: 'bottom', size: 46},
];

const BGM_LEVEL = 0.5; // BGM 기본 음량
const DUCK_DEPTH = 0.65; // 내레이션 중 BGM 감쇠 비율
const DUCK_RAMP = 6;

export const SnShorts: React.FC<SnShortsProps> = ({hasBgm, hasLogo}) => {
  const frame = useCurrentFrame();
  const duck = Math.max(
    0,
    ...SN_VOICE_CUES.map((c) =>
      interpolate(
        frame,
        [c.from - DUCK_RAMP, c.from, c.from + c.durationInFrames, c.from + c.durationInFrames + DUCK_RAMP],
        [0, 1, 1, 0],
        CLAMP,
      ),
    ),
  );
  const bgmVolume = BGM_LEVEL * (1 - DUCK_DEPTH * duck) * interpolate(frame, [840, 900], [1, 0], CLAMP);

  return (
    <AbsoluteFill style={{fontFamily: FONT_FAMILY, backgroundColor: '#FFFFFF'}}>
      <Sequence name="1. 인트로 (눈사람)" from={SCENE.intro.from} durationInFrames={len(SCENE.intro) + SCENE_FADE}>
        <SnIntro />
      </Sequence>
      <Sequence name="2. 첫소리 (뱀·달팽이)" from={SCENE.first.from} durationInFrames={len(SCENE.first) + SCENE_FADE}>
        <SnFirst />
      </Sequence>
      <Sequence name="3. 중간소리 (파스닙·진저스냅)" from={SCENE.middle.from} durationInFrames={len(SCENE.middle) + SCENE_FADE}>
        <SnMiddle />
      </Sequence>
      <Sequence name="4. 끝소리 (없음)" from={SCENE.end.from} durationInFrames={len(SCENE.end) + SCENE_FADE}>
        <SnEnd />
      </Sequence>
      <Sequence name="5. 아웃트로" from={SCENE.outro.from} durationInFrames={len(SCENE.outro)}>
        <Outro hasLogo={hasLogo} />
      </Sequence>

      <SubtitleTrack cues={CUES} mark="sn" />

      {SN_VOICE_CUES.map((c) => (
        <Sequence key={c.src} name={`🎙 ${c.text}`} from={c.from} durationInFrames={c.durationInFrames}>
          <Audio src={staticFile(c.src)} />
        </Sequence>
      ))}

      {hasBgm ? <Audio src={staticFile('bgm.mp3')} loop volume={bgmVolume} /> : null}
    </AbsoluteFill>
  );
};
