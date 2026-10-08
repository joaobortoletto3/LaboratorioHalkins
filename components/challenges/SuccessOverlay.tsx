"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import type { GameEvent } from "@/types";
import { getEvidence } from "@/lib/data/evidences";
import { getRoom } from "@/lib/data/rooms";

/** Tela de "ACCESS GRANTED" com recompensas, exibida ao concluir uma sala. */
export function SuccessOverlay({ open, events, onClose, warning }: { open: boolean; events: GameEvent[]; onClose: () => void; warning?: boolean }) {
  const xp = events.filter((e): e is Extract<GameEvent, { type: "xp" }> => e.type === "xp");
  const total = xp.reduce((a, e) => a + e.amount, 0);
  const ev = events.find((e): e is Extract<GameEvent, { type: "evidence" }> => e.type === "evidence");
  const unlock = events.find((e): e is Extract<GameEvent, { type: "unlock" }> => e.type === "unlock");
  const evidence = ev ? getEvidence(ev.evidenceId) : undefined;
  const next = unlock ? getRoom(unlock.roomId) : undefined;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[85] flex items-center justify-center bg-void/90 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {warning && <div className="flicker-hard pointer-events-none absolute inset-0 bg-rust/40" />}
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="crt relative w-full max-w-lg overflow-hidden p-6 sm:p-8">
            <div className="crt-lines pointer-events-none absolute inset-0" />
            {warning ? (
              <div className="relative mb-5 border border-flare bg-rust/30 p-3 text-center font-mono">
                <p className="text-lg font-semibold tracking-[0.3em] text-flare blink">WARNING</p>
                <p className="text-xs tracking-[0.2em] text-flare">DIMENSIONAL ACTIVITY DETECTED</p>
              </div>
            ) : null}
            <p className="crt-text relative text-center font-mono text-2xl font-semibold tracking-[0.3em] sm:text-3xl">ACCESS GRANTED</p>
            <motion.p initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="relative mt-4 text-center font-mono text-4xl font-bold text-alert">
              +{total} XP
            </motion.p>
            <ul className="relative mt-3 space-y-1 text-center font-mono text-xs text-term/80">
              {xp.map((x, i) => (
                <li key={i}>
                  +{x.amount} · {x.label}
                </li>
              ))}
            </ul>
            {evidence && (
              <motion.div initial={{ opacity: 0, rotate: -4, y: 20 }} animate={{ opacity: 1, rotate: -2, y: 0 }} transition={{ delay: 0.6 }} className="paper relative mt-6 p-4">
                <p className="typewriter text-[10px] tracking-[0.25em] text-[#6b1010]">{evidence.code} · NOVA EVIDÊNCIA</p>
                <p className="typewriter mt-1 font-semibold">{evidence.title}</p>
                <p className="mt-1 text-xs text-[#3a342a]">{evidence.description}</p>
                <span className="stamp absolute right-3 top-3 text-[10px] text-[#a01010]">{evidence.stamp}</span>
              </motion.div>
            )}
            {next && <p className="crt-text relative mt-5 text-center font-mono text-xs tracking-[0.2em]">NOVO SETOR LIBERADO: {next.name.toUpperCase()}</p>}
            <div className="relative mt-6 flex flex-col gap-2 sm:flex-row">
              {next ? (
                <Link href={`/aluno/sala/${next.id}`} className="btn-term flex-1">
                  PRÓXIMO SETOR
                </Link>
              ) : null}
              <Link href="/aluno/laboratorio" className="btn-ghost flex-1 !border-term/30 !text-term" onClick={onClose}>
                MAPA
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
