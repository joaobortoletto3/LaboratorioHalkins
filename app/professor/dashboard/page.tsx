"use client";

import Link from "next/link";
import { Activity, CheckCircle2, Crosshair, Gauge, ListChecks, Sigma, Users, Zap } from "lucide-react";
import { useStudents } from "@/hooks/useTeacherData";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { TeacherStats } from "@/components/teacher/TeacherStats";
import { BarChart } from "@/components/teacher/BarChart";
import { ThemedLoader } from "@/components/hawkins/ThemedLoader";
import { ROOMS } from "@/lib/data/rooms";

export default function ProfessorDashboard() {
  const { mode, students, error } = useStudents();
  if (mode === "loading") return <ThemedLoader messages={["CONNECTING TO HAWKINS NETWORK...", "COMPILING FIELD REPORTS..."]} />;
  if (error) return <p className="panel-red p-6 text-flare">{error}</p>;

  const n = students.length || 1;
  const attempts = students.reduce((a, s) => a + s.attempts, 0);
  const correct = students.reduce((a, s) => a + s.correct, 0);
  const completed = students.reduce((a, s) => a + s.completedRooms, 0);

  // Distribuição por sala atual
  const byRoom = ROOMS.map((r) => ({ label: r.sector.replace("SETOR ", ""), value: students.filter((s) => s.currentRoom === r.name).length }));

  return (
    <div className="space-y-6">
      <HawkinsHeader code="CENTRAL DE CONTROLE — MONITORAMENTO DE CAMPO" title="Centro de Comando" subtitle="Acompanhe o avanço dos agentes no Incidente 011.">
        <Link href="/professor/desafios/novo" className="btn-primary">
          NOVO DESAFIO
        </Link>
      </HawkinsHeader>

      {mode === "demo" && <p className="panel p-5 text-sm leading-relaxed text-ash">Você está no modo demonstração. Conecte o Supabase para acompanhar os alunos cadastrados e seu progresso real.</p>}

      <TeacherStats
        items={[
          { label: "TOTAL DE ALUNOS", value: String(students.length), icon: Users },
          { label: "ATIVOS HOJE", value: String(students.filter((s) => s.activeToday).length), icon: Activity, accent: "text-term" },
          { label: "PROGRESSO MÉDIO", value: `${Math.round(students.reduce((a, s) => a + s.progress, 0) / n)}%`, icon: Gauge },
          { label: "DESAFIOS CONCLUÍDOS", value: String(completed), icon: CheckCircle2 },
          { label: "TENTATIVAS", value: String(attempts), icon: ListChecks },
          { label: "TAXA DE ACERTO", value: `${attempts ? Math.round((correct / attempts) * 100) : 0}%`, icon: Crosshair, accent: "text-term" },
          { label: "XP TOTAL", value: students.reduce((a, s) => a + s.xp, 0).toLocaleString("pt-BR"), icon: Zap, accent: "text-alert" },
          { label: "ERROS REGISTRADOS", value: String(attempts - correct), icon: Sigma, accent: "text-flare" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <p className="label mb-4">AGENTES POR SETOR ATUAL</p>
          <BarChart data={byRoom} />
        </div>
        <div className="panel p-5">
          <p className="label mb-4">XP POR ALUNO (TOP 8)</p>
          {students.length ? <BarChart data={[...students].sort((a, b) => b.xp - a.xp).slice(0, 8).map((s) => ({ label: s.name.split(" ")[0], value: s.xp }))} color="bg-alert" /> : <p className="py-8 text-sm text-ash">Os resultados aparecerão quando houver alunos cadastrados.</p>}
        </div>
      </div>

      <div className="panel p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="label">AGENTES QUE PRECISAM DE ATENÇÃO</p>
          <Link href="/professor/alunos" className="font-mono text-[11px] tracking-[0.2em] text-flare">
            VER TODOS →
          </Link>
        </div>
        <ul className="divide-y divide-bone/5">
          {[...students]
            .sort((a, b) => b.errors - a.errors)
            .slice(0, 5)
            .map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                <Link href={`/professor/alunos/${s.id}`} className="text-bone hover:text-flare">
                  {s.name}
                </Link>
                <span className="font-mono text-xs text-ash">
                  {s.errors} erros · {s.accuracy}% · {s.currentRoom}
                </span>
              </li>
            ))}
          {students.length === 0 && <li className="py-3 text-sm text-ash">Nenhum aluno cadastrado ainda.</li>}
        </ul>
      </div>
    </div>
  );
}
