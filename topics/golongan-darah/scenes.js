// Topic: Jenis-jenis golongan darah manusia (Channel: Stickman, Theme: notebook / doodle)
Object.assign(C, {
  blood: '#E0484F', bloodD: '#B8323A', bloodL: '#F7A7A4', antA: '#F29F38', antB: '#2F6FB5', rh: '#8E6CC8',
  glass: '#EAF2F8', bag: '#F4D2D0',
});
const PEN = '#26262E';

// pen stroke through points, slightly different 8 times a second (line boil)
function doodle(pts, t, seed, w = 7, col = PEN, closed = false) {
  const boil = Math.floor(t * 8), j = i => (rnd(boil * 131 + seed + i) - 0.5) * 5;
  const d = o => 'M' + pts.map(([x, y], i) => `${f(x + j(i * 2 + o))},${f(y + j(i * 2 + 1 + o))}`).join(' L') + (closed ? 'Z' : '');
  return `<path d="${d(0)}" fill="none" ${stroke(w, col)}/><path d="${d(500)}" fill="none" ${stroke(w * 0.3, col)} opacity="0.45"/>`;
}
const ring = (cx, cy, r, n = 28) => [...Array(n)].map((_, k) => [cx + r * Math.cos(k / n * Math.PI * 2), cy + r * Math.sin(k / n * Math.PI * 2)]);
const poly = pts => 'M' + pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' L') + 'Z';
const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
// teardrop outline: point at the top
const dropPts = (x, y, r) => [...Array(30)].map((_, k) => {
  const a = k / 30 * Math.PI * 2;
  return [x + 1.2 * r * Math.sin(a) * Math.sin(a / 2), y - 1.15 * r * Math.cos(a)];
});
// + or − drawn as pen strokes (the handwriting font has no minus sign)
function sign(x, y, plus, size, t, seed, col = PEN) {
  let s = doodle([[x - size, y], [x + size, y]], t, seed, size * 0.38, col);
  if (plus) s += doodle([[x, y - size], [x, y + size]], t, seed + 7, size * 0.38, col);
  return s;
}
function arrow(x1, y1, x2, y2, t, seed, col = PEN, w = 6) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 22;
  return doodle([[x1, y1], [(x1 + x2) / 2 + 12 * Math.sin(a), (y1 + y2) / 2 - 12 * Math.cos(a)], [x2, y2]], t, seed, w, col) +
    doodle([[x2 - h * Math.cos(a - 0.5), y2 - h * Math.sin(a - 0.5)], [x2, y2], [x2 - h * Math.cos(a + 0.5), y2 - h * Math.sin(a + 0.5)]], t, seed + 9, w, col);
}

// ---------- props ----------

// test tube with blood and a label tag above it
function tube(x, y, label, t, seed, bounce = 1) {
  let s = `<path d="M${x - 38},${y - 120} L${x - 38},${y + 80} Q${x - 38},${y + 120} ${x},${y + 120} Q${x + 38},${y + 120} ${x + 38},${y + 80} L${x + 38},${y - 120} Z" fill="${C.glass}"/>`;
  s += `<path d="M${x - 34},${y - 30} L${x - 34},${y + 80} Q${x - 34},${y + 116} ${x},${y + 116} Q${x + 34},${y + 116} ${x + 34},${y + 80} L${x + 34},${y - 30} Z" fill="${C.blood}"/>`;
  s += `<ellipse cx="${x}" cy="${y - 30}" rx="34" ry="8" fill="${C.bloodL}"/>`;
  s += `<rect x="${x - 22}" y="${y - 10}" width="9" height="90" rx="4" fill="#fff" opacity="0.45"/>`;
  const out = [[x - 38, y - 120]];
  for (let k = 0; k <= 8; k++) { const a = Math.PI - k / 8 * Math.PI; out.push([x + 38 * Math.cos(a), y + 82 + 38 * Math.sin(a)]); }
  out.push([x + 38, y - 120]);
  s += doodle(out, t, seed, 6);
  s += doodle([[x - 50, y - 120], [x + 50, y - 120]], t, seed + 40, 7);
  // tag
  s += G(T(x, y - 190, bounce), 1, `<rect x="-52" y="-38" width="104" height="76" rx="14" fill="#fff"/>` +
    doodle(rectPts(-52, -38, 104, 76), t, seed + 60, 5, PEN, true) + hand(label, 0, 2, 64, C.bloodD));
  return s;
}

// red blood cell seen from above, with its antigens ("penanda") around the edge
// kind 'A' triangles, 'B' dots, 'AB' both, 'O' none; rh adds purple diamonds; g = growth 0..1
function cell(x, y, r, kind, rh, t, seed, g = 1, label = null) {
  let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.blood}"/>`;
  s += `<ellipse cx="${x + r * 0.06}" cy="${y + r * 0.06}" rx="${f(r * 0.56)}" ry="${f(r * 0.5)}" fill="${C.bloodD}" opacity="0.35"/>`;
  s += `<ellipse cx="${x - r * 0.42}" cy="${y - r * 0.46}" rx="${f(r * 0.22)}" ry="${f(r * 0.1)}" fill="#fff" opacity="0.35" transform="rotate(-35 ${f(x - r * 0.42)} ${f(y - r * 0.46)})"/>`;
  s += doodle(ring(x, y, r, 30), t, seed, 6, PEN, true);
  const n = 10, gs = clamp(g * 1.4, 0, 1);
  for (let k = 0; k < n; k++) {
    const type = kind === 'AB' ? (k % 2 ? 'B' : 'A') : kind;
    const a = k / n * Math.PI * 2 - Math.PI / 2, cs = Math.cos(a), sn = Math.sin(a);
    const q = E.outBack(clamp(gs * 1.3 - k * 0.03));
    if (type !== 'O' && q > 0.01) {
      const r1 = r - 2, r2 = r + 18 * q, hx = x + (r + 30 * q) * cs, hy = y + (r + 30 * q) * sn;
      s += `<line x1="${f(x + r1 * cs)}" y1="${f(y + r1 * sn)}" x2="${f(x + r2 * cs)}" y2="${f(y + r2 * sn)}" ${stroke(4, PEN)}/>`;
      if (type === 'A') {
        const z = 15 * q, deg = a * 180 / Math.PI + 90;
        s += G(T(hx, hy, 1, deg), 1, `<path d="M0,${f(-z)} L${f(z)},${f(z * 0.8)} L${f(-z)},${f(z * 0.8)} Z" fill="${C.antA}" ${stroke(3.5, PEN)}/>`);
      } else {
        s += `<circle cx="${f(hx)}" cy="${f(hy)}" r="${f(12 * q)}" fill="${C.antB}" ${stroke(3.5, PEN)}/>`;
      }
    }
    if (rh) {
      const qa = E.outBack(clamp((rh === true ? 1 : rh) * 1.3 - k * 0.03));
      if (qa > 0.01) {
        const b = a + Math.PI / n, dx = x + (r + 16 * qa) * Math.cos(b), dy = y + (r + 16 * qa) * Math.sin(b), z = 11 * qa;
        s += `<path d="M${f(dx)},${f(dy - z)} L${f(dx + z)},${f(dy)} L${f(dx)},${f(dy + z)} L${f(dx - z)},${f(dy)} Z" fill="${C.rh}" ${stroke(3, PEN)}/>`;
      }
    }
  }
  if (label) s += hand(label, x, y + 4, r * 0.75, '#fff', 'middle', `stroke="${PEN}" stroke-width="${f(r * 0.06)}" paint-order="stroke"`);
  return s;
}

// antibody: a blue "Y", arms pointing along rot
function antibody(x, y, s, rot, t, seed) {
  const pts = [[0, 26], [0, 0]];
  return G(T(x, y, s, rot), 1, doodle(pts, t, seed, 7, C.cool) + doodle([[-16, -20], [0, 0], [16, -20]], t, seed + 3, 7, C.cool));
}

function bloodBag(x, y, t, seed) {
  let s = `<rect x="${x - 90}" y="${y - 110}" width="180" height="220" rx="34" fill="${C.bag}"/>`;
  s += `<rect x="${x - 76}" y="${y - 40}" width="152" height="136" rx="26" fill="${C.blood}"/>`;
  s += doodle(rectPts(x - 90, y - 110, 180, 220), t, seed, 6, PEN, true);
  s += doodle([[x - 20, y - 110], [x - 20, y - 136], [x + 20, y - 136], [x + 20, y - 110]], t, seed + 20, 6);
  s += `<rect x="${x - 56}" y="${y - 22}" width="112" height="84" rx="12" fill="#fff"/>` + doodle(rectPts(x - 56, y - 22, 112, 84), t, seed + 30, 4, PEN, true);
  s += hand('O', x - 14, y + 20, 70, C.bloodD) + sign(x + 26, y + 20, false, 12, t, seed + 40, C.bloodD);
  s += doodle([[x, y + 110], [x, y + 150]], t, seed + 50, 8);
  return s;
}

function drop(x, y, r, t, seed, fill = C.blood) {
  return `<path d="${poly(dropPts(x, y, r))}" fill="${fill}"/>` + doodle(dropPts(x, y, r), t, seed, 5, PEN, true) +
    `<ellipse cx="${f(x - r * 0.35)}" cy="${f(y + r * 0.1)}" rx="${f(r * 0.14)}" ry="${f(r * 0.26)}" fill="#fff" opacity="0.4"/>`;
}

// blood type card for the "8 golongan" row
function typeCard(x, y, abo, plus, t, seed, s = 1, o = 1) {
  const w = 150, h = 92;
  return G(T(x, y, s), o, `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="16" fill="#fff"/>` +
    doodle(rectPts(-w / 2, -h / 2, w, h), t, seed, 5, PEN, true) +
    drop(-44, 4, 18, t, seed + 10, plus ? C.blood : C.bloodL) +
    hand(abo, abo.length > 1 ? 14 : 4, 4, 58, PEN) + sign(abo.length > 1 ? 56 : 40, 0, plus, 10, t, seed + 20, plus ? C.bloodD : C.cool));
}

// small person icon for the 100-people grid
const personPath = 'M-15,18 Q-15,0 0,0 Q15,0 15,18 Z';
function person(x, y, fill) {
  return `<g transform="translate(${x} ${y})"><circle cy="-12" r="9" fill="${fill}" ${stroke(2.5, PEN)}/><path d="${personPath}" fill="${fill}" ${stroke(2.5, PEN)}/></g>`;
}

let K = {};
const ICON = {
  drop: () => `<path d="${poly(dropPts(0, 2, 18))}" fill="${C.blood}" ${stroke(4)}/>`,
  tag: () => `<circle r="16" fill="${C.blood}" ${stroke(4)}/><path d="M-4,-30 L4,-30 L0,-22 Z" fill="${C.antA}" ${stroke(3)}/><circle cx="24" cy="0" r="6" fill="${C.antB}" ${stroke(3)}/>`,
  pm: () => `<path d="M-22,-6 L-6,-6 M-14,-14 L-14,2 M6,8 L22,8" fill="none" ${stroke(5, PEN)}/>`,
  ab: () => `<path d="M0,22 L0,0 M-14,-18 L0,0 L14,-18" fill="none" ${stroke(6, C.cool)}/>`,
  people: () => `<circle cx="-10" cy="-8" r="7" fill="${C.bloodL}" ${stroke(3)}/><path d="M-22,14 Q-22,2 -10,2 Q2,2 2,14 Z" fill="${C.bloodL}" ${stroke(3)}/>` +
    `<circle cx="12" cy="-8" r="7" fill="${C.cool}" ${stroke(3)}/><path d="M0,14 Q0,2 12,2 Q24,2 24,14 Z" fill="${C.cool}" ${stroke(3)}/>`,
};

const Z1 = { x: 0, y: -40 }, CELLS = { A: [1390, -150], B: [1810, -150], AB: [1390, 270], O: [1810, 270] };
const TUBES = [['A', -270], ['B', -90], ['AB', 90], ['O', 270]];

function setup(D) {
  const s = D.scenes;
  K = {
    apa: s[0].at('apa'), tA: s[0].at('a'), tB: s[0].at('b'), tAB: s[0].at('ab'), tO: s[0].at('o'),
    s2: s[1].start, merah: s[1].at('merah'), bedanya: s[1].at('bedanya'),
    s3: s[2].start, antigen: s[2].at('antigen'), penanda: s[2].at('penanda'), s3e: s[2].end,
    s4: s[3].start, cA: s[3].at('a'), cB: s[3].at('b'),
    s5: s[4].start, cAB: s[4].at('ab'), cO: s[4].at('o'), tidak: s[4].at('tidak'),
    s6: s[5].start, rhesus: s[5].at('rhesus'), positif: s[5].at('positif'), negatif: s[5].at('negatif'), delapan: s[5].at('delapan'),
    s7: s[6].start, bahaya: s[6].at('bahaya'), antibodi: s[6].at('antibodi'), menyerang: s[6].at('menyerang'), asing: s[6].at('asing'),
    s8: s[7].start, oneg: s[7].at('o'), diberikan: s[7].at('diberikan'), semua: s[7].at('semua'), darurat: s[7].at('darurat'),
    s9: s[8].start, kurang: s[8].at('kurang'), satu: s[8].at('satu'), langka: s[8].at('langka'),
    s10: s[9].start, orang: s[9].at('orang'), kamu: s[9].at('kamu'), tulis: s[9].at('tulis'), komentar: s[9].at('komentar'),
    end: D.total,
  };
  const home = { ...Z1, z: 1 };
  setCamera([
    home,
    { at: K.merah - 0.3, dur: 1.2, x: 0, y: -90, z: 1.1 },
    { at: K.s3 - 0.1, dur: 1.1, x: 1360, y: -150, z: 2.2 },
    { at: K.s4 - 0.2, dur: 0.9, x: 1600, y: 60, z: 0.95 },
    { at: K.s6 - 0.1, dur: 1.0, x: 3200, y: 30, z: 1 },
    { at: K.s7 - 0.1, dur: 1.0, x: 1560, y: 1400, z: 1.1 },
    { at: K.s8 - 0.1, dur: 1.0, x: 3200, y: 1430, z: 1 },
    { at: K.s9 - 0.1, dur: 1.0, x: 0, y: 1460, z: 1 },
    { at: K.s10 - 0.1, dur: 1.0, x: -1600, y: 1420, z: 1 },
    { at: K.kamu - 0.25, dur: 1.1, ...home },
  ]);
  setHeadlines([
    { at: K.apa, end: K.s2 - 0.1, text: 'GOLONGAN\nDARAHMU *APA*?' },
    { at: K.merah, end: K.bedanya - 0.2, text: 'SAMA-SAMA\n*MERAH*' },
    { at: K.bedanya, end: K.s3 - 0.1, text: 'LALU\n*BEDANYA*?' },
    { at: K.antigen, end: K.s4 - 0.1, text: '*ANTIGEN*\n= PENANDA' },
    { at: K.cA, end: K.cAB - 0.2, text: 'PENANDA\n*A* DAN *B*' },
    { at: K.cAB, end: K.s6 - 0.1, text: 'AB DUA,\nO *KOSONG*' },
    { at: K.rhesus, end: K.delapan - 0.2, text: '*RHESUS*\nPOSITIF / NEGATIF' },
    { at: K.delapan, end: K.s7 - 0.1, text: 'TOTAL\n*8 GOLONGAN*' },
    { at: K.bahaya, end: K.s8 - 0.1, text: 'SALAH DARAH\n= *BAHAYA*' },
    { at: K.oneg, end: K.s9 - 0.1, text: '*O NEGATIF*\nSAAT DARURAT' },
    { at: K.kurang, end: K.s10 - 0.1, text: 'RHESUS NEGATIF\n*< 1%*' },
    { at: K.orang, end: K.kamu - 0.2, text: 'TURUNAN\n*ORANG TUA*' },
    { at: K.kamu, end: K.end - 0.5, text: 'GOLONGANMU\n*APA*?' },
  ]);
  setChapters([
    { at: -1, icon: ICON.drop },
    { at: K.antigen, icon: ICON.tag },
    { at: K.rhesus, icon: ICON.pm },
    { at: K.antibodi, icon: ICON.ab },
    { at: K.kurang, icon: ICON.people },
    { at: K.end - 0.5, icon: ICON.drop },  // same badge as the first frame, for the loop
  ], { at: K.orang, end: K.end - 0.5 });
}

function cues(D) {
  return [
    [K.tA, 'tick'], [K.tB, 'tick'], [K.tAB, 'tick'], [K.tO, 'tick'],
    [K.merah, 'sparkle'], [K.bedanya, 'pop'],
    [K.s3 - 0.1, 'whoosh'], [K.antigen, 'pop'], [K.antigen + 0.15, 'sparkle'],
    [K.s4 - 0.2, 'whoosh'], [K.cA, 'pop'], [K.cB, 'pop'], [K.cAB, 'pop'], [K.cO, 'pop'],
    [K.s6 - 0.1, 'whoosh'], [K.positif, 'sparkle'], [K.negatif, 'tick'], [K.delapan, 'ding'],
    [K.s7 - 0.1, 'whoosh'], [K.bahaya, 'thud'], [K.menyerang, 'zap'], [K.asing, 'click'],
    [K.s8 - 0.1, 'whoosh'], [K.diberikan, 'pop'], [K.semua, 'ding'],
    [K.s9 - 0.1, 'whoosh'], [K.satu, 'pop'], [K.langka, 'thud'],
    [K.s10 - 0.1, 'whoosh'], [K.orang, 'sparkle'], [K.kamu - 0.25, 'whoosh'], [K.komentar, 'pop'],
  ];
}

// ---------- zones ----------

// Z1: four tubes, Stickman puzzling over them (also the closing view)
function zoneTubes(t) {
  let s = '';
  const lab = [K.tA, K.tB, K.tAB, K.tO];
  TUBES.forEach(([l, x], i) => {
    const b = t > lab[i] ? 1 + 0.25 * Math.exp(-7 * (t - lab[i])) * Math.cos(14 * (t - lab[i])) : 1;
    s += tube(x, -100, l, t, 10 + i * 100, b);
  });
  // "all red" highlighter swipe
  if (t > K.merah - 0.1 && t < K.s3 + 0.5) {
    const p = P(t, K.merah - 0.1, 0.5), o = 1 - P(t, K.s3, 0.4);
    s += G('', o, `<rect x="-320" y="40" width="${f(640 * p)}" height="34" rx="10" fill="${C.yellow}" opacity="0.85" transform="rotate(-1.5 0 57)"/>` +
      hand('semua merah!', 0, 58, 54, C.bloodD));
  }
  // Stickman
  let pose = 'think', face = 'confused';
  if (t > K.s2 && t < K.bedanya) face = 'skeptical';
  if (t > K.kamu) { pose = 'point'; face = 'smile'; }
  if (t > K.tulis) { pose = 'happy'; face = 'laugh'; }
  if (t > K.end - 0.45) { pose = 'think'; face = 'confused'; }
  s += stickman(0, 320, 0.85, pose, t, 0, null, face);
  // question marks next to his head
  const q = t < K.s3 || t > K.end - 0.45;
  if (q) for (let k = 0; k < 3; k++) {
    const ph = (t * 0.6 + k / 3) % 1;
    s += G(T(110 + k * 40, 150 - 60 * ph, 1, -10 + k * 12), Math.sin(Math.PI * ph), hand('?', 0, 0, 56 + k * 8, k === 1 ? C.accent : PEN));
  }
  if (t > K.tulis - 0.1) {
    const o = P(t, K.tulis - 0.1, 0.3) * (1 - P(t, K.end - 0.7, 0.3));
    s += G('', o, `<rect x="-215" y="52" width="430" height="44" rx="12" fill="${C.yellow}" opacity="0.85"/>` + hand('tulis di komentar!', 0, 72, 58, PEN));
  }
  return s;
}

// Z2: blood cells with their markers
function zoneCells(t) {
  if (t < K.s3 - 0.3 || t > K.s6 + 1.2) return '';
  let s = '';
  const g = P(t, K.antigen, 0.8, E.lin);
  const [ax, ay] = CELLS.A;
  s += cell(ax, ay, 130, 'A', false, t, 300, g, t > K.cA ? 'A' : null);
  if (t > K.antigen + 0.3 && t < K.s4 + 0.2) {
    const o = P(t, K.antigen + 0.3, 0.3) * (1 - P(t, K.s4 - 0.2, 0.3));
    s += G('', o, arrow(ax + 150, ay + 178, ax + 104, ay + 142, t, 320, C.accent, 4) +
      hand('antigen = penanda', ax + 10, ay + 188, 30, C.accent));
  }
  const pops = { B: K.cB, AB: K.cAB, O: K.cO };
  Object.entries(pops).forEach(([k, at], i) => {
    if (t < at) return;
    const p = pop(t, at, 0.45), [x, y] = CELLS[k];
    s += G(`translate(${x} ${y}) scale(${f(p.s)}) translate(${-x} ${-y})`, p.o, cell(x, y, 130, k, false, t, 340 + i * 40, P(t, at + 0.1, 0.6), k));
  });
  if (t > K.tidak) {
    const [x, y] = CELLS.O, o = P(t, K.tidak, 0.3);
    s += G('', o, hand('tanpa penanda', x, y + 170, 34, C.muted));
  }
  return s;
}

// Z3: rhesus, then all eight blood types
function zoneRhesus(t) {
  if (t < K.s6 - 0.5 || t > K.s7 + 1.2) return '';
  let s = '';
  s += cell(3000, -200, 105, 'O', P(t, K.positif, 0.7, E.lin), t, 400, 1);
  s += hand('Rh', 2988, -196, 66, '#fff', 'middle', `stroke="${PEN}" stroke-width="5" paint-order="stroke"`) + sign(3040, -200, true, 14, t, 410, '#fff');
  const n = pop(t, K.negatif - 0.1, 0.45);
  s += G(`translate(3400 -200) scale(${f(n.s)}) translate(-3400 200)`, n.o,
    cell(3400, -200, 105, 'O', false, t, 420, 1) + hand('Rh', 3388, -196, 66, '#fff', 'middle', `stroke="${PEN}" stroke-width="5" paint-order="stroke"`) + sign(3440, -200, false, 14, t, 430, '#fff'));
  if (t > K.positif) s += G('', P(t, K.positif, 0.3), hand('punya protein Rh', 3000, -50, 34, C.rh));
  if (t > K.negatif) s += G('', P(t, K.negatif, 0.3), hand('tidak punya', 3400, -50, 34, C.muted));
  const types = ['A', 'B', 'AB', 'O'];
  types.forEach((abo, i) => [true, false].forEach((plus, r) => {
    const k = i * 2 + r, p = pop(t, K.delapan - 0.1 + k * 0.07, 0.4);
    s += typeCard(3200 + (i - 1.5) * 205, 150 + r * 130, abo, plus, t, 450 + k * 30, 1.18 * p.s, p.o);
  }));
  return s;
}

// Z4: antibodies grabbing a foreign cell, cells clumping
function zoneAntibody(t) {
  if (t < K.s7 - 0.6 || t > K.s8 + 1.2) return '';
  let s = '';
  const cx = 1700, cy = 1330, r = 95;
  const clump = P(t, K.asing - 0.1, 0.6, E.outBack);
  const shake = t > K.menyerang ? 3 * Math.sin(t * 47) : 0;
  const others = [[1500, 1470, 1], [1890, 1480, -1]];
  others.forEach(([x, y, side], i) => {
    if (t < K.asing - 0.2) return;
    const ox = lerp(x + side * 260, x, clump);
    s += G('', clamp(clump * 2), cell(ox + shake, y, 85, 'A', false, t, 520 + i * 30, 1));
  });
  s += cell(cx + shake, cy, r, 'A', false, t, 500, 1);
  // antibodies fly in and lock onto the markers
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + 0.3, dx = Math.cos(a), dy = Math.sin(a);
    const at = K.antibodi + k * 0.08, q = P(t, at, 0.55, E.outCubic);
    if (q <= 0) continue;
    const d = lerp(r + 300, r + 58, q), rot = Math.atan2(-dx, dy) * 180 / Math.PI;
    s += antibody(cx + shake + d * dx, cy + d * dy, 1, rot, t, 560 + k * 10);
  }
  // antibodies bridging the clump
  if (t > K.asing) {
    const o = P(t, K.asing + 0.2, 0.3);
    s += G('', o, antibody(1600, 1415, 1, 50, t, 640) + antibody(1795, 1420, 1, -50, t, 650));
  }
  if (t > K.antibodi) s += G('', P(t, K.antibodi, 0.3), hand('antibodi', 1500, 1160, 44, C.cool) + arrow(1540, 1190, 1610, 1250, t, 660, C.cool, 5));
  const sh = t > K.bahaya ? 'shock' : 'calm';
  s += stickman(1290, 1460, 0.55, sh, t, 0, null, t > K.bahaya ? 'shock' : 'wow');
  return s;
}

// Z5: O negative goes to everyone
function zoneDonor(t) {
  if (t < K.s8 - 0.6 || t > K.s9 + 1.2) return '';
  let s = bloodBag(3200, 1240, t, 700);
  const xs = [-300, -100, 100, 300], labs = ['A', 'B', 'AB', 'O'];
  xs.forEach((dx, i) => {
    const x = 3200 + dx, q = P(t, K.diberikan + i * 0.12, 0.45);
    if (q > 0) s += arrow(3200, 1400, lerp(3200, x, q), lerp(1400, 1560, q), t, 720 + i * 20, C.leaf, 6);
    s += drop(x, 1630, 40, t, 760 + i * 20, C.bloodL) + hand(labs[i], x, 1715, 50, PEN);
    if (t > K.semua + i * 0.1) {
      const p = pop(t, K.semua + i * 0.1, 0.4);
      s += G(`translate(${x + 42} ${1590}) scale(${f(p.s)})`, p.o, `<circle r="22" fill="${C.leaf}"/>` + doodle([[-10, 0], [-2, 9], [11, -8]], t, 800 + i, 5, '#fff'));
    }
  });
  if (t > K.darurat) s += G('', P(t, K.darurat, 0.3), hand('darurat!', 3330, 1110, 48, C.accent));
  s += stickman(2930, 1300, 0.5, t > K.semua ? 'cheer' : 'point', t, 0, null, t > K.semua ? 'laugh' : 'smile');
  return s;
}

// Z6: 100 people, rhesus negative is less than one of them
function zonePeople(t) {
  if (t < K.s9 - 0.6 || t > K.s10 + 1.2) return '';
  let s = hand('100 orang Indonesia', 0, 1140, 52, PEN);
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
    if (r === 9 && c === 9) continue;
    const k = r * 10 + c, o = P(t, K.s9 - 0.3 + k * 0.006, 0.25);
    if (o > 0) s += G('', o, person(-270 + c * 60, 1215 + r * 60, C.bloodL));
  }
  // the last person is only partly rhesus negative: "kurang dari satu"
  const x = 270, y = 1755, hi = P(t, K.satu, 0.4);
  s += person(x, y, C.bloodL);
  if (hi > 0) {
    s += `<clipPath id="neg"><rect x="${f(x + 20 - 14 * hi)}" y="${y - 30}" width="14" height="60"/></clipPath><g clip-path="url(#neg)">${person(x, y, C.cool)}</g>`;
    s += G('', hi, doodle(ring(x, y - 2, 42, 24), t, 900, 5, C.cool, true) +
      hand('Rh negatif:', 120, 1830, 44, C.cool) + hand('kurang dari 1', 120, 1874, 44, C.cool));
  }
  return s;
}

// Z7: blood group comes from both parents
function zoneFamily(t) {
  if (t < K.s10 - 0.6 || t > K.kamu + 1.4) return '';
  let s = '';
  [[-1820, 'Ayah', 0], [-1380, 'Ibu', 1]].forEach(([x, l, i]) => {
    s += drop(x, 1230, 62, t, 1000 + i * 30) + hand(l, x, 1340, 50, PEN);
    const q = P(t, K.orang - 0.2 + i * 0.15, 0.5);
    if (q > 0) s += arrow(x, 1380, lerp(x, -1600 + (i ? 60 : -60), q), lerp(1380, 1470, q), t, 1040 + i * 20, C.accent, 6);
  });
  if (t > K.orang) s += G('', P(t, K.orang, 0.3), hand('gen', -1600, 1400, 40, C.accent));
  s += stickman(-1600, 1640, 0.55, 'happy', t, 0, null, 'smile');
  s += hand('kamu', -1600, 1820, 50, PEN);
  return s;
}

function drawWorld(t) {
  return zoneTubes(t) + zoneCells(t) + zoneRhesus(t) + zoneAntibody(t) + zoneDonor(t) + zonePeople(t) + zoneFamily(t) + zoneScout(t);
}

// Stickman peeking at the giant cell during the antigen close-up
function zoneScout(t) {
  if (t < K.s3 - 0.3 || t > K.s4 + 0.6) return '';
  const o = P(t, K.s3, 0.4) * (1 - P(t, K.s4 - 0.1, 0.4));
  return G('', o, stickman(1222, -20, 0.32, 'point', t, 0, null, t > K.antigen ? 'wow' : 'think'));
}

function drawOverlay(t) {
  let s = '';
  if (t > K.bahaya - 0.2 && t < K.s8) s += G('', 1 - P(t, K.s8 - 0.3, 0.3), stamp('BAHAYA!', t, K.bahaya, 560, 1230, C.accent, -7, 110));
  if (t > K.langka - 0.2 && t < K.s10) s += G('', 1 - P(t, K.s10 - 0.3, 0.3), stamp('LANGKA!', t, K.langka, 720, 820, C.cool, 8, 100));
  s += cite('sumber: NHS & MedlinePlus (NIH) – golongan darah', t, K.s4, K.s6 - 0.1);
  s += cite('sumber: NHS & MedlinePlus (NIH) – transfusi darah', t, K.antibodi, K.s9 - 0.1);
  s += cite('sumber: BPS 2010, dikutip Reswari dkk. 2022', t, K.satu, K.s10 - 0.1);
  return s;
}

// ---------- thumbnail ----------
function drawThumbnail() {
  const t = 1.0;
  let world = `<g transform="translate(540 1000) scale(1.05) translate(0 0)">`;
  TUBES.forEach(([l, x], i) => world += tube(x, -40, l, t, 10 + i * 100));
  world += stickman(-300, 420, 0.8, 'think', t, 0, null, 'confused');
  world += cell(200, 380, 120, 'AB', true, t, 300, 1);
  world += '</g>';
  let ui = titleText('GOLONGAN\nDARAHMU *APA*?', 540, 360, 110, 900);
  ui += stamp('8 JENIS!', 2.0, 0.1, 800, 600, C.accent, -8, 80);
  return { world, ui };
}
