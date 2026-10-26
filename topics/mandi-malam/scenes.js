// Topic: Mandi malam bikin rematik? (mitos atau fakta)
Object.assign(C, {
  bean: '#FFB98F', beanCold: '#A9CDEF',
  tile: '#E7EDF2', tileLine: '#D5DEE6', floor: '#C9D3DC',
  purple: '#8E7CF0', bone: '#FFF7E8', mint: '#7FC8A9', smoke: '#A8A39A',
});

// the mascot: a bean with arms and legs
function bean(x, y, o) {
  const col = o.color || C.bean, t = o.t || 0;
  const arms = {
    down: ['M-96,10 Q-140,50 -126,104', 'M96,10 Q140,50 126,104'],
    up: ['M-96,0 Q-150,-40 -136,-112', 'M96,0 Q150,-40 136,-112'],
    hug: ['M-94,18 Q-40,96 44,44', 'M94,18 Q40,96 -44,44'],
  }[o.arms || 'down'];
  let face = '';
  const blink = (o.face === 'normal' || o.face === 'worried') && ((t * 0.55 + 0.3) % 1) < 0.035;
  const eyes = ry => `<ellipse cx="-36" cy="-45" rx="11" ry="${ry}" fill="${C.ink}"/><ellipse cx="36" cy="-45" rx="11" ry="${ry}" fill="${C.ink}"/>` +
    (ry > 6 ? `<circle cx="-32" cy="-51" r="4" fill="#fff"/><circle cx="40" cy="-51" r="4" fill="#fff"/>` : '');
  switch (o.face) {
    case 'worried':
      face = eyes(blink ? 2 : 15) +
        `<path d="M-60,-74 L-20,-88 M60,-74 L20,-88" fill="none" ${stroke(7)}/>` +
        `<ellipse cx="0" cy="4" rx="11" ry="14" fill="${C.ink}"/>`;
      break;
    case 'happy':
      face = `<path d="M-52,-40 Q-36,-64 -20,-40 M20,-40 Q36,-64 52,-40" fill="none" ${stroke(8)}/>` +
        `<path d="M-32,-6 Q0,40 32,-6 Z" fill="${C.ink}"/><path d="M-16,14 Q0,26 16,14 Q0,8 -16,14Z" fill="#E86A5A"/>`;
      break;
    case 'relaxed':
      face = `<path d="M-52,-48 Q-36,-32 -20,-48 M20,-48 Q36,-32 52,-48" fill="none" ${stroke(8)}/>` +
        `<path d="M-24,-4 Q0,20 24,-4" fill="none" ${stroke(7)}/>`;
      break;
    case 'cold':
      face = `<path d="M-54,-60 L-26,-46 L-54,-32 M54,-60 L26,-46 L54,-32" fill="none" ${stroke(8)}/>` +
        `<polyline points="-34,6 -23,-3 -12,6 -1,-3 10,6 21,-3 32,6" fill="none" ${stroke(6)}/>`;
      break;
    default:
      face = eyes(blink ? 2 : 15) + `<path d="M-24,-4 Q0,20 24,-4" fill="none" ${stroke(7)}/>`;
  }
  const cheeks = o.face === 'cold' ? '' :
    `<ellipse cx="-64" cy="-4" rx="17" ry="10" fill="${C.cheek}" opacity="0.45"/><ellipse cx="64" cy="-4" rx="17" ry="10" fill="${C.cheek}" opacity="0.45"/>`;
  const body =
    limb('M-42,120 L-46,168', 18, col) + limb('M42,120 L46,168', 18, col) +
    `<rect x="-100" y="-135" width="200" height="270" rx="100" fill="${col}" ${stroke()}/>` +
    `<ellipse cx="0" cy="58" rx="62" ry="48" fill="#fff" opacity="0.3"/>` +
    cheeks + face + arms.map(d => limb(d, 16, col)).join('');
  return G(T(x, y, o.s || 1, o.rot || 0) + (o.sy ? ` scale(1 ${f(o.sy)})` : ''), o.opacity ?? 1, body);
}

// night bathroom with shower; o tunes temperature, water, mascot
function bathroom(id, t, o) {
  const cold = o.cold || 0, warm = o.warm || 0, water = o.water ?? 1;
  let s = `<rect x="0" y="0" width="1080" height="1920" fill="${C.tile}"/>`;
  for (let x = 140; x <= 940; x += 80) s += `<line x1="${x}" y1="420" x2="${x}" y2="1160" ${stroke(3, C.tileLine)}/>`;
  for (let y = 420; y <= 1160; y += 80) s += `<line x1="140" y1="${y}" x2="940" y2="${y}" ${stroke(3, C.tileLine)}/>`;
  s += `<rect x="140" y="1070" width="800" height="100" fill="${C.floor}"/><line x1="140" y1="1070" x2="940" y2="1070" ${stroke(5)}/>`;

  // window with moon and stars
  s += `<rect x="190" y="470" width="230" height="230" rx="22" fill="${C.night}" ${stroke()}/>`;
  s += `<circle cx="368" cy="526" r="34" fill="${C.yellow}"/><circle cx="386" cy="512" r="30" fill="${C.night}"/>`;
  [[236, 522, 11], [256, 650, 9], [384, 652, 12], [334, 610, 6]].forEach(([x, y, r], i) =>
    s += sparkle(x, y, r * (0.65 + 0.35 * Math.sin(t * 4 + i * 2.1)), C.yellow));
  s += `<line x1="305" y1="470" x2="305" y2="700" ${stroke(6)}/><line x1="190" y1="585" x2="420" y2="585" ${stroke(6)}/>`;
  s += `<rect x="176" y="696" width="258" height="18" rx="9" fill="#fff" ${stroke(5)}/>`;

  // clock spinning through the night
  s += `<circle cx="830" cy="530" r="62" fill="#fff" ${stroke()}/>`;
  for (let k = 0; k < 12; k++) {
    const a = k * Math.PI / 6;
    s += `<line x1="${f(830 + 48 * Math.sin(a))}" y1="${f(530 - 48 * Math.cos(a))}" x2="${f(830 + 54 * Math.sin(a))}" y2="${f(530 - 54 * Math.cos(a))}" ${stroke(k % 3 ? 3 : 5)}/>`;
  }
  const hA = (-30 + t * 10) * Math.PI / 180, mA = (t * 140) * Math.PI / 180;
  s += `<line x1="830" y1="530" x2="${f(830 + 28 * Math.sin(hA))}" y2="${f(530 - 28 * Math.cos(hA))}" ${stroke(8)}/>`;
  s += `<line x1="830" y1="530" x2="${f(830 + 42 * Math.sin(mA))}" y2="${f(530 - 42 * Math.cos(mA))}" ${stroke(5, C.accent)}/>`;
  s += `<circle cx="830" cy="530" r="7" fill="${C.ink}"/>`;

  // thermometer
  if (o.thermo != null) {
    const lv = o.thermo, col = mix(C.cool, C.accent, clamp((lv - 0.2) / 0.5));
    s += `<rect x="256" y="760" width="38" height="236" rx="19" fill="#fff" ${stroke(6)}/>`;
    s += `<rect x="266" y="${f(lerp(985, 776, lv))}" width="18" height="${f(lerp(985, 776, lv) * -1 + 1010)}" rx="9" fill="${col}"/>`;
    s += `<circle cx="275" cy="1010" r="32" fill="${col}" ${stroke(6)}/>`;
    for (let k = 0; k < 6; k++) s += `<line x1="300" y1="${790 + k * 34}" x2="314" y2="${790 + k * 34}" ${stroke(4)}/>`;
  }

  // shower
  const waterCol = cold > 0 ? mix('#8DB8E0', '#2F7FD0', cold) : mix('#8DB8E0', '#F29A62', warm);
  for (let i = 0; i < 30; i++) {
    if (i / 30 >= water) continue;
    const period = 0.5 + 0.25 * rnd(i), ph = (t / period + rnd(i + 50)) % 1;
    const y = 550 + ph * 520, x = 580 + 120 * rnd(i + 99) + (rnd(i + 7) - 0.5) * ph * 170;
    if (cold > 0.4 && i % 4 === 0) s += snowflake(x, y, 11, '#fff', t * 200 + i * 40);
    else s += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(y + 24)}" ${stroke(7, waterCol)}/>`;
  }
  if (warm > 0) {
    for (let k = 0; k < 5; k++) {
      const ph = (t * 0.35 + k / 5) % 1, x = 520 + k * 60 + 20 * Math.sin(t * 2 + k), y = 1040 - ph * 520;
      s += `<path transform="${T(x, y)}" d="M0,0 C-30,-40 30,-70 0,-110 C-24,-140 16,-170 0,-200" fill="none" ${stroke(16, '#fff')} opacity="${f(warm * 0.7 * Math.sin(Math.PI * ph))}"/>`;
    }
  }
  s += `<rect x="630" y="400" width="20" height="104" fill="${C.metal}" ${stroke(6)}/>`;
  s += `<path d="M570,504 L710,504 L684,548 L596,548 Z" fill="${C.metal}" ${stroke(6)}/>`;
  for (let k = 0; k < 5; k++) s += `<circle cx="${606 + k * 17}" cy="534" r="4" fill="${C.ink}"/>`;

  // mascot
  const jit = (o.jitter || 0) * Math.sin(t * 70) * 6;
  s += bean(640 + jit + (o.dx || 0), 935 + (o.dy || 0), {
    t, face: o.face, arms: o.arms, color: o.beanColor, sy: o.sy,
  });
  if (o.tense > 0) {
    const fl = Math.sin(t * 40) > 0 ? 0 : 6;
    [-1, 1].forEach(side => {
      const x0 = 640 + side * 160;
      s += G(T(x0, 900 + fl), o.tense,
        `<polyline points="0,0 ${side * 16},18 0,36 ${side * 16},54 0,72" fill="none" ${stroke(7, C.cool)}/>` +
        `<polyline points="${side * 30},20 ${side * 46},38 ${side * 30},56" fill="none" ${stroke(7, C.cool)}/>`);
    });
  }
  if (o.towel > 0) {
    const ty = lerp(-420, 0, o.towel);
    let towel = `<path d="M-112,58 Q-118,-40 0,-56 Q118,-40 112,58 L104,118 Q92,132 80,118 L78,40 Q0,4 -78,40 L-80,118 Q-92,132 -104,118 Z" fill="${C.mint}" ${stroke(6)}/>`;
    towel += `<path d="M-100,70 Q0,22 100,70 M-102,96 Q0,48 102,96" fill="none" ${stroke(7, '#fff')} opacity="0.85"/>`;
    s += G(T(640, 810 + ty), 1, towel);
  }
  if (o.extra) s += o.extra;
  return panel(id, C.tile, s);
}

// ---------- scenes ----------
// each: draw(t, S) -> svg markup; cues(S) -> [[time, sfx], ...]
// S.at(word, delta) returns the moment that word is spoken.
let QM = [];

const scenes = [
  { // 1. Mandi malam bikin rematik?
    draw(t, S) {
      const enter = pop(t, S.start, 0.5);
      let q = '';
      QM.forEach(([x, y, t0], i) => {
        const p = pop(t, t0, 0.5);
        q += G(T(x, y + 8 * Math.sin(t * 5 + i), p.s, -10 + 20 * (i % 2)), p.o, txt('?', 0, 0, 110, C.accent, 900, 'middle', `stroke="${C.ink}" stroke-width="6" paint-order="stroke"`));
      });
      return bathroom('p1', t, { face: 'worried', arms: 'down', sy: enter.s, extra: q });
    },
    cues: S => QM.map(m => [m[2], 'pop']),
  },
  { // 2. Faktanya, itu mitos!
    draw(t, S) {
      const ts = S.at('mitos');
      const after = t > ts + 0.12;
      const jump = after ? Math.sin(Math.PI * clamp((t - ts - 0.12) / 0.45)) : 0;
      let q = '';
      QM.forEach(([x, y], i) => {
        const out = 1 - P(t, ts, 0.2, E.inCubic);
        q += G(T(x, y + 8 * Math.sin(t * 5 + i), out, -10 + 20 * (i % 2)), out, txt('?', 0, 0, 110, C.accent, 900, 'middle', `stroke="${C.ink}" stroke-width="6" paint-order="stroke"`));
      });
      // stamp slam
      let st = '';
      if (t >= ts - 0.18) {
        const p = t - (ts - 0.18);
        let s, o = 1;
        if (p < 0.18) { s = 2.4 - 1.4 * E.inCubic(p / 0.18); o = clamp(p / 0.08); }
        else { const u = p - 0.18; s = 1 - 0.07 * Math.exp(-9 * u) * Math.sin(24 * u); }
        const w = 620, h = 210;
        st += `<rect x="140" y="420" width="800" height="740" fill="#fff" opacity="${f(0.35 * clamp(p / 0.2))}"/>`;
        if (p > 0.18) {
          const b = clamp((p - 0.18) / 0.4);
          for (let k = 0; k < 12; k++) {
            const a = k * Math.PI / 6 + 0.2, r1 = 300 + 140 * E.outCubic(b), r2 = r1 + 60 * (1 - b);
            st += `<line x1="${f(540 + r1 * Math.cos(a))}" y1="${f(780 + r1 * Math.sin(a) * 0.8)}" x2="${f(540 + r2 * Math.cos(a))}" y2="${f(780 + r2 * Math.sin(a) * 0.8)}" ${stroke(10, C.accent)} opacity="${f(1 - b)}"/>`;
          }
        }
        st += G(T(540, 780, s, -8), o,
          `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="30" fill="#fff" opacity="0.94"/>` +
          `<rect x="${-w / 2 + 14}" y="${-h / 2 + 14}" width="${w - 28}" height="${h - 28}" rx="22" fill="none" stroke="${C.accent}" stroke-width="12"/>` +
          txt('MITOS!', 0, 6, 128, C.accent, 900, 'middle', 'letter-spacing="6"'));
      }
      const shake = t > ts ? 14 * Math.exp(-8 * (t - ts)) * Math.sin((t - ts) * 60) : 0;
      return G(T(shake, shake * 0.4), 1, bathroom('p2', t, {
        face: after ? 'happy' : 'worried', arms: after ? 'up' : 'down', dy: -70 * jump, extra: q + st,
      }));
    },
    cues: S => [[S.at('mitos'), 'thud']],
  },
  { // 3. Rematik adalah penyakit autoimun. Imun tubuh menyerang sendi sendiri.
    draw(t, S) {
      const cx = 540, cy = 790;
      const bonesIn = P(t, S.start + 0.1, 0.6, E.outBack);
      const tAttack = S.at('menyerang'), tCells = S.at('Imun');
      const inflam = P(t, tAttack, 0.8);
      let s = `<rect x="0" y="0" width="1080" height="1920" fill="#FFF3EC"/>`;
      for (let k = 0; k < 9; k++) s += `<circle cx="${180 + (k % 3) * 360}" cy="${470 + Math.floor(k / 3) * 300}" r="5" fill="${C.accentL}"/>`;
      // inflamed glow
      s += `<defs><radialGradient id="glow3"><stop offset="0" stop-color="${C.accent}" stop-opacity="0.75"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient></defs>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${f(260 + 18 * Math.sin(t * 9))}" fill="url(#glow3)" opacity="${f(inflam * (0.75 + 0.25 * Math.sin(t * 9)))}"/>`;
      // joint capsule
      s += `<rect x="380" y="610" width="320" height="360" rx="150" fill="${mix('#E8F2FB', '#FBD3C4', inflam)}" stroke="${mix(C.cool, C.accent, inflam)}" stroke-width="6" stroke-dasharray="18 14" opacity="${f(bonesIn)}"/>`;
      // bones: outline pass, then fill pass, so overlaps merge into one shape
      const femur = (d) => `<g transform="${T(0, -320 * (1 - bonesIn))}">
          <rect x="${478 - d}" y="${380 - d}" width="${124 + 2 * d}" height="${340 + 2 * d}" rx="${30 + d}"/>
          <circle cx="490" cy="${725}" r="${62 + d}"/><circle cx="590" cy="${725}" r="${62 + d}"/></g>`;
      const tibia = (d) => `<g transform="${T(0, 320 * (1 - bonesIn))}">
          <rect x="${440 - d}" y="${826 - d}" width="${200 + 2 * d}" height="${66 + 2 * d}" rx="${30 + d}"/>
          <rect x="${484 - d}" y="${860 - d}" width="${112 + 2 * d}" height="${340 + 2 * d}" rx="${24 + d}"/></g>`;
      s += `<g fill="${C.ink}">${femur(7)}${tibia(7)}</g><g fill="${C.bone}">${femur(0)}${tibia(0)}</g>`;
      s += `<g transform="${T(0, -320 * (1 - bonesIn))}"><path d="M432,742 Q540,812 648,742" fill="none" ${stroke(14, mix('#9FD0F0', '#F08A6A', inflam))}/></g>`;
      s += `<g transform="${T(0, 320 * (1 - bonesIn))}"><path d="M446,826 Q540,806 634,826" fill="none" ${stroke(14, mix('#9FD0F0', '#F08A6A', inflam))}/></g>`;
      // label
      const lab = pop(t, S.start + 0.7, 0.4);
      s += G(T(250, 640, lab.s), lab.o,
        `<rect x="-90" y="-36" width="180" height="72" rx="36" fill="#fff" ${stroke(6)}/>` + txt('SENDI', 0, 2, 38, C.ink));
      s += `<line x1="330" y1="660" x2="420" y2="720" ${stroke(6)} opacity="${f(lab.o)}"/>`;
      // immune cells
      const starts = [[60, 470], [1020, 520], [40, 860], [1040, 900], [280, 1220], [820, 1230]];
      starts.forEach(([sx, sy], i) => {
        const t0 = tCells + i * 0.09;
        if (t < t0) return;
        const a = (i / starts.length) * Math.PI * 2 + 0.5;
        const jab = t > tAttack ? 30 * Math.max(0, Math.sin(t * 10 + i * 1.7)) : 0;
        const R = 200 - jab;
        const tx = cx + R * Math.cos(a), ty = cy + R * Math.sin(a) * 1.1;
        const q = P(t, t0, 0.7);
        const x = lerp(sx, tx, q), y = lerp(sy, ty, q) - 60 * Math.sin(Math.PI * q);
        const look = Math.atan2(cy - y, cx - x);
        const ex = 6 * Math.cos(look), ey = 6 * Math.sin(look);
        s += G(T(x, y, 1, 6 * Math.sin(t * 8 + i)), 1,
          `<circle r="40" fill="${C.purple}" ${stroke(6)}/>` +
          `<circle cx="-14" cy="-4" r="9" fill="#fff"/><circle cx="14" cy="-4" r="9" fill="#fff"/>` +
          `<circle cx="${f(-14 + ex * 0.6)}" cy="${f(-4 + ey * 0.6)}" r="5" fill="${C.ink}"/><circle cx="${f(14 + ex * 0.6)}" cy="${f(-4 + ey * 0.6)}" r="5" fill="${C.ink}"/>` +
          `<path d="M-26,-20 L-6,-12 M26,-20 L6,-12" fill="none" ${stroke(6)}/>` +
          `<path d="M-10,18 Q0,10 10,18" fill="none" ${stroke(5)}/>`);
        if (jab > 24) {
          const hx = cx + 120 * Math.cos(a), hy = cy + 120 * Math.sin(a) * 1.1;
          s += sparkle(hx, hy, 26, C.yellow) + sparkle(hx, hy, 14, '#fff');
        }
      });
      return panel('p3', '#FFF3EC', s) + tab('PENYAKIT AUTOIMUN', t, S.at('autoimun'));
    },
    cues: S => [[S.at('autoimun'), 'pop'], [S.start + 0.7, 'tick'],
      ...[0, 1, 2, 3, 4, 5].map(i => [S.at('Imun') + i * 0.09 + 0.55, 'tick']), [S.at('menyerang') + 0.1, 'thud']],
  },
  { // 4. Pemicunya genetik, usia, merokok, dan obesitas. Bukan jam mandi.
    draw(t, S) {
      const tb = S.at('Bukan');
      const dim = 1 - 0.7 * P(t, tb, 0.3);
      let s = `<rect x="0" y="0" width="1080" height="1920" fill="#FBF8F3"/>`;
      const tiles = [
        ['Genetik', S.at('genetik'), dna], ['Usia', S.at('usia'), hourglass],
        ['Merokok', S.at('merokok'), cigarette], ['Obesitas', S.at('obesitas'), scale],
      ];
      tiles.forEach(([label, t0, icon], i) => {
        const x = 170 + (i % 2) * 382, y = 470 + Math.floor(i / 2) * 340;
        const p = pop(t, t0, 0.5);
        s += G(T(x + 179, y + 160, p.s), p.o * dim,
          `<rect x="-179" y="-150" width="358" height="310" rx="34" fill="#fff" ${stroke(6)}/>` +
          G(T(0, -30), 1, icon(t, t0)) + txt(label, 0, 112, 46, C.ink));
      });
      // "not bath time": shower crossed out
      const c = pop(t, tb, 0.45);
      if (c.o > 0) {
        const xq = P(t, tb + 0.25, 0.25, E.inOutCubic);
        let ic = `<circle r="170" fill="#fff" ${stroke(8)}/>`;
        ic += `<rect x="-10" y="-120" width="20" height="60" fill="${C.metal}" ${stroke(6)}/><path d="M-60,-60 L60,-60 L38,-24 L-38,-24Z" fill="${C.metal}" ${stroke(6)}/>`;
        for (let k = 0; k < 9; k++) {
          const ph = (t * 1.6 + rnd(k)) % 1, x = -40 + 80 * rnd(k + 3), y = -10 + ph * 120;
          ic += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(y + 20)}" ${stroke(7, '#8DB8E0')}/>`;
        }
        const L = 300;
        ic += `<path d="M-106,-106 L106,106" fill="none" ${stroke(30, C.accent)} stroke-dasharray="${L}" stroke-dashoffset="${f(L * (1 - xq))}"/>`;
        ic += `<path d="M106,-106 L-106,106" fill="none" ${stroke(30, C.accent)} stroke-dasharray="${L}" stroke-dashoffset="${f(L * (1 - P(t, tb + 0.4, 0.25, E.inOutCubic)))}"/>`;
        s += G(T(540, 790, c.s), c.o, ic);
      }
      return panel('p4', '#FBF8F3', s) + tab('PEMICU REMATIK', t, S.start + 0.15, C.ink);
    },
    cues: S => [[S.start + 0.15, 'pop'], ...['genetik', 'usia', 'merokok', 'obesitas'].map(w => [S.at(w), 'pop']),
      [S.at('Bukan'), 'pop'], [S.at('Bukan') + 0.3, 'thud']],
  },
  { // 5. Tapi air dingin bisa bikin otot tegang dan sendi terasa kaku.
    draw(t, S) {
      const cold = P(t, S.at('dingin') - 0.25, 0.7, E.inOutCubic);
      const tense = P(t, S.at('otot'), 0.3);
      let ex = '';
      const tk = S.at('kaku');
      [[490, 800], [800, 860], [470, 1000], [820, 1020]].forEach(([x, y], i) => {
        const p = pop(t, tk + i * 0.07, 0.4);
        ex += G(T(x, y, p.s), p.o, snowflake(0, 0, 26, C.cool, t * 30 + i * 20) + snowflake(0, 0, 14, '#fff', t * 30));
      });
      return bathroom('p5', t, {
        cold, thermo: lerp(0.62, 0.1, cold), jitter: cold, tense,
        beanColor: mix(C.bean, C.beanCold, cold), face: cold > 0.5 ? 'cold' : 'normal', arms: cold > 0.5 ? 'hug' : 'down',
        extra: ex,
      }) + tab('AIR DINGIN', t, S.start + 0.2, C.cool, C.white, S.end - 0.1);
    },
    cues: S => [[S.start + 0.2, 'pop'], [S.at('dingin'), 'sparkle'], [S.at('otot'), 'tick'], [S.at('kaku'), 'sparkle']],
  },
  { // 6. Tipsnya: pakai air hangat, lalu segera keringkan badan.
    draw(t, S) {
      const warm = P(t, S.at('hangat') - 0.3, 0.8, E.inOutCubic);
      const tk = S.at('keringkan');
      const towel = P(t, tk - 0.1, 0.55, E.outBack);
      const water = 1 - P(t, tk - 0.2, 0.4);
      let ex = '';
      if (t > tk + 0.4) {
        [[500, 760, 22], [790, 800, 18], [760, 1000, 14], [480, 960, 16]].forEach(([x, y, r], i) => {
          const p = pop(t, tk + 0.4 + i * 0.08, 0.4);
          ex += G(T(x, y, p.s * (0.7 + 0.3 * Math.sin(t * 6 + i))), p.o, sparkle(0, 0, r, C.yellow));
        });
      }
      return bathroom('p6', t, {
        cold: 1 - warm, warm: warm * water, water, thermo: lerp(0.1, 0.78, warm), towel,
        jitter: Math.max(0, 1 - warm * 1.6),
        beanColor: mix(C.beanCold, C.bean, warm), face: towel > 0.6 ? 'happy' : warm > 0.5 ? 'relaxed' : 'cold',
        arms: warm > 0.5 ? 'down' : 'hug', extra: ex,
      }) + tab('TIPS', t, S.start + 0.12);
    },
    cues: S => [[S.start + 0.12, 'pop'], [S.at('hangat'), 'sparkle'], [S.at('keringkan'), 'whoosh'], [S.at('keringkan') + 0.4, 'ding']],
  },
  { // 7. Sendi sering nyeri dan bengkak? Periksa ke dokter. Follow untuk fakta lainnya!
    draw(t, S) {
      const kx = 520, ky = 760;
      const legIn = P(t, S.start + 0.05, 0.6);
      const tn = S.at('nyeri'), tb = S.at('bengkak'), tp = S.at('Periksa'), tf = S.at('Follow');
      let s = `<rect x="0" y="0" width="1080" height="1920" fill="#FFF3EC"/>`;
      let leg = limb(`M150,560 L${kx},${ky} L360,1020`, 110, C.bean) + limb('M360,1020 L500,1040', 84, C.bean);
      // swelling
      const sw = P(t, tb, 0.6, E.outBack);
      if (sw > 0) {
        leg += `<circle cx="${kx}" cy="${ky}" r="${f(sw * (78 + 6 * Math.sin(t * 10)))}" fill="${C.accent}" opacity="0.4"/>`;
        leg += `<circle cx="${kx}" cy="${ky}" r="${f(sw * 42)}" fill="${C.accent}" opacity="0.55"/>`;
      }
      // pain bolts
      if (t > tn) {
        const on = Math.sin(t * 24) > -0.3;
        for (let k = 0; k < 6; k++) {
          const a = -1.2 + k * 0.5, r1 = 105, r2 = 165;
          const x1 = kx + r1 * Math.cos(a), y1 = ky + r1 * Math.sin(a), x2 = kx + r2 * Math.cos(a), y2 = ky + r2 * Math.sin(a);
          const mx = (x1 + x2) / 2 + 14 * Math.sin(a), my = (y1 + y2) / 2 - 14 * Math.cos(a);
          leg += `<polyline points="${f(x1)},${f(y1)} ${f(mx)},${f(my)} ${f(x2)},${f(y2)}" fill="none" ${stroke(9, C.accent)} opacity="${on ? 1 : 0.35}"/>`;
        }
      }
      s += G(T(-500 * (1 - legIn), 0), 1, leg);
      // doctor clipboard + stethoscope
      const dc = P(t, tp, 0.55, E.outBack);
      if (t > tp) {
        let d = `<rect x="-115" y="-155" width="230" height="310" rx="26" fill="#C98B5A" ${stroke(6)}/>`;
        d += `<rect x="-94" y="-128" width="188" height="262" rx="14" fill="#fff" ${stroke(5)}/>`;
        d += `<rect x="-44" y="-172" width="88" height="40" rx="12" fill="${C.metal}" ${stroke(5)}/>`;
        d += `<rect x="-16" y="-104" width="32" height="88" rx="8" fill="${C.accent}"/><rect x="-44" y="-76" width="88" height="32" rx="8" fill="${C.accent}"/>`;
        [20, 58, 96].forEach((y, i) => {
          const ck = P(t, tp + 0.5 + i * 0.18, 0.25);
          d += `<path d="M-66,${y} l12,12 l22,-24" fill="none" ${stroke(7, C.cool)} stroke-dasharray="60" stroke-dashoffset="${f(60 * (1 - ck))}"/>`;
          d += `<line x1="-20" y1="${y}" x2="${f(-20 + 90 * ck)}" y2="${y}" ${stroke(8, '#D9D3C7')}/>`;
        });
        s += G(T(lerp(1200, 780, dc), 700, 1, lerp(20, 6, dc)), 1, d);
        s += G(T(lerp(1200, 780, dc), 0), 1,
          `<path d="M-30,860 C-30,960 90,960 70,1030" fill="none" ${stroke(12)}/>` +
          `<circle cx="70" cy="1048" r="30" fill="${C.metal}" ${stroke(6)}/><circle cx="70" cy="1048" r="12" fill="#fff"/>`);
      }
      // follow button + cursor
      let fl = '';
      if (t > tf - 0.05) {
        const b = pop(t, tf - 0.05, 0.45);
        const tc = tf + 0.6;
        const press = t > tc ? 1 - 0.1 * Math.sin(Math.PI * clamp((t - tc) / 0.18)) : 1;
        const done = t > tc + 0.08;
        const label = done ? '✓ FOLLOWED' : 'FOLLOW +';
        const w = 440, h = 120;
        fl += `<rect x="0" y="0" width="1080" height="1920" fill="#FFF3EC" opacity="${f(0.7 * P(t, tf - 0.05, 0.3))}"/>`;
        fl += G(T(540, 800, b.s * press), b.o,
          `<rect x="${-w / 2 + 8}" y="${-h / 2 + 10}" width="${w}" height="${h}" rx="${h / 2}" fill="${C.ink}" opacity="0.15"/>` +
          `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${done ? C.accent : C.ink}" ${stroke(6)}/>` +
          txt(label, 0, 3, 52, '#fff', 900, 'middle', 'letter-spacing="2"'));
        if (done) {
          const r = P(t, tc + 0.08, 0.6);
          fl += `<circle cx="610" cy="820" r="${f(30 + 200 * r)}" fill="none" ${stroke(8, C.accent)} opacity="${f(1 - r)}"/>`;
        }
        const cq = P(t, tf + 0.1, 0.5, E.inOutCubic);
        const cxp = lerp(980, 610, cq), cyp = lerp(1150, 820, cq);
        fl += G(T(cxp, cyp, t > tc && t < tc + 0.18 ? 0.88 : 1, -12), b.o,
          `<path d="M0,0 L0,92 L24,70 L42,108 L60,99 L42,62 L74,62 Z" fill="#fff" ${stroke(6)}/>`);
      }
      return panel('p7', '#FFF3EC', s + fl) + tab('CEK KE DOKTER', t, tp);
    },
    cues: S => [[S.at('nyeri'), 'tick'], [S.at('bengkak'), 'pop'], [S.at('Periksa'), 'whoosh'], [S.at('Periksa') + 0.1, 'pop'],
      [S.at('Follow') - 0.05, 'pop'], [S.at('Follow') + 0.6, 'click'], [S.at('Follow') + 0.68, 'ding']],
  },
];

// trigger icons for scene 4 (drawn around 0,0)
function dna(t) {
  let s = '', a = '', b = '';
  for (let y = -96; y <= 96; y += 6) {
    const ph = y * 0.035 + t * 2.6, x = 46 * Math.sin(ph);
    a += `${f(x)},${y} `; b += `${f(-x)},${y} `;
    if ((y + 96) % 24 === 0) s += `<line x1="${f(x)}" y1="${y}" x2="${f(-x)}" y2="${y}" ${stroke(5, C.ink)} opacity="${f(0.35 + 0.35 * Math.abs(Math.cos(ph)))}"/>`;
  }
  return s + `<polyline points="${a}" fill="none" ${stroke(11, C.accent)}/><polyline points="${b}" fill="none" ${stroke(11, C.cool)}/>`;
}
function hourglass(t) {
  const c = (t * 0.4) % 1, a = 1 - c;
  const yt = lerp(-6, -82, a), wt = 6 + 40 * (-yt / 94);
  const yb = lerp(90, 40, c), wb = lerp(4, 42, c);
  let s = `<path d="M-48,-94 L48,-94 L8,0 L48,94 L-48,94 L-8,0 Z" fill="#EAF3FB" ${stroke(6)}/>`;
  s += `<polygon points="${f(-wt)},${f(yt)} ${f(wt)},${f(yt)} 0,-4" fill="${C.sand}"/>`;
  s += `<polygon points="${f(-wb)},90 ${f(wb)},90 0,${f(yb)}" fill="${C.sand}"/>`;
  if (c > 0.02 && c < 0.97) s += `<line x1="0" y1="-2" x2="0" y2="${f(yb)}" ${stroke(4, C.sand)}/>`;
  s += `<rect x="-64" y="-112" width="128" height="20" rx="10" fill="${C.ink}"/><rect x="-64" y="92" width="128" height="20" rx="10" fill="${C.ink}"/>`;
  return s;
}
function cigarette(t) {
  let s = '';
  for (let j = 0; j < 3; j++) {
    const ph = (t * 0.55 + j / 3) % 1;
    s += `<path transform="${T(78 + 10 * Math.sin(t * 2 + j), -2 - ph * 30)}" d="M0,0 C-20,-20 20,-34 0,-56 C-16,-72 12,-84 0,-96" fill="none" ${stroke(11, C.smoke)} opacity="${f(0.6 * Math.sin(Math.PI * ph))}"/>`;
  }
  const glow = 0.7 + 0.3 * Math.sin(t * 13);
  s += G(T(0, 30, 1, -10), 1,
    `<rect x="-120" y="-18" width="200" height="36" rx="8" fill="#fff" ${stroke(6)}/>` +
    `<rect x="-120" y="-18" width="64" height="36" rx="8" fill="#F0A35E" ${stroke(6)}/>` +
    `<rect x="72" y="-18" width="26" height="36" rx="8" fill="#FF6A3D" opacity="${f(glow)}" ${stroke(6)}/>`);
  return s;
}
function scale(t, t0) {
  const ang = lerp(-80, 62, E.outElastic(clamp((t - t0 - 0.2) / 1.4)));
  const a = ang * Math.PI / 180;
  let s = `<rect x="-96" y="-82" width="192" height="164" rx="34" fill="#F1F1F1" ${stroke(6)}/>`;
  s += `<path d="M-60,-6 A60,60 0 0 1 60,-6 Z" fill="#fff" ${stroke(5)}/>`;
  s += `<path d="M30,-58 A60,60 0 0 1 60,-6 L42,-6 A42,42 0 0 0 21,-42 Z" fill="${C.accentL}"/>`;
  s += `<line x1="0" y1="-6" x2="${f(48 * Math.sin(a))}" y2="${f(-6 - 48 * Math.cos(a))}" ${stroke(7, C.accent)}/><circle cx="0" cy="-6" r="7" fill="${C.ink}"/>`;
  s += txt('kg', 0, 40, 30, C.muted, 800);
  return s;
}

function setup(D) {
  const S0 = D.scenes[0];
  QM = [[470, 760, S0.start + 0.35], [810, 720, S0.at('bikin')], [650, 680, S0.at('rematik')]];
}
