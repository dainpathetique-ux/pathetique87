export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TOTAL_FRAMES = 900; // 30초

// 씬 경계(절대 프레임)
export const SCENE = {
  intro: {from: 0, to: 150},
  first: {from: 150, to: 360},
  middle: {from: 360, to: 570},
  end: {from: 570, to: 750},
  outro: {from: 750, to: 900},
} as const;

// 씬 전환 시 앞 씬을 조금 더 남겨 두고 뒤 씬이 위에서 페이드인한다.
export const SCENE_FADE = 14;

export const COLORS = {
  coral: '#FF6B4A', // 'sm' 강조색 (코랄 오렌지)
  ink: '#1F2A44',
  inkSoft: '#4A5577',
  mintLight: '#D8F3DC',
  mint: '#A8E6CF',
  creamLight: '#FFF9E6',
  cream: '#FFEFC2',
  navy: '#34406B',
  navyDeep: '#1E2748',
  lavender: '#E6E0FF',
  sky: '#CDE7FF',
  offWhite: '#FBFAF6',
  sun: '#FFD93D',
  sunEdge: '#F0B429',
} as const;

export const FONT_FAMILY = `'Noto Sans KR', 'Pretendard', 'DejaVu Sans', 'Noto Sans', sans-serif`;

export const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;
