export type Dimension = "connection" | "exploration" | "structure";
export type Option = { id: string; label: string; value: number };
export type Question = {
  id: string;
  text: string;
  dimension: Dimension;
  options: Option[];
};
export const dimensions: Record<
  Dimension,
  { label: string; description: string; suggestion: string }
> = {
  connection: {
    label: "Koneksi sosial",
    description:
      "Kenyamanan Anda berinteraksi, bekerja sama, dan bertukar cerita.",
    suggestion:
      "Coba aktivitas bersama teman atau keluarga, dengan ruang istirahat yang nyaman.",
  },
  exploration: {
    label: "Eksplorasi",
    description: "Ketertarikan Anda mencoba ide, pengalaman, dan cara baru.",
    suggestion:
      "Sisihkan waktu untuk satu aktivitas kreatif atau topik baru yang membuat penasaran.",
  },
  structure: {
    label: "Keteraturan",
    description:
      "Preferensi Anda terhadap rencana, langkah yang jelas, dan ketelitian.",
    suggestion:
      "Buat rencana kecil yang fleksibel. Amati cara belajar yang terasa paling nyaman.",
  },
};
const options: Option[] = [
  { id: "rarely", label: "Jarang sesuai dengan saya", value: 1 },
  { id: "sometimes", label: "Kadang sesuai dengan saya", value: 2 },
  { id: "often", label: "Sering sesuai dengan saya", value: 3 },
  { id: "always", label: "Sangat sesuai dengan saya", value: 4 },
];
function bank(prefix: string, rows: [Dimension, string][]): Question[] {
  return rows.map(([dimension, text], i) => ({
    id: `${prefix}-${i}`,
    dimension,
    text,
    options: options.map((o) => ({ ...o })),
  }));
}
export const tests = [
  {
    id: "kepribadian",
    title: "Kenali Kepribadian",
    category: "KEPRIBADIAN",
    duration: "4–6 menit",
    description:
      "Temukan cara Anda terhubung, berpikir, dan menjalani keseharian.",
    color: "rose",
    questions: bank("p", [
      [
        "connection",
        "Saya menikmati bertukar cerita dengan orang yang saya kenal.",
      ],
      [
        "exploration",
        "Saya senang mencoba kegiatan yang belum pernah saya lakukan.",
      ],
      ["structure", "Saya nyaman ketika kegiatan memiliki rencana yang jelas."],
      ["connection", "Saya suka mengerjakan kegiatan bersama orang lain."],
      [
        "exploration",
        "Saya sering membayangkan berbagai cara untuk menyelesaikan masalah.",
      ],
      [
        "structure",
        "Saya memeriksa kembali pekerjaan sebelum menyelesaikannya.",
      ],
      [
        "connection",
        "Saya merasa bersemangat setelah berbincang dengan teman.",
      ],
      [
        "exploration",
        "Saya penasaran dengan ide yang berbeda dari kebiasaan saya.",
      ],
      ["structure", "Saya suka membagi tugas besar menjadi langkah kecil."],
      ["connection", "Saya senang mendengarkan pengalaman orang lain."],
      [
        "exploration",
        "Saya menikmati kegiatan yang memberi ruang untuk berkreasi.",
      ],
      [
        "structure",
        "Saya lebih mudah fokus ketika barang dan jadwal saya tertata.",
      ],
    ]),
  },
  {
    id: "minat-bakat",
    title: "Jelajahi Minat & Bakat",
    category: "MINAT & BAKAT",
    duration: "4–6 menit",
    description:
      "Jelajahi aktivitas yang membuat Anda penasaran dan bersemangat.",
    color: "pastel",
    questions: bank("m", [
      ["connection", "Saya tertarik membantu teman memahami hal baru."],
      ["exploration", "Saya suka membuat gambar, cerita, atau karya sendiri."],
      ["structure", "Saya menikmati menyusun dan mengelompokkan benda."],
      ["connection", "Saya tertarik menjadi bagian dari kegiatan kelompok."],
      ["exploration", "Saya senang melakukan percobaan sederhana."],
      ["structure", "Saya suka memecahkan teka-teki secara bertahap."],
      [
        "connection",
        "Saya menikmati kegiatan yang melibatkan berbicara dengan orang lain.",
      ],
      [
        "exploration",
        "Saya suka mencari kemungkinan baru dari benda di sekitar.",
      ],
      ["structure", "Saya tertarik mencari pola dalam angka atau bentuk."],
      ["connection", "Saya senang merencanakan kegiatan bersama teman."],
      [
        "exploration",
        "Saya tertarik mempelajari cara kerja sesuatu yang baru.",
      ],
      [
        "structure",
        "Saya menikmati mengikuti petunjuk untuk menghasilkan sesuatu.",
      ],
    ]),
  },
] as const;
export function getTest(id: string) {
  return tests.find((test) => test.id === id);
}
