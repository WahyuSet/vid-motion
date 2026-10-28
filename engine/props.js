// Prop library: plants, textures and everyday objects drawn with volume (vol) in the channel's theme style.
// Every function draws around (x, y) in the caller's coordinates and takes t only for idle motion (wind),
// so it is safe for out-of-order frames. Detail lines use darker shades of the fill (not ink), which reads
// well in all three themes; outlines come from vol() and follow TH.fx.
//
// Nature:   leaf, tree (kind 'round' | 'palm'), bush, grass, flower, rock
// Surfaces: woodPlank, ground
// Objects:  bulb, coin, banknote, phone, glass, box

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
