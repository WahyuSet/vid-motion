// Shared by the HyperFrames inserts of this topic: word times and the pipeline's camera (from timeline.js).
// Loaded after the engine scripts and engine/scenes.js; the channel theme is set by hand because
// applyTheme() needs the engine page's static layers.
TH = THEMES[TL.theme]; Object.assign(C, PAPER, TH.palette || {});

const RIG = {
  // insert n (0-based): its start in video seconds and the second (local to the clip) a word is spoken
  open(n, compId, dur) {
    const ins = TL.inserts[n], T0 = ins.start;
    if (ins.end - ins.start > dur) throw new Error(`insert ${n} window ${(ins.end - ins.start).toFixed(2)} s is longer than data-duration ${dur}`);
    const at = (line, word, delta = 0) => {
      const key = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      const w = TL.scenes[line - 1].words.find(x => x.w.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(key));
      if (!w) throw new Error(`word "${word}" not spoken in line ${line}`);
      return w.t - 0.06 - T0 + delta;
    };
    const tl = gsap.timeline({ paused: true });
    window.__timelines = window.__timelines || {};
    window.__timelines[compId] = tl;
    // the world group follows the pipeline's camera frame by frame, so drawings sit exactly on the picture
    const fps = TL.fps, f0 = Math.round(T0 * fps), nF = Math.round(dur * fps), view = k => {
      const [x, y, z] = TL.camera[Math.min(TL.camera.length - 1, f0 + k)];
      return `translate(540 900) scale(${z}) translate(${-x} ${-y})`;
    };
    gsap.set('#cam', { attr: { transform: view(0) } });
    for (let k = 0; k <= nF; k++) tl.set('#cam', { attr: { transform: view(k) } }, k / fps);
    tl.set({}, {}, dur);
    return { tl, at };
  },
};
