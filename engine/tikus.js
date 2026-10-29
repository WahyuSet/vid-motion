// Si Tikus: mascot of the politics & finance channel, a grey news-analyst mouse after the model sheet in
// docs/mascots/tikus.png: a long pointed snout seen three-quarters to the right, big round ears, round black
// glasses, a slim build in a dark suit, a long pink tail curling out to the left. Drawn like an editorial cartoon:
// flat colours, halftone-dot shading, thin dark lines. Never a necktie: a mouse in a suit and tie echoes the
// "tikus berdasi" (corrupt official) meme, see channels/tikus/RULES.md.
//   tikus(x, y, s, pose, t, rot = 0, walk = null, faceKind = null, outfit = MOUSE.outfit)
//   same poses and faces as cicak(); outfit: 'eksekutif' (default: dark suit, white shirt, open collar, no tie)
//   | 'reporter' (the suit plus a PERS card on a lanyard) | 'analis' (rolled-up shirt sleeves, pen in the pocket)
//   | 'profesor' (knitted vest over the shirt) | 'kacamata' (glasses only) | 'none'
// (0, 0) is the middle of the body; the feet are at y ~135, the ears reach y ~-236.

const MOUSE = {
  fur: '#9A9DA6', furLo: '#7C7F89', muzzle: '#D2CEC6', pink: '#EFA3B1', nose: '#23252E', line: '#1E2130',
  shirt: '#C9DBEF', shirtLo: '#9FB8D6', white: '#F4F3EF', suit: '#2C2F38', suitLo: '#3B3F4B', shoe: '#1B1C22',
  vest: '#D6A651', pen: '#C8312B', tail: '#E6A3AE',
  outfit: 'eksekutif',
};

// halftone dots for the shadow side (identical defs repeat harmlessly)
const tikusDefs = () => `<defs><pattern id="tkDots" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(30)">` +
  `<circle cx="4" cy="4" r="1.9" fill="${MOUSE.line}" opacity="0.42"/></pattern></defs>`;

// a shape in the editorial look: flat colour, halftone dots on the side away from the light, thin dark outline
function tkShape(d, fill, { depth = 10, w = 4.5, rot = 0 } = {}) {
  const id = `tk${VOL_N++}`, a = (-135 - rot) * Math.PI / 180, lx = Math.cos(a) * depth * 1.41, ly = Math.sin(a) * depth * 1.41;
  return `<defs><clipPath id="${id}a"><path d="${d}"/></clipPath><clipPath id="${id}b"><path d="${d}" transform="translate(${f(lx)} ${f(ly)})"/></clipPath></defs>` +
    `<path d="${d}" fill="${fill}"/><g clip-path="url(#${id}a)"><path d="${d}" fill="url(#tkDots)"/><g clip-path="url(#${id}b)"><path d="${d}" fill="${fill}"/></g></g>` +
    (w ? `<path d="${d}" fill="none" stroke="${MOUSE.line}" stroke-width="${w}" stroke-linejoin="round"/>` : '');
}

// a limb as a dark-edged tube; the upper half can be sleeve, the lower half fur; cuff: a rolled-up sleeve
function tkLimb(x0, y0, kx, ky, x1, y1, w, upper, lower, cuff = upper !== lower) {
  const mx = 0.25 * x0 + 0.5 * kx + 0.25 * x1, my = 0.25 * y0 + 0.5 * ky + 0.25 * y1;
  const top = `M${f(x0)},${f(y0)} Q${f((x0 + kx) / 2)},${f((y0 + ky) / 2)} ${f(mx)},${f(my)}`;
  const bot = `M${f(mx)},${f(my)} Q${f((kx + x1) / 2)},${f((ky + y1) / 2)} ${f(x1)},${f(y1)}`;
  const tube = (d, col, ww) => `<path d="${d}" fill="none" stroke="${MOUSE.line}" stroke-width="${ww + 9}" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="${ww}" stroke-linecap="round"/>`;
  let s = tube(bot, lower, w * 0.85) + tube(top, upper, w);
  if (cuff) {  // the sleeve rolled up into a fat cuff just above the elbow
    const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    const c = `M${f(mx - ux * 9)},${f(my - uy * 9)} L${f(mx + ux * 2)},${f(my + uy * 2)}`;
    s += `<path d="${c}" stroke="${MOUSE.line}" stroke-width="${f(w * 1.3 + 8)}" stroke-linecap="butt"/>` +
      `<path d="${c}" stroke="${upper}" stroke-width="${f(w * 1.3)}" stroke-linecap="butt"/>`;
  }
  return s;
}

// round black glasses over the eyes at (-6, -132) and (42, -130), the far temple running back over the head
function tikusGlasses() {
  const L = MOUSE.line;
  return [[-6, -132, 25], [42, -130, 22]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity="0.16" stroke="${L}" stroke-width="5.5"/>` +
    `<path d="M${x - r * 0.55},${y - r * 0.5} Q${x - r * 0.2},${y - r * 0.75} ${x + r * 0.15},${y - r * 0.68}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.7"/>`).join('') +
    `<path d="M19,-133 Q20,-139 21,-133" fill="none" stroke="${L}" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M-31,-136 L-60,-148" stroke="${L}" stroke-width="5" stroke-linecap="round"/>`;
}

// clothes over the torso, per outfit (the torso path is passed in so the clothes can be clipped to it)
function tikusClothes(outfit, torso) {
  const m = MOUSE, L = m.line;
  if (outfit === 'none' || outfit === 'kacamata') return '';
  const suited = outfit === 'eksekutif' || outfit === 'reporter';
  const id = `tkc${VOL_N++}`;
  let s = `<defs><clipPath id="${id}"><path d="${torso}"/></clipPath></defs><g clip-path="url(#${id})">`;
  s += tkShape('M-80,-60 L80,-60 L80,140 L-80,140 Z', suited ? m.white : m.shirt, { depth: 12, w: 0 });
  if (suited) {
    // dark suit: trousers, then the jacket in two panels with wide lapels that open over the white shirt
    s += tkShape('M-80,70 L80,70 L80,140 L-80,140 Z', m.suit, { depth: 8, w: 0 });
    s += tkShape('M-80,-60 L-12,-44 L-2,38 L-4,96 L-80,96 Z', m.suit, { depth: 9, w: 4 }) + tkShape('M80,-60 L12,-44 L2,38 L4,96 L80,96 Z', m.suit, { depth: 9, w: 4 });
    s += `<path d="M-12,-44 L-36,0 L-4,26 Z M12,-44 L36,0 L4,26 Z" fill="${m.suitLo}" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>`;
    s += [44, 70].map(y => `<circle cx="-8" cy="${y}" r="4.5" fill="${m.suitLo}" stroke="${L}" stroke-width="2.5"/>`).join('');
    s += `<path d="M-46,52 L-24,50" stroke="${L}" stroke-width="3" opacity="0.6"/><path d="M26,52 L46,50" stroke="${L}" stroke-width="3" opacity="0.6"/>`;
  } else {
    s += `<path d="M0,-34 L0,96" stroke="${m.shirtLo}" stroke-width="4"/>` + [0, 30, 60].map(y => `<circle cx="7" cy="${y}" r="3.5" fill="${m.shirtLo}"/>`).join('');
    // trousers and a belt, so the shirt reads as a shirt
    s += tkShape('M-80,62 L80,62 L80,140 L-80,140 Z', '#4A5672', { depth: 8, w: 0 }) + `<path d="M-80,62 L80,62" stroke="${L}" stroke-width="4"/>` +
      `<rect x="-80" y="56" width="160" height="12" fill="#2B2F3F"/><rect x="-9" y="54" width="18" height="16" rx="3" fill="${m.vest}" stroke="${L}" stroke-width="3"/>`;
    if (outfit === 'profesor') {
      s += tkShape('M-80,-30 L-14,-30 L0,24 L14,-30 L80,-30 L80,66 L-80,66 Z', m.vest, { depth: 10, w: 4 });
      for (let x = -60; x <= 60; x += 14) if (Math.abs(x) > 18) s += `<line x1="${x}" y1="-14" x2="${x}" y2="56" stroke="#9C7426" stroke-width="2" opacity="0.4"/>`;
    }
  }
  s += `</g>`;
  // open collar, no tie
  s += `<path d="M-26,-46 L0,-24 L-8,-8 L-30,-32 Z M26,-46 L0,-24 L8,-8 L30,-32 Z" fill="#fff" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>`;
  if (!suited) {  // shirt pocket with a pen, the analyst's badge of office
    s += `<path d="M14,10 L40,10 L40,38 Q27,44 14,38 Z" fill="${m.shirtLo}" stroke="${L}" stroke-width="3.5"/>`;
    s += `<rect x="20" y="-8" width="7" height="30" rx="3" fill="${m.pen}" stroke="${L}" stroke-width="3"/><rect x="20" y="-12" width="7" height="8" rx="3" fill="#E9E5DC" stroke="${L}" stroke-width="3"/>`;
  }
  if (outfit === 'reporter') {
    s += `<path d="M-20,-40 Q-28,10 -12,46 M20,-40 Q28,10 12,46" fill="none" stroke="${m.pen}" stroke-width="5" stroke-linecap="round"/>`;
    s += tkShape(rectD(-30, 40, 60, 70, 8), '#FFFFFF', { depth: 6, w: 4 }) + `<rect x="-30" y="40" width="60" height="18" rx="6" fill="${m.pen}"/>`;
    s += txt('PERS', 0, 50, 15, '#fff', 900) + `<circle cx="-12" cy="78" r="9" fill="${m.fur}"/><line x1="2" y1="74" x2="20" y2="74" stroke="#9BA1B3" stroke-width="4" stroke-linecap="round"/><line x1="2" y1="88" x2="16" y2="88" stroke="#9BA1B3" stroke-width="4" stroke-linecap="round"/>`;
  }
  return s;
}

function tikus(x, y, s, pose = 'happy', t = 0, rot = 0, walk = null, faceKind = null, outfit = MOUSE.outfit) {
  const m = MOUSE, L = m.line, wave = 10 * Math.sin(t * 9), sway = 12 * Math.sin(t * 2.5);
  const bob = walk !== null ? Math.abs(Math.sin(walk)) * -8 : 0;
  const kind = faceKind || POSE_FACE[pose] || 'smile';
  const bare = outfit === 'none' || outfit === 'kacamata', suited = outfit === 'eksekutif' || outfit === 'reporter';
  const sleeve = bare ? m.fur : suited ? m.suit : m.shirt, leg = bare ? m.fur : suited ? m.suit : '#4A5672';
  let g = tikusDefs();
  g += `<ellipse cx="0" cy="${f(138 - bob)}" rx="84" ry="14" fill="${L}" opacity="0.14"/>`;
  // tail: a long S-curve out to the left, straight up when shocked
  const tail = pose === 'shock' ? 'M-34,80 C-70,60 -92,-10 -100,-90' : `M-34,84 C-112,110 -150,40 ${f(-120 - sway)},-6 C-102,-44 -134,-72 ${f(-154 - sway)},-50`;
  g += `<path d="${tail}" fill="none" stroke="${L}" stroke-width="13" stroke-linecap="round"/><path d="${tail}" fill="none" stroke="${m.tail}" stroke-width="7" stroke-linecap="round"/>`;
  // legs and feet (black shoes with the suit and shirt outfits, bare pink feet otherwise)
  [-1, 1].forEach((sd, i) => {
    const step = walk !== null ? 10 * Math.sin(walk + i * Math.PI) : 0, fx = sd * 26 + step;
    g += tkLimb(sd * 22, 88, sd * 24, 108, fx, 124, 22, leg, leg, false);
    g += bare ? tkShape(`M${f(fx - 26)},132 C${f(fx - 26)},118 ${f(fx + 26)},118 ${f(fx + 26)},132 Z`, m.pink, { depth: 4, w: 4 })
      : tkShape(`M${f(fx - 22)},134 C${f(fx - 24)},118 ${f(fx + 8)},114 ${f(fx + 26)},124 C${f(fx + 36)},128 ${f(fx + 34)},134 ${f(fx + 30)},134 Z`, m.shoe, { depth: 4, w: 4 });
  });
  // a slim torso, then clothes over it
  const torso = 'M-42,-44 C-54,-10 -56,60 -48,96 C-38,112 38,112 48,96 C56,60 54,-10 42,-44 C28,-56 -28,-56 -42,-44 Z';
  g += tkShape(torso, m.fur, { depth: 12, rot });
  g += `<path d="M-28,20 C-28,0 28,0 28,20 C30,70 18,96 0,98 C-18,96 -30,70 -28,20 Z" fill="${m.muzzle}" opacity="${bare ? 1 : 0}"/>`;
  g += tikusClothes(outfit, torso) + `<path d="${torso}" fill="none" stroke="${L}" stroke-width="4.5" stroke-linejoin="round"/>`;
  // arms: [hand x, hand y, elbow x, elbow y] for left then right
  const arms = {
    happy: [[-60, 62, -68, 22], [f(128 + wave), -150, 104, -64]],
    cheer: [[f(-100 - wave), -128, -88, -52], [f(124 + wave), -150, 100, -60]],
    point: [[-60, 62, -68, 22], [146, -30, 98, -20]],
    think: [[60, 62, 68, 22], [40, -68, 92, -14]],
    verdict: [[-60, 62, -68, 22], [104, -88, 94, -16]],
    shock: [[-104, -112, -92, -44], [128, -150, 102, -60]],
    calm: [[-60, 62, -68, 22], [60, 62, 68, 22]],
  }[pose] || [[-60, 62, -68, 22], [60, 62, 68, 22]];
  arms.forEach(([hx, hy, kx, ky], i) => {
    g += tkLimb(i ? 40 : -40, -28, kx, ky, +hx, hy, 19, sleeve, sleeve === m.suit ? m.suit : m.fur);
    g += tkShape(circleD(+hx, hy, 12), m.fur, { depth: 3, w: 4 });
  });
  // ears behind the head (they perk up when shocked)
  const ear = pose === 'shock' ? -12 : 0;
  [[-40, -190, 40], [30, -206, 38]].forEach(([ex, ey, r]) => {
    g += tkShape(circleD(ex, ey + ear, r), m.fur, { depth: 8 });
    g += tkShape(circleD(ex + 2, ey + 2 + ear, r * 0.6), m.pink, { depth: 5, w: 3 });
  });
  // head in three-quarter view: round at the back, a long snout to the right with the nose at its tip
  g += tkShape('M-64,-122 C-66,-172 -30,-198 6,-198 C44,-198 66,-174 76,-148 C84,-130 98,-114 108,-104 C116,-94 110,-84 98,-84 C72,-80 40,-58 2,-56 C-40,-56 -64,-80 -64,-122 Z', m.fur, { depth: 14, rot });
  g += `<path d="M-30,-78 C-12,-94 40,-100 74,-96 C88,-94 98,-90 100,-86 C80,-78 50,-62 8,-60 C-14,-60 -32,-66 -30,-78 Z" fill="${m.muzzle}"/>`;
  g += G('translate(18 0)', 1, face(kind, { lx: -24, rx: 24, ey: -132, er: 12, my: -74, mw: 15, skin: m.fur, style: 'soft', ink: L, weight: 9 }, t));
  if (outfit !== 'none' && kind !== 'cool') g += tikusGlasses();
  g += `<circle cx="108" cy="-96" r="11" fill="${m.nose}"/><circle cx="104" cy="-100" r="3.5" fill="#fff" opacity="0.7"/>`;
  if (['smile', 'calm', 'wink', 'love', 'cool', 'smug', 'skeptical'].includes(kind))  // two small front teeth
    g += `<path d="M12,-68 L12,-60 L24,-60 L24,-68" fill="#fff" stroke="${L}" stroke-width="2.5"/><line x1="18" y1="-68" x2="18" y2="-60" stroke="${L}" stroke-width="2"/>`;
  [[-112, -10], [-98, 0], [-84, 10]].forEach(([wy, tilt]) =>
    g += `<line x1="86" y1="${wy + 10}" x2="136" y2="${wy + tilt}" stroke="${L}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>`);
  if (pose === 'verdict') g += magnifier(126, -152, 30, -20, L);
  return G(T(x, y + bob, s, rot), 1, g);
}
