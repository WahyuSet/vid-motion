// Topic: 5 fakta unik alpukat
Object.assign(C, {
  skin: '#3E6B2B', flesh: '#C9E38F', fleshIn: '#EEF2A6', seed: '#8A5A3B', seedHi: '#B88559',
  ripe: '#3A2B30', leaf: '#5FA548', wood: '#9B6B43', ground: '#CFE3A8',
  banana: '#F6D04D', blue: '#4C5FD7', blueD: '#2B3580', grape: '#8E5BB5',
  bird: '#57C4A6', birdBelly: '#F7E37A', beak: '#F29A3B',
  paleG: '#EEF5DF', paleY: '#FBF4DF', sky: '#E6F1F8', paleR: '#FCEAE4',
});

// pear-shaped avocado outline, centred on 0,0 (about 220 x 305)
const AVO = 'M0,-150 C52,-150 74,-96 88,-30 C104,46 112,150 0,155 C-112,150 -104,46 -88,-30 C-74,-96 -52,-150 0,-150 Z';

// the mascot: a halved avocado with the seed as its belly
function alpu(x, y, o = {}) {
  const t = o.t || 0, sk = C.skin, ey = -46;
  const wave = 14 * Math.sin(t * 10);
  const arms = {
    down: ['M-86,0 Q-128,40 -116,96', 'M86,0 Q128,40 116,96'],
    up: ['M-86,-10 Q-140,-50 -126,-120', 'M86,-10 Q140,-50 126,-120'],
    wave: ['M-86,0 Q-128,40 -116,96', `M86,-10 Q140,-50 ${f(128 + wave)},-122`],
  }[o.arms || 'down'];
  const blink = ((t * 0.55 + 0.3) % 1) < 0.035;
  const eyes = ry => `<ellipse cx="-30" cy="${ey}" rx="10" ry="${ry}" fill="${C.ink}"/><ellipse cx="30" cy="${ey}" rx="10" ry="${ry}" fill="${C.ink}"/>` +
    (ry > 6 ? `<circle cx="-26" cy="${ey - 6}" r="4" fill="#fff"/><circle cx="34" cy="${ey - 6}" r="4" fill="#fff"/>` : '');
  let face;
  switch (o.face) {
    case 'happy':
      face = `<path d="M-44,${ey + 6} Q-30,${ey - 16} -16,${ey + 6} M16,${ey + 6} Q30,${ey - 16} 44,${ey + 6}" fill="none" ${stroke(7)}/>` +
        `<path d="M-24,-22 Q0,14 24,-22 Z" fill="${C.ink}"/>`;
      break;
    case 'shock':
      face = `<circle cx="-30" cy="${ey}" r="17" fill="#fff" ${stroke(5)}/><circle cx="30" cy="${ey}" r="17" fill="#fff" ${stroke(5)}/>` +
        `<circle cx="-30" cy="${ey}" r="7" fill="${C.ink}"/><circle cx="30" cy="${ey}" r="7" fill="${C.ink}"/>` +
        `<ellipse cx="0" cy="-8" rx="12" ry="16" fill="${C.ink}"/>`;
      break;
    case 'cool':
      face = `<rect x="-60" y="${ey - 16}" width="52" height="30" rx="12" fill="${C.ink}"/><rect x="8" y="${ey - 16}" width="52" height="30" rx="12" fill="${C.ink}"/>` +
        `<line x1="-8" y1="${ey - 6}" x2="8" y2="${ey - 6}" ${stroke(6)}/><rect x="-50" y="${ey - 10}" width="14" height="6" rx="3" fill="#fff" opacity="0.6"/>` +
        `<path d="M-16,-16 Q6,0 22,-22" fill="none" ${stroke(7)}/>`;
      break;
    default:
      face = eyes(blink ? 2 : 14) + `<path d="M-20,-20 Q0,0 20,-20" fill="none" ${stroke(7)}/>`;
  }
  const cheeks = `<ellipse cx="-56" cy="-22" rx="13" ry="8" fill="${C.cheek}" opacity="0.5"/><ellipse cx="56" cy="-22" rx="13" ry="8" fill="${C.cheek}" opacity="0.5"/>`;
  const body =
    limb('M-36,140 L-40,186', 18, sk) + limb('M36,140 L40,186', 18, sk) +
    `<path d="${AVO}" fill="${sk}" ${stroke()}/>` +
    `<path d="${AVO}" transform="translate(0 10) scale(0.84)" fill="${C.flesh}"/>` +
    `<path d="${AVO}" transform="translate(0 34) scale(0.62)" fill="${C.fleshIn}" opacity="0.8"/>` +
    `<circle cx="0" cy="66" r="50" fill="${C.seed}" ${stroke(6)}/><ellipse cx="-16" cy="48" rx="15" ry="9" fill="${C.seedHi}"/>` +
    cheeks + face + arms.map(d => limb(d, 15, sk)).join('');
  return G(T(x, y, o.s || 1, o.rot || 0) + (o.sy ? ` scale(1 ${f(o.sy)})` : ''), o.opacity ?? 1, body);
}

function wholeAvo(x, y, s, col = C.skin, rot = 0) {
  return G(T(x, y, s, rot), 1,
    `<path d="M0,-150 Q6,-180 22,-192" fill="none" ${stroke(10 / s, C.wood)}/>` +
    `<path d="${AVO}" fill="${col}" ${stroke(7 / s)}/>` +
    `<ellipse cx="-42" cy="-30" rx="16" ry="48" fill="#fff" opacity="0.2" transform="rotate(14 -42 -30)"/>`);
}

function halfAvo(x, y, s) {
  return G(T(x, y, s), 1,
    `<path d="${AVO}" fill="${C.skin}" ${stroke(7 / s)}/>` +
    `<path d="${AVO}" transform="translate(0 10) scale(0.84)" fill="${C.flesh}"/>` +
    `<path d="${AVO}" transform="translate(0 34) scale(0.62)" fill="${C.fleshIn}" opacity="0.8"/>` +
    `<circle cx="0" cy="66" r="50" fill="${C.seed}" ${stroke(6 / s)}/>`);
}

function banana(x, y, s, rot = 0) {
  return G(T(x, y, s, rot), 1,
    `<path d="M-110,-40 Q-20,110 110,-60 Q120,-50 116,-38 Q-6,30 -98,-26 Z" fill="${C.banana}" ${stroke(7 / s)}/>` +
    `<path d="M-60,4 Q0,40 70,-12" fill="none" ${stroke(5 / s, '#E2B53A')}/>` +
    `<path d="M110,-56 L128,-80" fill="none" ${stroke(14 / s, C.wood)}/><circle cx="-106" cy="-34" r="${f(7 / s)}" fill="${C.ink}"/>`);
}

function blueberry(x, y, r) {
  const k = r * 0.28;
  let star = '';
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
    star += `${f(k * Math.cos(a))},${f(-r * 0.4 + k * Math.sin(a))} ${f(k * 0.4 * Math.cos(a + 0.63))},${f(-r * 0.4 + k * 0.4 * Math.sin(a + 0.63))} `;
  }
  return G(T(x, y), 1, `<circle r="${r}" fill="${C.blue}" ${stroke(6)}/><polygon points="${star}" fill="${C.blueD}"/>` +
    `<ellipse cx="${-r * 0.4}" cy="${r * 0.1}" rx="${r * 0.14}" ry="${r * 0.28}" fill="#fff" opacity="0.35"/>`);
}

function grape(x, y, r) {
  return G(T(x, y), 1, `<path d="M0,${-r} Q4,${-r - 22} 18,${-r - 30}" fill="none" ${stroke(7, C.wood)}/>` +
    `<circle r="${r}" fill="${C.grape}" ${stroke(6)}/>` +
    `<ellipse cx="${-r * 0.4}" cy="${-r * 0.2}" rx="${r * 0.14}" ry="${r * 0.3}" fill="#fff" opacity="0.4"/>`);
}

function tree(x, y, s, t) {
  const blobs = [[0, -300, 130], [-130, -240, 100], [130, -240, 100], [-80, -380, 95], [85, -380, 95], [0, -200, 105]];
  let g = `<path d="M-34,0 Q-20,-90 -26,-200 L26,-200 Q20,-90 34,0 Z" fill="${C.wood}" ${stroke(7)}/>`;
  g += blobs.map(([bx, by, r]) => `<circle cx="${bx}" cy="${by}" r="${r + 7}" fill="${C.ink}"/>`).join('');
  g += blobs.map(([bx, by, r]) => `<circle cx="${bx}" cy="${by}" r="${r}" fill="${C.leaf}"/>`).join('');
  g += [[-60, -330, 30], [70, -280, 26], [-120, -220, 22], [20, -420, 20]].map(([bx, by, r]) =>
    `<circle cx="${bx}" cy="${by}" r="${r}" fill="#7CBF5E"/>`).join('');
  [[-90, -190], [60, -170], [130, -300], [-30, -260]].forEach(([ax, ay], i) =>
    g += wholeAvo(ax, ay + 4 * Math.sin(t * 2 + i), 0.2, C.skin, 6 * Math.sin(t * 2 + i)));
  return G(T(x, y, s), 1, g);
}

function bird(x, y, s, o = {}) {
  const t = o.t || 0, flap = 10 * Math.sin(t * 14);
  let b = `<path d="M-56,26 L-140,60 L-116,16 Z" fill="${C.bird}" ${stroke(6)}/>`;
  b += limb('M-6,60 L-10,96', 4, C.beak) + limb('M24,60 L26,96', 4, C.beak);
  b += `<ellipse rx="80" ry="70" fill="${C.bird}" ${stroke(7)}/>`;
  b += `<ellipse cx="18" cy="22" rx="46" ry="40" fill="${C.birdBelly}"/>`;
  b += `<path d="M18,-66 Q26,-100 44,-74" fill="none" ${stroke(8, C.bird)}/>`;
  b += G(`rotate(${f(o.worried ? flap * 2 : flap * 0.4)} -40 0)`, 1,
    `<path d="M-60,-6 Q-14,-34 18,4 Q-16,44 -60,20 Z" fill="${mix(C.bird, '#000000', 0.18)}" ${stroke(6)}/>`);
  b += `<path d="M62,-22 Q102,-10 66,6 Z" fill="${C.beak}" ${stroke(5)}/>`;
  if (o.worried) {
    b += `<circle cx="38" cy="-24" r="12" fill="#fff" ${stroke(4)}/><circle cx="40" cy="-22" r="5" fill="${C.ink}"/>`;
    b += `<path d="M22,-48 L52,-40" fill="none" ${stroke(6)}/>`;
    b += `<path d="M96,-60 q8,14 0,22 q-8,-8 0,-22Z" fill="${C.coolL}" ${stroke(4)}/>`;
  } else {
    b += `<circle cx="38" cy="-24" r="9" fill="${C.ink}"/><circle cx="41" cy="-28" r="3" fill="#fff"/>`;
  }
  return G(T(x, y, s, o.rot || 0), 1, b);
}

function warningSign(x, y, s) {
  return G(T(x, y, s), 1,
    `<path d="M0,-82 L86,66 L-86,66 Z" fill="${C.yellow}" ${stroke(9)}/>` +
    `<rect x="-9" y="-36" width="18" height="62" rx="9" fill="${C.ink}"/><circle cx="0" cy="44" r="10" fill="${C.ink}"/>`);
}

// number badge used as each fact's tab
const factTab = (n, t, t0, fill = C.ink) => tab(`FAKTA #${n}`, t, t0, fill);

const scenes = [
  { // Lima fakta unik alpukat yang jarang orang tahu!
    draw(t, S) {
      let s = `<rect width="1080" height="1920" fill="${C.paleG}"/>`;
      for (let k = 0; k < 16; k++) {
        const a0 = (k / 16) * Math.PI * 2 + t * 0.25, a1 = a0 + Math.PI / 16;
        if (k % 2) continue;
        s += `<path d="M540,790 L${f(540 + 900 * Math.cos(a0))},${f(790 + 900 * Math.sin(a0))} L${f(540 + 900 * Math.cos(a1))},${f(790 + 900 * Math.sin(a1))} Z" fill="#E1EECB"/>`;
      }
      s += wholeAvo(260, 640 + 12 * Math.sin(t * 2.2), 0.32, C.skin, -14);
      s += wholeAvo(840, 1000 + 12 * Math.sin(t * 2.2 + 2), 0.28, C.skin, 16);
      const e = pop(t, S.start + 0.05, 0.55);
      s += alpu(540, 810 + 6 * Math.sin(t * 5), { t, face: 'happy', arms: 'wave', s: e.s, opacity: e.o });
      const b = pop(t, S.at('Lima'), 0.5);
      s += G(T(790, 600, b.s, -8 + 4 * Math.sin(t * 3)), b.o,
        `<circle r="86" fill="${C.accent}" ${stroke(7)}/>` + txt('5', 0, -12, 92, '#fff') + txt('FAKTA', 0, 46, 28, '#fff', 900, 'middle', 'letter-spacing="2"'));
      for (let i = 0; i < 26; i++) {
        const t0 = S.at('unik') + rnd(i) * 0.4;
        if (t < t0) continue;
        const ph = (t - t0) * (0.35 + 0.2 * rnd(i + 9));
        const x = 160 + 760 * rnd(i + 3) + 30 * Math.sin(t * 3 + i), y = 400 + ph * 900;
        const col = [C.accent, C.yellow, C.leaf, C.blue][i % 4];
        s += `<rect x="-9" y="-5" width="18" height="10" rx="3" fill="${col}" transform="${T(x, y, 1, t * 300 + i * 40)}"/>`;
      }
      return panel('a1', C.paleG, s) + tab('ALPUKAT', t, S.start + 0.3, C.skin);
    },
    cues: S => [[S.start + 0.05, 'pop'], [S.start + 0.3, 'tick'], [S.at('Lima'), 'pop'], [S.at('unik'), 'sparkle']],
  },
  { // Satu. Secara botani, alpukat termasuk buah beri berbiji satu.
    draw(t, S) {
      const tb = S.at('beri'), ts = S.at('berbiji');
      let s = `<rect width="1080" height="1920" fill="${C.paleY}"/>`;
      // bracket + label over the berry family
      const br = P(t, tb + 0.15, 0.4);
      if (br > 0) {
        const L = 820;
        s += `<path d="M240,700 Q240,640 290,640 L790,640 Q840,640 840,700" fill="none" ${stroke(6)} stroke-dasharray="${L}" stroke-dashoffset="${f(L * (1 - br))}"/>`;
      }
      const lb = pop(t, tb + 0.35, 0.45);
      s += pill('KELUARGA BERI', 540, 640, 34, C.accent, '#fff', lb.s, lb.o);
      const b1 = pop(t, tb, 0.45), b2 = pop(t, tb + 0.12, 0.45);
      s += G(T(270, 930 + 6 * Math.sin(t * 4), b1.s), b1.o, blueberry(0, 0, 60) + txt('Blueberry', 0, 100, 32, C.muted, 800));
      s += G(T(810, 930 + 6 * Math.sin(t * 4 + 1), b2.s), b2.o, grape(0, 0, 60) + txt('Anggur', 0, 100, 32, C.muted, 800));
      s += alpu(540, 840, { t, s: 0.92, face: t > tb ? 'happy' : 'default', arms: t > tb ? 'up' : 'down' });
      // the single seed
      if (t > ts) {
        const r = pop(t, ts, 0.4);
        const seedY = 840 + 66 * 0.92;
        s += G(T(540, seedY, r.s, t * 40), r.o,
          `<circle r="${f(64 + 4 * Math.sin(t * 8))}" fill="none" stroke="${C.accent}" stroke-width="9" stroke-dasharray="22 14"/>`);
        s += pill('1 BIJI', 540, 1088, 38, C.ink, '#fff', r.s, r.o);
      }
      return panel('a2', C.paleY, s) + factTab(1, t, S.start + 0.1);
    },
    cues: S => [[S.start + 0.1, 'pop'], [S.at('beri'), 'pop'], [S.at('beri') + 0.12, 'pop'], [S.at('beri') + 0.35, 'tick'], [S.at('berbiji'), 'pop']],
  },
  { // Dua. Alpukat tidak matang di pohon. Ia baru matang setelah dipetik.
    draw(t, S) {
      const tn = S.at('tidak'), tf = S.at('setelah') - 0.1, tp = S.at('dipetik');
      let s = `<rect width="1080" height="1920" fill="${C.sky}"/>`;
      s += `<rect x="0" y="1100" width="1080" height="100" fill="${C.ground}"/><line x1="0" y1="1100" x2="1080" y2="1100" ${stroke(5)}/>`;
      s += limb('M100,530 Q540,470 980,540', 24, C.wood);
      [[200, 512, -150], [410, 488, -30], [640, 490, -150], [860, 520, -20]].forEach(([x, y, r], i) =>
        s += `<path transform="${T(x, y, 1, r + 6 * Math.sin(t * 2 + i))}" d="M0,0 Q40,-30 90,0 Q40,30 0,0Z" fill="${C.leaf}" ${stroke(5)}/>`);
      // calendar flipping while the fruit hangs
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL'];
      const flipT = Math.min(t, tf) - S.start;
      const m = months[Math.max(0, Math.floor(flipT * 2.2)) % months.length];
      s += G(T(280, 930), 1,
        `<rect x="-95" y="-100" width="190" height="200" rx="20" fill="#fff" ${stroke(6)}/>` +
        `<path d="M-95,-50 L-95,-80 Q-95,-100 -75,-100 L75,-100 Q95,-100 95,-80 L95,-50 Z" fill="${C.accent}" ${stroke(6)}/>` +
        `<line x1="-45" y1="-118" x2="-45" y2="-84" ${stroke(8)}/><line x1="45" y1="-118" x2="45" y2="-84" ${stroke(8)}/>` +
        txt(m, 0, 26, 64, C.ink));
      // hanging avocados; the middle one gets picked and drops into the bowl
      [[400, 0], [560, 1], [760, 2]].forEach(([x, i]) => {
        const sway = 5 * Math.sin(t * 2.4 + i);
        const hangY = 660;
        if (i === 1 && t > tf) {
          const q = clamp((t - tf) / 0.45);
          const x2 = lerp(x, 700, E.outCubic(q)), y2 = lerp(hangY, 1010, E.inCubic(q));
          const land = t > tf + 0.45 ? Math.sin(Math.PI * clamp((t - tf - 0.45) / 0.2)) : 0;
          const col = mix(C.skin, C.ripe, P(t, tp, 0.6));
          s += wholeAvo(x2, y2 - 18 * land, 0.42, col, lerp(0, 20, q));
          return;
        }
        s += `<line x1="${x}" y1="${f(510 - (x - 540) * 0.02)}" x2="${f(x + sway)}" y2="${hangY - 66}" ${stroke(7, C.wood)}/>`;
        s += wholeAvo(x + sway, hangY, 0.42, C.skin, sway);
      });
      // bowl
      s += `<path d="M570,1020 Q570,1110 700,1110 Q830,1110 830,1020 Z" fill="${C.wood}" ${stroke(7)}/>`;
      s += `<line x1="560" y1="1020" x2="840" y2="1020" ${stroke(9)}/>`;
      const u = pop(t, tn, 0.4), uo = 1 - P(t, tf, 0.25);
      s += pill('BELUM MATANG', 560, 790, 32, C.ink, '#fff', u.s, u.o * uo);
      const r = pop(t, tp + 0.35, 0.45);
      s += pill('MATANG!', 700, 880, 40, C.accent, '#fff', r.s, r.o);
      if (t > tp + 0.35) {
        [[600, 960, 18], [810, 950, 22], [760, 870, 12]].forEach(([x, y, rr], i) =>
          s += sparkle(x, y, rr * r.s * (0.7 + 0.3 * Math.sin(t * 7 + i)), C.yellow));
      }
      return panel('a3', C.sky, s) + factTab(2, t, S.start + 0.1);
    },
    cues: S => [[S.start + 0.1, 'pop'], [S.at('tidak'), 'pop'], [S.at('setelah') - 0.1, 'whoosh'], [S.at('setelah') + 0.35, 'thud'], [S.at('dipetik') + 0.35, 'sparkle']],
  },
  { // Tiga. Kaliumnya lebih tinggi daripada pisang!
    draw(t, S) {
      const ta = S.at('Kaliumnya'), tb = S.at('pisang');
      const base = 960, maxH = 330;
      let s = `<rect width="1080" height="1920" fill="${C.paleY}"/>`;
      for (let y = base - 100; y >= base - 400; y -= 100) s += `<line x1="220" y1="${y}" x2="860" y2="${y}" ${stroke(3, C.line)} stroke-dasharray="10 12"/>`;
      const bar = (cx, val, col, p, label) => {
        const h = maxH * val / 485 * p;
        let g = '';
        if (h > 1) g += `<path d="M${cx - 90},${base} L${cx - 90},${f(base - h + 26)} Q${cx - 90},${f(base - h)} ${cx - 64},${f(base - h)} L${cx + 64},${f(base - h)} Q${cx + 90},${f(base - h)} ${cx + 90},${f(base - h + 26)} L${cx + 90},${base} Z" fill="${col}" ${stroke(6)}/>`;
        if (p > 0) g += txt(`${Math.round(val * p)} mg`, cx, base - h - 40, 50, C.ink);
        return g;
      };
      s += bar(390, 485, C.leaf, P(t, ta, 1.1), 'Alpukat');
      s += bar(690, 358, C.banana, P(t, tb, 0.8), 'Pisang');
      s += `<line x1="200" y1="${base}" x2="880" y2="${base}" ${stroke(7)}/>`;
      // crown for the winner
      const cr = pop(t, tb + 0.85, 0.5);
      s += G(T(390, base - maxH - 108 + 4 * Math.sin(t * 4), cr.s, -8), cr.o,
        `<path d="M-50,30 L-56,-24 L-24,4 L0,-36 L24,4 L56,-24 L50,30 Z" fill="${C.yellow}" ${stroke(6)}/>`);
      s += alpu(390, 1040, { t, s: 0.3, face: t > tb + 0.85 ? 'happy' : 'default' });
      s += banana(690, 1040, 0.62, -6);
      s += txt('Kalium per 100 g  ·  data USDA', 540, 1132, 28, C.muted, 800);
      return panel('a4', C.paleY, s) + factTab(3, t, S.start + 0.1);
    },
    cues: S => [[S.start + 0.1, 'pop'], [S.at('Kaliumnya'), 'tick'], [S.at('pisang'), 'tick'], [S.at('pisang') + 0.85, 'sparkle']],
  },
  { // Empat. Semua alpukat Hass di dunia berasal dari satu pohon di California.
    draw(t, S) {
      const th = S.at('Hass'), tw = S.at('dunia'), t1 = S.at('satu'), tc = S.at('California');
      let s = `<rect width="1080" height="1920" fill="${C.sky}"/>`;
      // descendants all over the world, linked back to the mother tree
      const spots = [[230, 520], [400, 500], [700, 500], [870, 560], [200, 700], [900, 740], [220, 880], [880, 920]];
      spots.forEach(([x, y], i) => {
        const t0 = tw + i * 0.06;
        if (t < t0) return;
        const q = P(t, t0, 0.4), p = pop(t, t0 + 0.2, 0.4);
        s += `<line x1="540" y1="720" x2="${f(lerp(540, x, q))}" y2="${f(lerp(720, y, q))}" ${stroke(5, C.skin)} stroke-dasharray="4 12" opacity="0.7"/>`;
        s += G(T(x, y + 5 * Math.sin(t * 3 + i), p.s), p.o, wholeAvo(0, 0, 0.2, C.skin, 10 * Math.sin(t * 2 + i)));
      });
      s += `<rect x="0" y="1040" width="1080" height="200" fill="${C.ground}"/><line x1="0" y1="1040" x2="1080" y2="1040" ${stroke(5)}/>`;
      const grow = P(t, S.start + 0.1, 0.7, E.outBack);
      s += G(`translate(540 1040) scale(${f(grow)}) translate(-540 -1040)`, 1, tree(540, 1040, 0.85, t));
      const one = pop(t, t1, 0.45);
      s += pill('1 POHON INDUK', 540, 560, 36, C.accent, '#fff', one.s, one.o);
      const sg = pop(t, tc, 0.45);
      s += G(T(820, 1040, sg.s), sg.o,
        `<rect x="-8" y="-120" width="16" height="120" fill="${C.wood}" ${stroke(5)}/>` +
        `<rect x="-110" y="-200" width="220" height="96" rx="14" fill="#fff" ${stroke(6)}/>` +
        txt('CALIFORNIA', 0, -168, 30, C.ink) + txt('1926', 0, -130, 28, C.muted, 800));
      const a = pop(t, th, 0.45);
      s += alpu(255, 960, { t, s: 0.5 * a.s, opacity: a.o, face: 'cool', arms: 'wave' });
      return panel('a5', C.sky, s) + factTab(4, t, S.start + 0.1);
    },
    cues: S => [[S.start + 0.1, 'pop'], [S.at('Hass'), 'pop'], [S.at('dunia'), 'sparkle'], [S.at('satu'), 'pop'], [S.at('California'), 'pop']],
  },
  { // Lima. Alpukat beracun bagi burung peliharaan.
    draw(t, S) {
      const tr = S.at('beracun');
      const scared = t > tr;
      let s = `<rect width="1080" height="1920" fill="${C.paleR}"/>`;
      // perch
      s += limb('M180,1000 L560,1000', 18, C.wood);
      const hop = scared ? 0 : Math.abs(Math.sin(t * 5)) * 18;
      const shiver = scared ? 4 * Math.sin(t * 60) : 0;
      s += bird(370 + shiver, 900 - hop, 1.2, { t, worried: scared, rot: scared ? -10 : 0 });
      s += halfAvo(760, 900, 0.62);
      const no = pop(t, tr + 0.1, 0.45);
      s += G(T(760, 900, no.s), no.o,
        `<circle r="125" fill="none" stroke="${C.accent}" stroke-width="22"/>` +
        `<line x1="-88" y1="-88" x2="88" y2="88" stroke="${C.accent}" stroke-width="22" stroke-linecap="round"/>`);
      const w = pop(t, tr, 0.5);
      s += G(T(540, 615 + 6 * Math.sin(t * 6), w.s, 4 * Math.sin(t * 8) * w.o), w.o, warningSign(0, 0, 0.9));
      return panel('a6', C.paleR, s) + factTab(5, t, S.start + 0.1, C.accent);
    },
    cues: S => [[S.start + 0.1, 'pop'], [S.at('beracun'), 'thud'], [S.at('beracun') + 0.1, 'pop']],
  },
  { // Fakta nomor berapa yang bikin kamu kaget? Tulis di komentar, dan follow ya!
    draw(t, S) {
      const tk = S.at('kaget'), tc = S.at('komentar'), tf = S.at('follow');
      let s = `<rect width="1080" height="1920" fill="${C.paleG}"/>`;
      const bubbles = [];
      for (let i = 0; i < 5; i++) {
        const a = i * 2 * Math.PI / 5 + t * 0.5 - Math.PI / 2;
        const p = pop(t, S.start + 0.1 + i * 0.08, 0.45);
        const col = [C.accent, C.leaf, C.blue, C.yellow, C.grape][i];
        bubbles.push({ z: Math.sin(a), g: G(T(540 + 300 * Math.cos(a), 800 + 230 * Math.sin(a), p.s * (0.9 + 0.1 * Math.sin(a))), p.o,
          `<circle r="54" fill="${col}" ${stroke(7)}/>` + txt(String(i + 1), 0, 2, 58, '#fff')) });
      }
      bubbles.filter(b => b.z < 0).forEach(b => s += b.g);
      const jump = t > tk ? Math.sin(Math.PI * clamp((t - tk) / 0.4)) * 50 : 0;
      s += alpu(540, 830 - jump, { t, s: 0.85, face: t > tk ? 'shock' : 'default', arms: t > tk ? 'up' : 'down' });
      bubbles.filter(b => b.z >= 0).forEach(b => s += b.g);
      // comment bubble with typing dots
      const cb = pop(t, tc, 0.45);
      let dots = '';
      for (let k = 0; k < 3; k++) dots += `<circle cx="${-40 + k * 40}" cy="${f(-6 * Math.max(0, Math.sin(t * 8 - k)))}" r="11" fill="${C.ink}"/>`;
      s += G(T(780, 560, cb.s), cb.o,
        `<path d="M-110,-60 L110,-60 Q140,-60 140,-30 L140,30 Q140,60 110,60 L-40,60 L-80,100 L-74,60 L-110,60 Q-140,60 -140,30 L-140,-30 Q-140,-60 -110,-60 Z" fill="#fff" ${stroke(7)}/>` + dots);
      s += followButton(t, tf, C.paleG, 800);
      return panel('a7', C.paleG, s) + tab('KOMEN DI BAWAH!', t, tc - 0.1, C.accent);
    },
    cues: S => [[S.start + 0.1, 'pop'], [S.at('kaget'), 'pop'], [S.at('komentar'), 'pop'], ...followCues(S.at('follow'))],
  },
];
