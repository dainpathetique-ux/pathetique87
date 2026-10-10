import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CLAMP, COLORS, HEIGHT, WIDTH} from '../../constants';
import {sceneFadeIn, sparklePath} from '../../util';

const SWITCH = 105; // Parsnip → Gingersnap 전환 (로컬 프레임)
const SOIL = 1200;

/* ───────────── Parsnip ───────────── */

const DIRT = Array.from({length: 18}, (_, i) => ({
  angle: -Math.PI / 2 + (random(`da${i}`) - 0.5) * 2.4,
  speed: 14 + random(`ds${i}`) * 14,
  r: 8 + random(`dr${i}`) * 12,
  color: i % 3 === 0 ? '#8C5A36' : '#A8744A',
}));

const POP_AT = 30;

const ParsnipPart: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const cx = WIDTH / 2;
  // 땅속에서 잎만 흔들리다가 뽕 하고 뽑혀 올라온다.
  const rise = spring({frame: frame - POP_AT, fps, config: {damping: 10, stiffness: 90, mass: 0.9}});
  const topY = interpolate(rise, [0, 1], [SOIL + 40, 640]);
  const wiggle = frame < POP_AT ? Math.sin(frame * 0.9) * 7 : Math.sin(frame * 0.18) * 4;
  const bob = frame > POP_AT + 25 ? Math.sin((frame - POP_AT) * 0.14) * 10 : 0;
  const faceIn = interpolate(frame, [POP_AT + 10, POP_AT + 22], [0, 1], CLAMP);

  const out = interpolate(frame, [SWITCH - 12, SWITCH + 2], [1, 0], CLAMP);

  return (
    <g opacity={out}>
      {/* 해 */}
      <circle cx={860} cy={420} r={90} fill={COLORS.sun} opacity={0.85} />
      <circle cx={860} cy={420} r={130 + Math.sin(frame * 0.1) * 6} fill={COLORS.sun} opacity={0.18} />

      {/* 파스닙 (흙보다 먼저 그려서 땅속 부분이 가려지게) */}
      <g transform={`translate(${cx} ${topY + bob})`}>
        {/* 잎 */}
        <g transform={`rotate(${wiggle})`}>
          {[
            {x: -95, y: -230, r: -24},
            {x: 0, y: -290, r: 0},
            {x: 95, y: -225, r: 24},
          ].map((l, i) => (
            <g key={i}>
              <path d={`M 0 -6 Q ${l.x * 0.3} ${l.y * 0.5} ${l.x} ${l.y}`} stroke="#4FA336" strokeWidth={14} strokeLinecap="round" fill="none" />
              {[0.45, 0.72, 1].map((k, j) => (
                <ellipse
                  key={j}
                  cx={l.x * k}
                  cy={l.y * k}
                  rx={30 - j * 2}
                  ry={17}
                  fill={j % 2 ? '#6CC24A' : '#7FD36F'}
                  transform={`rotate(${l.r + (j % 2 ? 40 : -40)} ${l.x * k} ${l.y * k})`}
                />
              ))}
            </g>
          ))}
        </g>
        {/* 뿌리 */}
        <path d="M -88 0 Q 0 -34 88 0 C 92 120, 34 320, 0 440 C -34 320, -92 120, -88 0 Z" fill="#F7E9C8" stroke="#E2C997" strokeWidth={7} strokeLinejoin="round" />
        {[90, 170, 250, 330].map((yy, i) => {
          const w = interpolate(yy, [0, 440], [80, 0]) * 0.75;
          return <path key={i} d={`M ${-w} ${yy} Q 0 ${yy + 12} ${w * 0.6} ${yy - 4}`} stroke="#E2C997" strokeWidth={5} strokeLinecap="round" fill="none" />;
        })}
        <ellipse cx={-40} cy={60} rx={20} ry={50} fill="rgba(255,255,255,0.45)" transform="rotate(8 -40 60)" />
        {/* 얼굴 */}
        <g opacity={faceIn}>
          {[-30, 30].map((dx) => (
            <g key={dx} transform={`translate(${dx} 92)`}>
              <ellipse rx={11} ry={15} fill="#2B2B3A" />
              <circle cx={4} cy={-5} r={4} fill="#FFFFFF" />
            </g>
          ))}
          <circle cx={-48} cy={128} r={13} fill="#FF9AA2" opacity={0.8} />
          <circle cx={48} cy={128} r={13} fill="#FF9AA2" opacity={0.8} />
          <path d="M -20 130 Q 0 152 20 130" stroke="#2B2B3A" strokeWidth={6} strokeLinecap="round" fill="none" />
        </g>
      </g>

      {/* 흙 */}
      <path d={`M0 ${SOIL} Q ${WIDTH * 0.25} ${SOIL - 26} ${WIDTH * 0.5} ${SOIL} T ${WIDTH} ${SOIL} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`} fill="#B98A5E" />
      <path d={`M0 ${SOIL + 16} Q ${WIDTH * 0.25} ${SOIL - 8} ${WIDTH * 0.5} ${SOIL + 16} T ${WIDTH} ${SOIL + 16} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`} fill="#A47148" />
      {Array.from({length: 22}, (_, i) => (
        <circle key={i} cx={random(`sx${i}`) * WIDTH} cy={SOIL + 50 + random(`sy${i}`) * 650} r={5 + random(`sr${i}`) * 8} fill="#8C5A36" opacity={0.5} />
      ))}
      {/* 구멍 */}
      <ellipse cx={cx} cy={SOIL + 8} rx={interpolate(rise, [0, 0.3], [70, 110], CLAMP)} ry={22} fill="#6E4527" opacity={interpolate(rise, [0, 0.2], [0.3, 0.9], CLAMP)} />

      {/* 흙 튀김 */}
      {DIRT.map((d, i) => {
        const tt = frame - POP_AT;
        if (tt < 0 || tt > 50) return null;
        const x = cx + Math.cos(d.angle) * d.speed * tt;
        const y = SOIL - 10 + Math.sin(d.angle) * d.speed * tt + 0.9 * tt * tt;
        return <circle key={i} cx={x} cy={y} r={d.r} fill={d.color} opacity={interpolate(tt, [30, 50], [1, 0], CLAMP)} />;
      })}
    </g>
  );
};

/* ───────────── Gingersnap ───────────── */

const SNAP_AT = 44; // 쿠키가 두 동강 나는 순간 (전환 후 로컬)
const CRACK: Array<[number, number]> = [
  [8, -250], [-16, -170], [18, -96], [-20, -10], [22, 76], [-12, 160], [12, 250],
];
const LEFT_CLIP = [[-400, -400], [8, -400], ...CRACK, [12, 400], [-400, 400]].map((p) => p.join(',')).join(' ');
const RIGHT_CLIP = [[8, -400], [400, -400], [400, 400], [12, 400], ...[...CRACK].reverse()].map((p) => p.join(',')).join(' ');

const CRACKS = [
  'M -150 -60 L -110 -40 L -120 10',
  'M -60 -170 L -40 -120 L -80 -100',
  'M 90 -150 L 120 -110 L 100 -70',
  'M 120 40 L 160 70 L 140 120',
  'M -110 100 L -70 130 L -90 170',
  'M 40 150 L 70 120 L 100 160',
];
const SUGAR = Array.from({length: 26}, (_, i) => {
  const a = random(`ga${i}`) * Math.PI * 2;
  const r = Math.sqrt(random(`gr${i}`)) * 200;
  return {x: Math.cos(a) * r, y: Math.sin(a) * r, s: 4 + random(`gs${i}`) * 4};
});
const CRUMBS = Array.from({length: 16}, (_, i) => ({
  y0: -220 + random(`cy${i}`) * 440,
  vx: (i % 2 ? 1 : -1) * (5 + random(`cvx${i}`) * 9),
  vy: -10 - random(`cvy${i}`) * 10,
  s: 9 + random(`cs${i}`) * 12,
  rot: random(`cr${i}`) * 360,
}));

const Cookie: React.FC = () => (
  <g>
    <circle r={236} fill="#B8732F" />
    <circle r={222} fill="#D9924A" />
    <circle r={200} fill="#E3A35C" opacity={0.6} />
    {CRACKS.map((d, i) => (
      <path key={i} d={d} stroke="#F3C68E" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ))}
    {SUGAR.map((s, i) => (
      <rect key={i} x={s.x} y={s.y} width={s.s} height={s.s} rx={1.5} fill="#FFFFFF" opacity={0.85} transform={`rotate(${i * 37} ${s.x} ${s.y})`} />
    ))}
  </g>
);

const GingersnapPart: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const t = frame - SWITCH;
  if (t < -10) return null;
  const swipe = interpolate(t, [-10, 22], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const clipW = swipe * (WIDTH + 200);
  const tt = Math.max(0, t);

  const cx = WIDTH / 2;
  const cy = 960;
  const pop = spring({frame: tt - 4, fps, config: {damping: 10, stiffness: 120}});
  const snap = spring({frame: tt - SNAP_AT, fps, config: {damping: 9, stiffness: 160}});
  const shake = tt < SNAP_AT && tt > SNAP_AT - 12 ? Math.sin(tt * 2.4) * 5 : 0;
  const split = snap * 80;
  const tilt = snap * 13;
  const bob = Math.sin(tt * 0.12) * 8;

  const burst = interpolate(tt, [SNAP_AT, SNAP_AT + 16], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const word = spring({frame: tt - SNAP_AT - 2, fps, config: {damping: 8, stiffness: 150}});

  return (
    <g clipPath="url(#gsClip)">
      <defs>
        <clipPath id="gsClip">
          <path d={`M0 0 L ${clipW} 0 Q ${clipW - 120} ${HEIGHT / 2} ${clipW} ${HEIGHT} L 0 ${HEIGHT} Z`} />
        </clipPath>
        <clipPath id="gsLeft">
          <polygon points={LEFT_CLIP} />
        </clipPath>
        <clipPath id="gsRight">
          <polygon points={RIGHT_CLIP} />
        </clipPath>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#gsBg)" />
      <circle cx={200} cy={420} r={240} fill="rgba(255,255,255,0.45)" />
      <circle cx={900} cy={1420} r={300} fill="rgba(255,255,255,0.35)" />

      {/* 접시 */}
      <ellipse cx={cx} cy={cy + 280} rx={340 * pop} ry={60 * pop} fill="#FFFFFF" opacity={0.9} />
      <ellipse cx={cx} cy={cy + 280} rx={280 * pop} ry={40 * pop} fill="#F5EDE4" />

      {/* 딱! 효과선 */}
      {burst > 0 && burst < 1
        ? Array.from({length: 10}, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const r1 = 250 + burst * 60;
            const r2 = r1 + 70 * (1 - burst * 0.6);
            return (
              <line
                key={i}
                x1={cx + Math.cos(a) * r1}
                y1={cy + Math.sin(a) * r1}
                x2={cx + Math.cos(a) * r2}
                y2={cy + Math.sin(a) * r2}
                stroke={COLORS.coral}
                strokeWidth={10}
                strokeLinecap="round"
                opacity={1 - burst}
              />
            );
          })
        : null}

      {/* 쿠키 두 조각 */}
      <g transform={`translate(${cx + shake} ${cy + bob}) scale(${pop})`}>
        <g transform={`translate(${-split} ${snap * 10}) rotate(${-tilt})`}>
          <g clipPath="url(#gsLeft)">
            <Cookie />
          </g>
        </g>
        <g transform={`translate(${split} ${snap * 10}) rotate(${tilt})`}>
          <g clipPath="url(#gsRight)">
            <Cookie />
          </g>
        </g>
      </g>

      {/* 부스러기 */}
      {CRUMBS.map((c, i) => {
        const ct = tt - SNAP_AT;
        if (ct < 0 || ct > 60) return null;
        const x = cx + c.vx * ct;
        const y = cy + bob + c.y0 + c.vy * ct + 0.8 * ct * ct;
        return (
          <rect
            key={i}
            x={-c.s / 2}
            y={-c.s / 2}
            width={c.s}
            height={c.s}
            rx={3}
            fill={i % 2 ? '#B8732F' : '#D9924A'}
            opacity={interpolate(ct, [40, 60], [1, 0], CLAMP)}
            transform={`translate(${x} ${y}) rotate(${c.rot + ct * 9})`}
          />
        );
      })}

      {/* snap! 글자 */}
      <g opacity={interpolate(word, [0, 0.2], [0, 1], CLAMP)} transform={`translate(${cx + 230} ${cy - 330}) rotate(-10) scale(${word})`}>
        <text x={0} y={0} textAnchor="middle" fontSize={120} fontWeight={700} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={22} strokeLinejoin="round">
          snap!
        </text>
        <text x={0} y={0} textAnchor="middle" fontSize={120} fontWeight={700} fill={COLORS.ink}>
          <tspan fill={COLORS.coral}>sn</tspan>ap!
        </text>
      </g>

      {/* 반짝이 */}
      {Array.from({length: 6}, (_, i) => (
        <path
          key={i}
          d={sparklePath(14 + (i % 3) * 5)}
          fill="#FFFFFF"
          opacity={0.5 + 0.5 * Math.sin(tt * 0.15 + i * 1.6)}
          transform={`translate(${100 + random(`gx${i}`) * 880} ${380 + random(`gy${i}`) * 1000}) rotate(${tt * 0.8 + i * 20})`}
        />
      ))}
    </g>
  );
};

export const SnMiddle: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #EAF8E6 0%, #CDEFC6 100%)',
        opacity: sceneFadeIn(frame),
      }}
    >
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <defs>
          <linearGradient id="gsBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF4E6" />
            <stop offset="100%" stopColor="#FFDDB8" />
          </linearGradient>
        </defs>
        <circle cx={160} cy={560} r={150} fill="rgba(255,255,255,0.35)" />
        <ParsnipPart frame={frame} />
        <GingersnapPart frame={frame} />
      </svg>
    </AbsoluteFill>
  );
};
