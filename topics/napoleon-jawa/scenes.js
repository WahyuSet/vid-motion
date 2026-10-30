// Topic: Napoleon tidak pernah ke Jawa, tapi jejaknya masih kamu lewati (napoleon-jawa)
// Channel: Sejarah (theme arsip, no mascot, realistic props drawn in code on aged parchment)
// A continuous archive table seen from above:
//   Station 1 (x 0, y 0): Old Java map, Napoleon's bicorne hat silhouette with cockade, Anyer start
//   Station 2 (x 1350, y -60): 1806 timeline ribbon, Royal Decree of Kingdom of Holland, Louis Bonaparte
//   Station 3 (x 2500, y 40): Appointment decree of Daendels 1808, brass nautical compass, sailing ship
//   Station 4 (x 3650, y -80): Brass spyglass telescope, horizon watch, British warship silhouettes
//   Station 5 (x 4850, y 20): De Grote Postweg 1.000 km dynamic route trace Anyer to Panarukan
//   Station 6 (x 6000, y -40): Corvee labor (rodi) tools, pickaxe, ballast stones basket, historical ledger
//   Station 7 (x 7200, y 60): 1810 French Imperial annexation decree, tricolor ribbon, Java French territory
//   Station 8 (x 8400, y -60): 1811 British invasion armada, naval cannon, landing at Batavia
//   Station 9 (x 9600, y 30): Capitulation of Tuntang treaty document, dual wax seals, 18 September 1811
//   Station 10 (x 0, y 0): Red investigative thread linking all evidence, returning to Anyer milestone (loop)

Object.assign(C, {
  sheet: ['#F7EED8', '#EBD8B3', '#D6BE90'],
  sheetLight: ['#FAF4E4', '#F0E2C4', '#DFCCA4'],
  sepia: '#5A4126', sepiaLo: '#8C6E4A', ink2: '#3A2A1A',
  redInk: '#9E2A1E', redWax: ['#C84236', '#9E2A1E', '#5E140E'],
  string: '#B4261A', gold: ['#F5DA8E', '#CF9F42', '#825C1E'],
  wood: ['#8A5932', '#5E381C', '#3A2010'],
  brass: ['#EAD186', '#B88A34', '#6A4A16'],
  iron: ['#6B7280', '#4B5260', '#2B313D'],
  card: '#FBF5E4', rule: '#A0B4C6',
  tricolorBlue: '#1F3A60', tricolorWhite: '#F2EFEB', tricolorRed: '#9E2A1E',
});

let K = {};
const DEFS = '';



// ---------- Station 1: Old Java Map & Napoleon Bicorne Silhouette ----------

function javaPath() {
  // Artistic silhouette coordinates of Java Island stretching W-to-E (~1200 px wide)
  return 'M-560,-20 ' +
    'C-540,-55 -480,-65 -430,-45 ' + // Anyer / Banten
    'C-380,-70 -310,-80 -250,-50 ' + // Batavia / Sunda Kelapa
    'C-190,-75 -120,-60 -70,-35 ' +  // Cirebon / Tegal
    'C-20,-70 60,-65 120,-30 ' +     // Pekalongan / Semarang
    'C160,-75 220,-85 270,-45 ' +    // Jepara / Rembang
    'C320,-75 390,-60 440,-25 ' +    // Tuban / Gresik
    'C480,-50 510,-30 550,-10 ' +    // Surabaya / Madura strait
    'C580,-5 610,-20 650,25 ' +      // Probolinggo / Panarukan
    'C680,60 670,110 630,120 ' +     // East horn / Blambangan
    'C570,135 520,95 460,85 ' +      // South coast East Java
    'C380,95 320,115 250,90 ' +      // South coast Central
    'C170,110 110,80 40,75 ' +       // South coast Yogyakarta
    'C-30,105 -110,125 -190,95 ' +   // South coast Priangan
    'C-280,120 -370,100 -450,75 ' +  // South coast Pelabuhan Ratu
    'C-520,65 -560,25 -560,-20 Z';   // Ujung Kulon close
}

function oldJavaMap(t, withRoute = false) {
  let m = '';
  // Vintage maritime grid & compass rhumb lines
  for (let a = 0; a < 8; a++) {
    const ang = a * Math.PI / 4;
    m += `<line x1="0" y1="0" x2="${f(700 * Math.cos(ang))}" y2="${f(380 * Math.sin(ang))}" stroke="${C.sepiaLo}" stroke-width="1.2" stroke-dasharray="8 6" opacity="0.35"/>`;
  }
  // Java Island landmass with soft shaded coast and hatching
  const jp = javaPath();
  m += `<path d="${jp}" fill="#E8D9B6" stroke="${C.sepia}" stroke-width="4.5"/>`;
  m += `<path d="${jp}" fill="none" stroke="#7A5E3A" stroke-width="12" opacity="0.25" filter="url(#b4)"/>`;

  // Wave ripple lines along the coast
  for (let d = 8; d <= 22; d += 7) {
    m += `<path d="${jp}" fill="none" stroke="${C.sepiaLo}" stroke-width="1.2" opacity="${f(0.45 - d * 0.012)}" transform="scale(${f(1 + d / 600)})"/>`;
  }

  // Mountain ranges relief shading (Priangan, Merapi, Semeru)
  const peaks = [
    [-340, 25, 42], [-220, 20, 48], [-120, 15, 36],
    [50, 10, 52], [140, 22, 45], [320, 30, 56], [480, 40, 60]
  ];
  peaks.forEach(([px, py, pr]) => {
    m += `<path d="M${px - pr},${py + 18} L${px},${py - pr * 0.75} L${px + pr},${py + 18}" fill="none" stroke="${C.sepia}" stroke-width="2.5" opacity="0.6"/>` +
      `<path d="M${px},${py - pr * 0.75} L${px + pr * 0.4},${py + 18}" fill="none" stroke="${C.sepia}" stroke-width="1.5" opacity="0.45"/>`;
  });

  // Key coastal cities & forts
  const towns = [
    [-470, -28, 'Anyer', true],
    [-290, -42, 'Batavia', true],
    [-85, -28, 'Cirebon', false],
    [95, -24, 'Semarang', true],
    [465, -12, 'Surabaya', false],
    [620, 25, 'Panarukan', true],
  ];
  towns.forEach(([tx, ty, name, major]) => {
    m += `<circle cx="${tx}" cy="${ty}" r="${major ? 5.5 : 4}" fill="${C.redInk}"/>` +
      `<circle cx="${tx}" cy="${ty}" r="${major ? 9 : 7}" fill="none" stroke="${C.redInk}" stroke-width="1.5"/>` +
      typed(name, tx, ty - 16, major ? 22 : 18, C.ink2, 'middle', 700);
  });

  // Animated red ink route of Grote Postweg (when withRoute is true)
  if (withRoute) {
    const p = P(t, K.pos5 - 0.2, 1.8, E.outCubic);
    const routeD = 'M-470,-28 Q-380,-38 -290,-42 Q-180,-30 -85,-28 Q0,-25 95,-24 Q280,-20 465,-12 Q540,5 620,25';
    if (p > 0.001) {
      m += `<path d="${routeD}" pathLength="1" fill="none" stroke="${C.redInk}" stroke-width="8" stroke-linecap="round" stroke-dasharray="1 2" stroke-dashoffset="${f(1 - p)}"/>`;
      m += `<path d="${routeD}" pathLength="1" fill="none" stroke="#FFD850" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 2" stroke-dashoffset="${f(1 - p)}" opacity="0.8"/>`;
      // Milestone markers at Anyer and Panarukan
      m += G(T(-470, -65), clamp(p * 3),
        `<rect x="-42" y="-18" width="84" height="36" rx="4" fill="${C.redInk}"/>` +
        typed('0 KM', 0, 1, 20, '#fff', 'middle', 700));
      if (p > 0.85) {
        const pEnd = clamp((p - 0.85) / 0.15);
        m += G(T(620, -18, pEnd), pEnd,
          `<rect x="-56" y="-18" width="112" height="36" rx="4" fill="${C.redInk}"/>` +
          typed('1.000 KM', 0, 1, 20, '#fff', 'middle', 700));
      }
    }
  }

  // Map header and compass rose
  m += serif('INSULA IAVA', 0, -220, 36, C.ink2, 800, 'middle', 'letter-spacing="6"') +
    serif('Kaart van het Eiland Java', 0, -178, 22, C.sepia, 600, 'middle', 'font-style="italic"');
  m += G(T(420, -180), 0.85,
    `<circle r="44" fill="none" stroke="${C.sepia}" stroke-width="2"/>` +
    `<path d="M0,-54 L8,0 L0,54 L-8,0 Z" fill="${C.redInk}"/>` +
    `<path d="M-54,0 L0,-8 L54,0 L0,8 Z" fill="${C.sepia}" opacity="0.7"/>` +
    serif('N', 0, -68, 20, C.redInk, 800));

  return sheet(0, 0, 1180, 680, -2, m, { seed: 15 });
}

function bicorneHat(x, y, s = 1, rot = 0) {
  // Napoleon's iconic black felt bicorne hat silhouette with French tricolor cockade
  const d = 'M-175,35 ' +
    'C-140,-15 -80,-65 0,-70 ' +
    'C80,-65 140,-15 175,35 ' +
    'C110,15 50,5 0,5 ' +
    'C-50,5 -110,15 -175,35 Z';
  const brim = 'M-180,35 C-90,65 90,65 180,35 C110,48 -110,48 -180,35 Z';

  let h = dropShadow(d, 14, 18, 0.42);
  h += `<path d="${d}" fill="#24211E"/>`;
  h += `<path d="${brim}" fill="#1B1917" stroke="#12100E" stroke-width="2"/>`;
  h += `<path d="M-150,22 C-60,-40 60,-40 150,22" fill="none" stroke="${C.gold[1]}" stroke-width="4.5" opacity="0.75"/>`;

  // French revolutionary tricolor cockade pleated rosette
  h += G(T(-28, -22), 1,
    `<circle r="25" fill="${C.tricolorRed}" stroke="#1E1E1E" stroke-width="2"/>` +
    `<circle r="18" fill="${C.tricolorWhite}"/>` +
    `<circle r="11" fill="${C.tricolorBlue}"/>` +
    `<path d="M0,-32 L0,-24 M18,-18 L12,-12 M24,0 L16,0" stroke="${C.gold[1]}" stroke-width="3"/>`);

  return G(T(x, y, s, rot), 1, h);
}

// ---------- Station 2: 1806 Timeline Ribbon & Louis Bonaparte Decree ----------



function royalDecree1806(t) {
  let inner = serif('WETBOEK & BESLUIT', 0, -220, 30, C.ink2, 800, 'middle', 'letter-spacing="3"');
  inner += serif('Koninkrijk Holland', 0, -178, 38, C.redInk, 900, 'middle', 'font-style="italic"');
  inner += `<path d="M-190,-146 L190,-146" stroke="${C.sepia}" stroke-width="2"/>`;

  // Crown symbol
  inner += G(T(0, -100), 0.9,
    `<path d="M-40,24 L40,24 L48,-18 L24,2 L0,-24 L-24,2 L-48,-18 Z" fill="${C.gold[1]}" stroke="${C.gold[2]}" stroke-width="2.5"/>` +
    `<circle cx="0" cy="-28" r="5" fill="${C.gold[0]}"/><circle cx="-48" cy="-22" r="4" fill="${C.gold[0]}"/><circle cx="48" cy="-22" r="4" fill="${C.gold[0]}"/>`);

  const lines = [
    'Louis Napoleon Bonaparte',
    'Aangesteld als Koning van Holland',
    'Den 5den Junij 1806 te Parijs',
    'Door Keizer Napoleon I',
  ];
  lines.forEach((l, i) => {
    inner += typed(l, 0, -30 + i * 36, i === 0 ? 25 : 21, i === 0 ? C.ink2 : C.sepia, 'middle', i === 0 ? 700 : 400);
  });

  for (let k = 0; k < 3; k++) {
    inner += `<path d="M-210,${130 + k * 22} L${150 - k * 50},${130 + k * 22}" stroke="${C.sepiaLo}" stroke-width="2" opacity="0.4"/>`;
  }
  inner += waxSeal(140, 180, 'L', 0.95);
  return sheet(1350, 40, 560, 620, 2, inner, { seed: 19 });
}

// ---------- Station 3: Daendels Appointment 1808 & Tall Sailing Ship ----------





// ---------- Station 4: Brass Spyglass Telescope & British Warships ----------



function horizonFleet(t) {
  let s = '';
  const bob = 4 * Math.sin(t * 3.5);
  // Three British warships on the horizon
  [[-140, 10, 0.75], [0, -10, 0.95], [150, 15, 0.7]].forEach(([fx, fy, fs], i) => {
    s += G(T(fx, fy + bob * (i % 2 === 0 ? 1 : -0.7), fs), 1,
      tallShipSilhouette(0, 0, 0.65) +
      // Small British Red Ensign flag
      `<rect x="75" y="-70" width="32" height="20" fill="${C.redInk}"/>` +
      `<rect x="75" y="-70" width="14" height="10" fill="${C.tricolorBlue}"/>` +
      `<path d="M75,-65 L89,-65 M82,-70 L82,-60" stroke="#fff" stroke-width="1.8"/>`);
  });
  return G(T(0, 0), 1, s);
}

// ---------- Station 6: Corvee Labor (Rodi) Tools & Ledger ----------

function rodiTools(x, y, s = 1) {
  let g = '';
  // Woven rattan basket for carrying crushed river stones
  g += G(T(70, 45, 0.95), 1,
    `<ellipse cx="10" cy="14" r="85" fill="#000" opacity="0.3" filter="url(#b10)"/>` +
    `<ellipse cx="0" cy="0" rx="80" ry="52" fill="#BFA36F" stroke="#7A5E3A" stroke-width="4"/>` +
    `<ellipse cx="0" cy="0" rx="68" ry="42" fill="#7D6541"/>` +
    // Crushed broken rocks inside basket
    [[-32, -8], [-8, -14], [16, -6], [-18, 12], [24, 10], [2, 4]].forEach(([rx, ry], i) => {
      g += `<polygon points="${rx - 16},${ry + 10} ${rx},${ry - 14} ${rx + 18},${ry + 4} ${rx + 8},${ry + 16}" fill="${i % 2 === 0 ? '#9CA3AF' : '#6B7280'}" stroke="#374151" stroke-width="1.5"/>`;
    }));

  // Heavy iron pickaxe crossed with spade
  g += G(T(-45, -20), 1,
    // Wooden shaft
    `<line x1="-120" y1="140" x2="80" y2="-90" stroke="${C.wood[0]}" stroke-width="12" stroke-linecap="round"/>` +
    `<line x1="-120" y1="140" x2="80" y2="-90" stroke="${C.wood[2]}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>` +
    // Curved iron head of pickaxe
    `<path d="M40,-125 C65,-100 85,-65 110,-45 L95,-35 C75,-55 55,-85 30,-115 Z" fill="${C.iron[1]}" stroke="${C.iron[2]}" stroke-width="2.5"/>` +
    `<path d="M42,-120 L80,-90 L68,-80 L30,-110 Z" fill="${C.iron[0]}"/>`);

  return G(T(x, y, s), 1, g);
}

// ---------- Station 8: Naval Cannon Prop ----------



// ---------- Station 9: Capitulation of Tuntang Document ----------

function capitulationDocument(t) {
  let inner = serif('CAPITULATION OF JAVA', 0, -225, 28, C.ink2, 800, 'middle', 'letter-spacing="3"');
  inner += serif('Onderteekend te Toentang', 0, -185, 34, C.redInk, 900, 'middle', 'font-style="italic"');
  inner += `<path d="M-210,-154 L210,-154" stroke="${C.sepia}" stroke-width="2"/>`;

  const articles = [
    'Art. I. Het geheele Eiland Java geeft zich over.',
    'Art. II. Alle Fransche en Hollandsche troepen',
    'worden krijgsgevangenen van Zijne Britsche Majesteit.',
    'Gegeven te Tuntang, 18 September 1811.',
  ];
  articles.forEach((a, i) => {
    inner += typed(a, -210, -100 + i * 36, 19, C.ink2, 'start', i === 3 ? 700 : 400);
  });

  // Dual signatures: Jan Willem Janssens (NL/FR) & Samuel Auchmuty (GB)
  inner += G(T(-110, 110), 1,
    serif('J. W. Janssens', 0, 0, 32, C.sepia, 700, 'middle', 'font-style="italic"') +
    typed('Gouverneur-Generaal', 0, 36, 17, C.sepiaLo, 'middle') +
    waxSeal(0, 95, 'J', 0.82));

  inner += G(T(110, 110), 1,
    serif('S. Auchmuty', 0, 0, 32, C.sepia, 700, 'middle', 'font-style="italic"') +
    typed('Lieutenant-General', 0, 36, 17, C.sepiaLo, 'middle') +
    waxSeal(0, 95, 'GB', 0.82));

  return sheet(9600, 30, 580, 640, -1.5, inner, { seed: 27, cols: C.sheetLight });
}

// ---------- Red Investigative Thread Across All 10 Stations ----------

const PINS = [
  [-470, -28], [0, 40], [1350, 40], [2500, -80], [3650, -40],
  [4850, 40], [6000, 40], [7200, 60], [8400, -40], [9600, 30]
];

function investigativeThread(t) {
  if (t < K.s10 - 0.4) return '';
  let s = '';
  for (let i = 1; i < PINS.length; i++) {
    const p = P(t, K.s10 + 0.1 + i * 0.1, 0.3, E.outCubic);
    if (p <= 0.001) continue;
    const [ax, ay] = PINS[i - 1], [bx, by] = PINS[i];
    const ex = lerp(ax, bx, p), ey = lerp(ay, by, p);
    const mx = (ax + ex) / 2, my = (ay + ey) / 2 + 55 * p;
    s += `<path d="M${ax},${ay} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}" fill="none" stroke="#000" stroke-width="14" opacity="0.25" filter="url(#b4)" transform="translate(6 10)"/>` +
      `<path d="M${ax},${ay} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}" fill="none" stroke="${C.string}" stroke-width="8.5"/>`;
  }
  // Smooth fade before final loop frame so frame 0 matches exactly
  return G('', 1 - P(t, K.loop + 0.1, 0.7), s + PINS.map(([px, py]) => pushPin(px, py)).join(''));
}

// ---------- Setup, Camera, Headlines, Chapters, Cues ----------

const ICON = {
  bicorne: () => `<path d="M-18,6 C-12,-4 -6,-12 0,-14 C6,-12 12,-4 18,6 C10,3 -10,3 -18,6 Z" fill="${C.accent}"/><circle cx="-4" cy="-3" r="3.5" fill="${C.redInk}"/>`,
  scroll: () => `<rect x="-14" y="-18" width="28" height="36" rx="3" fill="#F4EDDA" stroke="${C.sepia}" stroke-width="2"/><circle cx="0" cy="8" r="6" fill="${C.redInk}"/>`,
  road: () => `<path d="M-16,16 L-8,-16 L8,-16 L16,16 Z" fill="${C.sepiaLo}"/><line x1="0" y1="12" x2="0" y2="-12" stroke="#fff" stroke-width="3" stroke-dasharray="4 4"/>`,
  seal: () => `<circle r="18" fill="${C.redInk}" stroke="${C.gold[1]}" stroke-width="2.5"/><path d="M-8,-4 L0,-12 L8,-4 L5,10 L-5,10 Z" fill="${C.gold[0]}"/>`,
};

function setup(D) {
  const s = D.scenes;
  K = {
    s1: s[0].start, jejak1: s[0].at('jejaknya'), lewati1: s[0].at('lewati'),
    s2: s[1].start, y1806: s[1].at('1806'), belanda2: s[1].at('belanda'),
    s3: s[2].start, daendels3: s[2].at('daendels'), y1808: s[2].at('1808'),
    s4: s[3].start, tugas4: s[3].at('tugasnya'), inggris4: s[3].at('inggris'),
    s5: s[4].start, pos5: s[4].at('pos'), seribu5: s[4].at('seribu'), panarukan5: s[4].at('panarukan'),
    s6: s[5].start, paksa6: s[5].at('paksa'), tewas6: s[5].at('tewas'),
    s7: s[6].start, y1810: s[6].at('1810'), prancis7: s[6].at('prancis'),
    s8: s[7].start, y1811: s[7].at('1811'), mendarat8: s[7].at('mendarat'),
    s9: s[8].start, tuntang9: s[8].at('tuntang'), sep1811: s[8].at('18'),
    s10: s[9].start, kini10: s[9].at('kini'), anyer10: s[9].at('anyer'),
    loop: D.total - 1.5, total: D.total
  };

  const home = { x: 0, y: 0, z: 1.05 };
  setCamera([
    home,
    { at: K.jejak1 - 0.2, dur: 0.6, x: -140, y: -20, z: 1.15 },
    { at: K.s2 - 0.2, dur: 0.85, x: 1350, y: -30, z: 1.02 },
    { at: K.s3 - 0.2, dur: 0.85, x: 2500, y: 20, z: 1.0 },
    { at: K.s4 - 0.2, dur: 0.85, x: 3650, y: -40, z: 1.05 },
    { at: K.s5 - 0.25, dur: 0.95, x: 4850, y: 0, z: 0.96 },
    { at: K.seribu5 - 0.2, dur: 0.65, x: 4950, y: 30, z: 1.06 },
    { at: K.s6 - 0.2, dur: 0.85, x: 6000, y: -20, z: 1.02 },
    { at: K.s7 - 0.2, dur: 0.85, x: 7200, y: 30, z: 1.0 },
    { at: K.s8 - 0.2, dur: 0.85, x: 8400, y: -40, z: 1.02 },
    { at: K.s9 - 0.2, dur: 0.85, x: 9600, y: 15, z: 1.02 },
    { at: K.s10 - 0.25, dur: 1.15, x: 4800, y: 0, z: 0.18 }, // Cinematic full-table investigative overview!
    { at: K.anyer10 - 0.35, dur: 1.25, ...home },
    { at: K.loop, dur: 1.1, ...home }
  ]);

  setHeadlines([
    { at: -0.6, end: K.s2 - 0.1, text: 'NAPOLEON\n*DI JAWA?*' },
    { at: K.y1806, end: K.s3 - 0.1, text: '*1806*: LOUIS\nRAJA BELANDA' },
    { at: K.daendels3, end: K.s4 - 0.1, text: 'DAENDELS *TIBA*\nDI JAWA 1808' },
    { at: K.tugas4, end: K.s5 - 0.1, text: 'TAHAN SERANGAN\n*INGGRIS*' },
    { at: K.seribu5 - 0.2, end: K.s6 - 0.1, text: 'JALAN RAYA POS:\n*±1.000 KM*', hype: true },
    { at: K.paksa6, end: K.s7 - 0.1, text: 'DIKERJAKAN LEWAT\n*KERJA PAKSA*' },
    { at: K.y1810, end: K.s8 - 0.1, text: '1810: JAWA MASUK\n*KEKAISARAN PRANCIS*' },
    { at: K.y1811, end: K.s9 - 0.1, text: '1811: ARMADA\n*INGGRIS MENDARAT*' },
    { at: K.tuntang9, end: K.s10 - 0.1, text: 'KAPITULASI *TUNTANG*\n18 SEP 1811' },
    { at: K.kini10, end: K.loop + 0.3, text: 'JEJAKNYA\n*MASIH ADA*' }
  ]);

  setChapters([
    { at: -0.5, icon: ICON.bicorne },
    { at: K.s3, icon: ICON.scroll },
    { at: K.s5, icon: ICON.road },
    { at: K.s7, icon: ICON.seal }
  ], { at: K.kini10, end: K.loop });
}

function cues(D) {
  return [
    [0.12, 'click'], [K.jejak1, 'pop'],
    [K.s2 - 0.2, 'whoosh'], [K.y1806, 'tick'],
    [K.s3 - 0.2, 'whoosh'], [K.daendels3, 'pop'], [K.y1808 + 0.1, 'thud'],
    [K.s4 - 0.2, 'whoosh'], [K.inggris4, 'pop'],
    [K.s5 - 0.25, 'whoosh'], [K.seribu5, 'ding'],
    [K.s6 - 0.2, 'whoosh'], [K.paksa6 + 0.1, 'thud'],
    [K.s7 - 0.2, 'whoosh'], [K.y1810, 'tick'], [K.prancis7 + 0.1, 'thud'],
    [K.s8 - 0.2, 'whoosh'], [K.mendarat8, 'zap'],
    [K.s9 - 0.2, 'whoosh'], [K.tuntang9 + 0.1, 'thud'], [K.sep1811, 'ding'],
    [K.s10 - 0.25, 'whoosh'], [K.anyer10, 'pop'],
    [K.loop, 'whoosh']
  ];
}

// ---------- Main World Drawing ----------

function drawWorld(t, cam) {
  const far = cam.z < 0.45;
  const near = (x, y, r = 1100) => far || (Math.abs(cam.x - x) < r / cam.z + 400 && Math.abs(cam.y - y) < 1600 / cam.z);

  let s = DEFS;

  // Station 1: Java Map & Napoleon Bicorne
  if (near(0, 0)) {
    s += oldJavaMap(t, false);
    s += bicorneHat(260, -90, 1.25, -6);
    const q1 = pop(t, K.jejak1 - 0.1, 0.45);
    const back = 1 - P(t, K.loop + 0.05, 0.55);
    if (q1.o > 0.001 && back > 0.001) {
      s += G(T(-310, -180, q1.s), q1.o * back,
        indexCard(0, 0, 380, 170, 5, [
          ['NAPOLEON BONAPARTE', 28],
          ['Kaisar Prancis', 24],
          ['Tak pernah ke Jawa', 24, C.redInk]
        ]));
    }
  }

  // Station 2: 1806 Louis Bonaparte & Kingdom of Holland
  if (near(1350, 0)) {
    s += timelineRibbon(1050, 1650, -280, t, K.y1806, 'KONINKRIJK HOLLAND', '1806');
    s += royalDecree1806(t);
    const q2 = pop(t, K.belanda2 - 0.1, 0.4);
    if (q2.o > 0.001) {
      s += G(T(1120, 240, q2.s), q2.o,
        indexCard(0, 0, 360, 160, -4, [
          ['LOUIS BONAPARTE', 28],
          ['Adik Napoleon', 24],
          ['Raja Belanda 1806', 24, C.redInk]
        ]));
    }
  }

  // Station 3: Daendels 1808 & Tall Sailing Ship
  if (near(2500, 0)) {
    s += sheet(2460, -110, 560, 480, -3,
      serif('BESLUIT VAN DEN KONING', 0, -170, 30, C.ink2, 800) +
      serif('H. W. Daendels', 0, -120, 36, C.redInk, 900, 'middle', 'font-style="italic"') +
      `<path d="M-190,-90 L190,-90" stroke="${C.sepia}" stroke-width="2"/>` +
      typed('Aangesteld tot Gouverneur-Generaal', -190, -45, 20, C.ink2) +
      typed('van Nederlandsch-Indie', -190, -15, 20, C.ink2) +
      typed('Datum van aankomst te Batavia:', -190, 45, 20, C.sepia) +
      serif('Januari 1808', -190, 85, 34, C.redInk, 800, 'start') +
      waxSeal(150, 140, 'D', 0.9), { seed: 11 });

    s += tallShipSilhouette(2700, 270, 1.15, 2);
    s += nauticalCompass(2180, 240, 1.05);
  }

  // Station 4: British Threat & Spyglass
  if (near(3650, 0)) {
    s += sheet(3650, -220, 620, 300, 2,
      serif('INSTRUCTIE AAN DEN MAARSCHALK', 0, -90, 26, C.ink2, 800) +
      `<path d="M-220,-65 L220,-65" stroke="${C.sepia}" stroke-width="2"/>` +
      typed('Verdedig het eiland Java tegen', -220, -20, 22, C.ink2) +
      typed('de Engelsche vloot en aanvallen.', -220, 15, 22, C.ink2) +
      typed('Prioriteit: Kustbatterijen & Wegen', -220, 60, 20, C.redInk), { seed: 23 });

    s += G(T(3650, 110), 1, horizonFleet(t));
    s += spyglass(3650, 300, 1.15, -8);
  }

  // Station 5: De Grote Postweg 1.000 KM Route Trace
  if (near(4850, 0)) {
    s += G(T(4850, 20), 1, oldJavaMap(t, true));
    const q5 = pop(t, K.seribu5 - 0.1, 0.45);
    if (q5.o > 0.001) {
      s += G(T(4850, -260, q5.s), q5.o,
        `<rect x="-240" y="-45" width="480" height="90" rx="10" fill="${C.card}" stroke="${C.redInk}" stroke-width="3"/>` +
        serif('DE GROTE POSTWEG', 0, -12, 28, C.ink2, 800) +
        serif('ANYER — PANARUKAN ±1.000 KM', 0, 22, 22, C.redInk, 700));
    }
  }

  // Station 6: Corvee Labor (Rodi) & Tools
  if (near(6000, 0)) {
    s += sheet(5960, -140, 560, 460, -2,
      serif('STATEN DER HERENDIENSTEN', 0, -160, 28, C.ink2, 800) +
      serif('Kerja Rodi Pembangunan Jalan', 0, -118, 30, C.redInk, 800, 'middle', 'font-style="italic"') +
      `<path d="M-190,-88 L190,-88" stroke="${C.sepia}" stroke-width="2"/>` +
      typed('Dwangarbeid langs het traject', -190, -40, 21, C.ink2) +
      typed('Harde omstandigheden in het gebergte', -190, -5, 21, C.ink2) +
      typed('en moerassen der noordkust.', -190, 30, 21, C.ink2) +
      typed('Vele arbeiders bezweken aan ziekte.', -190, 75, 20, C.redInk), { seed: 17 });

    s += rodiTools(6080, 220, 1.1);
  }

  // Station 7: 1810 French Imperial Annexation
  if (near(7200, 0)) {
    let dec = serif('DECRET IMPERIAL', 0, -180, 32, C.ink2, 800, 'middle', 'letter-spacing="4"');
    dec += serif('Napoléon, Empereur des Français', 0, -135, 34, C.redInk, 900, 'middle', 'font-style="italic"');
    dec += `<path d="M-210,-100 L210,-100" stroke="${C.sepia}" stroke-width="2"/>`;
    dec += typed('Palais de Saint-Cloud, 9 Juillet 1810', -210, -55, 20, C.sepia);
    dec += typed('Art. 1. La Hollande est réunie', -210, -15, 23, C.ink2, 'start', 700);
    dec += typed('a l Empire Français.', -210, 15, 23, C.ink2, 'start', 700);
    dec += typed('Jawa resmi menjadi tanah jajahan', -210, 65, 21, C.redInk);
    dec += typed('Kekaisaran Pertama Prancis.', -210, 95, 21, C.redInk);
    dec += waxSeal(140, 145, 'N', 0.95);
    s += sheet(7200, 0, 580, 580, 2.5, dec, { seed: 25 });

    // Tricolor ribbon banner across bottom
    s += G(T(7200, 330), 1,
      `<rect x="-180" y="-18" width="120" height="36" fill="${C.tricolorBlue}"/>` +
      `<rect x="-60" y="-18" width="120" height="36" fill="${C.tricolorWhite}" stroke="#E5E7EB"/>` +
      `<rect x="60" y="-18" width="120" height="36" fill="${C.tricolorRed}"/>` +
      dropShadow(rectD(-180, -18, 360, 36, 4), 6, 8, 0.25));
  }

  // Station 8: 1811 British Invasion Armada
  if (near(8400, 0)) {
    s += sheet(8360, -180, 580, 360, -3,
      serif('BRITISH EXPEDITION TO JAVA', 0, -120, 28, C.ink2, 800) +
      serif('Agustus 1811', 0, -78, 34, C.redInk, 800, 'middle', 'font-style="italic"') +
      `<path d="M-210,-48 L210,-48" stroke="${C.sepia}" stroke-width="2"/>` +
      typed('Armada pimpinan Lord Minto', -210, -5, 22, C.ink2) +
      typed('& Sir Samuel Auchmuty', -210, 28, 22, C.ink2) +
      typed('mendarat di Cilincing, Batavia.', -210, 65, 21, C.redInk), { seed: 33 });

    s += cannonProp(8460, 170, 1.25, 4);
  }

  // Station 9: Capitulation of Tuntang
  if (near(9600, 0)) {
    s += capitulationDocument(t);
  }

  // Station 10 & Investigative Web Thread
  s += investigativeThread(t);

  return s;
}

// ---------- Overlays, Film Artifacts, Stamps & Citations ----------

function drawOverlay(t) {
  let s = '';

  // Subtle vintage film grain & light dust ticks (12 fps jump)
  const k = Math.floor(t * 12), fl = 0.025 * rnd(k * 7 + 3);
  s += `<rect width="1080" height="1920" fill="#2A1A0A" opacity="${f(fl)}"/>`;

  // Historic Seal Stamps
  if (t > K.y1808 && t < K.s4 + 0.1) {
    s += G('', 1 - P(t, K.s4 - 0.25, 0.25), stamp('ARSIP', t, K.y1808 + 0.1, 480, 1160, C.accent, -7, 92));
  }
  if (t > K.paksa6 && t < K.s7 + 0.1) {
    s += G('', 1 - P(t, K.s7 - 0.25, 0.25), stamp('TERCATAT', t, K.paksa6 + 0.1, 460, 1170, C.accent, -6, 92));
  }
  if (t > K.prancis7 && t < K.s8 + 0.1) {
    s += G('', 1 - P(t, K.s8 - 0.25, 0.25), stamp('ARSIP', t, K.prancis7 + 0.1, 470, 1160, C.accent, 6, 92));
  }
  if (t > K.tuntang9 && t < K.s10 + 0.1) {
    s += G('', 1 - P(t, K.s10 - 0.25, 0.25), stamp('TERCATAT', t, K.tuntang9 + 0.1, 480, 1170, C.accent, -6, 92));
  }

  // Canonical On-Screen Citations
  s += cite('Sumber: Encyclopaedia Britannica (Napoleon I)', t, K.s1, K.s2 - 0.1);
  s += cite('Simon Schama (1977); Britannica (Kingdom of Holland)', t, K.y1806, K.s3 - 0.1);
  s += cite('Historia.id; Prof. Djoko Marihandono (Daendels)', t, K.daendels3, K.s4 - 0.1);
  s += cite('Sumber: Peter Carey, Kuasa Ramalan (2008)', t, K.tugas4, K.s5 - 0.1);
  s += cite('PT Pos Indonesia; Britannica (Grote Postweg)', t, K.pos5, K.s6 - 0.1);
  s += cite('Pramoedya Ananta Toer (2005); BPCB Kemendikbud', t, K.paksa6, K.s7 - 0.1);
  s += cite('Dekret Imperial 9 Juli 1810; M.C. Ricklefs (2008)', t, K.y1810, K.s8 - 0.1);
  s += cite('Britannica (Java War & British Occupation)', t, K.y1811, K.s9 - 0.1);
  s += cite('Naskah Kapitulasi Tuntang 1811 (Koleksi ANRI)', t, K.tuntang9, K.s10 - 0.1);
  s += cite('Kementerian PUPR: Koridor Jalan Nasional Pulau Jawa', t, K.kini10, K.loop);

  return s;
}

// ---------- Thumbnail (1080x1920) ----------

function drawThumbnail() {
  K.pos5 = -10; K.loop = 999;
  let w = DEFS + `<rect width="1080" height="1920" fill="${C.bg}"/>`;
  // Center: Large Old Java Map with Bicorne Hat and Red Postweg Route
  w += G('translate(540 1080) scale(1.08)', 1, oldJavaMap(5, true));
  w += G('translate(760 840) scale(1.35)', 1, bicorneHat(0, 0, 1, -5));
  w += G('translate(310 860) scale(1.15)', 1,
    indexCard(0, 0, 360, 160, 6, [
      ['NAPOLEON DI JAWA?', 28],
      ['Jejak Grote Postweg', 24, C.redInk],
      ['Tahun 1806–1811', 22]
    ]));

  // Red investigative thread connecting Anyer point to card
  w += `<path d="M310,940 Q410,980 500,1050" fill="none" stroke="${C.string}" stroke-width="8"/>` +
    pushPin(310, 940) + pushPin(500, 1050);

  // Big, readable Title above texture in UI layer
  const ui = titleText('NAPOLEON\n*DI TANAH JAWA?*', 540, 390, 136, 960, 24) +
    stamp('ARSIP', 2, 1, 310, 1540, C.accent, -7, 86);

  return { world: w, ui };
}
