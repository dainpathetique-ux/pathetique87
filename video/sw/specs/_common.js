// 공통 바닥/소품
module.exports={
  grass:'<ellipse cx="540" cy="1900" rx="1000" ry="360" fill="#9ad97f"/><ellipse cx="300" cy="1880" rx="600" ry="160" fill="#86cc6b"/>',
  water:'<rect x="0" y="1250" width="1080" height="700" fill="#7fd0f2"/><ellipse cx="540" cy="1250" rx="700" ry="60" fill="#9fdcf5"/>',
  snowGround:'<ellipse cx="540" cy="1900" rx="1000" ry="380" fill="#ffffff"/><ellipse cx="300" cy="1880" rx="600" ry="160" fill="#eef6fb"/>',
  table:'<rect x="0" y="1380" width="1080" height="600" fill="#e9c9a3"/><rect x="0" y="1380" width="1080" height="30" fill="#d9b48c"/>',
  face:(mouth)=>`<circle cx="0" cy="0" r="150" fill="#ffd9b8"/><path d="M-150,-20 Q-120,-180 0,-170 Q120,-180 150,-20 Q100,-120 0,-110 Q-100,-120 -150,-20Z" fill="#4a3324"/>${mouth}`,
};
