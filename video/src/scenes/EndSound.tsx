import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CLAMP, COLORS, HEIGHT, WIDTH} from '../constants';
import {sceneFadeIn, sparklePath} from '../util';

const RAINBOW = ['#FF595E', '#FF924C', '#FFCA3A', '#8AC926', '#36A2EB', '#4F5BD5', '#9B5DE5'];

const CX = WIDTH / 2 - 40;
const CY = 960;

export const EndSound: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = spring({frame, fps, config: {damping: 12, stiffness: 90}});
  // 회전: 느린 Y축 회전 느낌(가로 압축) + 좌우 흔들림
  const yaw = Math.cos(frame * 0.035);
  const sx = 0.82 + 0.18 * Math.abs(yaw);
  const wobble = Math.sin(frame * 0.045) * 7;
  const depthX = 70 * yaw;
  const depthY = -48;

  // 백색광 → 프리즘
  const beam = interpolate(frame, [8, 40], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  // 무지개 광선 펼침
  const spread = interpolate(frame, [34, 80], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const breathe = 1 + Math.sin(frame * 0.08) * 0.03;

  const front = [
    [0, -210],
    [185, 115],
    [-185, 115],
  ] as const;
  const back = front.map(([x, y]) => [x + depthX, y + depthY] as const);
  const poly = (pts: ReadonlyArray<readonly [number, number]>) => pts.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(170deg, ${COLORS.lavender} 0%, ${COLORS.sky} 100%)`,
        opacity: sceneFadeIn(frame),
      }}
    >
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.85} />
            <stop offset="55%" stopColor="#DCE9FF" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#B9C7FF" stopOpacity={0.55} />
          </linearGradient>
          <linearGradient id="beamGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.95} />
          </linearGradient>
        </defs>

        <circle cx={180} cy={360} r={200} fill="rgba(255,255,255,0.3)" />
        <circle cx={920} cy={1560} r={240} fill="rgba(255,255,255,0.28)" />

        {/* 떠다니는 반짝이 */}
        {Array.from({length: 12}, (_, i) => {
          const x = random(`ex${i}`) * WIDTH;
          const y = random(`ey${i}`) * HEIGHT;
          const s = 10 + random(`es${i}`) * 14;
          const op = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(frame * 0.12 + i));
          return <path key={i} d={sparklePath(s)} fill="#FFFFFF" opacity={op * 0.8} transform={`translate(${x} ${y + Math.sin(frame * 0.03 + i) * 12}) rotate(${frame * 0.5 + i * 30})`} />;
        })}

        <g transform={`translate(${CX} ${CY}) scale(${enter})`}>
          {/* 입사 백색광 */}
          <g opacity={beam}>
            <rect x={-700} y={-16} width={interpolate(beam, [0, 1], [0, 560])} height={32} fill="url(#beamGrad)" filter="url(#glow)" />
            <rect x={-700} y={-6} width={interpolate(beam, [0, 1], [0, 560])} height={12} fill="url(#beamGrad)" />
          </g>

          {/* 무지개 스펙트럼 광선 */}
          <g transform={`translate(110 10) rotate(${wobble * 0.4})`}>
            {RAINBOW.map((c, i) => {
              const angle = -36 + i * 12; // -36° ~ +36°
              const stagger = interpolate(spread, [i * 0.06, 0.6 + i * 0.06], [0, 1], CLAMP);
              const L = stagger * 1000 * breathe;
              const w = 12 + L * 0.075;
              return (
                <g key={c} transform={`rotate(${angle})`} opacity={0.9}>
                  <path d={`M0,0 L${L},${-w} L${L},${w} Z`} fill={c} opacity={0.35} filter="url(#softGlow)" />
                  <path d={`M0,0 L${L},${-w * 0.8} L${L},${w * 0.8} Z`} fill={c} opacity={0.85} />
                </g>
              );
            })}
            {/* 광선을 따라 흐르는 빛 입자 */}
            {RAINBOW.map((c, i) => {
              const angle = ((-36 + i * 12) * Math.PI) / 180;
              const prog = ((frame * 9 + i * 120) % 900) / 900;
              const d = prog * 900 * spread;
              const op = Math.sin(prog * Math.PI) * spread;
              return <circle key={c} cx={Math.cos(angle) * d} cy={Math.sin(angle) * d} r={8} fill="#FFFFFF" opacity={op} />;
            })}
          </g>

          {/* 프리즘 (삼각기둥) */}
          <g transform={`rotate(${wobble}) scale(${sx} 1)`}>
            <polygon points={poly(back)} fill="#C9D5FF" opacity={0.5} stroke="#FFFFFF" strokeWidth={3} />
            {/* 옆면 */}
            <polygon points={`${poly([front[0], front[1]])} ${poly([back[1], back[0]])}`} fill="#DCE6FF" opacity={0.55} stroke="#FFFFFF" strokeWidth={3} />
            <polygon points={`${poly([front[1], front[2]])} ${poly([back[2], back[1]])}`} fill="#B8C6F5" opacity={0.6} stroke="#FFFFFF" strokeWidth={3} />
            <polygon points={`${poly([front[2], front[0]])} ${poly([back[0], back[2]])}`} fill="#E8EEFF" opacity={0.5} stroke="#FFFFFF" strokeWidth={3} />
            {/* 앞면 */}
            <polygon points={poly(front)} fill="url(#glass)" stroke="#FFFFFF" strokeWidth={5} strokeLinejoin="round" />
            <polyline points="-120,70 0,-140" fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
            {/* 내부 빛 맺힘 */}
            <circle cx={20} cy={20} r={60 + Math.sin(frame * 0.15) * 8} fill="#FFFFFF" opacity={0.45 * beam} filter="url(#glow)" />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
