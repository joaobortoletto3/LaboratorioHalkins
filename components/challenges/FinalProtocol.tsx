"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Challenge, Room } from "@/types";
import { useHawkins } from "@/hooks/useHawkins";
import { playSound } from "@/hooks/useSound";
import { correctAnswerFor } from "@/lib/game";
import { PortalEffect } from "@/components/hawkins/PortalEffect";
import { ChallengePanel } from "./ChallengePanel";
import { RoomAtmosphere } from "@/components/laboratory/RoomAtmosphere";

const STAGES = [87, 54, 21, 0];

/** PROTOCOLO 011 — desafio final que combina os registros recuperados. */
export function FinalProtocol({ room, challenge }: { room: Room; challenge: Challenge }) {
  const router = useRouter();
  const { state } = useHawkins();
  const [stability, setStability] = useState(23);
  const [phase, setPhase] = useState<"open" | "closing" | "closed">(state?.rooms[room.id]?.status === "concluido" ? "closed" : "open");

  const records = useMemo(() => {
    if (!state) return [];
    const list = [
      { from: "Sala de Controle", value: correctAnswerFor(state, "c-01") },
      { from: "Depósito Experimental", value: correctAnswerFor(state, "c-02") },
      { from: "Tanque de Isolamento", value: correctAnswerFor(state, "c-03") },
      { from: "Câmara de Testes", value: correctAnswerFor(state, "c-04") },
      { from: "Sala de Observação", value: correctAnswerFor(state, "c-05") },
      { from: "Setor Subterrâneo", value: correctAnswerFor(state, "c-06") },
      { from: "Crachá encontrado", value: state.evidences.includes("ev-006") ? "7B" : undefined },
    ];
    return list.filter((r): r is { from: string; value: string } => Boolean(r.value)).sort((a, b) => a.value.localeCompare(b.value));
  }, [state]);

  useEffect(() => {
    if (phase !== "closing") return;
    playSound("alarm");
    const timers = STAGES.map((s, i) => setTimeout(() => setStability(s), 900 * (i + 1)));
    timers.push(setTimeout(() => setPhase("closed"), 900 * (STAGES.length + 1)));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  return (
    <RoomAtmosphere theme="portal">
      <div className="text-center">
        <p className="glitch font-mono text-xs tracking-[0.4em] text-flare" data-text="UNKNOWN DIMENSIONAL SIGNAL">
          UNKNOWN DIMENSIONAL SIGNAL
        </p>
        <h1 className="title-outline mt-3 text-4xl sm:text-6xl">PORTAL DIMENSIONAL</h1>
      </div>

      <div className={`relative my-8 ${phase === "closing" ? "flicker-hard" : ""}`}>
        <PortalEffect stability={phase === "closed" ? 0 : stability} closing={phase !== "open"} size={380} />
        <div className="mt-4 text-center font-mono">
          <p className="text-[11px] tracking-[0.35em] text-ash">PORTAL STABILITY</p>
          <motion.p key={stability} initial={{ scale: 1.3, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="text-4xl font-bold text-flare">
            {phase === "closed" ? 0 : stability}%
          </motion.p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "open" && (
          <motion.div key="open" exit={{ opacity: 0 }} className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="paper relative rotate-[-1deg] p-6">
                <p className="typewriter text-[10px] tracking-[0.3em] text-[#6b1010]">DOCUMENTO RECUPERADO · PROTOCOLO 011</p>
                <div className="typewriter mt-4 space-y-2 text-xl font-semibold">
                  {challenge.story.map((w) => (
                    <p key={w}>{w}</p>
                  ))}
                </div>
                <p className="typewriter mt-4 text-xs text-[#3a342a]">— M.E.</p>
                <span className="stamp absolute right-4 top-6 text-xs text-[#a01010]">TOP SECRET</span>
              </div>
              <div className="panel p-5">
                <p className="label mb-3">REGISTROS RECUPERADOS (FORA DE ORDEM)</p>
                {records.length === 0 ? (
                  <p className="text-sm text-ash">Nenhum registro disponível.</p>
                ) : (
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {records.map((r) => (
                      <li key={r.from} className="border border-blood/30 bg-void/60 p-2 text-center">
                        <p className="font-mono text-lg text-bone">{r.value}</p>
                        <p className="text-[10px] text-ash">{r.from}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <ChallengePanel challenge={challenge} completed={false} tone="red" onCorrect={() => setPhase("closing")} />
          </motion.div>
        )}
        {phase === "closing" && (
          <motion.div key="closing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center font-mono">
            <p className="text-2xl font-semibold tracking-[0.3em] text-term">SEQUENCE ACCEPTED</p>
            <p className="blink mt-2 tracking-[0.3em] text-flare">INITIATING CONTAINMENT...</p>
          </motion.div>
        )}
        {phase === "closed" && (
          <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="text-center">
            <p className="font-mono text-3xl font-semibold tracking-[0.35em] text-bone">PORTAL CLOSED</p>
            <button onClick={() => router.push("/aluno/caso-concluido")} className="btn-primary mt-8">
              ABRIR RELATÓRIO DO INCIDENTE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </RoomAtmosphere>
  );
}
