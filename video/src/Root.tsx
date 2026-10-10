import React from 'react';
import {Composition, staticFile} from 'remotion';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './constants';
import {SmShorts, type SmShortsProps} from './SmShorts';
import {SnShorts} from './sn/SnShorts';
import {GiftTeaser, type GiftTeaserProps} from './gift/GiftTeaser';
import {GIFT_FRAMES} from './gift/constants';
import {AbcShort, LETTERS, VOWEL_ITEMS, type AbcShortProps} from './abc/AbcShort';

// public/ 폴더에 선택 파일(bgm.mp3, 로고.jpg)이 있는지 확인한다.
const exists = async (file: string): Promise<boolean> => {
  try {
    const res = await fetch(staticFile(file), {method: 'HEAD'});
    if (res.status === 405) {
      const get = await fetch(staticFile(file));
      return get.ok;
    }
    return res.ok;
  } catch {
    return false;
  }
};

export const Root: React.FC = () => {
  return (
    <>
    <Composition
      id="SmShorts"
      component={SmShorts}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{hasBgm: false, hasLogo: true}}
      calculateMetadata={async () => {
        const [hasBgm, hasLogo] = await Promise.all([exists('bgm.mp3'), exists('로고.jpg')]);
        return {props: {hasBgm, hasLogo}};
      }}
    />
    <Composition
      id="SnShorts"
      component={SnShorts}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{hasBgm: false, hasLogo: true}}
      calculateMetadata={async () => {
        const [hasBgm, hasLogo] = await Promise.all([exists('bgm.mp3'), exists('로고.jpg')]);
        return {props: {hasBgm, hasLogo}};
      }}
    />
    <Composition
      id="GiftTeaser"
      component={GiftTeaser}
      durationInFrames={GIFT_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{hasLogo: true, hasBgm: true} as GiftTeaserProps}
      calculateMetadata={async () => {
        const [hasBgm, hasLogo] = await Promise.all([exists('gift/bgm.mp3'), exists('로고.jpg')]);
        return {props: {hasBgm, hasLogo}};
      }}
    />
    {LETTERS.map((l) => (
      <Composition
        key={l.letter}
        id={`ABC-${l.letter}`}
        component={AbcShort}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{letter: l.letter} as AbcShortProps}
      />
    ))}
    {VOWEL_ITEMS.map((v) => (
      <Composition
        key={v.letter}
        id={`VOWEL-${v.letter}`}
        component={AbcShort}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{letter: v.letter} as AbcShortProps}
      />
    ))}
    </>
  );
};
