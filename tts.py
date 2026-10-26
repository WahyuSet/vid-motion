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
"""
import asyncio
import base64
import difflib
import json
import os
import re
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
        src = recording(topic_dir, i)
        key["source"] = [src.name, src.stat().st_size, src.stat().st_mtime_ns]
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
    """Give every word of the script a time, taken from what Whisper heard.
    Words Whisper got wrong (or wrote differently, e.g. numbers) are interpolated from their neighbours."""
    tokens = text.split()
    a, b = [norm(t) for t in tokens], [norm(h["w"]) for h in heard]
    times = [None] * len(tokens)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            times[blk.a + k] = (heard[blk.b + k]["t"], heard[blk.b + k]["d"])
    known = [i for i, x in enumerate(times) if x]
    if not known:
        raise SystemExit("Whisper could not match the recording to the script text")
    for i in range(len(tokens)):
        if times[i]:
            continue
        prev = max((k for k in known if k < i), default=None)
        nxt = min((k for k in known if k > i), default=None)
        if prev is None:
            t = times[nxt][0] - 0.3 * (nxt - i)
        elif nxt is None:
            t = sum(times[prev]) + 0.3 * (i - prev - 1)
        else:
            t0, t1 = sum(times[prev]), times[nxt][0]
            t = t0 + (t1 - t0) * (i - prev) / (nxt - prev)
        times[i] = (max(0.0, t), 0.25)
    return [{"w": re.sub(r"[,.:;?!]+$", "", tok), "t": t, "d": d} for tok, (t, d) in zip(tokens, times)]
