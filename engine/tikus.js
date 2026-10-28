// Si Tikus: a mascot for another channel, in a soft "plush toy" style — no ink outlines, soft gradient
// shading, glossy highlights and kawaii eyes (a deliberate contrast with Si Cicak's flat ink look).
//   tikus(x, y, s, pose, t, rot = 0, walk = null, faceKind = null, outfit = MOUSE.outfit)
//   same poses and faces as cicak(); outfit: 'none' | 'kacamata' (glasses) | 'profesor' (glasses, bow tie,
//   knitted vest) | 'reporter' (glasses, ID card on a lanyard) | 'eksekutif' (glasses, blazer, necktie)
// (0, 0) is the middle of the body; the feet are at y ~110, the ears reach y ~-236.

const MOUSE = {
  fur: '#B9B1CF', furHi: '#DDD7EC', furLo: '#9087AD', belly: '#F4F1F9', bellyLo: '#DCD5EA',
  pink: '#F6B3C4', pinkHi: '#FCD3DD', pinkLo: '#E2859F', line: '#3B2F4A', whisker: '#7A7094',
  frame: '#5B4636', outfit: 'eksekutif',  // channel default, chosen by the owner
};

// gradients are defined inside each drawing; repeated ids are identical, so duplicates are harmless
function tikusDefs() {
  const m = MOUSE;
  const rg = (id, a, b, c) => `<radialGradient id="${id}" cx="38%" cy="30%" r="78%"><stop offset="0" stop-color="${a}"/><stop offset="0.62" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
  return `<defs>${rg('tkFur', m.furHi, m.fur, m.furLo)}${rg('tkPink', m.pinkHi, m.pink, m.pinkLo)}${rg('tkBelly', '#fff', m.belly, m.bellyLo)}` +
    `<radialGradient id="tkShadow"><stop offset="0" stop-color="#3B2F4A" stop-opacity="0.28"/><stop offset="1" stop-color="#3B2F4A" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="tkBlush"><stop offset="0" stop-color="#FF8FA8" stop-opacity="0.7"/><stop offset="1" stop-color="#FF8FA8" stop-opacity="0"/></radialGradient>` +
    rg('tkNavy', '#5A6A96', '#34416A', '#1F2944') + rg('tkRed', '#EE7A70', '#C8312B', '#962019') +
    rg('tkKnit', '#F0CD86', '#D6A651', '#B0802C') + rg('tkShirt', '#FFFFFF', '#F3F4F8', '#D9DCE6') +
    `<clipPath id="tkBody"><ellipse cx="0" cy="30" rx="62" ry="72"/></clipPath></defs>`;
}

// a rounded limb shaded like the body: mid tone with a soft light streak along it
const plushLimb = (d, w) => `<path d="${d}" fill="none" stroke="${MOUSE.fur}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${MOUSE.furHi}" stroke-width="${f(w * 0.32)}" stroke-linecap="round" opacity="0.7" transform="translate(-2 -2)"/>`;
const gloss = (x, y, rx, ry, rot = -30, o = 0.7) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${o}" transform="rotate(${rot} ${x} ${y})"/>`;

// clothes on the body (under the arms) and at the neck (over the chin), per outfit
function tikusOutfitBody(outfit) {
  if (outfit === 'profesor' || outfit === 'eksekutif') {
    const fill = outfit === 'profesor' ? 'url(#tkKnit)' : 'url(#tkNavy)';
    let o = `<ellipse cx="0" cy="40" rx="40" ry="56" fill="url(#tkShirt)"/>`;
    o += `<g clip-path="url(#tkBody)"><path d="M-90,-60 L-12,-60 L0,46 L-4,150 L-90,150 Z M90,-60 L12,-60 L0,46 L4,150 L90,150 Z" fill="${fill}"/>`;
    if (outfit === 'profesor') {
      for (let x = -54; x <= 54; x += 12) if (Math.abs(x) > 14) o += `<line x1="${x}" y1="-40" x2="${x}" y2="110" stroke="#9C7426" stroke-width="2" opacity="0.35"/>`;
      o += `<path d="M-60,96 Q0,112 60,96" fill="none" stroke="#9C7426" stroke-width="6" opacity="0.5"/>`;
      [56, 76].forEach(y => o += `<circle cx="-7" cy="${y}" r="4.5" fill="#7A5A22"/>`);
    } else {
      o += `<path d="M-12,-40 L-30,8 L-6,30 Z M12,-40 L30,8 L6,30 Z" fill="#46568A"/>`;
      o += `<path d="M30,26 L44,22 L46,30 L32,34 Z" fill="#fff" opacity="0.9"/>`;
      o += `<path d="M-6,-20 L6,-20 L10,40 L0,56 L-10,40 Z" fill="url(#tkRed)"/>`;
      o += `<circle cx="-4" cy="72" r="4.5" fill="#141A2E"/>`;
    }
    return o + `</g>`;
  }
  if (outfit === 'reporter') {
    return `<path d="M-18,-34 Q-22,4 -10,26 M18,-34 Q22,4 10,26" fill="none" stroke="#34416A" stroke-width="6" stroke-linecap="round"/>` +
      `<rect x="-30" y="22" width="60" height="74" rx="8" fill="#5B4A78" opacity="0.15" transform="translate(3 4)"/>` +
      `<rect x="-30" y="22" width="60" height="74" rx="8" fill="url(#tkShirt)"/>` +
      `<rect x="-30" y="22" width="60" height="18" rx="8" fill="#C8312B"/><rect x="-30" y="32" width="60" height="8" fill="#C8312B"/>` +
      `<circle cx="-12" cy="58" r="9" fill="#B9B1CF"/><line x1="2" y1="54" x2="20" y2="54" stroke="#9BA1B3" stroke-width="4" stroke-linecap="round"/>` +
      `<line x1="2" y1="66" x2="16" y2="66" stroke="#9BA1B3" stroke-width="4" stroke-linecap="round"/><line x1="-20" y1="82" x2="20" y2="82" stroke="#9BA1B3" stroke-width="4" stroke-linecap="round"/>`;
  }
  return '';
}

function tikusOutfitNeck(outfit) {
  if (outfit === 'profesor')
    return `<path d="M0,-28 L-30,-42 Q-36,-28 -30,-14 Z M0,-28 L30,-42 Q36,-28 30,-14 Z" fill="url(#tkRed)"/><ellipse cx="0" cy="-28" rx="8" ry="9" fill="#962019"/>`;
  if (outfit === 'eksekutif')
    return `<path d="M-26,-34 L-4,-24 L-14,-8 Z M26,-34 L4,-24 L14,-8 Z" fill="url(#tkShirt)"/><path d="M-8,-30 L8,-30 L6,-16 L-6,-16 Z" fill="#962019"/>`;
  return '';
}

function tikusGlasses() {
  const fr = MOUSE.frame;
  return [-32, 32].map(x => `<circle cx="${x}" cy="-130" r="27" fill="#fff" opacity="0.12"/>` +
      `<circle cx="${x}" cy="-130" r="27" fill="none" stroke="${fr}" stroke-width="5.5"/>` +
      `<path d="M${x - 14},-146 Q${x - 6},-152 ${x + 2},-150" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`).join('') +
    `<path d="M-6,-134 Q0,-140 6,-134" fill="none" stroke="${fr}" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M-59,-136 L-84,-146 M59,-136 L84,-146" stroke="${fr}" stroke-width="5" stroke-linecap="round"/>`;
}

function tikus(x, y, s, pose = 'happy', t = 0, rot = 0, walk = null, faceKind = null, outfit = MOUSE.outfit) {
  const m = MOUSE, wave = 10 * Math.sin(t * 9), sway = 14 * Math.sin(t * 2.5);
  const bob = walk !== null ? Math.abs(Math.sin(walk)) * -8 : 0;
  const kind = faceKind || POSE_FACE[pose] || 'smile';
  let g = tikusDefs();
  g += `<ellipse cx="0" cy="${f(114 - bob)}" rx="96" ry="18" fill="url(#tkShadow)"/>`;
  // tail: lazy S-curve, stiff and straight up when shocked
  const tail = pose === 'shock' ? 'M34,60 C70,40 92,-30 100,-110'
    : `M34,62 C110,92 150,20 ${f(120 + sway)},-30 C100,-70 136,-98 ${f(152 + sway)},-70`;
  g += `<path d="${tail}" fill="none" stroke="${m.pink}" stroke-width="10" stroke-linecap="round"/>` +
    `<path d="${tail}" fill="none" stroke="${m.pinkHi}" stroke-width="3" stroke-linecap="round" opacity="0.8" transform="translate(-2 -2)"/>`;
  // legs and feet
  [-1, 1].forEach((sd, i) => {
    const step = walk !== null ? 10 * Math.sin(walk + i * Math.PI) : 0;
    g += plushLimb(`M${sd * 24},66 L${f(sd * 30 + step)},96`, 22);
    g += `<ellipse cx="${f(sd * 34 + step)}" cy="104" rx="28" ry="14" fill="url(#tkPink)"/>`;
  });
  g += `<ellipse cx="0" cy="30" rx="62" ry="72" fill="url(#tkFur)"/>`;
  g += `<ellipse cx="0" cy="44" rx="38" ry="47" fill="url(#tkBelly)"/>` + gloss(-30, -10, 14, 8);
  g += tikusOutfitBody(outfit);
  // soft shadow the head casts on the shoulders
  g += `<ellipse cx="6" cy="-34" rx="60" ry="18" fill="url(#tkShadow)"/>`;
  // arms: [hand x, hand y, elbow x, elbow y] for left then right
  const arms = {
    happy: [[-70, 66, -80, 30], [f(100 + wave), -96, 96, -30]],
    cheer: [[f(-100 - wave), -104, -96, -36], [f(100 + wave), -104, 96, -36]],
    point: [[-70, 66, -80, 30], [146, -26, 100, -14]],
    think: [[-26, -50, -86, -30], [70, 66, 80, 30]],
    verdict: [[-70, 66, -80, 30], [104, -62, 96, -10]],
    shock: [[-104, -100, -100, -30], [104, -100, 100, -30]],
    calm: [[-70, 66, -80, 30], [70, 66, 80, 30]],
  }[pose] || [[-70, 66, -80, 30], [70, 66, 80, 30]];
  arms.forEach(([ex, ey, kx, ky], i) => {
    g += plushLimb(`M${i ? 48 : -48},-6 Q${kx},${ky} ${ex},${ey}`, 20) + `<circle cx="${ex}" cy="${ey}" r="14" fill="url(#tkPink)"/>`;
  });
  // ears (perk up when shocked), head, muzzle
  const ear = pose === 'shock' ? -12 : 0;
  [-1, 1].forEach(sd => {
    g += `<circle cx="${sd * 74}" cy="${-188 + ear}" r="52" fill="url(#tkFur)"/>`;
    g += `<circle cx="${sd * 72}" cy="${-185 + ear}" r="33" fill="url(#tkPink)"/>`;
  });
  g += `<circle cx="0" cy="-118" r="88" fill="url(#tkFur)"/>` + gloss(-44, -176, 22, 12, -32, 0.75);
  g += `<ellipse cx="0" cy="-80" rx="50" ry="35" fill="url(#tkBelly)"/>`;
  g += `<ellipse cx="-58" cy="-86" rx="22" ry="13" fill="url(#tkBlush)"/><ellipse cx="58" cy="-86" rx="22" ry="13" fill="url(#tkBlush)"/>`;
  g += face(kind, { lx: -32, rx: 32, ey: -130, er: 20, my: -66, mw: 22, skin: m.fur, style: 'soft', ink: m.line, weight: 6 }, t);
  if (outfit !== 'none' && kind !== 'cool') g += tikusGlasses();
  // buck teeth peek out under smiling mouths
  if (['smile', 'calm', 'wink', 'love', 'cool', 'smug', 'skeptical'].includes(kind))
    g += `<path d="M-9,-60 L-9,-48 Q-9,-45 -6,-45 L6,-45 Q9,-45 9,-48 L9,-60" fill="#fff" ${stroke(2.5, m.line)}/><line x1="0" y1="-60" x2="0" y2="-45" ${stroke(2, m.line)}/>`;
  g += `<ellipse cx="0" cy="-94" rx="14" ry="10" fill="url(#tkPink)"/>` + gloss(-4, -98, 5, 3, -20, 0.9);
  [[-1, -88, -1], [-1, -82, 0], [-1, -76, 1], [1, -88, -1], [1, -82, 0], [1, -76, 1]].forEach(([sd, wy, tilt]) =>
    g += `<line x1="${sd * 36}" y1="${wy}" x2="${sd * 80}" y2="${wy + tilt * 10}" ${stroke(2.5, m.whisker)} opacity="0.8"/>`);
  g += tikusOutfitNeck(outfit);
  if (pose === 'verdict') g += magnifier(126, -104, 34, -20, m.line);
  return G(T(x, y + bob, s, rot), 1, g);
}
