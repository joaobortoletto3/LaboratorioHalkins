"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { Evidence } from "@/types";

/** Documento antigo com carimbos — evidência coletada (ou arquivo bloqueado). */
export function EvidenceCard({ evidence, unlocked, recorded, index }: { evidence: Evidence; unlocked: boolean; recorded?: string; index: number }) {
  const rot = [-1.5, 1.2, -0.8, 1.8, -1.2, 0.9, -1.8][index % 7];
  if (!unlocked) {
    return (
      <div className="panel flex min-h-[220px] flex-col items-center justify-center gap-3 border-dashed p-6 text-center">
        <Lock className="h-7 w-7 text-blood" />
        <p className="font-mono text-xs tracking-[0.25em] text-ash">{evidence.code}</p>
        <p className="font-mono text-[10px] tracking-[0.3em] text-blood">RESTRICTED ACCESS — ARQUIVO NÃO RECUPERADO</p>
      </div>
    );
  }
  return (
    <motion.article
      initial={{ opacity: 0, y: 16, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: rot }}
      whileHover={{ rotate: 0, scale: 1.02 }}
      transition={{ delay: index * 0.06 }}
      className="paper relative min-h-[220px] p-5 sm:p-6"
    >
      <div className="absolute -top-2 left-8 h-5 w-16 rotate-[-4deg] bg-[#d9cfa8]/80 shadow" aria-hidden />
      <p className="typewriter text-[10px] tracking-[0.3em] text-[#6b1010]">{evidence.code}</p>
      <h3 className="typewriter mt-2 text-lg font-semibold">{evidence.title}</h3>
      <p className="typewriter text-[10px] tracking-[0.25em] text-[#5a5143]">{evidence.subtitle}</p>
      <p className="mt-3 text-sm leading-relaxed text-[#2c271f]">{evidence.description}</p>
      <p className="typewriter mt-3 border-l-2 border-[#a01010]/50 pl-3 text-[13px] leading-relaxed">{evidence.content}</p>
      {recorded && (
        <p className="typewriter mt-3 inline-block bg-[#1d1a14] px-2 py-1 text-xs tracking-[0.2em] text-[#e8dfc8]">REGISTRO CALCULADO: {recorded}</p>
      )}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        {evidence.tag ? <span className="typewriter border border-[#1d1a14]/50 px-2 py-0.5 text-[10px] tracking-[0.3em]">MARCAÇÃO: {evidence.tag}</span> : <span />}
        {evidence.rare && <span className="typewriter text-[10px] tracking-[0.25em] text-[#a01010]">★ EVIDÊNCIA RARA</span>}
      </div>
      <span className="stamp absolute right-4 top-6 text-xs text-[#a01010]">{evidence.stamp}</span>
    </motion.article>
  );
}
