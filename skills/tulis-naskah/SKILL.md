---
name: tulis-naskah
description: Research an approved idea and write its voice-over script (topics/<id>/script.json), its sources and a beat plan, then stop for human approval. Use when an idea in ideas.md has status disetujui and a script is needed.
---

# tulis-naskah — research and script one approved idea

Input: an idea `id` whose status in `ideas.md` is `disetujui`. If it is not, stop and say so.
Output: `topics/<id>/sources.md`, `topics/<id>/script.json`, `topics/<id>/plan.md`, status `naskah`.

## 1. Research

- Read `AGENTS.md` (content rules, script schema), the idea block in `ideas.md`, and the channel's
  `channels/<channel>/RULES.md` (allowed sources, neutrality, required disclaimers). Its rules win.
- Read the sources fully with `web_fetch`; search for more until **every claim** you will say is backed by
  two independent credible sources, or one authoritative primary source.
- Write `topics/<id>/sources.md`: one bullet per claim — the claim in Indonesian, the exact supporting
  sentence or number, and the URL. Note anything sources disagree on; leave such claims out of the script.
- Numbers: use the source's number and unit, rounded honestly ("sekitar", "lebih dari"). No invented statistics.

## 2. Write the script (`topics/<id>/script.json`)

Follow the schema in `AGENTS.md`: `"style": "paper"` and `"channel": "<channel>"`. One entry per beat, 9–11 entries, ~80–100 words total.

Story formula:
1. **Hook (line 1, < 2 s):** a concrete, visual claim or question. "Kabel ini bertegangan 20.000 volt."
2. **Set-up (line 2):** the puzzle. "Tapi burung ini santai saja. Kok bisa?"
3. **The belief + verdict:** what people think, then "Faktanya, itu *mitos*!" (or "*fakta*!") — mitos-fakta format.
   For fakta-unik, line 3 is the first surprising fact.
4. **Mechanism (2–3 lines):** the why, in one simple idea the viewer can picture.
5. **Proof / consequence (1–2 lines):** a number with a source, an experiment, a real example.
6. **Synthesis (1 line):** a sentence the viewer can repeat.
7. **Takeaway (last line):** a local tip or call to comment; it must lead naturally back to the opening picture (loop).

Style:
- Casual spoken Indonesian ("kamu", "kok", "ya"); short sentences; no jargon without explaining it.
- Mark 1–2 keywords per line with `*stars*` (never more than 3 words inside one pair).
- Say numbers the way they should be read; check them after synthesis.
- No absolute medical claims ("pasti sembuh"); suggest seeing a doctor when health is involved.
- Use `hold` (0.3–0.9) after lines that need a longer visual (a card, a reveal, an explosion).

## 3. Beat plan (`topics/<id>/plan.md`)

A table, one row per script line: the visual (what is drawn, where the camera is), the headline (2–4 words),
the chapter icon, Si Cicak's role (hook, verdict with stamp, ending wave — at least these three), sound cues.
Then a short "dunia" section: what the single continuous world contains and where things sit, so the camera
can travel between them. Prefer one memorable visual analogy (like the water tanks in burung-listrik).

## 4. Check the length

Create a minimal `topics/<id>/scenes.js` (see "Minimal paper topic" in AGENTS.md) and run
`python build_video.py <id> preview`. This synthesizes the voice. Read `build/<id>/tts/scene*.json`:
- Total length 40–60 s (sum of lines + 0.35 s gaps + holds + tail). Cut or add words to fit.
- Every number and unusual word was read correctly (compare the `w` entries with your text).

## 5. Self-check, then stop

- [ ] every factual sentence maps to a bullet in `sources.md`
- [ ] hook is visual and under 2 s; verdict present for mitos-fakta
- [ ] 40–60 s; 1–2 keywords per line
- [ ] local reference somewhere; ending loops back to the opening picture
- [ ] nothing from another channel's script copied

Set the idea's status to `naskah` in `ideas.md`, then ask with `request_user_input`: show the script lines,
the duration, and the source list, and ask for approval or changes. Only the human sets `naskah-ok`.
