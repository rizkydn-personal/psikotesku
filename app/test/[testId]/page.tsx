"use client";
import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock3, RotateCcw } from "lucide-react";
import {
  likert,
  personalityQuestions,
  projectivePrompts,
  stages,
  type Ability,
} from "@/data/psychotestQuestions";
import {
  appendKoranAnswer,
  createSession,
  finishAssessment,
  koranColumnAt,
  secondsRemaining,
  type Session,
} from "@/lib/assessment";
import { useApp } from "@/app/components/Providers";
import GlassCard from "@/app/components/GlassCard";
import SpatialFigure from "@/app/components/SpatialFigure";
import ProjectiveScene from "@/app/components/ProjectiveScene";
import ConfirmModal, { type Confirmation } from "@/app/components/ConfirmModal";
import KoranPair from "@/app/components/KoranPair";

type PendingConfirmation = Confirmation & {
  action: "finish" | "restart" | "leave";
  href?: string;
};

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
export default function TestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = use(params);
  const router = useRouter();
  const { user, loading, keepResult } = useApp();
  const [session, setSession] = useState<Session | null>(null);
  const [stage, setStage] = useState(0);
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [practice, setPractice] = useState("");
  const [practicePassed, setPracticePassed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState<PendingConfirmation | null>(
    null,
  );
  const startedAt = useRef(0);
  const activeRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const info = stages[stage];
  const domain = info.id as Ability;
  const questions = session && stage < 3 ? session.questions[domain] : [];
  const question = questions[index];
  const column =
    active && stage === 3 ? koranColumnAt(startedAt.current, now) : 0;
  const remaining =
    active && info.seconds
      ? secondsRemaining(startedAt.current + info.seconds * 1000, now)
      : 0;

  const endStage = useCallback(
    (timedOut: boolean) => {
      if (!activeRef.current || stage >= 4) return;
      activeRef.current = false;
      setConfirmation(null);
      const seconds = Math.min(
        info.seconds,
        Math.max(0, Math.round((Date.now() - startedAt.current) / 1000)),
      );
      setSession((previous) =>
        previous
          ? {
              ...previous,
              timings: {
                ...previous.timings,
                [info.id]: { seconds, timedOut },
              },
            }
          : previous,
      );
      setActive(false);
      setIndex(0);
      setStage((s) => s + 1);
      setNotice(
        timedOut
          ? `Waktu ${info.title} selesai. Jawaban yang sudah dipilih telah dicatat.`
          : `${info.title} selesai. Anda boleh beristirahat sebelum tahap berikutnya.`,
      );
    },
    [stage, info],
  );

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (info.seconds && time >= startedAt.current + info.seconds * 1000)
        endStage(true);
    };
    const timer = window.setInterval(tick, 200);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [active, info.seconds, endStage]);
  useEffect(() => {
    if (!session || busy) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [session, busy]);
  useEffect(() => {
    headingRef.current?.focus();
  }, [stage, active, index]);

  const inputDigit = useCallback(
    (digit: number | null) => {
      if (!activeRef.current || stage !== 3 || confirmation) return;
      const currentColumn = koranColumnAt(startedAt.current);
      // Never attribute a key from the old, still-rendered column to the next column.
      if (currentColumn !== column || currentColumn >= 4) return;
      setSession((previous) =>
        previous ? appendKoranAnswer(previous, currentColumn, digit) : previous,
      );
    },
    [stage, column, confirmation],
  );
  useEffect(() => {
    if (!active || stage !== 3 || confirmation) return;
    const keydown = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        (event.target instanceof HTMLElement &&
          ["INPUT", "TEXTAREA"].includes(event.target.tagName))
      )
        return;
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        inputDigit(Number(event.key));
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [active, stage, inputDigit, confirmation]);

  useEffect(() => {
    if (!session || busy) return;
    const guardNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? (event.target.closest("a[href]") as HTMLAnchorElement | null)
          : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download"))
        return;
      const destination = new URL(link.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        (destination.pathname === window.location.pathname &&
          destination.search === window.location.search)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      setConfirmation({
        action: "leave",
        href: destination.pathname + destination.search + destination.hash,
        title: "Keluar dari rangkaian tes?",
        description:
          "Jawaban dan progres sesi ini belum menjadi laporan. Jika keluar sekarang, Anda perlu mengulang tes dari awal.",
        confirmLabel: "Ya, keluar dari tes",
        destructive: true,
      });
    };
    document.addEventListener("click", guardNavigation, true);
    return () => document.removeEventListener("click", guardNavigation, true);
  }, [session, busy]);

  if (!["komprehensif", "kepribadian", "minat-bakat"].includes(testId))
    return (
      <div className="page-shell py-20">
        <h1 className="text-3xl">Tes tidak ditemukan</h1>
        <Link href="/" className="btn mt-6">
          Kembali
        </Link>
      </div>
    );
  function startStage() {
    if (!session) setSession(createSession());
    startedAt.current = Date.now();
    activeRef.current = true;
    setNow(startedAt.current);
    setActive(true);
    setIndex(0);
    setNotice("");
    setError("");
  }
  function answer(id: string, value: string) {
    if (
      !activeRef.current ||
      Date.now() >= startedAt.current + info.seconds * 1000
    ) {
      endStage(true);
      return;
    }
    setSession((s) =>
      s ? { ...s, answers: { ...s.answers, [id]: value } } : s,
    );
  }
  function restart() {
    activeRef.current = false;
    setSession(null);
    setStage(0);
    setActive(false);
    setIndex(0);
    setNotice("");
    setError("");
    setPractice("");
    setPracticePassed(false);
  }
  function submit() {
    if (!session || busy || loading) return;
    setError("");
    try {
      const completed = {
        ...session,
        timings: {
          ...session.timings,
          personality: {
            seconds: Math.max(
              0,
              Math.round((Date.now() - startedAt.current) / 1000),
            ),
            timedOut: false,
          },
        },
      };
      const result = finishAssessment(completed, user?.uid ?? null);
      activeRef.current = false;
      setBusy(true);
      keepResult(result);
      router.push(`/result/${result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hasil belum dapat dihitung.");
    }
  }
  const personalityPage =
    session?.personalityOrder
      .slice(index * 5, index * 5 + 5)
      .map((id) => personalityQuestions.find((q) => q.id === id)!) ?? [];
  const koran = session?.koran[Math.min(column, 3)];
  const row = koran?.answers.length ?? 0;

  return (
    <div className="page-shell max-w-5xl py-6 sm:py-10">
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Beranda
        </Link>
        <span className="text-sm font-semibold">Satu rangkaian · 5 tahap</span>
      </div>
      <ol aria-label="Tahapan tes" className="mb-8 grid grid-cols-5 gap-2">
        {stages.map((s, i) => (
          <li
            key={s.id}
            aria-current={i === stage ? "step" : undefined}
            className={`rounded-2xl border p-3 text-center ${i === stage ? "border-ink/50 bg-sage/70" : i < stage ? "border-white bg-white/70" : "border-ink/15 bg-white/30"}`}
          >
            <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-xs font-bold">
              {i < stage ? <Check size={15} /> : i + 1}
            </span>
            <span className="mt-2 hidden text-xs font-semibold sm:block">
              {["Verbal", "Numerik", "Spasial", "Koran", "Kepribadian"][i]}
            </span>
          </li>
        ))}
      </ol>
      {notice && (
        <p
          role="status"
          className="mb-5 rounded-2xl border border-ink/15 bg-pastel/40 p-4 text-sm"
        >
          {notice}
        </p>
      )}
      {!active ? (
        <GlassCard>
          <p className="eyebrow mb-3">TAHAP {stage + 1} / 5 · PETUNJUK</p>
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl">
            {info.title}
          </h1>
          <p className="mt-3 font-semibold text-muted">{info.detail}</p>
          <p className="my-6 leading-8">{info.instruction}</p>
          {stage === 0 && (
            <div className="mb-6 space-y-3 rounded-2xl bg-cream/60 p-5 text-sm leading-7">
              <p>
                Rangkaian ini ditujukan untuk latihan remaja akhir/dewasa yang
                memahami bahasa Indonesia dan aritmatika dasar. Total waktu
                sekitar 35–45 menit termasuk membaca petunjuk.
              </p>
              <p>
                Setiap bagian kemampuan memiliki timer sendiri. Anda boleh
                melewati soal dan kembali selama tahap masih aktif. Saat waktu
                habis, bagian ditutup; soal kosong mendapat 0. Tidak ada
                pengurangan nilai untuk jawaban salah.
              </p>
              <p>
                Timer tetap berjalan saat berganti tab. Istirahat tersedia di
                antara tahap. Jangan memuat ulang halaman: progres hanya
                tersimpan selama sesi ini terbuka.
              </p>
              <p>
                {user
                  ? "Hasil akhir akan disimpan ke akun aktif, termasuk respons cerita yang Anda isi. Hindari informasi pribadi sensitif."
                  : "Mode tamu: unduh laporan sebelum menutup atau memuat ulang halaman hasil."}
              </p>
              <p>
                Hasil menunjukkan performa pada soal latihan ini, bukan IQ,
                persentil populasi, atau diagnosis.
              </p>
            </div>
          )}
          {stage === 1 && (
            <p className="mb-6 rounded-2xl bg-white/60 p-4 text-sm">
              Contoh: 2, 4, 8, … → 16, karena setiap suku dikali 2.
            </p>
          )}
          {stage === 2 && (
            <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl bg-white/60 p-4">
              <SpatialFigure
                cells={[1, 0, 0, 0, 0, 0, 0, 0, 0]}
                label="Contoh awal"
              />
              <ArrowRight />
              <SpatialFigure
                cells={[0, 0, 1, 0, 0, 0, 0, 0, 0]}
                label="Rotasi 90 derajat"
              />
              <p className="max-w-xs text-sm leading-6">
                Contoh rotasi 90° searah jarum jam: kotak kiri atas menjadi
                kanan atas.
              </p>
            </div>
          )}
          {stage === 3 && (
            <div className="mb-6 rounded-2xl bg-white/70 p-5">
              <h2 className="mb-3 text-lg">Latihan sebelum timer dimulai</h2>
              <p className="mb-3 text-sm leading-7">
                Untuk deret vertikal 8, 7, 6: jawaban pertama 5 (8 + 7), lalu 3
                (7 + 6). Masukkan satu digit dengan keyboard atau tombol angka.
                Jawaban langsung tercatat dan tidak dapat diubah. Tidak ada
                penanda benar/salah saat tes.
              </p>
              <label className="text-sm font-semibold" htmlFor="practice">
                8 + 7 → digit satuannya?
              </label>
              <div className="mt-3 flex gap-3">
                <input
                  id="practice"
                  inputMode="numeric"
                  maxLength={1}
                  value={practice}
                  onChange={(e) =>
                    setPractice(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-20 rounded-xl border border-ink/30 bg-white p-3 text-center text-xl"
                />
                <button
                  className="btn"
                  onClick={() => {
                    setPracticePassed(practice === "5");
                    setError(
                      practice === "5"
                        ? ""
                        : "Jumlahnya 15. Masukkan digit satuannya saja: 5.",
                    );
                  }}
                >
                  Periksa latihan
                </button>
              </div>
              {practicePassed && (
                <p role="status" className="mt-3 text-sm font-semibold">
                  Benar. Anda siap memulai 4 kolom: maksimal 50 soal dan 45
                  detik per kolom.
                </p>
              )}
            </div>
          )}
          {stage === 4 && (
            <p className="mb-6 rounded-2xl bg-white/60 p-4 text-sm leading-7">
              Pernyataan kepribadian memakai skala 1–5, termasuk pernyataan
              dengan arah skor terbalik. Tidak ada kepribadian yang “lulus” atau
              “gagal”. Respons proyektif ditampilkan kembali secara utuh sebagai
              bahan refleksi.
            </p>
          )}
          {error && (
            <p role="alert" className="mb-4 text-sm">
              {error}
            </p>
          )}
          <button
            className="btn-primary"
            disabled={loading || (stage === 3 && !practicePassed)}
            onClick={startStage}
          >
            Mulai tahap {stage + 1} <ArrowRight size={17} />
          </button>
        </GlassCard>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1 ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl">
              {info.title}
            </h1>
            <span
              role="timer"
              aria-label="Sisa waktu"
              className={`inline-flex items-center gap-2 rounded-xl border border-ink/20 px-4 py-2 font-mono font-bold ${remaining < 60 && info.seconds ? "bg-rose" : "bg-white/70"}`}
            >
              <Clock3 size={18} />
              {info.seconds ? clock(remaining) : "Tanpa batas waktu"}
            </span>
          </div>
          {stage < 3 && question && (
            <GlassCard>
              <div className="mb-5 flex justify-between gap-3 text-xs font-semibold">
                <span>
                  SOAL {index + 1} / {questions.length}
                </span>
                <span>
                  {questions.filter((q) => session?.answers[q.id]).length}{" "}
                  terjawab
                </span>
              </div>
              <h2 id="question" className="mb-6 text-xl leading-9">
                {question.text}
              </h2>
              {question.figures && (
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  {question.figures.map((cells, i) => (
                    <div key={i} className="text-center">
                      <SpatialFigure cells={cells} label={`Gambar ${i + 1}`} />
                      <span className="mt-1 block text-xs">Gambar {i + 1}</span>
                    </div>
                  ))}
                  {question.figures.length > 1 && (
                    <span className="px-3 text-4xl">?</span>
                  )}
                </div>
              )}
              <fieldset
                aria-labelledby="question"
                className={
                  question.figures
                    ? "grid grid-cols-2 gap-3 sm:grid-cols-4"
                    : "space-y-3"
                }
              >
                <legend className="sr-only">Pilih satu jawaban</legend>
                {question.options.map((option, i) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${question.figures ? "flex-col items-center" : "items-center"} ${session?.answers[question.id] === option.id ? "border-ink/60 bg-sage/60" : "border-ink/20 bg-white/60 hover:bg-white"}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={session?.answers[question.id] === option.id}
                      onChange={() => answer(question.id, option.id)}
                      className="h-4 w-4 accent-[#373C38]"
                    />
                    {option.cells ? (
                      <>
                        <SpatialFigure
                          cells={option.cells}
                          label={`Pilihan ${String.fromCharCode(65 + i)}`}
                        />
                        <span className="text-sm font-semibold">
                          {String.fromCharCode(65 + i)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm leading-6">
                        <strong className="mr-2">
                          {String.fromCharCode(65 + i)}.
                        </strong>
                        {option.label}
                      </span>
                    )}
                  </label>
                ))}
              </fieldset>
              <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap sm:justify-between">
                <button
                  className="btn"
                  disabled={index === 0}
                  onClick={() => setIndex((i) => i - 1)}
                >
                  <ArrowLeft size={16} /> Sebelumnya
                </button>
                {index < questions.length - 1 ? (
                  <button
                    className="btn-primary"
                    onClick={() => setIndex((i) => i + 1)}
                  >
                    {session?.answers[question.id]
                      ? "Berikutnya"
                      : "Lewati dulu"}{" "}
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      const omitted = questions.filter(
                        (q) => !session?.answers[q.id],
                      ).length;
                      setConfirmation({
                        action: "finish",
                        title: "Selesaikan tahap ini?",
                        description: `${omitted ? `${omitted} soal belum dijawab dan akan mendapat nilai 0. ` : "Semua soal pada tahap ini sudah dijawab. "}Setelah melanjutkan, jawaban tahap ini tidak dapat diubah.`,
                        confirmLabel: "Ya, lanjut tahap berikutnya",
                      });
                    }}
                  >
                    Selesaikan tahap
                  </button>
                )}
              </div>
              <nav
                aria-label="Nomor soal"
                className="mt-7 flex flex-wrap gap-2 border-t border-ink/15 pt-5"
              >
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setIndex(i)}
                    aria-label={`Soal ${i + 1}${session?.answers[q.id] ? ", terjawab" : ", belum dijawab"}`}
                    aria-current={i === index ? "step" : undefined}
                    className={`h-10 w-10 rounded-xl border text-sm ${i === index ? "border-ink border-2 font-bold" : "border-ink/20"} ${session?.answers[q.id] ? "bg-sage" : "bg-white/60"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
              <p className="mt-3 text-xs">
                Hijau: terjawab. Klik nomor untuk meninjau kembali dalam tahap
                ini.
              </p>
            </GlassCard>
          )}
          {stage === 3 && koran && (
            <GlassCard>
              <div className="mb-6 flex flex-wrap justify-between gap-3">
                <h2 className="text-lg">Kolom {Math.min(column + 1, 4)} / 4</h2>
                <span className="font-mono font-semibold">
                  {clock(
                    secondsRemaining(
                      startedAt.current + (Math.min(column, 3) + 1) * 45000,
                      now,
                    ),
                  )}{" "}
                  pada kolom ini
                </span>
              </div>
              <p className="mb-6 text-sm leading-7">
                Jumlahkan dua angka yang ditandai. Masukkan digit satuan.
                Contoh: 9 + 4 → 3. Angka berikutnya memakai pasangan yang
                tumpang tindih.
              </p>
              <div className="mb-6 rounded-2xl bg-sage/40 p-4">
                <p className="text-sm font-semibold">
                  Progres:{" "}
                  {session?.koran.reduce((sum, c) => sum + c.answers.length, 0)}{" "}
                  /{" "}
                  {session?.koran.reduce(
                    (sum, c) => sum + c.digits.length - 1,
                    0,
                  )}{" "}
                  soal
                </p>
                <p className="mt-2 text-xs leading-6">
                  Maksimal 50 soal per kolom, termasuk yang dilewati. Input
                  berhenti saat kolom selesai; tunggu perpindahan otomatis agar
                  setiap kolom tetap berdurasi 45 detik.
                </p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                <KoranPair
                  digits={koran.digits}
                  row={row}
                  column={Math.min(column, 3)}
                  lastAnswer={koran.answers[row - 1]}
                />
                <div>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => (
                      <button
                        key={d}
                        aria-label={`Masukkan ${d}`}
                        disabled={column >= 4 || row >= koran.digits.length - 1}
                        onClick={() => inputDigit(d)}
                        className={`btn min-h-16 bg-white/80 text-xl font-bold ${d === 0 ? "col-start-2" : ""}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <button
                    className="btn mt-4 w-full"
                    onClick={() => inputDigit(null)}
                    disabled={column >= 4 || row >= koran.digits.length - 1}
                  >
                    Lewati pasangan ini
                  </button>
                  <p className="mt-3 text-xs leading-6">
                    Keyboard 0–9 atau tombol layar. Setiap input langsung
                    berpindah ke pasangan berikutnya.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-4 gap-2">
                {session?.koran.map((c, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-3 text-center text-xs ${column === i ? "bg-sage" : "bg-white/50"}`}
                  >
                    Kolom {i + 1}
                    <strong className="mt-2 block">
                      {c.answers.length} / {c.digits.length - 1} soal
                    </strong>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
          {stage === 4 && session && (
            <GlassCard>
              {index < 5 ? (
                <>
                  <p className="eyebrow mb-5">
                    PERNYATAAN {index * 5 + 1}–{index * 5 + 5} DARI 25
                  </p>
                  <div className="space-y-8">
                    {personalityPage.map((q) => (
                      <fieldset key={q.id}>
                        <legend className="mb-3 text-base font-semibold leading-7">
                          {q.text}
                        </legend>
                        <div className="grid gap-2 sm:grid-cols-5">
                          {likert.map((label, i) => (
                            <label
                              key={label}
                              className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs leading-5 sm:flex-col ${session.personality[q.id] === i + 1 ? "border-ink/50 bg-sage/70" : "border-ink/20 bg-white/70"}`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                checked={session.personality[q.id] === i + 1}
                                onChange={() =>
                                  setSession((s) =>
                                    s
                                      ? {
                                          ...s,
                                          personality: {
                                            ...s.personality,
                                            [q.id]: i + 1,
                                          },
                                        }
                                      : s,
                                  )
                                }
                                className="accent-[#373C38]"
                              />
                              <span>
                                <strong>{i + 1}.</strong> {label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                  <div className="mt-8 grid gap-3 sm:flex sm:justify-between">
                    <button
                      className="btn"
                      disabled={index === 0}
                      onClick={() => setIndex((i) => i - 1)}
                    >
                      Sebelumnya
                    </button>
                    <button
                      className="btn-primary"
                      disabled={personalityPage.some(
                        (q) => !session.personality[q.id],
                      )}
                      onClick={() => setIndex((i) => i + 1)}
                    >
                      {index === 4 ? "Lanjut proyektif" : "Berikutnya"}{" "}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="eyebrow mb-3">
                    BAGIAN TERAKHIR · RESPONS PROYEKTIF
                  </p>
                  <h2 className="text-2xl">Ceritakan dengan kata-katamu</h2>
                  <p className="my-4 text-sm leading-7">
                    Bagian ini opsional. Respons tidak menentukan skor atau
                    diagnosis; laporan menyajikan tulisan Anda untuk refleksi.
                    Jika login, tulisan ikut disimpan ke riwayat. Jangan
                    sertakan informasi pribadi sensitif.
                  </p>
                  <div className="space-y-7">
                    {projectivePrompts.map((prompt) => (
                      <div key={prompt.id}>
                        <label
                          htmlFor={prompt.id}
                          className="block text-sm font-semibold leading-7"
                        >
                          {prompt.text}
                        </label>
                        {prompt.id === "story" && <ProjectiveScene />}
                        <textarea
                          id={prompt.id}
                          maxLength={1500}
                          rows={4}
                          value={session.projective[prompt.id] || ""}
                          onChange={(e) =>
                            setSession((s) =>
                              s
                                ? {
                                    ...s,
                                    projective: {
                                      ...s.projective,
                                      [prompt.id]: e.target.value,
                                    },
                                  }
                                : s,
                            )
                          }
                          className="mt-3 w-full rounded-2xl border border-ink/30 bg-white/80 p-4 text-sm leading-7"
                          placeholder="Tulis respons Anda, atau biarkan kosong…"
                        />
                        <p className="text-right text-xs">
                          {session.projective[prompt.id]?.length || 0} / 1500
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:justify-between">
                    <button
                      className="btn"
                      disabled={busy}
                      onClick={() => setIndex(4)}
                    >
                      Tinjau kepribadian
                    </button>
                    <button
                      className="btn-primary"
                      disabled={loading || busy}
                      onClick={submit}
                    >
                      {busy
                        ? "Menyiapkan laporan…"
                        : "Selesaikan & lihat laporan"}{" "}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </GlassCard>
          )}
          {error && (
            <p role="alert" className="mt-5 rounded-xl bg-rose/60 p-4 text-sm">
              {error}
            </p>
          )}
        </>
      )}
      {session && !busy && (
        <button
          className="mt-7 inline-flex items-center gap-2 text-xs font-semibold"
          onClick={() =>
            setConfirmation({
              action: "restart",
              title: "Ulang seluruh rangkaian?",
              description:
                "Semua jawaban dan progres saat ini akan dihapus. Anda akan mulai dari tahap pertama dengan urutan soal baru.",
              confirmLabel: "Ya, ulang dari awal",
              cancelLabel: "Batalkan",
              destructive: true,
            })
          }
        >
          <RotateCcw size={14} /> Ulang seluruh rangkaian
        </button>
      )}
      <ConfirmModal
        confirmation={confirmation}
        onCancel={() => setConfirmation(null)}
        timerLabel={active && info.seconds ? clock(remaining) : undefined}
        onConfirm={() => {
          const pending = confirmation;
          setConfirmation(null);
          if (pending?.action === "finish") {
            endStage(Date.now() >= startedAt.current + info.seconds * 1000);
          } else if (pending?.action === "restart") {
            restart();
          } else if (pending?.action === "leave" && pending.href) {
            activeRef.current = false;
            setActive(false);
            router.push(pending.href);
          }
        }}
      />
      <p className="mt-5 text-xs leading-6 text-muted">
        Soal kemampuan diacak beserta pilihannya. Skala kepribadian tetap
        berurutan agar maknanya konsisten.
      </p>
    </div>
  );
}
