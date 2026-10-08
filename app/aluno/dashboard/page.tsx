"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, MapPin, RotateCcw, ShieldCheck, Radio } from "lucide-react";
import { useHawkins } from "@/hooks/useHawkins";
import { computeStats } from "@/lib/game";
import { clearanceLevel, levelTitle } from "@/lib/levels";
import { EVIDENCES } from "@/lib/data/evidences";
import { initials } from "@/lib/utils";
import { XPBar } from "@/components/gamification/XPBar";
import { LivesCounter } from "@/components/gamification/LivesCounter";
import { StreakCalendar, StreakCounter } from "@/components/gamification/StreakCounter";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { HawkinsTerminal } from "@/components/hawkins/HawkinsTerminal";
import { HawkinsLogo } from "@/components/hawkins/HawkinsLogo";

const LOGS: Record<string, string> = {
  "sala-01": "Uma anomalia foi detectada no setor inferior do laboratório.",
  "sala-02": "O terminal de emergência foi reativado. Há movimento no Depósito Experimental.",
  "sala-03": "A caixa contaminada foi aberta. O tanque de isolamento voltou a emitir sinais.",
  "sala-04": "Uma voz foi gravada no tanque. A máquina da Câmara de Testes voltou a vibrar.",
  "sala-05": "O Experimento 011 foi confirmado. O sensor esférico está apontado para o subsolo.",
  "sala-06": "ATIVIDADE DIMENSIONAL DETECTADA. Raízes avançam pelo Setor Subterrâneo.",
  portal: "O crachá do cientista foi encontrado. A ruptura está aberta. Protocolo 011 pronto.",
};

export default function DashboardPage() {
  const { state, mode, resetDemo } = useHawkins();
  if (!state) return null;
  const p = state.profile;
  const stats = computeStats(state);
  const current = stats.currentRoom;
  const log = state.caseClosedAt ? "Portal contido. Uma última transmissão foi recuperada." : LOGS[current.id];

  return (
    <div className="dashboard space-y-6 sm:space-y-8">
      <section className="dashboard-brand relative isolate overflow-hidden rounded-2xl border border-blood/25 px-6 py-8 sm:px-10 sm:py-10" aria-label="Laboratório Hawkins — Arquivo 011">
        <div className="relative z-10 flex flex-col items-center justify-between gap-8 text-center xl:flex-row xl:text-left">
          <div>
            <HawkinsLogo size="lg" className="dashboard-logo" />
            <p className="mt-5 font-mono text-[10px] tracking-[0.3em] text-bone/60 sm:text-xs">ARQUIVO 011 · DIVISÃO DE PESQUISA</p>
          </div>
          <div className="max-w-sm xl:border-l xl:border-bone/10 xl:pl-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-blood/30 bg-blood/10 px-3 py-1 font-mono text-[10px] tracking-widest text-bone/80"><ShieldCheck className="h-3.5 w-3.5 text-flare" /> ACESSO RESTRITO</span>
            <p className="mt-4 text-xl font-semibold tracking-tight text-bone sm:text-2xl">Central de investigação</p>
            <p className="mt-2 text-sm leading-relaxed text-ash">Cada descoberta aproxima você da verdade. Acompanhe sua missão e conecte as evidências.</p>
          </div>
        </div>
      </section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel overflow-hidden p-5 sm:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-flare/30 bg-rust/20 font-mono text-xl text-bone sm:h-16 sm:w-16">{initials(p.name)}</div>
            <div className="min-w-0">
              <p className="label mb-1">SEU DOSSIÊ</p>
              <h1 className="break-words text-2xl font-semibold tracking-tight text-bone sm:text-3xl">Olá, {p.name.split(" ")[0]}.</h1>
              <p className="mt-1 text-xs text-ash">{levelTitle(p.level)} <span className="px-1 text-bone/20">/</span> Credencial nível {String(clearanceLevel(p.level)).padStart(2, "0")}</p>
            </div>
          </div>
          <Link href={state.caseClosedAt ? "/aluno/caso-concluido" : `/aluno/sala/${current.id}`} className="btn-primary shrink-0 text-center !text-xs sm:!text-sm">
            {state.caseClosedAt ? "VER RELATÓRIO FINAL" : "CONTINUAR INVESTIGAÇÃO"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 border-t border-bone/10 pt-5">
          <XPBar xp={p.xp} />
        </div>
      </motion.section>

      <section aria-label="Seus indicadores" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <div className="panel flex min-h-28 flex-col justify-center p-4 sm:p-5">
          <StreakCounter days={p.currentStreak} />
          <p className="mt-2 text-xs text-ash">Sua sequência de atividades</p>
        </div>
        <div className="panel flex min-h-28 flex-col justify-center p-4 sm:p-5">
          <p className="label">EXPERIÊNCIA</p>
          <p className="text-2xl font-semibold text-alert">{p.xp.toLocaleString("pt-BR")}</p>
          <p className="mt-2 text-xs text-ash">Pontos de XP acumulados</p>
        </div>
        <div className="panel flex min-h-28 flex-col justify-center p-4 sm:p-5">
          <div className="[&>div]:flex-wrap"><LevelBadge level={p.level} /></div>
          <p className="mt-2 text-xs text-ash">Sua classificação atual</p>
        </div>
        <div className="panel flex min-h-28 flex-col justify-center p-4 sm:p-5">
          <p className="label mb-2">VIDAS</p>
          <LivesCounter lives={p.lives} />
          <p className="mt-2 text-xs text-ash">Tentativas disponíveis</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="panel p-5 sm:p-7 xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div><p className="label">MISSÃO PRINCIPAL</p><h2 className="mt-1 text-xl font-semibold">Progresso da investigação</h2></div>
            <p className="font-mono text-2xl font-semibold text-bone">{stats.progress}%</p>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-bone/5" role="progressbar" aria-label="Progresso da investigação" aria-valuenow={stats.progress} aria-valuemin={0} aria-valuemax={100}>
            <motion.div className="h-full bg-flare shadow-glow-sm" initial={{ width: 0 }} animate={{ width: `${stats.progress}%` }} transition={{ duration: 1.2 }} />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-bone/10 bg-void/30 p-3">
              <MapPin className="h-5 w-5 text-flare" />
              <div>
                <p className="label !text-[9px]">SALA ATUAL</p>
                <p className="text-sm text-bone">{state.caseClosedAt ? "Caso encerrado" : current.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-bone/10 bg-void/30 p-3">
              <FileText className="h-5 w-5 text-alert" />
              <div>
                <p className="label !text-[9px]">EVIDÊNCIAS</p>
                <p className="text-sm text-bone">
                  {state.evidences.length} / {EVIDENCES.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-bone/10 bg-void/30 p-3">
              <span className="font-mono text-lg text-term">{stats.accuracy}%</span>
              <div>
                <p className="label !text-[9px]">PRECISÃO</p>
                <p className="text-sm text-bone">{stats.attempts} tentativas</p>
              </div>
            </div>
          </div>
          <div className="mt-7 border-t border-bone/10 pt-6">
            <h3 className="mb-4 text-sm font-semibold">Sua atividade nesta semana</h3>
            <StreakCalendar activityDays={state.activityDays} />
            <p className="mt-4 text-xs leading-relaxed text-ash">Conclua uma atividade por dia para manter sua ofensiva.<span className="mt-1 block text-bone/75">Melhor sequência: {p.longestStreak} dias.</span></p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel overflow-hidden p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Radio className="h-4 w-4 text-flare" /> Última transmissão</h2>
            <HawkinsTerminal title="REGISTRO 011" lines={[`> ${log}`]} speed={22} className="min-h-32 !rounded-lg" />
          </div>
          <Link href="/aluno/evidencias" className="panel group block p-5 transition hover:border-flare/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-flare">
            <div className="mb-4 flex items-center justify-between"><FileText className="h-5 w-5 text-flare" /><ArrowRight className="h-4 w-4 text-ash transition group-hover:translate-x-1 group-hover:text-flare" /></div>
            <p className="label">ARQUIVO DE EVIDÊNCIAS</p>
            <p className="mt-1 text-lg font-semibold">{state.evidences.length} de {EVIDENCES.length} recuperadas</p>
            <p className="mt-2 text-sm leading-relaxed text-ash">Consulte os documentos, fitas e registros da sua investigação.</p>
          </Link>
          {mode === "demo" && (
            <button onClick={resetDemo} className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-xs text-ash transition hover:bg-bone/5 hover:text-flare focus-visible:outline focus-visible:outline-2 focus-visible:outline-flare">
              <RotateCcw className="h-3.5 w-3.5" /> REINICIAR INVESTIGAÇÃO (DEMO)
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
