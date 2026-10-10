import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CLAMP, COLORS, HEIGHT, WIDTH} from '../../constants';
import {sceneFadeIn, sparklePath} from '../../util';

/**
 * 끝소리 자리: sn 으로 끝나는 영어 단어는 없다.
 * 글자 타일 세 줄(첫소리 snake / 중간소리 parsnip / 끝소리 ___sn)로 보여 주고, 마지막 줄에 X 도장을 찍는다.
 */

const TILE = 104;
const GAP = 14;
const STAMP_AT = 66; // "No words end with S, N." 의 end 쯤

type Row = {label: string; letters: string[]; ok: boolean; y: number; delay: number};
const ROWS: Row[] = [
  {label: '첫소리', letters: ['s', 'n', 'a', 'k', 'e'], ok: true, y: 560, delay: 4},
  {label: '중간소리', letters: ['p', 'a', 'r', 's', 'n', 'i', 'p'], ok: true, y: 860, delay: 18},
  {label: '끝소리', letters: ['', '', '', 's', 'n'], ok: false, y: 1160, delay: 32},
];

const Check: React.FC<{scale: number}> = ({scale}) => (
  <g transform={`scale(${scale})`}>
    <circle r={40} fill="#5DB35A" />
    <path d="M -18 0 L -5 14 L 20 -14" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);

const Cross: React.FC<{scale: number}> = ({scale}) => (
  <g transform={`scale(${scale})`}>
    <circle r={40} fill="#FF595E" />
    <path d="M -15 -15 L 15 15 M 15 -15 L -15 15" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" fill="none" />
  </g>
);

const TileRow: React.FC<{row: Row; frame: number}> = ({row, frame}) => {
  const {fps} = useVideoConfig();
  const n = row.letters.length;
  const w = n * TILE + (n - 1) * GAP;
  const x0 = (WIDTH - w) / 2;
  const labelIn = spring({frame: frame - row.delay, fps, config: {damping: 14, stiffness: 140}});
  const markIn = spring({frame: frame - row.delay - 18, fps, config: {damping: 8, stiffness: 160}});
  // 끝소리 줄: 도장 찍힐 때 s n 타일이 흔들린다
  const shake = !row.ok ? Math.sin(frame * 1.6) * interpolate(frame, [STAMP_AT, STAMP_AT + 4, STAMP_AT + 24], [0, 10, 0], CLAMP) : 0;
  const dim = !row.ok ? interpolate(frame, [STAMP_AT, STAMP_AT + 10], [1, 0.45], CLAMP) : 1;
  // 다시 보기(정리) 구간: 맞는 줄의 타일이 차례로 통통 튄다
  const recap = row.ok ? frame - (120 + (row.delay > 10 ? 18 : 0)) : -1;

  return (
    <g>
      {/* 라벨 */}
      <g opacity={labelIn} transform={`translate(${x0} ${row.y - TILE / 2 - 46}) translate(${(1 - labelIn) * -30} 0)`}>
        <rect x={0} y={-30} width={row.label.length * 36 + 40} height={56} rx={28} fill="rgba(255,255,255,0.85)" />
        <text x={20} y={10} fontSize={34} fontWeight={700} fill={COLORS.inkSoft}>
          {row.label}
        </text>
      </g>

      {row.letters.map((ch, i) => {
        const pop = spring({frame: frame - row.delay - i * 3, fps, config: {damping: 11, stiffness: 170}});
        const isMark = ch === 's' || ch === 'n';
        const empty = ch === '';
        const hop = recap >= 0 ? -Math.max(0, Math.sin(((recap - i * 3) / 12) * Math.PI)) * 22 * (recap - i * 3 >= 0 && recap - i * 3 <= 12 ? 1 : 0) : 0;
        const x = x0 + i * (TILE + GAP) + TILE / 2 + (isMark ? shake : 0);
        return (
          <g key={i} transform={`translate(${x} ${row.y + hop}) scale(${pop})`} opacity={isMark && !row.ok ? dim : 1}>
            {empty ? (
              <rect x={-TILE / 2} y={-TILE / 2} width={TILE} height={TILE} rx={22} fill="rgba(255,255,255,0.35)" stroke="#FFFFFF" strokeWidth={5} strokeDasharray="14 10" />
            ) : (
              <>
                <rect x={-TILE / 2} y={-TILE / 2 + 7} width={TILE} height={TILE} rx={22} fill="rgba(31,42,68,0.12)" />
                <rect x={-TILE / 2} y={-TILE / 2} width={TILE} height={TILE} rx={22} fill={isMark ? COLORS.coral : '#FFFFFF'} />
                <text x={0} y={22} textAnchor="middle" fontSize={68} fontWeight={700} fill={isMark ? '#FFFFFF' : COLORS.ink}>
                  {ch}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* ✓ / ✗ */}
      <g transform={`translate(${x0 + w + 62} ${row.y})`}>
        {row.ok ? <Check scale={markIn} /> : <Cross scale={spring({frame: frame - STAMP_AT, fps, config: {damping: 8, stiffness: 160}})} />}
      </g>
    </g>
  );
};

export const SnEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const last = ROWS[2];
  const lastW = last.letters.length * TILE + (last.letters.length - 1) * GAP;
  const snCenter = (WIDTH - lastW) / 2 + 3.5 * (TILE + GAP) + TILE / 2;
  const stamp = spring({frame: frame - STAMP_AT, fps, config: {damping: 10, stiffness: 220}});
  const stampScale = interpolate(stamp, [0, 1], [2.2, 1]);
  const stampOp = interpolate(frame, [STAMP_AT, STAMP_AT + 4], [0, 1], CLAMP);
  const ring = interpolate(frame, [STAMP_AT, STAMP_AT + 22], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(170deg, ${COLORS.lavender} 0%, ${COLORS.sky} 100%)`,
        opacity: sceneFadeIn(frame),
      }}
    >
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <circle cx={180} cy={300} r={200} fill="rgba(255,255,255,0.3)" />
        <circle cx={920} cy={1560} r={240} fill="rgba(255,255,255,0.28)" />
        {Array.from({length: 12}, (_, i) => {
          const x = random(`nx${i}`) * WIDTH;
          const y = random(`ny${i}`) * HEIGHT;
          const s = 10 + random(`ns${i}`) * 14;
          const op = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(frame * 0.12 + i));
          return <path key={i} d={sparklePath(s)} fill="#FFFFFF" opacity={op * 0.8} transform={`translate(${x} ${y + Math.sin(frame * 0.03 + i) * 12}) rotate(${frame * 0.5 + i * 30})`} />;
        })}

        {ROWS.map((r) => (
          <TileRow key={r.label} row={r} frame={frame} />
        ))}

        {/* 끝소리 줄 X 도장 */}
        <circle cx={snCenter} cy={last.y} r={90 + ring * 160} fill="none" stroke="#FF595E" strokeWidth={8 * (1 - ring)} opacity={(1 - ring) * stampOp} />
        <g opacity={stampOp} transform={`translate(${snCenter} ${last.y}) rotate(-8) scale(${stampScale})`}>
          <path d="M -120 -84 L 120 84 M 120 -84 L -120 84" stroke="#FF595E" strokeWidth={26} strokeLinecap="round" opacity={0.92} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
