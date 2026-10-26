// Channel art for Cicak Tahu, drawn with the same engine as the videos (loaded into engine/index.html).
//   renderAvatar()  800x800 profile picture (shown as a circle, down to ~98 px)
//   renderBanner()  2560x1440 YouTube banner; text and mascot stay inside the 1546x423 safe area

async function setupCanvas(w, h) {
  const svg = document.getElementById('v');
  svg.setAttribute('width', w); svg.setAttribute('height', h); svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  ['bg', 'glow', 'vig', 'tex'].forEach(id => {
    const el = document.getElementById(id);
    el.setAttribute('width', w); el.setAttribute('height', h);
  });
  Object.assign(C, PAPER);
  document.getElementById('bg').setAttribute('fill', C.bg);
  document.getElementById('tex').setAttribute('href', paperTexture(w, h, 11));
  ['tex', 'glow', 'vig'].forEach(id => document.getElementById(id).removeAttribute('display'));
  const faces = await Promise.all([`900 72px ${FONT}`, `72px "${HEAD_FONT}"`, '700 40px Caveat'].map(q => document.fonts.load(q)));
  await document.fonts.ready;
  if (!faces.every(f => f.length)) throw new Error('fonts did not load');
}

function put(world, ui = '') {
  document.getElementById('world').innerHTML = world;
  document.getElementById('ui').innerHTML = ui;
}

function rays(cx, cy, r, n, fill, opacity) {
  let s = '';
  for (let k = 0; k < n; k += 2) {
    const a0 = k / n * Math.PI * 2, a1 = a0 + Math.PI * 2 / n;
    s += `<path d="M${cx},${cy} L${f(cx + r * Math.cos(a0))},${f(cy + r * Math.sin(a0))} L${f(cx + r * Math.cos(a1))},${f(cy + r * Math.sin(a1))} Z" fill="${fill}" opacity="${opacity}"/>`;
  }
  return s;
}

// small doodles of the topics the channel covers
const DOODLE = {
  bolt: `<path d="M10,-40 L-24,6 L-2,6 L-12,40 L24,-8 L2,-8 Z" fill="${'#F5B83D'}" ${stroke(6)}/>`,
  drop: `<path d="M0,-40 C22,-10 30,4 30,16 A30,30 0 0 1 -30,16 C-30,4 -22,-10 0,-40 Z" fill="#6FA8DC" ${stroke(6)}/>`,
  cactus: `<path d="M-14,40 L-14,-30 A14,14 0 0 1 14,-30 L14,40 Z" fill="#6FA85A" ${stroke(6)}/>` +
    `<path d="M-14,4 L-30,4 L-30,-14" fill="none" ${stroke(18)}/><path d="M-14,4 L-30,4 L-30,-14" fill="none" ${stroke(8, '#6FA85A')}/>` +
    `<path d="M14,-6 L30,-6 L30,-22" fill="none" ${stroke(18)}/><path d="M14,-6 L30,-6 L30,-22" fill="none" ${stroke(8, '#6FA85A')}/>`,
  kite: `<path d="M0,-40 L30,-6 L0,46 L-30,-6 Z" fill="#E0522F" ${stroke(6)}/><path d="M0,-40 L30,-6 L0,-6 Z M0,-6 L-30,-6 L0,46 Z" fill="#2F5E9E"/><path d="M0,-40 L30,-6 L0,46 L-30,-6 Z" fill="none" ${stroke(6)}/>`,
  avocado: `<path d="M0,-42 C18,-42 26,-24 30,-6 C36,18 36,42 0,44 C-36,42 -36,18 -30,-6 C-26,-24 -18,-42 0,-42 Z" fill="#3E6B2B" ${stroke(6)}/>` +
    `<path d="M0,-32 C14,-32 20,-18 23,-4 C28,16 28,34 0,36 C-28,34 -28,16 -23,-4 C-20,-18 -14,-32 0,-32 Z" fill="#C9E38F"/><circle cx="0" cy="16" r="13" fill="#8A5A3B" ${stroke(4)}/>`,
  question: `<text x="0" y="6" font-family="${HEAD_FONT}" font-size="96" fill="#E0522F" text-anchor="middle" dominant-baseline="central" stroke="#1F1B16" stroke-width="10" paint-order="stroke">?</text>`,
  bulb: `<circle cx="0" cy="-8" r="30" fill="#FFE27A" ${stroke(6)}/><rect x="-14" y="20" width="28" height="20" rx="4" fill="#B9C3CC" ${stroke(5)}/>` +
    `<path d="M-10,-6 L0,6 L10,-6" fill="none" ${stroke(4)}/>`,
};

async function renderAvatar() {
  await setupCanvas(800, 800);
  let s = `<rect width="800" height="800" fill="#F5B83D"/>` + rays(400, 430, 900, 24, '#FAD27A', 0.75);
  s += `<circle cx="400" cy="400" r="380" fill="none" stroke="#fff" stroke-width="12" opacity="0.55"/>`;
  s += cicak(400, 690, 2.35, 'happy', 1.3, -6);
  put(s);
}

async function renderBanner() {
  const W = 2560, H = 1440;
  await setupCanvas(W, H);
  let s = `<rect width="${W}" height="${H}" fill="${C.bg}"/>`;
  for (let x = 0; x <= W; x += 64) s += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" ${stroke(2, '#D6E2EC')} opacity="0.6"/>`;
  for (let y = 0; y <= H; y += 64) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" ${stroke(2, '#D6E2EC')} opacity="0.6"/>`;
  s += rays(1460, 720, 1800, 36, '#F5D27A', 0.4);
  // Si Cicak's footprints trailing in from the left
  for (let k = 0; k < 9; k++) {
    const u = k / 9, x = 40 + u * 520, y = 1180 - 360 * Math.sin(u * Math.PI / 2) + (k % 2 ? 26 : -26);
    s += G(T(x, y, 1, -30 + u * 20), 0.35, [-1, 0, 1].map(d => `<circle cx="${d * 9}" cy="${-Math.abs(d) * 4 - 8}" r="5" fill="#1F1B16"/>`).join('') + `<circle r="9" fill="#1F1B16"/>`);
  }
  // topic doodles, mostly outside the safe area so they only decorate
  [['bolt', 300, 260, 1.6, -12], ['drop', 2260, 300, 1.5, 10], ['question', 2330, 1130, 1.5, 12], ['cactus', 2110, 1200, 1.6, -6],
   ['kite', 420, 520, 1.4, 18], ['avocado', 2380, 640, 1.4, -14], ['bulb', 1080, 230, 1.4, 8], ['bolt', 1880, 1250, 1.2, 20]]
    .forEach(([k, x, y, sc, r]) => s += G(T(x, y, sc, r), 1, DOODLE[k]));
  [[640, 330, 26], [1820, 230, 22], [2050, 470, 18], [1200, 1230, 22], [180, 760, 20]].forEach(([x, y, r]) => s += sparkle(x, y, r, '#F5B83D'));
  s += cicak(770, 712, 0.82, 'happy', 1.3, -16);
  let ui = titleText('CICAK *TAHU*', 1470, 660, 210, 1060, 28);
  ui += hand('Cicak di dinding tahu semuanya. Sekarang kamu juga.', 1470, 812, 60, C.ink);
  ui += pill('FAKTA UNIK', 1270, 892, 32, C.accent) + pill('MITOS ATAU FAKTA?', 1650, 892, 32, C.ink);
  put(s, ui);
}
