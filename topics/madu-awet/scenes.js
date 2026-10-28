// Topic: Madu nggak pernah kedaluwarsa? (paper style: a kitchen table with a big jar of honey, moving camera)
// The x-ray lens dives into the honey twice: sugar pulls the water out of a germ, then an enzyme makes
// hydrogen peroxide. The jar's "EXP" date keeps scrambling: the question of the video.
Object.assign(C, {
  wall: '#F3E6CC', tileLine: '#E6D3AE', honey: '#E9A21A', honeyHi: '#F7C64B', glassC: '#F4F8F8', lid: '#D9A441',
  labelC: '#FFF6E0', germ: '#8FD18B', germDry: '#B9A77A', water: '#7FB2DF', sugar: '#B9760E', enzyme: '#9B7FD1',
  oxy: '#E0522F', bowl: '#9FC9E8',
});

const JAR = { x: 0, y: 260 }, LENS = { x: 540, y: 900, r: 300 };
let K = {};

const ICON = {
  jar: () => `<rect x="-14" y="-12" width="28" height="30" rx="6" fill="${C.honey}" ${stroke(4)}/><rect x="-12" y="-20" width="24" height="9" rx="3" fill="${C.lid}" ${stroke(3)}/>`,
  drop: () => `<path d="M0,-20 C10,-6 16,2 16,8 A16,16 0 0 1 -16,8 C-16,2 -10,-6 0,-20 Z" fill="${C.water}" ${stroke(4)}/>`,
  flask: () => `<path d="M-6,-20 H6 V-6 L18,16 H-18 L-6,-6 Z" fill="#fff" ${stroke(4)}/><path d="M-12,6 L12,6 L18,16 H-18 Z" fill="${C.enzyme}"/>`,
  lid: () => `<rect x="-20" y="-8" width="40" height="18" rx="6" fill="${C.lid}" ${stroke(4)}/><path d="M-12,-14 A14,10 0 0 1 12,-14" fill="none" ${stroke(4)}/><path d="M10,-20 l6,4 l-6,4" fill="none" ${stroke(3)}/>`,
  baby: () => `<circle cx="0" cy="-2" r="16" fill="#F7D9C0" ${stroke(4)}/><circle cx="-5" cy="-4" r="2" fill="${C.ink}"/><circle cx="5" cy="-4" r="2" fill="${C.ink}"/><path d="M-4,5 Q0,8 4,5" fill="none" ${stroke(2.5)}/><path d="M-2,-18 q4,-6 6,0" fill="none" ${stroke(3)}/>`,
};

function setup(D) {
  const s = D.scenes;
  K = {
    masa: s[0].at('Masa'), s2: s[1].start, dewan: s[1].at('Dewan'), puluhan: s[1].at('puluhan'), s2e: s[1].end,
    s3: s[2].start, fakta: s[2].at('fakta'), s3e: s[2].end,
    s4: s[3].start, n17: s[3].at('17'), s4e: s[3].end,
    s5: s[4].start, sedot: s[4].at('menyedot'), kuman: s[4].at('kuman'), berkembang: s[4].at('berkembang'), s5e: s[4].end,
    s6: s[5].start, asam: s[5].at('asam'), s6e: s[5].end,
    s7: s[6].start, enzim: s[6].at('enzim'), hidrogen: s[6].at('hidrogen'), anti: s[6].at('antikuman'), s7e: s[6].end,
    s8: s[7].start, tutup: s[7].at('tutup'), rapat: s[7].at('rapat'), kemasukan: s[7].at('kemasukan'), fermen: s[7].at('berfermentasi'), s8e: s[7].end,
    s9: s[8].start, kristal: s[8].at('mengkristal'), hangat: s[8].at('Hangatkan'), pelan: s[8].at('pelan'), s9e: s[8].end,
    s10: s[9].start, bayi: s[9].at('bayi'), tahun: s[9].at('tahun'), loop: D.total - 1.5,
  };
  const start = { x: -20, y: 40, z: 1.15 };
  setCamera([
    start,
    { at: K.s2, dur: 0.9, x: 160, y: -150, z: 1.3 },
    { at: K.s3, dur: 0.8, x: -80, y: 0, z: 1.2 },
    { at: K.s4, dur: 0.9, x: 0, y: 60, z: 1.6 },
    { at: K.s5, dur: 0.8, x: 0, y: 120, z: 2.6 },
    { at: K.s6, dur: 0.8, x: 60, y: -20, z: 1.45 },
    { at: K.s7, dur: 0.8, x: 0, y: 120, z: 2.6 },
    { at: K.s8, dur: 0.8, x: 0, y: -60, z: 1.25 },
    { at: K.s9, dur: 0.8, x: 0, y: 40, z: 1.3 },
    { at: K.s10, dur: 0.8, x: -100, y: 0, z: 1.1 },
    { at: K.loop, dur: 1.3, ...start },
  ]);
  setHeadlines([
    { at: -0.6, end: K.s2 - 0.1, text: 'MADU NGGAK\n*KEDALUWARSA*?' },  // already in place on frame 0
    { at: K.puluhan, end: K.s2e - 0.1, text: 'AWET\n*PULUHAN TAHUN*' },
    { at: K.n17, end: K.s4e - 0.1, text: '*17%*\nAIR', hype: true },
    { at: K.sedot, end: K.s5e - 0.1, text: 'GULA\n*MENYEDOT* AIR' },
    { at: K.asam, end: K.s6e - 0.1, text: 'MADU ITU\n*ASAM*' },
    { at: K.hidrogen, end: K.s7e - 0.1, text: 'HIDROGEN\n*PEROKSIDA*' },
    { at: K.tutup, end: K.s8e - 0.1, text: 'TUTUP\n*RAPAT*!' },
    { at: K.kristal, end: K.s9e - 0.1, text: 'KRISTAL =\n*BUKAN BASI*' },
    { at: K.bayi, end: D.outroAt - 0.15, text: 'BAYI <\n*1 TAHUN*', hype: true },
  ]);
  setChapters([
    { at: 0.3, icon: ICON.jar }, { at: K.s4, icon: ICON.drop }, { at: K.s6, icon: ICON.flask },
    { at: K.s8, icon: ICON.lid }, { at: K.s10, icon: ICON.baby },
  ]);
}

function cues(D) {
  const c = [
    [0.3, 'pop'], [K.masa, 'pop'], [K.s2, 'whoosh'], [K.s3, 'whoosh'], [K.fakta, 'thud'],
    [K.s4, 'whoosh'], [K.n17, 'ding'], [K.s5, 'whoosh'], [K.sedot, 'pop'], [K.berkembang, 'sparkle'],
    [K.s6, 'whoosh'], [K.s6 + 0.3, 'pop'], [K.asam, 'pop'], [K.s7, 'whoosh'], [K.enzim, 'pop'], [K.anti, 'zap'],
    [K.s8, 'whoosh'], [K.rapat, 'click'], [K.rapat + 0.05, 'pop'], [K.kemasukan, 'pop'], [K.fermen, 'pop'],
    [K.s9, 'whoosh'], [K.kristal, 'sparkle'], [K.hangat, 'whoosh'], [K.s10, 'whoosh'], [K.bayi, 'thud'], [K.tahun + 0.4, 'ding'],
    [K.loop, 'whoosh'],
  ];
  for (let t = K.puluhan - 0.3; t < K.puluhan + 1.0; t += 0.12) c.push([t, 'tick']);  // calendar pages
  return c;
}

// ---------- the kitchen ----------
function kitchen(t) {
  let s = `<rect x="-2000" y="-2000" width="4000" height="4000" fill="${C.wall}"/>`;
  for (let k = -12; k <= 12; k++) {  // tiled wall
    s += `<line x1="${k * 150}" y1="-2000" x2="${k * 150}" y2="300" ${stroke(4, C.tileLine)}/>`;
    s += `<line x1="-2000" y1="${k * 150 + 40}" x2="2000" y2="${k * 150 + 40}" ${stroke(4, C.tileLine)}/>`;
  }
  s += woodPlank(-1200, 262, 2400, 70, { col: '#C99B6D' }) + `<rect x="-1200" y="332" width="2400" height="1200" fill="#B48A5E"/>`;
  return s;
}

function calendar(t) {
  const x = 300, y = -190, year = Math.round(lerp(2026, 2056, P(t, K.puluhan - 0.3, 1.3, E.inOutCubic) * (1 - P(t, K.loop, 1.0))));  // back to 2026 for the loop
  let s = vol(rectD(x - 95, y - 110, 190, 220, 10), '#FFFFFF', { depth: 8, w: 6 });
  s += `<rect x="${x - 95}" y="${y - 110}" width="190" height="56" rx="10" fill="${C.accent}"/><rect x="${x - 95}" y="${y - 70}" width="190" height="16" fill="${C.accent}"/>`;
  s += txt('TAHUN', x, y - 82, 26, '#fff', 900);
  [-50, 50].forEach(dx => s += `<rect x="${x + dx - 6}" y="${y - 126}" width="12" height="30" rx="6" fill="#B9BCC2" ${stroke(4)}/>`);
  s += mono(String(year), x, y + 10, 58, C.ink, { anchor: 'middle' });
  for (let k = 0; k < 4; k++) for (let j = 0; j < 5; j++) s += `<rect x="${x - 76 + j * 32}" y="${y + 50 + k * 12}" width="22" height="6" rx="3" fill="${C.line}"/>`;
  // pages flying off while the years run
  const fly = clamp((t - K.puluhan + 0.3) / 1.3);
  if (fly > 0 && fly < 1) for (let k = 0; k < 3; k++) {
    const u = (fly * 3 + k / 3) % 1;
    s += G(T(x + 40 + u * 160, y - 40 - u * 120, 1, -20 + u * 140), 1 - u, `<rect x="-60" y="-50" width="120" height="100" rx="6" fill="#fff" ${stroke(4)}/>`);
  }
  return s;
}

// a glass jar of honey standing on (x, y); opts: label scramble, crystal 0..1, lid twist, small = no label text
function honeyJar(x, y, s, t, { crystal = 0, twist = 0, lidOff = false, exp = true } = {}) {
  let g = shadow(0, 4, 200, 0.18);
  const body = 'M-150,-330 C-170,-322 -175,-300 -175,-270 L-175,-30 C-175,-10 -160,0 -140,0 L140,0 C160,0 175,-10 175,-30 L175,-270 C175,-300 170,-322 150,-330 Z';
  g += `<path d="${body}" fill="${C.glassC}" fill-opacity="0.55"/>`;
  g += vol('M-160,-286 L160,-286 L160,-30 C160,-20 152,-14 140,-14 L-140,-14 C-152,-14 -160,-20 -160,-30 Z', C.honey, { depth: 22, w: 0 });
  g += `<ellipse cx="0" cy="-286" rx="160" ry="14" fill="${C.honeyHi}"/>`;
  if (crystal > 0) {  // crystals: the honey turns pale and grainy
    g += `<path d="M-160,-286 L160,-286 L160,-30 C160,-20 152,-14 140,-14 L-140,-14 C-152,-14 -160,-20 -160,-30 Z" fill="#F6DFA8" opacity="${f(0.85 * crystal)}"/>`;
    for (let k = 0; k < 40; k++) {
      const cx = -140 + rnd(k) * 280, cy = -270 + rnd(k + 50) * 245, r = 3 + rnd(k + 9) * 5;
      g += `<path d="M${f(cx)},${f(cy - r)} L${f(cx + r * 0.87)},${f(cy - r / 2)} L${f(cx + r * 0.87)},${f(cy + r / 2)} L${f(cx)},${f(cy + r)} L${f(cx - r * 0.87)},${f(cy + r / 2)} L${f(cx - r * 0.87)},${f(cy - r / 2)} Z" fill="#fff" opacity="${f(crystal * 0.9)}"/>`;
    }
  }
  // label with the scrambling expiry date
  if (exp) {
    g += vol(rectD(-128, -236, 256, 150, 14), C.labelC, { depth: 6, w: 5 });
    const hex = (cx, cy, r) => `<path d="M${cx},${cy - r} L${f(cx + r * 0.87)},${cy - r / 2} L${f(cx + r * 0.87)},${cy + r / 2} L${cx},${cy + r} L${f(cx - r * 0.87)},${cy + r / 2} L${f(cx - r * 0.87)},${cy - r / 2} Z" fill="${C.honeyHi}" ${stroke(4)}/>`;
    g += hex(-84, -184, 26) + txt('MADU', 26, -194, 52, C.ink, 900);
    g += mono('EXP ' + scramble('??-????', t, 1e9, 1, { seed: 3, rate: 10 }), 0, -122, 26, C.accent, { anchor: 'middle' });
  }
  g += `<path d="${body}" fill="none" ${stroke()}/>`;
  g += `<path d="M-150,-240 C-156,-180 -156,-110 -150,-60" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity="0.55"/>`;
  g += `<path d="M-130,-300 L-130,-338 L130,-338 L130,-300" fill="${C.glassC}" fill-opacity="0.6" ${stroke(6)}/>`;
  if (!lidOff) {  // the lid: a little bounce and wiggle while it is screwed tight
    g += G(`translate(0 ${f(-4 * twist)}) rotate(${f(3 * Math.sin(twist * 12))} 0 -360)`, 1,
      vol(rectD(-146, -392, 292, 56, 12), C.lid, { depth: 8 }) +
      [...Array(11)].map((_, k) => `<line x1="${-120 + k * 24}" y1="-384" x2="${-120 + k * 24}" y2="-344" ${stroke(3, '#A9792A')}/>`).join(''));
  }
  return G(T(x, y, s), 1, g);
}

function drawWorld(t) {
  let s = kitchen(t) + calendar(t);
  // the lid is screwed tight on "rapat"; crystals come with "mengkristal" and melt in the warm bowl
  const twist = t > K.tutup && t < K.rapat + 0.4 ? Math.sin(P(t, K.tutup, K.rapat + 0.4 - K.tutup, E.lin) * Math.PI) : 0;
  const crystal = P(t, K.kristal, 0.8) * (1 - P(t, K.pelan, 1.4, E.inOutCubic));
  const bowlIn = P(t, K.hangat - 0.2, 0.6, E.outBack) * (1 - P(t, K.s10, 0.5, E.inCubic));
  if (bowlIn > 0.01) s += G(T(0, 1200 * (1 - bowlIn)), 1, `<path d="M-260,150 L260,150 C250,250 180,300 0,300 C-180,300 -250,250 -260,150 Z" fill="${C.bowl}" ${stroke()}/>`);
  s += honeyJar(JAR.x, JAR.y, 1, t, { crystal, twist });
  if (bowlIn > 0.01) {
    s += G(T(0, 1200 * (1 - bowlIn)), 1, vol('M-280,140 L280,140 C270,270 190,320 0,320 C-190,320 -270,270 -280,140 Z', '#E7EEF3', { depth: 14, shine: false }) +
      `<ellipse cx="0" cy="146" rx="276" ry="20" fill="${C.bowl}" ${stroke(5)}/>`);
    for (let k = 0; k < 4; k++) {  // steam
      const u = (t * 0.6 + k / 4) % 1, sx = -200 + k * 130;
      s += `<path d="M${sx},${f(120 - u * 160)} q16,-24 0,-48 q-16,-24 0,-48" fill="none" ${stroke(6, '#fff')} opacity="${f(bowlIn * Math.sin(u * Math.PI) * 0.8)}"/>`;
    }
  }
  // Si Cicak on the wall
  let pose = 'think', face = 'skeptical';
  if (t >= K.s2 && t < K.s3) { pose = 'point'; face = 'wow'; }
  else if (t >= K.s3 && t < K.s4) { pose = 'verdict'; face = t > K.fakta ? 'smug' : 'skeptical'; }
  else if (t >= K.s4 && t < K.s8) { pose = 'calm'; face = 'smile'; }
  else if (t >= K.s8 && t < K.s9) { pose = 'cheer'; face = 'laugh'; }
  else if (t >= K.s9 && t < K.s10) { pose = 'happy'; face = 'smile'; }
  else if (t >= K.s10 && t < K.loop + 0.3) { pose = 'point'; face = 'calm'; }
  s += cicak(-330, -60, 0.55, pose, t, 0, null, face);
  return s;
}

// ---------- inside the lens ----------
const hexD = (cx, cy, r) => `M${f(cx)},${f(cy - r)} L${f(cx + r * 0.87)},${f(cy - r / 2)} L${f(cx + r * 0.87)},${f(cy + r / 2)} L${f(cx)},${f(cy + r)} L${f(cx - r * 0.87)},${f(cy + r / 2)} L${f(cx - r * 0.87)},${f(cy - r / 2)} Z`;
function sugarField(t, seed = 1) {  // dense sugar molecules (rings) drifting slowly in honey
  let s = `<rect x="200" y="560" width="680" height="680" fill="${C.honeyHi}"/>`;
  for (let k = 0; k < 34; k++) {
    const x = 240 + rnd(seed * 7 + k) * 600 + 8 * Math.sin(t * 0.8 + k), y = 600 + rnd(seed * 13 + k) * 600 + 8 * Math.cos(t * 0.7 + k);
    if (Math.hypot(x - 540, y - 900) < 120) continue;
    s += `<path d="${hexD(x, y, 26)}" fill="${C.honey}" stroke="${C.sugar}" stroke-width="5"/><circle cx="${f(x)}" cy="${f(y)}" r="6" fill="${C.sugar}"/>`;
  }
  return s;
}

function germ(x, y, s, t, { dry = 0, kind = null, seed = 1 } = {}) {  // a cute bacterium; dry 0..1 shrinks and wrinkles it
  const sc = s * (1 - 0.35 * dry), col = mix(C.germ, C.germDry, dry);
  let d = '';
  for (let k = 0; k <= 24; k++) {
    const a = k / 24 * Math.PI * 2, r = 70 * (1 + (0.06 + 0.12 * dry) * Math.sin(a * 6 + seed) + 0.03 * Math.sin(t * 5 + k));
    d += `${k ? 'L' : 'M'}${f(r * Math.cos(a) * 1.2)},${f(r * Math.sin(a))}`;
  }
  let g = '';
  for (let k = 0; k < 10; k++) {  // little hairs
    const a = k / 10 * Math.PI * 2 + 0.3 * Math.sin(t * 6 + k);
    g += `<path d="M${f(80 * Math.cos(a))},${f(66 * Math.sin(a))} l${f(22 * Math.cos(a + 0.4))},${f(22 * Math.sin(a + 0.4))}" ${stroke(5)}/>`;
  }
  g += vol(d + 'Z', col, { depth: 12, w: 6 });
  if (dry > 0.3) g += `<path d="M-40,-30 q10,8 0,16 M30,-36 q-8,10 0,18 M-10,30 q10,-6 20,0" fill="none" ${stroke(4, mix(col, C.ink, 0.4))}/>`;
  g += face(kind || (dry > 0.5 ? 'sad' : dry > 0.15 ? 'shock' : 'smile'), { lx: -24, rx: 24, ey: -10, er: 14, my: 24, mw: 18, skin: col }, t);
  return G(T(x, y, sc), 1, g);
}

function osmosisLens(t) {  // sugar pulls the water out of the germ
  const dry = P(t, K.kuman - 0.2, 2.2, E.inOutCubic);
  let s = sugarField(t, 1);
  for (let k = 0; k < 8; k++) {  // water drops leaving the germ toward the sugar
    const a = k / 8 * Math.PI * 2 + 0.3, u = ((t - K.sedot) * 0.7 + k / 8) % 1;
    if (t < K.sedot || dry > 0.97) continue;
    const r = 90 + u * 200, x = 540 + r * Math.cos(a), y = 900 + r * Math.sin(a);
    s += G(T(x, y, 1, a * 57.3 + 90), 1 - u, `<path d="M0,-18 C8,-6 12,0 12,6 A12,12 0 0 1 -12,6 C-12,0 -8,-6 0,-18 Z" fill="${C.water}" ${stroke(3)}/>`);
  }
  return s + germ(540, 900, 1, t, { dry });
}

function enzymeLens(t) {  // an enzyme cuts sugar and lets out hydrogen peroxide that pops a germ
  let s = sugarField(t, 2);
  const bite = Math.abs(Math.sin(t * 5)) * 0.6;
  s += G(T(330, 900), 1, vol(`M0,0 L${f(80 * Math.cos(bite))},${f(-80 * Math.sin(bite))} A80,80 0 1 0 ${f(80 * Math.cos(bite))},${f(80 * Math.sin(bite))} Z`, C.enzyme, { depth: 10, w: 6 }) +
    `<circle cx="-14" cy="-36" r="10" fill="#fff" ${stroke(4)}/><circle cx="-12" cy="-36" r="4" fill="${C.ink}"/>`);
  s += `<path d="${hexD(420, 900, 26)}" fill="${C.honey}" stroke="${C.sugar}" stroke-width="5" opacity="${f(1 - bite)}"/>`;
  const popAt = K.anti;
  for (let k = 0; k < 4; k++) {  // H2O2 molecules drift from the enzyme to the germ
    const u = clamp(((t - K.enzim) * 0.5 + k / 4) % 1), x = lerp(430, 720, u), y = 900 + 60 * Math.sin(u * 6 + k);
    if (t < K.enzim || t > popAt + 0.3) continue;
    s += G(T(x, y), 1, `<line x1="-20" y1="0" x2="20" y2="0" ${stroke(5)}/><circle cx="-12" cy="0" r="13" fill="${C.oxy}" ${stroke(4)}/><circle cx="12" cy="0" r="13" fill="${C.oxy}" ${stroke(4)}/>` +
      `<circle cx="-30" cy="-6" r="8" fill="#fff" ${stroke(3)}/><circle cx="30" cy="6" r="8" fill="#fff" ${stroke(3)}/>`);
  }
  if (t < popAt) s += germ(740, 900, 0.8, t, { kind: t > K.hidrogen ? 'shock' : 'smile', seed: 3 });
  s += burst(t, popAt, 740, 900, { n: 10, r: 140, col: C.germ, dur: 0.5, size: 12 }) + impactRing(t, popAt, 740, 900, { r1: 160, col: C.oxy });
  s += pill('enzim', 330, 1010, 26, C.ink, '#fff', 1, P(t, K.enzim, 0.3)) + pill('H2O2', 580, 800, 26, C.oxy, '#fff', 1, P(t, K.hidrogen, 0.3) * (1 - P(t, popAt + 0.3, 0.3)));
  return s;
}

// ---------- overlay cards ----------
function waterCard(t) {  // what 100 g of honey is made of
  const p = P(t, K.n17 - 0.2, 0.8, E.inOutCubic), W = 780;
  let s = `<rect x="40" y="70" width="${W}" height="64" rx="14" fill="${C.line}"/>`;
  s += `<rect x="40" y="70" width="${f(W * 0.171 * p)}" height="64" rx="14" fill="${C.water}"/>`;
  s += `<rect x="${f(40 + W * 0.171)}" y="70" width="${f(W * 0.821 * p)}" height="64" fill="${C.honey}"/>`;
  s += `<rect x="40" y="70" width="${W}" height="64" rx="14" fill="none" ${stroke(5)}/>`;
  s += mono(scramble('17%', t, K.n17 - 0.2, 0.6), 40, 180, 48, C.cool) + bodyText('air', 150, 180, 40, C.muted);
  s += mono(scramble('82%', t, K.n17, 0.6, { seed: 4 }), 470, 180, 48, C.sugar) + bodyText('gula', 580, 180, 40, C.muted);
  return s;
}

function phCard(t) {  // honey sits on the acid side of the pH scale
  const id = 'phGrad', x0 = 40, W = 780, at = v => x0 + (v - 1) / 13 * W;
  let s = `<defs><linearGradient id="${id}"><stop offset="0" stop-color="#E0522F"/><stop offset="0.3" stop-color="#F5B83D"/>` +
    `<stop offset="0.5" stop-color="#5FA548"/><stop offset="0.75" stop-color="#2F5E9E"/><stop offset="1" stop-color="#6A3FA0"/></linearGradient></defs>`;
  s += `<rect x="${x0}" y="130" width="${W}" height="50" rx="12" fill="url(#${id})" ${stroke(5)}/>`;
  for (let v = 1; v <= 14; v++) s += txt(String(v), at(v), 204, 22, C.muted, 800);
  s += bodyText('asam', x0, 250, 34, C.accent, 'start', 900) + bodyText('basa', x0 + W, 250, 34, '#6A3FA0', 'end', 900);
  const mp = pop(t, K.asam - 0.1, 0.45), wp = pop(t, K.s6 + 0.5, 0.45);
  s += G(T(at(7), 130, wp.s), wp.o, `<path d="M0,0 L-14,-24 L14,-24 Z" fill="${C.cool}" ${stroke(4)}/>` + txt('air', 0, -44, 26, C.cool, 900));
  s += G(T(at(3.9), 130, mp.s), mp.o, `<path d="M0,0 L-18,-30 L18,-30 Z" fill="${C.honey}" ${stroke(4)}/>` + txt('madu', 0, -52, 30, C.ink, 900));
  return s;
}

function openJarCard(t) {  // what not to do: an open jar catching water starts to ferment
  let s = honeyJar(160, 285, 0.5, t, { lidOff: true, exp: false });
  for (let k = 0; k < 3; k++) {  // drops falling in
    const u = ((t - K.kemasukan + 0.3) * 1.2 + k / 3) % 1;
    if (t > K.kemasukan - 0.3) s += G(T(150 + k * 22, 20 + u * 110), 1 - u * 0.3, `<path d="M0,-14 C6,-4 9,0 9,5 A9,9 0 0 1 -9,5 C-9,0 -6,-4 0,-14 Z" fill="${C.water}" ${stroke(3)}/>`);
  }
  const fz = P(t, K.fermen - 0.3, 0.8);
  for (let k = 0; k < 7; k++) {  // bubbles of fermentation
    const u = ((t * 0.8 + k / 7) % 1), bx = 110 + rnd(k) * 120, by = 260 - u * 90;
    s += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(6 + rnd(k + 3) * 6)}" fill="#fff" fill-opacity="0.6" ${stroke(3)} opacity="${f(fz * (1 - u))}"/>`;
  }
  s += cross(170, 180, P(t, K.fermen + 0.2, 0.4));
  s += bodyText('kemasukan air', 330, 140, 40, C.ink, 'start', 900) + bodyText('→ berfermentasi', 330, 196, 38, C.accent, 'start', 900);
  return s;
}
const cross = (x, y, p, r = 110, w = 18) => p <= 0 ? '' : `<path d="M${x - r},${y - r} L${f(x - r + 2 * r * clamp(p * 2))},${f(y - r + 2 * r * clamp(p * 2))}" ${stroke(w, C.accent)}/>` +
  (p > 0.5 ? `<path d="M${x + r},${y - r} L${f(x + r - 2 * r * clamp(p * 2 - 1))},${f(y - r + 2 * r * clamp(p * 2 - 1))}" ${stroke(w, C.accent)}/>` : '');

function babyCard(t) {  // no honey for babies under one
  let s = G(T(140, 210), 1, vol(rectD(-40, -70, 80, 150, 24), '#FFFFFF', { depth: 8, w: 6 }) +
    `<rect x="-40" y="-10" width="80" height="90" rx="20" fill="${C.honey}" opacity="0.8"/>` +
    vol('M-24,-70 L24,-70 L14,-104 C10,-120 -10,-120 -14,-104 Z', '#F2A7B8', { depth: 6, w: 6 }) + `<rect x="-46" y="-80" width="92" height="20" rx="8" fill="${C.cool}" ${stroke(5)}/>`);
  const p = P(t, K.bayi + 0.1, 0.4);
  if (p > 0) s += `<circle cx="140" cy="210" r="${f(120 * E.outBack(p))}" fill="none" ${stroke(16, C.accent)}/><path d="M${f(140 - 85 * p)},${f(210 - 85 * p)} L${f(140 + 85 * p)},${f(210 + 85 * p)}" ${stroke(16, C.accent)}/>`;
  s += bodyText('Jangan beri madu', 300, 130, 44, C.ink, 'start', 900) + bodyText('ke bayi', 300, 184, 44, C.ink, 'start', 900);
  s += bodyText('di bawah 1 tahun', 300, 238, 44, C.accent, 'start', 900) + bodyText('(risiko botulisme)', 300, 292, 32, C.muted, 'start', 800);
  return s;
}

function drawOverlay(t) {
  let s = '';
  s += cite('Sumber: National Honey Board', t, K.puluhan, K.s2e - 0.1);
  if (t > K.fakta - 0.2 && t < K.s3e + 0.1) s += G('', 1 - P(t, K.s3e - 0.25, 0.25), stamp('FAKTA!', t, K.fakta, 600, 1180, C.leaf, -8));

  s += card(t, K.n17 - 0.3, 540, 1260, 860, 250, waterCard(t), { title: 'Isi 100 gram madu', tOut: K.s4e - 0.2 });
  s += cite('Sumber: USDA FoodData Central', t, K.n17, K.s4e - 0.2, 1420);

  // lens 1: water out of the germ
  if (t > K.s5 && t < K.s6 + 0.4) {
    s += spotlight(t, K.s5 + 0.3, K.s6, LENS.x, LENS.y, LENS.r + 30, 0.25);
    s += xray(t, K.s5 + 0.3, LENS.x, LENS.y, LENS.r, osmosisLens(t), { t1: K.s5e - 0.15, id: 'lensA' });
  }
  s += cite('Sumber: Mandal & Mandal (2011)', t, K.sedot, K.s5e - 0.2);

  s += card(t, K.s6 + 0.2, 540, 1240, 880, 300, phCard(t), { title: 'Tingkat keasaman (pH)', tOut: K.s6e - 0.2 });
  s += cite('Sumber: National Honey Board', t, K.asam, K.s6e - 0.2, 1420);

  // lens 2: enzyme makes hydrogen peroxide
  if (t > K.s7 && t < K.s8 + 0.4) {
    s += spotlight(t, K.s7 + 0.3, K.s8, LENS.x, LENS.y, LENS.r + 30, 0.25);
    s += xray(t, K.s7 + 0.3, LENS.x, LENS.y, LENS.r, enzymeLens(t), { t1: K.s7e - 0.15, id: 'lensB' });
  }
  s += cite('Sumber: Mandal & Mandal (2011)', t, K.hidrogen, K.s7e - 0.2);

  s += sticker('KLIK!', t, K.rapat, 790, 560, { rot: 8, size: 96, dur: 0.8 });
  s += card(t, K.kemasukan - 0.3, 540, 1240, 820, 300, openJarCard(t), { title: 'Jangan begini', tOut: K.s8e - 0.2 });
  s += sticker('BLUP!', t, K.fermen + 0.1, 800, 1060, { rot: -8, size: 84, dur: 0.8, col: C.accent });
  s += cite('Sumber: National Honey Board', t, K.kemasukan, K.s8e - 0.2, 1420);
  s += cite('Sumber: National Honey Board', t, K.kristal, K.s9e - 0.2);

  s += card(t, K.bayi - 0.3, 540, 1180, 860, 380, babyCard(t), { title: 'Peringatan', tOut: D.outroAt - 0.3, col: C.accent });
  s += cite('Sumber: CDC (Centers for Disease Control and Prevention)', t, K.bayi, D.outroAt - 0.3, 1420);
  return s;
}

function drawThumbnail() {
  const t = 2.2;
  let s = `<rect width="1080" height="1920" fill="#5A3A12"/>`;
  for (let k = 0; k < 24; k += 2) {
    const a0 = k / 24 * Math.PI * 2, a1 = a0 + Math.PI / 12;
    s += `<path d="M540,1080 L${f(540 + 1700 * Math.cos(a0))},${f(1080 + 1700 * Math.sin(a0))} L${f(540 + 1700 * Math.cos(a1))},${f(1080 + 1700 * Math.sin(a1))} Z" fill="#F5B83D" opacity="0.28"/>`;
  }
  for (let k = 0; k < 18; k++) {  // honeycomb behind
    const cx = 120 + (k % 6) * 170 + (Math.floor(k / 6) % 2) * 85, cy = 700 + Math.floor(k / 6) * 150;
    s += `<path d="${hexD(cx, cy, 82)}" fill="none" stroke="#F5B83D" stroke-width="8" opacity="0.22"/>`;
  }
  s += woodPlank(-20, 1480, 1120, 80, { col: '#C99B6D' });
  s += honeyJar(560, 1480, 1.55, t, {});
  s += `<ellipse cx="560" cy="${f(1480 - 122 * 1.55)}" rx="200" ry="70" fill="none" stroke="${C.accent}" stroke-width="14"/>`;
  s += cicak(170, 1060, 0.6, 'think', t, 12, null, 'skeptical');
  return { world: s, ui: titleText('MADU\n*NGGAK BASI*?', 540, 400, 178, 980, 26) };
}
