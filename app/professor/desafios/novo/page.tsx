"use client";

import { useEffect, useState } from "react";
import { useTeacherChallenges } from "@/hooks/useTeacherData";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { ChallengeForm, emptyChallenge } from "@/components/teacher/ChallengeForm";
import { ThemedLoader } from "@/components/hawkins/ThemedLoader";
import type { TeacherChallenge } from "@/types";
import { isComplementaryChallenge } from "@/lib/complementary";

/** Criação (sem ?id) e edição (?id=...) de desafios. */
export default function NovoDesafioPage() {
  const { mode, items, save, error } = useTeacherChallenges();
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  const [complementaryView, setComplementaryView] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEditId(params.get("id"));
    setComplementaryView(params.get("complementar") === "1");
  }, []);

  if (mode === "loading" || editId === undefined) return <ThemedLoader messages={["LOADING SECTOR...", "DECRYPTING FILE..."]} />;
  if (error) return <p role="alert" className="panel-red p-6 text-flare">{error}</p>;
  const existing: TeacherChallenge | undefined = editId ? items.find((c) => c.id === editId) : undefined;
  if (editId && !existing) return <p role="alert" className="panel-red p-6 text-flare">Questão não encontrada. Volte à lista e tente novamente.</p>;
  const initial = existing ?? { ...emptyChallenge(), orderIndex: Math.max(0, ...items.map((item) => item.orderIndex)) + 1 };
  const complementary = !existing || isComplementaryChallenge(existing.id);

  return (
    <div>
      <HawkinsHeader
        code={complementary ? existing ? "EDITAR QUESTÃO COMPLEMENTAR" : "NOVA QUESTÃO COMPLEMENTAR" : "EDITAR DESAFIO"}
        title={existing ? existing.title : "Adicionar Questão Complementar"}
        subtitle={complementary ? "Cadastre a pergunta, a resposta correta e o XP. Quando ativa, a questão aparece para os alunos e cada acerto recupera 1 coração." : "A resposta correta é armazenada apenas no servidor e nunca é enviada aos alunos."}
      />
      <ChallengeForm key={initial.id} initial={initial} isNew={!existing} mode={mode} onSave={save} complementary={complementary} returnHref={complementaryView ? "/professor/questoes-complementares" : "/professor/desafios"} />
    </div>
  );
}
