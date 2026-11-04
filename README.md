# The Choco Studios Information

Pusat informasi publik The Choco Studios (TCS). Situs ini menjelaskan identitas TCS, arah open-source, komponen ekosistem lintas bidang, tata kelola kontribusi, dan kanal resmi.

## Identitas TCS

The Choco Studios adalah studio kreatif independen multisektor yang didirikan, dimiliki, dan dikelola secara mandiri oleh Hasby Prasetya Saprudin. TCS bukan kolektif yang menaungi seluruh kreator independen dan bukan marketplace atau platform umum untuk memamerkan karya pihak lain.

Fokus strategis TCS adalah open-source, pengembangan teknologi, dokumentasi, pemeliharaan proyek, dan kolaborasi yang terstruktur. TCS tetap dapat mengembangkan aplikasi, tetapi produksi aplikasi bukan lagi pusat utama strategi.

Sheeblink adalah inisiatif produk handmade yang telah diintegrasikan ke dalam ekosistem TCS sebagai perluasan aktivitas ke bidang non-teknologi, dengan tetap menjaga identitas kreatifnya.

## Komponen utama yang ditampilkan

- TCS LinkGuard: proyek awal TCS, sebelumnya bernama Chocobot Guardian; pemeriksa manual tautan dan kualitas halaman website, status demo fungsional/pra-produksi.
- Choco AI: asisten AI utama dan representasi digital Choco; arah pengembangan jangka panjangnya adalah asisten virtual serbaguna lintas kebutuhan TCS.
- Choco AI Help Center / Sara: pusat bantuan dengan asisten dukungan yang terpisah dari Choco AI.
- Sheeblink: inisiatif kreatif handmade yang terintegrasi dalam ekosistem TCS.

Daftar aplikasi lama dan katalog 16 aplikasi tidak lagi menjadi direktori publik. Catatan historis dapat tetap berada di repositori untuk audit, tetapi tidak dipresentasikan sebagai portofolio aktif.

## Kontribusi dan open-source

Kontribusi publik hanya diterima pada repositori yang secara eksplisit ditetapkan terbuka. Lisensi, panduan kontribusi, standar keamanan, dan proses review ditentukan per proyek. Hak atas kode dan kontribusi dibedakan dari hak merek, logo, identitas visual, serta kewenangan rilis resmi TCS.

Panduan publik: https://the-choco-studios-official.vercel.app/bergabung/

## Teknologi dan pengembangan

Situs ini menggunakan HTML, CSS, dan JavaScript modular tanpa framework UI. Komponen halaman dimuat secara terpisah, sementara data identitas, navigasi, dan direktori komponen ekosistem disimpan pada folder data. Build Node.js menghasilkan folder `dist/` dan hanya menerbitkan aset publik yang diperlukan.

## Validasi

Gunakan Node.js 20 atau lebih baru:

```bash
npm run validate
npm run build
```

Validasi statis tidak menggantikan pengujian browser atau verifikasi layanan eksternal. Periksa hasil build, tautan, navigasi, responsivitas, dan deploy setelah perubahan.

## Kontak

thechocostudio@gmail.com
https://www.linkedin.com/in/hasby-prasetya-tcs/
