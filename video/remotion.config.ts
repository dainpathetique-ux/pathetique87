import {Config} from '@remotion/cli/config';
import fs from 'node:fs';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(90);
Config.setOverwriteOutput(true);
Config.setConcurrency(2);

// 클라우드 컨테이너에는 Playwright용 Chromium이 미리 설치되어 있다.
// 있으면 그것을 쓰고, 없으면 Remotion이 직접 브라우저를 내려받는다.
const prebuilt = [
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
].find((p) => fs.existsSync(p));
if (prebuilt) {
  Config.setBrowserExecutable(prebuilt);
}
