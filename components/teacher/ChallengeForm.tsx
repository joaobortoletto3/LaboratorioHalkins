"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty, TeacherChallenge } from "@/types";
import { ROOMS } from "@/lib/data/rooms";
import { EVIDENCES } from "@/lib/data/evidences";

const XP_BY_DIFF: Record<Difficulty, number> = { facil: 10, intermediario: 20, dificil: 30 };

export function emptyChallenge(): TeacherChallenge {
  return {
    id: `c-${Date.now().toString(36)}`,
    roomId: ROOMS[0].id,
    title: "",
    story: "",
    question: "",
    content: "",
    difficulty: "intermediario",
    xpReward: 20,
    hint: "",
    correctAnswer: "",
    tolerance: 0,
    evidenceId: "",
    nextRoomId: "",
    active: true,
    orderIndex: 99,
  };
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="label mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

export function ChallengeForm({ initial, isNew, mode, onSave, complementary = false, returnHref = "/professor/desafios" }: { initial: TeacherChallenge; isNew: boolean; mode: "demo" | "supabase" | "loading"; onSave: (c: TeacherChallenge, isNew: boolean) => Promise<void>; complementary?: boolean; returnHref?: string }) {
  const router = useRouter();
  const [c, setC] = useState<TeacherChallenge>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof TeacherChallenge>(k: K, v: TeacherChallenge[K]) => setC((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!c.title.trim() || !c.question.trim()) return setError("Título e pergunta são obrigatórios.");
    if (mode === "supabase" && !c.correctAnswer.trim()) return setError("Informe a resposta correta (fica armazenada somente no servidor).");
    setSaving(true);
    setError(null);
    try {
      await onSave(c, isNew);
      router.push(returnHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="panel corner grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
      <Field label="Título" full>
        <input className="input" value={c.title} onChange={(e) => set("title", e.target.value)} maxLength={120} />
      </Field>
      {complementary && <p className="border border-term/30 bg-term/5 p-3 text-sm text-term sm:col-span-2">Ao acertar esta questão, o aluno recebe {c.xpReward} XP e recupera 1 coração, até o limite de 5. A recompensa é concedida uma vez por aluno.</p>}
      <Field label={complementary ? "Sala de referência" : "Sala"}>
        <select className="input" value={c.roomId} onChange={(e) => set("roomId", e.target.value)}>
          {ROOMS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.sector} — {r.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Conteúdo matemático">
        <input className="input" value={c.content} onChange={(e) => set("content", e.target.value)} placeholder="Ex.: Volume do cilindro" />
      </Field>
      <Field label="Narrativa" full>
        <textarea className="input h-28" value={c.story} onChange={(e) => set("story", e.target.value)} />
      </Field>
      <Field label="Pergunta" full>
        <textarea className="input h-20" value={c.question} onChange={(e) => set("question", e.target.value)} />
      </Field>
      <Field label="Dificuldade">
        <select
          className="input"
          value={c.difficulty}
          onChange={(e) => {
            const d = e.target.value as Difficulty;
            setC((p) => ({ ...p, difficulty: d, xpReward: XP_BY_DIFF[d] }));
          }}
        >
          <option value="facil">Fácil (+10 XP)</option>
          <option value="intermediario">Intermediário (+20 XP)</option>
          <option value="dificil">Difícil (+30 XP)</option>
        </select>
      </Field>
      <Field label="XP">
        <input className="input" type="number" min={0} max={500} value={c.xpReward} onChange={(e) => set("xpReward", Number(e.target.value))} />
      </Field>
      <Field label="Pista" full>
        <input className="input" value={c.hint} onChange={(e) => set("hint", e.target.value)} />
      </Field>
      <Field label="Resposta correta">
        <input className="input font-mono" value={c.correctAnswer} onChange={(e) => set("correctAnswer", e.target.value)} placeholder={mode === "demo" ? "Requer Supabase para validar" : "Ex.: 480"} />
      </Field>
      <Field label="Tolerância">
        <input className="input" type="number" min={0} step="0.01" value={c.tolerance} onChange={(e) => set("tolerance", Number(e.target.value))} />
      </Field>
      {!complementary && <Field label="Evidência">
        <select className="input" value={c.evidenceId} onChange={(e) => set("evidenceId", e.target.value)}>
          <option value="">Nenhuma</option>
          {EVIDENCES.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.code} — {ev.title}
            </option>
          ))}
        </select>
      </Field>}
      {!complementary && <Field label="Próxima sala">
        <select className="input" value={c.nextRoomId} onChange={(e) => set("nextRoomId", e.target.value)}>
          <option value="">Automática (ordem do mapa)</option>
          {ROOMS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </Field>}
      <Field label="Status">
        <select className="input" value={c.active ? "ativo" : "inativo"} onChange={(e) => set("active", e.target.value === "ativo")}>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </Field>

      {mode === "demo" && (
        <p className="border border-alert/40 bg-alert/10 p-3 text-xs text-alert sm:col-span-2">
          MODO DEMO: alterações ficam salvas neste navegador. Para que novas respostas sejam validadas pelo servidor, configure o Supabase.
        </p>
      )}
      {error && <p className="border border-flare/40 bg-rust/20 p-3 text-sm text-flare sm:col-span-2">{error}</p>}
      <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-ghost" onClick={() => router.push(returnHref)}>
          CANCELAR
        </button>
        <button className="btn-primary" disabled={saving}>
          {saving ? "SALVANDO..." : complementary ? "SALVAR QUESTÃO COMPLEMENTAR" : "SALVAR DESAFIO"}
        </button>
      </div>
    </form>
  );
}
