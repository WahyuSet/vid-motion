---
name: tulis-naskah
description: Research an approved idea and write its voice-over script (topics/<id>/script.json), its sources and a beat plan, then stop for human approval. Use when an idea in ideas.md has status disetujui and a script is needed.
---

# tulis-naskah: research and script one approved idea

Input: an idea `id` whose status in `ideas.md` is `disetujui`. If it is not, stop and say so.
Output: `topics/<id>/sources.md`, `topics/<id>/script.json`, `topics/<id>/plan.md`, status `naskah`.

## 1. Research

- Read `AGENTS.md` (content rules, script schema), the idea block in `ideas.md`, and the channel's
  `channels/<channel>/RULES.md` (allowed sources, neutrality, required disclaimers). Its rules win.
- Read the sources fully with `web_fetch`; search for more until **every claim** you will say is backed by
  two independent credible sources, or one authoritative primary source.
- Write `topics/<id>/sources.md`: one bullet per claim: the claim in Indonesian, the exact supporting
  sentence or number, and the URL. Note anything sources disagree on; leave such claims out of the script.
- Numbers: use the source's number and unit, rounded honestly ("sekitar", "lebih dari"). No invented statistics.

## 2. Write the script (`topics/<id>/script.json`)

Follow the schema in `AGENTS.md`: `"style": "paper"` and `"channel": "<channel>"`. One entry per beat, 9–11 entries, ~80–100 words total.

Story formula:
1. **Hook (line 1, < 2 s):** the question or surprising claim of the whole video, said first, and visible from
   frame 0. "Kok cicak nggak jatuh dari langit-langit?" beats "Cicak ini santai jalan terbalik" (the question came
   4 s late there). The thumbnail title and line 1 should ask the same thing.
2. **Set-up (line 2):** the puzzle. "Tapi burung ini santai saja. Kok bisa?"
3. **The belief + verdict:** what people think, then "Faktanya, itu *mitos*!" (or "*fakta*!"), for the mitos-fakta format.
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

### Write like a person, not a model (from the antislop copywriting rules)

The voice is the channel's: casual, curious, "kamu", "kok", "ya". Keep that voice; scrubbing AI tells must not
leave a flat, sterile script. Look for clusters of the tells below, not single words.

- **Never invent a specific.** No number, name, date, study or quote that is not in `sources.md`. A precise-looking
  made-up fact is worse than a vague true one. If a line needs a detail you do not have, find a source or write
  the plain version.
- **Name the source, not "the experts".** Not "kata para ahli" / "menurut penelitian" / "studi membuktikan", but
  "menurut Dewan Madu Amerika", "studi tahun 2011 pada 36 ribu orang". (The belief line is the exception:
  "banyak yang bilang" / "katanya" is how you state the myth before checking it.)
- **No empty hype words:** luar biasa, menakjubkan, fakta mengejutkan, rahasia besar, wajib tahu, revolusioner,
  ternyata selama ini kita salah, dijamin, "yang akan mengubah hidupmu". Say the concrete thing instead:
  "jari tokek punya dua juta bulu" beats "fakta luar biasa tentang tokek".
- **No signposting or channel-talk at the start.** Not "Di video kali ini…", "Yuk kita bahas…", "Simak sampai
  habis!", "Jujur aja…", "Gini lho…". The first words are the hook itself.
- **No filler or stacked hedges.** Cut "perlu diketahui bahwa", "pada dasarnya", "dalam hal ini", "adapun",
  "yang mana". One qualifier per claim ("sekitar", "bisa"), never "mungkin bisa jadi".
- **Give every sentence an actor.** "Otak mengunci otot", not "otot dikunci"; "gula menyedot air dari kuman",
  not "air tersedot". Passive only when the actor truly does not matter.
- **No formula rhythm:** no "Bukan cuma X, tapi juga Y" in every video, no forced lists of three, no run of
  three punchy fragments ("Nggak lengket. Nggak mengisap. Nggak ajaib."), no aphorisms ("Madu adalah bahasa
  alam"). One short punch line is fine. Mix short and longer sentences, the way people talk.
- **No generic send-off:** not "Semoga bermanfaat", "Semoga sehat selalu", "Jangan lupa like dan subscribe".
  End on the last concrete thing: a tip, a question, or a callback to the hook.
- **Clean text for the voice:** no em dashes (`—`), no ALL-CAPS words for emphasis, no emojis, no quotation
  marks in `vo`. TTS reads them badly and captions show them. Emphasis comes from `*keyword*` (1–2 per line).

### Vary from the last videos

Read the last three rows of the channel in `ideas.md` and their `script.json` before writing. Do not repeat:
- **the hook shape.** Rotate: a direct question ("Kok cicak nggak jatuh?"), a startling number ("Dua juta bulu
  di satu jari."), a "Pernah…?" situation, a wrong belief said straight and then corrected, a scene described
  in one line. The tag "Masa sih?" at most once per three videos.
- **the closing shape.** Rotate: a local tip, a question to the viewer, a callback that loops to the hook, one
  bonus fact. Health lines still point to a doctor when RULES.md requires it, but say it in a new way and keep
  it short (the description carries the full disclaimer).
- **the verdict words.** "Faktanya, itu mitos!" is one option; "Ternyata kebalikannya", "Setengah benar",
  "Sains bilang beda" are others.

### Draft, audit, final

1. **Draft** the lines, then read them aloud at the TTS pace.
2. **Audit**, answering two questions in a sentence each: "What here sounds machine-written?" and "Does any line
   state a fact, number, name or date that is not in `sources.md`?"
3. **Final:** fix both, then search the file for `—`, `–` and ALL-CAPS words one last time.

## 3. Beat plan (`topics/<id>/plan.md`)

A table, one row per script line: the visual (what is drawn, where the camera is), the headline (2–4 words),
the chapter icon, Si Cicak's role (hook, verdict with stamp, ending wave, at least these three), sound cues.
Then a short "dunia" section: what the single continuous world contains and where things sit, so the camera
can travel between them. Prefer one memorable visual analogy (like the water tanks in burung-listrik).

## 4. Check the length

Create a minimal `topics/<id>/scenes.js` (see "Minimal paper topic" in AGENTS.md) and run
`python build_video.py <id> preview`. This synthesizes the voice. Read `build/<id>/tts/scene*.json`:
- Total length 40–60 s (sum of lines + 0.35 s gaps + holds + tail). Cut or add words to fit.
- Every number and unusual word was read correctly (compare the `w` entries with your text).

## 5. Self-check, then stop

- [ ] every factual sentence maps to a bullet in `sources.md`
- [ ] hook is the video's question/claim, under 2 s; verdict present for mitos-fakta
- [ ] one sentence per line where possible; 45–55 s is the sweet spot (the end card adds ~2.4 s after the last word)
- [ ] no invented specifics; every source named (no "kata para ahli"); no hype words, filler, signposting or
      generic send-off; no em dashes, ALL-CAPS emphasis, emojis or quotes in `vo`
- [ ] hook shape, closing shape and verdict words differ from the channel's last three videos
- [ ] 40–60 s; 1–2 keywords per line
- [ ] local reference somewhere; ending loops back to the opening picture
- [ ] nothing from another channel's script copied

Set the idea's status to `naskah` in `ideas.md`, then ask with `request_user_input`: show the script lines,
the duration, and the source list, and ask for approval or changes. Only the human sets `naskah-ok`.
