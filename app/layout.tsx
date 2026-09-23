import type { Metadata } from "next";
import { Quicksand, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";
import Navbar from "./components/Navbar";
const heading = Quicksand({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});
const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Psikotesku — Ruang untuk mengenal diri",
  description:
    "Latihan verbal, numerik, spasial, ketelitian koran, dan kepribadian dalam satu rangkaian dengan hasil serta pembahasan.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body
        className={`${heading.variable} ${body.variable} font-sans antialiased`}
      >
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only">
            Lewati ke konten
          </a>
          <Navbar />
          <main id="main">{children}</main>
          <footer className="page-shell mt-16 flex flex-wrap justify-between gap-3 border-t border-ink/10 py-8 text-xs">
            <span>
              © {new Date().getFullYear()} Psikotesku. Tumbuh dengan mengenal
              diri.
            </span>
            <span>Dibuat dengan hangat, untuk setiap pribadi.</span>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
