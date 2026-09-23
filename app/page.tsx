import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Shapes,
  Timer,
  Fingerprint,
  Check,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import GlassCard from "./components/GlassCard";
import { stages } from "@/data/psychotestQuestions";
const icons = [BookOpen, Calculator, Shapes, Timer, Fingerprint];
export default function Home() {
  return (
    <div className="page-shell fade-in">
      <section className="grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
        <div>
          <p className="text-xs leading-6 text-muted">
            PSIKOTES BERTAHAP · KEMAMPUAN & KEPRIBADIAN
          </p>
          <h1 className="mt-7 text-4xl leading-tight tracking-tight md:text-6xl">
            Kenali kemampuan.
            <br />
            <span className="decoration-sage decoration-8 underline underline-offset-8">
              Pahami cara kerjamu.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-muted">
            Satu rangkaian yang terstruktur: dari penalaran verbal dan angka,
            hingga pola gambar, ketelitian, dan kepribadian. Dapatkan hasil
            terukur beserta pembahasan untuk langkah latihan berikutnya.
          </p>
          <Link href="/test/komprehensif" className="btn-primary mt-8">
            Mulai rangkaian tes <ArrowRight size={18} />
          </Link>
          <p className="mt-5 flex items-center gap-2 text-xs font-medium">
            <Clock3 size={15} /> Sekitar 35–45 menit · 5 tahap · Bisa tanpa akun
          </p>
        </div>
        <GlassCard className="!bg-white/60">
          <p className="eyebrow mb-5">SATU SESI. GAMBARAN LEBIH LENGKAP.</p>
          <div className="space-y-4">
            {stages.map((stage, i) => {
              const Icon = icons[i];
              return (
                <div
                  key={stage.id}
                  className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white/60 p-3"
                >
                  <span
                    className={`rounded-xl p-3 ${["bg-rose/70", "bg-pastel/70", "bg-sage/70", "bg-cream", "bg-rose/50"][i]}`}
                  >
                    <Icon size={22} />
                  </span>
                  <div>
                    <h2 className="text-sm">{stage.title}</h2>
                    <p className="mt-1 text-xs text-muted">{stage.detail}</p>
                  </div>
                  <span className="ml-auto text-sm font-bold">0{i + 1}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-xs leading-6 text-muted">
            42 soal kemampuan + 25 pernyataan kepribadian, latihan koran, dan 3
            respons proyektif.
          </p>
        </GlassCard>
      </section>
      <div className="grid gap-4 border-y border-ink/15 py-6 sm:grid-cols-3">
        {[
          "Jawaban objektif & pembahasan",
          "Timer terpisah setiap tahap",
          "Laporan PDF & PNG",
        ].map((label) => (
          <div
            key={label}
            className="flex items-center justify-center gap-2 text-sm font-semibold"
          >
            <Check size={17} />
            {label}
          </div>
        ))}
      </div>
      <section id="pilih-tes" className="scroll-mt-8 py-14">
        <p className="eyebrow mb-3">ALUR TES KOMPREHENSIF</p>
        <h2 className="mb-4 text-3xl">Bertahap, dengan tujuan yang jelas</h2>
        <p className="mb-8 max-w-2xl text-sm leading-7 text-muted">
          Selesaikan satu bagian sebelum berpindah. Anda bisa beristirahat pada
          layar petunjuk di antara tahap. Hasil baru dibuka setelah rangkaian
          selesai.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          {stages.map((stage, i) => {
            const Icon = icons[i];
            return (
              <GlassCard
                key={stage.id}
                className={i === 4 ? "md:col-span-2" : ""}
              >
                <div className="mb-4 flex items-center justify-between">
                  <Icon size={27} />
                  <span className="eyebrow">TAHAP 0{i + 1}</span>
                </div>
                <h3 className="text-xl">{stage.title}</h3>
                <p className="mt-2 text-xs font-semibold text-muted">
                  {stage.detail}
                </p>
                <p className="mt-4 text-sm leading-7">{stage.instruction}</p>
              </GlassCard>
            );
          })}
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-sage/50 p-6">
          <div>
            <h3 className="text-xl">Siapkan waktu dan tempat yang tenang.</h3>
            <p className="mt-2 text-sm">
              Kertas kosong boleh digunakan untuk bagian numerik.
            </p>
          </div>
          <Link className="btn bg-white/80" href="/test/komprehensif">
            Mulai dari tahap pertama <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section id="cara-kerja" className="pb-10">
        <h2 className="mb-7 text-3xl">Hasil yang bisa ditindaklanjuti</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            [
              "01",
              "Ketahui letak kesalahan",
              "Lihat benar, salah, dan soal kosong per bagian. Buka pembahasan untuk memahami langkah penalarannya.",
            ],
            [
              "02",
              "Tinjau pola pengerjaan",
              "Bandingkan jumlah respons serta kesalahan per kolom koran. Pahami keseimbangan antara kecepatan dan ketelitian.",
            ],
            [
              "03",
              "Refleksikan kebiasaan",
              "Kepribadian dilaporkan terpisah. Respons cerita ditampilkan apa adanya, tanpa diagnosis otomatis.",
            ],
          ].map(([n, title, description]) => (
            <div key={n}>
              <span className="font-heading text-3xl font-bold text-muted">
                {n}
              </span>
              <h3 className="mb-3 mt-4 text-lg">{title}</h3>
              <p className="text-sm leading-7 text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="flex items-start gap-3 rounded-2xl border border-ink/15 bg-white/70 p-5 text-xs leading-7">
        <ShieldCheck size={20} className="mt-1 shrink-0" />
        <p>
          Ditujukan untuk latihan remaja akhir dan dewasa. Soal orisinal ini
          belum dinormakan atau divalidasi sebagai instrumen psikologi
          profesional. Hasil menunjukkan performa pada latihan ini, bukan IQ,
          diagnosis, atau dasar seleksi kerja. Mode tamu tidak menyimpan hasil
          ke database; masuk Google jika ingin menyimpan laporan.
        </p>
      </div>
    </div>
  );
}
