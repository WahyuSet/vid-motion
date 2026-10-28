# Ronde 1: props visual batch A (Gemini)

Gemini dan Claude bergantian menambah props ke pustaka `engine/props.js`. Kamu (Gemini) mengerjakan **batch A**
lebih dulu. Claude mereview hasilmu, lalu mengerjakan batch B. Baca `AGENTS.md` (terutama "Prop library",
"Mascots", "Layout rules") dan seluruh `engine/props.js` sebelum mulai: props baru harus terlihat satu keluarga
dengan yang sudah ada.

## Cara kerja

- Kerjakan di branch baru `gemini/ronde-1` dari `main`.
- File yang **boleh** diubah: `engine/props.js` (tambahkan fungsi baru di bagian yang sesuai, jangan ubah
  fungsi yang sudah ada), `topics/demo-props/scenes.js` (pamerkan props baru), dan laporan
  `docs/collab/gemini-ronde-1-hasil.md`. File lain jangan disentuh; tulis saran di laporan.
- Jangan render video penuh. `python build_video.py demo-props preview <detik>` boleh dan wajib dipakai.
- Commit di branch itu, jangan merge ke `main` (Claude yang merge setelah review).

## Props batch A (dapur, rumah, alam)

| fungsi | gambar | catatan |
|---|---|---|
| `plate(x, y, s, {food})` | piring, opsional dengan sendok | `food`: SVG di atas piring, opsional |
| `riceBowl(x, y, s, {t})` | mangkuk nasi dengan uap tipis | uap bergerak dari `t` |
| `pot(x, y, s, {t, steam})` | panci dengan tutup dan gagang | |
| `stove(x, y, s, {on, t})` | kompor dua tungku | api bergoyang dari `t` saat `on` |
| `bottle(x, y, s, {level, col})` | botol minum plastik | isi air sesuai `level` 0..1 |
| `fan(x, y, s, {t, on})` | kipas angin berdiri | baling-baling berputar dari `t` |
| `wallClock(x, y, s, {h, m})` | jam dinding | jarum dari jam `h` dan menit `m` |
| `windowFrame(x, y, w, h, {night, t})` | jendela dengan tirai | langit siang/malam |
| `cloud(x, y, s, {t})` | awan | sedikit bergerak dari `t` |
| `sun(x, y, s, {t})` | matahari | sinar berputar pelan |
| `rain(x0, x1, y0, y1, t, {n})` | hujan | tetes turun dari `t` |
| `umbrella(x, y, s, {open, col})` | payung | |
| `bee(x, y, s, {t})` | lebah | sayap mengepak dari `t` |
| `fish(x, y, s, {t, col})` | ikan | ekor bergoyang dari `t` |
| `fruit(x, y, s, {kind})` | buah: `'pisang'`, `'jeruk'`, `'alpukat'` (dibelah) | |

Batch B (dikerjakan Claude setelah review, jangan dikerjakan): memindahkan props dari topik (toples madu,
kalender, kasur, stopkontak, kuman, ikon otak) serta props keuangan/berita untuk Tikus dan tubuh/kesehatan
untuk Stickman.

## Aturan menggambar (wajib)

- **Ikuti pola props yang ada**, misalnya `bulb`, `coin`, `glass`: tanda tangan `nama(x, y, s = 1, {opsi})`,
  gambar di sekitar titik `(x, y)` yang dijelaskan di komentar satu baris di atas fungsi (misalnya "berdiri di
  (x, y)"), lalu `return G(T(x, y, s), 1, g)`.
- **Setiap bentuk memakai `vol(path, warna, {depth, w})`**, bukan `fill` datar, supaya otomatis ikut tiga tema:
  tinta (paper), halftone dengan garis navy (newsprint), arsiran (notebook). Garis detail memakai
  `detail(d, tone(warna, -0.3), lebar)`, bukan warna tinta langsung. Bayangan kontak memakai `shadow()`.
- **Hanya dari `t`**: tidak ada `Math.random`, tidak ada state di luar fungsi. Acak yang stabil memakai `rnd(i)`.
- **Teks** hanya lewat `txt`, `hand`, atau `bodyText`; jangan tambah font baru.
- **Tidak ada logo, merek, atau desain asli** (uang, kemasan produk, logo pabrik).
- **Nama global harus unik.** Sebelum menambah fungsi atau konstanta, cek tidak ada `const`/`let`/`function`
  dengan nama sama di `topics/*/scenes.js`, `engine/*.js`, dan `brand/brand.js`. `const` bernama sama di topik
  membuat topik itu error:
  `grep -rnE "^\s*(const|let|var|function)\s+NAMA\b" topics engine brand`
- Detail sekunder membuat props terlihat mahal: tepi, sambungan, label polos, pantulan cahaya kecil.
  Tapi tetap sederhana: satu prop dibaca dalam sekali lihat di layar HP.

## Cek visual (wajib, dengan melihat gambarnya)

1. Tambahkan view ketiga (dan keempat kalau perlu) di `topics/demo-props/scenes.js` berisi semua props baru,
   dengan satu baris narasi baru di `topics/demo-props/script.json`. Ini satu-satunya `script.json` yang boleh
   kamu ubah.
2. Render still di tiga tema. Untuk tema lain, ubah sementara `"theme"` di `topics/demo-props/script.json`
   menjadi `"newsprint"` lalu `"notebook"`, render `preview`, lalu **kembalikan** ke tanpa `"theme"`.
3. Periksa di setiap still: tidak ada bentuk yang hitam pekat atau hilang, garis tidak menutupi detail,
   props terbaca di ukuran 270 px lebar, animasi (`t`) tidak melompat antar frame.
4. Pastikan topik lain tetap jalan:
   `for t in $(ls topics); do python build_video.py $t preview 1; done` tidak boleh ada error.

## Laporan (`docs/collab/gemini-ronde-1-hasil.md`)

Daftar fungsi yang ditambahkan (satu baris: tanda tangan + apa yang digambar), path still yang kamu render
untuk tiap tema, hasil loop preview semua topik, hal yang belum yakin, dan saran untuk batch B.

## Yang Claude periksa saat review

- Visual di tiga tema: konsisten dengan props lama, tidak ada warna invalid (hitam), terbaca di HP.
- Kode: pola yang sama, hanya dari `t`, tidak ada nama global yang bentrok, tidak ada perubahan di luar izin.
- Semua topik masih ter-render; `demo-props` memamerkan semua props baru.
