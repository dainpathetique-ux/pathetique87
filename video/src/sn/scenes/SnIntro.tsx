import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CLAMP, COLORS, HEIGHT, WIDTH} from '../../constants';
import {sceneFadeIn, sparklePath} from '../../util';

const CX = WIDTH / 2;
const GROUND = 1290;

/** 눈송이 (6갈래) */
const Flake: React.FC<{size: number}> = ({size}) => (
  <g stroke="#FFFFFF" strokeWidth={size * 0.16} strokeLinecap="round">
    {[0, 60, 120].map((a) => (
      <line key={a} x1={-size} y1={0} x2={size} y2={0} transform={`rotate(${a})`} />
    ))}
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <g key={a} transform={`rotate(${a}) translate(${size * 0.6} 0)`}>
        <line x1={0} y1={0} x2={size * 0.28} y2={-size * 0.24} />
        <line x1={0} y1={0} x2={size * 0.28} y2={size * 0.24} />
      </g>
    ))}
  </g>
);

const FLAKES = Array.from({length: 44}, (_, i) => ({
  x0: random(`fx${i}`) * WIDTH,
  y0: random(`fy${i}`) * HEIGHT,
  vy: 1.6 + random(`fv${i}`) * 2.2,
  sway: 14 + random(`fs${i}`) * 26,
  phase: random(`fp${i}`) * Math.PI * 2,
  size: 8 + random(`fz${i}`) * 16,
  shape: i % 3 === 0 ? 'flake' : 'dot',
  rot: (random(`fr${i}`) - 0.5) * 2,
}));

/** 눈사람 캐릭터: 몸 흔들기 + 팔 인사 + 눈 깜빡임 + 목도리 펄럭임 */
const Snowman: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 9, stiffness: 110, mass: 0.9}});
  const sway = Math.sin((frame / fps) * Math.PI * 2 * 0.4) * 3.5;
  const headTilt = Math.sin((frame / fps) * Math.PI * 2 * 0.6 + 0.8) * 5;
  const wave = Math.sin((frame / fps) * Math.PI * 2 * 1.1) * 16;
  const scarf = Math.sin((frame / fps) * Math.PI * 2 * 0.9) * 8;

  // 80프레임마다 6프레임 동안 눈 감기
  const t = frame % 80;
  const eyeScaleY = t < 6 ? Math.max(0.08, Math.abs(t - 3) / 3) : 1;

  const bodyY = GROUND - 200;
  const headY = bodyY - 300;

  return (
    <g>
      <ellipse cx={CX} cy={GROUND + 6} rx={230 * pop} ry={30 * pop} fill="rgba(31,42,68,0.10)" />
      <g style={{transformOrigin: `${CX}px ${GROUND}px`}} transform={`rotate(${sway}) scale(${pop})`}>
        {/* 나뭇가지 팔 */}
        <g stroke="#7A5232" strokeWidth={14} strokeLinecap="round" fill="none">
          <g transform={`rotate(${-12 + wave} ${CX - 170} ${bodyY - 60})`}>
            <path d={`M ${CX - 170} ${bodyY - 60} L ${CX - 330} ${bodyY - 170}`} />
            <path d={`M ${CX - 285} ${bodyY - 140} L ${CX - 310} ${bodyY - 205}`} />
          </g>
          <g transform={`rotate(${8 - wave * 0.4} ${CX + 170} ${bodyY - 60})`}>
            <path d={`M ${CX + 170} ${bodyY - 60} L ${CX + 330} ${bodyY - 130}`} />
            <path d={`M ${CX + 280} ${bodyY - 108} L ${CX + 320} ${bodyY - 165}`} />
          </g>
        </g>
        {/* 몸통 */}
        <circle cx={CX} cy={bodyY} r={205} fill="#FFFFFF" stroke="#D6E6F5" strokeWidth={10} />
        <ellipse cx={CX - 80} cy={bodyY - 95} rx={60} ry={30} fill="rgba(214,230,245,0.55)" transform={`rotate(-25 ${CX - 80} ${bodyY - 95})`} />
        {[-60, 20, 100].map((dy) => (
          <circle key={dy} cx={CX} cy={bodyY + dy} r={17} fill="#34406B" />
        ))}

        {/* 머리 */}
        <g style={{transformOrigin: `${CX}px ${headY + 120}px`}} transform={`rotate(${headTilt})`}>
          <circle cx={CX} cy={headY} r={150} fill="#FFFFFF" stroke="#D6E6F5" strokeWidth={10} />
          {/* 볼터치 */}
          <circle cx={CX - 92} cy={headY + 38} r={26} fill="#FF9AA2" opacity={0.75} />
          <circle cx={CX + 92} cy={headY + 38} r={26} fill="#FF9AA2" opacity={0.75} />
          {/* 눈 */}
          {[-52, 52].map((dx) => (
            <g key={dx} transform={`translate(${CX + dx} ${headY - 25}) scale(1 ${eyeScaleY})`}>
              <ellipse cx={0} cy={0} rx={16} ry={24} fill="#2B2B3A" />
              <circle cx={6} cy={-8} r={6} fill="#FFFFFF" />
            </g>
          ))}
          {/* 당근 코 */}
          <path d={`M ${CX - 6} ${headY + 4} L ${CX + 98} ${headY + 26} L ${CX - 6} ${headY + 40} Z`} fill="#FF8A3D" stroke="#E56A1F" strokeWidth={4} strokeLinejoin="round" />
          {/* 입 (점 미소) */}
          {[-48, -24, 0, 24, 48].map((dx, i) => (
            <circle key={dx} cx={CX + dx} cy={headY + 72 + (i === 0 || i === 4 ? -10 : i === 2 ? 6 : 0)} r={8} fill="#2B2B3A" />
          ))}
          {/* 털모자 */}
          <path d={`M ${CX - 140} ${headY - 70} Q ${CX} ${headY - 290} ${CX + 140} ${headY - 70} Z`} fill={COLORS.mint} />
          <rect x={CX - 150} y={headY - 92} width={300} height={46} rx={23} fill="#7FD1B9" />
          <circle cx={CX + 10} cy={headY - 215} r={34} fill="#FFFFFF" stroke="#D6E6F5" strokeWidth={5} />
        </g>

        {/* 목도리 */}
        <rect x={CX - 150} y={headY + 118} width={300} height={56} rx={28} fill={COLORS.coral} />
        <g transform={`rotate(${scarf} ${CX + 80} ${headY + 160})`}>
          <rect x={CX + 52} y={headY + 150} width={60} height={150} rx={22} fill="#F05A38" />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={CX + 60 + i * 20} y1={headY + 296} x2={CX + 60 + i * 20} y2={headY + 318} stroke="#F05A38" strokeWidth={8} strokeLinecap="round" />
          ))}
        </g>
      </g>
    </g>
  );
};

export const SnIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #E6F5FF 0%, #BFE2FA 100%)',
        opacity: sceneFadeIn(frame),
      }}
    >
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <circle cx={160} cy={430} r={220} fill="rgba(255,255,255,0.35)" />
        <circle cx={900} cy={560} r={130} fill="rgba(255,255,255,0.3)" />

        {/* 눈 덮인 언덕 */}
        <path d={`M0 ${GROUND - 20} Q ${WIDTH * 0.3} ${GROUND - 90} ${WIDTH * 0.6} ${GROUND - 30} T ${WIDTH} ${GROUND - 40} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`} fill="#FFFFFF" />
        <path d={`M0 ${GROUND + 160} Q ${WIDTH * 0.5} ${GROUND + 90} ${WIDTH} ${GROUND + 170} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`} fill="#EEF6FD" />

        {/* 반짝이 */}
        {[{x: 140, y: 760, s: 22}, {x: 950, y: 820, s: 26}, {x: 880, y: 360, s: 18}, {x: 210, y: 1180, s: 16}].map((sp, i) => {
          const appear = spring({frame: frame - 12 - i * 6, fps, config: {damping: 10, stiffness: 140}});
          const tw = 0.55 + 0.45 * Math.sin(frame * 0.14 + i * 1.7);
          return (
            <path
              key={i}
              d={sparklePath(sp.s)}
              fill="#FFFFFF"
              opacity={appear * tw}
              transform={`translate(${sp.x} ${sp.y}) rotate(${frame * 0.6 + i * 30}) scale(${0.7 + 0.5 * tw})`}
            />
          );
        })}

        <Snowman frame={frame} />

        {/* 내리는 눈 (캐릭터 앞) */}
        {FLAKES.map((f, i) => {
          const y = ((f.y0 + frame * f.vy) % (HEIGHT + 60)) - 30;
          const x = f.x0 + Math.sin(frame * 0.04 + f.phase) * f.sway;
          const op = interpolate(frame, [0, 10], [0, 1], CLAMP) * 0.9;
          return f.shape === 'flake' ? (
            <g key={i} opacity={op} transform={`translate(${x} ${y}) rotate(${frame * f.rot})`}>
              <Flake size={f.size} />
            </g>
          ) : (
            <circle key={i} cx={x} cy={y} r={f.size * 0.42} fill="#FFFFFF" opacity={op} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
