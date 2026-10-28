// Stickman: a mascot for another channel, in a notebook "doodle" style — wobbly double pen lines that
// re-draw themselves 8 times a second (line boil), a green marker-coloured head that spills over its
// outline, and pencil hatching (a deliberate contrast with Si Cicak's clean ink look).
//   stickman(x, y, s, pose, t, rot = 0, walk = null, faceKind = null)  — same poses and faces as cicak()
// (0, 0) is the middle of the body; the feet are at y ~150, the head top at y ~-214.

const STICK = { head: '#8BD36E', hatch: '#5DA544', ink: '#26262E' };

function stickman(x, y, s, pose = 'happy', t = 0, rot = 0, walk = null, faceKind = null) {
  const wave = 12 * Math.sin(t * 9), boil = Math.floor(t * 8);
  const kind = faceKind || POSE_FACE[pose] || 'smile';
  const jit = (i, a = 2.6) => (rnd(boil * 131 + i) - 0.5) * 2 * a;
  let n = 0;
  // a pen stroke through points: one firm line plus a lighter second pass, both slightly off
  const pen = (pts, w = 11) => {
    const path = o => 'M' + pts.map(([px, py], i) => `${f(px + jit(n + i * 2 + o))},${f(py + jit(n + i * 2 + 1 + o))}`).join(' L');
    n += 40;
    return `<path d="${path(0)}" fill="none" ${stroke(w, STICK.ink)}/>` +
      `<path d="${path(17)}" fill="none" ${stroke(w * 0.32, STICK.ink)} opacity="0.45"/>`;
  };
  const wobblyCircle = (cx, cy, r, o) => {
    let d = '';
    for (let k = 0; k <= 36; k++) {
      const a = k / 36 * Math.PI * 2 - 0.3, rr = r * (1 + 0.022 * jit(o + (k % 36), 1));
      d += `${k ? 'L' : 'M'}${f(cx + rr * Math.cos(a))},${f(cy + rr * Math.sin(a))}`;
    }
    return d + 'Z';
  };
  let g = '';
  // scribbled ground under the feet
  g += `<path d="M-74,${f(156 + jit(1))} q24,-6 48,0 t48,0 t48,0" fill="none" ${stroke(3, STICK.ink)} opacity="0.35"/>`;
  // pencil-hatched shadow on the ground, on the side away from the light
  for (let k = 0; k < 7; k++) {
    const hx = -30 + k * 13;
    g += `<line x1="${f(hx + jit(70 + k))}" y1="${f(150 + jit(80 + k, 1))}" x2="${f(hx + 16 + jit(90 + k))}" y2="${f(162 + jit(100 + k, 1))}" ${stroke(2.5, STICK.ink)} opacity="0.3"/>`;
  }
  // legs: a stride when walking, a little jump-spread when shocked
  const swing = walk !== null ? 34 * Math.sin(walk) : 0;
  const lf = pose === 'shock' ? [-62, 138] : [-36 + swing, 150], rf = pose === 'shock' ? [62, 138] : [36 - swing, 150];
  g += pen([[0, 40], [lf[0] * 0.5, 96], lf]) + pen([[0, 40], [rf[0] * 0.5, 96], rf]);
  g += pen([[0, -86], [0, -20], [0, 40]]);
  // arms from the shoulder (0,-60): [elbow x, elbow y, hand x, hand y] for left then right
  const arms = {
    happy: [[-34, -10, -46, 34], [70, -92, f(100 + wave), -150]],
    cheer: [[-66, -100, f(-106 - wave), -160], [66, -100, f(106 + wave), -160]],
    point: [[-34, -10, -46, 34], [64, -64, 126, -70]],
    think: [[-48, -22, -24, -94], [34, -10, 46, 34]],
    verdict: [[-34, -10, -46, 34], [54, -48, 84, -86]],
    shock: [[-58, -96, -92, -150], [58, -96, 92, -150]],
    calm: [[-34, -10, -46, 34], [34, -10, 46, 34]],
  }[pose] || [[-34, -10, -46, 34], [34, -10, 46, 34]];
  if (walk !== null) { arms[0] = [-30, -8, f(-40 - swing * 0.6), 30]; arms[1] = [30, -8, f(40 + swing * 0.6), 30]; }
  arms.forEach(([kx, ky, hx, hy], i) => {
    g += pen([[0, -60], [kx, ky], [+hx, hy]]);
    g += `<circle cx="${f(+hx + 3)}" cy="${f(hy + 2)}" r="10" fill="${STICK.head}"/><path d="${wobblyCircle(+hx, hy, 10, 300 + i * 40)}" fill="none" ${stroke(3.5, STICK.ink)}/>`;
  });
  // the green head: marker fill a little off the outline, pencil hatching, wobbly double outline
  g += `<path d="${wobblyCircle(7, -145, 64, 500)}" fill="${STICK.head}"/>`;
  let hatch = '';
  // chords across the lower-right half (the shadow side), perpendicular to the light direction n
  const nx = Math.cos(0.75), ny = Math.sin(0.75);
  for (let d = 6; d < 60; d += 11) {
    const h = Math.sqrt(64 * 64 - d * d) * 0.85, cx = 7 + d * nx, cy = -145 + d * ny;
    hatch += `M${f(cx + h * ny)},${f(cy - h * nx)} L${f(cx - h * ny)},${f(cy + h * nx)} `;
  }
  g += `<path d="${hatch}" fill="none" ${stroke(3, STICK.hatch)} opacity="0.55"/>`;
  g += `<path d="${wobblyCircle(0, -150, 64, 600)}" fill="none" ${stroke(6, STICK.ink)}/>` +
    `<path d="${wobblyCircle(1, -149, 63, 650)}" fill="none" ${stroke(2, STICK.ink)} opacity="0.45"/>`;
  g += G(`translate(${f(jit(900, 1.2))} ${f(jit(901, 1.2))})`, 1,
    face(kind, { lx: -24, rx: 24, ey: -158, er: 15, my: -124, mw: 22, skin: STICK.head, style: 'doodle', ink: STICK.ink, weight: 6 }, t));
  if (pose === 'verdict') g += magnifier(108, -124, 32, -20, STICK.ink);
  return G(T(x, y, s, rot), 1, g);
}
