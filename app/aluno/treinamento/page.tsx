"use client";

import Link from "next/link";
import { useHawkins } from "@/hooks/useHawkins";
import { TRAINING_CHALLENGES } from "@/lib/data/rooms";
import { MAX_LIVES } from "@/lib/game";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { ChallengePanel } from "@/components/challenges/ChallengePanel";
import { LivesCounter } from "@/components/gamification/LivesCounter";

export default function TreinamentoPage() {
  const { state } = useHawkins();
  if (!state) return null;
  const lives = state.profile.lives;
  return (
    <div>
      <HawkinsHeader code="PROTOCOLO DE TREINAMENTO" title="Simulações de Revisão" subtitle="Cada simulação resolvida restaura uma tentativa. Use este protocolo para recalibrar seus cálculos.">
        <LivesCounter lives={lives} />
      </HawkinsHeader>
      {lives >= MAX_LIVES && (
        <div className="mb-6 flex flex-col items-start gap-3 border border-term/40 bg-term/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-sm text-term">TENTATIVAS COMPLETAS. Você pode voltar à investigação.</p>
          <Link href="/aluno/laboratorio" className="btn-term !py-2 !text-xs">
            VOLTAR AO LABORATÓRIO
          </Link>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        {TRAINING_CHALLENGES.map((c) => (
          <ChallengePanel key={c.id} challenge={c} completed={false} />
        ))}
      </div>
    </div>
  );
}
