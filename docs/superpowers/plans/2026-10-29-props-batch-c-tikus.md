# Props Batch C (Si Tikus) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambah 18 props untuk channel Si Tikus (keuangan, ekonomi, berita, pemerintahan) ke `engine/props.js`: 7 diangkat dari props yang sudah digambar di topik, 11 baru. Semuanya tampil benar di tiga tema.

**Architecture:** Props baru masuk satu bagian baru `// ---------- batch C: Si Tikus (finance, economy, news) ----------` di akhir `engine/props.js` dan mengikuti pola props lama: `nama(x, y, s = 1, {opsi})`, semua bentuk lewat `vol`, detail lewat `detail`/`tone`, teks lewat `bodyText`/`txt`, `return G(T(x, y, s, rot), 1, g)`. Skrip cek otomatis `scripts/check_props.py` memanggil tiap prop di halaman engine pada tiga tema dan menolak output yang rusak. `topics/demo-props` memamerkannya di view 8 dan 9 untuk cek visual.

**Tech Stack:** JavaScript yang menghasilkan string SVG (`engine/props.js`, `engine/lib.js`), Python + Playwright (`build_video.py`, skrip cek baru).

**Spec:** tidak ada dokumen spec terpisah. Spec-nya adalah tabel kekurangan props Tikus yang disetujui pengguna di chat tanggal 2026-10-29, ditambah `AGENTS.md` (bagian "Prop library", "Layout rules") dan `channels/tikus/RULES.md`.

**Di luar batch ini (batch D nanti):** struk belanja, jam pasir, tumpukan koin, timbangan, kapal kontainer, pabrik, lapak pasar, podium, layar TV berita, rambu peringatan.

## Global Constraints

- Setiap bentuk memakai `vol(path, warna, {depth, w})`, bukan `fill` datar. Bayangan kontak memakai `shadow()`. Garis detail memakai `detail(d, tone(warna, -0.3), lebar)`.
- Hanya dari `t`: tidak ada `Math.random`, tidak ada state di luar fungsi. Acak yang stabil memakai `rnd(i)`.
- Teks hanya lewat `txt`, `bodyText` atau `mono`. Label yang harus ikut gaya tema (Oswald di newsprint, Caveat di notebook) memakai `bodyText`.
- Tidak ada logo, merek, atau desain asli: tidak ada nama bank, logo jaringan kartu, logo Pertamina/KPU/LPS, atau nama produk BBM.
- Menurut RULES.md: jangan pernah menggambar "money bags, cash under the table, a mask, bars or a prison", juga simbol partai atau gedung DPR. `safeBox` adalah brankas biasa, bukan tumpukan uang.
- Nama global harus unik di `topics`, `engine`, `brand`. `const` bernama sama di topik membuat topik itu error.
- Jangan ubah fungsi yang sudah ada di `engine/props.js` dan jangan ubah topik lama (`lps-jamin`, `lps-jamin-hf`, `bbm-india-china`, `demo-tikus`). Topik lama tetap memakai versi lokalnya. Nama baru sengaja berbeda dari nama lokal itu.
- Sesuai AGENTS.md: "Re-check old topics with `preview` afterwards."

## Review Focus

1. **Nama bentrok dengan topik.** Satu `const`/`function` global dengan nama prop baru di topik mana pun membuat topik itu gagal dimuat. Dicek oleh `check_names()` di Task 1, yang dijalankan di setiap task.
2. **Dua `levelGauge` dalam satu frame.** Kalau `clipPath` id sama, cairan gauge kedua ikut terpotong bentuk gauge pertama. Diuji di Task 1: dua gauge dengan `id` berbeda, kedua id muncul di output.
3. **Nilai di luar rentang.** `level` -0.2 atau 1.4, `open` 2, `p` -1, `rows` kosong atau 6 baris tidak boleh menghasilkan `NaN` atau cairan yang keluar dari tabung. Nilai di-`clamp`, baris dipotong ke 4. Diuji di Task 1 dan 2.
4. **Tema newsprint dan notebook.** `bodyText` memakai Oswald/Caveat yang lebarnya berbeda, jadi label panjang ("Rp1.250.000") bisa keluar dari bentuknya. Dicek visual di still tiga tema (Task 5). Label dikecilkan dengan `measure` bila lebih lebar dari tempatnya.
5. **Prop beranimasi pada `t` jauh.** `hangSign` dan `gavel` yang berayun pada `t = 1000` atau sebelum `t0` harus diam di posisi akhir/awal, tanpa `NaN`. Diuji di Task 1 dan 4.

---

### Task 1: Skrip cek + 7 props yang diangkat dari topik

**Files:**
- Create: `scripts/check_props.py`
- Modify: `engine/props.js` (bagian baru di akhir file, plus satu baris `// Tikus:` di komentar header)
- Modify: `topics/demo-props/script.json` (baris narasi ke-7), `topics/demo-props/scenes.js` (view 8 di y = -13300)

**Interfaces:**
- Consumes: `bv.timeline(script, topic_dir)` dan `bv.open_page(p, topic_dir, data)` dari `build_video.py` (set `bv.BUILD = ROOT / "build" / "demo-props"` dulu); `applyTheme(name, 1080, 1920)` di halaman.
- Produces:
  - `scripts/check_props.py`: `CASES: dict[str, list[str]]` (nama prop → ekspresi JS pemanggilnya), `check_names(names) -> list[str]` (pesan bentrok), `main()`. Jalankan dengan `python scripts/check_props.py`, exit 0 kalau lolos.
  - `savingsBook(x, y, s = 1, { title = 'TABUNGAN', col = '#2F5E9E', rot = -6 })`: buku tabungan berpusat di (x, y), punggung lebih gelap, lingkaran emas berisi "Rp", tulisan "BUKU" dan `title`. Dari `passbook` di `lps-jamin`.
  - `shieldBadge(x, y, s = 1, { label = 'AMAN', col = C.cool })`: perisai berpusat di (x, y) dengan garis dalam putih dan `label`. Dari `emblem`.
  - `hangSign(x, y, s = 1, { label = 'TUTUP', col = C.accent, t = 0, t0 = null })`: papan yang tergantung dua tali dari kait di (x, y). Kalau `t0` diisi, papan berayun mulai `t0` dengan `9 * Math.exp(-3 * u) * Math.sin(11 * u)` derajat, `u = max(0, t - t0)`. Dari `closedSign`, tanpa logika jatuh dan tanpa `K`.
  - `levelGauge(x, y, s = 1, { level = 0.5, limit = null, label = '', value = '', col = '#58AEE8', hot = '#E0522F', t = 0, id = 'lg' })`: tabung kaca berdiri di (x, y) dengan alas berlabel. Cairan setinggi `clamp(level)`. Warnanya bergeser ke `hot` sejauh `clamp((level - limit) / 0.4)`. Ada garis putus-putus di `limit` dan teks `value` di dalam cairan. Permukaan cairan bergelombang dari `t`. `clipPath` id = `id`. Dari `gauge`.
  - `checkBoard(x, y, s = 1, { title = 'SYARAT', rows = [], active = -1 })`: papan putih 620×640 berkaki, berdiri di (x, y), dengan pita judul `C.accent`. `rows` berisi sampai 4 item `{ text, sub = '', icon = '', check = 0 }`. `icon` adalah SVG yang digambar di sekitar (0, 0) dengan ukuran ±60. `check` 0..1 menggambar centang hijau. Baris ke-`active` diberi latar `C.yellow`. Dari `board`, tanpa waktu `K`.
  - `priceLabel(x, y, s = 1, { label = 'Rp10.000', col = '#FFFFFF', rot = -6 })`: label harga berbentuk tag dengan lubang tali, berpusat di (x, y). Dari `priceTag` di `demo-tikus`.
  - `fuelPump(x, y, s = 1, { fuel = 'BENSIN', price = 'Rp10.000/L', col = C.accent, t = 0 })`: dispenser SPBU generik berdiri di (x, y), dengan pita atas bertulisan "SPBU", layar gelap berisi `fuel` dan `price`, selang, dan nozel. Dari `spbuPump`, dengan semua `fill="url(#d…)"` diganti `vol`.

- [ ] **Step 1: Tulis `scripts/check_props.py` dengan kasus untuk 7 props ini**

`main()` membuka halaman `demo-props`, lalu untuk tiap tema di `['paper', 'newsprint', 'notebook']` memanggil `applyTheme`. Setiap ekspresi di `CASES` dievaluasi dua kali, dan skrip memastikan:
```python
assert isinstance(svg, str) and len(svg) > 200, f"{name}: output kosong"
for bad in ("NaN", "undefined", "Infinity", "[object"):
    assert bad not in svg, f"{name} [{theme}]: '{bad}' di output: {expr}"
norm = lambda s: re.sub(r"vol\d+", "vol#", s)
assert norm(svg) == norm(svg2), f"{name}: tidak deterministik"
```
Kalau semua lolos, `main()` mencetak `ok: <jumlah props> props x 3 tema` dan keluar dengan 0. Kalau ada yang gagal, semua pesan dicetak dan skrip keluar dengan 1. `check_names(names)` mencari `^\s*(const|let|var|function)\s+<nama>\b` di `topics/**/*.js`, `engine/*.js`, `brand/*.js`. Hasilnya error kalau sebuah nama didefinisikan lebih dari sekali, atau sekali tapi tidak di `engine/props.js`. Kasus Task 1:
```python
"savingsBook": ["savingsBook(0, 0, 1)", "savingsBook(0, 0, 0.5, { title: 'DEPOSITO', rot: 0 })"],
"shieldBadge": ["shieldBadge(0, 0, 1)", "shieldBadge(0, 0, 1, { label: 'DIJAMIN' })"],
"hangSign":    ["hangSign(0, 0, 1)", "hangSign(0, 0, 1, { t: 0.2, t0: 1 })", "hangSign(0, 0, 1, { t: 1000, t0: 1 })"],
"levelGauge":  ["levelGauge(0, 0, 1, { level: 0.6, limit: 0.5, value: '3,75%', id: 'g1' }) + levelGauge(300, 0, 1, { level: 0.3, id: 'g2' })",
                "levelGauge(0, 0, 1, { level: -0.2 })", "levelGauge(0, 0, 1, { level: 1.4, limit: 0.5 })"],
"checkBoard":  ["checkBoard(0, 0, 1)", "checkBoard(0, 0, 1, { rows: [{ text: 'TERCATAT', sub: 'di bank', check: 1 }, { text: 'BUNGA WAJAR', check: 0.5 }], active: 1 })",
                "checkBoard(0, 0, 1, { rows: Array.from({ length: 6 }, (_, i) => ({ text: 'BARIS ' + i })) })"],
"priceLabel":  ["priceLabel(0, 0, 1)", "priceLabel(0, 0, 1, { label: 'Rp1.250.000' })"],
"fuelPump":    ["fuelPump(0, 0, 1)", "fuelPump(0, 0, 1, { fuel: 'SOLAR', price: 'Rp6.800/L', t: 3 })"],
```
Tambahan untuk Review Focus 2: kasus pertama `levelGauge` juga harus memuat `id="g1"` dan `id="g2"`.

- [ ] **Step 2: Jalankan skrip, pastikan gagal**

Run: `python scripts/check_props.py`
Expected: FAIL dengan `savingsBook is not defined` (atau `ReferenceError`), plus pesan `check_names` bahwa `savingsBook` tidak ada di `engine/props.js`.

- [ ] **Step 3: Implementasikan 7 props di `engine/props.js`**

Pindahkan bentuk dari topik asalnya (path dan warna boleh sama), dengan perubahan ini: `newsText` diganti `bodyText(…, anchor, weight)`, `C.book`/`C.gold`/`C.liquid`/`C.hot` jadi opsi berwarna hex, waktu `K.*` jadi opsi, `stroke(…)` untuk garis detail jadi `detail`. Di `levelGauge`, posisi y cairan = `top + (1 - clamp(level)) * tinggiTabung`. Di `checkBoard`, `rows.slice(0, 4)`, dan jarak baris dibagi rata pada tinggi papan di bawah pita judul. Tambahkan baris header `// Tikus:    savingsBook, shieldBadge, hangSign, levelGauge, checkBoard, priceLabel, fuelPump` di komentar atas file.

- [ ] **Step 4: Jalankan skrip, pastikan lolos**

Run: `python scripts/check_props.py`
Expected: `ok: 7 props x 3 tema`, exit 0.

- [ ] **Step 5: Pamerkan di `demo-props` view 8**

Di `script.json`, tambah baris ke-7: `{"vo": "Untuk Si Tikus ada *buku tabungan*, perisai, papan, meteran, label harga, dan pompa bensin.", "hold": 0.6}`. Di `scenes.js`, tambah `s8: s[6].start` di `K`, kunci kamera `{ at: K.s8, dur: 0.9, x: 0, y: -13300, z: 1 }`, headline `'SI TIKUS\n*UANG*'`, dan cue `whoosh`. Ubah `end` headline view 7 jadi `K.s8 - 0.1`. Perpanjang `<rect>` latar sampai y = -15200. Di view 8, susun ketujuh props di atas `woodPlank` sesuai tata letak view 6 (dua lantai, skala 0.45–0.65, x di -450..450, semua terlihat di layar 1080 lebar).

- [ ] **Step 6: Lihat still view 8**

Run: `python build_video.py demo-props preview <detik di tengah baris 7>`. Detiknya ambil dari `build/demo-props/tts/scene7.json` setelah preview pertama.
Expected: buka `build/demo-props/preview.png`. Ketujuh props terbaca, tidak ada yang terpotong atau bertumpuk, tidak ada bentuk hitam pekat.

- [ ] **Step 7: Commit**

```bash
git add scripts/check_props.py engine/props.js topics/demo-props/script.json topics/demo-props/scenes.js
git commit -m "Add props batch C part 1: Tikus props promoted from topics, and a props check script"
```

### Task 2: Props keuangan baru (kartu ATM, emas, brankas)

**Files:**
- Modify: `engine/props.js` (bagian batch C, plus header `// Tikus:`), `scripts/check_props.py` (`CASES`), `topics/demo-props/scenes.js` (view 9 di y = -15200, latar diperpanjang ke -17100)

**Interfaces:**
- Consumes: `CASES` dan `main()` dari Task 1; view 8 dan pola kamera dari Task 1.
- Produces:
  - `atmCard(x, y, s = 1, { col = '#2F5E9E', digits = '1234', rot = -8 })`: kartu generik 340×214 berpusat di (x, y), dengan chip emas, ikon gelombang nirkontak, `•••• •••• •••• ${digits}`, dan pita warna. Tanpa nama bank atau logo jaringan.
  - `goldBar(x, y, s = 1, { n = 1, label = 'EMAS' })`: batang emas trapesium (tampak samping-atas) berdiri di (x, y). `n` = 1 atau 3; kalau 3, bentuknya piramida 2 + 1. `label` dicetak di muka atas setiap batang.
  - `safeBox(x, y, s = 1, { open = 0, col = '#5A6170', inside = '' })`: brankas berdiri di (x, y) dengan roda kombinasi dan gagang. Pintu berputar ke kiri sejauh `clamp(open) * 100` derajat (skala-x pintu `cos`). Bagian dalam menampilkan SVG `inside` (misalnya `savingsBook` dan `goldBar`), digambar di sekitar (0, -150).

- [ ] **Step 1: Tambah kasus ke `CASES`**

```python
"atmCard":  ["atmCard(0, 0, 1)", "atmCard(0, 0, 1, { col: '#8A5A36', digits: '9876', rot: 0 })"],
"goldBar":  ["goldBar(0, 0, 1)", "goldBar(0, 0, 1, { n: 3 })"],
"safeBox":  ["safeBox(0, 0, 1)", "safeBox(0, 0, 1, { open: 0.7, inside: goldBar(0, 0, 0.5) })", "safeBox(0, 0, 1, { open: 2 })"],
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `python scripts/check_props.py`
Expected: FAIL `atmCard is not defined`.

- [ ] **Step 3: Implementasikan `atmCard`, `goldBar`, `safeBox` di `engine/props.js`**

Kalau `open < 0.5`, gambar bagian dalam lalu pintu. Kalau `open >= 0.5`, bagian dalam digambar di atas pintu, supaya isinya tidak tertutup daun pintu yang terbuka lebar.

- [ ] **Step 4: Jalankan, pastikan lolos**

Run: `python scripts/check_props.py`
Expected: `ok: 10 props x 3 tema`.

- [ ] **Step 5: Tambah ketiganya ke view 9 `demo-props`, lihat still-nya**

Kamera: `{ at: K.s8 + (K.s8end - K.s8) * 0.55, dur: 0.9, x: 0, y: -15200, z: 1 }`, dengan `K.s8end = s[6].end`, mengikuti pola `s4` di view 4. Simpan waktu kunci ini sebagai `K.v9`. Headline view 8 berakhir di `K.v9 - 0.1`, headline view 9 `'SI TIKUS\n*EKONOMI*'` mulai `K.v9 + 0.25`.
Run: `python build_video.py demo-props preview <detik akhir baris 7>`
Expected: ketiga props terbaca dan pintu brankas tidak menutupi isinya.

- [ ] **Step 6: Commit**

```bash
git add engine/props.js scripts/check_props.py topics/demo-props/scenes.js
git commit -m "Add props batch C part 2: ATM card, gold bar, safe"
```

### Task 3: Props ekonomi baru (keranjang belanja, drum minyak, tabung LPG, rumah)

**Files:**
- Modify: `engine/props.js`, `scripts/check_props.py`, `topics/demo-props/scenes.js` (view 9)

**Interfaces:**
- Consumes: `CASES` (Task 1), view 9 (Task 2).
- Produces:
  - `shoppingBasket(x, y, s = 1, { col = '#E0522F', items = ['beras', 'telur', 'minyak'] })`: keranjang plastik pasar berlubang anyaman, berdiri di (x, y). `items` memilih isi yang menyembul dari kunci `'beras'` (karung putih polos bertulis BERAS), `'telur'` (tiga telur), `'minyak'` (botol kuning tanpa merek) dan `'sayur'` (daun `leaf()`). Kunci yang tidak dikenal diabaikan.
  - `oilBarrel(x, y, s = 1, { col = '#2F5E9E', label = 'MINYAK' })`: drum 200 L berdiri di (x, y), dengan dua cincin, tutup lubang di atas, dan label polos.
  - `lpgTank(x, y, s = 1, { col = '#5FA84A', label = '3 kg' })`: tabung gas melon berdiri di (x, y), dengan kaki cincin, pegangan, katup, dan `label`. Tanpa logo.
  - `house(x, y, s = 1, { col = '#E9D8B8', roof = '#C2593A', door = '#8A5A36', label = '' })`: rumah tapak satu lantai berdiri di (x, y), dengan atap pelana, pintu, dua jendela, dan papan `label` opsional di atap (misalnya `'KPR'`).

- [ ] **Step 1: Tambah kasus ke `CASES`**

```python
"shoppingBasket": ["shoppingBasket(0, 0, 1)", "shoppingBasket(0, 0, 1, { items: ['sayur', 'xyz'] })", "shoppingBasket(0, 0, 1, { items: [] })"],
"oilBarrel":      ["oilBarrel(0, 0, 1)", "oilBarrel(0, 0, 1, { col: '#3A3F4E', label: '' })"],
"lpgTank":        ["lpgTank(0, 0, 1)", "lpgTank(0, 0, 1, { col: '#3E7FC4', label: '12 kg' })"],
"house":          ["house(0, 0, 1)", "house(0, 0, 1, { label: 'KPR' })"],
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `python scripts/check_props.py`
Expected: FAIL `shoppingBasket is not defined`.

- [ ] **Step 3: Implementasikan keempat props di `engine/props.js`**

- [ ] **Step 4: Jalankan, pastikan lolos**

Run: `python scripts/check_props.py`
Expected: `ok: 14 props x 3 tema`.

- [ ] **Step 5: Tambah ke view 9, lihat still-nya**

Run: `python build_video.py demo-props preview <detik akhir baris 7>`
Expected: view 9 memuat 7 props (Task 2 + 3), semuanya terbaca di lebar 1080 dan tidak tertutup UI Shorts (x > 960, y 1000–1700 layar).

- [ ] **Step 6: Commit**

```bash
git add engine/props.js scripts/check_props.py topics/demo-props/scenes.js
git commit -m "Add props batch C part 3: shopping basket, oil barrel, LPG tank, house"
```

### Task 4: Props berita & pemerintahan (koran, pesan berantai, palu hakim, kotak suara)

**Files:**
- Modify: `engine/props.js`, `scripts/check_props.py`, `topics/demo-props/script.json` (baris ke-8), `topics/demo-props/scenes.js` (view 10 di y = -17100, latar diperpanjang ke -19000)

**Interfaces:**
- Consumes: `CASES` (Task 1), pola view (Task 1–2).
- Produces:
  - `newspaper(x, y, s = 1, { headline = 'BERITA HARI INI', rot = -4 })`: koran terlipat berpusat di (x, y), dengan masthead polos "KORAN", `headline` (dikecilkan dengan `measure` supaya muat 380 px), kotak foto berarsir, dan kolom garis teks. Tanpa nama media sungguhan.
  - `chatBubble(x, y, s = 1, { lines = ['Katanya bank tutup,', 'uang hilang semua!'], tag = 'PESAN BERANTAI', side = 1 })`: gelembung pesan generik berpusat di (x, y), dengan label kecil `tag` dan ikon panah teruskan di atasnya. Ekor gelembung di kiri (`side = 1`) atau kanan (`side = -1`). Sampai 3 baris `lines`; baris lebih diabaikan. Bukan tiruan UI aplikasi tertentu.
  - `gavel(x, y, s = 1, { t = 0, t0 = null })`: palu hakim kayu di atas balok bunyi yang berdiri di (x, y). Kalau `t0` diisi, palu terangkat 35° sebelum `t0`, lalu turun memukul dalam 0,12 s (`E.inCubic`) dan memantul kecil (`E.outElastic`) sampai `t0 + 0.5`. Kalau `t0` kosong, palu diam tergeletak.
  - `ballotBox(x, y, s = 1, { label = 'KOTAK SUARA', p = 0 })`: kotak transparan berdiri di (x, y), dengan celah di tutup dan `label` polos. Kertas suara terlipat turun masuk celah mengikuti `clamp(p)`. Tanpa logo KPU atau partai.
  - `demo-props/script.json` baris ke-8: `{"vo": "Juga *koran*, pesan berantai, palu hakim, dan kotak suara.", "hold": 0.8}`

- [ ] **Step 1: Tambah kasus ke `CASES`**

```python
"newspaper":  ["newspaper(0, 0, 1)", "newspaper(0, 0, 1, { headline: 'HARGA BERAS NAIK DI 20 PROVINSI MENURUT DATA BPS' })"],
"chatBubble": ["chatBubble(0, 0, 1)", "chatBubble(0, 0, 1, { side: -1, lines: ['a', 'b', 'c', 'd', 'e'] })"],
"gavel":      ["gavel(0, 0, 1)", "gavel(0, 0, 1, { t: 0.5, t0: 1 })", "gavel(0, 0, 1, { t: 1.06, t0: 1 })", "gavel(0, 0, 1, { t: 1000, t0: 1 })"],
"ballotBox":  ["ballotBox(0, 0, 1)", "ballotBox(0, 0, 1, { p: 0.5 })", "ballotBox(0, 0, 1, { p: -1 })"],
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `python scripts/check_props.py`
Expected: FAIL `newspaper is not defined`.

- [ ] **Step 3: Implementasikan keempat props di `engine/props.js`**

- [ ] **Step 4: Jalankan, pastikan lolos**

Run: `python scripts/check_props.py`
Expected: `ok: 18 props x 3 tema`.

- [ ] **Step 5: Tambah view 10 di `demo-props`, lihat still-nya**

`K.s9 = s[7].start`, kamera `{ at: K.s9, dur: 0.9, x: 0, y: -17100, z: 1 }`, headline `'SI TIKUS\n*BERITA*'` (headline view 9 berakhir di `K.s9 - 0.1`), cue `whoosh`. `gavel` memakai `t0: K.s9 + 1.2` supaya pukulannya terlihat.
Run: `python build_video.py demo-props preview <detik baris 8: sebelum pukulan, saat pukulan, akhir>`
Expected: palu terangkat, lalu menempel balok, lalu diam. Headline koran muat dan keempat props terbaca.

- [ ] **Step 6: Commit**

```bash
git add engine/props.js scripts/check_props.py topics/demo-props/script.json topics/demo-props/scenes.js
git commit -m "Add props batch C part 4: newspaper, chain message, gavel, ballot box"
```

### Task 5: Cek tiga tema, regresi semua topik, dokumentasi

**Files:**
- Modify: `AGENTS.md` (tabel "Prop library": satu baris baru untuk batch C), `topics/demo-props/scenes.js` (komentar atas: sebut view 8–10)
- Tidak menyentuh topik lain.

**Interfaces:**
- Consumes: semua props dari Task 1–4.
- Produces: baris tabel AGENTS.md
  `| savingsBook, shieldBadge, hangSign(…, {t, t0}), levelGauge(…, {level, limit, id}), checkBoard(…, {rows, active}), priceLabel, fuelPump, atmCard, goldBar, safeBox(…, {open, inside}), shoppingBasket(…, {items}), oilBarrel, lpgTank, house, newspaper, chatBubble, gavel(…, {t, t0}), ballotBox(…, {p}) | batch C for Si Tikus: savings, prices, fuel, gold, market, news and civic props; generic, never a real bank, brand, media or party |`

- [ ] **Step 1: Still di tiga tema**

Untuk `newsprint` lalu `notebook`: tambah sementara `"theme": "<tema>"` di `topics/demo-props/script.json`, jalankan `python build_video.py demo-props preview <detik view 8, 9, 10>`, salin `build/demo-props/preview.png` ke `build/demo-props/preview-<tema>.png`, lalu **hapus lagi** `"theme"`. Lakukan sekali tanpa `"theme"` untuk `paper`.
Expected: di ketiga sheet tidak ada bentuk hitam pekat atau hilang, label tidak keluar dari bentuknya (Review Focus 4), dan tiap prop terbaca di lebar ~270 px.

- [ ] **Step 2: Pastikan `script.json` kembali bersih**

Run: `git diff topics/demo-props/script.json`
Expected: hanya baris ke-7 dan ke-8 yang bertambah, tanpa `"theme"`.

- [ ] **Step 3: Regresi semua topik**

Run: `for t in $(ls topics); do python build_video.py $t preview 1 || echo "GAGAL: $t"; done`
Expected: tidak ada baris `GAGAL:`. Topik yang memakai voice Edge butuh internet bila cache TTS-nya belum ada.

- [ ] **Step 4: Cek props terakhir kali**

Run: `python scripts/check_props.py`
Expected: `ok: 18 props x 3 tema`, exit 0.

- [ ] **Step 5: Perbarui `AGENTS.md` dan komentar `demo-props`**

- [ ] **Step 6: Commit**

```bash
git add AGENTS.md topics/demo-props/scenes.js
git commit -m "Document props batch C for Si Tikus"
```
