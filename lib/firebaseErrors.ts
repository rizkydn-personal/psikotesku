export function firebaseErrorCode(error: unknown): string {
  if (typeof error !== "object" || error === null || !("code" in error))
    return "unknown";
  return String(error.code).replace(/^(firestore|auth)\//, "");
}

export function historyError(error: unknown) {
  const code = firebaseErrorCode(error);
  const messages: Record<string, string> = {
    "permission-denied":
      "Akses riwayat ditolak oleh Firebase. Pengelola perlu memeriksa aturan akses Firestore pada proyek yang digunakan aplikasi ini.",
    unauthenticated:
      "Sesi login tidak lagi valid. Keluar lalu masuk kembali untuk memuat riwayat.",
    unavailable:
      "Server riwayat belum dapat dihubungi. Periksa koneksi internet lalu coba lagi.",
    "deadline-exceeded":
      "Server belum merespons. Periksa koneksi internet lalu coba lagi.",
    "failed-precondition":
      "Database riwayat belum siap. Pengelola perlu memeriksa konfigurasi atau indeks Firestore.",
    "not-found":
      "Database riwayat tidak ditemukan. Pengelola perlu memeriksa proyek dan database Firestore.",
    "resource-exhausted":
      "Layanan riwayat sedang mencapai batas penggunaan. Silakan coba kembali nanti.",
  };
  return {
    code,
    message:
      messages[code] ||
      "Riwayat belum dapat dimuat. Silakan coba lagi; jika berulang, sampaikan kode kendala kepada pengelola.",
  };
}

export function normalizeDisplayName(value: string) {
  const name = value.normalize("NFC").replace(/\s+/gu, " ").trim();
  if (
    !name ||
    name.length > 60 ||
    /[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/u.test(name)
  ) {
    throw new Error("Nama harus berisi 1–60 karakter yang terlihat.");
  }
  return name;
}
