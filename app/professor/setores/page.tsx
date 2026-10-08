"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useTeacherRooms } from "@/hooks/useTeacherData";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { ThemedLoader } from "@/components/hawkins/ThemedLoader";
import type { Difficulty, TeacherRoom } from "@/types";

export default function SetoresPage() {
  const { mode, rooms, saveAll } = useTeacherRooms();
  const [draft, setDraft] = useState<TeacherRoom[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const list = draft ?? rooms;

  const update = (i: number, patch: Partial<TeacherRoom>) => setDraft(list.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setDraft(next);
  };
  const onSave = async () => {
    try {
      await saveAll(list);
      setDraft(null);
      setMsg("Setores atualizados.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erro ao salvar.");
    }
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <div>
      <HawkinsHeader code="PLANTA OPERACIONAL" title="Setores" subtitle="Organize ordem, dificuldade e status dos setores do laboratório.">
        <button className="btn-primary" onClick={onSave} disabled={!draft}>
          SALVAR ALTERAÇÕES
        </button>
      </HawkinsHeader>
      {mode === "demo" && <p className="mb-4 border border-alert/30 bg-alert/5 p-3 text-xs text-alert">MODO DEMO — alterações salvas neste navegador.</p>}
      {msg && <p className="mb-4 border border-term/40 bg-term/10 p-3 font-mono text-xs text-term">{msg}</p>}
      {mode === "loading" ? (
        <ThemedLoader />
      ) : (
        <ul className="space-y-3">
          {list.map((r, i) => (
            <li key={r.id} className="panel grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
              <div className="flex gap-1 sm:flex-col">
                <button aria-label="Subir" onClick={() => move(i, -1)} disabled={i === 0} className="border border-bone/10 p-1 text-ash disabled:opacity-30">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button aria-label="Descer" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="border border-bone/10 p-1 text-ash disabled:opacity-30">
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="label">
                  #{i + 1} · {r.sector}
                </p>
                <p className="font-serif text-lg text-bone">{r.name}</p>
                <input className="input mt-2" value={r.description} onChange={(e) => update(i, { description: e.target.value })} />
              </div>
              <select className="input sm:w-44" value={r.difficulty} onChange={(e) => update(i, { difficulty: e.target.value as Difficulty })}>
                <option value="facil">Fácil</option>
                <option value="intermediario">Intermediário</option>
                <option value="dificil">Difícil</option>
              </select>
              <select className="input sm:w-32" value={r.status} onChange={(e) => update(i, { status: e.target.value as TeacherRoom["status"] })}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
