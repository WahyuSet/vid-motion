// Topic: siapa yang dimakamkan di Gunung Kawi, version 2 with real archive photos (assets.md) mixed into the drawn board
// An archive board seen from above: realistic props (old map, sepia photo frames with silhouettes, typed index
// cards, a timeline ribbon, a sealed family-tree letter, a candle, incense and flower petals, a news clipping)
// lie on aged paper. At the end the camera pulls back and red thread links them all.
// A map (0, 0) -> B Eyang Djoego (1000..1400) -> C Iman Soedjono (2150..2450) -> D pilgrims and 1 Suro (3150..3700)
// -> F clipping (4300, 0) -> whole board -> back to A.

Object.assign(C, {
  sheet: ['#F6ECD3', '#EAD9B4', '#D6BF92'], sepia: '#5A4126', ink2: '#3A2A1A', redInk: '#9B2A1E', string: '#B0281C',
  gold: ['#F3D58A', '#C99A3E', '#7E5A1E'], wood: ['#8A5A34', '#5E3A1F', '#3A2312'], wax: ['#C8463A', '#9B2A1E', '#5E140E'],
  photo: ['#D9C29A', '#B89A6C', '#6E5434'], card: '#FBF4E1', rule: '#9DB4C8', bronze: ['#D9A55A', '#9C6A2C', '#5A3A14'],
});

let K = {}, NID = 0;
const uid = p => `${p}${NID++}`;
const serif = (s, x, y, size, fill = C.ink2, weight = 700, anchor = 'middle', extra = '') =>
  `<text x="${f(x)}" y="${f(y)}" font-family="Playfair Display" font-weight="${weight}" font-size="${f(size)}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="central" ${extra}>${esc(s)}</text>`;
const typed = (s, x, y, size, fill = C.ink2, anchor = 'start', weight = 700) =>
  `<text x="${f(x)}" y="${f(y)}" font-family="Courier Prime" font-weight="${weight}" font-size="${f(size)}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="central">${esc(s)}</text>`;
const lg = (id, cols, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">` +
  cols.map((c, i) => `<stop offset="${f(i / (cols.length - 1))}" stop-color="${c}"/>`).join('') + `</linearGradient>`;
const rg = (id, cols, cx = '40%', cy = '35%', r = '75%') => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">` +
  cols.map((c, i) => `<stop offset="${f(i / (cols.length - 1))}" stop-color="${c}"/>`).join('') + `</radialGradient>`;
const DEFS = `<defs><filter id="b4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>` +
  `<filter id="b10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>` +
  `<filter id="b22" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter></defs>`;
// everything lies on the board, lit from the top left: a soft shadow down and to the right
const drop = (d, dx = 14, dy = 18, o = 0.32) => `<path d="${d}" transform="translate(${dx} ${dy})" fill="#2A1A0A" opacity="${o}" filter="url(#b10)"/>`;

// ---------- realistic props ----------

// an aged sheet with a ragged edge, centred on (0, 0)
function raggedRect(w, h, seed) {
  const pts = [], n = 18;
  const edge = (x0, y0, x1, y1, k) => { for (let i = 0; i < n; i++) { const u = i / n; pts.push([lerp(x0, x1, u) + (rnd(seed + k * 50 + i) - 0.5) * 7, lerp(y0, y1, u) + (rnd(seed + k * 70 + i) - 0.5) * 7]); } };
  edge(-w / 2, -h / 2, w / 2, -h / 2, 1); edge(w / 2, -h / 2, w / 2, h / 2, 2); edge(w / 2, h / 2, -w / 2, h / 2, 3); edge(-w / 2, h / 2, -w / 2, -h / 2, 4);
  return 'M' + pts.map(p => p.map(f).join(',')).join(' L') + ' Z';
}
function sheet(x, y, w, h, rot, inner, { seed = 1, cols = C.sheet } = {}) {
  const d = raggedRect(w, h, seed), g = uid('sh'), e = uid('se'), cl = uid('sc');
  return G(T(x, y, 1, rot), 1, `<defs>${rg(g, cols, '45%', '40%', '80%')}<clipPath id="${cl}"><path d="${d}"/></clipPath></defs>` + drop(d) +
    `<path d="${d}" fill="url(#${g})"/>` +
    `<g clip-path="url(#${cl})"><path d="${d}" fill="none" stroke="#8A6630" stroke-width="40" opacity="0.22" filter="url(#b10)"/>${inner}</g>` +
    `<path d="${d}" fill="none" stroke="#9C7A48" stroke-width="1.5" opacity="0.6"/>`);
}
function pushPin(x, y, col = '#B0281C') {
  const g = uid('pp');
  return `<defs>${rg(g, [mix(col, '#fff', 0.5), col, mix(col, '#000', 0.5)], '35%', '30%', '70%')}</defs>` +
    `<ellipse cx="${x + 8}" cy="${y + 12}" rx="16" ry="10" fill="#000" opacity="0.3" filter="url(#b4)"/><circle cx="${x}" cy="${y}" r="16" fill="url(#${g})"/>` +
    `<circle cx="${x - 5}" cy="${y - 6}" r="4" fill="#fff" opacity="0.8"/>`;
}

// ---------- real archive photos (assets.md lists source, author and license of each) ----------
const ASSET = '../topics/gunung-kawi-v2/assets/';
const PHOTOS = {
  kawi: { src: 'kawi-1900.jpg', w: 3840, h: 1982, crop: [470, 320, 1390, 1080], sepia: 1, gain: 1.45,
    caption: 'Gunung Kawi dari lembah Malang, ±1900–1935', credit: 'Foto: N. Keasberry / Rijksmuseum (CC0)' },
  keraton: { src: 'keraton-kawi.jpg', w: 1920, h: 1440, crop: [0, 0, 1920, 1440], sepia: 0.75, gain: 1.1,
    caption: 'Keraton Gunung Kawi, kawasan Gunung Kawi, 2014', credit: 'Foto: Javanesecode, CC BY-SA 4.0' },
};
// sepia (a = 1) or partly sepia (a < 1) as a colour matrix, with a little extra contrast
function sepiaFilter(id, a, gain = 1.08) {
  const S = [0.393, 0.769, 0.189, 0.349, 0.686, 0.168, 0.272, 0.534, 0.131], I = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const m = S.map((v, i) => f(lerp(I[i], v, a)));
  return `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${m.slice(0, 3).join(' ')} 0 0 ${m.slice(3, 6).join(' ')} 0 0 ${m.slice(6, 9).join(' ')} 0 0 0 0 0 1 0"/>` +
    `<feComponentTransfer><feFuncR type="linear" slope="${f(gain)}" intercept="-0.03"/><feFuncG type="linear" slope="${f(gain)}" intercept="-0.03"/><feFuncB type="linear" slope="${f(gain)}" intercept="-0.03"/></feComponentTransfer></filter>`;
}
// a print of a real photo: deckle-edged paper, two strips of tape, slow Ken Burns zoom from t0, caption and credit
function photoPrint(key, x, y, w, h, rot, t, t0, { z1 = 1.12, panX = 0 } = {}) {
  const ph = PHOTOS[key], [cx, cy, cw, ch] = ph.crop, k = P(t, t0, 9, E.lin), z = lerp(1, z1, k);
  const vw = cw / z, vh = ch / z, vx = cx + (cw - vw) / 2 + panX * k, vy = cy + (ch - vh) / 2;
  const sf = uid('sp'), vg = uid('vg'), pw = w + 44, phh = h + 120, paper = raggedRect(pw, phh, 31);
  let s = `<defs>${sepiaFilter(sf, ph.sepia, ph.gain)}${rg(vg, ['#000000', '#000000', '#2A1A0A'], '50%', '50%', '75%')}</defs>`;
  s += `<g transform="translate(0 ${f((phh - h) / 2 - 22)})">${drop(paper, 16, 22, 0.38)}<path d="${paper}" fill="#F4EDDC"/><path d="${paper}" fill="none" stroke="#B9A47C" stroke-width="1.5"/></g>`;
  s += `<svg x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" viewBox="${f(vx)} ${f(vy)} ${f(vw)} ${f(vh)}" preserveAspectRatio="xMidYMid slice">` +
    `<image href="${ASSET + ph.src}" x="0" y="0" width="${ph.w}" height="${ph.h}" filter="url(#${sf})"/></svg>`;
  s += `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" fill="url(#${vg})" opacity="0.22"/>` +
    `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" fill="none" stroke="#2A1A0A" stroke-width="2" opacity="0.6"/>`;
  [0.2, 0.55, 0.8].forEach((u, i) => s += `<path d="M${f(-w / 2 + w * u)},${f(-h / 2)} l${f(8 - i * 6)},${f(h)}" stroke="#fff" stroke-width="1.2" opacity="0.22"/>`);
  s += typed(ph.caption, -w / 2, h / 2 + 34, 23, C.ink2) + typed(ph.credit, -w / 2, h / 2 + 68, 22, C.sepia, 'start', 700);
  [[-w / 2 + 30, -h / 2 - 4, -32], [w / 2 - 30, -h / 2 - 4, 30]].forEach(([tx, ty, tr]) =>
    s += `<rect x="-70" y="-20" width="140" height="40" fill="#EFE4C4" opacity="0.72" transform="translate(${f(tx)} ${f(ty)}) rotate(${tr})"/>` +
      `<rect x="-70" y="-20" width="140" height="40" fill="none" stroke="#C8B78F" stroke-width="1" opacity="0.6" transform="translate(${f(tx)} ${f(ty)}) rotate(${tr})"/>`);
  return G(T(x, y, 1, rot), 1, s);
}

// old contour map of the mountain
function oldMap(t) {
  let m = '';
  for (let k = 0; k < 7; k++) {
    let d = '';
    for (let i = 0; i <= 40; i++) {
      const a = i / 40 * Math.PI * 2, r = 70 + k * 46 + 18 * Math.sin(a * 3 + k) + 12 * Math.cos(a * 5 - k * 0.7);
      d += `${i ? 'L' : 'M'}${f(40 + r * Math.cos(a) * 1.15)},${f(-60 + r * Math.sin(a))}`;
    }
    m += `<path d="${d}Z" fill="none" stroke="${C.sepia}" stroke-width="${k ? 2.5 : 3.5}" opacity="${f(0.75 - k * 0.06)}"/>`;
  }
  m += `<path d="M-380,300 C-200,250 -120,330 40,280 C180,240 260,330 400,300" fill="none" stroke="#5E7A86" stroke-width="7" opacity="0.6"/>`;
  m += serif('G. KAWI', 40, -60, 34, C.ink2, 800, 'middle', 'letter-spacing="4"') + serif('Kabupaten Malang', -230, -360, 30, C.sepia, 600, 'start', 'font-style="italic"');
  m += serif('Wonosari', 150, 120, 26, C.sepia, 600, 'middle', 'font-style="italic"') + `<circle cx="150" cy="150" r="7" fill="${C.ink2}"/>`;
  // compass rose
  m += G(T(-260, 300, 1), 0.8, `<circle r="46" fill="none" stroke="${C.sepia}" stroke-width="2"/><path d="M0,-58 L10,0 L0,58 L-10,0 Z" fill="${C.sepia}"/><path d="M-58,0 L0,-8 L58,0 L0,8 Z" fill="${C.sepia}" opacity="0.6"/>` + serif('U', 0, -76, 22, C.sepia));
  // red ink circle around the pesarean, drawn by hand at "dimakamkan"
  const p = P(t, K.dimakam - 0.2, 0.8, E.inOutCubic);
  const back = 1 - P(t, K.loop + 0.2, 0.6);
  if (p > 0 && back > 0) m += `<path opacity="${f(back)}" d="M215,150 C215,90 90,90 85,150 C80,215 220,215 220,148" pathLength="1" fill="none" stroke="${C.redInk}" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 2" stroke-dashoffset="${f(1 - p)}"/>`;
  return sheet(0, 0, 820, 900, -3, m, { seed: 3 });
}

// sepia photo in a carved frame; a silhouette stands for the person
function silhouette(kind) {
  // a Javanese man in a blangkon and a beskap, from the chest up
  return `<path d="M-120,190 C-120,90 -70,60 -35,50 L-28,20 C-58,8 -62,-40 -55,-66 C-60,-70 -62,-82 -52,-90 C-40,-120 40,-120 52,-90 C62,-82 60,-70 55,-66 C62,-40 58,8 28,20 L35,50 C70,60 120,90 120,190 Z" fill="#3E2C1A" opacity="0.85"/>` +
    `<path d="M-58,-84 C-50,-118 50,-118 58,-84 C40,-92 -40,-92 -58,-84 Z" fill="#2A1C10"/>` + (kind === 2 ? `<path d="M-30,60 L0,120 L30,60" fill="none" stroke="#6E5434" stroke-width="5" opacity="0.6"/>` : '');
}
function photoFrame(x, y, w, h, rot, kind, label) {
  const fg = uid('fg'), pg = uid('pg'), cl = uid('pc');
  const outer = rectD(-w / 2, -h / 2, w, h, 6), inner = rectD(-w / 2 + 34, -h / 2 + 34, w - 68, h - 68, 2);
  let s = `<defs>${lg(fg, C.wood, 1, 1)}${rg(pg, C.photo, '50%', '40%', '75%')}<clipPath id="${cl}"><path d="${inner}"/></clipPath></defs>`;
  s += drop(outer, 18, 24, 0.4) + `<path d="${outer}" fill="url(#${fg})"/>`;
  s += `<path d="${rectD(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 4)}" fill="none" stroke="${C.gold[1]}" stroke-width="5" opacity="0.8"/>`;
  s += `<path d="M${-w / 2 + 6},${-h / 2 + 6} L${w / 2 - 6},${-h / 2 + 6}" stroke="#fff" stroke-width="4" opacity="0.25"/>`;
  s += `<path d="${inner}" fill="url(#${pg})"/><g clip-path="url(#${cl})">${G(T(0, 30, (w - 68) / 300), 1, silhouette(kind))}` +
    `<path d="${inner}" fill="none" stroke="#3A2812" stroke-width="60" opacity="0.35" filter="url(#b22)"/>` +
    [0, 1, 2].map(k => `<path d="M${-w / 4 + k * 70},${-h / 2} L${-w / 4 + k * 70 + 20},${h / 2}" stroke="#fff" stroke-width="1.5" opacity="0.18"/>`).join('') + `</g>`;
  s += `<path d="${inner}" fill="none" stroke="#2A1A0A" stroke-width="3"/>`;
  s += G(T(0, h / 2 + 46), 1, `<rect x="-${w * 0.42}" y="-22" width="${w * 0.84}" height="44" rx="4" fill="${C.gold[1]}"/><rect x="-${w * 0.42}" y="-22" width="${w * 0.84}" height="10" rx="4" fill="#fff" opacity="0.3"/>` +
    serif(label, 0, 2, 24, '#2A1A0A', 800));
  return G(T(x, y, 1, rot), 1, s) + pushPin(x, y - h / 2 + 14);
}

// typed index card
function indexCard(x, y, w, h, rot, lines) {
  const d = rectD(-w / 2, -h / 2, w, h, 6);
  let s = drop(d, 10, 14, 0.28) + `<path d="${d}" fill="${C.card}"/>`;
  s += `<path d="M${-w / 2},${-h / 2 + 60} L${w / 2},${-h / 2 + 60}" stroke="#C0453A" stroke-width="3"/>`;
  for (let yy = -h / 2 + 100; yy < h / 2 - 10; yy += 42) s += `<path d="M${-w / 2},${yy} L${w / 2},${yy}" stroke="${C.rule}" stroke-width="1.5" opacity="0.7"/>`;
  lines.forEach(([txt, size, col], i) => s += typed(txt, -w / 2 + 30, -h / 2 + 32 + i * (i ? 42 : 46) + (i ? 36 : 0), size, col || C.ink2));
  return G(T(x, y, 1, rot), 1, s);
}

// timeline ribbon of the Java War
function ribbon(t) {
  const x0 = 830, x1 = 1480, y = 60, p = P(t, K.perang - 0.2, 0.9, E.outCubic), g = uid('rb');
  if (p <= 0) return '';
  const xe = lerp(x0, x1, p);
  let s = `<defs>${lg(g, ['#B8473A', '#8C2B1F', '#5E1A12'])}</defs>`;
  s += `<path d="M${x0 - 30},${y - 34} L${xe},${y - 34} L${xe + 26},${y} L${xe},${y + 34} L${x0 - 30},${y + 34} L${x0 - 10},${y} Z" fill="#000" opacity="0.3" filter="url(#b10)" transform="translate(10 14)"/>`;
  s += `<path d="M${x0 - 30},${y - 34} L${xe},${y - 34} L${xe + 26},${y} L${xe},${y + 34} L${x0 - 30},${y + 34} L${x0 - 10},${y} Z" fill="url(#${g})"/>`;
  s += `<path d="M${x0 - 20},${y - 26} L${xe},${y - 26}" stroke="#fff" stroke-width="2" opacity="0.3"/>`;
  [[K.y1825, x0 + 80, '1825'], [K.y1830, x1 - 90, '1830']].forEach(([tt, x, lab]) => {
    const q = pop(t, tt - 0.05, 0.4);
    if (q.o && x < xe) s += G(T(x, y, q.s), q.o, `<circle r="40" fill="${C.card}" stroke="#5E1A12" stroke-width="4"/>` + serif(lab, 0, 2, 28, '#5E1A12', 800));
  });
  if (p > 0.4) s += serif('PERANG JAWA', (x0 + x1) / 2, y, 30, C.card, 800, 'middle', `letter-spacing="5" opacity="${f(clamp((p - 0.4) * 3))}"`);
  return s;
}

// a candle with a flickering flame (no randomness: two sines)
function candle(x, y, t, s = 1) {
  const fl = 1 + 0.08 * Math.sin(t * 17) + 0.05 * Math.sin(t * 29 + 1), g = uid('cd'), fg = uid('cf');
  return G(T(x, y, s), 1, `<defs>${lg(g, ['#F8EFD8', '#E9D8B0', '#B99F6E'], 1, 0)}${rg(fg, ['#FFFBE0', '#FFD45A', '#F08A24'], '50%', '60%', '60%')}</defs>` +
    `<ellipse cx="18" cy="96" rx="70" ry="22" fill="#000" opacity="0.3" filter="url(#b10)"/>` +
    `<ellipse cx="0" cy="90" rx="62" ry="18" fill="${C.bronze[2]}"/><ellipse cx="0" cy="86" rx="62" ry="18" fill="${C.bronze[1]}"/>` +
    `<rect x="-26" y="-60" width="52" height="146" rx="6" fill="url(#${g})"/><ellipse cx="0" cy="-60" rx="26" ry="8" fill="#F8EFD8"/>` +
    `<path d="M-14,-58 C-16,-40 -10,-34 -12,-20" stroke="#E9D8B0" stroke-width="8" stroke-linecap="round"/>` +
    `<circle cx="0" cy="-100" r="${f(70 * fl)}" fill="#FFC94A" opacity="0.18" filter="url(#b22)"/>` +
    `<path d="M0,${f(-128 * fl)} C14,-104 12,-80 0,-74 C-12,-80 -14,-104 0,${f(-128 * fl)} Z" fill="url(#${fg})"/><path d="M0,-74 L0,-62" stroke="#2A1A0A" stroke-width="3"/>`);
}

// family-tree letter with a wax seal
function silsilah(t) {
  const n = [['Sultan Hamengkubuwono I', 'bertakhta 1755–1792', -200], ['keturunan', '', -60], ['R.M. Iman Soedjono', 'buyut', 110]];
  let m = serif('Soerat Kekantjingan', 0, -255, 34, C.ink2, 800, 'middle', 'font-style="italic"') + `<path d="M-200,-222 L200,-222" stroke="${C.sepia}" stroke-width="2"/>`;
  n.forEach(([a, b, yy], i) => {
    const q = pop(t, K.surat + 0.2 + i * 0.45, 0.4);
    if (!q.o) return;
    if (i) m += `<path d="M0,${n[i - 1][2] + 34} L0,${yy - 34}" stroke="${C.sepia}" stroke-width="3" stroke-dasharray="${i === 1 ? '8 8' : '0'}" opacity="${f(q.o)}"/>`;
    m += G(T(0, yy, q.s), q.o, `<rect x="-210" y="-32" width="420" height="64" rx="6" fill="#F8EEDA" stroke="${C.sepia}" stroke-width="2.5"/>` +
      serif(a, 0, b ? -8 : 0, i === 1 ? 24 : 28, C.ink2, i === 1 ? 600 : 800) + (b ? typed(b, 0, 18, 18, C.sepia, 'middle') : ''));
  });
  for (let k = 0; k < 4; k++) m += `<path d="M-230,${190 + k * 22} L${120 - k * 40},${190 + k * 22}" stroke="${C.sepia}" stroke-width="2" opacity="0.35"/>`;
  m += typed('Ngajogjakarta, 23 Juni 1964', -230, 285, 20, C.sepia);
  // wax seal: an irregular red blob with a pressed ring (a generic emblem, not the palace's)
  const sp = pop(t, K.y1964, 0.35), g = uid('wx');
  let blob = '';
  for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, r = 62 + 7 * Math.sin(a * 5) + 4 * Math.cos(a * 9); blob += `${i ? 'L' : 'M'}${f(r * Math.cos(a))},${f(r * Math.sin(a))}`; }
  if (sp.o) m += G(T(190, 230, sp.s), sp.o, `<defs>${rg(g, C.wax)}</defs><path d="${blob}Z" transform="translate(6 8)" fill="#000" opacity="0.35" filter="url(#b4)"/><path d="${blob}Z" fill="url(#${g})"/>` +
    `<circle r="40" fill="none" stroke="${C.wax[2]}" stroke-width="5" opacity="0.7"/><circle r="40" fill="none" stroke="#fff" stroke-width="2" opacity="0.25" transform="translate(-2 -2)"/>` +
    `<path d="M0,-24 L7,-7 L25,-7 L11,4 L16,22 L0,11 L-16,22 L-11,4 L-25,-7 L-7,-7 Z" fill="${C.wax[2]}" opacity="0.6"/>`);
  return sheet(2300, 330, 640, 640, 2, m, { seed: 9 });
}

// woven tray (tampah) with flower petals, and a bronze pot with incense sticks
function tampah(x, y, t) {
  const g = uid('tp');
  let s = `<defs>${rg(g, ['#E8CB8A', '#C9A15A', '#8E6A30'], '45%', '40%', '70%')}</defs>` + `<circle cx="${x + 16}" cy="${y + 22}" r="190" fill="#000" opacity="0.3" filter="url(#b10)"/>` +
    `<circle cx="${x}" cy="${y}" r="190" fill="url(#${g})"/>`;
  for (let r = 40; r < 190; r += 22) s += `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#8E6A30" stroke-width="3" stroke-dasharray="10 6" opacity="0.6"/>`;
  s += `<circle cx="${x}" cy="${y}" r="186" fill="none" stroke="#6E4E1E" stroke-width="10"/>`;
  for (let i = 0; i < 46; i++) {
    const a = rnd(i * 3) * Math.PI * 2, r = 150 * Math.sqrt(rnd(i * 5 + 2)), col = ['#C8323A', '#E86A7A', '#FFFFFF', '#F5E7B8', '#D84A3A'][i % 5];
    s += `<ellipse cx="${f(x + r * Math.cos(a))}" cy="${f(y + r * Math.sin(a))}" rx="${f(10 + 6 * rnd(i))}" ry="${f(6 + 4 * rnd(i * 7))}" transform="rotate(${f(rnd(i * 11) * 180)} ${f(x + r * Math.cos(a))} ${f(y + r * Math.sin(a))})" fill="${col}" stroke="#5A2A1A" stroke-width="1" opacity="0.92"/>`;
  }
  return s;
}
function incense(x, y, t) {
  const g = uid('ic');
  let s = `<defs>${rg(g, C.bronze, '40%', '35%', '70%')}</defs><ellipse cx="${x + 16}" cy="${y + 24}" rx="120" ry="110" fill="#000" opacity="0.32" filter="url(#b10)"/>` +
    `<circle cx="${x}" cy="${y}" r="115" fill="url(#${g})"/><circle cx="${x}" cy="${y}" r="88" fill="#6E6258"/><circle cx="${x}" cy="${y}" r="88" fill="#BDB2A4" opacity="0.5"/>`;
  [[-30, -20], [0, 10], [28, -14], [-8, -38], [20, 30]].forEach(([dx, dy], i) => {
    const ang = -35 + i * 14, len = 150, ex = x + dx + len * Math.cos(ang * Math.PI / 180), ey = y + dy + len * Math.sin(ang * Math.PI / 180);
    s += `<path d="M${x + dx},${y + dy} L${f(ex)},${f(ey)}" stroke="#A8322A" stroke-width="7" stroke-linecap="round"/>` +
      `<circle cx="${f(ex)}" cy="${f(ey)}" r="${f(6 + 1.5 * Math.sin(t * 9 + i))}" fill="#FF8A3A"/><circle cx="${f(ex)}" cy="${f(ey)}" r="16" fill="#FF8A3A" opacity="0.3" filter="url(#b4)"/>`;
    for (let k = 0; k < 2; k++) {
      const u = ((t * 0.4 + i * 0.2 + k * 0.5) % 1);
      s += `<path d="M${f(ex)},${f(ey)} c${f(-20 + 40 * u)},-40 ${f(30 - 20 * u)},-80 0,${f(-140 * u - 30)}" fill="none" stroke="#FFFFFF" stroke-width="${f(10 + 16 * u)}" stroke-linecap="round" opacity="${f(0.35 * (1 - u))}" filter="url(#b10)"/>`;
    }
  });
  return s;
}

// a Javanese calendar page and a procession of silhouettes carrying a gunungan
function suroPage(x, y) {
  const m = `<rect x="-200" y="-230" width="400" height="80" fill="${C.redInk}"/>` + serif('SURO', 0, -190, 40, C.card, 800, 'middle', 'letter-spacing="8"') +
    serif('1', 0, 0, 200, C.ink2, 900) + typed('tahun baru Jawa', 0, 150, 26, C.sepia, 'middle');
  return sheet(x, y, 420, 500, -5, m, { seed: 13 });
}
function procession(t, x0, x1, y) {
  const u = P(t, K.kirab - 0.6, 3.6, E.lin);
  if (u <= 0) return '';
  let s = '';
  const walker = (x, k) => {
    const sw = 10 * Math.sin(t * 7 + k);
    return `<g transform="translate(${f(x)} ${y})"><circle cx="0" cy="-118" r="16" fill="#3A2812"/><path d="M-14,-100 L14,-100 L18,-30 L-18,-30 Z" fill="#3A2812"/>` +
      `<path d="M-8,-30 L${f(-8 + sw)},0 M8,-30 L${f(8 - sw)},0" stroke="#3A2812" stroke-width="10" stroke-linecap="round"/></g>`;
  };
  const head = lerp(x0, x1, u);
  for (let k = 0; k < 6; k++) {
    const x = head - k * 70;
    if (x < x0 - 40) continue;
    s += walker(x, k);
    if (k === 2) s += `<path d="M${f(x - 90)},-120 L${f(x + 90)},-120" transform="translate(0 ${y})" stroke="#5E3A1F" stroke-width="10"/>` +
      `<path d="M${f(x - 60)},${y - 125} L${f(x)},${y - 250} L${f(x + 60)},${y - 125} Z" fill="#5E7A3A"/><path d="M${f(x - 60)},${y - 125} L${f(x)},${y - 250}" stroke="#fff" stroke-width="3" opacity="0.3"/>`;
  }
  return `<g opacity="${f(clamp(u * 5))}">${s}</g>`;
}

// a news clipping with the caretakers' statement
function clipping(t) {
  let m = serif('Pengelola Pesarean:', -270, -210, 38, C.ink2, 800, 'start') + serif('"Bukan Pesugihan"', -270, -160, 44, C.ink2, 900, 'start', 'font-style="italic"');
  for (let k = 0; k < 12; k++) m += `<rect x="${k % 2 ? 20 : -270}" y="${-100 + Math.floor(k / 2) * 34}" width="${250 - (k % 3) * 30}" height="10" fill="${C.sepia}" opacity="0.35"/>`;
  const q = pop(t, K.berdoa - 0.1, 0.4);
  if (q.o) m += G(T(0, 200, q.s), q.o, `<rect x="-270" y="-50" width="540" height="100" fill="${C.yellow}" opacity="0.45"/>` + typed('peziarah datang', -250, -16, 28, C.ink2) + typed('untuk berdoa', -250, 20, 28, C.ink2));
  m += typed('Metro TV, 17 Juli 2026', -270, 285, 20, C.sepia);
  return sheet(4300, 0, 640, 660, 3, m, { seed: 21, cols: ['#F2EBDD', '#E3D7C0', '#CDBB98'] });
}

// pins on every item, linked by red thread at the end
const PINS = [[-60, -880], [150, 150], [1000, -705], [1300, -390], [1150, 20], [1150, 230], [2150, -675], [2300, 30], [3320, -680], [3150, -160], [3150, 410], [4300, -310]];
function thread(t) {
  if (t < K.s11 - 0.3) return '';
  let s = '';
  for (let i = 1; i < PINS.length; i++) {
    const p = P(t, K.s11 + 0.1 + i * 0.12, 0.35, E.outCubic);
    if (p <= 0) continue;
    const [ax, ay] = PINS[i - 1], [bx, by] = PINS[i], ex = lerp(ax, bx, p), ey = lerp(ay, by, p), mx = (ax + ex) / 2, my = (ay + ey) / 2 + 60 * p;
    s += `<path d="M${ax},${ay} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}" fill="none" stroke="#000" stroke-width="14" opacity="0.25" filter="url(#b4)" transform="translate(6 10)"/>` +
      `<path d="M${ax},${ay} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}" fill="none" stroke="${C.string}" stroke-width="9"/>`;
  }
  // gone again by the loop, so the last frame matches the first
  return G('', 1 - P(t, K.loop, 0.8), s + PINS.map(([x, y]) => pushPin(x, y)).join(''));
}

// ---------- setup ----------
const ICON = {
  pin: () => `<path d="M0,20 C-8,8 -16,0 -16,-8 A16,16 0 1 1 16,-8 C16,0 8,8 0,20 Z" fill="${C.accent}"/><circle cx="0" cy="-8" r="6" fill="#fff"/>`,
  frame: () => `<rect x="-18" y="-22" width="36" height="44" fill="#5E3A1F"/><rect x="-11" y="-15" width="22" height="30" fill="#D9C29A"/><circle cx="0" cy="-4" r="6" fill="#3E2C1A"/>`,
  scroll: () => `<rect x="-16" y="-20" width="32" height="40" fill="#F3E7CB" stroke="#5A4126" stroke-width="2"/><circle cx="10" cy="12" r="9" fill="#9B2A1E"/>`,
  incense: () => `<path d="M-10,18 L-4,-18 M0,18 L2,-20 M10,18 L8,-16" stroke="#A8322A" stroke-width="4"/><ellipse cx="0" cy="18" rx="18" ry="6" fill="#9C6A2C"/>`,
};

function setup(D) {
  const s = D.scenes;
  K = {
    pesugihan: s[0].at('pesugihan'),
    s2: s[1].start, siapa: s[1].at('siapa'), dimakam: s[1].at('dimakamkan'),
    s3: s[2].start, zakaria: s[2].at('zakaria'), eyang: s[2].at('eyang'),
    s4: s[3].start, dipo: s[3].at('diponegoro'), perang: s[3].at('perang'), y1825: s[3].at('1825'), y1830: s[3].at('1830'),
    s5: s[4].start, wafat: s[4].at('wafat'), y1871: s[4].at('1871'), lereng: s[4].at('lereng'),
    s6: s[5].start, raden: s[5].at('raden'), murid: s[5].at('murid'),
    s7: s[6].start, surat: s[6].at('surat'), y1964: s[6].at('1964'), buyut: s[6].at('buyut'),
    s8: s[7].start, jawa: s[7].at('jawa'), tionghoa: s[7].at('tionghoa'),
    s9: s[8].start, suro: s[8].at('suro'), kirab: s[8].at('kirab'),
    s10: s[9].start, bantah: s[9].at('membantah'), berdoa: s[9].at('berdoa'),
    s11: s[10].start, jejak: s[10].at('jejak'),
    loop: D.total - 1.5,
  };
  // warm the browser's cache for the photos, so the first frames that show them are not blank
  Object.values(PHOTOS).forEach(ph => { const im = new Image(); im.src = ASSET + ph.src; });
  const home = { x: -40, y: -520, z: 1.16 }, V = (x, y, z = 1.15) => ({ x, y, z });
  setCamera([
    home,
    { at: K.pesugihan - 0.3, dur: 0.7, ...V(120, -360, 1.08) },
    { at: K.s2 - 0.1, dur: 0.7, ...V(60, 60, 1.05) },
    { at: K.s3 - 0.2, dur: 0.9, ...V(1130, -420) },
    { at: K.s4 - 0.2, dur: 0.7, ...V(1160, 40) },
    { at: K.s5 - 0.2, dur: 0.7, ...V(1220, 330) },
    { at: K.s6 - 0.2, dur: 0.9, ...V(2290, -420) },
    { at: K.s7 - 0.2, dur: 0.7, ...V(2300, 300, 1.1) },
    { at: K.s8 - 0.2, dur: 0.9, ...V(3320, -400, 1.1) },
    { at: K.tionghoa - 0.4, dur: 0.6, ...V(3320, -20, 1.1) },
    { at: K.s9 - 0.2, dur: 0.7, ...V(3380, 600, 1.08) },
    { at: K.s10 - 0.2, dur: 0.9, ...V(4300, 20) },
    { at: K.s11 - 0.2, dur: 1.1, ...V(2100, -80, 0.2) },
    { at: K.loop, dur: 1.2, ...home },
  ]);
  setHeadlines([
    { at: -0.6, end: K.s2 - 0.1, text: 'GUNUNG KAWI:\n*PESUGIHAN?*' },
    { at: K.dimakam, end: K.s3 - 0.1, text: 'SIAPA YANG\n*DIMAKAMKAN?*' },
    { at: K.eyang, end: K.s4 - 0.1, text: '*EYANG DJOEGO*' },
    { at: K.dipo, end: K.s5 - 0.1, text: 'PENGAWAL\n*DIPONEGORO*' },
    { at: K.y1871, end: K.s6 - 0.1, text: 'WAFAT *1871*', hype: true },
    { at: K.raden, end: K.s7 - 0.1, text: 'R.M. IMAN\n*SOEDJONO*' },
    { at: K.buyut, end: K.s8 - 0.1, text: 'BUYUT\n*HAMENGKUBUWONO I*' },
    { at: K.jawa, end: K.s9 - 0.1, text: 'JAWA &\n*TIONGHOA*' },
    { at: K.kirab, end: K.s10 - 0.1, text: 'KIRAB *1 SURO*' },
    { at: K.bantah, end: K.s11 - 0.1, text: 'PENGELOLA\n*MEMBANTAH*' },
    { at: K.jejak, end: K.loop + 0.6, text: 'JEJAK\n*PERANG JAWA*' },
  ]);
  setChapters([
    { at: 0.3, icon: ICON.pin },
    { at: K.eyang, icon: ICON.frame },
    { at: K.surat, icon: ICON.scroll },
    { at: K.jawa, icon: ICON.incense },
  ], { at: K.s11, end: D.total });
}

function cues(D) {
  return [
    [K.pesugihan, 'pop'], [K.dimakam, 'tick'],
    [K.s3 - 0.2, 'whoosh'], [K.eyang, 'pop'],
    [K.s4 - 0.2, 'whoosh'], [K.y1825, 'tick'], [K.y1830, 'tick'],
    [K.s5 - 0.2, 'whoosh'], [K.y1871 + 0.2, 'thud'],
    [K.s6 - 0.2, 'whoosh'], [K.raden, 'pop'],
    [K.s7 - 0.2, 'whoosh'], [K.y1964 + 0.1, 'thud'], [K.buyut, 'ding'],
    [K.s8 - 0.2, 'whoosh'], [K.jawa, 'pop'], [K.tionghoa, 'pop'],
    [K.s9 - 0.2, 'whoosh'], [K.kirab, 'chirp'],
    [K.s10 - 0.2, 'whoosh'], [K.bantah, 'pop'],
    [K.s11 - 0.2, 'whoosh'], [K.jejak, 'ding'], [K.loop, 'whoosh'],
  ];
}

function drawWorld(t, cam) {
  NID = 0;
  const far = cam.z < 0.6, near = (x, y, r = 900) => far || (Math.abs(cam.x - x) < r / cam.z + 300 && Math.abs(cam.y - y) < 1500 / cam.z);
  let s = DEFS;
  if (near(0, 0)) {
    s += oldMap(t);
    s += photoPrint('kawi', -40, -620, 720, 560, -3, t, 0);
    const q = pop(t, K.pesugihan - 0.1, 0.45), back = 1 - P(t, K.loop + 0.2, 0.6);
    if (q.o) s += G(T(300, -190, q.s), q.o * back, indexCard(0, 0, 360, 170, 6, [['"pesugihan?"', 34, C.redInk], ['kata orang', 26, C.sepia]]));
    const p = pop(t, K.dimakam + 0.3, 0.4);
    if (p.o) s += G(T(160, 280, p.s), p.o * back, `<rect x="-190" y="-26" width="380" height="52" fill="${C.card}" stroke="${C.sepia}" stroke-width="2"/>` + typed('Pesarean Gunung Kawi', 0, 2, 26, C.ink2, 'middle'));
  }
  if (near(1150, -100)) {
    s += photoFrame(1000, -440, 330, 420, -3, 1, 'Eyang Djoego');
    s += G(T(1340, -240, pop(t, K.zakaria - 0.1, 0.4).s), pop(t, K.zakaria - 0.1, 0.4).o,
      indexCard(0, 0, 400, 230, 4, [['KIAI ZAKARIA II', 30], ['"Eyang Djoego"', 28, C.redInk], ['wafat 1871', 26]]));
    s += ribbon(t);
    s += sheet(1100, 400, 520, 330, -2, typed('CATATAN', -220, -120, 26, C.sepia) + serif('wafat', -200, -40, 44, C.ink2, 700, 'start', 'font-style="italic"') +
      serif('1871', -200, 50, 110, C.ink2, 900, 'start') + typed('lereng Gunung Kawi', -200, 125, 24, C.sepia), { seed: 5 });
    s += candle(1440, 330, t, 1.1);
  }
  if (near(2300, -100)) {
    s += photoFrame(2150, -440, 330, 420, 3, 2, 'R.M. Iman Soedjono');
    s += G(T(2470, -230, pop(t, K.murid - 0.1, 0.4).s), pop(t, K.murid - 0.1, 0.4).o,
      indexCard(0, 0, 400, 190, -4, [['R.M. IMAN SOEDJONO', 28], ['murid & anak angkat', 26, C.redInk]]));
    s += silsilah(t);
  }
  if (near(3400, 100)) {
    s += tampah(3150, 30, t) + incense(3480, 10, t);
    s += photoPrint('keraton', 3320, -480, 560, 420, 2, t, K.s8 - 0.4, { z1: 1.15 });
    const a = pop(t, K.jawa - 0.1, 0.4), b = pop(t, K.tionghoa - 0.1, 0.4);
    if (a.o) s += G(T(3150, 260, a.s), a.o, `<rect x="-90" y="-24" width="180" height="48" fill="${C.card}" stroke="${C.sepia}" stroke-width="2"/>` + typed('Jawa', 0, 2, 28, C.ink2, 'middle'));
    if (b.o) s += G(T(3480, 260, b.s), b.o, `<rect x="-110" y="-24" width="220" height="48" fill="${C.card}" stroke="${C.sepia}" stroke-width="2"/>` + typed('Tionghoa', 0, 2, 28, C.ink2, 'middle'));
    s += suroPage(3150, 640) + procession(t, 3330, 3720, 820);
  }
  if (near(4300, 0)) s += clipping(t);
  return s + thread(t);
}

function drawOverlay(t) {
  let s = '';
  // old film: a faint flicker and a couple of scratches that jump 12 times a second
  const k = Math.floor(t * 12), fl = 0.03 * rnd(k * 7 + 1);
  s += `<rect width="1080" height="1920" fill="#2A1A0A" opacity="${f(fl)}"/>`;
  for (let i = 0; i < 2; i++) if (rnd(k * 13 + i) > 0.55) s += `<path d="M${f(80 + 920 * rnd(k * 17 + i))},0 l${f((rnd(k * 19 + i) - 0.5) * 30)},1920" stroke="#fff" stroke-width="1.5" opacity="0.18"/>`;
  if (t > K.y1871 && t < K.s6 + 0.1) s += G('', 1 - P(t, K.s6 - 0.25, 0.25), stamp('TERCATAT', t, K.y1871 + 0.2, 560, 1150, C.accent, -6, 90));
  if (t > K.y1964 && t < K.s8 + 0.1) s += G('', 1 - P(t, K.s8 - 0.25, 0.25), stamp('ARSIP', t, K.y1964 + 0.1, 330, 1200, C.accent, -8, 90));
  s += cite('Sumber: Detik Jatim, 9 Agu 2025', t, K.pesugihan, K.s3 - 0.1);
  s += cite('Awalin, ARNAWA UGM (2024); Detik (2025)', t, K.zakaria, K.s4 - 0.1);
  s += cite('Sumber: Britannica; The Jakarta Post (2018)', t, K.dipo, K.s5 - 0.1);
  s += cite('Sumber: Detik (2025); Metro TV (2026)', t, K.wafat, K.s6 - 0.1);
  s += cite('Sumber: Awalin, ARNAWA UGM (2024)', t, K.raden, K.s8 - 0.1);
  s += cite('Sumber: The Jakarta Post, 11 Sep 2018', t, K.jawa, K.s10 - 0.1);
  s += cite('Sumber: Metro TV, 17 Jul 2026', t, K.bantah, K.s11 - 0.1);
  return s;
}

// ---------- thumbnail ----------
function drawThumbnail() {
  NID = 0;
  K.dimakam = -10; K.loop = 999;  // the red circle fully drawn, nothing faded
  let w = DEFS + `<rect width="1080" height="1920" fill="${C.bg}"/>`;
  w += G('translate(420 1180) scale(1.05)', 1, oldMap(5));
  w += G('translate(760 860) scale(1.2)', 1, photoFrame(60, 80, 330, 420, 5, 1, 'Eyang Djoego'));
  w += photoPrint('kawi', 330, 820, 560, 435, -5, 0, 0);
  w += `<path d="M640,1090 C560,1180 470,1260 470,1330" fill="none" stroke="${C.string}" stroke-width="9"/>` + pushPin(640, 1090);
  const ui = titleText('SIAPA DI MAKAM\n*GUNUNG KAWI?*', 540, 400, 130, 980, 24) + stamp('ARSIP', 2, 1, 300, 1560, C.accent, -8, 80);
  return { world: w, ui };
}
