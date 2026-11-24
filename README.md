# The Choco Studios Information

Pusat informasi publik The Choco Studios (TCS), diselaraskan dengan identitas, arah open-source, dan ekosistem TCS saat ini.

## Identitas TCS

The Choco Studios (TCS) adalah studio kreatif independen multisektor yang didirikan, dimiliki, dan dikelola secara mandiri oleh Hasby Prasetya Saprudin. TCS bukan kolektif yang menaungi seluruh kreator independen dan bukan marketplace umum.

Fokus strategis TCS adalah open-source, pengembangan teknologi, dokumentasi, pemeliharaan proyek, dan kolaborasi terstruktur. Aplikasi tetap dapat dikembangkan, tetapi bukan lagi pusat utama strategi.

Sheeblink merupakan inisiatif handmade yang terintegrasi ke dalam ekosistem TCS dan tetap mempertahankan identitas kreatifnya. Vornika+- adalah unit pengembangan game TCS yang meneruskan identitas sebelumnya, Prism Gaming Studios.

## Komponen ekosistem

- **Choco AI:** asisten AI utama dan representasi digital Choco dalam ekosistem TCS.
- **Choco AI Help Center / Sara:** pusat bantuan TCS; Sara merupakan asisten dukungan yang terpisah dari Choco AI.
- **TCS LinkGuard:** pemeriksa manual tautan, resource, dan sinyal kualitas halaman website dengan batas pemindaian yang terdokumentasi.
- **TCS UploadFit:** aplikasi Windows untuk mempersiapkan gambar secara lokal sebelum diunggah ke layanan lain.
- **Learn with TCS:** proyek pembelajaran Bahasa Indonesia bagi penutur dari berbagai bahasa.
- **TCS Engine:** fondasi runtime game JavaScript untuk proyek 2D Canvas dan 3D Three.js.
- **Vornika+-:** unit pengembangan game dalam ekosistem TCS.
- **Sheeblink:** inisiatif handmade yang terintegrasi dalam ekosistem TCS.

Katalog historis 16 aplikasi tidak lagi menjadi direktori produk aktif. Halaman lama tetap dipertahankan dalam riwayat repository, tetapi URL publiknya diarahkan ke halaman utama agar tidak tampil sebagai portofolio aktif.

## Kontribusi dan open-source

Kontribusi publik hanya diterima pada repository yang secara eksplisit ditetapkan terbuka untuk kontribusi. Lisensi, panduan kontribusi, standar keamanan, dan proses review ditentukan per proyek. Lisensi kode tidak otomatis memberikan hak atas merek, logo, identitas visual, atau kewenangan rilis resmi TCS.

Panduan kontribusi: https://thechocostudios.bond/bergabung/

## Situs resmi dan layanan

- Situs resmi TCS: https://thechocostudios.bond/
- Profil pendiri: https://thechocostudios.bond/about/hasby-prasetya-saprudin/
- Profil The Choco Studios: https://thechocostudios.bond/about/the-choco-studios/
- Profil Sheeblink: https://thechocostudios.bond/ecosystem/sheeblink/
- Situs Sheeblink: https://sheeblink.thechocostudios.bond/
- Pusat informasi ini: https://information.thechocostudios.bond/
- Help Center / Sara: https://choco-ai-help-center.vercel.app/
- Choco AI: https://tcs-chocoai.vercel.app/
- TCS LinkGuard: https://tcs-linkguard.vercel.app/

Situs informasi menggunakan HTML, CSS, dan JavaScript modular. Komponen halaman dimuat dari `components/`; data identitas, navigasi, dan komponen ekosistem disimpan pada `data/`; skrip build menghasilkan `dist/`.

## Validasi dan build

Gunakan Node.js 20 atau lebih baru:

```bash
npm run validate
npm run build
```

Setelah build, periksa halaman utama, komponen, tautan internal, pencarian navigasi, tampilan responsif, metadata, sitemap, dan hasil deployment. Pastikan domain kanonis dan tautan publik tetap konsisten.

## Kontak

thechocostudios@gmail.com  
https://www.linkedin.com/in/hasby-prasetya-tcs/
