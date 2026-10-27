// Topic: Kenapa nyamuk jantan tidak minum darah? (Channel: Stickman, Theme: notebook / doodle)
Object.assign(C, {
  blood: '#E0484F', bloodD: '#B8323A', bloodL: '#FAD2D2',
  nectar: '#F5B83D', nectarL: '#FFF0B8', petal: '#FF9EBB',
  skin: '#FCE0C8', skinD: '#E8BC96',
  mosq: '#454854', mosqL: '#7A7F92', wing: '#DCE8F5',
  water: '#7CC2F5', tile: '#E6F2FA',
});
const PEN = '#26262E';

function doodle(pts, t, seed, w = 7, col = PEN, closed = false) {
  const boil = Math.floor(t * 8), j = i => (rnd(boil * 131 + seed + i) - 0.5) * 4.5;
  const d = o => 'M' + pts.map(([x, y], i) => `${f(x + j(i * 2 + o))},${f(y + j(i * 2 + 1 + o))}`).join(' L') + (closed ? 'Z' : '');
  return `<path d="${d(0)}" fill="none" ${stroke(w, col)}/><path d="${d(500)}" fill="none" ${stroke(w * 0.3, col)} opacity="0.45"/>`;
}
const ring = (cx, cy, r, n = 28) => [...Array(n)].map((_, k) => [cx + r * Math.cos(k / n * Math.PI * 2), cy + r * Math.sin(k / n * Math.PI * 2)]);
const ellipsePts = (cx, cy, rx, ry, n = 26) => [...Array(n)].map((_, k) => [cx + rx * Math.cos(k / n * Math.PI * 2), cy + ry * Math.sin(k / n * Math.PI * 2)]);
const poly = pts => 'M' + pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' L') + 'Z';
const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const dropPts = (x, y, r) => [...Array(28)].map((_, k) => {
  const a = k / 28 * Math.PI * 2;
  return [x + 1.18 * r * Math.sin(a) * Math.sin(a / 2), y - 1.15 * r * Math.cos(a)];
});

function arrow(x1, y1, x2, y2, t, seed, col = PEN, w = 6) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 22;
  return doodle([[x1, y1], [(x1 + x2) / 2 + 10 * Math.sin(a), (y1 + y2) / 2 - 10 * Math.cos(a)], [x2, y2]], t, seed, w, col) +
    doodle([[x2 - h * Math.cos(a - 0.5), y2 - h * Math.sin(a - 0.5)], [x2, y2], [x2 - h * Math.cos(a + 0.5), y2 - h * Math.sin(a + 0.5)]], t, seed + 9, w, col);
}

function drop(x, y, r, t, seed, fill = C.blood) {
  return `<path d="${poly(dropPts(x, y, r))}" fill="${fill}"/>` + doodle(dropPts(x, y, r), t, seed, 5, PEN, true) +
    `<ellipse cx="${f(x - r * 0.32)}" cy="${f(y + r * 0.1)}" rx="${f(r * 0.14)}" ry="${f(r * 0.25)}" fill="#fff" opacity="0.45"/>`;
}

// ---------- custom props ----------

// Doodle mosquito facing left (-1) or right (1).
// isMale: feathery bushy antennae + blunt/soft proboscis, green-tinted harmless abdomen.
// !isMale: thin antennae + sharp needle proboscis, blood-red engorged abdomen.
function mosquito(x, y, s, isMale, t, seed, dir = 1) {
  const hover = Math.sin(t * 7 + seed) * 6;
  const wingAng = Math.sin(t * 55 + seed) * 18;
  const abdCol = isMale ? '#8BD36E' : C.blood;
  let g = '';

  // legs (3 pairs)
  g += doodle([[-15, 18], [-45, 52], [-62, 85]], t, seed + 1, 4.5);
  g += doodle([[0, 20], [-5, 58], [-15, 92]], t, seed + 5, 4.5);
  g += doodle([[18, 16], [48, 52], [68, 86]], t, seed + 9, 4.5);

  // abdomen (tilted oval behind thorax)
  g += `<g transform="translate(-58 18) rotate(22)"><ellipse rx="46" ry="20" fill="${abdCol}"/>` +
    `<path d="M-25,-17 L-25,17 M-5,-19 L-5,19 M15,-18 L15,18" ${stroke(3.5, PEN)} opacity="0.55"/></g>`;
  g += doodle(ellipsePts(-58, 18, 46, 20, 22).map(([px, py]) => {
    const c = Math.cos(0.38), sn = Math.sin(0.38), dx = px + 58, dy = py - 18;
    return [-58 + dx * c - dy * sn, 18 + dx * sn + dy * c];
  }), t, seed + 15, 5, PEN, true);

  // thorax
  g += `<ellipse cx="0" cy="4" rx="28" ry="22" fill="${C.mosqL}"/>`;
  g += doodle(ellipsePts(0, 4, 28, 22, 20), t, seed + 25, 5.5, PEN, true);

  // fluttering wing
  g += `<g transform="translate(-8 -12) rotate(${f(-28 + wingAng)})">` +
    `<ellipse cx="-32" cy="-18" rx="44" ry="15" fill="${C.wing}" opacity="0.88" ${stroke(4, PEN)}/>` +
    `<path d="M-6,-12 L-64,-22 M-12,-10 L-52,-12" ${stroke(2.5, C.mosqL)}/></g>`;

  // head
  g += `<circle cx="34" cy="2" r="18" fill="${C.mosq}"/>`;
  g += doodle(ring(34, 2, 18, 18), t, seed + 35, 5, PEN, true);
  g += `<circle cx="40" cy="-2" r="6.5" fill="#fff"/><circle cx="42" cy="-2" r="3.5" fill="${PEN}"/>`;

  // antennae: male has bushy feathery plumes, female has thin plain threads
  if (isMale) {
    g += doodle([[38, -14], [52, -46], [70, -68]], t, seed + 45, 4.5, PEN);
    g += doodle([[32, -15], [38, -48], [50, -72]], t, seed + 49, 4.5, PEN);
    for (let k = 1; k <= 5; k++) {
      const u = k / 6, ax = lerp(38, 70, u), ay = lerp(-14, -68, u);
      const bx = lerp(32, 50, u), by = lerp(-15, -72, u);
      g += `<line x1="${f(ax - 12)}" y1="${f(ay - 4)}" x2="${f(ax + 12)}" y2="${f(ay + 6)}" ${stroke(3, PEN)}/>`;
      g += `<line x1="${f(bx - 11)}" y1="${f(by - 3)}" x2="${f(bx + 11)}" y2="${f(by + 5)}" ${stroke(3, PEN)}/>`;
    }
  } else {
    g += doodle([[38, -14], [48, -44], [58, -64]], t, seed + 45, 3.5, PEN);
    g += doodle([[32, -15], [36, -44], [42, -64]], t, seed + 49, 3.5, PEN);
  }

  // proboscis (mouth needle)
  if (isMale) {
    // slightly curved/blunt tip for sipping nectar
    g += doodle([[50, 8], [76, 22], [94, 42]], t, seed + 60, 4.5, PEN);
    g += `<circle cx="95" cy="43" r="4.5" fill="${C.nectar}" ${stroke(2.5, PEN)}/>`;
  } else {
    // sharp straight red-tipped piercing needle
    g += doodle([[50, 8], [80, 26], [108, 44]], t, seed + 60, 5, C.bloodD);
  }

  return G(`translate(${f(x)} ${f(y + hover)}) scale(${f(s * dir)} ${f(s)})`, 1, g);
}

// Comparison card for Z1
function mosqCard(x, y, isMale, t, seed, crossP = 0) {
  const w = 390, h = 420;
  const hdrCol = isMale ? C.leaf : C.blood;
  const title = isMale ? 'JANTAN' : 'BETINA';
  let s = `<rect x="${x - w / 2 + 8}" y="${y - h / 2 + 10}" width="${w}" height="${h}" rx="24" fill="${PEN}" opacity="0.12"/>`;
  s += `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="24" fill="#FFFDF7"/>`;
  s += `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="74" rx="24" fill="${hdrCol}"/>`;
  s += `<rect x="${x - w / 2}" y="${y - h / 2 + 44}" width="${w}" height="30" fill="${hdrCol}"/>`;
  s += doodle(rectPts(x - w / 2, y - h / 2, w, h), t, seed, 6, PEN, true);
  s += txt(title, x, y - h / 2 + 38, 38, '#fff', 900);

  // Mosquito inside card
  s += mosquito(x - 25, y - 35, 1.15, isMale, t, seed + 10, 1);

  // Bottom badge: blood drop
  const dy = y + 125;
  s += drop(x - 85, dy, 28, t, seed + 80, isMale ? C.bloodL : C.blood);
  if (!isMale) {
    s += hand('isap darah!', x + 35, dy + 4, 46, C.bloodD);
  } else {
    if (crossP <= 0.01) {
      s += hand('minum darah?', x + 35, dy + 4, 44, PEN);
    } else {
      const q = E.outBack(clamp(crossP, 0, 1));
      s += G(T(x - 85, dy, q), 1,
        doodle([[-32, -32], [32, 32]], t, seed + 90, 9, C.accent) +
        doodle([[32, -32], [-32, 32]], t, seed + 95, 9, C.accent));
      s += G('', clamp(crossP * 1.5),
        `<rect x="${x - 30}" y="${dy - 26}" width="205" height="52" rx="12" fill="${C.yellow}"/>` +
        hand('TIDAK GIGIT!', x + 72, dy + 2, 42, PEN));
    }
  }
  return s;
}

// Blooming flower with golden nectar in Z2
function nectarFlower(x, y, t, seed) {
  let s = '';
  // stem & leaves
  s += doodle([[x, y + 40], [x - 12, y + 160], [x, y + 270]], t, seed, 10, C.leaf);
  s += `<path d="M${x - 8},${y + 160} Q${x - 95},${y + 120} ${x - 110},${y + 170} Q${x - 60},${y + 210} ${x - 8},${y + 175} Z" fill="#8BD36E" ${stroke(5, PEN)}/>`;
  s += `<path d="M${x + 2},${y + 190} Q${x + 90},${y + 150} ${x + 105},${y + 200} Q${x + 55},${y + 235} ${x + 2},${y + 205} Z" fill="#8BD36E" ${stroke(5, PEN)}/>`;

  // petals
  for (let k = 0; k < 6; k++) {
    const a = k / 6 * Math.PI * 2 + Math.sin(t * 2) * 0.04;
    const px = x + 68 * Math.cos(a), py = y + 68 * Math.sin(a);
    s += `<circle cx="${f(px)}" cy="${f(py)}" r="44" fill="${C.petal}" ${stroke(5, PEN)}/>`;
  }
  // flower center full of nectar
  s += `<circle cx="${x}" cy="${y}" r="42" fill="${C.nectar}"/>`;
  s += doodle(ring(x, y, 42, 22), t, seed + 20, 6, PEN, true);
  s += hand('nektar', x, y + 4, 34, PEN);
  return s;
}

// Sliced sweet orange fruit in Z2
function sweetFruit(x, y, t, seed) {
  let s = `<path d="M${x - 110},${y} A110,110 0 0 0 ${x + 110},${y} Z" fill="#FF9F43" ${stroke(6, PEN)}/>`;
  s += `<path d="M${x - 92},${y} A92,92 0 0 0 ${x + 92},${y} Z" fill="#FFEAA7" ${stroke(4, PEN)}/>`;
  for (let k = 0; k < 4; k++) {
    const a1 = (k * 0.24 + 0.06) * Math.PI, a2 = ((k + 1) * 0.24 - 0.04) * Math.PI;
    const r = 78;
    s += `<path d="M${x},${y + 4} L${f(x + r * Math.cos(a1))},${f(y + r * Math.sin(a1))} A${r},${r} 0 0 1 ${f(x + r * Math.cos(a2))},${f(y + r * Math.sin(a2))} Z" fill="#FFBE76" ${stroke(3, PEN)}/>`;
  }
  s += hand('sari buah', x, y + 145, 46, PEN);
  return s;
}

let K = {};
const ICON = {
  mosq: () => `<circle cx="8" cy="-6" r="8" fill="${C.mosq}" ${stroke(3.5)}/><ellipse cx="-10" cy="4" rx="14" ry="7" fill="${C.blood}" ${stroke(3.5)}/><line x1="15" y1="-2" x2="26" y2="10" ${stroke(4, C.bloodD)}/>`,
  flower: () => `<circle cx="0" cy="-14" r="9" fill="${C.petal}" ${stroke(3)}/><circle cx="13" cy="-4" r="9" fill="${C.petal}" ${stroke(3)}/><circle cx="8" cy="11" r="9" fill="${C.petal}" ${stroke(3)}/><circle cx="-8" cy="11" r="9" fill="${C.petal}" ${stroke(3)}/><circle cx="-13" cy="-4" r="9" fill="${C.petal}" ${stroke(3)}/><circle r="9" fill="${C.nectar}" ${stroke(3.5)}/>`,
  needle: () => `<path d="M-16,-18 L16,18 M-6,-22 L20,8 M-20,-8 L8,20" ${stroke(4, C.bloodD)}/>`,
  eggs: () => `<ellipse cx="-12" cy="0" rx="6" ry="14" fill="${C.nectarL}" ${stroke(3.5)}/><ellipse cx="0" cy="-4" rx="6" ry="14" fill="${C.nectarL}" ${stroke(3.5)}/><ellipse cx="12" cy="2" rx="6" ry="14" fill="${C.nectarL}" ${stroke(3.5)}/>`,
  antenna: () => `<path d="M-14,16 L-4,-18 M-14,4 L-2,0 M-11,-5 L1,-9 M8,16 L14,-18" ${stroke(4, PEN)}/>`,
};

const Z1 = { x: 0, y: 20 };

function setup(D) {
  const s = D.scenes;
  K = {
    gigit1: s[0].at('menggigitmu'), betina1: s[0].at('betina'),
    s2: s[1].start, jantan2: s[1].at('jantan'), darah2: s[1].at('darah'), bisa2: s[1].at('bisa'),
    s3: s[2].start, kira: s[2].at('kira'), fakta: s[2].at('faktanya'), tidak3: s[2].at('tidak'), gigit3: s[2].at('menggigit'),
    s4: s[3].start, nektar4: s[3].at('nektar'), bunga4: s[3].at('bunga'), buah4: s[3].at('buah'), terbang4: s[3].at('terbang'),
    s5: s[4].start, proboscis: s[4].at('proboscis'), lemas: s[4].at('lemas'), menembus: s[4].at('menembus'), kulit: s[4].at('kulit'),
    s6: s[5].start, betina6: s[5].at('betina'), enam: s[5].at('enam'), jarum: s[5].at('jarum'), protein6: s[5].at('protein'),
    s7: s[6].start, protein7: s[6].at('protein'), seratus: s[6].at('100'), duaratus: s[6].at('200'), telur7: s[6].at('telurnya'),
    s8: s[7].start, antena: s[7].at('antena'), berbulu: s[7].at('berbulu'), tipis: s[7].at('tipis'), dbd: s[7].at('dbd'),
    s9: s[8].start, nektar9: s[8].at('nektar'), darah9: s[8].at('darah'), bertelur9: s[8].at('bertelur'),
    s10: s[9].start, kuras: s[9].at('kuras'), mandi: s[9].at('mandi'), demam: s[9].at('demam'), dokter: s[9].at('dokter'),
    end: D.total,
  };

  const home = { ...Z1, z: 1.0 };
  setCamera([
    home,
    { at: K.s2 - 0.1, dur: 1.0, x: 0, y: 0, z: 1.06 },
    { at: K.fakta - 0.15, dur: 0.7, x: 0, y: 20, z: 1.0 },
    { at: K.s4 - 0.15, dur: 1.0, x: 1600, y: 20, z: 1.0 },
    { at: K.s5 - 0.15, dur: 1.0, x: 3200, y: 40, z: 1.02 },
    { at: K.s6 - 0.15, dur: 0.9, x: 3260, y: 60, z: 1.06 },
    { at: K.s7 - 0.15, dur: 1.0, x: 1600, y: 1400, z: 1.0 },
    { at: K.s8 - 0.15, dur: 1.0, x: 3200, y: 1400, z: 1.0 },
    { at: K.s9 - 0.15, dur: 1.0, x: 0, y: 1400, z: 1.0 },
    { at: K.end - 1.25, dur: 1.05, ...home },
  ]);

  setHeadlines([
    { at: 0, end: K.s2 - 0.1, text: 'YANG MENGGIGIT\nPASTI *BETINA*' },
    { at: K.jantan2, end: K.s3 - 0.1, text: 'JANTAN *NGGAK*\nMINUM DARAH?' },
    { at: K.fakta, end: K.s4 - 0.1, text: 'JANTAN *TIDAK*\nMENGGIGIT!' },
    { at: K.nektar4, end: K.s5 - 0.1, text: 'JANTAN MAKAN\n*NEKTAR BUNGA*' },
    { at: K.proboscis, end: K.s6 - 0.1, text: '*PROBOSCIS*\nJANTAN LEMAS' },
    { at: K.enam, end: K.s7 - 0.1, text: 'BETINA PUNYA\n*6 JARUM* TAJAM' },
    { at: K.protein7, end: K.seratus - 0.15, text: 'BUTUH *PROTEIN*\nDARAH' },
    { at: K.seratus, end: K.s8 - 0.1, text: 'DEMI *100–200*\nBUTIR TELUR' },
    { at: K.antena, end: K.dbd - 0.15, text: 'ANTENA *BERBULU*\nVS TIPIS' },
    { at: K.dbd, end: K.s9 - 0.1, text: 'BETINA TULARKAN\n*DBD*!' },
    { at: K.nektar9, end: K.s10 - 0.1, text: 'JANTAN *NEKTAR*,\nBETINA *DARAH*' },
    { at: K.kuras, end: K.demam - 0.15, text: 'KURAS\n*BAK MANDI*!' },
    { at: K.demam, end: K.end - 1.0, text: 'DEMAM TINGGI?\nKE *DOKTER*!' },
    { at: K.end - 0.85, end: K.end + 0.2, text: 'YANG MENGGIGIT\nPASTI *BETINA*' },
  ]);

  setChapters([
    { at: -1, icon: ICON.mosq },
    { at: K.nektar4, icon: ICON.flower },
    { at: K.proboscis, icon: ICON.needle },
    { at: K.seratus, icon: ICON.eggs },
    { at: K.antena, icon: ICON.antenna },
    { at: K.end - 0.5, icon: ICON.mosq },
  ], { at: K.s9, end: K.s10 - 0.1 });
}

function cues(D) {
  return [
    [K.gigit1, 'pop'], [K.betina1, 'tick'],
    [K.jantan2, 'pop'], [K.bisa2, 'sparkle'],
    [K.fakta, 'thud'], [K.fakta, 'sparkle'], [K.fakta + 0.1, 'pop'], [K.tidak3, 'ding'],
    [K.s4 - 0.15, 'whoosh'], [K.bunga4, 'pop'], [K.buah4, 'pop'], [K.terbang4, 'sparkle'],
    [K.s5 - 0.15, 'whoosh'], [K.proboscis, 'pop'], [K.lemas, 'click'],
    [K.enam, 'pop'], [K.jarum, 'zap'], [K.jarum, 'thud'], [K.protein6, 'tick'],
    [K.s7 - 0.15, 'whoosh'], [K.protein7, 'pop'], [K.seratus, 'tick'], [K.duaratus, 'ding'], [K.duaratus, 'sparkle'],
    [K.s8 - 0.15, 'whoosh'], [K.antena, 'pop'], [K.berbulu, 'sparkle'], [K.dbd, 'thud'], [K.dbd, 'zap'],
    [K.s9 - 0.15, 'whoosh'], [K.nektar9, 'tick'], [K.bertelur9, 'ding'],
    [K.kuras, 'pop'], [K.dokter, 'sparkle'], [K.dokter + 0.3, 'whoosh'],
  ];
}

// ---------- zones ----------

// Z1 (0, 20): Opening & closing comparison (Betina vs Jantan) + Stickman
function zoneOpening(t) {
  if (t > K.s4 + 0.8 && t < K.end - 1.35) return '';
  let s = '';
  const crossP = (t > K.fakta && t < K.s4 + 0.8) ? P(t, K.fakta, 0.45) : 0;

  // Left card: BETINA (bites)
  s += mosqCard(-230, -110, false, t, 10, 0);
  // Right card: JANTAN (doesn't bite)
  s += mosqCard(230, -110, true, t, 110, crossP);

  if (t > K.fakta) {
    s += burst(t, K.fakta, 230, -110, { n: 10, r: 130, col: C.leaf, dur: 0.45, size: 9 });
    s += confetti(t, K.fakta, 230, -110, { n: 16, spread: 180, dur: 1.0 });
  }

  // Floating question marks during hook & loop ending
  const showQ = t < K.fakta || t > K.end - 0.85;
  if (showQ) {
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.65 + k / 3) % 1;
      s += G(T(140 + k * 46, 175 - 55 * ph, 1, -12 + k * 12), Math.sin(Math.PI * ph),
        hand('?', 0, 0, 58 + k * 8, k === 1 ? C.accent : PEN));
    }
  }

  // Stickman pose & expression
  let pose = 'think', face = 'confused';
  if (t > K.s2 && t < K.fakta) face = 'skeptical';
  if (t >= K.fakta && t < K.s4 + 0.5) { pose = 'verdict'; face = 'smug'; }
  s += shadow(0, 455, 75, 0.25);
  s += stickman(0, 340, 0.85, pose, t, 0, null, face);

  return s;
}

// Z2 (1600, 20): Male mosquito sipping flower nectar and fruit juice
function zoneNectar(t) {
  if (t < K.s4 - 0.8 || t > K.s5 + 0.8) return '';
  let s = '';

  // Flower on left-center
  s += nectarFlower(1420, -20, t, 200);

  // Fruit slice on right
  const fp = pop(t, K.buah4 - 0.15, 0.45);
  s += G(`translate(1830 20) scale(${f(fp.s)}) translate(-1830 -20)`, fp.o, sweetFruit(1830, 20, t, 250));

  // Male mosquito hovering over flower and sipping nectar droplets
  s += mosquito(1310, -165, 1.3, true, t, 280, 1);

  // Golden nectar droplets rising from flower to proboscis
  for (let k = 0; k < 4; k++) {
    const ph = (t * 1.4 + k * 0.25) % 1;
    const nx = lerp(1420, 1415, ph), ny = lerp(-20, -110, ph);
    s += `<circle cx="${f(nx)}" cy="${f(ny)}" r="${f(9 * Math.sin(Math.PI * ph))}" fill="${C.nectar}" ${stroke(2.5, PEN)}/>`;
  }

  // Energy sparkles around wings
  if (t > K.terbang4 - 0.2) {
    const eo = P(t, K.terbang4 - 0.2, 0.35);
    s += G('', eo,
      sparkle(1220, -230, 24, t, C.yellow) +
      sparkle(1440, -240, 20, t + 0.4, C.yellow) +
      `<rect x="1480" y="-235" width="310" height="58" rx="14" fill="${C.yellow}" ${stroke(4, PEN)}/>` +
      hand('energi terbang!', 1635, -203, 46, PEN));
    s += burst(t, K.terbang4, 1310, -165, { n: 8, r: 90, col: C.yellow, dur: 0.4, size: 8 });
  }

  // Stickman pointing happily
  s += shadow(1580, 445, 65, 0.25);
  s += stickman(1580, 340, 0.78, 'point', t, 0, null, 'smile');
  return s;
}

// Z3 (3200, 40): Male soft proboscis vs Female 6 sharp stylets piercing skin
function zoneProboscis(t) {
  if (t < K.s5 - 0.8 || t > K.s7 + 0.8) return '';
  let s = '';

  // Skin cross-section across middle (x: 2820..3660, y: 65..275)
  const sx = 2820, sw = 840, sy = 65;
  s += `<rect x="${sx}" y="${sy}" width="${sw}" height="140" rx="18" fill="${C.skin}"/>`;
  s += `<rect x="${sx}" y="${sy + 140}" width="${sw}" height="70" rx="14" fill="${C.blood}"/>`;
  s += doodle(rectPts(sx, sy, sw, 210), t, 300, 6, PEN, true);
  s += doodle([[sx, sy + 140], [sx + sw, sy + 140]], t, 310, 5, C.bloodD);
  s += hand('lapisan kulit manusia', sx + 220, sy + 42, 40, PEN);
  s += hand('pembuluh darah (protein)', sx + 240, sy + 178, 38, '#fff');

  // --- LEFT SIDE: Male proboscis (bends/buckles against skin) ---
  const mx = 3010, my = -215;
  const push = P(t, K.lemas - 0.1, 0.5, E.outCubic);
  const headY = my + push * 45;

  // Male head + feathery antennae
  s += `<circle cx="${mx}" cy="${f(headY)}" r="48" fill="${C.mosq}" ${stroke(6, PEN)}/>`;
  s += `<circle cx="${mx + 14}" cy="${f(headY - 8)}" r="15" fill="#fff"/><circle cx="${mx + 18}" cy="${f(headY - 8)}" r="8" fill="${PEN}"/>`;
  s += doodle([[mx - 10, headY - 45], [mx - 45, headY - 115]], t, 320, 5, PEN);
  for (let k = 1; k <= 4; k++) {
    const u = k / 5, ax = lerp(mx - 10, mx - 45, u), ay = lerp(headY - 45, headY - 115, u);
    s += `<line x1="${f(ax - 16)}" y1="${f(ay)}" x2="${f(ax + 16)}" y2="${f(ay - 6)}" ${stroke(3.5, PEN)}/>`;
  }
  s += `<rect x="${mx - 125}" y="${f(headY - 175)}" width="250" height="54" rx="14" fill="#8BD36E" ${stroke(5, PEN)}/>`;
  s += txt('JANTAN', mx, headY - 147, 32, PEN, 900);

  // Proboscis bending like a soft noodle when touching skin at sy = 65
  const bend = push * 75 * Math.sin(t * 14);
  const pPts = [
    [mx, headY + 46],
    [mx + bend * 0.5, lerp(headY + 110, sy - 50, 0.5)],
    [mx - bend, sy - 18],
    [mx + bend * 0.8, sy - 4],
  ];
  s += doodle(pPts, t, 330, 8, PEN);
  if (t > K.lemas) {
    s += dustPuff(t, K.lemas, mx, sy, { n: 5, size: 18, dur: 0.35 });
    s += G('', P(t, K.lemas, 0.3),
      `<rect x="${mx - 135}" y="${sy - 85}" width="270" height="52" rx="12" fill="${C.yellow}" ${stroke(4, PEN)}/>` +
      hand('lemas & melengkung!', mx, sy - 56, 38, C.accent));
  }

  // --- RIGHT SIDE: Female 6 sharp stylets (Scene 6) ---
  if (t > K.s6 - 0.2) {
    const fo = P(t, K.s6 - 0.2, 0.4);
    const fx = 3450, fy = -215;
    const pierce = P(t, K.jarum - 0.1, 0.55, E.outCubic);
    const fHeadY = fy + pierce * 55;

    let fg = `<circle cx="${fx}" cy="${f(fHeadY)}" r="48" fill="${C.mosq}" ${stroke(6, PEN)}/>`;
    fg += `<circle cx="${fx - 14}" cy="${f(fHeadY - 8)}" r="15" fill="#fff"/><circle cx="${fx - 18}" cy="${f(fHeadY - 8)}" r="8" fill="${PEN}"/>`;
    // thin antennae
    fg += doodle([[fx + 10, fHeadY - 45], [fx + 35, fHeadY - 115]], t, 340, 4, PEN);
    fg += `<rect x="${fx - 125}" y="${f(fHeadY - 175)}" width="250" height="54" rx="14" fill="${C.blood}" ${stroke(5, PEN)}/>`;
    fg += txt('BETINA', fx, fHeadY - 147, 32, '#fff', 900);

    // 6 sharp needles fanning slightly so all 6 are visible, piercing straight into the blood layer!
    const tipY = lerp(sy - 10, sy + 175, pierce);
    const spreads = [-32, -19, -6, 6, 19, 32];
    spreads.forEach((dx, i) => {
      const col = i === 2 || i === 3 ? C.bloodD : PEN;
      fg += `<line x1="${fx + dx * 0.2}" y1="${f(fHeadY + 46)}" x2="${fx + dx}" y2="${f(tipY)}" ${stroke(i === 2 ? 5.5 : 3.8, col)}/>`;
    });

    if (t > K.jarum) {
      fg += impactRing(t, K.jarum, fx, sy, { r0: 20, r1: 110, col: C.blood, dur: 0.35 });
      fg += burst(t, K.jarum, fx, sy, { n: 10, r: 90, col: C.blood, dur: 0.4, size: 8 });
    }

    // Outer labium sheath bowing back as needles pierce
    if (pierce > 0.1) {
      const bow = pierce * 55;
      fg += `<path d="M${fx - 8},${f(fHeadY + 46)} Q${fx - 8 - bow},${f((fHeadY + 46 + sy) / 2)} ${fx - 10},${sy}" fill="none" ${stroke(5, C.mosqL)}/>`;
      fg += `<path d="M${fx + 8},${f(fHeadY + 46)} Q${fx + 8 + bow},${f((fHeadY + 46 + sy) / 2)} ${fx + 10},${sy}" fill="none" ${stroke(5, C.mosqL)}/>`;
    }

    // Badge: 6 JARUM TAJAM
    if (t > K.enam) {
      const bp = pop(t, K.enam, 0.4);
      fg += G(T(fx, sy - 62, bp.s), bp.o,
        `<rect x="-140" y="-28" width="280" height="56" rx="14" fill="${C.accent}" ${stroke(4.5, PEN)}/>` +
        txt('6 JARUM TAJAM!', 0, 2, 30, '#fff', 900));
    }

    // Protein droplets rising up the center needle
    if (t > K.protein6 - 0.1) {
      for (let k = 0; k < 3; k++) {
        const ph = (t * 1.8 + k / 3) % 1;
        const py = lerp(sy + 170, fHeadY + 55, ph);
        fg += `<circle cx="${fx}" cy="${f(py)}" r="8" fill="${C.blood}" ${stroke(2.5, '#fff')}/>`;
      }
    }
    s += G('', fo, fg);
  }

  // Stickman reacting above the cite line
  const spose = t > K.enam ? 'shock' : 'think';
  s += shadow(3230, 465, 55, 0.25);
  s += stickman(3230, 395, 0.52, spose, t, 0, null, t > K.enam ? 'shock' : 'confused');
  return s;
}

// Z4 (1600, 1400): Blood protein -> 100 to 200 mosquito eggs
function zoneEggs(t) {
  if (t < K.s7 - 0.8 || t > K.s8 + 0.8) return '';
  let s = '';

  // Left: Big Blood Protein Drop
  const bx = 1310, by = 1330;
  s += drop(bx, by, 88, t, 400, C.blood);
  s += txt('PROTEIN', bx, by + 10, 30, '#fff', 900);
  s += hand('zat besi & asam amino', bx, by + 135, 42, C.bloodD);

  // Arrow from blood drop to egg cluster
  const ap = P(t, K.protein7 + 0.2, 0.5);
  if (ap > 0) {
    s += arrow(1425, 1330, lerp(1425, 1555, ap), 1330, t, 415, C.accent, 8);
  }

  // Right: Egg cluster card (40 drawn oval eggs representing 100-200 eggs)
  const ex = 1790, ey = 1330;
  s += `<rect x="${ex - 210}" y="${ey - 195}" width="420" height="360" rx="24" fill="#FFFDF7"/>`;
  s += doodle(rectPts(ex - 210, ey - 195, 420, 360), t, 430, 6, PEN, true);

  const countP = P(t, K.seratus - 0.1, 1.1, E.outCubic);
  const totalEggs = 40;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 8; c++) {
      const idx = r * 8 + c;
      const ep = clamp(countP * 1.3 - (idx / totalEggs) * 0.8, 0, 1);
      if (ep <= 0) continue;
      const ox = ex - 150 + c * 43, oy = ey - 125 + r * 46;
      s += `<ellipse cx="${ox}" cy="${oy}" rx="${f(11 * ep)}" ry="${f(18 * ep)}" fill="${C.nectarL}" ${stroke(3.5, PEN)}/>`;
    }
  }

  // Live counter: 100 - 200 telur!
  if (countP > 0) {
    const nVal = Math.round(lerp(100, 200, P(t, K.seratus, 1.0, E.outCubic)));
    s += `<rect x="${ex - 175}" y="${ey + 92}" width="350" height="56" rx="14" fill="${C.yellow}" ${stroke(4, PEN)}/>`;
    s += hand(`~${nVal} butir telur!`, ex, ey + 122, 48, PEN);
    if (t > K.duaratus) {
      s += burst(t, K.duaratus, ex, ey + 120, { n: 10, r: 120, col: C.accent, dur: 0.45, size: 8 });
    }
  }

  // Stickman amazed at bottom
  s += shadow(1470, 1780, 60, 0.25);
  s += stickman(1470, 1690, 0.68, 'point', t, 0, null, 'wow');
  return s;
}

// Z5 (3200, 1400): Bushy male antennae vs Thin female antennae + DBD warning
function zoneAntenna(t) {
  if (t < K.s8 - 0.8 || t > K.s9 + 0.8) return '';
  let s = '';

  // Left Magnifier Circle: JANTAN (antena lebat berbulu)
  const lx = 2970, rx = 3430, cy = 1320, mr = 185;
  s += `<circle cx="${lx}" cy="${cy}" r="${mr}" fill="#F3FAEE"/>`;
  s += doodle(ring(lx, cy, mr, 32), t, 500, 7, C.leaf, true);
  s += `<rect x="${lx - 130}" y="${cy - mr - 32}" width="260" height="56" rx="14" fill="${C.leaf}" ${stroke(5, PEN)}/>`;
  s += txt('JANTAN', lx, cy - mr - 3, 34, '#fff', 900);

  // Zoomed male head & big feathery antennae
  s += `<circle cx="${lx}" cy="${cy + 75}" r="52" fill="${C.mosq}" ${stroke(6, PEN)}/>`;
  s += `<circle cx="${lx - 16}" cy="${cy + 65}" r="14" fill="#fff"/><circle cx="${lx - 16}" cy="${cy + 65}" r="7" fill="${PEN}"/>`;
  s += `<circle cx="${lx + 16}" cy="${cy + 65}" r="14" fill="#fff"/><circle cx="${lx + 16}" cy="${cy + 65}" r="7" fill="${PEN}"/>`;
  // Feathery plumes
  const sway = Math.sin(t * 6) * 6;
  s += doodle([[lx - 18, cy + 26], [lx - 55, cy - 45], [lx - 85 + sway, cy - 115]], t, 510, 6, PEN);
  s += doodle([[lx + 18, cy + 26], [lx + 55, cy - 45], [lx + 85 + sway, cy - 115]], t, 515, 6, PEN);
  for (let k = 1; k <= 7; k++) {
    const u = k / 8;
    const axL = lerp(lx - 18, lx - 85 + sway, u), ayL = lerp(cy + 26, cy - 115, u);
    const axR = lerp(lx + 18, lx + 85 + sway, u), ayR = lerp(cy + 26, cy - 115, u);
    const w = 34 * Math.sin(Math.PI * u);
    s += `<line x1="${f(axL - w)}" y1="${f(ayL + 8)}" x2="${f(axL + w)}" y2="${f(ayL - 8)}" ${stroke(4, PEN)}/>`;
    s += `<line x1="${f(axR - w)}" y1="${f(ayR - 8)}" x2="${f(axR + w)}" y2="${f(ayR + 8)}" ${stroke(4, PEN)}/>`;
  }
  if (t > K.berbulu - 0.1) {
    s += G('', P(t, K.berbulu - 0.1, 0.35),
      `<rect x="${lx - 155}" y="${cy + mr - 28}" width="310" height="56" rx="14" fill="${C.yellow}" ${stroke(4.5, PEN)}/>` +
      hand('lebat berbulu (aman)', lx, cy + mr + 2, 40, PEN));
  }

  // Right Magnifier Circle: BETINA (antena tipis + penular DBD)
  const ro = P(t, K.tipis - 0.35, 0.45);
  if (ro > 0) {
    let rg = `<circle cx="${rx}" cy="${cy}" r="${mr}" fill="#FFF2F2"/>`;
    rg += doodle(ring(rx, cy, mr, 32), t, 540, 7, C.blood, true);
    rg += `<rect x="${rx - 130}" y="${cy - mr - 32}" width="260" height="56" rx="14" fill="${C.blood}" ${stroke(5, PEN)}/>`;
    rg += txt('BETINA', rx, cy - mr - 3, 34, '#fff', 900);

    // Zoomed female head & thin plain antennae
    rg += `<circle cx="${rx}" cy="${cy + 75}" r="52" fill="${C.mosq}" ${stroke(6, PEN)}/>`;
    rg += `<circle cx="${rx - 16}" cy="${cy + 65}" r="14" fill="#fff"/><circle cx="${rx - 16}" cy="${cy + 65}" r="7" fill="${C.bloodD}"/>`;
    rg += `<circle cx="${rx + 16}" cy="${cy + 65}" r="14" fill="#fff"/><circle cx="${rx + 16}" cy="${cy + 65}" r="7" fill="${C.bloodD}"/>`;
    rg += doodle([[rx - 18, cy + 26], [rx - 45, cy - 45], [rx - 62, cy - 115]], t, 550, 4, PEN);
    rg += doodle([[rx + 18, cy + 26], [rx + 45, cy - 45], [rx + 62, cy - 115]], t, 555, 4, PEN);

    rg += `<rect x="${rx - 155}" y="${cy + mr - 28}" width="310" height="56" rx="14" fill="#FFFDF7" ${stroke(4.5, PEN)}/>`;
    rg += hand('antena tipis!', rx, cy + mr + 2, 42, C.bloodD);

    if (t > K.dbd - 0.1) {
      const dp = pop(t, K.dbd - 0.1, 0.4);
      rg += G(T(rx, cy - 55, dp.s), dp.o,
        `<rect x="-125" y="-28" width="250" height="56" rx="14" fill="${C.accent}" ${stroke(5, PEN)}/>` +
        txt('PENULAR DBD!', 0, 2, 30, '#fff', 900));
      rg += impactRing(t, K.dbd, rx, cy, { r0: 30, r1: 220, col: C.accent, dur: 0.45 });
      rg += burst(t, K.dbd, rx, cy, { n: 12, r: 150, col: C.accent, dur: 0.4, size: 9 });
    }
    s += G('', ro, rg);
  }

  // Stickman at bottom center
  s += shadow(3200, 1795, 55, 0.25);
  s += stickman(3200, 1710, 0.65, t > K.dbd ? 'shock' : 'point', t, 0, null, t > K.dbd ? 'shock' : 'smile');
  return s;
}

// Z6 (0, 1400): Synthesis table + Kuras Bak Mandi & Doctor tip
function zoneTakeaway(t) {
  if (t < K.s9 - 0.8 || t > K.end - 0.2) return '';
  let s = '';

  // Top summary card (y: 1190)
  const cy = 1190;
  s += `<rect x="-410" y="${cy - 110}" width="820" height="210" rx="22" fill="#FFFDF7"/>`;
  s += doodle(rectPts(-410, cy - 110, 820, 210), t, 600, 6, PEN, true);
  s += doodle([[0, cy - 95], [0, cy + 85]], t, 610, 4, C.line);

  // Left half: Jantan -> Nektar
  s += txt('NYAMUK JANTAN', -205, cy - 62, 30, C.leaf, 900);
  s += hand('isap nektar bunga', -205, cy - 8, 44, PEN);
  s += hand('(aman, tidak gigit)', -205, cy + 44, 38, C.muted);

  // Right half: Betina -> Darah -> Telur
  if (t > K.darah9 - 0.2) {
    const bo = P(t, K.darah9 - 0.2, 0.35);
    s += G('', bo,
      txt('NYAMUK BETINA', 205, cy - 62, 30, C.blood, 900) +
      hand('cari protein darah', 205, cy - 8, 44, C.bloodD) +
      hand('demi bertelur!', 205, cy + 44, 42, C.accent));
  }

  // Bottom: Kuras Bak Mandi (Scene 10)
  if (t > K.kuras - 0.2) {
    const bp = pop(t, K.kuras - 0.2, 0.45);
    const bx = -190, by = 1520;
    const waterH = lerp(120, 18, P(t, K.mandi, 0.9, E.inOutCubic));

    let bg = `<rect x="${bx - 180}" y="${by - 95}" width="360" height="200" rx="16" fill="${C.tile}"/>`;
    bg += `<rect x="${bx - 168}" y="${f(by + 95 - waterH)}" width="336" height="${f(waterH)}" rx="10" fill="${C.water}"/>`;
    // tile grid lines
    bg += `<path d="M${bx - 60},${by - 95} L${bx - 60},${by + 105} M${bx + 60},${by - 95} L${bx + 60},${by + 105} M${bx - 180},${by} L${bx + 180},${by}" ${stroke(3, '#B8D8EE')}/>`;
    bg += doodle(rectPts(bx - 180, by - 95, 360, 200), t, 640, 6, PEN, true);
    bg += `<rect x="${bx - 140}" y="${by - 135}" width="280" height="52" rx="14" fill="${C.leaf}" ${stroke(4.5, PEN)}/>`;
    bg += txt('KURAS BAK MANDI!', bx, by - 107, 28, '#fff', 900);
    bg += sparkle(bx - 140, by - 40, 22, t, C.yellow) + sparkle(bx + 145, by - 30, 24, t + 0.3, C.yellow);
    bg += dustPuff(t, K.kuras, bx, by + 95, { n: 6, size: 22, dur: 0.4 });

    s += G(`translate(${bx} ${by}) scale(${f(bp.s)}) translate(${-bx} ${-by})`, bp.o, bg);
  }

  // Doctor badge when "demam tinggi, segera ke dokter" is spoken
  if (t > K.demam - 0.1) {
    const dp = pop(t, K.demam - 0.1, 0.4);
    const dx = 210, dy = 1480;
    s += G(T(dx, dy, dp.s), dp.o,
      `<rect x="-150" y="-85" width="300" height="170" rx="22" fill="#FFFDF7" ${stroke(5.5, PEN)}/>` +
      `<rect x="-28" y="-58" width="56" height="18" rx="4" fill="${C.blood}" transform="rotate(90 0 -30)"/>` +
      `<rect x="-28" y="-39" width="56" height="18" rx="4" fill="${C.blood}"/>` +
      hand('demam tinggi?', 0, 22, 38, C.bloodD) +
      hand('ke dokter / puskesmas!', 0, 62, 36, PEN));
    s += burst(t, K.demam, dx, dy, { n: 8, r: 90, col: C.leaf, dur: 0.4, size: 8 });
  }

  s += shadow(210, 1825, 55, 0.25);
  s += stickman(210, 1740, 0.62, 'happy', t, 0, null, 'smile');
  return s;
}

function drawWorld(t, cam) {
  return zoneOpening(t) + zoneNectar(t) + zoneProboscis(t) + zoneEggs(t) + zoneAntenna(t) + zoneTakeaway(t);
}

function drawOverlay(t, cam) {
  let s = '';
  if (cam) {
    const ptFlower = toScreen(cam, 1420, -20);
    s += spotlight(t, K.nektar4 - 0.1, K.nektar4 + 1.3, ptFlower.x, ptFlower.y, 260, 0.38);

    const ptNeedle = toScreen(cam, 3450, 65);
    s += speedLines(t, K.jarum - 0.05, K.jarum + 0.6, ptNeedle.x, ptNeedle.y, { r: 240, n: 24, col: PEN });
  }

  if (t > K.fakta - 0.15 && t < K.s4 - 0.1) {
    s += G('', 1 - P(t, K.s4 - 0.4, 0.3), stamp('FAKTA!', t, K.fakta, 770, 1210, C.leaf, -7, 98));
  }
  if (t > K.dbd - 0.15 && t < K.s9 - 0.1) {
    s += G('', 1 - P(t, K.s9 - 0.4, 0.3), stamp('AWAS DBD!', t, K.dbd, 540, 1190, C.accent, 6, 96));
  }
  s += cite('sumber: CDC – About Mosquitoes (cdc.gov/mosquitoes/about)', t, K.fakta, K.s5 - 0.15);
  s += cite('sumber: CDC & Wikipedia – anatomi proboscis (6 jarum penusuk)', t, K.proboscis, K.s7 - 0.15);
  s += cite('sumber: CDC & Wikipedia – 100–200 telur per induk betina', t, K.protein7, K.s8 - 0.15);
  s += cite('sumber: WHO – Fact Sheet Dengue (Aedes aegypti betina)', t, K.antena, K.s9 - 0.15);
  return s;
}

// ---------- thumbnail (1080x1920 screen coordinates) ----------
function drawThumbnail() {
  const t = 1.2;
  let world = '';

  // Soft warm radial burst behind the comparison
  const cx = 540, cy = 980;
  for (let k = 0; k < 20; k += 2) {
    const a0 = k / 20 * Math.PI * 2, a1 = a0 + Math.PI / 20 * 1.5;
    world += `<path d="M${cx},${cy} L${f(cx + 1500 * Math.cos(a0))},${f(cy + 1500 * Math.sin(a0))} L${f(cx + 1500 * Math.cos(a1))},${f(cy + 1500 * Math.sin(a1))} Z" fill="#FFEAA7" opacity="0.38"/>`;
  }

  // Left vs Right giant mosquito comparison in screen coordinates (keeps the mystery without spoiling!)
  world += `<g transform="translate(540 930)">`;
  world += mosqCard(-235, -60, false, t, 10, 0);
  world += mosqCard(235, -60, true, t, 110, 0);

  // Red highlight ring pointing at the Male mosquito mystery
  world += `<circle cx="235" cy="-85" r="112" fill="none" stroke="${C.accent}" stroke-width="11" stroke-dasharray="20 13"/>`;
  world += `<circle cx="335" cy="-165" r="40" fill="${C.accent}" stroke="${PEN}" stroke-width="6"/>`;
  world += txt('?', 335, -163, 52, '#fff', 900);

  // Expressive Stickman at bottom-left
  world += stickman(-220, 420, 1.15, 'shock', t, 0, null, 'confused');
  world += `</g>`;

  let ui = titleText('NYAMUK JANTAN\n*GAK MINUM DARAH*?!', 540, 350, 118, 940, 22);
  ui += stamp('MITOS?', 2.0, 0.1, 720, 1360, C.accent, -7, 88);
  return { world, ui };
}
