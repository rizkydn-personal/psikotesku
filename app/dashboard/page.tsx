"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocsFromServer,
  orderBy,
  query,
} from "firebase/firestore";
import { History, ArrowUpRight } from "lucide-react";
import { useApp } from "@/app/components/Providers";
import AuthButton from "@/app/components/AuthButton";
import GlassCard from "@/app/components/GlassCard";
import { db } from "@/lib/firebase";
import type { Result } from "@/lib/psychotest";
import ProfileEditor from "@/app/components/ProfileEditor";
import { historyError } from "@/lib/firebaseErrors";
export default function Dashboard() {
  const { user, loading, displayName } = useApp();
  const [items, setItems] = useState<Result[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<ReturnType<typeof historyError> | null>(
    null,
  );
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (loading) return;
    let active = true;
    setItems([]);
    setError(null);
    if (!user || !db) {
      setBusy(false);
      return;
    }
    setBusy(true);
    const timeout = window.setTimeout(() => {
      if (!active) return;
      active = false;
      setError(historyError({ code: "deadline-exceeded" }));
      setBusy(false);
    }, 15000);
    const database = db;
    async function loadHistory() {
      try {
        // Ensure Auth has resolved and a valid token is available before reading.
        await user!.getIdToken();
        const snapshot = await getDocsFromServer(
          query(
            collection(database, "users", user!.uid, "test_results"),
            orderBy("createdAt", "desc"),
          ),
        );
        if (active)
          setItems(
            snapshot.docs
              .map((doc) => ({ ...doc.data(), id: doc.id }) as Result)
              .filter((item) => item.ownerId === user!.uid),
          );
      } catch (cause) {
        if (active) setError(historyError(cause));
      } finally {
        window.clearTimeout(timeout);
        if (active) setBusy(false);
      }
    }
    void loadHistory();
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [user, loading, attempt]);
  return (
    <div className="page-shell py-8 sm:py-14">
      <p className="eyebrow mb-3 text-[10px] leading-5 tracking-[0.14em] sm:text-xs sm:tracking-[0.2em]">
        HASIL TES & PERKEMBANGAN LATIHAN
      </p>
      <h1 className="mb-3 text-3xl leading-tight sm:mb-4 sm:text-4xl">
        Riwayat psikotes
      </h1>
      <p className="mb-6 text-sm leading-7 [overflow-wrap:anywhere] sm:mb-9">
        {user
          ? `Halo, ${displayName || "teman"}. Tinjau kembali hasil dan pembahasan latihan Anda.`
          : "Simpan perjalanan mengenal diri dalam satu tempat."}
      </p>
      {user && !loading && <ProfileEditor key={user.uid} />}
      {loading ? (
        <p role="status">Memuat sesi…</p>
      ) : !user ? (
        <GlassCard className="max-w-xl">
          <History className="mb-5" size={32} />
          <h2 className="mb-3 text-2xl">Ruang pribadimu menanti</h2>
          <p className="mb-6 text-sm leading-7">
            Masuk Google sebelum mengerjakan tes untuk menyimpan hasil secara
            otomatis. Hasil dari mode tamu tidak masuk ke riwayat.
          </p>
          <AuthButton />
          <Link href="/" className="mt-5 block text-sm underline">
            Lanjut sebagai tamu
          </Link>
        </GlassCard>
      ) : busy ? (
        <p role="status">Memuat riwayat…</p>
      ) : error ? (
        <GlassCard>
          <h2 className="mb-3 text-lg leading-7 sm:text-xl">
            Riwayat belum dapat dimuat
          </h2>
          <p role="alert" className="text-sm leading-7">
            {error.message}
          </p>
          <details className="mt-3 text-xs leading-6 text-muted">
            <summary className="min-h-11 cursor-pointer py-2">
              Detail kendala
            </summary>
            <p className="break-words">Kode: {error.code}</p>
          </details>
          <button
            className="btn mt-4 w-full sm:w-auto"
            onClick={() => setAttempt((a) => a + 1)}
          >
            Coba lagi
          </button>
        </GlassCard>
      ) : !items.length ? (
        <GlassCard>
          <History className="mb-4" />
          <h2 className="text-2xl">Awali cerita pertamamu</h2>
          <p className="my-4 text-sm">
            Belum ada hasil tersimpan. Pilih tes dan luangkan sedikit waktu
            untuk diri sendiri.
          </p>
          <Link href="/#pilih-tes" className="btn-primary">
            Jelajahi tes
          </Link>
        </GlassCard>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {items
            .filter((item) => item.ownerId === user.uid)
            .map((item) => (
              <GlassCard key={item.id}>
                <p className="eyebrow mb-3">
                  {new Date(item.createdAt).toLocaleDateString("id-ID")}
                </p>
                <h2 className="mb-6 text-2xl">{item.testTitle}</h2>
                <Link href={`/result/${item.id}`} className="btn">
                  Lihat laporan <ArrowUpRight size={16} />
                </Link>
              </GlassCard>
            ))}
        </div>
      )}
    </div>
  );
}
