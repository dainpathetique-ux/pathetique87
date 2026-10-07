import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CLAMP, COLORS, FONT_FAMILY, HEIGHT, SCENE_FADE, WIDTH} from '../constants';
import {loadFonts} from '../fonts';
import {sparklePath} from '../util';
import DATA from './data.json';
import {ABC_VOICE} from './voiceCues';

loadFonts();

type Word = {word: string; ipa: string; reading: string; meaning: string; emoji: string};
type Letter = {letter: string; nameKo: string; words: Word[]};
export type AbcShortProps = {letter: string};

export const LETTERS: Letter[] = DATA as Letter[];

// 파스텔 테마 (인트로 + 단어 3개에 순환 적용, 글자마다 시작점이 다르다)
const THEMES = [
  {a: '#D8F3DC', b: '#A8E6CF'}, // 민트
  {a: '#FFF9E6', b: '#FFEFC2'}, // 크림
  {a: '#E6E0FF', b: '#CDE7FF'}, // 라벤더-스카이
  {a: '#FFE8EC', b: '#FFD1DC'}, // 핑크
  {a: '#FFF0E0', b: '#FFD9B8'}, // 피치
  {a: '#E0F4FF', b: '#BFE3FF'}, // 하늘
];
const CONFETTI = ['#FF6B4A', '#FFD93D', '#7FD1B9', '#8EC5FF', '#FF9ECD', '#B39DDB'];

const SCENES = [
  {from: 0, to: 150},
  {from: 150, to: 360},
  {from: 360, to: 570},
  {from: 570, to: 750},
  {from: 750, to: 900},
];

const fadeIn = (f: number) => interpolate(f, [0, SCENE_FADE], [0, 1], CLAMP);

/** 대상 글자를 코랄색으로 강조 */
const Hi: React.FC<{text: string; letter: string}> = ({text, letter}) => (
  <>
    {text.split('').map((ch, i) =>
      ch.toUpperCase() === letter ? (
        <span key={i} style={{color: COLORS.coral}}>{ch}</span>
      ) : (
        <React.Fragment key={i}>{ch}</React.Fragment>
      ),
    )}
  </>
);

const Box: React.FC<{top?: number; bottom?: number; children: React.ReactNode; frame: number; size?: number}> = ({top, bottom, children, frame, size = 58}) => {
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 160, mass: 0.7}});
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, top, bottom, display: 'flex', justifyContent: 'center',
        opacity: interpolate(frame, [0, 8], [0, 1], CLAMP),
        transform: `translateY(${interpolate(enter, [0, 1], [top !== undefined ? -40 : 40, 0])}px) scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
      }}
    >
      <div style={{
        maxWidth: 960, padding: '28px 50px', borderRadius: 36, background: 'rgba(255,255,255,0.9)',
        boxShadow: '0 14px 40px rgba(31,42,68,0.14)', border: '3px solid rgba(255,255,255,0.9)',
        textAlign: 'center', color: COLORS.ink, lineHeight: 1.35, fontSize: size, fontWeight: 700, wordBreak: 'keep-all',
      }}>
        {children}
      </div>
    </div>
  );
};

/* ---------- 1. 인트로: 큰 글자 Aa 가 그려지며 등장 ---------- */
const SPARKS = Array.from({length: 18}, (_, i) => ({
  x: 90 + random(`ax${i}`) * 900, y: 420 + random(`ay${i}`) * 1000,
  s: 12 + random(`as${i}`) * 20, ph: random(`ap${i}`) * 6.28, delay: 10 + i * 2,
}));

const IntroScene: React.FC<{letter: string; theme: {a: string; b: string}}> = ({letter, theme}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const up = spring({frame: frame - 4, fps, config: {damping: 10, stiffness: 110}});
  const low = spring({frame: frame - 14, fps, config: {damping: 10, stiffness: 110}});
  const draw = interpolate(frame, [6, 70], [3200, 0], {...CLAMP, easing: Easing.inOut(Easing.quad)});
  const fill = interpolate(frame, [36, 80], [0, 1], CLAMP);
  const bob = Math.sin(frame * 0.09) * 14;
  const textStyle = {fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 520, fill: COLORS.ink, fillOpacity: fill, stroke: '#FFFFFF', strokeWidth: 12, strokeDasharray: 3200, strokeDashoffset: draw, paintOrder: 'stroke' as const};
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${theme.a}, ${theme.b})`, opacity: fadeIn(frame)}}>
      <svg width={WIDTH} height={HEIGHT}>
        <circle cx={160} cy={420} r={220} fill="rgba(255,255,255,0.28)" />
        <circle cx={940} cy={1500} r={260} fill="rgba(255,255,255,0.25)" />
        {SPARKS.map((s, i) => {
          const a = spring({frame: frame - s.delay, fps, config: {damping: 10, stiffness: 140}});
          const tw = 0.5 + 0.5 * Math.sin(frame * 0.15 + s.ph);
          return <path key={i} d={sparklePath(s.s)} fill="#FFD93D" stroke="#F0B429" strokeWidth={1.5} opacity={tw * a} transform={`translate(${s.x} ${s.y}) rotate(${frame * 0.6 + i * 20}) scale(${0.7 + 0.5 * tw})`} />;
        })}
        <g transform={`translate(0 ${bob})`}>
          <text x={330} y={1120} textAnchor="middle" style={textStyle} transform={`scale(${up}) `} transform-origin="330 980">{letter}</text>
          <text x={760} y={1120} textAnchor="middle" style={{...textStyle, fontSize: 440}} transform={`scale(${low})`} transform-origin="760 980">{letter.toLowerCase()}</text>
        </g>
      </svg>
      <Box top={190} frame={frame} size={64}>오늘의 알파벳: <span style={{color: COLORS.coral}}>{letter}{letter.toLowerCase()}</span></Box>
    </AbsoluteFill>
  );
};

/* ---------- 2~4. 단어 장면: 이모지 카드가 팡 터지며 등장 ---------- */
const BURST = Array.from({length: 16}, (_, i) => ({
  angle: (i / 16) * Math.PI * 2 + random(`ba${i}`) * 0.3, dist: 380 + random(`bd${i}`) * 160,
  size: 10 + random(`bs${i}`) * 12, color: CONFETTI[i % CONFETTI.length], star: i % 3 === 0, delay: random(`bt${i}`) * 5,
}));

const WordScene: React.FC<{letter: string; w: Word; theme: {a: string; b: string}}> = ({letter, w, theme}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - 6, fps, config: {damping: 8, stiffness: 120, mass: 0.9}});
  const bob = Math.sin(frame * 0.1) * 12;
  const tilt = Math.sin(frame * 0.05) * 3;
  const wordIn = spring({frame: frame - 18, fps, config: {damping: 12, stiffness: 120}});
  const ring = interpolate(frame, [6, 40], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const fontSize = w.word.length > 8 ? 112 : 136;
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${theme.a}, ${theme.b})`, opacity: fadeIn(frame)}}>
      <svg width={WIDTH} height={HEIGHT}>
        <circle cx={900} cy={380} r={200} fill="rgba(255,255,255,0.35)" />
        <circle cx={140} cy={1500} r={150} fill="rgba(255,255,255,0.3)" />
        <circle cx={540} cy={1010} r={330 + ring * 420} fill="none" stroke="#FFFFFF" strokeWidth={10 * (1 - ring)} opacity={1 - ring} />
        {BURST.map((p, i) => {
          const t = frame - 6 - p.delay;
          const d = interpolate(t, [0, 40], [120, p.dist], {...CLAMP, easing: Easing.out(Easing.cubic)});
          const op = interpolate(t, [0, 6, 60, 95], [0, 1, 1, 0], CLAMP);
          const x = 540 + Math.cos(p.angle) * d;
          const y = 1010 + Math.sin(p.angle) * d * 0.95 - Math.max(0, t) * 1.2;
          return p.star
            ? <path key={i} d={sparklePath(p.size)} fill={p.color} opacity={op} transform={`translate(${x} ${y}) rotate(${t * 3})`} />
            : <circle key={i} cx={x} cy={y} r={p.size * 0.6} fill={p.color} opacity={op} />;
        })}
      </svg>
      {/* 단어 (대상 글자 강조) */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 700, fontSize, color: COLORS.ink, letterSpacing: -1, opacity: wordIn, transform: `translateY(${(1 - wordIn) * 30}px)`, textShadow: '0 4px 24px rgba(255,255,255,0.9)'}}>
        <Hi text={w.word} letter={letter} />
      </div>
      {/* 이모지 카드 */}
      <div style={{position: 'absolute', left: 540 - 300, top: 1010 - 300 + bob, width: 600, height: 600, borderRadius: 72, background: '#FFFFFF', boxShadow: '0 30px 70px rgba(31,42,68,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop}) rotate(${tilt}deg)`}}>
        <Img src={staticFile(`emoji/${w.emoji}.svg`)} style={{width: 440, height: 440}} />
      </div>
      <Box bottom={250} frame={frame} size={56}>
        <div>{w.reading} <span style={{fontWeight: 400, color: COLORS.inkSoft}}>{w.ipa}</span></div>
        <div style={{fontSize: 46, fontWeight: 400, color: COLORS.inkSoft, marginTop: 4}}>{w.meaning}</div>
      </Box>
    </AbsoluteFill>
  );
};

/* ---------- 5. 아웃트로 ---------- */
const OutroScene: React.FC<{item: Letter}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fade = interpolate(frame, [0, 30], [0, 1], CLAMP);
  const grow = spring({frame, fps, config: {damping: 16, stiffness: 70}});
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.offWhite, opacity: interpolate(frame, [0, 14], [0, 1], CLAMP), alignItems: 'center'}}>
      <div style={{display: 'flex', gap: 40, marginTop: 420}}>
        {item.words.map((w, i) => {
          const s = spring({frame: frame - 8 - i * 6, fps, config: {damping: 9, stiffness: 130}});
          return (
            <div key={w.emoji} style={{width: 200, height: 200, borderRadius: 44, background: '#FFFFFF', boxShadow: '0 16px 40px rgba(31,42,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`}}>
              <Img src={staticFile(`emoji/${w.emoji}.svg`)} style={{width: 140, height: 140}} />
            </div>
          );
        })}
      </div>
      <div style={{marginTop: 90, opacity: fade, transform: `scale(${interpolate(grow, [0, 1], [0.92, 1])})`, borderRadius: 32, background: '#FFFFFF', padding: 28, boxShadow: '0 24px 60px rgba(31,42,68,0.14)'}}>
        <Img src={staticFile('로고.jpg')} style={{width: 720, display: 'block', borderRadius: 18}} />
      </div>
      <Box bottom={250} frame={frame} size={46}>언어의 깊이를 더하는 배움터 | ON글터영어국어학원</Box>
    </AbsoluteFill>
  );
};

/* ---------- 조립 ---------- */
const BGM_LEVEL = 0.5, DUCK_DEPTH = 0.65, DUCK_RAMP = 6;

export const AbcShort: React.FC<AbcShortProps> = ({letter}) => {
  const frame = useCurrentFrame();
  const item = LETTERS.find((l) => l.letter === letter)!;
  const idx = letter.charCodeAt(0) - 65;
  const theme = (k: number) => THEMES[(idx + k) % THEMES.length];
  const cues = ABC_VOICE[letter] ?? [];
  const duck = Math.max(0, ...cues.map((c) => interpolate(frame, [c.from - DUCK_RAMP, c.from, c.from + c.durationInFrames, c.from + c.durationInFrames + DUCK_RAMP], [0, 1, 1, 0], CLAMP)));
  const bgm = BGM_LEVEL * (1 - DUCK_DEPTH * duck) * interpolate(frame, [840, 900], [1, 0], CLAMP);
  return (
    <AbsoluteFill style={{fontFamily: FONT_FAMILY, backgroundColor: '#fff'}}>
      <Sequence name="인트로" from={SCENES[0].from} durationInFrames={150 + SCENE_FADE}><IntroScene letter={letter} theme={theme(0)} /></Sequence>
      {item.words.map((w, i) => (
        <Sequence key={w.word} name={w.word} from={SCENES[i + 1].from} durationInFrames={SCENES[i + 1].to - SCENES[i + 1].from + SCENE_FADE}>
          <WordScene letter={letter} w={w} theme={theme(i + 1)} />
        </Sequence>
      ))}
      <Sequence name="아웃트로" from={750} durationInFrames={150}><OutroScene item={item} /></Sequence>
      {cues.map((c) => (
        <Sequence key={c.src} name={`🎙 ${c.text}`} from={c.from} durationInFrames={c.durationInFrames}><Audio src={staticFile(c.src)} /></Sequence>
      ))}
      <Audio src={staticFile('bgm.mp3')} loop volume={bgm} />
    </AbsoluteFill>
  );
};
