// Topic: Manfaat puasa bagi tubuh (paper style: dining table + body fuel switchboard + cell x-ray lens)
Object.assign(C, {
  wall: '#F4E9D4', tileLine: '#E5D5B5', wood: '#C99B6D', woodD: '#A67B4E',
  panel: '#FBF7EE', panelRim: '#D8CEBE', tankGlass: '#EAF4F8',
  glucose: '#4FA3E3', glucoseHi: '#85C5F2', liver: '#C85A48',
  fat: '#F29F38', fatHi: '#FBD160', ketone: '#F5B83D',
  cellBg: '#FFF8EB', cellMem: '#E8C58E', nuc: '#7C6CC9', broken: '#8E857B', fresh: '#5FA548',
  vesicle: '#54A898', gold: '#F2B830', goldD: '#C48B18', water: '#58AEE8',
});

const BOARD = { x: 40, y: 135 }, CLOCK = { x: 265, y: -285 }, LENS = { x: 540, y: 825, r: 255 };
let K = {};

const ICON = {
  batt: () => `<rect x="-20" y="-12" width="36" height="24" rx="5" fill="${C.yellow}" ${stroke(4)}/><rect x="16" y="-6" width="6" height="12" rx="2" fill="${C.ink}"/><path d="M-4,-8 L-10,2 H-1 L-5,10 L7,-2 H-2 Z" fill="${C.ink}"/>`,
  switch: () => `<rect x="-22" y="-12" width="44" height="24" rx="12" fill="${C.fat}" ${stroke(4)}/><circle cx="10" cy="0" r="9" fill="#fff" ${stroke(3)}/>`,
  insulin: () => `<path d="M-18,-14 L-4,2 L6,-4 L18,14" fill="none" ${stroke(5, C.cool)}/><path d="M10,14 H18 V6" fill="none" ${stroke(4, C.cool)}/>`,
  recycle: () => `<circle r="18" fill="none" ${stroke(4, C.leaf)} stroke-dasharray="22 14"/><path d="M12,-16 l8,2 l-3,8 M-12,16 l-8,-2 l3,-8" fill="none" ${stroke(3.5, C.leaf)}/>`,
  water: () => `<path d="M0,-22 C12,-6 18,4 18,11 A18,18 0 0 1 -18,11 C-18,4 -12,-6 0,-22 Z" fill="${C.water}" ${stroke(4)}/>`,
};

const headText = (s, x, y, size, fill, extra = '') =>
  `<text x="${f(x)}" y="${f(y)}" font-family="${HEAD_FONT}" font-size="${f(size)}" fill="${fill}" text-anchor="middle" dominant-baseline="central" ${extra}>${esc(s)}</text>`;

function setup(D) {
  const s = D.scenes;
  K = {
    habis0: s[0].at('kehabisan'), masa: s[0].at('Masa'), s1e: s[0].end,
    s2: s[1].start, seharian: s[1].at('seharian'), mogok: s[1].at('mogok'), s2e: s[1].end,
    s3: s[2].start, mitos: s[2].at('mitos'), tangki: s[2].at('tangki'), cadangan: s[2].at('cadangan'), s3e: s[2].end,
    s4: s[3].start, jam12: s[3].at('12'), gula: s[3].at('gula'), hati: s[3].at('hati'), s4e: s[3].end,
    s5: s[4].start, habis: s[4].at('habis'), saklar: s[4].at('saklar'), pindah: s[4].at('berpindah'),
    lemak: s[4].at('lemak'), energi: s[4].at('energi'), s5e: s[4].end,
    s6: s[5].start, insulin: s[5].at('insulin'), turun: s[5].at('turun'), dipakai: s[5].at('dipakai'), s6e: s[5].end,
    s7: s[6].start, sel: s[6].at('sel'), beres: s[6].at('beres'), rusak: s[6].at('rusak'), s7e: s[6].end,
    s8: s[7].start, autofagi: s[7].at('autofagi'), nobel: s[7].at('Nobel'), th2016: s[7].at('2016'), s8e: s[7].end,
    s9: s[8].start, makan: s[8].at('makan'), air: s[8].at('air'), lebih: s[8].at('berlebihan'), s9e: s[8].end,
    s10: s[9].start, ganti: s[9].at('ganti'), maag: s[9].at('maag'), dokter: s[9].at('dokter'),
    loop: D.total - 1.5, total: D.total,
  };
  const start = { x: -20, y: 20, z: 1.08 };
  setCamera([
    start,
    { at: K.s2, dur: 0.85, x: 20, y: -10, z: 1.25 },
    { at: K.s3, dur: 0.8, x: -40, y: 10, z: 1.15 },
    { at: K.s4, dur: 0.9, x: 90, y: -30, z: 1.32 },
    { at: K.s5, dur: 0.85, x: 50, y: 40, z: 1.55 },
    { at: K.s6, dur: 0.85, x: 30, y: 90, z: 1.25 },
    { at: K.s7, dur: 0.9, x: 40, y: 15, z: 1.2 },
    { at: K.s8, dur: 0.8, x: 40, y: 20, z: 1.25 },
    { at: K.s9, dur: 0.9, x: 0, y: 40, z: 1.2 },
    { at: K.s10, dur: 0.9, x: -40, y: 20, z: 1.12 },
    { at: K.loop, dur: 1.2, ...start },
  ]);
  setHeadlines([
    { at: -0.6, end: K.s2 - 0.1, text: 'PUASA BIKIN\n*LEMAS*?' },
    { at: K.mogok - 0.3, end: K.s3 - 0.1, text: 'BADAN LANGSUNG\n*MOGOK*?' },
    { at: K.tangki - 0.1, end: K.s3e - 0.1, text: 'PUNYA TANGKI\n*CADANGAN*!' },
    { at: K.jam12 - 0.1, end: K.s4e - 0.1, text: '*8–12 JAM*\nGULA HATI', hype: true },
    { at: K.pindah - 0.1, end: K.lemak - 0.1, text: 'SAKLAR\n*BERPINDAH*!' },
    { at: K.lemak, end: K.s5e - 0.1, text: 'BAKAR *LEMAK*\nJADI ENERGI!' },
    { at: K.insulin, end: K.s6e - 0.1, text: 'INSULIN *TURUN*,\nLEMAK TERBUKA' },
    { at: K.beres - 0.1, end: K.s7e - 0.1, text: 'SEL *BERES-BERES*\nSENDIRI!' },
    { at: K.autofagi - 0.1, end: K.s8e - 0.1, text: '*AUTOFAGI*\nNOBEL 2016', hype: true },
    { at: K.air - 0.1, end: K.s9e - 0.1, text: 'CUKUPI *AIR PUTIH*,\nJANGAN KALAP!' },
    { at: K.ganti - 0.1, end: K.maag - 0.1, text: 'PUASA = GANTI\n*BAHAN BAKAR*!' },
    { at: K.dokter - 0.3, end: D.outroAt - 0.15, text: 'TANYA *DOKTER*\nDULU, YA!' },
  ]);
  setChapters([
    { at: -0.5, icon: ICON.batt },
    { at: K.s4, icon: ICON.switch },
    { at: K.s6, icon: ICON.insulin },
    { at: K.s7, icon: ICON.recycle },
    { at: K.s9, icon: ICON.water },
    { at: K.loop, icon: ICON.batt },
  ], { at: K.s10, end: K.maag });
}

function cues(D) {
  const c = [
    [0.25, 'pop'], [K.masa, 'pop'],
    [K.s2, 'whoosh'], [K.mogok, 'pop'],
    [K.s3, 'whoosh'], [K.mitos, 'thud'], [K.tangki, 'pop'], [K.cadangan, 'ding'],
    [K.s4, 'whoosh'], [K.jam12, 'pop'], [K.hati, 'ding'],
    [K.s5, 'whoosh'], [K.pindah, 'click'], [K.pindah + 0.05, 'pop'], [K.lemak, 'zap'], [K.energi, 'sparkle'],
    [K.s6, 'whoosh'], [K.insulin, 'pop'], [K.dipakai, 'click'], [K.dipakai + 0.1, 'ding'],
    [K.s7, 'whoosh'], [K.beres, 'pop'], [K.rusak, 'tick'],
    [K.s8, 'whoosh'], [K.autofagi, 'sparkle'], [K.nobel, 'pop'], [K.th2016, 'ding'],
    [K.s9, 'whoosh'], [K.air, 'pop'], [K.lebih, 'thud'],
    [K.s10, 'whoosh'], ...[0, 1, 2, 3, 4].map(i => [K.s10 + i * 0.12, 'pop']), [K.s10 + 0.72, 'ding'],
    [K.dokter, 'pop'], [K.loop, 'whoosh'],
  ];
  for (let t = K.s4 + 0.3; t < K.s4 + 1.8; t += 0.18) c.push([t, 'tick']);
  return c;
}

// ---------- world background & props ----------
function room(t) {
  let s = `<rect x="-2000" y="-2000" width="4000" height="4000" fill="${C.wall}"/>`;
  for (let k = -12; k <= 12; k++) {
    s += `<line x1="${k * 160}" y1="-2000" x2="${k * 160}" y2="310" ${stroke(4, C.tileLine)}/>`;
    s += `<line x1="-2000" y1="${k * 160 + 30}" x2="2000" y2="${k * 160 + 30}" ${stroke(4, C.tileLine)}/>`;
  }
  s += woodPlank(-1300, 290, 2600, 74, { col: C.wood }) + `<rect x="-1300" y="364" width="2600" height="1200" fill="${C.woodD}"/>`;
  return s;
}

function fastingClock(t) {
  const x = CLOCK.x, y = CLOCK.y;
  // Fasting hours advance from 0 to 12 in scene 4, up to 14 in scene 5, and reset smoothly at loop
  const loopBack = 1 - P(t, K.loop, 1.1, E.inOutCubic);
  const hrs = (lerp(0, 12, P(t, K.s4, 1.8, E.inOutCubic)) + lerp(0, 2, P(t, K.s5, 1.2))) * loopBack;
  const ang = (hrs / 12) * 360 - 90;
  let s = shadow(x, y + 90, 80, 0.16);
  s += vol(circleD(x, y, 82), '#FFFFFF', { depth: 8, w: 6 });
  // Highlight arc showing elapsed fasting hours
  if (hrs > 0.2) {
    const a1 = Math.min(359, (hrs / 12) * 360) * Math.PI / 180;
    const ex = x + 64 * Math.sin(a1), ey = y - 64 * Math.cos(a1);
    const large = hrs >= 6 ? 1 : 0;
    s += `<path d="M${x},${y} L${x},${y - 64} A64,64 0 ${large} 1 ${f(ex)},${f(ey)} Z" fill="${hrs >= 12 ? C.fatHi : C.glucoseHi}" opacity="0.55"/>`;
  }
  for (let k = 0; k < 12; k++) {
    const a = k * 30 * Math.PI / 180;
    s += `<line x1="${f(x + 62 * Math.cos(a))}" y1="${f(y + 62 * Math.sin(a))}" x2="${f(x + 73 * Math.cos(a))}" y2="${f(y + 73 * Math.sin(a))}" ${stroke(k % 3 === 0 ? 4.5 : 3)}/>`;
  }
  const hx = x + 46 * Math.cos(ang * Math.PI / 180), hy = y + 46 * Math.sin(ang * Math.PI / 180);
  s += `<line x1="${x}" y1="${y}" x2="${f(hx)}" y2="${f(hy)}" ${stroke(6, C.accent)}/><circle cx="${x}" cy="${y}" r="8" fill="${C.ink}"/>`;
  s += pill(`${Math.round(hrs)} JAM PUASA`, x, y + 108, 20, hrs >= 12 ? C.accent : C.ink, '#fff');
  return s;
}

function fuelPanel(t) {
  const x = BOARD.x, y = BOARD.y;
  const loopBack = 1 - P(t, K.loop, 1.1, E.inOutCubic);
  // Glucose tank starts at 0.85, drains during scene 4 to 0.08, recovers at loop
  const glucLvl = lerp(0.85, 0.08, P(t, K.s4 + 0.1, 2.2, E.inOutCubic) * loopBack);
  // Switch flips from 0 (GULA) to 1 (LEMAK) at K.pindah
  const sw = P(t, K.pindah - 0.08, 0.38, E.outBack) * loopBack;
  const fatActive = P(t, K.lemak - 0.1, 0.5) * loopBack;

  let g = shadow(0, 175, 290, 0.18);
  // Main casing
  g += vol(rectD(-270, -270, 540, 440, 28), C.panel, { depth: 14, w: 7 });
  g += `<rect x="-246" y="-248" width="492" height="54" rx="14" fill="${C.ink}"/>`;
  // Top status bar: scrambles until scene 3, then shows BAHAN BAKAR TUBUH / ENERGI KETON
  const topLabel = t < K.s3 ? 'ENERGI: ' + scramble('??%', t, 1e9, 1, { rate: 10 })
    : fatActive > 0.5 ? 'MODE: BAKAR LEMAK (KETON)' : 'PANEL ENERGI TUBUH';
  g += mono(topLabel, 0, -220, 25, fatActive > 0.5 ? C.yellow : '#fff', { anchor: 'middle' });

  // Left Tank: TANGKI 1 — GULA HATI
  const tx1 = -155, ty = -50, tw = 140, th = 220;
  g += `<rect x="${tx1 - tw / 2}" y="${ty - th / 2}" width="${tw}" height="${th}" rx="18" fill="${C.tankGlass}" ${stroke(6)}/>`;
  const gh = Math.max(12, (th - 16) * glucLvl);
  g += `<rect x="${tx1 - tw / 2 + 8}" y="${f(ty + th / 2 - 8 - gh)}" width="${tw - 16}" height="${f(gh)}" rx="12" fill="${C.glucose}"/>`;
  g += `<ellipse cx="${tx1}" cy="${f(ty + th / 2 - 8 - gh)}" rx="${tw / 2 - 10}" ry="8" fill="${C.glucoseHi}"/>`;
  // Liver badge on Tank 1
  g += G(T(tx1, ty - th / 2 - 6), 1, `<path d="M-26,0 C-26,-18 -4,-20 8,-10 C22,-18 32,-6 24,8 C14,20 -26,18 -26,0 Z" fill="${C.liver}" ${stroke(4)}/>`);
  g += txt('GULA HATI', tx1, ty + th / 2 + 28, 22, C.ink, 900);
  g += txt(glucLvl < 0.15 ? 'HABIS!' : `${Math.round(glucLvl * 100)}%`, tx1, ty, 30, '#fff', 900, 'middle', `stroke="${C.ink}" stroke-width="6" paint-order="stroke"`);

  // Right Tank: TANGKI 2 — CADANGAN LEMAK
  const tx2 = 155;
  const fatPulse = (t > K.tangki && t < K.s4) ? 1 + 0.06 * Math.sin((t - K.tangki) * 14) : 1;
  let t2 = `<rect x="${-tw / 2}" y="${-th / 2}" width="${tw}" height="${th}" rx="18" fill="${C.tankGlass}" ${stroke(6)}/>`;
  const fh = (th - 16) * (0.88 - 0.14 * P(t, K.lemak, 2.0) * loopBack);
  t2 += `<rect x="${-tw / 2 + 8}" y="${f(th / 2 - 8 - fh)}" width="${tw - 16}" height="${f(fh)}" rx="12" fill="${C.fat}"/>`;
  t2 += `<ellipse cx="0" cy="${f(th / 2 - 8 - fh)}" rx="${tw / 2 - 10}" ry="8" fill="${C.fatHi}"/>`;
  // Fat globules / rising ketone sparks inside Tank 2
  for (let k = 0; k < 5; k++) {
    const u = ((t * (0.3 + 0.5 * fatActive) + k * 0.2) % 1);
    const bx = (rnd(k + 9) - 0.5) * (tw - 46), by = th / 2 - 24 - u * (fh - 24);
    t2 += `<circle cx="${f(bx)}" cy="${f(by)}" r="${fatActive > 0.3 ? 11 : 8}" fill="${C.fatHi}" ${stroke(2.5, C.ink)} opacity="0.9"/>`;
  }
  t2 += txt('LEMAK', 0, th / 2 + 28, 22, C.ink, 900);
  t2 += txt('CADANGAN', 0, 0, 22, '#fff', 900, 'middle', `stroke="${C.ink}" stroke-width="6" paint-order="stroke"`);
  g += G(T(tx2, ty, fatPulse), 1, t2);

  // Center Switch Lever (SAKLAR)
  const la = lerp(-36, 36, sw);
  g += `<rect x="-54" y="-116" width="108" height="128" rx="18" fill="#E8DFCE" ${stroke(5)}/>`;
  g += txt('SAKLAR', 0, -94, 17, C.muted, 900);
  g += `<path d="M-26,-44 A30,30 0 0 1 26,-44" fill="none" ${stroke(4, C.muted)} stroke-dasharray="6 6"/>`;
  g += G(`translate(0 -16) rotate(${f(la)})`, 1,
    limb('M0,0 L0,-44', 12, sw > 0.5 ? C.accent : C.cool) +
    vol(circleD(0, -48, 18), sw > 0.5 ? C.accent : C.cool, { depth: 5, w: 5 }));
  g += `<circle cx="0" cy="-16" r="12" fill="${C.ink}"/>`;
  g += txt('GULA', -34, 30, 16, sw < 0.5 ? C.cool : C.muted, 900);
  g += txt('LEMAK', 34, 30, 16, sw >= 0.5 ? C.accent : C.muted, 900);

  // Flowing ketone energy bolts when fat switch is active
  if (fatActive > 0.05) {
    for (let k = 0; k < 4; k++) {
      const u = ((t * 1.4 + k * 0.25) % 1);
      const px = lerp(tx2, 0, u), py = lerp(ty - 70, -165, u) - 24 * Math.sin(u * Math.PI);
      g += G(T(px, py, 0.9), fatActive, `<circle r="14" fill="${C.yellow}" ${stroke(3)}/>` + txt('⚡', 0, 1, 16, C.ink));
    }
  }
  if (t > K.pindah && t < K.pindah + 0.6) {
    g += burst(t, K.pindah, 0, -50, { n: 10, r: 110, col: C.yellow, dur: 0.45, size: 9 });
    g += impactRing(t, K.pindah, 0, -50, { r0: 20, r1: 130, col: C.accent, dur: 0.4 });
  }

  // Empty plate with fork & spoon sitting in front of the panel on the table
  g += G(T(0, 165), 1,
    `<ellipse cx="0" cy="14" rx="135" ry="30" fill="#fff" ${stroke(6)}/>` +
    `<ellipse cx="0" cy="14" rx="95" ry="18" fill="none" ${stroke(3, C.line)}/>` +
    limb('M-165,4 L-150,30', 8, '#B9C3CC') + limb('M165,4 L150,30', 8, '#B9C3CC'));
  return G(T(x, y), 1, g);
}

function drawWorld(t) {
  let s = room(t) + fastingClock(t) + fuelPanel(t);
  // Si Cicak on the left wall
  let pose = 'think', face = 'skeptical';
  if (t >= K.s2 && t < K.s3) { pose = 'shock'; face = 'shock'; }
  else if (t >= K.s3 && t < K.s4) { pose = 'verdict'; face = t > K.mitos ? 'smug' : 'skeptical'; }
  else if (t >= K.s4 && t < K.s5) { pose = 'point'; face = 'smile'; }
  else if (t >= K.s5 && t < K.s7) { pose = 'cheer'; face = 'wow'; }
  else if (t >= K.s7 && t < K.s9) { pose = 'calm'; face = 'wow'; }
  else if (t >= K.s9 && t < K.s10) { pose = 'point'; face = 'smile'; }
  else if (t >= K.s10 && t < K.loop) { pose = 'happy'; face = t > K.dokter ? 'wink' : 'laugh'; }
  s += cicak(-350, -30, 0.56, pose, t, 8, null, face);
  return s;
}

// ---------- inside the x-ray lens: cellular autophagy ----------
function cellLens(t) {
  const recycleP = P(t, K.autofagi - 0.15, 0.9, E.inOutCubic);
  let s = `<rect x="200" y="500" width="680" height="680" fill="#E8DEC8"/>`;
  // Cell membrane & cytoplasm inside the lens
  s += `<circle cx="540" cy="825" r="215" fill="${C.cellBg}" ${stroke(10, C.cellMem)}/>`;
  s += `<circle cx="540" cy="825" r="196" fill="none" ${stroke(4, C.cellMem)} stroke-dasharray="14 10"/>`;
  // Nucleus on the upper-left of the cell
  s += vol(circleD(435, 730, 52), C.nuc, { depth: 9, w: 6 });
  s += `<circle cx="435" cy="730" r="18" fill="#5848A8"/>`;

  // Damaged parts (dented grey organelles) gathered toward center (595, 850), then recycled into glowing green parts
  const cx = 595, cy = 850;
  const gather = P(t, K.beres - 0.2, 1.1, E.inOutCubic);
  const parts = [[-85, 62], [68, -68], [54, 58]];
  if (recycleP < 0.65) {
    const fade = 1 - clamp((recycleP - 0.3) / 0.35);
    parts.forEach(([dx, dy], i) => {
      const px = cx + dx * (1 - 0.62 * gather), py = cy + dy * (1 - 0.62 * gather);
      s += G(T(px, py, 1, i * 35 + t * 25), fade,
        vol(rectD(-26, -18, 52, 36, 11), C.broken, { depth: 6, w: 5 }) +
        `<path d="M-9,-7 L9,7 M9,-7 L-9,7" ${stroke(4, C.accent)}/>`);
    });
  }
  // Autophagosome (recycling bubble wrapping around the damaged parts)
  if (t > K.beres - 0.2) {
    const vp = pop(t, K.beres - 0.1, 0.45);
    const rV = lerp(88, 70, recycleP);
    s += G(T(cx, cy, vp.s), vp.o,
      `<circle r="${f(rV)}" fill="${C.vesicle}" fill-opacity="0.28" ${stroke(6, C.vesicle)} stroke-dasharray="18 8" transform="rotate(${f(t * 45)})"/>`);
  }
  // Recycled fresh glowing components!
  if (recycleP > 0.35) {
    const fp = pop(t, K.autofagi + 0.1, 0.5);
    parts.forEach(([dx, dy], i) => {
      const a = i * 2.09 + t * 1.2, rr = 42 * E.outBack(clamp((recycleP - 0.35) / 0.5));
      const px = cx + rr * Math.cos(a), py = cy + rr * Math.sin(a);
      s += G(T(px, py, fp.s), fp.o,
        vol(circleD(0, 0, 22), C.fresh, { depth: 6, w: 5 }) + sparkle(-7, -7, 8, '#fff'));
    });
    s += burst(t, K.autofagi + 0.15, cx, cy, { n: 10, r: 110, col: C.yellow, dur: 0.5, size: 9 });
  }
  const tag = recycleP > 0.35 ? 'SEL BARU & BERSIH!' : 'DAUR ULANG SEL RUSAK';
  s += pill(tag, 540, 1005, 22, recycleP > 0.35 ? C.leaf : C.ink, '#fff');
  return s;
}

// ---------- overlay cards ----------
const cross = (x, y, p, r = 82, w = 18) => p <= 0 ? '' :
  `<path d="M${x - r},${y - r} L${f(x - r + 2 * r * clamp(p * 2))},${f(y - r + 2 * r * clamp(p * 2))}" ${stroke(w, C.accent)}/>` +
  (p > 0.5 ? `<path d="M${x + r},${y - r} L${f(x + r - 2 * r * clamp(p * 2 - 1))},${f(y - r + 2 * r * clamp(p * 2 - 1))}" ${stroke(w, C.accent)}/>` : '');
const tick = (x, y, p, col = C.leaf) => p <= 0 ? '' :
  `<path d="M${x - 28},${y} L${f(x - 28 + 20 * clamp(p * 2))},${f(y + 20 * clamp(p * 2))}${p > 0.5 ? ` L${f(x - 8 + 44 * clamp(p * 2 - 1))},${f(y + 20 - 50 * clamp(p * 2 - 1))}` : ''}" fill="none" ${stroke(14, col)}/>`;

function insulinCard(t) {
  const d = P(t, K.turun - 0.2, 0.9, E.inOutCubic);
  const open = P(t, K.dipakai - 0.1, 0.4, E.outBack);
  let s = `<rect x="36" y="74" width="380" height="220" rx="18" fill="${C.bg}" ${stroke(4, C.line)}/>`;
  s += `<path d="M76,110 V254 H380" fill="none" ${stroke(5, C.muted)}/>`;
  // Dropping insulin curve
  const pts = [[86, 128], [150, 136], [215, 185], [285, 228], [360, 240]];
  const n = Math.max(2, Math.round(lerp(2, pts.length, d)));
  const path = pts.slice(0, n).map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  s += `<path d="${path}" fill="none" ${stroke(10, C.cool)}/>`;
  s += bodyText('Insulin ↓', 96, 108, 40, C.cool, 'start', 900);

  // Right side: Fat droplet + unlocking padlock
  s += G(T(630, 185), 1,
    vol(circleD(0, 10, 74), C.fat, { depth: 12, w: 6 }) +
    `<path d="M-22,-18 V-38 A22,22 0 0 1 22,-38 V${f(-18 - 22 * open)}" transform="translate(0 ${f(-14 * open)})" fill="none" ${stroke(8)}/>` +
    vol(rectD(-36, -20, 72, 58, 12), open > 0.3 ? C.leaf : C.accent, { depth: 6, w: 5 }) +
    `<circle cx="0" cy="8" r="8" fill="#fff"/>`);
  s += bodyText(open > 0.3 ? 'Lemak terbuka!' : 'Lemak terkunci', 630, 292, 40, open > 0.3 ? C.leaf : C.ink, 'middle', 900);
  return s;
}

function nobelCard(t) {
  let s = G(T(115, 115), 1,
    `<path d="M-24,30 L-38,88 L-12,74 L4,92 L18,30 Z" fill="${C.accent}" ${stroke(4)}/>` +
    `<path d="M6,30 L22,92 L38,74 L64,88 L46,30 Z" fill="${C.cool}" ${stroke(4)}/>` +
    vol(circleD(10, 0, 56), C.gold, { depth: 8, w: 6 }) +
    `<circle cx="10" cy="0" r="40" fill="none" ${stroke(3, C.goldD)}/>` +
    headText('2016', 10, 2, 28, C.ink));
  s += mono(scramble('NOBEL 2016', t, K.nobel - 0.1, 0.55), 220, 82, 48, C.ink);
  s += bodyText('Yoshinori Ohsumi · Autofagi', 220, 146, 40, C.muted, 'start', 900);
  return s;
}

function mealCard(t) {
  let s = `<line x1="430" y1="80" x2="430" y2="390" ${stroke(4, C.line)} stroke-dasharray="10 10"/>`;
  // Left: Glass of water (using props.js glass)
  s += glass(215, 305, 0.9, { level: 0.78, liquid: C.water, t });
  s += tick(325, 195, P(t, K.air + 0.1, 0.4));
  s += bodyText('Air putih cukup', 215, 365, 42, C.leaf, 'middle', 900);

  // Right: Overloaded plate of food + red cross
  const overP = pop(t, K.lebih - 0.25, 0.45);
  let pl = `<ellipse cx="0" cy="45" rx="130" ry="26" fill="#fff" ${stroke(6)}/>`;
  [[-55, 20, 42, '#E8A13A'], [0, 12, 48, '#D96B38'], [55, 22, 40, '#E8A13A'], [-28, -22, 38, '#F2C14E'], [30, -20, 38, '#C85A48'], [0, -52, 34, '#E8A13A']].forEach(([cx, cy, r, col]) => {
    pl += vol(circleD(cx, cy, r), col, { depth: 6, w: 5 });
  });
  s += G(T(645, 240, overP.s), overP.o, pl);
  s += cross(645, 225, P(t, K.lebih + 0.05, 0.4), 95, 18);
  s += bodyText('Jangan kalap!', 645, 365, 42, C.accent, 'middle', 900);
  return s;
}

function drawOverlay(t) {
  let s = '';
  // Scene 2-3: Myth thought bubble ("0% MOGOK!") slammed with MITOS! stamp
  if (t > K.s2 + 0.1 && t < K.s3e + 0.1) {
    const p = pop(t, K.s2 + 0.1, 0.45), out = P(t, K.s3e - 0.25, 0.25, E.inCubic);
    const blink = Math.floor(t * 5) % 2 === 0 ? C.accent : '#7A2018';
    const bub = `<circle r="132" fill="#fff" ${stroke(6)}/>` +
      `<rect x="-74" y="-58" width="136" height="68" rx="14" fill="#fff" ${stroke(6)}/><rect x="62" y="-38" width="14" height="28" rx="4" fill="${C.ink}"/>` +
      `<rect x="-64" y="-48" width="24" height="48" rx="6" fill="${blink}"/>` +
      headText('0%', -6, -22, 42, C.accent) + bodyText('MOGOK!', 0, 48, 40, C.ink, 'middle', 900);
    s += G('', p.o * (1 - out),
      `<circle cx="380" cy="790" r="12" fill="#fff" ${stroke(5)}/><circle cx="430" cy="735" r="18" fill="#fff" ${stroke(5)}/>` +
      G(T(540, 640, p.s), 1, bub) + cross(540, 640, P(t, K.mitos, 0.35), 95, 18));
  }
  if (t > K.mitos - 0.2 && t < K.s3e + 0.1) {
    s += G('', 1 - P(t, K.s3e - 0.25, 0.25), stamp('MITOS!', t, K.mitos, 560, 1140, C.accent, -8));
  }

  // Scene 4-5: Switch sticker & citations
  s += cite('Sumber: de Cabo & Mattson, NEJM (2019)', t, K.jam12, K.s4e - 0.15);
  s += sticker('KLAK!', t, K.pindah, 800, 640, { rot: 8, size: 102, dur: 0.85, col: C.accent });
  s += cite('Sumber: Johns Hopkins Medicine; NIA / NIH', t, K.lemak, K.s5e - 0.15);

  // Scene 6: Insulin card
  s += card(t, K.s6 + 0.15, 540, 1170, 860, 340, insulinCard(t), { title: 'Efek hormon saat puasa', tOut: K.s6e - 0.2 });
  s += sticker('KLIK!', t, K.dipakai, 810, 960, { rot: -7, size: 92, dur: 0.8 });
  s += cite('Sumber: Harvard T.H. Chan School of Public Health', t, K.insulin, K.s6e - 0.15, 1395);

  // Scene 7-8: Cell autophagy x-ray lens + Nobel 2016 card
  if (t > K.s7 + 0.15 && t < K.s9 - 0.05) {
    s += spotlight(t, K.s7 + 0.15, K.s9 - 0.15, LENS.x, LENS.y, LENS.r + 25, 0.25);
    s += xray(t, K.s7 + 0.15, LENS.x, LENS.y, LENS.r, cellLens(t), { t1: K.s9 - 0.25, id: 'cellXr' });
  }
  s += card(t, K.nobel - 0.15, 540, 1225, 860, 195, nobelCard(t), { tOut: K.s8e - 0.2 });
  s += cite('Sumber: The Nobel Prize in Physiology or Medicine (2016)', t, K.autofagi, K.s8e - 0.15, 1395);

  // Scene 9: Healthy meal & hydration card
  s += card(t, K.s9 + 0.15, 540, 1020, 860, 420, mealCard(t), { title: 'Saat waktu makan tiba', tOut: K.s9e - 0.2 });
  s += cite('Sumber: Johns Hopkins Medicine', t, K.air, K.s9e - 0.15);

  // Scene 10: Doctor disclaimer badge on "maag / diabetes"
  if (t > K.maag - 0.1 && t < D.outroAt - 0.15) {
    const p = pop(t, K.maag - 0.1, 0.45), o = p.o * (1 - P(t, D.outroAt - 0.4, 0.25));
    s += G(T(540, 1290, p.s), o,
      `<rect x="-440" y="-54" width="880" height="108" rx="28" fill="#fff" ${stroke(6)}/>` +
      `<circle cx="-375" cy="0" r="32" fill="${C.accent}" ${stroke(4)}/>` +
      `<path d="M-375,-16 V16 M-391,0 H-359" ${stroke(8, '#fff')}/>` +
      bodyText('Maag / Diabetes → Tanya Dokter Dulu', 25, 2, 34, C.ink, 'middle', 900));
  }
  return s;
}

function drawThumbnail() {
  const t = 1.6;
  let s = `<rect width="1080" height="1920" fill="#233142"/>`;
  for (let k = 0; k < 24; k += 2) {
    const a0 = k / 24 * Math.PI * 2, a1 = a0 + Math.PI / 12;
    s += `<path d="M540,1080 L${f(540 + 1700 * Math.cos(a0))},${f(1080 + 1700 * Math.sin(a0))} L${f(540 + 1700 * Math.cos(a1))},${f(1080 + 1700 * Math.sin(a1))} Z" fill="#F5B83D" opacity="0.24"/>`;
  }
  s += woodPlank(-20, 1410, 1120, 84, { col: C.wood });
  // Big fuel panel centered in the thumbnail, showing switch flipping to LEMAK!
  s += G(T(510, 1020, 1.32), 1, fuelPanel(K.lemak + 0.4));
  // Red mystery circle pointing at the fuel switch
  s += `<circle cx="563" cy="1129" r="96" fill="none" stroke="${C.accent}" stroke-width="14"/>`;
  s += cicak(155, 880, 0.64, 'shock', t, 14);
  return { world: s, ui: titleText('PUASA 12 JAM\n*APA JADINYA*?', 540, 400, 172, 980, 26) };
}
