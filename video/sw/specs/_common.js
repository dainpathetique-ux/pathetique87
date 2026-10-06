// 공통 바닥/소품
module.exports={
  grass:'<ellipse cx="540" cy="1900" rx="1000" ry="360" fill="#9ad97f"/><ellipse cx="300" cy="1880" rx="600" ry="160" fill="#86cc6b"/>',
  water:'<rect x="0" y="1250" width="1080" height="700" fill="#7fd0f2"/><ellipse cx="540" cy="1250" rx="700" ry="60" fill="#9fdcf5"/>',
  snowGround:'<ellipse cx="540" cy="1900" rx="1000" ry="380" fill="#ffffff"/><ellipse cx="300" cy="1880" rx="600" ry="160" fill="#eef6fb"/>',
  table:'<rect x="0" y="1380" width="1080" height="600" fill="#e9c9a3"/><rect x="0" y="1380" width="1080" height="30" fill="#d9b48c"/>',
  face:(mouth)=>`<circle cx="0" cy="0" r="150" fill="#ffd9b8"/><path d="M-150,-20 Q-120,-180 0,-170 Q120,-180 150,-20 Q100,-120 0,-110 Q-100,-120 -150,-20Z" fill="#4a3324"/>${mouth}`,
};
// 추가 공통 소품
module.exports.sky='<ellipse cx="540" cy="1900" rx="1000" ry="360" fill="#9ad97f"/>';
module.exports.room='<rect x="0" y="1350" width="1080" height="600" fill="#f3e2c8"/><rect x="0" y="1350" width="1080" height="24" fill="#d9c3a3"/>';
module.exports.child=(mouth,shirt)=>`<g data-anim="sway" data-origin="0 300" data-amp="0.2">${module.exports.face(mouth)}<path d="M-190,340 Q-170,160 0,150 Q170,160 190,340Z" fill="${shirt}"/></g>`;
module.exports.smile='<path d="M-50,70 Q0,120 50,70" stroke="#243b36" stroke-width="7" fill="none"/><circle cx="-50" cy="-10" r="11" fill="#243b36"/><circle cx="50" cy="-10" r="11" fill="#243b36"/><circle cx="-95" cy="40" r="18" fill="#ffb3a0" opacity=".7"/><circle cx="95" cy="40" r="18" fill="#ffb3a0" opacity=".7"/>';
