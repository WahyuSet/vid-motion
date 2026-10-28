# Hasil Ronde 1: Props Visual Batch A (Gemini)

## 1. Daftar Fungsi Baru di `engine/props.js`

Ditambahkan 15 fungsi prop baru (6 di bagian `nature`, 9 di bagian `objects`) tanpa mengubah fungsi yang sudah ada:

### Nature (`// ---------- nature ----------`)
- `cloud(x, y, s = 1, { t = 0, col = '#FFFFFF', seed = 1 } = {})` — Awan bervolume yang berpusat di `(x, y)` dengan lekukan dalam halus dan gerak mengapung deterministik dari `t`.
- `sun(x, y, s = 1, { t = 0, col = '#FFD24C', rayCol = '#F5A623' } = {})` — Matahari berpusat di `(x, y)` dengan 12 mahkota sinar bergantian warna yang berputar pelan dan berdenyut halus dari `t`.
- `rain(x0, x1, y0, y1, t = 0, { n = 28, col = '#6CAEE0', ang = -12, speed = 1.6, seed = 9 } = {})` — Deretan tetes hujan miring di area `(x0..x1, y0..y1)` lengkap dengan cincin cipratan air di batas bawah `y1`, seluruhnya diturunkan secara deterministik dari `t` dan `rnd()`.
- `bee(x, y, s = 1, { t = 0, col = '#F5B83D', stripeCol = '#3A2E25', wingCol = '#E6F3FA', rot = 0 } = {})` — Lebah madu menghadap kanan di `(x, y)` dengan belang tubuh, sengat, antena, pipi, dan sepasang sayap yang mengepak dari `t`.
- `fish(x, y, s = 1, { t = 0, col = '#4FA3E3', fin = '#F28C52', rot = 0 } = {})` — Ikan berenang menghadap kanan di `(x, y)` dengan sisik lengkung, insang, serta sirip ekor dan sirip dada yang bergoyang dari `t`.
- `fruit(x, y, s = 1, { kind = 'jeruk', rot = 0 } = {})` — Buah berpusat di `(x, y)` dengan pilihan `kind`: `'pisang'` (melengkung dengan tangkai cokelat), `'jeruk'` (berpori dengan tangkai & daun `leaf()`), atau `'alpukat'` (dibelah memperlihatkan kulit, daging hijau muda, dan biji bulat berkilau).

### Objects (`// ---------- objects ----------`)
- `plate(x, y, s = 1, { food = '', spoon = true, col = '#FFFFFF' } = {})` — Piring keramik tampak agak dari atas bertumpu di `(x, y)`, opsional dengan sendok logam di kanan depan dan SVG `food` di atas piring.
- `riceBowl(x, y, s = 1, { t = 0, col = '#E05A47', steam = true } = {})` — Mangkuk nasi berdiri di `(x, y)` dengan kubah nasi putih bertekstur butiran dan 3 helai uap tipis yang bergerak naik dari `t`.
- `pot(x, y, s = 1, { t = 0, steam = true, col = '#7C9EB2', rimCol = '#3A3F47' } = {})` — Panci masak berdiri di `(x, y)` dengan gagang kuping kiri-kanan, tutup kubah berpegangan yang sedikit bergetar saat mendidih, dan kepulan uap dari `t`.
- `stove(x, y, s = 1, { on = true, t = 0, col = '#D8DEE4' } = {})` — Kompor gas dua tungku berdiri di `(x, y)` dengan tatakan besi, dua kenop putar depan, dan lidah api biru-kuning yang bergoyang dari `t` saat `on: true`.
- `bottle(x, y, s = 1, { level = 0.7, col = '#58AEE8', capCol = '#2F5E9E' } = {})` — Botol minum plastik transparan berdiri di `(x, y)` dengan tutup ulir, lekuk badan botol, pantulan cahaya, dan tinggi air mengikuti `level` (`0..1`).
- `fan(x, y, s = 1, { t = 0, on = true, col = '#58AEE8', bodyCol = '#EAECEF' } = {})` — Kipas angin berdiri di `(x, y)` dengan tombol kecepatan di alas, keranjang kawat pelindung, dan 3 baling-baling yang berputar mulus dari `t` saat `on: true`.
- `wallClock(x, y, s = 1, { h = 10, m = 10, col = '#E0522F', faceCol = '#FFFFFF' } = {})` — Jam dinding bundar berpusat di `(x, y)` dengan 12 indeks waktu serta jarum jam (`h`) dan menit (`m`).
- `windowFrame(x, y, w = 260, h = 320, { night = false, t = 0, frameCol = '#D9B98C', curtainCol = '#E06D53' } = {})` — Jendela berpusat di `(x, y)` berukuran `w × h` dengan kusen palang kayu, tirai kiri-kanan yang bergoyang halus dari `t`, serta langit siang (matahari & awan bergerak) atau malam (`night: true`, bulan sabit & bintang berkelip dari `t`).
- `umbrella(x, y, s = 1, { open = true, col = '#E0522F', handleCol = '#8A5A36', rot = 0 } = {})` — Payung berpusat di `(x, y)` dengan gagang lengkung J, dapat ditampilkan terbuka (`open: true`) maupun terlipat (`open: false`).

---

## 2. Pengecekan Visual & Path Stills di Tiga Tema

Showcase ditambahkan ke `topics/demo-props/scenes.js` sebagai **View 3 (`DAPUR & RUMAH`, `y = -3800`)** dan **View 4 (`CUACA & BUAH`, `y = -5700`)** dengan 1 baris narasi baru di `topics/demo-props/script.json`.

Path still hasil render untuk masing-masing tema:
- **Tema `paper` (default):**
  - Sheet gabungan: `build/demo-props/preview-paper.png` (dan `build/demo-props/preview.png`)
  - Stills individual: `build/demo-props/stills/t01.67.png`, `build/demo-props/stills/t02.92.png`, `build/demo-props/stills/t05.91.png`, `build/demo-props/stills/t08.28.png`, `build/demo-props/stills/t11.67.png` (View 3: Dapur & Rumah), `build/demo-props/stills/t14.23.png` (View 4: Cuaca & Buah)
- **Tema `newsprint`:**
  - Sheet gabungan: `build/demo-props/preview-newsprint.png`
- **Tema `notebook`:**
  - Sheet gabungan: `build/demo-props/preview-notebook.png`

Hasil pemeriksaan visual pada ketiga tema:
- Tidak ada warna `#NaNNaNNaN` / hitam pekat (seluruh warna yang dikirim ke `vol()` dan `tone()` memakai format hex 6 digit `#RRGGBB`).
- Shading cel (`paper`), titik halftone + outline navy tipis (`newsprint`), dan arsiran pena (`notebook`) tampil konsisten dengan 14 prop lama.
- Semua 15 prop terbaca jelas pada ukuran thumbnail sheet lebar 270 px.

---

## 3. Hasil Loop Preview Semua Topik

Menjalankan `python build_video.py <topic> preview 1` untuk seluruh topik di folder `topics/`:
- `alpukat`: OK
- `bbm-india-china`: OK
- `burung-listrik`: OK (`burung-listrik` punya fungsi lokal `function cloud(x, y, s)` di `scenes.js` yang menimpa `cloud` global dengan aman tanpa bentrok `const`/`let`)
- `cicak-nempel`: OK
- `demo-cicak`: OK
- `demo-props`: OK
- `demo-stickman`: OK
- `demo-tikus`: OK
- `golongan-darah`: OK
- `kaktus-air`: OK (`kaktus-air` punya fungsi lokal `function cloud(...)` dan variabel lokal `const rain` di dalam blok fungsi, keduanya berjalan normal tanpa bentrok)
- `ketindihan`: OK
- `kram-otot`: OK
- `madu-awet`: OK
- `mandi-malam`: OK
- `manfaat-puasa`: OK
- `nyamuk-jantan`: OK
- `serat-jeruk`: OK

---

## 4. Hal yang Perlu Diperhatikan / Dicek Saat Review

1. **Titik jangkar `(x, y)` antara objek meja vs objek gantung/melayang:**
   - Mengikuti pola `glass()` dan `box()`, prop yang berdiri di atas permukaan meja (`plate`, `riceBowl`, `pot`, `stove`, `bottle`, `fan`) memakai `(x, y)` sebagai **titik tumpu bawah** (`y = 0` di koordinat lokal), sehingga di `scenes.js` cukup dipanggil dengan `y` yang sama dengan permukaan `woodPlank`.
   - Mengikuti pola `coin()` dan `banknote()`, prop yang menempel di dinding atau melayang (`wallClock`, `windowFrame`, `cloud`, `sun`, `bee`, `fish`, `umbrella`, `fruit`) memakai `(x, y)` sebagai **titik tengah**.
2. **Fungsi lokal `cloud` di `burung-listrik` dan `kaktus-air`:**
   - Kedua topik lama tersebut mendefinisikan `function cloud(x, y, s)` sendiri. Karena menggunakan deklarasi `function` (bukan `const`/`let`), deklarasi lokal di `scenes.js` menimpa `cloud` dari `engine/props.js` tanpa error dan tampilan topik lama tidak berubah.

---

## 5. Saran untuk Batch B (Claude)

1. **Konvensi titik tumpu `(x, y)` untuk prop furnitur/meja di Batch B:**
   - Untuk `toples madu` dan `kasur`, sebaiknya gunakan `(x, y)` sebagai titik tumpu bawah (`y = 0` di dasar objek) agar konsisten saat diletakkan di atas `woodPlank` atau lantai bersama `plate`, `riceBowl`, `bottle`, dan `glass`.
   - Untuk `kalender`, `stopkontak`, `kuman`, dan `ikon otak`, gunakan `(x, y)` sebagai titik pusat seperti `wallClock` dan `coin`.
2. **Pemanfaatan prop Batch A di topik yang sudah ada / mendatang:**
   - `wallClock` dan `plate` di `engine/props.js` bisa langsung dipakai oleh topik-topik baru maupun saat merapikan topik yang menggambar jam/piring manual.
   - Untuk prop organ tubuh (`ikon otak`, dan bila ditambah lambung/jantung untuk Stickman), penggunaan `detail(..., tone(col, -0.28), w)` untuk lekukan internal (*gyri* otak / pembuluh) terbukti jauh lebih bersih di tema `newsprint` dan `notebook` dibandingkan garis `stroke()` warna tinta.
