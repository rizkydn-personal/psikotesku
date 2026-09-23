"use client";
import Link from "next/link";
import { Sprout } from "lucide-react";
import AuthButton from "./AuthButton";
import { useApp } from "./Providers";
export default function Navbar() {
  const { error } = useApp();
  return (
    <>
      <header className="border-b border-white/50 bg-white/30">
        <nav
          aria-label="Navigasi utama"
          className="page-shell flex min-h-20 flex-wrap items-center justify-between gap-3 py-4 sm:min-h-24"
        >
          <Link href="/" className="flex items-center gap-2">
            <span className="rounded-2xl bg-sage p-2.5">
              <Sprout size={26} />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">
              psikotes<span className="font-normal">ku.</span>
              <span className="block text-[9px] tracking-[0.21em]">
                PSIKOTES PROFESIONAL
              </span>
            </span>
          </Link>
          <div className="flex w-full items-center justify-between gap-3 border-t border-ink/10 pt-3 sm:w-auto sm:justify-end sm:gap-7 sm:border-0 sm:pt-0">
            <Link
              href="/#pilih-tes"
              className="inline-flex min-h-11 items-center text-xs sm:text-sm"
            >
              Jelajahi tes
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center text-xs sm:text-sm"
            >
              Riwayat
            </Link>
            <AuthButton />
          </div>
        </nav>
      </header>
      {error && (
        <p role="alert" className="page-shell py-3 text-sm">
          {error}
        </p>
      )}
    </>
  );
}
