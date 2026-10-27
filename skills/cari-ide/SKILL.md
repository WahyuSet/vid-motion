---
name: cari-ide
description: Find and propose new video ideas for one of the Shorts channels (cicaktahu, tikus, stickman), research them lightly, score them, and add them to ideas.md for human approval. Use when asked to find, suggest or brainstorm video topics.
---

# cari-ide — propose new video ideas

Goal: add **5 strong, verifiable ideas** (or the number asked for) to `ideas.md` with status `usulan`,
then stop for human approval. You do not write scripts or code in this task.

## 1. Know the channel and what exists

- Ask which channel if the request does not say (`cicaktahu` by default). Read `AGENTS.md`, then
  `channels/<channel>/channel.json` (topics) and **`channels/<channel>/RULES.md`**: its scope and rules replace
  the generic topic filters below (e.g. the `tikus` channel *does* cover politics and finance, under its rules).
- Read `ideas.md`. Also list `topics/`.
- Never propose an idea that is already in `ideas.md` (any status, including `ditolak`) or a close variant of it.
  Read the `ditolak` notes: they tell you what the human does not want.

## 2. Collect candidates (aim for 15–20 before filtering)

Use `web_search` / `web_fetch`. Good wells:
- Indonesian everyday myths: "mitos kesehatan yang dipercaya orang Indonesia", "mitos atau fakta", "kata orang tua dulu",
  myths about food, sleep, weather, animals, electricity, phones, vehicles.
- "Kenapa …?" questions people ask: YouTube / Google autocomplete for "kenapa", "mengapa", "apakah benar".
- Fact-check sections: Kemenkes "hoaks atau fakta", cekfakta.com, Kompas / Detik health and science myth articles.
- Wikipedia "List of common misconceptions" (check the cited sources, not just the list).
- Science news with a simple visual mechanism: National Geographic Indonesia, Live Science, ScienceAlert.
- Google Trends Indonesia for timing (season, holidays, viral topics), only when it fits the rules below.

## 3. Filter hard

Drop a candidate if any is true:
- You cannot find **two independent credible sources** (or one authoritative primary source: a peer-reviewed paper,
  WHO / Kemenkes / CDC, a university, an encyclopedia entry with references) that agree.
- It needs real people, brands, logos, photos, or a precise map (the engine draws simple illustrated shapes).
- It is outside the channel's scope, breaks its `RULES.md`, touches religion or ethnicity (SARA) or tragedies
  of real people, or would need personal medical/financial/legal advice.
- The honest answer is "it depends" with no clear, explainable core.

## 4. Score the survivors (1–5 each)

| criterion | 5 means |
|---|---|
| terverifikasi | strong agreement across solid sources |
| bisa divisualkan | one clear mechanism you can draw in 3–4 beats (analogy, cutaway, comparison, experiment) |
| kuat hook | a viewer stops scrolling: surprising, counter-intuitive, or "I always wondered" |
| dekat penonton | everyday Indonesian life, local comparison possible (PLN, Jakarta, layangan, nasi, motor…) |

Keep the top 5 by total. Prefer a mix of `mitos-fakta` and `fakta-unik`.

## 5. Write them into ideas.md

Under "## Usulan", one block per idea, using the commented template in the file. `id` is a short kebab-case slug
(it becomes the folder name `topics/<id>`). Add a row to the table with the channel and status `usulan`.
"Jawaban singkat" must be the true answer in one sentence, so the human can judge the idea at a glance.

## 6. Stop for approval

Ask with `request_user_input`: list the ideas (title, answer, total score) and ask which to approve.
Set the approved ones to `disetujui` only if the human says so in that answer; otherwise leave `usulan`.
In an unattended run, stop after writing `ideas.md` and report what you added.
