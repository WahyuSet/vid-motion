// Topic: manfaat pisang (fakta-unik, Cicak Tahu) — no mascot, realistic look: gradient shading, soft blurred
// shadows, specular highlights and sugar spots instead of ink and flat colour. Pop words are stickers.
// One long kitchen table: A hero banana (x 0) -> B muscle (1500) -> C heart (3000) -> D plate (4500)
// -> E green banana (6000) -> F gut (7500) -> G ripening (9000) -> H bike (10500) -> I scale (12000)
// -> J kidneys (13500), then back to A for the loop.

Object.assign(C, {
  wall: '#F2E4CC', wallLo: '#E2CCA6', wood: '#B98654', woodHi: '#D2A576', woodLo: '#8A5A31', grain: '#7A4D28',
  peelY: ['#FFE98A', '#F3C632', '#BE8714'], peelG: ['#C4DE77', '#82B23E', '#4C7A22'], spot: '#4E3311',
  flesh: '#FBF1C6', fleshLo: '#E9D592', muscle: ['#EE7B6E', '#C2403A', '#7E1E1C'], heart: ['#F07C72', '#C9342F', '#7A1715'],
  gut: '#E8A39E', gutLo: '#B9635F', colon: '#E3AE86', colonLo: '#B07850', kidney: ['#D0705F', '#A2453A', '#6E2620'],
  steel: ['#F4F6F8', '#B9C0C8', '#6E7782'], tire: '#1E1F24', road: '#4A4D55',
});

let K = {}, NID = 0;
const uid = p => `${p}${NID++}`;
const ZONES = { A: 0, B: 1500, Cz: 3000, D: 4500, E: 6000, F: 7500, Gz: 9000, H: 10500, I: 12000, J: 13500 };
const near = (cam, x, r = 1300) => Math.abs(cam.x - x) < r / cam.z + 400;

const DEFS = `<defs>
  <filter id="b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="b8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="b16" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="b40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
  <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7EBD6"/><stop offset="1" stop-color="${C.wallLo}"/></linearGradient>
  <linearGradient id="woodG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.woodHi}"/><stop offset="0.5" stop-color="${C.wood}"/><stop offset="1" stop-color="${C.woodLo}"/></linearGradient>
  <linearGradient id="edgeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.woodLo}"/><stop offset="1" stop-color="#5E3A1C"/></linearGradient>
  <radialGradient id="glossG" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity="0.85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>`;

// ---------- realistic pieces ----------
const lg = (id, cols, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">` +
  cols.map((c, i) => `<stop offset="${f(i / (cols.length - 1))}" stop-color="${c}"/>`).join('') + `</linearGradient>`;
const rg = (id, cols, cx = '38%', cy = '32%', r = '75%') => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">` +
  cols.map((c, i) => `<stop offset="${f(i / (cols.length - 1))}" stop-color="${c}"/>`).join('') + `</radialGradient>`;
const softShadow = (x, y, rx, ry, o = 0.3) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="#2A1A0C" opacity="${f(o)}" filter="url(#b16)"/>`;

const BANANA = 'M-205,-30 C-150,80 110,95 205,-25 L218,-38 C150,20 -120,10 -195,-48 Z';
// banana(x, y, s, {rot, ripe: 0 green .. 1 yellow .. 2 spotted, seed, shadow})
function banana(x, y, s, { rot = 0, ripe = 1, seed = 1, shadowOn = true } = {}) {
  const g = uid('bg'), cl = uid('bc'), p = clamp(ripe), sp = clamp(ripe - 1);
  const cols = [0, 1, 2].map(i => mix(C.peelG[i], C.peelY[i], p));
  let s0 = `<defs>${lg(g, cols)}<clipPath id="${cl}"><path d="${BANANA}"/></clipPath></defs>`;
  if (shadowOn) s0 += softShadow(10, 78, 190, 20, 0.32);
  // stem and tip
  const stem = mix('#7B8E3A', '#6B5A2A', clamp(ripe - 0.6));
  s0 += `<path d="M198,-30 C212,-42 226,-54 240,-72" fill="none" stroke="${stem}" stroke-width="22" stroke-linecap="round"/>` +
    `<path d="M236,-68 L244,-78" stroke="#3E2A14" stroke-width="24" stroke-linecap="round"/>`;
  s0 += `<path d="${BANANA}" fill="url(#${g})"/>`;
  s0 += `<g clip-path="url(#${cl})">` +
    `<path d="M-205,-20 C-150,90 110,105 205,-15" fill="none" stroke="${mix(cols[2], '#000', 0.25)}" stroke-width="34" opacity="0.45" filter="url(#b8)"/>` +
    `<path d="M-190,-26 C-120,48 110,58 200,-22" fill="none" stroke="#fff" stroke-width="3" opacity="0.3"/>` +
    `<path d="M-185,-36 C-120,22 110,32 196,-30" fill="none" stroke="${cols[2]}" stroke-width="2.5" opacity="0.35"/>` +
    `<path d="M-150,-24 C-80,14 60,22 150,-10" fill="none" stroke="#fff" stroke-width="10" opacity="${f(0.55 - 0.2 * sp)}" filter="url(#b3)"/>`;
  if (sp > 0) for (let i = 0; i < 26; i++) {
    const u = rnd(seed * 31 + i), v = rnd(seed * 17 + i * 3), sx = -180 + 360 * u, sy = -30 + 85 * v - 30 * Math.pow(Math.abs(sx) / 210, 2);
    s0 += `<ellipse cx="${f(sx)}" cy="${f(sy)}" rx="${f(2 + 5 * rnd(i + seed))}" ry="${f(1.6 + 3 * rnd(i * 7 + seed))}" fill="${C.spot}" opacity="${f(sp * (0.45 + 0.4 * rnd(i * 5)))}"/>`;
  }
  s0 += `</g><ellipse cx="-202" cy="-40" rx="10" ry="8" fill="#3E2A14"/>`;
  s0 += `<path d="${BANANA}" fill="none" stroke="${mix(cols[2], '#000', 0.35)}" stroke-width="2.5" opacity="0.55"/>`;
  return G(T(x, y, s, rot), 1, s0);
}

function glossyBlob(d, cols, glow = true) {
  const g = uid('gl');
  return `<defs>${rg(g, cols)}</defs><path d="${d}" fill="url(#${g})"/>` +
    (glow ? `<path d="${d}" fill="url(#glossG)" opacity="0.5" transform="scale(0.6) translate(-40 -40)"/>` : '') +
    `<path d="${d}" fill="none" stroke="${mix(cols[cols.length - 1], '#000', 0.3)}" stroke-width="2.5" opacity="0.5"/>`;
}

// ---------- the room ----------
function room(cam) {
  let s = `<rect x="-3000" y="-1600" width="20000" height="1910" fill="url(#wallG)"/>`;
  // soft window light and out-of-focus bokeh far behind (parallax)
  let far = '';
  for (let i = 0; i < 60; i++) {
    const x = -1500 + i * 260 + 120 * rnd(i), y = -700 + 600 * rnd(i * 3 + 1), r = 40 + 70 * rnd(i * 5 + 2);
    far += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${['#FFF6D8', '#FBD38A', '#D7EBC4', '#FFFFFF'][i % 4]}" opacity="${f(0.25 + 0.25 * rnd(i * 7))}"/>`;
  }
  s += layer(0.45, cam, `<g filter="url(#b16)">${far}</g>`);
  s += layer(0.6, cam, `<path d="M-600,-1200 L200,-1200 L700,300 L-300,300 Z" fill="#fff" opacity="0.18" filter="url(#b40)"/>` +
    `<path d="M7000,-1200 L7800,-1200 L8300,300 L7300,300 Z" fill="#fff" opacity="0.18" filter="url(#b40)"/>`);
  // the table: top surface, grain, front edge
  s += `<rect x="-3000" y="300" width="20000" height="470" fill="url(#woodG)"/>`;
  const x0 = Math.floor((cam.x - 1000) / 400) * 400;
  for (let x = x0; x < cam.x + 1000; x += 400) for (let k = 0; k < 7; k++) {
    const y = 330 + k * 62 + 10 * rnd(x + k), w = 6 * Math.sin(x * 0.01 + k);
    s += `<path d="M${x},${f(y)} q100,${f(w)} 200,0 t200,0" fill="none" stroke="${C.grain}" stroke-width="${f(2 + 2 * rnd(k + x))}" opacity="0.22"/>`;
  }
  s += `<rect x="-3000" y="770" width="20000" height="60" fill="url(#edgeG)"/><path d="M-3000,302 L17000,302" stroke="#fff" stroke-width="4" opacity="0.35"/>`;
  return s;
}

// ---------- A: hero banana ----------
function zoneA(t) {
  const back = 0.25 + 0.85 * P(t, K.etilen - 0.2, 1.8, E.inOutCubic) * (1 - P(t, K.loop + 0.6, 0.5));
  let s = banana(-290, 200, 0.82, { rot: 14, ripe: back, seed: 3 }) + banana(300, 190, 0.82, { rot: -18, ripe: back, seed: 5 });
  s += banana(0, 260, 1.45, { rot: -7, ripe: 1.2, seed: 1 });
  // potassium: glowing K+ orbs rising out of the banana
  if (t > K.mg - 0.4 && t < K.s2 + 0.4) {
    const o = 1 - P(t, K.s2 - 0.2, 0.5);
    for (let i = 0; i < 12; i++) {
      const u = ((t - K.mg + 0.4) * 0.45 + rnd(i)) % 1, x = -220 + 440 * rnd(i * 3 + 1) + 20 * Math.sin(t * 2 + i), y = 220 - 420 * u;
      s += G(T(x, y, 0.6 + 0.4 * Math.sin(u * Math.PI)), o * Math.sin(u * Math.PI),
        `<circle r="34" fill="#9FD3FF" opacity="0.45" filter="url(#b8)"/><circle r="20" fill="#E8F6FF" stroke="#5AA7E6" stroke-width="3"/>` + txt('K⁺', 0, 1, 22, '#2D6FB0', 900));
    }
  }
  s += card(t, K.mg - 0.1, 0, -230, 600, 210,
    mono(scramble('422 mg', t, K.mg - 0.1, 0.7, { seed: 2 }), 300, 110, 96, C.ink, { anchor: 'middle' }) + bodyText('kalium, 1 pisang sedang', 300, 175, 32, C.muted, 'middle', 800),
    { title: 'Kalium', tOut: K.s2 - 0.3, col: C.cool });
  // ethylene: translucent curls drifting up from the hero banana
  if (t > K.etilen - 0.3) {
    const o = P(t, K.etilen - 0.3, 0.6) * (1 - P(t, K.loop, 0.6));
    for (let i = 0; i < 7; i++) {
      const u = ((t - K.etilen) * 0.35 + i / 7) % 1, x = -200 + 400 * (i / 6), y = 200 - 380 * u;
      s += `<path d="M${f(x)},${f(y)} c-30,-30 30,-60 0,-90 c-30,-30 30,-60 0,-90" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity="${f(o * 0.7 * Math.sin(u * Math.PI))}" filter="url(#b8)"/>`;
    }
    const q = pop(t, K.etilen + 0.2, 0.4);
    if (q.o) s += G(T(0, -170, q.s), q.o * (1 - P(t, K.loop - 0.3, 0.4)), pill('gas etilen', 0, 0, 40, C.ink, '#fff'));
  }
  return s;
}

// ---------- B: nerve and muscle ----------
function zoneB(t) {
  const X = ZONES.B, pulses = [K.saraf, K.saraf + 1.0, K.otot];
  const kick = pulses.reduce((m, p) => Math.max(m, t > p + 0.55 ? Math.exp(-5 * (t - p - 0.55)) * (t < p + 1.6 ? 1 : 0) : 0), 0);
  const sx = 1 - 0.14 * kick, sy = 1 + 0.16 * kick;
  const M = 'M-260,0 C-190,-110 190,-110 260,0 C190,110 -190,110 -260,0 Z';
  let s = softShadow(X, 330, 300, 26, 0.25);
  s += `<path d="M${X - 400},20 L${X - 255},10 M${X + 255},10 L${X + 400},20" stroke="#EDE6DA" stroke-width="26" stroke-linecap="round"/>` +
    `<path d="M${X - 400},20 L${X - 255},10 M${X + 255},10 L${X + 400},20" stroke="#B8AE9C" stroke-width="26" stroke-linecap="round" opacity="0.35" transform="translate(0 6)"/>`;
  let m = glossyBlob(M, C.muscle);
  const cl = uid('mc');
  m += `<defs><clipPath id="${cl}"><path d="${M}"/></clipPath></defs><g clip-path="url(#${cl})">`;
  for (let k = -9; k <= 9; k++) m += `<path d="M${k * 28},-110 q14,110 0,220" fill="none" stroke="#5A1210" stroke-width="3" opacity="0.18"/>`;
  m += `</g>`;
  s += G(`translate(${X} 10) scale(${f(sx)} ${f(sy)})`, 1, m);
  // the nerve: a yellow cord with a glowing signal running down to the muscle
  const N = [[X - 380, -330], [X - 300, -150], [X - 40, -200], [X, -80]];
  const nd = `M${N[0]} C${N[1]} ${N[2]} ${N[3]}`;
  s += `<path d="${nd}" fill="none" stroke="#B88A1E" stroke-width="18" stroke-linecap="round"/><path d="${nd}" fill="none" stroke="#F4CF55" stroke-width="12" stroke-linecap="round"/>`;
  pulses.forEach(p => {
    const u = clamp((t - p) / 0.55);
    if (t < p || u >= 1) return;
    const b = (a, i) => (1 - u) ** 3 * N[0][i] + 3 * (1 - u) ** 2 * u * N[1][i] + 3 * (1 - u) * u * u * N[2][i] + u ** 3 * N[3][i];
    s += `<circle cx="${f(b(0, 0))}" cy="${f(b(0, 1))}" r="34" fill="#FFF3A6" opacity="0.8" filter="url(#b8)"/><circle cx="${f(b(0, 0))}" cy="${f(b(0, 1))}" r="13" fill="#fff"/>`;
  });
  const a = pop(t, K.saraf - 0.1, 0.4), b = pop(t, K.otot - 0.1, 0.4);
  if (a.o) s += G(T(X - 330, -390, a.s), a.o, pill('saraf', 0, 0, 40, '#B88A1E', '#fff'));
  if (b.o) s += G(T(X + 200, 190, b.s), b.o, pill('otot', 0, 0, 40, C.muscle[1], '#fff'));
  return s;
}

// ---------- C: heart with an ECG trace ----------
const HEART = 'M0,110 C-40,80 -190,10 -190,-80 C-190,-150 -130,-190 -80,-190 C-40,-190 -10,-170 0,-140 C10,-170 40,-190 80,-190 C130,-190 190,-150 190,-80 C190,10 40,80 0,110 Z';
function zoneC(t) {
  const X = ZONES.Cz, ph = ((t - K.s3) % 0.85 + 0.85) % 0.85, beat = 1 + 0.07 * Math.exp(-18 * ph) + 0.04 * Math.exp(-18 * Math.max(0, ph - 0.18));
  let s = softShadow(X, 330, 220, 24, 0.28);
  // ECG trace behind the heart, drawn left to right
  const d = P(t, K.s3 - 0.1, 3.2, E.lin);
  let pts = [];
  for (let k = 0; k <= 140; k++) {
    const x = X - 470 + k * (940 / 140), ph2 = (k % 35) / 35;
    const y = 250 - (ph2 > 0.4 && ph2 < 0.46 ? -60 : 0) - (ph2 > 0.46 && ph2 < 0.52 ? 150 : 0) + (ph2 > 0.52 && ph2 < 0.58 ? 40 : 0) - 18 * Math.exp(-200 * (ph2 - 0.75) ** 2);
    pts.push([x, y]);
  }
  pts = pts.slice(0, Math.max(2, Math.round(d * pts.length)));
  s += `<path d="M${pts.map(p => p.map(f).join(',')).join(' L')}" fill="none" stroke="#3FB27F" stroke-width="16" opacity="0.35" filter="url(#b8)"/>` +
    `<path d="M${pts.map(p => p.map(f).join(',')).join(' L')}" fill="none" stroke="#2E9B6A" stroke-width="6" stroke-linejoin="round"/>`;
  s += G(`translate(${X} 40) scale(${f(1.15 * beat)})`, 1, glossyBlob(HEART, C.heart) +
    `<path d="M-120,-120 C-110,-160 -60,-170 -40,-150" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity="0.6" filter="url(#b3)"/>`);
  return s;
}

// ---------- D: sliced banana on a plate, a quarter of daily B6 ----------
function slice(x, y, r) {
  const g = uid('sl');
  let s = `<defs>${rg(g, ['#FFF8DC', C.flesh, C.fleshLo], '45%', '40%', '70%')}</defs>`;
  s += `<ellipse cx="${x}" cy="${y + 10}" rx="${r}" ry="${r * 0.55}" fill="${C.fleshLo}"/><ellipse cx="${x}" cy="${y + 10}" rx="${r}" ry="${r * 0.55}" fill="none" stroke="#C9A75A" stroke-width="3"/>`;
  s += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.55}" fill="url(#${g})"/>`;
  [[0, -8], [-9, 6], [9, 6]].forEach(([dx, dy]) => s += `<ellipse cx="${x + dx}" cy="${y + dy * 0.55}" rx="3.5" ry="2.5" fill="#5A4220" opacity="0.8"/>`);
  return s + `<ellipse cx="${x}" cy="${y}" rx="${r * 0.42}" ry="${r * 0.22}" fill="none" stroke="#E2C77E" stroke-width="2" opacity="0.8"/>`;
}
function zoneD(t) {
  const X = ZONES.D;
  let s = softShadow(X, 400, 360, 40, 0.3);
  s += `<ellipse cx="${X}" cy="370" rx="360" ry="120" fill="#E3DED4"/><ellipse cx="${X}" cy="360" rx="360" ry="118" fill="#FBFAF7"/>` +
    `<ellipse cx="${X}" cy="362" rx="270" ry="84" fill="#EFEBE3"/><ellipse cx="${X - 120}" cy="320" rx="120" ry="20" fill="#fff" opacity="0.8" filter="url(#b8)"/>`;
  [[-150, 330], [-40, 310], [80, 320], [190, 345], [-90, 380], [40, 385], [150, 395]].forEach(([dx, y], i) => {
    const p = pop(t, K.s4 - 0.3 + i * 0.07, 0.35);
    if (p.o) s += G(`translate(${X + dx} ${y}) scale(${f(p.s)}) translate(${-X - dx} ${-y})`, p.o, slice(X + dx, y, 58));
  });
  // a ring that fills one quarter
  const q = P(t, K.seperempat - 0.1, 0.9, E.outCubic), R = 150, cx = X, cy = -60, a = -Math.PI / 2 + q * Math.PI / 2;
  const rp = pop(t, K.vitamin - 0.1, 0.45);
  if (rp.o) {
    let r = `<circle r="${R}" fill="#fff" opacity="0.75"/><circle r="${R}" fill="none" stroke="#E7E1D6" stroke-width="34"/>`;
    if (q > 0.01) r += `<path d="M0,${-R} A${R},${R} 0 0 1 ${f(R * Math.cos(a))},${f(R * Math.sin(a))}" fill="none" stroke="#F2A93B" stroke-width="34" stroke-linecap="round"/>`;
    r += mono(`${Math.round(25 * q)}%`, 0, -14, 84, C.ink, { anchor: 'middle' }) + bodyText('vitamin B6 harian', 0, 60, 30, C.muted, 'middle', 800);
    s += G(T(cx, cy, rp.s), rp.o, r);
  }
  return s;
}

// ---------- E: green banana and its starch ----------
function magnifierRing(x, y, r) {
  const g = uid('mg');
  return `<defs>${lg(g, C.steel, 1, 1)}</defs>` +
    `<path d="M${f(x + r * 0.7)},${f(y + r * 0.7)} L${f(x + r * 1.25)},${f(y + r * 1.25)}" stroke="#3A2A1E" stroke-width="40" stroke-linecap="round"/>` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="url(#${g})" stroke-width="22"/>` +
    `<path d="M${f(x - r * 0.6)},${f(y - r * 0.5)} A${f(r * 0.8)},${f(r * 0.8)} 0 0 1 ${f(x - r * 0.1)},${f(y - r * 0.78)}" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.7"/>`;
}
function zoneE(t) {
  const X = ZONES.E;
  let s = banana(X - 200, 260, 1.15, { rot: -12, ripe: 0, seed: 7 });
  const p = pop(t, K.pati - 0.15, 0.45);
  if (p.o) {
    const cx = X + 230, cy = -40, R = 150, g = uid('cs');
    let d = `<defs>${rg(g, ['#FAF9E0', '#EDEFC8', '#D8E0A8'], '45%', '45%', '65%')}</defs>`;
    d += `<circle r="${R + 14}" fill="#4F7F25"/><circle r="${R}" fill="url(#${g})"/>`;
    for (let i = 0; i < 46; i++) {
      const a = rnd(i * 3) * Math.PI * 2, rr = R * 0.88 * Math.sqrt(rnd(i * 5 + 1)), gp = pop(t, K.pati + i * 0.012, 0.3);
      if (gp.o) d += G(T(rr * Math.cos(a), rr * Math.sin(a), gp.s, rnd(i) * 180), gp.o, `<ellipse rx="11" ry="7" fill="#fff"/><ellipse rx="11" ry="7" fill="none" stroke="#B9C08A" stroke-width="2"/><ellipse cx="-3" cy="-2" rx="4" ry="2" fill="#fff" opacity="0.9"/>`);
    }
    s += `<path d="M${X - 20},140 L${cx - 100},${cy + 120}" stroke="${C.ink}" stroke-width="4" stroke-dasharray="10 10" opacity="${f(p.o * 0.5)}"/>`;
    s += G(T(cx, cy, p.s), p.o, d + magnifierRing(0, 0, R + 30));
    const q = pop(t, K.pati + 0.3, 0.4);
    if (q.o) s += G(T(cx - 40, cy + 250, q.s), q.o, pill('pati resisten', 0, 0, 42, '#4F7F25', '#fff'));
  }
  return s;
}

// ---------- F: the gut, schematic ----------
let GUT = null;
function gutPath() {
  const X = ZONES.F, pts = [[X - 470, -250], [X + 30, -250], [X + 60, -220], [X + 30, -170], [X - 440, -170], [X - 470, -140], [X - 440, -90],
    [X + 30, -90], [X + 60, -60], [X + 30, -10], [X - 440, -10], [X - 470, 20], [X - 440, 70], [X + 80, 70], [X + 200, 100],
    [X + 230, 280], [X + 230, -260], [X + 440, -260], [X + 440, 280]];
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, len, small: 14 };
}
function along(u) {
  const { pts, len } = GUT, L = len[len.length - 1] * clamp(u);
  let i = 1;
  while (i < len.length - 1 && len[i] < L) i++;
  const k = (L - len[i - 1]) / (len[i] - len[i - 1] || 1);
  return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)];
}
function zoneF(t) {
  const X = ZONES.F, { pts, small } = GUT;
  const line = a => 'M' + a.map(p => p.map(f).join(',')).join(' L');
  const sm = line(pts.slice(0, small + 1)), lgP = line(pts.slice(small));
  let s = softShadow(X, 330, 520, 30, 0.2);
  s += `<path d="${sm}" fill="none" stroke="${C.gutLo}" stroke-width="54" stroke-linejoin="round" stroke-linecap="round"/><path d="${sm}" fill="none" stroke="${C.gut}" stroke-width="44" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<path d="${sm}" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round" opacity="0.35" transform="translate(-4 -9)"/>`;
  s += `<path d="${lgP}" fill="none" stroke="${C.colonLo}" stroke-width="104" stroke-linejoin="round" stroke-linecap="round"/><path d="${lgP}" fill="none" stroke="${C.colon}" stroke-width="92" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<path d="${lgP}" fill="none" stroke="${C.colonLo}" stroke-width="92" stroke-dasharray="4 46" opacity="0.5"/>` +
    `<path d="${lgP}" fill="none" stroke="#fff" stroke-width="12" opacity="0.3" transform="translate(-10 -12)"/>`;
  // starch granules travel through; the small intestine leaves them whole, the colon's bacteria ferment them
  const uSmall = GUT.len[small] / GUT.len[GUT.len.length - 1];
  for (let i = 0; i < 12; i++) {
    const u = clamp((t - K.dicerna + 0.2 - i * 0.22) / 3.4) * (0.62 + 0.3 * rnd(i) + 0.08);
    if (t < K.dicerna - 0.2 + i * 0.22) continue;
    const [x, y] = along(u), inColon = u > uSmall, shrink = inColon ? 1 - 0.6 * clamp((t - K.besar) / 1.5) : 1;
    s += G(T(x + (inColon ? 14 * Math.sin(t * 4 + i) : 0), y, shrink, i * 30), 1, `<ellipse rx="12" ry="8" fill="#fff" stroke="#B9C08A" stroke-width="2"/>`);
  }
  if (t > K.besar - 0.3) {
    const o = P(t, K.besar - 0.3, 0.5);
    for (let i = 0; i < 9; i++) {
      const [x, y] = along(uSmall + (1 - uSmall) * (0.1 + 0.85 * i / 8)), wob = 10 * Math.sin(t * 3 + i);
      s += G(T(x + wob, y + 8 * Math.cos(t * 2 + i), 1, (t * 40 + i * 50) % 360), o,
        `<rect x="-20" y="-9" width="40" height="18" rx="9" fill="${i % 2 ? '#8E6CC9' : '#5FA548'}"/><rect x="-16" y="-6" width="18" height="5" rx="2.5" fill="#fff" opacity="0.5"/>`);
    }
    for (let i = 0; i < 14; i++) {
      const u = ((t - K.besar) * 0.6 + rnd(i * 9)) % 1, base = along(uSmall + (1 - uSmall) * rnd(i * 4 + 2));
      s += `<circle cx="${f(base[0] + 20 * Math.sin(i + t))}" cy="${f(base[1] - 90 * u)}" r="${f(5 + 6 * rnd(i))}" fill="#fff" stroke="#fff" stroke-width="2" fill-opacity="0.25" opacity="${f(o * Math.sin(u * Math.PI))}"/>`;
    }
  }
  const a = pop(t, K.usus - 0.1, 0.4), b = pop(t, K.besar - 0.1, 0.4);
  if (a.o) s += G(T(X - 220, -340, a.s), a.o, pill('usus halus: tidak dicerna', 0, 0, 36, C.gutLo, '#fff'));
  if (b.o) s += G(T(X + 300, 360, b.s), b.o, pill('usus besar: difermentasi', 0, 0, 36, C.colonLo, '#fff'));
  return s;
}

// ---------- G: ripening, starch to sugar ----------
function sugarCube(x, y, s) {
  return G(T(x, y, s), 1, `<path d="M0,-40 L40,-20 L0,0 L-40,-20 Z" fill="#FFFFFF"/><path d="M-40,-20 L0,0 L0,46 L-40,26 Z" fill="#E7E4DD"/>` +
    `<path d="M40,-20 L0,0 L0,46 L40,26 Z" fill="#D2CEC5"/><path d="M0,-40 L40,-20 L40,26 L0,46 L-40,26 L-40,-20 Z" fill="none" stroke="#A9A49A" stroke-width="2"/>`);
}
function zoneG(t) {
  const X = ZONES.Gz;
  let s = '';
  [[-290, 0], [0, 1], [290, 2]].forEach(([dx, k]) => {
    const ripe = k * P(t, K.matang + 0.1 + 0.35 * k, 1.1, E.inOutCubic);
    s += softShadow(X + dx, 370, 110, 16, 0.28) + banana(X + dx, 110, 0.95, { rot: -78, ripe, seed: 11 + k, shadowOn: false });
    const lb = pop(t, K.matang + 0.2 * k, 0.35);
    if (lb.o) s += G(T(X + dx, 372, lb.s), lb.o, pill(['hijau', 'kuning', 'matang'][k], 0, 0, 34, ['#4F7F25', '#C99A1A', C.spot][k], '#fff'));
  });
  [[-70, -250], [10, -290], [90, -245]].forEach(([dx, dy], i) => {
    const p = pop(t, K.gula + i * 0.1, 0.4), bob = 6 * Math.sin(t * 3 + i);
    if (p.o) s += G('', p.o, softShadow(X + 290 + dx, dy + 60, 30, 8, 0.15) + sugarCube(X + 290 + dx, dy + bob, 0.9 * p.s));
  });
  return s;
}

// ---------- H: bike wheel on the road, 75 km ----------
function zoneH(t) {
  const X = ZONES.H, cx = X - 60, cy = 110, R = 230, rot = t * 540;
  let s = `<path d="M${X - 700},360 L${X + 700},360 L${X + 700},700 L${X - 700},700 Z" fill="${C.road}"/>`;
  for (let k = -6; k < 8; k++) s += `<rect x="${f(X + k * 200 - ((t * 700) % 200))}" y="520" width="110" height="16" rx="8" fill="#fff" opacity="0.8"/>`;
  s += softShadow(cx, 360, 220, 18, 0.45);
  const rimG = uid('rim');
  let w = `<defs>${lg(rimG, C.steel, 1, 1)}</defs><circle r="${R}" fill="none" stroke="${C.tire}" stroke-width="40"/>`;
  for (let k = 0; k < 48; k++) w += `<rect x="-6" y="${-R - 22}" width="12" height="8" rx="3" fill="#33353C" transform="rotate(${k * 7.5})"/>`;
  w += `<circle r="${R - 26}" fill="none" stroke="url(#${rimG})" stroke-width="14"/>`;
  let sp = '';
  for (let k = 0; k < 28; k++) sp += `<line x1="0" y1="0" x2="${f((R - 30) * Math.cos(k * Math.PI / 14))}" y2="${f((R - 30) * Math.sin(k * Math.PI / 14))}" stroke="#C9CED6" stroke-width="3"/>`;
  w += G(`rotate(${f(rot)})`, 0.55, sp) + G(`rotate(${f(rot + 4)})`, 0.3, sp);
  w += `<circle r="30" fill="url(#${rimG})" stroke="#6E7782" stroke-width="3"/><circle r="10" fill="#4A4F57"/>`;
  s += G(T(cx, cy), 1, w);
  const frameG = uid('fr');
  s += `<defs>${lg(frameG, ['#6FA3E8', '#2F6FB5', '#1B4176'], 1, 1)}</defs><path d="M${cx},${cy} L${cx + 240},${cy - 330} L${cx + 520},${cy - 300}" fill="none" stroke="url(#${frameG})" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += banana(cx + 400, cy - 250, 0.45, { rot: 18, ripe: 1.1, seed: 21, shadowOn: false });
  const km = Math.round(75 * P(t, K.km - 0.5, 1.2, E.outCubic));
  s += card(t, K.studi - 0.1, X + 200, -240, 430, 190, mono(`${km} km`, 215, 112, 84, C.ink, { anchor: 'middle' }), { title: 'Balapan', col: C.cool });
  return s;
}

// ---------- I: balance scale, banana vs carb drink ----------
function bottle(x, y, s) {
  const g = uid('bt'), lq = uid('lq');
  return G(T(x, y, s), 1, `<defs>${lg(g, ['#FFFFFF', '#DCEBF5', '#A9C7DA'], 1, 0)}${lg(lq, ['#FFC36B', '#F29A3A', '#C66A16'], 1, 0)}</defs>` +
    `<path d="M-50,-120 L-50,-150 Q-50,-170 -30,-175 L-20,-200 L20,-200 L30,-175 Q50,-170 50,-150 L50,60 Q50,80 30,80 L-30,80 Q-50,80 -50,60 Z" fill="url(#${g})" opacity="0.9"/>` +
    `<path d="M-46,-60 L46,-60 L46,58 Q46,76 30,76 L-30,76 Q-46,76 -46,58 Z" fill="url(#${lq})" opacity="0.9"/>` +
    `<rect x="-24" y="-226" width="48" height="30" rx="6" fill="#2F6FB5"/><rect x="-50" y="-30" width="100" height="56" fill="#fff" opacity="0.85"/>` +
    txt('karbo', 0, -2, 24, C.ink, 900) + `<path d="M-30,-160 L-30,50" stroke="#fff" stroke-width="8" opacity="0.6" stroke-linecap="round"/>`);
}
function zoneI(t) {
  const X = ZONES.I, u = Math.max(0, t - K.s9 + 0.2), ang = 14 * Math.cos(u * 4.2) * Math.exp(-u * 0.9) * (t < K.setara + 0.6 ? 1 : Math.exp(-6 * (t - K.setara - 0.6)));
  const gS = uid('st');
  let s = `<defs>${lg(gS, ['#E8D6A8', '#C9A55A', '#8C6A2A'], 1, 0)}</defs>` + softShadow(X, 360, 200, 22, 0.3);
  s += `<path d="M${X - 120},360 L${X + 120},360 L${X + 80},320 L${X - 80},320 Z" fill="url(#${gS})"/><rect x="${X - 12}" y="-210" width="24" height="535" fill="url(#${gS})"/>`;
  const ax = 330, rad = ang * Math.PI / 180, ends = [-1, 1].map(sd => [X + sd * ax * Math.cos(rad), -200 + sd * ax * Math.sin(rad)]);
  s += `<path d="M${f(ends[0][0])},${f(ends[0][1])} L${f(ends[1][0])},${f(ends[1][1])}" stroke="url(#${gS})" stroke-width="22" stroke-linecap="round"/><circle cx="${X}" cy="-200" r="22" fill="#8C6A2A"/>`;
  ends.forEach(([ex, ey], i) => {
    const py = ey + 260;
    s += `<path d="M${f(ex)},${f(ey)} L${f(ex - 110)},${f(py)} M${f(ex)},${f(ey)} L${f(ex + 110)},${f(py)}" stroke="#9A8A6A" stroke-width="4"/>`;
    s += i === 0 ? banana(ex, py - 34, 0.5, { rot: -6, ripe: 1.2, seed: 31, shadowOn: false }) : bottle(ex, py - 78, 0.6);
    s += `<ellipse cx="${f(ex)}" cy="${f(py)}" rx="130" ry="22" fill="url(#${gS})"/><ellipse cx="${f(ex)}" cy="${f(py - 4)}" rx="118" ry="14" fill="#fff" opacity="0.25"/>`;
  });
  const q = pop(t, K.setara + 0.1, 0.4);
  if (q.o) s += G(T(X, 300, q.s), q.o, pill('hasil balapan setara', 0, 0, 40, C.leaf, '#fff'));
  return s;
}

// ---------- J: kidneys, ask a doctor ----------
const KIDNEY = 'M40,-120 C110,-130 140,-60 130,10 C120,90 70,140 10,130 C-40,122 -50,80 -20,40 C0,10 -10,-20 -40,-40 C-70,-60 -30,-115 40,-120 Z';
function zoneJ(t) {
  const X = ZONES.J;
  let s = softShadow(X, 360, 300, 26, 0.25);
  s += `<path d="M${X - 90},60 C${X - 60},180 ${X - 40},260 ${X - 30},330 M${X + 90},60 C${X + 60},180 ${X + 40},260 ${X + 30},330" fill="none" stroke="#C99A86" stroke-width="12" stroke-linecap="round"/>`;
  s += G(`translate(${X - 170} 0) scale(-1.2 1.2)`, 1, glossyBlob(KIDNEY, C.kidney)) + G(`translate(${X + 170} 0) scale(1.2)`, 1, glossyBlob(KIDNEY, C.kidney));
  const a = pop(t, K.ginjal - 0.1, 0.4), b = pop(t, K.dokter - 0.1, 0.45);
  if (a.o) s += G(T(X, -260, a.s), a.o, pill('penyakit ginjal?', 0, 0, 42, C.kidney[1], '#fff'));
  if (b.o) s += G(T(X, 230, b.s), b.o, pill('tanya dokter dulu soal kalium', 0, 0, 38, C.cool, '#fff'));
  return s;
}

// ---------- setup ----------
const ICON = {
  banana: () => `<path d="M-22,-6 C-14,14 12,16 22,-6 L24,-10 C10,4 -12,2 -20,-10 Z" fill="#F3C632" ${stroke(3)}/>`,
  heart: () => `<path d="M0,16 C-8,10 -22,2 -22,-8 C-22,-16 -14,-20 -8,-20 C-4,-20 -1,-17 0,-14 C1,-17 4,-20 8,-20 C14,-20 22,-16 22,-8 C22,2 8,10 0,16 Z" fill="#C9342F" ${stroke(3)}/>`,
  gut: () => `<path d="M-18,-12 L14,-12 Q20,-12 20,-6 Q20,0 14,0 L-14,0 Q-20,0 -20,6 Q-20,12 -14,12 L18,12" fill="none" ${stroke(6, '#E8A39E')}/>`,
  bike: () => `<circle r="18" fill="none" ${stroke(5)}/><path d="M-12,0 L12,0 M0,-12 L0,12" ${stroke(2)}/>`,
};

function setup(D) {
  const s = D.scenes;
  K = {
    mg: s[0].at('422'), kalium: s[0].at('kalium'),
    s2: s[1].start, saraf: s[1].at('saraf'), otot: s[1].at('otot'),
    s3: s[2].start, jantung: s[2].at('jantungmu'), teratur: s[2].at('teratur'),
    s4: s[3].start, vitamin: s[3].at('vitamin'), b6: s[3].at('b6'), seperempat: s[3].at('seperempat'),
    s5: s[4].start, hijau: s[4].at('hijau'), pati: s[4].at('pati'),
    s6: s[5].start, dicerna: s[5].at('dicerna'), usus: s[5].at('usus'), besar: s[5].at('besar'),
    s7: s[6].start, matang: s[6].at('matang'), gula: s[6].at('gula'), manis: s[6].at('manis'),
    s8: s[7].start, studi: s[7].at('studi'), sepeda: s[7].at('pesepeda'), km: s[7].at('75'),
    s9: s[8].start, setara: s[8].at('setara'),
    s10: s[9].start, ginjal: s[9].at('ginjal'), dokter: s[9].at('dokter'),
    s11: s[10].start, etilen: s[10].at('etilen'),
    loop: D.total - 1.5,
  };
  GUT = gutPath();
  const home = { x: 0, y: 20, z: 1.15 }, Z = ZONES, V = (x, y = 20, z = 1.2) => ({ x, y, z });
  setCamera([
    home,
    { at: K.mg - 0.3, dur: 0.6, x: 0, y: 0, z: 1.22 },
    { at: K.s2 - 0.2, dur: 0.9, ...V(Z.B, -10) },
    { at: K.otot - 0.2, dur: 0.6, ...V(Z.B + 40, 0, 1.3) },
    { at: K.s3 - 0.2, dur: 0.9, ...V(Z.Cz, 10) },
    { at: K.s4 - 0.2, dur: 0.9, ...V(Z.D, 40) },
    { at: K.s5 - 0.2, dur: 0.9, ...V(Z.E + 20, 10) },
    { at: K.pati - 0.3, dur: 0.6, ...V(Z.E + 100, 0, 1.28) },
    { at: K.s6 - 0.2, dur: 0.9, ...V(Z.F, 0, 1.08) },
    { at: K.besar - 0.3, dur: 0.6, ...V(Z.F + 100, 10, 1.14) },
    { at: K.s7 - 0.2, dur: 0.9, ...V(Z.Gz, 30) },
    { at: K.s8 - 0.2, dur: 0.9, ...V(Z.H, 20, 1.12) },
    { at: K.s9 - 0.2, dur: 0.9, ...V(Z.I, 30, 1.18) },
    { at: K.s10 - 0.2, dur: 0.9, ...V(Z.J, 20) },
    { at: K.s11 - 0.2, dur: 1.3, x: 0, y: 0, z: 1.22 },
    { at: K.loop, dur: 1.2, ...home },
  ]);
  setHeadlines([
    { at: -0.6, end: K.s2 - 0.1, text: 'SATU PISANG,\n*422 MG* KALIUM' },
    { at: K.saraf, end: K.s3 - 0.1, text: 'SARAF & *OTOT*' },
    { at: K.jantung, end: K.s4 - 0.1, text: 'JANTUNG *TERATUR*' },
    { at: K.seperempat, end: K.s5 - 0.1, text: '*25%* VITAMIN B6', hype: true },
    { at: K.hijau, end: K.s6 - 0.1, text: 'PISANG HIJAU:\n*PATI RESISTEN*' },
    { at: K.usus, end: K.s7 - 0.1, text: 'DIFERMENTASI DI\n*USUS BESAR*' },
    { at: K.gula, end: K.s8 - 0.1, text: 'PATI JADI *GULA*' },
    { at: K.km, end: K.s9 - 0.1, text: 'BALAPAN *75 KM*' },
    { at: K.setara, end: K.s10 - 0.1, text: 'HASILNYA *SETARA*', hype: true },
    { at: K.dokter, end: K.s11 - 0.1, text: 'GINJAL?\nTANYA *DOKTER*' },
    { at: K.etilen, end: K.loop + 0.6, text: 'BONUS: GAS *ETILEN*' },
  ]);
  setChapters([
    { at: 0.3, icon: ICON.banana },
    { at: K.saraf, icon: ICON.heart },
    { at: K.hijau, icon: ICON.gut },
    { at: K.sepeda, icon: ICON.bike },
  ], { at: K.s11, end: D.total });
}

function cues(D) {
  return [
    [K.mg, 'pop'], [K.kalium, 'chirp'],
    [K.s2 - 0.2, 'whoosh'], [K.saraf + 0.45, 'zap'], [K.otot + 0.5, 'thud'],
    [K.s3 - 0.2, 'whoosh'], [K.teratur, 'tick'], [K.teratur + 0.4, 'tick'],
    [K.s4 - 0.2, 'whoosh'], [K.s4, 'pop'], [K.seperempat, 'ding'],
    [K.s5 - 0.2, 'whoosh'], [K.hijau, 'pop'], [K.pati, 'pop'],
    [K.s6 - 0.2, 'whoosh'], [K.besar + 0.3, 'pop'],
    [K.s7 - 0.2, 'whoosh'], [K.gula, 'sparkle'], [K.manis, 'pop'],
    [K.s8 - 0.2, 'whoosh'], [K.sepeda, 'click'], [K.km, 'ding'],
    [K.s9 - 0.2, 'whoosh'], [K.setara, 'thud'],
    [K.s10 - 0.2, 'whoosh'], [K.dokter, 'pop'],
    [K.s11 - 0.2, 'whoosh'], [K.etilen, 'sparkle'], [K.loop, 'whoosh'],
  ];
}

function drawWorld(t, cam) {
  NID = 0;
  let s = DEFS + room(cam);
  const Z = ZONES;
  if (near(cam, Z.A)) s += zoneA(t);
  if (near(cam, Z.B)) s += zoneB(t);
  if (near(cam, Z.Cz)) s += zoneC(t);
  if (near(cam, Z.D)) s += zoneD(t);
  if (near(cam, Z.E)) s += zoneE(t);
  if (near(cam, Z.F)) s += zoneF(t);
  if (near(cam, Z.Gz)) s += zoneG(t);
  if (near(cam, Z.H)) s += zoneH(t);
  if (near(cam, Z.I)) s += zoneI(t);
  if (near(cam, Z.J)) s += zoneJ(t);
  return s;
}

// pop words as stickers, each with its own sound cue
function drawOverlay(t) {
  let s = '';
  s += sticker('KALIUM!', t, K.kalium, 790, 660, { rot: 8, size: 92, dur: 1.0 });
  s += sticker('ZAP!', t, K.saraf + 0.45, 790, 650, { rot: -10, size: 100, dur: 0.8, col: '#FFE24A' });
  s += sticker('DEG! DEG!', t, K.teratur, 760, 640, { rot: 7, size: 84, dur: 1.0, col: '#FF8A7A' });
  s += sticker('B6!', t, K.b6, 830, 760, { rot: 10, size: 110, dur: 0.8 });
  s += sticker('HIJAU!', t, K.hijau, 280, 640, { rot: -8, size: 92, dur: 0.8, col: '#A6DA6A' });
  s += sticker('BLUP!', t, K.besar + 0.3, 800, 1120, { rot: 9, size: 96, dur: 0.9, col: '#C9B2F2' });
  s += sticker('MANIS!', t, K.manis, 770, 640, { rot: 8, size: 96, dur: 0.9, col: '#FFB3C7' });
  s += sticker('GOWES!', t, K.sepeda, 300, 640, { rot: -9, size: 92, dur: 0.9 });
  s += sticker('SETARA!', t, K.setara + 0.15, 780, 640, { rot: -5, size: 104, dur: 1.0, col: '#9BE08F', shake: 0.3 });
  s += sticker('FUSSS!', t, K.etilen, 790, 640, { rot: 8, size: 92, dur: 0.9, col: '#E8F6FF' });
  s += cite('Sumber: NIH Office of Dietary Supplements', t, K.mg, K.s2 - 0.1);
  s += cite('Sumber: MedlinePlus (NIH)', t, K.saraf, K.s4 - 0.1);
  s += cite('Sumber: NIH Office of Dietary Supplements', t, K.vitamin, K.s5 - 0.1);
  s += cite('Sumber: Falcomer dkk., Nutrients (2019)', t, K.pati, K.s7 - 0.1);
  s += cite('Sumber: Frontiers in Plant Science (2019)', t, K.gula, K.s8 - 0.1);
  s += cite('Sumber: Nieman dkk., PLoS ONE (2012)', t, K.studi, K.s10 - 0.1);
  s += cite('Sumber: MedlinePlus; NIH ODS', t, K.ginjal, K.s11 - 0.1);
  s += cite('Sumber: Britannica', t, K.etilen, K.loop);
  return s;
}

// ---------- thumbnail ----------
function drawThumbnail() {
  const t = 1.0, cam = { x: 0, y: 0, z: 1 };
  NID = 0;
  let w = DEFS + G('translate(540 860)', 1, room(cam));
  // warm sunburst on the wall behind the banana, for contrast
  let rays = '';
  for (let k = 0; k < 24; k += 2) {
    const a0 = k / 24 * Math.PI * 2, a1 = a0 + Math.PI / 24 * 2;
    rays += `<path d="M540,900 L${f(540 + 1700 * Math.cos(a0))},${f(900 + 1700 * Math.sin(a0))} L${f(540 + 1700 * Math.cos(a1))},${f(900 + 1700 * Math.sin(a1))} Z" fill="#F5C95A" opacity="0.45"/>`;
  }
  w += `<defs><clipPath id="wallOnly"><rect x="0" y="0" width="1080" height="1160"/></clipPath></defs><g clip-path="url(#wallOnly)">${rays}</g>`;
  // one big hero banana with glowing K+ orbs, and a 422 mg tag pointing at it
  w += G('translate(540 1230)', 1, banana(-300, -110, 0.85, { rot: 18, ripe: 0.4, seed: 3 }) + banana(300, -120, 0.85, { rot: -22, ripe: 0.4, seed: 5 }) +
    banana(0, 0, 2.1, { rot: -8, ripe: 1.2, seed: 1 }));
  [[300, 830], [420, 760], [560, 800], [700, 740], [800, 860], [470, 920], [640, 900]].forEach(([x, y], i) =>
    w += G(T(x, y, 1.1 - 0.1 * (i % 3)), 0.95, `<circle r="40" fill="#9FD3FF" opacity="0.5" filter="url(#b8)"/><circle r="26" fill="#E8F6FF" stroke="#5AA7E6" stroke-width="4"/>` + txt('K⁺', 0, 1, 28, '#2D6FB0', 900)));
  const ui = titleText('1 PISANG =\n*422 MG?*', 540, 400, 170, 980, 26) +
    sticker('KALIUM!', 2, 1, 770, 640, { rot: 8, size: 110, dur: 5 });
  return { world: w, ui };
}
