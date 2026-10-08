"use client";

import { useHawkins } from "@/hooks/useHawkins";
import { computeStats } from "@/lib/game";
import { formatDate, formatDuration } from "@/lib/dates";
import { levelTitle } from "@/lib/levels";
import { agentId, initials } from "@/lib/utils";
import { XPBar } from "@/components/gamification/XPBar";

export default function PerfilPage() {
  const { state } = useHawkins();
  if (!state) return null;
  const p = state.profile;
  const s = computeStats(state);
  const fields: [string, string][] = [
    ["NOME", p.name],
    ["ID", agentId(p.id)],
    ["E-MAIL", p.email],
    ["NÍVEL", `${String(p.level).padStart(2, "0")} — ${levelTitle(p.level)}`],
    ["XP", p.xp.toLocaleString("pt-BR")],
    ["OFENSIVA", `${p.currentStreak} dias`],
    ["MELHOR OFENSIVA", `${p.longestStreak} dias`],
    ["PRECISÃO", `${s.accuracy}%`],
    ["SALAS CONCLUÍDAS", `${s.completedRooms} / 7`],
    ["DESAFIOS", `${s.correct} resolvidos · ${s.attempts} tentativas`],
    ["TEMPO EM CAMPO", formatDuration(s.totalTime)],
    ["DATA DE ENTRADA", formatDate(p.createdAt)],
  ];
  return (
    <div className="mx-auto max-w-3xl">
      <article className="paper relative p-6 sm:p-10">
        <div className="flex flex-col gap-1 border-b-2 border-[#1d1a14] pb-4 text-center">
          <p className="typewriter text-xs tracking-[0.35em]">HAWKINS NATIONAL LABORATORY</p>
          <p className="typewriter text-xl font-semibold tracking-[0.25em]">PERSONNEL RECORD</p>
          <p className="typewriter text-[10px] tracking-[0.3em] text-[#5a5143]">U.S. DEPARTMENT OF ENERGY · FORM HNL-11</p>
        </div>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row">
          <div className="mx-auto flex h-40 w-32 shrink-0 flex-col items-center justify-center border-2 border-[#1d1a14] bg-[#cfc5a9] sm:mx-0">
            {p.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatarUrl} alt={p.name} className="h-full w-full object-cover grayscale" />
            ) : (
              <span className="typewriter text-4xl font-bold text-[#1d1a14]">{initials(p.name)}</span>
            )}
          </div>
          <dl className="grid flex-1 grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {fields.map(([k, v]) => (
              <div key={k} className="border-b border-dashed border-[#1d1a14]/40 pb-1">
                <dt className="typewriter text-[10px] tracking-[0.25em] text-[#5a5143]">{k}</dt>
                <dd className="typewriter break-words text-sm font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <span className="stamp absolute right-6 top-24 text-sm text-[#a01010] sm:right-10">CONFIDENTIAL</span>
        {state.caseClosedAt && <span className="stamp absolute bottom-8 left-8 text-sm text-[#1a5a1a]">CASE 011 CLOSED</span>}
      </article>
      <div className="panel mt-6 p-5">
        <XPBar xp={p.xp} />
      </div>
    </div>
  );
}
