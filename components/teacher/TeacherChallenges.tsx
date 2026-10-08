"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Copy, Pencil, Power, Trash2 } from "lucide-react";
import { useTeacherChallenges } from "@/hooks/useTeacherData";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { ThemedLoader } from "@/components/hawkins/ThemedLoader";
import { getRoom } from "@/lib/data/rooms";
import { isComplementaryChallenge } from "@/lib/complementary";
import type { Difficulty } from "@/types";

const DIFF: Record<Difficulty, string> = { facil: "FÁCIL", intermediario: "INTERMEDIÁRIO", dificil: "DIFÍCIL" };
const NEXT_DIFF: Record<Difficulty, Difficulty> = { facil: "intermediario", intermediario: "dificil", dificil: "facil" };
const XP: Record<Difficulty, number> = { facil: 10, intermediario: 20, dificil: 30 };

export function TeacherChallenges({ complementaryOnly = false }: { complementaryOnly?: boolean }) {
  const { mode, items, error, save, remove, reorder } = useTeacherChallenges();
  const [msg, setMsg] = useState<string | null>(null);
  const sorted = items.filter((c) => !complementaryOnly || isComplementaryChallenge(c.id)).sort((a, b) => a.orderIndex - b.orderIndex);

  const run = async (fn: () => Promise<void>, ok: string) => {
    try {
      await fn();
      setMsg(ok);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Operação falhou.");
    }
    setTimeout(() => setMsg(null), 2500);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    const next = [...sorted];
    [next[i], next[j]] = [next[j], next[i]];
    void run(() => reorder(next), "Ordem atualizada.");
  };

  return (
    <div>
      <HawkinsHeader code={complementaryOnly ? "ATIVIDADES COMPLEMENTARES" : "BANCO DE DESAFIOS"} title={complementaryOnly ? "Questões Complementares" : "Desafios"} subtitle="Novas questões ativas aparecem em Questões Complementares para os alunos. Cada acerto concede o XP configurado e recupera 1 coração.">
        <Link href="/professor/desafios/novo?complementar=1" className="btn-primary">
          NOVA QUESTÃO COMPLEMENTAR
        </Link>
      </HawkinsHeader>
      {mode === "demo" && <p className="mb-4 border border-alert/30 bg-alert/5 p-3 text-xs text-alert">MODO DEMO — alterações salvas apenas neste navegador. Gabaritos nunca são enviados ao navegador.</p>}
      {msg && <p className="mb-4 border border-term/40 bg-term/10 p-3 font-mono text-xs text-term">{msg}</p>}
      {mode === "loading" ? (
        <ThemedLoader />
      ) : error ? (
        <p className="panel-red p-6 text-flare">{error}</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((c, i) => (
            <li key={c.id} className={`panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${c.active ? "" : "opacity-50"}`}>
              {!complementaryOnly && <div className="flex shrink-0 gap-1 sm:flex-col">
                <button aria-label="Subir" onClick={() => move(i, -1)} className="border border-bone/10 p-1 text-ash hover:text-bone disabled:opacity-30" disabled={i === 0}>
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button aria-label="Descer" onClick={() => move(i, 1)} className="border border-bone/10 p-1 text-ash hover:text-bone disabled:opacity-30" disabled={i === sorted.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>}
              <div className="min-w-0 flex-1">
                <p className="label">
                  #{i + 1} · {getRoom(c.roomId)?.name ?? c.roomId} · {c.active ? "ATIVO" : "INATIVO"}
                </p>
                <p className="mt-1 font-serif text-lg text-bone">{c.title}</p>
                <p className="truncate text-sm text-ash">{c.question}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => run(() => save({ ...c, difficulty: NEXT_DIFF[c.difficulty], xpReward: XP[NEXT_DIFF[c.difficulty]] }, false), "Dificuldade alterada.")}
                  className="border border-alert/40 px-2 py-1 font-mono text-[10px] tracking-[0.15em] text-alert hover:bg-alert/10"
                  title="Alterar dificuldade"
                >
                  {DIFF[c.difficulty]} · {c.xpReward} XP
                </button>
                <Link href={`/professor/desafios/novo?id=${encodeURIComponent(c.id)}${complementaryOnly ? "&complementar=1" : ""}`} aria-label="Editar" className="border border-bone/10 p-2 text-ash hover:text-bone">
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  aria-label="Duplicar"
                  onClick={() => run(() => save({ ...c, id: `${c.id}-copia-${Date.now().toString(36)}`, title: `${c.title} (cópia)`, orderIndex: Math.max(0, ...items.map((item) => item.orderIndex)) + 1 }, true), "Desafio duplicado.")}
                  className="border border-bone/10 p-2 text-ash hover:text-bone"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button aria-label={c.active ? "Desativar" : "Ativar"} onClick={() => run(() => save({ ...c, active: !c.active }, false), c.active ? "Desafio desativado." : "Desafio ativado.")} className={`border border-bone/10 p-2 ${c.active ? "text-term" : "text-ash"}`}>
                  <Power className="h-4 w-4" />
                </button>
                <button
                  aria-label="Excluir"
                  onClick={() => {
                    if (confirm(`Excluir "${c.title}"?`)) void run(() => remove(c.id), "Desafio excluído.");
                  }}
                  className="border border-bone/10 p-2 text-flare hover:bg-rust/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
          {sorted.length === 0 && <p className="text-sm text-ash">{complementaryOnly ? "Nenhuma questão complementar cadastrada. Clique em Nova questão complementar para adicionar a primeira." : "Nenhum desafio cadastrado."}</p>}
        </ul>
      )}
    </div>
  );
}
