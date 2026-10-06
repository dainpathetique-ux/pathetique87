import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP} from '../constants';
import {G, SERIF} from './constants';

const fade = (f: number, from: number, to: number, ramp = 20) =>
  Math.min(interpolate(f, [from, from + ramp], [0, 1], CLAMP), interpolate(f, [to - ramp, to], [1, 0], CLAMP));

const Title: React.FC<{frame: number}> = ({frame}) => {
  const op = fade(frame, 0, 150, 22);
  const rise = interpolate(frame, [0, 40], [24, 0], CLAMP);
  const spacing = interpolate(frame, [0, 60], [14, 6], CLAMP);
  return (
    <div style={{opacity: op, transform: `translateY(${rise}px)`, textAlign: 'center', color: G.ink}}>
      <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 92, letterSpacing: spacing, textShadow: '0 2px 18px rgba(255,250,240,0.9)'}}>
        빙그레의 영역
      </div>
      <div style={{width: 90, height: 2, background: G.inkSoft, opacity: 0.6, margin: '22px auto'}} />
      <div style={{fontFamily: SERIF, fontWeight: 400, fontSize: 44, letterSpacing: 10, color: G.inkSoft, textShadow: '0 2px 14px rgba(255,250,240,0.9)'}}>
        김소연
      </div>
    </div>
  );
};

const Quote: React.FC<{frame: number}> = ({frame}) => {
  const op = fade(frame, 150, 600, 24);
  const line1 = interpolate(frame, [155, 195], [0, 1], CLAMP);
  const line2 = interpolate(frame, [200, 240], [0, 1], CLAMP);
  const lineStyle = (p: number): React.CSSProperties => ({
    opacity: p,
    transform: `translateY(${(1 - p) * 14}px)`,
    fontFamily: SERIF,
    fontWeight: 400,
    fontSize: 50,
    lineHeight: 1.7,
    color: G.ink,
    letterSpacing: 0.5,
    wordBreak: 'keep-all',
  });
  return (
    <div
      style={{
        opacity: op,
        padding: '30px 44px',
        borderRadius: 26,
        background: 'rgba(255,250,240,0.62)',
        boxShadow: '0 10px 40px rgba(62,42,30,0.12)',
        textAlign: 'center',
        maxWidth: 1000,
        whiteSpace: 'nowrap',
      }}
    >
      <div style={lineStyle(line1)}>선물은 주고받는 물건이 아니라,</div>
      <div style={lineStyle(line2)}>온기와 마음이 차오르는 사건입니다.</div>
    </div>
  );
};

export const GiftSubtitles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 140, pointerEvents: 'none'}}>
      {frame < 150 ? <Title frame={frame} /> : null}
      {frame >= 150 && frame < 600 ? <Quote frame={frame} /> : null}
    </AbsoluteFill>
  );
};
