import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CLAMP, COLORS, HEIGHT, WIDTH} from '../constants';
import {sceneFadeIn, sparklePath} from '../util';

const CX = WIDTH / 2;
const CY = 980;

/** 노란 스마일 캐릭터: 눈 깜빡임 + 둥실 바운스 */
const Smiley: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 9, stiffness: 110, mass: 0.9}});
  const bob = Math.sin((frame / fps) * Math.PI * 2 * 0.75) * 22;
  const tilt = Math.sin((frame / fps) * Math.PI * 2 * 0.375) * 4;

  // 80프레임마다 6프레임 동안 눈 감기
  const t = frame % 80;
  const eyeScaleY = t < 6 ? Math.max(0.08, Math.abs(t - 3) / 3) : 1;

  const shadowScale = interpolate(bob, [-22, 22], [1.08, 0.92]);

  return (
    <g>
      <ellipse
        cx={CX}
        cy={CY + 260}
        rx={200 * shadowScale}
        ry={28 * shadowScale}
        fill="rgba(31,42,68,0.10)"
        transform={`scale(${pop}) `}
        style={{transformOrigin: `${CX}px ${CY + 260}px`}}
      />
      <g style={{transformOrigin: `${CX}px ${CY}px`}} transform={`translate(0 ${bob}) rotate(${tilt}) scale(${pop})`}>
        <circle cx={CX} cy={CY} r={215} fill={COLORS.sun} stroke={COLORS.sunEdge} strokeWidth={12} />
        <ellipse cx={CX - 90} cy={CY - 120} rx={60} ry={34} fill="rgba(255,255,255,0.45)" transform={`rotate(-25 ${CX - 90} ${CY - 120})`} />
        {/* 볼터치 */}
        <circle cx={CX - 135} cy={CY + 45} r={34} fill="#FF9AA2" opacity={0.75} />
        <circle cx={CX + 135} cy={CY + 45} r={34} fill="#FF9AA2" opacity={0.75} />
        {/* 눈 */}
        {[-72, 72].map((dx) => (
          <g key={dx} transform={`translate(${CX + dx} ${CY - 45}) scale(1 ${eyeScaleY})`}>
            <ellipse cx={0} cy={0} rx={22} ry={36} fill="#3B2F2F" />
            <circle cx={8} cy={-12} r={8} fill="#FFFFFF" />
          </g>
        ))}
        {/* 입 */}
        <path
          d={`M ${CX - 110} ${CY + 55} Q ${CX} ${CY + 185} ${CX + 110} ${CY + 55}`}
          stroke="#3B2F2F"
          strokeWidth={16}
          strokeLinecap="round"
          fill="none"
        />
        <path d={`M ${CX - 60} ${CY + 95} Q ${CX} ${CY + 150} ${CX + 60} ${CY + 95} Z`} fill="#FF6F7A" opacity={0.9} />
      </g>
    </g>
  );
};

const SPARKLES = Array.from({length: 16}, (_, i) => {
  const angle = (i / 16) * Math.PI * 2 + random(`sa${i}`) * 0.5;
  const r = 330 + random(`sr${i}`) * 180;
  return {
    x: CX + Math.cos(angle) * r,
    y: CY + Math.sin(angle) * r * 0.95,
    size: 14 + random(`ss${i}`) * 20,
    phase: random(`sp${i}`) * Math.PI * 2,
    speed: 0.12 + random(`sv${i}`) * 0.1,
    delay: 10 + i * 2.5,
    color: i % 3 === 0 ? '#FFE28A' : '#FFD93D',
  };
});

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.mintLight} 0%, ${COLORS.mint} 100%)`,
        opacity: sceneFadeIn(frame),
      }}
    >
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {/* 배경 장식 블롭 */}
        <circle cx={160} cy={420} r={220} fill="rgba(255,255,255,0.28)" />
        <circle cx={940} cy={1500} r={260} fill="rgba(255,255,255,0.25)" />
        <circle cx={880} cy={520} r={120} fill="rgba(255,255,255,0.22)" />

        {SPARKLES.map((s, i) => {
          const appear = spring({frame: frame - s.delay, fps, config: {damping: 10, stiffness: 140}});
          const twinkle = 0.55 + 0.45 * Math.sin(frame * s.speed + s.phase);
          const rot = frame * 0.6 + s.phase * 40;
          return (
            <path
              key={i}
              d={sparklePath(s.size)}
              fill={s.color}
              stroke="#F0B429"
              strokeWidth={1.5}
              opacity={twinkle * appear}
              transform={`translate(${s.x} ${s.y}) rotate(${rot}) scale(${0.7 + 0.5 * twinkle})`}
            />
          );
        })}

        <Smiley frame={frame} />
      </svg>
    </AbsoluteFill>
  );
};
