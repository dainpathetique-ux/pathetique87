import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CLAMP, FONT_FAMILY, SCENE, SCENE_FADE} from './constants';
import {loadFonts} from './fonts';
import {Subtitles} from './Subtitles';
import {Intro} from './scenes/Intro';
import {FirstSound} from './scenes/FirstSound';
import {MiddleSound} from './scenes/MiddleSound';
import {EndSound} from './scenes/EndSound';
import {Outro} from './scenes/Outro';
import {VOICE_CUES} from './voiceCues';

export type SmShortsProps = {
  hasBgm: boolean;
  hasLogo: boolean;
};

loadFonts();

const len = (s: {from: number; to: number}) => s.to - s.from;

const BGM_LEVEL = 0.5; // BGM 기본 음량
const DUCK_DEPTH = 0.65; // 내레이션 중 BGM 감쇠 비율
const DUCK_RAMP = 6;

export const SmShorts: React.FC<SmShortsProps> = ({hasBgm, hasLogo}) => {
  const frame = useCurrentFrame();
  // 내레이션이 나오는 동안 BGM을 낮춘다(더킹). 앞뒤 6프레임 램프.
  const duck = Math.max(
    0,
    ...VOICE_CUES.map((c) =>
      interpolate(
        frame,
        [c.from - DUCK_RAMP, c.from, c.from + c.durationInFrames, c.from + c.durationInFrames + DUCK_RAMP],
        [0, 1, 1, 0],
        CLAMP,
      ),
    ),
  );
  // 28~30초 구간 페이드아웃
  const bgmVolume = BGM_LEVEL * (1 - DUCK_DEPTH * duck) * interpolate(frame, [840, 900], [1, 0], CLAMP);

  return (
    <AbsoluteFill style={{fontFamily: FONT_FAMILY, backgroundColor: '#FFFFFF'}}>
      <Sequence name="1. 인트로" from={SCENE.intro.from} durationInFrames={len(SCENE.intro) + SCENE_FADE}>
        <Intro />
      </Sequence>
      <Sequence name="2. 첫소리" from={SCENE.first.from} durationInFrames={len(SCENE.first) + SCENE_FADE}>
        <FirstSound />
      </Sequence>
      <Sequence name="3. 중간소리" from={SCENE.middle.from} durationInFrames={len(SCENE.middle) + SCENE_FADE}>
        <MiddleSound />
      </Sequence>
      <Sequence name="4. 끝소리" from={SCENE.end.from} durationInFrames={len(SCENE.end) + SCENE_FADE}>
        <EndSound />
      </Sequence>
      <Sequence name="5. 아웃트로" from={SCENE.outro.from} durationInFrames={len(SCENE.outro)}>
        <Outro hasLogo={hasLogo} />
      </Sequence>

      <Subtitles />

      {VOICE_CUES.map((c) => (
        <Sequence key={c.src} name={`🎙 ${c.text}`} from={c.from} durationInFrames={c.durationInFrames}>
          <Audio src={staticFile(c.src)} />
        </Sequence>
      ))}

      {hasBgm ? <Audio src={staticFile('bgm.mp3')} loop volume={bgmVolume} /> : null}
    </AbsoluteFill>
  );
};
