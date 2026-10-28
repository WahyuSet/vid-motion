"""YouTube Shorts motion-graphic builder.

Usage:
  python build_video.py <topic>            render output/<topic>.mp4
  python build_video.py <topic> preview    render only still frames to build/<topic>/preview.png
  python build_video.py <topic> preview 3.5,12   ...at chosen seconds
  python build_video.py <topic> thumb            render output/<topic>-thumbnail.jpg from drawThumbnail()
  python build_video.py <topic> check            list retention problems (hook, pauses, static stretches)
  python build_video.py <topic> narasi           output/<topic>-narasi.json: the clean narration to voice outside
  python build_video.py <topic> workers=4       choose how many browsers render in parallel
                                                 (default: half the CPU cores, at most 6)

Needs: requirements.txt (pip), ffmpeg on PATH, and a browser: Edge on Windows, otherwise
`playwright install chromium` (or set BROWSER_CHANNEL). See README.md / AGENTS.md.

A topic lives in topics/<topic>/:
  script.json  one voice-over line per scene ("hold": extra seconds after the line; *word* marks a
               caption keyword). "style": "panel" (card layout: header label, "cont": true keeps the
               previous picture) or "paper" (full-screen world with a moving camera); optional
               "channel" (channels/<id>, default cicaktahu: gives the theme, mascot and watermark),
               "captions": {"words", "line", "size", "mode": "pill"}, "theme"/"watermark" overrides, "tail", "voice" (see tts.py),
               "pause" (longest silence inside a line), "outro" (end card text, "" = off), "progress": true.
  scenes.js    panel style: one draw(t, S)/cues(S) object per scene.
               paper style: drawWorld(t, cam), setup(D) for camera/headlines/chapters, cues(D),
               optional drawOverlay(t, cam). Helpers come from engine/lib.js and engine/cicak.js.
Voice-over comes from tts.py (cached in build/<topic>/tts). engine/index.html draws any
moment with renderAt(t); this script screenshots every frame in parallel browsers, mixes
voice + sound effects, and encodes the MP4.
"""
import base64
import io
import json
import math
import multiprocessing
import os
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

import tts

ROOT = Path(__file__).parent
ENGINE = ROOT / "engine" / "index.html"
BUILD = ROOT / "build"  # set to build/<topic> in main()
DEFAULT_CHANNEL = "cicaktahu"


def load_channel(cid):
    """channels/<id>/channel.json: name, handle, mascot, theme, watermark (see channels/<id>/RULES.md)."""
    path = ROOT / "channels" / cid / "channel.json"
    if not path.exists():
        raise SystemExit(f"unknown channel {cid!r}: {path} not found")
    return json.loads(path.read_text(encoding="utf-8"))

W, H, FPS = 1080, 1920, 60  # "fps" in script.json overrides (30 renders twice as fast)
SR = 48000

LEAD_IN = 0.3   # silence before the first line
GAP = 0.35      # silence between scenes
TAIL = 1.5      # hold on the last scene
PAUSE = 0.35    # longest silence kept between two sentences inside one line ("pause" in script.json)
OUTRO = "Thank you\nfor *watching*!"  # end card text (channel.json / script.json "outro"; "" switches it off)
OUTRO_TAIL = 2.4  # seconds after the last word when the end card is on, so it shows for about two seconds
CAPTION_LINE = 18  # max characters per caption line
CAPTION_WORDS = 4  # max words per caption


# ---------- voice-over ----------

def decode(path, words, max_pause=PAUSE):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1",
                          "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32).copy()
    # edge-tts pads ~0.8s of silence after the last word; cut it so GAP controls pacing
    a = a[: int((words[-1]["t"] + words[-1]["d"] + 0.2) * SR)]
    a, words = trim_pauses(a, words, max_pause)
    fade = min(len(a), int(0.03 * SR))
    a[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)
    return a, words


def trim_pauses(a, words, max_pause):
    """Shorten the silence between two words of one line (TTS stops ~1 s after "." "?" "!") to max_pause
    seconds and shift the later word times. Gaps that are not really quiet are kept as they are."""
    if not max_pause:
        return a, words
    peak = max(1e-6, float(np.abs(a).max()))
    parts, cursor, shift, out = [], 0, 0.0, []
    for k, w in enumerate(words):
        out.append({**w, "t": w["t"] - shift})
        if k + 1 == len(words):
            break
        end, nxt = w["t"] + w["d"], words[k + 1]["t"]
        if nxt - end <= max_pause:
            continue
        c0, c1 = int((end + max_pause / 2) * SR), int((nxt - max_pause / 2) * SR)
        if c1 <= c0 or np.abs(a[c0:c1]).max() > 0.05 * peak:
            continue
        parts.append(a[cursor:c0])
        cursor, shift = c1, shift + (c1 - c0) / SR
    parts.append(a[cursor:])
    return np.concatenate(parts), out


def caption_chunks(sc, max_words=CAPTION_WORDS, max_line=CAPTION_LINE):
    """Split a scene's words into short captions: per sentence, evenly sized groups
    of at most max_words words (no orphan words), wrapped at max_line chars.
    Words wrapped in *stars* in the script are flagged as keywords (kw)."""
    tokens = sc["vo"].split()
    words = sc["words"]
    kws, inside = [], False
    for tok in tokens:
        opens = tok.startswith("*")
        kws.append(inside or opens)
        if opens:
            inside = True
        if re.search(r"\*[,.:;?!]*$", tok):
            inside = False
    tokens = [tok.replace("*", "") for tok in tokens]
    aligned = len(tokens) == len(words)
    shown = [re.sub(r"[,.:;]+$", "", tok) for tok in tokens] if aligned else [w["w"] for w in words]
    items = [{"w": shown[k], "t": w["t"], "d": w["d"], "kw": aligned and kws[k]} for k, w in enumerate(words)]
    sentences, cur = [], []
    for k, it in enumerate(items):
        cur.append(it)
        if k < len(tokens) and re.search(r"[.?!]$", tokens[k]):
            sentences.append(cur)
            cur = []
    if cur:
        sentences.append(cur)
    chunks = []
    for sent in sentences:
        n = math.ceil(len(sent) / max_words)
        base, extra = divmod(len(sent), n)
        i = 0
        for g in range(n):
            group = sent[i: i + base + (1 if g < extra else 0)]
            i += len(group)
            lines = [[]]
            for it in group:
                length = sum(len(x["w"]) for x in lines[-1]) + len(lines[-1])
                if lines[-1] and length + len(it["w"]) > max_line:
                    lines.append([])
                lines[-1].append(it)
            chunks.append(lines)
    out = []
    for j, lines in enumerate(chunks):
        first, last = lines[0][0], lines[-1][-1]
        end = (chunks[j + 1][0][0]["t"] - 0.08 if j + 1 < len(chunks)
               else min(last["t"] + last["d"] + 0.5, sc["end"]))
        out.append({"start": first["t"] - 0.08, "end": end, "lines": lines})
    return out


# ---------- sound effects ----------

SFX_DIR = ROOT / "engine" / "sfx"  # engine/sfx/<kind>.mp3|m4a|wav replaces the synthesized sound of that name
_sfx_files = {}


def sfx_file(kind):
    """A recorded sound from engine/sfx: leading/trailing silence cut (so it starts on its cue), loudness
    (energy of the first 0.3 s) matched to the synthesized sound it replaces, peak kept under 0.9.
    None when there is no file for this kind."""
    if kind in _sfx_files:
        return _sfx_files[kind]
    path = next((p for p in (SFX_DIR / f"{kind}.{ext}" for ext in ("mp3", "m4a", "wav")) if p.exists()), None)
    a = None
    if path:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                             capture_output=True, check=True).stdout
        a = np.frombuffer(raw, np.float32)
        loud = np.flatnonzero(np.abs(a) > 0.02 * np.abs(a).max())
        a = a[max(0, loud[0] - int(0.01 * SR)): loud[-1] + int(0.03 * SR)].copy()
        level = lambda x: float(np.sqrt((x[: int(0.3 * SR)] ** 2).mean()))
        a *= level(synth_sfx(kind)) / max(1e-6, level(a))
        a *= min(1.0, 0.9 / max(1e-6, float(np.abs(a).max())))
    _sfx_files[kind] = a
    return a


def sfx(kind):
    a = sfx_file(kind)
    return a if a is not None else synth_sfx(kind)


def synth_sfx(kind):
    rng = np.random.default_rng(sum(map(ord, kind)))

    def env(n, k):
        return np.exp(-np.arange(n) / SR * k)

    if kind == "pop":
        n = int(0.09 * SR); t = np.arange(n) / SR
        return 0.16 * np.sin(2 * np.pi * np.cumsum(600 + 700 * t / 0.09) / SR) * env(n, 45)
    if kind == "tick":
        n = int(0.05 * SR); t = np.arange(n) / SR
        return 0.09 * np.sin(2 * np.pi * 1700 * t) * env(n, 90)
    if kind == "thud":
        n = int(0.3 * SR); t = np.arange(n) / SR
        body = np.sin(2 * np.pi * np.cumsum(120 - 60 * t / 0.3) / SR) * env(n, 16)
        return 0.45 * (body + rng.standard_normal(n) * env(n, 60) * 0.3)
    if kind == "whoosh":
        n = int(0.35 * SR); t = np.arange(n) / SR
        smooth = np.convolve(rng.standard_normal(n), np.ones(40) / 40, mode="same")
        return 0.5 * smooth * np.sin(np.pi * t / 0.35) ** 2
    if kind == "ding":
        n = int(0.7 * SR); t = np.arange(n) / SR
        return 0.11 * (np.sin(2 * np.pi * 1320 * t) + 0.6 * np.sin(2 * np.pi * 1980 * t)) * env(n, 6)
    if kind == "click":
        n = int(0.03 * SR)
        return 0.25 * np.diff(rng.standard_normal(n + 1)) * env(n, 200)
    if kind == "sparkle":
        out = np.zeros(int(0.35 * SR))
        for j, fr in enumerate((2400, 3000, 3600)):
            n = int(0.12 * SR); t = np.arange(n) / SR; s = int(j * 0.06 * SR)
            out[s: s + n] += 0.05 * np.sin(2 * np.pi * fr * t) * env(n, 30)
        return out
    if kind == "zap":  # electric crackle: buzzing square wave chopped by random bursts
        n = int(0.5 * SR); t = np.arange(n) / SR
        buzz = np.sign(np.sin(2 * np.pi * 100 * t)) * 0.5 + rng.standard_normal(n)
        gate = np.repeat(rng.random(n // 400 + 1) > 0.35, 400)[:n]
        return 0.22 * buzz * gate * env(n, 5)
    if kind == "chirp":  # two quick bird tweets
        out = np.zeros(int(0.3 * SR))
        for j in range(2):
            n = int(0.07 * SR); t = np.arange(n) / SR; s = int(j * 0.13 * SR)
            out[s: s + n] += 0.07 * np.sin(2 * np.pi * np.cumsum(2800 + 1600 * t / 0.07) / SR) * np.sin(np.pi * t / 0.07)
        return out
    raise ValueError(kind)


# ---------- build ----------

def timeline(script, topic_dir):
    SCENES = script["scenes"]
    voice = tts.voice_config(script)
    if tts.full_recording(topic_dir) and not os.environ.get("TTS_PROVIDER"):
        # one take of the whole script in topics/<topic>/voice/full.*: cut it into lines first
        voice["provider"] = "file"
        tts.split_full([sc["vo"].replace("*", "") for sc in SCENES], voice, BUILD / "tts", topic_dir)
    channel = load_channel(script.get("channel", DEFAULT_CHANNEL))
    t = LEAD_IN
    clips = []
    for i, sc in enumerate(SCENES):
        audio, words = tts.voice_for(i, sc["vo"].replace("*", ""), voice, BUILD / "tts", topic_dir)
        clip, words = decode(audio, words, script.get("pause", PAUSE))
        sc["audio"] = t
        sc["start"] = 0.0 if i == 0 else t - 0.25
        sc["words"] = [{**w, "t": t + w["t"]} for w in words]
        clips.append((t, clip))
        t += len(clip) / SR + GAP + sc.get("hold", 0)  # "hold": extra seconds for the picture to finish
    outro = script.get("outro", channel.get("outro", OUTRO)) if script.get("style") == "paper" else ""
    tail = script.get("tail", TAIL)
    total = clips[-1][0] + len(clips[-1][1]) / SR + (max(tail, OUTRO_TAIL) if outro else tail)
    for i, sc in enumerate(SCENES):
        sc["end"] = SCENES[i + 1]["start"] if i + 1 < len(SCENES) else total
    cap = script.get("captions", {})
    data = {
        "header": script.get("header", ""),
        "style": script.get("style", "panel"),
        # look and handle come from the topic's channel unless the topic overrides them ("" switches the handle off)
        "channel": channel["id"],
        "theme": script.get("theme", channel.get("theme", "paper")),
        "watermark": script.get("watermark", channel.get("watermark", "")),
        "total": total,
        "progress": script.get("progress", False),
        "outro": outro,
        "fps": script.get("fps", FPS),
        "captionSize": cap.get("size"),
        "captionMode": cap.get("mode"),
        "scenes": [{k: sc.get(k, False) for k in ("vo", "start", "end", "audio", "cont", "words")} for sc in SCENES],
        "captions": [c for sc in SCENES for c in caption_chunks(
            sc, cap.get("words", CAPTION_WORDS), cap.get("line", CAPTION_LINE))],
    }
    return data, clips


MUSIC_DB = -17  # music level against the voice's loudness; it ducks a further 8 dB while the voice speaks
MOODS = {  # per theme: tempo, root note (MIDI) and a four-chord loop (semitones from the root)
    "paper": dict(bpm=100, root=60, chords=[(0, 4, 7), (7, 11, 14), (9, 12, 16), (5, 9, 12)], hats=True),
    "newsprint": dict(bpm=86, root=57, chords=[(0, 3, 7), (-4, 0, 3), (3, 7, 10), (-2, 2, 5)], hats=False),
    "notebook": dict(bpm=104, root=62, chords=[(0, 4, 7), (9, 12, 16), (5, 9, 12), (7, 11, 14)], hats=True),
}


def pluck(midi, dur=0.5):
    """Karplus-Strong plucked string: a soft ukulele-like note."""
    f0 = 440 * 2 ** ((midi - 69) / 12)
    period, n = max(2, int(SR / f0)), int(dur * SR)
    buf = np.random.default_rng(midi).uniform(-1, 1, period)
    out = np.empty(n, np.float32)
    for i in range(n):
        j = i % period
        out[i] = buf[j]
        buf[j] = 0.497 * (buf[j] + buf[(j + 1) % period])
    return out * np.linspace(1, 0, n, dtype=np.float32)


def music_bed(total, theme):
    """An original, quiet loop (pad, bass, plucked arpeggio, shaker) under the voice, so no moment is dead
    silence. Made from numbers, so there are no rights to clear. The mood follows the channel theme."""
    m = MOODS.get(theme, MOODS["paper"])
    hz = lambda midi: 440 * 2 ** ((midi - 69) / 12)
    beat = 60 / m["bpm"]
    n = int(total * SR)
    out = np.zeros(n + int(12 * beat * SR) + SR, np.float32)
    plucks = {}
    for b in range(int(total / (4 * beat)) + 2):
        chord, t0 = m["chords"][b % 4], b * 4 * beat
        s0, bar = int(t0 * SR), int(4 * beat * SR)
        tt = np.arange(bar) / SR
        env = np.minimum(1, tt / 0.4) * np.minimum(1, (4 * beat - tt) / 0.3)
        for c in chord:  # warm pad, one octave below the root
            f = hz(m["root"] - 12 + c)
            out[s0: s0 + bar] += 0.05 * env * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt))
        for k in (0, 2):  # round bass on beats one and three
            s, ln = int((t0 + k * beat) * SR), int(1.8 * beat * SR)
            tb = np.arange(ln) / SR
            out[s: s + ln] += 0.22 * np.tanh(1.5 * np.sin(2 * np.pi * hz(m["root"] - 24 + chord[0]) * tb)) * np.exp(-3 * tb)
        for k, idx in enumerate([0, 1, 2, 1, 0, 2, 1, 2]):  # plucked eighth notes
            note = m["root"] + 12 + chord[idx] - (12 if chord[idx] > 12 else 0)
            p = plucks.setdefault(note, pluck(note))
            s = int((t0 + k * beat / 2) * SR)
            out[s: s + len(p)] += 0.13 * (0.8 + 0.2 * (k % 2 == 0)) * p
            if m["hats"] and k % 2 == 1:  # soft shaker on the off-beats
                ln = int(0.04 * SR)
                noise = np.diff(np.random.default_rng(b * 8 + k).standard_normal(ln + 1)).astype(np.float32)
                out[s: s + ln] += 0.025 * noise * np.exp(-np.arange(ln) / SR * 90)
    out = out[:n]
    fade_in, fade_out = int(0.3 * SR), int(1.0 * SR)
    out[:fade_in] *= np.linspace(0, 1, fade_in)
    out[-fade_out:] *= np.linspace(1, 0, fade_out)
    return out / max(1e-6, float(np.abs(out).max()))


def music_track(script, data, topic_dir, total):
    """script.json "music": true (default for paper style), false, or a path to your own track (looped)."""
    choice = script.get("music", data["style"] == "paper")
    if not choice:
        return None
    if choice is True:
        return music_bed(total, data["theme"])
    path = (topic_dir / choice) if not Path(choice).is_absolute() else Path(choice)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32)
    a = np.tile(a, int(total * SR) // len(a) + 1)[: int(total * SR)].copy()
    a[-SR:] *= np.linspace(1, 0, SR)
    return a / max(1e-6, float(np.abs(a).max()))


def mix_audio(total, clips, cues, music=None):
    n = int(total * SR) + SR
    voice, mix = np.zeros(n, np.float32), np.zeros(n, np.float32)
    for start, clip in clips:
        s = int(start * SR)
        voice[s: s + len(clip)] += clip
    for when, kind in cues:
        fx = sfx(kind).astype(np.float32)
        s = max(0, int(when * SR))
        mix[s: s + len(fx)] += fx[: len(mix) - s]
    mix += voice
    if music is not None:
        # duck the music while the voice speaks: 10 ms loudness steps, smoothed over a quarter second
        hop = SR // 100
        k = len(music) // hop
        env = np.sqrt((voice[: k * hop].reshape(k, hop) ** 2).mean(axis=1))
        speaking = (env > 0.05 * env.max()).astype(np.float32)
        speaking = np.clip(np.convolve(speaking, np.ones(25) / 25, mode="same") * 1.6, 0, 1)
        gain = np.repeat(1 - (1 - 10 ** (-8 / 20)) * speaking, hop)
        voice_rms = np.sqrt((voice[voice != 0] ** 2).mean()) if voice.any() else 0.1
        music = music[: len(gain)] * gain * (voice_rms / np.sqrt((music ** 2).mean() + 1e-9)) * 10 ** (MUSIC_DB / 20)
        mix[: len(music)] += music
    mix = mix[: int(total * SR)]
    mix *= min(1.0, 0.95 / max(1e-6, np.abs(mix).max()))
    wav = BUILD / "audio.wav"
    with wave.open(str(wav), "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes((mix * 32767).astype(np.int16).tobytes())
    return wav


def export_narration(topic, script):
    """output/<topic>-narasi.json: the clean narration (no *keyword* marks) to voice outside, as one take
    (save it as topics/<topic>/voice/full.mp3) or line by line (voice/scene1.wav ...)."""
    lines = [re.sub(r"\s+", " ", sc["vo"].replace("*", "")).strip() for sc in script["scenes"]]
    out = ROOT / "output" / f"{topic}-narasi.json"
    out.parent.mkdir(exist_ok=True)
    data = {
        "topic": topic,
        "channel": script.get("channel", DEFAULT_CHANNEL),
        "words": sum(len(l.split()) for l in lines),
        "lines": lines,
        "text": "\n".join(lines),
        "save_as": f"topics/{topic}/voice/full.mp3",
    }
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"narasi: {out} ({len(lines)} lines, {data['words']} words)")


def check_report(data, qa):
    """Retention warnings worked out from the timeline alone (no frames are rendered)."""
    warn, total, heads = [], data["total"], qa["heads"]
    if not 40 <= total <= 60:
        warn.append(f"length {total:.1f} s: aim for 40-60 s")
    if not heads or heads[0][0] > 0.5:
        first = f"{heads[0][0]:.1f} s" if heads else "never"
        warn.append(f"hook: first headline at {first}; show the question from frame 0 (headline + big subject)")
    scenes = data["scenes"]
    for i, sc in enumerate(scenes):
        ws = sc["words"]
        for a, b in zip(ws, ws[1:]):
            if b["t"] - a["t"] - a["d"] > 0.6:
                warn.append(f"line {i + 1}: {b['t'] - a['t'] - a['d']:.1f} s pause after '{a['w']}' (too noisy to trim)")
        if i and scenes[i - 1]["words"] and ws:
            prev = scenes[i - 1]["words"][-1]
            gap = ws[0]["t"] - prev["t"] - prev["d"]
            if gap > 1.4:
                warn.append(f"{prev['t'] + prev['d']:.1f} s: {gap:.1f} s without voice before line {i + 1}; lower its 'hold' or fill it with a beat")
    end = qa["outroAt"]
    events = sorted({0.0, end, *[x for h in heads for x in h], *[x for c in qa["cams"] for x in c], *qa["chapters"]})
    events = [e for e in events if e <= end]
    for a, b in zip(events, events[1:]):
        if b - a > 7:
            warn.append(f"{a:.1f}-{b:.1f} s: {b - a:.1f} s without a camera move, headline or chapter change; add a beat")
    print(f"check: {total:.1f} s, {len(scenes)} lines, end card {'on' if data.get('outro') else 'off'}")
    for w in warn:
        print("  - " + w)
    print("  ok" if not warn else f"  {len(warn)} warning(s); also look at the stills (empty cards, small text, dead frames)")


def preview_times(data):
    times = []
    for sc in data["scenes"]:
        times += [sc["start"] + (sc["end"] - sc["start"]) * 0.55, sc["end"] - 0.12]
    return times


def save_sheet(frames, path):
    thumbs = [Image.open(io.BytesIO(png)).convert("RGB").resize((270, 480), Image.LANCZOS) for png in frames]
    cols = 7
    rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new("RGB", (270 * cols, 480 * rows), (200, 200, 200))
    for i, im in enumerate(thumbs):
        sheet.paste(im, ((i % cols) * 270, (i // cols) * 480))
    sheet.save(path)


def launch_browser(p):
    """Edge on Windows (always installed there); Playwright's bundled Chromium elsewhere.
    Override with BROWSER_CHANNEL=chromium|msedge|chrome."""
    channel = os.environ.get("BROWSER_CHANNEL") or ("msedge" if sys.platform == "win32" else "chromium")
    args = ["--disable-dev-shm-usage"]  # small /dev/shm in Docker and some VPS images
    if hasattr(os, "geteuid") and os.geteuid() == 0:
        args.append("--no-sandbox")  # Chromium refuses to sandbox when running as root
    if channel == "chromium":
        return p.chromium.launch(args=args)
    return p.chromium.launch(channel=channel, args=args)


def open_page(p, topic_dir, data):
    browser = launch_browser(p)
    page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    page.goto(ENGINE.as_uri())
    page.add_script_tag(path=str(topic_dir / "scenes.js"))
    if not page.evaluate("d => init(d)", data):
        raise SystemExit("fonts did not load (check engine/fonts/)")
    # DevTools capture in "fast" PNG mode: lossless and about twice as quick as page.screenshot
    cdp = page.context.new_cdp_session(page)
    page._cdp = cdp

    def shot(t):
        # renderAt only mutates innerHTML: the screenshot must wait until Chromium has
        # painted, otherwise capture races the paint and previous-frame pixels leak in
        page.evaluate("t => renderAt(t)", t)
        page.wait_for_timeout(100)
        return shot_page(page)
    return browser, page, shot


def shot_page(page):
    res = page._cdp.send("Page.captureScreenshot", {"format": "png", "optimizeForSpeed": True})
    return base64.b64decode(res["data"])


def render_segment(job):
    """Worker process: render frames [a, b) with its own browser into a video-only segment."""
    topic_dir, data, a, b, seg, k = job
    with sync_playwright() as p:
        browser, _, shot = open_page(p, topic_dir, data)
        ff = subprocess.Popen(
            ["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(data["fps"]), "-c:v", "png", "-i", "-",
             "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", str(seg)],
            stdin=subprocess.PIPE)
        for f in range(a, b):
            ff.stdin.write(shot(f / data["fps"]))
            if (f - a) % 100 == 0:
                print(f"  worker {k}: frame {f - a}/{b - a}", flush=True)
        ff.stdin.close()
        browser.close()
        if ff.wait() != 0:
            raise RuntimeError(f"ffmpeg failed on segment {k}")
    return str(seg)


def main():
    global BUILD
    args = sys.argv[1:]
    if not args:
        raise SystemExit(__doc__)
    topic = args[0]
    preview_only = "preview" in args[1:]
    workers = next((int(a.split("=")[1]) for a in args if a.startswith("workers=")), min(6, max(1, os.cpu_count() // 2)))
    topic_dir = ROOT / "topics" / topic
    script = json.loads((topic_dir / "script.json").read_text(encoding="utf-8"))
    if "narasi" in args[1:]:
        export_narration(topic, script)
        return
    BUILD = ROOT / "build" / topic
    BUILD.mkdir(parents=True, exist_ok=True)
    OUT = ROOT / "output" / f"{topic}.mp4"
    OUT.parent.mkdir(exist_ok=True)
    data, clips = timeline(script, topic_dir)
    total = data["total"]
    n_frames = int(round(total * data["fps"]))

    with sync_playwright() as p:
        browser, page, shot = open_page(p, topic_dir, data)
        cues = page.evaluate("getCues()")

        if "check" in args[1:]:
            check_report(data, page.evaluate("qaInfo()"))
            return

        if "thumb" in args[1:]:
            page.evaluate("renderThumbnail()")
            png = shot_page(page)
            thumb = ROOT / "output" / f"{topic}-thumbnail.jpg"
            # JPEG keeps it under YouTube's 2 MB thumbnail limit; the PNG is kept for editing
            Image.open(io.BytesIO(png)).convert("RGB").save(thumb, quality=92)
            (BUILD / "thumbnail.png").write_bytes(png)
            print(f"thumbnail: {thumb} ({thumb.stat().st_size // 1024} KB)")
            return

        if preview_only:
            # optional third argument: comma-separated seconds to render instead of the defaults
            times = [float(x) for x in args[2].split(",")] if len(args) > 2 else preview_times(data)
            frames = [shot(t) for t in times]
            save_sheet(frames, BUILD / "preview.png")
            for t, png in zip(times, frames):
                (BUILD / "stills").mkdir(exist_ok=True)
                (BUILD / "stills" / f"t{t:05.2f}.png").write_bytes(png)
            print(f"preview: {BUILD / 'preview.png'}")
            return
        browser.close()

    wav = mix_audio(total, clips, cues, music_track(script, data, topic_dir, total))
    # split the frames into contiguous slices, one browser per worker, then join the slices
    seg_dir = BUILD / "segments"
    seg_dir.mkdir(exist_ok=True)
    bounds = [round(n_frames * k / workers) for k in range(workers + 1)]
    jobs = [(topic_dir, data, bounds[k], bounds[k + 1], seg_dir / f"seg{k:02d}.mp4", k) for k in range(workers)]
    print(f"  rendering {n_frames} frames with {workers} workers", flush=True)
    # "spawn" on every OS: each worker starts clean (fork after Playwright use is unsafe on Linux)
    with multiprocessing.get_context("spawn").Pool(workers) as pool:
        segs = pool.map(render_segment, jobs)
    concat = seg_dir / "list.txt"
    concat.write_text("".join(f"file '{Path(s).as_posix()}'\n" for s in segs), encoding="utf-8")
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(concat), "-i", str(wav),
         "-map", "0:v", "-map", "1:a", "-c:v", "copy",
         "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
         "-movflags", "+faststart", "-shortest", str(OUT)], check=True)
    for s in segs:
        Path(s).unlink()

    print(f"done: {OUT}  ({total:.1f}s, {n_frames} frames)")


if __name__ == "__main__":
    main()
