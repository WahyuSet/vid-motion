// Si Tikus: a mascot for another channel, in a soft "plush toy" style — no ink outlines, soft gradient
// shading, glossy highlights and kawaii eyes (a deliberate contrast with Si Cicak's flat ink look).
//   tikus(x, y, s, pose, t, rot = 0, walk = null, faceKind = null)  — same poses and faces as cicak()
// (0, 0) is the middle of the body; the feet are at y ~110, the ears reach y ~-236.

const MOUSE = {
  fur: '#B9B1CF', furHi: '#DDD7EC', furLo: '#9087AD', belly: '#F4F1F9', bellyLo: '#DCD5EA',
  pink: '#F6B3C4', pinkHi: '#FCD3DD', pinkLo: '#E2859F', line: '#3B2F4A', whisker: '#7A7094',
};

// gradients are defined inside each drawing; repeated ids are identical, so duplicates are harmless
function tikusDefs() {
  const m = MOUSE;
  const rg = (id, a, b, c) => `<radialGradient id="${id}" cx="38%" cy="30%" r="78%"><stop offset="0" stop-color="${a}"/><stop offset="0.62" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
  return `<defs>${rg('tkFur', m.furHi, m.fur, m.furLo)}${rg('tkPink', m.pinkHi, m.pink, m.pinkLo)}${rg('tkBelly', '#fff', m.belly, m.bellyLo)}` +
    `<radialGradient id="tkShadow"><stop offset="0" stop-color="#3B2F4A" stop-opacity="0.28"/><stop offset="1" stop-color="#3B2F4A" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="tkBlush"><stop offset="0" stop-color="#FF8FA8" stop-opacity="0.7"/><stop offset="1" stop-color="#FF8FA8" stop-opacity="0"/></radialGradient></defs>`;
}

// a rounded limb shaded like the body: mid tone with a soft light streak along it
const plushLimb = (d, w) => `<path d="${d}" fill="none" stroke="${MOUSE.fur}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${MOUSE.furHi}" stroke-width="${f(w * 0.32)}" stroke-linecap="round" opacity="0.7" transform="translate(-2 -2)"/>`;
const gloss = (x, y, rx, ry, rot = -30, o = 0.7) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${o}" transform="rotate(${rot} ${x} ${y})"/>`;

function tikus(x, y, s, pose = 'happy', t = 0, rot = 0, walk = null, faceKind = null) {
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
  // buck teeth peek out under smiling mouths
  if (['smile', 'calm', 'wink', 'love', 'cool', 'smug', 'skeptical'].includes(kind))
    g += `<path d="M-9,-60 L-9,-48 Q-9,-45 -6,-45 L6,-45 Q9,-45 9,-48 L9,-60" fill="#fff" ${stroke(2.5, m.line)}/><line x1="0" y1="-60" x2="0" y2="-45" ${stroke(2, m.line)}/>`;
  g += `<ellipse cx="0" cy="-94" rx="14" ry="10" fill="url(#tkPink)"/>` + gloss(-4, -98, 5, 3, -20, 0.9);
  [[-1, -88, -1], [-1, -82, 0], [-1, -76, 1], [1, -88, -1], [1, -82, 0], [1, -76, 1]].forEach(([sd, wy, tilt]) =>
    g += `<line x1="${sd * 36}" y1="${wy}" x2="${sd * 80}" y2="${wy + tilt * 10}" ${stroke(2.5, m.whisker)} opacity="0.8"/>`);
  if (pose === 'verdict') g += magnifier(126, -104, 34, -20, m.line);
  return G(T(x, y + bob, s, rot), 1, g);
}
