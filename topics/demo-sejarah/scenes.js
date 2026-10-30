// Topic: demo-sejarah
// Channel: Sejarah (theme: arsip, no mascot, realistic props on aged paper)

let K = {};

function setup(D) {
  const s = D.scenes;
  K = {
    s1: s[0].start,
    catatan: s[0].at('catatan'),
    s2: s[1].start,
    pena: s[1].at('pena'),
    surat: s[1].at('surat'),
    koin: s[1].at('koin'),
    s3: s[2].start,
    lentera: s[2].at('lentera'),
    kompas: s[2].at('kompas'),
    s4: s[3].start,
    rempah: s[3].at('rempah'),
    kapal: s[3].at('berlayar'),
    s5: s[4].start,
    loop: D.total - 1.5,
    end: D.total,
  };

  setCamera([
    { x: 0, y: 0, z: 0.95 },
    { at: K.s2 - 0.2, dur: 0.8, x: 1500, y: 0, z: 0.95 },
    { at: K.s3 - 0.2, dur: 0.8, x: 3000, y: 0, z: 0.95 },
    { at: K.s4 - 0.2, dur: 0.8, x: 4500, y: 0, z: 0.95 },
    { at: K.s5 - 0.2, dur: 0.9, x: 2250, y: 0, z: 0.42 },
    { at: K.loop, dur: 1.2, x: 0, y: 0, z: 0.95 },
  ]);

  setHeadlines([
    { at: 0, end: K.s2 - 0.1, text: 'DOKUMEN & *ARSIP*\nSEJARAH' },
    { at: K.s2, end: K.s3 - 0.1, text: 'PENA BULU &\n*SURAT BERSEGEL*' },
    { at: K.s3, end: K.s4 - 0.1, text: 'LENTERA MINYAK &\n*KOMPAS LAUT*' },
    { at: K.s4, end: K.s5 - 0.1, text: 'KARUNG REMPAH &\n*KAPAL LAYAR*' },
    { at: K.s5, end: K.end, text: '*JEJAK ARSIP*\nNUSANTARA' },
  ]);
}

function cues(D) {
  return [
    [0.1, 'tick'],
    [K.catatan, 'pop'],
    [K.s2 - 0.2, 'whoosh'],
    [K.surat, 'pop'],
    [K.koin, 'tick'],
    [K.s3 - 0.2, 'whoosh'],
    [K.kompas, 'pop'],
    [K.s4 - 0.2, 'whoosh'],
    [K.rempah, 'pop'],
    [K.s5 - 0.2, 'whoosh'],
    [K.s5 + 0.3, 'ding'],
  ];
}

function station1(t) {
  let s = '';
  // Antique map with contour lines and compass rose
  s += oldMap(0, 0, 820, 620, { seed: 5, rose: true, grid: true });
  s += photoFrame(280, -180, 280, 360, { rot: 5, kind: 1, label: 'TOKOH SEJARAH' });
  s += indexCard(-280, -200, 360, 200, {
    rot: -5,
    lines: [
      ['ARSIP NASIONAL No. 1825', 22, HIST.redInk],
      ['Klasifikasi: Dokumen Rahasia', 20],
      ['Peristiwa: Perang Jawa', 20],
    ],
  });
  s += candle(-310, 200, 1.2, { t, lit: true });
  s += pushPin(0, -320);
  return s;
}

function station2(t) {
  let s = '';
  s += sheet(1500, 0, 880, 700, { rot: 1, seed: 7 });
  // Sealed letter that opens when surat is spoken
  const openP = P(t, K.surat - 0.1, 1.2, E.inOutCubic);
  s += sealedLetter(1340, -40, 1.05, { open: openP, label: 'VOC 1790', rot: -3 });
  // Quill ink pen with animated cursive writing trail
  const penP = P(t, K.pena - 0.1, 1.5, E.inOutCubic);
  s += quillInk(1660, 110, 1.15, { p: penP, rot: -8 });
  // Antique coins: standard copper coin and VOC gobog with square hole
  s += oldCoin(1320, 220, 1.25, { label: '1790', hole: false, rot: 12 });
  s += oldCoin(1510, 235, 1.25, { label: 'JAVA', hole: true, rot: -8 });
  return s;
}

function station3(t) {
  let s = '';
  s += sheet(3000, 0, 920, 720, { rot: -1, seed: 11 });
  s += timelineRibbon(2650, 3350, -260, {
    p: P(t, K.s3, 0.9, E.outCubic),
    label: 'EKSPEDISI MARITIM',
    year: '1808',
  });
  s += lantern(2760, 60, 1.25, { t, lit: true, swing: 1 });
  const needleAngle = 28 * Math.sin(t * 1.8);
  s += compass(3240, 60, 1.1, { angle: needleAngle });
  s += spyglass(3000, 260, 1.05, { rot: -6 });
  return s;
}

function station4(t) {
  let s = '';
  s += sheet(4500, 0, 960, 750, { rot: 2, seed: 15 });
  // Tall sailing ship & naval cannon on the upper table
  s += tallShip(4340, -180, 0.85, { rot: 0, waves: true });
  s += cannon(4700, -160, 0.95, { rot: -5 });
  // Three spice sacks: cloves, nutmeg, black pepper
  s += spiceSack(4220, 130, 1.1, { kind: 'cengkih' });
  s += spiceSack(4480, 140, 1.1, { kind: 'pala' });
  s += spiceSack(4740, 130, 1.1, { kind: 'lada' });
  return s;
}

function threadLink(t) {
  if (t < K.s5 - 0.4) return '';
  const pts = [
    [0, 0],
    [1500, 0],
    [3000, 0],
    [4500, 0],
  ];
  let s = '';
  const p = P(t, K.s5 - 0.1, 1.0, E.outCubic);
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const q = clamp((p - (i - 1) * 0.3) / 0.3);
    if (q <= 0) continue;
    const curX = lerp(x0, x1, q), curY = lerp(y0, y1, q) + 60 * Math.sin(q * Math.PI);
    s += `<path d="M${x0},${y0} Q${f((x0 + curX) / 2)},${f((y0 + curY) / 2 + 50)} ${f(curX)},${f(curY)}" fill="none" stroke="${HIST.redInk}" stroke-width="7" opacity="0.8"/>`;
  }
  return s;
}

function drawWorld(t, cam) {
  let s = '';
  // Near culling to keep rendering fast
  const visible = x => Math.abs(cam.x - x) < 1400 / cam.z + 400;
  if (visible(0)) s += station1(t);
  if (visible(1500)) s += station2(t);
  if (visible(3000)) s += station3(t);
  if (visible(4500)) s += station4(t);
  s += threadLink(t);
  return s;
}

function drawOverlay(t) {
  let s = '';
  s += cite('Sumber: ANRI & Museum Nasional Indonesia', t, K.s1, K.s2 - 0.1);
  s += cite('Arsip VOC & Perjanjian Bersejarah', t, K.s2, K.s3 - 0.1);
  s += cite('Catatan Pelayaran Nusantara Abad 18–19', t, K.s3, K.s4 - 0.1);
  s += cite('Sejarah Jalur Rempah Kepulauan Maluku', t, K.s4, K.s5 - 0.1);
  return s;
}

function drawThumbnail() {
  const t = 1.0;
  let w = '';
  w += oldMap(0, 0, 960, 720, { seed: 3, rose: true, grid: true });
  w += lantern(-280, -180, 1.25, { t: 0.5, lit: true });
  w += compass(280, -180, 1.15, { angle: 15 });
  w += sealedLetter(-180, 160, 1.1, { open: 0.2, label: 'ARSIP', rot: -4 });
  w += quillInk(200, 180, 1.2, { p: 0.85, rot: -6 });
  w += oldCoin(0, 260, 1.3, { label: '1790', hole: false });

  let ui = titleText('PROPS VISUAL\n*SEJARAH*', 540, 360, 88);
  return { world: G('translate(540 1020) scale(1.05)', 1, w), ui };
}
