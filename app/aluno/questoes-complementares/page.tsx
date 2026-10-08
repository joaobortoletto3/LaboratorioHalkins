"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, RefreshCw } from "lucide-react";
import { useHawkins } from "@/hooks/useHawkins";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { ChallengePanel } from "@/components/challenges/ChallengePanel";
import { LivesCounter } from "@/components/gamification/LivesCounter";
import { ThemedLoader } from "@/components/hawkins/ThemedLoader";
import { complementaryChallenge, isComplementaryChallenge } from "@/lib/complementary";
import type { Challenge, TeacherChallenge } from "@/types";

export default function QuestoesComplementaresPage() {
  const { state, mode } = useHawkins();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/challenges", { cache: "no-store", signal });
      const json = await res.json() as { mode?: string; challenges?: Challenge[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Não foi possível carregar as questões.");
      if (json.mode === "demo") {
        const items = JSON.parse(localStorage.getItem("hawkins_teacher_challenges_v1") ?? "[]") as TeacherChallenge[];
        setChallenges(items.filter((c) => c.active && isComplementaryChallenge(c.id)).sort((a, b) => a.orderIndex - b.orderIndex).map(complementaryChallenge));
      } else {
        setChallenges(json.challenges ?? []);
      }
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : "Não foi possível carregar as questões.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  if (!state) return null;
  const completed = new Set(state.attempts.filter((a) => a.correct).map((a) => a.challengeId));
  const resolved = challenges.filter((c) => completed.has(c.id)).length;

  return (
    <div>
      <HawkinsHeader code="ATIVIDADES DO PROFESSOR" title="Questões Complementares" subtitle="Resolva os desafios criados pelo professor para ganhar experiência e recuperar corações.">
        <LivesCounter lives={state.profile.lives} />
      </HawkinsHeader>
      <div className="panel mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm text-bone"><Heart aria-hidden="true" className="h-4 w-4 text-flare" /> Cada questão correta recupera 1 coração, até o limite de 5.</p>
          <p className="mt-2 text-sm text-ash">O XP e o coração são concedidos uma vez por questão. Erros não consomem corações. Você pode responder mesmo com zero corações.</p>
          {!loading && !error && <p className="mt-2 font-mono text-xs text-term">{resolved} de {challenges.length} questões resolvidas</p>}
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="btn-ghost shrink-0"><RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" /> ATUALIZAR</button>
      </div>
      {mode === "demo" && <p className="mb-6 border border-alert/30 bg-alert/5 p-4 text-sm text-alert">No modo demo, aparecem os desafios criados neste navegador. Configure o Supabase para compartilhar as questões com os alunos, validar respostas e salvar recompensas.</p>}
      {loading ? <ThemedLoader /> : error ? (
        <p role="alert" className="panel-red p-6 text-flare">{error}</p>
      ) : challenges.length === 0 ? (
        <div className="panel p-8 text-center"><h2 className="font-serif text-xl text-bone">Nenhuma questão disponível</h2><p className="mt-2 text-sm text-ash">As questões aparecerão aqui quando o professor cadastrar e ativar novos desafios.</p></div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {challenges.map((challenge) => <ChallengePanel key={challenge.id} challenge={challenge} completed={completed.has(challenge.id)} unavailable={mode === "demo" ? "A validação dos desafios do professor requer o Supabase configurado." : undefined} />)}
        </div>
      )}
    </div>
  );
}
