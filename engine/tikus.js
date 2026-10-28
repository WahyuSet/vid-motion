// Si Tikus: mascot of the politics & finance channel, drawn like a newspaper's editorial cartoon: a grey mouse
// with grown-up proportions, thin navy lines, halftone-dot shading like cheap newsprint, and the look of a news
// analyst (rolled-up shirt sleeves, glasses, a pen in the pocket). No necktie by default: a mouse in a suit and
// tie echoes the "tikus berdasi" (corrupt official) meme, see channels/tikus/RULES.md.
//   tikus(x, y, s, pose, t, rot = 0, walk = null, faceKind = null, outfit = MOUSE.outfit)
//   same poses and faces as cicak(); outfit: 'analis' (default: rolled-up shirt, glasses, pen) | 'reporter'
//   (analis + PERS card on a lanyard) | 'profesor' (knitted vest over the shirt) | 'eksekutif' (blazer, open
//   collar, still no tie) | 'kacamata' (glasses only) | 'none'
// (0, 0) is the middle of the body; the feet are at y ~135, the ears reach y ~-222.

const MOUSE = {
  fur: '#A3A7B2', furLo: '#7E8391', muzzle: '#ECE8E0', pink: '#E7A7B0', nose: '#2A2F3F', line: '#1F2A44',
  shirt: '#C9DBEF', shirtLo: '#9FB8D6', vest: '#D6A651', blazer: '#2E3B63', pen: '#C8312B', tail: '#C9A3A8',
  outfit: 'analis',
};

// halftone dots for the shadow side (identical defs repeat harmlessly)
const tikusDefs = () => `<defs><pattern id="tkDots" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(30)">` +
  `<circle cx="4" cy="4" r="1.9" fill="${MOUSE.line}" opacity="0.42"/></pattern></defs>`;

// a shape in the editorial look: flat colour, halftone dots on the side away from the light, thin navy outline
function tkShape(d, fill, { depth = 10, w = 4.5, rot = 0 } = {}) {
  const id = `tk${VOL_N++}`, a = (-135 - rot) * Math.PI / 180, lx = Math.cos(a) * depth * 1.41, ly = Math.sin(a) * depth * 1.41;
  return `<defs><clipPath id="${id}a"><path d="${d}"/></clipPath><clipPath id="${id}b"><path d="${d}" transform="translate(${f(lx)} ${f(ly)})"/></clipPath></defs>` +
    `<path d="${d}" fill="${fill}"/><g clip-path="url(#${id}a)"><path d="${d}" fill="url(#tkDots)"/><g clip-path="url(#${id}b)"><path d="${d}" fill="${fill}"/></g></g>` +
    (w ? `<path d="${d}" fill="none" stroke="${MOUSE.line}" stroke-width="${w}" stroke-linejoin="round"/>` : '');
}

// a limb as a navy-edged tube; the upper half can be sleeve, the lower half fur
function tkLimb(x0, y0, kx, ky, x1, y1, w, upper, lower) {
  const mx = 0.25 * x0 + 0.5 * kx + 0.25 * x1, my = 0.25 * y0 + 0.5 * ky + 0.25 * y1;
  const top = `M${f(x0)},${f(y0)} Q${f((x0 + kx) / 2)},${f((y0 + ky) / 2)} ${f(mx)},${f(my)}`;
  const bot = `M${f(mx)},${f(my)} Q${f((kx + x1) / 2)},${f((ky + y1) / 2)} ${f(x1)},${f(y1)}`;
  const tube = (d, col, ww) => `<path d="${d}" fill="none" stroke="${MOUSE.line}" stroke-width="${ww + 9}" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="${ww}" stroke-linecap="round"/>`;
  let s = tube(bot, lower, w * 0.85) + tube(top, upper, w);
  if (upper !== lower) {  // the sleeve rolled up into a fat cuff just above the elbow
    const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    const cuff = `M${f(mx - ux * 9)},${f(my - uy * 9)} L${f(mx + ux * 2)},${f(my + uy * 2)}`;
    s += `<path d="${cuff}" stroke="${MOUSE.line}" stroke-width="${f(w * 1.3 + 8)}" stroke-linecap="butt"/>` +
      `<path d="${cuff}" stroke="${upper}" stroke-width="${f(w * 1.3)}" stroke-linecap="butt"/>`;
  }
  return s;
}

function tikusGlasses() {
  const L = MOUSE.line;
  return [-28, 28].map(x => `<circle cx="${x}" cy="-128" r="23" fill="#fff" fill-opacity="0.18" stroke="${L}" stroke-width="4.5"/>` +
    `<path d="M${x - 12},-141 Q${x - 5},-146 ${x + 2},-144" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.7"/>`).join('') +
    `<path d="M-6,-131 Q0,-136 6,-131" fill="none" stroke="${L}" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M-51,-132 L-68,-140 M51,-132 L68,-140" stroke="${L}" stroke-width="4" stroke-linecap="round"/>`;
}

// clothes over the torso, per outfit (the torso path is passed in so the clothes can be clipped to it)
function tikusClothes(outfit, torso) {
  const m = MOUSE, L = m.line;
  if (outfit === 'none' || outfit === 'kacamata') return '';
  const id = `tkc${VOL_N++}`;
  let s = `<defs><clipPath id="${id}"><path d="${torso}"/></clipPath></defs><g clip-path="url(#${id})">`;
  s += tkShape('M-80,-60 L80,-60 L80,140 L-80,140 Z', m.shirt, { depth: 12, w: 0 });
  s += `<path d="M0,-34 L0,96" stroke="${m.shirtLo}" stroke-width="4"/>` + [0, 30, 60].map(y => `<circle cx="7" cy="${y}" r="3.5" fill="${m.shirtLo}"/>`).join('');
  // trousers and a belt, so the shirt reads as a shirt
  s += tkShape('M-80,62 L80,62 L80,140 L-80,140 Z', '#4A5672', { depth: 8, w: 0 }) + `<path d="M-80,62 L80,62" stroke="${L}" stroke-width="4"/>` +
    `<rect x="-80" y="56" width="160" height="12" fill="#2B2F3F"/><rect x="-9" y="54" width="18" height="16" rx="3" fill="${m.vest}" stroke="${L}" stroke-width="3"/>`;
  if (outfit === 'profesor') {
    s += tkShape('M-80,-30 L-14,-30 L0,24 L14,-30 L80,-30 L80,66 L-80,66 Z', m.vest, { depth: 10, w: 4 });
    for (let x = -60; x <= 60; x += 14) if (Math.abs(x) > 18) s += `<line x1="${x}" y1="-14" x2="${x}" y2="56" stroke="#9C7426" stroke-width="2" opacity="0.4"/>`;
  }
  if (outfit === 'eksekutif') {
    s += tkShape('M-80,-60 L-16,-40 L-4,40 L-6,140 L-80,140 Z', m.blazer, { depth: 8, w: 4 }) + tkShape('M80,-60 L16,-40 L4,40 L6,140 L80,140 Z', m.blazer, { depth: 8, w: 4 });
    s += `<path d="M-16,-40 L-34,6 L-8,20 Z M16,-40 L34,6 L8,20 Z" fill="#46568A" stroke="${L}" stroke-width="3"/>`;
  }
  s += `</g>`;
  // open collar, no tie
  s += `<path d="M-30,-44 L0,-20 L-8,-4 L-34,-30 Z M30,-44 L0,-20 L8,-4 L34,-30 Z" fill="#fff" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>`;
  if (outfit !== 'eksekutif') {  // shirt pocket with a pen, the analyst's badge of office
    s += `<path d="M14,10 L40,10 L40,38 Q27,44 14,38 Z" fill="${m.shirtLo}" stroke="${L}" stroke-width="3.5"/>`;
    s += `<rect x="20" y="-8" width="7" height="30" rx="3" fill="${m.pen}" stroke="${L}" stroke-width="3"/><rect x="20" y="-12" width="7" height="8" rx="3" fill="#E9E5DC" stroke="${L}" stroke-width="3"/>`;
  }
  if (outfit === 'reporter') {
    s += `<path d="M-22,-40 Q-30,10 -12,46 M22,-40 Q30,10 12,46" fill="none" stroke="${m.pen}" stroke-width="5" stroke-linecap="round"/>`;
    s += tkShape(rectD(-30, 40, 60, 70, 8), '#FFFFFF', { depth: 6, w: 4 }) + `<rect x="-30" y="40" width="60" height="18" rx="6" fill="${m.pen}"/>`;
    s += txt('PERS', 0, 50, 15, '#fff', 900) + `<circle cx="-12" cy="78" r="9" fill="${m.fur}"/><line x1="2" y1="74" x2="20" y2="74" stroke="#9BA1B3" stroke-width="4" stroke-linecap="round"/><line x1="2" y1="88" x2="16" y2="88" stroke="#9BA1B3" stroke-width="4" stroke-linecap="round"/>`;
  }
  return s;
}

function tikus(x, y, s, pose = 'happy', t = 0, rot = 0, walk = null, faceKind = null, outfit = MOUSE.outfit) {
  const m = MOUSE, L = m.line, wave = 10 * Math.sin(t * 9), sway = 12 * Math.sin(t * 2.5);
  const bob = walk !== null ? Math.abs(Math.sin(walk)) * -8 : 0;
  const kind = faceKind || POSE_FACE[pose] || 'smile';
  const sleeve = outfit === 'none' || outfit === 'kacamata' ? m.fur : outfit === 'eksekutif' ? m.blazer : m.shirt;
  let g = tikusDefs();
  g += `<ellipse cx="0" cy="${f(138 - bob)}" rx="84" ry="14" fill="${L}" opacity="0.14"/>`;
  // tail: a lazy S-curve, straight up when shocked
  const tail = pose === 'shock' ? 'M36,80 C70,60 92,-10 100,-90' : `M36,84 C110,110 146,40 ${f(118 + sway)},-6 C102,-44 132,-70 ${f(150 + sway)},-46`;
  g += `<path d="${tail}" fill="none" stroke="${L}" stroke-width="12" stroke-linecap="round"/><path d="${tail}" fill="none" stroke="${m.tail}" stroke-width="6" stroke-linecap="round"/>`;
  // legs and feet
  [-1, 1].forEach((sd, i) => {
    const step = walk !== null ? 10 * Math.sin(walk + i * Math.PI) : 0;
    g += tkLimb(sd * 22, 88, sd * 24, 108, sd * 26 + step, 124, 22, m.fur, m.fur);
    g += tkShape(`M${f(sd * 30 + step - 26)},132 C${f(sd * 30 + step - 26)},118 ${f(sd * 30 + step + 26)},118 ${f(sd * 30 + step + 26)},132 Z`, m.pink, { depth: 4, w: 4 });
  });
  // torso, then clothes over it
  const torso = 'M-46,-40 C-58,-10 -60,60 -50,96 C-40,112 40,112 50,96 C60,60 58,-10 46,-40 C30,-52 -30,-52 -46,-40 Z';
  g += tkShape(torso, m.fur, { depth: 12, rot });
  g += `<path d="M-30,20 C-30,0 30,0 30,20 C32,70 20,96 0,98 C-20,96 -32,70 -30,20 Z" fill="${m.muzzle}" opacity="${outfit === 'none' || outfit === 'kacamata' ? 1 : 0}"/>`;
  g += tikusClothes(outfit, torso) + `<path d="${torso}" fill="none" stroke="${L}" stroke-width="4.5" stroke-linejoin="round"/>`;
  // arms: [hand x, hand y, elbow x, elbow y] for left then right
  const arms = {
    happy: [[-62, 62, -70, 22], [f(96 + wave), -98, 86, -40]],
    cheer: [[f(-96 - wave), -106, -86, -46], [f(96 + wave), -106, 86, -46]],
    point: [[-62, 62, -70, 22], [142, -30, 96, -20]],
    think: [[-18, -58, -84, -18], [62, 62, 70, 22]],
    verdict: [[-62, 62, -70, 22], [106, -62, 92, -12]],
    shock: [[-102, -102, -92, -40], [102, -102, 92, -40]],
    calm: [[-62, 62, -70, 22], [62, 62, 70, 22]],
  }[pose] || [[-62, 62, -70, 22], [62, 62, 70, 22]];
  arms.forEach(([hx, hy, kx, ky], i) => {
    g += tkLimb(i ? 42 : -42, -26, kx, ky, +hx, hy, 19, sleeve, m.fur);
    g += tkShape(circleD(+hx, hy, 12), m.pink, { depth: 3, w: 4 });
  });
  // ears (perk up when shocked), head, muzzle
  const ear = pose === 'shock' ? -12 : 0;
  [-1, 1].forEach(sd => {
    g += tkShape(circleD(sd * 62, -182 + ear, 40), m.fur, { depth: 8 });
    g += tkShape(circleD(sd * 60, -180 + ear, 24), m.pink, { depth: 5, w: 3 });
  });
  g += tkShape(circleD(0, -118, 74), m.fur, { depth: 14, rot });
  g += tkShape('M-44,-86 C-44,-112 44,-112 44,-86 C44,-62 22,-50 0,-50 C-22,-50 -44,-62 -44,-86 Z', m.muzzle, { depth: 6, w: 3.5 });
  g += face(kind, { lx: -28, rx: 28, ey: -130, er: 16, my: -66, mw: 16, skin: m.fur, style: 'ink', ink: L, weight: 5 }, t);
  if (outfit !== 'none' && kind !== 'cool') g += tikusGlasses();
  g += `<path d="M-11,-100 C-11,-108 11,-108 11,-100 C11,-92 4,-88 0,-88 C-4,-88 -11,-92 -11,-100 Z" fill="${m.nose}"/><circle cx="-4" cy="-102" r="3" fill="#fff" opacity="0.7"/>`;
  if (['smile', 'calm', 'wink', 'love', 'cool', 'smug', 'skeptical'].includes(kind))  // two small front teeth
    g += `<path d="M-7,-60 L-7,-52 L7,-52 L7,-60" fill="#fff" stroke="${L}" stroke-width="2.5"/><line x1="0" y1="-60" x2="0" y2="-52" stroke="${L}" stroke-width="2"/>`;
  [[-1, -92, -1], [-1, -84, 0], [1, -92, -1], [1, -84, 0]].forEach(([sd, wy, tilt]) =>
    g += `<line x1="${sd * 40}" y1="${wy}" x2="${sd * 78}" y2="${wy + tilt * 8}" stroke="${L}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>`);
  if (pose === 'verdict') g += magnifier(124, -100, 32, -20, L);
  return G(T(x, y + bob, s, rot), 1, g);
}
