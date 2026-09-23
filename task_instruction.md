# Technical Specification & Task Brief: Web Psikotes Profesional

**Tujuan Proyek:**  
Membangun aplikasi web kuis/psikotes interaktif modern, ramah pengguna (cocok untuk anak & orang tua), dengan estetika "Soft Glass, Fresh Wellness", integrasi Firebase Auth/Firestore, pengacakan soal, ekspor hasil (PDF & PNG), serta modal donasi.

---

## 1. Ringkasan Proyek

| Parameter | Detail / Spesifikasi |
| :--- | :--- |
| **Tech Stack** | Next.js (App Router), TypeScript, Tailwind CSS, Firebase (Auth & Firestore) |
| **Gaya Visual** | Modern, *Glassmorphism* lembut, ramah, dan hangat |
| **Mood** | Fresh, wellness, balanced |
| **Target Pengguna**| Umum, Anak-anak, dan Orang Tua |

---

## 2. Palette Warna Sistem (Sesuai Gambar)

Terapkan palet warna berikut ke dalam variabel Tailwind CSS (`tailwind.config.js`):

*   **Soft Rose Pink:** `#E8CCC5` (`rgb(232, 204, 197)`)
*   **Warm Cream:** `#F6E7C6` (`rgb(246, 231, 198)`)
*   **Soft Pastel Blue:** `#BDCED3` (`rgb(189, 206, 211)`)
*   **Muted Clay / Gray-Brown:** `#BBB9B2` (`rgb(187, 185, 178)`)
*   **Sage Green:** `#CFD4AE` (`rgb(207, 212, 174)`)
*   **Slate / Charcoal Text:** `#807E79` (`rgb(128, 126, 121)`)
*   **Light Neutral Background:** `#E3E3E3` (`rgb(227, 227, 227)`)

---

## 3. Konsep Desain & UI/UX — "Soft Glass, Fresh Wellness"

### A. Glassmorphism Style
*   Gunakan gabungan `backdrop-blur-md` hingga `backdrop-blur-lg`.
*   Gunakan background semi-transparan dengan opacity lembut (contoh: `bg-white/40` atau `bg-[#F6E7C6]/30`).
*   Border tipis bersinar halus: `border border-white/50`.
*   Bayangan lembut (*soft drop shadow*): `shadow-sm` atau `shadow-md` dengan *blur radius* besar.

### B. Bentuk & Layout
*   Layout berjarak renggang (*generous white space*), tidak padat.
*   Grid rapi dan terstruktur.
*   Sudut elemen melengkung tumpul/halus (`rounded-2xl` atau `rounded-3xl`).
*   *Micro-interactions*: Efek *hover scale* halus (`hover:scale-[1.02] transition-all duration-300`), serta animasi *fade-in / slide-up* saat komponen muncul.

### C. Tipografi
*   **Heading / Judul:** Font rounded & friendly (opsi utama: **Poppins** atau **Quicksand** via `next/font`).
*   **Body Text:** Font yang jernih dan nyaman dibaca (opsi utama: **Plus Jakarta Sans** atau **Inter**).

### D. Ikonografi
*   Gunakan **Lucide Icons** (`lucide-react`) — konsisten, garis *stroke* tipis (1.5px - 2px), dan minimalis.

---

## 4. Fitur Utama & Mode Pengguna

### A. Dual Mode Akses
1.  **Guest Mode (Tanpa Login):**
    *   Pengguna dapat langsung mengambil tes.
    *   Hasil tes **tidak disimpan** di database.
    *   Pengguna hanya bisa mengunduh hasil tes saat itu juga (PDF / PNG).
2.  **Google Login Mode (Firebase Auth):**
    *   Login cepat menggunakan akun Google (`signInWithPopup` / Google Auth Provider).
    *   Hasil tes otomatis tersimpan di database **Cloud Firestore** pada koleksi `users/{userId}/test_results`.
    *   Tersedia halaman *Dashboard / History* untuk melihat riwayat tes sebelumnya.

### B. Sistem Pengacakan Soal (*Question Randomization*)
*   Setiap kali pengerjaan tes dimulai (*start/restart*), urutan soal dan/atau opsi jawaban **wajib diacak secara acak (Fisher-Yates Shuffle)**.
*   Mencegah kecurangan/penyontekan saat tes diulang di waktu berikutnya.

### C. Ekspor & Download Hasil Tes
Pada halaman Preview Hasil Psikotes, sediakan 2 opsi tombol unduh:
1.  **Download PNG:** Gunakan library seperti `html-to-image` atau `html2canvas` untuk mengonversi kartu/sertifikat hasil menjadi file gambar.
2.  **Download PDF:** Gunakan library seperti `jspdf` / `html2pdf.js` untuk membuat dokumen PDF resmi ringkasan hasil psikotes.

### D. Fitur Aksi "Give me a Kopi" (Donasi / Support)
*   Sediakan tombol/aksi **"Give me a Kopi"** (atau ikon kopi) di bagian preview hasil tes.
*   Saat diklik, tampilkan modal/popup dengan tampilan *glassmorphism* yang berisi:
    *   Logo/Ikon Kopi.
    *   **Nama Bank / E-Wallet** (contoh: BCA / Mandiri / GoPay).
    *   **Nomor Rekening / HP** (dilengkapi tombol *Copy to Clipboard*).
    *   **Nama Pemilik Rekening / Atas Nama**.
    *   Pesan ucapan terima kasih yang hangat.

---

## 5. Arsitektur Komponen & Halaman (Next.js App Router)

```text
app/
├── layout.tsx                # Dynamic Font setup, Auth Provider Wrapper, Theme Styles
├── page.tsx                  # Landing Page (Hero, Pilih Tes, Glass Cards)
├── test/
│   └── [testId]/
│       └── page.tsx          # Halaman Kuis Interaktif (Randomize soal, Stepper, Progress bar)
├── result/
│   └── [resultId]/
│       └── page.tsx          # Halaman Hasil (Skor, Analisis, Download PNG/PDF, Modal Donasi)
├── dashboard/
│   └── page.tsx          # History hasil tes untuk user yang login via Google
└── components/
    ├── Navbar.tsx
    ├── GlassCard.tsx         # Reusable Component Glassmorphism
    ├── DonationModal.tsx     # Popup "Give me a Kopi"
    ├── DownloadButtons.tsx   # PDF & PNG Export Logic
    └── AuthButton.tsx        # Google Login / Logout state
```

---

## 6. Instruksi Tugas untuk Codex

1.  **Inisialisasi Project:** Buat struktur Next.js (App Router), persiapkan konfigurasi `tailwind.config.js` dengan palet warna dan font di atas.
2.  **Konfigurasi Firebase:** Buat file `lib/firebase.ts` untuk menginisialisasi Auth dan Firestore.
3.  **Implementasi Utilitas:** Buat fungsi helper pengacak array (Shuffle algorithm) untuk soal.
4.  **Komponen UI:** Implementasikan komponen `GlassCard`, modal donasi, serta tombol unduh PDF/PNG.
5.  **Pengujian Mode:** Pastikan alur *Guest* berjalan lancar tanpa login dan alur *Google Login* berhasil menyimpan data hasil ke Firestore.