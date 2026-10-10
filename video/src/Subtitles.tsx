import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CLAMP, COLORS, SCENE} from './constants';

export type Cue = {
  from: number;
  to: number;
  text: string; // "라벨: Word (/ipa/) - 한글 (뜻)" 형식이면 ' - ' 앞뒤를 두 줄로 나눈다.
  position: 'top' | 'bottom';
  size?: number;
};

const CUES: Cue[] = [
  {from: SCENE.intro.from, to: SCENE.intro.to, text: '오늘의 소리: 이중자음 sm', position: 'top', size: 64},
  {from: 150, to: 255, text: '첫소리: Small (/smɔːl/) - 스몰 (작은)', position: 'bottom'},
  {from: 255, to: 360, text: '첫소리: Smile (/smaɪl/) - 스마일 (미소)', position: 'bottom'},
  {from: 360, to: 465, text: '중간소리: Cosmic (/ˈkɑːz.mɪk/) - 코즈믹 (우주의)', position: 'bottom'},
  {from: 465, to: 570, text: '중간소리: Jasmine (/ˈdʒæz.mɪn/) - 재스민 (재스민)', position: 'bottom'},
  {from: 570, to: 750, text: '끝소리: Prism (/ˈprɪz.əm/) - 프리즘 (프리즘)', position: 'bottom'},
  {from: 750, to: 900, text: '언어의 깊이를 더하는 배움터 | ON글터영어국어학원', position: 'bottom', size: 46},
];

/** 로마자 구간의 강조 철자(기본 'sm')를 코랄 오렌지로 강조한다 (대소문자 무관). */
const Highlight: React.FC<{text: string; mark: string}> = ({text, mark}) => {
  const parts = text.split(new RegExp(`(${mark})`, 'gi'));
  const isMark = new RegExp(`^${mark}$`, 'i');
  return (
    <>
      {parts.map((p, i) =>
        isMark.test(p) ? (
          <span key={i} style={{color: COLORS.coral}}>
            {p}
          </span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
};

const SubtitleBox: React.FC<{cue: Cue; frame: number; mark: string}> = ({cue, frame, mark}) => {
  const {fps} = useVideoConfig();
  const local = frame - cue.from;
  const remaining = cue.to - frame;
  const enter = spring({frame: local, fps, config: {damping: 14, stiffness: 160, mass: 0.7}});
  const fadeIn = interpolate(local, [0, 8], [0, 1], CLAMP);
  const fadeOut = interpolate(remaining, [0, 8], [0, 1], CLAMP);
  const opacity = Math.min(fadeIn, fadeOut);
  const translateY = interpolate(enter, [0, 1], [cue.position === 'top' ? -40 : 40, 0]);
  const scale = interpolate(enter, [0, 1], [0.92, 1]);

  const [head, tail] = cue.text.includes(' - ') ? cue.text.split(' - ') : [cue.text, null];
  const size = cue.size ?? 58;
  // "라벨: Word (/ipa/)" → IPA 구간은 줄바꿈하지 않는다. 긴 자막은 글자 크기를 조금 줄인다.
  const ipaMatch = head.match(/^(.*?)\s(\(\/.*\/\))$/);
  const word = ipaMatch ? ipaMatch[1] : head;
  const ipa = ipaMatch ? ipaMatch[2] : null;
  const headSize = head.length > 26 ? size * 0.9 : size;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: cue.position === 'top' ? 190 : undefined,
        bottom: cue.position === 'bottom' ? 250 : undefined,
        display: 'flex',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
    >
      <div
        style={{
          maxWidth: 940,
          padding: '30px 52px',
          borderRadius: 36,
          background: 'rgba(255,255,255,0.90)',
          boxShadow: '0 14px 40px rgba(31,42,68,0.14)',
          border: '3px solid rgba(255,255,255,0.9)',
          textAlign: 'center',
          color: COLORS.ink,
          lineHeight: 1.35,
          wordBreak: 'keep-all',
        }}
      >
        <div style={{fontSize: headSize, fontWeight: 700, letterSpacing: -0.5}}>
          <Highlight text={word} mark={mark} />
          {ipa ? (
            <>
              {' '}
              <span style={{whiteSpace: 'nowrap'}}>
                <Highlight text={ipa} mark={mark} />
              </span>
            </>
          ) : null}
        </div>
        {tail ? (
          <div style={{fontSize: size * 0.8, fontWeight: 400, color: COLORS.inkSoft, marginTop: 6}}>
            {tail}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** 자막 트랙. cues 는 절대 프레임 기준, mark 는 코랄로 강조할 철자. */
export const SubtitleTrack: React.FC<{cues: Cue[]; mark: string}> = ({cues, mark}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {cues.filter((c) => frame >= c.from && frame < c.to).map((c) => (
        <SubtitleBox key={c.from} cue={c} frame={frame} mark={mark} />
      ))}
    </AbsoluteFill>
  );
};

/** 이중자음 sm 숏폼 자막 */
export const Subtitles: React.FC = () => <SubtitleTrack cues={CUES} mark="sm" />;
