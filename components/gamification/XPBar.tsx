"use client";

import { motion } from "framer-motion";
import { levelProgress } from "@/lib/levels";

export function XPBar({ xp, compact = false }: { xp: number; compact?: boolean }) {
  const p = levelProgress(xp);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between font-mono text-[11px] tracking-[0.15em] text-ash">
        <span>XP</span>
        <span className="text-bone">
          {xp.toLocaleString("pt-BR")} / {p.next.toLocaleString("pt-BR")} XP
        </span>
      </div>
      <div className={`relative overflow-hidden bg-bone/5 ${compact ? "h-1.5" : "h-2.5"}`}>
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-rust via-blood to-flare shadow-glow-sm"
          initial={{ width: 0 }}
          animate={{ width: `${p.pct}%` }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
