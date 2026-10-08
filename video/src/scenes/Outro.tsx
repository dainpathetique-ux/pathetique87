import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CLAMP, COLORS, HEIGHT, WIDTH} from '../constants';
import {sparklePath} from '../util';

const Placeholder: React.FC = () => (
  <svg width={620} height={620} viewBox="0 0 620 620">
    <circle cx={310} cy={310} r={290} fill={COLORS.navy} />
    <circle cx={310} cy={310} r={250} fill="none" stroke={COLORS.mint} strokeWidth={10} />
    <text x={310} y={300} textAnchor="middle" fontSize={120} fontWeight={700} fill="#FFFFFF">
      ON글터
    </text>
    <text x={310} y={390} textAnchor="middle" fontSize={44} fontWeight={400} fill={COLORS.mint}>
      영어 · 국어 전문학원
    </text>
  </svg>
);

export const Outro: React.FC<{hasLogo: boolean}> = ({hasLogo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fade = interpolate(frame, [0, 36], [0, 1], CLAMP);
  const grow = spring({frame, fps, config: {damping: 16, stiffness: 70}});
  const scale = interpolate(grow, [0, 1], [0.9, 1]);
  const bgFade = interpolate(frame, [0, 14], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.offWhite, opacity: bgFade}}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{position: 'absolute'}}>
        <circle cx={120} cy={300} r={180} fill="rgba(168,230,207,0.35)" />
        <circle cx={980} cy={1640} r={220} fill="rgba(205,231,255,0.5)" />
        {Array.from({length: 8}, (_, i) => {
          const x = random(`ox${i}`) * WIDTH;
          const y = 200 + random(`oy${i}`) * 1300;
          const op = (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(frame * 0.1 + i))) * fade;
          return <path key={i} d={sparklePath(12 + i * 2)} fill={COLORS.mint} opacity={op} transform={`translate(${x} ${y}) rotate(${frame * 0.6 + i * 40})`} />;
        })}
      </svg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 140}}>
        <div
          style={{
            opacity: fade,
            transform: `scale(${scale})`,
            borderRadius: 32,
            background: '#FFFFFF',
            padding: 28,
            boxShadow: '0 24px 60px rgba(31,42,68,0.14)',
          }}
        >
          {hasLogo ? (
            <Img src={staticFile('로고.jpg')} style={{width: 720, display: 'block', borderRadius: 18}} />
          ) : (
            <Placeholder />
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
