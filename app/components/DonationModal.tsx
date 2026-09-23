"use client";
import { useEffect, useRef, useState } from "react";
import { Coffee, Copy, X } from "lucide-react";
export default function DonationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState("");
  const bank = process.env.NEXT_PUBLIC_DONATION_BANK;
  const account = process.env.NEXT_PUBLIC_DONATION_ACCOUNT;
  const name = process.env.NEXT_PUBLIC_DONATION_NAME;
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
        dialog.current?.close();
      };
    }
    dialog.current?.close();
  }, [open]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(account!);
      setMessage("Nomor berhasil disalin.");
    } catch {
      setMessage(
        "Tidak dapat menyalin otomatis. Silakan salin nomor secara manual.",
      );
    }
  }
  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="donation-title"
      className="w-[calc(100%-2rem)] max-w-md rounded-3xl border border-white/50 bg-cream/90 p-0 text-ink shadow-glass backdrop-blur-md backdrop:bg-ink/30 backdrop:backdrop-blur-sm"
    >
      <div className="relative p-8">
        <button
          autoFocus
          onClick={onClose}
          aria-label="Tutup donasi"
          className="btn absolute right-3 top-3 !min-h-10 !p-2"
        >
          <X size={18} />
        </button>
        <Coffee size={42} className="mb-6" />
        <h2 id="donation-title" className="text-2xl">
          Give me a Kopi
        </h2>
        <p className="my-4 text-sm leading-7">
          Terima kasih sudah bertumbuh bersama kami. Secangkir kopi dari Anda
          membantu ruang ini terus hadir.
        </p>
        {bank && account && name ? (
          <div className="rounded-2xl bg-white/50 p-5">
            <p className="eyebrow">{bank}</p>
            <div className="my-3 flex items-center justify-between gap-3">
              <span className="break-all font-semibold select-all">
                {account}
              </span>
              <button
                className="btn !p-3"
                aria-label="Salin nomor rekening"
                onClick={copy}
              >
                <Copy size={17} />
              </button>
            </div>
            <p className="text-sm">Atas nama: {name}</p>
          </div>
        ) : (
          <p className="rounded-2xl bg-white/50 p-5 text-sm">
            Informasi rekening donasi belum tersedia. Terima kasih atas niat
            baik Anda!
          </p>
        )}
        <p role="status" className="mt-3 text-xs">
          {message}
        </p>
        <p className="mt-5 text-xs">
          Dukungan sepenuhnya sukarela. Semua tes tetap gratis.
        </p>
      </div>
    </dialog>
  );
}
