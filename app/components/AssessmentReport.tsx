import { Sprout } from "lucide-react";
import {
  abilityQuestions,
  projectivePrompts,
  stages,
  traitLabels,
  type Ability,
  type Trait,
} from "@/data/psychotestQuestions";
import type { AssessmentResult } from "@/lib/assessment";
import SpatialFigure from "./SpatialFigure";
import ProjectiveScene from "./ProjectiveScene";

const sectionClass = "rounded-3xl border border-ink/15 bg-[#F6E7C6] p-6 sm:p-9";
function Header({ title }: { title: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-ink/15 pb-5">
      <span className="inline-flex items-center gap-2 font-heading text-lg font-bold">
        <Sprout size={25} /> psikotesku.
      </span>
      <span className="eyebrow">{title}</span>
    </div>
  );
}
export default function AssessmentReport({
  result,
}: {
  result: AssessmentResult;
}) {
  const abilityKeys: Ability[] = ["verbal", "numeric", "spatial"];
  const totalCorrect = abilityKeys.reduce(
    (n, k) => n + result.abilities[k].correct,
    0,
  );
  const total = abilityKeys.reduce((n, k) => n + result.abilities[k].total, 0);
  return (
    <div className="space-y-6 text-ink">
      <section data-report-page className={sectionClass}>
        <Header title="LAPORAN KEMAMPUAN" />
        <p className="eyebrow mb-3">SATU RANGKAIAN · LIMA TAHAP</p>
        <h1 className="text-3xl">Psikotes Komprehensif</h1>
        <p className="mt-3 text-sm text-muted">
          {new Date(result.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · Waktu pengerjaan aktif {Math.floor(result.durationSeconds / 60)}{" "}
          menit {result.durationSeconds % 60} detik
        </p>
        <div className="my-6 rounded-2xl bg-sage/50 p-5">
          <span className="text-3xl font-bold">
            {totalCorrect} / {total}
          </span>
          <p className="mt-2 text-sm">
            jawaban benar pada tiga bagian kemampuan. Ini skor mentah soal
            latihan, bukan skor IQ atau peringkat dibanding peserta lain.
          </p>
        </div>
        <div className="space-y-6">
          {abilityKeys.map((key, i) => {
            const score = result.abilities[key];
            return (
              <div key={key}>
                <div className="mb-2 flex flex-wrap justify-between gap-2">
                  <h2 className="text-lg">{stages[i].title}</h2>
                  <strong>
                    {score.correct}/{score.total} · {score.percent}%
                  </strong>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full ${["bg-rose", "bg-pastel", "bg-sage"][i]}`}
                    style={{ width: `${score.percent}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-7">
                  {score.correct} benar · {score.wrong} salah · {score.omitted}{" "}
                  kosong
                  <br />
                  Akurasi jawaban terisi:{" "}
                  {score.accuracy === null
                    ? "belum tersedia"
                    : `${score.accuracy}%`}{" "}
                  · Durasi: {score.seconds} detik
                  {score.timedOut ? " (waktu habis)" : ""}
                </p>
                <p className="mt-2 text-xs leading-6">
                  {score.correct === score.total
                    ? "Seluruh soal pada bagian ini dijawab tepat. Coba soal dengan variasi dan kesulitan lebih tinggi."
                    : `${score.total - score.correct} soal belum dijawab tepat. Gunakan rincian keterampilan dan pembahasan untuk menentukan latihan berikutnya.`}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-7 border-t border-ink/15 pt-4 text-xs leading-6">
          Skor bagian = benar ÷ seluruh soal × 100. Akurasi = benar ÷ jawaban
          terisi × 100. Salah dan kosong bernilai 0; tidak ada penalti. Hasil
          antarbagian tidak dinormakan dan tidak boleh dianggap memiliki tingkat
          kesulitan yang setara.
        </p>
        <p className="mt-3 break-all text-[10px]">
          ID: {result.id} ? Metode v2
        </p>
      </section>
      <section data-report-page className={sectionClass}>
        <Header title="ARAH LATIHAN" />
        <h2 className="mb-6 text-2xl">Keterampilan yang perlu ditinjau</h2>
        <div className="space-y-6">
          {abilityKeys.map((key, i) => {
            const score = result.abilities[key];
            const priorities = score.skills
              .filter((s) => s.correct < s.total)
              .map((s) => s.name);
            return (
              <div key={key}>
                <h3 className="mb-3 text-lg">{stages[i].title}</h3>
                <div className="flex flex-wrap gap-2">
                  {score.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="rounded-xl border border-ink/15 bg-white/70 px-3 py-2 text-xs"
                    >
                      {skill.name}:{" "}
                      <strong>
                        {skill.correct}/{skill.total}
                      </strong>
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-7">
                  {priorities.length
                    ? `Prioritas berdasarkan soal yang salah atau kosong: ${priorities.join(", ")}. Pelajari pembahasan, lalu kerjakan latihan baru dengan kondisi waktu yang sama.`
                    : "Semua kelompok soal dijawab tepat. Pertahankan ketelitian dan perluas variasi latihan."}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-xs leading-6">
          Setiap keterampilan hanya diwakili beberapa soal. Rincian ini
          merupakan petunjuk belajar, bukan estimasi kemampuan yang stabil.
          Mengulang soal yang sama dapat meningkatkan skor karena familiaritas.
        </p>
        {result.quality.length > 0 && (
          <div className="mt-6 rounded-2xl bg-rose/35 p-5">
            <h3 className="mb-3 text-base">Catatan pengerjaan</h3>
            <ul className="list-disc space-y-2 pl-5 text-xs leading-6">
              {result.quality.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <section data-report-page className={sectionClass}>
        <Header title="KECEPATAN & KETELITIAN" />
        <h2 className="text-2xl">Latihan koran digital</h2>
        <p className="my-4 text-sm leading-7">
          Empat interval masing-masing 45 detik. Kecepatan dipengaruhi cara
          input, perangkat, dan kondisi pengerjaan. Bandingkan sesi hanya jika
          kondisinya serupa.
        </p>
        <div className="my-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-pastel/50 p-5">
            <strong className="text-3xl">{result.koran.perMinute}</strong>
            <p className="mt-2 text-xs">jawaban angka per menit</p>
          </div>
          <div className="rounded-2xl bg-sage/50 p-5">
            <strong className="text-3xl">
              {result.koran.accuracy === null
                ? "—"
                : `${result.koran.accuracy}%`}
            </strong>
            <p className="mt-2 text-xs">akurasi jawaban angka</p>
          </div>
        </div>
        <p className="mb-5 text-sm">
          {result.koran.correct} benar · {result.koran.wrong} salah ·{" "}
          {result.koran.skipped} dilewati
          {typeof result.koran.totalPairs === "number" && (
            <> · {result.koran.unanswered} belum dikerjakan dari {result.koran.totalPairs} soal</>
          )}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Hasil tiap kolom koran</caption>
            <thead>
              <tr className="border-b border-ink/20">
                <th className="py-3">Kolom</th>
                <th>Terisi</th>
                <th>Benar</th>
                <th>Salah</th>
                <th>Lewati</th>
              </tr>
            </thead>
            <tbody>
              {result.koran.columns.map((c, i) => (
                <tr key={i} className="border-b border-ink/10">
                  <td className="py-3">{i + 1}</td>
                  <td>{c.attempted}</td>
                  <td>{c.correct}</td>
                  <td>{c.wrong}</td>
                  <td>{c.skipped}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 space-y-3">
          {result.koran.columns.map((c, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className="w-16">Kolom {i + 1}</span>
              <div className="h-5 flex-1 rounded bg-white">
                <div
                  className="h-full rounded bg-pastel"
                  style={{
                    width: `${(c.attempted / Math.max(1, ...result.koran.columns.map((s) => s.attempted))) * 100}%`,
                  }}
                />
              </div>
              <span className="w-8 text-right">{c.attempted}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-7">
          Selisih kolom terbanyak dan tersedikit:{" "}
          <strong>{result.koran.spread} jawaban</strong>. Ini variasi jumlah
          respons dalam sesi, bukan ukuran daya tahan psikologis.
        </p>
        <p className="mt-3 text-sm leading-7">
          {result.koran.attempted === 0
            ? "Belum ada respons angka; lakukan ulang latihan setelah memahami petunjuk."
            : result.koran.wrong > 0
              ? "Ada kesalahan penjumlahan atau input. Latih ketepatan digit satuan pada tempo nyaman sebelum meningkatkan kecepatan."
              : "Semua respons angka tercatat benar. Pertahankan akurasi saat mencoba tempo lebih cepat."}
        </p>
        <p className="mt-4 text-xs leading-6">
          Kecepatan = jawaban angka ÷ 3 menit. Pasangan dilewati tidak termasuk
          akurasi. Ini latihan penjumlahan beruntun bergaya koran, bukan
          administrasi baku tes Pauli/Kraepelin.
        </p>
      </section>
      <section data-report-page className={sectionClass}>
        <Header title="PROFIL KEPRIBADIAN" />
        <h2 className="text-2xl">Kecenderungan yang Anda laporkan</h2>
        <p className="my-4 text-sm leading-7">
          Rata-rata respons 1–5 setelah pembalikan skor pernyataan negatif.
          Angka lebih tinggi bukan berarti lebih baik; hasil menggambarkan
          kebiasaan yang Anda laporkan saat ini.
        </p>
        <div className="space-y-6">
          {(Object.keys(traitLabels) as Trait[]).map((trait) => {
            const value = result.personality[trait];
            const info = traitLabels[trait];
            return (
              <div key={trait}>
                <div className="flex justify-between gap-3 text-sm">
                  <h3>{info.label}</h3>
                  <strong>{value.toFixed(1)} / 5</strong>
                </div>
                <div className="my-2 h-2 rounded bg-white">
                  <div
                    className="h-full rounded bg-sage"
                    style={{ width: `${((value - 1) / 4) * 100}%` }}
                  />
                </div>
                <p className="text-xs leading-6">
                  {value < 2.5
                    ? info.low
                    : value > 3.5
                      ? info.high
                      : "Respons berada di sekitar titik tengah; kecenderungan dapat berbeda menurut situasi."}{" "}
                  {info.tip}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-6 border-t border-ink/15 pt-4 text-xs leading-6">
          25 pernyataan orisinal dikelompokkan dalam lima tema kepribadian. Ini
          bukan alat Big Five yang sudah dinormakan. Pembagian di sekitar titik
          tengah hanya deskripsi respons, bukan ambang klinis atau klasifikasi
          kepribadian.
        </p>
      </section>
      {projectivePrompts.map((prompt) => (
        <section data-report-page key={prompt.id} className={sectionClass}>
          <Header title="RESPONS PROYEKTIF" />
          <h2 className="text-2xl">{prompt.title}</h2>
          <p className="mt-4 text-sm font-semibold leading-7">{prompt.text}</p>
          {prompt.id === "story" && <ProjectiveScene />}
          <div className="mt-5 whitespace-pre-wrap break-words rounded-2xl bg-white/70 p-5 text-sm leading-7">
            {result.projective[prompt.id] || "Tidak diisi oleh peserta."}
          </div>
          <p className="mt-5 text-xs leading-6">
            Respons ditampilkan apa adanya. Tidak ada skor tersembunyi, analisis
            kata kunci, atau penarikan kesimpulan tentang trauma, karakter,
            maupun kondisi mental. Pertanyaan refleksi: bagian mana yang paling
            sesuai dengan pengalaman Anda? Adakah cara lain melihat situasi
            tersebut?
          </p>
        </section>
      ))}
      <p className="px-2 text-xs leading-6">
        ID: {result.id} · Metode v2 · Instrumen latihan orisinal; belum memiliki
        data reliabilitas, norma populasi, atau validasi untuk diagnosis dan
        seleksi kerja.
      </p>
    </div>
  );
}
export function AnswerReview({ result }: { result: AssessmentResult }) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl">Pembahasan jawaban kemampuan</h2>
      <p className="mb-6 mt-3 text-sm leading-7">
        Tersedia setelah seluruh tahap selesai. Buka soal untuk melihat jawaban
        dan alasannya.
      </p>
      <div className="space-y-3">
        {abilityQuestions.map((q, i) => {
          const selected = q.options.find(
            (o) => o.id === result.responses[q.id],
          );
          const correct = q.options.find((o) => o.id === q.correctId)!;
          return (
            <details
              key={q.id}
              className="rounded-2xl border border-ink/15 bg-white/60 p-5"
            >
              <summary className="cursor-pointer text-sm font-semibold leading-7">
                {i + 1}. {q.skill} ·{" "}
                {selected
                  ? selected.id === q.correctId
                    ? "Benar"
                    : "Salah"
                  : "Kosong"}
              </summary>
              <p className="my-4 text-sm leading-7">{q.text}</p>
              {q.figures && (
                <div className="mb-5 flex flex-wrap gap-3">
                  {q.figures.map((cells, i) => (
                    <SpatialFigure
                      key={i}
                      cells={cells}
                      label={`Gambar ${i + 1}`}
                    />
                  ))}
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-cream/50 p-4">
                  <p className="mb-2 text-xs font-semibold">JAWABAN ANDA</p>
                  {selected?.cells ? (
                    <SpatialFigure cells={selected.cells} />
                  ) : (
                    <p className="text-sm">
                      {selected?.label || "Tidak dijawab"}
                    </p>
                  )}
                </div>
                <div className="rounded-xl bg-sage/50 p-4">
                  <p className="mb-2 text-xs font-semibold">JAWABAN BENAR</p>
                  {correct.cells ? (
                    <SpatialFigure cells={correct.cells} />
                  ) : (
                    <p className="text-sm">{correct.label}</p>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm leading-7">{q.explanation}</p>
            </details>
          );
        })}
      </div>
    </section>
  );
}
