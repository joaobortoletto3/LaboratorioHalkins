"use client";

import { useEffect, useState } from "react";
import { useTeacherChallenges } from "@/hooks/useTeacherData";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { ChallengeForm, emptyChallenge } from "@/components/teacher/ChallengeForm";
import { ThemedLoader } from "@/components/hawkins/ThemedLoader";
import type { TeacherChallenge } from "@/types";

/** Criação (sem ?id) e edição (?id=...) de desafios. */
export default function NovoDesafioPage() {
  const { mode, items, save } = useTeacherChallenges();
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    setEditId(new URLSearchParams(window.location.search).get("id"));
  }, []);

  if (mode === "loading" || editId === undefined) return <ThemedLoader messages={["LOADING SECTOR...", "DECRYPTING FILE..."]} />;
  const existing: TeacherChallenge | undefined = editId ? items.find((c) => c.id === editId) : undefined;
  const initial = existing ?? { ...emptyChallenge(), orderIndex: items.length + 1 };

  return (
    <div>
      <HawkinsHeader
        code={existing ? "EDITAR DESAFIO" : "NOVO DESAFIO"}
        title={existing ? existing.title : "Registrar Desafio"}
        subtitle="A resposta correta é armazenada apenas no servidor e nunca é enviada aos alunos."
      />
      <ChallengeForm key={initial.id} initial={initial} isNew={!existing} mode={mode} onSave={save} />
    </div>
  );
}
