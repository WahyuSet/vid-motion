// Si Cicak: mascot of @cicaktahu. A house gecko seen from above, the way you see one on the wall,
// so it can crawl in any direction (rot) across the picture.
//   cicak(x, y, s, pose, t, rot = 0, walk = null, faceKind = null)
//   pose: 'happy' (waves) | 'cheer' (both arms up) | 'point' (points right) | 'think' (hand to chin)
//         | 'verdict' (magnifier) | 'shock' (tail drops off) | 'calm'
//   faceKind: any of FACES (engine/faces.js); default depends on the pose (POSE_FACE)
//   walk: a phase in radians; when set the legs step (use t * speed)

const GECKO = { body: '#9CCB6B', dark: '#6E9E46', spot: '#7FB255' };

function cicak(x, y, s, pose = 'happy', t = 0, rot = 0, walk = null, faceKind = null) {
  const c = GECKO.body, sway = Math.sin(t * 3) * 6 + (walk !== null ? Math.sin(walk) * 10 : 0);
  const wave = 10 * Math.sin(t * 9);
  let g = '';
  // tail (drops off when shocked, a real gecko trick)
  const tail = `<path d="M-24,80 C-30,160 40,170 52,232 C56,252 70,250 66,228 C56,160 22,150 24,80 Z" fill="${c}" ${stroke(6)}/>` +
    `<circle cx="30" cy="170" r="6" fill="${GECKO.spot}"/><circle cx="52" cy="206" r="5" fill="${GECKO.spot}"/>`;
  g += pose === 'shock' ? G(T(46, 40, 1, 28), 1, tail) + `<path d="M70,150 l14,-8 M76,170 l16,0 M70,190 l14,8" ${stroke(5)}/>` : G(`rotate(${f(sway)} 0 80)`, 1, tail);
  // legs with sticky toe pads; diagonal pairs step together when walking
  const toes = (x0, y0, a) => [-0.5, 0, 0.5].map(d => `<circle cx="${f(x0 + 20 * Math.cos(a + d))}" cy="${f(y0 + 20 * Math.sin(a + d))}" r="9" fill="${c}" ${stroke(5)}/>`).join('');
  const legs = [
    [-1, -40, -100, -66, -132, -100, -2.2], [1, -40, 100, -66, 132, -100, -0.9],
    [-1, 60, -96, 80, -112, 124, 2.2], [1, 60, 96, 80, 112, 124, 0.9],
  ];
  // front-leg overrides per pose: [end x, end y, toe angle, knee x, knee y]
  const front = {
    happy: { 1: [128 + wave, -150, -1.4] },
    cheer: { 0: [-128 - wave, -156, -1.7], 1: [128 + wave, -156, -1.4] },
    point: { 1: [176, -84, -0.25, 120, -66] },
    think: { 0: [-30, -52, -1.3, -110, -30] },
  }[walk === null ? pose : ''] || {};
  legs.forEach(([sd, y0, kx, ky, ex, ey, a], i) => {
    let ex2 = ex, ey2 = ey, a2 = a, kx2 = kx, ky2 = ky;
    if (walk !== null) ey2 += 22 * Math.sin(walk + (i === 0 || i === 3 ? 0 : Math.PI));
    else if (front[i]) [ex2, ey2, a2, kx2 = kx, ky2 = ky] = front[i];
    g += limb(`M${sd * 40},${y0} Q${kx2},${ky2} ${f(ex2)},${f(ey2)}`, 16, c) + toes(ex2, ey2, a2);
  });
  g += `<path d="M0,-70 C40,-70 46,-20 44,30 C42,80 26,104 0,104 C-26,104 -42,80 -44,30 C-46,-20 -40,-70 0,-70 Z" fill="${c}" ${stroke()}/>`;
  [[-16, -10, 8], [16, 20, 7], [-10, 52, 7], [14, 76, 5], [8, -36, 6]].forEach(([sx, sy, r]) => g += `<circle cx="${sx}" cy="${sy}" r="${r}" fill="${GECKO.spot}"/>`);
  // wide flat head with a rounded snout, eyes bulging out of the sides
  g += `<path d="M0,-184 C54,-184 92,-150 92,-118 C92,-86 56,-66 0,-66 C-56,-66 -92,-86 -92,-118 C-92,-150 -54,-184 0,-184 Z" fill="${c}" ${stroke()}/>`;
  g += `<circle cx="-14" cy="-166" r="3.5" fill="${GECKO.dark}"/><circle cx="14" cy="-166" r="3.5" fill="${GECKO.dark}"/>`;
  g += `<ellipse cx="-50" cy="-92" rx="12" ry="7" fill="${C.cheek}" opacity="0.5"/><ellipse cx="50" cy="-92" rx="12" ry="7" fill="${C.cheek}" opacity="0.5"/>`;
  g += face(faceKind || POSE_FACE[pose] || 'smile', { lx: -76, rx: 76, ey: -132, er: 26, my: -100, mw: 44, skin: c }, t);
  if (pose === 'verdict') g += magnifier(170, -170, 46, -20);
  return G(T(x, y, s, rot), 1, g);
}
