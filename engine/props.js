// Prop library: plants, textures and everyday objects drawn with volume (vol) in the channel's theme style.
// Every function draws around (x, y) in the caller's coordinates and takes t only for idle motion (wind),
// so it is safe for out-of-order frames. Detail lines use darker shades of the fill (not ink), which reads
// well in all three themes; outlines come from vol() and follow TH.fx.
//
// Nature:   leaf, tree (kind 'round' | 'palm'), bush, grass, flower, rock, cloud, sun, rain, bee, fish, fruit
// Surfaces: woodPlank, ground
// Objects:  bulb, coin, banknote, phone, glass, box, plate, riceBowl, pot, stove, bottle, fan, wallClock, windowFrame, umbrella
// Shared:   jar, wallCalendar, bedSide, socket, germ
// Money:    wallet, piggyBank, calculator, chart, building, docPaper, newsMic
// Tikus:    savingsBook, shieldBadge, hangSign, levelGauge, checkBoard, priceLabel, fuelPump, atmCard, goldBar, safeBox,
//           shoppingBasket, oilBarrel, lpgTank, house
// Body:     heartOrgan, lungs, stomach, brain, bodyCell, thermometer, stethoscope, toothbrush (schematic only)

const tone = (col, k) => k > 0 ? mix(col, '#FFFFFF', k) : mix(col, C.ink, -k);
const detail = (d, col, w, o = 1) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"${o < 1 ? ` opacity="${f(o)}"` : ''}/>`;
const PLANT = { leaf: '#6FB04A', leafDark: '#4E8A34', bark: '#9A6B43', grass: '#79B84E', petal: '#F28CA8', center: '#F5B83D' };

// ---------- nature ----------

// leaf(x, y, len, ang, opts): one leaf from its stalk at (x, y), pointing at ang degrees, with midrib and veins
function leaf(x, y, len, ang, { col = PLANT.leaf, wide = 0.36, veins = true, w = 4 } = {}) {
  const L = len, W = len * wide;
  const d = `M0,0 C${f(L * 0.25)},${f(-W)} ${f(L * 0.7)},${f(-W * 0.9)} ${f(L)},0 C${f(L * 0.7)},${f(W * 0.9)} ${f(L * 0.25)},${f(W)} 0,0 Z`;
  let s = vol(d, col, { depth: Math.max(2, W * 0.22), w, rot: ang });
  if (veins) {
    const dk = tone(col, -0.3);
    s += detail(`M${f(L * 0.04)},0 Q${f(L * 0.5)},${f(-W * 0.06)} ${f(L * 0.94)},0`, dk, Math.max(1.2, L * 0.025));
    for (let k = 1; k <= 4; k++) {
      const u = k / 5.2, vx = L * u, span = W * 0.75 * Math.sin(Math.PI * Math.min(1, u * 1.15));
      s += detail(`M${f(vx)},0 Q${f(vx + L * 0.07)},${f(-span * 0.5)} ${f(vx + L * 0.13)},${f(-span)} M${f(vx)},0 Q${f(vx + L * 0.07)},${f(span * 0.5)} ${f(vx + L * 0.13)},${f(span)}`, dk, Math.max(1, L * 0.014), 0.8);
    }
  }
  return G(T(x, y, 1, ang), 1, s);
}

// a cluster of leafy blobs (tree crowns, bushes): back blobs darker, front blobs lit, little leaf marks on top
function foliage(cx, cy, R, t, { col = PLANT.leaf, seed = 1, n = 9, flat = 0.78, fruit = null } = {}) {
  const blobs = [...Array(n)].map((_, i) => {
    const a = rnd(seed * 31 + i) * Math.PI * 2, r = R * 0.55 * Math.sqrt(rnd(seed * 17 + i));
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) * flat, r: R * (0.42 + 0.16 * rnd(seed * 7 + i)), k: i };
  }).sort((a, b) => a.y - b.y);
  // one outline around the whole crown (every blob drawn fat in ink first), then the blobs shaded without
  // their own outlines, so it reads as one leafy mass with clumps instead of a pile of circles
  const sway = b => 2.5 * Math.sin(t * 1.6 + b.k * 0.9 + seed);
  let edge = '', s = '';
  if (TH.fx !== 'soft') blobs.forEach(b => edge += `<circle cx="${f(b.x + sway(b))}" cy="${f(b.y)}" r="${f(b.r + STROKE * 0.5)}" fill="${C.ink}"/>`);
  blobs.forEach((b, i) => {
    const c = tone(col, i < n / 2 ? -0.12 : 0.02), bx = b.x + sway(b);
    s += vol(circleD(bx, b.y, b.r), c, { depth: b.r * 0.16, w: 0 });
    for (let m = 0; m < 7; m++) {  // leaf dabs: light ones on the lit top, dark ones low down
      const a = rnd(seed * 101 + i * 13 + m) * Math.PI * 2, rr = b.r * 0.7 * Math.sqrt(rnd(seed * 59 + i * 7 + m));
      const lx = bx + rr * Math.cos(a), ly = b.y + rr * Math.sin(a), up = ly < b.y - b.r * 0.1;
      const ang = (rnd(seed * 23 + i * 5 + m) - 0.5) * 80 + (up ? -25 : 25);
      s += `<ellipse cx="${f(lx)}" cy="${f(ly)}" rx="${f(b.r * 0.1)}" ry="${f(b.r * 0.045)}" transform="rotate(${f(ang)} ${f(lx)} ${f(ly)})" fill="${tone(c, up ? 0.3 : -0.25)}" opacity="0.9"/>`;
    }
  });
  s = edge + s;
  if (fruit) blobs.slice(-4).forEach((b, i) => s += vol(circleD(b.x + b.r * 0.3 * (rnd(seed + i) - 0.5), b.y + b.r * 0.35, b.r * 0.16), fruit, { depth: b.r * 0.05, w: 3 }));
  return s;
}

// a tapered limb from (x0, y0) to (x1, y1) bending through (cx, cy), width w0 -> w1, as a filled shape
function taper(x0, y0, cx, cy, x1, y1, w0, w1) {
  const nx = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
  const n0 = nx([x0, y0], [cx, cy]), n1 = nx([cx, cy], [x1, y1]), nm = [(n0[0] + n1[0]) / 2, (n0[1] + n1[1]) / 2], wm = (w0 + w1) / 2;
  return `M${f(x0 + n0[0] * w0 / 2)},${f(y0 + n0[1] * w0 / 2)} Q${f(cx + nm[0] * wm / 2)},${f(cy + nm[1] * wm / 2)} ${f(x1 + n1[0] * w1 / 2)},${f(y1 + n1[1] * w1 / 2)}` +
    ` L${f(x1 - n1[0] * w1 / 2)},${f(y1 - n1[1] * w1 / 2)} Q${f(cx - nm[0] * wm / 2)},${f(cy - nm[1] * wm / 2)} ${f(x0 - n0[0] * w0 / 2)},${f(y0 - n0[1] * w0 / 2)} Z`;
}

// tree(x, y, h, t, opts): a tree standing on (x, y), h tall. kind 'round' (mango, rambutan) or 'palm' (coconut)
function tree(x, y, h, t, { kind = 'round', seed = 1, col = PLANT.leaf, bark = PLANT.bark, fruit = null } = {}) {
  let s = shadow(x, y + 4, h * 0.28, 0.16);
  if (kind === 'palm') {
    const lean = h * 0.18 * (rnd(seed) > 0.5 ? 1 : -1), top = [x + lean, y - h];
    s += vol(taper(x, y, x - lean * 0.4, y - h * 0.5, top[0], top[1], h * 0.09, h * 0.05), bark, { depth: h * 0.012 });
    for (let k = 1; k < 14; k++) {  // trunk rings
      const u = k / 14, px = lerp(lerp(x, x - lean * 0.4, u), lerp(x - lean * 0.4, top[0], u), u), py = y - h * u, ww = lerp(h * 0.09, h * 0.05, u) / 2;
      s += detail(`M${f(px - ww)},${f(py + 3)} Q${f(px)},${f(py - 4)} ${f(px + ww)},${f(py + 3)}`, tone(bark, -0.3), Math.max(1.5, h * 0.006));
    }
    const sway = 4 * Math.sin(t * 1.3 + seed);
    for (let i = 0; i < 8; i++) {  // fronds: a drooping midrib with leaflets along both sides
      const a = (-170 + i * 22 + sway + (rnd(seed * 9 + i) - 0.5) * 8) * Math.PI / 180, L = h * (0.42 + 0.1 * rnd(seed * 5 + i));
      const ex = top[0] + L * Math.cos(a), ey = top[1] + L * Math.sin(a) + L * 0.35, mx = top[0] + L * 0.55 * Math.cos(a), my = top[1] + L * 0.55 * Math.sin(a) - L * 0.12;
      const c = tone(col, i % 2 ? -0.12 : 0.04);
      for (let k = 2; k < 13; k++) {
        const u = k / 13, px = (1 - u) ** 2 * top[0] + 2 * u * (1 - u) * mx + u * u * ex, py = (1 - u) ** 2 * top[1] + 2 * u * (1 - u) * my + u * u * ey;
        const dir = Math.atan2(ey - top[1], ex - top[0]), ll = L * 0.28 * Math.sin(Math.PI * (u * 0.85 + 0.1));
        [-1, 1].forEach(sd => {
          const la = dir + sd * 0.9 + 0.35;
          s += `<path d="M${f(px)},${f(py)} q${f(ll * 0.5 * Math.cos(la - sd * 0.2))},${f(ll * 0.5 * Math.sin(la - sd * 0.2))} ${f(ll * Math.cos(la))},${f(ll * Math.sin(la))}" fill="none" stroke="${c}" stroke-width="${f(Math.max(3, h * 0.022))}" stroke-linecap="round"/>`;
        });
      }
      s += detail(`M${f(top[0])},${f(top[1])} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}`, tone(c, -0.35), Math.max(2.5, h * 0.012));
    }
    if (fruit !== false) [[-1, 0], [1, 0], [0, 1]].forEach(([dx, dy]) =>
      s += vol(circleD(top[0] + dx * h * 0.035, top[1] + h * 0.04 + dy * h * 0.03, h * 0.035), fruit || '#8C6A2E', { depth: h * 0.008, w: 4 }));
    return s;
  }
  // round crown: trunk and a few branches, crown made of leafy blobs
  const lean = (rnd(seed) - 0.5) * h * 0.1, crown = [x + lean, y - h * 0.68];
  s += vol(taper(x, y, x - lean * 0.5, y - h * 0.3, crown[0], crown[1] + h * 0.1, h * 0.11, h * 0.05), bark, { depth: h * 0.014 });
  [-1, 1].forEach((sd, i) => s += vol(taper(crown[0], crown[1] + h * 0.14, crown[0] + sd * h * 0.08, crown[1] + h * 0.02, crown[0] + sd * h * 0.16, crown[1] - h * 0.06, h * 0.04, h * 0.015), bark, { depth: h * 0.006, w: 4 }));
  for (let k = 0; k < 5; k++) {  // bark grain
    const bx = x - h * 0.03 + k * h * 0.015 + lean * 0.3;
    s += detail(`M${f(bx)},${f(y - 4)} q${f(h * 0.01)},${f(-h * 0.15)} ${f(lean * 0.4)},${f(-h * 0.36)}`, tone(bark, -0.28), Math.max(1.5, h * 0.005), 0.8);
  }
  return s + G(`rotate(${f(1.2 * Math.sin(t * 1.1 + seed))} ${f(x)} ${f(y)})`, 1, foliage(crown[0], crown[1] - h * 0.04, h * 0.34, t, { col, seed, n: 11, fruit }));
}

// bush(x, y, w, t, opts): a low shrub sitting on (x, y), w wide
function bush(x, y, w, t, { col = PLANT.leaf, seed = 3, flowers = null } = {}) {
  let s = shadow(x, y + 2, w * 0.5, 0.14) + foliage(x, y - w * 0.22, w * 0.5, t, { col, seed, n: 8, flat: 0.5 });
  if (flowers) for (let i = 0; i < 6; i++) {
    const fx = x + (rnd(seed * 3 + i) - 0.5) * w * 0.8, fy = y - w * 0.2 - rnd(seed * 5 + i) * w * 0.3;
    for (let p = 0; p < 5; p++) s += `<circle cx="${f(fx + w * 0.03 * Math.cos(p * 1.257))}" cy="${f(fy + w * 0.03 * Math.sin(p * 1.257))}" r="${f(w * 0.025)}" fill="${flowers}"/>`;
    s += `<circle cx="${f(fx)}" cy="${f(fy)}" r="${f(w * 0.016)}" fill="${PLANT.center}"/>`;
  }
  return s;
}

// grass(x0, x1, y, t, opts): a strip of grass blades between x0 and x1 rooted at y, swaying in the wind
function grass(x0, x1, y, t, { h = 70, col = PLANT.grass, density = 0.35, seed = 5 } = {}) {
  const n = Math.max(3, Math.round((x1 - x0) * density));
  let back = '', front = '';
  for (let i = 0; i < n; i++) {
    const bx = x0 + (x1 - x0) * (i + rnd(seed + i) * 0.8) / n, hh = h * (0.55 + 0.45 * rnd(seed * 3 + i)), w = Math.max(4, h * 0.09);
    const bend = (rnd(seed * 7 + i) - 0.5) * hh * 0.5 + hh * 0.12 * Math.sin(t * 2.2 + bx * 0.02);
    const d = `M${f(bx - w / 2)},${f(y)} Q${f(bx - w * 0.2 + bend * 0.4)},${f(y - hh * 0.55)} ${f(bx + bend)},${f(y - hh)} Q${f(bx + w * 0.2 + bend * 0.4)},${f(y - hh * 0.55)} ${f(bx + w / 2)},${f(y)} Z`;
    const c = tone(col, (rnd(seed * 11 + i) - 0.5) * 0.3 + (i % 2 ? -0.12 : 0.08));
    if (i % 2) back += `<path d="${d}" fill="${c}"/>`;
    else front += `<path d="${d}" fill="${c}"/>`;
  }
  return back + front + `<path d="M${f(x0)},${f(y)} L${f(x1)},${f(y)}" ${stroke(TH.fx === 'soft' ? 0 : 3, tone(col, -0.45))}/>`;
}

// flower(x, y, s, t, opts): a stem rooted at (x, y), s = size scale (1 = about 150 tall)
function flower(x, y, s, t, { petal = PLANT.petal, center = PLANT.center, n = 6, seed = 2 } = {}) {
  const sway = 6 * Math.sin(t * 1.8 + seed), hx = x + sway * s, hy = y - 150 * s;
  let g = detail(`M${f(x)},${f(y)} Q${f(x + sway * 0.3 * s)},${f(y - 80 * s)} ${f(hx)},${f(hy)}`, PLANT.leafDark, 6 * s);
  g += leaf(x + sway * 0.1 * s, y - 50 * s, 50 * s, -40, { wide: 0.4, w: 3 * s, veins: false }) + leaf(x + sway * 0.15 * s, y - 70 * s, 44 * s, -140, { wide: 0.4, w: 3 * s, veins: false });
  for (let k = 0; k < n; k++) {
    const a = k / n * 360 + seed * 10 + sway;
    g += G(T(hx, hy, 1, a), 1, vol(`M0,0 C${f(14 * s)},${f(-22 * s)} ${f(44 * s)},${f(-20 * s)} ${f(50 * s)},0 C${f(44 * s)},${f(20 * s)} ${f(14 * s)},${f(22 * s)} 0,0 Z`, petal, { depth: 5 * s, w: 4 * s, rot: a }));
  }
  g += vol(circleD(hx, hy, 15 * s), center, { depth: 4 * s, w: 4 * s });
  for (let k = 0; k < 6; k++) g += `<circle cx="${f(hx + 7 * s * Math.cos(k))}" cy="${f(hy + 7 * s * Math.sin(k))}" r="${f(1.8 * s)}" fill="${tone(center, -0.4)}"/>`;
  return g;
}

// rock(x, y, w, opts): a stone sitting on (x, y), w wide
function rock(x, y, w, { col = '#A9A39A', seed = 4 } = {}) {
  const pts = [...Array(9)].map((_, i) => {
    const a = Math.PI + i / 8 * Math.PI, r = w / 2 * (0.8 + 0.25 * rnd(seed * 13 + i));
    return [x + r * Math.cos(a), y + Math.min(0, r * 0.75 * Math.sin(a))];
  });
  const d = 'M' + pts.map(p => p.map(f).join(',')).join(' L') + ' Z';
  let s = shadow(x, y + 2, w * 0.55, 0.14) + vol(d, col, { depth: w * 0.08, w: Math.min(STROKE, w * 0.06) });
  for (let k = 0; k < 4; k++) s += `<circle cx="${f(x + (rnd(seed + k) - 0.5) * w * 0.6)}" cy="${f(y - w * 0.1 - rnd(seed * 2 + k) * w * 0.2)}" r="${f(w * 0.02)}" fill="${tone(col, -0.3)}"/>`;
  return s;
}

// cloud(x, y, s, opts): a puffy cloud centered on (x, y), drifting gently with t
function cloud(x, y, s = 1, { t = 0, col = '#FFFFFF', seed = 1 } = {}) {
  const dx = 6 * Math.sin(t * 0.9 + seed), dy = 3 * Math.cos(t * 1.3 + seed);
  const d = 'M-118,32 C-146,32 -162,6 -148,-18 C-136,-38 -110,-42 -94,-32 C-84,-68 -44,-88 -4,-78 C24,-72 44,-52 52,-30 C76,-42 108,-32 120,-8 C144,-4 156,20 140,36 C128,46 106,46 84,46 L-98,46 C-108,46 -114,40 -118,32 Z';
  let g = vol(d, col, { depth: 12, w: 6 });
  const dk = tone(col, -0.2);
  g += detail('M-76,-12 C-58,-34 -24,-36 -8,-14 M22,-8 C42,-24 68,-18 76,2', dk, 3.5, 0.75);
  return G(T(x + dx * s, y + dy * s, s), 1, g);
}

// sun(x, y, s, opts): a glowing sun centered on (x, y) with rays rotating slowly from t
function sun(x, y, s = 1, { t = 0, col = '#FFD24C', rayCol = '#F5A623' } = {}) {
  const rot = (t * 14) % 360, pulse = 1 + 0.03 * Math.sin(t * 2.5);
  let rays = '';
  for (let k = 0; k < 12; k++) {
    const a = k * 30;
    rays += G(T(0, 0, pulse, a), 1, vol('M-15,-76 L0,-114 L15,-76 Z', k % 2 ? col : rayCol, { depth: 4, w: 5, rot: a + rot }));
  }
  let g = G(T(0, 0, 1, rot), 1, rays);
  g += vol(circleD(0, 0, 70), col, { depth: 12, w: 6 });
  g += detail('M-40,-24 A46,46 0 0 1 -12,-46', tone(col, 0.45), 5, 0.85);
  g += `<circle cx="0" cy="0" r="54" fill="none" stroke="${tone(col, -0.22)}" stroke-width="2.5" stroke-dasharray="10 8"/>`;
  return G(T(x, y, s), 1, g);
}

// rain(x0, x1, y0, y1, t, opts): falling rain streaks and ground splashes inside box (x0..x1, y0..y1)
function rain(x0, x1, y0, y1, t = 0, { n = 28, col = '#6CAEE0', ang = -12, speed = 1.6, seed = 9 } = {}) {
  const W = x1 - x0, H = y1 - y0, slant = Math.tan(ang * Math.PI / 180);
  const dk = tone(col, -0.28);
  let s = '';
  for (let i = 0; i < n; i++) {
    const u = (rnd(seed * 13 + i) + t * speed * (0.85 + 0.3 * rnd(seed * 7 + i))) % 1;
    const base = rnd(seed * 29 + i) * W;
    const px = x0 + ((base + u * H * slant) % W + W) % W, py = y0 + u * H;
    const len = 26 + 14 * rnd(seed * 3 + i), dx = len * slant, dy = len;
    s += detail(`M${f(px)},${f(py)} L${f(px + dx)},${f(py + dy)}`, i % 3 ? col : dk, 3.5, 0.82);
    if (u > 0.86) {
      const p = (u - 0.86) / 0.14, rx = 6 + 16 * p, ry = 2 + 4 * p;
      s += `<ellipse cx="${f(px)}" cy="${f(y1 - 2)}" rx="${f(rx)}" ry="${f(ry)}" fill="none" stroke="${col}" stroke-width="2" opacity="${f(1 - p)}"/>`;
    }
  }
  return s;
}

// bee(x, y, s, opts): a honeybee centered on (x, y) facing right, flapping its wings from t
function bee(x, y, s = 1, { t = 0, col = '#F5B83D', stripeCol = '#3A2E25', wingCol = '#E6F3FA', rot = 0 } = {}) {
  const bob = 4 * Math.sin(t * 7), flap = 24 * Math.sin(t * 42);
  let g = '';
  // back wing
  g += G(T(-6, -24, 1, -28 - flap * 0.8), 1, vol('M0,0 C-18,-36 -4,-64 16,-54 C32,-46 24,-14 0,0 Z', wingCol, { depth: 4, w: 4 }));
  // stinger
  g += vol('M-48,4 L-68,0 L-48,-6 Z', stripeCol, { depth: 2, w: 4 });
  // body with clipped dark stripes
  const bodyD = 'M-52,0 C-52,-28 -20,-38 14,-34 C44,-30 58,-14 58,2 C58,18 44,32 14,34 C-20,36 -52,26 -52,0 Z';
  g += vol(bodyD, col, { depth: 8, w: 5, rot });
  g += detail('M-24,-21 Q-19,0 -24,21 M-3,-25 Q3,0 -3,25 M18,-22 Q23,0 18,22', stripeCol, 10);
  // outline re-drawn over stripe ends so the silhouette stays crisp
  g += `<path d="${bodyD}" fill="none" ${stroke(TH.fx === 'doodle' ? 3.5 : 5)}/>`;
  // antennae & legs
  g += detail('M42,-22 Q54,-44 66,-40 M48,-18 Q62,-36 72,-30', stripeCol, 3.5);
  g += `<circle cx="66" cy="-40" r="4" fill="${stripeCol}"/><circle cx="72" cy="-30" r="4" fill="${stripeCol}"/>`;
  g += detail('M-14,32 L-22,46 M4,33 L-2,47 M22,30 L18,44', stripeCol, 3.5);
  // eye & smile
  g += `<circle cx="40" cy="-6" r="5.5" fill="${stripeCol}"/><circle cx="42" cy="-8" r="2" fill="#FFFFFF"/>`;
  g += `<ellipse cx="34" cy="6" rx="6" ry="3.5" fill="#F28CA8" opacity="0.75"/>`;
  // front wing
  g += G(T(4, -22, 1, 14 + flap), 1,
    vol('M0,0 C-22,-42 -4,-72 20,-60 C38,-50 28,-16 0,0 Z', '#FFFFFF', { depth: 4, w: 4 }) +
    detail('M2,-10 Q10,-34 16,-48', tone(wingCol, -0.25), 2, 0.7));
  return G(T(x, y + bob * s, s, rot), 1, g);
}

// fish(x, y, s, opts): a swimming fish centered on (x, y) facing right, tail wagging from t
function fish(x, y, s = 1, { t = 0, col = '#4FA3E3', fin = '#F28C52', rot = 0 } = {}) {
  const wag = 14 * Math.sin(t * 8), bob = 3 * Math.sin(t * 4);
  let g = '';
  // tail fin
  g += G(T(-66, 0, 1, wag), 1,
    vol('M0,0 C-18,-22 -44,-40 -56,-30 C-50,-10 -36,-2 -22,0 C-36,2 -50,10 -56,30 C-44,40 -18,22 0,0 Z', fin, { depth: 5, w: 5 }) +
    detail('M-10,0 L-42,-20 M-12,0 L-40,0 M-10,0 L-42,20', tone(fin, -0.28), 2.5));
  // dorsal and ventral fins
  g += vol('M-22,-34 C-14,-62 18,-60 26,-32 Z', fin, { depth: 4, w: 5 });
  g += vol('M-18,32 C-10,54 12,52 18,30 Z', fin, { depth: 4, w: 5 });
  // main body
  const bodyD = 'M-70,0 C-46,-48 28,-50 80,0 C28,50 -46,48 -70,0 Z';
  g += vol(bodyD, col, { depth: 11, w: 6, rot });
  // gill curve & scales
  const dk = tone(col, -0.3);
  g += detail('M32,-24 Q20,0 32,24', dk, 4);
  [[-26, -12], [-26, 12], [-6, -18], [-6, 2], [-6, 20], [12, -10], [12, 10]].forEach(([sx, sy]) => {
    g += detail(`M${sx},${sy - 8} A9,9 0 0 0 ${sx},${sy + 8}`, dk, 2.5, 0.75);
  });
  // pectoral fin
  g += G(T(16, 12, 1, -10 + wag * 0.5), 1, vol('M0,0 C-16,-8 -28,6 -20,18 C-12,26 2,14 0,0 Z', fin, { depth: 3, w: 4 }));
  // eye & mouth
  g += vol(circleD(48, -8, 10), '#FFFFFF', { depth: 2, w: 3.5 }) + `<circle cx="51" cy="-8" r="5" fill="${C.ink}"/><circle cx="53" cy="-10" r="2" fill="#FFFFFF"/>`;
  g += detail('M76,2 Q64,8 58,4', dk, 3);
  return G(T(x, y + bob * s, s, rot), 1, g);
}

// fruit(x, y, s, opts): a fruit centered on (x, y); kind = 'pisang' | 'jeruk' | 'alpukat' (halved)
function fruit(x, y, s = 1, { kind = 'jeruk', rot = 0 } = {}) {
  let g = '';
  if (kind === 'pisang') {
    const peel = '#F7CF46', tip = '#6B4828', dk = tone(peel, -0.28);
    g += shadow(0, 56, 95, 0.15);
    const d = 'M-86,20 C-56,64 30,66 80,4 C96,-16 102,-40 92,-58 C80,-62 72,-48 62,-34 C22,12 -38,14 -74,-10 C-86,-16 -94,-4 -86,20 Z';
    g += vol(d, peel, { depth: 10, w: 6, rot });
    g += detail('M-72,8 C-34,34 32,32 74,-18 M-62,24 C-24,48 36,44 76,-4', dk, 3, 0.8);
    g += vol('M82,-48 L94,-62 L102,-52 L90,-38 Z', tip, { depth: 3, w: 4 }) + vol('M-90,12 L-78,-6 L-70,2 L-80,18 Z', tip, { depth: 2, w: 4 });
    return G(T(x, y, s, rot), 1, g);
  }
  if (kind === 'alpukat') {
    const rind = '#3D6B35', flesh = '#C9E276', pit = '#7D4E2D';
    g += shadow(0, 92, 85, 0.16);
    g += vol('M0,-88 C36,-88 54,-46 64,12 C70,56 44,90 0,90 C-44,90 -70,56 -64,12 C-54,-46 -36,-88 0,-88 Z', rind, { depth: 10, w: 6, rot });
    g += vol('M0,-74 C28,-74 42,-38 50,12 C56,48 34,76 0,76 C-34,76 -56,48 -50,12 C-42,-38 -28,-74 0,-74 Z', flesh, { depth: 6, w: 3.5, shine: false, rot });
    g += detail('M0,-64 C22,-64 34,-32 40,12 C44,40 26,64 0,64', tone(flesh, -0.22), 2.5, 0.65);
    g += vol(circleD(0, 22, 30), pit, { depth: 8, w: 5, rot });
    g += detail('M-16,10 A20,20 0 0 1 -2,-2', tone(pit, 0.35), 4, 0.8);
    return G(T(x, y, s, rot), 1, g);
  }
  // default: 'jeruk'
  const col = '#F5932A', dk = tone(col, -0.26);
  g += shadow(0, 70, 82, 0.15);
  g += vol('M0,-62 C46,-62 72,-32 72,6 C72,46 44,70 0,70 C-44,70 -72,46 -72,6 C-72,-32 -46,-62 0,-62 Z', col, { depth: 12, w: 6, rot });
  [[24, 14], [38, -2], [18, 34], [42, 22], [-28, 28], [-12, 42]].forEach(([px, py]) => {
    g += `<circle cx="${px}" cy="${py}" r="2.6" fill="${dk}"/>`;
  });
  g += detail('M-42,-16 A46,46 0 0 1 -14,-44', tone(col, 0.4), 5, 0.8);
  g += vol(rectD(-5, -76, 10, 18, 3), '#7A5230', { depth: 2, w: 4 });
  g += leaf(3, -64, 52, -26, { col: '#5FA548', w: 4 });
  return G(T(x, y, s, rot), 1, g);
}

// ---------- surfaces ----------

// woodPlank(x, y, w, h, opts): a board with grain lines and a knot (shelves, tables, floors)
function woodPlank(x, y, w, h, { col = '#D9B98C', seed = 6 } = {}) {
  let s = vol(rectD(x, y, w, h, Math.min(8, h * 0.15)), col, { depth: Math.min(10, h * 0.18), w: Math.min(STROKE, h * 0.12) });
  const dk = tone(col, -0.25);
  for (let k = 1; k < 4; k++) {
    const gy = y + h * k / 4 + (rnd(seed + k) - 0.5) * h * 0.1;
    s += detail(`M${f(x + w * 0.04)},${f(gy)} C${f(x + w * 0.3)},${f(gy - h * 0.12)} ${f(x + w * 0.6)},${f(gy + h * 0.12)} ${f(x + w * 0.96)},${f(gy)}`, dk, Math.max(1.2, h * 0.04), 0.8);
  }
  const kx = x + w * (0.25 + 0.5 * rnd(seed * 3)), ky = y + h * 0.5;
  return s + `<ellipse cx="${f(kx)}" cy="${f(ky)}" rx="${f(h * 0.22)}" ry="${f(h * 0.12)}" fill="none" stroke="${dk}" stroke-width="${f(Math.max(1.2, h * 0.04))}"/>` +
    `<ellipse cx="${f(kx)}" cy="${f(ky)}" rx="${f(h * 0.08)}" ry="${f(h * 0.05)}" fill="${dk}"/>`;
}

// ground(x0, x1, y, depth, t, opts): a soil band whose top edge is at y, with pebbles and grass on top
function ground(x0, x1, y, depth, t, { col = '#C9A77C', grassCol = PLANT.grass, seed = 8, withGrass = true } = {}) {
  let edge = `M${f(x0)},${f(y + depth)} L${f(x0)},${f(y)}`;
  for (let x = x0; x <= x1; x += 40) edge += ` L${f(x)},${f(y + 5 * Math.sin(x * 0.013 + seed))}`;
  let s = vol(edge + ` L${f(x1)},${f(y + depth)} Z`, col, { depth: 12, shine: false });
  for (let i = 0; i < (x1 - x0) / 25; i++) {
    const px = x0 + rnd(seed * 3 + i) * (x1 - x0), py = y + 20 + rnd(seed * 5 + i) * (depth - 30);
    s += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(4 + 6 * rnd(seed + i))}" ry="${f(3 + 3 * rnd(seed * 7 + i))}" fill="${tone(col, rnd(i) > 0.5 ? -0.25 : 0.2)}"/>`;
  }
  return s + (withGrass ? grass(x0, x1, y + 4, t, { col: grassCol, seed }) : '');
}

// ---------- objects ----------

// bulb(x, y, s, opts): a light bulb hanging from (x, y) by its screw base, glass downwards; on = glowing
function bulb(x, y, s = 1, { on = true, t = 0 } = {}) {
  const glass = on ? '#FFE9A0' : '#EEF2F3';
  let g = on ? `<circle cx="0" cy="120" r="${f(150 + 6 * Math.sin(t * 6))}" fill="#FFE27A" opacity="0.28"/><circle cx="0" cy="120" r="100" fill="#FFF3C4" opacity="0.4"/>` : '';
  g += vol(rectD(-30, 0, 60, 54, 6), '#B9BCC2', { depth: 6, w: 5 });
  for (let k = 0; k < 4; k++) g += detail(`M-30,${10 + k * 12} L30,${16 + k * 12}`, '#8A8E96', 3);
  g += vol('M-30,54 C-30,70 -64,84 -64,124 C-64,166 -34,190 0,190 C34,190 64,166 64,124 C64,84 30,70 30,54 Z', glass, { depth: 12, w: 6 });
  g += detail('M-14,60 L-14,110 M14,60 L14,110', '#8A8E96', 3) + detail('M-14,110 l7,-10 l7,10 l7,-10 l7,10', on ? '#E8892E' : '#8A8E96', 4);
  return G(T(x, y, s), 1, g);
}

// coin(x, y, s, opts): a coin with a thick rim seen at a slight tilt; label is the denomination
function coin(x, y, s = 1, { label = '1000', col = '#D7D9DC' } = {}) {
  const edge = tone(col, -0.25);
  let g = vol(`M-70,0 A70,62 0 0 0 70,0 L70,14 A70,62 0 0 1 -70,14 Z`, edge, { depth: 4, w: 6, shine: false });
  g += vol('M-70,0 A70,62 0 1 1 70,0 A70,62 0 1 1 -70,0 Z', col, { depth: 9, w: 6 });
  g += `<ellipse cx="0" cy="0" rx="54" ry="47" fill="none" stroke="${tone(col, -0.3)}" stroke-width="3"/>`;
  for (let k = 0; k < 36; k++) { const a = k / 36 * Math.PI * 2; g += detail(`M${f(60 * Math.cos(a))},${f(53 * Math.sin(a))} L${f(65 * Math.cos(a))},${f(57.5 * Math.sin(a))}`, tone(col, -0.25), 2); }
  g += txt(label, 0, 2, label.length > 3 ? 30 : 38, tone(col, -0.55), 900);
  return G(T(x, y, s), 1, g);
}

// banknote(x, y, s, opts): a generic banknote (not a copy of any real design); value like '10.000'
function banknote(x, y, s = 1, { value = '10.000', col = '#8FC1A9', rot = 0 } = {}) {
  const dk = tone(col, -0.35);
  let g = vol(rectD(-160, -80, 320, 160, 10), col, { depth: 10, w: 5, rot });
  g += `<rect x="-146" y="-66" width="292" height="132" rx="6" fill="none" stroke="${dk}" stroke-width="3" stroke-dasharray="2 5"/>`;
  g += `<ellipse cx="-80" cy="0" rx="44" ry="50" fill="${tone(col, 0.35)}" stroke="${dk}" stroke-width="3"/>`;
  for (let k = 0; k < 5; k++) g += detail(`M${-110 + k * 15},-30 q15,30 0,60`, dk, 2, 0.6);
  g += txt('Rp', 40, -26, 28, dk, 900) + txt(value, 60, 20, 48, tone(col, -0.55), 900);
  return G(T(x, y, s, rot), 1, g);
}

// phone(x, y, s, opts): a smartphone; screen is SVG drawn in the 0..200 x 0..380 screen box
function phone(x, y, s = 1, { screen = '', col = '#2B2D35', glow = '#DDEBF7', rot = 0 } = {}) {
  let g = vol(rectD(-118, -220, 236, 440, 34), col, { depth: 10, w: 6, rot });
  g += `<rect x="-130" y="-120" width="12" height="60" rx="4" fill="${tone(col, -0.2)}"/><rect x="118" y="-150" width="10" height="40" rx="4" fill="${tone(col, -0.2)}"/>`;
  g += `<defs><clipPath id="phScr${VOL_N}"><rect x="-100" y="-190" width="200" height="380" rx="20"/></clipPath></defs>`;
  g += `<g clip-path="url(#phScr${VOL_N})"><rect x="-100" y="-190" width="200" height="380" fill="${glow}"/><g transform="translate(-100 -190)">${screen}</g>` +
    `<path d="M-100,-190 L40,-190 L-100,30 Z" fill="#fff" opacity="0.12"/></g>`;
  g += `<rect x="-26" y="-182" width="52" height="12" rx="6" fill="${col}"/>`;
  return G(T(x, y, s, rot), 1, g);
}

// glass(x, y, s, opts): a drinking glass standing on (x, y), filled to level (0..1) with a liquid colour
function glass(x, y, s = 1, { level = 0.6, liquid = '#F2A93B', t = 0 } = {}) {
  const top = -220, bot = 0, wTop = 80, wBot = 62, ly = bot + (top - bot) * level * 0.9 + 10;
  const half = yy => lerp(wBot, wTop, (bot - yy) / (bot - top));
  let g = shadow(0, 4, 80, 0.14);
  if (level > 0) {
    const wobble = 3 * Math.sin(t * 4);
    g += vol(`M${f(-half(ly))},${f(ly + wobble)} L${f(half(ly))},${f(ly - wobble)} L${wBot},${bot} L${-wBot},${bot} Z`, liquid, { depth: 10, w: 0 });
    g += `<ellipse cx="0" cy="${f(ly)}" rx="${f(half(ly))}" ry="10" fill="${tone(liquid, 0.3)}" transform="rotate(${f(-wobble * 0.3)} 0 ${f(ly)})"/>`;
  }
  g += `<path d="M${-wTop},${top} L${-wBot},${bot} L${wBot},${bot} L${wTop},${top}" fill="#fff" fill-opacity="0.18" ${stroke(6)}/>`;
  g += `<ellipse cx="0" cy="${top}" rx="${wTop}" ry="12" fill="none" ${stroke(5)}/>`;
  g += detail(`M${-wTop + 22},${top + 30} L${-wBot + 16},${bot - 30}`, '#fff', 8, 0.7) + detail(`M${-wTop + 40},${top + 40} L${-wTop + 38},${top + 90}`, '#fff', 4, 0.6);
  return G(T(x, y, s), 1, g);
}

// box(x, y, s, opts): a cardboard box standing on (x, y), seen a little from above, with packing tape
function box(x, y, s = 1, { col = '#C99B6D', tape = '#E8D7B0' } = {}) {
  let g = shadow(10, 4, 150, 0.16);
  g += vol('M-130,-200 L60,-200 L60,0 L-130,0 Z', col, { depth: 10, w: 6, shine: false });
  g += vol('M60,-200 L130,-240 L130,-40 L60,0 Z', tone(col, -0.18), { depth: 6, w: 6, shine: false });
  g += vol('M-130,-200 L-60,-240 L130,-240 L60,-200 Z', tone(col, 0.15), { depth: 4, w: 6, shine: false });
  g += `<path d="M-48,-200 L22,-240 L42,-240 L-28,-200 Z" fill="${tape}" opacity="0.9"/><rect x="-48" y="-200" width="20" height="90" fill="${tape}" opacity="0.9"/>`;
  g += detail('M-110,-30 L-60,-30 M-110,-18 L-80,-18', tone(col, -0.35), 3) + detail('M-100,-150 l18,-14 l18,14 M-82,-164 L-82,-120', tone(col, -0.4), 4);
  return G(T(x, y, s), 1, g);
}

// plate(x, y, s, opts): a ceramic plate resting on (x, y) with optional spoon and food SVG on top
function plate(x, y, s = 1, { food = '', spoon = true, col = '#FFFFFF' } = {}) {
  let g = shadow(0, 6, 150, 0.15);
  // foot ring and rim
  g += vol('M-92,-6 L92,-6 L82,4 L-82,4 Z', tone(col, -0.14), { depth: 4, w: 5, shine: false });
  g += vol('M-140,-18 A140,40 0 1 0 140,-18 A140,40 0 1 0 -140,-18 Z', col, { depth: 8, w: 6 });
  g += `<ellipse cx="0" cy="-16" rx="96" ry="25" fill="${tone(col, -0.06)}" stroke="${tone(col, -0.24)}" stroke-width="3"/>`;
  g += detail('M-76,-26 A84,20 0 0 1 20,-34', tone(col, 0.4), 3.5, 0.8);
  if (food) g += G(T(0, -20), 1, food);
  if (spoon) {
    const sp = vol('M18,-6 C46,-14 68,-6 68,4 C68,14 46,22 18,14 L-66,8 C-74,8 -74,-2 -66,-2 Z', '#C8D0D8', { depth: 4, w: 4.5, rot: 14 }) +
      detail('M28,0 Q46,-2 56,4', '#FFFFFF', 2.5, 0.8);
    g += G(T(78, 12, 1, 14), 1, sp);
  }
  return G(T(x, y, s), 1, g);
}

// riceBowl(x, y, s, opts): a bowl of warm white rice standing on (x, y) with rising steam from t
function riceBowl(x, y, s = 1, { t = 0, col = '#E05A47', steam = true } = {}) {
  let g = shadow(0, 6, 108, 0.16);
  // fluffy rice dome
  g += vol('M-90,-82 C-86,-138 -46,-164 0,-164 C46,-164 86,-138 90,-82 Z', '#FFFFFF', { depth: 10, w: 6 });
  const rDk = tone('#FFFFFF', -0.25);
  [[-42, -118, -15], [-10, -138, 12], [28, -124, -20], [-24, -102, 8], [18, -104, 18], [48, -100, -10]].forEach(([rx, ry, a]) => {
    g += detail(`M${rx - 8},${ry} q8,${a > 0 ? -5 : 5} 16,0`, rDk, 3, 0.8);
  });
  // bowl body and foot
  g += vol('M-46,-10 L46,-10 L52,2 L-52,2 Z', tone(col, -0.18), { depth: 4, w: 5, shine: false });
  g += vol('M-98,-84 L98,-84 C94,-28 62,-8 44,-8 L-44,-8 C-62,-8 -94,-28 -98,-84 Z', col, { depth: 12, w: 6 });
  g += detail('M-88,-62 Q0,-52 88,-62', tone(col, 0.35), 5, 0.85);
  if (steam) {
    [-34, 0, 34].forEach((sx, k) => {
      const sw = 8 * Math.sin(t * 2.8 + k * 1.7), dy = ((t * 22 + k * 18) % 36);
      const op = 0.75 * Math.sin(Math.PI * dy / 36);
      g += detail(`M${f(sx)},${f(-172 - dy)} q${f(10 + sw)},-18 ${f(-4 + sw * 0.5)},-36 q${f(-10 - sw)},-18 ${f(4)},-34`, tone('#FFFFFF', -0.28), 4, Math.max(0.15, op));
    });
  }
  return G(T(x, y, s), 1, g);
}

// pot(x, y, s, opts): a cooking pot with side handles and a lid standing on (x, y)
function pot(x, y, s = 1, { t = 0, steam = true, col = '#7C9EB2', rimCol = '#3A3F47' } = {}) {
  let g = shadow(0, 6, 148, 0.16);
  // side loop handles
  g += vol('M-104,-128 L-138,-128 C-148,-128 -148,-96 -138,-96 L-104,-96 Z', rimCol, { depth: 4, w: 5 });
  g += vol('M104,-128 L138,-128 C148,-128 148,-96 138,-96 L104,-96 Z', rimCol, { depth: 4, w: 5 });
  // pot body
  g += vol('M-108,-146 L108,-146 L102,-22 C102,-6 88,2 72,2 L-72,2 C-88,2 -102,-6 -102,-22 Z', col, { depth: 14, w: 6 });
  g += detail('M-76,-126 L-72,-24', tone(col, 0.38), 6, 0.7) + detail('M-98,-132 L98,-132', tone(col, -0.28), 3);
  // steam puffs escaping under the lid
  const rattle = steam ? 2.2 * Math.sin(t * 11) : 0;
  if (steam) {
    [-78, 0, 78].forEach((sx, k) => {
      const sw = 7 * Math.cos(t * 3.2 + k * 2), dy = ((t * 26 + k * 14) % 34);
      g += detail(`M${f(sx)},${f(-178 - dy)} q${f(10 + sw)},-16 ${f(-4 + sw)},-34`, tone('#FFFFFF', -0.3), 4, 0.55);
    });
  }
  // dome lid + top knob
  let lid = vol('M-22,-186 L22,-186 L16,-168 L-16,-168 Z', rimCol, { depth: 4, w: 5 });
  lid += vol('M-114,-146 C-108,-176 108,-176 114,-146 Z', tone(col, 0.12), { depth: 8, w: 6 });
  g += G(T(0, -Math.abs(rattle) * 1.5, 1, rattle), 1, lid);
  return G(T(x, y, s), 1, g);
}

// stove(x, y, s, opts): a two-burner gas stove standing on (x, y); flames dance from t when on = true
function stove(x, y, s = 1, { on = true, t = 0, col = '#D8DEE4' } = {}) {
  let g = shadow(0, 6, 220, 0.16);
  const dark = '#3A3F47', dk = tone(col, -0.28);
  // rubber feet
  g += vol(rectD(-166, -10, 28, 12, 3), dark, { depth: 2, w: 4 }) + vol(rectD(138, -10, 28, 12, 3), dark, { depth: 2, w: 4 });
  // burner trivets & flames
  [-102, 102].forEach((bx, idx) => {
    if (on) {
      for (let k = -2; k <= 2; k++) {
        const fx = bx + k * 19, sw = 4.5 * Math.sin(t * 14 + k * 1.3 + idx), fh = (k === 0 ? 44 : Math.abs(k) === 1 ? 36 : 28) + 4 * Math.cos(t * 16 + k);
        g += vol(`M${f(fx - 11)},-78 Q${f(fx - 13 + sw * 0.5)},${f(-78 - fh * 0.6)} ${f(fx + sw)},${f(-78 - fh)} Q${f(fx + 13 + sw * 0.5)},${f(-78 - fh * 0.6)} ${f(fx + 11)},-78 Z`, '#4FA3E3', { depth: 3, w: 3.5 });
        g += `<path d="M${f(fx - 6)},-78 Q${f(fx + sw * 0.5)},${f(-78 - fh * 0.62)} ${f(fx + 6)},-78 Z" fill="#FFD24C"/>`;
      }
    }
    g += vol(rectD(bx - 64, -82, 128, 10, 3), dark, { depth: 3, w: 4.5 });
    g += detail(`M${bx - 52},-82 L${bx - 38},-90 M${bx + 52},-82 L${bx + 38},-90 M${bx},-82 L${bx},-90`, dark, 5);
  });
  // stove casing & control strip
  g += vol(rectD(-188, -74, 376, 66, 12), col, { depth: 10, w: 6 });
  g += `<rect x="-168" y="-58" width="336" height="36" rx="6" fill="${tone(col, -0.16)}" stroke="${dk}" stroke-width="2.5"/>`;
  [-102, 102].forEach(bx => {
    g += vol(circleD(bx, -40, 14), dark, { depth: 3, w: 4 });
    const ka = on ? 42 : 0;
    g += G(T(bx, -40, 1, ka), 1, detail('M0,-10 L0,4', '#FFFFFF', 3));
  });
  return G(T(x, y, s), 1, g);
}

// bottle(x, y, s, opts): a plastic water bottle standing on (x, y), filled to level (0..1) with col
function bottle(x, y, s = 1, { level = 0.7, col = '#58AEE8', capCol = '#2F5E9E' } = {}) {
  const lv = clamp(level, 0, 1), bot = 0, shoulder = -175, neck = -232;
  let g = shadow(0, 4, 72, 0.14);
  if (lv > 0.02) {
    const ly = lerp(bot - 8, shoulder + 10, lv);
    g += vol(`M-52,${f(ly)} L52,${f(ly)} L52,-14 C52,-4 44,0 34,0 L-34,0 C-44,0 -52,-4 -52,-14 Z`, col, { depth: 10, w: 0 });
    g += `<ellipse cx="0" cy="${f(ly)}" rx="52" ry="8" fill="${tone(col, 0.3)}"/>`;
  }
  const bodyD = `M-24,${neck} L24,${neck} L26,-202 C46,-192 56,-182 56,${shoulder} L56,-16 C56,-4 46,0 34,0 L-34,0 C-46,0 -56,-4 -56,-16 L-56,${shoulder} C-56,-182 -46,-192 -26,-202 Z`;
  g += `<path d="${bodyD}" fill="#FFFFFF" fill-opacity="0.22" ${stroke(6)}/>`;
  // ribs and shine
  const ribCol = tone(col, -0.25);
  [-55, -95, -135].forEach(ry => g += detail(`M-52,${ry} Q0,${ry + 5} 52,${ry}`, ribCol, 2.5, 0.55));
  g += detail('M-38,-168 L-38,-24', '#FFFFFF', 7, 0.72);
  // screw cap
  g += vol(rectD(-27, -262, 54, 30, 6), capCol, { depth: 5, w: 5 });
  g += detail('M-20,-254 L-20,-238 M-7,-254 L-7,-238 M7,-254 L7,-238 M20,-254 L20,-238', tone(capCol, -0.3), 2.5);
  return G(T(x, y, s), 1, g);
}

// fan(x, y, s, opts): a standing fan on (x, y) with 3 blades spinning from t when on = true
function fan(x, y, s = 1, { t = 0, on = true, col = '#58AEE8', bodyCol = '#EAECEF' } = {}) {
  const cy = -215, ang = on ? (t * 480) % 360 : 25;
  let g = shadow(0, 6, 108, 0.16);
  // stand neck & base
  g += vol(rectD(-14, cy + 70, 28, 130, 6), bodyCol, { depth: 6, w: 5 });
  g += vol('M-78,0 C-74,-30 74,-30 78,0 Z', bodyCol, { depth: 8, w: 6 });
  [[-24, '#E0522F'], [0, '#5FA548'], [24, '#F5B83D']].forEach(([bx, bc]) => {
    g += `<rect x="${bx - 7}" y="-16" width="14" height="8" rx="3" fill="${bc}" stroke="${C.ink}" stroke-width="2"/>`;
  });
  // rear cage rim
  g += vol(circleD(0, cy, 106), '#F7F9FA', { depth: 8, w: 6 });
  // rotating 3-blade rotor
  let blades = '';
  for (let k = 0; k < 3; k++) {
    const a = k * 120;
    blades += G(T(0, 0, 1, a), 1, vol('M-8,-14 C-32,-52 -36,-88 -4,-92 C28,-94 30,-52 8,-14 Z', col, { depth: 5, w: 4.5, rot: a + ang }));
  }
  g += G(T(0, cy, 1, ang), 1, blades);
  // front wire guard & hub
  const wireCol = tone(bodyCol, -0.35);
  for (let k = 0; k < 12; k++) {
    const a = k * 30 * Math.PI / 180;
    g += detail(`M${f(22 * Math.cos(a))},${f(cy + 22 * Math.sin(a))} L${f(102 * Math.cos(a))},${f(cy + 102 * Math.sin(a))}`, wireCol, 2, 0.75);
  }
  g += `<circle cx="0" cy="${cy}" r="66" fill="none" stroke="${wireCol}" stroke-width="2" opacity="0.75"/>`;
  g += vol(circleD(0, cy, 22), bodyCol, { depth: 4, w: 5 });
  return G(T(x, y, s), 1, g);
}

// wallClock(x, y, s, opts): a round wall clock centered on (x, y) showing hour h and minute m
function wallClock(x, y, s = 1, { h = 10, m = 10, col = '#E0522F', faceCol = '#FFFFFF' } = {}) {
  const ma = (m / 60) * 360 - 90, ha = (((h % 12) + m / 60) / 12) * 360 - 90;
  let g = shadow(0, 104, 82, 0.12);
  g += vol(circleD(0, 0, 106), col, { depth: 10, w: 6 });
  g += vol(circleD(0, 0, 86), faceCol, { depth: 6, w: 5 });
  const tickCol = tone(faceCol, -0.65);
  for (let k = 0; k < 12; k++) {
    const a = k * 30 * Math.PI / 180, r0 = k % 3 === 0 ? 64 : 70, r1 = 78;
    g += detail(`M${f(r0 * Math.cos(a))},${f(r0 * Math.sin(a))} L${f(r1 * Math.cos(a))},${f(r1 * Math.sin(a))}`, tickCol, k % 3 === 0 ? 5 : 3);
  }
  const hx = 46 * Math.cos(ha * Math.PI / 180), hy = 46 * Math.sin(ha * Math.PI / 180);
  const mx = 64 * Math.cos(ma * Math.PI / 180), my = 64 * Math.sin(ma * Math.PI / 180);
  g += `<line x1="0" y1="0" x2="${f(hx)}" y2="${f(hy)}" ${stroke(7, C.ink)}/>`;
  g += `<line x1="0" y1="0" x2="${f(mx)}" y2="${f(my)}" ${stroke(5, col)}/>`;
  g += vol(circleD(0, 0, 10), col, { depth: 2, w: 4 });
  return G(T(x, y, s), 1, g);
}

// windowFrame(x, y, w, h, opts): a window centered on (x, y), w by h, with curtains and day/night sky
function windowFrame(x, y, w = 260, h = 320, { night = false, t = 0, frameCol = '#D9B98C', curtainCol = '#E06D53' } = {}) {
  const hw = w / 2, hh = h / 2, clipId = `win${VOL_N++}`;
  const skyCol = night ? '#263554' : '#96CEF2';
  let g = shadow(0, hh + 16, w * 0.52, 0.14);
  // outer frame
  g += vol(rectD(-hw - 14, -hh - 14, w + 28, h + 28, 8), frameCol, { depth: 10, w: 6 });
  // clipped sky view inside pane
  let sky = `<rect x="${f(-hw)}" y="${f(-hh)}" width="${f(w)}" height="${f(h)}" fill="${skyCol}"/>`;
  if (night) {
    // crescent moon and twinkling stars
    const mx = -hw * 0.38, my = -hh * 0.42;
    sky += `<path d="M${f(mx)},${f(my - 28)} A28,28 0 1 0 ${f(mx + 26)},${f(my + 14)} A22,22 0 1 1 ${f(mx)},${f(my - 28)} Z" fill="#FFE27A"/>`;
    [[-0.55, 0.1, 1], [0.35, -0.5, 2], [0.5, 0.05, 3], [-0.1, -0.15, 4]].forEach(([ux, uy, k]) => {
      const sr = (4 + 2.5 * Math.sin(t * 3.5 + k * 1.9));
      sky += sparkle(ux * hw, uy * hh, sr, '#FFF3B0');
    });
  } else {
    const cx = 10 * Math.sin(t * 0.7);
    sky += `<circle cx="${f(-hw * 0.45)}" cy="${f(-hh * 0.48)}" r="26" fill="#FFE27A"/>`;
    sky += `<path d="M${f(cx - 56)},${f(-hh * 0.12)} C${f(cx - 68)},${f(-hh * 0.28)} ${f(cx - 32)},${f(-hh * 0.36)} ${f(cx - 18)},${f(-hh * 0.24)} C${f(cx - 4)},${f(-hh * 0.4)} ${f(cx + 30)},${f(-hh * 0.36)} ${f(cx + 38)},${f(-hh * 0.18)} C${f(cx + 56)},${f(-hh * 0.18)} ${f(cx + 56)},${f(-hh * 0.04)} ${f(cx + 36)},${f(-hh * 0.04)} L${f(cx - 46)},${f(-hh * 0.04)} Z" fill="#FFFFFF" opacity="0.9"/>`;
  }
  // diagonal glass reflection
  sky += detail(`M${f(-hw + 24)},${f(-hh + 28)} L${f(-hw + 68)},${f(-hh + 72)} M${f(-hw + 44)},${f(-hh + 24)} L${f(-hw + 76)},${f(-hh + 56)}`, '#FFFFFF', 4, 0.45);
  g += `<defs><clipPath id="${clipId}"><rect x="${f(-hw)}" y="${f(-hh)}" width="${f(w)}" height="${f(h)}" rx="4"/></clipPath></defs>`;
  g += `<g clip-path="url(#${clipId})">${sky}</g>`;
  // window crossbars & inner border
  g += vol(rectD(-7, -hh, 14, h, 0), frameCol, { depth: 4, w: 5 });
  g += vol(rectD(-hw, -7, w, 14, 0), frameCol, { depth: 4, w: 5 });
  g += `<rect x="${f(-hw)}" y="${f(-hh)}" width="${f(w)}" height="${f(h)}" rx="4" fill="none" ${stroke(5)}/>`;
  // curtains on left and right + curtain rod
  const sway = 3 * Math.sin(t * 1.6), cDk = tone(curtainCol, -0.28);
  [-1, 1].forEach(sd => {
    const ox = sd * hw, ix = sd * (hw - w * 0.24) + sway * sd;
    const cd = `M${f(ox - sd * 8)},${f(-hh - 10)} L${f(ix)},${f(-hh - 10)} C${f(ix - sd * 14)},${f(-12)} ${f(ix + sd * 8)},${f(hh * 0.45)} ${f(ox - sd * 10)},${f(hh + 6)} L${f(ox - sd * 8)},${f(hh + 6)} Z`;
    g += vol(cd, curtainCol, { depth: 8, w: 5 });
    g += detail(`M${f(ox - sd * 18)},${f(-hh + 8)} Q${f(ix - sd * 4)},0 ${f(ox - sd * 16)},${f(hh - 12)}`, cDk, 3, 0.75);
  });
  g += vol(rectD(-hw - 26, -hh - 24, w + 52, 12, 6), tone(frameCol, -0.22), { depth: 4, w: 5 });
  // bottom sill
  g += vol(rectD(-hw - 24, hh + 8, w + 48, 22, 6), frameCol, { depth: 6, w: 6 });
  return G(T(x, y), 1, g);
}

// umbrella(x, y, s, opts): an umbrella centered on (x, y), open canopy or folded closed
function umbrella(x, y, s = 1, { open = true, col = '#E0522F', handleCol = '#8A5A36', rot = 0 } = {}) {
  let g = shadow(0, 122, open ? 110 : 45, 0.14);
  // shaft and J-hook handle
  g += vol(rectD(-5, -152, 10, 232, 4), '#9AA2AA', { depth: 3, w: 4.5 });
  g += vol('M-5,76 L5,76 L5,96 C5,120 -34,120 -34,96 L-34,86 L-22,86 L-22,95 C-22,106 -5,106 -5,95 Z', handleCol, { depth: 4, w: 5 });
  const dk = tone(col, -0.3);
  if (open) {
    const canopyD = 'M-136,-28 C-136,-116 -74,-142 0,-142 C74,-142 136,-116 136,-28 Q102,-50 68,-28 Q34,-50 0,-28 Q-34,-50 -68,-28 Q-102,-50 -136,-28 Z';
    g += vol(canopyD, col, { depth: 14, w: 6, rot });
    g += detail('M0,-142 C-38,-112 -64,-76 -68,-28 M0,-142 L0,-28 M0,-142 C38,-112 64,-76 68,-28', dk, 3.5, 0.85);
  } else {
    const closedD = 'M-10,-138 L10,-138 L28,-12 Q14,-24 0,-10 Q-14,-24 -28,-12 Z';
    g += vol(closedD, col, { depth: 7, w: 5.5, rot });
    g += detail('M-2,-130 L-10,-18 M4,-130 L12,-18', dk, 3, 0.8);
    g += vol(rectD(-18, -58, 36, 10, 4), dk, { depth: 2, w: 4 });
  }
  return G(T(x, y, s, rot), 1, g);
}

// ---------- batch B: things the topics drew themselves, now shared ----------

// jar(x, y, s, opts): a glass jar standing on (x, y), filled to level with a colour (honey, jam, sambal);
// label: text on a paper label ('' for none); crystal 0..1 turns the content pale and grainy
function jar(x, y, s = 1, { fill = '#E9A21A', level = 0.85, label = '', lid = '#D9A441', crystal = 0 } = {}) {
  const top = -300 + 270 * (1 - level);
  let g = shadow(0, 4, 190, 0.18);
  const body = 'M-150,-330 C-170,-322 -175,-300 -175,-270 L-175,-30 C-175,-10 -160,0 -140,0 L140,0 C160,0 175,-10 175,-30 L175,-270 C175,-300 170,-322 150,-330 Z';
  g += `<path d="${body}" fill="#F4F8F8" fill-opacity="0.55"/>`;
  if (level > 0) {
    g += vol(`M-160,${f(top)} L160,${f(top)} L160,-30 C160,-20 152,-14 140,-14 L-140,-14 C-152,-14 -160,-20 -160,-30 Z`, fill, { depth: 22, w: 0 });
    g += `<ellipse cx="0" cy="${f(top)}" rx="160" ry="14" fill="${tone(fill, 0.3)}"/>`;
    if (crystal > 0) for (let k = 0; k < 36; k++) {
      const cx = -140 + rnd(k) * 280, cy = top + 20 + rnd(k + 50) * (-34 - top), r = 3 + rnd(k + 9) * 5;
      g += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="#FFFFFF" opacity="${f(0.85 * crystal)}"/>`;
    }
  }
  if (label) g += vol(rectD(-120, -226, 240, 120, 14), '#FFF6E0', { depth: 6, w: 5 }) + bodyText(label, 0, -166, 52, C.ink, 'middle', 900);
  g += `<path d="${body}" fill="none" ${stroke()}/>`;
  g += detail('M-150,-240 C-156,-180 -156,-110 -150,-60', '#FFFFFF', 16, 0.55);
  g += `<path d="M-130,-300 L-130,-338 L130,-338 L130,-300" fill="#F4F8F8" fill-opacity="0.6" ${stroke(6)}/>`;
  if (lid) g += vol(rectD(-146, -392, 292, 56, 12), lid, { depth: 8 }) +
    [...Array(11)].map((_, k) => detail(`M${-120 + k * 24},-384 L${-120 + k * 24},-344`, tone(lid, -0.3), 3)).join('');
  return G(T(x, y, s), 1, g);
}

// wallCalendar(x, y, s, opts): a wall calendar centred on (x, y); big = the large number (a year, a date)
function wallCalendar(x, y, s = 1, { top = 'TAHUN', big = '2026', col = C.accent } = {}) {
  let g = vol(rectD(-95, -110, 190, 220, 10), '#FFFFFF', { depth: 8, w: 6 });
  g += `<path d="M-95,-56 L-95,-100 Q-95,-110 -85,-110 L85,-110 Q95,-110 95,-100 L95,-56 Z" fill="${col}"/>`;
  g += txt(top, 0, -82, 26, '#FFFFFF', 900);
  [-50, 50].forEach(dx => g += vol(rectD(dx - 6, -126, 12, 30, 6), '#B9BCC2', { depth: 3, w: 4 }));
  g += mono(String(big), 0, 10, 58, C.ink, { anchor: 'middle' });
  for (let k = 0; k < 4; k++) for (let j = 0; j < 5; j++) g += `<rect x="${-76 + j * 32}" y="${50 + k * 12}" width="22" height="6" rx="3" fill="${tone(C.line, -0.05)}"/>`;
  return G(T(x, y, s), 1, g);
}

// bedSide(x, y, s, opts): a single bed seen from the side, standing on the floor at (x, y), headboard on the
// left. sleeper: SVG drawn on the mattress, under the blanket (local coords: mattress top at y -205)
function bedSide(x, y, s = 1, { wood = '#B07B4F', sheet = '#F4F1EA', blanket = '#7FA7D6', sleeper = '' } = {}) {
  let g = shadow(0, 4, 380, 0.16);
  g += vol(rectD(-380, -360, 50, 360, 10), wood, { depth: 8 });
  g += vol(rectD(-340, -150, 720, 70, 10), wood, { depth: 8 }) + vol(rectD(340, -240, 40, 240, 8), wood, { depth: 6 });
  g += vol(rectD(-330, -200, 680, 56, 14), sheet, { depth: 8, w: 6 });
  g += vol('M-310,-210 C-310,-242 -160,-248 -160,-214 C-160,-184 -310,-180 -310,-210 Z', '#FFFFFF', { depth: 8, w: 6 });
  g += sleeper;
  g += vol('M-75,-252 C20,-270 260,-268 355,-254 L362,-140 L-82,-140 Z', blanket, { depth: 14 });
  for (let k = 0; k < 5; k++) g += detail(`M${-35 + k * 84},${-256 - k * 2} q12,58 0,114`, tone(blanket, -0.25), 5);
  return G(T(x, y, s), 1, g);
}

// socket(x, y, s): a wall power socket (round recess, two holes, earth clips) centred on (x, y)
function socket(x, y, s = 1, { col = '#F7F4EC' } = {}) {
  let g = vol(rectD(-60, -60, 120, 120, 18), col, { depth: 8 });
  g += vol(circleD(0, 0, 42), tone(col, -0.08), { depth: 6, w: 5, shine: false });
  g += `<circle cx="-16" cy="0" r="8" fill="${C.ink}"/><circle cx="16" cy="0" r="8" fill="${C.ink}"/>`;
  g += `<rect x="-6" y="-42" width="12" height="9" rx="2" fill="#C9CDD3"/><rect x="-6" y="33" width="12" height="9" rx="2" fill="#C9CDD3"/>`;
  return G(T(x, y, s), 1, g);
}

// germ(x, y, s, opts): a cute bacterium centred on (x, y); dry 0..1 shrinks and wrinkles it; kind: a FACES name
function germ(x, y, s = 1, { t = 0, dry = 0, kind = null, col = '#8FD18B', seed = 1 } = {}) {
  const sc = 1 - 0.35 * dry, c = mix(col, '#B9A77A', dry);
  let d = '';
  for (let k = 0; k <= 24; k++) {
    const a = k / 24 * Math.PI * 2, r = 70 * (1 + (0.06 + 0.12 * dry) * Math.sin(a * 6 + seed) + 0.03 * Math.sin(t * 5 + k));
    d += `${k ? 'L' : 'M'}${f(r * Math.cos(a) * 1.2)},${f(r * Math.sin(a))}`;
  }
  let g = '';
  for (let k = 0; k < 10; k++) {
    const a = k / 10 * Math.PI * 2 + 0.3 * Math.sin(t * 6 + k);
    g += detail(`M${f(80 * Math.cos(a))},${f(66 * Math.sin(a))} l${f(22 * Math.cos(a + 0.4))},${f(22 * Math.sin(a + 0.4))}`, tone(c, -0.45), 5);
  }
  g += vol(d + 'Z', c, { depth: 12, w: 6 });
  if (dry > 0.3) g += detail('M-40,-30 q10,8 0,16 M30,-36 q-8,10 0,18 M-10,30 q10,-6 20,0', tone(c, -0.4), 4);
  g += face(kind || (dry > 0.5 ? 'sad' : dry > 0.15 ? 'shock' : 'smile'), { lx: -24, rx: 24, ey: -10, er: 14, my: 24, mw: 18, skin: c }, t);
  return G(T(x, y, s * sc), 1, g);
}

// ---------- batch B: money and news (Si Tikus) ----------

// wallet(x, y, s, opts): a leather bifold wallet lying centred on (x, y); cash: a generic note peeking out
function wallet(x, y, s = 1, { col = '#8A5A36', cash = true } = {}) {
  let g = shadow(0, 70, 170, 0.14);
  if (cash) g += G(T(20, -58, 1, -6), 1, vol(rectD(-120, -30, 240, 70, 6), '#8FC1A9', { depth: 6, w: 4 }) + txt('Rp', -70, 2, 22, tone('#8FC1A9', -0.45), 900));
  g += vol(rectD(-160, -60, 320, 130, 22), col, { depth: 14 });
  g += `<rect x="-146" y="-46" width="292" height="102" rx="14" fill="none" stroke="${tone(col, 0.25)}" stroke-width="3" stroke-dasharray="7 6"/>`;
  g += vol('M60,-40 L160,-40 L160,40 L60,40 Q40,40 40,20 L40,-20 Q40,-40 60,-40 Z', tone(col, -0.12), { depth: 6, w: 5 }) + vol(circleD(76, 0, 10), '#D9B36A', { depth: 3, w: 3 });
  return G(T(x, y, s), 1, g);
}

// piggyBank(x, y, s, opts): a piggy bank standing on (x, y), with a coin bobbing above the slot
function piggyBank(x, y, s = 1, { col = '#F2A7B8', coin: withCoin = true, t = 0 } = {}) {
  let g = shadow(0, 4, 150, 0.16);
  [-80, -30, 40, 90].forEach(lx => g += vol(rectD(lx - 18, -50, 36, 50, 10), tone(col, -0.12), { depth: 5, w: 5 }));
  g += vol('M-160,-140 C-160,-230 -60,-260 20,-256 C120,-252 170,-200 170,-140 C170,-80 110,-44 10,-44 C-90,-44 -160,-70 -160,-140 Z', col, { depth: 16 });
  g += vol('M150,-176 C200,-182 214,-150 206,-124 C198,-98 160,-100 150,-112 Z', tone(col, -0.06), { depth: 6, w: 5 });
  g += `<ellipse cx="190" cy="-142" rx="5" ry="8" fill="${tone(col, -0.5)}"/><ellipse cx="174" cy="-140" rx="5" ry="8" fill="${tone(col, -0.5)}"/>`;
  g += vol('M60,-246 L92,-290 L110,-238 Z', tone(col, -0.08), { depth: 4, w: 5 }) + `<circle cx="112" cy="-196" r="9" fill="${C.ink}"/><circle cx="115" cy="-199" r="3" fill="#FFFFFF"/>`;
  g += `<rect x="-50" y="-262" width="80" height="12" rx="6" fill="${tone(col, -0.55)}"/>`;
  g += detail('M-160,-150 q-40,-10 -30,-40 q10,-20 24,-6', tone(col, -0.3), 6);
  if (withCoin) g += G(T(-10, -300 - 6 * Math.abs(Math.sin(t * 3))), 1, vol('M-40,0 A40,14 0 0 0 40,0 L40,8 A40,14 0 0 1 -40,8 Z', '#C9A23E', { depth: 3, w: 4, shine: false }) +
    vol('M-40,0 A40,14 0 1 1 40,0 A40,14 0 1 1 -40,0 Z', '#E8C55A', { depth: 4, w: 4 }));
  return G(T(x, y, s), 1, g);
}

// calculator(x, y, s, opts): a desk calculator centred on (x, y) showing display (digits, dots, commas)
function calculator(x, y, s = 1, { display = '1.250.000', col = '#3A3F4E' } = {}) {
  let g = vol(rectD(-120, -170, 240, 340, 26), col, { depth: 12 });
  g += vol(rectD(-96, -146, 192, 74, 10), '#CFE3B5', { depth: 4, w: 4, shine: false }) + mono(String(display).slice(-10), 84, -108, Math.min(34, 176 / Math.max(1, String(display).slice(-10).length) / 0.68), '#26331F', { anchor: 'end' });
  const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+'];
  keys.forEach((k, i) => {
    const kx = -96 + (i % 4) * 50, ky = -54 + Math.floor(i / 4) * 52, op = i % 4 === 3 || k === '=';
    g += vol(rectD(kx, ky, 42, 42, 9), op ? C.accent : '#F1F1EE', { depth: 4, w: 4 }) + txt(k, kx + 21, ky + 22, 24, op ? '#FFFFFF' : C.ink, 900);
  });
  return G(T(x, y, s), 1, g);
}

// chart(x, y, w, h, opts): a chart card with its bottom-left corner at (x, y). kind 'bar' | 'line';
// values: numbers (scaled to the tallest); p 0..1 grows the bars or draws the line; labels under the bars
function chart(x, y, w = 520, h = 360, { values = [3, 5, 4, 7, 9], kind = 'bar', p = 1, col = C.cool, labels = [] } = {}) {
  let g = vol(rectD(0, -h, w, h, 18), '#FFFFFF', { depth: 8, w: 5 });
  const L = 60, B = -50, W = w - L - 30, H = h - 90, max = Math.max(...values), n = values.length;
  for (let k = 1; k <= 3; k++) g += detail(`M${L},${f(B - H * k / 3)} L${L + W},${f(B - H * k / 3)}`, tone(C.line, -0.1), 2, 0.8);
  g += detail(`M${L},${B - H - 10} L${L},${B} L${L + W + 10},${B}`, tone(C.muted, -0.1), 4);
  const px = i => L + W * (i + 0.5) / n, py = v => B - H * v / max;
  if (kind === 'bar') values.forEach((v, i) => {
    const bh = H * v / max * E.outBack(clamp(p * n - i));
    if (bh > 1) g += vol(rectD(px(i) - W / n * 0.32, B - bh, W / n * 0.64, bh, 6), i === n - 1 ? C.accent : col, { depth: 5, w: 4 });
  });
  else {
    const pts = values.map((v, i) => [px(i), py(v)]), m = Math.min(n, Math.max(1, Math.floor(p * (n - 1)) + 1));
    if (m > 1) g += detail('M' + pts.slice(0, m).map(q => q.map(f).join(',')).join(' L'), col, 8);
    pts.slice(0, m).forEach(([qx, qy], i) => g += vol(circleD(qx, qy, 10), i === n - 1 ? C.accent : col, { depth: 3, w: 4 }));
  }
  labels.forEach((l, i) => g += txt(l, px(i), B + 26, 20, C.muted, 800));
  return G(T(x, y, 1), 1, g);
}

// building(x, y, s, opts): a generic bank or office with columns, standing on (x, y); label: plain text sign
function building(x, y, s = 1, { label = 'BANK', col = '#E9E4DA', roof = '#B9BCC2' } = {}) {
  let g = shadow(0, 4, 300, 0.16);
  g += vol(rectD(-280, -40, 560, 40, 4), tone(col, -0.1), { depth: 6 }) + vol(rectD(-250, -70, 500, 30, 4), tone(col, -0.05), { depth: 5 });
  g += vol(rectD(-230, -330, 460, 260, 4), col, { depth: 12 });
  for (let k = 0; k < 5; k++) g += vol(rectD(-200 + k * 92, -320, 38, 250, 6), '#FFFFFF', { depth: 6, w: 5 });
  g += vol('M-270,-330 L0,-450 L270,-330 Z', roof, { depth: 10 });
  g += vol(rectD(-150, -310, 300, 40, 6), '#FFFFFF', { depth: 4, w: 4 }) + txt(label, 0, -289, 30, C.ink, 900);
  return G(T(x, y, s), 1, g);
}

// docPaper(x, y, s, opts): a sheet of paper centred on (x, y), with a folded corner and text lines;
// title: a heading; stamp: true adds a round red approval stamp
function docPaper(x, y, s = 1, { title = 'DOKUMEN', lines = 7, stamp = false, rot = 0 } = {}) {
  let g = vol('M-130,-170 L80,-170 L130,-120 L130,170 L-130,170 Z', '#FFFFFF', { depth: 8, w: 5, rot });
  g += vol('M80,-170 L80,-120 L130,-120 Z', '#E6E2DA', { depth: 2, w: 4, shine: false });
  if (title) g += txt(title, -100, -130, 26, C.ink, 900, 'start');
  for (let k = 0; k < lines; k++) g += `<rect x="-100" y="${-92 + k * 30}" width="${200 - (k % 3) * 40}" height="9" rx="4" fill="${tone(C.line, -0.1)}"/>`;
  if (stamp) g += G(T(56, 112, 1, -14), 0.85, `<circle r="44" fill="none" stroke="${C.accent}" stroke-width="6"/><circle r="34" fill="none" stroke="${C.accent}" stroke-width="2"/>` + txt('OK', 0, 2, 26, C.accent, 900));
  return G(T(x, y, s, rot), 1, g);
}

// newsMic(x, y, s, opts): a reporter's handheld microphone with a plain flag box, its head at (x, y)
function newsMic(x, y, s = 1, { label = 'BERITA', col = C.accent, rot = -12 } = {}) {
  let g = vol(rectD(-22, 40, 44, 230, 18), '#2B2F3F', { depth: 6 });
  g += vol(rectD(-62, 24, 124, 96, 10), col, { depth: 8 }) + txt(label, 0, 72, 24, '#FFFFFF', 900);
  g += vol(circleD(0, -10, 58), '#6B7078', { depth: 10 });
  for (let k = 0; k < 5; k++) g += detail(`M${-44 + 22 * k},-48 L${-44 + 22 * k},28`, '#4A4E56', 2.5, 0.7);
  g += detail('M-52,-10 L52,-10 M-46,-36 L46,-36 M-46,16 L46,16', '#4A4E56', 2.5, 0.7);
  return G(T(x, y, s, rot), 1, g);
}

// ---------- batch B: body and health (Stickman); schematic, never realistic or gory ----------

// heartOrgan(x, y, s, opts): a schematic heart centred on (x, y) that beats with t (red arteries, blue veins)
function heartOrgan(x, y, s = 1, { t = 0, beat = true } = {}) {
  const ph = (t * 1.2) % 1, k = beat ? 1 + 0.06 * Math.exp(-ph * 9) : 1;
  let g = detail('M-26,-128 C-30,-190 40,-200 52,-140', '#C8312B', 26) + detail('M60,-120 C90,-170 120,-160 120,-130', '#C8312B', 18);
  g += detail('M-60,-120 C-80,-170 -110,-170 -120,-140', '#2F6FB5', 18) + detail('M-20,-150 L-20,-196', '#2F6FB5', 16);
  g += G(`scale(${f(k)})`, 1, vol('M0,150 C-40,110 -140,40 -140,-40 C-140,-110 -70,-140 -20,-110 C0,-98 10,-98 30,-110 C80,-140 140,-110 140,-40 C140,40 40,110 0,150 Z', '#E25A5A', { depth: 16 }) +
    detail('M-10,-100 C-30,-20 10,40 -6,130', tone('#E25A5A', -0.3), 5));
  return G(T(x, y, s), 1, g);
}

// lungs(x, y, s, opts): two schematic lungs and the airway centred on (x, y), breathing slowly with t
function lungs(x, y, s = 1, { t = 0, col = '#F29AA8' } = {}) {
  const k = 1 + 0.04 * Math.sin(t * 1.6);
  let g = '';
  [-1, 1].forEach(sd => g += G(`translate(${sd * 74} 20) scale(${f(sd * k)} ${f(k)})`, 1,
    vol('M-18,-150 C40,-160 70,-60 66,40 C64,120 30,150 -10,140 C-40,132 -40,80 -36,40 L-36,-120 C-36,-140 -28,-150 -18,-150 Z', col, { depth: 12 })));
  const air = 'M0,-210 L0,-90 M0,-90 C-20,-70 -40,-60 -60,-40 M0,-90 C20,-70 40,-60 60,-40';
  g += detail(air, '#C9CDD3', 16) + detail(air, '#EEF0F2', 9);
  for (let i = 0; i < 6; i++) g += detail(`M-8,${-200 + i * 18} L8,${-200 + i * 18}`, '#9BA1AA', 3);
  return G(T(x, y, s), 1, g);
}

// stomach(x, y, s, opts): a schematic J-shaped stomach with the food pipe, centred on (x, y)
function stomach(x, y, s = 1, { col = '#F0A07C', t = 0 } = {}) {
  let g = detail('M-40,-200 C-40,-150 -30,-120 -20,-96', tone(col, -0.2), 26);
  g += vol('M-30,-110 C10,-130 90,-120 110,-60 C130,0 110,90 30,110 C-30,124 -90,100 -110,60 C-124,30 -100,0 -70,10 C-40,20 -40,60 0,60 C40,58 50,0 30,-40 C14,-70 -20,-70 -40,-80 Z', col, { depth: 14 });
  g += detail(`M-20,-60 C20,-40 ${f(60 + 4 * Math.sin(t * 2))},0 40,40`, tone(col, -0.28), 4, 0.8);
  g += detail('M-100,60 C-120,80 -120,110 -100,130', tone(col, -0.2), 22);
  return G(T(x, y, s), 1, g);
}

// brain(x, y, s, opts): a schematic brain seen from the side, centred on (x, y)
function brain(x, y, s = 1, { col = '#F2A7B8' } = {}) {
  let g = vol('M40,90 C60,130 40,160 20,170 L4,170 C10,140 0,110 -10,96 Z', tone(col, -0.08), { depth: 5, w: 5 });
  g += vol('M70,60 C110,60 130,90 110,110 C90,126 60,110 52,90 Z', tone(col, -0.06), { depth: 5, w: 5 });
  g += vol('M-150,10 C-170,-70 -110,-140 -30,-140 C40,-160 130,-120 150,-50 C170,10 140,70 80,80 C30,92 -30,96 -80,84 C-130,72 -146,44 -150,10 Z', col, { depth: 14 });
  const gy = tone(col, -0.3);
  g += detail('M-120,-30 q20,-30 50,-20 t50,-10 t40,10 M-100,30 q30,-26 60,-10 t60,-6 t40,12 M-40,-120 q-6,40 20,70 M40,-130 q10,40 -10,80', gy, 5);
  g += detail('M-130,0 q-10,30 20,46 M100,-80 q30,10 30,40', gy, 4);
  return G(T(x, y, s), 1, g);
}

// bodyCell(x, y, s, opts): a schematic animal cell centred on (x, y): membrane, nucleus, a few organelles
function bodyCell(x, y, s = 1, { t = 0, col = '#BFE3D2', nucleus = '#8E7DB5' } = {}) {
  let d = '';
  for (let k = 0; k <= 30; k++) {
    const a = k / 30 * Math.PI * 2, r = 150 * (1 + 0.05 * Math.sin(a * 3 + t * 1.4) + 0.03 * Math.sin(a * 5 - t));
    d += `${k ? 'L' : 'M'}${f(r * Math.cos(a))},${f(r * 0.86 * Math.sin(a))}`;
  }
  let g = vol(d + 'Z', col, { depth: 14 });
  g += vol(circleD(-20, -10, 50), nucleus, { depth: 8, w: 5 }) + `<circle cx="-10" cy="-14" r="14" fill="${tone(nucleus, -0.3)}"/>`;
  [[70, 40, 20], [50, -70, -30], [-90, 60, 40]].forEach(([mx, my, a], i) =>
    g += G(T(mx + 3 * Math.sin(t * 2 + i), my, 1, a), 1, vol('M-34,0 C-34,-16 34,-16 34,0 C34,16 -34,16 -34,0 Z', '#F2A15A', { depth: 4, w: 4 }) +
      detail('M-24,0 q8,-8 14,0 t14,0 t14,0', tone('#F2A15A', -0.3), 3)));
  for (let i = 0; i < 8; i++) g += `<circle cx="${f(-110 + rnd(i) * 220)}" cy="${f(-90 + rnd(i + 20) * 180)}" r="5" fill="${tone(col, -0.3)}"/>`;
  return G(T(x, y, s), 1, g);
}

// thermometer(x, y, s, opts): a glass thermometer standing upright, bulb at (x, y); temp 0..1 fills it
function thermometer(x, y, s = 1, { temp = 0.6, col = '#E0522F' } = {}) {
  let g = vol(rectD(-24, -320, 48, 300, 24), '#F4F8F8', { depth: 6, w: 5 });
  const top = -40 - 260 * clamp(temp);
  g += `<rect x="-10" y="${f(top)}" width="20" height="${f(-20 - top)}" rx="10" fill="${col}"/>`;
  g += vol(circleD(0, 0, 40), col, { depth: 8, w: 5 });
  for (let k = 0; k < 9; k++) g += detail(`M24,${-60 - k * 28} L${k % 2 ? 36 : 44},${-60 - k * 28}`, tone(C.muted, -0.1), 3);
  g += detail('M-12,-300 L-12,-60', '#FFFFFF', 5, 0.7);
  return G(T(x, y, s), 1, g);
}

// stethoscope(x, y, s, opts): a stethoscope lying in a loop, chest piece at (x, y)
function stethoscope(x, y, s = 1, { col = '#2F6FB5' } = {}) {
  let g = limb('M0,-30 C0,-140 -120,-160 -120,-260 M0,-30 C0,-140 120,-160 120,-260', 14, col);
  g += limb('M-120,-260 C-120,-300 -80,-320 -70,-300 M120,-260 C120,-300 80,-320 70,-300', 9, '#B9BCC2');
  g += vol(circleD(-70, -300, 11), '#2B2F3F', { depth: 2, w: 3 }) + vol(circleD(70, -300, 11), '#2B2F3F', { depth: 2, w: 3 });
  g += vol(circleD(0, 0, 46), '#C9CDD3', { depth: 8 }) + vol(circleD(0, 0, 30), '#EEF0F2', { depth: 4, w: 4, shine: false });
  return G(T(x, y, s), 1, g);
}

// toothbrush(x, y, s, opts): a toothbrush lying centred on (x, y), with a blob of toothpaste
function toothbrush(x, y, s = 1, { col = '#5FB3E0', rot = -10, paste = true } = {}) {
  let g = vol('M-220,-14 C-220,-26 120,-24 140,-16 L140,14 C120,22 -220,24 -220,12 Z', col, { depth: 6, rot });
  g += vol(rectD(120, -22, 120, 36, 10), tone(col, -0.05), { depth: 5, w: 5, rot });
  for (let k = 0; k < 9; k++) g += `<rect x="${126 + k * 12}" y="-72" width="8" height="52" rx="3" fill="${k % 2 ? '#FFFFFF' : '#CFE8F7'}" ${stroke(2.5)}/>`;
  if (paste) g += vol('M126,-74 C150,-100 190,-96 214,-84 C236,-74 240,-62 230,-60 L126,-60 Z', '#FFFFFF', { depth: 4, w: 4 }) + detail('M146,-80 C170,-90 196,-86 214,-76', '#7FC8E8', 6);
  return G(T(x, y, s, rot), 1, g);
}

// ---------- batch C: Si Tikus (finance, economy, news); generic, never a real bank, brand, media or party ----------

// fitSize(s, size, maxW): the font size (at most size) at which s fits maxW in the theme's body font
const fitSize = (s, size, maxW) => { const [font, w] = bodyFont(); return Math.min(size, size * maxW / Math.max(1, measure(String(s), size, w, font))); };

// savingsBook(x, y, s, opts): a bank savings book centred on (x, y), with a darker spine and a gold "Rp" seal
function savingsBook(x, y, s = 1, { title = 'TABUNGAN', col = '#2F5E9E', rot = -6 } = {}) {
  let g = shadow(0, 130, 120, 0.15);
  g += vol(rectD(-95, -125, 190, 250, 10), col, { depth: 10, w: 5, rot });
  g += `<rect x="-95" y="-125" width="22" height="250" fill="${tone(col, -0.3)}"/>`;
  g += vol(circleD(10, -50, 30), '#E8C55A', { depth: 4, w: 4 }) + bodyText('Rp', 10, -50, 26, tone('#E8C55A', -0.6), 'middle');
  g += bodyText('BUKU', 10, 20, 38, '#FFFFFF', 'middle') + bodyText(title, 10, 62, fitSize(title, 30, 150), '#FFFFFF', 'middle');
  return G(T(x, y, s, rot), 1, g);
}

const SHIELD_D = 'M0,-115 C55,-92 85,-100 100,-102 L100,8 C100,70 52,104 0,122 C-52,104 -100,70 -100,8 L-100,-102 C-85,-100 -55,-92 0,-115 Z';
// shieldBadge(x, y, s, opts): a protection shield centred on (x, y) with a white inner line and a label
function shieldBadge(x, y, s = 1, { label = 'AMAN', col = C.cool } = {}) {
  let g = vol(SHIELD_D, col, { depth: 12, w: 5 });
  g += `<path d="${SHIELD_D}" transform="scale(0.82)" fill="none" stroke="#FFFFFF" stroke-width="5" opacity="0.8"/>`;
  return G(T(x, y, s), 1, g + bodyText(label, 0, 2, fitSize(label, 86, 150), '#FFFFFF', 'middle'));
}

// hangSign(x, y, s, opts): a sign hanging on two strings from a hook at (x, y); from t0 it swings and settles
function hangSign(x, y, s = 1, { label = 'TUTUP', col = C.accent, t = 0, t0 = null } = {}) {
  const u = t0 == null ? 0 : Math.max(0, t - t0), sw = 9 * Math.exp(-3 * u) * Math.sin(11 * u);
  let g = detail('M-60,0 L-120,72 M60,0 L120,72', '#6B7078', 5);
  g += vol(circleD(-60, 0, 8), '#8A8E96', { depth: 2, w: 3 }) + vol(circleD(60, 0, 8), '#8A8E96', { depth: 2, w: 3 });
  g += vol(rectD(-180, 72, 360, 130, 10), col, { depth: 10, w: 5 }) + `<rect x="-166" y="86" width="332" height="102" fill="none" stroke="#FFFFFF" stroke-width="4"/>`;
  g += bodyText(label, 0, 137, fitSize(label, 84, 260), '#FFFFFF', 'middle', null, 'letter-spacing="8"');
  return G(`translate(${f(x)} ${f(y)}) rotate(${f(sw)}) scale(${f(s)})`, 1, g);
}

// levelGauge(x, y, s, opts): a glass tube standing on (x, y), filled to level (0..1) with a dashed limit line;
// the liquid turns hot above limit. Give every gauge in one frame its own id (clipPath)
function levelGauge(x, y, s = 1, { level = 0.5, limit = null, label = '', value = '', col = '#58AEE8', hot = '#E0522F', t = 0, id = 'lg' } = {}) {
  const lv = clamp(level), H = 542, bot = -88, yl = bot - lv * H;
  const heat = limit == null ? 0 : clamp((lv - limit) / 0.15), liq = mix(col, hot, heat);
  let g = shadow(0, 2, 140, 0.15);
  g += vol(rectD(-110, -80, 220, 80, 12), '#3A3F4E', { depth: 8, w: 5 });
  if (label) g += bodyText(label, 0, -40, fitSize(label, 34, 190), '#FFFFFF', 'middle');
  g += vol(rectD(-52, -642, 104, 566, 52), '#FFFFFF', { depth: 8, w: 5 });
  g += `<defs><clipPath id="${id}"><path d="${rectD(-40, -630, 80, H, 40)}"/></clipPath></defs>`;
  if (lv > 0.01) g += `<g clip-path="url(#${id})"><rect x="-40" y="${f(yl)}" width="80" height="${f(bot - yl)}" fill="${liq}"/>` +
    `<path d="M-40,${f(yl)} q20,${f(-6 * Math.sin(t * 5))} 40,0 t40,0 L40,${f(yl + 8)} L-40,${f(yl + 8)} Z" fill="${mix(liq, '#FFFFFF', 0.35)}"/>` +
    `<rect x="-28" y="${f(yl + 12)}" width="10" height="${f(Math.max(0, bot - yl - 24))}" rx="5" fill="#FFFFFF" opacity="0.3"/></g>`;
  for (let k = 1; k < 8; k++) g += detail(`M22,${f(bot - H * k / 8)} L40,${f(bot - H * k / 8)}`, '#8A8E96', 3, 0.7);
  if (value && lv > 0.15) g += bodyText(value, 0, Math.min(bot - 30, yl + 34), fitSize(value, 30, 74), '#FFFFFF', 'middle');
  if (limit != null) g += `<path d="M-78,${f(bot - clamp(limit) * H)} L78,${f(bot - clamp(limit) * H)}" fill="none" stroke="${C.accent}" stroke-width="7" stroke-linecap="round" stroke-dasharray="16 10"/>`;
  return G(T(x, y, s), 1, g);
}

// checkBoard(x, y, s, opts): a white board on legs standing on (x, y) with a title band and up to four rows
// {text, sub, icon (SVG around (0, 0), about ±60), check (0..1 draws a green tick)}; row `active` is highlighted
function checkBoard(x, y, s = 1, { title = 'SYARAT', rows = [], active = -1 } = {}) {
  const rs = rows.slice(0, 4), top = -730, rh = 544 / Math.max(1, rs.length), k = Math.min(1, rh / 180);
  let g = shadow(0, 2, 340, 0.16) + detail('M-220,-100 L-240,0 M220,-100 L240,0', '#7C6A55', 14);
  g += vol(rectD(-310, top, 620, 640, 14), '#FFFFFF', { depth: 10, w: 5 });
  g += `<rect x="-310" y="${top}" width="620" height="96" fill="${C.accent}"/>` + bodyText(title, 0, top + 50, fitSize(title, 62, 520), '#FFFFFF', 'middle', null, 'letter-spacing="4"');
  rs.forEach((r, i) => {
    const cy = top + 96 + rh * (i + 0.5), c = clamp(r.check || 0);
    if (i === active) g += `<rect x="-294" y="${f(cy - rh / 2 + 8)}" width="588" height="${f(rh - 16)}" fill="${C.yellow}" opacity="0.45"/>`;
    if (i) g += detail(`M-280,${f(cy - rh / 2)} L280,${f(cy - rh / 2)}`, C.line, 3);
    if (r.icon) g += G(T(-195, cy, k), 1, r.icon);
    g += bodyText(r.text || '', -125, cy - (r.sub ? 18 : 0) * k, fitSize(r.text || '', 44 * k, 400), C.ink, 'start');
    if (r.sub) g += bodyText(r.sub, -125, cy + 32 * k, fitSize(r.sub, 30 * k, 400), C.muted, 'start');
    if (c > 0) g += G(T(-234, cy + 44 * k, k), 1, vol(circleD(0, 0, 28), C.leaf, { depth: 5, w: 4 }) +
      `<path d="M-13,1 L-4,11 L14,-10" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44" stroke-dashoffset="${f(44 * (1 - c))}"/>`);
  });
  return G(T(x, y, s), 1, g);
}

// priceLabel(x, y, s, opts): a price tag centred on (x, y) with a string hole on the left
function priceLabel(x, y, s = 1, { label = 'Rp10.000', col = '#FFFFFF', rot = -6 } = {}) {
  let g = shadow(0, 86, 120, 0.12) + detail('M-92,0 C-130,-40 -150,-90 -120,-130', '#8A8E96', 4);
  g += vol('M-120,-60 L80,-60 L130,0 L80,60 L-120,60 Z', col, { depth: 8, w: 5, rot });
  g += `<circle cx="-92" cy="0" r="12" fill="${C.bg}" stroke="${tone(col, -0.35)}" stroke-width="3"/>`;
  return G(T(x, y, s, rot), 1, g + bodyText(label, 18, 4, fitSize(label, 64, 160), C.ink, 'middle'));
}

// fuelPump(x, y, s, opts): a generic fuel dispenser standing on (x, y) with a display, hose and nozzle;
// a small light on the display blinks with t
function fuelPump(x, y, s = 1, { fuel = 'BENSIN', price = 'Rp10.000/L', col = C.accent, t = 0 } = {}) {
  let g = shadow(0, 2, 170, 0.16);
  g += vol(rectD(-140, -30, 280, 30, 8), '#B9BCC2', { depth: 5, w: 5 });
  g += vol(rectD(-100, -340, 200, 310, 20), '#F1F1EE', { depth: 12 });
  g += vol('M-100,-294 L-100,-320 Q-100,-340 -80,-340 L80,-340 Q100,-340 100,-320 L100,-294 Z', col, { depth: 5, w: 5 }) + bodyText('SPBU', 0, -317, 28, '#FFFFFF', 'middle');
  g += vol(rectD(-80, -276, 160, 92, 10), '#18223A', { depth: 4, w: 4, shine: false });
  g += bodyText(fuel, 0, -250, fitSize(fuel, 24, 140), '#F5D04C', 'middle') + bodyText(price, 0, -212, fitSize(price, 22, 140), '#8CD19D', 'middle');
  g += `<circle cx="66" cy="-268" r="5" fill="${Math.floor(t * 2) % 2 ? '#8CD19D' : '#3A4A3E'}"/>`;
  g += vol(rectD(-70, -160, 140, 90, 12), '#3A3F4E', { depth: 6, w: 5 });
  for (let k = 0; k < 3; k++) g += detail(`M-50,${-136 + k * 20} L50,${-136 + k * 20}`, '#5A6170', 3);
  g += detail('M100,-150 C150,-120 150,-40 112,-40', '#2B2F3F', 12);
  g += vol('M96,-60 L126,-66 L132,-34 L104,-28 Z', col, { depth: 4, w: 4 }) + detail('M112,-28 L106,-6', '#6B7078', 8);
  return G(T(x, y, s), 1, g);
}

// atmCard(x, y, s, opts): a generic bank card centred on (x, y) with a chip and contactless waves;
// no bank name or card network logo
function atmCard(x, y, s = 1, { col = '#2F5E9E', digits = '1234', rot = -8 } = {}) {
  let g = shadow(0, 124, 170, 0.14) + vol(rectD(-170, -107, 340, 214, 18), col, { depth: 8, w: 5, rot });
  g += `<path d="M-170,40 C-60,0 60,90 170,20 L170,89 Q170,107 152,107 L-152,107 Q-170,107 -170,89 Z" fill="${tone(col, 0.18)}" opacity="0.6"/>`;
  g += vol(rectD(-136, -58, 58, 44, 8), '#E8C55A', { depth: 3, w: 3 }) + detail('M-136,-36 L-78,-36 M-107,-58 L-107,-14 M-122,-58 L-122,-36 M-92,-36 L-92,-14', tone('#E8C55A', -0.35), 2.5);
  for (let k = 0; k < 3; k++) g += detail(`M${-54 + k * 12},-52 q10,16 0,32`, '#FFFFFF', 4, 0.85);
  const num = `•••• •••• •••• ${digits}`;
  g += bodyText(num, -136, 30, fitSize(num, 28, 270), '#FFFFFF', 'start') + `<rect x="-136" y="62" width="120" height="10" rx="5" fill="#FFFFFF" opacity="0.6"/>`;
  return G(T(x, y, s, rot), 1, g);
}

// goldBar(x, y, s, opts): gold bullion standing on (x, y), seen a little from above; n 1 or 3 (a stack of 2 + 1)
function goldBar(x, y, s = 1, { n = 1, label = 'EMAS' } = {}) {
  const gold = '#E8B93A', bar = (bx, by) => G(T(bx, by), 1,
    vol('M-110,0 L110,0 L90,-60 L-90,-60 Z', gold, { depth: 6, w: 5 }) + vol('M-90,-60 L90,-60 L70,-90 L-70,-90 Z', tone(gold, 0.3), { depth: 3, w: 5 }) +
    bodyText(label, 0, -75, fitSize(label, 22, 110), tone(gold, -0.5), 'middle') + detail('M-70,-14 L60,-14', tone(gold, 0.5), 4, 0.7));
  let g = shadow(0, 2, n === 3 ? 230 : 120, 0.15);
  g += n === 3 ? bar(-105, 0) + bar(105, 0) + bar(0, -90) : bar(0, 0);
  return G(T(x, y, s), 1, g);
}

// safeBox(x, y, s, opts): a safe standing on (x, y) with a combination dial; open 0..1 swings the door
// out on its left hinge. inside: SVG drawn with (0, 0) on the floor of the open safe
function safeBox(x, y, s = 1, { open = 0, col = '#5A6170', inside = '' } = {}) {
  const o = clamp(open), c = Math.cos(o * 100 * Math.PI / 180);
  let g = shadow(0, 2, 170, 0.16);
  g += vol(rectD(-130, -22, 40, 22, 4), tone(col, -0.3), { depth: 3, w: 4 }) + vol(rectD(90, -22, 40, 22, 4), tone(col, -0.3), { depth: 3, w: 4 });
  g += vol(rectD(-150, -320, 300, 300, 18), col, { depth: 14 });
  const room = o > 0.01 ? vol(rectD(-122, -292, 244, 244, 10), '#2B2F3F', { depth: 4, w: 4, shine: false }) + detail('M-122,-170 L122,-170', '#3A3F4E', 4) : '';
  const stuff = o > 0.01 && inside ? G(T(0, -60), 1, inside) : '';
  let door = vol(rectD(-150, -320, 300, 300, 18), tone(col, 0.08), { depth: 10 });
  door += `<rect x="-128" y="-298" width="256" height="256" rx="10" fill="none" stroke="${tone(col, -0.25)}" stroke-width="4"/>`;
  door += vol(circleD(10, -170, 46), '#C9CCD2', { depth: 6, w: 5 }) + vol(circleD(10, -170, 14), tone(col, -0.2), { depth: 3, w: 3 });
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; door += detail(`M${f(10 + 36 * Math.cos(a))},${f(-170 + 36 * Math.sin(a))} L${f(10 + 42 * Math.cos(a))},${f(-170 + 42 * Math.sin(a))}`, '#6B7078', 2.5); }
  door += vol(rectD(84, -222, 22, 104, 10), '#C9CCD2', { depth: 4, w: 4 });
  door = G(`translate(-150 0) scale(${f(c)} 1) translate(150 0)`, 1, door);
  g += o < 0.5 ? room + stuff + door : room + door + stuff;
  return G(T(x, y, s), 1, g);
}

// basket items for shoppingBasket, each standing on its slot's (0, 0) at the basket rim; plain, no brands
const BASKET_ITEM = {
  beras: () => vol('M-60,0 L-55,-100 Q-40,-120 -20,-110 L20,-110 Q40,-120 55,-100 L60,0 Z', '#F4F1EA', { depth: 6, w: 5 }) +
    detail('M-24,-104 L24,-104', '#B9BCC2', 4) + bodyText('BERAS', 0, -52, 22, '#7C6A55', 'middle'),
  telur: () => [[-30, -20], [30, -20], [0, -38]].map(([ex, ey]) => vol(`M${ex - 22},${ey} a22,28 0 1 0 44,0 a22,28 0 1 0 -44,0 Z`, '#F3E2C7', { depth: 4, w: 4 })).join(''),
  minyak: () => vol(rectD(-22, -130, 44, 130, 12), '#F2C230', { depth: 5, w: 4 }) + vol(rectD(-12, -150, 24, 22, 4), '#E0522F', { depth: 3, w: 4 }) +
    `<rect x="-22" y="-80" width="44" height="34" fill="#FFFFFF" opacity="0.85"/>`,
  sayur: () => leaf(0, 0, 110, -112) + leaf(0, 0, 120, -90, { col: PLANT.leafDark }) + leaf(0, 0, 110, -68),
};

// shoppingBasket(x, y, s, opts): a woven plastic market basket standing on (x, y) with items peeking out;
// items: any of 'beras', 'telur', 'minyak', 'sayur' (others are ignored), up to three
function shoppingBasket(x, y, s = 1, { col = '#E0522F', items = ['beras', 'telur', 'minyak'] } = {}) {
  const known = items.filter(k => BASKET_ITEM[k]).slice(0, 3), slots = [[-90], [-50, 50], [-90, 0, 90]][Math.max(0, known.length - 1)];
  let g = shadow(0, 2, 170, 0.16) + detail('M-150,-190 C-150,-300 -40,-300 -40,-190 M40,-190 C40,-300 150,-300 150,-190', tone(col, -0.15), 14);
  known.forEach((k, i) => g += G(T(slots[i], -180), 1, BASKET_ITEM[k]()));
  g += vol('M-170,-180 L170,-180 L140,0 L-140,0 Z', col, { depth: 12 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    const ry = -148 + r * 48, sh = r * 10;
    g += `<rect x="${f(-128 + sh + c * (226 - 2 * sh) / 5 - 14)}" y="${ry}" width="28" height="30" rx="8" fill="${tone(col, -0.35)}" opacity="0.8"/>`;
  }
  g += vol(rectD(-180, -198, 360, 28, 10), tone(col, -0.08), { depth: 4, w: 5 });
  return G(T(x, y, s), 1, g);
}

// oilBarrel(x, y, s, opts): a 200-litre steel drum standing on (x, y) with two rings and a plain label
function oilBarrel(x, y, s = 1, { col = '#2F5E9E', label = 'MINYAK' } = {}) {
  let g = shadow(0, 2, 130, 0.16);
  g += vol(rectD(-110, -300, 220, 300, 18), col, { depth: 12 });
  [-210, -90].forEach(ry => g += detail(`M-108,${ry} L108,${ry}`, tone(col, -0.3), 6) + detail(`M-108,${ry + 8} L108,${ry + 8}`, tone(col, 0.3), 3, 0.7));
  g += vol(rectD(-116, -310, 232, 18, 8), tone(col, -0.15), { depth: 3, w: 4 }) + vol(rectD(40, -326, 30, 16, 4), '#8A8E96', { depth: 2, w: 3 });
  if (label) g += vol(rectD(-74, -176, 148, 52, 6), '#FFFFFF', { depth: 3, w: 4 }) + bodyText(label, 0, -150, fitSize(label, 30, 128), C.ink, 'middle');
  return G(T(x, y, s), 1, g);
}

// lpgTank(x, y, s, opts): a round gas cylinder standing on (x, y) with a foot ring, carry collar and valve; no logo
function lpgTank(x, y, s = 1, { col = '#5FA84A', label = '3 kg' } = {}) {
  let g = shadow(0, 2, 120, 0.16);
  g += vol(rectD(-80, -44, 160, 44, 10), tone(col, -0.15), { depth: 5, w: 5 });
  [-46, 0, 46].forEach(hx => g += `<rect x="${hx - 12}" y="-30" width="24" height="16" rx="6" fill="${tone(col, -0.45)}"/>`);
  g += vol('M-110,-150 C-110,-250 -60,-280 0,-280 C60,-280 110,-250 110,-150 C110,-60 70,-36 0,-36 C-70,-36 -110,-60 -110,-150 Z', col, { depth: 14 });
  g += detail('M-108,-160 C-60,-150 60,-150 108,-160', tone(col, -0.25), 4);
  g += vol(rectD(-62, -322, 124, 50, 16), tone(col, -0.1), { depth: 5, w: 5 });
  g += `<rect x="-44" y="-310" width="30" height="20" rx="6" fill="${tone(col, -0.5)}"/><rect x="14" y="-310" width="30" height="20" rx="6" fill="${tone(col, -0.5)}"/>`;
  g += vol(rectD(-16, -344, 32, 26, 6), '#B9BCC2', { depth: 3, w: 4 });
  if (label) g += bodyText(label, 0, -200, fitSize(label, 44, 150), '#FFFFFF', 'middle');
  return G(T(x, y, s), 1, g);
}

// house(x, y, s, opts): a one-storey house standing on (x, y) with a gable roof; label: a small sign on the roof
function house(x, y, s = 1, { col = '#E9D8B8', roof = '#C2593A', door = '#8A5A36', label = '' } = {}) {
  let g = shadow(0, 2, 220, 0.16);
  g += vol(rectD(-170, -230, 340, 230, 6), col, { depth: 12 });
  g += vol('M-210,-220 L0,-380 L210,-220 Z', roof, { depth: 10 });
  g += vol(rectD(-35, -130, 70, 130, 6), door, { depth: 6, w: 5 }) + vol(circleD(20, -64, 6), '#E8C55A', { depth: 2, w: 3 });
  [-140, 70].forEach(wx => g += vol(rectD(wx, -170, 70, 60, 6), '#CFE8F7', { depth: 4, w: 5 }) + detail(`M${wx + 35},-170 L${wx + 35},-110 M${wx},-140 L${wx + 70},-140`, tone(col, -0.4), 4));
  if (label) g += vol(rectD(-64, -312, 128, 48, 8), '#FFFFFF', { depth: 4, w: 4 }) + bodyText(label, 0, -288, fitSize(label, 32, 108), C.ink, 'middle');
  return G(T(x, y, s), 1, g);
}
