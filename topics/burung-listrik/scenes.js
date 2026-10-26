// Topic: Kenapa burung tidak tersetrum di kabel listrik? (paper style: one world, moving camera)
Object.assign(C, {
  sparrow: '#A8754E', sparrowD: '#7A5236', sparrowL: '#EBD8BC', beak: '#E8A13A',
  eagle: '#A0522D', eagleD: '#6E3418', eagleW: '#F6F1E7', talon: '#F2B33D',
  pole: '#CFC8BA', poleD: '#9F988A', house: '#E6DAC4', houseL: '#C4B497', roof: '#DCC6A2',
  ground: '#E2D3B8', tree: '#D5DCB2', kite: '#E0522F', kite2: '#2F5E9E', cloud: '#FBF6EC',
  water: '#7FB2DF', grid: '#DCE6EF',
});

// ---------- the world: two sagging 20 kV wires between concrete poles ----------
const W1 = 0, W2 = 160, SAG = 130, POLES = [-900, 900], SPAN = [-2700, -900, 900, 2700];
const BIRD_X = -140, EAGLE_X = 420, EAGLE_S = 0.8, GROUND = 900;

function wireY(x, base) {
  for (let i = 0; i < SPAN.length - 1; i++) {
    const a = SPAN[i], b = SPAN[i + 1];
    if (x >= a && x <= b) { const u = (x - a) / (b - a); return base + 2 * u * (1 - u) * SAG; }
  }
  return base;
}
const wire = base => {
  let d = '';
  for (let i = 0; i < SPAN.length - 1; i++) d += `M${SPAN[i]},${base} Q${(SPAN[i] + SPAN[i + 1]) / 2},${base + SAG} ${SPAN[i + 1]},${base}`;
  return `<path d="${d}" fill="none" ${stroke(9)}/>`;
};
const headText = (s, x, y, size, fill, extra = '') =>
  `<text x="${f(x)}" y="${f(y)}" font-family="${HEAD_FONT}" font-size="${size}" fill="${fill}" text-anchor="middle" dominant-baseline="central" ${extra}>${esc(s)}</text>`;

function cloud(x, y, s) {
  const b = [[0, 0, 60], [62, -22, 50], [-62, -10, 46], [112, 10, 40], [-112, 12, 38], [30, 22, 50], [-40, 24, 44]];
  return G(T(x, y, s), 1, b.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="${C.houseL}"/>`).join('') +
    b.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.cloud}"/>`).join(''));
}

function sky(t) {
  let s = `<circle cx="-760" cy="-980" r="120" fill="#F7D27A" ${stroke(6)}/>`;
  [[-1300, -700, 1], [250, -950, 0.8], [1350, -640, 1.1], [-250, -520, 0.6], [2000, -900, 0.9]].forEach(([x, y, k], i) =>
    s += cloud(x + ((t * 10 + i * 300) % 800) - 400, y, k));
  return s;
}

function town() {
  let s = `<rect x="-4000" y="${GROUND}" width="8000" height="2000" fill="${C.ground}"/><line x1="-4000" y1="${GROUND}" x2="4000" y2="${GROUND}" ${stroke(6)}/>`;
  for (let i = -13; i <= 13; i++) {
    const x = i * 300 + rnd(i) * 90, w = 170 + rnd(i + 40) * 90, h = 130 + rnd(i + 80) * 130;
    if (rnd(i + 5) > 0.55) {
      s += `<circle cx="${f(x)}" cy="${f(1250 - h * 0.7)}" r="${f(h * 0.42)}" fill="${C.tree}" ${stroke(4, C.houseL)}/>`;
      s += `<rect x="${f(x - 8)}" y="${f(1250 - h * 0.35)}" width="16" height="${f(h * 0.35)}" fill="${C.houseL}"/>`;
      continue;
    }
    s += `<rect x="${f(x - w / 2)}" y="${f(1250 - h)}" width="${f(w)}" height="${f(h)}" fill="${C.house}" ${stroke(4, C.houseL)}/>`;
    s += `<path d="M${f(x - w / 2 - 18)},${f(1250 - h)} L${f(x)},${f(1250 - h - 70)} L${f(x + w / 2 + 18)},${f(1250 - h)} Z" fill="${C.roof}" ${stroke(4, C.houseL)}/>`;
    s += `<rect x="${f(x - 22)}" y="${f(1250 - h * 0.62)}" width="44" height="44" rx="6" fill="#F4ECDD" ${stroke(4, C.houseL)}/>`;
  }
  return s;
}

function pole(x) {
  let s = `<rect x="${x - 28}" y="-270" width="56" height="${GROUND + 270}" fill="${C.pole}" ${stroke(6)}/>`;
  s += `<line x1="${x - 8}" y1="-240" x2="${x - 8}" y2="${GROUND - 20}" ${stroke(3, C.poleD)}/>`;
  s += `<rect x="${x - 180}" y="-220" width="360" height="26" rx="6" fill="${C.poleD}" ${stroke(6)}/>`;
  [-140, 0, 140].forEach(dx => s += `<ellipse cx="${x + dx}" cy="-232" rx="15" ry="7" fill="#fff" ${stroke(4)}/><ellipse cx="${x + dx}" cy="-246" rx="12" ry="6" fill="#fff" ${stroke(4)}/>`);
  [W1, W2].forEach(b => {
    s += `<rect x="${x - 46}" y="${b - 8}" width="92" height="16" rx="5" fill="${C.poleD}" ${stroke(5)}/>`;
    [14, 28, 42].forEach(k => s += `<ellipse cx="${x}" cy="${b - k}" rx="17" ry="7" fill="#fff" ${stroke(4)}/>`);
  });
  // danger sign, like the ones on PLN poles
  s += G(T(x, 420), 1, `<rect x="-80" y="-70" width="160" height="150" rx="12" fill="${C.yellow}" ${stroke(6)}/>` +
    `<path d="M10,-52 L-26,4 L-2,4 L-14,46 L26,-14 L2,-14 Z" fill="${C.ink}"/>` + headText('AWAS!', 0, 62, 30, C.ink));
  return s;
}

function currentDots(base, t, I) {
  if (I <= 0.01) return '';
  let s = '';
  for (let k = 0; k < 44; k++) {
    const u = (t * 0.045 + k / 44) % 1, x = -2700 + 5400 * u, y = wireY(x, base);
    s += `<rect x="${f(x - 13)}" y="${f(y - 5)}" width="26" height="10" rx="5" fill="${C.yellow}" ${stroke(3)}/>`;
  }
  return G('', I, s);
}

// ---------- characters ----------
// sparrow facing left; (x, y) is where its feet grip the wire
function sparrow(x, y, s, o = {}) {
  const t = o.t || 0, bob = Math.sin(t * 2.2) * 3;
  let b = `<path d="M-12,-14 L-12,2 M12,-14 L12,2" ${stroke(6, C.beak)}/>`;
  b += `<path d="M-22,4 Q-12,-8 -2,4 M2,4 Q12,-8 22,4" fill="none" ${stroke(4)}/>`;
  b += `<path d="M30,-44 L96,-22 L86,-6 L24,-24 Z" fill="${C.sparrowD}" ${stroke(5)}/>`;
  b += `<ellipse cx="0" cy="-48" rx="48" ry="38" fill="${C.sparrow}" ${stroke(6)}/>`;
  b += `<ellipse cx="-10" cy="-36" rx="30" ry="22" fill="${C.sparrowL}"/>`;
  b += `<path d="M-8,-66 Q34,-74 50,-42 Q22,-30 -4,-38 Z" fill="${C.sparrowD}" ${stroke(5)}/>`;
  b += `<circle cx="-36" cy="-88" r="29" fill="${C.sparrow}" ${stroke(6)}/>`;
  b += `<path d="M-62,-98 Q-42,-126 -12,-104 Q-34,-108 -62,-98 Z" fill="${C.sparrowD}"/>`;
  b += `<ellipse cx="-42" cy="-78" rx="13" ry="8" fill="${C.sparrowL}"/>`;
  b += o.cool ? `<path d="M-74,-106 L-22,-106 Q-24,-82 -46,-80 Q-70,-82 -74,-106 Z" fill="${C.ink}"/>` +
      `<path d="M-22,-104 L-4,-110" ${stroke(5)}/><path d="M-64,-99 L-54,-99" ${stroke(3, '#fff')} opacity="0.8"/>`
    : o.happy ? `<path d="M-54,-94 Q-46,-104 -38,-94" fill="none" ${stroke(5)}/>`
    : `<circle cx="-46" cy="-93" r="6" fill="${C.ink}"/><circle cx="-44" cy="-95" r="2" fill="#fff"/>`;
  b += o.sing ? `<path d="M-63,-90 L-86,-96 L-64,-84 L-84,-74 L-62,-78 Z" fill="${C.beak}" ${stroke(4)}/>`
    : `<path d="M-63,-90 L-84,-84 L-63,-78 Z" fill="${C.beak}" ${stroke(4)}/>`;
  return G(T(x, y + bob, s), 1, b);
}

function note(x, y, s, o) {
  return G(T(x, y, s, -10), o, `<ellipse cx="0" cy="0" rx="13" ry="9" fill="${C.ink}" transform="rotate(-20)"/>` +
    `<path d="M11,-3 L11,-46 Q30,-38 26,-20" fill="none" ${stroke(5)}/>`);
}

// elang bondol, the white-headed kite of Jakarta; (x, y) = feet on the wire
const WING = 'M-30,-110 C-90,-200 -180,-230 -232,-196 L-214,-176 L-226,-156 L-202,-148 L-208,-126 L-182,-122 L-186,-100 C-130,-92 -70,-80 -30,-70 Z';
const WING_TIPS = 'M-232,-196 L-214,-176 L-226,-156 L-202,-148 L-208,-126 L-182,-122 L-186,-100 C-176,-140 -196,-176 -232,-196 Z';
const eagleWing = (flap, side) => `<g transform="scale(${side} 1) rotate(${f(flap)} -30 -90)">` +
  `<path d="${WING}" fill="${C.eagle}" ${stroke(6)}/><path d="${WING_TIPS}" fill="${C.eagleD}"/>` +
  `<path d="M-60,-118 C-110,-160 -160,-175 -200,-170" fill="none" ${stroke(4, C.eagleD)}/></g>`;

function wingTip(ex, ey, s, flap, side) {
  const a = flap * Math.PI / 180, px = -30, py = -90, vx = -232 - px, vy = -196 - py;
  return [ex + side * (px + vx * Math.cos(a) - vy * Math.sin(a)) * s, ey + (py + vx * Math.sin(a) + vy * Math.cos(a)) * s];
}
// wing angle that puts the tip exactly on the upper wire
function touchFlap(ex, ey, s, side) {
  let best = 0, err = 1e9;
  for (let fl = -60; fl <= 40; fl += 0.25) {
    const [tx, ty] = wingTip(ex, ey, s, fl, side), e = Math.abs(ty - wireY(tx, W1));
    if (e < err) { err = e; best = fl; }
  }
  return best;
}

function eagle(x, y, s, o = {}) {
  let b = `<path d="M-22,-40 L22,-40 L34,26 L0,16 L-34,26 Z" fill="${C.eagleD}" ${stroke(6)}/>`;
  b += eagleWing(o.flapL ?? -50, 1) + eagleWing(o.flapR ?? -50, -1);
  b += limb('M-14,-34 L-14,-2', 8, C.talon) + limb('M14,-34 L14,-2', 8, C.talon);
  b += `<path d="M-26,2 Q-14,-12 -2,2 M2,2 Q14,-12 26,2" fill="none" ${stroke(5)}/>`;
  b += `<ellipse cx="0" cy="-80" rx="48" ry="60" fill="${C.eagle}" ${stroke()}/>`;
  b += `<path d="M-30,-114 Q0,-62 30,-114 Q20,-132 0,-134 Q-20,-132 -30,-114 Z" fill="${C.eagleW}"/>`;
  b += `<circle cx="0" cy="-148" r="38" fill="${C.eagleW}" ${stroke()}/>`;
  b += o.shock ? eyePair(-15, 15, -154, 11, [0, 0], 0.3)
    : `<circle cx="-14" cy="-154" r="6" fill="${C.ink}"/><circle cx="14" cy="-154" r="6" fill="${C.ink}"/><path d="M-30,-168 L-6,-160 M30,-168 L6,-160" ${stroke(5)}/>`;
  b += `<path d="M-11,-140 Q0,-132 11,-140 Q12,-118 0,-106 Q-4,-118 -11,-140 Z" fill="${C.talon}" ${stroke(5)}/>`;
  return G(T(x, y, s, o.rot || 0), 1, b);
}

function kite(x, y, s, rot, t) {
  let tail = '', pts = '';
  for (let k = 0; k <= 24; k++) { const yy = 110 + k * 10; pts += `${f(18 * Math.sin(yy * 0.05 + t * 5))},${yy} `; }
  tail += `<polyline points="${pts}" fill="none" ${stroke(3)}/>`;
  [160, 220, 280].forEach(yy => { const xx = 18 * Math.sin(yy * 0.05 + t * 5); tail += `<path d="M${f(xx)},${yy} l-16,-8 l0,16 Z M${f(xx)},${yy} l16,-8 l0,16 Z" fill="${C.yellow}" ${stroke(3)}/>`; });
  return G(T(x, y, s, rot), 1, tail +
    `<path d="M0,-90 L66,-10 L0,110 L-66,-10 Z" fill="${C.kite}" ${stroke(6)}/>` +
    `<path d="M0,-90 L66,-10 L0,-10 Z M0,-10 L-66,-10 L0,110 Z" fill="${C.kite2}"/>` +
    `<path d="M0,-90 L66,-10 L0,110 L-66,-10 Z" fill="none" ${stroke(6)}/>` +
    `<path d="M0,-90 L0,110 M-66,-10 L66,-10" ${stroke(4, '#7A5A3A')}/>`);
}

// jagged lightning through a list of points, re-rolled 24 times a second
function lightning(points, t, width = 1, outlined = false) {
  const seed = Math.floor(t * 24);
  let pts = [];
  points.forEach((p, i) => {
    if (i === 0) { pts.push(p); return; }
    const [ax, ay] = points[i - 1], [bx, by] = p, n = 6;
    const len = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / len, ny = (bx - ax) / len;
    for (let k = 1; k <= n; k++) {
      const u = k / n, j = k === n ? 0 : (rnd(seed * 31 + i * 7 + k) - 0.5) * 34;
      pts.push([ax + (bx - ax) * u + nx * j, ay + (by - ay) * u + ny * j]);
    }
  });
  const d = pts.map(p => `${f(p[0])},${f(p[1])}`).join(' ');
  if (outlined) return `<polyline points="${d}" fill="none" ${stroke(20 * width)}/>` +
    `<polyline points="${d}" fill="none" ${stroke(12 * width, C.yellow)}/>` +
    `<polyline points="${d}" fill="none" ${stroke(4 * width, '#FFF6C4')}/>`;
  return `<polyline points="${d}" fill="none" ${stroke(22 * width, C.yellow)} opacity="0.45"/>` +
    `<polyline points="${d}" fill="none" ${stroke(9 * width, '#FFF6C4')}/>` +
    `<polyline points="${d}" fill="none" ${stroke(3 * width, C.ink)} opacity="0.5"/>`;
}

const tagW = (label, x, y, size, fill = '#fff', color = C.ink) => {
  const w = measure(label, size) + size * 1.2, h = size * 1.7;
  return `<rect x="${f(x - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(h / 2)}" fill="${fill}" ${stroke(size * 0.18)}/>` +
    txt(label, x, y + size * 0.05, size, color);
};

// ---------- timing, camera, headlines ----------
let K = {}, FLAP_L = 0, FLAP_R = 0;

const ICON = {
  bolt: () => `<path d="M8,-28 L-16,4 L-1,4 L-8,28 L16,-6 L1,-6 Z" fill="${C.yellow}" ${stroke(4)}/>`,
  myth: () => headText('?', 0, 4, 52, C.accent),
  diff: () => `<path d="M-18,-8 L18,-8 M-18,10 L18,10 M10,-22 L-10,24" fill="none" ${stroke(6, C.cool)}/>`,
  danger: () => `<path d="M0,-26 L26,20 L-26,20 Z" fill="${C.yellow}" ${stroke(4)}/><path d="M0,-10 L0,6" ${stroke(5)}/><circle cx="0" cy="13" r="3" fill="${C.ink}"/>`,
  kite: () => `<path d="M0,-26 L20,-4 L0,28 L-20,-4 Z" fill="${C.kite}" ${stroke(4)}/><path d="M0,-26 L0,28 M-20,-4 L20,-4" ${stroke(3)}/>`,
};

function setup(D) {
  const s = D.scenes;
  K = {
    volt: s[0].at('20.000'), s2: s[1].start, santai: s[1].at('santai'), kok: s[1].at('Kok'),
    s3: s[2].start, kebal: s[2].at('kebal'), fakta: s[2].at('Faktanya'), mitos: s[2].at('mitos'), s3e: s[2].end,
    s4: s[3].start, beda: s[3].at('beda'), s4e: s[3].end,
    s5: s[4].start, sama: s[4].at('sama'), nol: s[4].at('nol'), s5e: s[4].end,
    s6: s[5].start, arus: s[5].at('Arus'), s6e: s[5].end,
    s7: s[6].start, dua: s[6].at('dua'), tembus: s[6].at('menembus'), s7e: s[6].end,
    s8: s[7].start, elang: s[7].at('elang'), s8e: s[7].end,
    s9: s[8].start, satu: s[8].at('satu'), s9e: s[8].end,
    s10: s[9].start, layang: s[9].at('layangan'), loop: D.total - 1.5,
  };
  const ey = wireY(EAGLE_X, W2);
  FLAP_L = touchFlap(EAGLE_X, ey, EAGLE_S, 1);
  FLAP_R = touchFlap(EAGLE_X, ey, EAGLE_S, -1);
  const bY = wireY(BIRD_X, W1);
  const start = { x: -300, y: 130, z: 0.85 };
  setCamera([
    start,
    { at: 0.2, dur: s[0].end - 0.2, x: -220, y: 60, z: 1.0 },
    { at: K.s2, dur: 1.0, x: BIRD_X, y: bY - 50, z: 2.2 },
    { at: K.s3, dur: 0.9, x: -40, y: bY - 40, z: 1.45 },
    { at: K.s4, dur: 1.6, x: -110, y: bY - 10, z: 1.15 },
    { at: K.s5, dur: 0.9, x: BIRD_X, y: bY - 25, z: 3.2 },
    { at: K.s6, dur: 1.0, x: -80, y: bY + 30, z: 1.3 },
    { at: K.s7, dur: 1.2, x: EAGLE_X, y: ey - 100, z: 1.45 },
    { at: K.s8 + 0.2, dur: 1.6, x: EAGLE_X, y: ey - 130, z: 1.15 },
    { at: K.s9, dur: 1.1, x: BIRD_X, y: bY - 40, z: 1.7 },
    { at: K.s10, dur: 1.0, x: 170, y: 90, z: 1.3 },
    { at: K.loop, dur: 1.4, ...start },
  ]);
  setHeadlines([
    { at: K.volt, end: s[0].end - 0.1, text: '*20.000* VOLT' },
    { at: K.kok, end: s[1].end - 0.1, text: 'KOK BISA\n*SANTAI*?' },
    { at: K.kebal, end: K.fakta, text: 'KAKI *KEBAL*\nLISTRIK?' },
    { at: K.beda, end: K.s4e - 0.1, text: 'BEDA *TEGANGAN*', y: 330 },
    { at: K.sama, end: K.nol - 0.05, text: 'TEGANGAN *SAMA*' },
    { at: K.nol, end: K.s5e - 0.1, text: 'BEDANYA = *0*' },
    { at: K.arus, end: K.s6e - 0.1, text: 'ARUS LEWAT\n*KABEL*' },
    { at: K.dua, end: K.tembus, text: '*DUA* KABEL\nSEKALIGUS' },
    { at: K.tembus + 0.05, end: K.s7e - 0.1, text: 'ARUS *MENEMBUS*!' },
    { at: K.elang, end: K.s8e - 0.1, text: 'ELANG SERING\n*TERSENGAT*' },
    { at: K.satu, end: K.s9e - 0.1, text: 'SATU KABEL\n= *AMAN*', y: 400 },
    { at: K.layang, end: K.loop, text: 'JANGAN MAIN\n*LAYANGAN*!' },
  ]);
  setChapters([
    { at: K.volt, icon: ICON.bolt }, { at: K.s3, icon: ICON.myth }, { at: K.s4, icon: ICON.diff },
    { at: K.s7, icon: ICON.danger }, { at: K.s10, icon: ICON.kite },
  ], { at: K.s9, end: K.s10 });
}

function cues(D) {
  return [
    [K.volt, 'zap'], [K.volt, 'tick'], [K.s2, 'whoosh'], [K.santai, 'chirp'], [K.kok, 'pop'],
    [K.s3, 'whoosh'], [K.kebal, 'pop'], [K.mitos, 'thud'],
    [K.s4, 'whoosh'], [K.beda, 'tick'],
    [K.s5, 'whoosh'], [K.sama, 'pop'], [K.sama + 0.15, 'pop'], [K.nol, 'ding'],
    [K.s6, 'whoosh'], [K.arus, 'tick'],
    [K.s7 - 0.4, 'whoosh'], [K.dua, 'pop'], [K.tembus, 'zap'], [K.tembus, 'thud'],
    [K.elang, 'pop'], [K.s8e - 0.25, 'whoosh'],
    [K.s9, 'whoosh'], ...[0, 1, 2, 3].map(i => [K.s9 + i * 0.12, 'pop']), [K.s9 + 0.63, 'ding'], [K.satu, 'tick'],
    [K.s10, 'whoosh'], [K.layang, 'pop'], [K.loop, 'whoosh'],
  ];
}

// ---------- drawing ----------
function drawWorld(t) {
  const bY = wireY(BIRD_X, W1);
  let s = sky(t) + town();
  POLES.forEach(x => s += pole(x));
  s += wire(W1) + wire(W2);
  const I = P(t, K.volt, 0.5) * (1 - P(t, K.loop, 0.8));
  s += currentDots(W1, t, I) + currentDots(W2, t + 7.7, I * 0.85);

  // kite snagged on the wire (last scene)
  if (t > K.s10 - 0.3) {
    const hx = 200, hy = wireY(hx, W1), q = P(t, K.s10 - 0.3, 1.1);
    const kx = lerp(700, hx + 40, q), ky = lerp(-650, hy + 130, q);
    const fade = 1 - P(t, K.loop, 0.8);
    let k = `<path d="M${hx},${hy} Q${hx - 220},${hy + 320} ${hx - 520},${GROUND}" fill="none" ${stroke(3)} opacity="0.7"/>`;
    k += `<path d="M${f(kx)},${f(ky - 90)} L${hx},${f(hy)}" ${stroke(3)}/>`;
    k += `<path d="M${hx - 22},${hy - 2} q11,-16 22,0 q11,16 22,0 q-11,-16 -22,-6" fill="none" ${stroke(3)}/>`;
    k += kite(kx, ky, 0.85, 14 * Math.sin(t * 2.1) * q, t);
    if (t > K.layang + 0.2 && Math.sin(t * 22) > 0) k += lightning([[hx - 30, hy - 40], [hx + 20, hy - 70]], t, 0.4);
    s += G('', fade, k);
  }

  // the sparrow, calm on one wire
  const sing = t > K.santai && t < K.s3 + 0.3;
  s += sparrow(BIRD_X, bY, 1, { t, sing: sing && Math.sin(t * 9) > 0, happy: t > K.satu && t < K.s10 });
  if (sing) for (let k = 0; k < 3; k++) {
    const ph = ((t - K.santai) * 0.8 + k / 3) % 1;
    s += note(BIRD_X - 70 - 70 * ph + 14 * Math.sin(ph * 9), bY - 130 - 150 * ph, 0.9, Math.sin(Math.PI * ph));
  }
  // both feet read the same voltage
  if (t > K.sama && t < K.s5e + 0.3) {
    const o = 1 - P(t, K.s5e - 0.1, 0.3);
    [[-1, 0], [1, 0.15]].forEach(([side, d]) => {
      const p = pop(t, K.sama + d, 0.4), fx = BIRD_X + side * 12, tx = BIRD_X + side * 62, ty = bY + 46;
      s += G('', p.o * o, `<line x1="${fx}" y1="${bY + 4}" x2="${tx}" y2="${ty - 10}" ${stroke(2.5)}/>`) +
        G(`translate(${tx} ${ty}) scale(${f(p.s)}) translate(${-tx} ${-ty})`, p.o * o, tagW('20.000 V', tx, ty, 11, C.yellow));
    });
    const z = pop(t, K.nol, 0.4);
    s += G(`translate(${BIRD_X} ${bY + 82}) scale(${f(z.s)}) translate(${-BIRD_X} ${-(bY + 82)})`, z.o * o, tagW('beda = 0 V', BIRD_X, bY + 82, 12, C.leaf, '#fff'));
  }
  if (t > K.arus && t < K.s6e + 0.3) {
    const o = P(t, K.arus, 0.4) * (1 - P(t, K.s6e - 0.1, 0.3));
    s += G('', o, hand('arus lewat sini', BIRD_X + 10, bY + 95, 40, C.ink) +
      `<path d="M${BIRD_X - 120},${bY + 50} Q${BIRD_X},${bY + 80} ${BIRD_X + 130},${bY + 54}" fill="none" ${stroke(4)} stroke-dasharray="10 10"/>` +
      `<path d="M${BIRD_X + 116},${bY + 44} L${BIRD_X + 134},${bY + 54} L${BIRD_X + 118},${bY + 68}" fill="none" ${stroke(4)}/>`);
  }
  if (t > K.satu && t < K.s9e + 0.3) {
    const p = pop(t, K.satu, 0.45), o = 1 - P(t, K.s9e - 0.1, 0.3);
    s += G(`translate(${BIRD_X} ${bY - 175}) scale(${f(p.s)}) translate(${-BIRD_X} ${-(bY - 175)})`, p.o * o, tagW('✓ AMAN', BIRD_X, bY - 175, 22, C.leaf, '#fff'));
  }

  s += eagleLayer(t);
  s += cicakLayer(t, bY);
  return s;
}

function eagleLayer(t) {
  const tIn = K.s7 - 0.5, tLand = K.s7 + 0.7, tOff = K.s8e - 0.25;
  if (t < tIn || t > tOff + 1.8) return '';
  const ex = EAGLE_X, ey = wireY(EAGLE_X, W2);
  let x = ex, y = ey, fl = -50, fr = -50, shock = false, s = '';
  if (t < tLand) {
    const q = E.outCubic((t - tIn) / (tLand - tIn));
    x = lerp(1150, ex, q); y = lerp(-700, ey, q);
    fl = fr = lerp(-5, -50, q) + 32 * Math.sin(t * 16) * (1 - q);
  } else if (t < tOff) {
    const raise = P(t, K.dua - 0.1, 0.4, E.inOutCubic);
    fl = lerp(-50, FLAP_L, raise); fr = lerp(-50, FLAP_R, raise);
    const fold = P(t, K.tembus + 0.9, 0.5);
    fl = lerp(fl, -50, fold); fr = lerp(fr, -50, fold);
    shock = t > K.tembus;
    if (shock && t < K.tembus + 1.0) x += 5 * Math.sin(t * 70);
    if (t > K.tembus + 0.3) for (let k = 0; k < 3; k++) {
      const ph = ((t - K.tembus) * 0.6 + k / 3) % 1;
      s += `<circle cx="${f(ex + 20 * Math.sin(ph * 7 + k))}" cy="${f(ey - 150 - ph * 160)}" r="${f(14 + 26 * ph)}" fill="#B9B2A6" opacity="${f(0.6 * (1 - ph))}"/>`;
    }
  } else {
    const q = E.inCubic(clamp((t - tOff) / 1.8));
    x = lerp(ex, 1500, q); y = lerp(ey, -1000, q);
    fl = fr = -10 + 34 * Math.sin(t * 16);
    shock = true;
  }
  s += eagle(x, y, EAGLE_S, { flapL: fl, flapR: fr, shock });
  if (t > K.tembus && t < K.tembus + 0.9) {
    const tl = wingTip(ex, ey, EAGLE_S, FLAP_L, 1), tr = wingTip(ex, ey, EAGLE_S, FLAP_R, -1);
    const chest = [ex, ey - 70 * EAGLE_S], feet = [ex, ey];
    s += lightning([tl, chest, feet], t) + lightning([tr, chest], t + 0.37, 0.8);
    [tl, tr].forEach(([px, py], i) => {
      for (let k = 0; k < 6; k++) {
        const a = k * Math.PI / 3 + t * 9 + i, r1 = 14, r2 = 30 + 12 * rnd(Math.floor(t * 24) + k);
        s += `<line x1="${f(px + r1 * Math.cos(a))}" y1="${f(py + r1 * Math.sin(a))}" x2="${f(px + r2 * Math.cos(a))}" y2="${f(py + r2 * Math.sin(a))}" ${stroke(4, C.yellow)}/>`;
      }
    });
  }
  return s;
}

// Si Cicak crawls in along the wire, then turns to give the verdict
function cicakLayer(t, bY) {
  if (t < K.s3 || t > K.s4 + 2.6) return '';
  const xStop = 40, y0 = bY - 70;
  let x, y = y0, rot = -90, walk = null, pose = 'calm';
  if (t < K.fakta) {
    const q = clamp((t - K.s3) / (K.fakta - K.s3));
    x = lerp(460, xStop, q); y = wireY(x, W1) - 70; walk = t * 11;
  } else {
    x = xStop;
    rot = lerp(-90, 0, P(t, K.fakta, 0.35));
    pose = t > K.mitos - 0.15 ? 'verdict' : 'happy';
    if (t > K.s4) { y = y0 - (t - K.s4) * 260; walk = t * 11; pose = 'calm'; }
  }
  return cicak(x, y, 0.42, pose, t, rot, walk);
}

function drawOverlay(t) {
  let s = '';
  if (t > K.mitos - 0.2 && t < K.s3e + 0.1) s += G('', 1 - P(t, K.s3e - 0.25, 0.25), stamp('MITOS!', t, K.mitos, 540, 620));

  // field-notes card: water flows only where there is a height difference
  if (t > K.s4 && t < K.s4e + 0.1) {
    const inn = E.outBack(clamp((t - K.s4) / 0.6)), out = P(t, K.s4e - 0.4, 0.4, E.inCubic);
    s += `<rect width="1080" height="1920" fill="${C.ink}" opacity="${f(0.35 * clamp(inn) * (1 - out))}"/>`;
    s += G(T(540, 1000 + 1200 * (1 - inn) + 1200 * out, 1, -1.5), 1, fieldNotes(t));
  }
  if (t > K.tembus && t < K.tembus + 0.6) s += `<rect width="1080" height="1920" fill="#fff" opacity="${f(0.75 * Math.exp(-(t - K.tembus) * 7))}"/>`;
  s += cite('Sumber: APLIC (Avian Power Line Interaction Committee)', t, K.elang, K.s8e - 0.1);

  // Si Cicak waves goodbye
  if (t > K.layang) {
    const p = pop(t, K.layang, 0.5), out = P(t, K.loop, 0.6, E.inCubic);
    s += G(T(0, 900 * out), 1, cicak(190, 1190, 0.5 * p.s, 'happy', t, 14));
  }
  return s;
}

function fieldNotes(t) {
  let s = `<rect x="-410" y="-420" width="820" height="840" rx="22" fill="#FBF7EE" ${stroke(6)}/>`;
  for (let x = -370; x < 410; x += 40) s += `<line x1="${x}" y1="-410" x2="${x}" y2="410" ${stroke(2, C.grid)}/>`;
  for (let y = -380; y < 420; y += 40) s += `<line x1="-400" y1="${y}" x2="400" y2="${y}" ${stroke(2, C.grid)}/>`;
  s += `<rect x="-440" y="-440" width="150" height="50" fill="${C.yellow}" opacity="0.6" transform="rotate(-24 -365 -415)"/>`;
  s += `<rect x="290" y="-440" width="150" height="50" fill="${C.yellow}" opacity="0.6" transform="rotate(24 365 -415)"/>`;
  s += hand('catatan lapangan', -370, -350, 58, C.ink, 'start');
  const lvl = P(t, K.s4 + 0.5, 3.0, E.lin);
  // high tank on a stand, low tank on the ground, a pipe between
  s += `<line x1="-320" y1="-90" x2="-320" y2="230" ${stroke(8)}/><line x1="-180" y1="-90" x2="-180" y2="230" ${stroke(8)}/>`;
  s += `<rect x="-340" y="-270" width="180" height="180" rx="10" fill="#fff" ${stroke(6)}/>`;
  const hL = lerp(150, 95, lvl);
  s += `<rect x="-334" y="${f(-96 - hL)}" width="168" height="${f(hL)}" fill="${C.water}"/>`;
  s += `<rect x="160" y="50" width="180" height="180" rx="10" fill="#fff" ${stroke(6)}/>`;
  const hR = lerp(30, 85, lvl);
  s += `<rect x="166" y="${f(224 - hR)}" width="168" height="${f(hR)}" fill="${C.water}"/>`;
  const pipe = 'M-160,-120 L-40,-120 Q0,-120 0,-80 L0,40 Q0,80 40,80 L160,80';
  s += `<path d="${pipe}" fill="none" ${stroke(28)}/><path d="${pipe}" fill="none" ${stroke(16, '#BFD9F0')}/>`;
  const segs = [[-160, -120, 0, -120], [0, -120, 0, 80], [0, 80, 160, 80]], lens = [160, 200, 160], L = 520;
  for (let k = 0; k < 12; k++) {
    let d = ((t * 0.5 + k / 12) % 1) * L, i = 0;
    while (d > lens[i]) { d -= lens[i]; i++; }
    const [ax, ay, bx, by] = segs[i], u = d / lens[i];
    s += `<circle cx="${f(lerp(ax, bx, u))}" cy="${f(lerp(ay, by, u))}" r="6" fill="${C.cool}"/>`;
  }
  s += hand('tinggi', -250, -310, 46) + hand('rendah', 250, 10, 46);
  s += hand('mengalir!', 120, -40, 46, C.accent);
  s += `<path d="M60,-6 Q90,30 70,58" fill="none" ${stroke(4, C.accent)}/>`;
  s += hand('beda tinggi → air mengalir', 0, 300, 50);
  s += `<rect x="-300" y="338" width="230" height="40" rx="8" fill="${C.yellow}" opacity="0.8"/>`;
  s += hand('beda tegangan → arus mengalir', 0, 360, 50, C.cool);
  return s;
}
// ---------- thumbnail ----------
function drawThumbnail() {
  const t = 1.3;
  let s = '';
  for (let k = 0; k < 24; k += 2) {
    const a0 = k / 24 * Math.PI * 2, a1 = a0 + Math.PI / 24 * 2;
    s += `<path d="M540,1000 L${f(540 + 1600 * Math.cos(a0))},${f(1000 + 1600 * Math.sin(a0))} L${f(540 + 1600 * Math.cos(a1))},${f(1000 + 1600 * Math.sin(a1))} Z" fill="#F5C95A" opacity="0.45"/>`;
  }
  // two thick live wires with current running along them
  const wires = [[[-60, 1150], [540, 1290], [1140, 1100]], [[-60, 1440], [540, 1580], [1140, 1390]]];
  const at = ([p0, p1, p2], u) => [0, 1].map(i => (1 - u) ** 2 * p0[i] + 2 * u * (1 - u) * p1[i] + u * u * p2[i]);
  wires.forEach((w, wi) => {
    s += `<path d="M${w[0]} Q${w[1]} ${w[2]}" fill="none" ${stroke(22)}/>`;
    for (let k = 0; k < 14; k++) {
      const u = (k + 0.5 + wi * 0.5) / 14, [x, y] = at(w, u), [x2, y2] = at(w, u + 0.01);
      s += `<rect x="-22" y="-9" width="44" height="18" rx="9" fill="${C.yellow}" ${stroke(5)} transform="translate(${f(x)} ${f(y)}) rotate(${f(Math.atan2(y2 - y, x2 - x) * 180 / Math.PI)})"/>`;
    }
  });
  s += lightning([[90, 1050], [250, 1140]], 0.4, 1, true) + lightning([[850, 1110], [1010, 1010]], 0.9, 1, true);
  s += lightning([[190, 1390], [330, 1470]], 0.2, 0.8, true) + lightning([[760, 1450], [910, 1370]], 0.7, 0.8, true);
  // the calm sparrow in shades, feet ringed in red
  const [fx, fy] = at(wires[0], 0.5);
  s += `<ellipse cx="${f(fx)}" cy="${f(fy + 4)}" rx="150" ry="62" fill="none" stroke="${C.accent}" stroke-width="12" transform="rotate(-4 ${f(fx)} ${f(fy)})"/>`;
  s += sparrow(fx, fy, 3.2, { t, cool: true });
  s += cicak(860, 760, 0.62, 'shock', t, -16);
  return { world: s, ui: titleText('*20.000 VOLT*\nKOK SANTAI?', 540, 420, 172, 980, 26) };
}
