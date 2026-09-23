"use client";
import { useState, type RefObject } from "react";
import { Download, FileText } from "lucide-react";
export default function DownloadButtons({
  target,
  id,
}: {
  target: RefObject<HTMLDivElement | null>;
  id: string;
}) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  async function download(format: "png" | "pdf") {
    if (!target.current) return;
    setBusy(format);
    setError("");
    try {
      await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      // Capture each report sheet separately: preserve readable text and bounded canvas size.
      const sheets = Array.from(
        target.current.querySelectorAll<HTMLElement>("[data-report-page]"),
      );
      const elements = sheets.length ? sheets : [target.current];
      const captures: { data: string; width: number; height: number }[] = [];
      for (const element of elements) {
        // Render a fixed-width copy so phone exports do not shrink long mobile sheets.
        const copy = element.cloneNode(true) as HTMLElement;
        const host = document.createElement("div");
        host.setAttribute("aria-hidden", "true");
        Object.assign(host.style, {
          position: "fixed",
          left: "-10000px",
          top: "0",
          width: "794px",
          pointerEvents: "none",
        });
        host.appendChild(copy);
        document.body.appendChild(host);
        try {
          const data = await toPng(copy, {
            pixelRatio: 2,
            backgroundColor: "#F6E7C6",
            cacheBust: true,
          });
          const img = new Image();
          img.src = data;
          await img.decode();
          captures.push({
            data,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        } finally {
          host.remove();
        }
      }
      if (format === "png") {
        // A single PNG keeps all sheets together; cap pixels for mobile canvas limits.
        const width = Math.min(1400, Math.max(...captures.map((c) => c.width)));
        const totalHeight = captures.reduce(
          (n, c) => n + (c.height / c.width) * width,
          0,
        );
        const scale = Math.min(
          1,
          12000 / totalHeight,
          Math.sqrt(16000000 / (width * totalHeight)),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * scale);
        canvas.height = Math.ceil(totalHeight * scale);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas unavailable");
        context.fillStyle = "#F6E7C6";
        context.fillRect(0, 0, canvas.width, canvas.height);
        let top = 0;
        for (const capture of captures) {
          const img = new Image();
          img.src = capture.data;
          await img.decode();
          const h = (capture.height / capture.width) * canvas.width;
          context.drawImage(img, 0, top, canvas.width, h);
          top += h;
        }
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("PNG failed"))),
            "image/png",
          ),
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `psikotesku-${id}.png`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      } else {
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF();
        let page = 0;
        for (const capture of captures) {
          const img = new Image();
          img.src = capture.data;
          await img.decode();
          const pagePixelHeight = Math.floor((capture.width * 273) / 186);
          for (let top = 0; top < capture.height; top += pagePixelHeight) {
            if (page++) pdf.addPage();
            const canvas = document.createElement("canvas");
            canvas.width = capture.width;
            canvas.height = Math.min(pagePixelHeight, capture.height - top);
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Canvas unavailable");
            context.drawImage(
              img,
              0,
              top,
              capture.width,
              canvas.height,
              0,
              0,
              capture.width,
              canvas.height,
            );
            pdf.addImage(
              canvas.toDataURL("image/png"),
              "PNG",
              12,
              10,
              186,
              (canvas.height / capture.width) * 186,
            );
            pdf.setFontSize(8);
            pdf.setTextColor("#373C38");
            pdf.text(`Psikotesku | ${id} | ${page}`, 12, 290);
          }
        }
        pdf.save(`psikotesku-${id}.pdf`);
      }
    } catch {
      setError(
        "Unduhan belum berhasil. Coba ulang; gunakan PDF untuk laporan panjang atau browser desktop.",
      );
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap">
        <button
          disabled={!!busy}
          onClick={() => download("png")}
          className="btn"
        >
          <Download size={16} />
          {busy === "png" ? "Menyiapkan…" : "Download PNG"}
        </button>
        <button
          disabled={!!busy}
          onClick={() => download("pdf")}
          className="btn-primary"
        >
          <FileText size={16} />
          {busy === "pdf" ? "Menyiapkan…" : "Download PDF"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm">
          {error}
        </p>
      )}
    </>
  );
}
