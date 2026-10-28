// Prop library: plants, textures and everyday objects drawn with volume (vol) in the channel's theme style.
// Every function draws around (x, y) in the caller's coordinates and takes t only for idle motion (wind),
// so it is safe for out-of-order frames. Detail lines use darker shades of the fill (not ink), which reads
// well in all three themes; outlines come from vol() and follow TH.fx.
//
// Nature:   leaf, tree (kind 'round' | 'palm'), bush, grass, flower, rock, cloud, sun, rain, bee, fish, fruit
// Surfaces: woodPlank, ground
// Objects:  bulb, coin, banknote, phone, glass, box, plate, riceBowl, pot, stove, bottle, fan, wallClock, windowFrame, umbrella

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
