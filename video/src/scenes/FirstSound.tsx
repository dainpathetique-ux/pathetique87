import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CLAMP, COLORS, HEIGHT, WIDTH} from '../constants';
import {heartPath, sceneFadeIn} from '../util';

const GROUND = 1130;
const SWITCH = 105; // Small → Smile 전환 (로컬 프레임)

/** 굴러가는 공 (패치 무늬로 회전이 보이게) */
const Ball: React.FC<{cx: number; cy: number; r: number; rot: number; color: string; patch: string; sx?: number; sy?: number}> = ({
  cx, cy, r, rot, color, patch, sx = 1, sy = 1,
}) => (
  <g transform={`translate(${cx} ${cy}) scale(${sx} ${sy})`}>
    <circle r={r} fill={color} />
    <g transform={`rotate(${rot})`}>
      <circle cx={0} cy={-r * 0.55} r={r * 0.28} fill={patch} />
      <circle cx={r * 0.5} cy={r * 0.3} r={r * 0.18} fill={patch} />
      <circle cx={-r * 0.5} cy={r * 0.32} r={r * 0.14} fill={patch} />
    </g>
    <ellipse cx={-r * 0.38} cy={-r * 0.42} rx={r * 0.26} ry={r * 0.14} fill="rgba(255,255,255,0.55)" transform={`rotate(-30)`} />
    <circle r={r} fill="none" stroke="rgba(31,42,68,0.12)" strokeWidth={4} />
  </g>
);

const Label: React.FC<{x: number; y: number; text: string; size: number; opacity: number}> = ({x, y, text, size, opacity}) => (
  <g opacity={opacity}>
    <rect x={x - size * 1.5} y={y - size * 0.75} width={size * 3} height={size * 1.5} rx={size * 0.75} fill="#FFFFFF" opacity={0.9} />
    <text x={x} y={y + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={700} fill={COLORS.ink}>
      {text}
    </text>
  </g>
);

const BallsPart: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  // 큰 공: 왼쪽에서 굴러 들어온다
  const bigR = 190;
  const bigX = interpolate(frame, [0, 45], [-320, 330], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const bigRot = ((bigX + 320) / (2 * Math.PI * bigR)) * 360;
  const bigWobble = Math.sin(frame * 0.25) * interpolate(frame, [40, 60], [3, 0], CLAMP);

  // 작은 공: 통통 튀며 등장
  const smallR = 62;
  const t = frame - 28;
  const h = t < 0 ? 0 : 300 * Math.exp(-t / 45) * Math.abs(Math.sin(t * 0.17));
  const smallScale = spring({frame: t, fps, config: {damping: 8, stiffness: 150}});
  const squash = interpolate(h, [0, 25], [0.8, 1], CLAMP);
  const smallX = interpolate(t, [0, 60], [900, 690], {...CLAMP, easing: Easing.out(Easing.quad)});
  const smallRot = -t * 6;

  const labelIn = interpolate(frame, [50, 70], [0, 1], CLAMP);

  // 전환 직전 축소/페이드
  const out = interpolate(frame, [SWITCH - 12, SWITCH + 2], [1, 0], CLAMP);
  const outScale = interpolate(out, [0, 1], [0.85, 1]);

  return (
    <g opacity={out} transform={`translate(${WIDTH / 2} ${GROUND}) scale(${outScale}) translate(${-WIDTH / 2} ${-GROUND})`}>
      {/* 바닥 */}
      <path d={`M0 ${GROUND + 10} Q ${WIDTH / 2} ${GROUND - 30} ${WIDTH} ${GROUND + 10} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`} fill="rgba(255,255,255,0.45)" />
      <ellipse cx={bigX} cy={GROUND + 12} rx={bigR * 1.05} ry={26} fill="rgba(31,42,68,0.10)" />
      <ellipse cx={smallX} cy={GROUND + 10} rx={smallR * interpolate(h, [0, 200], [1.1, 0.6], CLAMP)} ry={12} fill="rgba(31,42,68,0.10)" opacity={smallScale} />

      <Ball cx={bigX} cy={GROUND - bigR + bigWobble} r={bigR} rot={bigRot} color="#8EC5FF" patch="#5A9BF0" />
      <Ball
        cx={smallX}
        cy={GROUND - smallR * squash - h}
        r={smallR}
        rot={smallRot}
        color="#FFA6CF"
        patch="#F06AA8"
        sx={smallScale * (2 - squash)}
        sy={smallScale * squash}
      />

      <Label x={bigX} y={GROUND - bigR * 2 - 70} text="Big" size={44} opacity={labelIn} />
      <Label x={smallX} y={GROUND - smallR * 2 - 60} text="Small" size={44} opacity={labelIn} />
    </g>
  );
};

const BURST = Array.from({length: 14}, (_, i) => ({
  angle: (i / 14) * Math.PI * 2 + random(`ba${i}`) * 0.4,
  dist: 330 + random(`bd${i}`) * 140,
  size: 0.75 + random(`bs${i}`) * 0.6,
  kind: i % 2 === 0 ? 'heart' : 'note',
  color: i % 4 === 0 ? '#FF6B8B' : i % 4 === 1 ? '#FF9F6B' : i % 4 === 2 ? '#7FD1B9' : '#8EC5FF',
  delay: random(`bt${i}`) * 6,
}));

const NotePath: React.FC = () => (
  <g>
    <ellipse cx={-6} cy={22} rx={16} ry={11} transform="rotate(-20 -6 22)" />
    <rect x={6} y={-34} width={7} height={58} rx={3} />
    <path d="M13,-34 C 30,-30 36,-14 22,0 C 30,-12 24,-20 13,-22 Z" />
  </g>
);

const SmilePart: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const t = frame - SWITCH;
  if (t < 0) return null;
  const pop = spring({frame: t, fps, config: {damping: 7, stiffness: 120, mass: 0.9}});
  const bob = Math.sin(t * 0.12) * 14;
  const cx = WIDTH / 2;
  const cy = 1000;
  const ring = interpolate(t, [0, 30], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const ring2 = interpolate(t, [8, 42], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});

  return (
    <g>
      {/* 팡 터지는 링 */}
      <circle cx={cx} cy={cy} r={200 + ring * 420} fill="none" stroke="#FFB84C" strokeWidth={10 * (1 - ring)} opacity={1 - ring} />
      <circle cx={cx} cy={cy} r={200 + ring2 * 380} fill="none" stroke="#FF8FA3" strokeWidth={8 * (1 - ring2)} opacity={1 - ring2} />

      {/* 하트/음표 입자 */}
      {BURST.map((p, i) => {
        const pt = t - p.delay;
        const d = interpolate(pt, [0, 40], [60, p.dist], {...CLAMP, easing: Easing.out(Easing.cubic)});
        const drift = Math.sin(pt * 0.1 + i) * 14;
        const op = interpolate(pt, [0, 8, 70, 100], [0, 1, 1, 0], CLAMP);
        const sc = p.size * interpolate(pt, [0, 12], [0.2, 1], {...CLAMP, easing: Easing.out(Easing.back(2))});
        const x = cx + Math.cos(p.angle) * d;
        const y = cy + Math.sin(p.angle) * d * 0.9 - pt * 1.4 + drift;
        const rot = Math.sin(pt * 0.08 + i) * 18;
        return (
          <g key={i} opacity={op} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} fill={p.color}>
            {p.kind === 'heart' ? <path d={heartPath} /> : <NotePath />}
          </g>
        );
      })}

      {/* 환한 미소 아이콘 */}
      <g style={{transformOrigin: `${cx}px ${cy}px`}} transform={`translate(0 ${bob}) scale(${pop})`}>
        <circle cx={cx} cy={cy} r={200} fill={COLORS.sun} stroke={COLORS.sunEdge} strokeWidth={12} />
        <ellipse cx={cx - 85} cy={cy - 110} rx={56} ry={30} fill="rgba(255,255,255,0.45)" transform={`rotate(-25 ${cx - 85} ${cy - 110})`} />
        <circle cx={cx - 125} cy={cy + 30} r={32} fill="#FF9AA2" opacity={0.8} />
        <circle cx={cx + 125} cy={cy + 30} r={32} fill="#FF9AA2" opacity={0.8} />
        {/* 웃는 눈 ^ ^ */}
        {[-70, 70].map((dx) => (
          <path
            key={dx}
            d={`M ${cx + dx - 34} ${cy - 40} Q ${cx + dx} ${cy - 92} ${cx + dx + 34} ${cy - 40}`}
            stroke="#3B2F2F"
            strokeWidth={14}
            strokeLinecap="round"
            fill="none"
          />
        ))}
        {/* 활짝 웃는 입 */}
        <path d={`M ${cx - 118} ${cy + 40} Q ${cx} ${cy + 230} ${cx + 118} ${cy + 40} Z`} fill="#3B2F2F" />
        <path d={`M ${cx - 100} ${cy + 46} Q ${cx} ${cy + 86} ${cx + 100} ${cy + 46} L ${cx + 100} ${cy + 58} Q ${cx} ${cy + 100} ${cx - 100} ${cy + 58} Z`} fill="#FFFFFF" />
        <path d={`M ${cx - 62} ${cy + 118} Q ${cx} ${cy + 180} ${cx + 62} ${cy + 118} Q ${cx} ${cy + 150} ${cx - 62} ${cy + 118} Z`} fill="#FF6F7A" />
      </g>
    </g>
  );
};

export const FirstSound: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.creamLight} 0%, ${COLORS.cream} 100%)`,
        opacity: sceneFadeIn(frame),
      }}
    >
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <circle cx={900} cy={380} r={200} fill="rgba(255,255,255,0.35)" />
        <circle cx={140} cy={620} r={110} fill="rgba(255,255,255,0.3)" />
        <BallsPart frame={frame} />
        <SmilePart frame={frame} />
      </svg>
    </AbsoluteFill>
  );
};
