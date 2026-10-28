// Demo for Cicak Tahu (theme paper, ink props): a prepaid electricity meter, to show the Paket C helpers:
// sticker (sound words), xray (lens through the cover), cutaway (cover lifts off), card + scramble + mono
// (the token as a locked code), and "captions": {"mode": "pill"} in script.json.
Object.assign(C, {
  wood: '#E2C49A', woodD: '#C9A577', shell: '#F6F4EE', back: '#DAD6CD', pcb: '#3E8F5A', trace: '#6FBF85',
  lcd: '#CFE3B5', lcdInk: '#26331F', relay: '#3F7FD0', copper: '#D9864A', gold: '#E8B04B',
});

const rr = (x, y, w, h, r) => `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;
const CODE = '5174 2093 8816 0452 7731';

let K = {};
const ICON = {
  bolt: () => `<path d="M6,-24 L-14,4 L0,4 L-6,24 L14,-6 L0,-6 Z" fill="${C.yellow}" ${stroke(4)}/>`,
  lens: () => `<circle cx="-4" cy="-4" r="14" fill="#fff" ${stroke(4)}/><path d="M6,6 L18,18" ${stroke(6)}/>`,
  open: () => `<rect x="-20" y="-6" width="40" height="26" rx="5" fill="${C.back}" ${stroke(4)}/><path d="M-14,-16 L16,-24" ${stroke(5)}/>`,
  lock: () => `<rect x="-16" y="-4" width="32" height="24" rx="5" fill="${C.yellow}" ${stroke(4)}/><path d="M-9,-4 V-12 A9,9 0 0 1 9,-12 V-4" fill="none" ${stroke(4)}/>`,
};

function setup(D) {
  const s = D.scenes;
  K = { tit: s[0].at('tit'), habis: s[0].at('habis'), s1: s[1].start, intip: s[1].at('intip'), dalam: s[1].at('dalamnya'),
    s2: s[2].start, bedah: s[2].at('bedah'), s3: s[3].start, kode: s[3].at('kode'), kunci: s[3].at('terkunci'),
    meter: s[3].at('meteranmu'), loop: D.total - 1.5 };
  const start = { x: 0, y: -60, z: 1.0 };
  setCamera([start,
    { at: K.s1, dur: 0.9, x: -130, y: -80, z: 1.35 },
    { at: K.s2, dur: 0.8, x: 0, y: -60, z: 1.05 },
    { at: K.s3, dur: 0.8, x: 0, y: -330, z: 0.95 },
    { at: K.loop, dur: 1.1, ...start }]);
  setHeadlines([
    { at: K.habis, end: s[0].end - 0.1, text: 'TOKEN MAU\n*HABIS*!' },
    { at: K.intip, end: s[1].end - 0.1, text: 'INTIP\n*DALAMNYA*' },
    { at: K.bedah, end: s[2].end - 0.1, text: 'KITA *BEDAH*!' },
    { at: K.kode, end: K.loop, text: 'KODE\n*TERKUNCI*' },
  ]);
  setChapters([{ at: 0.3, icon: ICON.bolt }, { at: K.s1, icon: ICON.lens }, { at: K.s2, icon: ICON.open }, { at: K.s3, icon: ICON.lock }]);
}

function cues(D) {
  const c = [[K.tit, 'tick'], [K.tit + 0.18, 'tick'], [K.tit + 0.36, 'tick'], [K.tit, 'pop'], [K.s1, 'whoosh'], [K.dalam, 'pop'],
    [K.s2, 'whoosh'], [K.bedah, 'click'], [K.bedah + 0.05, 'pop'], [K.s3, 'whoosh'], [K.s3 + 0.3, 'pop'],
    [K.meter, 'click'], [K.meter + 0.08, 'pop'], [K.meter + 0.3, 'ding'], [K.loop, 'whoosh']];
  for (let t = K.s3 + 0.4; t < K.kunci + 0.4; t += 0.12) c.push([t, 'tick']);  // the code locking in
  return c;
}

// kWh on the display: low and blinking, topped up once the token opens, then used up again for the loop
function kwh(t) {
  if (t < K.meter + 0.3) return 0.45;
  if (t < K.loop) return lerp(0.45, 32.6, P(t, K.meter + 0.3, 0.9));
  return lerp(32.6, 0.45, P(t, K.loop, 1.3, E.inOutCubic));
}

// ---------- the meter: what is inside, and the cover on top ----------
function inside(t) {
  let s = `<path d="${rr(-260, -380, 520, 560, 30)}" fill="${C.back}" ${stroke()}/>`;
  s += `<path d="${rr(-232, -350, 464, 510, 16)}" fill="${C.pcb}" ${stroke(5)}/>`;
  [[-200, -180, -200, 120, 40, 120], [-60, -180, 40, -180, 40, 140], [150, -170, 150, -110], [-10, 40, 60, 40]].forEach(p =>
    s += `<polyline points="${p.join(',')}" fill="none" stroke="${C.trace}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) s += `<circle cx="${160 + i * 26}" cy="${70 + j * 22}" r="7" fill="${C.gold}" ${stroke(2.5)}/>`;
  // display module, seen through the cover's window
  const low = kwh(t) < 1, blink = low && t > K.habis && Math.floor(t * 4) % 2 === 0;
  s += `<path d="${rr(-210, -320, 270, 110, 8)}" fill="${C.lcd}" ${stroke(5)}/>`;
  s += mono(kwh(t).toFixed(2).replace('.', ','), 20, -268, 66, blink ? '#9DB58A' : C.lcdInk, { anchor: 'end' });
  s += txt('kWh', 36, -232, 18, C.lcdInk, 900);
  // the brain: a chip with pins
  let pins = '';
  for (let k = 0; k < 5; k++) {
    const d = -44 + k * 22;
    pins += `<path d="M${d},-60 V-74 M${d},60 V74 M-60,${d} H-74 M60,${d} H74" ${stroke(5, C.gold)}/>`;
  }
  s += G(T(-90, -60), 1, pins + `<path d="${rr(-60, -60, 120, 120, 10)}" fill="#24242A" ${stroke(5)}/><circle cx="-38" cy="-38" r="8" fill="#55555E"/>`);
  // the switch: a relay with its copper coil
  s += `<path d="${rr(60, -100, 160, 96, 12)}" fill="${C.relay}" ${stroke(5)}/>` + txt('RELAY', 140, -52, 22, '#fff', 900);
  s += `<path d="${rr(92, 4, 96, 92, 8)}" fill="${C.copper}" ${stroke(5)}/>`;
  for (let k = 0; k < 6; k++) s += `<line x1="96" y1="${16 + k * 14}" x2="184" y2="${16 + k * 14}" ${stroke(3, '#A95E2C')}/>`;
  s += `<circle cx="-190" cy="80" r="26" fill="#2F4F8F" ${stroke(5)}/><circle cx="-128" cy="112" r="18" fill="#2F4F8F" ${stroke(5)}/>`;
  return s;
}

function shell(t) {
  const low = kwh(t) < 1, on = Math.floor(t * 4) % 2 === 0;
  // the cover, with a window cut out over the display
  let s = `<path d="${rr(-260, -380, 520, 560, 30)} ${rr(-214, -324, 278, 118, 10)}" fill="${C.shell}" fill-rule="evenodd" ${stroke()}/>`;
  s += `<rect x="-230" y="-370" width="460" height="12" rx="6" fill="${C.leaf}"/>`;
  s += txt('AWAS! SEGEL JANGAN DIRUSAK', -30, -342, 17, C.accent, 900);
  s += `<circle cx="168" cy="-265" r="38" fill="#3A3A40" ${stroke(5)}/><circle cx="168" cy="-265" r="16" fill="#1E1E22"/>`;
  [['KREDIT', low && on ? C.accent : '#C9C3B6'], ['TAMPER', '#C9C3B6'], ['imp/kWh', on ? C.accent : '#C9C3B6']].forEach(([l, col], i) =>
    s += `<circle cx="${-190 + i * 70}" cy="-172" r="10" fill="${col}" ${stroke(3)}/>` + txt(l, -190 + i * 70, -146, 13, C.muted, 800));
  s += txt('kWh METER PRABAYAR', -228, -104, 22, C.ink, 900, 'start') + txt('1 fasa · 2 kawat · STS', -228, -76, 16, C.muted, 800, 'start');
  for (let i = 0, x = -226; x < -50; i++) { const w = 3 + Math.floor(rnd(i) * 7); if (i % 2 === 0) s += `<rect x="${x}" y="30" width="${w}" height="74" fill="${C.ink}"/>`; x += w + 2; }
  s += txt('1234 5678 901', -138, 124, 18, C.ink, 900);
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '↵'].forEach((k, i) => {
    const x = 34 + (i % 3) * 66, y = -130 + Math.floor(i / 3) * 62, red = k === '↵';
    s += `<path d="${rr(x, y, 56, 52, 10)}" fill="${red ? C.accent : '#fff'}" ${stroke(4)}/>` + txt(k, x + 28, y + 28, 26, red ? '#fff' : C.ink, 900);
  });
  return s;
}

function terminals() {
  let s = '';
  [['#D9443A', -150, -40], ['#2B2B30', -50, -14], ['#2F5E9E', 50, 14], ['#2B2B30', 150, 40]].forEach(([col, x, dx]) =>
    s += limb(`M${x},270 C${x},400 ${x + dx},470 ${x + dx},620`, 24, col));
  s += `<path d="${rr(-260, 186, 520, 120, 20)}" fill="#EDEAE3" ${stroke()}/>`;
  [-150, -50, 50, 150].forEach(x => s += `<circle cx="${x}" cy="246" r="20" fill="#fff" ${stroke(5)}/><path d="M${x - 10},246 H${x + 10} M${x},236 V256" ${stroke(4)}/>`);
  return s;
}

function drawWorld(t) {
  let s = `<path d="${rr(-340, -470, 680, 1060, 18)}" fill="${C.wood}" ${stroke()}/>`;
  for (let k = 0; k < 7; k++) s += `<path d="M${-300 + k * 100},-440 q14,500 0,1000" fill="none" ${stroke(3, C.woodD)}/>`;
  s += terminals() + inside(t);
  s += cutaway(t, K.bedah, shell(t), { t1: K.loop, dx: 320, dy: -760, rot: 16, dur: 0.8 });
  s += xray(t, K.dalam, -90, -60, 175, inside(t) + pill('OTAK', -90, 70, 26, C.ink, '#fff', 0.9, P(t, K.dalam + 0.4, 0.3)),
    { t1: K.s2, id: 'lensChip' });
  // labels once the cover is off
  [['LAYAR', -75, -360, 0], ['OTAK', -90, 70, 0.15], ['SAKLAR', 140, -125, 0.3]].forEach(([l, x, y, d]) => {
    const p = pop(t, K.bedah + 0.6 + d, 0.4), o = p.o * (1 - P(t, K.loop, 0.4));
    if (o > 0.01) s += pill(l, x, y, 26, C.ink, '#fff', p.s, o);
  });
  // Si Cicak on the wall beside the meter
  const pose = t < K.tit || t > K.loop + 0.4 ? 'calm' : t < K.s1 ? 'shock' : t < K.s2 ? 'verdict' : t < K.meter ? 'point' : 'cheer';
  s += cicak(-450, 160, 0.5, pose, t, 0);
  return s;
}

// the token as a locked message: 20 digits settle into place, then the meter's own key opens it
function tokenCard(t) {
  const open = t > K.meter, q = P(t, K.meter, 0.3);
  let s = `<path d="${rr(36, 66, 808, 96, 16)}" fill="${C.ink}"/>`;
  s += mono(scramble(CODE, t, K.s3 + 0.3, K.kunci - K.s3), 440, 116, 44, C.yellow, { anchor: 'middle' });
  // padlock: shackle lifts when it opens
  s += G(T(76, 222), 1, `<path d="M-16,-6 V-20 A16,16 0 0 1 16,-20 V${f(-6 - 18 * q)}" transform="translate(0 ${f(-12 * q)})" fill="none" ${stroke(7)}/>` +
    `<rect x="-26" y="-8" width="52" height="42" rx="8" fill="${open ? C.leaf : C.accent}" ${stroke(5)}/>`);
  s += bodyText(open ? 'Terbuka' : 'Terkunci', 124, 208, 40, C.ink, 'start', 900);
  const [bf, bw] = bodyFont(), key = 'kunci khusus meter ', kx = 124 + measure(key, 28, bw, bf);
  if (open) s += `<rect x="${f(kx - 6)}" y="236" width="${f(measure('1234 5678 901', 28, bw, bf) * P(t, K.meter, 0.25) + 12)}" height="34" rx="6" fill="${C.yellow}"/>`;
  s += bodyText(key + '1234 5678 901', 124, 254, 28, C.muted);
  [['ISI', '32,6 kWh', 36], ['DIBUAT', '15-10 · 15:57', 448]].forEach(([l, v, x], i) => {
    s += `<path d="${rr(x, 290, 396, 92, 14)}" fill="${C.bg}" ${stroke(4, C.line)}/>` + txt(l, x + 22, 314, 18, C.muted, 900, 'start', 'letter-spacing="2"');
    s += open ? mono(scramble(v, t, K.meter + 0.1 * i, 0.45, { seed: 5 + i }), x + 22, 352, 34, C.ink)
      : bodyText('???', x + 22, 352, 34, C.muted, 'start', 900);
  });
  return s;
}

function drawOverlay(t) {
  let s = card(t, K.s3 + 0.3, 540, 760, 880, 410, tokenCard(t), { title: 'Token 20 angka', tOut: K.loop - 0.3 });
  s += sticker('TIT-TIT!', t, K.tit, 690, 560, { rot: -10, size: 104, dur: 1.2 });
  s += sticker('KLAK!', t, K.bedah, 760, 640, { rot: 8, size: 110, dur: 0.8, col: C.accent });
  s += sticker('KLIK!', t, K.meter, 760, 1020, { rot: -6, size: 96, dur: 0.9 });
  s += cite('sumber: STS Association, standar IEC 62055-41', t, K.kunci, K.loop - 0.3);
  return s;
}
