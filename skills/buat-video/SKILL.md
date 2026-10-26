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

- Read `AGENTS.md` (API, layout rules) and `topics/burung-listrik/scenes.js` — the reference implementation.
  Reuse its patterns: the `K` table of word times, `setCamera`, `setHeadlines`, `setChapters`, `cues`,
  `drawWorld` built from small drawing functions, `drawOverlay` for cards/stamps/flashes, Si Cicak.
- Run `python build_video.py <id> preview` once if `build/<id>/tts/` is missing, then read the word timings.

## 2. Build in passes, previewing after each

Write `scenes.js` in this order; after every pass run `preview` at the relevant seconds and **look at the images**
(`read_file` on `build/<id>/preview.png` and `build/<id>/stills/*.png`):

1. **World + camera**: background, the main props in their final places, camera keys for every beat.
   Check: the subject of each beat is framed, between screen y 550 and 1400.
2. **Characters and motion**: the stars of the story, Si Cicak (at least hook, verdict, ending), entrances on words.
3. **Text**: headlines (2–4 words, `*yellow*` keyword), chapter icons, `stamp`, `cite` for any number or claim.
4. **Overlays and polish**: explanation cards, flashes, handwritten notes, sound cues.

Anchor every timing to spoken words via `D.scenes[i].at(word)`. Draw from `t` only (no state, no `Math.random`).

## 3. Visual review checklist

Render stills at: 0, every headline start, every stamp, every camera move midpoint, every card, the last 0.1 s.
For each still check:
- [ ] headline, chapter badge and captions do not overlap each other or the subject
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
- **Deskripsi:** 2–3 sentences of summary, then "Sumber:" with the URLs from `sources.md`, then a one-line
  disclaimer for health topics ("Informasi umum, bukan pengganti saran dokter").
- **Hashtag:** `#shorts` plus 3–4 specific ones (`#faktaunik`, `#mitosataufakta`, topic tags).

## 6. Hand over

Set the status to `video` in `ideas.md`, then ask with `request_user_input` that the human watches
`output/<id>.mp4` and reads `meta.md`. Only the human sets `siap-upload`.
Run the `buat-thumbnail` skill next if it was not done.
