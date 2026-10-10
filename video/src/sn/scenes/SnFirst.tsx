import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CLAMP, COLORS, HEIGHT, WIDTH} from '../../constants';
import {sceneFadeIn, sparklePath} from '../../util';

const GROUND = 1180;
const SWITCH = 105; // Snake → Snail 전환 (로컬 프레임)

/* ───────────── Snake ───────────── */

const SEGMENTS = 34;
const SEG_GAP = 21;
const WAVE_K = (2 * Math.PI) / 360; // 한 굽이 360px
const WAVE_A = 62;

/** 몸통 마디 위치 (머리가 0번). 움직이는 동안은 고정된 S자 길을 따라가고, 멈춘 뒤에는 물결이 몸을 타고 흐른다. */
const snakePoints = (headX: number, phase: number, baseY: number) =>
  Array.from({length: SEGMENTS}, (_, i) => {
    const x = headX - i * SEG_GAP;
    const amp = WAVE_A * interpolate(i, [0, 4, SEGMENTS - 1], [0.55, 1, 0.8], CLAMP);
    return {x, y: baseY + Math.sin(x * WAVE_K + phase) * amp};
  });

const SnakePart: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const baseY = 1000;
  const headX = interpolate(frame, [0, 62], [-120, 760], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const phase = interpolate(frame, [55, 105], [0, -3.2], CLAMP);
  const pts = snakePoints(headX, phase, baseY);
  const head = pts[0];
  const neck = pts[2];
  const angle = (Math.atan2(head.y - neck.y, head.x - neck.x) * 180) / Math.PI;

  // 혀 날름: 26프레임마다 9프레임 동안
  const tt = frame % 26;
  const tongue = tt < 9 ? Math.sin((tt / 9) * Math.PI) : 0;

  const t = frame % 80;
  const eyeScaleY = t > 70 && t < 76 ? Math.max(0.1, Math.abs(t - 73) / 3) : 1;

  const out = interpolate(frame, [SWITCH - 12, SWITCH + 2], [1, 0], CLAMP);
  const outScale = interpolate(out, [0, 1], [0.85, 1]);
  const pop = spring({frame, fps, config: {damping: 12, stiffness: 120}});

  return (
    <g opacity={out}>
      {/* 풀밭 */}
      <path d={`M0 ${GROUND + 10} Q ${WIDTH / 2} ${GROUND - 30} ${WIDTH} ${GROUND + 10} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`} fill="rgba(255,255,255,0.45)" />
      <g transform={`translate(${WIDTH / 2} ${baseY}) scale(${outScale * 1.2}) translate(${-WIDTH / 2} ${-baseY})`}>
        {/* 그림자 */}
        {pts.map((p, i) => (
          <ellipse key={`s${i}`} cx={p.x} cy={p.y + 36} rx={interpolate(i, [0, SEGMENTS - 1], [46, 12])} ry={14} fill="rgba(31,42,68,0.07)" />
        ))}
        {/* 몸통: 꼬리부터 그려 머리가 위에 오게 */}
        {pts
          .map((p, i) => ({p, i}))
          .reverse()
          .map(({p, i}) => {
            const r = interpolate(i, [0, 3, SEGMENTS - 1], [44, 46, 11], CLAMP);
            const stripe = Math.floor(i / 3) % 2 === 1;
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={r} fill={stripe ? '#5DB35A' : '#7FD36F'} />
                <ellipse cx={p.x - r * 0.15} cy={p.y - r * 0.45} rx={r * 0.45} ry={r * 0.22} fill="rgba(255,255,255,0.28)" />
              </g>
            );
          })}
        {/* 머리 */}
        <g transform={`translate(${head.x} ${head.y}) rotate(${angle * 0.6}) scale(${pop})`}>
          {/* 혀 */}
          <g opacity={tongue > 0.02 ? 1 : 0}>
            <path
              d={`M 52 8 L ${52 + 70 * tongue} 8 M ${52 + 70 * tongue} 8 l ${18 * tongue} ${-12 * tongue} M ${52 + 70 * tongue} 8 l ${18 * tongue} ${12 * tongue}`}
              stroke="#FF5A6E"
              strokeWidth={8}
              strokeLinecap="round"
              fill="none"
            />
          </g>
          <ellipse cx={8} cy={0} rx={66} ry={54} fill="#7FD36F" />
          <ellipse cx={-6} cy={-26} rx={34} ry={14} fill="rgba(255,255,255,0.3)" transform="rotate(-12)" />
          <circle cx={40} cy={26} r={14} fill="#FF9AA2" opacity={0.75} />
          {[-6, 30].map((dx) => (
            <g key={dx} transform={`translate(${dx} -14) scale(1 ${eyeScaleY})`}>
              <circle r={17} fill="#FFFFFF" />
              <circle cx={5} cy={2} r={10} fill="#2B2B3A" />
              <circle cx={8} cy={-3} r={4} fill="#FFFFFF" />
            </g>
          ))}
          <path d="M 30 24 Q 46 36 60 22" stroke="#2B2B3A" strokeWidth={5} strokeLinecap="round" fill="none" />
        </g>
      </g>
    </g>
  );
};

/* ───────────── Snail ───────────── */

/** 아르키메데스 나선 (달팽이 껍데기 무늬) */
const spiralPath = (turns: number, maxR: number) => {
  const steps = 160;
  const pts: string[] = [];
  for (let s = 0; s <= steps; s++) {
    const th = (s / steps) * turns * Math.PI * 2;
    const r = (s / steps) * maxR;
    pts.push(`${(Math.cos(th) * r).toFixed(1)},${(Math.sin(th) * r).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')}`;
};
const SPIRAL = spiralPath(3, 118);

const SnailPart: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const t = frame - SWITCH;
  if (t < 0) return null;
  const pop = spring({frame: t, fps, config: {damping: 9, stiffness: 120, mass: 0.9}});
  const x = interpolate(t, [0, 105], [410, 560], CLAMP);
  const stretch = 1 + 0.045 * Math.sin(t * 0.22);
  const stalk = Math.sin(t * 0.16) * 7;
  const shellBob = Math.sin(t * 0.22 + 1) * 4;
  const blinkT = t % 70;
  const eyeScaleY = blinkT > 50 && blinkT < 56 ? Math.max(0.1, Math.abs(blinkT - 53) / 3) : 1;
  const ring = interpolate(t, [0, 30], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});

  const y = GROUND - 30;
  const trailStart = 0;
  const trailEnd = x - 200;

  return (
    <g>
      {/* 바닥 */}
      <path d={`M0 ${GROUND + 10} Q ${WIDTH / 2} ${GROUND - 30} ${WIDTH} ${GROUND + 10} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`} fill="rgba(255,255,255,0.45)" />
      {/* 등장 링 */}
      <circle cx={x} cy={y - 150} r={180 + ring * 380} fill="none" stroke="#FFB84C" strokeWidth={10 * (1 - ring)} opacity={1 - ring} />

      {/* 반짝이는 점액 자국 */}
      <line x1={trailStart} y1={y + 2} x2={trailEnd} y2={y + 2} stroke="rgba(160,200,255,0.55)" strokeWidth={22} strokeLinecap="round" />
      <line x1={trailStart} y1={y - 2} x2={trailEnd} y2={y - 2} stroke="rgba(255,255,255,0.8)" strokeWidth={6} strokeLinecap="round" />
      {Array.from({length: 7}, (_, i) => {
        const sx = 40 + i * 70;
        if (sx > trailEnd) return null;
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.25 + i * 1.3));
        return <path key={i} d={sparklePath(10 + (i % 3) * 3)} fill="#FFFFFF" opacity={tw} transform={`translate(${sx} ${y - 18}) rotate(${t * 2 + i * 20})`} />;
      })}

      <ellipse cx={x} cy={y + 14} rx={230 * pop} ry={18} fill="rgba(31,42,68,0.10)" />

      <g transform={`translate(${x} ${y}) scale(${pop})`}>
        {/* 몸 (머리는 오른쪽) */}
        <g transform={`scale(${stretch} ${2 - stretch})`}>
          <path
            d="M -200 0 C -150 -46, 40 -60, 110 -62 C 150 -100, 140 -160, 172 -176 C 210 -194, 248 -160, 240 -116 C 234 -66, 210 -22, 200 0 Z"
            fill="#FFD08A"
            stroke="#F2AE55"
            strokeWidth={6}
            strokeLinejoin="round"
          />
        </g>
        {/* 더듬이 + 눈 */}
        {[
          {bx: 182, by: -176, tx: 150, ty: -280},
          {bx: 214, by: -170, tx: 250, ty: -272},
        ].map((s, i) => {
          const tx = s.tx + (i === 0 ? stalk : -stalk);
          const ty = s.ty + Math.abs(stalk) * 0.6;
          return (
            <g key={i}>
              <path d={`M ${s.bx} ${s.by} Q ${(s.bx + tx) / 2 + (i === 0 ? -8 : 8)} ${(s.by + ty) / 2} ${tx} ${ty}`} stroke="#F2AE55" strokeWidth={14} strokeLinecap="round" fill="none" />
              <g transform={`translate(${tx} ${ty}) scale(1 ${eyeScaleY})`}>
                <circle r={20} fill="#FFFFFF" stroke="#F2AE55" strokeWidth={4} />
                <circle cx={4} cy={2} r={10} fill="#2B2B3A" />
                <circle cx={7} cy={-3} r={4} fill="#FFFFFF" />
              </g>
            </g>
          );
        })}
        <circle cx={220} cy={-96} r={13} fill="#FF9AA2" opacity={0.8} />
        <path d="M 196 -122 Q 214 -104 234 -120" stroke="#2B2B3A" strokeWidth={5} strokeLinecap="round" fill="none" />

        {/* 껍데기 */}
        <g transform={`translate(-30 ${-168 + shellBob}) rotate(${Math.sin(t * 0.08) * 4})`}>
          <circle r={140} fill="#FF9F80" stroke="#E86F55" strokeWidth={8} />
          <path d={SPIRAL} transform="rotate(200)" stroke="#E86F55" strokeWidth={14} strokeLinecap="round" fill="none" />
          <ellipse cx={-55} cy={-70} rx={42} ry={20} fill="rgba(255,255,255,0.45)" transform="rotate(-30 -55 -70)" />
        </g>
      </g>

      {/* 풀잎 장식 */}
      {[{x: 120, s: 1}, {x: 960, s: 1.2}, {x: 860, s: 0.8}].map((g, i) => (
        <g key={i} transform={`translate(${g.x} ${GROUND + 6}) scale(${g.s})`}>
          {[-24, 0, 24].map((dx, j) => (
            <path key={j} d={`M ${dx} 0 Q ${dx + (j - 1) * 14} -60 ${dx + (j - 1) * 30 + Math.sin(t * 0.1 + i + j) * 6} -96`} stroke="#7FD36F" strokeWidth={12} strokeLinecap="round" fill="none" />
          ))}
        </g>
      ))}
    </g>
  );
};

export const SnFirst: React.FC = () => {
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
        {Array.from({length: 6}, (_, i) => (
          <path
            key={i}
            d={sparklePath(12 + (i % 3) * 5)}
            fill="#FFE28A"
            opacity={0.5 + 0.5 * Math.sin(frame * 0.12 + i * 1.4)}
            transform={`translate(${120 + random(`fs${i}`) * 840} ${300 + random(`fy${i}`) * 400}) rotate(${frame * 0.7 + i * 25})`}
          />
        ))}
        <SnakePart frame={frame} />
        <SnailPart frame={frame} />
      </svg>
    </AbsoluteFill>
  );
};
