// Showcase of engine/props.js: plants and surfaces (first view), everyday objects (second view),
// kitchen and home (third view), weather, animals and fruit (fourth view).
// Render it with another "theme" in script.json to see the newsprint (soft) and notebook (doodle) looks.
let K = {};

function setup(D) {
  const s = D.scenes;
  K = {
    s2: s[1].start,
    s3: s[2].start,
    s4: s[2].start + (s[2].end - s[2].start) * 0.58,
  };
  setCamera([
    { x: 0, y: 0, z: 1 },
    { at: K.s2, dur: 1.0, x: 0, y: -1900, z: 1 },
    { at: K.s3, dur: 0.9, x: 0, y: -3800, z: 1 },
    { at: K.s4, dur: 0.9, x: 0, y: -5700, z: 1 },
  ]);
  setHeadlines([
    { at: 0.2, end: K.s2 - 0.1, text: 'PUSTAKA\n*ALAM*' },
    { at: K.s2 + 0.3, end: K.s3 - 0.1, text: 'PUSTAKA\n*BENDA*' },
    { at: K.s3 + 0.25, end: K.s4 - 0.1, text: 'DAPUR &\n*RUMAH*' },
    { at: K.s4 + 0.25, end: D.total, text: 'CUACA &\n*BUAH*' },
  ]);
  setChapters([]);
}

function cues(D) { return [[K.s2, 'whoosh'], [K.s3, 'whoosh'], [K.s4, 'whoosh']]; }

function phoneScreen() {  // a little chat on the phone's screen
  return `<rect x="0" y="0" width="200" height="40" fill="${C.cool}"/>` + txt('Si Cicak', 100, 22, 18, '#fff', 900) +
    `<rect x="14" y="60" width="130" height="44" rx="14" fill="#fff"/><rect x="60" y="120" width="126" height="44" rx="14" fill="${C.leaf}"/>` +
    `<rect x="14" y="180" width="100" height="44" rx="14" fill="#fff"/>` + txt('Halo!', 60, 84, 18, C.ink, 800) + txt('Kok bisa?', 122, 144, 18, '#fff', 800);
}

function drawWorld(t) {
  let s = `<rect x="-2000" y="-7000" width="4000" height="8200" fill="${C.bg}"/>`;
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
  return s;
}
