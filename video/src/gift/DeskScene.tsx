import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {CLAMP} from '../constants';
import {CANVAS, G} from './constants';

/* ---------- 카메라 ---------- */
type Cam = {zoom: number; x: number; y: number};

export const useCamera = (frame: number): Cam => {
  // 0~10초: 느린 돌리인, 10~20초: 책장 쪽으로 부드러운 팬
  const zoom =
    frame < 300
      ? interpolate(frame, [0, 300], [1.0, 1.22], {...CLAMP, easing: Easing.inOut(Easing.cubic)})
      : interpolate(frame, [300, 600], [1.22, 1.14], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const x = interpolate(frame, [300, 600], [0, 250], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const y = interpolate(frame, [0, 300], [0, -70], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  return {zoom, x, y};
};

/** 깊이(depth)가 작을수록 멀리 있어 덜 움직인다 (패럴랙스). */
const Layer: React.FC<{cam: Cam; depth: number; blur?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  cam, depth, blur = 0, children, style,
}) => {
  const s = 1 + (cam.zoom - 1) * depth;
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${s}) translate(${cam.x * depth}px, ${cam.y * depth}px)`,
        transformOrigin: '50% 50%',
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        ...style,
      }}
    >
      <svg
        width={CANVAS.w}
        height={CANVAS.h}
        viewBox={`${CANVAS.x} ${CANVAS.y} ${CANVAS.w} ${CANVAS.h}`}
        style={{position: 'absolute', left: CANVAS.x, top: CANVAS.y, overflow: 'visible'}}
      >
        {children}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- 공용 defs (수채화 가장자리 흔들림, 그라데이션) ---------- */
const Defs: React.FC = () => (
  <defs>
    <filter id="wc" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="4" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="wcSoft" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="9" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="blur40" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="40" />
    </filter>
    <filter id="blur14" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={G.wallTop} />
      <stop offset="100%" stopColor={G.wallBottom} />
    </linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stopColor="#CFE4F1" />
      <stop offset="60%" stopColor="#E6EFE4" />
      <stop offset="100%" stopColor="#F2EBD8" />
    </linearGradient>
    <radialGradient id="sunGlowG" cx="0.75" cy="0.2" r="0.6">
      <stop offset="0%" stopColor="#FFF6DA" stopOpacity={0.95} />
      <stop offset="100%" stopColor="#FFF6DA" stopOpacity={0} />
    </radialGradient>
    <linearGradient id="deskTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#DDB58C" />
      <stop offset="100%" stopColor="#C89B6E" />
    </linearGradient>
    <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#CDB08E" />
      <stop offset="100%" stopColor="#B8977A" />
    </linearGradient>
    <linearGradient id="curtain" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#F6EDE0" />
      <stop offset="50%" stopColor="#EADBC6" />
      <stop offset="100%" stopColor="#F6EDE0" />
    </linearGradient>
  </defs>
);

/* ---------- 원경: 벽, 창, 커튼, 햇빛 ---------- */
const Far: React.FC<{frame: number}> = ({frame}) => {
  const sway = Math.sin(frame * 0.02) * 3;
  const glow = 0.85 + 0.15 * Math.sin(frame * 0.015);
  return (
    <g>
      <rect x={CANVAS.x} y={CANVAS.y} width={CANVAS.w} height={CANVAS.h} fill="url(#wall)" />
      {/* 창 밖 풍경 */}
      <g filter="url(#wcSoft)">
        <rect x={340} y={130} width={660} height={740} fill="url(#sky)" />
        <ellipse cx={420} cy={700} rx={260} ry={180} fill="#B9CFAE" opacity={0.8} filter="url(#blur14)" />
        <ellipse cx={760} cy={760} rx={300} ry={150} fill="#A9C39C" opacity={0.75} filter="url(#blur14)" />
        <ellipse cx={560} cy={560} rx={150} ry={110} fill="#C9DDB8" opacity={0.6} filter="url(#blur14)" />
        <ellipse cx={900} cy={620} rx={170} ry={120} fill="#D3E3C3" opacity={0.55} filter="url(#blur14)" />
      </g>
      <rect x={340} y={130} width={660} height={740} fill="url(#sunGlowG)" opacity={glow} />
      {/* 창틀 */}
      <g fill={G.cream} stroke="#E7DCCB" strokeWidth={2}>
        <rect x={316} y={106} width={708} height={24} />
        <rect x={316} y={862} width={708} height={26} />
        <rect x={316} y={106} width={26} height={782} />
        <rect x={998} y={106} width={26} height={782} />
        <rect x={660} y={106} width={20} height={782} />
        <rect x={316} y={480} width={708} height={18} />
      </g>
      <rect x={300} y={886} width={740} height={40} fill="#F1E4D0" />
      <rect x={300} y={926} width={740} height={10} fill="#D9C7AE" opacity={0.6} />
      {/* 창턱의 작은 화분 */}
      <g transform="translate(410 886)" filter="url(#wcSoft)">
        <path d="M-34,0 L34,0 L26,-60 L-26,-60 Z" fill="#C98B6A" />
        <rect x={-30} y={-66} width={60} height={10} rx={3} fill="#D9A383" />
        {[-14, 0, 14].map((dx, i) => (
          <g key={i}>
            <path d={`M${dx},-66 q ${dx * 0.6} -60 ${dx * 0.8} -120`} stroke="#9FB38A" strokeWidth={4} fill="none" strokeLinecap="round" />
            <ellipse cx={dx * 0.8 + dx} cy={-186 + i * 8} rx={9} ry={14} fill="#B8C9A0" />
          </g>
        ))}
      </g>
      {/* 커튼 (오른쪽) */}
      <g transform={`translate(${sway} 0)`} filter="url(#wcSoft)">
        <rect x={950} y={70} width={240} height={1240} rx={10} fill="url(#curtain)" />
        {[985, 1030, 1075, 1120, 1160].map((x, i) => (
          <path key={i} d={`M${x},80 C ${x + 10},400 ${x - 10},800 ${x + 6},1300`} stroke="#E2D2BB" strokeWidth={6} fill="none" opacity={0.7} />
        ))}
      </g>
    </g>
  );
};

/* ---------- 햇살 광선 ---------- */
const Rays: React.FC<{frame: number}> = ({frame}) => {
  const pulse = 0.9 + 0.1 * Math.sin(frame * 0.02);
  return (
    <g opacity={pulse}>
      <polygon points="420,160 960,160 760,1700 -200,1700" fill={G.light} opacity={0.3} filter="url(#blur40)" />
      <polygon points="560,160 820,160 520,1500 60,1500" fill="#FFF8E0" opacity={0.16} filter="url(#blur40)" />
      <polygon points="700,160 980,160 980,1300 420,1300" fill="#FFF1C9" opacity={0.1} filter="url(#blur40)" />
    </g>
  );
};

/* ---------- 중경: 책장, 책상 ---------- */
const BOOK_COLORS = ['#C97A66', '#7E9A7B', '#D9B36A', '#6F7FA3', '#B98B7A', '#E0C9A6', '#8A6E58', '#A9B7C6', '#C9A0A0'];
const SHELF_Y = [640, 860, 1080];
const BOOKS = SHELF_Y.flatMap((sy, row) => {
  const books: {x: number; w: number; h: number; c: string; y: number; tilt: number}[] = [];
  let x = -236;
  let i = 0;
  while (x < 250) {
    const w = 30 + random(`bw${row}${i}`) * 30;
    const h = 130 + random(`bh${row}${i}`) * 70;
    books.push({x, w, h, c: BOOK_COLORS[(row * 3 + i) % BOOK_COLORS.length], y: sy, tilt: i === 5 && row === 1 ? -8 : 0});
    x += w + 3;
    i += 1;
  }
  return books;
});

const Mid: React.FC<{frame: number}> = ({frame}) => (
  <g>
    {/* 책장 */}
    <g filter="url(#wc)">
      <rect x={-270} y={420} width={580} height={850} fill="#A77A52" />
      <rect x={-258} y={432} width={556} height={826} fill="#B98A5E" />
      {SHELF_Y.map((y) => (
        <rect key={y} x={-270} y={y} width={580} height={22} fill="#8F6540" />
      ))}
      {BOOKS.map((b, i) => (
        <g key={i} transform={`rotate(${b.tilt} ${b.x + b.w / 2} ${b.y})`}>
          <rect x={b.x} y={b.y - b.h} width={b.w} height={b.h} rx={3} fill={b.c} />
          <rect x={b.x + 4} y={b.y - b.h + 14} width={b.w - 8} height={6} fill="rgba(255,255,255,0.35)" />
          <rect x={b.x + 4} y={b.y - 22} width={b.w - 8} height={4} fill="rgba(0,0,0,0.12)" />
        </g>
      ))}
      {/* 맨 위 선반의 작은 액자 */}
      <rect x={150} y={500} width={110} height={130} fill="#F4EBDC" stroke="#8F6540" strokeWidth={8} />
      <ellipse cx={205} cy={575} rx={30} ry={22} fill="#B9CFAE" />
      <circle cx={222} cy={548} r={12} fill="#F3D16A" />
    </g>
    {/* 책상 */}
    <g filter="url(#wcSoft)">
      <polygon points="-300,1235 1380,1235 1380,1565 -300,1565" fill="url(#deskTop)" />
      {[1270, 1320, 1375, 1430, 1490, 1540].map((y, i) => (
        <path
          key={i}
          d={`M-300,${y} C 200,${y - 6 + (i % 2) * 10} 700,${y + 8 - (i % 3) * 6} 1380,${y - 4}`}
          stroke={G.woodDark}
          strokeWidth={2}
          fill="none"
          opacity={0.35}
        />
      ))}
      <rect x={-300} y={1565} width={1680} height={80} fill={G.woodEdge} />
      <rect x={-300} y={1645} width={1680} height={500} fill="url(#floorG)" />
    </g>
    {/* 책상 위 따뜻한 빛 반사 */}
    <ellipse cx={700} cy={1330} rx={420} ry={90} fill="#FFF3D4" opacity={0.35} filter="url(#blur40)" />
    <g opacity={0.0}>{frame}</g>
  </g>
);

/* ---------- 근경: 오르골, 민속 인형, 노트, 찻잔 ---------- */
const MusicBox: React.FC<{frame: number}> = ({frame}) => {
  const crank = frame * 0.9; // 느리게 도는 손잡이
  const drum = (frame * 0.4) % 20;
  return (
    <g transform="translate(720 1300)" filter="url(#wc)">
      <ellipse cx={10} cy={150} rx={140} ry={26} fill="#7A5636" opacity={0.22} filter="url(#blur14)" />
      {/* 열린 뚜껑 */}
      <polygon points="-82,8 92,8 86,-108 -76,-108" fill="#B07A4E" />
      <polygon points="-70,0 80,0 75,-96 -64,-96" fill="#D8B48C" />
      <rect x={-40} y={-80} width={80} height={56} rx={6} fill="#EFE3D0" opacity={0.9} />
      {/* 몸체 */}
      <polygon points="-96,12 112,12 128,36 -80,36" fill="#C9935F" />
      <rect x={-96} y={36} width={208} height={100} fill="#B07A4E" />
      <polygon points="112,12 128,36 128,136 112,136" fill="#8F5F3A" />
      <rect x={-96} y={36} width={208} height={100} fill="none" stroke="#8F5F3A" strokeWidth={3} />
      {/* 안쪽 황동 실린더 */}
      <rect x={-60} y={14} width={120} height={20} rx={10} fill="#D9B35A" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={-50 + ((i * 20 + drum) % 120)} cy={24} r={2.5} fill="#8A6A22" />
      ))}
      {/* 크랭크 손잡이 */}
      <g transform={`translate(128 90) rotate(${crank})`}>
        <rect x={-3} y={-3} width={26} height={6} fill="#D9B35A" />
        <circle cx={26} cy={0} r={6} fill="#C89A3E" />
      </g>
      <circle cx={128} cy={90} r={5} fill="#8A6A22" />
    </g>
  );
};

const FolkDoll: React.FC = () => (
  <g transform="translate(520 1350)" filter="url(#wc)">
    <ellipse cx={0} cy={94} rx={70} ry={16} fill="#7A5636" opacity={0.22} filter="url(#blur14)" />
    <path d="M-58,90 C-72,30 -52,-20 -30,-60 C-18,-86 18,-86 30,-60 C52,-20 72,30 58,90 Z" fill="#D96B5B" />
    <path d="M-30,-60 C-18,-86 18,-86 30,-60 C 36,-46 34,-30 28,-24 L-28,-24 C-34,-30 -36,-46 -30,-60 Z" fill="#F3D9A4" />
    <circle cx={0} cy={-52} r={22} fill="#FBE9D2" />
    <circle cx={-8} cy={-56} r={2.5} fill="#3E2A1E" />
    <circle cx={8} cy={-56} r={2.5} fill="#3E2A1E" />
    <path d="M-7,-44 q 7 6 14 0" stroke="#B35A4A" strokeWidth={2} fill="none" strokeLinecap="round" />
    <circle cx={-13} cy={-47} r={4} fill="#F4A9A0" opacity={0.7} />
    <circle cx={13} cy={-47} r={4} fill="#F4A9A0" opacity={0.7} />
    <ellipse cx={0} cy={30} rx={34} ry={40} fill="#F6E4C6" />
    {[[0, 18], [-16, 36], [16, 36], [0, 52]].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={7} fill={i % 2 ? '#F3D16A' : '#E88A7C'} />
        <circle cx={x} cy={y} r={2.5} fill="#7FA87A" />
      </g>
    ))}
  </g>
);

const Notebook: React.FC = () => (
  <g filter="url(#wcSoft)" transform="translate(0 -60)">
    <polygon points="320,1420 800,1420 830,1580 290,1580" fill="#7A5636" opacity={0.18} filter="url(#blur14)" />
    <polygon points="330,1400 560,1396 580,1545 310,1552" fill="#FFFBF2" />
    <polygon points="560,1396 792,1400 812,1552 580,1545" fill="#FFF9EE" />
    <path d="M560,1396 L580,1545" stroke="#D9CBB6" strokeWidth={3} />
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const y = 1428 + i * 20;
      return (
        <g key={i} stroke="#DDD2C2" strokeWidth={1.5} fill="none">
          <line x1={348 - i * 2} y1={y} x2={548 + i * 2} y2={y - 1} />
          <line x1={580 + i * 2} y1={y - 1} x2={780 + i * 2} y2={y} />
        </g>
      );
    })}
    {/* 손글씨 느낌의 선 (글자 아님) */}
    {[0, 1, 2, 3].map((i) => (
      <path
        key={i}
        d={`M${356 - i} ${1424 + i * 20} q 14 -8 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 20 0`}
        stroke="#B9AB98"
        strokeWidth={2}
        fill="none"
        opacity={0.75 - i * 0.12}
      />
    ))}
    {/* 만년필 */}
    <g transform="rotate(-18 690 1500)">
      <rect x={600} y={1490} width={190} height={16} rx={8} fill="#2E3B55" />
      <rect x={740} y={1490} width={50} height={16} rx={8} fill="#1F2A3F" />
      <polygon points="600,1492 570,1498 600,1504" fill="#D9B35A" />
      <rect x={690} y={1491} width={6} height={14} fill="#D9B35A" />
    </g>
  </g>
);

const TeaCup: React.FC<{frame: number}> = ({frame}) => {
  const steam = (i: number) => {
    const t = (frame * 0.9 + i * 50) % 150;
    const op = interpolate(t, [0, 30, 120, 150], [0, 0.55, 0.3, 0], CLAMP);
    const dy = -t * 0.9;
    return {op, dy, dx: Math.sin((frame * 0.05 + i * 2) % (Math.PI * 2)) * 6};
  };
  return (
    <g transform="translate(960 1400)" filter="url(#wcSoft)">
      <ellipse cx={0} cy={56} rx={80} ry={16} fill="#7A5636" opacity={0.2} filter="url(#blur14)" />
      <ellipse cx={0} cy={50} rx={78} ry={18} fill="#F1E6D6" />
      <ellipse cx={0} cy={48} rx={60} ry={12} fill="#E6D8C4" />
      <path d="M-50,-10 C-52,30 -36,46 0,46 C36,46 52,30 50,-10 Z" fill="#F4EBDD" />
      <path d="M50,0 C78,-2 80,30 52,34" stroke="#F4EBDD" strokeWidth={10} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-10} rx={50} ry={14} fill="#E9DCC9" />
      <ellipse cx={0} cy={-9} rx={42} ry={10} fill="#C98B52" />
      {[0, 1, 2].map((i) => {
        const s = steam(i);
        return (
          <path
            key={i}
            d={`M${-16 + i * 16},-20 c -10,-20 10,-30 0,-50 c -8,-16 8,-26 0,-40`}
            stroke="#FFFFFF"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
            opacity={s.op}
            transform={`translate(${s.dx} ${s.dy})`}
          />
        );
      })}
    </g>
  );
};

const Near: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <FolkDoll />
    <MusicBox frame={frame} />
    <TeaCup frame={frame} />
    <Notebook />
  </g>
);

/* ---------- 먼지 입자 ---------- */
const MOTES = Array.from({length: 80}, (_, i) => ({
  x: 150 + random(`mx${i}`) * 900,
  y: 150 + random(`my${i}`) * 1400,
  r: 1.5 + random(`mr${i}`) * 4,
  vx: (random(`mvx${i}`) - 0.5) * 0.5,
  vy: 0.12 + random(`mvy${i}`) * 0.3,
  ph: random(`mp${i}`) * Math.PI * 2,
  sp: 0.03 + random(`ms${i}`) * 0.05,
}));

const Dust: React.FC<{frame: number}> = ({frame}) => (
  <g>
    {MOTES.map((m, i) => {
      const x = m.x + Math.sin(frame * 0.012 + m.ph) * 30 + frame * m.vx;
      const y = ((m.y + frame * m.vy + Math.sin(frame * 0.02 + m.ph) * 10) % 1500) + 150;
      const op = 0.15 + 0.6 * (0.5 + 0.5 * Math.sin(frame * m.sp + m.ph));
      return <circle key={i} cx={x} cy={y} r={m.r} fill="#FFF8E6" opacity={op} />;
    })}
  </g>
);

/* ---------- 장면 조립 ---------- */
export const DeskScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = useCamera(frame);
  const farBlur = interpolate(cam.zoom, [1, 1.22], [1.2, 2.6], CLAMP);
  return (
    <AbsoluteFill style={{backgroundColor: G.wallBottom, overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <Defs />
      </svg>
      <Layer cam={cam} depth={0.6} blur={farBlur}>
        <Far frame={frame} />
      </Layer>
      <Layer cam={cam} depth={0.7}>
        <Rays frame={frame} />
      </Layer>
      <Layer cam={cam} depth={0.85} blur={0.6}>
        <Mid frame={frame} />
      </Layer>
      <Layer cam={cam} depth={1.0}>
        <Near frame={frame} />
      </Layer>
      <Layer cam={cam} depth={1.1} style={{filter: 'blur(0.8px)'}}>
        <Dust frame={frame} />
      </Layer>
      {/* 종이 질감 + 비네팅 (카메라와 무관한 '그림' 표면) */}
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <svg width={1080} height={1920} style={{position: 'absolute', mixBlendMode: 'multiply'}}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="2" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0.09 0" />
          </filter>
          <rect width={1080} height={1920} filter="url(#grain)" />
        </svg>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(70,45,25,0.28) 100%)'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
