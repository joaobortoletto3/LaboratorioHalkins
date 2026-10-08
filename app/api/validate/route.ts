import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSupabase, getServerSupabase } from "@/lib/supabase/server";
import { DEMO_ANSWER_KEY, type AnswerKey } from "@/lib/server/answers";
import { BLOCKED, checkAnswer, feedback } from "@/lib/server/validate";
import { buildState, persistDiff } from "@/lib/server/state";
import { applyResult } from "@/lib/game";
import { getChallenge } from "@/lib/data/rooms";
import type { ValidateResponse } from "@/types";

export const dynamic = "force-dynamic";

/**
 * Fluxo de validação protegida:
 * ALUNO → Next.js → esta API Route → (Supabase) → validação → { correct: true | false }
 * Somente o servidor conhece a resposta correta.
 */
export async function POST(req: Request) {
  let body: { challengeId?: unknown; answer?: unknown };
  try {
    body = (await req.json()) as { challengeId?: unknown; answer?: unknown };
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const challengeId = typeof body.challengeId === "string" ? body.challengeId : "";
  const answer = typeof body.answer === "string" ? body.answer.slice(0, 64) : "";
  if (!challengeId || !answer.trim()) {
    return NextResponse.json({ error: "Informe um código para análise." }, { status: 400 });
  }

  // ---------- MODO DEMONSTRAÇÃO ----------
  if (!isSupabaseConfigured) {
    const key = DEMO_ANSWER_KEY[challengeId];
    if (!key) return NextResponse.json({ error: "Desafio não encontrado." }, { status: 404 });
    const correct = checkAnswer(key, answer);
    return NextResponse.json<ValidateResponse>({ correct, ...feedback(correct, challengeId) });
  }

  // ---------- MODO SUPABASE ----------
  try {
    const sb = getServerSupabase();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
    const userId = auth.user.id;
    const admin = getAdminSupabase();

    const { data: row } = await admin
      .from("challenges")
      .select("correct_answer,tolerance,type,active")
      .eq("id", challengeId)
      .single();
    const ch = row as { correct_answer: string; tolerance: number; type: "numeric" | "code"; active: boolean } | null;
    if (!ch || !ch.active) return NextResponse.json({ error: "Desafio indisponível." }, { status: 404 });

    const before = await buildState(admin, userId);
    if (!before) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });

    const isTraining = challengeId.startsWith("t-");
    const roomId = getChallenge(challengeId)?.roomId;
    if (!isTraining && before.profile.lives <= 0) {
      return NextResponse.json<ValidateResponse>({ correct: false, blocked: true, ...BLOCKED, state: before });
    }
    if (!isTraining && roomId && before.rooms[roomId]?.status === "bloqueado") {
      return NextResponse.json({ error: "Este setor ainda está bloqueado." }, { status: 403 });
    }

    const key: AnswerKey = { answer: ch.correct_answer, tolerance: Number(ch.tolerance) || 0, type: ch.type };
    const correct = checkAnswer(key, answer);
    const { state, events } = applyResult(before, challengeId, answer, correct);
    await persistDiff(admin, userId, before, state);
    return NextResponse.json<ValidateResponse>({ correct, ...feedback(correct, challengeId), state, events });
  } catch {
    return NextResponse.json({ error: "SYSTEM FAILURE. Não foi possível validar o código agora." }, { status: 500 });
  }
}
