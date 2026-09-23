export default function SpatialFigure({
  cells,
  label = "Pola",
}: {
  cells: number[];
  label?: string;
}) {
  const positions = cells.flatMap((value, i) =>
    value ? [`baris ${Math.floor(i / 3) + 1} kolom ${(i % 3) + 1}`] : [],
  );
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${label}: kotak terisi pada ${positions.join(", ")}`}
      className="h-auto w-24 max-w-full shrink-0 sm:w-28"
    >
      <rect width="100" height="100" rx="8" fill="#FFFFFF" />
      {cells.map((value, i) => (
        <rect
          key={i}
          x={5 + (i % 3) * 30}
          y={5 + Math.floor(i / 3) * 30}
          width="28"
          height="28"
          rx="2"
          fill={value ? "#373C38" : "#F6E7C6"}
          stroke="#807E79"
          strokeWidth="0.7"
        />
      ))}
    </svg>
  );
}
