"use client";

import { useState, type FormEvent } from "react";
import { Check, Pencil, UserRound } from "lucide-react";
import { useApp } from "./Providers";
import { firebaseErrorCode, normalizeDisplayName } from "@/lib/firebaseErrors";

export default function ProfileEditor() {
  const { displayName, changeName } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const name = normalizeDisplayName(draft);
      await changeName(name);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      const code = firebaseErrorCode(err);
      setError(
        code === "network-request-failed"
          ? "Nama belum tersimpan. Periksa koneksi lalu coba lagi."
          : [
                "user-token-expired",
                "requires-recent-login",
                "user-disabled",
              ].includes(code)
            ? "Sesi akun perlu diperbarui. Keluar lalu masuk kembali."
            : code === "unknown" && err instanceof Error
              ? err.message
              : "Nama belum dapat disimpan. Silakan coba lagi.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <section
      aria-label="Profil Anda"
      className="mb-6 rounded-3xl border border-white/70 bg-white/60 p-5 sm:mb-8 sm:p-6"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-4">
        <span className="rounded-2xl bg-sage/60 p-3">
          <UserRound size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg">Nama tampilan</h2>
          <p className="mt-1 text-sm leading-6 text-muted [overflow-wrap:anywhere]">
            {displayName || "Belum diatur"}
          </p>
        </div>
        {!editing && (
          <button
            className="btn col-span-2 w-full sm:col-span-1 sm:w-auto"
            onClick={() => {
              setDraft(displayName);
              setError("");
              setSaved(false);
              setEditing(true);
            }}
          >
            <Pencil size={16} /> Ubah nama
          </button>
        )}
      </div>
      {editing && (
        <form onSubmit={submit} className="mt-5 max-w-xl">
          <label
            htmlFor="profile-name"
            className="mb-2 block text-sm font-semibold"
          >
            Nama yang ingin ditampilkan
          </label>
          <input
            autoFocus
            id="profile-name"
            name="name"
            autoComplete="name"
            required
            maxLength={60}
            disabled={saving}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-describedby={
              error
                ? "profile-name-help profile-name-error"
                : "profile-name-help"
            }
            aria-invalid={!!error}
            className="w-full rounded-2xl border border-ink/25 bg-white/80 px-4 py-3 text-base"
          />
          <p
            id="profile-name-help"
            className="mt-2 text-xs leading-6 text-muted"
          >
            Maksimal 60 karakter. Nama disimpan pada profil Psikotesku; nama
            akun Google Anda tidak diubah.
          </p>
          {error && (
            <p
              id="profile-name-error"
              role="alert"
              className="mt-3 rounded-xl bg-rose/40 p-3 text-sm"
            >
              {error}
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:flex">
            <button
              type="submit"
              disabled={saving || !draft.trim()}
              className="btn-primary"
            >
              {saving ? "Menyimpan…" : "Simpan nama"}
            </button>
            <button
              type="button"
              disabled={saving}
              className="btn"
              onClick={() => setEditing(false)}
            >
              Batal
            </button>
          </div>
        </form>
      )}
      {saved && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm">
          <Check size={16} /> Nama berhasil diperbarui.
        </p>
      )}
    </section>
  );
}
