// Topic: Bahlil Bidik Pasokan BBM dari India dan China
// Channel: Si Tikus (theme: newsprint, soft plush style, non-partisan analysis)

Object.assign(C, {
  oil: '#1A233A', oilLo: '#0D1322', barrel: '#C8312B', barrelLo: '#8E1F1A',
  petrol: '#2E8B57', petrolLo: '#1E5E3A', steel: '#E2DED6', steelLo: '#C5C0B6',
  card: '#FFFFFF', cardLo: '#F4F2EC', gold: '#F2C14E', goldLo: '#C79A30',
  ocean: '#D8E2EC', land: '#E4DFD5', flagRed: '#D63031', flagYellow: '#F1C40F',
});

const softGrad = (id, a, b, c) =>
  `<radialGradient id="${id}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="${a}"/><stop offset="0.6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;

const DEFS = `<defs>${softGrad('dCard', '#FFFFFF', '#F8F6F2', '#E5E1D7')}` +
  `${softGrad('dBarrel', '#E04A44', C.barrel, C.barrelLo)}` +
  `${softGrad('dGreen', '#48C774', C.petrol, C.petrolLo)}` +
  `${softGrad('dGold', '#F7D678', C.gold, C.goldLo)}` +
  `${softGrad('dSteel', '#F2EFEB', C.steel, C.steelLo)}` +
  `${softGrad('dBlue', '#4A90E2', '#2060B0', '#143C78')}` +
  `<radialGradient id="dShade"><stop offset="0" stop-color="#18223A" stop-opacity="0.25"/><stop offset="1" stop-color="#18223A" stop-opacity="0"/></radialGradient></defs>`;

const shade = (x, y, rx, ry) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#dShade)"/>`;
const newsText = (s, x, y, size, fill = C.ink, weight = 700, anchor = 'middle', extra = '') =>
  `<text x="${f(x)}" y="${f(y)}" font-family="Oswald" font-weight="${weight}" font-size="${f(size)}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="central" ${extra}>${esc(s)}</text>`;

let K = {};
const ICON = {
  pump: () => `<rect x="-14" y="-20" width="28" height="40" rx="4" fill="${C.petrol}"/><circle cx="0" cy="-6" r="6" fill="#fff"/><path d="M14,-6 L22,-6 L22,14" fill="none" ${stroke(3, C.ink)}/>`,
  map: () => `<circle r="22" fill="${C.cool}"/><path d="M-16,-4 Q-4,-18 12,-10 Q16,8 4,16 Q-12,18 -16,-4 Z" fill="${C.leaf}"/><circle cx="0" cy="0" r="22" fill="none" ${stroke(3, C.ink)}/>`,
  barrel: () => `<ellipse cx="0" cy="-14" rx="16" ry="6" fill="${C.accent}"/><rect x="-16" y="-14" width="32" height="28" fill="${C.accent}"/><ellipse cx="0" cy="14" rx="16" ry="6" fill="${C.accentLo || C.accent}"/><ellipse cx="0" cy="-14" rx="16" ry="6" fill="none" ${stroke(2, '#fff')}/>`,
  doc: () => `<rect x="-14" y="-20" width="28" height="40" rx="3" fill="#fff"/><line x1="-8" y1="-10" x2="8" y2="-10" ${stroke(2, C.ink)}/><line x1="-8" y1="-2" x2="8" y2="-2" ${stroke(2, C.ink)}/><line x1="-8" y1="6" x2="4" y2="6" ${stroke(2, C.ink)}/>`,
  shield: () => `<path d="M0,-20 L16,-12 L16,4 Q16,18 0,24 Q-16,18 -16,4 L-16,-12 Z" fill="${C.leaf}"/><path d="M-6,2 L-2,6 L8,-4" fill="none" ${stroke(3, '#fff')}/>`,
};

function setup(D) {
  const s = D.scenes;
  K = {
    s1: s[0].start, impor: s[0].at('impor'), sg: s[0].at('singapura'),
    s2: s[1].start, tgl: s[1].at('26'), bahlil: s[1].at('bahlil'),
    s3: s[2].start, india: s[2].at('india'), china: s[2].at('china'), kontrak: s[2].at('kontrak'),
    s4: s[3].start, butuh: s[3].at('butuh'), jta: s[3].at('1,6'),
    s5: s[4].start, prod: s[4].at('produksi'), rbu: s[4].at('600'), sisa: s[4].at('sisanya'),
    s6: s[5].start, tender: s[5].at('tender'), lama: s[5].at('lama'),
    s7: s[6].start, perpres: s[6].at('perpres'), g2g: s[6].at('antarpemerintah'),
    s8: s[7].start, blu: s[7].at('blu'), pertamina: s[7].at('pertamina'),
    s9: s[8].start, harga: s[8].at('harga'), subsidi: s[8].at('subsidi'), tetap: s[8].at('naik'),
    s10: s[9].start, pantau: s[9].at('pantau'),
    loop: D.total - 1.3,
  };

  const home = { x: -140, y: -160, z: 1.0 };
  setCamera([
    home,
    { at: K.impor - 0.2, dur: 0.8, x: -80, y: -180, z: 1.05 },
    { at: K.s2, dur: 0.9, x: 20, y: -220, z: 1.0 },
    { at: K.s3 - 0.2, dur: 0.9, x: 10, y: -260, z: 1.08 },
    { at: K.s4, dur: 0.8, x: 140, y: -200, z: 1.0 },
    { at: K.s5 + 0.2, dur: 0.8, x: 180, y: -190, z: 1.05 },
    { at: K.s6, dur: 0.8, x: -40, y: -220, z: 1.0 },
    { at: K.s7 - 0.2, dur: 0.9, x: 0, y: -250, z: 1.05 },
    { at: K.s8 + 0.2, dur: 0.8, x: 40, y: -210, z: 1.0 },
    { at: K.s9, dur: 0.8, x: -100, y: -180, z: 1.05 },
    { at: K.loop, dur: 1.2, ...home },
  ]);

  setHeadlines([
    { at: K.impor, end: s[0].end - 0.1, text: 'PERTALITE *IMPOR*\nDARI SINGAPURA?' },
    { at: K.bahlil, end: s[1].end - 0.1, text: 'CARI *PEMASOK BARU*' },
    { at: K.india, end: s[2].end - 0.1, text: 'BIDIK *INDIA* & *CHINA*' },
    { at: K.jta, end: s[3].end - 0.1, text: 'KONSUMSI *1,6 JUTA*\nBAREL PER HARI' },
    { at: K.rbu, end: s[4].end - 0.1, text: 'PRODUKSI *600 RIBU*,\nSISANYA IMPOR' },
    { at: K.tender, end: s[5].end - 0.1, text: 'TENDER B2B DINILAI\n*MAKAN WAKTU*' },
    { at: K.perpres, end: s[6].end - 0.1, text: 'PERPRES 107/2026:\nJALUR *G2G & G2B*' },
    { at: K.blu, end: s[7].end - 0.1, text: 'NEGARA → *BLU*\n→ PERTAMINA' },
    { at: K.harga, end: s[8].end - 0.1, text: 'HARGA BBM SUBSIDI\n*TIDAK NAIK*' },
    { at: K.pantau, end: K.loop + 0.6, text: 'HASIL KUNJUNGAN:\n*KITA PANTAU*' },
  ]);

  setChapters([
    { at: K.impor, icon: ICON.pump },
    { at: K.india, icon: ICON.map },
    { at: K.jta, icon: ICON.barrel },
    { at: K.perpres, icon: ICON.doc },
    { at: K.harga, icon: ICON.shield },
  ], { at: K.pantau, end: D.total });
}

function cues(D) {
  return [
    [K.impor, 'pop'], [K.sg, 'whoosh'],
    [K.s2, 'whoosh'], [K.bahlil, 'tick'],
    [K.s3, 'whoosh'], [K.india, 'pop'], [K.china, 'pop'], [K.kontrak, 'ding'],
    [K.s4, 'whoosh'], [K.jta, 'pop'],
    [K.s5, 'whoosh'], [K.rbu, 'tick'], [K.sisa, 'thud'],
    [K.s6, 'whoosh'], [K.tender, 'tick'], [K.lama, 'thud'],
    [K.s7, 'whoosh'], [K.perpres, 'pop'], [K.g2g, 'thud'],
    [K.s8, 'whoosh'], [K.blu, 'pop'], [K.pertamina, 'tick'],
    [K.s9, 'whoosh'], [K.harga, 'ding'], [K.tetap, 'sparkle'],
    [K.s10, 'whoosh'], [K.pantau, 'pop'], [K.loop, 'whoosh'],
  ];
}

// ---------- drawing helpers (soft plush / newsprint) ----------

// gas station pump (SPBU dispenser)
function spbuPump(x, y, t) {
  let s = shade(x, y + 160, 160, 24);
  // concrete base
  s += `<rect x="${x - 140}" y="${y + 130}" width="280" height="30" rx="8" fill="url(#dSteel)"/>`;
  // main dispenser tower
  s += `<rect x="${x - 100}" y="${y - 180}" width="200" height="310" rx="20" fill="url(#dCard)"/>`;
  // top red band
  s += `<path d="M${x - 100},${y - 140} L${x + 100},${y - 140} L${x + 100},${y - 180} Q${x + 100},${y - 180} ${x + 80},${y - 180} L${x - 80},${y - 180} Q${x - 100},${y - 180} ${x - 100},${y - 160} Z" fill="${C.accent}"/>`;
  s += newsText('SPBU', x, y - 160, 24, '#fff', 700);

  // display screen
  s += `<rect x="${x - 80}" y="${y - 120}" width="160" height="90" rx="10" fill="#18223A"/>`;
  s += newsText('PERTALITE', x, y - 95, 22, C.yellow, 700);
  s += newsText('RON 90', x, y - 68, 30, '#fff', 700);
  s += newsText('Rp 10.000 / L', x, y - 42, 18, '#8CD19D', 500);

  // nozzle holder and hose
  s += `<rect x="${x - 70}" y="${y - 10}" width="140" height="90" rx="12" fill="url(#dGreen)"/>`;
  s += newsText('SUBSIDI', x, y + 18, 22, '#fff', 700);
  s += newsText('STOK AMAN', x, y + 48, 16, C.yellow, 600);

  // black hose on the side
  s += `<path d="M${x + 80},${y + 10} C${x + 140},${y + 40} ${x + 130},${y + 120} ${x + 90},${y + 120}" fill="none" stroke="#222B45" stroke-width="12" stroke-linecap="round"/>`;
  // nozzle handle
  s += `<path d="M${x + 90},${y + 120} L${x + 80},${y + 90} L${x + 100},${y + 70}" fill="none" stroke="${C.accent}" stroke-width="8" stroke-linecap="round"/>`;
  return s;
}

// country card on the geopolitical map
function countryCard(x, y, name, tag, flagCol, t, delay = 0) {
  const p = pop(t, delay, 0.4);
  if (p.o <= 0.01) return '';
  return G(T(x, y, p.s), p.o,
    shade(0, 52, 85, 14) +
    `<rect x="-85" y="-45" width="170" height="90" rx="16" fill="url(#dCard)"/>` +
    `<rect x="-85" y="-45" width="12" height="90" rx="6" fill="${flagCol}"/>` +
    newsText(name, 5, -16, 28, C.ink, 700) +
    `<rect x="-65" y="4" width="130" height="28" rx="6" fill="${C.bg}"/>` +
    newsText(tag, 0, 18, 16, C.muted, 600)
  );
}

// oil barrel stack diagram (1.6 Juta vs 600 Ribu)
function barrelDiagram(cx, cy, t) {
  let s = shade(cx, cy + 180, 260, 24);
  // base platform
  s += `<rect x="${cx - 240}" y="${cy - 220}" width="480" height="390" rx="24" fill="url(#dCard)"/>`;
  s += newsText('KONSUMSI VS PRODUKSI MINYAK', cx, cy - 180, 26, C.muted, 600);
  s += newsText('(Data/pernyataan Menteri ESDM, 26 Okt 2026)', cx, cy - 150, 16, C.muted, 400);

  // Column 1: Total Need (1,6 Juta barel/hari)
  const x1 = cx - 110, yBase = cy + 110;
  const h1 = 200 * P(t, K.jta, 0.6, E.outCubic);
  s += `<rect x="${x1 - 55}" y="${yBase - h1}" width="110" height="${h1}" rx="14" fill="url(#dBlue)"/>`;
  s += newsText('1,6 JUTA', x1, yBase - h1 - 32, 28, C.ink, 700);
  s += newsText('barel / hari', x1, yBase - h1 - 12, 16, C.muted, 500);
  s += newsText('KONSUMSI', x1, yBase + 24, 20, C.ink, 700);

  // Column 2: Domestic Production (600 Ribu barel/hari)
  const x2 = cx + 110;
  const h2 = (200 * (0.6 / 1.6)) * P(t, K.rbu, 0.6, E.outCubic);
  s += `<rect x="${x2 - 55}" y="${yBase - h2}" width="110" height="${h2}" rx="14" fill="url(#dGreen)"/>`;
  s += newsText('~600 RIBU', x2, yBase - h2 - 32, 28, C.petrol, 700);
  s += newsText('barel / hari', x2, yBase - h2 - 12, 16, C.muted, 500);
  s += newsText('PRODUKSI RI', x2, yBase + 24, 20, C.petrol, 700);

  // Gap indicator: Impor ~1 Juta barel
  if (t > K.sisa) {
    const q = P(t, K.sisa, 0.4);
    s += G(T(cx, cy - 10, q), q,
      `<rect x="-95" y="-22" width="190" height="44" rx="22" fill="${C.accent}"/>` +
      newsText('DEFISIT ~1 JUTA IMPOR', 0, 2, 18, '#fff', 700)
    );
  }
  return s;
}

// Flow comparison card: Old B2B Tender vs New G2G (Perpres 107/2026)
function flowComparison(cx, cy, t) {
  let s = shade(cx, cy + 180, 280, 24);
  s += `<rect x="${cx - 260}" y="${cy - 220}" width="520" height="400" rx="24" fill="url(#dCard)"/>`;
  s += newsText('PERUBAHAN SKEMA PENGADAAN ENERGI', cx, cy - 180, 26, C.ink, 700);
  s += newsText('Perpres No. 107 Tahun 2026', cx, cy - 150, 18, C.accent, 600);

  // Step 1: Negara Pemasok (India / China)
  const yRow = cy - 60;
  s += `<rect x="${cx - 230}" y="${yRow}" width="130" height="70" rx="14" fill="url(#dSteel)"/>` +
    newsText('NEGARA', cx - 165, yRow + 24, 18, C.muted, 600) +
    newsText('PEMASOK', cx - 165, yRow + 46, 20, C.ink, 700);

  // Arrow 1
  s += `<path d="M${cx - 90},${yRow + 35} L${cx - 40},${yRow + 35}" fill="none" stroke="${C.accent}" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="M${cx - 48},${yRow + 26} L${cx - 36},${yRow + 35} L${cx - 48},${yRow + 44}" fill="none" stroke="${C.accent}" stroke-width="6" stroke-linecap="round"/>`;

  // Step 2: BLU (Badan Layanan Umum - Pemerintah)
  s += `<rect x="${cx - 30}" y="${yRow}" width="130" height="70" rx="14" fill="${C.accent}"/>` +
    newsText('BLU', cx + 35, yRow + 24, 26, '#fff', 700) +
    newsText('PEMERINTAH', cx + 35, yRow + 48, 14, '#FFE5E5', 600);

  // Arrow 2
  s += `<path d="M${cx + 110},${yRow + 35} L${cx + 150},${yRow + 35}" fill="none" stroke="${C.petrol}" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="M${cx + 142},${yRow + 26} L${cx + 154},${yRow + 35} L${cx + 142},${yRow + 44}" fill="none" stroke="${C.petrol}" stroke-width="6" stroke-linecap="round"/>`;

  // Step 3: Pertamina
  s += `<rect x="${cx + 160}" y="${yRow}" width="90" height="70" rx="14" fill="url(#dGreen)"/>` +
    newsText('PERTAMINA', cx + 205, yRow + 35, 18, '#fff', 700);

  // Lower summary box: Key benefit
  s += `<rect x="${cx - 220}" y="${cy + 50}" width="440" height="90" rx="16" fill="#F0F4F8"/>`;
  s += newsText('SKEMA BARU: G2G & G2B', cx, cy + 80, 22, C.cool, 700);
  s += newsText('✓ Kepastian Pasokan Jangka Panjang', cx, cy + 105, 18, C.ink, 500);
  s += newsText('✓ Pengadaan Langsung Antarpemerintah', cx, cy + 125, 16, C.muted, 400);

  return s;
}

// Guarantee Shield (Harga Subsidi Aman)
function priceGuarantee(cx, cy, t) {
  let s = shade(cx, cy + 150, 180, 20);
  const p = pop(t, K.harga, 0.5);
  s += G(T(cx, cy, p.s), p.o,
    `<rect x="-180" y="-120" width="360" height="240" rx="26" fill="url(#dCard)"/>` +
    `<path d="M0,-80 L40,-55 L40,15 Q40,60 0,80 Q-40,60 -40,15 L-40,-55 Z" fill="${C.petrol}"/>` +
    `<path d="M-14,10 L-4,20 L16,-4" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` +
    newsText('HARGA BBM SUBSIDI', 0, -100, 24, C.muted, 600) +
    newsText('DIJAMIN TETAP', 0, 48, 30, C.petrol, 700) +
    newsText('Pernyataan Menteri ESDM (26 Okt 2026)', 0, 80, 16, C.muted, 400)
  );
  return s;
}

// ---------- world rendering ----------
function drawWorld(t) {
  let s = DEFS;

  // 1. SPBU Dispenser (Left zone)
  s += spbuPump(-320, -100, t);

  // Tanker ship / Singapore tag at Scene 1
  if (t < K.s2 + 0.3) {
    const o = 1 - P(t, K.s2 - 0.2, 0.4);
    let tag = shade(-80, -260, 110, 16);
    tag += `<rect x="-180" y="-320" width="200" height="90" rx="16" fill="url(#dCard)"/>`;
    tag += `<rect x="-180" y="-320" width="12" height="90" rx="6" fill="${C.accent}"/>`;
    tag += newsText('SUMBER UTAMA SAAT INI', -75, -295, 14, C.muted, 600);
    tag += newsText('SINGAPURA', -75, -265, 30, C.accent, 700);
    tag += newsText('Impor BBM RON 90', -75, -242, 14, C.ink, 500);
    s += G('', o, tag);
  }

  // 2. Geopolitical Map & New Targets: India & China (Scenes 2 & 3)
  if (t >= K.s2 - 0.2 && t < K.s4 + 0.3) {
    const o = P(t, K.s2 - 0.2, 0.4) * (1 - P(t, K.s4, 0.4));
    let mapZone = shade(20, -140, 240, 20);
    mapZone += `<rect x="-240" y="-380" width="520" height="280" rx="24" fill="url(#dCard)"/>`;
    mapZone += newsText('DIVERSIFIKASI PASOKAN BBM', 20, -345, 24, C.ink, 700);
    mapZone += newsText('Penjajakan Kontrak Jangka Panjang', 20, -320, 16, C.muted, 500);

    // Target cards
    mapZone += countryCard(-110, -220, 'INDIA', 'Kapasitas Kilang Ekspor', '#FF9933', t, K.india);
    mapZone += countryCard(110, -220, 'CHINA', 'Kilang Skala Besar', '#DE2910', t, K.china);

    // Destination: Indonesia
    mapZone += countryCard(0, -90, 'INDONESIA', 'Penerima Pasokan', C.accent, t, K.s3);

    // Arrows from India & China to Indonesia
    if (t > K.china) {
      mapZone += `<path d="M-80,-165 Q-40,-120 -10,-120" fill="none" stroke="${C.accent}" stroke-width="5" stroke-dasharray="8 6"/>`;
      mapZone += `<path d="M80,-165 Q40,-120 10,-120" fill="none" stroke="${C.accent}" stroke-width="5" stroke-dasharray="8 6"/>`;
    }

    s += G('', o, mapZone);
  }

  // 3. Oil Supply Deficit Diagram (Scenes 4 & 5)
  if (t >= K.s4 - 0.2 && t < K.s6 + 0.3) {
    const o = P(t, K.s4 - 0.2, 0.4) * (1 - P(t, K.s6, 0.4));
    s += G('', o, barrelDiagram(120, -200, t));
  }

  // 4. Procurement Flow: Tender B2B vs Perpres 107 G2G (Scenes 6, 7 & 8)
  if (t >= K.s6 - 0.2 && t < K.s9 + 0.3) {
    const o = P(t, K.s6 - 0.2, 0.4) * (1 - P(t, K.s9, 0.4));
    s += G('', o, flowComparison(40, -200, t));
  }

  // 5. Price Guarantee Shield (Scene 9)
  if (t >= K.s9 - 0.2 && t < K.s10 + 0.3) {
    const o = P(t, K.s9 - 0.2, 0.4) * (1 - P(t, K.s10, 0.4));
    s += G('', o, priceGuarantee(100, -180, t));
  }

  // 6. Final Call to Action & Conclusion (Scene 10)
  if (t >= K.s10 - 0.2) {
    const o = P(t, K.s10 - 0.2, 0.4);
    let endBox = shade(60, -160, 200, 20);
    endBox += `<rect x="-140" y="-300" width="400" height="200" rx="24" fill="url(#dCard)"/>`;
    endBox += newsText('LANGKAH STRATEGIS ENERGI', 60, -255, 24, C.cool, 700);
    endBox += newsText('Bagaimana dampaknya ke ketahanan BBM?', 60, -220, 18, C.ink, 500);
    endBox += newsText('Tulis pendapatmu di kolom komentar! 👇', 60, -180, 18, C.accent, 600);
    s += G('', o, endBox);
  }

  // Si Tikus (The mascot & friendly analyst)
  // Placement: Bottom left / center
  let tX = -120, tY = 120, tPose = 'think', tFace = 'skeptical';

  if (t < K.s2) {
    tX = -80; tY = 120; tPose = 'think'; tFace = 'skeptical';
  } else if (t < K.s4) {
    tX = -320; tY = 130; tPose = 'point'; tFace = 'smile';
  } else if (t < K.s6) {
    tX = -260; tY = 130; tPose = t > K.sisa ? 'shock' : 'point'; tFace = t > K.sisa ? 'sad' : 'wow';
  } else if (t < K.s8) {
    tX = -320; tY = 130; tPose = 'verdict'; tFace = 'smug';
  } else if (t < K.s9) {
    tX = -320; tY = 130; tPose = 'point'; tFace = 'smile';
  } else if (t < K.s10) {
    tX = -240; tY = 130; tPose = 'happy'; tFace = 'smile';
  } else {
    // Loop back
    tX = lerp(-240, -120, P(t, K.loop, 1.0));
    tY = 120;
    tPose = 'happy';
    tFace = 'smile';
  }

  s += tikus(tX, tY, 0.9, tPose, t, 0, null, tFace, 'eksekutif');

  return s;
}

// ---------- overlay (stamps & news ticker citations) ----------
function drawOverlay(t) {
  let s = '';

  // Stamp: G2G / G2B label on Scene 7
  if (t >= K.perpres && t < K.s8) {
    s += stamp('G2G / G2B', t, K.perpres + 0.1, 540, 680, C.accent, -6, 110);
  }

  // Stamp: AMAN! label on Scene 9
  if (t >= K.tetap && t < K.s10) {
    s += stamp('HARGA AMAN', t, K.tetap + 0.1, 540, 680, C.petrol, -4, 110);
  }

  // Citations: News ticker bar format
  if (t >= K.s1 + 0.8 && t < K.s2 - 0.1) {
    s += cite('Sumber: Kompas & Katadata (26 Okt 2026)', t, K.s1 + 0.8, K.s2 - 0.1);
  }
  if (t >= K.butuh && t < K.s6 - 0.1) {
    s += cite('Data: Pernyataan Menteri ESDM (26 Okt 2026)', t, K.butuh, K.s6 - 0.1);
  }
  if (t >= K.perpres && t < K.s9 - 0.1) {
    s += cite('Sumber: Siaran Pers Kementerian ESDM & Perpres 107/2026', t, K.perpres, K.s9 - 0.1);
  }
  if (t >= K.harga && t < K.s10 - 0.1) {
    s += cite('Pernyataan Menteri ESDM di Kementerian ESDM (26 Okt 2026)', t, K.harga, K.s10 - 0.1);
  }

  return s;
}

// ---------- thumbnail ----------
function drawThumbnail() {
  const t = 1.0;
  let world = DEFS;

  // Soft background rays
  const cx = 540, cy = 960;
  for (let k = 0; k < 24; k += 2) {
    const a0 = k / 24 * Math.PI * 2, a1 = a0 + Math.PI / 24 * 1.6;
    world += `<path d="M${cx},${cy} L${f(cx + 1600 * Math.cos(a0))},${f(cy + 1600 * Math.sin(a0))} L${f(cx + 1600 * Math.cos(a1))},${f(cy + 1600 * Math.sin(a1))} Z" fill="#FFEAA7" opacity="0.35"/>`;
  }

  // Left: SPBU Dispenser (RON 90 Pertalite)
  world += spbuPump(240, 1040, t);

  // Right: Map & Flags (India, China, RI) + Perpres 107/2026 Badge
  const bx = 760, by = 1030;
  world += shade(bx, by + 180, 200, 20);
  world += `<rect x="${bx - 200}" y="${by - 240}" width="400" height="420" rx="24" fill="url(#dCard)"/>`;
  world += `<rect x="${bx - 200}" y="${by - 240}" width="400" height="65" rx="24" fill="${C.accent}"/>`;
  world += `<rect x="${bx - 200}" y="${by - 195}" width="400" height="20" fill="${C.accent}"/>`;
  world += newsText('DIVERSIFIKASI IMPOR BBM', bx, by - 210, 26, '#fff', 700);

  // Target Country Tags
  world += countryCard(bx - 90, by - 120, 'INDIA', 'Kilang Ekspor', '#FF9933', t, 0);
  world += countryCard(bx + 90, by - 120, 'CHINA', 'Kilang Skala Besar', '#DE2910', t, 0);

  // G2G Perpres Badge
  world += `<rect x="${bx - 170}" y="${by - 20}" width="340" height="90" rx="16" fill="#F0F4F8"/>`;
  world += newsText('SKEMA BARU: G2G', bx, by + 12, 26, C.cool, 700);
  world += newsText('Perpres No. 107 Tahun 2026', bx, by + 40, 18, C.muted, 500);

  // Status Guarantee
  world += `<rect x="${bx - 170}" y="${by + 90}" width="340" height="60" rx="14" fill="#EDF7ED"/>`;
  world += newsText('✓ HARGA SUBSIDI DIJAMIN TETAP', bx, by + 125, 20, '#1B5E20', 700);

  // Si Tikus (Center / Bottom, analyst pose)
  world += tikus(500, 1260, 1.45, 'verdict', t, 0, null, 'smug', 'eksekutif');

  // UI layer (Above paper texture)
  let ui = '';
  // Big bold news headline in Oswald
  const title1 = 'RI BIDIK IMPOR BBM';
  const title2 = 'DARI INDIA & CHINA!';

  ui += `<text x="540" y="328" font-family="Oswald" font-weight="700" font-size="114" fill="#000" opacity="0.25" text-anchor="middle" dominant-baseline="central" stroke="#000" stroke-width="24" stroke-linejoin="round">${title1}</text>`;
  ui += `<text x="540" y="448" font-family="Oswald" font-weight="700" font-size="114" fill="#000" opacity="0.25" text-anchor="middle" dominant-baseline="central" stroke="#000" stroke-width="24" stroke-linejoin="round">${title2}</text>`;

  ui += `<text x="540" y="320" font-family="Oswald" font-weight="700" font-size="114" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central" stroke="${C.ink}" stroke-width="20" stroke-linejoin="round" paint-order="stroke">${title1}</text>`;
  ui += `<text x="540" y="440" font-family="Oswald" font-weight="700" font-size="114" fill="${C.yellow}" text-anchor="middle" dominant-baseline="central" stroke="${C.ink}" stroke-width="20" stroke-linejoin="round" paint-order="stroke">${title2}</text>`;

  // Stamp: KEBIJAKAN BARU positioned cleanly without cutting off
  ui += stamp('KEBIJAKAN BARU', 2.0, 0.1, 740, 620, C.accent, -6, 90);

  // Bottom label
  ui += pill('ANALISIS KEBIJAKAN ENERGI NASIONAL', 540, 1540, 44, C.cool, '#fff');

  return { world, ui };
}
