// Si Cicak: mascot of @cicaktahu, a house gecko standing up and facing the viewer, after the model sheet in
// docs/mascots/cicak.png: a wide round head with big eyes bulging from its top corners, a wide smile, a slim
// body with a lighter belly, thin limbs with round toe pads and a long tail curling out to the left.
//   cicak(x, y, s, pose, t, rot = 0, walk = null, faceKind = null)
//   pose: 'happy' (waves) | 'cheer' (both arms up) | 'point' (points right) | 'think' (hand to chin)
//         | 'verdict' (magnifier) | 'shock' (tail drops off) | 'calm'
//   faceKind: any of FACES (engine/faces.js); default depends on the pose (POSE_FACE)
//   walk: a phase in radians; when set the legs step (use t * speed)
//   rot turns the whole gecko, so it can still run along a wall or hang from a ceiling.
// (0, 0) is the middle of the body; the feet are at y ~134, the head reaches y ~-192.

const GECKO = { body: '#8FCB57', belly: '#D3EBAA', dark: '#5E9A35', spot: '#B6DC86' };

// three round toe pads fanned around (x, y), pointing at angle a (radians)
function geckoToes(x, y, a, r = 9) {
  return [-0.55, 0, 0.55].map(d => {
    const tx = x + 15 * Math.cos(a + d), ty = y + 15 * Math.sin(a + d);
    return `<circle cx="${f(tx)}" cy="${f(ty)}" r="${r}" fill="${GECKO.body}" ${stroke(4.5)}/>`;
  }).join('');
}

function cicak(x, y, s, pose = 'happy', t = 0, rot = 0, walk = null, faceKind = null) {
  const c = GECKO.body, sway = Math.sin(t * 3) * 6 + (walk !== null ? Math.sin(walk) * 8 : 0);
  const wave = 10 * Math.sin(t * 9), bob = walk !== null ? Math.abs(Math.sin(walk)) * -6 : 0;
  let g = `<ellipse cx="0" cy="${f(138 - bob)}" rx="80" ry="13" fill="${C.ink}" opacity="0.12"/>`;
  // tail: a long curl out to the left; it drops off when shocked, a real gecko trick
  const tail = vol(taper(-14, 84, -104, 132, -150, 52, 30, 14), c, { depth: 8, w: 6, rot }) +
    vol(taper(-150, 52, -176, -2, -136, -18, 14, 6), c, { depth: 5, w: 6, rot }) +
    `<circle cx="-92" cy="114" r="6" fill="${GECKO.spot}"/><circle cx="-136" cy="78" r="5" fill="${GECKO.spot}"/>`;
  g += pose === 'shock' ? G(T(-40, 30, 1, -24), 1, tail) + `<path d="M-120,150 l-14,8 M-100,166 l-6,14 M-140,128 l-16,2" ${stroke(5)}/>`
    : G(`rotate(${f(sway)} -14 84)`, 1, tail);
  // legs, bent a little outward, stepping when walking
  [-1, 1].forEach((sd, i) => {
    const step = walk !== null ? 9 * Math.sin(walk + i * Math.PI) : 0, lift = walk !== null ? Math.max(0, 10 * Math.sin(walk + i * Math.PI)) : 0;
    const fx = sd * 40 + step, fy = 124 - lift;
    g += limb(`M${sd * 22},${f(84 + bob)} Q${sd * 50},${f(98 + bob)} ${f(fx)},${f(fy + bob)}`, 17, c) + geckoToes(fx + sd * 4, fy + 6 + bob, sd > 0 ? 0.35 : Math.PI - 0.35);
  });
  // body with a lighter belly and a few spots
  g += G(T(0, bob), 1, vol('M0,-62 C30,-62 42,-20 40,30 C38,84 22,104 0,104 C-22,104 -38,84 -40,30 C-42,-20 -30,-62 0,-62 Z', c, { depth: 12, rot }) +
    `<path d="M0,-34 C17,-34 24,0 22,38 C20,74 12,90 0,90 C-12,90 -20,74 -22,38 C-24,0 -17,-34 0,-34 Z" fill="${GECKO.belly}"/>` +
    [[-30, 0, 5], [32, 26, 5], [-32, 60, 4]].map(([sx, sy, r]) => `<circle cx="${sx}" cy="${sy}" r="${r}" fill="${GECKO.spot}"/>`).join(''));
  // arms: [hand x, hand y, elbow x, elbow y, finger angle] for left then right
  const arms = {
    happy: [[-60, 46, -54, 4, 1.9], [f(112 + wave), -132, 88, -60, -1.4]],
    cheer: [[f(-112 - wave), -130, -88, -60, -1.8], [f(112 + wave), -130, 88, -60, -1.4]],
    point: [[-60, 46, -54, 4, 1.9], [156, -44, 104, -36, -0.1]],
    think: [[-60, 46, -54, 4, 1.9], [26, -92, 80, -20, -2.2]],
    verdict: [[-60, 46, -54, 4, 1.9], [100, -64, 84, -14, -1.2]],
    shock: [[-108, -92, -82, -46, -2.2], [108, -92, 82, -46, -0.9]],
    calm: [[-60, 46, -54, 4, 1.9], [60, 46, 54, 4, 1.2]],
  }[walk === null ? pose : 'calm'] || [[-60, 46, -54, 4, 1.9], [60, 46, 54, 4, 1.2]];
  arms.forEach(([hx, hy, kx, ky, a], i) => {
    const sx = i ? 32 : -32, swing = walk !== null ? 10 * Math.sin(walk + (i ? 0 : Math.PI)) : 0;
    g += limb(`M${sx},${f(-32 + bob)} Q${kx},${f(ky + bob)} ${f(+hx + swing)},${f(+hy + bob)}`, 14, c) + geckoToes(+hx + swing, +hy + bob, a, 7.5);
  });
  // a wide round head; the eyes bulge out of its top corners
  const hy = bob;
  g += G(T(0, hy), 1,
    vol(circleD(-60, -158, 31), c, { depth: 8, rot }) + vol(circleD(60, -158, 31), c, { depth: 8, rot }) +
    vol('M0,-192 C44,-192 74,-170 80,-136 C86,-98 54,-68 0,-68 C-54,-68 -86,-98 -80,-136 C-74,-170 -44,-192 0,-192 Z', c, { depth: 14, rot }) +
    `<circle cx="-11" cy="-130" r="3.5" fill="${GECKO.dark}"/><circle cx="11" cy="-130" r="3.5" fill="${GECKO.dark}"/>` +
    `<ellipse cx="-62" cy="-108" rx="13" ry="8" fill="${C.cheek}" opacity="0.55"/><ellipse cx="62" cy="-108" rx="13" ry="8" fill="${C.cheek}" opacity="0.55"/>` +
    [[-22, -168, 5], [18, -180, 4], [30, -158, 3.5]].map(([sx, sy, r]) => `<circle cx="${sx}" cy="${sy}" r="${r}" fill="${GECKO.spot}"/>`).join('') +
    face(faceKind || POSE_FACE[pose] || 'smile', { lx: -60, rx: 60, ey: -160, er: 24, my: -108, mw: 38, skin: c }, t));
  if (pose === 'verdict') g += magnifier(124, -118 + bob, 38, -20);
  return G(T(x, y, s, rot), 1, g);
}
