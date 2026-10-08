"use client";

import { useHawkins } from "@/hooks/useHawkins";
import { useRanking } from "@/hooks/useRanking";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { RankingTable } from "@/components/gamification/RankingTable";
import { ThemedLoader } from "@/components/hawkins/ThemedLoader";
import { ArrowRight, Flame, Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function RankingPage() {
  const { state } = useHawkins();
  const { rows, meId, loading, error, demo } = useRanking(state);
  const position = rows.findIndex((row) => row.id === meId);
  const me = position >= 0 ? rows[position] : undefined;
  return (
    <div className="space-y-6">
      <HawkinsHeader code="EVOLUÇÃO DOS AGENTES" title="Ranking da semana" subtitle="Cada desafio é um passo adiante. Acompanhe sua evolução nos últimos 7 dias.">
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-bone/10 bg-panel px-4 py-2 text-sm text-ash"><Trophy className="h-4 w-4 text-alert" /> Últimos 7 dias</span>
      </HawkinsHeader>
      {loading ? <ThemedLoader messages={["Carregando classificação..."]} /> : error ? (
        <div role="alert" className="panel-red p-6"><p>{error}</p><button onClick={() => window.location.reload()} className="btn-ghost mt-4">Tentar novamente</button></div>
      ) : <>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Sua posição", value: position >= 0 ? `${position + 1}º` : "—", icon: Trophy, color: "text-alert" },
            { label: "Seu XP na semana", value: me ? me.weeklyXp.toLocaleString("pt-BR") : "—", icon: Zap, color: "text-flare" },
            { label: "Dias de ofensiva", value: me ? String(me.streak) : "—", icon: Flame, color: "text-orange-400" },
            { label: "Participantes", value: String(rows.length), icon: Users, color: "text-sky-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="panel p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-2"><p className="text-sm text-ash">{label}</p><Icon className={`h-4 w-4 shrink-0 ${color}`} /></div>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
            </div>
          ))}
        </div>
        {demo && <p className="rounded-xl border border-bone/10 bg-bone/[0.025] px-5 py-4 text-sm leading-relaxed text-ash"><span className="font-semibold text-bone">Seu progresso local.</span> No modo demonstração, apenas você aparece aqui. O ranking da turma fica disponível ao conectar as contas dos alunos.</p>}
        <RankingTable rows={rows} meId={meId} />
        <div className="flex flex-col gap-4 rounded-2xl border border-blood/20 bg-blood/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-semibold">Seu próximo desafio espera por você</h2><p className="mt-1 text-sm text-ash">Explore os setores do laboratório e conquiste mais XP.</p></div>
          <Link href="/aluno/laboratorio" className="btn-primary shrink-0">Ir ao laboratório <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </>}
    </div>
  );
}
