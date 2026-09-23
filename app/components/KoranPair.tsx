export default function KoranPair({
  digits,
  row,
  column,
  lastAnswer,
}: {
  digits: number[];
  row: number;
  column: number;
  lastAnswer: number | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/80 p-6 text-center">
      <p className="text-xs font-semibold tracking-wide">
        PASANGAN {row + 1} · KOLOM {column + 1}
      </p>
      {row < digits.length - 1 ? (
        <>
          <p className="mb-5 mt-2 text-xs text-muted">
            Jumlahkan dua angka berikut
          </p>
          <div
            aria-label={`${digits[row]} ditambah ${digits[row + 1]}`}
            className="mx-auto grid w-40 grid-cols-[2rem_1fr] items-center gap-x-2 gap-y-3 font-sans text-5xl font-bold tabular-nums"
          >
            <span aria-hidden="true" />
            <span className="rounded-2xl border border-ink/20 bg-sage/60 py-3">
              {digits[row]}
            </span>
            <span aria-hidden="true" className="text-3xl font-normal">
              +
            </span>
            <span className="rounded-2xl border border-ink/20 bg-sage/60 py-3">
              {digits[row + 1]}
            </span>
            <span aria-hidden="true" className="col-span-2 h-px bg-ink/40" />
            <span aria-hidden="true" className="text-2xl font-normal">
              =
            </span>
            <span
              aria-label="Masukkan digit satuan"
              className="rounded-2xl border-2 border-dashed border-ink/30 py-3 text-3xl"
            >
              ?
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold">
            Masukkan digit satuannya saja
          </p>
          {row + 2 < digits.length && (
            <p className="mt-3 text-xs text-muted">
              Pasangan berikutnya:{" "}
              <span className="font-sans font-semibold tabular-nums">
                {digits[row + 1]} + {digits[row + 2]}
              </span>
            </p>
          )}
        </>
      ) : (
        <p className="my-8 text-sm leading-7">
          Batas {digits.length - 1} soal pada kolom ini tercapai. Input dikunci;
          tunggu timer untuk melanjutkan.
        </p>
      )}
      <div className="mt-5 border-t border-ink/10 pt-4 text-xs leading-6">
        <p>
          {row} / {digits.length - 1} soal selesai pada kolom ini.
        </p>
        {row > 0 && (
          <p>
            Input terakhir:{" "}
            <strong>{lastAnswer === null ? "Dilewati" : lastAnswer}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
