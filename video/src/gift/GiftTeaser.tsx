import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CLAMP} from '../constants';
import {loadFonts} from '../fonts';
import {DeskScene} from './DeskScene';
import {GiftSubtitles} from './GiftSubtitles';
import {GiftOutro} from './GiftOutro';
import {GIFT_FRAMES} from './constants';

export type GiftTeaserProps = {hasLogo: boolean; hasBgm: boolean};

loadFonts();

const OUTRO_FROM = 600; // 0:20

export const GiftTeaser: React.FC<GiftTeaserProps> = ({hasLogo, hasBgm}) => {
  const frame = useCurrentFrame();
  // 0~20초 장면: 시작 페이드인, 끝에서 아웃트로가 위로 페이드인
  const sceneIn = interpolate(frame, [0, 24], [0, 1], CLAMP);
  const bgm = interpolate(frame, [0, 45, 615, GIFT_FRAMES], [0, 0.7, 0.7, 0], CLAMP);
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Sequence from={0} durationInFrames={OUTRO_FROM + 20}>
        <AbsoluteFill style={{opacity: sceneIn}}>
          <DeskScene />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={0} durationInFrames={OUTRO_FROM}>
        <GiftSubtitles />
      </Sequence>
      <Sequence from={OUTRO_FROM} durationInFrames={GIFT_FRAMES - OUTRO_FROM}>
        <GiftOutro hasLogo={hasLogo} />
      </Sequence>
      {hasBgm ? <Audio src={staticFile('gift/bgm.mp3')} volume={bgm} /> : null}
    </AbsoluteFill>
  );
};
