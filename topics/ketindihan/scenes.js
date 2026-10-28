// Topic: ketindihan & pareidolia, what science says about "spooky" experiences (paper style: a bedroom at night
// seen from the side, moving camera). Explains the experiences only; it does not argue about the unseen.
Object.assign(C, {
  wall: '#E9DCC3', wallLine: '#D9C8A8', night: '#1B2348', sky: '#2B3A6B', moon: '#FBE7A1', curtain: '#C98B8B',
  bedWood: '#B07B4F', sheet: '#F4F1EA', blanket: '#7FA7D6', blanketD: '#5E86B8', pillow: '#FFFFFF',
  ghost: '#141829', brainC: '#F2A7B8', muscle: '#E0866A', shirt: '#E9B44C', plate: '#F7F4EC',
});

let K = {};
const ICON = {
  moon: () => `<path d="M6,-22 A22,22 0 1 0 6,22 A16,16 0 1 1 6,-22 Z" fill="${C.moon}" ${stroke(4)}/>`,
  brain: () => `<path d="M-18,6 C-26,-6 -18,-22 -4,-20 C2,-28 18,-24 18,-12 C28,-8 26,8 16,12 C12,22 -10,22 -18,6 Z" fill="${C.brainC}" ${stroke(4)}/><path d="M-4,-14 q6,8 0,16 M8,-12 q-4,10 4,16" fill="none" ${stroke(2.5)}/>`,
  chart: () => [0, 1, 2].map(r => [0, 1, 2].map(c => `<circle cx="${-12 + c * 12}" cy="${-12 + r * 12}" r="4.5" fill="${r === 0 && c === 0 ? C.accent : '#fff'}" ${stroke(2.5)}/>`).join('')).join(''),
  face: () => `<rect x="-18" y="-18" width="36" height="36" rx="8" fill="${C.plate}" ${stroke(4)}/><circle cx="-7" cy="-4" r="4" fill="${C.ink}"/><circle cx="7" cy="-4" r="4" fill="${C.ink}"/><path d="M-6,8 Q0,12 6,8" fill="none" ${stroke(3)}/>`,
  tip: () => `<path d="M-16,4 L-16,-10 L16,-10 L16,4" fill="none" ${stroke(4)}/><rect x="-20" y="4" width="40" height="10" rx="3" fill="${C.blanket}" ${stroke(4)}/><text x="10" y="-14" font-family="${FONT}" font-weight="900" font-size="14" fill="${C.ink}">z</text>`,
};

function setup(D) {
  const s = D.scenes;
  K = {
    bangun: s[0].at('bangun'), gerak: s[0].at('gerak'), sosok: s[0].at('sosok'), s2: s[1].start, ketindihan: s[1].at('ketindihan'),
    s3: s[2].start, lumpuh: s[2].at('kelumpuhan'), s3e: s[2].end,
    s4: s[3].start, mimpi: s[3].at('bermimpi'), kunci: s[3].at('mengunci'), s4e: s[3].end,
    s5: s[4].start, sadar: s[4].at('sadar'), belum: s[4].at('belum'), s5e: s[4].end,
    s6: s[5].start, halu: s[5].at('halusinasi'), sosok2: s[5].at('sosok'), suara: s[5].at('suara'), dada: s[5].at('dada'), s6e: s[5].end,
    s7: s[6].start, n8: s[6].at('8'), s7e: s[6].end,
    s8: s[7].start, tembok: s[7].at('tembok'), jemuran: s[7].at('jemuran'), pareidolia: s[7].at('pareidolia'), s8e: s[7].end,
    s9: s[8].start, wajah: s[8].at('wajah'), noda: s[8].at('noda'), muka: s[8].at('muka'), s9e: s[8].end,
    s10: s[9].start, tidur: s[9].at('Tidur'), dokter: s[9].at('dokter'), loop: D.total - 1.5, outro: D.outroAt,
  };
  const start = { x: -60, y: 110, z: 1.35 };
  setCamera([
    start,
    { at: K.s2, dur: 0.9, x: 0, y: 90, z: 1.3 },
    { at: K.s3, dur: 0.8, x: -170, y: 90, z: 1.45 },
    { at: K.s4, dur: 0.8, x: -210, y: 10, z: 1.5 },
    { at: K.s5, dur: 1.2, x: -220, y: 60, z: 1.75 },
    { at: K.s6, dur: 0.9, x: 20, y: 40, z: 1.1 },
    { at: K.s7, dur: 0.8, x: 0, y: -120, z: 0.95 },
    { at: K.s8, dur: 1.0, x: 640, y: 20, z: 1.15 },
    { at: K.s9, dur: 0.8, x: 620, y: 60, z: 1.4 },
    { at: K.s10, dur: 1.0, x: 0, y: 20, z: 1.0 },
    { at: K.loop, dur: 1.3, ...start },
  ]);
  setHeadlines([
    { at: -0.6, end: K.s2 - 0.1, text: 'BADAN NGGAK\n*BISA GERAK*?' },
    { at: K.ketindihan, end: K.s3 - 0.1, text: '*KETINDIHAN*\nMAKHLUK HALUS?' },
    { at: K.lumpuh, end: K.s3e - 0.1, text: 'KATA SAINS:\n*KELUMPUHAN TIDUR*' },
    { at: K.kunci, end: K.s4e - 0.1, text: 'OTOT\n*DIKUNCI*' },
    { at: K.belum, end: K.s5e - 0.1, text: 'SADAR, TAPI\n*MASIH TERKUNCI*' },
    { at: K.halu, end: K.s6e - 0.1, text: '*HALUSINASI*' },
    { at: K.n8, end: K.s7e - 0.1, text: '*8 DARI 100*\nORANG', hype: true },
    { at: K.pareidolia, end: K.s8e - 0.1, text: '*PAREIDOLIA*' },
    { at: K.wajah, end: K.s9e - 0.1, text: 'OTAK JAGO\nCARI *WAJAH*' },
    { at: K.tidur, end: K.outro - 0.15, text: 'TIDUR CUKUP,\nTANYA *DOKTER*' },
  ]);
  setChapters([
    { at: 0.3, icon: ICON.moon }, { at: K.s4, icon: ICON.brain }, { at: K.s7, icon: ICON.chart },
    { at: K.s8, icon: ICON.face }, { at: K.s10, icon: ICON.tip },
  ]);
}

function cues(D) {
  return [
    [K.gerak, 'tick'], [K.sosok, 'pop'], [K.sosok + 0.1, 'thud'], [K.s2, 'whoosh'], [K.s3, 'whoosh'], [K.lumpuh, 'thud'],
    [K.s4, 'whoosh'], [K.mimpi, 'sparkle'], [K.kunci, 'click'], [K.s5, 'whoosh'], [K.sadar, 'tick'], [K.belum, 'click'],
    [K.s6, 'whoosh'], [K.halu, 'zap'], [K.sosok2, 'pop'], [K.dada, 'thud'], [K.s7, 'whoosh'], [K.n8, 'ding'],
    [K.s8, 'whoosh'], [K.tembok, 'pop'], [K.jemuran, 'pop'], [K.pareidolia, 'pop'], [K.s9, 'whoosh'],
    [K.wajah, 'pop'], [K.noda, 'pop'], [K.muka, 'pop'], [K.s10, 'whoosh'], [K.s10 + 0.2, 'click'], [K.dokter, 'ding'],
    [K.loop, 'whoosh'],
  ];
}

// how dark the room is: night, lights on for the last line, night again for the loop
const night = t => 1 - P(t, K.s10, 0.5) * (1 - P(t, K.loop, 1.0));

// ---------- the bedroom ----------
function room(t) {
  const n = night(t);
  let s = `<rect x="-2000" y="-2000" width="4000" height="2380" fill="${C.wall}"/>`;
  for (let k = -14; k <= 14; k++) s += `<line x1="${k * 140}" y1="-2000" x2="${k * 140}" y2="380" ${stroke(3, C.wallLine)}/>`;
  s += `<rect x="-2000" y="350" width="4000" height="30" fill="${C.bedWood}" ${stroke(5)}/>`;
  s += woodPlank(-2000, 380, 4000, 60, { col: '#C49A6C' }) + `<rect x="-2000" y="440" width="4000" height="1200" fill="#A9825A"/>`;
  // window: night sky with the moon, or a morning sky with the lights on
  const W = { x: -280, y: -360 };
  s += vol(rectD(W.x - 150, W.y - 120, 300, 240, 8), '#FFFFFF', { depth: 8 });
  s += `<rect x="${W.x - 132}" y="${W.y - 102}" width="264" height="204" fill="${mix('#BFE0F5', C.sky, n)}"/>`;
  s += G('', n, `<circle cx="${W.x + 50}" cy="${W.y - 30}" r="38" fill="${C.moon}"/><circle cx="${W.x + 64}" cy="${W.y - 40}" r="30" fill="${C.sky}"/>` +
    [[-90, -60], [-40, -20], [20, 40], [-70, 30], [80, 50]].map(([dx, dy], i) => sparkle(W.x + dx, W.y + dy, 6 + 3 * Math.sin(t * 3 + i), '#fff')).join(''));
  s += G('', 1 - n, `<circle cx="${W.x + 60}" cy="${W.y - 40}" r="34" fill="#F7D27A"/>`);
  s += `<path d="M${W.x},${W.y - 102} V${W.y + 102} M${W.x - 132},${W.y} H${W.x + 132}" ${stroke(7)}/>`;
  [-1, 1].forEach(sd => s += vol(`M${W.x + sd * 150},${W.y - 140} L${W.x + sd * 210},${W.y - 140} L${W.x + sd * 220},${W.y + 150} L${W.x + sd * 160},${W.y + 150} Z`, C.curtain, { depth: 10 }));
  // the bed, Si Cicak in it under the blanket
  s += vol(rectD(-520, 20, 50, 360, 10), C.bedWood, { depth: 8 });
  s += vol(rectD(-480, 230, 720, 70, 10), C.bedWood, { depth: 8 }) + vol(rectD(200, 140, 40, 240, 8), C.bedWood, { depth: 6 });
  s += vol(rectD(-470, 180, 680, 56, 14), C.sheet, { depth: 8, w: 6 });
  s += vol('M-450,170 C-450,138 -300,132 -300,166 C-300,196 -450,200 -450,170 Z', C.pillow, { depth: 8, w: 6 });
  return s;
}

function geckoFace(t) {
  if (t < K.bangun) return 'sleepy';
  if (t < K.s3) return 'shock';
  if (t < K.s4) return 'calm';
  if (t < K.sadar) return 'sleepy';
  if (t < K.s7) return 'shock';
  if (t < K.s8) return 'calm';
  if (t < K.s10) return 'skeptical';
  return t < K.loop + 0.4 ? 'laugh' : 'sleepy';
}

function bed(t) {
  let s = cicak(-190, 148, 0.7, 'calm', t, -90, null, geckoFace(t));
  s += vol('M-215,128 C-120,110 120,112 215,126 L222,240 L-222,240 Z', C.blanket, { depth: 14 });
  for (let k = 0; k < 5; k++) s += `<path d="M${-175 + k * 84},${124 - k * 2} q12,58 0,114" fill="none" ${stroke(5, C.blanketD)}/>`;
  // something pressing on the chest during the hallucination
  const press = P(t, K.dada - 0.1, 0.4) * (1 - P(t, K.s6e - 0.3, 0.3));
  if (press > 0.01) s += G(T(-170, 104 + 6 * Math.sin(t * 6), 1), press * 0.85, `<ellipse rx="70" ry="34" fill="${C.ghost}" opacity="0.7"/>` +
    [-40, -14, 12, 38].map(x => `<ellipse cx="${x}" cy="24" rx="11" ry="18" fill="${C.ghost}" opacity="0.7"/>`).join('')) +
    pill('berat', -170, 20, 24, C.ink, '#fff', 1, press);
  // a dream bubble while dreaming
  const dp = P(t, K.mimpi - 0.2, 0.4) * (1 - P(t, K.sadar, 0.4));
  if (dp > 0.01) {
    s += G('', dp, [[-250, 70, 10], [-230, 30, 16]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${stroke(5)}/>`).join('') +
      vol(circleD(-160, -60, 92), '#FFFFFF', { depth: 8, w: 6, shine: false }) +
      cicak(-160, -50, 0.18, 'cheer', t, 0, t * 9, 'laugh') + `<path d="M-230,-20 q30,-20 60,0 t60,0" fill="none" ${stroke(4, C.leaf)}/>`);
  }
  return s;
}

// the "presence" by the bed: a soft shadow with glowing eyes (a cartoon, never gory)
function presence(t, x = 260) {
  const a = P(t, K.sosok - 0.2, 0.6) * (1 - P(t, K.lumpuh, 0.6));
  const b = P(t, K.sosok2 - 0.3, 0.3) * (0.6 + 0.4 * (Math.sin(t * 23) > -0.4 ? 1 : 0)) * (1 - P(t, K.s6e - 0.3, 0.4));
  const o = Math.max(a, b);
  if (o < 0.01) return '';
  const sway = 6 * Math.sin(t * 1.4);
  return G(T(x + sway, 380), o * 0.92,
    `<path d="M-90,0 C-100,-120 -80,-300 0,-340 C80,-300 100,-120 90,0 C60,-20 30,10 0,-10 C-30,10 -60,-20 -90,0 Z" fill="${C.ghost}" opacity="0.88"/>` +
    `<ellipse cx="-26" cy="-250" rx="12" ry="16" fill="#FFF6C8"/><ellipse cx="26" cy="-250" rx="12" ry="16" fill="#FFF6C8"/>` +
    `<circle cx="0" cy="-250" r="90" fill="#FFF6C8" opacity="0.06"/>`);
}

// the wall on the right: a socket, a shirt on a hook and a stain, all of which look like faces
function wallThings(t) {
  let s = vol(rectD(480, 130, 110, 140, 16), C.plate, { depth: 8 });
  s += `<circle cx="512" cy="186" r="13" fill="${C.ink}"/><circle cx="558" cy="186" r="13" fill="${C.ink}"/><path d="M522,230 L548,230" ${stroke(6)}/>`;
  s += `<circle cx="660" cy="-200" r="10" fill="#9B9B9B" ${stroke(4)}/>`;
  s += vol('M600,-180 L660,-196 L720,-180 L780,-130 L752,-100 L730,-116 L730,40 L590,40 L590,-116 L568,-100 L540,-130 Z', C.shirt, { depth: 12 });
  s += `<path d="M640,-186 L660,-150 L680,-186" fill="none" ${stroke(5)}/><circle cx="628" cy="-110" r="9" fill="${mix(C.shirt, C.ink, 0.45)}"/><circle cx="692" cy="-110" r="9" fill="${mix(C.shirt, C.ink, 0.45)}"/>`;
  s += `<path d="M630,-50 Q660,-30 690,-50" fill="none" ${stroke(5, mix(C.shirt, C.ink, 0.45))}/>`;
  s += `<path d="M800,60 C770,20 830,-20 880,10 C930,0 950,60 910,90 C890,130 820,130 800,60 Z" fill="${mix(C.wall, '#8A7A5E', 0.35)}"/>`;
  s += `<circle cx="840" cy="50" r="11" fill="${mix(C.wall, '#5E513B', 0.6)}"/><circle cx="886" cy="46" r="9" fill="${mix(C.wall, '#5E513B', 0.6)}"/><path d="M846,90 q20,-10 36,4" fill="none" ${stroke(5, mix(C.wall, '#5E513B', 0.6))}/>`;
  // spotted: a dashed ring and a "wajah?" tag, then cartoon eyes once the brain says "face"
  const spot = (x, y, r, t0, tEyes) => {
    const p = pop(t, t0, 0.4), out = 1 - P(t, K.s10, 0.4);
    if (p.o <= 0 || out <= 0) return '';
    let g = G(T(x, y, p.s), p.o * out, `<circle r="${r}" fill="none" stroke="${C.accent}" stroke-width="7" stroke-dasharray="16 12" transform="rotate(${f(t * 40)})"/>`);
    const e = pop(t, tEyes, 0.35);
    if (e.o > 0) g += G(T(x, y - r * 0.15, e.s), e.o * out, [-1, 1].map(sd => `<circle cx="${sd * r * 0.32}" cy="0" r="${r * 0.2}" fill="#fff" ${stroke(5)}/><circle cx="${sd * r * 0.32 + 3}" cy="2" r="${r * 0.09}" fill="${C.ink}"/>`).join(''));
    return g;
  };
  s += spot(865, 60, 95, K.tembok, K.noda) + spot(660, -110, 120, K.jemuran, K.wajah) + spot(535, 200, 100, K.pareidolia, K.muka);
  return s;
}

// a shaft of moonlight from the window onto the bed: keeps the night readable on a phone
const moonlight = (n, k = 1) => `<path d="M-412,-258 L-148,-258 L140,300 L-600,300 Z" fill="#EEF3FF" opacity="${f(0.2 * n * k)}"/>` +
  `<ellipse cx="-220" cy="190" rx="400" ry="150" fill="#EEF3FF" opacity="${f(0.18 * n * k)}"/>`;

function drawWorld(t) {
  let s = room(t) + wallThings(t) + bed(t);
  const n = night(t);
  if (n > 0.01) {  // night: the room in shadow, moonlight on the bed
    s += `<rect x="-2000" y="-2000" width="4000" height="4000" fill="${C.night}" opacity="${f(0.3 * n)}"/>`;
    s += moonlight(n);
  }
  s += presence(t);
  // voices in the dark: sound rings near the gecko's head
  if (t > K.suara - 0.1 && t < K.s6e) for (let k = 0; k < 3; k++) {
    const u = ((t - K.suara) * 1.4 + k / 3) % 1;
    s += `<path d="M${f(-320 - u * 90)},${f(60 - u * 60)} a${f(30 + u * 60)},${f(30 + u * 60)} 0 0 0 0,${f(60 + u * 120)}" fill="none" ${stroke(5, '#fff')} opacity="${f(1 - u)}"/>`;
  }
  return s;
}

// ---------- overlay cards ----------
function brainCard(t) {  // during a dream: brain asleep, muscles locked; then the brain wakes first
  const awake = t > K.sadar;
  let s = G(T(70, 100, 1.4), 1, ICON.brain()) + bodyText('Otak', 120, 100, 42, C.ink, 'start', 900);
  s += `<rect x="330" y="68" width="440" height="64" rx="14" fill="${awake ? C.leaf : C.cool}"/>`;
  s += mono(awake ? scramble('SADAR', t, K.sadar, 0.5) : 'MIMPI', 550, 100, 40, '#fff', { anchor: 'middle' });
  s += G(T(70, 200, 1.3), 1, `<path d="M-20,10 C-24,-8 -10,-22 4,-18 C14,-28 26,-16 20,-4 C30,4 22,20 8,18 L-14,20 Z" fill="${C.muscle}" ${stroke(4)}/>`);
  s += bodyText('Otot', 120, 200, 42, C.ink, 'start', 900);
  const blink = t > K.belum && Math.floor(t * 4) % 2 === 0;
  s += `<rect x="330" y="168" width="440" height="64" rx="14" fill="${blink ? '#F08A73' : C.accent}"/>` + mono('TERKUNCI', 520, 200, 40, '#fff', { anchor: 'middle' });
  const lp = P(t, K.kunci - 0.1, 0.3);
  s += G(T(730, 200, 0.4 + 0.6 * E.outBack(lp)), lp, `<path d="M-12,-4 V-14 A12,12 0 0 1 12,-14 V-4" fill="none" ${stroke(5, '#fff')}/><rect x="-16" y="-4" width="32" height="24" rx="5" fill="#fff"/>`);
  return s;
}

function statCard(t) {  // 8 of every 100 people
  let s = '';
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
    const k = r * 10 + c, on = k < 8 && t > K.n8 + k * 0.06;
    s += `<circle cx="${50 + c * 38}" cy="${60 + r * 30}" r="12" fill="${on ? C.accent : C.line}" ${on ? stroke(3) : ''}/>`;
  }
  s += mono(scramble('8/100', t, K.n8, 0.5), 470, 150, 74, C.accent) + bodyText('orang pernah', 470, 230, 38, C.ink, 'start', 900) + bodyText('mengalaminya', 470, 276, 38, C.ink, 'start', 900);
  return s;
}

function tipCard(t) {  // sleep enough; see a doctor if it keeps happening
  const p1 = pop(t, K.tidur - 0.05, 0.4), p2 = pop(t, K.dokter - 0.2, 0.4);
  let s = G(T(80, 90, p1.s), p1.o, `<rect x="-44" y="-10" width="88" height="30" rx="8" fill="${C.blanket}" ${stroke(5)}/><rect x="-48" y="-34" width="14" height="60" rx="5" fill="${C.bedWood}" ${stroke(4)}/>` + txt('z', 30, -30, 30, C.ink, 900) + txt('z', 44, -48, 22, C.ink, 900));
  s += G('', p1.o, bodyText('Tidur 7–9 jam,', 160, 74, 38, C.ink, 'start', 900) + bodyText('jam tidur teratur', 160, 118, 34, C.muted, 'start', 800));
  s += G(T(80, 220, p2.s), p2.o, `<path d="M-20,-30 V0 A20,20 0 0 0 20,0 V-30" fill="none" ${stroke(6)}/><path d="M0,20 V36 A18,18 0 0 0 36,36 V24" fill="none" ${stroke(6)}/><circle cx="36" cy="18" r="10" fill="${C.cool}" ${stroke(4)}/>`);
  s += G('', p2.o, bodyText('Sering & mengganggu?', 160, 204, 38, C.ink, 'start', 900) + bodyText('periksa ke dokter', 160, 248, 34, C.accent, 'start', 900));
  return s;
}

function drawOverlay(t) {
  let s = sticker('DEG!', t, K.sosok + 0.1, 830, 640, { rot: 10, size: 104, dur: 0.9, col: C.accent });
  if (t > K.lumpuh - 0.2 && t < K.s3e + 0.1) s += G('', 1 - P(t, K.s3e - 0.25, 0.25), stamp('SAINS!', t, K.lumpuh, 560, 1180, C.cool, -7));
  s += card(t, K.kunci - 0.3, 540, 1250, 860, 270, brainCard(t), { title: 'Saat tidur bermimpi (REM)', tOut: K.s5e - 0.2 });
  s += cite('Sumber: Cleveland Clinic', t, K.kunci, K.s5e - 0.2, 1420);
  s += cite('Sumber: NHS; Cleveland Clinic', t, K.halu, K.s6e - 0.2);
  s += card(t, K.n8 - 0.3, 540, 1180, 860, 380, statCard(t), { title: 'Dari 100 orang', tOut: K.s7e - 0.2 });
  s += cite('Sumber: Sharpless & Barber (2011), 36.533 peserta', t, K.n8, K.s7e - 0.2, 1420);
  s += sticker('HAH?!', t, K.jemuran + 0.2, 300, 640, { rot: -10, size: 96, dur: 0.9 });
  s += cite('Sumber: Wardle dkk. (2020), Nature Communications', t, K.pareidolia, K.s9e - 0.2);
  s += card(t, K.tidur - 0.05, 540, 1220, 860, 300, tipCard(t), { title: 'Tips', tOut: K.outro - 0.3 });
  s += cite('Sumber: NHS', t, K.tidur, K.outro - 0.3, 1420);
  return s;
}

function drawThumbnail() {
  const t = 1.2;
  K = { ...K, bangun: 0, s3: 99, s4: 99, sadar: 99, s7: 99, s8: 99, s10: 99, loop: 99, sosok: -1, lumpuh: 99, sosok2: 99, s6e: 0, dada: 99, mimpi: 99, tembok: 99, jemuran: 99, pareidolia: 99, noda: 99, wajah: 99, muka: 99 };
  // close on the frozen gecko's wide-open eyes, the shadow looming right behind the bed
  const z = 2.1, cx = -190, cy = 110, sx = x => 540 + (x - cx) * z, sy = y => 1060 + (y - cy) * z;
  let w = `<g transform="translate(540 1060) scale(${z}) translate(${-cx} ${-cy})">${room(t) + bed(t)}` +
    `<rect x="-2000" y="-2000" width="4000" height="4000" fill="${C.night}" opacity="0.42"/>${moonlight(1, 1.4)}${presence(t, 20)}</g>`;
  w += `<circle cx="${f(sx(-300))}" cy="${f(sy(150))}" r="140" fill="none" stroke="${C.accent}" stroke-width="14"/>`;
  return { world: w, ui: titleText('KETINDIHAN\n= *HANTU*?', 540, 400, 172, 980, 26) };
}
