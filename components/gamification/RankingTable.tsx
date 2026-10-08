import { Flame, Trophy, Users } from "lucide-react";
import type { RankingEntry } from "@/hooks/useRanking";
import { cn } from "@/lib/utils";

export function RankingTable({ rows, meId }: { rows: RankingEntry[]; meId?: string }) {
  if (!rows.length) return (
    <div className="panel px-6 py-14 text-center">
      <Users className="mx-auto mb-4 h-8 w-8 text-ash" />
      <h2 className="text-lg font-semibold">O ranking começa com a turma</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ash">Ainda não há participantes. Os alunos cadastrados aparecerão aqui com seu progresso.</p>
    </div>
  );
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-bone/10 px-5 py-5 sm:px-6">
        <div><h2 className="text-lg font-semibold">Classificação geral</h2><p className="mt-1 text-sm text-ash">Ordenada pelo XP conquistado na semana.</p></div>
        <span className="rounded-full bg-bone/5 px-3 py-1 text-xs text-ash">{rows.length} {rows.length === 1 ? "participante" : "participantes"}</span>
      </div>
      <div aria-hidden="true" className="hidden grid-cols-[64px_minmax(0,1fr)_64px_100px_80px] gap-4 border-b border-bone/10 bg-bone/[0.025] px-6 py-3 text-xs font-semibold text-ash md:grid">
        <span>Posição</span><span>Participante</span><span>Nível</span><span className="text-right">XP semanal</span><span className="text-right">Ofensiva</span>
      </div>
      <ol aria-label="Classificação semanal">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className={cn(
              "grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-b border-bone/5 px-4 py-5 transition last:border-0 hover:bg-bone/[0.025] md:grid-cols-[64px_minmax(0,1fr)_64px_100px_80px] md:gap-4 md:px-6",
              r.id === meId && "bg-blood/[0.07] shadow-[inset_3px_0_0_#d71920]",
            )}
          >
            <span aria-label={`Posição ${i + 1}`} className={cn("flex items-center gap-2 text-base font-semibold tabular-nums", i === 0 ? "text-alert" : i < 3 ? "text-bone" : "text-ash")}>
              {i < 3 ? <Trophy className="hidden h-4 w-4 md:block" /> : null} {i + 1}
            </span>
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold text-bone sm:text-base">
                {r.name} {r.id === meId && <span className="ml-1 inline-block rounded-md bg-blood/15 px-2 py-0.5 align-middle text-[11px] font-medium text-red-300">Você</span>}
              </p>
              <p className="mt-1 text-xs text-ash md:hidden">
                Nível {r.level} · {r.streak} dias de ofensiva
              </p>
            </div>
            <span aria-label={`Nível ${r.level}`} className="hidden text-sm text-ash md:block">{String(r.level).padStart(2, "0")}</span>
            <span className="text-right text-sm font-semibold tabular-nums text-alert">{r.weeklyXp.toLocaleString("pt-BR")} <span className="text-xs font-normal">XP</span></span>
            <span aria-label={`${r.streak} dias de ofensiva`} className="hidden items-center justify-end gap-1.5 text-sm tabular-nums text-ash md:flex">
              <Flame className="h-4 w-4 text-orange-400" /> {r.streak}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
