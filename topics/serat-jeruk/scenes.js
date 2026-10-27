// Topic: serat jeruk — county of a thrown-away peel (paper style: one kitchen-table world, moving camera)
Object.assign(C, {
  rind: '#F09A38', rindD: '#D97B22', flesh: '#FBC77D', fleshD: '#F5A44E', pith: '#FFFDF3',
  juice: '#F6A94A', glass: '#DCEBF7', fiber: '#F5B83D', beef: '#E9D9BC', beefD: '#D6C09A',
});

// ---------- world layout: 6 stages on a ring so the last camera view returns to the first ----------
const STAGE = [
  { x: 0, y: -1650 }, { x: 1429, y: -825 }, { x: 1429, y: 825 },
  { x: 0, y: 1650 }, { x: -1429, y: 825 }, { x: -1429, y: -825 },
];
const at = (i, lx, ly) => ({ x: STAGE[i].x + lx, y: STAGE[i].y + ly });
// a camera key: stage + local offset + zoom → {x, y, z}
const key = (i, lx, ly, z) => ({ x: STAGE[i].x + lx, y: STAGE[i].y + ly, z });
const near = (cam, i, r = 1050) => Math.hypot(cam.x - STAGE[i].x, cam.y - STAGE[i].y) < r;

// ---------- props (flat ink, drawn world-aligned) ----------
function table(t) {
  let s = `<rect x="-2100" y="-2100" width="4200" height="4200" rx="70" fill="${C.beef}" ${stroke(7, C.beefD)}/>`;
  for (let i = 0; i < 34; i++) {  // seeded wood grain
    const y = -2040 + i * 126 + rnd(i) * 40, len = 300 + rnd(i + 9) * 500, x = -2060 + rnd(i + 3) * 3200;
    s += `<path d="M${f(x)},${f(y)} q${f(len / 2)},${f(10 + rnd(i + 5) * 14)} ${f(len)},0" fill="none" ${stroke(3, C.beefD)} opacity="0.7"/>`;
  }
  return s;
}

function orange(x, y, r, t, shine = true) {
  let s = `<circle cx="0" cy="0" r="${f(r)}" fill="${C.rind}" ${stroke(7)}/>`;
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4, rr = r * (0.35 + 0.5 * rnd(i + 2));
    s += `<circle cx="${f(Math.cos(a) * rr)}" cy="${f(Math.sin(a) * rr)}" r="${f(r * 0.045)}" fill="${C.rindD}"/>`;
  }
  if (shine) s += `<path d="M${f(-r * 0.62)},${f(-r * 0.42)} a${f(r * 0.6)},${f(r * 0.6)} 0 0 1 ${f(r * 0.52)},${f(-r * 0.12)}" fill="none" stroke="#fff" stroke-width="${f(r * 0.14)}" stroke-linecap="round" opacity="0.65"/>`;
  s += `<path d="M0,${f(-r)} q6,${f(-r * 0.3)} 0,${f(-r * 0.42)}" ${stroke(6, C.beefD)}/>`;
  s += `<path d="M${f(r * 0.06)},${f(-r - r * 0.3)} q${f(r * 0.42)},${f(-r * 0.3)} ${f(r * 0.5)},${f(r * 0.1)} q${f(-r * 0.4)},${f(r * 0.3)} ${f(-r * 0.5)},${f(-r * 0.1)} Z" fill="${C.leaf}" ${stroke(5)}/>`;
  return G(T(x, y), 1, s);
}

// cross-section: rind ring, white pith ring, juice segments; pithHi > 0 highlights the pith (pektin beat)
function slice(x, y, r, t, pithHi = 0) {
  let s = `<circle r="${f(r)}" fill="${C.rind}" ${stroke(7)}/>`;
  s += `<circle r="${f(r * 0.86)}" fill="${C.pith}" ${stroke(5)}/>`;
  const rn = r * 0.68, n = 9;
  for (let k = 0; k < n; k++) {
    const a0 = (k / n) * Math.PI * 2 + 0.06, a1 = ((k + 1) / n) * Math.PI * 2 - 0.06;
    const x0 = Math.cos(a0) * rn, y0 = Math.sin(a0) * rn, x1 = Math.cos(a1) * rn, y1 = Math.sin(a1) * rn;
    s += `<path d="M0,0 L${f(x0)},${f(y0)} A${f(rn)},${f(rn)} 0 0 1 ${f(x1)},${f(y1)} Z" fill="${k % 2 ? C.flesh : C.fleshD}" stroke="${C.pith}" stroke-width="7"/>`;
  }
  s += `<circle r="${f(r * 0.08)}" fill="${C.pith}"/>`;
  [[-0.3, 0.5], [0.42, -0.35]].forEach(([ux, uy]) =>
    s += `<ellipse cx="${f(ux * rn)}" cy="${f(uy * rn)}" rx="${f(r * 0.05)}" ry="${f(r * 0.075)}" fill="${C.rindD}"/>`);
  if (pithHi > 0) {
    const p = pithHi, w = r * 0.3 * p;
    s += `<circle r="${f(r * 0.77)}" fill="none" stroke="${C.yellow}" stroke-width="${f(w)}" opacity="0.75"/>`;
    s += sparklesAround(r * 0.8, t);
  }
  return G(T(x, y), 1, s);
}
function sparklesAround(r, t) {
  let s = '';
  for (let k = 0; k < 5; k++) {
    const a = k * 1.26 + 0.4, rr = r + 34 + 8 * Math.sin(t * 3 + k);
    const ph = (t * 0.7 + k * 0.2) % 1;
    if (ph < 0.6) s += sparkle(Math.cos(a) * rr, Math.sin(a) * rr, 26 * Math.sin(Math.PI * ph / 0.6), C.yellow);
  }
  return s;
}

function peel(x, y, s, rot, t, swing) {  // half-peeled curl: orange outside, white pith inside
  const wob = swing ? 4 * Math.sin(t * 2.4 + x) : 0;
  let g = `<path d="M0,0 C-10,70 40,120 96,96 C150,72 160,10 130,-38" fill="none" ${stroke(30, C.rindD)}/>` +
    `<path d="M0,0 C-10,70 40,120 96,96 C150,72 160,10 130,-38" fill="none" ${stroke(15, C.pith)}/>`;
  g += `<path d="M-6,-30 C-30,20 -14,70 26,96" fill="none" ${stroke(24, C.rindD)}/><path d="M-6,-30 C-30,20 -14,70 26,96" fill="none" ${stroke(12, C.pith)}/>`;
  return G(T(x, y, s, rot + wob), 1, g);
}

// jar measuring the daily fibre target: glass body + scale, fills to `full` (0..1)
function jar(x, y, h, full, label, jarT = 0) {
  const w = h * 0.42;
  let s = `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="14" fill="${C.glass}" ${stroke(7)}/>`;
  const fh = h * 0.94 * full;
  if (fh > 4) {
    s += `<rect x="${f(-w / 2 + 7)}" y="${f(h / 2 - 7 - fh)}" width="${f(w - 14)}" height="${f(fh)}" rx="8" fill="${C.fiber}"/>`;
    for (let k = 0; k < 5; k++) {  // rising bubbles inside the fibre fill
      const vh = fh < 6 ? 1 : fh;
      const by = h / 2 - 7 - fh + ((jarT * 0.22 + rnd(k + 30)) % 1) * vh;
      s += `<circle cx="${f((rnd(k + 30) - 0.5) * (w - 30))}" cy="${f(by)}" r="5" fill="#fff" opacity="0.7"/>`;
    }
  }
  [0.06, 0.53, 0.99].forEach(u => s += `<line x1="${f(w / 2 - 4)}" y1="${f(-h / 2 + u * h)}" x2="${f(w / 2 + 16)}" y2="${f(-h / 2 + u * h)}" ${stroke(5)}/>`);
  s += `<rect x="${f(-w / 2 - 8)}" y="${f(-h / 2 - 22)}" width="${f(w + 16)}" height="26" rx="10" fill="${C.pith}" ${stroke(6)}/>`;
  s += pill(label, 0, -h / 2 - 66, 30, C.ink, '#fff');
  return G(T(x, y), 1, s);
}

// small beaker for "only 2,4 g of every 100 g"
function beaker(x, y, h, frac) {
  const w = h * 0.62, fh = h * frac;
  let s = `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="10" fill="${C.glass}" ${stroke(7)}/>`;
  if (fh > 3) s += `<rect x="${f(-w / 2 + 7)}" y="${f(h / 2 - 7 - fh)}" width="${f(w - 14)}" height="${f(fh)}" rx="6" fill="${C.fiber}"/>`;
  s += pill('2,4 g', 0, h / 2 + 52, 28, C.rind, '#fff');
  return G(T(x, y), 1, s);
}

function juiceGlass(x, y, s, t) {
  const fill = 0.5 + 0.05 * Math.sin(t * 2.4);
  let g = `<path d="M-60,-100 L52,-100 L40,110 L-48,110 Z" fill="${C.glass}" ${stroke(7)}/>`;
  g += `<path d="M${f(-54)},${f(110 - 210 * fill)} L${f(46)},${f(110 - 210 * fill)} L40,110 L-48,110 Z" fill="${C.juice}"/>`;
  g += `<circle cx="-16" cy="${f(104 - 170 * fill)}" r="7" fill="#fff" opacity="0.7"/><circle cx="14" cy="${f(96 - 150 * fill)}" r="5" fill="#fff" opacity="0.6"/>`;
  g += `<rect x="6" y="-190" width="16" height="120" rx="8" fill="${C.accent}" transform="rotate(12 14 -130)"/>`;
  return G(T(x, y, s), 1, g);
}

// two measuring columns: fibre in 100 g whole orange vs fibre in 100 g juice
function fibreBars(x, y, p) {
  const H = 300, gap = 150;
  const hj = H * p, hg = Math.max(3, (0.2 / 2.4) * H * p);
  let s = `<line x1="${f(-gap - 130)}" y1="0" x2="${f(gap + 130)}" y2="0" ${stroke(6)}/>`;
  s += `<rect x="-120" y="${f(-hj)}" width="110" height="${f(hj)}" rx="8" fill="${C.fiber}" ${stroke(6)}/>`;
  s += `<rect x="60" y="${f(-hg)}" width="110" height="${f(hg)}" rx="4" fill="${C.fiber}" ${stroke(6)}/>`;
  if (p > 0.85) {
    s += pill('2,4 g', -65, -hj - 46, 30, C.rind, '#fff');
    s += pill('0,2 g', 115, -hg - 66, 30, C.ink, '#fff');
  }
  s += orange(-65, -hj - 170, 62, 0, false);
  s += juiceGlass(115, -hg - 175, 0.62, 0);
  s += txt('jeruk utuh 100 g', -65, 62, 34, C.ink, 900);
  s += txt('jus 100 g', 115, 62, 34, C.ink, 900);
  return G(T(x, y), 1, s);
}

// a section of intestine: wavy tube, pellets flowing calmly through
function intestine(x, y, t) {
  const yc = u => 34 * Math.sin(u / 150);
  let top = '', bot = '';
  for (let i = -460; i <= 460; i += 20) { top += `${i},${f(yc(i) - 58)} `; bot = `${i},${f(yc(i) + 58)} ` + bot; }
  let s = `<polyline points="${top}${bot}" fill="none" ${stroke(7)}/>`;
  s += `<polyline points="${top}" fill="none" ${stroke(4, C.rindD)}/><polyline points="${bot}" fill="none" ${stroke(4, C.rindD)}/>`;
  for (let k = 0; k < 9; k++) {
    const x0 = -430 + ((t * 118 + k * 100) % 920);
    s += `<circle cx="${f(x0)}" cy="${f(yc(x0))}" r="24" fill="${C.rindD}" ${stroke(5)}/>`;
    s += `<circle cx="${f(x0 - 8)}" cy="${f(yc(x0) - 6)}" r="6" fill="${C.flesh}"/>`;
  }
  for (let k = -3; k < 4; k++) {  // direction ticks
    const x1 = k * 150 + 60;
    s += `<path d="M${f(x1)},${f(yc(x1) + 110)} l26,0 m-26,0 l10,-10 m-10,10 l10,10" fill="none" ${stroke(5, C.rindD)}/>`;
  }
  return G(T(x, y), 1, s) + hand('usus', x - 380, y - 150, 54, C.ink, 'start');
}

// ---------- timing ----------
let K = {};

function setup(D) {
  const s = D.scenes;
  K = {
    s1: s[0].start, buang: s[0].at('buang'),
    s2: s[1].start, serat: s[1].at('serat'),
    s3: s[2].start, g25: s[2].at('25'),
    s4: s[3].start, g24: s[3].at('2,4'),
    s5: s[4].start, pektin: s[4].at('pektin'),
    s6: s[5].start, gel: s[5].at('gel'),
    s7: s[6].start, kenyang: s[6].at('kenyang'),
    s8: s[7].start, lancar: s[7].at('lancar'),
    s9: s[8].start, bukti: s[8].at('Buktinya'), g02: s[8].at('0,2'),
    s10: s[9].start, utuh: s[9].at('utuh'),
    s11: s[10].start, satu: s[10].at('Satu'),
    loop: D.total - 1.5,
  };
  setCamera([
    key(0, 0, 0, 0.92),
    { at: K.s2, dur: 1.0, ...key(0, 190, -70, 1.9) },            // zoom to the cut face
    { at: K.s3, dur: 1.1, ...key(1, -60, -60, 1.3) },            // the 25 g jar
    { at: K.s4, dur: 1.0, ...key(1, 60, 80, 1.12) },             // jar + small beaker
    { at: K.s5, dur: 1.1, ...key(2, 0, -30, 1.75) },             // big slice, pith
    { at: K.s7, dur: 1.0, ...key(3, 0, -40, 1.12) },             // behind the gel card → intestine
    { at: K.s9, dur: 1.1, ...key(4, 0, -40, 1.12) },             // bars comparison
    { at: K.s10, dur: 1.0, ...key(5, 40, -40, 1.2) },            // verdict on the whole fruit
    { at: K.s11, dur: 1.2, ...key(0, 0, 0, 0.92) },              // back to the opening view
    { at: K.loop, dur: 0.9, ...key(0, 0, 0, 0.92) },
  ]);
  setHeadlines([
    { at: K.s1, end: K.s3 - 0.1, text: 'SERAT *DIBUANG*?' },
    { at: K.s3, end: K.s4 - 0.1, text: 'TARGET *25 GRAM*' },
    { at: K.s4, end: K.s5 - 0.1, text: 'CUMA *2,4* GRAM' },
    { at: K.s5, end: K.s6 - 0.1, text: '*PEKTIN* SI LARUT' },
    { at: K.s6, end: K.s8 - 0.1, text: 'GEL *LAMBAT* GULA' },
    { at: K.s8, end: K.s9 - 0.1, text: 'BIAR *LANCAR*!' },
    { at: K.s9, end: K.s10 - 0.1, text: 'JUS CUMA *0,2*' },
    { at: K.s10, end: K.s11 - 0.1, text: 'MAKAN *UTUH*!' },
    { at: K.s11, end: K.loop + 0.2, text: '*1 JERUK* SEHARI' },
  ]);
  const iconOrange = () => `<circle r="24" ${stroke(4)}/><circle r="15" fill="none" ${stroke(3)}/><path d="M0,-15 L0,15 M-13,-8 L13,8 M-13,8 L13,-8" ${stroke(3)}/>`;
  const iconJar = () => `<rect x="-16" y="-24" width="32" height="48" rx="6" ${stroke(4)}/><rect x="-11" y="4" width="22" height="15" fill="${C.fiber}" stroke="none"/>`;
  const iconDrop = () => `<path d="M0,-24 C14,-6 22,2 22,10 A22,22 0 0 1 -22,10 C-22,2 -14,-6 0,-24 Z" ${stroke(4)}/>`;
  const iconFlow = () => `<path d="M-24,-10 q12,-12 24,0 t24,0 M-24,10 q12,-12 24,0 t24,0" fill="none" ${stroke(4)}/><path d="M16,-4 l8,4 -8,4" fill="none" ${stroke(3)}/>`;
  const iconCheck = () => `<path d="M-18,2 L-5,15 L19,-14" fill="none" ${stroke(6, C.leaf)}/>`;
  setChapters([
    { at: K.s1, icon: iconOrange }, { at: K.s3, icon: iconJar }, { at: K.s5, icon: iconDrop },
    { at: K.s8, icon: iconFlow }, { at: K.s10, icon: iconCheck },
  ], { at: K.s10, end: K.s11 });
}

function cues(D) {
  return [
    [K.s1, 'pop'], [K.buang, 'tick'],
    [K.s2, 'whoosh'],
    [K.s3, 'whoosh'], [K.g25, 'tick'],
    [K.s4, 'whoosh'], [K.g24, 'pop'],
    [K.s5, 'whoosh'], [K.pektin, 'ding'],
    [K.s6, 'whoosh'], [K.gel, 'pop'],
    [K.kenyang, 'ding'],
    [K.s8, 'whoosh'], [K.lancar, 'pop'],
    [K.s9, 'whoosh'], [K.bukti, 'thud'], [K.g02, 'pop'],
    [K.s10, 'whoosh'], [K.utuh, 'sparkle'],
    [K.s11, 'whoosh'], [K.satu, 'pop'], [K.s11 + 1.6, 'ding'],
    [K.loop, 'whoosh'],
  ];
}

// ---------- drawing ----------
function drawWorld(t, cam) {
  let s = table(t);
  // stage A: whole oranges, a cut slice, the discarded peel, Si Cicak thinking
  if (near(cam, 0)) {
    const o = at(0, -250, -60), o2 = at(0, -60, 190), sl = at(0, 190, -70);
    const flip = t < K.buang ? 0 : P(t, K.buang, 0.5, E.outBack);  // peel flip when it gets thrown
    s += orange(o.x, o.y, 150, t);
    s += orange(o2.x, o2.y, 128, t + 3);
    s += slice(sl.x, sl.y, 148, t);
    s += peel(at(0, 340, 60).x, at(0, 340, 60).y, 1, -14 - 22 * flip, t, true);
    s += peel(at(0, 300, 300).x, at(0, 300, 300).y, 0.8, 150 + 18 * flip, t, true);
    s += cicak(at(0, -390, 330).x, at(0, -390, 330).y, 0.52, t > K.buang && t < K.s2 ? 'happy' : 'think', t, 24);
    if (t > K.buang - 0.1 && t < K.buang + 1) {
      s += pill('dibuang!', at(0, 330, -240).x, at(0, 330, -240).y, 34, C.accent, '#fff', pop(t, K.buang, 0.4).s, pop(t, K.buang, 0.4).o);
    }
    if (t > K.serat + 0.1 && t < K.s3 - 0.1) s += hand('seratnya di sini', at(0, 330, -250).x, at(0, 330, -250).y, 52, C.cool);
  }
  // stage B: the 25 g goal jar, then the 2,4 g beaker next to it
  if (near(cam, 1)) {
    const j = at(1, -140, -120), b = at(1, 250, 130);
    s += jar(j.x, j.y, 360, P(t, K.g25, 1.1), 'target 25 g / hari', t);
    s += beaker(b.x, b.y, 150, (2.4 / 25) * (t > K.s4 ? 1 : 0));
    if (t > K.s4 + 0.3) s += hand('per 100 g jeruk', b.x - 30, b.y - 150, 46, C.ink);
    if (t > K.g25 && t < K.s4 - 0.05) s += hand('gak cukup satu ini!', j.x + 20, j.y + 290, 48, C.accent);
    s += orange(at(1, -420, 330).x, at(1, -420, 330).y, 110, t + 1);
  }
  // stage C: big slice, the pith glowing (pektin), droplets dissolving into it
  if (near(cam, 2)) {
    const sl = at(2, 0, -40);
    const hi = t > K.pektin - 0.3 && t < K.s7 ? Math.min(1, P(t, K.pektin - 0.3, 0.8)) : 0;
    s += slice(sl.x, sl.y, 215, t, hi);
    if (hi > 0) {
      s += hand('pith = pektin', sl.x - 330, sl.y - 240, 56, C.cool, 'start');
      s += `<path d="M${f(sl.x - 60)},${f(sl.y - 210)} q60,-60 140,-30" fill="none" ${stroke(4, C.cool)}/>`;
      s += `<path d="M${f(sl.x + 74)},${f(sl.y - 236)} l-6,26 l26,-14 Z" fill="${C.cool}"/>`;
      for (let k = 0; k < 3; k++) {
        const ph = ((t - K.pektin) * 0.8 + k / 3) % 1;
        const dy = sl.y - 320 + 300 * ph, dx = sl.x - 190 + k * 190;
        s += `<ellipse cx="${f(dx)}" cy="${f(dy)}" rx="16" ry="20" fill="${C.cool}" opacity="${f(0.8 * (1 - ph))}"/>`;
      }
    }
  }
  // stage D: the intestine section
  if (near(cam, 3)) s += intestine(at(3, 0, -60).x, at(3, 0, -60).y, t);
  // stage E: fibre in the whole fruit vs the juice
  if (near(cam, 4)) {
    s += fibreBars(at(4, 0, -90).x, at(4, 0, -90).y, P(t, K.g02 - 0.6, 0.9));
    if (t > K.s9 + 0.6 && t < K.s10 - 0.1) s += hand('serat hampir hilang di jus…', at(4, 0).x, at(4, 0, 330).y, 64, C.accent);
  }
  // stage F: whole fruit verdict + rejected glass, Si Cicak with the magnifier
  if (near(cam, 5)) {
    const o = at(5, -150, -60);
    s += orange(o.x, o.y, 235, t);
    const gx = at(5, 250, -40);
    s += juiceGlass(gx.x, gx.y, 1.15, t);
    if (t > K.utuh - 0.2) {
      const p = P(t, K.utuh - 0.2, 0.35), m = 170;
      s += `<path d="M${f(gx.x - m)},${f(gx.y - m)} L${f(gx.x + m)},${f(gx.y + m)}" stroke="${C.accent}" stroke-width="14" opacity="${f(p)}" stroke-linecap="round"/>`;
      s += `<path d="M${f(gx.x + m)},${f(gx.y - m)} L${f(gx.x - m)},${f(gx.y + m)}" stroke="${C.accent}" stroke-width="14" opacity="${f(p)}" stroke-linecap="round"/>`;
    }
    s += cicak(at(5, -430, 330).x, at(5, -430, 330).y, 0.5, t > K.utuh ? 'verdict' : 'think', t, -18);
  }
  return s;
}

function drawOverlay(t) {
  let s = '';
  // verdict stamp on the juice comparison
  if (t > K.bukti - 0.2 && t < K.s10 - 0.1) s += G('', 1 - P(t, K.s10 - 0.4, 0.3), stamp('FAKTA!', t, K.bukti, 540, 780, C.leaf, -7));
  // mechanism card: the pectin gel slowing sugar through the gut
  if (t > K.gel - 0.35 && t < K.lancar - 0.05) s += gelCard(t);
  // sources
  s += cite('Sumber: WHO — Healthy diet', t, K.g25 - 0.7, K.s4 - 0.2);
  s += cite('Sumber: USDA FoodData Central', t, K.g24 - 0.7, K.s5 - 0.2);
  s += cite('Sumber: USDA FoodData Central', t, K.g02 - 0.9, K.s10 - 0.3);
  s += cite('Sumber: Harvard T.H. Chan School of Public Health', t, K.gel - 0.1, K.lancar - 0.4);
  // closing beat: Si Cicak walks back with the fruit and waves goodbye
  if (t > K.s11 + 0.3 && t < K.loop + 0.6) {
    const p = pop(t, K.s11 + 0.3, 0.5), out = P(t, K.loop, 0.55, E.inCubic);
    s += G(T(0, 900 * out), 1, cicak(210, 1170, 0.55 * p.s, 'happy', t + 4, -12, t * 8));
  }
  return s;
}

// the overlay card: sugar grains slow down while crossing the pectin gel
function gelCard(t) {
  const inn = E.outBack(clamp((t - (K.gel - 0.35)) / 0.55)), out = P(t, K.lancar - 0.45, 0.4, E.inCubic);
  const o = clamp(inn) * (1 - out);
  let card = `<rect x="-430" y="-430" width="860" height="860" rx="26" fill="#FBF7EE" ${stroke(6)}/>`;
  card += `<rect x="-460" y="-460" width="170" height="56" fill="${C.yellow}" opacity="0.6" transform="rotate(-24 -375 -432)"/>`;
  card += `<rect x="290" y="-460" width="170" height="56" fill="${C.yellow}" opacity="0.6" transform="rotate(24 375 -432)"/>`;
  card += hand('cara kerja serat larut', -380, -370, 56, C.ink, 'start');
  // the gut path with a gel zone in the middle
  const gx = 40, gw = 150, yg = -80;
  card += `<rect x="-390" y="${yg - 70}" width="800" height="140" rx="70" fill="#fff" ${stroke(6)}/>`;
  card += `<rect x="${gx}" y="${yg - 70}" width="${gw}" height="140" rx="30" fill="${C.flesh}" ${stroke(5)}/>`;
  for (let k = 0; k < 12; k++) {
    const u = ((t * 0.30 + k / 12) % 1);
    // piecewise position: 0..0.4 fast (−360→gx), 0.4..0.7 slow (gx→gx+gw), 0.7..1 fast (→410)
    let x;
    if (u < 0.4) x = lerp(-360, gx, u / 0.4);
    else if (u < 0.7) x = lerp(gx, gx + gw, (u - 0.4) / 0.3 * 0.55);   // glides slowly through the gel
    else x = lerp(gx + gw * 1.05, 410, (u - 0.7) / 0.3);
    const inGel = x > gx && x < gx + gw;
    card += `<circle cx="${f(x)}" cy="${f(yg + (inGel ? 12 : -18) + 16 * Math.sin(x * 0.05))}" r="${f(inGel ? 17 : 14)}" fill="${C.yellow}" ${stroke(4)}/>`;
    if (inGel) card += `<path d="M${f(x - 10)},${f(yg + 40)} q10,14 20,0" fill="none" ${stroke(3, C.rindD)}/>`;
  }
  card += hand('makanan', -360, yg + 130, 48, C.ink, 'start');
  card += hand('gel pektin', gx + gw / 2, yg - 118, 52, C.cool);
  card += `<path d="M${f(gx + gw / 2)},${f(yg - 96)} l0,16" ${stroke(4, C.cool)}/>`;
  card += hand('gula → diserap pelan', 410, yg + 130, 48, C.accent, 'end');
  // kenyang beat inside the card
  if (t > K.kenyang - 0.25) {
    const p = pop(t, K.kenyang - 0.25, 0.5);
    card += G(`translate(310 250) scale(${f(p.s)}) translate(-310 -250)`, p.o, pill('kenyang lebih lama!', 0, 0, 44, C.leaf, '#fff'));
    card += cicak(-240, 250, 0.42, 'calm', t, 8, null, 'love');
  }
  s = `<rect width="1080" height="1920" fill="${C.ink}" opacity="${f(0.4 * o)}"/>`;
  return s + G(T(540, 1010 + 1150 * (1 - clamp(inn)) - 1150 * out, 1, -1), o, card);
}

// ---------- thumbnail ----------
function drawThumbnail() {
  const t = 5;
  let s = table(t);
  s += orange(-420, 1180, 175, t);
  s += slice(480, 1060, 300, t, 1);
  s += juiceGlass(410, 1660, 1.5, t);
  s += fibreBars(-140, 1560, 1);
  s += cicak(-440, 1620, 0.72, 'verdict', t, -14);
  s += G('', 0.9, stamp('FAKTA!', t, t - 1, 840, 780, C.leaf, -8));
  return { world: s, ui: titleText('*SERAT* JERUK\nYANG KAMU BUANG', 540, 400, 165, 980, 24) };
}
