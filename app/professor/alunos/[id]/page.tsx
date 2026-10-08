"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { useStudent } from "@/hooks/useTeacherData";
import { ThemedLoader } from "@/components/hawkins/ThemedLoader";
import { TeacherStats } from "@/components/teacher/TeacherStats";
import { ROOMS, getChallenge } from "@/lib/data/rooms";
import { ACHIEVEMENTS } from "@/lib/data/achievements";
import { EVIDENCES } from "@/lib/data/evidences";
import { formatDate, formatDateTime, formatDuration } from "@/lib/dates";
import { levelTitle } from "@/lib/levels";
import { agentId } from "@/lib/utils";
import { Activity, Crosshair, Flame, Zap } from "lucide-react";

const STATUS: Record<string, string> = { bloqueado: "Bloqueado", disponivel: "Disponível", em_andamento: "Em andamento", concluido: "Concluído" };

export default function AlunoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { student, loading, error } = useStudent(id);
  if (loading) return <ThemedLoader messages={["DECRYPTING FILE...", "LOADING PERSONNEL RECORD..."]} />;
  if (error || !student) return <p className="panel-red p-6 text-flare">{error ?? "Agente não encontrado."}</p>;
  const st = student.state;

  return (
    <div className="space-y-6">
      <Link href="/professor/alunos" className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-ash hover:text-flare">
        <ArrowLeft className="h-3.5 w-3.5" /> ALUNOS
      </Link>
      <div className="panel-red corner p-5 sm:p-6">
        <p className="label">PERSONNEL RECORD · {agentId(student.id)}</p>
        <h1 className="mt-1 font-serif text-3xl text-bone">{student.name}</h1>
        <p className="text-sm text-ash">
          {student.email} · Nível {student.level} ({levelTitle(student.level)}) · Entrada {formatDate(student.createdAt)}
        </p>
        <div className="mt-4 h-2 bg-bone/5">
          <div className="h-full bg-flare" style={{ width: `${student.progress}%` }} />
        </div>
        <p className="mt-1 font-mono text-xs text-ash">PROGRESSO {student.progress}% · SALA ATUAL: {student.currentRoom}</p>
      </div>

      <TeacherStats
        items={[
          { label: "XP", value: String(student.xp), icon: Zap, accent: "text-alert" },
          { label: "PRECISÃO", value: `${student.accuracy}%`, icon: Crosshair, accent: "text-term" },
          { label: "TENTATIVAS / ERROS", value: `${student.attempts} / ${student.errors}`, icon: Activity },
          { label: "OFENSIVA", value: `${student.streak} (máx ${student.longestStreak})`, icon: Flame },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <p className="label mb-3">SALAS</p>
          <ul className="divide-y divide-bone/5 text-sm">
            {ROOMS.map((r) => {
              const p = st.rooms[r.id];
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span className="text-bone">{r.name}</span>
                  <span className="font-mono text-xs text-ash">
                    {STATUS[p?.status ?? "bloqueado"]} · {p?.errors ?? 0} erros · {formatDuration(p?.duration ?? 0)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="panel p-5">
          <p className="label mb-3">CONQUISTAS E EVIDÊNCIAS</p>
          <div className="flex flex-wrap gap-2">
            {ACHIEVEMENTS.map((a) => (
              <span key={a.id} className={`border px-2 py-1 font-mono text-[10px] tracking-[0.15em] ${st.achievements.includes(a.id) ? "border-alert/50 text-alert" : "border-bone/10 text-ash/50"}`}>
                {a.title}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {EVIDENCES.map((e) => (
              <span key={e.id} className={`border px-2 py-1 font-mono text-[10px] ${st.evidences.includes(e.id) ? "border-flare/50 text-bone" : "border-bone/10 text-ash/50"}`}>
                {e.title}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="panel p-5">
        <p className="label mb-3">TENTATIVAS E RESPOSTAS</p>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bone/10 text-left font-mono text-[10px] tracking-[0.2em] text-ash">
                <th className="py-2 pr-3 font-normal">DATA</th>
                <th className="py-2 pr-3 font-normal">DESAFIO</th>
                <th className="py-2 pr-3 font-normal">RESPOSTA</th>
                <th className="py-2 font-normal">RESULTADO</th>
              </tr>
            </thead>
            <tbody>
              {[...st.attempts].reverse().map((a) => (
                <tr key={a.id} className="border-b border-bone/5">
                  <td className="whitespace-nowrap py-2 pr-3 text-xs text-ash">{formatDateTime(a.createdAt)}</td>
                  <td className="py-2 pr-3">{getChallenge(a.challengeId)?.title ?? a.challengeId}</td>
                  <td className="py-2 pr-3 font-mono">{a.answer}</td>
                  <td className="py-2">{a.correct ? <Check className="h-4 w-4 text-term" /> : <X className="h-4 w-4 text-flare" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {st.attempts.length === 0 && <p className="py-4 text-sm text-ash">Nenhuma tentativa registrada.</p>}
        </div>
      </section>

      <section className="panel p-5">
        <p className="label mb-3">HISTÓRICO DE ATIVIDADES (XP)</p>
        <ul className="max-h-72 space-y-1 overflow-y-auto font-mono text-xs">
          {[...st.xpLog].reverse().map((x, i) => (
            <li key={i} className="flex justify-between gap-3 border-b border-bone/5 py-1.5">
              <span className="text-ash">{formatDateTime(x.createdAt)}</span>
              <span className="flex-1 text-bone">{x.reason}</span>
              <span className="text-alert">+{x.amount}</span>
            </li>
          ))}
          {st.xpLog.length === 0 && <li className="text-ash">Sem atividades.</li>}
        </ul>
      </section>
    </div>
  );
}
