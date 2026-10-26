// Si Cicak: the channel mascot. A house gecko seen from above, the way you see one on the wall,
// so it can crawl in any direction (rot) across the picture.
//   cicak(x, y, s, pose, t, rot = 0, walk = null)
//   pose: 'happy' (waves) | 'shock' (tail drops off) | 'verdict' (magnifier) | 'calm'
//   walk: a phase in radians; when set the legs step (use t * speed)

const GECKO = { body: '#9CCB6B', dark: '#6E9E46', spot: '#7FB255', lens: '#D6ECF7', wood: '#9B6B43' };

const eyePair = (lx, rx, y, r, look = [0, 0], pupil = 0.5) =>
  [lx, rx].map(x => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${stroke(5)}/>` +
    `<circle cx="${f(x + look[0])}" cy="${f(y + look[1])}" r="${f(r * pupil)}" fill="${C.ink}"/>` +
    `<circle cx="${f(x + look[0] + r * 0.2)}" cy="${f(y + look[1] - r * 0.25)}" r="${f(r * 0.18)}" fill="#fff"/>`).join('');

function magnifier(x, y, r, rot = -30) {
  return G(T(x, y, 1, rot), 1,
    `<line x1="0" y1="${r}" x2="0" y2="${r + r * 1.3}" ${stroke(r * 0.42, C.ink)}/>` +
    `<line x1="0" y1="${r}" x2="0" y2="${r + r * 1.3}" ${stroke(r * 0.26, GECKO.wood)}/>` +
    `<circle r="${r}" fill="${GECKO.lens}" fill-opacity="0.7" ${stroke(r * 0.22)}/>` +
    `<path d="M${-r * 0.5},${-r * 0.2} Q${-r * 0.45},${-r * 0.5} ${-r * 0.15},${-r * 0.55}" fill="none" ${stroke(r * 0.12, '#fff')}/>`);
}

function cicak(x, y, s, pose = 'happy', t = 0, rot = 0, walk = null) {
  const c = GECKO.body, sway = Math.sin(t * 3) * 6 + (walk !== null ? Math.sin(walk) * 10 : 0);
  let g = '';
  // tail (drops off when shocked, a real gecko trick)
  const tail = `<path d="M-24,80 C-30,160 40,170 52,232 C56,252 70,250 66,228 C56,160 22,150 24,80 Z" fill="${c}" ${stroke(6)}/>` +
    `<circle cx="30" cy="170" r="6" fill="${GECKO.spot}"/><circle cx="52" cy="206" r="5" fill="${GECKO.spot}"/>`;
  g += pose === 'shock' ? G(T(46, 40, 1, 28), 1, tail) + `<path d="M70,150 l14,-8 M76,170 l16,0 M70,190 l14,8" ${stroke(5)}/>` : G(`rotate(${f(sway)} 0 80)`, 1, tail);
  // legs with sticky toe pads; diagonal pairs step together when walking
  const toes = (x0, y0, a) => [-0.5, 0, 0.5].map(d => `<circle cx="${f(x0 + 20 * Math.cos(a + d))}" cy="${f(y0 + 20 * Math.sin(a + d))}" r="9" fill="${c}" ${stroke(5)}/>`).join('');
  const legs = [
    [-1, -40, -96, -70, -110, -116, -2.2], [1, -40, 96, -70, 110, -116, -0.9],
    [-1, 60, -96, 80, -112, 124, 2.2], [1, 60, 96, 80, 112, 124, 0.9],
  ];
  legs.forEach(([sd, y0, kx, ky, ex, ey, a], i) => {
    let ex2 = ex, ey2 = ey;
    if (walk !== null) ey2 += 22 * Math.sin(walk + (i === 0 || i === 3 ? 0 : Math.PI));
    else if (pose === 'happy' && i === 1) { ex2 = 128 + 10 * Math.sin(t * 9); ey2 = -150; }
    const wave = pose === 'happy' && i === 1 && walk === null;
    g += limb(`M${sd * 40},${y0} Q${kx},${ky} ${ex2},${ey2}`, 16, c) + toes(ex2, ey2, wave ? -1.4 : a);
  });
  g += `<path d="M0,-70 C40,-70 46,-20 44,30 C42,80 26,104 0,104 C-26,104 -42,80 -44,30 C-46,-20 -40,-70 0,-70 Z" fill="${c}" ${stroke()}/>`;
  [[-16, -10, 8], [16, 20, 7], [-10, 52, 7], [14, 76, 5], [8, -36, 6]].forEach(([sx, sy, r]) => g += `<circle cx="${sx}" cy="${sy}" r="${r}" fill="${GECKO.spot}"/>`);
  // wide flat head with a rounded snout, eyes bulging out of the sides
  g += `<path d="M0,-184 C54,-184 92,-150 92,-118 C92,-86 56,-66 0,-66 C-56,-66 -92,-86 -92,-118 C-92,-150 -54,-184 0,-184 Z" fill="${c}" ${stroke()}/>`;
  g += `<circle cx="-14" cy="-166" r="3.5" fill="${GECKO.dark}"/><circle cx="14" cy="-166" r="3.5" fill="${GECKO.dark}"/>`;
  g += `<ellipse cx="-50" cy="-92" rx="12" ry="7" fill="${C.cheek}" opacity="0.5"/><ellipse cx="50" cy="-92" rx="12" ry="7" fill="${C.cheek}" opacity="0.5"/>`;
  const blink = ((t * 0.5 + 0.2) % 1) < 0.035;
  if (pose === 'shock') {
    g += eyePair(-76, 76, -132, 28, [0, 0], 0.22) + `<ellipse cx="0" cy="-100" rx="14" ry="15" fill="${C.ink}"/>`;
  } else if (pose === 'verdict') {
    g += eyePair(-76, 76, -132, 26, [6, 2], 0.5) +
      `<path d="M-102,-140 L-50,-140 M50,-140 L102,-140" ${stroke(7)}/>` +
      `<path d="M-34,-96 Q4,-78 38,-102" fill="none" ${stroke(7)}/>`;
    g += magnifier(170, -170, 46, -20);
  } else {
    g += (blink ? `<path d="M-96,-132 L-56,-132 M56,-132 L96,-132" ${stroke(7)}/>` : eyePair(-76, 76, -132, 26, [0, 3], 0.5)) +
      `<path d="M-44,-100 Q0,-70 44,-100" fill="none" ${stroke(7)}/>`;
  }
  return G(T(x, y, s, rot), 1, g);
}
