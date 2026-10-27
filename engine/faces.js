// Expressions shared by every mascot. A mascot passes the geometry of its own face:
//   face(kind, { lx, rx, ey, er, my, mw, skin, style, ink, weight }, t)
//   lx/rx: x of the left/right eye, ey: eye y, er: eye radius, my: mouth y, mw: mouth half-width,
//   skin: face colour (used for eyelids). Strokes scale with er (er 26 = the 7-unit house stroke).
//   style: 'ink' (default: white eyes with pupils, ink outlines — Si Cicak)
//          'soft' (glossy dark kawaii eyes, thinner coloured lines — Si Tikus)
//          'doodle' (dot eyes, pen lines — Stickman)
//   ink: line colour (default C.ink), weight: line width at er 26 (default 7)
const FACES = ['smile', 'calm', 'laugh', 'wink', 'love', 'wow', 'sad', 'angry', 'skeptical', 'sleepy',
  'confused', 'cool', 'shock', 'smug'];

const eyePair = (lx, rx, y, r, look = [0, 0], pupil = 0.5, g = null) =>
  [lx, rx].map(x => eye(x, y, r, look, pupil, g)).join('');

function eye(x, y, r, look = [0, 0], pupil = 0.5, g = null) {
  const style = g && g.style, ink = (g && g.ink) || C.ink;
  const px = x + look[0], py = y + look[1];
  if (style === 'soft' && pupil >= 0.3) {
    return `<ellipse cx="${f(x + look[0] * 0.4)}" cy="${f(y + look[1] * 0.4)}" rx="${f(r * 0.8)}" ry="${f(r)}" fill="${ink}"/>` +
      `<circle cx="${f(x + look[0] * 0.4 - r * 0.24)}" cy="${f(y + look[1] * 0.4 - r * 0.36)}" r="${f(r * 0.3)}" fill="#fff"/>` +
      `<circle cx="${f(x + look[0] * 0.4 + r * 0.26)}" cy="${f(y + look[1] * 0.4 + r * 0.32)}" r="${f(r * 0.13)}" fill="#fff" opacity="0.85"/>`;
  }
  if (style === 'doodle' && pupil >= 0.3) {
    return `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(r * 0.46)}" ry="${f(r * 0.56)}" fill="${ink}"/>`;
  }
  const edge = style === 'soft' ? stroke(r * 0.1, ink) : stroke(r * 0.19, ink);
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#fff" ${edge}/>` +
    `<circle cx="${f(px)}" cy="${f(py)}" r="${f(r * pupil)}" fill="${ink}"/>` +
    (style === 'doodle' ? '' : `<circle cx="${f(px + r * 0.2)}" cy="${f(py - r * 0.25)}" r="${f(r * 0.18)}" fill="#fff"/>`);
}

function magnifier(x, y, r, rot = -30, ink = C.ink) {
  return G(T(x, y, 1, rot), 1,
    `<line x1="0" y1="${r}" x2="0" y2="${r + r * 1.3}" ${stroke(r * 0.42, ink)}/>` +
    `<line x1="0" y1="${r}" x2="0" y2="${r + r * 1.3}" ${stroke(r * 0.26, '#9B6B43')}/>` +
    `<circle r="${r}" fill="#D6ECF7" fill-opacity="0.7" ${stroke(r * 0.22, ink)}/>` +
    `<path d="M${-r * 0.5},${-r * 0.2} Q${-r * 0.45},${-r * 0.5} ${-r * 0.15},${-r * 0.55}" fill="none" ${stroke(r * 0.12, '#fff')}/>`);
}

function face(kind, g, t = 0) {
  const { lx, rx, ey, er, my, mw } = g, k = er / 26, sw = (g.weight ?? 7) * k, skin = g.skin || '#fff';
  const ink = g.ink || C.ink, S = w => stroke(w, ink);
  const E1 = (x, y, r, look, pupil) => eye(x, y, r, look, pupil, g);
  const E2 = (y, r, look, pupil) => eyePair(lx, rx, y, r, look, pupil, g);
  const smile = (w = mw, d = 0.68) => `<path d="M${f(-w)},${f(my)} Q0,${f(my + w * d)} ${f(w)},${f(my)}" fill="none" ${S(sw)}/>`;
  const arcUp = x => `<path d="M${f(x - er * 0.8)},${f(ey + er * 0.25)} Q${f(x)},${f(ey - er * 0.75)} ${f(x + er * 0.8)},${f(ey + er * 0.25)}" fill="none" ${S(sw)}/>`;
  const arcDown = x => `<path d="M${f(x - er * 0.8)},${f(ey)} Q${f(x)},${f(ey + er * 0.6)} ${f(x + er * 0.8)},${f(ey)}" fill="none" ${S(sw)}/>`;
  const shut = x => `<path d="M${f(x - er * 0.8)},${f(ey)} L${f(x + er * 0.8)},${f(ey)}" ${S(sw)}/>`;
  // brow from the outer to the inner end; dy > 0 is lower
  const brow = (x, outerDy, innerDy) => {
    const out = x < 0 ? x - er * 0.9 : x + er * 0.9, inn = x < 0 ? x + er * 0.7 : x - er * 0.7;
    return `<path d="M${f(out)},${f(ey - er * 1.35 + outerDy * er)} L${f(inn)},${f(ey - er * 1.35 + innerDy * er)}" ${S(sw)}/>`;
  };
  const lid = (x, depth) => `<path d="M${f(x - er * 1.05)},${f(ey - er * (1 - depth))} A${f(er * 1.05)},${f(er * 1.05)} 0 0 1 ${f(x + er * 1.05)},${f(ey - er * (1 - depth))} Z" fill="${skin}"/>` +
    `<path d="M${f(x - er * 1.05)},${f(ey - er * (1 - depth))} L${f(x + er * 1.05)},${f(ey - er * (1 - depth))}" ${S(sw)}/>`;
  const heart = (x, r) => `<path transform="${T(x, ey, r / 20)}" d="M0,14 C-26,-4 -18,-24 0,-12 C18,-24 26,-4 0,14 Z" fill="#E8505B" ${S(sw / (r / 20))}/>`;
  const star = (x, r) => `<path transform="${T(x, ey, 1, t * 40)}" d="M0,${-r} L${r * 0.3},${-r * 0.3} L${r},0 L${r * 0.3},${r * 0.3} L0,${r} L${-r * 0.3},${r * 0.3} L${-r},0 L${-r * 0.3},${-r * 0.3} Z" fill="${C.yellow || '#F5B83D'}" ${S(sw * 0.7)}/>`;
  const open = (w, h) => `<path d="M${f(-w)},${f(my)} Q0,${f(my + h)} ${f(w)},${f(my)} Z" fill="${ink}"/>` +
    `<path d="M${f(-w * 0.45)},${f(my + h * 0.35)} Q0,${f(my + h * 0.55)} ${f(w * 0.45)},${f(my + h * 0.35)} Q0,${f(my + h * 0.22)} ${f(-w * 0.45)},${f(my + h * 0.35)} Z" fill="#E86A5A"/>`;
  const mark = (s, x, y, size, col) => `<text x="${f(x)}" y="${f(y)}" font-family="${HEAD_FONT}" font-size="${f(size)}" fill="${col}" text-anchor="middle" dominant-baseline="central" stroke="${ink}" stroke-width="${f(sw * 0.8)}" paint-order="stroke">${s}</text>`;
  const blink = ((t * 0.5 + 0.2) % 1) < 0.035;

  switch (kind) {
    case 'calm': return arcDown(lx) + arcDown(rx) + smile(mw * 0.6, 0.6);
    case 'laugh': return arcUp(lx) + arcUp(rx) + open(mw * 0.85, mw * 1.25);
    case 'wink': return E1(lx, ey, er, [0, er * 0.1]) + arcUp(rx) + `<path d="M${f(-mw * 0.9)},${f(my - mw * 0.1)} Q${f(mw * 0.1)},${f(my + mw * 0.7)} ${f(mw)},${f(my - mw * 0.25)}" fill="none" ${S(sw)}/>`;
    case 'love': return heart(lx, er * 1.05) + heart(rx, er * 1.05) + smile();
    case 'wow': return star(lx, er * 1.1) + star(rx, er * 1.1) + open(mw * 0.75, mw * 1.1);
    case 'sad': return E2(ey, er, [0, er * 0.28]) + brow(lx, 0.25, -0.3) + brow(rx, 0.25, -0.3) +
      `<path d="M${f(-mw * 0.7)},${f(my + mw * 0.3)} Q0,${f(my - mw * 0.3)} ${f(mw * 0.7)},${f(my + mw * 0.3)}" fill="none" ${S(sw)}/>` +
      `<path d="M${f(lx + er * 0.2)},${f(ey + er * 1.1)} q${f(er * 0.35)},${f(er * 0.6)} 0,${f(er * 0.9)} q${f(-er * 0.35)},${f(-er * 0.3)} 0,${f(-er * 0.9)} Z" fill="#9FD3F5" ${S(sw * 0.5)}/>`;
    case 'angry': return E2(ey, er, [0, er * 0.1], 0.45) + brow(lx, -0.25, 0.4) + brow(rx, -0.25, 0.4) +
      `<rect x="${f(-mw * 0.7)}" y="${f(my - mw * 0.2)}" width="${f(mw * 1.4)}" height="${f(mw * 0.5)}" rx="${f(mw * 0.15)}" fill="#fff" ${S(sw * 0.8)}/>` +
      `<path d="M${f(-mw * 0.7)},${f(my + mw * 0.05)} L${f(mw * 0.7)},${f(my + mw * 0.05)}" ${S(sw * 0.5)}/>`;
    case 'skeptical': return E1(lx, ey, er, [er * 0.15, 0]) + brow(lx, -0.35, -0.6) + E1(rx, ey, er, [er * 0.15, er * 0.1]) + lid(rx, 0.55) +
      `<path d="M${f(-mw * 0.55)},${f(my + mw * 0.12)} L${f(mw * 0.75)},${f(my - mw * 0.08)}" ${S(sw)}/>`;
    case 'sleepy': return shut(lx) + shut(rx) + `<ellipse cx="0" cy="${f(my + mw * 0.1)}" rx="${f(mw * 0.22)}" ry="${f(mw * 0.28)}" fill="${ink}"/>` +
      mark('z', rx + er * 1.8, ey - er * 1.6, er * 1.3, '#fff') + mark('Z', rx + er * 2.9, ey - er * 3, er * 1.8, '#fff');
    case 'confused': return E1(lx, ey, er * 1.12, [er * 0.3, -er * 0.2], 0.4) + E1(rx, ey + er * 0.1, er * 0.72, [-er * 0.15, er * 0.1], 0.5) +
      `<path d="M${f(-mw * 0.7)},${f(my)} q${f(mw * 0.35)},${f(-mw * 0.3)} ${f(mw * 0.7)},0 t${f(mw * 0.7)},0" fill="none" ${S(sw)}/>` +
      mark('?', rx + er * 2.1, ey - er * 1.9, er * 2.2, C.accent || '#E0522F');
    case 'cool': {
      const gw = er * 2.1, gh = er * 1.25;
      return [lx, rx].map(x => `<rect x="${f(x - gw / 2)}" y="${f(ey - gh / 2)}" width="${f(gw)}" height="${f(gh)}" rx="${f(gh * 0.4)}" fill="${ink}"/>` +
        `<rect x="${f(x - gw * 0.32)}" y="${f(ey - gh * 0.25)}" width="${f(gw * 0.28)}" height="${f(gh * 0.18)}" rx="${f(gh * 0.09)}" fill="#fff" opacity="0.6"/>`).join('') +
        `<path d="M${f(lx + gw / 2)},${f(ey - gh * 0.15)} L${f(rx - gw / 2)},${f(ey - gh * 0.15)}" ${S(sw * 0.8)}/>` +
        `<path d="M${f(-mw * 0.7)},${f(my + mw * 0.1)} Q${f(mw * 0.1)},${f(my + mw * 0.45)} ${f(mw * 0.85)},${f(my - mw * 0.15)}" fill="none" ${S(sw)}/>`;
    }
    case 'shock': return E2(ey, er * 1.08, [0, 0], 0.22) + `<ellipse cx="0" cy="${f(my)}" rx="${f(mw * 0.32)}" ry="${f(mw * 0.34)}" fill="${ink}"/>`;
    case 'smug': return E2(ey, er, [er * 0.23, er * 0.08]) +
      `<path d="M${f(lx - er)},${f(ey - er * 0.3)} L${f(lx + er)},${f(ey - er * 0.3)} M${f(rx - er)},${f(ey - er * 0.3)} L${f(rx + er)},${f(ey - er * 0.3)}" ${S(sw)}/>` +
      `<path d="M${f(-mw * 0.77)},${f(my + mw * 0.09)} Q${f(mw * 0.09)},${f(my + mw * 0.5)} ${f(mw * 0.86)},${f(my - mw * 0.05)}" fill="none" ${S(sw)}/>`;
    default: // 'smile'
      return (blink ? shut(lx) + shut(rx) : E2(ey, er, [0, er * 0.12])) + smile();
  }
}

// poses every mascot understands, and the face each one uses unless another is asked for
const POSES = ['happy', 'cheer', 'point', 'think', 'verdict', 'shock', 'calm'];
const POSE_FACE = { happy: 'smile', cheer: 'laugh', point: 'smile', think: 'skeptical', verdict: 'smug', shock: 'shock', calm: 'smile' };
