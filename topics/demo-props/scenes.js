// Showcase of engine/props.js: plants and surfaces (first view), everyday objects (second view).
// Render it with another "theme" in script.json to see the newsprint (soft) and notebook (doodle) looks.
let K = {};

function setup(D) {
  const s = D.scenes;
  K = { s2: s[1].start };
  setCamera([{ x: 0, y: 0, z: 1 }, { at: K.s2, dur: 1.0, x: 0, y: -1900, z: 1 }]);
  setHeadlines([
    { at: 0.2, end: K.s2 - 0.1, text: 'PUSTAKA\n*ALAM*' },
    { at: K.s2 + 0.3, end: D.total, text: 'PUSTAKA\n*BENDA*' },
  ]);
  setChapters([]);
}

function cues(D) { return [[K.s2, 'whoosh']]; }

function phoneScreen() {  // a little chat on the phone's screen
  return `<rect x="0" y="0" width="200" height="40" fill="${C.cool}"/>` + txt('Si Cicak', 100, 22, 18, '#fff', 900) +
    `<rect x="14" y="60" width="130" height="44" rx="14" fill="#fff"/><rect x="60" y="120" width="126" height="44" rx="14" fill="${C.leaf}"/>` +
    `<rect x="14" y="180" width="100" height="44" rx="14" fill="#fff"/>` + txt('Halo!', 60, 84, 18, C.ink, 800) + txt('Kok bisa?', 122, 144, 18, '#fff', 800);
}

function drawWorld(t) {
  let s = `<rect x="-2000" y="-3200" width="4000" height="4400" fill="${C.bg}"/>`;
  // nature view
  s += leaf(-430, -300, 260, -18) + leaf(-420, -290, 180, -60, { col: '#8CC152' });
  s += ground(-700, 700, 340, 400, t);
  s += tree(-250, 340, 560, t, { fruit: '#E8A13A' }) + tree(290, 345, 640, t, { kind: 'palm', seed: 2 });
  s += bush(10, 352, 260, t, { flowers: '#F28CA8' }) + flower(-80, 356, 0.95, t) + flower(440, 360, 0.75, t, { petal: '#FFD25A', seed: 5 });
  s += rock(150, 360, 120);
  // objects view
  s += bulb(-330, -2240, 0.75, { t }) + coin(60, -2120, 0.9) + banknote(340, -2150, 0.6, { rot: -8 });
  s += woodPlank(-520, -1540, 1040, 50);
  s += phone(-260, -1694, 0.7, { screen: phoneScreen() }) + glass(130, -1540, 0.85, { t }) + box(370, -1540, 0.7);
  return s;
}
