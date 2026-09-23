import type { ComponentPropsWithoutRef } from "react";
export default function GlassCard({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`min-w-0 rounded-3xl border border-white/50 bg-white/40 p-5 shadow-glass backdrop-blur-md sm:p-6 md:p-8 ${className}`}
      {...props}
    />
  );
}
