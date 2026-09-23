"use client";

import { useEffect, useId, useRef } from "react";
import { ArrowRight, CircleHelp, X } from "lucide-react";

export type Confirmation = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
};

export default function ConfirmModal({
  confirmation,
  onConfirm,
  onCancel,
  timerLabel,
}: {
  confirmation: Confirmation | null;
  onConfirm: () => void;
  onCancel: () => void;
  timerLabel?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const open = confirmation !== null;

  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    cancelButton.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-white/80 bg-white/95 p-0 text-ink shadow-glass backdrop-blur-lg backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      {confirmation && (
        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup konfirmasi"
            className="absolute right-4 top-4 rounded-xl p-2 transition-colors hover:bg-neutral/60"
          >
            <X size={20} />
          </button>
          <div
            className={`mb-5 inline-flex rounded-2xl p-3 ${confirmation.destructive ? "bg-rose/70" : "bg-sage/70"}`}
          >
            <CircleHelp size={28} strokeWidth={1.7} />
          </div>
          <h2 id={`${id}-title`} className="pr-6 text-2xl">
            {confirmation.title}
          </h2>
          <p
            id={`${id}-description`}
            className="mt-3 text-sm leading-7 text-muted"
          >
            {confirmation.description}
          </p>
          {timerLabel && (
            <p className="mt-4 rounded-xl bg-cream/60 px-4 py-3 text-xs leading-6">
              Timer tetap berjalan. Sisa waktu:{" "}
              <strong className="tabular-nums">{timerLabel}</strong>.
            </p>
          )}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              ref={cancelButton}
              type="button"
              onClick={onCancel}
              className="btn"
            >
              {confirmation.cancelLabel ?? "Kembali mengerjakan"}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={
                confirmation.destructive
                  ? "btn bg-rose/80 hover:bg-rose"
                  : "btn-primary"
              }
            >
              {confirmation.confirmLabel}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
