# vid-motion

Pembuat video motion graphic **YouTube Shorts** (1080×1920) untuk tiga channel, masing-masing dengan maskot,
tema visual, dan aturan kontennya sendiri (di `channels/<id>/`):

| Channel | Maskot | Tema | Topik |
|---|---|---|---|
| **Cicak Tahu** (`@cicaktahu`) | Si Cicak (flat ink) | kertas hangat | fakta unik, mitos atau fakta |
| *(nama belum ada)* `tikus` | Si Tikus (soft plush) | koran | politik, pemerintahan, keuangan, investasi |
| *(nama belum ada)* `stickman` | Stickman (doodle) | buku tulis | kesehatan, tubuh manusia, edukasi |

Topik memilih channel lewat `"channel"` di `script.json` (default `cicaktahu`). Semua visual digambar lewat kode (SVG), suara dari TTS, dirender dengan
browser headless + ffmpeg.

Panduan lengkap untuk agent AI (alur kerja, aturan konten, API engine): **[AGENTS.md](AGENTS.md)**.

## Alur kerja dengan agent (Muse)

Agent membaca `AGENTS.md` otomatis. Tiap tugas punya skill di `skills/`, dan progresnya dicatat di
[ideas.md](ideas.md). Kamu menyetujui di tiga titik (👤) dengan mengubah status di `ideas.md`
atau menjawab pertanyaan agent.

| Langkah | Contoh perintah ke agent | Hasil | Persetujuanmu |
|---|---|---|---|
| Cari ide | "jalankan skill cari-ide" | 5 usulan di `ideas.md` | 👤 pilih → `disetujui` |
| Tulis naskah | "jalankan skill tulis-naskah untuk <id>" | `script.json`, `sources.md`, `plan.md` | 👤 cek fakta → `naskah-ok` |
| Buat video | "jalankan skill buat-video untuk <id>" | `output/<id>.mp4`, `meta.md` | 👤 tonton → `siap-upload` |
| Thumbnail | "jalankan skill buat-thumbnail untuk <id>" | `output/<id>-thumbnail.jpg` | — |

## Instalasi

### Windows (komputer ini)

Butuh Python 3.10+, ffmpeg di PATH, dan Microsoft Edge (sudah ada di Windows).

```bash
pip install -r requirements.txt
```

### VPS Linux (Ubuntu/Debian)

```bash
git clone <repo> vid-motion && cd vid-motion
bash scripts/setup_vps.sh            # tambahkan --extra untuk Azure Speech + Whisper
```

Skrip ini memasang ffmpeg, membuat `.venv`, memasang paket Python, dan Chromium headless.
Setelah itu pakai `.venv/bin/python` untuk semua perintah.

## Pemakaian

```bash
python build_video.py burung-listrik preview          # cek beberapa frame (cepat)
python build_video.py burung-listrik preview 3,12.5   # frame di detik tertentu
python build_video.py burung-listrik                  # render penuh -> output/burung-listrik.mp4
python build_video.py burung-listrik thumb            # thumbnail -> output/burung-listrik-thumbnail.jpg
python build_video.py burung-listrik workers=2        # jumlah browser paralel (default: setengah core, maks 6)
```

Topik yang ada: `burung-listrik` (gaya baru, layar penuh), `alpukat`, `mandi-malam` (gaya kartu lama).

## Suara (TTS)

Diatur di `script.json` (`"voice"`) atau lewat environment variable:

| Provider | Cara pakai |
|---|---|
| `edge` (default) | Gratis, suara Microsoft "Gadis"/"Ardi", tidak resmi. Cocok untuk uji coba. |
| `azure` | Resmi Microsoft, suara sama. `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, paket `requirements-extra.txt`. |
| `elevenlabs` | Suara paling natural. `ELEVENLABS_API_KEY`, isi `"name"` dengan voice id. |
| `file` | Rekaman suara sendiri di `topics/<topik>/voice/scene1.wav`, dst. Waktu tiap kata dicari otomatis dengan Whisper. |

Contoh: `TTS_PROVIDER=azure python build_video.py burung-listrik`

Untuk channel yang dimonetisasi, pakai `azure`, `elevenlabs`, atau `file`, bukan `edge`.

## Struktur

```
build_video.py   pipeline render
tts.py           provider suara
engine/          mesin gambar (lib.js), Si Cicak (cicak.js), font (OFL)
channels/<id>/   channel.json (nama, handle, maskot, tema) + RULES.md (aturan konten channel)
topics/<topik>/  script.json (naskah) + scenes.js (ilustrasi) + sources.md, plan.md, meta.md
skills/          instruksi per tugas untuk agent (cari-ide, tulis-naskah, buat-video, buat-thumbnail)
ideas.md         backlog ide dan status persetujuan
docs/            sketsa karakter; docs/mascots/ berisi lembar semua pose & ekspresi maskot
                 (Si Cicak, Si Tikus, Stickman), dibuat ulang dengan python make_brand.py
build/, output/  hasil render (tidak masuk git)
```

## Lisensi pihak ketiga

Font Nunito, Lilita One, dan Caveat memakai SIL Open Font License (lihat `engine/fonts/*/OFL.txt`).
