// Topic: Bank tutup, uangmu ikut hilang? (LPS dan syarat 3T)
// Channel: Si Tikus (theme newsprint, halftone props through vol(), non-partisan finance education)
// One long street: A bank (x 0) -> B LPS dome (x 1500) -> B2 two banks (x 2330) -> C 3T board (x 3300)
// -> D interest gauges (x 4750). Si Tikus walks along with the camera, so he is always on screen.

Object.assign(C, {
  pave: '#CFC9BC', paveLo: '#B9B2A4', city: '#C9C4B9', book: '#2E5E9E', gold: '#E8C55A',
  liquid: '#2E8B57', hot: '#C8312B', note: '#8FC1A9', phoneBg: '#F4F1EA',
});

const newsText = (s, x, y, size, fill = C.ink, weight = 700, anchor = 'middle', extra = '') =>
  `<text x="${f(x)}" y="${f(y)}" font-family="Oswald" font-weight="${weight}" font-size="${f(size)}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="central" ${extra}>${esc(s)}</text>`;

// a flat news label: coloured box, white condensed text
function tag(label, x, y, size, fill = C.ink, color = '#fff', s = 1, o = 1) {
  const w = measure(label, size, 700, 'Oswald') + size * 0.9, h = size * 1.45;
  return G(T(x, y, s), o, `<rect x="${f(-w / 2 + 6)}" y="${f(-h / 2 + 7)}" width="${f(w)}" height="${f(h)}" fill="${C.ink}" opacity="0.2"/>` +
    `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" fill="${fill}"/>` + newsText(label, 0, 2, size, color));
}

let K = {};
const ICON = {
  bank: () => `<path d="M-22,-6 L0,-20 L22,-6 Z" fill="${C.ink}"/><path d="M-16,-2 L-16,14 M-5,-2 L-5,14 M5,-2 L5,14 M16,-2 L16,14" ${stroke(4)}/><path d="M-22,18 L22,18" ${stroke(5)}/>`,
  shield: () => `<path d="M0,-22 L18,-14 L18,2 Q18,16 0,24 Q-18,16 -18,2 L-18,-14 Z" fill="${C.cool}"/><path d="M-7,1 L-2,6 L8,-5" fill="none" ${stroke(4, '#fff')}/>`,
  list: () => [-12, 0, 12].map(y => `<rect x="-20" y="${y - 4}" width="8" height="8" fill="${C.leaf}"/><path d="M-6,${y} L20,${y}" ${stroke(4)}/>`).join(''),
  gauge: () => `<rect x="-9" y="-22" width="18" height="44" rx="9" fill="#fff" ${stroke(4)}/><rect x="-5" y="2" width="10" height="16" rx="4" fill="${C.accent}"/><path d="M-16,-4 L16,-4" ${stroke(3, C.accent)} stroke-dasharray="4 3"/>`,
};

// where Si Tikus stands relative to the camera, and how big, as the camera travels along the street
const OFF = [[0, -300], [1500, -330], [2330, 0], [3300, 320], [4750, 330]];
const SCL = [[0, 0.85], [2330, 0.85], [3300, 0.74], [4750, 0.72]];
function along(table, x) {
  if (x <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) if (x <= table[i][0]) {
    const [x0, v0] = table[i - 1], [x1, v1] = table[i];
    return lerp(v0, v1, (x - x0) / (x1 - x0));
  }
  return table[table.length - 1][1];
}

// interest level in the bank-umum gauge (percent)
function levelUmum(t) {
  return 2.5 * P(t, K.s8 + 0.2, 0.9, E.outCubic) + 3.0 * P(t, K.tinggi - 0.2, 1.1, E.inOutCubic);
}

function setup(D) {
  const s = D.scenes;
  K = {
    tutup: s[0].at('tutup'), uang: s[0].at('uangmu'), hilang: s[0].at('hilang'),
    s2: s[1].start, banyak: s[1].at('banyak'), mitos: s[1].at('menyesatkan'),
    s3: s[2].start, lps: s[2].at('lps'), lembaga: s[2].at('lembaga'), tab: s[2].at('tabungan'), depo: s[2].at('deposito'),
    s4: s[3].start, miliar: s[3].at('2'), nasabah: s[3].at('nasabah'), tiap: s[3].at('tiap'), s4e: s[3].end,
    s5: s[4].start, syarat: s[4].at('syaratnya'), t3: s[4].at('3t'),
    s6: s[5].start, tercatat: s[5].at('tercatat'),
    s7: s[6].start, dua: s[6].at('dua'), melebihi: s[6].at('melebihi'),
    s8: s[7].start, batas: s[7].at('batasnya'), persen: s[7].at('3'), umum: s[7].at('umum'),
    s9: s[8].start, tiga: s[8].at('tiga'), gagal: s[8].at('gagal'), macet: s[8].at('macet'),
    s10: s[9].start, tinggi: s[9].at('tinggi'), dijamin: s[9].at('dijamin'),
    s11: s[10].start, cek: s[10].at('cek'), batasLps: s[10].at('batas'),
    loop: D.total - 1.5, total: D.total,
  };
  K.stamp = K.mitos + 0.1;
  K.cross = K.tinggi;  // first moment the liquid passes the 3,75% line
  while (K.cross < K.tinggi + 1.5 && levelUmum(K.cross) < 3.75) K.cross += 1 / 120;

  const home = { x: 0, y: 40, z: 1.0 };
  setCamera([
    home,
    { at: K.tutup - 0.3, dur: 0.6, x: 60, y: 60, z: 1.08 },
    { at: K.s2 + 0.3, dur: 0.8, x: 10, y: 30, z: 1.0 },
    { at: K.s3 - 0.2, dur: 1.0, x: 1500, y: 40, z: 1.0 },
    { at: K.tab - 0.3, dur: 0.8, x: 1500, y: 70, z: 1.1 },
    { at: K.s4 - 0.2, dur: 0.9, x: 2330, y: 20, z: 1.0 },
    { at: K.tiap - 0.1, dur: 0.8, x: 2330, y: 40, z: 1.05 },
    { at: K.s5 - 0.2, dur: 1.0, x: 3300, y: 40, z: 1.0 },
    { at: K.s6, dur: 0.6, x: 3270, y: -40, z: 1.1 },
    { at: K.s7, dur: 0.6, x: 3270, y: 50, z: 1.1 },
    { at: K.s8 - 0.2, dur: 1.0, x: 4750, y: 40, z: 1.0 },
    { at: K.persen - 0.2, dur: 0.6, x: 4700, y: 20, z: 1.08 },
    { at: K.s9 - 0.2, dur: 1.0, x: 3270, y: 80, z: 1.1 },
    { at: K.s10 - 0.2, dur: 1.0, x: 4750, y: 40, z: 1.0 },
    { at: K.tinggi - 0.3, dur: 0.7, x: 4720, y: 30, z: 1.1 },
    { at: K.s11 - 0.2, dur: 1.2, x: 30, y: 40, z: 1.06 },
    { at: K.loop, dur: 1.2, ...home },
  ]);

  setHeadlines([
    { at: -0.6, end: K.s2 - 0.1, text: 'BANK TUTUP,\nUANG *HILANG?*' },
    { at: K.banyak, end: K.s3 - 0.1, text: 'CEK *FAKTANYA*' },
    { at: K.lps, end: K.s4 - 0.1, text: 'ADA *LPS*' },
    { at: K.miliar, end: K.s5 - 0.1, text: 'S.D. *2 MILIAR*', hype: true, size: 116 },
    { at: K.syarat, end: K.s6 - 0.1, text: 'SYARAT *3T*' },
    { at: K.tercatat, end: K.s7 - 0.1, text: 'T1: *TERCATAT*' },
    { at: K.dua, end: K.s8 - 0.1, text: 'T2: *BUNGA* WAJAR' },
    { at: K.persen, end: K.s9 - 0.1, text: 'BATAS *3,75%*' },
    { at: K.tiga, end: K.s10 - 0.1, text: 'T3: *TIDAK GAGAL*' },
    { at: K.tinggi, end: K.s11 - 0.1, text: 'BUNGA TINGGI,\n*TIDAK DIJAMIN*' },
    { at: K.cek, end: K.loop + 0.6, text: 'CEK *BUNGAMU*' },
  ]);

  setChapters([
    { at: 0.3, icon: ICON.bank },
    { at: K.lps, icon: ICON.shield },
    { at: K.syarat, icon: ICON.list },
    { at: K.persen, icon: ICON.gauge },
  ], { at: K.s11, end: D.total });
}

function cues(D) {
  return [
    [K.tutup, 'pop'], [K.hilang, 'whoosh'],
    [K.stamp, 'thud'],
    [K.s3 - 0.2, 'whoosh'], [K.lps, 'pop'], [K.lps + 0.4, 'sparkle'], [K.tab, 'pop'], [K.depo, 'pop'],
    [K.s4 - 0.2, 'whoosh'], [K.miliar, 'pop'], [K.miliar + 0.75, 'ding'], [K.nasabah, 'pop'], [K.tiap, 'pop'],
    [K.s5 - 0.2, 'whoosh'], [K.t3, 'ding'],
    [K.tercatat, 'pop'], [K.tercatat + 0.4, 'click'], [K.dua, 'pop'], [K.melebihi + 0.5, 'click'],
    [K.s8 - 0.2, 'whoosh'], [K.persen, 'pop'],
    [K.s9 - 0.2, 'whoosh'], [K.tiga, 'pop'], [K.macet + 0.3, 'click'],
    [K.s10 - 0.2, 'whoosh'], [K.cross, 'zap'], [K.dijamin, 'thud'],
    [K.s11 - 0.2, 'whoosh'], [K.cek, 'pop'], [K.batasLps, 'ding'], [K.loop, 'whoosh'],
  ];
}

// ---------- street ----------

function skyline() {
  let s = '', x = -1100, i = 0;
  while (x < 3800) {
    const w = 150 + 130 * rnd(i * 3 + 1), h = 220 + 340 * rnd(i * 5 + 2), col = mix(C.city, C.bg, 0.35 * rnd(i * 7 + 4));
    s += `<rect x="${f(x)}" y="${f(380 - h)}" width="${f(w)}" height="${f(h)}" fill="${col}"/>`;
    for (let wy = 380 - h + 30; wy < 340; wy += 56) for (let wx = x + 22; wx < x + w - 34; wx += 44)
      if (rnd(i * 31 + wx * 0.7 + wy) > 0.3) s += `<rect x="${f(wx)}" y="${f(wy)}" width="20" height="28" fill="${C.bg}" opacity="0.7"/>`;
    x += w + 16 + 40 * rnd(i * 11 + 9); i++;
  }
  return G('', 0.55, s);
}

function street(cam) {
  let s = `<rect x="-2000" y="380" width="9000" height="700" fill="${C.pave}"/>` +
    `<rect x="-2000" y="372" width="9000" height="16" fill="${C.paveLo}"/><path d="M-2000,372 L7000,372" ${stroke(4, C.ink)} opacity="0.5"/>`;
  const x0 = Math.floor((cam.x - 800) / 180) * 180;
  for (let x = x0; x < cam.x + 800; x += 180) s += `<path d="M${x},388 L${x - 40},520" ${stroke(3, C.paveLo)}/>`;
  return s + `<path d="M-2000,452 L7000,452" ${stroke(3, C.paveLo)}/>`;
}

// ---------- props ----------

function passbook(x, y, s = 1, rot = -6) {
  let g = shadow(0, 130, 120, 0.15);
  g += vol(rectD(-95, -125, 190, 250, 10), C.book, { depth: 10, w: 5, rot });
  g += `<rect x="-95" y="-125" width="22" height="250" fill="${mix(C.book, C.ink, 0.3)}"/>`;
  g += vol(circleD(10, -50, 30), C.gold, { depth: 4, w: 4 }) + newsText('Rp', 10, -50, 26, mix(C.gold, C.ink, 0.6));
  g += newsText('BUKU', 10, 20, 38, '#fff') + newsText('TABUNGAN', 10, 62, 30, '#fff', 500);
  return G(T(x, y, s, rot), 1, g);
}

const SHIELD = 'M0,-115 C55,-92 85,-100 100,-102 L100,8 C100,70 52,104 0,122 C-52,104 -100,70 -100,8 L-100,-102 C-85,-100 -55,-92 0,-115 Z';
function emblem(x, y, s, label = 'LPS') {
  return G(T(x, y, s), 1, vol(SHIELD, C.cool, { depth: 12, w: 5 }) +
    `<path d="${SHIELD}" transform="scale(0.82)" fill="none" stroke="#fff" stroke-width="5" opacity="0.8"/>` + newsText(label, 0, 2, 86, '#fff'));
}

// protective bubble standing on the street, grown upward with p
function dome(cx, rx, ry, p, t) {
  if (p <= 0.01) return '';
  const d = `M${cx - rx},380 A${rx},${ry} 0 0 1 ${cx + rx},380 Z`, a = t * 0.8;
  return G(`translate(${cx} 380) scale(1 ${f(E.outBack(clamp(p)))}) translate(${-cx} -380)`, clamp(p * 2),
    `<path d="${d}" fill="${C.cool}" opacity="0.1"/><path d="${d}" fill="none" ${stroke(6, C.cool)}/>` +
    `<path d="M${f(cx - rx * 0.78)},${f(380 - ry * 0.55)} A${rx * 0.86},${ry * 0.86} 0 0 1 ${f(cx - rx * 0.35)},${f(380 - ry * 0.9)}" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="${f(0.55 + 0.25 * Math.sin(a))}"/>`);
}

function closedSign(t) {
  if (t < K.tutup - 0.05 || t > K.s3 + 0.5) return '';
  const u = t - (K.tutup - 0.05), drop = (1 - E.outBack(clamp(u / 0.35))) * -320, sw = 9 * Math.exp(-3 * u) * Math.sin(11 * u);
  return G(`translate(120 ${f(40 + drop)}) rotate(${f(sw)})`, clamp(u * 6),
    `<path d="M-120,0 L-60,-70 M120,0 L60,-70" ${stroke(5)}/>` + vol(circleD(-60, -72, 8), '#8A8E96', { depth: 2, w: 3 }) + vol(circleD(60, -72, 8), '#8A8E96', { depth: 2, w: 3 }) +
    vol(rectD(-180, 0, 360, 130, 10), C.accent, { depth: 10, w: 5 }) + `<rect x="-166" y="14" width="332" height="102" fill="none" stroke="#fff" stroke-width="4"/>` +
    newsText('TUTUP', 0, 66, 84, '#fff', 700, 'middle', 'letter-spacing="8"'));
}

// banknotes that fly out of the bank and freeze when the claim gets its label
function flyingNotes(t) {
  if (t < K.hilang - 0.15 || t > K.s3 + 0.6) return '';
  const tt = Math.min(t, K.stamp), o = 1 - P(t, K.s3, 0.5);
  const tg = [[-230, -330, -24], [-60, -420, 12], [150, -390, -8], [300, -300, 20], [360, -150, -16]];
  return G('', o, tg.map(([dx, dy, r], i) => {
    const p = E.outCubic(P(tt, K.hilang - 0.15 + i * 0.07, 1.3, E.lin));
    if (p <= 0) return '';
    const x = 120 + dx * p + 18 * Math.sin(tt * 3 + i) * p, y = 250 + dy * p + 10 * Math.cos(tt * 2.6 + i) * p;
    return banknote(x, y, 0.42 * (0.5 + 0.5 * p), { value: '100.000', col: C.note, rot: r * p + 6 * Math.sin(tt * 4 + i) * p });
  }).join(''));
}

// the 3T board in zone C
const BOARD = { x: 2930, y: -340, w: 620, h: 640 }, ROWS = [-170, 25, 215];
function rowIcon(i, x, y) {
  if (i === 0) return G(T(x, y, 0.42, -6), 1, passbook(0, 0, 1, 0));
  if (i === 1) return vol(circleD(x, y, 54), '#E8892E', { depth: 8, w: 5 }) + newsText('%', x, y + 2, 68, '#fff');
  let g = vol(`M${x - 58},${y - 16} L${x},${y - 52} L${x + 58},${y - 16} Z`, '#B9BCC2', { depth: 5, w: 4 });
  g += vol(rectD(x - 50, y - 16, 100, 62, 4), '#E9E4DA', { depth: 6, w: 4 });
  [-30, 0, 30].forEach(k => g += `<rect x="${x + k - 7}" y="${y - 10}" width="14" height="50" fill="#fff" stroke="${C.ink}" stroke-width="3"/>`);
  return g + `<path d="M${x + 6},${y - 46} L${x - 6},${y - 20} L${x + 10},${y + 2} L${x - 4},${y + 30}" fill="none" ${stroke(5, C.accent)}/>`;
}
function checkMark(t, t0, x, y) {
  const p = pop(t, t0, 0.35);
  if (p.o <= 0) return '';
  const d = P(t, t0 + 0.08, 0.25);
  return G(T(x, y, p.s), p.o, vol(circleD(0, 0, 28), C.leaf, { depth: 5, w: 4 }) +
    `<path d="M-13,1 L-4,11 L14,-10" fill="none" ${stroke(7, '#fff')} stroke-dasharray="44" stroke-dashoffset="${f(44 * (1 - d))}"/>`);
}
function board(t) {
  const { x, y, w, h } = BOARD;
  let s = shadow(x + w / 2, 382, 340, 0.16);
  s += `<path d="M${x + 90},${y + h - 10} L${x + 70},380 M${x + w - 90},${y + h - 10} L${x + w - 70},380" ${stroke(14, '#7C6A55')}/>`;
  s += vol(rectD(x, y, w, h, 14), '#FFFFFF', { depth: 10, w: 5 });
  s += `<rect x="${x}" y="${y}" width="${w}" height="96" fill="${C.accent}"/>` + newsText('SYARAT 3T', x + w / 2, y + 50, 62, '#fff', 700, 'middle', 'letter-spacing="4"');
  const rows = [
    { t0: K.tercatat, ck: K.tercatat + 0.4, a: 'TERCATAT', b: 'di pembukuan bank', act: [K.s6, K.s7] },
    { t0: K.dua, ck: K.melebihi + 0.5, a: 'BUNGA WAJAR', b: 'maks. bunga penjaminan LPS', act: [K.s7, K.s8] },
    { t0: K.tiga, ck: K.macet + 0.3, a: 'BANK TIDAK GAGAL', b: 'mis. bukan kredit macet', act: [K.s9, K.s10] },
  ];
  rows.forEach((r, i) => {
    const ry = ROWS[i], on = t >= r.act[0] && t < r.act[1];
    if (on) s += `<rect x="${x + 16}" y="${ry - 80}" width="${w - 32}" height="160" fill="${C.yellow}" opacity="${f(0.45 * P(t, r.act[0], 0.3))}"/>`;
    if (i) s += `<path d="M${x + 30},${ry - 95} L${x + w - 30},${ry - 95}" ${stroke(3, C.line)}/>`;
    s += tag(`T${i + 1}`, x + 46, ry - 52, 26, C.ink);
    const p = pop(t, r.t0 - 0.05, 0.4);
    if (p.o <= 0) {  // still empty: grey skeleton lines
      s += `<rect x="${x + 70}" y="${ry - 40}" width="90" height="90" rx="12" fill="${C.line}" opacity="0.5"/>` +
        `<rect x="${x + 190}" y="${ry - 34}" width="300" height="30" rx="8" fill="${C.line}" opacity="0.6"/><rect x="${x + 190}" y="${ry + 14}" width="220" height="20" rx="8" fill="${C.line}" opacity="0.45"/>`;
      return;
    }
    s += G(T(x + 115, ry + 4, p.s), p.o, rowIcon(i, 0, 0));
    s += G('', p.o, newsText(r.a, x + 185, ry - 18, 44, C.ink, 700, 'start') + newsText(r.b, x + 185, ry + 32, 30, C.muted, 500, 'start'));
    s += checkMark(t, r.ck, x + 76, ry + 48);
  });
  return s;
}

// a glass gauge of interest rates, zone D
const yOf = v => 290 - v * 68;
function gauge(id, x, level, batas, label, tagSide, t, o = 1) {
  let s = shadow(x, 382, 140, 0.15);
  s += vol(rectD(x - 110, 300, 220, 80, 12), '#3A3F4E', { depth: 8, w: 5 }) + newsText(label, x, 340, 34, '#fff');
  const tube = rectD(x - 52, -262, 104, 566, 52);
  s += vol(tube, '#FFFFFF', { depth: 8, w: 5 });
  const hot = clamp((level - batas) / 0.4), col = mix(C.liquid, C.hot, hot), yl = yOf(level);
  s += `<defs><clipPath id="${id}"><path d="${rectD(x - 40, -250, 80, 542, 40)}"/></clipPath></defs>`;
  if (level > 0.02) s += `<g clip-path="url(#${id})"><rect x="${x - 40}" y="${f(yl)}" width="80" height="${f(300 - yl)}" fill="${col}"/>` +
    `<path d="M${x - 40},${f(yl)} q20,${f(-6 * Math.sin(t * 5))} 40,0 t40,0" fill="${mix(col, '#fff', 0.35)}"/>` +
    `<rect x="${x - 28}" y="${f(yl + 10)}" width="10" height="${f(Math.max(0, 270 - yl))}" rx="5" fill="#fff" opacity="0.3"/></g>`;
  for (let v = 1; v < 8; v++) s += `<path d="M${x + 22},${yOf(v)} L${x + 40},${yOf(v)}" ${stroke(3, C.muted)} opacity="0.7"/>`;
  if (level > 0.5) s += newsText(`${level.toFixed(2).replace('.', ',')}%`, x, Math.min(250, yl + 34), 30, '#fff');
  const yb = yOf(batas);
  s += `<path d="M${x - 78},${yb} L${x + 78},${yb}" ${stroke(7, C.accent)} stroke-dasharray="16 10"/>`;
  const lbl = `BATAS ${String(batas).replace('.', ',')}%`, tw = measure(lbl, 34, 700, 'Oswald') + 30;
  s += tag(lbl, tagSide > 0 ? x + 80 + tw / 2 : x - 80 - tw / 2, yb, 34, C.accent);
  return G('', o, s);
}

// LPS emblem riding on top of the bank-umum gauge; cracks in two when the interest passes the line
function crackingEmblem(t, x, y) {
  if (t < K.s10 || t > K.s11 + 0.4) return '';
  const p = pop(t, K.s10 + 0.3, 0.4), u = Math.max(0, t - K.cross);
  if (u <= 0) return G(T(x, y, p.s), p.o, emblem(0, 0, 0.5) + tag('DIJAMIN', 0, 82, 26, C.leaf));
  const fall = 140 * u * u + 30 * u, spin = 40 * u, o = 1 - P(t, K.cross + 0.9, 0.4);
  const half = (side) => `<defs><clipPath id="em${side > 0 ? 'R' : 'L'}"><rect x="${side > 0 ? 0 : -80}" y="-80" width="80" height="160"/></clipPath></defs>` +
    G(`translate(${f(side * (20 + 60 * u))} ${f(fall)}) rotate(${f(side * spin)})`, o, `<g clip-path="url(#em${side > 0 ? 'R' : 'L'})">${emblem(0, 0, 0.5)}</g>`);
  return G(T(x, y), 1, half(-1) + half(1) + `<path d="M0,-58 L-8,-20 L8,4 L-6,40" fill="none" ${stroke(5, '#fff')} opacity="${f(1 - clamp(u * 3))}"/>`);
}

// the phone in the last line: "what does your bank pay?"
function phoneCheck(t) {
  if (t < K.cek - 0.05 || t > K.loop + 0.4) return '';
  const p = pop(t, K.cek - 0.05, 0.45), o = 1 - P(t, K.loop - 0.2, 0.5), hl = P(t, K.batasLps, 0.3);
  const screen = newsText('BUNGAMU', 100, 60, 34, C.muted, 600) + newsText('?%', 100, 150, 110, C.ink) +
    `<rect x="14" y="${232}" width="${f(172 * hl)}" height="112" fill="${C.yellow}" opacity="0.8"/>` +
    newsText('BATAS LPS', 100, 262, 30, C.ink, 600) + newsText('3,75%', 100, 312, 56, C.accent);
  return G(T(330, 110, p.s), p.o * o, phone(0, 0, 0.85, { screen, rot: 6 }));
}

// Si Tikus, walking with the camera; on the right half of the frame he turns to point left
function mouse(t) {
  const c = cameraAt(t), c0 = cameraAt(t - 0.05), moving = Math.abs(c.x - c0.x) > 4;
  const off = along(OFF, c.x), s = along(SCL, c.x), x = c.x + off, y = 380 - 135 * s - 2;
  let pose = 'think', face = 'confused';
  if (t >= K.s2) { pose = t >= K.stamp ? 'verdict' : 'calm'; face = t >= K.stamp ? 'smug' : 'skeptical'; }
  if (t >= K.s3) { pose = 'point'; face = 'smile'; }
  if (t >= K.s4) { pose = t >= K.miliar ? 'cheer' : 'happy'; face = 'wow'; }
  if (t >= K.s5) { pose = 'point'; face = 'smile'; }
  if (t >= K.s7) { pose = 'think'; face = 'skeptical'; }
  if (t >= K.s8) { pose = 'point'; face = 'wow'; }
  if (t >= K.s9) { pose = 'point'; face = 'skeptical'; }
  if (t >= K.s10) { pose = t >= K.cross ? 'shock' : 'point'; face = t >= K.cross ? 'sad' : 'smile'; }
  if (t >= K.s11) { pose = 'happy'; face = 'smile'; }
  if (t >= K.cek) { pose = 'point'; face = 'smile'; }
  if (t >= K.loop + 0.4) { pose = 'think'; face = 'confused'; }
  if (moving) pose = 'calm';
  const m = tikus(0, 0, s, pose, t, 0, moving ? t * 13 : null, face);
  return G(`translate(${f(x)} ${f(y)}) scale(${off > 60 ? -1 : 1} 1)`, 1, m);
}

// ---------- world ----------
function drawWorld(t, cam) {
  let s = layer(0.55, cam, skyline()) + street(cam);

  // A: the bank
  s += building(120, 380, 1.2, { label: 'BANK' });
  s += flyingNotes(t) + closedSign(t);

  // B: LPS dome over a passbook and a deposit slip
  const em = t < K.lps - 0.1 ? 0 : E.outBack(P(t, K.lps - 0.1, 0.55, E.lin));
  s += dome(1500, 280, 470, P(t, K.lps + 0.3, 0.6, E.lin), t);
  const pb = pop(t, K.tab - 0.05, 0.45), dp = pop(t, K.depo - 0.05, 0.45);
  if (pb.o) s += G(`translate(1400 255) scale(${f(pb.s)}) translate(-1400 -255)`, pb.o, passbook(1400, 255, 0.95));
  if (dp.o) s += G(`translate(1610 260) scale(${f(dp.s)}) translate(-1610 -260)`, dp.o, docPaper(1610, 260, 0.7, { title: 'DEPOSITO', rot: 5 }));
  if (em > 0) s += emblem(1500, lerp(-760, -150, em), 0.9);
  s += tag('LEMBAGA PENJAMIN SIMPANAN', 1500, -10, 34, C.ink, '#fff', pop(t, K.lembaga - 0.1, 0.4).s, pop(t, K.lembaga - 0.1, 0.4).o);

  // B2: per nasabah, per bank
  [[2070, 'BANK A', K.nasabah], [2590, 'BANK B', K.tiap]].forEach(([bx, lb, t0]) => {
    s += building(bx, 380, 0.6, { label: lb });
    s += dome(bx, 215, 340, P(t, t0 - 0.1, 0.5, E.lin), t);
    const p = pop(t, t0 + 0.05, 0.4);
    if (p.o) s += tag('S.D. Rp2 M', bx, 30, 40, C.cool, '#fff', p.s, p.o);
  });
  s += card(t, K.miliar - 0.1, 2330, -190, 760, 170,
    mono(scramble('Rp2.000.000.000', t, K.miliar - 0.1, 0.8, { seed: 4 }), 380, 108, 64, C.ink, { anchor: 'middle' }),
    { title: 'per nasabah, per bank', col: C.cool });

  // C: the 3T board
  s += board(t);

  // D: interest gauges (bank umum, BPR); the BPR one steps back in the last gauge scene
  const back = P(t, K.s10 + 0.2, 0.5) * (1 - P(t, K.s11, 0.3));
  s += gauge('gU', 4410, levelUmum(t), 3.75, 'BANK UMUM', 1, t);
  s += gauge('gB', 4770, 4.5 * P(t, K.s8 + 0.5, 0.9, E.outCubic), 6.25, 'BPR', -1, t, 1 - 0.6 * back);
  if (t > K.s8 - 0.3) s += newsText('ilustrasi', 4410, 418, 28, C.muted, 500) + newsText('ilustrasi', 4770, 418, 28, C.muted, 500);
  s += crackingEmblem(t, 4410, -330);
  if (t > K.cross && t < K.cross + 0.6) s += burst(t, K.cross, 4410, yOf(3.75), { n: 10, r: 120, col: C.accent, dur: 0.45, size: 9 });

  // back at the bank: the phone check
  s += phoneCheck(t);

  return s + mouse(t);
}

// ---------- overlay ----------
function disclaimer(t) {
  const o = P(t, K.s11 + 0.2, 0.4) * (1 - P(t, K.total - 0.3, 0.25));
  if (o <= 0) return '';
  const l1 = 'Konten edukasi, bukan ajakan investasi.', l2 = 'Cek legalitas produk di OJK (ojk.go.id / Kontak 157).';
  const w = Math.max(measure(l1, 28, 500, 'Oswald'), measure(l2, 28, 500, 'Oswald')) + 50;
  return G('', o, `<rect x="${f(540 - w / 2)}" y="1340" width="${f(w)}" height="88" fill="#fff" opacity="0.94"/>` +
    `<rect x="${f(540 - w / 2)}" y="1340" width="8" height="88" fill="${C.cool}"/>` +
    newsText(l1, 544, 1363, 28, C.ink, 500) + newsText(l2, 544, 1403, 28, C.ink, 500));
}

function drawOverlay(t) {
  let s = '';
  s += sticker('BRAK!', t, K.tutup + 0.25, 820, 640, { rot: 8, size: 80, col: C.yellow, dur: 0.75 });
  if (t < K.s3 + 0.2) s += stamp('MENYESATKAN', t, K.stamp, 540, 780, C.accent, -6, 100);
  s += sticker('KRAK!', t, K.cross + 0.05, 300, 560, { rot: -10, size: 78, col: C.yellow, dur: 0.7 });
  if (t > K.dijamin - 0.3 && t < K.s11) s += stamp('TIDAK DIJAMIN', t, K.dijamin, 470, 1120, C.accent, -5, 88);
  s += invertFlash(t, K.cross);

  s += cite('Dasar: UU 24/2004 tentang LPS', t, K.lembaga, K.s4 - 0.1);
  s += cite('PP 66/2008 · CNBC Indonesia, Agu 2025', t, K.miliar, K.s5 - 0.1);
  s += cite('Syarat 3T: LPS, dikutip CNBC Indonesia (Agu 2025)', t, K.t3, K.s8 - 0.1);
  s += cite('TBP LPS 1 Okt 2026 s.d. 31 Jan 2027 · Kontan, 30 Sep 2026', t, K.persen, K.s9 - 0.1);
  s += cite('Syarat 3T: LPS, dikutip CNBC Indonesia (Agu 2025)', t, K.gagal, K.s10 - 0.1);
  s += cite('Bunga 5,5% hanya ilustrasi · batas TBP per Okt 2026', t, K.tinggi, K.s11 - 0.1);
  return s + disclaimer(t);
}

// ---------- thumbnail ----------
function drawThumbnail() {
  const t = 1.3;
  let s = `<rect x="0" y="0" width="1080" height="1920" fill="${mix(C.cool, C.bg, 0.55)}"/>`;
  for (let k = 0; k < 24; k += 2) {
    const a0 = k / 24 * Math.PI * 2, a1 = a0 + Math.PI / 24 * 2;
    s += `<path d="M540,1000 L${f(540 + 1700 * Math.cos(a0))},${f(1000 + 1700 * Math.sin(a0))} L${f(540 + 1700 * Math.cos(a1))},${f(1000 + 1700 * Math.sin(a1))} Z" fill="#fff" opacity="0.22"/>`;
  }
  s += `<rect x="0" y="1300" width="1080" height="620" fill="${C.pave}"/><path d="M0,1300 L1080,1300" ${stroke(6, C.ink)} opacity="0.5"/>`;
  s += building(600, 1300, 1.45, { label: 'BANK' });
  // the closed sign across the columns
  s += G('translate(600 1010) rotate(-4)', 1, `<path d="M-150,0 L-80,-80 M150,0 L80,-80" ${stroke(6)}/>` +
    vol(rectD(-230, 0, 460, 170, 12), C.accent, { depth: 12, w: 6 }) + `<rect x="-212" y="18" width="424" height="134" fill="none" stroke="#fff" stroke-width="5"/>` +
    newsText('TUTUP', 0, 88, 112, '#fff', 700, 'middle', 'letter-spacing="10"'));
  // banknotes flying out of it, one ringed in red
  [[250, 760, -22, 0.6], [470, 640, 10, 0.55], [880, 700, 18, 0.6], [960, 900, -14, 0.5]].forEach(([x, y, r, k]) =>
    s += banknote(x, y, k, { value: '100.000', col: C.note, rot: r }));
  s += `<ellipse cx="880" cy="700" rx="140" ry="92" fill="none" stroke="${C.accent}" stroke-width="12" transform="rotate(14 880 700)"/>`;
  s += G('translate(250 1440) scale(1.25)', 1, tikus(0, 0, 1, 'think', t, 0, null, 'skeptical'));
  return { world: s, ui: titleText('BANK TUTUP,\n*UANGMU HILANG?*', 540, 400, 150, 980, 24) };
}
