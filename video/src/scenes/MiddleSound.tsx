import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {CLAMP, COLORS, HEIGHT, WIDTH} from '../constants';
import {petalPath, sceneFadeIn, sparklePath} from '../util';

const SWITCH = 105; // Cosmic → Jasmine 전환 (로컬 프레임)

const STARS = Array.from({length: 70}, (_, i) => ({
  x: random(`stx${i}`) * WIDTH,
  y: random(`sty${i}`) * HEIGHT,
  r: 1.5 + random(`str${i}`) * 3,
  phase: random(`stp${i}`) * Math.PI * 2,
  speed: 0.06 + random(`sts${i}`) * 0.12,
}));

const PLANETS = [
  {rx: 230, ry: 95, r: 30, speed: 0.045, start: 0.4, color: '#A8E6CF', ring: false},
  {rx: 350, ry: 150, r: 42, speed: 0.03, start: 2.4, color: '#CDB4DB', ring: true},
  {rx: 470, ry: 205, r: 24, speed: 0.022, start: 4.6, color: '#FFB5C2', ring: false},
];

const CosmicPart: React.FC<{frame: number}> = ({frame}) => {
  const cx = WIDTH / 2;
  const cy = 940;
  const enter = interpolate(frame, [0, 30], [0.85, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const sunPulse = 1 + Math.sin(frame * 0.1) * 0.04;

  // 별똥별 (40~75 프레임)
  const shoot = interpolate(frame, [40, 75], [0, 1], CLAMP);
  const sx = interpolate(shoot, [0, 1], [1150, 150]);
  const sy = interpolate(shoot, [0, 1], [250, 620]);
  const shootOp = shoot > 0 && shoot < 1 ? Math.sin(shoot * Math.PI) : 0;

  const planets = PLANETS.map((p) => {
    const a = p.start + frame * p.speed;
    return {...p, x: cx + Math.cos(a) * p.rx, y: cy + Math.sin(a) * p.ry, behind: Math.sin(a) < 0};
  });

  const renderPlanet = (p: (typeof planets)[number], i: number) => (
    <g key={i} transform={`translate(${p.x} ${p.y})`}>
      {p.ring ? <ellipse rx={p.r * 1.9} ry={p.r * 0.55} fill="none" stroke="#E9DAF5" strokeWidth={6} transform="rotate(-18)" /> : null}
      <circle r={p.r} fill={p.color} />
      <ellipse cx={-p.r * 0.35} cy={-p.r * 0.4} rx={p.r * 0.3} ry={p.r * 0.16} fill="rgba(255,255,255,0.6)" transform="rotate(-30)" />
      <circle r={p.r} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
    </g>
  );

  return (
    <g transform={`translate(${cx} ${cy}) scale(${enter}) translate(${-cx} ${-cy})`}>
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame * s.speed + s.phase))} />
      ))}
      {[{x: 180, y: 300, s: 26}, {x: 880, y: 1480, s: 22}, {x: 960, y: 700, s: 18}].map((sp, i) => (
        <path
          key={i}
          d={sparklePath(sp.s)}
          fill="#FFE9A8"
          opacity={0.5 + 0.5 * Math.sin(frame * 0.15 + i * 2)}
          transform={`translate(${sp.x} ${sp.y}) rotate(${frame * 0.8})`}
        />
      ))}
      {/* 별똥별 */}
      <g opacity={shootOp}>
        <line x1={sx} y1={sy} x2={sx + 160} y2={sy - 60} stroke="url(#shootGrad)" strokeWidth={5} strokeLinecap="round" />
        <circle cx={sx} cy={sy} r={7} fill="#FFFFFF" />
      </g>

      {/* 공전 궤도 */}
      {PLANETS.map((p, i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={p.rx} ry={p.ry} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={2} strokeDasharray="10 14" />
      ))}
      {planets.filter((p) => p.behind).map(renderPlanet)}
      {/* 중심 태양 */}
      <circle cx={cx} cy={cy} r={120 * sunPulse} fill="url(#sunGlow)" />
      <circle cx={cx} cy={cy} r={72 * sunPulse} fill="#FFD6A5" />
      <circle cx={cx} cy={cy} r={72 * sunPulse} fill="none" stroke="#FFE8C8" strokeWidth={6} />
      {planets.filter((p) => !p.behind).map(renderPlanet)}
    </g>
  );
};

const PETALS = Array.from({length: 26}, (_, i) => ({
  x0: random(`px${i}`) * WIDTH,
  y0: random(`py${i}`) * HEIGHT,
  vx: 0.9 + random(`pvx${i}`) * 1.4,
  vy: 1.4 + random(`pvy${i}`) * 1.8,
  sway: 30 + random(`psw${i}`) * 50,
  phase: random(`pph${i}`) * Math.PI * 2,
  rot: (random(`prt${i}`) - 0.5) * 3,
  scale: 0.45 + random(`psc${i}`) * 0.7,
  flower: i % 5 === 0,
  tint: i % 3 === 0 ? '#FFE3EC' : '#FFFFFF',
}));

const Flower: React.FC<{scale: number}> = ({scale}) => (
  <g transform={`scale(${scale})`}>
    {[0, 72, 144, 216, 288].map((a) => (
      <path key={a} d={petalPath} fill="#FFFFFF" stroke="#FFC8DD" strokeWidth={3} transform={`rotate(${a}) translate(0 -42)`} />
    ))}
    <circle r={16} fill="#FFE066" />
    <circle r={7} fill="#F5B700" />
  </g>
);

const JasminePart: React.FC<{frame: number}> = ({frame}) => {
  const t = frame - SWITCH;
  if (t < -10) return null;
  // 왼쪽에서 오른쪽으로 부드러운 스와이프 전환
  const swipe = interpolate(t, [-10, 22], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const clipW = swipe * (WIDTH + 200);
  const tt = Math.max(0, t + 10);

  return (
    <g clipPath="url(#jasClip)">
      <defs>
        <clipPath id="jasClip">
          <path d={`M0 0 L ${clipW} 0 Q ${clipW - 120} ${HEIGHT / 2} ${clipW} ${HEIGHT} L 0 ${HEIGHT} Z`} />
        </clipPath>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#jasBg)" />
      <circle cx={200} cy={400} r={240} fill="rgba(255,255,255,0.5)" />
      <circle cx={900} cy={1400} r={300} fill="rgba(255,228,236,0.6)" />

      {/* 바람결 */}
      {[0, 1, 2].map((i) => {
        const off = (tt * 6 + i * 420) % (WIDTH + 600) - 300;
        const y = 500 + i * 380 + Math.sin(tt * 0.05 + i) * 30;
        return (
          <path
            key={i}
            d={`M ${off} ${y} q 90 -40 180 0 t 180 0 t 180 0`}
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.6}
          />
        );
      })}

      {PETALS.map((p, i) => {
        const x = (p.x0 + tt * p.vx * 1.2 + Math.sin(tt * 0.05 + p.phase) * p.sway + WIDTH) % (WIDTH + 200) - 100;
        const y = (p.y0 + tt * p.vy + HEIGHT) % (HEIGHT + 200) - 100;
        const rot = tt * p.rot * 2 + p.phase * 50;
        const flutter = 0.6 + 0.4 * Math.abs(Math.cos(tt * 0.08 + p.phase));
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`} opacity={0.95}>
            {p.flower ? (
              <Flower scale={p.scale * 1.1} />
            ) : (
              <path d={petalPath} fill={p.tint} stroke="#FFC8DD" strokeWidth={3} transform={`scale(${p.scale * flutter} ${p.scale})`} />
            )}
          </g>
        );
      })}
    </g>
  );
};

export const MiddleSound: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 45%, ${COLORS.navy} 0%, ${COLORS.navyDeep} 100%)`,
        opacity: sceneFadeIn(frame),
      }}
    >
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <defs>
          <radialGradient id="sunGlow">
            <stop offset="0%" stopColor="#FFD6A5" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#FFD6A5" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="shootGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="jasBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF4F8" />
            <stop offset="100%" stopColor="#FFE4EE" />
          </linearGradient>
        </defs>
        <CosmicPart frame={frame} />
        <JasminePart frame={frame} />
      </svg>
    </AbsoluteFill>
  );
};
