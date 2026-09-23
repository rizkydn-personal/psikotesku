import {
  KORAN_PAIRS_PER_COLUMN,
  KORAN_COLUMNS,
  KORAN_COLUMN_SECONDS,
} from "./testConfig";
/** Original practice items, not a standardized clinical instrument. */
export type Ability = "verbal" | "numeric" | "spatial";
export type Trait =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "emotional";
export type Choice = { id: string; label: string; cells?: number[] };
export type Question = {
  id: string;
  domain: Ability;
  skill: string;
  text: string;
  options: Choice[];
  correctId: string;
  explanation: string;
  figures?: number[][];
};
export const stages = [
  {
    id: "verbal",
    title: "Kemampuan Verbal",
    seconds: 420,
    detail: "15 soal · 7 menit",
    instruction:
      "Sinonim, antonim, analogi, pemahaman bacaan, dan silogisme. Gunakan hanya informasi pada soal; jangan menambah asumsi.",
  },
  {
    id: "numeric",
    title: "Numerik & Logika Aritmatika",
    seconds: 600,
    detail: "15 soal · 10 menit",
    instruction:
      "Deret, rasio, persentase, aljabar, dan aritmatika. Siapkan kertas kosong. Kerjakan tanpa kalkulator agar kondisi latihan konsisten.",
  },
  {
    id: "spatial",
    title: "Penalaran Spasial & Gambar",
    seconds: 480,
    detail: "12 soal · 8 menit",
    instruction:
      "Amati pola kotak: tentukan rotasi, pencerminan, atau kelanjutan gambar. Posisi kotak dibaca dari kiri ke kanan, atas ke bawah.",
  },
  {
    id: "koran",
    title: "Kecepatan & Ketelitian (Koran)",
    seconds: 180,
    detail: `${KORAN_COLUMNS} kolom × ${KORAN_PAIRS_PER_COLUMN} soal · ${KORAN_COLUMN_SECONDS} detik/kolom`,
    instruction:
      "Jumlahkan dua angka bersebelahan dari atas ke bawah. Masukkan hanya digit satuan (8 + 7 → 5). Setelah satu jawaban, pasangan bergeser satu baris. Maksimal 50 pasangan per kolom (200 seluruhnya), termasuk pasangan yang dilewati. Setelah batas tercapai, input dikunci hingga kolom berikutnya. Kolom berpindah otomatis setiap 45 detik.",
  },
  {
    id: "personality",
    title: "Kepribadian & Proyektif",
    seconds: 0,
    detail: "25 pernyataan + 3 respons · tanpa batas waktu",
    instruction:
      "Jawab berdasarkan kebiasaan beberapa bulan terakhir. Proyektif berupa melengkapi kalimat dan cerita gambar; respons boleh dilewati dan tidak diberi skor psikologis otomatis.",
  },
] as const;
export const traitLabels: Record<
  Trait,
  { label: string; low: string; high: string; tip: string }
> = {
  openness: {
    label: "Keterbukaan terhadap pengalaman",
    low: "Lebih memilih cara yang familiar dan praktis.",
    high: "Lebih sering mencari ide dan pengalaman baru.",
    tip: "Bandingkan kenyamanan pada tugas rutin dan tugas eksplorasi.",
  },
  conscientiousness: {
    label: "Keteraturan & tanggung jawab",
    low: "Lebih fleksibel atau spontan dalam pengaturan tugas.",
    high: "Lebih sering merencanakan dan menuntaskan tugas secara teratur.",
    tip: "Coba daftar prioritas singkat dan tinjau pencapaiannya.",
  },
  extraversion: {
    label: "Energi dalam interaksi sosial",
    low: "Cenderung nyaman dengan aktivitas mandiri atau kelompok kecil.",
    high: "Cenderung aktif dan berenergi saat berinteraksi.",
    tip: "Seimbangkan waktu bersama orang lain dan waktu sendiri.",
  },
  agreeableness: {
    label: "Orientasi kerja sama",
    low: "Lebih langsung menyampaikan kepentingan atau perbedaan pendapat.",
    high: "Lebih sering mengutamakan empati dan kesepakatan bersama.",
    tip: "Latih menyampaikan batas pribadi sambil mendengarkan orang lain.",
  },
  emotional: {
    label: "Ketenangan menghadapi tekanan",
    low: "Lebih sering melaporkan kekhawatiran atau kesulitan tetap tenang.",
    high: "Lebih sering melaporkan ketenangan saat menghadapi tekanan.",
    tip: "Catat situasi yang memengaruhi ketenangan. Ini bukan penilaian kesehatan mental.",
  },
};
function item(
  id: string,
  domain: Ability,
  skill: string,
  text: string,
  labels: string[],
  correct: number,
  explanation: string,
): Question {
  return {
    id,
    domain,
    skill,
    text,
    options: labels.map((label, i) => ({ id: `${id}-${i}`, label })),
    correctId: `${id}-${correct}`,
    explanation,
  };
}
export const verbalQuestions: Question[] = [
  item(
    "v01",
    "verbal",
    "Sinonim",
    "Makna kata CERMAT yang paling dekat adalah …",
    ["Cepat", "Teliti", "Berani", "Luwes"],
    1,
    "Cermat berarti teliti atau saksama; tidak berarti cepat.",
  ),
  item(
    "v02",
    "verbal",
    "Sinonim",
    "Makna kata IMPLISIT yang paling dekat adalah …",
    ["Tersirat", "Terbuka", "Terpisah", "Terperinci"],
    0,
    "Implisit berarti terkandung di dalamnya atau tersirat, bukan dinyatakan langsung.",
  ),
  item(
    "v03",
    "verbal",
    "Antonim",
    "Lawan kata KONSTAN adalah …",
    ["Tetap", "Stabil", "Berubah-ubah", "Seimbang"],
    2,
    "Konstan berarti tetap; lawannya berubah-ubah.",
  ),
  item(
    "v04",
    "verbal",
    "Antonim",
    "Lawan kata INKLUSIF adalah …",
    ["Menyeluruh", "Terbuka", "Eksklusif", "Adaptif"],
    2,
    "Inklusif mencakup berbagai pihak; eksklusif membatasi atau mengkhususkan.",
  ),
  item(
    "v05",
    "verbal",
    "Analogi",
    "BENIH : TANAMAN = TELUR : …",
    ["Sarang", "Burung", "Bulu", "Pakan"],
    1,
    "Benih berkembang menjadi tanaman, telur berkembang menjadi burung.",
  ),
  item(
    "v06",
    "verbal",
    "Analogi",
    "EDITOR : NASKAH = MEKANIK : …",
    ["Bengkel", "Mesin", "Perkakas", "Jalan"],
    1,
    "Editor memeriksa atau memperbaiki naskah; mekanik memeriksa atau memperbaiki mesin.",
  ),
  item(
    "v07",
    "verbal",
    "Analogi",
    "TERMOMETER : SUHU = BAROMETER : …",
    ["Kecepatan", "Massa", "Tekanan udara", "Kelembapan"],
    2,
    "Termometer mengukur suhu, barometer mengukur tekanan udara.",
  ),
  item(
    "v08",
    "verbal",
    "Silogisme",
    "Semua arsip digital memiliki cadangan. Sebagian dokumen proyek adalah arsip digital. Kesimpulan yang pasti benar adalah …",
    [
      "Semua dokumen proyek memiliki cadangan",
      "Sebagian dokumen proyek memiliki cadangan",
      "Semua cadangan adalah dokumen proyek",
      "Tidak ada dokumen proyek yang memiliki cadangan",
    ],
    1,
    "Dokumen proyek yang termasuk arsip digital pasti memiliki cadangan.",
  ),
  item(
    "v09",
    "verbal",
    "Silogisme",
    "Tidak ada kendaraan listrik yang menggunakan bensin sebagai sumber tenaga. Semua kendaraan di garasi A adalah kendaraan listrik. Maka …",
    [
      "Semua kendaraan di garasi A menggunakan bensin",
      "Sebagian kendaraan listrik bukan kendaraan",
      "Tidak ada kendaraan di garasi A yang menggunakan bensin sebagai sumber tenaga",
      "Semua kendaraan tanpa bensin berada di garasi A",
    ],
    2,
    "Sifat tidak menggunakan bensin berlaku pada seluruh kendaraan listrik, termasuk kendaraan di garasi A.",
  ),
  item(
    "v10",
    "verbal",
    "Logika kondisional",
    "Jika server mati, situs tidak dapat diakses. Situs dapat diakses. Kesimpulan yang sah adalah …",
    [
      "Server tidak mati",
      "Server pasti baru",
      "Situs selalu dapat diakses",
      "Jika server hidup, situs pasti dapat diakses",
    ],
    0,
    "Modus tollens: jika P maka Q; bukan Q berarti bukan P. Kebalikan pernyataan belum tentu benar.",
  ),
  item(
    "v11",
    "verbal",
    "Pemahaman bacaan",
    "Perpustakaan memperpanjang jam buka pada hari Sabtu selama masa ujian. Perubahan ini bertujuan memberi waktu belajar tambahan bagi mahasiswa. Gagasan utamanya adalah …",
    [
      "Semua mahasiswa hanya belajar hari Sabtu",
      "Jam buka diperpanjang untuk mendukung belajar saat ujian",
      "Perpustakaan tutup selain hari Sabtu",
      "Masa ujian berlangsung setiap Sabtu",
    ],
    1,
    "Bacaan menjelaskan kebijakan perpanjangan jam dan tujuannya.",
  ),
  item(
    "v12",
    "verbal",
    "Pemahaman bacaan",
    "Dari 80 peserta, 50 memilih sesi pagi. Sisanya memilih sesi sore. Panitia menyediakan dua sesi dengan materi yang sama. Pernyataan yang didukung bacaan adalah …",
    [
      "Materi sore lebih sulit",
      "Semua peserta mengikuti dua sesi",
      "30 peserta memilih sesi sore",
      "Sesi pagi berlangsung lebih lama",
    ],
    2,
    "80 − 50 = 30 peserta memilih sore. Tidak ada informasi perbedaan durasi atau kesulitan.",
  ),
  item(
    "v13",
    "verbal",
    "Hubungan konsep",
    "Kata yang tidak berada dalam kelompok proses perubahan wujud zat adalah …",
    ["Menguap", "Membeku", "Mencair", "Mengalir"],
    3,
    "Mengalir menyatakan gerak, bukan perubahan wujud zat.",
  ),
  item(
    "v14",
    "verbal",
    "Urutan logis",
    "Urutan proses yang paling logis adalah …",
    [
      "Kesimpulan → pengamatan → analisis",
      "Analisis → pengumpulan data → pertanyaan",
      "Pertanyaan → pengumpulan data → analisis → kesimpulan",
      "Pengumpulan data → kesimpulan → pertanyaan",
    ],
    2,
    "Pertanyaan menentukan data yang dibutuhkan; data dianalisis untuk menarik kesimpulan.",
  ),
  item(
    "v15",
    "verbal",
    "Silogisme",
    "Sebagian penulis adalah peneliti. Semua peneliti membaca jurnal. Yang pasti benar adalah …",
    [
      "Semua penulis membaca jurnal",
      "Sebagian penulis membaca jurnal",
      "Semua pembaca jurnal adalah peneliti",
      "Tidak ada penulis yang membaca jurnal",
    ],
    1,
    "Penulis yang juga peneliti pasti membaca jurnal; informasi tidak mencakup semua penulis.",
  ),
];
export const numericQuestions: Question[] = [
  item(
    "n01",
    "numeric",
    "Deret",
    "3, 7, 15, 31, …",
    ["47", "62", "63", "64"],
    2,
    "Setiap suku dikali 2 lalu ditambah 1: 31 × 2 + 1 = 63.",
  ),
  item(
    "n02",
    "numeric",
    "Deret",
    "2, 5, 10, 17, 26, …",
    ["35", "36", "37", "39"],
    2,
    "Selisihnya 3, 5, 7, 9, lalu 11; 26 + 11 = 37.",
  ),
  item(
    "n03",
    "numeric",
    "Deret",
    "4, 12, 6, 18, 9, …",
    ["12", "21", "27", "36"],
    2,
    "Operasi bergantian ×3 dan ÷2; setelah 9 adalah 27.",
  ),
  item(
    "n04",
    "numeric",
    "Persentase",
    "Harga Rp240.000 didiskon 15%. Berapa harga setelah diskon?",
    ["Rp204.000", "Rp210.000", "Rp216.000", "Rp225.000"],
    0,
    "Diskon = 36.000. Harga akhir = 240.000 − 36.000 = 204.000.",
  ),
  item(
    "n05",
    "numeric",
    "Rasio",
    "Perbandingan A : B = 3 : 5. Jika A + B = 64, berapa B?",
    ["24", "32", "40", "48"],
    2,
    "Total 8 bagian; tiap bagian = 8. B = 5 × 8 = 40.",
  ),
  item(
    "n06",
    "numeric",
    "Laju kerja",
    "6 pekerja menyelesaikan pekerjaan dalam 12 hari. Dengan produktivitas sama, 8 pekerja memerlukan …",
    ["8 hari", "9 hari", "10 hari", "16 hari"],
    1,
    "Beban pekerjaan 6 × 12 = 72 hari-orang. 72 ÷ 8 = 9 hari.",
  ),
  item(
    "n07",
    "numeric",
    "Rata-rata",
    "Rata-rata 4 nilai adalah 70. Setelah nilai kelima ditambahkan, rata-ratanya menjadi 74. Nilai kelima adalah …",
    ["78", "80", "86", "90"],
    3,
    "Jumlah awal 280, jumlah akhir 370. Selisih = 90.",
  ),
  item(
    "n08",
    "numeric",
    "Aljabar",
    "Jika 3x − 7 = 20, maka x = …",
    ["7", "8", "9", "11"],
    2,
    "3x = 27, sehingga x = 9.",
  ),
  item(
    "n09",
    "numeric",
    "Kecepatan",
    "Kendaraan menempuh 150 km dalam 2,5 jam. Kecepatan rata-ratanya …",
    ["50 km/jam", "60 km/jam", "65 km/jam", "75 km/jam"],
    1,
    "150 ÷ 2,5 = 60 km/jam.",
  ),
  item(
    "n10",
    "numeric",
    "Peluang",
    "Kotak berisi 3 bola merah dan 5 bola biru. Peluang mengambil satu bola merah secara acak adalah …",
    ["3/5", "5/8", "3/8", "1/3"],
    2,
    "3 bola merah dari total 8 bola: 3/8.",
  ),
  item(
    "n11",
    "numeric",
    "Persentase bertingkat",
    "Harga naik 20%, lalu turun 20% dari harga baru. Dibanding harga awal, harga akhirnya …",
    ["Tetap", "Naik 4%", "Turun 4%", "Turun 20%"],
    2,
    "1,2 × 0,8 = 0,96, yaitu 4% lebih rendah dari harga awal.",
  ),
  item(
    "n12",
    "numeric",
    "Pecahan",
    "Hasil 3/4 + 2/3 adalah …",
    ["5/7", "13/12", "17/12", "7/12"],
    2,
    "9/12 + 8/12 = 17/12.",
  ),
  item(
    "n13",
    "numeric",
    "Logika aritmatika",
    "Jumlah usia kakak dan adik 36 tahun. Kakak 4 tahun lebih tua. Usia adik adalah …",
    ["14", "16", "18", "20"],
    1,
    "x + (x + 4) = 36, maka x = 16.",
  ),
  item(
    "n14",
    "numeric",
    "Interpretasi data",
    "Penjualan Senin 24 unit, Selasa 30 unit, Rabu 36 unit. Kenaikan dari Senin ke Rabu adalah …",
    ["12%", "33⅓%", "50%", "60%"],
    2,
    "Kenaikan 12 dari dasar 24: 12/24 × 100% = 50%.",
  ),
  item(
    "n15",
    "numeric",
    "Kombinasi",
    "Ada 4 orang. Setiap pasangan berjabat tangan tepat sekali. Ada berapa jabat tangan?",
    ["4", "6", "8", "12"],
    1,
    "Pasangan unik = 4 × 3 ÷ 2 = 6.",
  ),
];
export function rotate(cells: number[]): number[] {
  return cells.map((_, i) => cells[(2 - (i % 3)) * 3 + Math.floor(i / 3)]);
}
export function mirror(cells: number[]): number[] {
  return cells.map((_, i) => cells[Math.floor(i / 3) * 3 + 2 - (i % 3)]);
}
const shapes = [
  [1, 0, 0, 1, 1, 0, 0, 0, 0],
  [1, 1, 0, 0, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 0],
];
export const spatialQuestions: Question[] = shapes.flatMap((cells, index) => {
  const rotation = rotate(cells);
  const reflection = mirror(cells);
  return [
    {
      id: `s-r${index}`,
      domain: "spatial" as const,
      skill: "Rotasi",
      text: "Pola ini diputar 90° searah jarum jam. Pilih hasilnya.",
      figures: [cells],
      options: [
        rotation,
        cells,
        rotate(rotation),
        rotate(rotate(rotation)),
      ].map((c, i) => ({
        id: `s-r${index}-${i}`,
        label: `Pola ${i + 1}`,
        cells: c,
      })),
      correctId: `s-r${index}-0`,
      explanation:
        "Rotasi 90° searah jarum jam memindahkan baris atas menjadi kolom kanan; bentuk tidak dicerminkan.",
    },
    {
      id: `s-m${index}`,
      domain: "spatial" as const,
      skill: "Pencerminan",
      text: "Pola dicerminkan terhadap sumbu vertikal (kiri ↔ kanan). Pilih hasilnya.",
      figures: [cells],
      options: [
        reflection,
        cells,
        rotate(reflection),
        rotate(rotate(reflection)),
      ].map((c, i) => ({
        id: `s-m${index}-${i}`,
        label: `Pola ${i + 1}`,
        cells: c,
      })),
      correctId: `s-m${index}-0`,
      explanation:
        "Pencerminan vertikal menukar kolom kiri dan kanan; baris atas dan bawah tetap.",
    },
    {
      id: `s-p${index}`,
      domain: "spatial" as const,
      skill: "Urutan gambar",
      text: "Setiap gambar berubah dengan aturan yang sama. Pilih gambar keempat.",
      figures: [cells, rotation, rotate(rotation)],
      options: [
        rotate(rotate(rotation)),
        cells,
        rotation,
        rotate(rotation),
      ].map((c, i) => ({
        id: `s-p${index}-${i}`,
        label: `Pola ${i + 1}`,
        cells: c,
      })),
      correctId: `s-p${index}-0`,
      explanation:
        "Tiap langkah memutar pola 90° searah jarum jam. Gambar keempat adalah rotasi 270° dari gambar pertama.",
    },
  ];
});
export const abilityQuestions = [
  ...verbalQuestions,
  ...numericQuestions,
  ...spatialQuestions,
];
export type PersonalityItem = {
  id: string;
  text: string;
  trait: Trait;
  reverse: boolean;
};
const personalityRows: [Trait, string, boolean][] = [
  [
    "openness",
    "Saya mencari sudut pandang baru ketika mempelajari suatu hal.",
    false,
  ],
  ["openness", "Saya menikmati kegiatan yang memerlukan imajinasi.", false],
  [
    "openness",
    "Saya tertarik mempelajari topik di luar kebiasaan saya.",
    false,
  ],
  [
    "openness",
    "Saya menghindari mencoba cara baru ketika cara lama tersedia.",
    true,
  ],
  [
    "openness",
    "Saya kurang tertarik membahas gagasan yang belum familiar.",
    true,
  ],
  [
    "conscientiousness",
    "Saya menyusun prioritas sebelum mulai bekerja.",
    false,
  ],
  [
    "conscientiousness",
    "Saya menuntaskan tanggung jawab sesuai waktu yang disepakati.",
    false,
  ],
  [
    "conscientiousness",
    "Saya memeriksa detail pekerjaan sebelum menyerahkannya.",
    false,
  ],
  [
    "conscientiousness",
    "Saya sering menunda tugas sampai mendekati tenggat.",
    true,
  ],
  [
    "conscientiousness",
    "Saya mudah meninggalkan pekerjaan sebelum selesai.",
    true,
  ],
  ["extraversion", "Saya aktif memulai percakapan dalam kelompok.", false],
  [
    "extraversion",
    "Saya merasa berenergi setelah kegiatan bersama banyak orang.",
    false,
  ],
  [
    "extraversion",
    "Saya nyaman menyampaikan pendapat di depan kelompok.",
    false,
  ],
  ["extraversion", "Saya lebih memilih diam ketika bertemu orang baru.", true],
  [
    "extraversion",
    "Saya menghindari menjadi pusat perhatian dalam kelompok.",
    true,
  ],
  [
    "agreeableness",
    "Saya berusaha memahami sudut pandang orang yang berbeda pendapat.",
    false,
  ],
  ["agreeableness", "Saya bersedia membantu rekan yang kesulitan.", false],
  [
    "agreeableness",
    "Saya mencari kesepakatan saat terjadi perselisihan.",
    false,
  ],
  [
    "agreeableness",
    "Saya mudah mengabaikan perasaan orang lain saat berdebat.",
    true,
  ],
  [
    "agreeableness",
    "Saya sulit memberi kesempatan kedua setelah kesalahan kecil.",
    true,
  ],
  [
    "emotional",
    "Saya dapat tetap tenang ketika rencana berubah mendadak.",
    false,
  ],
  [
    "emotional",
    "Saya dapat kembali fokus setelah mengalami kekecewaan.",
    false,
  ],
  ["emotional", "Saya mampu berpikir jernih ketika pekerjaan menumpuk.", false],
  [
    "emotional",
    "Saya sering terus memikirkan kemungkinan buruk yang belum terjadi.",
    true,
  ],
  [
    "emotional",
    "Hal kecil yang tidak sesuai harapan mudah membuat saya gelisah.",
    true,
  ],
];
export const personalityQuestions: PersonalityItem[] = personalityRows.map(
  ([trait, text, reverse], i) => ({ id: `p${i + 1}`, trait, text, reverse }),
);
export const likert = [
  "Sangat tidak sesuai",
  "Tidak sesuai",
  "Netral / di antara keduanya",
  "Sesuai",
  "Sangat sesuai",
];
export const projectivePrompts = [
  {
    id: "sentence1",
    title: "Melengkapi kalimat",
    text: "Ketika menghadapi sesuatu yang belum pernah saya lakukan, saya biasanya …",
  },
  {
    id: "sentence2",
    title: "Melengkapi kalimat",
    text: "Ketika rencana penting saya tidak berhasil, hal yang saya lakukan berikutnya adalah …",
  },
  {
    id: "story",
    title: "Cerita gambar",
    text: "Amati ilustrasi. Menurut Anda, apa yang sedang terjadi, apa yang dipikirkan tokoh, dan apa yang terjadi setelahnya? Tidak ada jawaban benar atau salah.",
  },
] as const;
