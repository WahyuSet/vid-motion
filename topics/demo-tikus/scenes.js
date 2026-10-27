// Demo for the Si Tikus channel (theme newsprint, soft plush props): what inflation is.
// Props follow the mascot's style: gradient shading, no ink outlines.
Object.assign(C, { wood: '#C99B6D', woodLo: '#A87B50', fry: '#E8B04B', fryLo: '#C58A2C', plate: '#FFFFFF' });

const softGrad = (id, a, b, c) => `<radialGradient id="${id}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="${a}"/><stop offset="0.6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
const DEFS = `<defs>${softGrad('dWood', '#E2BC92', C.wood, C.woodLo)}${softGrad('dFry', '#F8D27E', C.fry, C.fryLo)}` +
  `${softGrad('dCard', '#FFFFFF', '#F6F4F0', '#E2DED6')}${softGrad('dGreen', '#9FD9A6', '#6CC07A', '#4A9E5A')}` +
  `<radialGradient id="dShade"><stop offset="0" stop-color="#18223A" stop-opacity="0.22"/><stop offset="1" stop-color="#18223A" stop-opacity="0"/></radialGradient></defs>`;
const shade = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#dShade)"/>`;
const newsText = (s, x, y, size, fill, weight = 700, anchor = 'middle') =>
  `<text x="${f(x)}" y="${f(y)}" font-family="Oswald" font-weight="${weight}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="central">${esc(s)}</text>`;

let K = {};
const ICON = {
  tag: () => `<path d="M-20,-14 L8,-14 L22,0 L8,14 L-20,14 Z" fill="${C.yellow}" ${stroke(4)}/><circle cx="-10" cy="0" r="4" fill="${C.ink}"/>`,
  chart: () => `<path d="M-20,18 L-20,-20 M-20,18 L22,18" fill="none" ${stroke(4)}/><path d="M-14,10 L-4,2 L4,6 L18,-14" fill="none" ${stroke(5, C.accent)}/>`,
  basket: () => `<path d="M-22,-4 L22,-4 L16,18 L-16,18 Z" fill="${C.wood}" ${stroke(4)}/><path d="M-12,-4 Q0,-26 12,-4" fill="none" ${stroke(4)}/>`,
};

function setup(D) {
  const s = D.scenes;
  K = { naik: s[0].at('naik'), s2: s[1].start, inflasi: s[1].at('inflasi'), umum: s[1].at('umum'), s2e: s[1].end,
    s3: s[2].start, sama: s[2].at('sama'), sedikit: s[2].at('sedikit'), loop: D.total - 1.2 };
  const start = { x: 0, y: -80, z: 0.95 };
  setCamera([start, { at: K.s2, dur: 1.0, x: 40, y: -330, z: 0.95 }, { at: K.s3, dur: 1.0, x: 0, y: -60, z: 1.0 }, { at: K.loop, dur: 1.1, ...start }]);
  setHeadlines([
    { at: K.naik, end: s[0].end - 0.1, text: 'KOK *NAIK* TERUS?' },
    { at: K.inflasi, end: K.s2e - 0.1, text: 'ITU NAMANYA\n*INFLASI*' },
    { at: K.sama, end: K.loop, text: 'UANG SAMA,\nDAPAT *SEDIKIT*' },
  ]);
  setChapters([{ at: 0.3, icon: ICON.tag }, { at: K.s2, icon: ICON.chart }, { at: K.s3, icon: ICON.basket }]);
}

function cues(D) {
  return [[K.naik, 'pop'], [K.s2, 'whoosh'], [K.inflasi, 'tick'], [K.s3, 'whoosh'], [K.sedikit, 'pop'], [K.loop, 'whoosh']];
}

function priceTag(x, y, label, s = 1) {
  return G(T(x, y, s, -6), 1, shade(6, 82, 110, 14) +
    `<path d="M-120,-60 L80,-60 L130,0 L80,60 L-120,60 Z" fill="url(#dCard)"/>` +
    `<circle cx="-92" cy="0" r="12" fill="${C.bg}"/>` + newsText(label, 6, 4, 64, C.ink));
}

function drawWorld(t) {
  let s = DEFS;
  // the stall: table, plate of gorengan, price tag that keeps going up
  s += shade(0, 200, 360, 30);
  s += `<rect x="-320" y="40" width="640" height="46" rx="23" fill="url(#dWood)"/>`;
  s += `<rect x="-280" y="80" width="34" height="120" rx="14" fill="${C.woodLo}"/><rect x="246" y="80" width="34" height="120" rx="14" fill="${C.woodLo}"/>`;
  s += `<ellipse cx="40" cy="34" rx="190" ry="26" fill="url(#dCard)"/>`;
  [[-40, 0, 0], [40, -8, 1], [120, 2, 2], [10, -40, 3], [90, -44, 4]].forEach(([x, y, i]) =>
    s += `<ellipse cx="${x}" cy="${y}" rx="52" ry="30" fill="url(#dFry)" transform="rotate(${-10 + i * 6} ${x} ${y})"/>` +
      `<ellipse cx="${x - 14}" cy="${y - 10}" rx="16" ry="7" fill="#fff" opacity="0.45"/>`);
  const steps = ['Rp1.000', 'Rp1.500', 'Rp2.000'];
  const k = Math.min(2, Math.floor(clamp((t - K.naik) / 0.7) * 2.99));
  const bump = t > K.naik ? 1 + 0.12 * Math.exp(-6 * ((t - K.naik) % 0.7)) : 1;
  s += shadow(170, -80, 80, 0.2);
  s += burst(t, K.naik, 170, -160, { n: 8, r: 90, col: C.accent, dur: 0.35, size: 7 });
  s += priceTag(170, -160, t < K.naik ? steps[0] : steps[k], bump);
  s += newsText('ILUSTRASI', 170, -60, 26, C.muted, 500);

  // the chart: prices across time keep going up
  if (t > K.s2 && t < K.s3 + 0.2) {
    const o = P(t, K.s2, 0.5) * (1 - P(t, K.s3 - 0.4, 0.4)), d = P(t, K.inflasi, 1.4, E.inOutCubic);
    let line = '';
    const pts = [[-300, -330], [-200, -360], [-100, -350], [0, -400], [100, -420], [200, -470], [300, -520]];
    const n = Math.max(1, Math.floor(d * (pts.length - 1)) + 1);
    line = pts.slice(0, n).map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
    s += G('', o, shade(0, -250, 380, 24) + `<rect x="-360" y="-600" width="720" height="330" rx="34" fill="url(#dCard)"/>` +
      `<path d="M-320,-300 L320,-300 M-320,-300 L-320,-570" fill="none" ${stroke(5, C.muted)}/>` +
      `<path d="${line}" fill="none" ${stroke(12, C.accent)}/>` +
      newsText('HARGA', -330, -585, 30, C.muted, 600, 'start') + newsText('WAKTU', 320, -280, 30, C.muted, 600, 'end'));
  }

  // same money, fewer things in the basket
  if (t > K.s3) {
    const o = P(t, K.s3, 0.5) * (1 - P(t, K.loop, 0.6)), lose = P(t, K.sedikit, 0.6);
    let b = shade(0, -230, 220, 20) + `<path d="M-200,-420 L200,-420 L160,-250 L-160,-250 Z" fill="url(#dWood)"/>` +
      `<path d="M-110,-420 Q0,-560 110,-420" fill="none" stroke="${C.woodLo}" stroke-width="16" stroke-linecap="round"/>`;
    [[-110, -440, '#E96B5A'], [-40, -455, '#F2C14E'], [30, -445, '#6CC07A'], [100, -450, '#E96B5A'], [160, -440, '#F2C14E']].forEach(([x, y, col], i) => {
      const gone = i >= 3 ? lose : 0;
      b += G(T(x, y - gone * 120), 1 - gone, `<circle r="40" fill="${col}"/><ellipse cx="-12" cy="-14" rx="12" ry="7" fill="#fff" opacity="0.5"/>`);
    });
    b += G(T(-340, -380), 1, `<rect x="-90" y="-50" width="180" height="100" rx="20" fill="url(#dGreen)"/>` + newsText('Rp10.000', 0, 2, 40, '#fff'));
    s += G('', o, b);
  }

  // Si Tikus reacts
  const pose = t < K.s2 ? 'think' : t < K.s3 ? 'point' : t > K.sedikit ? 'shock' : 'calm';
  const face = t < K.s2 ? 'skeptical' : t < K.s3 ? 'smile' : t > K.sedikit ? 'sad' : 'smile';
  s += tikus(-330, 110, 0.85, t > K.loop + 0.4 ? 'think' : pose, t, 0, null, t > K.loop + 0.4 ? 'skeptical' : face);
  return s;
}

function drawOverlay(t) {
  return cite('Sumber: Bank Indonesia, definisi inflasi', t, K.inflasi, K.s2e - 0.1);
}
