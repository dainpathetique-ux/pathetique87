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

export type SmShortsProps = {
  hasBgm: boolean;
  hasLogo: boolean;
};

loadFonts();

const len = (s: {from: number; to: number}) => s.to - s.from;

export const SmShorts: React.FC<SmShortsProps> = ({hasBgm, hasLogo}) => {
  const frame = useCurrentFrame();
  // 28~30초 구간 페이드아웃
  const bgmVolume = interpolate(frame, [840, 900], [1, 0], CLAMP);

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

      {hasBgm ? <Audio src={staticFile('bgm.mp3')} loop volume={bgmVolume} /> : null}
    </AbsoluteFill>
  );
};
