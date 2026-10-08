"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flame, Search } from "lucide-react";
import type { StudentSummary } from "@/types";
import { formatDateTime } from "@/lib/dates";

type SortKey = "name" | "xp" | "progress" | "accuracy" | "errors" | "streak";

export function StudentTable({ students }: { students: StudentSummary[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("xp");
  const rows = useMemo(() => {
    const f = students.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.email.toLowerCase().includes(q.toLowerCase()));
    return [...f].sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : (b[sort] as number) - (a[sort] as number)));
  }, [students, q, sort]);

  const Th = ({ k, children }: { k?: SortKey; children: React.ReactNode }) => (
    <th className="whitespace-nowrap px-3 py-3 text-left font-mono text-[10px] font-normal tracking-[0.2em] text-ash">
      {k ? (
        <button onClick={() => setSort(k)} className={sort === k ? "text-flare" : "hover:text-bone"}>
          {children}
        </button>
      ) : (
        children
      )}
    </th>
  );

  return (
    <div>
      <label className="relative mb-4 block max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
        <input className="input pl-9" placeholder="Buscar agente..." value={q} onChange={(e) => setQ(e.target.value)} />
      </label>

      {/* Mobile: cards */}
      <div className="grid gap-3 md:hidden">
        {rows.map((s) => (
          <Link key={s.id} href={`/professor/alunos/${s.id}`} className="panel block p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-bone">{s.name}</p>
              <span className="font-mono text-sm text-alert">{s.xp} XP</span>
            </div>
            <p className="mt-1 text-xs text-ash">
              NV {s.level} · {s.currentRoom} · {s.progress}%
            </p>
            <div className="mt-2 flex gap-4 font-mono text-[11px] text-ash">
              <span>Precisão {s.accuracy}%</span>
              <span>Erros {s.errors}</span>
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-[#ff7a1a]" />
                {s.streak}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: tabela */}
      <div className="panel hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-bone/10">
            <tr>
              <Th k="name">ALUNO</Th>
              <Th k="xp">XP</Th>
              <Th>NÍVEL</Th>
              <Th>SALA ATUAL</Th>
              <Th k="progress">PROGRESSO</Th>
              <Th k="errors">ERROS</Th>
              <Th k="accuracy">PRECISÃO</Th>
              <Th>ÚLTIMA ATIVIDADE</Th>
              <Th k="streak">OFENSIVA</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-bone/5 transition hover:bg-blood/5">
                <td className="px-3 py-3">
                  <Link href={`/professor/alunos/${s.id}`} className="font-medium text-bone hover:text-flare">
                    {s.name}
                  </Link>
                  <p className="text-[11px] text-ash">{s.email}</p>
                </td>
                <td className="px-3 py-3 font-mono text-alert">{s.xp}</td>
                <td className="px-3 py-3 font-mono">{s.level}</td>
                <td className="px-3 py-3 text-ash">{s.currentRoom}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 bg-bone/10">
                      <div className="h-full bg-flare" style={{ width: `${s.progress}%` }} />
                    </div>
                    <span className="font-mono text-xs">{s.progress}%</span>
                  </div>
                </td>
                <td className="px-3 py-3 font-mono">{s.errors}</td>
                <td className="px-3 py-3 font-mono text-term">{s.accuracy}%</td>
                <td className="whitespace-nowrap px-3 py-3 text-xs text-ash">{formatDateTime(s.lastActivity)}</td>
                <td className="px-3 py-3">
                  <span className="flex items-center gap-1 font-mono">
                    <Flame className="h-3.5 w-3.5 text-[#ff7a1a]" />
                    {s.streak}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="mt-6 text-center text-sm text-ash">Nenhum agente encontrado.</p>}
    </div>
  );
}
