"use client";

import { useRanking } from "@/hooks/useRanking";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { RankingTable } from "@/components/gamification/RankingTable";
import { ThemedLoader } from "@/components/hawkins/ThemedLoader";

export default function ProfessorRankingPage() {
  const { rows, loading, error, demo } = useRanking(null);
  return (
    <div>
      <HawkinsHeader code="CLASSIFICAÇÃO SEMANAL" title="Ranking da turma" subtitle="Acompanhe o XP conquistado pelos alunos nos últimos 7 dias." />
      {loading ? <ThemedLoader /> : error ? <p role="alert" className="panel-red p-6">{error}</p> : <>
        {demo && <p className="mb-6 text-sm text-ash">No modo demonstração, a turma começa vazia. Conecte o Supabase para acompanhar os alunos cadastrados.</p>}
        <RankingTable rows={rows} />
      </>}
    </div>
  );
}
