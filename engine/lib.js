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
  paper: { texture: 'paper', glow: true, vignette: true, fx: 'ink',
    grade: { sat: 1.12, contrast: 1.05 },
    head: { mode: 'outline' }, cap: { mode: 'marker', font: 'Nunito', weight: 900, size: 64 },
    stamp: 'rubber', badge: 'round' },
  newsprint: { texture: 'newsprint', glow: false, vignette: true, fx: 'soft',
    grade: { sat: 1.0, contrast: 1.08 },
    palette: { bg: '#E9E5DC', ink: '#18223A', muted: '#5F6676', line: '#C9C3B6', yellow: '#F2C14E', accent: '#C8312B', cool: '#1F4E8C', leaf: '#2E8B57' },
    head: { mode: 'news', font: 'Oswald', weight: 700 }, cap: { mode: 'bar', font: 'Oswald', weight: 500, size: 52 },
    stamp: 'label', badge: 'square' },
  notebook: { texture: 'notebook', glow: false, vignette: false, fx: 'doodle',
    grade: { sat: 1.08, contrast: 1.03 },
    palette: { bg: '#FCFCF7', ink: '#26262E', muted: '#7A7A84', line: '#BFD6EA', yellow: '#E4F05C', accent: '#E0522F', cool: '#2F6FB5', leaf: '#5DA544' },
    head: { mode: 'marker', font: 'Caveat', weight: 700 }, cap: { mode: 'hand', font: 'Caveat', weight: 700, size: 76 },
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

function wordsOf(line, size, weight, font) {
  const segs = line.split(/(\*[^*]+\*)/).filter(Boolean);
  const words = [];
  const spaceW = measure(' ', size, weight, font);
  segs.forEach(seg => {
    const hi = seg.startsWith('*');
    const clean = hi ? seg.slice(1, -1) : seg;
    const tokens = clean.split(/\s+/).filter(Boolean);
    tokens.forEach(tk => {
      words.push({ text: tk, hi, w: measure(tk, size, weight, font) });
    });
  });
  const width = words.reduce((a, b) => a + b.w, 0) + Math.max(0, words.length - 1) * spaceW;
  return { words, width, spaceW };
}

// {at, end, text, y?, size?}; words wrapped in *stars* are highlighted, "\n" breaks lines
// big title (headlines, thumbnails) in the theme's style: *word* is highlighted, "\n" breaks lines,
// shrinks to fit maxW, lines centred on (cx, cy). anim(i, isKw, word) optional for kinetic stagger
function titleText(text, cx, cy, size, maxW = 780, outline = 15, anim = null) {
  const mode = TH.head.mode;
  if (!anim) {
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

  // Kinetic layout word by word
  let globalWordIdx = 0;
  if (mode === 'news' || mode === 'marker') {
    const font = TH.head.font, weight = TH.head.weight;
    if (mode === 'news') text = text.toUpperCase(); else size *= 1.3;
    const lines = text.split('\n');
    const lineInfos = lines.map(l => wordsOf(l, size, weight, font));
    const widest = Math.max(...lineInfos.map(li => li.width));
    if (widest > maxW) {
      const scale = maxW / widest;
      size *= scale;
      lineInfos.forEach((li, idx) => { lineInfos[idx] = wordsOf(lines[idx], size, weight, font); });
    }
    const lh = size * (mode === 'news' ? 1.22 : 1.0), y0 = cy - (lines.length - 1) * lh / 2;
    let body = '';
    lineInfos.forEach((info, li) => {
      const y = y0 + li * lh;
      let x = cx - info.width / 2;
      if (mode === 'news') {
        const pad = size * 0.28, hh = size * 1.12;
        const stripP = anim.stripProgress !== undefined ? anim.stripProgress : 1;
        const totalStripW = (info.width + 2 * pad) * stripP;
        body += `<rect x="${f(x - pad + 8)}" y="${f(y - hh / 2 + 8)}" width="${f(totalStripW)}" height="${f(hh)}" fill="${C.ink}" opacity="0.2"/>` +
          `<rect x="${f(x - pad)}" y="${f(y - hh / 2)}" width="${f(totalStripW)}" height="${f(hh)}" fill="#fff"/>` +
          `<rect x="${f(x - pad)}" y="${f(y - hh / 2)}" width="${f(Math.min(size * 0.12, totalStripW))}" height="${f(hh)}" fill="${C.accent}"/>`;
      }
      info.words.forEach(w => {
        const a = anim(globalWordIdx, w.hi, w);
        globalWordIdx++;
        const wx = x + w.w / 2;
        const fill = mode === 'news' && w.hi ? C.accent : C.ink;
        if (mode === 'marker' && w.hi) {
          const mP = a.markerProgress !== undefined ? a.markerProgress : 1;
          body += `<g transform="translate(${f(wx)} ${f(y + a.dy)}) scale(${f(a.s)}) rotate(${f(a.rot)})" opacity="${f(a.o)}">` +
            `<rect x="${f(-w.w / 2 - 6)}" y="${f(-size * 0.18)}" width="${f((w.w + 12) * mP)}" height="${f(size * 0.5)}" rx="${f(size * 0.12)}" fill="${C.yellow}" opacity="0.9" transform="rotate(-2)"/>` +
            `<text x="0" y="0" font-family="${font}" font-weight="${weight}" font-size="${f(size)}" fill="${fill}" text-anchor="middle" dominant-baseline="central">${esc(w.text)}</text>` +
            `</g>`;
        } else {
          const extra = mode === 'marker' && !w.hi ? `stroke="#fff" stroke-width="${f(size * 0.08)}" stroke-linejoin="round" paint-order="stroke"` : '';
          body += `<g transform="translate(${f(wx)} ${f(y + a.dy + (mode === 'news' ? size * 0.04 : 0))}) scale(${f(a.s)}) rotate(${f(a.rot)})" opacity="${f(a.o)}">` +
            `<text x="0" y="0" font-family="${font}" font-weight="${weight}" font-size="${f(size)}" fill="${fill}" text-anchor="middle" dominant-baseline="central" ${extra}>${esc(w.text)}</text>` +
            `</g>`;
        }
        x += w.w + info.spaceW;
      });
    });
    return body;
  }

  // Paper mode (outline)
  const lines = text.split('\n');
  const lineInfos = lines.map(l => wordsOf(l, size, 400, HEAD_FONT));
  const widest = Math.max(...lineInfos.map(li => li.width));
  if (widest > maxW) {
    const scale = maxW / widest;
    size *= scale;
    lineInfos.forEach((li, idx) => { lineInfos[idx] = wordsOf(lines[idx], size, 400, HEAD_FONT); });
  }
  const y0 = cy - (lines.length - 1) * size * 0.55;
  let body = '';
  lineInfos.forEach((info, li) => {
    const y = y0 + li * size * 1.1;
    let x = cx - info.width / 2;
    info.words.forEach(w => {
      const a = anim(globalWordIdx, w.hi, w);
      globalWordIdx++;
      const wx = x + w.w / 2;
      const fill = w.hi ? C.yellow : '#fff';
      const wordSvg = `<text x="0" y="${f(size * 0.09)}" font-family="${HEAD_FONT}" font-size="${f(size)}" text-anchor="middle" dominant-baseline="central" fill="#000" opacity="0.18" stroke="#000" stroke-width="${f(outline + 1)}" stroke-linejoin="round">${esc(w.text)}</text>` +
        `<text x="0" y="0" font-family="${HEAD_FONT}" font-size="${f(size)}" text-anchor="middle" dominant-baseline="central" fill="${fill}" stroke="${C.ink}" stroke-width="${outline}" stroke-linejoin="round" paint-order="stroke">${esc(w.text)}</text>`;
      body += `<g transform="translate(${f(wx)} ${f(y + a.dy)}) scale(${f(a.s)}) rotate(${f(a.rot)})" opacity="${f(a.o)}">${wordSvg}</g>`;
      x += w.w + info.spaceW;
    });
  });
  return body;
}

function setHeadlines(list) {
  HEADS = [...list].sort((a, b) => a.at - b.at);
  HEADS.forEach((h, i) => {
    const next = HEADS[i + 1];
    h.outAt = next ? Math.min(h.end, next.at - 0.2) : h.end;
    h.outDur = next && next.at - 0.2 < h.end + 0.3 ? 0.2 : 0.3;
  });
}
function headlines(t) {
  let s = '';
  HEADS.forEach(h => {
    if (t < h.at || t > h.outAt + h.outDur) return;
    const pout = P(t, h.outAt, h.outDur, E.inCubic);
    const exitO = 1 - pout;
    const exitDy = -20 * pout;
    const stripProgress = P(t, h.at, 0.2);

    const animFn = (wordIdx, isKw) => {
      const tWord = h.at + wordIdx * 0.07;
      const pu = clamp((t - tWord) / 0.25);
      const s = 0.4 + 0.6 * E.outBack(pu);
      const dy = (1 - E.outCubic(pu)) * 40;
      const o = clamp((t - tWord) / 0.12);
      const rot = (isKw && pu >= 1) ? 2.5 * Math.sin((t - tWord - 0.25) * 8) : 0;
      const markerProgress = P(t, tWord, 0.2);
      return { s, o, dy, rot, markerProgress };
    };
    animFn.stripProgress = stripProgress;

    const body = titleText(h.text, 540, h.y || 360, h.size || 92, 780, 15, animFn);
    s += `<g opacity="${f(exitO)}" transform="translate(0 ${f(exitDy)})">${body}</g>`;
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
  if (D.captionMode === 'pill') return pillCaptions(t, ch);
  const p = P(t, ch.start, 0.18);
  const cap = TH.cap, bar = cap.mode === 'bar';
  const size = ch.renderSize || cap.size;
  const gapW = size * 0.3;
  const lines = ch.wrappedLines || ch.lines;
  const lineW = l => l.reduce((w, x) => w + measure(x.w, size, cap.weight, cap.font) + gapW, -gapW);
  const lh = size * 1.3, y0 = 1500 - (lines.length - 1) * lh / 2;
  const slideDy = (1 - p) * 24;
  let s = '';
  if (bar) {
    const maxLineW = Math.max(...lines.map(lineW));
    const bw = maxLineW + 70, bh = lines.length * lh + 26;
    s += `<rect x="${f(540 - bw / 2)}" y="${f(y0 - lh / 2 - 13)}" width="${f(bw)}" height="${f(bh)}" rx="8" fill="${C.ink}" opacity="0.93"/>` +
      `<rect x="${f(540 - bw / 2)}" y="${f(y0 - lh / 2 - 13)}" width="12" height="${f(bh)}" rx="4" fill="${C.accent}"/>`;
  }
  lines.forEach((line, li) => {
    const widths = line.map(x => measure(x.w, size, cap.weight, cap.font));
    const totalLineW = widths.reduce((a, b) => a + b, 0) + gapW * (line.length - 1);
    let x = 540 - totalLineW / 2;
    line.forEach((wd, wi) => {
      const w = widths[wi], y = y0 + li * lh;
      const spoken = t >= wd.t - 0.05;
      const active = spoken && t < (wd.next || ch.end);
      let wscale = 1, wlift = 0;
      if (active) {
        const u = clamp((t - (wd.t - 0.05)) / 0.16);
        wscale = 1 + 0.18 * (1 - E.outBack(u));
        wlift = -4 * (1 - u);
      }
      let wordSvg = '';
      if (wd.kw && spoken && !bar) {
        const m = P(t, wd.t - 0.05, 0.2), hh = cap.mode === 'hand' ? size * 0.5 : size * 0.78;
        wordSvg += `<rect x="${f(-w / 2 - 8)}" y="${f(-hh * 0.4)}" width="${f((w + 16) * m)}" height="${f(hh)}" rx="8" fill="${C.yellow}" transform="rotate(-1.5)"/>`;
      }
      const fill = bar ? (wd.kw && spoken ? C.yellow : '#fff') : C.ink;
      const marked = wd.kw && spoken && !bar;
      const outline = bar ? '' : `stroke="${marked && cap.mode === 'hand' ? C.yellow : '#fff'}" stroke-width="${f(size * (cap.mode === 'hand' ? 0.12 : 0.2))}" stroke-linejoin="round" paint-order="stroke"`;
      wordSvg += `<text x="0" y="2" font-family="${cap.font}" font-weight="${cap.weight}" font-size="${f(size)}" fill="${fill}" text-anchor="middle" dominant-baseline="central" ${outline}${spoken ? '' : ' opacity="0.5"'}>${esc(wd.w)}</text>`;

      s += `<g transform="translate(${f(x + w / 2)} ${f(y + wlift)}) scale(${f(wscale)})">${wordSvg}</g>`;
      x += w + gapW;
    });
  });
  return `<g opacity="${f(p)}" transform="translate(0 ${f(slideDy)})">${s}</g>`;
}

// script.json "captions": {"mode": "pill"}: every line on a dark pill, a yellow box slides from word to word
// behind the one being spoken, spoken *keywords* turn yellow. Readable on busy pictures in any theme.
function pillCaptions(t, ch) {
  const cap = TH.cap, size = ch.renderSize || cap.size, gapW = size * 0.3, pad = size * 0.12;
  const lines = ch.wrappedLines || ch.lines;
  const lh = size * 1.32, y0 = 1500 - (lines.length - 1) * lh / 2;
  const p = P(t, ch.start, 0.18);
  const words = [];
  let s = '';
  lines.forEach((line, li) => {
    const widths = line.map(x => measure(x.w, size, cap.weight, cap.font));
    const lw = widths.reduce((a, b) => a + b, 0) + gapW * (line.length - 1), y = y0 + li * lh, hh = size * 1.18;
    s += `<rect x="${f(540 - lw / 2 - size * 0.4)}" y="${f(y - hh / 2)}" width="${f(lw + size * 0.8)}" height="${f(hh)}" rx="${f(size * 0.28)}" fill="${C.ink}" opacity="0.84"/>`;
    let x = 540 - lw / 2;
    line.forEach((wd, wi) => { words.push({ wd, x: x + widths[wi] / 2, w: widths[wi], y, li }); x += widths[wi] + gapW; });
  });
  // the box slides from the previous word (same line) to the active one; on a new line it pops in
  const k = words.findIndex(o => t >= o.wd.t - 0.05 && t < (o.wd.next || ch.end));
  let q = 1;
  if (k >= 0) {
    const cur = words[k], prev = words[k - 1];
    q = P(t, cur.wd.t - 0.05, 0.12);
    const from = prev && prev.li === cur.li ? prev : null;
    const bx = from ? lerp(from.x, cur.x, q) : cur.x, bw = (from ? lerp(from.w, cur.w, q) : cur.w) + 2 * pad;
    const bs = from ? 1 : 0.6 + 0.4 * E.outBack(q), bh = size * 0.98;
    s += G(T(bx, cur.y, bs), 1, `<rect x="${f(-bw / 2)}" y="${f(-bh / 2)}" width="${f(bw)}" height="${f(bh)}" rx="${f(size * 0.18)}" fill="${C.yellow}"/>`);
  }
  words.forEach((o, i) => {
    // the active word turns dark only once the box is mostly under it
    const spoken = t >= o.wd.t - 0.05, fill = i === k && q > 0.5 ? C.ink : o.wd.kw && spoken ? C.yellow : '#fff';
    s += `<text x="${f(o.x)}" y="${f(o.y + 2)}" font-family="${cap.font}" font-weight="${cap.weight}" font-size="${f(size)}" fill="${fill}" text-anchor="middle" dominant-baseline="central"${spoken ? '' : ' opacity="0.55"'}>${esc(o.wd.w)}</text>`;
  });
  return `<g opacity="${f(p)}" transform="translate(0 ${f((1 - p) * 24)})">${s}</g>`;
}

// progress bar at the top of the screen (y ≈ 28, x 40–1040, 10 px)
function progressBar(t) {
  if (D.progress === false) return '';
  const prog = clamp(t / D.total);
  const x0 = 40, w = 1000, h = 10, y = 28;
  let s = '';
  if (TH.fx === 'soft') {
    s += `<rect x="${x0}" y="${y - 4}" width="${w}" height="8" fill="${C.line}" opacity="0.6"/>`;
    s += `<rect x="${x0}" y="${y - 4}" width="${f(w * prog)}" height="8" fill="${C.accent}"/>`;
  } else if (TH.fx === 'doodle') {
    s += `<rect x="${x0}" y="${y - 6}" width="${f(w * prog)}" height="12" rx="3" fill="${C.yellow}" opacity="0.85"/>`;
    const step = Math.floor(t * 8);
    const pts = [[x0, y], [x0 + w * 0.33, y + (rnd(step) - 0.5) * 3], [x0 + w * 0.66, y + (rnd(step + 1) - 0.5) * 3], [x0 + w, y]];
    s += `<path d="M${pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L')}" fill="none" ${stroke(2.5, C.ink)}/>`;
  } else {
    s += `<rect x="${x0}" y="${y - 5}" width="${w}" height="${h}" rx="5" fill="${C.line}" stroke="${C.ink}" stroke-width="2"/>`;
    s += `<rect x="${x0}" y="${y - 5}" width="${f(Math.max(10, w * prog))}" height="${h}" rx="5" fill="${C.accent}"/>`;
  }
  if (CHAP && CHAP.list && CHAP.list.length > 0) {
    CHAP.list.forEach(c => {
      const tx = x0 + w * clamp(c.at / D.total);
      s += `<line x1="${f(tx)}" y1="${y - 7}" x2="${f(tx)}" y2="${y + 7}" stroke="${C.ink}" stroke-width="2.5" opacity="0.75"/>`;
    });
  }
  return s;
}

let IMPACTS = [];
function impact(t, ts, k = 1) {
  IMPACTS.push({ t, ts, k });
  return '';
}

// rubber stamp that slams onto the screen ("MITOS!", "FAKTA!")
function stamp(label, t, ts, x, y, col = C.accent, rot = -8, size = 130) {
  if (t < ts - 0.18) return '';
  impact(t, ts, 1);
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

// ---------- Paket B helpers ----------

// layer(d, cam, inner, anchor = CAM[0]): parallax layer (d=1 normal, d<1 farther)
function layer(d, cam, inner, anchor = CAM[0]) {
  const A = anchor || { x: 0, y: 0, z: 1 };
  const Z = Math.pow(A.z, 1 - d) * Math.pow(cam.z, d);
  const scale = Z / cam.z;
  const ox = A.x + d * (cam.x - A.x);
  const oy = A.y + d * (cam.y - A.y);
  return `<g transform="translate(${f(cam.x)} ${f(cam.y)}) scale(${f(scale)}) translate(${f(-ox)} ${f(-oy)})">${inner}</g>`;
}

// jitterPath(points, t, seed, amp): wobbly doodle path that boils 8x/s
function jitterPath(points, t, seed = 1, amp = 3) {
  const step = Math.floor(t * 8);
  const pts = points.map((p, i) => {
    const jx = (rnd(seed + i * 17 + step * 31) - 0.5) * 2 * amp;
    const jy = (rnd(seed + i * 29 + step * 43) - 0.5) * 2 * amp;
    return [p[0] + jx, p[1] + jy];
  });
  return `M${pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L')}`;
}

// shadow(x, y, w, o = 0.18): contact shadow adapting to TH.fx
function shadow(x, y, w, o = 0.18) {
  if (TH.fx === 'soft') {
    return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(w * 0.28)}" fill="url(#fxShade)" opacity="${f(o * 3.5)}"/>`;
  }
  if (TH.fx === 'doodle') {
    let s = '';
    const n = 6, ry = w * 0.24;
    for (let i = 0; i < n; i++) {
      const yy = y - ry + (2 * ry * i) / (n - 1);
      const span = Math.sqrt(Math.max(0, 1 - Math.pow((yy - y) / ry, 2))) * w;
      s += `<line x1="${f(x - span)}" y1="${f(yy)}" x2="${f(x + span)}" y2="${f(yy)}" stroke="${C.ink}" stroke-width="2" opacity="${f(o * 1.8)}"/>`;
    }
    return `<g>${s}</g>`;
  }
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(w * 0.28)}" fill="${C.ink}" opacity="${f(o)}"/>`;
}

// burst(t, t0, x, y, opts): radial rays + dots flying out
function burst(t, t0, x, y, { n = 8, r = 80, col = C.accent, dur = 0.4, size = 8 } = {}) {
  if (t < t0 || t > t0 + dur) return '';
  const p = (t - t0) / dur;
  const ep = E.outCubic(p);
  const fade = 1 - p;
  let s = '';
  for (let i = 0; i < n; i++) {
    const an = (i * 2 * Math.PI) / n + 0.1;
    const curR = r * ep;
    const px = x + Math.cos(an) * curR;
    const py = y + Math.sin(an) * curR;
    const curSize = size * fade;
    if (TH.fx === 'doodle') {
      s += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(curSize)}" fill="${col}" stroke="${C.ink}" stroke-width="2" opacity="${f(fade)}"/>`;
    } else if (TH.fx === 'soft') {
      s += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(curSize * 1.2)}" fill="${col}" opacity="${f(fade * 0.9)}"/>`;
    } else {
      s += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(curSize)}" fill="${col}" stroke="${C.ink}" stroke-width="2.5" opacity="${f(fade)}"/>`;
    }
  }
  return s;
}

// confetti(t, t0, x, y, opts): pieces with gravity, spin and flip
function confetti(t, t0, x, y, { n = 16, spread = 200, dur = 1.0 } = {}) {
  if (t < t0 || t > t0 + dur) return '';
  const p = (t - t0) / dur;
  const colors = [C.yellow, C.accent, C.cool, C.leaf];
  let s = '';
  for (let i = 0; i < n; i++) {
    const seed = i * 23;
    const an = (rnd(seed) - 0.5) * Math.PI * 1.5 - Math.PI / 2;
    const spd = spread * (0.5 + 0.7 * rnd(seed + 1));
    const grav = 350 * p * p;
    const px = x + Math.cos(an) * spd * p;
    const py = y + Math.sin(an) * spd * p + grav;
    const rot = (rnd(seed + 2) * 720) * p;
    const flip = Math.cos(p * Math.PI * 6 + rnd(seed + 3) * 6);
    const col = colors[i % colors.length];
    const w = 12 * flip, h = 8;
    const fade = clamp((1 - p) / 0.25);
    const strokeAttr = TH.fx === 'soft' ? '' : `stroke="${C.ink}" stroke-width="1.5"`;
    s += `<g transform="translate(${f(px)} ${f(py)}) rotate(${f(rot)})" opacity="${f(fade)}">` +
      `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(Math.abs(w))}" height="${f(h)}" rx="2" fill="${col}" ${strokeAttr}/>` +
      `</g>`;
  }
  return s;
}

// dustPuff(t, t0, x, y, opts): puffs drifting out and up, fading
function dustPuff(t, t0, x, y, { n = 5, size = 20, dur = 0.4 } = {}) {
  if (t < t0 || t > t0 + dur) return '';
  const p = (t - t0) / dur;
  const ep = E.outCubic(p);
  const fade = 1 - p;
  let s = '';
  for (let i = 0; i < n; i++) {
    const an = (i * Math.PI) / (n - 1) + Math.PI;
    const dist = 60 * ep;
    const px = x + Math.cos(an) * dist;
    const py = y - 15 * ep + (rnd(i * 11) - 0.5) * 10;
    const r = (size * 0.5 + size * 0.5 * ep) * fade;
    if (TH.fx === 'soft') {
      s += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(r)}" fill="${C.muted}" opacity="${f(fade * 0.4)}"/>`;
    } else {
      s += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(r)}" fill="${C.bg}" stroke="${C.muted}" stroke-width="2" opacity="${f(fade * 0.8)}"/>`;
    }
  }
  return s;
}

// impactRing(t, t0, x, y, opts): expanding rings, thinning stroke
function impactRing(t, t0, x, y, { r0 = 20, r1 = 120, col = C.accent, dur = 0.35 } = {}) {
  if (t < t0 || t > t0 + dur) return '';
  const p = (t - t0) / dur;
  const ep1 = E.outCubic(p);
  const ep2 = E.outCubic(clamp(p * 1.3));
  const fade = 1 - p;
  const rad1 = r0 + (r1 - r0) * ep1;
  const rad2 = (r0 + (r1 - r0) * ep2) * 0.75;
  const sw = Math.max(1, 8 * (1 - p));
  let s = `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad1)}" fill="none" stroke="${col}" stroke-width="${f(sw)}" opacity="${f(fade)}"/>`;
  if (rad2 > 5) {
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad2)}" fill="none" stroke="${col}" stroke-width="${f(sw * 0.6)}" opacity="${f(fade * 0.8)}"/>`;
  }
  return s;
}

// speedLines(t, t0, t1, cx, cy, opts): anime focus lines from edges to radius r
function speedLines(t, t0, t1, cx = 540, cy = 960, { r = 260, n = 28, col = C.ink } = {}) {
  if (t < t0 || t > t1) return '';
  const step = Math.floor(t * 12);
  let s = '';
  for (let i = 0; i < n; i++) {
    const an = (i * 2 * Math.PI) / n + (rnd(step * 37 + i) - 0.5) * 0.08;
    const outR = 1200;
    const inR = r + rnd(step * 19 + i * 7) * 90;
    const x1 = cx + Math.cos(an) * outR;
    const y1 = cy + Math.sin(an) * outR;
    const x2 = cx + Math.cos(an) * inR;
    const y2 = cy + Math.sin(an) * inR;
    const sw = 2 + rnd(step * 5 + i) * 4;
    s += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="${f(sw)}" opacity="0.6"/>`;
  }
  return `<g>${s}</g>`;
}

// spotlight(t, t0, t1, x, y, r, dim): dims everything except a circle
function spotlight(t, t0, t1, x = 540, y = 960, r = 240, dim = 0.45) {
  if (t < t0 || t > t1) return '';
  const id = 'sp_' + Math.round(x) + '_' + Math.round(y);
  const rOuter = r * 1.6;
  const stopIn = (r / rOuter).toFixed(3);
  return `<defs><radialGradient id="${id}" cx="${f(x)}" cy="${f(y)}" r="${f(rOuter)}" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0" stop-color="#000" stop-opacity="0"/>` +
    `<stop offset="${stopIn}" stop-color="#000" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="#000" stop-opacity="${f(dim)}"/>` +
    `</radialGradient></defs><rect width="1080" height="1920" fill="url(#${id})"/>`;
}

// toScreen(cam, x, y): world -> screen point
function toScreen(cam, x, y) {
  return {
    x: 540 + (x - cam.x) * cam.z,
    y: VIEW_CY + (y - cam.y) * cam.z,
  };
}

// ---------- Paket C helpers: data cards, scramble, sound stickers, x-ray, cutaway ----------

// body font of the theme, for card text and data: [font, weight, weight for mono data]
const bodyFont = () => TH.fx === 'soft' ? ['Oswald', 500, 600] : TH.fx === 'doodle' ? ['Caveat', 700, 700] : [FONT, 800, 900];
function bodyText(s, x, y, size, fill = C.ink, anchor = 'start', weight = null, extra = '') {
  const [font, w] = bodyFont();
  return `<text x="${f(x)}" y="${f(y)}" font-family="${font}" font-weight="${weight || w}" font-size="${f(size)}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="central" ${extra}>${esc(s)}</text>`;
}

// mono(s, x, y, size, fill, opts): text on a fixed character grid, so digits and scrambled glyphs never
// make the line jump. opts: {anchor: 'start' | 'middle' | 'end', cell (px per character), weight}
function monoWidth(s, size, cell = null) {
  const [font, , wt] = bodyFont();
  return [...s].length * (cell || measure('0', size, wt, font) * 1.12);
}
function mono(s, x, y, size, fill = C.ink, { anchor = 'start', cell = null, weight = null } = {}) {
  const [font, , mw] = bodyFont(), wt = weight || mw;
  const cw = cell || measure('0', size, wt, font) * 1.12, chars = [...s];
  const x0 = x - chars.length * cw * (anchor === 'middle' ? 0.5 : anchor === 'end' ? 1 : 0);
  return chars.map((ch, i) => ch === ' ' ? '' :
    `<text x="${f(x0 + (i + 0.5) * cw)}" y="${f(y)}" font-family="${font}" font-weight="${wt}" font-size="${f(size)}" fill="${fill}" text-anchor="middle" dominant-baseline="central">${esc(ch)}</text>`).join('');
}

// scramble(text, t, t0, dur, opts): the text as random glyphs that lock into place left to right between
// t0 and t0 + dur (fully random before t0). Spaces and punctuation stay. opts: {seed, rate (changes/s), set}
const GLYPHS = { digit: '0123456789', letter: 'ABCDEFGHJKLMNPQRSTUVWXYZ', symbol: '#%&?!@$*' };
function scramble(text, t, t0, dur = 0.6, { seed = 1, rate = 20, set = null } = {}) {
  if (t >= t0 + dur) return text;
  const done = Math.floor(clamp((t - t0) / dur) * text.length), step = Math.floor(t * rate);
  return [...text].map((ch, i) => {
    if (i < done || /[\s.,:·\-\/()]/.test(ch)) return ch;
    const pool = set || (/\d/.test(ch) ? GLYPHS.digit : /[a-z]/i.test(ch) ? GLYPHS.letter : GLYPHS.symbol);
    return pool[Math.floor(rnd(seed * 97 + i * 13 + step * 7) * pool.length)];
  }).join('');
}

// card(t, t0, x, y, w, h, inner, opts): info card centred on (x, y) in the theme's style; pops in at t0 and
// out at tOut. inner is drawn with (0, 0) at the card's top-left corner. opts: {title, tOut, col, rot}
function card(t, t0, x, y, w, h, inner, { title = '', tOut = Infinity, col = C.accent, rot = 0 } = {}) {
  if (t < t0 || t > tOut + 0.3) return '';
  const p = pop(t, t0, 0.45), out = P(t, tOut, 0.25, E.inCubic);
  const L = -w / 2, Tp = -h / 2;
  let s = '';
  if (TH.fx === 'soft') {
    s += `<rect x="${f(L + 6)}" y="${f(Tp + 14)}" width="${f(w)}" height="${f(h)}" rx="18" fill="${C.ink}" opacity="0.14"/>` +
      `<rect x="${f(L)}" y="${f(Tp)}" width="${f(w)}" height="${f(h)}" rx="18" fill="#fff"/>` +
      `<rect x="${f(L)}" y="${f(Tp + 18)}" width="10" height="${f(h - 36)}" fill="${col}"/>`;
    if (title) s += `<text x="${f(L + 40)}" y="${f(Tp + 38)}" font-family="Oswald" font-weight="600" font-size="26" fill="${C.muted}" dominant-baseline="central" letter-spacing="3">${esc(title.toUpperCase())}</text>`;
  } else if (TH.fx === 'doodle') {
    const box = [[L, Tp], [L + w / 2, Tp + 3], [L + w, Tp], [L + w - 3, Tp + h / 2], [L + w, Tp + h], [L + w / 2, Tp + h - 3], [L, Tp + h], [L + 3, Tp + h / 2], [L, Tp]];
    s += `<rect x="${f(L)}" y="${f(Tp)}" width="${f(w)}" height="${f(h)}" fill="#FFFDF2"/>` +
      `<path d="${jitterPath(box, t, 7, 3)}" fill="none" ${stroke(4, C.ink)}/>` +
      `<rect x="${f(-60)}" y="${f(Tp - 18)}" width="120" height="36" fill="${C.yellow}" opacity="0.75" transform="rotate(-4)"/>`;
    if (title) s += hand(title, L + 36, Tp + 46, 40, C.muted, 'start');
  } else {
    s += `<rect x="${f(L + 8)}" y="${f(Tp + 12)}" width="${f(w)}" height="${f(h)}" rx="28" fill="${C.ink}" opacity="0.18"/>` +
      `<rect x="${f(L)}" y="${f(Tp)}" width="${f(w)}" height="${f(h)}" rx="28" fill="#fff" ${stroke(6)}/>`;
    if (title) s += txt(title.toUpperCase(), L + 36, Tp + 40, 24, C.muted, 900, 'start', 'letter-spacing="3"');
  }
  return G(T(x, y, p.s * (1 - 0.1 * out), rot), p.o * (1 - out), s + G(T(L, Tp), 1, inner));
}

// sticker(label, t, ts, x, y, opts): sound-effect word ("TIT-TIT!", "TEK!", "BZZT!") that pops on at ts,
// wobbles and pops off after dur. Lighter than stamp(): no camera shake unless opts.shake > 0.
// opts: {rot, size, col, dur, shake, lines (action marks)}
function sticker(label, t, ts, x, y, { rot = -8, size = 110, col = null, dur = 0.9, shake = 0, lines = true } = {}) {
  const u = t - ts;
  if (u < 0 || u > dur + 0.15) return '';
  if (shake > 0) impact(t, ts, shake);
  const q = P(t, ts + dur, 0.15, E.inCubic);
  const sc = (0.3 + 0.7 * E.outBack(clamp(u / 0.18))) * (1 + 0.2 * q);
  const r = rot + 4 * Math.sin(u * 18) * Math.exp(-4 * u);
  const doodle = TH.fx === 'doodle', soft = TH.fx === 'soft';
  const font = soft ? 'Oswald' : doodle ? 'Caveat' : HEAD_FONT, wt = soft || doodle ? 700 : 400;
  const sz = doodle ? size * 1.25 : size, fill = col || (doodle ? C.accent : C.yellow);
  const chars = [...(soft ? label.toUpperCase() : label)], ws = chars.map(ch => measure(ch, sz, wt, font) + sz * 0.05);
  const total = ws.reduce((a, b) => a + b, 0);
  let s = '', x0 = -total / 2;
  if (soft) {
    s += `<rect x="${f(-total / 2 - 30 + 8)}" y="${f(-sz * 0.62 + 10)}" width="${f(total + 60)}" height="${f(sz * 1.24)}" rx="10" fill="${C.ink}" opacity="0.15"/>` +
      `<rect x="${f(-total / 2 - 30)}" y="${f(-sz * 0.62)}" width="${f(total + 60)}" height="${f(sz * 1.24)}" rx="10" fill="${fill}"/>`;
  }
  // every letter bounces in a little after the one before and sits at its own small tilt;
  // halos go down first so no letter's halo covers its neighbour's outline
  const halo = [], front = [];
  chars.forEach((ch, i) => {
    const li = clamp((u - i * 0.025) / 0.15), cx = x0 + ws[i] / 2;
    const dy = (rnd(i * 7 + 3) - 0.5) * sz * 0.12 - (1 - E.outBack(li)) * sz * 0.3, lr = (rnd(i * 11 + 5) - 0.5) * 12;
    const base = `x="0" y="0" font-family="${font}" font-weight="${wt}" font-size="${f(sz)}" text-anchor="middle" dominant-baseline="central"`;
    const at = g => `<g transform="translate(${f(cx)} ${f(dy)}) rotate(${f(lr)})" opacity="${f(clamp(li * 3))}">${g}</g>`;
    if (soft) front.push(at(`<text ${base} y="${f(sz * 0.04)}" fill="${fill === C.yellow ? C.ink : '#fff'}">${esc(ch)}</text>`));
    else {
      halo.push(at(`<text ${base} fill="#fff" stroke="#fff" stroke-width="${f(sz * (doodle ? 0.14 : 0.32))}" stroke-linejoin="round">${esc(ch)}</text>`));
      front.push(at(doodle ? `<text ${base} fill="${fill}">${esc(ch)}</text>`
        : `<text ${base} fill="${fill}" stroke="${C.ink}" stroke-width="${f(sz * 0.12)}" stroke-linejoin="round" paint-order="stroke">${esc(ch)}</text>`));
    }
    x0 += ws[i];
  });
  s += halo.join('') + front.join('');
  if (lines && !soft) {  // three action marks on each side
    [-1, 1].forEach(side => [-0.5, 0, 0.5].forEach((a, k) => {
      const ax = side * (total / 2 + sz * 0.25), an = a * 0.9 + (side < 0 ? Math.PI : 0), l = sz * (0.35 + 0.15 * (k === 1));
      const pts = [[ax, a * sz * 0.5], [ax + Math.cos(an) * l, a * sz * 0.5 + Math.sin(an) * l]];
      s += doodle ? `<path d="${jitterPath(pts, t, 50 + k + side * 5, 2)}" fill="none" ${stroke(5, C.ink)}/>`
        : `<line x1="${f(pts[0][0])}" y1="${f(pts[0][1])}" x2="${f(pts[1][0])}" y2="${f(pts[1][1])}" ${stroke(sz * 0.07)} opacity="${f(clamp(u / 0.12))}"/>`;
    }));
  }
  return G(T(x, y, sc, r), 1 - q, s);
}

// xray(t, t0, x, y, r, inside, opts): round lens that opens at t0 (and closes at t1) and shows `inside`,
// drawn in the same coordinates as everything around it, through the object's shell.
// opts: {t1, dur, id (unique per lens in a frame), bg (fill behind inside)}
function xray(t, t0, x, y, r, inside, { t1 = Infinity, dur = 0.5, id = 'xr', bg = C.bg } = {}) {
  const rr = r * E.outBack(P(t, t0, dur, E.lin)) * (1 - E.inCubic(P(t, t1, dur * 0.7, E.lin)));
  if (t < t0 || rr < 1) return '';
  let s = `<defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}"/></clipPath></defs>` +
    `<g clip-path="url(#${id})"><circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${bg}"/>${inside}</g>`;
  if (TH.fx === 'soft') {
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr + 6)}" fill="none" stroke="#fff" stroke-width="14"/>` +
      `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr + 14)}" fill="none" stroke="${C.ink}" stroke-width="3" opacity="0.18"/>`;
  } else if (TH.fx === 'doodle') {
    const ring = k => [...Array(33)].map((_, i) => { const a = i / 32 * Math.PI * 2; return [x + (rr + k) * Math.cos(a), y + (rr + k) * Math.sin(a)]; });
    s += `<path d="${jitterPath(ring(0), t, 70, 3)}" fill="none" ${stroke(6, C.ink)}/><path d="${jitterPath(ring(8), t, 90, 3)}" fill="none" ${stroke(2.5, C.ink)} opacity="0.5"/>`;
  } else {
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="none" ${stroke(STROKE * 1.6)}/>` +
      `<path d="M${f(x - rr * 0.62)},${f(y - rr * 0.45)} A${f(rr * 0.78)},${f(rr * 0.78)} 0 0 1 ${f(x - rr * 0.1)},${f(y - rr * 0.76)}" fill="none" stroke="#fff" stroke-width="${f(Math.max(3, rr * 0.06))}" stroke-linecap="round" opacity="0.8"/>`;
  }
  return s;
}

// cutaway(t, t0, shell, opts): lifts an object's cover (shell, its SVG) off from t0 to show what is drawn
// under it, and puts it back from t1. opts: {t1, dx, dy, rot, dur, cx, cy (rotation centre)}
function cutaway(t, t0, shell, { t1 = Infinity, dx = 0, dy = -260, rot = -8, dur = 0.7, cx = 0, cy = 0 } = {}) {
  const p = E.inOutCubic(P(t, t0, dur, E.lin)) * (1 - E.inOutCubic(P(t, t1, dur, E.lin)));
  if (p >= 0.999) return '';
  return G(`translate(${f(dx * p)} ${f(dy * p)}) rotate(${f(rot * p)} ${f(cx)} ${f(cy)})`, 1 - E.inCubic(p), shell);
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
    const prevCam = cameraAt(Math.max(0, t - 1 / 30));
    const dx = (cam.x - prevCam.x) * cam.z;
    const dy = (cam.y - prevCam.y) * cam.z;
    const dz = Math.abs(Math.log(cam.z) - Math.log(prevCam.z)) * 900;
    const v = Math.hypot(dx, dy) + dz;
    const blurEl = document.getElementById('wBlur');
    const worldG = document.getElementById('world');

    if (v > 0.6 && blurEl) {
      const sx = clamp(Math.abs(dx) * 0.8 + dz * 0.4, 0, 24);
      const sy = clamp(Math.abs(dy) * 0.8 + dz * 0.4, 0, 24);
      blurEl.setAttribute('stdDeviation', `${f(sx)} ${f(sy)}`);
      worldG.setAttribute('filter', 'url(#wGradeBlur)');
    } else {
      worldG.setAttribute('filter', 'url(#wGrade)');
    }

    IMPACTS = [];
    const worldInner = drawWorld(t, cam);
    let overlayInner = typeof drawOverlay === 'function' ? drawOverlay(t, cam) : '';

    let shakeX = 0, shakeY = 0, zoomPunch = 1, flashOp = 0;
    for (const imp of IMPACTS) {
      const u = t - imp.ts;
      if (u >= 0 && u < 0.45) {
        const decay = Math.exp(-8 * u);
        const k = imp.k;
        shakeX += 14 * k * decay * Math.sin(u * 50);
        shakeY += 14 * k * decay * Math.cos(u * 37);
        zoomPunch += 0.035 * k * Math.exp(-10 * u);
      }
      if (u >= 0 && u < 0.12) {
        flashOp = Math.max(flashOp, 0.35 * imp.k * (1 - u / 0.12));
      }
    }

    world = `<g transform="translate(${f(540 + shakeX)} ${f(VIEW_CY + shakeY)}) scale(${f(cam.z * zoomPunch)}) translate(${f(-cam.x)} ${f(-cam.y)})">${worldInner}</g>`;
    if (flashOp > 0.005) {
      ui += `<rect width="1080" height="1920" fill="#fff" opacity="${f(flashOp)}"/>`;
    }
    ui += overlayInner + headlines(t) + chapterBadges(t) + smallCaptions(t) + progressBar(t);

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

  const grade = TH.grade || { sat: 1, contrast: 1 };
  const satVal = grade.sat;
  const slopeVal = grade.contrast;
  const interceptVal = ((1 - slopeVal) * 0.5).toFixed(4);
  const setAttr = (id, attr, val) => { const el = document.getElementById(id); if (el) el.setAttribute(attr, val); };
  setAttr('wGradeSat', 'values', satVal);
  setAttr('wBlurSat', 'values', satVal);
  ['wGradeR', 'wGradeG', 'wGradeB', 'wBlurR', 'wBlurG', 'wBlurB'].forEach(id => {
    setAttr(id, 'slope', slopeVal);
    setAttr(id, 'intercept', interceptVal);
  });
  setAttr('fxShadeStop', 'stop-color', TH.palette ? TH.palette.ink : '#14141E');
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
  // each query must match a bundled face (fonts.check() is also true when nothing matches at all)
  const faces = await Promise.all([`900 72px ${FONT}`, `800 30px ${FONT}`, `72px "${HEAD_FONT}"`, '700 40px Caveat', '700 40px Oswald']
    .map(q => document.fonts.load(q)));
  await document.fonts.ready;
  const fontsOk = faces.every(list => list.length > 0);
  if (D.style === 'paper') applyTheme(D.theme || 'paper', 1080, 1920);

  const cap = TH.cap;
  const baseSize = D.captionSize || cap.size;
  D.captions.forEach(c => {
    const flat = c.lines.flat();
    flat.forEach((w, k) => w.next = k + 1 < flat.length ? flat[k + 1].t - 0.05 : c.end);
    const wrapWith = (s) => {
      const g = s * 0.3;
      const lines = [[]];
      for (const w of flat) {
        const curW = lines[lines.length - 1].reduce((sum, x) => sum + measure(x.w, s, cap.weight, cap.font) + g, 0);
        const wordW = measure(w.w, s, cap.weight, cap.font);
        if (lines[lines.length - 1].length > 0 && curW + wordW > 860) {
          lines.push([]);
        }
        lines[lines.length - 1].push(w);
      }
      return lines;
    };
    let size = baseSize;
    let wrapped = wrapWith(size);
    if (wrapped.length > 2) {
      size = baseSize * 0.75;
      wrapped = wrapWith(size);
      if (wrapped.length > 2) {
        const mid = Math.ceil(flat.length / 2);
        wrapped = [flat.slice(0, mid), flat.slice(mid)];
      }
    }
    c.wrappedLines = wrapped;
    c.renderSize = size;
  });

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
