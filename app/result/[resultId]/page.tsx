"use client";
import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Coffee, Sprout, ArrowLeft } from "lucide-react";
import { db } from "@/lib/firebase";
import { historyError } from "@/lib/firebaseErrors";
import type { Result } from "@/lib/psychotest";
import { dimensions, type Dimension } from "@/data/legacyQuestions";
import { useApp } from "@/app/components/Providers";
import GlassCard from "@/app/components/GlassCard";
import DonationModal from "@/app/components/DonationModal";
import DownloadButtons from "@/app/components/DownloadButtons";
import AssessmentReport, {
  AnswerReview,
} from "@/app/components/AssessmentReport";
export default function ResultPage({
  params,
}: {
  params: Promise<{ resultId: string }>;
}) {
  const { resultId } = use(params);
  const { user, loading, results } = useApp();
  const local = results[resultId];
  const [remote, setRemote] = useState<Result | null>(null);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [donate, setDonate] = useState(false);
  const report = useRef<HTMLDivElement>(null);
  const result =
    local && (!local.ownerId || local.ownerId === user?.uid)
      ? local
      : remote?.ownerId === user?.uid
        ? remote
        : null;
  useEffect(() => {
    if (loading) return;
    let active = true;
    setFailed(false);
    setFetching(true);
    setRemote(null);
    async function resolve() {
      try {
        if (local && !local.ownerId) {
          if (active)
            setStatus(
              "Mode tamu: unduh hasil sekarang. Hasil tidak disimpan dan akan hilang saat halaman dimuat ulang atau ditutup.",
            );
          return;
        }
        if (!user || !db) {
          if (active)
            setStatus(
              "Masuk dengan akun pemilik untuk membuka hasil tersimpan. Hasil tamu yang sudah ditutup tidak dapat dipulihkan.",
            );
          return;
        }
        const reference = doc(db, "users", user.uid, "test_results", resultId);
        if (local?.ownerId === user.uid) {
          if (active) setStatus("Menyimpan hasil ke riwayat…");
          const existing = await getDoc(reference);
          if (!existing.exists()) await setDoc(reference, local);
          if (active)
            setStatus("Hasil berhasil tersimpan di riwayat akun Anda.");
        } else {
          const snapshot = await getDoc(reference);
          if (active) {
            setRemote(snapshot.exists() ? (snapshot.data() as Result) : null);
            setStatus(
              snapshot.exists()
                ? "Hasil dari riwayat akun Anda."
                : "Hasil tidak ditemukan di akun ini.",
            );
          }
        }
      } catch (cause) {
        if (active) {
          setStatus(
            `${historyError(cause).message} Kode: ${historyError(cause).code}. Hasil yang tampil masih bisa diunduh; penyimpanan belum terkonfirmasi.`,
          );
          setFailed(true);
        }
      } finally {
        if (active) setFetching(false);
      }
    }
    void resolve();
    return () => {
      active = false;
    };
  }, [resultId, local, user, loading, attempt]);
  return (
    <div className="page-shell max-w-4xl py-6 sm:py-12">
      <Link className="mb-6 inline-flex items-center gap-2 text-sm" href="/">
        <ArrowLeft size={16} /> Beranda
      </Link>
      <div
        role="status"
        className="mb-6 rounded-2xl bg-white/40 p-4 text-sm leading-6"
      >
        {loading ? "Memuat sesi…" : status || "Memuat hasil…"}
        {failed && (
          <button
            className="btn ml-3 mt-2"
            onClick={() => setAttempt((a) => a + 1)}
          >
            Coba lagi
          </button>
        )}
      </div>
      {result ? (
        <>
          <div ref={report}>
            {result.version === 2 ? (
              <AssessmentReport result={result} />
            ) : (
              <div className="rounded-3xl border border-white/80 bg-[#F6E7C6] p-6 shadow-glass sm:p-10">
                <div className="mb-9 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-heading text-lg font-semibold">
                    <Sprout size={25} /> psikotesku.
                  </span>
                  <span className="eyebrow text-right">
                    LAPORAN REFLEKSI
                    <br />
                    <span className="text-[10px]">
                      {new Date(result.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                </div>
                <p className="eyebrow mb-3">
                  SATU LANGKAH LEBIH DEKAT DENGAN DIRIMU
                </p>
                <h1 className="text-3xl sm:text-4xl">{result.testTitle}</h1>
                <p className="mb-8 mt-4 text-sm leading-7">
                  Setiap sisi dirimu punya ruang untuk tumbuh. Berikut gambaran
                  preferensi dari jawaban Anda hari ini.
                </p>
                <div className="space-y-6">
                  {(Object.keys(dimensions) as Dimension[]).map((key, i) => (
                    <div key={key}>
                      <div className="mb-2 flex justify-between text-sm font-semibold">
                        <span>{dimensions[key].label}</span>
                        <span>{result.scores[key]}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/60">
                        <div
                          className={`h-full rounded-full ${["bg-rose", "bg-pastel", "bg-sage"][i]}`}
                          style={{ width: `${result.scores[key]}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs leading-6">
                        {dimensions[key].description}{" "}
                        {result.scores[key] >= 67
                          ? "Cukup sering tercermin dalam jawaban Anda."
                          : result.scores[key] >= 34
                            ? "Tercermin dalam beberapa situasi."
                            : "Lebih jarang tercermin dalam jawaban Anda."}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="my-8 rounded-2xl bg-white/40 p-5">
                  <h2 className="mb-3 text-lg">Langkah kecil berikutnya</h2>
                  <ul className="space-y-2 text-xs leading-6">
                    {(Object.keys(dimensions) as Dimension[]).map((key) => (
                      <li key={key}>• {dimensions[key].suggestion}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-[11px] leading-6">
                  Skor 0–100% menunjukkan kecenderungan jawaban, bukan
                  persentil, nilai kelulusan, atau ukuran bakat. Semua dimensi
                  setara. Bank soal contoh ini belum tervalidasi dan tidak
                  digunakan untuk diagnosis atau keputusan klinis maupun
                  rekrutmen.
                </p>
                <p className="mt-5 break-all border-t border-ink/15 pt-4 text-[10px]">
                  ID: {result.id} · Metode refleksi v{result.version} · Dibuat
                  untuk mengenal diri dengan lebih hangat.
                </p>
              </div>
            )}
          </div>
          <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
            <DownloadButtons target={report} id={result.id} />
            <button className="btn bg-cream/60" onClick={() => setDonate(true)}>
              <Coffee size={18} /> Give me a Kopi
            </button>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-sm">
            <Link
              href="/test/komprehensif"
              className="underline underline-offset-4"
            >
              Kerjakan ulang tes
            </Link>
            <Link href="/dashboard" className="underline underline-offset-4">
              Lihat riwayat
            </Link>
          </div>
          {result.version === 2 && <AnswerReview result={result} />}
        </>
      ) : (
        <GlassCard>
          <h1 className="text-2xl">
            {loading || fetching ? "Menyiapkan hasil…" : "Hasil belum tersedia"}
          </h1>
          <p className="my-4 text-sm">
            Anda dapat memulai tes baru untuk mendapatkan ringkasan refleksi.
          </p>
          <Link href="/#pilih-tes" className="btn-primary">
            Pilih tes
          </Link>
        </GlassCard>
      )}
      <DonationModal open={donate} onClose={() => setDonate(false)} />
    </div>
  );
}
