"use client";

import { motion } from "framer-motion";

/** Gráfico de barras leve (sem dependências) com animação. */
export function BarChart({ data, color = "bg-flare", suffix = "" }: { data: { label: string; value: number }[]; color?: string; suffix?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-48 items-end gap-2 sm:gap-3">
      {data.map((d, i) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="font-mono text-[10px] text-bone">
            {d.value}
            {suffix}
          </span>
          <motion.div
            className={`w-full ${color} shadow-glow-sm`}
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ duration: 0.9, delay: i * 0.05 }}
            style={{ minHeight: d.value > 0 ? 2 : 0 }}
          />
          <span className="w-full truncate text-center font-mono text-[9px] tracking-[0.1em] text-ash">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
