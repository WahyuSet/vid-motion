// Topic: Kaktus bisa hidup di gurun tanpa air? (mitos-fakta, paper style)
// One desert in cross-section: a saguaro at x 0 standing on the surface (y 0), shallow roots in the cut-away sand.
Object.assign(C, {
  cac: '#6FA85A', cacD: '#4E8040', cacL: '#A9D18E', spine: '#FFF7E3', flower: '#FFFDF5',
  sand: '#EDD29A', sandCut: '#E5C185', strata: '#D3AA66', dune: '#F2DDB0', duneL: '#DCC08A', mesa: '#E4C79C',
  root: '#A8825A', water: '#6FA8DC', rock: '#BBA78C', rockD: '#9C8A71', cloudR: '#E9E4DA',
  pot: '#C8754B', soil: '#8B6A4C', rotten: '#5C3B22', rootOk: '#EADBC0', galon: '#CFE6F7', can: '#5FA548',
});

const TRUNK = 'M-62,0 L-62,-548 A62,62 0 0 1 62,-548 L62,0 Z';
// main roots as cubic curves [p0, p1, p2, p3]; water travels along them from the tips to the trunk
const ROOTS = [
  [[-20, 6], [-120, 30], [-300, 40], [-600, 48]], [[20, 6], [120, 30], [300, 40], [600, 48]],
  [[-24, 10], [-110, 60], [-230, 70], [-380, 92]], [[24, 10], [110, 60], [230, 70], [380, 92]],
];
const ROOTLETS = ['M-260,38 C-300,70 -330,90 -360,122', 'M260,38 C300,70 330,90 360,122',
  'M-460,44 C-500,60 -520,80 -545,104', 'M460,44 C500,60 520,80 545,104',
  'M-150,30 C-170,48 -180,62 -186,84', 'M150,30 C170,48 180,62 186,84'];
const bez = ([a, b, c, d], u) => [0, 1].map(i => (1 - u) ** 3 * a[i] + 3 * u * (1 - u) ** 2 * b[i] + 3 * u * u * (1 - u) * c[i] + u ** 3 * d[i]);
const ROCK = [330, -42];

const headText = (s, x, y, size, fill, extra = '') =>
  `<text x="${f(x)}" y="${f(y)}" font-family="${HEAD_FONT}" font-size="${size}" fill="${fill}" text-anchor="middle" dominant-baseline="central" ${extra}>${esc(s)}</text>`;

// ---------- props ----------
function cloud(x, y, s, col = C.cloudR) {
  const b = [[0, 0, 60], [62, -22, 50], [-62, -10, 46], [112, 10, 40], [-112, 12, 38], [30, 22, 50], [-40, 24, 44]];
  return G(T(x, y, s), 1, b.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="${C.ink}"/>`).join('') +
    b.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>`).join(''));
}

function arrow2(x1, y1, x2, y2, col, p = 1, w = 5) {
  const x = lerp(x1, x2, p), y = lerp(y1, y2, p), a = Math.atan2(y2 - y1, x2 - x1), h = 4 + 2.4 * w;
  const head = (hx, hy, ang) => `<path d="M${f(hx - h * Math.cos(ang - 0.5))},${f(hy - h * Math.sin(ang - 0.5))} L${f(hx)},${f(hy)} L${f(hx - h * Math.cos(ang + 0.5))},${f(hy - h * Math.sin(ang + 0.5))}" fill="none" ${stroke(w, col)}/>`;
  return `<line x1="${x1}" y1="${y1}" x2="${f(x)}" y2="${f(y)}" ${stroke(w, col)}/>` + head(x1, y1, a + Math.PI) + (p > 0.98 ? head(x2, y2, a) : '');
}

function galon(x, y, full) {
  return G(T(x, y), 1, `<rect x="-17" y="-20" width="34" height="44" rx="9" fill="${full ? C.water : '#fff'}" ${stroke(3)}/>` +
    `<rect x="-7" y="-30" width="14" height="10" rx="2" fill="${full ? C.water : '#fff'}" ${stroke(3)}/>` +
    `<rect x="-9" y="-36" width="18" height="7" rx="3" fill="${C.cool}" ${stroke(2.5)}/>` +
    (full ? `<path d="M-10,-8 Q-12,6 -8,14" fill="none" ${stroke(3, '#fff')} opacity="0.7"/>` : ''));
}

// the saguaro; o: w (pleats swell), level 0..1 + water (see-through stored water), pores 0..1, face
function saguaro(t, o = {}) {
  const w = o.w || 1, lvl = o.level ?? 0.3, wv = o.water || 0, pores = o.pores || 0;
  let g = limb('M-40,-260 L-150,-260 Q-178,-260 -178,-290 L-178,-430', 64, C.cac) +
    limb('M40,-350 L142,-350 Q170,-350 170,-380 L170,-500', 58, C.cac);
  g += `<path d="M-150,-260 Q-178,-260 -178,-290 L-178,-436" fill="none" ${stroke(3, C.cacD)} opacity="0.7"/>`;
  g += `<path d="M142,-350 Q170,-350 170,-380 L170,-506" fill="none" ${stroke(3, C.cacD)} opacity="0.7"/>`;
  g += `<path d="${TRUNK}" fill="${C.cac}" ${stroke()}/>`;
  if (wv > 0.01) {
    const top = -12 - lvl * 540;
    let wave = `M-70,${f(top)}`;
    for (let x = -70; x <= 70; x += 10) wave += ` L${x},${f(top + 6 * Math.sin(x * 0.08 + t * 4))}`;
    let ticks = '';
    for (let k = 1; k <= 8; k++) ticks += `<line x1="36" y1="${-k * 64}" x2="54" y2="${-k * 64}" ${stroke(3, '#fff')} opacity="0.8"/>`;
    g += `<clipPath id="trk"><path d="${TRUNK}"/></clipPath><g clip-path="url(#trk)" opacity="${f(wv)}">` +
      `<path d="${wave} L70,0 L-70,0 Z" fill="${C.water}" opacity="0.8"/>${ticks}</g>`;
  }
  [-40, -20, 0, 20, 40].forEach(x => g += `<line x1="${x}" y1="-552" x2="${x}" y2="-6" ${stroke(4, C.cacD)} opacity="0.7"/>`);
  // pores between the pleats: closed slits by day, open at night
  [-30, -10, 10, 30].forEach(x => { for (let y = -500; y <= -80; y += 70) {
    g += `<ellipse cx="${x}" cy="${y + (x === -10 || x === 30 ? 35 : 0)}" rx="6" ry="${f(1.2 + 4.8 * pores)}" fill="#2E4A26" stroke="${C.cacL}" stroke-width="2"/>`;
  } });
  // spines on the pleats and along the edges
  let sp = '';
  [-40, -20, 0, 20, 40].forEach((x, i) => { for (let y = -530 + (i % 2) * 24; y < -20; y += 48) {
    sp += `M${x},${y} l-7,-7 M${x},${y} l7,-7 M${x},${y} l0,-10 `;
  } });
  for (let y = -520; y < -10; y += 40) sp += `M-62,${y} l-15,-5 M62,${y} l15,-5 `;
  g += `<path d="${sp}" fill="none" ${stroke(2.4, C.spine)}/>`;
  // face
  const ey = -455;
  switch (o.face) {
    case 'hot':
      g += `<path d="M-38,${ey} L-12,${ey + 5} M38,${ey} L12,${ey + 5}" ${stroke(6)}/>` +
        `<ellipse cx="0" cy="${ey + 40}" rx="11" ry="9" fill="${C.ink}"/><path d="M-4,${ey + 44} Q0,${ey + 58} 6,${ey + 44}" fill="#E86A5A"/>` +
        `<path d="M54,${ey - 40} q10,16 0,26 q-10,-10 0,-26Z" fill="${C.coolL || '#CFE3F6'}" ${stroke(3)}/>`;
      break;
    case 'happy':
      g += `<path d="M-38,${ey + 4} Q-25,${ey - 14} -12,${ey + 4} M12,${ey + 4} Q25,${ey - 14} 38,${ey + 4}" fill="none" ${stroke(6)}/>` +
        `<path d="M-22,${ey + 30} Q0,${ey + 60} 22,${ey + 30} Z" fill="${C.ink}"/>`;
      break;
    case 'calm':
      g += `<path d="M-38,${ey} Q-25,${ey + 12} -12,${ey} M12,${ey} Q25,${ey + 12} 38,${ey}" fill="none" ${stroke(6)}/>` +
        `<path d="M-14,${ey + 34} Q0,${ey + 44} 14,${ey + 34}" fill="none" ${stroke(5)}/>`;
      break;
    default:
      g += `<ellipse cx="-25" cy="${ey}" rx="8" ry="11" fill="${C.ink}"/><ellipse cx="25" cy="${ey}" rx="8" ry="11" fill="${C.ink}"/>` +
        `<circle cx="-22" cy="${ey - 4}" r="3" fill="#fff"/><circle cx="28" cy="${ey - 4}" r="3" fill="#fff"/>` +
        `<path d="M-18,${ey + 30} Q0,${ey + 46} 18,${ey + 30}" fill="none" ${stroke(5)}/>`;
  }
  g += `<ellipse cx="-42" cy="${ey + 22}" rx="10" ry="6" fill="${C.cheek}" opacity="0.45"/><ellipse cx="42" cy="${ey + 22}" rx="10" ry="6" fill="${C.cheek}" opacity="0.45"/>`;
  // a blossom on top
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; g += `<ellipse cx="${f(15 * Math.cos(a))}" cy="${f(-612 + 9 * Math.sin(a))}" rx="12" ry="8" transform="rotate(${f(a * 180 / Math.PI)} ${f(15 * Math.cos(a))} ${f(-612 + 9 * Math.sin(a))})" fill="${C.flower}" ${stroke(3)}/>`; }
  g += `<circle cx="0" cy="-614" r="7" fill="${C.yellow}" ${stroke(3)}/>`;
  return G(`scale(${f(w)} 1)`, 1, g);
}

function desert(t, heat) {
  let s = `<circle cx="-760" cy="-1060" r="120" fill="#F7C85A" ${stroke(6)}/>`;
  for (let k = 0; k < 12; k++) {
    const a = k * Math.PI / 6 + t * 0.15;
    s += `<line x1="${f(-760 + 150 * Math.cos(a))}" y1="${f(-1060 + 150 * Math.sin(a))}" x2="${f(-760 + 200 * Math.cos(a))}" y2="${f(-1060 + 200 * Math.sin(a))}" ${stroke(8, '#F7C85A')}/>`;
  }
  s += `<path d="M1150,0 L1200,-260 L1700,-260 L1760,0 Z M-1500,0 L-1460,-200 L-1100,-200 L-1060,0 Z" fill="${C.mesa}" ${stroke(4, C.duneL)}/>`;
  s += `<path d="M-3200,0 Q-2400,-230 -1700,-30 Q-1100,-180 -600,-20 Q-200,-120 300,-10 Q900,-200 1500,-20 Q2300,-240 3200,0 Z" fill="${C.dune}" ${stroke(4, C.duneL)}/>`;
  // cut-away sand
  s += `<rect x="-4000" y="0" width="8000" height="2400" fill="${C.sandCut}"/>`;
  [140, 300, 480, 700].forEach((y, i) => {
    let d = `M-4000,${y}`;
    for (let x = -4000; x <= 4000; x += 200) d += ` Q${x + 100},${y + (i % 2 ? 14 : -14)} ${x + 200},${y}`;
    s += `<path d="${d}" fill="none" ${stroke(4, C.strata)} stroke-dasharray="26 18" opacity="0.8"/>`;
  });
  for (let k = 0; k < 40; k++) s += `<ellipse cx="${f(-1300 + 2600 * rnd(k))}" cy="${f(60 + 600 * rnd(k + 70))}" rx="${f(6 + 8 * rnd(k + 9))}" ry="${f(4 + 5 * rnd(k + 3))}" fill="${C.strata}" opacity="0.7"/>`;
  s += `<rect x="-4000" y="-6" width="8000" height="12" fill="${C.sand}"/><line x1="-4000" y1="0" x2="4000" y2="0" ${stroke(6)}/>`;
  // heat shimmer
  if (heat > 0.01) for (let k = 0; k < 7; k++) {
    const x = -620 + k * 200 + (k > 2 ? 80 : 0), ph = (t * 0.5 + k * 0.37) % 1;
    let d = `M${x},${f(-20 - ph * 220)}`;
    for (let j = 1; j <= 6; j++) d += ` q${j % 2 ? 14 : -14},-14 0,-28`;
    s += `<path d="${d}" fill="none" ${stroke(4, '#E8A03A')} opacity="${f(heat * 0.6 * Math.sin(Math.PI * ph))}"/>`;
  }
  return s;
}

// ---------- timing, camera, headlines ----------
let K = {};
const ICON = {
  drop: () => `<path d="M0,-26 C14,-6 20,4 20,12 A20,20 0 0 1 -20,12 C-20,4 -14,-6 0,-26 Z" fill="${C.water}" ${stroke(4)}/>`,
  myth: () => headText('?', 0, 4, 52, C.accent),
  root: () => `<path d="M0,-22 L0,4 M0,-4 Q-14,6 -20,22 M0,-2 Q14,8 22,20 M0,6 L-2,24" fill="none" ${stroke(5, C.root)}/><line x1="-24" y1="-12" x2="24" y2="-12" ${stroke(4)}/>`,
  spine: () => `<path d="M0,0 L-18,-18 M0,0 L18,-18 M0,0 L0,-26 M0,0 L-24,4 M0,0 L24,4" fill="none" ${stroke(5, C.cacD)}/><circle r="5" fill="${C.cac}" ${stroke(3)}/>`,
  moon: () => `<circle r="20" fill="${C.yellow}" ${stroke(4)}/><circle cx="10" cy="-8" r="17" fill="#fff"/>`,
  pot: () => `<path d="M-18,4 L18,4 L13,26 L-13,26 Z" fill="${C.pot}" ${stroke(4)}/><rect x="-9" y="-24" width="18" height="28" rx="9" fill="${C.cac}" ${stroke(4)}/>`,
};

function setup(D) {
  const s = D.scenes, at = (i, w, d = 0) => s[i].at(w, d);
  K = {
    air: at(0, 'air'), s1e: s[0].end,
    s2: s[1].start, fakta: at(1, 'Faktanya'), mitos: at(1, 'mitos'), butuh: at(1, 'butuh'), s2e: s[1].end,
    s3: s[2].start, menabung: at(2, 'menabung'), s3e: s[2].end,
    s4: s[3].start, dangkal: at(3, 'dangkal'), tujuh: at(3, 'tujuh'), sejauh: at(3, 'sejauh'), s4e: s[3].end,
    s5: s[4].start, hujan: at(4, 'hujan'), menyedot: at(4, 'menyedot'), mengembang: at(4, 'mengembang'), s5e: s[4].end,
    s6: s[5].start, l750: at(5, '750'), setahun: at(5, 'setahun'), s6e: s[5].end,
    s7: s[6].start, daun: at(6, 'daun'), angin: at(6, 'angin'), s7e: s[6].end,
    s8: s[7].start, malam: at(7, 'malam'), s8e: s[7].end,
    s9: s[8].start, hemat: at(8, 'hemat'), s9e: s[8].end,
    s10: s[9].start, rumah: at(9, 'rumah'), siram: at(9, 'kebanyakan'), busuk: at(9, 'busuk'),
    loop: D.total - 1.5,
  };
  const start = { x: 0, y: -330, z: 1.0 };
  setCamera([
    start,
    { at: 0.2, dur: K.s1e - 0.2, x: 0, y: -340, z: 1.12 },
    { at: K.s2, dur: 0.9, x: 150, y: -260, z: 1.05 },
    { at: K.s3, dur: 0.9, x: 0, y: -330, z: 1.3 },
    { at: K.s4, dur: 1.3, x: 0, y: -40, z: 0.76 },
    { at: K.s5, dur: 1.0, x: 0, y: -270, z: 0.66 },
    { at: K.s6, dur: 1.6, x: 0, y: -290, z: 0.8 },
    { at: K.s7, dur: 1.0, x: -80, y: -500, z: 2.6 },
    { at: K.s8, dur: 1.1, x: 0, y: -330, z: 1.7 },
    { at: K.s9, dur: 1.1, x: 0, y: -280, z: 0.9 },
    { at: K.s10, dur: 1.0, x: 0, y: -270, z: 0.82 },
    { at: K.loop, dur: 1.4, ...start },
  ]);
  setHeadlines([
    { at: K.air, end: K.s1e - 0.1, text: 'HIDUP\n*TANPA AIR*?' },
    { at: K.butuh, end: K.s2e - 0.1, text: 'KAKTUS\n*BUTUH AIR*' },
    { at: K.menabung, end: K.s3e - 0.1, text: 'JAGO *MENABUNG*' },
    { at: K.dangkal, end: K.s4e - 0.1, text: 'AKAR *DANGKAL*\nTAPI LEBAR' },
    { at: K.menyedot, end: K.mengembang - 0.05, text: 'AKAR *MENYEDOT*' },
    { at: K.mengembang, end: K.s5e - 0.1, text: 'BATANG\n*MENGEMBANG*' },
    { at: K.l750, end: K.s6e - 0.1, text: '*750* LITER', y: 300 },
    { at: K.daun, end: K.s7e - 0.1, text: 'DURI = *DAUN*' },
    { at: K.malam, end: K.s8e - 0.1, text: 'BUKA\n*MALAM HARI*' },
    { at: K.hemat, end: K.s9e - 0.1, text: 'JAGO\n*HEMAT AIR*', y: 400 },
    { at: K.siram, end: K.loop, text: 'JANGAN\n*KEBANYAKAN* DISIRAM', y: 300 },
  ]);
  setChapters([
    { at: K.air, icon: ICON.drop }, { at: K.s2, icon: ICON.myth }, { at: K.s4, icon: ICON.root },
    { at: K.s7, icon: ICON.spine }, { at: K.s8, icon: ICON.moon }, { at: K.s10, icon: ICON.pot },
  ], { at: K.s9, end: K.s10 });
}

function cues(D) {
  return [
    [K.air, 'pop'], [K.s2, 'whoosh'], [K.mitos, 'thud'], [K.butuh, 'tick'],
    [K.s3, 'whoosh'], [K.menabung, 'pop'],
    [K.s4, 'whoosh'], [K.dangkal, 'tick'], [K.tujuh, 'pop'], [K.sejauh, 'pop'],
    [K.s5 - 0.3, 'whoosh'], [K.menyedot, 'sparkle'], [K.mengembang, 'pop'],
    [K.s6, 'whoosh'], [K.l750, 'pop'], [K.setahun, 'ding'],
    [K.s7, 'whoosh'], [K.daun, 'sparkle'], [K.angin, 'whoosh'],
    [K.s8, 'whoosh'], [K.malam, 'chirp'],
    [K.s9, 'whoosh'], ...[0, 1, 2, 3, 4].map(i => [K.s9 + i * 0.12, 'pop']), [K.s9 + 0.75, 'ding'],
    [K.s10, 'whoosh'], [K.siram + 0.5, 'thud'], [K.busuk, 'pop'], [K.loop, 'whoosh'],
  ];
}

const nightAt = t => P(t, K.s8 - 0.3, 0.8) * (1 - P(t, K.s9 - 0.3, 0.8));

// ---------- world ----------
function drawWorld(t) {
  const heat = 1 - P(t, K.s2, 0.6) + P(t, K.loop + 0.4, 0.8);
  const n = nightAt(t);
  let s = desert(t, heat);

  // roots (drawn bigger than life so they can be seen)
  s += ROOTLETS.map(d => `<path d="${d}" fill="none" ${stroke(4, C.root)}/>`).join('');
  s += ROOTS.map(r => limb(`M${r[0]} C${r[1]} ${r[2]} ${r[3]}`, 9, C.root)).join('');
  const suck = P(t, K.menyedot - 0.2, 0.4) * (1 - P(t, K.s6 + 0.4, 0.5));
  if (suck > 0) ROOTS.forEach((r, i) => { for (let k = 0; k < 6; k++) {
    const [x, y] = bez(r, 1 - ((t * 0.55 + k / 6 + i * 0.13) % 1));
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="9" fill="${C.water}" ${stroke(3)} opacity="${f(suck)}"/>`;
  } });

  // measurements: roots are shallow but reach as far as the cactus is tall
  if (t > K.dangkal && t < K.s4e + 0.4) {
    const o = 1 - P(t, K.s4e - 0.1, 0.4);
    let m = '';
    const d1 = P(t, K.tujuh, 0.4), d2 = P(t, K.sejauh, 0.6);
    if (d1 > 0) m += arrow2(540, 4, 540, 48, C.accent, d1, 7) + hand('±7 cm', 540, 110, 72, C.accent);
    if (d2 > 0) m += arrow2(-300, -4, -300, -612, C.cool, d2, 8) + hand('tinggi', -400, -330, 72, C.cool) +
      arrow2(0, 210, -600, 210, C.cool, d2, 8) + hand('= lebar akar', -300, 275, 72, C.cool);
    m += hand('(tidak sesuai skala)', 380, 380, 48, C.muted);
    s += G('', o, m);
  }

  // rain
  const cloudIn = P(t, K.s5 - 0.5, 1.3, E.outCubic), cloudOut = P(t, K.s6 + 0.2, 1.6, E.inCubic);
  if (cloudIn > 0 && cloudOut < 1) {
    const dx = lerp(-1500, 0, cloudIn) + lerp(0, 1800, cloudOut);
    s += cloud(dx - 260, -880, 1.4) + cloud(dx + 90, -940, 1.7) + cloud(dx + 420, -870, 1.3);
    const rain = P(t, K.hujan - 0.2, 0.4) * (1 - P(t, K.s6, 0.5));
    if (rain > 0) {
      let r = '';
      for (let k = 0; k < 70; k++) {
        const x = -640 + 1280 * rnd(k) + dx * 0.2, ph = (t * 1.5 + rnd(k + 9)) % 1, y = -800 + ph * 800;
        r += `M${f(x)},${f(y)} l-6,26 `;
        if (ph > 0.93) r += `M${f(x - 18)},-4 q12,-14 24,0 `;
      }
      s += `<path d="${r}" fill="none" ${stroke(5, C.water)} opacity="${f(rain)}"/>`;
    }
  }

  // the rock and Si Cicak's entrance
  s += `<path d="M${ROCK[0] - 120},0 Q${ROCK[0] - 110},-80 ${ROCK[0] - 20},-92 Q${ROCK[0] + 90},-96 ${ROCK[0] + 116},0 Z" fill="${C.rock}" ${stroke(6)}/>`;
  s += `<path d="M${ROCK[0] - 60},-60 Q${ROCK[0] - 20},-74 ${ROCK[0] + 20},-66" fill="none" ${stroke(4, C.rockD)}/>`;

  s += cicakLayer(t);

  // the saguaro
  const lvl = 0.3 + 0.62 * P(t, K.menyedot, 2.0, E.inOutCubic) - 0.62 * P(t, K.loop, 1.2, E.inOutCubic);
  const w = 1 + 0.14 * P(t, K.mengembang - 0.1, 0.8, E.outBack) - 0.14 * P(t, K.loop, 1.2, E.inOutCubic);
  const water = P(t, K.s3, 0.6) * (1 - P(t, K.loop, 0.8)) * (1 - P(t, K.s7, 0.6) + P(t, K.s9, 0.6));
  const face = t > K.loop + 0.5 || t < K.s2 ? 'hot' : n > 0.5 ? 'calm' : t > K.mengembang ? 'happy' : 'default';
  s += saguaro(t, { w, level: lvl, water, pores: n, face });
  if (t > K.menabung && t < K.s4 + 0.6) {
    const p = pop(t, K.menabung, 0.45), o = 1 - P(t, K.s4, 0.5);
    s += G(T(140, -170, p.s), p.o * o, `<rect x="-78" y="-26" width="156" height="52" rx="26" fill="#fff" ${stroke(5)}/>` + txt('tabungan', 0, 2, 26, C.cool));
    s += `<path d="M70,-150 Q48,-120 40,-96" fill="none" ${stroke(4)} opacity="${f(p.o * o)}"/>`;
  }

  // macro: a leaf shrinks into a spine; dry wind stops at the spines
  if (t > K.s7 && t < K.s7e + 0.4) {
    const o = P(t, K.s7 + 0.4, 0.4) * (1 - P(t, K.s7e - 0.1, 0.4)), m = P(t, K.daun, 1.0, E.inOutCubic);
    let g = G(`translate(-236 -540) scale(1 ${f(lerp(1, 0.12, m))})`, 1,
      `<path d="M0,0 Q34,-24 76,0 Q34,24 0,0 Z" fill="${mix(C.cac, C.spine, m)}" ${stroke(3)}/>` +
      `<line x1="4" y1="0" x2="70" y2="0" ${stroke(2, C.cacD)} opacity="${f(1 - m)}"/>`);
    g += hand('daun', -198, -584, 30, C.cacD) + `<path d="M-198,-528 L-198,-506" ${stroke(3)}/>` + hand('duri', -198, -482, 30, C.ink);
    const wind = P(t, K.angin - 0.3, 0.4);
    for (let k = 0; k < 5; k++) {
      const ph = (t * 0.9 + k / 5) % 1, x = lerp(-280, -96, ph), y = -460 + k * 30;
      g += `<path d="M${f(x)},${y} q16,-8 32,0 t32,0" fill="none" ${stroke(3, '#B9B2A6')} opacity="${f(wind * Math.sin(Math.PI * ph) * (1 - ph * 0.6))}"/>`;
    }
    s += G('', o, g);
  }
  return s;
}

function cicakLayer(t) {
  if (t < K.s2 - 0.2 || t > K.s3 + 1.6) return '';
  const top = -100, stop = ROCK[0];
  let x, y = top - 70, rot = -90, walk = null, pose = 'calm';
  if (t < K.fakta + 0.2) {
    x = lerp(700, stop, clamp((t - K.s2 + 0.2) / (K.fakta + 0.4 - K.s2))); walk = t * 11;
  } else if (t < K.s3) {
    x = stop; rot = lerp(-90, 0, P(t, K.fakta + 0.2, 0.35)); y = top - 80;
    pose = t > K.mitos - 0.15 ? 'verdict' : 'happy';
  } else {
    x = stop + (t - K.s3) * 420; y = top - 70; rot = 90; walk = t * 11;
  }
  return cicak(x, y, 0.48, pose, t, rot, walk);
}

// ---------- overlay (screen space) ----------
function drawOverlay(t) {
  let s = '';
  if (t > K.mitos - 0.2 && t < K.s2e + 0.1) s += G('', 1 - P(t, K.s2e - 0.25, 0.25), stamp('MITOS!', t, K.mitos, 540, 620));

  const n = nightAt(t);
  if (n > 0) {
    s += `<rect width="1080" height="1920" fill="#1B2350" opacity="${f(0.55 * n)}"/>`;
    let st = '';
    [[150, 520, 12], [290, 640, 8], [220, 760, 10], [880, 720, 9], [960, 520, 11], [120, 900, 7], [960, 900, 8]].forEach(([x, y, r], i) =>
      st += sparkle(x, y, r * (0.6 + 0.4 * Math.sin(t * 4 + i * 2)), '#FFF4C2'));
    st += `<circle cx="930" cy="470" r="42" fill="#FFF4C2"/><circle cx="950" cy="455" r="36" fill="#1B2350" opacity="0.92"/>`;
    s += G('', n, st);
    const lab = P(t, K.malam, 0.4) * (1 - P(t, K.s8e - 0.1, 0.3));
    s += G('', lab, hand('pori-pori terbuka', 800, 1010, 48, '#FFF4C2') +
      `<path d="M690,1000 Q640,990 612,960" fill="none" ${stroke(4, '#FFF4C2')}/>`);
    for (let k = 0; k < 6; k++) {
      const ph = (t * 0.5 + k / 6) % 1;
      const x = lerp(900 - k * 40, 600, ph), y = lerp(1200 - k * 50, 940 - k * 30, ph);
      s += G('', lab * Math.sin(Math.PI * ph), `<circle cx="${f(x)}" cy="${f(y)}" r="14" fill="none" ${stroke(3, '#BFE0F5')}/>` + txt('CO₂', x, y - 24, 18, '#BFE0F5', 800));
    }
  }

  // field notes: 750 liters = about 40 drinking-water jugs
  if (t > K.s6 && t < K.s6e + 0.1) {
    const inn = E.outBack(clamp((t - K.s6 - 0.2) / 0.6)), out = P(t, K.s6e - 0.4, 0.4, E.inCubic);
    s += `<rect width="1080" height="1920" fill="${C.ink}" opacity="${f(0.35 * clamp(inn) * (1 - out))}"/>`;
    s += G(T(540, 1000 + 1200 * (1 - inn) + 1200 * out, 1, -1.5), 1, galonCard(t));
  }
  s += cite('Sumber: National Park Service, Saguaro National Park', t, K.l750, K.s6e - 0.1, 1432);

  // at home: too much water rots the roots
  if (t > K.s10 - 0.1) {
    const inn = E.outBack(clamp((t - K.s10) / 0.6)), out = P(t, K.loop, 0.5, E.inCubic);
    s += `<rect width="1080" height="1920" fill="${C.ink}" opacity="${f(0.3 * clamp(inn) * (1 - out))}"/>`;
    s += G(T(540, 1000 + 1200 * (1 - inn) + 1700 * out, 1, 1.2), 1, potCard(t));
    s += cite('Sumber: Texas A&M Plant Clinic, Iowa State Univ. Extension', t, K.siram, K.loop, 1432);
    if (t > K.siram) {
      const p = pop(t, K.siram, 0.5);
      s += G(T(0, 900 * out), 1, cicak(150, 1330, 0.45 * p.s, 'happy', t, 14));
    }
  }
  return s;
}

function notePaper() {
  let s = `<rect x="-410" y="-380" width="820" height="760" rx="22" fill="#FBF7EE" ${stroke(6)}/>`;
  for (let x = -370; x < 410; x += 40) s += `<line x1="${x}" y1="-370" x2="${x}" y2="370" ${stroke(2, '#DCE6EF')}/>`;
  for (let y = -340; y < 380; y += 40) s += `<line x1="-400" y1="${y}" x2="400" y2="${y}" ${stroke(2, '#DCE6EF')}/>`;
  s += `<rect x="-440" y="-400" width="150" height="50" fill="${C.yellow}" opacity="0.6" transform="rotate(-24 -365 -375)"/>`;
  s += `<rect x="290" y="-400" width="150" height="50" fill="${C.yellow}" opacity="0.6" transform="rotate(24 365 -375)"/>`;
  return s;
}

function galonCard(t) {
  let s = notePaper() + hand('catatan lapangan', -370, -320, 58, C.ink, 'start');
  s += hand('750 liter ≈ 40 galon air', 0, -235, 58, C.cool);
  const filled = Math.floor(40 * P(t, K.l750 + 0.2, 1.6, E.lin));
  for (let k = 0; k < 40; k++) s += galon(-245 + (k % 8) * 70, -120 + Math.floor(k / 8) * 74, k < filled);
  s += hand('(1 galon = 19 liter)', -200, 270, 38, C.muted);
  const c = pop(t, K.setahun, 0.45);
  s += G(T(230, 270, c.s, 6), c.o, `<rect x="-90" y="-62" width="180" height="128" rx="14" fill="#fff" ${stroke(5)}/>` +
    `<path d="M-90,-30 L-90,-48 Q-90,-62 -76,-62 L76,-62 Q90,-62 90,-48 L90,-30 Z" fill="${C.accent}" ${stroke(5)}/>` +
    hand('±1 tahun', 0, 18, 46, C.ink));
  return s;
}

function potCard(t) {
  let s = notePaper() + hand('kaktus di rumah', -370, -320, 58, C.ink, 'start');
  // window and sill
  s += `<rect x="-300" y="-270" width="600" height="300" rx="10" fill="#DCEBF5" ${stroke(5)}/>`;
  s += `<line x1="0" y1="-270" x2="0" y2="30" ${stroke(5)}/><line x1="-300" y1="-120" x2="300" y2="-120" ${stroke(4)}/>`;
  s += `<rect x="-340" y="30" width="680" height="26" rx="6" fill="#C9A27A" ${stroke(5)}/>`;
  const rot = P(t, K.busuk - 0.8, 1.0);
  const flood = P(t, K.rumah, 1.6);
  // pot in cross-section: soggy soil, roots going brown
  const px = -60;
  s += `<path d="M${px - 110},-40 L${px + 110},-40 L${px + 88},30 L${px - 88},30 Z" fill="${C.pot}" ${stroke(6)}/>`;
  s += `<path d="M${px - 100},-30 L${px + 100},-30 L${px + 84},22 L${px - 84},22 Z" fill="${C.soil}"/>`;
  s += `<path d="M${px - 100},${f(-30 + 30 * (1 - flood))} L${px + 100},${f(-30 + 30 * (1 - flood))} L${px + 84},22 L${px - 84},22 Z" fill="${C.water}" opacity="0.55"/>`;
  s += `<path d="M${px},-28 Q${px - 30},-6 ${px - 60},10 M${px},-28 Q${px + 26},-4 ${px + 58},12 M${px},-28 L${px - 4},16" fill="none" ${stroke(5, mix(C.rootOk, C.rotten, rot))}/>`;
  // small barrel cactus, sad when the roots rot
  s += `<ellipse cx="${px}" cy="-96" rx="70" ry="62" fill="${mix(C.cac, '#8F9A5A', rot)}" ${stroke(6)}/>`;
  [-36, -12, 12, 36].forEach(dx => s += `<path d="M${px + dx},-150 Q${px + dx * 1.3},-96 ${px + dx},-40" fill="none" ${stroke(3, C.cacD)} opacity="0.7"/>`);
  s += rot > 0.5
    ? `<path d="M${px - 30},-110 L${px - 14},-104 M${px + 30},-110 L${px + 14},-104 M${px - 14},-74 Q${px},-86 ${px + 14},-74" fill="none" ${stroke(5)}/>`
    : `<circle cx="${px - 20}" cy="-108" r="6" fill="${C.ink}"/><circle cx="${px + 20}" cy="-108" r="6" fill="${C.ink}"/><path d="M${px - 12},-82 Q${px},-74 ${px + 12},-82" fill="none" ${stroke(4)}/>`;
  // puddle overflowing onto the sill
  s += `<ellipse cx="${px}" cy="40" rx="${f(40 + 170 * flood)}" ry="${f(6 + 10 * flood)}" fill="${C.water}" opacity="0.7"/>`;
  // watering can pouring far too much
  const pour = 1 - P(t, K.siram + 0.5, 0.3);
  let can = `<path d="M-60,-40 L60,-40 L50,50 L-50,50 Z" fill="${C.can}" ${stroke(6)}/>` +
    `<path d="M-60,-20 Q-110,-30 -150,-80" fill="none" ${stroke(14)}/><path d="M-60,-20 Q-110,-30 -150,-80" fill="none" ${stroke(8, C.can)}/>` +
    `<path d="M-30,-40 Q0,-90 30,-40" fill="none" ${stroke(8)}/>`;
  s += G(T(250, -110, 1, -28), 1, can);
  if (pour > 0) for (let k = 0; k < 12; k++) {
    const ph = (t * 1.8 + k / 12) % 1;
    s += `<circle cx="${f(lerp(140, px + 30, ph) + 6 * Math.sin(k))}" cy="${f(lerp(-205, -70, ph) + 30 * ph * ph)}" r="7" fill="${C.water}" opacity="${f(pour)}"/>`;
  }
  const x = P(t, K.siram + 0.5, 0.3);
  if (x > 0) s += `<path d="M180,-210 L320,-30 M320,-210 L180,-30" fill="none" ${stroke(22, C.accent)} stroke-dasharray="230" stroke-dashoffset="${f(230 * (1 - x))}"/>`;
  const b = pop(t, K.busuk, 0.45);
  s += G(T(px + 170, 110, b.s, -6), b.o, `<rect x="-80" y="-30" width="160" height="60" rx="30" fill="${C.accent}" ${stroke(5)}/>` + hand('busuk!', 0, 2, 44, '#fff'));
  s += hand('siram kalau tanahnya sudah kering', 0, 290, 46, C.cool);
  return s;
}
// ---------- thumbnail ----------
function drawThumbnail() {
  const t = 1.3;
  let s = `<rect width="1080" height="1920" fill="#F6E2B8"/>`;
  for (let k = 0; k < 24; k += 2) {
    const a0 = k / 24 * Math.PI * 2, a1 = a0 + Math.PI / 12;
    s += `<path d="M540,900 L${f(540 + 1800 * Math.cos(a0))},${f(900 + 1800 * Math.sin(a0))} L${f(540 + 1800 * Math.cos(a1))},${f(900 + 1800 * Math.sin(a1))} Z" fill="#F2B550" opacity="0.4"/>`;
  }
  s += `<circle cx="150" cy="620" r="110" fill="#F7C85A" ${stroke(7)}/>`;
  s += `<path d="M-100,1420 Q200,1300 520,1400 Q820,1300 1180,1420 L1180,1920 L-100,1920 Z" fill="${C.dune}" ${stroke(5, C.duneL)}/>`;
  s += `<rect x="-10" y="1460" width="1100" height="500" fill="${C.sandCut}"/><line x1="-10" y1="1460" x2="1090" y2="1460" ${stroke(7)}/>`;
  for (let k = 0; k < 5; k++) {
    const x = 120 + k * 210;
    let d = `M${x},1440`;
    for (let j = 1; j <= 6; j++) d += ` q${j % 2 ? 16 : -16},-16 0,-32`;
    s += `<path d="${d}" fill="none" ${stroke(5, '#E8A03A')} opacity="0.7"/>`;
  }
  s += G('translate(540 1460) scale(1.45)', 1, saguaro(t, { water: 1, level: 0.55, face: 'hot' }));
  s += `<ellipse cx="540" cy="1260" rx="150" ry="230" fill="none" stroke="${C.accent}" stroke-width="13" transform="rotate(-3 540 1260)"/>`;
  s += cicak(880, 1150, 0.62, 'shock', t, -14);
  return { world: s, ui: titleText('HIDUP\n*TANPA AIR*?', 540, 330, 176, 980, 26) };
}
