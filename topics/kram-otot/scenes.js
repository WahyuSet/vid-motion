// Topic: Kenapa kram otot bisa terjadi tiba-tiba? (Channel: Stickman, Theme: notebook / doodle)
const PEN = '#26262E';

// pen stroke through points, slightly different 8 times a second (line boil)
function doodle(pts, t, seed, w = 7, col = PEN, closed = false) {
  const boil = Math.floor(t * 8), j = i => (rnd(boil * 131 + seed + i) - 0.5) * 5;
  const d = o => 'M' + pts.map(([x, y], i) => `${f(x + j(i * 2 + o))},${f(y + j(i * 2 + 1 + o))}`).join(' L') + (closed ? 'Z' : '');
  return `<path d="${d(0)}" fill="none" ${stroke(w, col)}/><path d="${d(500)}" fill="none" ${stroke(w * 0.3, col)} opacity="0.45"/>`;
}

function doodleArc(cx, cy, r, a0, a1, t, seed, w = 7, col = PEN, steps = 18) {
  const pts = [];
  for (let k = 0; k <= steps; k++) {
    const a = a0 + (a1 - a0) * (k / steps);
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return doodle(pts, t, seed, w, col, false);
}

// zigzag lightning doodle
function doodleBolt(pts, t, seed, col = C.accent, w = 8) {
  return doodle(pts, t, seed, w, col) + doodle(pts, t, seed + 100, w * 0.4, '#fff');
}

let K = {};
const ICON = {
  shock: () => `<path d="M4,-22 L-10,0 L2,0 L-6,22 L14,-2 L2,-2 Z" fill="${C.accent}" ${stroke(4)}/>`,
  muscle: () => `<path d="M-22,-8 Q0,-18 22,-8 Q26,8 0,16 Q-26,8 -22,-8 Z" fill="#F07A80" ${stroke(4)}/>`,
  ion: () => `<circle r="18" fill="${C.yellow}" ${stroke(4)}/><path d="M-8,0 L8,0 M0,-8 L0,8" fill="none" ${stroke(5, PEN)}/>`,
  water: () => `<path d="M0,-20 C-14,0 -16,14 0,22 C16,14 14,0 0,-20 Z" fill="${C.cool}" ${stroke(4)}/>`,
  stretch: () => `<path d="M-18,12 L0,-12 L18,12" fill="none" ${stroke(5, PEN)}/><path d="M-6,-18 L12,-18 L12,0" fill="none" ${stroke(4, C.accent)}/>`,
};

function setup(D) {
  const s = D.scenes;
  K = {
    s1: s[0].start, kram: s[0].at('kram'),
    s2: s[1].start, batu: s[1].at('batu'), kok: s[1].at('kok'),
    s3: s[2].start, serabut: s[2].at('serabut'),
    s4: s[3].start, saraf: s[3].at('saraf'), kunci: s[3].at('mengunci'),
    s5: s[4].start, rileks: s[4].at('rileks'), elektrolit: s[4].at('elektrolit'),
    s6: s[5].start, lelah: s[5].at('kelelahan'), mineral: s[5].at('mineral'),
    s7: s[6].start, macet: s[6].at('macet'), lepas: s[6].at('lepas'),
    s8: s[7].start, tarik: s[7].at('tarik'), lutut: s[7].at('lutut'),
    s9: s[8].start, aman: s[8].at('aman'),
    s10: s[9].start, tidur: s[9].at('tidur'),
    loop: D.total - 1.4,
  };

  const home = { x: 0, y: -180, z: 1.0 };
  setCamera([
    home,
    { at: K.kram - 0.2, dur: 0.6, x: -60, y: -140, z: 1.15 },
    { at: K.s2 + 0.3, dur: 0.8, x: -100, y: -160, z: 1.1 },
    { at: K.s3, dur: 0.9, x: 80, y: -220, z: 1.05 },
    { at: K.s4 + 0.2, dur: 0.8, x: 120, y: -240, z: 1.18 },
    { at: K.s5, dur: 0.9, x: 0, y: -200, z: 1.08 },
    { at: K.s6, dur: 0.8, x: -40, y: -190, z: 1.05 },
    { at: K.s7, dur: 0.6, x: 50, y: -230, z: 1.25 },
    { at: K.s8, dur: 0.9, x: -120, y: -120, z: 1.05 },
    { at: K.s9, dur: 0.8, x: 0, y: -180, z: 1.0 },
    { at: K.loop, dur: 1.2, ...home },
  ]);

  setHeadlines([
    { at: K.kram, end: s[0].end - 0.1, text: 'TIBA-TIBA\n*KRAM*!' },
    { at: K.batu, end: s[1].end - 0.1, text: 'KERAS SEPERTI\n*BATU*?' },
    { at: K.serabut, end: s[2].end - 0.1, text: 'RIBUAN\n*SERABUT KECIL*' },
    { at: K.kunci, end: s[3].end - 0.1, text: 'SALING\n*MENGUNCI*' },
    { at: K.elektrolit, end: s[4].end - 0.1, text: 'BUTUH\n*ELEKTROLIT*' },
    { at: K.lelah, end: s[5].end - 0.1, text: '*DEHIDRASI* &\nKELELAHAN' },
    { at: K.macet, end: s[6].end - 0.1, text: 'SAKLAR OTOT\n*TERKUNCI*!' },
    { at: K.tarik, end: s[7].end - 0.1, text: 'TARIK JARI KE\n*ARAH LUTUT*' },
    { at: K.aman, end: s[8].end - 0.1, text: 'OTOT *AMAN*\n& RILEKS' },
    { at: K.tidur, end: K.loop + 0.6, text: 'SERING KRAM PAS\n*TIDUR*?' },
  ]);

  setChapters([
    { at: K.kram, icon: ICON.shock },
    { at: K.serabut, icon: ICON.muscle },
    { at: K.elektrolit, icon: ICON.ion },
    { at: K.lelah, icon: ICON.water },
    { at: K.tarik, icon: ICON.stretch },
  ], { at: K.aman, end: K.s10 });
}

function cues(D) {
  return [
    [K.kram - 0.1, 'whoosh'], [K.kram, 'zap'], [K.kram + 0.1, 'thud'],
    [K.s2, 'whoosh'], [K.batu, 'thud'], [K.kok, 'pop'],
    [K.s3, 'whoosh'], [K.serabut, 'tick'],
    [K.s4, 'whoosh'], [K.saraf, 'sparkle'], [K.kunci, 'click'], [K.kunci + 0.15, 'thud'],
    [K.s5, 'whoosh'], [K.elektrolit, 'pop'], [K.elektrolit + 0.2, 'sparkle'],
    [K.s6, 'whoosh'], [K.lelah, 'thud'],
    [K.s7, 'whoosh'], [K.macet, 'zap'], [K.macet + 0.1, 'thud'],
    [K.s8, 'whoosh'], [K.tarik, 'pop'], [K.lutut, 'tick'],
    [K.s9, 'whoosh'], [K.aman, 'ding'], [K.aman + 0.3, 'sparkle'],
    [K.s10, 'whoosh'], [K.tidur, 'chirp'], [K.loop, 'whoosh'],
  ];
}

// ---------- drawing elements ----------

// doodle bed
function bed(x, y, t) {
  let s = '';
  // mattress & frame
  s += `<rect x="${x - 160}" y="${y + 20}" width="320" height="90" rx="14" fill="#E8EEF5" opacity="0.85"/>`;
  s += doodle([[x - 160, y + 20], [x + 160, y + 20], [x + 160, y + 110], [x - 160, y + 110]], t, 10, 6, PEN, true);
  // legs of the bed
  s += doodle([[x - 140, y + 110], [x - 140, y + 160]], t, 12, 8, PEN);
  s += doodle([[x + 140, y + 110], [x + 140, y + 160]], t, 14, 8, PEN);
  // pillow
  s += `<rect x="${x - 140}" y="${y - 15}" width="90" height="42" rx="12" fill="#FFE27A" opacity="0.9"/>`;
  s += doodle([[x - 140, y - 15], [x - 50, y - 15], [x - 50, y + 27], [x - 140, y + 27]], t, 20, 5, PEN, true);
  // blanket
  s += `<path d="M${x - 60},${y + 25} L${x + 155},${y + 25} L${x + 155},${y + 105} L${x - 60},${y + 105} Z" fill="#F07A80" opacity="0.85"/>`;
  s += doodle([[x - 60, y + 25], [x + 155, y + 25], [x + 155, y + 105], [x - 60, y + 105]], t, 30, 5, PEN, true);
  return s;
}

// moon & bedroom window on the wall
function windowDecor(x, y, t) {
  let s = `<rect x="${x - 50}" y="${y - 60}" width="100" height="120" rx="8" fill="#FFF8DE" opacity="0.5"/>`;
  s += doodle([[x - 50, y - 60], [x + 50, y - 60], [x + 50, y + 60], [x - 50, y + 60]], t, 40, 5, PEN, true);
  s += doodle([[x - 50, y], [x + 50, y]], t, 42, 4, PEN);
  s += doodle([[x, y - 60], [x, y + 60]], t, 44, 4, PEN);
  // crescent moon
  s += `<path d="M${x + 8},${y - 40} A20,20 0 1 0 ${x + 8},${y - 4} A14,14 0 1 1 ${x + 8},${y - 40} Z" fill="#FFE27A"/>`;
  s += doodle([[x + 8, y - 40], [x - 8, y - 30], [x - 10, y - 18], [x + 8, y - 4]], t, 46, 3, PEN);
  return s;
}

// floating "zZ" sleep signs
function zZ(x, y, t) {
  let s = '';
  for (let i = 0; i < 3; i++) {
    const ph = ((t * 0.7 + i * 0.35) % 1);
    const px = x + 35 * ph + 10 * Math.sin(ph * 6);
    const py = y - 80 * ph;
    s += G('', 1 - ph, hand('z', px, py, 36 + i * 8, PEN));
  }
  return s;
}

// muscle fiber interlocking mechanism (Actin & Myosin combs)
function muscleFibers(cx, cy, t, isLocked, progress = 0) {
  let s = '';
  // background card / capsule
  const w = 480, h = 260;
  s += `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="24" fill="#FCFCF7" opacity="0.95"/>`;
  s += doodle([[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]], t, 50, 6, PEN, true);

  // title
  s += hand('Serabut Otot (Aktin & Miosin)', cx, cy - h / 2 + 34, 42, PEN);

  // shift distance: when locked, teeth overlap tightly
  // shift: 0 = relaxed, 42 = contracted/locked
  const shift = isLocked ? 44 : lerp(0, 44, progress);

  // top backbone (myosin) - reddish
  const topY = cy - 40;
  s += `<rect x="${cx - 200}" y="${topY - 14}" width="400" height="28" rx="8" fill="#F07A80" opacity="0.85"/>`;
  s += doodle([[cx - 200, topY], [cx + 200, topY]], t, 55, 7, '#E0522F');
  // top teeth pointing down
  for (let x = -160; x <= 160; x += 55) {
    const tx = cx + x + (isLocked ? 0 : shift * 0.3);
    s += `<rect x="${tx - 10}" y="${topY}" width="20" height="48" rx="5" fill="#F07A80" opacity="0.9"/>`;
    s += doodle([[tx, topY], [tx, topY + 48]], t, 60 + x, 6, '#E0522F');
    // hooks on tooth
    s += doodle([[tx, topY + 46], [tx + 14, topY + 40]], t, 65 + x, 5, '#E0522F');
  }

  // bottom backbone (actin) - bluish
  const botY = cy + 65;
  s += `<rect x="${cx - 200}" y="${botY - 14}" width="400" height="28" rx="8" fill="#8BBEE8" opacity="0.85"/>`;
  s += doodle([[cx - 200, botY], [cx + 200, botY]], t, 75, 7, '#2F6FB5');
  // bottom teeth pointing up
  for (let x = -135; x <= 165; x += 55) {
    const bx = cx + x - shift;
    s += `<rect x="${bx - 10}" y="${botY - 48}" width="20" height="48" rx="5" fill="#8BBEE8" opacity="0.9"/>`;
    s += doodle([[bx, botY], [bx, botY - 48]], t, 80 + x, 6, '#2F6FB5');
    // hooks on tooth
    s += doodle([[bx, botY - 46], [bx - 14, botY - 40]], t, 85 + x, 5, '#2F6FB5');
  }

  // status pill
  if (isLocked) {
    s += G(T(cx, cy + h / 2 - 28), 1,
      `<rect x="-95" y="-22" width="190" height="44" rx="22" fill="${C.accent}"/>` +
      txt('TERKUNCI! ⚠', 0, 2, 26, '#fff', 900));
  } else {
    s += G(T(cx, cy + h / 2 - 28), 1,
      `<rect x="-95" y="-22" width="190" height="44" rx="22" fill="${C.leaf}"/>` +
      txt('RILEKS ✓', 0, 2, 26, '#fff', 900));
  }

  return s;
}

// floating mineral ion bubble
function ionBubble(label, x, y, col, t, seed) {
  const bob = 8 * Math.sin(t * 3.5 + seed);
  let s = `<circle cx="${x}" cy="${y + bob}" r="32" fill="${col}" opacity="0.9"/>`;
  s += doodleArc(x, y + bob, 32, 0, Math.PI * 2, t, seed, 5, PEN);
  s += txt(label, x, y + bob + 2, 26, PEN, 900);
  return s;
}

// doodle water bottle
function waterBottle(x, y, t, isFull) {
  let s = '';
  // bottle cap & neck
  s += `<rect x="${x - 14}" y="${y - 95}" width="28" height="18" rx="4" fill="${PEN}"/>`;
  s += doodle([[x - 14, y - 95], [x + 14, y - 95], [x + 14, y - 77], [x - 14, y - 77]], t, 90, 5, PEN, true);
  // body
  s += `<rect x="${x - 38}" y="${y - 77}" width="76" height="135" rx="14" fill="#FCFCF7"/>`;
  if (isFull) {
    s += `<rect x="${x - 34}" y="${y - 45}" width="68" height="98" rx="10" fill="${C.cool}" opacity="0.85"/>`;
    s += doodle([[x - 34, y - 45], [x + 34, y - 45]], t, 95, 4, '#2F6FB5');
  } else {
    s += `<rect x="${x - 34}" y="${y + 25}" width="68" height="28" rx="8" fill="${C.accent}" opacity="0.5"/>`;
    s += hand('KOSONG!', x, y - 10, 32, C.accent);
  }
  s += doodle([[x - 38, y - 77], [x + 38, y - 77], [x + 38, y + 58], [x - 38, y + 58]], t, 92, 6, PEN, true);
  return s;
}

// battery gauge
function batteryIcon(x, y, t, level) {
  let s = `<rect x="${x - 45}" y="${y - 25}" width="90" height="50" rx="8" fill="#fff"/>`;
  s += `<rect x="${x + 45}" y="${y - 12}" width="10" height="24" rx="3" fill="${PEN}"/>`;
  s += doodle([[x - 45, y - 25], [x + 45, y - 25], [x + 45, y + 25], [x - 45, y + 25]], t, 110, 5, PEN, true);
  // charge bar
  const col = level > 0.4 ? C.leaf : C.accent;
  const bw = 74 * clamp(level);
  if (bw > 4) {
    s += `<rect x="${x - 37}" y="${y - 17}" width="${f(bw)}" height="34" rx="5" fill="${col}"/>`;
  }
  return s;
}

// first aid dorsiflexion stretch diagram
function stretchDiagram(cx, cy, t) {
  let s = '';
  // card
  s += `<rect x="${cx - 240}" y="${cy - 160}" width="480" height="320" rx="24" fill="#FCFCF7" opacity="0.95"/>`;
  s += doodle([[cx - 240, cy - 160], [cx + 240, cy - 160], [cx + 240, cy + 160], [cx - 240, cy + 160]], t, 120, 6, PEN, true);

  s += hand('Pertolongan Pertama: Tarik Jari ke Lutut', cx, cy - 115, 38, PEN);

  // leg doodle: thigh, knee, calf, foot
  const kx = cx - 70, ky = cy + 20; // knee
  const hx = cx - 180, hy = cy + 40; // hip
  const ax = cx + 80, ay = cy + 30; // ankle
  const fx = cx + 130, fy = cy - 20; // toes pointing UP

  // thigh
  s += doodle([[hx, hy], [kx, ky]], t, 130, 10, PEN);
  // calf / leg
  s += doodle([[kx, ky], [ax, ay]], t, 132, 10, PEN);
  // foot flexing up
  s += doodle([[ax, ay], [fx, fy]], t, 134, 10, PEN);
  // heel
  s += doodle([[ax, ay], [ax - 10, ay + 15], [ax + 30, ay + 15]], t, 136, 6, PEN);

  // curved stretch arrow indicating pulling back toward knee
  const p = P(t, K.tarik, 0.4);
  const arrX = cx + 140, arrY = cy - 50;
  s += doodle([[arrX, arrY + 40], [arrX - 10, arrY], [arrX - 60, arrY - 20]], t, 140, 6, C.accent);
  // arrow head
  s += doodle([[arrX - 60, arrY - 20], [arrX - 40, arrY - 35]], t, 142, 6, C.accent);
  s += doodle([[arrX - 60, arrY - 20], [arrX - 45, arrY - 6]], t, 144, 6, C.accent);

  s += hand('Tarik perlahan!', cx + 50, cy + 90, 42, C.accent);
  s += hand('(Relaksasi Otot Betis)', cx + 50, cy + 130, 32, C.muted);

  return s;
}

// ---------- world rendering ----------
function drawWorld(t) {
  let s = '';

  // Background bedroom element (left side)
  s += windowDecor(-380, -320, t);
  s += bed(-350, -60, t);

  // Scene 1: Sleeping, then sudden cramp!
  if (t < K.s3) {
    if (t < K.kram) {
      s += zZ(-320, -140, t);
      // stickman lying down on the bed
      s += stickman(-320, -100, 0.8, 'calm', t, -90, null, 'sleepy');
    } else {
      // woke up in shock, clutching leg
      const bob = Math.sin(t * 50) * 4;
      s += stickman(-320 + bob, -70, 0.85, 'shock', t, 0, null, 'shock');
      // lightning bolt near calf
      const bx = -260, by = 30;
      s += doodleBolt([[bx, by - 40], [bx + 18, by - 10], [bx - 6, by - 5], [bx + 20, by + 25]], t, 150, C.accent, 8);
      s += hand('ADUUUH!', -200, -150, 52, C.accent);
    }
  }

  // Scene 2: Stone / rock hardness illustration
  if (t >= K.s2 && t < K.s3 + 0.3) {
    const o = P(t, K.s2, 0.3) * (1 - P(t, K.s3, 0.3));
    let r = `<rect x="80" y="-270" width="220" height="150" rx="20" fill="#E2DDD3" opacity="0.9"/>`;
    r += doodle([[80, -270], [300, -270], [300, -120], [80, -120]], t, 160, 6, PEN, true);
    r += hand('BATU KERAS', 190, -220, 44, PEN);
    r += hand('Otot Mengunci Total', 190, -170, 32, C.accent);
    s += G('', o, r);
  }

  // Scene 3, 4, 5: Microscopic muscle fibers
  if (t >= K.s3 - 0.2 && t < K.s6) {
    const o = P(t, K.s3 - 0.2, 0.4) * (1 - P(t, K.s6 - 0.2, 0.4));
    const locked = t >= K.kunci && t < K.s5;
    const prog = t >= K.s4 ? P(t, K.kunci - 0.4, 0.6) : 0;
    let mf = muscleFibers(180, -220, t, locked, prog);

    // Nerve signal line during scene 4
    if (t >= K.s4 && t < K.s5) {
      const sp = P(t, K.saraf, 0.5);
      mf += doodleBolt([[60, -420], [100, -380], [70, -350], [140, -320], [180, -290]], t, 170, C.yellow, 7);
      mf += hand('Sinyal Saraf ⚡', 80, -440, 36, C.accent);
    }

    // Mineral ions during scene 5
    if (t >= K.s5) {
      const io = P(t, K.s5, 0.4);
      mf += G('', io,
        ionBubble('K⁺', 20, -360, '#FFE27A', t, 1) +
        ionBubble('Mg²⁺', 180, -380, '#8BBEE8', t, 2) +
        ionBubble('Ca²⁺', 340, -360, '#B8E986', t, 3) +
        hand('+ Kalsium & Magnesium', 180, -430, 38, C.leaf));
    }

    s += G('', o, mf);
    // Stickman observing
    s += stickman(-200, -50, 0.85, t >= K.s5 ? 'smile' : 'point', t, 0, null, t >= K.s5 ? 'smile' : 'think');
  }

  // Scene 6 & 7: Dehydration, Fatigue & Jammed Switch
  if (t >= K.s6 - 0.2 && t < K.s8) {
    const o = P(t, K.s6 - 0.2, 0.4) * (1 - P(t, K.s8 - 0.2, 0.4));
    let dZone = '';
    // empty bottle
    dZone += waterBottle(-100, -260, t, false);
    // low battery
    dZone += batteryIcon(80, -310, t, 0.15);
    dZone += hand('Energi Drop!', 80, -250, 36, C.accent);

    // jammed muscle switch
    if (t >= K.s7) {
      dZone += muscleFibers(160, -110, t, true, 1.0);
      dZone += doodleBolt([[260, -260], [290, -210], [270, -190], [320, -140]], t, 190, C.accent, 8);
    }

    s += G('', o, dZone);
    // Stickman tired / panicking
    s += stickman(-320, -40, 0.85, t >= K.s7 ? 'shock' : 'calm', t, 0, null, t >= K.s7 ? 'shock' : 'sleepy');
  }

  // Scene 8: First Aid Dorsiflexion Stretch
  if (t >= K.s8 - 0.2 && t < K.s9 + 0.3) {
    const o = P(t, K.s8 - 0.2, 0.4) * (1 - P(t, K.s9 + 0.1, 0.3));
    let aid = stretchDiagram(40, -210, t);
    s += G('', o, aid);
    // Stickman demonstrating
    s += stickman(-320, -30, 0.85, 'point', t, 0, null, 'calm');
  }

  // Scene 9: Water & Recovery
  if (t >= K.s9 - 0.2 && t < K.s10 + 0.2) {
    const o = P(t, K.s9 - 0.2, 0.4) * (1 - P(t, K.s10, 0.3));
    let rec = '';
    // fresh water bottle & glass
    rec += waterBottle(-120, -240, t, true);
    rec += muscleFibers(180, -220, t, false, 0);
    rec += hand('Air + Peregangan = Otot Rileks!', 40, -400, 44, C.leaf);
    s += G('', o, rec);
    s += stickman(-300, -20, 0.85, 'cheer', t, 0, null, 'laugh');
  }

  // Scene 10: Closing Takeaway & Loop Back
  if (t >= K.s10 - 0.2) {
    const o = P(t, K.s10 - 0.2, 0.4);
    let close = '';
    close += hand('Pernah ngalamin?', -60, -340, 52, PEN);
    close += hand('Ceritain di kolom komentar ya! 👇', -60, -280, 40, C.muted);
    s += G('', o, close);
    // Stickman standing next to bed, waving cheerfully
    s += stickman(-120, -40, 0.88, 'happy', t, 0, null, 'smile');
  }

  return s;
}

// ---------- screen-space overlay ----------
function drawOverlay(t) {
  let s = '';

  // Stamp: SPASME! on scene 2
  if (t >= K.batu && t < K.s3) {
    s += stamp('SPASME!', t, K.batu + 0.1, 540, 680, C.accent, -6, 120);
  }

  // Stamp: TERKUNCI! on scene 7
  if (t >= K.macet && t < K.s8) {
    s += stamp('TERKUNCI!', t, K.macet + 0.1, 540, 680, C.accent, -8, 120);
  }

  // Citations (Notebook handwriting mode)
  if (t >= K.elektrolit && t < K.s6 - 0.1) {
    s += cite('sumber: Kemenkes RI & NIH MedlinePlus (Mekanisme Otot & Elektrolit)', t, K.elektrolit, K.s6 - 0.1);
  }
  if (t >= K.tarik && t < K.s9 - 0.1) {
    s += cite('sumber: NHS UK - Panduan Penanganan Kram Kaki (Dorsifleksi)', t, K.tarik, K.s9 - 0.1);
  }

  return s;
}

// ---------- thumbnail (Bold, clear, high-CTR YouTube Shorts cover) ----------
function drawThumbnail() {
  const t = 1.0;
  let world = '';

  // 1. Dynamic background rays from center
  const cx = 540, cy = 960;
  for (let k = 0; k < 24; k += 2) {
    const a0 = k / 24 * Math.PI * 2, a1 = a0 + Math.PI / 24 * 1.6;
    world += `<path d="M${cx},${cy} L${f(cx + 1600 * Math.cos(a0))},${f(cy + 1600 * Math.sin(a0))} L${f(cx + 1600 * Math.cos(a1))},${f(cy + 1600 * Math.sin(a1))} Z" fill="#FFEAA7" opacity="0.45"/>`;
  }

  // 2. Night context (crescent moon & sleep zZ) on top left
  world += `<path d="M190,520 A42,42 0 1 0 190,600 A30,30 0 1 1 190,520 Z" fill="#FFE27A"/>`;
  world += doodle([[190, 520], [145, 540], [135, 570], [190, 600]], t, 501, 5, PEN);
  world += hand('zZ', 245, 520, 52, PEN);

  // 3. Stickman (left side, huge and shocked)
  // Center at (330, 980), scale 1.95
  world += stickman(330, 980, 1.95, 'shock', t, 0, null, 'shock');
  // Sweat drops in shock
  world += doodle([[180, 720], [140, 690]], t, 510, 8, C.cool);
  world += doodle([[460, 720], [500, 690]], t, 512, 8, C.cool);

  // 4. Right side: Big, clear Anatomical Leg Cramp Card
  const cardX = 720, cardY = 1000;
  // Card shadow & background
  world += `<rect x="${cardX - 220 + 8}" y="${cardY - 260 + 10}" width="440" height="520" rx="28" fill="${PEN}" opacity="0.15"/>`;
  world += `<rect x="${cardX - 220}" y="${cardY - 260}" width="440" height="520" rx="28" fill="#FFFDF8" stroke="${PEN}" stroke-width="8"/>`;

  // Header of the card
  world += `<rect x="${cardX - 220}" y="${cardY - 260}" width="440" height="74" rx="28" fill="${C.accent}"/>`;
  world += `<rect x="${cardX - 220}" y="${cardY - 210}" width="440" height="24" fill="${C.accent}"/>`;
  world += txt('OTOT BETIS KRAM!', cardX, cardY - 225, 34, '#fff', 900);

  // Anatomically recognizable leg profile (thigh, knee, bulging calf, ankle, foot)
  const lx = cardX, ly = cardY - 20;
  const legD = `M${lx - 30},${ly - 130} ` +
    `L${lx + 45},${ly - 130} ` +
    `Q${lx + 65},${ly - 40} ${lx + 70},${ly - 10} ` + // front of thigh to knee
    `Q${lx + 55},${ly + 40} ${lx + 45},${ly + 110} ` + // shin
    `L${lx + 130},${ly + 150} ` + // top of foot
    `Q${lx + 155},${ly + 175} ${lx + 135},${ly + 185} ` + // toes
    `L${lx + 5},${ly + 185} ` + // sole to heel
    `Q${lx + 5},${ly + 140} ${lx + 10},${ly + 120} ` + // achilles tendon
    `Q${lx - 85},${ly + 60} ${lx - 85},${ly + 10} ` + // BULGING CALF MUSCLE (THE CRAMP!)
    `Q${lx - 75},${ly - 40} ${lx - 15},${ly - 10} ` + // back of knee
    `Z`;

  world += `<path d="${legD}" fill="#FCE4E4" stroke="${PEN}" stroke-width="7" stroke-linejoin="round"/>`;

  // Spasm knot / cramp core on the calf muscle bulge (x: lx - 45, y: ly + 35)
  const kx = lx - 45, ky = ly + 35;
  world += `<ellipse cx="${kx}" cy="${ky}" rx="55" ry="38" fill="${C.accent}" opacity="0.9"/>`;
  world += `<ellipse cx="${kx}" cy="${ky}" rx="38" ry="24" fill="${C.yellow}" opacity="0.95"/>`;
  world += txt('KERAS!', kx, ky + 2, 22, PEN, 900);

  // Red alert spasm dashed circle
  world += `<ellipse cx="${kx}" cy="${ky}" rx="78" ry="54" fill="none" stroke="${C.accent}" stroke-width="8" stroke-dasharray="14 10"/>`;

  // Spasm lightning bolts around the muscle knot
  world += doodleBolt([[kx, ky - 35], [kx - 30, ky - 75], [kx, ky - 105]], t, 520, C.accent, 9);
  world += doodleBolt([[kx - 40, ky], [kx - 85, ky - 20], [kx - 120, ky + 10]], t, 522, C.yellow, 8);
  world += doodleBolt([[kx + 10, ky + 30], [kx + 35, ky + 70], [kx + 15, ky + 110]], t, 524, C.accent, 8);

  // Dorsiflexion stretch instruction arrow at foot
  world += doodle([[lx + 120, ly + 180], [lx + 110, ly + 125], [lx + 60, ly + 100]], t, 526, 7, C.leaf);
  world += doodle([[lx + 60, ly + 100], [lx + 85, ly + 105]], t, 527, 7, C.leaf);
  world += doodle([[lx + 60, ly + 100], [lx + 75, ly + 125]], t, 528, 7, C.leaf);

  // Bottom card badge: Solution
  world += `<rect x="${cardX - 190}" y="${cardY + 192}" width="380" height="46" rx="12" fill="#EDF7ED" stroke="${C.leaf}" stroke-width="3"/>`;
  world += txt('💡 Tarik Jari ke Arah Lutut!', cardX, cardY + 215, 24, '#1B5E20', 900);

  // 5. Connecting electric zap from leg card to Stickman
  world += doodleBolt([[cardX - 220, cardY], [cardX - 280, cardY - 40], [450, 1100]], t, 530, C.accent, 10);

  // 6. UI Layer: Big bold outlined title (Lilita One) - unmistakable and super punchy!
  let ui = '';
  // Outlined title lines (Lilita One font is bundled in engine/fonts/lilita-one)
  const title1 = 'TIBA-TIBA KRAM';
  const title2 = 'PAS LAGI TIDUR?!';

  // Drop shadow
  ui += `<text x="540" y="328" font-family="Lilita One" font-size="116" fill="#000" opacity="0.22" text-anchor="middle" dominant-baseline="central" stroke="#000" stroke-width="24" stroke-linejoin="round">${title1}</text>`;
  ui += `<text x="540" y="448" font-family="Lilita One" font-size="116" fill="#000" opacity="0.22" text-anchor="middle" dominant-baseline="central" stroke="#000" stroke-width="24" stroke-linejoin="round">${title2}</text>`;

  // Main bold text
  ui += `<text x="540" y="320" font-family="Lilita One" font-size="116" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central" stroke="${PEN}" stroke-width="20" stroke-linejoin="round" paint-order="stroke">${title1}</text>`;
  ui += `<text x="540" y="440" font-family="Lilita One" font-size="116" fill="#F6C945" text-anchor="middle" dominant-baseline="central" stroke="${PEN}" stroke-width="20" stroke-linejoin="round" paint-order="stroke">${title2}</text>`;

  // Bottom Pill: Clear CTA
  ui += pill('PENYEBAB & CARA MENGATASI', 540, 1530, 48, C.leaf, '#fff');

  return { world, ui };
}
