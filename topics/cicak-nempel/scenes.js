// Topic: Kok cicak bisa nempel di langit-langit? (paper style: one ceiling seen from below, moving camera)
// The x-ray lens zooms into a toe step by step: toe pad -> one hair -> hair tips against the ceiling's molecules.
Object.assign(C, {
  plaster: '#F7F2E7', seam: '#DDD2BF', beam: '#D9B98C', beamD: '#B8946A', bulb: '#FFF1B8', fitting: '#EDEAE3',
  pad: '#BFDD95', padD: '#6E9E46', hair: '#5E8E3A', glue: '#F2F0EA', rubber: '#E0522F', coin: '#D7D9DC',
  sack: '#E6CFA0', sackD: '#B99A62', mol: '#DDD2BF', molP: '#9CCB6B',
});

const A = { x: -260, y: 210 }, B = { x: -40, y: 40 }, HEAD = 52, GS = 0.7;
const FOOT = { x: B.x + 132 * GS + 4, y: B.y - 100 * GS - 6 };
const LENS = { x: 540, y: 900, r: 300 };

let K = {};
const ICON = {
  bulb: () => `<circle cx="0" cy="-4" r="16" fill="${C.bulb}" ${stroke(4)}/><rect x="-8" y="10" width="16" height="10" rx="2" fill="${C.fitting}" ${stroke(3)}/>`,
  glue: () => `<rect x="-12" y="-10" width="24" height="30" rx="6" fill="#fff" ${stroke(4)}/><path d="M-5,-10 L0,-24 L5,-10 Z" fill="${C.accent}" ${stroke(3)}/>`,
  lens: () => `<circle cx="-4" cy="-4" r="15" fill="#fff" ${stroke(4)}/><path d="M7,7 L18,18" ${stroke(6)}/><path d="M-10,0 l3,-8 M-3,0 l3,-8 M4,0 l3,-8" ${stroke(2.5, C.hair)}/>`,
  coin: () => `<circle r="18" fill="${C.coin}" ${stroke(4)}/><text x="0" y="1" font-family="${FONT}" font-weight="900" font-size="12" text-anchor="middle" dominant-baseline="central" fill="${C.ink}">20kg</text>`,
};

function setup(D) {
  const s = D.scenes;
  K = {
    terbalik: s[0].at('terbalik'), s2: s[1].start, kok: s[1].at('Kok'), berlem: s[1].at('berlem'), isap: s[1].at('mengisap'),
    pompa: s[1].at('pompa'), s2e: s[1].end,
    s3: s[2].start, mitos: s[2].at('mitos'), s3e: s[2].end,
    s4: s[3].start, kelenjar: s[3].at('kelenjar'), nempel: s[3].at('nempel'), s4e: s[3].end,
    s5: s[4].start, jari: s[4].at('jari'), dua: s[4].at('dua'), s5e: s[4].end,
    s6: s[5].start, ratusan: s[5].at('ratusan'), s6e: s[5].end,
    s7: s[6].start, molekul: s[6].at('molekul'), tarik: s[6].at('tarik'), namanya: s[6].at('Namanya'), s7e: s[6].end,
    s8: s[7].start, sejuta: s[7].at('Sejuta'), koin: s[7].at('koin'), kg: s[7].at('20'), anak: s[7].at('Seberat'), s8e: s[7].end,
    s9: s[8].start, jalan: s[8].at('jalan'), gulung: s[8].at('gulung'), lepas: s[8].at('lepas'), s9e: s[8].end,
    s10: s[9].start, jutaan: s[9].at('jutaan'), malam: s[9].at('Malam'), loop: D.total - 1.5, total: D.total,
  };
  const start = { x: 20, y: 20, z: 0.9 };
  setCamera([
    start,
    { at: 0.2, dur: K.s2 - 0.2, x: -20, y: 10, z: 1.05 },
    { at: K.s2, dur: 0.9, x: B.x, y: -10, z: 1.75 },
    { at: K.s4, dur: 0.8, x: B.x, y: 120, z: 1.35 },
    { at: K.s5, dur: 1.0, x: FOOT.x, y: FOOT.y, z: 3.4 },
    { at: K.s8, dur: 1.0, x: B.x, y: 110, z: 1.3 },
    { at: K.lepas, dur: 1.4, x: 60, y: -20, z: 1.15 },
    { at: K.s10, dur: 1.0, x: -40, y: 20, z: 1.1 },
    { at: K.loop, dur: 1.3, ...start },
  ]);
  setHeadlines([
    { at: K.terbalik, end: K.s2 - 0.1, text: 'JALAN\n*TERBALIK*' },
    { at: K.kok, end: K.berlem - 0.15, text: 'KOK NGGAK\n*JATUH*?' },
    { at: K.berlem, end: K.isap - 0.15, text: 'KAKINYA\n*BERLEM*?' },
    { at: K.isap, end: K.s2e - 0.1, text: 'ATAU\n*MENGISAP*?' },
    { at: K.kelenjar, end: K.s4e - 0.1, text: 'BUKAN *LEM*,\nBUKAN *POMPA*' },
    { at: K.dua, end: K.s5e - 0.1, text: '*2 JUTA* BULU' },
    { at: K.ratusan, end: K.s6e - 0.1, text: '*RATUSAN*\nBANTALAN' },
    { at: K.tarik, end: K.namanya - 0.1, text: 'SALING\n*TARIK-MENARIK*' },
    { at: K.namanya, end: K.s7e - 0.1, text: 'GAYA\n*VAN DER WAALS*' },
    { at: K.kg, end: K.s8e - 0.1, text: '*20 KG*\nSELUAS KOIN' },
    { at: K.gulung, end: K.s9e - 0.1, text: '*GULUNG*,\nLEPAS!' },
    { at: K.jutaan, end: K.malam - 0.1, text: 'JUTAAN\nBULU *MINI*' },
    { at: K.malam, end: K.loop, text: 'INTIP CICAK\nDI *RUMAHMU*' },
  ]);
  setChapters([
    { at: 0.3, icon: ICON.bulb }, { at: K.s2, icon: ICON.glue }, { at: K.s5, icon: ICON.lens }, { at: K.s8, icon: ICON.coin },
  ], { at: K.jutaan, end: K.malam });
}

function cues(D) {
  return [
    [0.3, 'tick'], [0.55, 'tick'], [K.terbalik, 'pop'],
    [K.s2, 'whoosh'], [K.kok, 'pop'], [K.berlem, 'pop'], [K.pompa, 'pop'],
    [K.s3, 'whoosh'], [K.mitos, 'thud'],
    [K.s4, 'whoosh'], [K.kelenjar, 'pop'], [K.kelenjar + 0.35, 'click'], [K.nempel, 'pop'], [K.nempel + 0.35, 'ding'],
    [K.s5, 'whoosh'], [K.jari, 'pop'], [K.dua, 'tick'], [K.dua + 0.2, 'tick'], [K.dua + 0.4, 'tick'], [K.dua + 0.65, 'ding'],
    [K.s6 - 0.1, 'whoosh'], [K.ratusan, 'sparkle'],
    [K.s7 - 0.1, 'whoosh'], [K.tarik, 'tick'], [K.tarik + 0.3, 'tick'], [K.namanya + 0.6, 'ding'],
    [K.s8, 'whoosh'], [K.koin, 'pop'], [K.kg, 'thud'], [K.kg + 0.2, 'pop'], [K.anak, 'pop'],
    [K.s9, 'whoosh'], [K.gulung, 'pop'], [K.lepas, 'pop'], [K.lepas + 0.1, 'click'],
    [K.s10, 'whoosh'], ...[0, 1, 2, 3, 4, 5].map(i => [K.jutaan + i * 0.12, 'pop']), [K.jutaan + 0.85, 'ding'],
    [K.malam, 'pop'], [K.loop, 'whoosh'],
  ];
}

// ---------- the ceiling ----------
function ceiling(t) {
  let s = `<defs><radialGradient id="bulbGlow"><stop offset="0" stop-color="#FFE9A0" stop-opacity="0.85"/><stop offset="1" stop-color="#FFE9A0" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect x="-2000" y="-2000" width="4000" height="4000" fill="${C.plaster}"/>`;
  for (let k = -6; k <= 6; k++) {
    s += `<line x1="${k * 380 - 60}" y1="-2000" x2="${k * 380 - 60}" y2="2000" ${stroke(5, C.seam)}/>`;
    s += `<line x1="-2000" y1="${k * 380 + 30}" x2="2000" y2="${k * 380 + 30}" ${stroke(5, C.seam)}/>`;
  }
  // a wooden batten across the ceiling
  s += `<rect x="-2000" y="-560" width="4000" height="70" fill="${C.beam}" ${stroke(6)}/>`;
  for (let k = -10; k <= 10; k++) s += `<path d="M${k * 190},-545 q60,10 120,0" fill="none" ${stroke(3, C.beamD)}/>`;
  // a few stains
  [[520, 380, 46], [-760, -180, 30], [180, 640, 22]].forEach(([x, y, r]) => s += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.7}" fill="${C.seam}" opacity="0.5"/>`);
  // the lamp seen from below, with flying termites (laron) around it
  const L = { x: 380, y: -220 };
  s += `<circle cx="${L.x}" cy="${L.y}" r="260" fill="url(#bulbGlow)"/>`;
  s += `<circle cx="${L.x}" cy="${L.y}" r="92" fill="${C.fitting}" ${stroke()}/><circle cx="${L.x}" cy="${L.y}" r="66" fill="${C.bulb}" ${stroke(6)}/>`;
  s += `<path d="M${L.x - 22},${L.y - 10} q22,-26 44,0" fill="none" ${stroke(4, '#E8C55A')}/><circle cx="${L.x - 24}" cy="${L.y - 26}" r="10" fill="#fff" opacity="0.8"/>`;
  for (let i = 0; i < 6; i++) {
    const a = t * (1.2 + rnd(i) * 0.8) + i * 1.05, r = 130 + 40 * Math.sin(t * 1.7 + i);
    const x = L.x + r * Math.cos(a), y = L.y + r * 0.8 * Math.sin(a), flap = 0.4 + 0.6 * Math.abs(Math.sin(t * 30 + i));
    s += G(T(x, y, 0.9, a * 57 + 90), 1, `<ellipse cx="-9" cy="0" rx="12" ry="${f(5 * flap)}" fill="#fff" opacity="0.8" ${stroke(2)}/>` +
      `<ellipse cx="9" cy="0" rx="12" ry="${f(5 * flap)}" fill="#fff" opacity="0.8" ${stroke(2)}/><ellipse rx="3.5" ry="9" fill="#8A6A44" ${stroke(2)}/>`);
  }
  return s;
}

// where Si Cicak is, which way it faces and what it does
function geckoState(t) {
  const dir = [Math.sin(HEAD * Math.PI / 180), -Math.cos(HEAD * Math.PI / 180)];
  const arrive = K.kok - 0.2;
  if (t < arrive) {
    const u = t / arrive;
    return { x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u), rot: HEAD, walk: t * 11, pose: 'calm' };
  }
  if (t > K.loop) {  // walks back in from below-left for the loop
    const u = clamp((t - K.loop) / (K.total - K.loop));
    return { x: A.x - dir[0] * 560 * (1 - u), y: A.y - dir[1] * 560 * (1 - u), rot: HEAD, walk: (t - K.total) * 11, pose: 'calm' };
  }
  if (t > K.lepas + 0.4) {  // walks off after showing how it lets go
    const u = (t - K.lepas - 0.4) / 2.4;
    if (u > 1) return null;
    return { x: B.x + dir[0] * 900 * u, y: B.y + dir[1] * 900 * u, rot: HEAD * P(t, K.lepas + 0.4, 0.3), walk: t * 11, pose: 'calm' };
  }
  const rot = HEAD * (1 - P(t, arrive, 0.5, E.inOutCubic));
  let pose = 'calm', face = null;
  if (t >= K.kok && t < K.s3) { pose = 'think'; face = 'confused'; }
  else if (t >= K.s3 && t < K.s4) { pose = 'verdict'; face = t > K.mitos ? 'smug' : 'skeptical'; }
  else if (t >= K.s8 && t < K.s9) { pose = 'cheer'; face = 'wow'; }
  return { x: B.x, y: B.y, rot, walk: null, pose, face };
}

function drawWorld(t) {
  let s = ceiling(t);
  const g = geckoState(t);
  if (g) s += shadow(g.x, g.y + 20, 120, 0.1) + cicak(g.x, g.y, GS, g.pose, t, g.rot, g.walk, g.face);
  return s;
}

// ---------- the lens: three zoom levels ----------
function toePad(t) {  // underside of a toe: bands (lamellae) fringed with tiny hairs
  let s = `<path d="M380,1240 C360,980 380,700 470,610 C510,570 570,570 610,610 C700,700 720,980 700,1240 Z" fill="${C.pad}" ${stroke(8)}/>`;
  for (let b = 0; b < 7; b++) {
    const y = 680 + b * 78, w = 120 + Math.min(b, 3) * 40;
    s += `<path d="M${540 - w},${y + 26} Q540,${y - 22} ${540 + w},${y + 26}" fill="none" ${stroke(5, C.padD)}/>`;
    for (let k = 0; k < 34; k++) {
      const u = k / 33, x = 540 - w + 2 * w * u, yy = y + 26 - 48 * u * (1 - u) * 2 + 8;
      const sway = 3 * Math.sin(t * 4 + k * 0.7 + b);
      s += `<line x1="${f(x)}" y1="${f(yy)}" x2="${f(x + sway)}" y2="${f(yy + 26)}" stroke="${C.hair}" stroke-width="3" stroke-linecap="round"/>`;
    }
  }
  return s;
}

function ceilingBand(y, t, mols = false) {  // the ceiling's surface, at the top of the lens
  let s = `<rect x="200" y="500" width="680" height="${y - 500}" fill="${C.plaster}"/>`;
  if (mols) for (let k = 0; k < 15; k++) for (let r = 0; r < 2; r++) {
    const x = 262 + k * 40 + r * 20, cy = y - 22 - r * 36;
    s += `<circle cx="${x}" cy="${f(cy + 1.5 * Math.sin(t * 9 + k + r))}" r="17" fill="${C.mol}" ${stroke(3)}/>`;
  }
  else for (let k = 0; k < 12; k++) s += `<line x1="${200 + k * 60}" y1="${y - 40}" x2="${240 + k * 60}" y2="${y}" ${stroke(3, C.seam)}/>`;
  return s + `<line x1="200" y1="${y}" x2="880" y2="${y}" ${stroke(6)}/>`;
}

function oneHair(t) {  // a single hair branching into hundreds of tiny pads that press on the ceiling
  let s = ceilingBand(640, t);
  for (let k = 0; k < 5; k++) if (k !== 2) {  // neighbours, faint
    const x = 300 + k * 120;
    s += `<path d="M${x},1240 C${x - 10},1000 ${x + 20},820 ${x},700" fill="none" stroke="${C.padD}" stroke-width="16" stroke-linecap="round" opacity="0.25"/>`;
  }
  const pop1 = P(t, K.ratusan - 0.3, 0.8);
  s += limb('M540,1240 C530,1100 556,960 540,880', 34, C.pad);
  const tips = [];
  const branch = (x, y, a, len, d) => {
    const x2 = x + len * Math.sin(a), y2 = y - len * Math.cos(a);
    s += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${C.padD}" stroke-width="${f(Math.max(2, 10 - d * 3))}" stroke-linecap="round"/>`;
    if (d === 3) { tips.push([x2, y2, a]); return; }
    [-0.55, 0, 0.55].forEach((da, i) => branch(x2, y2, a * 0.5 + da * (1 - d * 0.18) + (rnd(d * 10 + i + x) - 0.5) * 0.2, len * 0.62, d + 1));
  };
  branch(540, 880, 0, 120, 0);
  tips.forEach(([x, y, a], i) => {
    const o = clamp(pop1 * tips.length - i * 0.6);
    s += G(T(x, Math.min(y, 652), 1, a * 30), o, `<path d="M-11,-8 L11,-8 L5,4 L-5,4 Z" fill="${C.molP}" ${stroke(2.5)}/>`);
  });
  return s;
}

function molecules(t) {  // hair tips pressed against the ceiling: molecules pull on each other
  let s = ceilingBand(720, t, true);
  const pull = P(t, K.tarik - 0.4, 0.6);
  [[330, -0.15], [540, 0], [750, 0.15]].forEach(([x, a], i) => {
    s += limb(`M${x},1240 C${x + 10},1060 ${x - 10},930 ${x},${f(790 - 6 * pull)}`, 34, C.pad);
    s += `<path d="M${x - 100},${f(752 - 6 * pull)} L${x + 100},${f(752 - 6 * pull)} L${x + 40},800 L${x - 40},800 Z" fill="${C.pad}" ${stroke(6)}/>`;
    for (let k = 0; k < 5; k++) {
      const mx = x - 80 + k * 40, my = 742 - 6 * pull, wy = 698;
      // fleeting charges: the weak, short-lived attraction between neighbouring molecules
      const ph = Math.sin(t * 7 + k * 1.9 + i * 2.3);
      s += `<line x1="${mx}" y1="${f(my - 12)}" x2="${mx}" y2="${wy + 14}" stroke="${C.accent}" stroke-width="4" stroke-dasharray="6 6" stroke-dashoffset="${f(-t * 40)}" opacity="${f(pull * (0.55 + 0.45 * ph))}"/>`;
      s += `<circle cx="${mx}" cy="${f(my)}" r="15" fill="${C.molP}" ${stroke(3)}/>`;
      if (pull > 0.5) s += txt(ph > 0 ? '+' : '−', mx, my + 1, 18, C.ink, 900) + txt(ph > 0 ? '−' : '+', mx, wy - 22 + 1, 16, C.muted, 900);
    }
  });
  return s;
}

function lensInside(t) {
  // each level grows out of the previous one, like turning the microscope's zoom
  const ab = P(t, K.s6 - 0.15, 0.6, E.inOutCubic), bc = P(t, K.s7 - 0.15, 0.6, E.inOutCubic);
  const zoom = (k, inner) => `<g transform="translate(540 900) scale(${f(k)}) translate(-540 -900)">${inner}</g>`;
  let s = '';
  if (ab < 1) s += G('', 1 - ab, zoom(1 + 2 * ab, toePad(t)));
  if (ab > 0 && bc < 1) s += G('', ab * (1 - bc), zoom((0.4 + 0.6 * ab) * (1 + 2 * bc), oneHair(t)));
  if (bc > 0) s += G('', bc, zoom(0.4 + 0.6 * bc, molecules(t)));
  return s;
}

// ---------- overlay pieces ----------
function glueBottle(x, y, s) {
  return G(T(x, y, s), 1, `<rect x="-42" y="-30" width="84" height="110" rx="20" fill="${C.glue}" ${stroke(6)}/>` +
    `<path d="M-20,-30 L0,-84 L20,-30 Z" fill="${C.accent}" ${stroke(6)}/><rect x="-42" y="6" width="84" height="40" fill="${C.yellow}" ${stroke(5)}/>` +
    txt('LEM', 0, 27, 26, C.ink, 900));
}
function suctionCup(x, y, s) {
  return G(T(x, y, s), 1, `<rect x="-12" y="-90" width="24" height="70" rx="10" fill="#8A6A44" ${stroke(6)}/>` +
    `<path d="M-70,40 C-60,-20 -30,-30 0,-30 C30,-30 60,-20 70,40 Z" fill="${C.rubber}" ${stroke(6)}/><path d="M-40,8 Q0,-12 40,8" fill="none" ${stroke(4, '#fff')} opacity="0.6"/>`);
}
function bubble(x, y, tx, ty, inner, p) {  // thought bubble with trailing dots towards (tx, ty)
  if (p.o <= 0) return '';
  let s = '';
  [0.25, 0.5].forEach((u, i) => s += `<circle cx="${f(lerp(tx, x, u))}" cy="${f(lerp(ty, y, u))}" r="${10 + i * 6}" fill="#fff" ${stroke(5)}/>`);
  return G('', p.o, s + G(T(x, y, p.s), 1, `<circle r="118" fill="#fff" ${stroke(6)}/>` + inner));
}
const cross = (x, y, p, r = 90, w = 22) => p <= 0 ? '' : `<path d="M${x - r},${y - r} L${f(x - r + 2 * r * clamp(p * 2))},${f(y - r + 2 * r * clamp(p * 2))}" ${stroke(w, C.accent)}/>` +
  (p > 0.5 ? `<path d="M${x + r},${y - r} L${f(x + r - 2 * r * clamp(p * 2 - 1))},${f(y - r + 2 * r * clamp(p * 2 - 1))}" ${stroke(w, C.accent)}/>` : '');
const tick = (x, y, p, col = C.leaf) => p <= 0 ? '' : `<path d="M${x - 26},${y} L${f(x - 26 + 18 * clamp(p * 2))},${f(y + 18 * clamp(p * 2))}${p > 0.5 ? ` L${f(x - 8 + 40 * clamp(p * 2 - 1))},${f(y + 18 - 46 * clamp(p * 2 - 1))}` : ''}" fill="none" ${stroke(12, col)}/>`;

function proofCard(t) {  // no glue glands; still sticks in a vacuum
  let s = '';
  const r1 = pop(t, K.kelenjar, 0.4), r2 = pop(t, K.nempel, 0.4);
  if (r1.o > 0) s += G('', r1.o, glueBottle(120, 160, 0.85) + cross(120, 150, P(t, K.kelenjar + 0.3, 0.4), 70, 14) +
    txt('Kelenjar lem', 230, 128, 54, C.ink, 900, 'start') + txt('nggak ada', 230, 190, 46, C.accent, 900, 'start'));
  if (r2.o > 0) {
    // a bell jar with the air pumped out, a gecko still hanging under its lid
    const jar = `<path d="M-70,70 L-70,-30 C-70,-90 70,-90 70,-30 L70,70 Z" fill="#EAF3F8" ${stroke(6)}/><rect x="-86" y="66" width="172" height="20" rx="6" fill="${C.beamD}" ${stroke(5)}/>` +
      cicak(0, -30, 0.2, 'calm', t, 180) + `<path d="M84,-40 h40 M104,-60 v40" ${stroke(5, C.cool)}/>`;
    s += G('', r2.o, G(T(120, 350), 1, jar) + txt('Di ruang hampa', 230, 318, 54, C.ink, 900, 'start') +
      txt('tetap nempel', 230, 380, 46, C.leaf, 900, 'start') + tick(580, 376, P(t, K.nempel + 0.3, 0.4)));
  }
  return s;
}

function coinCard(t) {  // side view: a coin-sized patch of a million hairs holds 20 kg
  let s = `<rect x="30" y="70" width="700" height="60" fill="${C.plaster}" ${stroke(5)}/>`;
  for (let k = 0; k < 14; k++) s += `<line x1="${40 + k * 50}" y1="76" x2="${70 + k * 50}" y2="124" ${stroke(3, C.seam)}/>`;
  // the patch: a strip as wide as a coin, fringed with hairs
  s += `<rect x="300" y="130" width="160" height="34" rx="10" fill="${C.pad}" ${stroke(5)}/>`;
  for (let k = 0; k < 16; k++) s += `<line x1="${306 + k * 10}" y1="130" x2="${306 + k * 10}" y2="122" stroke="${C.hair}" stroke-width="3"/>`;
  const cp = pop(t, K.koin, 0.45);
  s += G(T(140, 260, cp.s), cp.o, `<circle r="70" fill="${C.coin}" ${stroke(6)}/><circle r="54" fill="none" ${stroke(3, '#A9ADB3')}/>` +
    txt('1000', 0, 2, 34, '#6B7078', 900)) + G('', cp.o, `<path d="M215,250 L295,180" fill="none" ${stroke(4, C.muted)} stroke-dasharray="8 8"/>` +
    hand('seluas koin', 140, 360, 40, C.muted));
  // the load drops in and swings a little
  const d = E.outBack(P(t, K.kg - 0.15, 0.45)), sw = 4 * Math.sin((t - K.kg) * 3) * Math.exp(-(t - K.kg) * 0.8) * (t > K.kg ? 1 : 0);
  if (t > K.kg - 0.15) {
    s += G(`rotate(${f(sw)} 380 164)`, 1, `<line x1="380" y1="164" x2="380" y2="${f(164 + 150 * d)}" ${stroke(6, '#8A6A44')}/>` +
      G(T(380, 164 + 150 * d + 100), 1, `<path d="M-110,90 C-130,20 -100,-60 -40,-80 L-20,-96 L20,-96 L40,-80 C100,-60 130,20 110,90 Z" fill="${C.sack}" ${stroke(6)}/>` +
        `<path d="M-30,-86 Q0,-70 30,-86" fill="none" ${stroke(5, C.sackD)}/>` + headText('20 kg', 0, 18, 64, C.ink)));
  }
  if (t > K.anak) s += G('', P(t, K.anak, 0.3), hand('≈ seberat', 600, 330, 46, C.accent) + hand('anak kecil', 600, 380, 46, C.accent));
  return s;
}
const headText = (s, x, y, size, fill) =>
  `<text x="${f(x)}" y="${f(y)}" font-family="${HEAD_FONT}" font-size="${size}" fill="${fill}" text-anchor="middle" dominant-baseline="central">${esc(s)}</text>`;

function peelCard(t) {  // side view: the toe peels off from its tip, at about 30 degrees
  let s = `<rect x="30" y="70" width="700" height="60" fill="${C.plaster}" ${stroke(5)}/>`;
  for (let k = 0; k < 14; k++) s += `<line x1="${40 + k * 50}" y1="76" x2="${70 + k * 50}" y2="124" ${stroke(3, C.seam)}/>`;
  const peel = P(t, K.gulung, 1.2, E.inOutCubic) * (1 - P(t, K.s9e - 0.3, 0.3));
  let x = 120, y = 152, a = 0;
  s += `<path d="M40,230 Q90,230 120,170" fill="none" stroke="${C.pad}" stroke-width="40" stroke-linecap="round"/>`;
  for (let i = 0; i < 7; i++) {
    a += peel * (i < 2 ? 0 : 0.1);  // the tip bends away first, the base stays on
    const x2 = x + 70 * Math.cos(a), y2 = y + 70 * Math.sin(a);
    s += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a * 57.3)})"><rect x="0" y="-20" width="72" height="40" rx="16" fill="${C.pad}" ${stroke(5)}/>` +
      [12, 30, 48].map(h => `<line x1="${h}" y1="-20" x2="${h}" y2="${a > 0.05 ? -26 : -22}" stroke="${C.hair}" stroke-width="3"/>`).join('') + `</g>`;
    x = x2; y = y2;
  }
  if (peel > 0.3) {
    const o = clamp((peel - 0.3) * 3);
    s += G('', o, `<path d="M260,152 L560,152" ${stroke(3, C.muted)} stroke-dasharray="10 8"/>` +
      `<path d="M500,152 A240,240 0 0 1 488,${f(152 + 240 * Math.sin(0.52 * peel))}" fill="none" ${stroke(5, C.accent)}/>` +
      hand('±30°', 560, 230, 52, C.accent));
  }
  s += hand('ujung jari dulu', 380, 330, 42, C.muted);
  return s;
}

function drawOverlay(t) {
  let s = '';
  // the two guesses, as thought bubbles over Si Cicak's head
  if (t > K.berlem - 0.1 && t < K.s3e + 0.2) {
    const out = P(t, K.s3e - 0.3, 0.3, E.inCubic);
    s += G('', 1 - out, bubble(270, 660, 470, 820, glueBottle(0, 10, 0.9), pop(t, K.berlem, 0.45)) +
      bubble(810, 660, 610, 820, suctionCup(0, 20, 0.9), pop(t, K.pompa, 0.45)) +
      cross(270, 660, P(t, K.mitos + 0.1, 0.35)) + cross(810, 660, P(t, K.mitos + 0.3, 0.35)));
  }
  if (t > K.mitos - 0.2 && t < K.s3e + 0.1) s += G('', 1 - P(t, K.s3e - 0.25, 0.25), stamp('MITOS!', t, K.mitos, 540, 1180));

  s += card(t, K.s4 + 0.1, 540, 1010, 820, 470, proofCard(t), { title: 'Bukti', tOut: K.s4e - 0.3 });
  s += cite('Sumber: Scientific American; UC Berkeley (2000)', t, K.kelenjar, K.s4e - 0.3);

  // the lens over the toe, zooming in level by level
  if (t > K.jari - 0.2 && t < K.s8 + 0.5) {
    s += spotlight(t, K.jari, K.s8, LENS.x, LENS.y, LENS.r + 30, 0.35);
    s += xray(t, K.jari, LENS.x, LENS.y, LENS.r, lensInside(t), { t1: K.s8 - 0.2, id: 'toeLens' });
    const label = t < K.s6 ? 'JARI TOKEK' : t < K.s7 ? 'SATU BULU' : 'UJUNG BULU';
    const lp = pop(t, t < K.s6 ? K.jari + 0.3 : t < K.s7 ? K.s6 : K.s7, 0.4), lo = 1 - P(t, K.s8 - 0.3, 0.2);
    s += pill(label, 830, 640, 28, C.ink, '#fff', lp.s, lp.o * lo);
  }
  s += card(t, K.dua - 0.1, 540, 1300, 560, 130,
    mono(scramble('2.000.000', t, K.dua - 0.1, 0.8), 40, 68, 58, C.ink) + bodyText('bulu', 58 + monoWidth('2.000.000', 58), 68, 46, C.muted, 'start', 900), { tOut: K.s5e - 0.2 });
  s += cite('Sumber: UC Berkeley (2000), studi pada tokek', t, K.dua + 0.6, K.s6e - 0.2);
  s += cite('Sumber: Autumn dkk., Nature (2000) & PNAS (2002)', t, K.molekul, K.s7e - 0.2);

  s += card(t, K.s8 + 0.2, 540, 1030, 760, 560, coinCard(t), { title: 'Sejuta bulu', tOut: K.s8e - 0.3 });
  s += sticker('KUAT!', t, K.kg + 0.25, 830, 1180, { rot: 10, size: 100, dur: 0.9 });
  s += cite('Sumber: UC Berkeley (2000)', t, K.koin, K.s8e - 0.3);

  s += card(t, K.s9 + 0.2, 540, 1000, 760, 400, peelCard(t), { title: 'Cara lepas', tOut: K.s9e - 0.3 });
  s += sticker('PLOP!', t, K.lepas, 740, 1290, { rot: -10, size: 100, dur: 0.8, col: C.accent });
  s += cite('Sumber: UC Berkeley (2000)', t, K.gulung, K.s9e - 0.3);

  // Si Cicak waves goodbye, then slides away for the loop
  if (t > K.jutaan - 0.3) {
    const p = pop(t, K.jutaan - 0.3, 0.5), out = P(t, K.loop, 0.6, E.inCubic);
    s += G(T(0, 900 * out), 1, cicak(250, 1180, 0.55 * p.s, 'happy', t, 12, null, t > K.malam ? 'wink' : 'laugh'));
  }
  return s;
}

function drawThumbnail() {
  const t = 1.3;
  let s = `<rect x="0" y="0" width="1080" height="1920" fill="${C.plaster}"/>`;
  for (let k = 0; k < 24; k += 2) {
    const a0 = k / 24 * Math.PI * 2, a1 = a0 + Math.PI / 24 * 2;
    s += `<path d="M540,1060 L${f(540 + 1600 * Math.cos(a0))},${f(1060 + 1600 * Math.sin(a0))} L${f(540 + 1600 * Math.cos(a1))},${f(1060 + 1600 * Math.sin(a1))} Z" fill="#F5C95A" opacity="0.4"/>`;
  }
  s += `<rect x="-20" y="640" width="1120" height="70" fill="${C.beam}" ${stroke(6)}/>`;
  // Si Cicak, big and cool, hanging on the ceiling; the mystery is its toes
  s += cicak(500, 1110, 1.5, 'calm', t, 0, null, 'cool');
  const fx = 500 + 132 * 1.5, fy = 1110 - 100 * 1.5;
  s += `<circle cx="${fx + 16}" cy="${fy - 22}" r="82" fill="none" stroke="${C.accent}" stroke-width="12"/>`;
  s += `<path d="M${fx + 40},${fy + 60} L700,1200" ${stroke(8, C.accent)}/>`;
  s += `<circle cx="740" cy="1330" r="186" fill="#fff" ${stroke(12)}/>`;
  s += `<defs><clipPath id="thumbLens"><circle cx="740" cy="1330" r="170"/></clipPath></defs>` +
    `<g clip-path="url(#thumbLens)"><g transform="translate(740 1330) scale(0.62) translate(-540 -900)">${toePad(t)}</g></g>`;
  s += `<circle cx="740" cy="1330" r="176" fill="none" ${stroke(14)}/>`;
  return { world: s, ui: titleText('KOK NGGAK\n*JATUH*?', 540, 400, 176, 980, 26) };
}
