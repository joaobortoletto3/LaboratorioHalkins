"use client";

import { useStudents } from "@/hooks/useTeacherData";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { StudentTable } from "@/components/teacher/StudentTable";
import { ThemedLoader } from "@/components/hawkins/ThemedLoader";

export default function AlunosPage() {
  const { mode, students, error } = useStudents();
  return (
    <div>
      <HawkinsHeader code="REGISTRO DE PESSOAL" title="Alunos" subtitle="Clique em um agente para abrir o dossiê completo." />
      {mode === "loading" ? <ThemedLoader /> : error ? <p className="panel-red p-6 text-flare">{error}</p> : <StudentTable students={students} />}
    </div>
  );
}
