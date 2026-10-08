import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CLAMP, COLORS, FONT_FAMILY} from '../constants';
import {G, SERIF} from './constants';

export const GiftOutro: React.FC<{hasLogo: boolean}> = ({hasLogo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bg = interpolate(frame, [0, 16], [0, 1], CLAMP);
  const logo = interpolate(frame, [6, 34], [0, 1], CLAMP);
  const grow = spring({frame: frame - 6, fps, config: {damping: 16, stiffness: 70}});
  const text = interpolate(frame, [26, 50], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.offWhite, opacity: bg, justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          opacity: logo,
          transform: `scale(${interpolate(grow, [0, 1], [0.92, 1])})`,
          background: '#FFFFFF',
          padding: 28,
          borderRadius: 32,
          boxShadow: '0 24px 60px rgba(31,42,68,0.12)',
        }}
      >
        {hasLogo ? (
          <Img src={staticFile('로고.jpg')} style={{width: 720, display: 'block', borderRadius: 18}} />
        ) : (
          <div style={{width: 720, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 96, color: COLORS.navy}}>
            ON글터
          </div>
        )}
      </div>
      <div
        style={{
          opacity: text,
          transform: `translateY(${(1 - text) * 12}px)`,
          marginTop: 70,
          fontFamily: SERIF,
          fontSize: 44,
          fontWeight: 400,
          letterSpacing: 1,
          color: G.inkSoft,
        }}
      >
        자세한 내용은 블로그에서 확인하세요
      </div>
    </AbsoluteFill>
  );
};
