---
name: buat-thumbnail
description: Design and render the Shorts thumbnail (output/<id>-thumbnail.jpg) for a video by adding drawThumbnail() to topics/<id>/scenes.js, then check it at feed size. Use after buat-video, or when a thumbnail needs to be made or redone.
---

# buat-thumbnail — one strong cover image

Input: a topic with a working `topics/<id>/scenes.js`. Output: `drawThumbnail()` in that file and
`output/<id>-thumbnail.jpg` (1080×1920, under 2 MB).
Reference: `drawThumbnail()` at the end of `topics/burung-listrik/scenes.js`.

## Rules that make people tap

1. **One idea, one subject.** The main object of the story, big, in the middle (screen y 600–1400).
   Reuse the video's drawing functions at a larger scale; never draw something that is not in the video.
2. **2–4 words of title**, in `ui` (above the paper texture), with `titleText(text, 540, ~420, 160–180, 980, 24–26)`.
   One `*yellow*` part. It asks or teases; it does **not** give away the answer.
   Good: "20.000 VOLT / KOK SANTAI?", "MANDI MALAM / BIKIN REMATIK?". Bad: "Burung tidak tersetrum karena beda tegangan".
3. **Emotion.** The channel's mascot reacts (`shock`, or `verdict` for myth/fact-check topics), placed beside the
   subject, not covering it. Titles follow the channel theme automatically (`titleText`).
   Characters may get a fun prop (sunglasses on the calm sparrow).
4. **Point at the mystery.** A red circle (`C.accent`, stroke ~12) or arrow on the key detail.
5. **Contrast.** A bold background behind the subject (sunburst rays, a strong colour block); dark ink outlines;
   effects (lightning, sparks, smoke) get an ink outline so they do not wash out.
6. **Safe areas.** Nothing important below y 1550 or in the bottom-right corner (Shorts UI).

`drawThumbnail()` returns `{ world, ui }`: `world` is drawn under the paper texture and vignette,
`ui` above them. Use fixed times (e.g. `const t = 1.3`) for poses and animated parts.

## Render and check

```bash
python build_video.py <id> thumb
python -c "from PIL import Image; Image.open('output/<id>-thumbnail.jpg').resize((180, 320)).save('build/<id>/thumb-small.png')"
```

Look at both images (`read_file`). At 180 px wide (feed size):
- [ ] the title is still readable
- [ ] you can tell what the subject is and what the mystery is
- [ ] the mascot's emotion reads
- [ ] the file is under 2 MB (the command prints the size)

Fix and re-render until all pass. If you cannot view images, ask the human to look at both files.

## Hand over

Mention the thumbnail path in your report. For Shorts, the human uploads it in the YouTube mobile app
("Edit sampul"); some accounts can only pick a frame from the video.
