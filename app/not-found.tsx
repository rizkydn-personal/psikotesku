import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page-shell py-24">
      <h1 className="text-4xl">Halaman tidak ditemukan</h1>
      <Link className="btn mt-7" href="/">
        Kembali ke beranda
      </Link>
    </div>
  );
}
