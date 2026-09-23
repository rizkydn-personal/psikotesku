"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-shell py-24">
      <h1 className="text-3xl">Halaman belum dapat dimuat</h1>
      <p className="my-5">Silakan coba kembali.</p>
      <button className="btn" onClick={reset}>
        Coba lagi
      </button>
    </div>
  );
}
