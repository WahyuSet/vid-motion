// Shared motion-graphics engine. A topic's scenes.js defines:
//   const scenes = [{ draw(t, S) -> svg, cues(S) -> [[time, sfx], ...] }, ...]   (one per voice-over scene)
//   function setup(D) {}   optional, runs once after timing data is loaded
// Every frame is drawn from scratch by renderAt(t): no CSS animation, no timers,
// so the Python renderer can screenshot any moment deterministically.

const C = {
  bg: '#F5F2EC', blob: '#E9E2D4', ink: '#161616', muted: '#7D786F', line: '#E2DDD3',
  accent: '#E4572E', accentL: '#F9D7CB', cool: '#3478C8', coolL: '#CFE3F6',
  night: '#24305E', yellow: '#F6C945', sand: '#E9B949', white: '#FFFFFF',
  metal: '#B9C3CC', cheek: '#FF8A7A',
};
const FONT = 'Nunito';
const STROKE = 7;

// ---------- math ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const E = {
  lin: x => x,
  outCubic: x => 1 - Math.pow(1 - x, 3),
  inCubic: x => x * x * x,
  inOutCubic: x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  outBack: x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  outElastic: x => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI / 3)) + 1,
};
const P = (t, t0, dur, ease = E.outCubic) => ease(clamp((t - t0) / dur));
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const f = n => Math.round(n * 100) / 100;
function mix(a, b, p) {
  const pa = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16));
  const pb = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16));
  return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(p))).toString(16).padStart(2, '0')).join('');
}
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------- svg helpers ----------
const T = (x, y, s = 1, r = 0) =>
  `translate(${f(x)} ${f(y)})` + (r ? ` rotate(${f(r)})` : '') + (s !== 1 ? ` scale(${f(s)})` : '');
const G = (transform, opacity, inner) =>
  opacity <= 0.001 ? '' : `<g transform="${transform}"${opacity < 0.999 ? ` opacity="${f(opacity)}"` : ''}>${inner}</g>`;
const txt = (s, x, y, size, fill, weight = 900, anchor = 'middle', extra = '') =>
  `<text x="${f(x)}" y="${f(y)}" font-family="${FONT}" font-weight="${weight}" font-size="${f(size)}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="central" ${extra}>${esc(s)}</text>`;
const stroke = (w = STROKE, col = C.ink) => `stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
// limb with an ink outline: thick ink stroke underneath a thinner coloured one
const limb = (d, w, col) =>
  `<path d="${d}" fill="none" ${stroke(w + 14)}/><path d="${d}" fill="none" ${stroke(w, col)}/>`;

const ctx = document.createElement('canvas').getContext('2d');
function measure(s, size, weight = 900, font = FONT) { ctx.font = `${weight} ${size}px "${font}"`; return ctx.measureText(s).width; }

function pop(t, t0, dur = 0.45) {
  if (t < t0) return { s: 0, o: 0 };
  const q = clamp((t - t0) / dur);
  return { s: 0.3 + 0.7 * E.outBack(q), o: clamp(q * 3) };
}
function sparkle(x, y, r, col) {
  return `<path transform="${T(x, y)}" d="M0,${-r} Q0,0 ${r},0 Q0,0 0,${r} Q0,0 ${-r},0 Q0,0 0,${-r}Z" fill="${col}"/>`;
}
function snowflake(x, y, r, col, rot = 0) {
  let d = '';
  for (let k = 0; k < 3; k++) {
    const a = (rot + k * 60) * Math.PI / 180;
    d += `M${f(-r * Math.cos(a))},${f(-r * Math.sin(a))}L${f(r * Math.cos(a))},${f(r * Math.sin(a))}`;
  }
  return `<path transform="${T(x, y)}" d="${d}" fill="none" ${stroke(5, col)}/>`;
}
function pill(label, x, y, size, fill, color = C.white, s = 1, o = 1) {
  const w = measure(label, size) + size * 1.4, h = size * 1.75;
  return G(T(x, y, s), o,
    `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(h / 2)}" fill="${fill}" ${stroke(6)}/>` +
    txt(label, 0, 2, size, color, 900, 'middle', 'letter-spacing="1"'));
}

// ---------- shared pieces ----------
const PANEL = { x: 140, y: 420, w: 800, h: 740, r: 48 };
function panel(id, fill, inner) {
  const { x, y, w, h, r } = PANEL;
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>
    <rect x="${x + 10}" y="${y + 16}" width="${w}" height="${h}" rx="${r}" fill="#000" opacity="0.07"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>
    <g clip-path="url(#${id})">${inner}</g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" ${stroke()}/>`;
}
// label tab sitting on the panel's top edge
function tab(label, t, t0, fill = C.accent, color = C.white, tOut = null) {
  const p = pop(t, t0, 0.5);
  let s = p.s, o = p.o;
  if (tOut !== null && t > tOut) { const q = P(t, tOut, 0.25, E.inCubic); s *= 1 - q; o *= 1 - q; }
  const size = 40, w = measure(label, size) + 70, h = 74;
  return G(T(540, PANEL.y, s), o,
    `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" ${stroke(6)}/>` +
    txt(label, 0, 2, size, color, 900, 'middle', 'letter-spacing="2"'));
}

// call-to-action: panel dims, a Follow button pops and a cursor clicks it
function followButton(t, tf, dimColor = '#FFFFFF', cy = 800) {
  if (t <= tf - 0.05) return '';
  let s = `<rect x="0" y="0" width="1080" height="1920" fill="${dimColor}" opacity="${f(0.7 * P(t, tf - 0.05, 0.3))}"/>`;
  const b = pop(t, tf - 0.05, 0.45);
  const tc = tf + 0.6;
  const press = t > tc ? 1 - 0.1 * Math.sin(Math.PI * clamp((t - tc) / 0.18)) : 1;
  const done = t > tc + 0.08;
  const w = 440, h = 120;
  s += G(T(540, cy, b.s * press), b.o,
    `<rect x="${-w / 2 + 8}" y="${-h / 2 + 10}" width="${w}" height="${h}" rx="${h / 2}" fill="${C.ink}" opacity="0.15"/>` +
    `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${done ? C.accent : C.ink}" ${stroke(6)}/>` +
    txt(done ? '✓ FOLLOWED' : 'FOLLOW +', 0, 3, 52, '#fff', 900, 'middle', 'letter-spacing="2"'));
  if (done) {
    const r = P(t, tc + 0.08, 0.6);
    s += `<circle cx="610" cy="${cy + 20}" r="${f(30 + 200 * r)}" fill="none" ${stroke(8, C.accent)} opacity="${f(1 - r)}"/>`;
  }
  const cq = P(t, tf + 0.1, 0.5, E.inOutCubic);
  s += G(T(lerp(980, 610, cq), lerp(cy + 350, cy + 20, cq), t > tc && t < tc + 0.18 ? 0.88 : 1, -12), b.o,
    `<path d="M0,0 L0,92 L24,70 L42,108 L60,99 L42,62 L74,62 Z" fill="#fff" ${stroke(6)}/>`);
  return s;
}
const followCues = tf => [[tf - 0.05, 'pop'], [tf + 0.6, 'click'], [tf + 0.68, 'ding']];

// ---------- captions ----------
function captions(t) {
  const ch = D.captions.find(c => t >= c.start && t < c.end);
  if (!ch) return '';
  const p = P(t, ch.start, 0.2, E.outBack);
  let size = 72;
  const lineW = l => l.reduce((w, x) => w + measure(x.w, size) + 22, -22);
  const maxW = Math.max(...ch.lines.map(lineW));
  if (maxW > 900) size *= 900 / maxW;
  const lh = size * 1.25, y0 = 1300 - (ch.lines.length - 1) * lh / 2;
  let s = '';
  ch.lines.forEach((line, li) => {
    const widths = line.map(x => measure(x.w, size));
    const total = widths.reduce((a, b) => a + b, 0) + 22 * (line.length - 1);
    let x = 540 - total / 2;
    line.forEach((wd, wi) => {
      const w = widths[wi], y = y0 + li * lh;
      const active = t >= wd.t - 0.05 && t < wd.next;
      const spoken = t >= wd.t - 0.05;
      if (active) {
        const k = 1 + 0.12 * (1 - P(t, wd.t - 0.05, 0.18));
        s += G(T(x + w / 2, y, k), 1,
          `<rect x="${f(-w / 2 - 14)}" y="${f(-size * 0.62)}" width="${f(w + 28)}" height="${f(size * 1.22)}" rx="${f(size * 0.3)}" fill="${C.accent}" transform="rotate(-2)"/>` +
          txt(wd.w, 0, 2, size, '#fff'));
      } else {
        s += txt(wd.w, x + w / 2, y + 2, size, C.ink, 900, 'middle', spoken ? '' : 'opacity="0.35"');
      }
      x += w + 22;
    });
  });
  return G(`translate(540 1300) scale(${f(0.85 + 0.15 * p)}) translate(-540 -1300)`, clamp(p * 2), s);
}

// ---------- world mode: one continuous world seen through a moving camera ----------
// A topic opts in by defining drawWorld(t, cam) (world coordinates) and, in setup(D), calling
// setCamera / setHeadlines / setChapters. drawOverlay(t, cam) adds screen-space pieces.
const VIEW_CY = 900;  // screen y the camera centres on
let CAM = [], HEADS = [], CHAP = { list: [], recap: null };

// keys: first = initial view {x, y, z}; then {at, dur, x, y, z}: from `at`, ease to the view over `dur`
function setCamera(keys) { CAM = keys; }
function cameraAt(t) {
  let c = { x: CAM[0].x, y: CAM[0].y, z: CAM[0].z };
  for (let i = 1; i < CAM.length; i++) {
    const k = CAM[i];
    if (t <= k.at) break;
    const p = E.inOutCubic(clamp((t - k.at) / (k.dur || 0.8)));
    c = { x: lerp(c.x, k.x, p), y: lerp(c.y, k.y, p), z: Math.exp(lerp(Math.log(c.z), Math.log(k.z), p)) };
  }
  // a little handheld drift so the picture never freezes
  return { x: c.x + 5 * Math.sin(t * 0.7) / c.z, y: c.y + 4 * Math.cos(t * 0.9) / c.z, z: c.z * (1 + 0.006 * Math.sin(t * 0.5)) };
}

// ---------- themes: one look per channel ----------
// paper = Cicak Tahu (warm paper, outlined titles), newsprint = Si Tikus (newspaper grey, condensed news
// titles on white strips, lower-third captions), notebook = Stickman (lined page, handwriting, highlighter).
// A paper-style topic gets its channel's theme through D.theme (channels/<id>/channel.json "theme").
const THEMES = {
  paper: { texture: 'paper', glow: true, vignette: true,
    head: { mode: 'outline' }, cap: { mode: 'marker', font: 'Nunito', weight: 900, size: 46 },
    stamp: 'rubber', badge: 'round' },
  newsprint: { texture: 'newsprint', glow: false, vignette: true,
    palette: { bg: '#E9E5DC', ink: '#18223A', muted: '#5F6676', line: '#C9C3B6', yellow: '#F2C14E', accent: '#C8312B', cool: '#1F4E8C', leaf: '#2E8B57' },
    head: { mode: 'news', font: 'Oswald', weight: 700 }, cap: { mode: 'bar', font: 'Oswald', weight: 500, size: 44 },
    stamp: 'label', badge: 'square' },
  notebook: { texture: 'notebook', glow: false, vignette: false,
    palette: { bg: '#FCFCF7', ink: '#26262E', muted: '#7A7A84', line: '#BFD6EA', yellow: '#E4F05C', accent: '#E0522F', cool: '#2F6FB5', leaf: '#5DA544' },
    head: { mode: 'marker', font: 'Caveat', weight: 700 }, cap: { mode: 'hand', font: 'Caveat', weight: 700, size: 60 },
    stamp: 'circle', badge: 'sketch' },
};
let TH = THEMES.paper;

// a line of text drawn in pieces, so *highlighted* pieces can get their own colour or marker
function segments(line, size, weight, font) {
  const parts = line.split(/(\*[^*]+\*)/).filter(Boolean)
    .map(p => ({ s: p.startsWith('*') ? p.slice(1, -1) : p, hi: p.startsWith('*') }));
  parts.forEach(p => p.w = measure(p.s, size, weight, font));
  return { parts, width: parts.reduce((a, p) => a + p.w, 0) };
}

// {at, end, text, y?, size?}; words wrapped in *stars* are highlighted, "\n" breaks lines
// big title (headlines, thumbnails) in the theme's style: *word* is highlighted, "\n" breaks lines,
// shrinks to fit maxW, lines centred on (cx, cy)
function titleText(text, cx, cy, size, maxW = 780, outline = 15) {
  const mode = TH.head.mode;
  if (mode === 'news' || mode === 'marker') {
    const font = TH.head.font, weight = TH.head.weight;
    if (mode === 'news') text = text.toUpperCase(); else size *= 1.3;
    const lines = text.split('\n');
    const widest = Math.max(...lines.map(l => segments(l, size, weight, font).width));
    if (widest > maxW) size *= maxW / widest;
    const lh = size * (mode === 'news' ? 1.22 : 1.0), y0 = cy - (lines.length - 1) * lh / 2;
    let body = '';
    lines.forEach((l, li) => {
      const { parts, width } = segments(l, size, weight, font), y = y0 + li * lh;
      let x = cx - width / 2;
      if (mode === 'news') {
        const pad = size * 0.28, hh = size * 1.12;
        body += `<rect x="${f(x - pad + 8)}" y="${f(y - hh / 2 + 8)}" width="${f(width + 2 * pad)}" height="${f(hh)}" fill="${C.ink}" opacity="0.2"/>` +
          `<rect x="${f(x - pad)}" y="${f(y - hh / 2)}" width="${f(width + 2 * pad)}" height="${f(hh)}" fill="#fff"/>` +
          `<rect x="${f(x - pad)}" y="${f(y - hh / 2)}" width="${f(size * 0.12)}" height="${f(hh)}" fill="${C.accent}"/>`;
      }
      parts.forEach(p => {
        if (mode === 'marker' && p.hi)
          body += `<rect x="${f(x - 6)}" y="${f(y - size * 0.18)}" width="${f(p.w + 12)}" height="${f(size * 0.5)}" rx="${f(size * 0.12)}" fill="${C.yellow}" opacity="0.9" transform="rotate(-2 ${f(x)} ${f(y)})"/>`;
        const fill = mode === 'news' && p.hi ? C.accent : C.ink;
        // white outline keeps marker text readable over drawings, but not where the highlighter is
        const extra = mode === 'marker' && !p.hi ? `stroke="#fff" stroke-width="${f(size * 0.08)}" stroke-linejoin="round" paint-order="stroke"` : '';
        body += `<text x="${f(x)}" y="${f(y + (mode === 'news' ? size * 0.04 : 0))}" font-family="${font}" font-weight="${weight}" font-size="${f(size)}" fill="${fill}" text-anchor="start" dominant-baseline="central" style="white-space:pre" ${extra}>${esc(p.s)}</text>`;
        x += p.w;
      });
    });
    return body;
  }
  const lines = text.split('\n');
  const plain = l => l.replace(/\*/g, '');
  const widest = Math.max(...lines.map(l => measure(plain(l), size, 400, HEAD_FONT)));
  if (widest > maxW) size *= maxW / widest;
  const y0 = cy - (lines.length - 1) * size * 0.55;
  let body = '';
  lines.forEach((l, li) => {
    const spans = l.split(/(\*[^*]+\*)/).filter(Boolean).map(part => part.startsWith('*')
      ? `<tspan fill="${C.yellow}">${esc(part.slice(1, -1))}</tspan>` : `<tspan>${esc(part)}</tspan>`).join('');
    const y = y0 + li * size * 1.1;
    const base = `x="${f(cx)}" font-family="${HEAD_FONT}" font-size="${f(size)}" text-anchor="middle" dominant-baseline="central"`;
    body += `<text ${base} y="${f(y + size * 0.09)}" fill="#000" opacity="0.18" stroke="#000" stroke-width="${f(outline + 1)}" stroke-linejoin="round">${esc(plain(l))}</text>`;
    body += `<text ${base} y="${f(y)}" fill="#fff" stroke="${C.ink}" stroke-width="${outline}" stroke-linejoin="round" paint-order="stroke">${spans}</text>`;
  });
  return body;
}

function setHeadlines(list) {
  HEADS = [...list].sort((a, b) => a.at - b.at);
  // a headline must be gone before the next one comes in
  HEADS.forEach((h, i) => {
    const next = HEADS[i + 1];
    h.outAt = next ? Math.min(h.end, next.at - 0.2) : h.end;
    h.outDur = next && next.at - 0.2 < h.end + 0.3 ? 0.2 : 0.3;
  });
}
function headlines(t) {
  let s = '';
  HEADS.forEach((h, i) => {
    if (t < h.at || t > h.outAt + h.outDur) return;
    const pin = P(t, h.at, 0.3), pout = P(t, h.outAt, h.outDur, E.inCubic);
    const o = pin * (1 - pout), blur = 9 * (1 - pin) + 9 * pout;
    const sc = 0.88 + 0.12 * E.outBack(clamp((t - h.at) / 0.35));
    const body = titleText(h.text, 540, h.y || 360, h.size || 92);
    const filt = blur > 0.3 ? `<filter id="hb${i}" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="${f(blur)}"/></filter>` : '';
    s += filt + `<g opacity="${f(o)}"${filt ? ` filter="url(#hb${i})"` : ''} transform="translate(540 ${h.y || 360}) scale(${f(sc)}) translate(-540 ${-(h.y || 360)})">${body}</g>`;
  });
  return s;
}

// chapter badge in the top-right corner; at `recap` every icon lines up with a check mark
// list: [{at, icon: (size) => svg}], recap: {at, end}
function setChapters(list, recap = null) { CHAP = { list, recap }; }
function chapterBadges(t) {
  const frame = fill => TH.badge === 'square' ? `<rect x="-44" y="-44" width="88" height="88" rx="12" fill="${fill}" ${stroke(5)}/>`
    : TH.badge === 'sketch' ? `<circle r="46" fill="${fill}" ${stroke(4)}/><circle cx="2" cy="1" r="44" fill="none" ${stroke(1.6)} opacity="0.5"/>`
    : `<circle r="46" fill="${fill}" ${stroke(6)}/>`;
  const badge = (x, y, inner, s, o, fill = '#fff') => G(T(x, y, s), o, frame(fill) + inner);
  const r = CHAP.recap;
  if (r && t >= r.at && t < r.end) {
    const done = CHAP.list.filter(c => c.at < r.at);
    const n = done.length + 1, gap = 112, x0 = 540 - (n - 1) * gap / 2;
    let s = '';
    done.forEach((c, i) => { const p = pop(t, r.at + i * 0.12, 0.4); s += badge(x0 + i * gap, 190, c.icon(28), p.s, p.o); });
    const p = pop(t, r.at + done.length * 0.12 + 0.15, 0.45);
    s += badge(x0 + (n - 1) * gap, 190, `<path d="M-20,2 L-6,16 L22,-14" fill="none" ${stroke(9, '#fff')}/>`, p.s, p.o, C.leaf || '#5FA548');
    return s;
  }
  const cur = CHAP.list.filter(c => t >= c.at).pop();
  if (!cur) return '';
  const p = pop(t, cur.at, 0.45);
  return badge(950, 190, cur.icon(28), p.s, p.o);
}

// small subtitles: spoken words dark, upcoming words faded, *keywords* get a yellow marker
function smallCaptions(t) {
  const ch = D.captions.find(c => t >= c.start && t < c.end);
  if (!ch) return '';
  const p = P(t, ch.start, 0.18);
  const cap = TH.cap, bar = cap.mode === 'bar';
  let size = cap.size;
  const gapW = size * 0.3;
  const lineW = l => l.reduce((w, x) => w + measure(x.w, size, cap.weight, cap.font) + gapW, -gapW);
  const maxW = Math.max(...ch.lines.map(lineW));
  if (maxW > 860) size *= 860 / maxW;
  const lh = size * 1.3, y0 = 1500 - (ch.lines.length - 1) * lh / 2;
  let s = '';
  if (bar) {  // news lower third: a dark bar with a red edge
    const bw = Math.max(...ch.lines.map(lineW)) * (size / cap.size) + 70, bh = ch.lines.length * lh + 26;
    s += `<rect x="${f(540 - bw / 2)}" y="${f(y0 - lh / 2 - 13)}" width="${f(bw)}" height="${f(bh)}" rx="8" fill="${C.ink}" opacity="0.93"/>` +
      `<rect x="${f(540 - bw / 2)}" y="${f(y0 - lh / 2 - 13)}" width="12" height="${f(bh)}" rx="4" fill="${C.accent}"/>`;
  }
  ch.lines.forEach((line, li) => {
    const widths = line.map(x => measure(x.w, size, cap.weight, cap.font));
    let x = 540 - (widths.reduce((a, b) => a + b, 0) + gapW * (line.length - 1)) / 2;
    line.forEach((wd, wi) => {
      const w = widths[wi], y = y0 + li * lh, spoken = t >= wd.t - 0.05;
      if (wd.kw && spoken && !bar) {
        const m = P(t, wd.t - 0.05, 0.2), hh = cap.mode === 'hand' ? size * 0.5 : size * 0.78;
        s += `<rect x="${f(x - 8)}" y="${f(y - hh * 0.4)}" width="${f((w + 16) * m)}" height="${f(hh)}" rx="8" fill="${C.yellow}" transform="rotate(-1.5 ${f(x)} ${f(y)})"/>`;
      }
      const fill = bar ? (wd.kw && spoken ? C.yellow : '#fff') : C.ink;
      const marked = wd.kw && spoken && !bar;
      const outline = bar ? '' : `stroke="${marked && cap.mode === 'hand' ? C.yellow : '#fff'}" stroke-width="${f(size * (cap.mode === 'hand' ? 0.12 : 0.2))}" stroke-linejoin="round" paint-order="stroke"`;
      s += `<text x="${f(x + w / 2)}" y="${f(y + 2)}" font-family="${cap.font}" font-weight="${cap.weight}" font-size="${f(size)}" fill="${fill}" text-anchor="middle" dominant-baseline="central" ${outline}${spoken ? '' : ' opacity="0.5"'}>${esc(wd.w)}</text>`;
      x += w + gapW;
    });
  });
  return G('', p, s);
}

// rubber stamp that slams onto the screen ("MITOS!", "FAKTA!")
function stamp(label, t, ts, x, y, col = C.accent, rot = -8, size = 130) {
  if (t < ts - 0.18) return '';
  const p = t - (ts - 0.18);
  let s = 1, o = 1;
  if (p < 0.18) { s = 2.4 - 1.4 * E.inCubic(p / 0.18); o = clamp(p / 0.08); }
  else { const u = p - 0.18; s = 1 - 0.07 * Math.exp(-9 * u) * Math.sin(24 * u); }
  const w = measure(label, size, 400, HEAD_FONT) + 110, h = size * 1.5;
  let out = '';
  if (p > 0.18) {
    const b = clamp((p - 0.18) / 0.4);
    for (let k = 0; k < 12; k++) {
      const a = k * Math.PI / 6 + 0.2, r1 = w * 0.55 + 120 * E.outCubic(b), r2 = r1 + 50 * (1 - b);
      out += `<line x1="${f(x + r1 * Math.cos(a))}" y1="${f(y + r1 * Math.sin(a) * 0.7)}" x2="${f(x + r2 * Math.cos(a))}" y2="${f(y + r2 * Math.sin(a) * 0.7)}" ${stroke(9, col)} opacity="${f(1 - b)}"/>`;
    }
  }
  if (TH.stamp === 'label') {  // news: a solid red label, e.g. "HOAKS" / "FAKTA"
    const fw = measure(label.toUpperCase(), size * 0.9, 700, 'Oswald') + 90;
    return out + G(T(x, y, s, rot * 0.5), o,
      `<rect x="${f(-fw / 2 + 10)}" y="${f(-h / 2 + 10)}" width="${f(fw)}" height="${f(h)}" fill="${C.ink}" opacity="0.25"/>` +
      `<rect x="${f(-fw / 2)}" y="${f(-h / 2)}" width="${f(fw)}" height="${f(h)}" fill="${col}"/>` +
      `<rect x="${f(-fw / 2 + 10)}" y="${f(-h / 2 + 10)}" width="${f(fw - 20)}" height="${f(h - 20)}" fill="none" stroke="#fff" stroke-width="4"/>` +
      `<text x="0" y="4" font-family="Oswald" font-weight="700" font-size="${f(size * 0.9)}" fill="#fff" text-anchor="middle" dominant-baseline="central" letter-spacing="6">${esc(label.toUpperCase())}</text>`);
  }
  if (TH.stamp === 'circle') {  // notebook: the word written in red marker and circled twice
    const cw = measure(label, size * 1.2, 700, 'Caveat') * 0.62 + 70;
    return out + G(T(x, y, s, rot), o,
      `<ellipse rx="${f(cw)}" ry="${f(size * 0.82)}" fill="#fff" opacity="0.85"/>` +
      `<ellipse rx="${f(cw)}" ry="${f(size * 0.8)}" fill="none" ${stroke(8, col)} transform="rotate(-4)"/>` +
      `<ellipse rx="${f(cw * 1.04)}" ry="${f(size * 0.74)}" fill="none" ${stroke(4, col)} opacity="0.7" transform="rotate(5)"/>` +
      `<text x="0" y="0" font-family="Caveat" font-weight="700" font-size="${f(size * 1.2)}" fill="${col}" text-anchor="middle" dominant-baseline="central">${esc(label)}</text>`);
  }
  return out + G(T(x, y, s, rot), o,
    `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="26" fill="#fff" opacity="0.95"/>` +
    `<rect x="${f(-w / 2 + 12)}" y="${f(-h / 2 + 12)}" width="${f(w - 24)}" height="${f(h - 24)}" rx="18" fill="none" stroke="${col}" stroke-width="11"/>` +
    `<text x="0" y="6" font-family="${HEAD_FONT}" font-size="${size}" fill="${col}" text-anchor="middle" dominant-baseline="central" letter-spacing="4">${esc(label)}</text>`);
}

// small source note, so viewers can check the claim
function cite(text, t, t0, t1, y = 1395) {
  const o = P(t, t0, 0.3) * (1 - P(t, t1, 0.3));
  if (o <= 0) return '';
  if (TH.cap.mode === 'bar') {
    const w = measure(text, 26, 500, 'Oswald') + 44;
    return G('', o, `<rect x="${f(540 - w / 2)}" y="${y - 22}" width="${f(w)}" height="44" fill="#fff" opacity="0.92"/>` +
      `<rect x="${f(540 - w / 2)}" y="${y - 22}" width="8" height="44" fill="${C.accent}"/>` +
      `<text x="544" y="${y + 1}" font-family="Oswald" font-weight="500" font-size="26" fill="${C.ink}" text-anchor="middle" dominant-baseline="central">${esc(text)}</text>`);
  }
  if (TH.cap.mode === 'hand') return G('', o, hand(text, 540, y, 38, C.muted));
  const size = 26, w = measure(text, size, 800) + 40;
  return G('', o, `<rect x="${f(540 - w / 2)}" y="${y - 22}" width="${f(w)}" height="44" rx="22" fill="#fff" opacity="0.85" ${stroke(3, C.line)}/>` +
    txt(text, 540, y + 1, size, C.muted, 800));
}

// handwritten note
const hand = (s, x, y, size, fill = C.ink, anchor = 'middle', extra = '') =>
  `<text x="${f(x)}" y="${f(y)}" font-family="Caveat" font-weight="700" font-size="${f(size)}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="central" ${extra}>${esc(s)}</text>`;

// seeded paper texture (grain, mottling, fibres), multiplied over the world.
// kind: 'paper' (warm), 'newsprint' (cool grey, coarser grain), 'notebook' (clean page with ruled lines)
function paperTexture(w, h, seed = 7, kind = 'paper') {
  let a = seed;
  const rand = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let x = Math.imul(a ^ a >>> 15, 1 | a); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  const look = {
    paper: { blot: [140, 110, 70, 0.06], blots: 70, fibre: 'rgba(120,95,60,0.07)', fibres: 500, grain: 24 },
    newsprint: { blot: [70, 76, 90, 0.07], blots: 90, fibre: 'rgba(60,66,82,0.08)', fibres: 900, grain: 34 },
    notebook: { blot: [120, 130, 150, 0.025], blots: 20, fibre: 'rgba(90,100,120,0.03)', fibres: 150, grain: 10 },
  }[kind] || {};
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < look.blots; i++) {
    const x = rand() * w, y = rand() * h, r = 80 + rand() * 300, [cr, cg, cb, ca] = look.blot;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${cr},${cg},${cb},${ca})`); gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  g.strokeStyle = look.fibre; g.lineWidth = 1;
  for (let i = 0; i < look.fibres; i++) {
    const x = rand() * w, y = rand() * h, l = 6 + rand() * 18, an = rand() * Math.PI;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + l * Math.cos(an), y + l * Math.sin(an)); g.stroke();
  }
  if (kind === 'notebook') {  // ruled lines and a red margin, printed on the page
    g.strokeStyle = '#C6DAEC'; g.lineWidth = 3;
    for (let y = 118; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = '#F2A7A7'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(96, 0); g.lineTo(96, h); g.stroke();
  }
  const img = g.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rand() - 0.5) * look.grain; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(img, 0, 0);
  return cv.toDataURL('image/png');
}

// ---------- frame ----------
let D = null;
const TRANS = 0.45;
const HEAD_FONT = 'Lilita One';
const worldMode = () => typeof drawWorld === 'function';

function stage(i, t) {
  return scenes[i].draw(t, D.scenes[i]);
}

// the original card layout: header, framed panel, push transitions, karaoke captions
function panelFrame(t) {
  let i = 0;
  while (i + 1 < D.scenes.length && t >= D.scenes[i + 1].start) i++;
  const S = D.scenes[i];
  let s = `<defs><radialGradient id="blob"><stop offset="0" stop-color="${C.blob}"/><stop offset="1" stop-color="${C.blob}" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect width="1080" height="1920" fill="${C.bg}"/>`;
  s += `<circle cx="${f(160 + 70 * Math.sin(t * 0.35))}" cy="${f(420 + 90 * Math.cos(t * 0.27))}" r="460" fill="url(#blob)"/>`;
  s += `<circle cx="${f(960 + 60 * Math.cos(t * 0.31))}" cy="${f(1620 + 80 * Math.sin(t * 0.4))}" r="420" fill="url(#blob)"/>`;

  // header: progress + series label
  s += `<rect x="140" y="195" width="800" height="12" rx="6" fill="${C.line}"/>`;
  s += `<rect x="140" y="195" width="${f(Math.max(12, 800 * t / D.total))}" height="12" rx="6" fill="${C.ink}"/>`;
  const hw = measure(D.header, 30, 900) + 60;
  s += `<rect x="${f(540 - hw / 2)}" y="252" width="${f(hw)}" height="58" rx="29" fill="${C.line}"/>`;
  s += txt(D.header, 540, 283, 30, C.ink, 900, 'middle', 'letter-spacing="3"');

  // stage, with a push transition between scenes that don't continue each other
  const breathe = 1 + 0.012 * Math.sin(t * 0.9);
  const cam = inner => `<g transform="translate(540 790) scale(${f(breathe)}) translate(-540 -790)">${inner}</g>`;
  if (i > 0 && !S.cont && t < S.start + TRANS) {
    const e = E.inOutCubic(clamp((t - S.start) / TRANS));
    s += G(T(-1100 * e, 0), 1, cam(stage(i - 1, t)));
    s += G(T(1100 * (1 - e), 0), 1, cam(stage(i, t)));
  } else {
    s += cam(stage(i, t));
  }
  return s + captions(t);
}

function renderAt(t) {
  let world, ui = '';
  if (worldMode()) {
    const cam = cameraAt(t);
    world = `<g transform="translate(540 ${VIEW_CY}) scale(${f(cam.z)}) translate(${f(-cam.x)} ${f(-cam.y)})">${drawWorld(t, cam)}</g>`;
    if (typeof drawOverlay === 'function') ui += drawOverlay(t, cam);
    ui += headlines(t) + chapterBadges(t) + smallCaptions(t);
    // channel handle top-left: the bottom of a Short is covered by YouTube's title and buttons
    if (D.watermark) {
      const [wf, ww] = TH.cap.mode === 'bar' ? ['Oswald', 600] : TH.cap.mode === 'hand' ? ['Caveat', 700] : [FONT, 900];
      ui += `<text x="64" y="190" font-family="${wf}" font-weight="${ww}" font-size="${TH.cap.mode === 'hand' ? 40 : 32}" fill="${C.ink}" dominant-baseline="central" stroke="#fff" stroke-width="7" paint-order="stroke" opacity="0.55">${esc(D.watermark)}</text>`;
    }
  } else {
    world = panelFrame(t);
  }
  document.getElementById('world').innerHTML = world;
  document.getElementById('ui').innerHTML = ui;
}

// a topic's drawThumbnail() returns the 1080x1920 picture: a string, or {world, ui} where ui sits
// above the paper texture and vignette (use it for titles so they stay crisp)
function renderThumbnail() {
  if (typeof drawThumbnail !== 'function') throw new Error('this topic has no drawThumbnail()');
  const r = drawThumbnail();
  document.getElementById('world').innerHTML = typeof r === 'string' ? r : r.world;
  document.getElementById('ui').innerHTML = typeof r === 'string' ? '' : r.ui || '';
}

// set the palette, background and page texture of a theme (THEMES) on the static layers
function applyTheme(name, w, h) {
  if (!THEMES[name]) throw new Error(`unknown theme "${name}" (${Object.keys(THEMES).join(', ')})`);
  TH = THEMES[name];
  Object.assign(C, PAPER, TH.palette || {});
  document.getElementById('bg').setAttribute('fill', C.bg);
  document.getElementById('tex').setAttribute('href', paperTexture(w, h, 7, TH.texture));
  const show = (id, on) => on ? document.getElementById(id).removeAttribute('display') : document.getElementById(id).setAttribute('display', 'none');
  show('tex', true); show('glow', TH.glow); show('vig', TH.vignette);
}

async function init(data) {
  D = data;
  if (!worldMode() && scenes.length !== D.scenes.length) throw new Error(`scenes.js has ${scenes.length} scenes, script has ${D.scenes.length}`);
  D.scenes.forEach(S => {
    S.at = (word, delta = 0) => {
      const key = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      const w = S.words.find(x => x.w.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(key));
      if (!w) throw new Error(`word "${word}" not spoken in scene: ${S.vo}`);
      return w.t - 0.06 + delta;
    };
  });
  D.captions.forEach(c => {
    const flat = c.lines.flat();
    flat.forEach((w, k) => w.next = k + 1 < flat.length ? flat[k + 1].t - 0.05 : c.end);
  });
  // each query must match a bundled face (fonts.check() is also true when nothing matches at all)
  const faces = await Promise.all([`900 72px ${FONT}`, `800 30px ${FONT}`, `72px "${HEAD_FONT}"`, '700 40px Caveat', '700 40px Oswald']
    .map(q => document.fonts.load(q)));
  await document.fonts.ready;
  const fontsOk = faces.every(list => list.length > 0);
  if (D.style === 'paper') applyTheme(D.theme || 'paper', 1080, 1920);
  if (typeof setup === 'function') setup(D);
  return fontsOk;
}

// warm paper palette used by world-mode topics (style: "paper")
const PAPER = {
  bg: '#F1E8D8', ink: '#1F1B16', muted: '#857C6E', line: '#DDD2BF',
  yellow: '#F5B83D', accent: '#E0522F', cool: '#2F5E9E', leaf: '#5FA548',
};

function getCues() {
  if (worldMode()) return typeof cues === 'function' ? cues(D) : [];
  const out = [];
  D.scenes.forEach((S, i) => {
    if (i > 0 && !S.cont) out.push([S.start, 'whoosh']);
    scenes[i].cues(S).forEach(c => out.push(c));
  });
  return out;
}
