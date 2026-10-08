import type { GameState, StudentSummary } from "@/types";
import { computeStats } from "@/lib/game";
import { addDays, dayKey } from "@/lib/dates";

/** Resumo de um aluno para o painel do professor (versão segura para o navegador). */
export function summarizeClient(state: GameState): StudentSummary {
  const stats = computeStats(state);
  const weekAgo = addDays(new Date(), -7).getTime();
  const weeklyXp = state.xpLog.filter((x) => new Date(x.createdAt).getTime() >= weekAgo).reduce((a, x) => a + x.amount, 0);
  const lastAttempt = state.attempts[state.attempts.length - 1]?.createdAt ?? null;
  return {
    id: state.profile.id,
    name: state.profile.name,
    email: state.profile.email,
    xp: state.profile.xp,
    level: state.profile.level,
    currentRoom: stats.currentRoom.name,
    progress: stats.progress,
    errors: stats.errors,
    accuracy: stats.accuracy,
    attempts: stats.attempts,
    correct: stats.correct,
    completedRooms: stats.completedRooms,
    lastActivity: lastAttempt ?? state.profile.lastActivityDate,
    streak: state.profile.currentStreak,
    longestStreak: state.profile.longestStreak,
    createdAt: state.profile.createdAt,
    activeToday: state.profile.lastActivityDate === dayKey(),
    weeklyXp,
  };
}
