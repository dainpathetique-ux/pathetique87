import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// tool/ 에서 복사한 Noto Sans KR (400/700). IPA 기호 등 누락 글리프는 DejaVu Sans 로 폴백된다.
export const loadFonts = () =>
  Promise.all([
    loadFont({family: 'Noto Sans KR', url: staticFile('fonts/kr400.woff2'), weight: '400'}),
    loadFont({family: 'Noto Sans KR', url: staticFile('fonts/kr700.woff2'), weight: '700'}),
  ]);
