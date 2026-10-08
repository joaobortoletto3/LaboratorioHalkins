"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useHawkins } from "@/hooks/useHawkins";
import { computeStats } from "@/lib/game";
import { formatDuration } from "@/lib/dates";
import { levelTitle } from "@/lib/levels";
import { ACHIEVEMENTS } from "@/lib/data/achievements";
import { EVIDENCES } from "@/lib/data/evidences";

export default function CasoConcluidoPage() {
  const { state } = useHawkins();
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = [1500, 3500, 5500, 8500, 11500].map((t, i) => setTimeout(() => setStep(i + 1), t));
    return () => timers.forEach(clearTimeout);
  }, []);
  if (!state) return null;

  if (!state.caseClosedAt) {
    return (
      <div className="panel-red p-10 text-center">
        <p className="title-solid text-3xl">ARQUIVO INCOMPLETO</p>
        <p className="mt-2 text-ash">O relatório final só é gerado após o Protocolo 011.</p>
        <Link href="/aluno/laboratorio" className="btn-primary mt-6">
          VOLTAR AO LABORATÓRIO
        </Link>
      </div>
    );
  }

  const s = computeStats(state);
  const p = state.profile;
  const stats: [string, string][] = [
    ["XP TOTAL", p.xp.toLocaleString("pt-BR")],
    ["PRECISÃO", `${s.accuracy}%`],
    ["TEMPO", formatDuration(s.totalTime)],
    ["ERROS", String(s.errors)],
    ["EVIDÊNCIAS", `${state.evidences.length}/${EVIDENCES.length}`],
    ["NÍVEL", `${p.level} · ${levelTitle(p.level)}`],
    ["OFENSIVA", `${p.currentStreak} dias`],
    ["CONQUISTAS", `${state.achievements.length}/${ACHIEVEMENTS.length}`],
  ];

  const fade = (n: number) => ({ initial: { opacity: 0 }, animate: { opacity: step >= n ? 1 : 0 }, transition: { duration: 1.6 } });

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-void">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
        <motion.p {...fade(1)} className="font-mono text-xs tracking-[0.4em] text-ash">
          HAWKINS NATIONAL LABORATORY
        </motion.p>
        <motion.h1 {...fade(1)} className="mt-2 font-mono text-2xl tracking-[0.3em] text-bone sm:text-3xl">
          INCIDENT REPORT
        </motion.h1>
        <motion.div {...fade(2)} className="mt-6 font-mono">
          <p className="text-xs tracking-[0.3em] text-ash">STATUS:</p>
          <p className="text-3xl font-bold tracking-[0.35em] text-term">CONTAINED</p>
        </motion.div>

        <motion.div {...fade(3)} className="crt mt-10 w-full p-6 text-left">
          <p className="crt-text font-mono text-[10px] tracking-[0.3em] opacity-70">ÚLTIMA TRANSMISSÃO · ORIGEM DESCONHECIDA · 03:11</p>
          <p className="crt-text mt-3 font-mono text-base leading-relaxed sm:text-lg">
            “Se você encontrou isso, o experimento não acabou. Apenas conseguimos fechar o primeiro portal.”
          </p>
          <p className="crt-text mt-3 font-mono text-sm opacity-70">— Dr. M. Ellison [SINAL INTERROMPIDO]</p>
        </motion.div>

        <motion.p {...fade(4)} className="title-outline mt-12 text-5xl sm:text-7xl">
          CASO ENCERRADO
        </motion.p>

        <motion.div {...fade(5)} className="mt-10 w-full">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(([k, v]) => (
              <div key={k} className="panel p-4">
                <p className="label !text-[9px]">{k}</p>
                <p className="mt-1 font-mono text-sm font-semibold text-bone">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {state.achievements.map((a) => (
              <span key={a} className="border border-alert/40 px-2 py-1 font-mono text-[10px] tracking-[0.2em] text-alert">
                {ACHIEVEMENTS.find((x) => x.id === a)?.title}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/aluno/dashboard" className="btn-primary">
              VOLTAR AO PAINEL
            </Link>
            <Link href="/aluno/evidencias" className="btn-ghost">
              REVER EVIDÊNCIAS
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
