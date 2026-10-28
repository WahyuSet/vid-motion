"""Voice-over providers.

Every provider turns one scene's text into an audio file plus word timings:
    words = [{"w": word, "t": start_seconds, "d": duration_seconds}, ...]
The animation is anchored to those timings, so a provider that cannot report them
(a recorded voice, or a TTS without timestamps) is aligned afterwards with Whisper.

Choose a provider in topics/<topic>/script.json:
    "voice": {"provider": "edge", "name": "id-ID-GadisNeural", "rate": "+12%"}
or override per run with environment variables TTS_PROVIDER / TTS_VOICE.

  edge        Microsoft Edge read-aloud voices via edge-tts (free, unofficial, needs internet)
  azure       Azure AI Speech, same neural voices, official   (AZURE_SPEECH_KEY, AZURE_SPEECH_REGION)
  elevenlabs  ElevenLabs, "name" is the voice id             (ELEVENLABS_API_KEY; optional "model")
  file        your own recordings: topics/<topic>/voice/scene1.wav (or .mp3/.m4a/...), aligned by Whisper
              or ONE recording of the whole script, topics/<topic>/voice/full.wav (or .mp3/...): Whisper times
              every word once and it is cut into lines in the pauses (split_full). A full recording is used
              automatically, without setting the provider.
"""
import asyncio
import base64
import difflib
import hashlib
import json
import os
import re
import subprocess
import urllib.request
from pathlib import Path

DEFAULTS = {"provider": "edge", "name": "id-ID-GadisNeural", "rate": "+12%"}
AUDIO_EXTS = (".wav", ".mp3", ".m4a", ".ogg", ".flac", ".aac")


def voice_config(script):
    cfg = {**DEFAULTS, **script.get("voice", {})}
    if os.environ.get("TTS_PROVIDER"):
        cfg["provider"] = os.environ["TTS_PROVIDER"]
    if os.environ.get("TTS_VOICE"):
        cfg["name"] = os.environ["TTS_VOICE"]
    return cfg


def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())


def voice_for(i, text, cfg, cache_dir, topic_dir):
    """Audio path + word timings for scene i, cached in cache_dir until text or voice settings change."""
    cache_dir.mkdir(parents=True, exist_ok=True)
    meta = cache_dir / f"scene{i + 1}.json"
    key = {"text": text, "voice": cfg["name"], "rate": cfg["rate"]}
    if cfg["provider"] != "edge":  # keeps caches made before providers existed valid
        key["provider"] = cfg["provider"]
    if cfg["provider"] == "file":
        src = full_recording(topic_dir) or recording(topic_dir, i)
        key["source"] = stamp(src)
    if meta.exists():
        m = json.loads(meta.read_text(encoding="utf-8"))
        audio = cache_dir / m.get("audio", f"scene{i + 1}.mp3")
        if {k: m.get(k) for k in key} == key and audio.exists():
            return audio, m["words"]

    provider = cfg["provider"]
    if provider == "edge":
        data, ext, words = edge(text, cfg)
    elif provider == "azure":
        data, ext, words = azure(text, cfg)
    elif provider == "elevenlabs":
        data, ext, words = elevenlabs(text, cfg)
    elif provider == "file":
        src = recording(topic_dir, i)
        data, ext, words = src.read_bytes(), src.suffix, None
    else:
        raise SystemExit(f"unknown TTS provider {provider!r} (edge, azure, elevenlabs, file)")

    audio = cache_dir / f"scene{i + 1}{ext}"
    audio.write_bytes(data)
    if not words:
        words = align_to_script(text, whisper_words(audio))
    meta.write_text(json.dumps({**key, "audio": audio.name, "words": words}, ensure_ascii=False, indent=1),
                    encoding="utf-8")
    return audio, words


# ---------- providers ----------

def edge(text, cfg):
    import edge_tts

    async def run():
        comm = edge_tts.Communicate(text, cfg["name"], rate=cfg["rate"], boundary="WordBoundary")
        audio, words = bytearray(), []
        async for ch in comm.stream():
            if ch["type"] == "audio":
                audio += ch["data"]
            elif ch["type"] == "WordBoundary":
                words.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "w": ch["text"]})
        return bytes(audio), words
    audio, words = asyncio.run(run())
    return audio, ".mp3", words


def azure(text, cfg):
    try:
        import azure.cognitiveservices.speech as speechsdk
    except ImportError:
        raise SystemExit("azure provider needs: pip install azure-cognitiveservices-speech")
    key, region = os.environ.get("AZURE_SPEECH_KEY"), os.environ.get("AZURE_SPEECH_REGION")
    if not key or not region:
        raise SystemExit("azure provider needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION")
    sc = speechsdk.SpeechConfig(subscription=key, region=region)
    sc.set_speech_synthesis_output_format(speechsdk.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3)
    synth = speechsdk.SpeechSynthesizer(speech_config=sc, audio_config=None)
    words = []

    def on_boundary(evt):
        if evt.boundary_type == speechsdk.SpeechSynthesisBoundaryType.Word:
            words.append({"t": evt.audio_offset / 1e7, "d": evt.duration.total_seconds(), "w": evt.text})
    synth.synthesis_word_boundary.connect(on_boundary)
    lang = "-".join(cfg["name"].split("-")[:2])
    safe = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    ssml = (f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="{lang}">'
            f'<voice name="{cfg["name"]}"><prosody rate="{cfg["rate"]}">{safe}</prosody></voice></speak>')
    result = synth.speak_ssml_async(ssml).get()
    if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
        raise SystemExit(f"azure synthesis failed: {result.reason} {getattr(result, 'cancellation_details', '')}")
    return result.audio_data, ".mp3", words


def elevenlabs(text, cfg):
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        raise SystemExit("elevenlabs provider needs ELEVENLABS_API_KEY")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{cfg['name']}/with-timestamps?output_format=mp3_44100_128"
    body = json.dumps({"text": text, "model_id": cfg.get("model", "eleven_multilingual_v2")}).encode()
    req = urllib.request.Request(url, data=body, method="POST",
                                 headers={"xi-api-key": key, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        res = json.loads(r.read())
    al = res.get("alignment") or {}
    words, cur, start, end = [], "", None, None
    for ch, s, e in zip(al.get("characters", []), al.get("character_start_times_seconds", []),
                        al.get("character_end_times_seconds", [])):
        if ch.isspace():
            if cur:
                words.append({"w": cur, "t": start, "d": end - start})
            cur, start = "", None
            continue
        if start is None:
            start = s
        cur, end = cur + ch, e
    if cur:
        words.append({"w": cur, "t": start, "d": end - start})
    return base64.b64decode(res["audio_base64"]), ".mp3", words


def stamp(path):
    """Identifies a recording by its content, so git checkouts or copies (which change the file's time) do not
    make Whisper align an unchanged take again."""
    return [path.name, path.stat().st_size, hashlib.sha1(path.read_bytes()).hexdigest()[:16]]


def full_recording(topic_dir):
    """topics/<topic>/voice/full.* (one take of the whole script), or None."""
    for ext in AUDIO_EXTS:
        p = topic_dir / "voice" / f"full{ext}"
        if p.exists():
            return p
    return None


def split_full(texts, cfg, cache_dir, topic_dir):
    """Cut one recording of the whole script into one clip per line, written to the voice cache exactly as if
    every line had been recorded alone (sceneN.wav + sceneN.json). Whisper hears the take once; the script's
    words get its times; each line is cut from just before its first word to the middle of the pause after it.
    Skipped while the recording and the texts are unchanged."""
    src = full_recording(topic_dir)
    cache_dir.mkdir(parents=True, exist_ok=True)
    marker, want = cache_dir / "full.json", {"source": stamp(src), "texts": texts}
    if marker.exists() and json.loads(marker.read_text(encoding="utf-8")) == want:
        return
    print(f"  aligning {src.name} with Whisper ...", flush=True)
    words = align_to_script(" ".join(texts), whisper_words(src))
    lines, k = [], 0
    for text in texts:
        n = len(text.split())
        lines.append(words[k: k + n])
        k += n
    # Whisper's edges are loose (a line's first word often swallows the silence before it), so each line's
    # first word starts where the sound really starts, and its last word ends where the sound really stops
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(src), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    hop = 160  # 10 ms steps at 16 kHz
    x = np.frombuffer(raw, np.float32)
    env = np.abs(x[: len(x) // hop * hop]).reshape(-1, hop).max(axis=1)
    loud = env > 0.06 * env.max()
    for i, ws in enumerate(lines):
        lo = int(max(0.0, ws[0]["t"] - 0.6) * 100)
        if i:
            lo = max(lo, int((lines[i - 1][-1]["t"] + lines[i - 1][-1]["d"]) * 100))
        seg = loud[lo: int((ws[0]["t"] + ws[0]["d"]) * 100) + 1]
        skip = 0
        if i:  # the window may start inside the previous line's last sound: step past it first
            while skip < len(seg) and seg[skip]:
                skip += 1
        hit = np.flatnonzero(seg[skip:])
        if hit.size:
            on = (lo + skip + hit[0]) / 100
            ws[0]["d"] = max(0.05, ws[0]["t"] + ws[0]["d"] - on)
            ws[0]["t"] = on
        end = ws[-1]["t"] + ws[-1]["d"]
        hi = int(min((lines[i + 1][0]["t"] if i + 1 < len(lines) else end + 0.8), end + 0.8) * 100)
        lo2 = int(max(ws[-1]["t"], end - 0.4) * 100)
        hit = np.flatnonzero(loud[lo2: hi])
        if hit.size:
            ws[-1]["d"] = max(0.05, (lo2 + hit[-1] + 1) / 100 - ws[-1]["t"])
    ends = [w[-1]["t"] + w[-1]["d"] for w in lines]
    for i, (text, ws) in enumerate(zip(texts, lines)):
        a = max(0.0, ws[0]["t"] - 0.06)
        b = (ends[i] + lines[i + 1][0]["t"]) / 2 if i + 1 < len(lines) else ends[i] + 0.5
        if i:
            a = max(a, (ends[i - 1] + ws[0]["t"]) / 2)
        clip = cache_dir / f"scene{i + 1}.wav"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", str(src),
                        "-ac", "1", "-ar", "48000", str(clip)], check=True)
        key = {"text": text, "voice": cfg["name"], "rate": cfg["rate"], "provider": "file", "source": stamp(src)}
        local = [{**w, "t": round(max(0.0, w["t"] - a), 3)} for w in ws]
        (cache_dir / f"scene{i + 1}.json").write_text(
            json.dumps({**key, "audio": clip.name, "start": round(a, 3), "words": local}, ensure_ascii=False, indent=1), encoding="utf-8")
    marker.write_text(json.dumps(want, ensure_ascii=False), encoding="utf-8")


def recording(topic_dir, i):
    folder = topic_dir / "voice"
    for ext in AUDIO_EXTS:
        p = folder / f"scene{i + 1}{ext}"
        if p.exists():
            return p
    raise SystemExit(f"file provider: missing recording {folder / f'scene{i + 1}.wav'} (or {', '.join(AUDIO_EXTS)})")


# ---------- alignment ----------

def whisper_words(audio):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        raise SystemExit("this provider needs Whisper for word timings: pip install faster-whisper")
    # CPU by default: "auto" picks an NVIDIA GPU even when the CUDA libraries are missing
    model = WhisperModel(os.environ.get("WHISPER_MODEL", "small"), device=os.environ.get("WHISPER_DEVICE", "cpu"),
                         compute_type="int8")
    segments, _ = model.transcribe(str(audio), language=os.environ.get("WHISPER_LANG", "id"), word_timestamps=True)
    return [{"w": w.word.strip(), "t": w.start, "d": w.end - w.start} for seg in segments for w in seg.words]


def align_to_script(text, heard):
    """Give every word of the script a time, taken from what Whisper heard. Matched letter by letter, so words
    Whisper spelled differently, glued together or split ("kedaluarsah", "Masasih", "pelan -pelan") still get
    their own times; words with no matching letters at all (often numbers) are interpolated from neighbours."""
    tokens = text.split()
    # one entry per letter: which script word it belongs to / the time Whisper heard it at
    a_word = [i for i, tok in enumerate(tokens) for _ in norm(tok)]
    a = "".join(norm(tok) for tok in tokens)
    b, b_time = "", []
    for h in heard:
        letters = norm(h["w"])
        for k, ch in enumerate(letters):
            b += ch
            b_time.append(h["t"] + h["d"] * k / max(1, len(letters)))
        if letters:
            b_time[-1] = (b_time[-1], h["t"] + h["d"])  # the last letter also carries the word's end
    first, last = [None] * len(tokens), [None] * len(tokens)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            i, bt = a_word[blk.a + k], b_time[blk.b + k]
            t0, t1 = bt if isinstance(bt, tuple) else (bt, bt)
            first[i] = t0 if first[i] is None else min(first[i], t0)
            last[i] = t1 if last[i] is None else max(last[i], t1)
    known = [i for i in range(len(tokens)) if first[i] is not None]
    if not known:
        raise SystemExit("Whisper could not match the recording to the script text")
    times = [(first[i], max(0.05, last[i] - first[i])) if first[i] is not None else None for i in range(len(tokens))]
    i = 0
    while i < len(tokens):  # runs of unmatched words share the gap between their neighbours by length
        if times[i]:
            i += 1
            continue
        j = i
        while j < len(tokens) and not times[j]:
            j += 1
        weights = [max(1, len(norm(tokens[k]))) for k in range(i, j)]
        t0 = sum(times[i - 1]) if i else max(0.0, times[j][0] - 0.3 * sum(weights) / 5)
        t1 = times[j][0] if j < len(tokens) else t0 + 0.3 * sum(weights) / 5
        span, acc = max(0.05, t1 - t0), 0
        for k, wt in zip(range(i, j), weights):
            times[k] = (t0 + span * acc / sum(weights), span * wt / sum(weights))
            acc += wt
        i = j
    return [{"w": re.sub(r"[,.:;?!]+$", "", tok), "t": t, "d": d} for tok, (t, d) in zip(tokens, times)]
