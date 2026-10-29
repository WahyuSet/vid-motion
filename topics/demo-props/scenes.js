// Showcase of engine/props.js: plants and surfaces (first view), everyday objects (second view),
// kitchen and home (third view), weather, animals and fruit (fourth view), props shared from topics (fifth),
// money and news (sixth), body and health (seventh), and batch C for Si Tikus: money (eighth), economy (ninth),
// news (tenth).
// Render it with another "theme" in script.json to see the newsprint (soft) and notebook (doodle) looks.
let K = {};

function setup(D) {
  const s = D.scenes;
  K = {
    s2: s[1].start,
    s3: s[2].start,
    s4: s[2].start + (s[2].end - s[2].start) * 0.58,
    s5: s[3].start, s6: s[4].start, s7: s[5].start, s8: s[6].start,
    v9: s[6].start + (s[6].end - s[6].start) * 0.55, s9: s[7].start,
  };
  setCamera([
    { x: 0, y: 0, z: 1 },
    { at: K.s2, dur: 1.0, x: 0, y: -1900, z: 1 },
    { at: K.s3, dur: 0.9, x: 0, y: -3800, z: 1 },
    { at: K.s4, dur: 0.9, x: 0, y: -5700, z: 1 },
    { at: K.s5, dur: 0.9, x: 0, y: -7600, z: 1 },
    { at: K.s6, dur: 0.9, x: 0, y: -9500, z: 1 },
    { at: K.s7, dur: 0.9, x: 0, y: -11400, z: 1 },
    { at: K.s8, dur: 0.9, x: 0, y: -13300, z: 1 },
    { at: K.v9, dur: 0.9, x: 0, y: -15200, z: 1 },
    { at: K.s9, dur: 0.9, x: 0, y: -17100, z: 1 },
  ]);
  setHeadlines([
    { at: 0.2, end: K.s2 - 0.1, text: 'PUSTAKA\n*ALAM*' },
    { at: K.s2 + 0.3, end: K.s3 - 0.1, text: 'PUSTAKA\n*BENDA*' },
    { at: K.s3 + 0.25, end: K.s4 - 0.1, text: 'DAPUR &\n*RUMAH*' },
    { at: K.s4 + 0.25, end: K.s5 - 0.1, text: 'CUACA &\n*BUAH*' },
    { at: K.s5 + 0.3, end: K.s6 - 0.1, text: 'DARI\n*TOPIK LAMA*' },
    { at: K.s6 + 0.3, end: K.s7 - 0.1, text: 'UANG &\n*BERITA*' },
    { at: K.s7 + 0.3, end: K.s8 - 0.1, text: 'TUBUH &\n*KESEHATAN*' },
    { at: K.s8 + 0.3, end: K.v9 - 0.1, text: 'SI TIKUS\n*UANG*' },
    { at: K.v9 + 0.25, end: K.s9 - 0.1, text: 'SI TIKUS\n*EKONOMI*' },
    { at: K.s9 + 0.3, end: D.total, text: 'SI TIKUS\n*BERITA*' },
  ]);
  setChapters([]);
}

function cues(D) { return [[K.s2, 'whoosh'], [K.s3, 'whoosh'], [K.s4, 'whoosh'], [K.s5, 'whoosh'], [K.s6, 'whoosh'], [K.s7, 'whoosh'], [K.s8, 'whoosh'], [K.v9, 'whoosh'], [K.s9, 'whoosh'], [K.s9 + 1.2, 'thud']]; }

function phoneScreen() {  // a little chat on the phone's screen
  return `<rect x="0" y="0" width="200" height="40" fill="${C.cool}"/>` + txt('Si Cicak', 100, 22, 18, '#fff', 900) +
    `<rect x="14" y="60" width="130" height="44" rx="14" fill="#fff"/><rect x="60" y="120" width="126" height="44" rx="14" fill="${C.leaf}"/>` +
    `<rect x="14" y="180" width="100" height="44" rx="14" fill="#fff"/>` + txt('Halo!', 60, 84, 18, C.ink, 800) + txt('Kok bisa?', 122, 144, 18, '#fff', 800);
}

function drawWorld(t) {
  let s = `<rect x="-2000" y="-19000" width="4000" height="20200" fill="${C.bg}"/>`;
  // view 1: nature
  s += leaf(-430, -300, 260, -18) + leaf(-420, -290, 180, -60, { col: '#8CC152' });
  s += ground(-700, 700, 340, 400, t);
  s += tree(-250, 340, 560, t, { fruit: '#E8A13A' }) + tree(290, 345, 640, t, { kind: 'palm', seed: 2 });
  s += bush(10, 352, 260, t, { flowers: '#F28CA8' }) + flower(-80, 356, 0.95, t) + flower(440, 360, 0.75, t, { petal: '#FFD25A', seed: 5 });
  s += rock(150, 360, 120);
  // view 2: objects
  s += bulb(-330, -2240, 0.75, { t }) + coin(60, -2120, 0.9) + banknote(340, -2150, 0.6, { rot: -8 });
  s += woodPlank(-520, -1540, 1040, 50);
  s += phone(-260, -1694, 0.7, { screen: phoneScreen() }) + glass(130, -1540, 0.85, { t }) + box(370, -1540, 0.7);
  // view 3: kitchen & home (plate, riceBowl, pot, stove, bottle, fan, wallClock, windowFrame)
  s += windowFrame(-250, -4030, 250, 280, { night: false, t }) + wallClock(210, -4085, 0.88, { h: 10, m: 12 });
  s += woodPlank(-520, -3720, 1040, 44);
  s += stove(-240, -3720, 0.85, { on: true, t }) + pot(120, -3720, 0.85, { t, steam: true }) + fan(370, -3720, 0.82, { t, on: true });
  s += woodPlank(-520, -3380, 1040, 44);
  const eggFood = vol('M-46,2 C-48,-18 48,-18 46,2 C44,18 -44,18 -46,2 Z', '#FFFFFF', { depth: 4, w: 4 }) +
    vol(circleD(4, -2, 16), '#F5B83D', { depth: 4, w: 4 });
  s += plate(-270, -3380, 0.95, { food: eggFood }) + riceBowl(60, -3380, 0.9, { t }) + bottle(340, -3380, 0.9, { level: 0.72 });
  // view 4: sky, weather, animals & fruit (cloud, sun, rain, umbrella, bee, fish, fruit)
  s += sun(-340, -5990, 0.95, { t }) + cloud(20, -6020, 0.85, { t }) + cloud(310, -5990, 0.8, { t, col: '#DCE6F0', seed: 4 });
  s += rain(190, 430, -5940, -5620, t, { n: 22 });
  s += bee(-340, -5680, 0.95, { t, rot: -6 }) + fish(-20, -5680, 0.95, { t }) + umbrella(310, -5630, 0.9, { open: true });
  s += woodPlank(-520, -5260, 1040, 44);
  s += fruit(-290, -5312, 0.95, { kind: 'pisang' }) + fruit(0, -5326, 0.95, { kind: 'jeruk' }) + fruit(290, -5340, 0.9, { kind: 'alpukat' });
  // view 5: shared from topics (jar, wallCalendar, bedSide, socket, germ)
  s += wallCalendar(-300, -7820, 0.9, { big: '2026' }) + germ(20, -7810, 0.75, { t }) + socket(320, -7820, 1.0);
  s += woodPlank(-520, -7330, 1040, 44);
  s += jar(-300, -7330, 0.62, { label: 'MADU' }) + bedSide(190, -7330, 0.42, { sleeper: cicak(-200, -215, 0.5, 'calm', t, -90, null, 'sleepy') });
  // view 6: money and news (wallet, piggyBank, calculator, chart, building, docPaper, newsMic)
  s += building(-280, -9560, 0.52) + docPaper(20, -9760, 0.62, { stamp: true, rot: -6 });
  s += chart(150, -9560, 370, 300, { values: [3, 4, 4, 6, 8], p: P(t, K.s6 + 0.4, 1.4) });
  s += woodPlank(-520, -9180, 1040, 44);
  s += wallet(-330, -9230, 0.62) + piggyBank(-70, -9180, 0.55, { t }) + calculator(170, -9300, 0.5) + newsMic(390, -9360, 0.55);
  // view 7: body and health (heartOrgan, lungs, stomach, brain, bodyCell, thermometer, stethoscope, toothbrush)
  s += heartOrgan(-300, -11640, 0.62, { t }) + lungs(20, -11620, 0.62, { t }) + brain(300, -11650, 0.62);
  s += stomach(-300, -11260, 0.62, { t }) + bodyCell(10, -11280, 0.62, { t }) + thermometer(240, -11100, 0.62) + stethoscope(400, -11090, 0.48);
  s += toothbrush(-60, -11020, 0.6);
  // view 8: Si Tikus, money (savingsBook, shieldBadge, hangSign, levelGauge, checkBoard, priceLabel, fuelPump)
  const pass = G(T(0, 0, 0.42), 1, savingsBook(0, 0, 1, { rot: 0 }));
  s += checkBoard(-250, -13300, 0.5, { title: 'SYARAT 3T', active: 1, rows: [{ text: 'TERCATAT', sub: 'di bank', icon: pass, check: 1 },
    { text: 'BUNGA WAJAR', sub: 'maks. bunga LPS', check: P(t, K.s8 + 1.2, 0.4) }, { text: 'BANK SEHAT' }] });
  s += hangSign(270, -13700, 0.5, { t, t0: K.s8 + 0.6 }) + shieldBadge(400, -13450, 0.5);
  s += levelGauge(100, -13300, 0.45, { level: 0.78, limit: 0.5, label: 'BUNGA', value: '4,5%', t, id: 'demoG' });
  s += woodPlank(-520, -13300, 1040, 44);
  s += savingsBook(-360, -13020, 0.6) + priceLabel(-60, -13010, 0.75, { label: 'Rp12.500' }) + fuelPump(330, -12880, 0.55, { t });
  s += woodPlank(-520, -12880, 1040, 44);
  // view 9: Si Tikus, economy (atmCard, goldBar, safeBox, house, shoppingBasket, oilBarrel, lpgTank)
  s += atmCard(330, -15420, 0.6) + goldBar(30, -15200, 0.55, { n: 3 });
  s += safeBox(-300, -15200, 0.6, { open: P(t, K.v9 + 0.8, 0.8, E.outCubic), inside: savingsBook(0, -70, 0.45, { rot: 0 }) });
  s += woodPlank(-520, -15200, 1040, 44);
  s += house(-330, -14780, 0.55, { label: 'KPR' }) + shoppingBasket(-40, -14780, 0.55) + oilBarrel(170, -14780, 0.5) + lpgTank(350, -14780, 0.5);
  s += woodPlank(-520, -14780, 1040, 44);
  // view 10: Si Tikus, news (newspaper, chatBubble, gavel, ballotBox)
  s += newspaper(-220, -17320, 0.75) + chatBubble(250, -17340, 0.6);
  s += woodPlank(-520, -17100, 1040, 44);
  s += gavel(-230, -16700, 0.75, { t, t0: K.s9 + 1.2 }) + ballotBox(250, -16700, 0.6, { p: P(t, K.s9 + 0.8, 1.0, E.inOutCubic) });
  s += woodPlank(-520, -16700, 1040, 44);
  return s;
}
