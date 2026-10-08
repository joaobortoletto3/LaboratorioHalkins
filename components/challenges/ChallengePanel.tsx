"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, BookOpen } from "lucide-react";
import type { Challenge } from "@/types";
import { useHawkins, type SubmitResult } from "@/hooks/useHawkins";
import { playSound } from "@/hooks/useSound";
import { LivesCounter } from "@/components/gamification/LivesCounter";
import { cn } from "@/lib/utils";

const DIFF_LABEL = { facil: "FÁCIL", intermediario: "INTERMEDIÁRIO", dificil: "DIFÍCIL" } as const;

/** Painel de resposta: envia o código ao servidor e exibe feedback narrativo. */
export function ChallengePanel({
  challenge,
  completed,
  onCorrect,
  tone = "green",
}: {
  challenge: Challenge;
  completed: boolean;
  onCorrect?: (r: SubmitResult) => void;
  tone?: "green" | "red";
}) {
  const { state, submitAnswer } = useHawkins();
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [shake, setShake] = useState(0);

  const lives = state?.profile.lives ?? 0;
  const isTraining = challenge.roomId === "treinamento";
  const blocked = !isTraining && lives <= 0 && !completed;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || sending) return;
    setSending(true);
    setResult(null);
    playSound("beep");
    const r = await submitAnswer(challenge.id, answer);
    setSending(false);
    setResult(r);
    if (r.status === "correct") {
      playSound("success");
      onCorrect?.(r);
    } else {
      playSound("error");
      setShake((s) => s + 1);
    }
  };

  const inputCls = tone === "green" ? "input-term" : "input-term !border-flare/40 !text-flare placeholder:!text-flare/30 focus:!border-flare focus:!ring-flare";

  return (
    <div className="panel corner p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label">DESAFIO · {DIFF_LABEL[challenge.difficulty]} · +{challenge.xpReward} XP</p>
          <h2 className="mt-1 font-serif text-xl text-bone">{challenge.title}</h2>
        </div>
        {!isTraining && <LivesCounter lives={lives} size="sm" />}
      </div>

      {challenge.data.length > 0 && (
        <dl className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {challenge.data.map((d) => (
            <div key={d.label} className="border border-bone/10 bg-void/50 px-3 py-2">
              <dt className="label !text-[9px]">{d.label}</dt>
              <dd className="mt-0.5 font-mono text-sm text-bone">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="mb-2 text-base text-bone">{challenge.question}</p>
      <p className="mb-5 font-mono text-sm text-alert/90">{challenge.formulaHint}</p>

      {completed ? (
        <div className="border border-term/40 bg-term/10 p-4 font-mono text-sm text-term">
          ✓ ACCESS GRANTED — este setor já foi validado.
        </div>
      ) : blocked ? (
        <div className="border border-flare/40 bg-rust/20 p-4">
          <p className="font-mono text-sm font-semibold tracking-[0.2em] text-flare">TENTATIVAS ESGOTADAS</p>
          <p className="mt-1 text-sm text-ash">Seu acesso não foi perdido. Conclua exercícios de revisão para recuperar tentativas.</p>
          <Link href="/aluno/treinamento" className="btn-primary mt-4 !py-2 !text-xs">
            PROTOCOLO DE TREINAMENTO
          </Link>
        </div>
      ) : (
        <motion.form key={shake} onSubmit={submit} animate={shake ? { x: [0, -8, 8, -5, 5, 0] } : undefined} transition={{ duration: 0.4 }} className="space-y-3">
          <label className="block">
            <span className={cn("mb-1 block font-mono text-[11px] tracking-[0.25em]", tone === "green" ? "crt-text" : "text-flare")}>&gt; {challenge.inputLabel}</span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className={inputCls}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                inputMode={challenge.type === "numeric" ? "decimal" : "text"}
                autoComplete="off"
                placeholder={challenge.type === "numeric" ? `valor${challenge.unit ? ` em ${challenge.unit}` : ""}` : "código"}
                aria-label={challenge.inputLabel}
              />
              <button className={tone === "green" ? "btn-term shrink-0" : "btn-primary shrink-0"} disabled={sending || !answer.trim()}>
                {sending ? "ANALISANDO..." : "VALIDAR"}
              </button>
            </div>
          </label>
        </motion.form>
      )}

      <AnimatePresence mode="wait">
        {result && result.status !== "correct" && (
          <motion.div
            key={result.title + result.message}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="mt-4 border border-flare/40 bg-rust/15 p-4"
          >
            <p className="font-mono text-sm font-semibold tracking-[0.2em] text-flare">{result.title}</p>
            <p className="mt-1 text-sm text-ash">{result.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => setShowHint((v) => !v)} className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-ash hover:text-alert">
          <Lightbulb className="h-3.5 w-3.5" /> {showHint ? "OCULTAR PISTA" : "VER PISTA"}
        </button>
        <Link href="/aluno/biblioteca" className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-ash hover:text-flare">
          <BookOpen className="h-3.5 w-3.5" /> ARQUIVO DE GEOMETRIA
        </Link>
      </div>
      <AnimatePresence>
        {showHint && (
          <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 overflow-hidden border-l-2 border-alert pl-3 text-sm text-alert/90">
            {challenge.hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
