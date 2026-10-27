// Demo for the Stickman channel (theme notebook, doodle props): how often the heart beats.
// Props follow the mascot's style: wobbly pen lines that re-draw 8x a second, marker fills off the line.
const PEN = '#26262E';

// pen stroke through points, slightly different 8 times a second (line boil)
function doodle(pts, t, seed, w = 7, col = PEN, closed = false) {
  const boil = Math.floor(t * 8), j = i => (rnd(boil * 131 + seed + i) - 0.5) * 5;
  const d = o => 'M' + pts.map(([x, y], i) => `${f(x + j(i * 2 + o))},${f(y + j(i * 2 + 1 + o))}`).join(' L') + (closed ? 'Z' : '');
  return `<path d="${d(0)}" fill="none" ${stroke(w, col)}/><path d="${d(500)}" fill="none" ${stroke(w * 0.3, col)} opacity="0.45"/>`;
}
const heartPts = (cx, cy, k) => [...Array(48)].map((_, i) => {
  const u = i / 48 * Math.PI * 2;
  return [cx + k * 16 * Math.sin(u) ** 3, cy - k * (13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u))];
});
const beat = t => { const ph = (t * 1.2) % 1; return Math.exp(-ph * 9) + 0.5 * Math.exp(-Math.max(0, ph - 0.18) * 12) * (ph > 0.18 ? 1 : 0); };

let K = {};
const ICON = {
  heart: () => `<path d="M0,16 C-26,-4 -18,-24 0,-10 C18,-24 26,-4 0,16 Z" fill="#E8505B" ${stroke(4)}/>`,
  moon: () => `<path d="M6,-22 A22,22 0 1 0 6,22 A16,16 0 1 1 6,-22 Z" fill="${C.yellow}" ${stroke(4)}/>`,
  body: () => `<circle cx="0" cy="-16" r="8" fill="none" ${stroke(4)}/><path d="M0,-8 L0,12 M-14,0 L14,0 M0,12 L-10,26 M0,12 L10,26" fill="none" ${stroke(4)}/>`,
};

function setup(D) {
  const s = D.scenes;
  K = { n: s[0].at('100.000'), s2: s[1].start, tidur: s[1].at('tidur'), s2e: s[1].end,
    s3: s[2].start, tubuh: s[2].at('seluruh'), loop: D.total - 1.2 };
  const start = { x: 0, y: -200, z: 1.0 };
  setCamera([start, { at: K.s2, dur: 1.0, x: -140, y: -150, z: 0.95 }, { at: K.s3, dur: 1.0, x: 120, y: -170, z: 0.92 }, { at: K.loop, dur: 1.1, ...start }]);
  setHeadlines([
    { at: K.n, end: s[0].end - 0.1, text: '*100.000* KALI\nSEHARI' },
    { at: K.tidur, end: K.s2e - 0.1, text: 'bahkan saat\n*tidur*' },
    { at: K.tubuh, end: K.loop, text: 'ke *seluruh* tubuh' },
  ]);
  setChapters([{ at: 0.3, icon: ICON.heart }, { at: K.s2, icon: ICON.moon }, { at: K.s3, icon: ICON.body }]);
}

function cues(D) {
  const c = [[K.n, 'pop'], [K.s2, 'whoosh'], [K.tidur, 'chirp'], [K.s3, 'whoosh'], [K.tubuh, 'sparkle'], [K.loop, 'whoosh']];
  for (let t = 0.2; t < D.total; t += 1 / 1.2) c.push([t, 'tick']);  // the heartbeat
  return c;
}

function drawWorld(t) {
  let s = '';
  // the beating heart: red marker fill off the line, pen outline, little motion marks
  const k = 11 * (1 + 0.09 * beat(t));
  s += `<path d="M${heartPts(14, -360, k).map(p => p.map(f).join(',')).join(' L')}Z" fill="#F07A80" opacity="0.9"/>`;
  s += doodle(heartPts(0, -370, k), t, 1, 8, PEN, true);
  s += doodle([[-30, -440], [-10, -400], [30, -440]].map(([x, y]) => [x - 40, y]), t, 40, 4, '#fff');
  if (beat(t) > 0.5) s += doodle([[-230, -470], [-262, -496]], t, 60, 5) + doodle([[230, -470], [262, -496]], t, 70, 5) +
    doodle([[-250, -360], [-292, -360]], t, 80, 5) + doodle([[250, -360], [292, -360]], t, 90, 5);
  // scrolling ECG line
  const ecg = [];
  for (let x = -400; x <= 400; x += 10) {
    const ph = ((x + t * 300) / 250) % 1, p = ph < 0 ? ph + 1 : ph;
    ecg.push([x, -120 - (p > 0.45 && p < 0.5 ? 90 : p > 0.5 && p < 0.55 ? -50 : p > 0.7 && p < 0.8 ? 18 : 0)]);
  }
  s += doodle(ecg, t, 100, 5, '#E0522F');
  // the counter
  if (t > K.n) {
    const v = Math.round(100000 * P(t, K.n, 1.2, E.outCubic));
    s += hand(`${v.toLocaleString('id-ID')}× / hari`, 0, -10, 76, PEN);
    s += burst(t, K.n, 0, -10, { n: 10, r: 120, col: C.accent, dur: 0.5, size: 9 });
  }
  // asleep: moon and Zz, the heart keeps going
  if (t > K.s2 - 0.3 && t < K.s3 + 0.6) {
    const o = P(t, K.s2 - 0.3, 0.5) * (1 - P(t, K.s3, 0.5));
    s += G('', o, `<path d="M-430,-420 A60,60 0 1 0 -430,-300 A44,44 0 1 1 -430,-420 Z" fill="#FFE27A" opacity="0.9"/>` +
      doodle([[-430, -420], [-470, -400], [-490, -360], [-470, -320], [-430, -300], [-452, -330], [-458, -360], [-452, -390], [-430, -420]], t, 200, 5) +
      hand('zZ', -330, -440, 64, PEN));
  }
  // the body with blood going round
  if (t > K.s3 - 0.2) {
    const o = P(t, K.s3 - 0.2, 0.5) * (1 - P(t, K.loop, 0.6));
    let b = doodle([[380, -520], [340, -500], [330, -460], [350, -420], [380, -410], [410, -420], [430, -460], [420, -500], [380, -520]], t, 300, 6);
    b += doodle([[380, -410], [380, -200], [330, -60]], t, 320, 6) + doodle([[380, -200], [430, -60]], t, 330, 6) +
      doodle([[300, -330], [380, -360], [460, -330]], t, 340, 6);
    const loop = [...Array(40)].map((_, i) => { const u = i / 40 * Math.PI * 2; return [380 + 70 * Math.sin(u), -280 + 170 * Math.cos(u)]; });
    for (let i = 0; i < 10; i++) {
      const [x, y] = loop[Math.floor(((t * 0.8 + i / 10) % 1) * 40)];
      b += `<circle cx="${f(x)}" cy="${f(y)}" r="9" fill="${i % 2 ? '#2F6FB5' : '#E0522F'}"/>`;
    }
    s += G('', o, b);
  }
  // Stickman: points at the heart, sleeps through scene 2, wows at the end
  if (t > K.s2 && t < K.s3) s += stickman(-250, 150, 0.8, 'calm', t, -90, null, 'sleepy');
  else s += stickman(-300, 40, 0.85, t > K.loop + 0.4 || t < K.n ? 'think' : 'point', t, 0, null,
    t > K.s3 && t < K.loop ? 'wow' : t < K.n ? 'confused' : 'smile');
  return s;
}

function drawOverlay(t) {
  return cite('sumber: American Heart Association (60–100 detak/menit saat istirahat)', t, K.n + 0.4, K.s2 - 0.1);
}
