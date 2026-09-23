# Psikotes Profesional

Next.js App Router, TypeScript, Tailwind CSS, Firebase Auth & Firestore. Antarmuka mempertahankan palet pastel; teks utama digelapkan menjadi `#373C38` dan teks pendukung `#454B46` agar terbaca jelas.

## Menjalankan

```sh
npm install
npm run dev
```

Buka http://localhost:3000 untuk beranda, http://localhost:3000/test/komprehensif untuk tes, dan http://localhost:3000/dashboard untuk profil serta riwayat. Hentikan server development sebelum menjalankan build karena keduanya menghasilkan file di `.next`.

## Isi dan skoring

| Tahap                     | Materi                                                       | Waktu             | Hasil                                                       |
| ------------------------- | ------------------------------------------------------------ | ----------------- | ----------------------------------------------------------- |
| Verbal                    | 15 soal sinonim, antonim, analogi, silogisme, bacaan         | 7 menit           | Benar, salah, kosong, akurasi, rincian keterampilan         |
| Numerik                   | 15 soal deret, rasio, persentase, rata-rata, laju, aljabar   | 10 menit          | Benar, salah, kosong, akurasi, pembahasan                   |
| Spasial                   | 12 soal bergambar: rotasi, pencerminan, urutan               | 8 menit           | Skor dan pembahasan visual                                  |
| Koran | 4 kolom x 50 soal penjumlahan (total 200 soal) | 45 detik/kolom | Kecepatan, akurasi, benar/salah/lewati, variasi antar kolom |
| Kepribadian dan proyektif | 25 pernyataan dalam 5 tema + 3 respons tulisan/cerita gambar | Tanpa batas waktu | Rata-rata respons 1–5 dan transkrip tulisan                 |

- Satu sesi mencakup semua tahap. Petunjuk dan contoh muncul sebelum setiap tahap; peserta dapat istirahat di layar tersebut. Timer berdasarkan waktu absolut dan tetap berjalan saat tab tidak aktif.
- Fisher–Yates mengacak urutan soal dalam masing-masing domain dan pilihan soal objektif. Pernyataan kepribadian diacak, tetapi urutan skala 1–5 tetap agar tidak membingungkan.
- Benar mendapat 1; salah dan kosong mendapat 0. Persentase bagian = benar / jumlah soal. Akurasi = benar / jawaban terisi, atau tidak tersedia jika belum ada jawaban. Tidak ada penalti tebakan.
- Kepribadian: item negatif dibalik dengan `6 − respons`, lalu dihitung rata-rata 5 item per tema. Skor di bawah 2,5 / di atas 3,5 hanya dideskripsikan relatif ke titik tengah, bukan klasifikasi normatif. Tidak digabung dengan skor kemampuan.
- Koran: pasangan saling tumpang tindih (8,7,6 → 5 lalu 3). Setiap input satu digit langsung maju. Kolom otomatis berganti; jawaban lama tidak dapat diedit. Tersedia maksimal 50 pasangan per kolom, 200 pasangan per sesi. Jawaban dan lewati sama-sama menghabiskan satu pasangan. Input dikunci setelah 50 respons; timer tetap berjalan sampai 45 detik sebelum berpindah kolom. Kecepatan = respons angka / 3 menit; lewati tidak masuk penyebut akurasi. Variasi = selisih jumlah respons maksimum dan minimum per kolom, bukan diagnosis ketahanan kerja.
- Proyektif bersifat opsional. Kalimat dan ilustrasi orisinal, bukan reproduksi stimulus TAT/Rorschach. Tulisan ditampilkan utuh tanpa interpretasi otomatis. Jika login, respons yang diisi ikut disimpan ke akun; hal ini dijelaskan sebelum pengisian.
- Pembahasan 42 soal tersedia setelah semua tahap selesai. PDF terdiri dari beberapa halaman, PNG merangkum semua lembar laporan. Ekspor memakai salinan lebar tetap agar laporan tetap terbaca pada perangkat mobile.

## Batas interpretasi

Bank soal orisinal ditujukan untuk latihan remaja akhir/dewasa, bukan norma kemampuan anak. Hasil menunjukkan performa pada soal yang dikerjakan. Belum tersedia studi reliabilitas, kalibrasi kesulitan, norma populasi, atau validitas penggunaan untuk diagnosis, IQ, dan seleksi kerja. Latihan koran bukan administrasi baku Pauli/Kraepelin, dan lima tema kepribadian bukan klaim sebagai inventori Big Five tervalidasi. Pengulangan bank yang sama memberi efek familiaritas.

Untuk menjadi alat psikotes profesional tervalidasi diperlukan tinjauan psikolog/psikometrisi, pilot pada populasi sasaran, analisis butir dan reliabilitas, bukti validitas, serta norma dan prosedur administrasi yang sesuai. Prinsip interpretasi merujuk [Standards for Educational and Psychological Testing](https://www.testingstandards.net/) dan penjelasan keterbatasan teknik proyektif di [APA Dictionary](https://dictionary.apa.org/projective-technique).

## Akun dan riwayat

1. Salin `.env.example` menjadi `.env.local`, isi konfigurasi aplikasi web Firebase.
2. Aktifkan Authentication → Google, tambahkan localhost/domain deployment pada Authorized domains.
3. Buat database Firestore dan publikasikan `firestore.rules` di Firebase Console atau melalui CLI. Pastikan proyek tujuan sama dengan `NEXT_PUBLIC_FIREBASE_PROJECT_ID` di `.env.local`.
4. Restart server setelah perubahan environment, build ulang untuk deployment.
5. Login sebelum menyelesaikan tes. Hasil disimpan ke `users/{uid}/test_results/{resultId}` dengan akses hanya untuk pemilik. Penyimpanan gagal menampilkan tombol coba lagi.

Mode tamu memakai memori React tanpa database/localStorage. Unduh hasil sebelum refresh/menutup tab. Tulisan dan skor dihitung di browser; untuk ujian formal, kunci jawaban dan verifikasi skor perlu dipindahkan ke server. Rules menjaga akses pemilik dan bentuk data, bukan jaminan keaslian skor.

Isi variabel `NEXT_PUBLIC_DONATION_*` dengan data penerima yang benar. Tidak ada rekening fiktif untuk pembayaran.

## Validasi

```sh
npm run test
npm run typecheck
npm run build
```

Tes otomatis memeriksa kunci jawaban, transformasi spasial, pengacakan, perhitungan skor, reverse scoring, kelengkapan sesi, batas 50 soal per kolom koran, timer, serta pemisahan respons proyektif dari skor. Pemeriksaan juga mencakup kompatibilitas pembuatan ID, validasi nama, dan penanganan error Firebase.

Verifikasi manual dengan Firebase Anda: login, selesaikan seluruh tahap, unduh PDF/PNG, buka riwayat dan refresh laporan, lalu pastikan akun lain tidak dapat membacanya. Build menggunakan Google Fonts melalui `next/font`.

## Nama profil dan kendala riwayat

Dashboard menyediakan Ubah nama (1 sampai 60 karakter), disimpan melalui Firebase Auth `updateProfile`. Perubahan langsung tampil pada sapaan dan bertahan setelah refresh, tanpa mengubah nama akun Google. Lihat [dokumentasi profil Firebase](https://firebase.google.com/docs/auth/web/manage-users).

Riwayat menunggu sesi autentikasi, membaca data dari server, dan memberi batas tunggu 15 detik. Pesan gagal menampilkan kode Firebase sebenarnya. `permission-denied`: publikasikan firestore.rules pada proyek yang sama dengan konfigurasi aplikasi, pastikan akun aktif pemilik path users/{uid}/test_results, dan periksa konfigurasi App Check jika diberlakukan. `unauthenticated`: masuk ulang. `unavailable`/`deadline-exceeded`: periksa koneksi. `failed-precondition`: periksa konfigurasi database/indeks. Jangan membuka rules ke publik sebagai solusi. Perubahan file rules lokal belum mengubah rules di server; lihat [panduan deployment rules](https://firebase.google.com/docs/firestore/security/get-started).

ID hasil memakai helper kompatibilitas: randomUUID jika tersedia, getRandomValues sebagai fallback, dan generator ID nonrahasia untuk browser lama tanpa Web Crypto. Akses laporan tetap dilindungi Firebase Auth dan Firestore Rules.

## Menjalankan aplikasi produksi

```sh
npm run build
npm run start
```

## Publikasi aturan Firestore

```sh
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project ID_PROYEK
```

Ganti `ID_PROYEK` dengan ID proyek Firebase Anda. Jika menggunakan beberapa akun, jalankan `npx firebase-tools login:add` dan tambahkan `--account EMAIL_AKUN` pada perintah deploy. Simpan `firestore.rules` sebagai UTF-8 tanpa BOM agar dapat dikompilasi Firebase.

## Tampilan dan interaksi

- Layout menyesuaikan layar mobile dan desktop, termasuk profil, navigasi, tombol tes, dan unduhan.
- Konfirmasi selesai tahap, ulang tes, dan keluar melalui navigasi aplikasi menggunakan modal custom. Timer tetap berjalan saat modal terbuka; input koran dinonaktifkan selama modal tampil.
- Peringatan refresh atau menutup tab menggunakan dialog bawaan browser untuk mencegah kehilangan progres.
- Tes koran menampilkan pasangan angka aktif, tanda penjumlahan, input terakhir, dan progres hingga batas soal.
