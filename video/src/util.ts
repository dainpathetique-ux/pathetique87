import {interpolate} from 'remotion';
import {CLAMP, SCENE_FADE} from './constants';

/** 씬 시작 시 페이드인 (앞 씬 위에 겹쳐서 자연스럽게 전환) */
export const sceneFadeIn = (frame: number) => interpolate(frame, [0, SCENE_FADE], [0, 1], CLAMP);

export const deg = (rad: number) => (rad * 180) / Math.PI;

/** 4각 반짝이 별 path (중심 0,0) */
export const sparklePath = (s: number) => {
  const k = 0.28 * s;
  return `M0,${-s} L${k},${-k} L${s},0 L${k},${k} L0,${s} L${-k},${k} L${-s},0 L${-k},${-k} Z`;
};

export const heartPath =
  'M0,12 C-4,-4 -30,-6 -30,14 C-30,32 -8,42 0,54 C8,42 30,32 30,14 C30,-6 4,-4 0,12 Z';

export const petalPath = 'M0,-40 C22,-32 24,30 0,42 C-24,30 -22,-32 0,-40 Z';
