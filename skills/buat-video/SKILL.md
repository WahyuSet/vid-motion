---
name: buat-video
description: Build the animated scenes (topics/<id>/scenes.js) for an approved script, check them visually, render the final MP4 and write the upload metadata. Use when an idea in ideas.md has status naskah-ok.
---

# buat-video — from approved script to finished MP4

Input: an idea `id` with status `naskah-ok` and `topics/<id>/script.json`, `sources.md`, `plan.md`.
If the status is not `naskah-ok`, stop. Never change `script.json` wording here (only `hold` / `tail`);
if the script itself needs changes, go back to the human.
Output: `topics/<id>/scenes.js`, `output/<id>.mp4`, `topics/<id>/meta.md`, status `video`.

## 1. Prepare

- Read `AGENTS.md` (API, layout rules), the channel's `RULES.md`, and a reference implementation in the
  channel's style: `topics/burung-listrik/scenes.js` (cicaktahu), `topics/demo-tikus/scenes.js` (tikus),
  `topics/demo-stickman/scenes.js` (stickman). Use only the channel's mascot; draw props in its art style.
  Reuse its patterns: the `K` table of word times, `setCamera`, `setHeadlines`, `setChapters`, `cues`,
  `drawWorld` built from small drawing functions, `drawOverlay` for cards/stamps/flashes, Si Cicak.
- Run `python build_video.py <id> preview` once if `build/<id>/tts/` is missing, then read the word timings.

## 2. Build in passes, previewing after each

Write `scenes.js` in this order; after every pass run `preview` at the relevant seconds and **look at the images**
(`read_file` on `build/<id>/preview.png` and `build/<id>/stills/*.png`):

1. **World + camera**: background, the main props in their final places, camera keys for every beat.
   Check: the subject of each beat is framed, between screen y 550 and 1400.
2. **Characters and motion**: the stars of the story, Si Cicak (at least hook, verdict, ending), entrances on words.
   Use the prop library (`engine/props.js`: trees, grass, flowers, ground, bulb, coin, phone, …) first.
   Draw other props with `vol(path, fill)` (shadow, highlight, outline) rather than flat fills; build paths with
   `circleD` / `rectD` or your own `d`. Give big props secondary details (rims, labels, seams, screws).
3. **Text**: headlines (2–4 words, `*yellow*` keyword), chapter icons, `stamp`, `cite` for any number or claim.
4. **Overlays and polish**: explanation cards (`card`, with `scramble` + `mono` for codes and numbers), flashes,
   handwritten notes, sound stickers (`sticker`, each with a cue), sound cues. To show how something works inside,
   draw its inside and its cover separately and use `xray` (a lens) or `cutaway` (cover lifts off); see `topics/demo-cicak`.
5. **FX and depth**: `hype` (or `{hype: true}` on a headline) for the 1–2 hardest-hitting words or numbers,
   `invertFlash` at most once or twice on a big hit; add FX at key beats (`burst`, `confetti`, `speedLines`, `spotlight`) and parallax with `layer(d, cam, ...)` for background layers.

Anchor every timing to spoken words via `D.scenes[i].at(word)`. Draw from `t` only (no state, no `Math.random`).

Retention rules (from reviewing finished videos):
- **Frame 0 hooks**: a headline from t = 0 and the subject big and near the centre, not a wide empty view.
- **Cards pop in with their first content** (`card(t, t0…)` with `t0` at the first row's word), never empty.
  Drawings fill most of the card; card text ≥ 40 px.
- **No stretch over ~6 s** without a camera move, a new element or a headline change; inside a long zoom or
  lens, give each stage a camera push or a pop. Keep dimming (`spotlight`) light (≤ 0.3) and short.
- **Ending**: the mascot big and central for the last line; don't walk it off and leave an empty set.
  The end card ("Thank you for watching!") is added by the engine after the last word.
- Nothing important cut off by the frame edge (lamps, signs half outside look like mistakes).

Run `python build_video.py <id> check` after every pass and fix its warnings.

## 3. Visual review checklist

Render stills at: 0, every headline start, every stamp, every camera move midpoint, every card, the last 0.1 s.
For each still check:
- [ ] headline, chapter badge and captions do not overlap each other or the subject
- [ ] frame 0: headline visible and the subject big; no card is ever on screen empty
- [ ] the end card frame (last line + 0.5 s) is clean: nothing important under it
- [ ] `check` prints `ok` (or every warning is understood)
- [ ] impact frames (stamp landing, burst, flash) look punchy without obscuring text
- [ ] nothing important below y 1600 or under the right-side Shorts buttons (x > 960, y 1000–1700)
- [ ] text is readable at phone size (try a 270 px wide copy of the still)
- [ ] no empty or "dead" frame: something always moves (camera drift, idle animation, current, particles)
- [ ] the first and last frames look the same (loop)
- [ ] colours from `C` / topic palette; ink outlines; consistent stroke weight

If you cannot view images with your tools, stop after this step and ask the human to look at
`build/<id>/preview.png` before the full render.

## 4. Render and verify

- `python build_video.py <id>` (use `workers=` to fit the machine).
- Check the result: `ffprobe` duration ≈ script length and frame count = duration × 30; extract 3 frames with
  ffmpeg (`-ss <t> -frames:v 1`) at a stamp, a card and the end, and look at them.

## 5. Metadata (`topics/<id>/meta.md`)

- **Judul:** 3 options, ≤ 60 characters, curiosity without lying, Indonesian. e.g. "Kenapa Burung Gak Kesetrum di Kabel Listrik?"
- **Deskripsi:** 2–3 sentences of summary, then "Sumber:" with the URLs from `sources.md`, then every
  disclaimer the channel's `RULES.md` requires (finance: "Konten edukasi, bukan ajakan investasi…";
  health: "Informasi umum, bukan pengganti saran dokter.").
- **Hashtag:** `#shorts` plus 3–4 specific ones (`#faktaunik`, `#mitosataufakta`, topic tags).

## 6. Hand over

Set the status to `video` in `ideas.md`, then ask with `request_user_input` that the human watches
`output/<id>.mp4` and reads `meta.md`. Only the human sets `siap-upload`.
Run the `buat-thumbnail` skill next if it was not done.
