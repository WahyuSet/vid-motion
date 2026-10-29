// Topic: Langit biru karena memantulkan laut? (Rayleigh scattering, paper style)
// One wall with Si Cicak on it: A window with sky and sea (x 0) -> B "inside the air" panel (x 1700)
// -> B2 why-not-violet card (x 2650) -> C sunset diagram (x 3600). The light itself (lines 3-6 and 8-9)
// is drawn by HyperFrames inserts (hf/hambur.html, hf/senja.html) over this picture.

Object.assign(C, {
  sky: '#86C9F0', skyHi: '#CBEBFB', sea: '#2F8FC9', seaLo: '#1F6FA3', wall: '#F1E8D8', frame: '#D9B98C',
  panel: '#EAF5FC', air: '#BFE3F7', sand: '#E9CF98', violet: '#8E5CC9', blueL: '#3D8FE0', red: '#E0522F', orange: '#F29A3A',
});

let K = {};
const ICON = {
  wave: () => `<path d="M-22,4 q11,-12 22,0 t22,0" fill="none" ${stroke(5, C.sea)}/><path d="M-22,14 q11,-12 22,0 t22,0" fill="none" ${stroke(5, C.sea)}/><circle cx="10" cy="-14" r="8" fill="${C.yellow}" ${stroke(3)}/>`,
  beam: () => ['#E0522F', '#F5B83D', '#5FA548', '#3D8FE0', '#8E5CC9'].map((c, i) => `<path d="M-22,${-12 + i * 6} L22,${-12 + i * 6}" ${stroke(4, c)}/>`).join(''),
  eye: () => `<path d="M-22,0 Q0,-20 22,0 Q0,20 -22,0 Z" fill="#fff" ${stroke(4)}/><circle r="8" fill="${C.blueL}" ${stroke(3)}/>`,
  sunset: () => `<path d="M-18,6 A18,18 0 0 1 18,6 Z" fill="${C.orange}" ${stroke(4)}/><path d="M-24,8 L24,8" ${stroke(5)}/><path d="M-16,16 L16,16" ${stroke(4, C.sea)}/>`,
};

// where Si Cicak sits relative to the camera along the wall
const OFF = [[0, 250], [1700, 300], [2650, -330], [3800, -330]];
const CY = [[0, 300], [1700, 440], [2650, 430], [3800, 440]];
function along(table, x) {
  if (x <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) if (x <= table[i][0]) {
    const [x0, v0] = table[i - 1], [x1, v1] = table[i];
    return lerp(v0, v1, (x - x0) / (x1 - x0));
  }
  return table[table.length - 1][1];
}

function setup(D) {
  const s = D.scenes;
  K = {
    memantul: s[0].at('memantulkan'), laut: s[0].at('laut'),
    s2: s[1].start, masuk: s[1].at('masuk'), mitos: s[1].at('mitos'),
    s3: s[2].start, cahaya: s[2].at('cahaya'), semua: s[2].at('semua'),
    s4: s[3].start, molekul: s[3].at('molekul'), kecil: s[3].at('super'),
    s5: s[4].start, pendek: s[4].at('pendek'), mental: s[4].at('terpental'),
    s6: s[5].start, menoleh: s[5].at('menoleh'), mata: s[5].at('matamu'),
    s7: s[6].start, ungu: s[6].at('ungu'), mental7: s[6].at('terpental'), peka: s[6].at('peka'),
    s8: s[7].start, senja: s[7].at('senja'), kuta: s[7].at('pantai'), tebal: s[7].at('tebal'),
    s9: s[8].start, birunya: s[8].at('birunya'), merah: s[8].at('merah'),
    s10: s[9].start, udara: s[9].at('udara'), bukan: s[9].at('bukan'),
    s11: s[10].start, air: s[10].at('air'), serap: s[10].at('menyerap'),
    loop: D.total - 1.5,
  };
  const home = { x: 0, y: -10, z: 1.0 };
  setCamera([
    home,
    { at: K.laut - 0.3, dur: 0.6, x: 0, y: 60, z: 1.06 },
    { at: K.s2 + 0.2, dur: 0.6, x: 0, y: -20, z: 1.0 },
    { at: K.s3 - 0.2, dur: 1.0, x: 1700, y: -20, z: 1.0 },
    { at: K.molekul - 0.2, dur: 0.6, x: 1760, y: 0, z: 1.12 },
    { at: K.mental - 0.3, dur: 0.6, x: 1720, y: -10, z: 1.04 },
    { at: K.s6, dur: 0.8, x: 1700, y: 10, z: 0.96 },
    { at: K.s7 - 0.2, dur: 0.9, x: 2650, y: -20, z: 1.0 },
    { at: K.s8 - 0.2, dur: 0.9, x: 3800, y: 0, z: 0.9 },
    { at: K.merah - 0.3, dur: 0.6, x: 3900, y: 60, z: 1.0 },
    { at: K.s10 - 0.2, dur: 1.2, x: 0, y: -10, z: 1.04 },
    { at: K.air - 0.3, dur: 0.7, x: -20, y: 130, z: 1.14 },
    { at: K.loop, dur: 1.2, ...home },
  ]);
  setHeadlines([
    { at: -0.6, end: K.s2 - 0.1, text: 'LANGIT BIRU\nKARENA *LAUT*?' },
    { at: K.masuk, end: K.s3 - 0.1, text: 'SAINS BILANG *BEDA*' },
    { at: K.cahaya, end: K.s4 - 0.1, text: 'CAHAYA =\n*SEMUA WARNA*' },
    { at: K.molekul, end: K.s5 - 0.1, text: 'NABRAK *MOLEKUL*' },
    { at: K.mental, end: K.s6 - 0.1, text: 'BIRU *TERPENTAL*', hype: true },
    { at: K.menoleh, end: K.s7 - 0.1, text: 'BIRU DARI\n*SEGALA ARAH*' },
    { at: K.ungu, end: K.s8 - 0.1, text: 'KOK BUKAN *UNGU*?' },
    { at: K.senja, end: K.s9 - 0.1, text: 'SENJA: UDARA\n*LEBIH TEBAL*' },
    { at: K.merah, end: K.s10 - 0.1, text: 'SISA *MERAH*\n& JINGGA' },
    { at: K.udara, end: K.s11 - 0.1, text: 'WARNA DARI *UDARA*' },
    { at: K.serap, end: K.loop + 0.6, text: 'AIR SERAP *MERAH*' },
  ]);
  setChapters([
    { at: 0.3, icon: ICON.wave },
    { at: K.cahaya, icon: ICON.beam },
    { at: K.ungu, icon: ICON.eye },
    { at: K.senja, icon: ICON.sunset },
  ], { at: K.s10, end: D.total });
}

function cues(D) {
  return [
    [K.memantul, 'pop'], [K.mitos, 'thud'],
    [K.s3 - 0.2, 'whoosh'], [K.cahaya + 0.2, 'sparkle'], [K.semua, 'pop'],
    [K.molekul, 'pop'], [K.mental, 'zap'], [K.mental + 0.4, 'tick'], [K.mata, 'ding'],
    [K.s7 - 0.2, 'whoosh'], [K.mental7, 'pop'], [K.peka, 'pop'],
    [K.s8 - 0.2, 'whoosh'], [K.kuta, 'pop'], [K.tebal, 'tick'], [K.merah, 'ding'],
    [K.s10 - 0.2, 'whoosh'], [K.udara, 'sparkle'], [K.air, 'pop'], [K.serap, 'tick'], [K.loop, 'whoosh'],
  ];
}

// ---------- the wall ----------
function wallTiles(cam) {
  let s = '';
  const x0 = Math.floor((cam.x - 900) / 240) * 240;
  for (let x = x0; x < cam.x + 900; x += 240) for (let y = -1080; y < 1100; y += 240)
    if (rnd(x * 0.13 + y * 0.07) > 0.55) s += `<circle cx="${x + 120 * rnd(x + y)}" cy="${y + 120 * rnd(x - y)}" r="${3 + 3 * rnd(x * y)}" fill="${C.line}" opacity="0.7"/>`;
  return s;
}

// ---------- A: the window ----------
const WIN = { x: -360, y: -380, w: 720, h: 800, sea: 170 };
function seaView(t, warm = 0) {
  const { x, y, w, h, sea } = WIN;
  let s = `<defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(C.sky, '#F2A65A', warm)}"/><stop offset="1" stop-color="${mix(C.skyHi, '#FFD7A0', warm)}"/></linearGradient>` +
    `<linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sea}"/><stop offset="1" stop-color="${C.seaLo}"/></linearGradient>` +
    `<clipPath id="winClip"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/></clipPath></defs><g clip-path="url(#winClip)">`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${sea - y}" fill="url(#skyG)"/>`;
  s += sun(-200, -250, 0.7, { t }) + cloud(150, -210, 0.62, { t, seed: 2 }) + cloud(-40, -40, 0.42, { t, seed: 5 });
  s += `<rect x="${x}" y="${sea}" width="${w}" height="${y + h - sea}" fill="url(#seaG)"/><path d="M${x},${sea} L${x + w},${sea}" ${stroke(5)}/>`;
  for (let k = 0; k < 7; k++) {
    const wy = sea + 34 + k * 34, dx = (t * 30 + k * 70) % 140;
    s += `<path d="M${x - 140 + dx},${wy} q18,-10 36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0 t36,0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="${f(0.25 + 0.05 * k)}"/>`;
  }
  return s + '</g>';
}
function windowShell() {  // the frame, drawn under the view
  const { x, y, w, h } = WIN;
  return shadow(0, y + h + 70, 420, 0.14) + vol(rectD(x - 34, y - 34, w + 68, h + 68, 14), C.frame, { depth: 10, w: 7 }) +
    vol(rectD(x - 60, y + h + 20, w + 120, 36, 10), tone(C.frame, -0.08), { depth: 6 });
}
function windowGlass() {  // inner edge and glass glints, over the view
  const { x, y, w, h } = WIN;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" ${stroke(7)}/>` +
    detail(`M${x + 40},${y + 40} L${x + 130},${y + 130} M${x + 80},${y + 34} L${x + 150},${y + 104}`, '#fff', 6, 0.5);
}

// dashed "reflection" arrows from the sea up into the sky (the belief), crossed out at the verdict
function mythArrows(t) {
  if (t < K.memantul - 0.1 || t > K.s3 + 0.3) return '';
  const o = 1 - P(t, K.s3 - 0.3, 0.4);
  let s = '';
  [[-220, 0], [10, 0.12], [230, 0.24]].forEach(([x, d]) => {
    const p = P(t, K.memantul + d, 0.6, E.outCubic);
    s += `<path d="M${x},280 Q${x + 60},90 ${x},${f(280 - 380 * p)}" fill="none" ${stroke(8, '#fff')} stroke-dasharray="18 14"/>`;
    if (p > 0.95) s += `<path d="M${x - 20},-80 L${x},-104 L${x + 20},-80" fill="none" ${stroke(8, '#fff')}/>`;
  });
  const q = pop(t, K.laut, 0.4);
  if (q.o) s += G(T(0, -150, q.s), q.o, vol(circleD(0, 0, 54), '#fff', { depth: 6, w: 6 }) + txt('?', 0, 4, 70, C.ink));
  const x = P(t, K.mitos + 0.15, 0.35, E.outCubic);
  if (x > 0) s += `<path d="M-300,-130 L${f(-300 + 600 * x)},${f(-130 + 420 * x)}" ${stroke(16, C.accent)}/>` +
    (x > 0.5 ? `<path d="M300,-130 L${f(300 - 600 * (x - 0.5) * 2)},${f(-130 + 420 * (x - 0.5) * 2)}" ${stroke(16, C.accent)}/>` : '');
  return G('', o, s);
}

// line 10: the air itself, molecules twinkling in the window sky
function airMolecules(t) {
  if (t < K.udara - 0.1 || t > K.s11 + 0.4) return '';
  const o = 1 - P(t, K.s11, 0.4);
  let s = '';
  for (let i = 0; i < 16; i++) {
    const p = pop(t, K.udara + i * 0.04, 0.35), x = -320 + 640 * rnd(i * 3 + 1), y = -340 + 460 * rnd(i * 5 + 2);
    if (p.o) s += G(T(x + 6 * Math.sin(t * 2 + i), y + 5 * Math.cos(t * 2.4 + i), p.s), p.o,
      vol(circleD(-9, 0, 13), '#fff', { depth: 3, w: 4 }) + vol(circleD(9, 0, 13), '#fff', { depth: 3, w: 4 }) +
      `<circle r="${f(34 + 6 * Math.sin(t * 4 + i))}" fill="${C.blueL}" opacity="0.12"/>`);
  }
  const q = pop(t, K.udara + 0.3, 0.4);
  if (q.o) s += G(T(60, -120, q.s), q.o, pill('molekul udara', 0, 0, 38, C.ink, '#fff'));
  return G('', o, s);
}

// line 11: a ray into the sea; red fades out first, blue goes deep
function seaRay(t) {
  if (t < K.air - 0.2) return '';
  const o = 1 - P(t, K.loop - 0.3, 0.4), d = P(t, K.air - 0.2, 0.5, E.outCubic), ab = P(t, K.serap, 0.8, E.inOutCubic);
  let s = `<g clip-path="url(#winClip)">`;
  s += `<path d="M-160,-120 L${f(-160 + 60 * d)},${f(-120 + 290 * d)}" ${stroke(22, '#FFF6D8')} opacity="0.95"/>`;
  [[C.red, 90, 1], [C.orange, 150, 0.7], [C.leaf, 220, 0.4], [C.blueL, 260, 0]].forEach(([col, len, k], i) => {
    const L = len + (260 - len) * (1 - ab) * (k > 0 ? 1 : 0), x0 = -100 + i * 9;
    if (d > 0.9) s += `<path d="M${x0},170 L${f(x0 + 40)},${f(170 + L)}" ${stroke(10, col)} opacity="${f(i === 3 ? 0.95 : 0.95 - 0.5 * ab * k)}"/>`;
  });
  s += '</g>';
  const q = pop(t, K.serap + 0.2, 0.4);
  if (q.o) s += G(T(-150, 370, q.s), q.o, pill('merah diserap air', 0, 0, 36, C.red, '#fff'));
  return G('', o, s);
}

// ---------- B: inside the air (the light is the hambur insert) ----------
const PAN = { x: 1270, y: -400, w: 860, h: 780 };
function airPanel(t) {
  const { x, y, w, h } = PAN;
  let s = shadow(x + w / 2, y + h + 30, 440, 0.14);
  s += vol(rectD(x, y, w, h, 34), C.panel, { depth: 12, w: 7 });
  for (let k = 0; k < 5; k++) s += `<path d="M${x + 40},${y + 120 + k * 140} L${x + w - 40},${y + 120 + k * 140}" ${stroke(2, C.air)} stroke-dasharray="6 14"/>`;
  s += sun(x + 120, y + 120, 0.62, { t });
  return s;
}

// ---------- B2: why not violet ----------
function violetCard(t) {
  const row = (label, y, vals, t0) => {
    let g = bodyText(label, 50, y, 40, C.ink, 'start', 900);
    [['ungu', C.violet, vals[0]], ['biru', C.blueL, vals[1]]].forEach(([nm, col, v], i) => {
      const by = y + 50 + i * 74, wv = 520 * v * E.outBack(P(t, t0 + i * 0.12, 0.5, E.lin));
      g += bodyText(nm, 50, by + 26, 36, C.muted, 'start', 800);
      if (wv > 2) g += vol(rectD(170, by, wv, 52, 14), col, { depth: 6, w: 5 });
    });
    return g;
  };
  return card(t, K.ungu - 0.1, 2650, -10, 820, 620,
    row('Paling banyak terpental', 90, [1, 0.8], K.mental7 - 0.1) + row('Mata kita peka ke...', 360, [0.35, 1], K.peka - 0.1),
    { title: 'Kok bukan ungu?', col: C.violet });
}

// ---------- C: sunset diagram (the beams are the senja insert) ----------
const BAND = { top: -40, ground: 380 }, PIN = { x: 4020 };
function sunsetDiagram(t) {
  let s = '';
  s += `<rect x="3200" y="${BAND.top}" width="1300" height="${BAND.ground - BAND.top}" fill="${C.air}" opacity="0.55"/>`;
  s += `<path d="M3200,${BAND.top} L4500,${BAND.top}" ${stroke(4, C.blueL)} stroke-dasharray="14 10"/>`;
  s += txt('lapisan udara', 3460, BAND.top + 40, 34, C.cool, 900);
  s += vol(`M3200,${BAND.ground} L4500,${BAND.ground} L4500,${BAND.ground + 90} L3200,${BAND.ground + 90} Z`, C.sand, { depth: 8, w: 6 });
  for (let k = 0; k < 9; k++) s += `<circle cx="${3250 + k * 140 + 40 * rnd(k)}" cy="${BAND.ground + 40 + 20 * rnd(k + 9)}" r="5" fill="${tone(C.sand, -0.25)}"/>`;
  s += sun(PIN.x, -330, 0.5, { t }) + txt('SIANG', PIN.x + 120, -330, 36, C.ink, 900, 'start');
  s += sun(3330, -60, 0.5, { t, col: C.orange, rayCol: C.red }) + txt('SENJA', 3330, -170, 36, C.ink, 900);
  const p = pop(t, K.kuta - 0.05, 0.45);
  if (p.o) s += G(T(PIN.x, BAND.ground, p.s), p.o, vol('M0,0 C-26,-40 -40,-58 -40,-80 A40,40 0 1 1 40,-80 C40,-58 26,-40 0,0 Z', C.accent, { depth: 6, w: 6 }) +
    `<circle cx="0" cy="-80" r="14" fill="#fff" ${stroke(4)}/>` + G(T(0, 60), 1, pill('Pantai Kuta', 0, 0, 34, C.ink, '#fff')));
  return s;
}

// Si Cicak crawls along the wall with the camera
function gecko(t) {
  const c = cameraAt(t), c0 = cameraAt(t - 0.05), dx = c.x - c0.x, moving = Math.abs(dx) > 4;
  const x = c.x + along(OFF, c.x), y = along(CY, c.x);
  let pose = 'think', face = 'confused';
  if (t >= K.s2) { pose = t >= K.mitos ? 'verdict' : 'calm'; face = t >= K.mitos ? 'smug' : 'skeptical'; }
  if (t >= K.s3) { pose = 'point'; face = 'smile'; }
  if (t >= K.molekul) { pose = 'calm'; face = 'wow'; }
  if (t >= K.mental) { pose = 'cheer'; face = 'laugh'; }
  if (t >= K.s6) { pose = 'happy'; face = 'smile'; }
  if (t >= K.s7) { pose = 'think'; face = 'skeptical'; }
  if (t >= K.peka) { pose = 'point'; face = 'wink'; }
  if (t >= K.s8) { pose = 'point'; face = 'smile'; }
  if (t >= K.merah) { pose = 'calm'; face = 'wow'; }
  if (t >= K.s10) { pose = 'verdict'; face = 'smug'; }
  if (t >= K.s11) { pose = 'happy'; face = 'laugh'; }
  if (t >= K.loop + 0.4) { pose = 'think'; face = 'confused'; }
  if (moving) pose = 'calm';
  const rot = moving ? (dx > 0 ? 90 : -90) : -12;
  return cicak(x, y, 0.5, pose, t, rot, moving ? t * 11 : null, face);
}

function drawWorld(t, cam) {
  let s = wallTiles(cam);
  s += windowShell() + seaView(t) + mythArrows(t) + airMolecules(t) + seaRay(t) + windowGlass();
  s += airPanel(t);
  s += violetCard(t);
  s += sunsetDiagram(t);
  return s + gecko(t);
}

function drawOverlay(t) {
  let s = '';
  if (t > K.mitos - 0.2 && t < K.s3 + 0.1) s += G('', 1 - P(t, K.s3 - 0.25, 0.25), stamp('MITOS!', t, K.mitos, 540, 760));
  s += sticker('BOING!', t, K.mental + 0.35, 780, 1180, { rot: 8, size: 84, dur: 0.8 });
  s += cite('Sumber: NASA Space Place', t, K.semua, K.s7 - 0.1);
  s += cite('Sumber: Met Office (Inggris)', t, K.ungu, K.s8 - 0.1);
  s += cite('Sumber: Met Office; NASA Space Place', t, K.tebal, K.s10 - 0.1);
  s += cite('Sumber: NOAA Ocean Service', t, K.air, K.loop);
  return s;
}

// ---------- thumbnail ----------
function drawThumbnail() {
  const t = 1.2;
  let s = `<rect x="0" y="0" width="1080" height="1920" fill="${C.wall}"/>`;
  for (let k = 0; k < 24; k += 2) {
    const a0 = k / 24 * Math.PI * 2, a1 = a0 + Math.PI / 24 * 2;
    s += `<path d="M540,980 L${f(540 + 1700 * Math.cos(a0))},${f(980 + 1700 * Math.sin(a0))} L${f(540 + 1700 * Math.cos(a1))},${f(980 + 1700 * Math.sin(a1))} Z" fill="#F5C95A" opacity="0.4"/>`;
  }
  // the window, bigger, with the belief's arrows from the sea into the sky
  s += G('translate(540 1070) scale(1.2)', 1, windowShell() + seaView(t) + windowGlass() +
    [[-220, 0], [10, 0], [230, 0]].map(([x]) => `<path d="M${x},280 Q${x + 60},90 ${x},-100" fill="none" ${stroke(9, '#fff')} stroke-dasharray="18 14"/>` +
      `<path d="M${x - 22},-76 L${x},-104 L${x + 22},-76" fill="none" ${stroke(9, '#fff')}/>`).join(''));
  s += `<ellipse cx="450" cy="1390" rx="320" ry="110" fill="none" stroke="${C.accent}" stroke-width="12" transform="rotate(-3 540 1340)"/>`;
  s += cicak(860, 1330, 0.95, 'think', t, -20, null, 'skeptical');
  return { world: s, ui: titleText('LANGIT BIRU\n*DARI LAUT?*', 540, 400, 170, 980, 26) };
}
