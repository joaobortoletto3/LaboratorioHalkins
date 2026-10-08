import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Attempt, GameState, RoomProgress, RoomStatus } from "@/types";
import { createInitialState, normalizeStreak } from "@/lib/game";
import { getRoom } from "@/lib/data/rooms";

interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: "aluno" | "professor";
  xp: number;
  level: number;
  lives: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  case_closed_at: string | null;
  created_at: string;
}
interface ProgressRow {
  room_id: string;
  status: RoomStatus;
  errors: number;
  started_at: string | null;
  completed_at: string | null;
  duration: number | null;
}
interface AttemptRow {
  id: string;
  challenge_id: string;
  answer: string;
  correct: boolean;
  created_at: string;
}

/** Monta o GameState completo de um usuário a partir das tabelas do Supabase. */
export async function buildState(sb: SupabaseClient, userId: string): Promise<GameState | null> {
  const [p, prog, ev, ach, att, streak, xp] = await Promise.all([
    sb.from("profiles").select("*").eq("id", userId).single(),
    sb.from("progress").select("room_id,status,errors,started_at,completed_at,duration").eq("user_id", userId),
    sb.from("user_evidences").select("evidence_id").eq("user_id", userId),
    sb.from("user_achievements").select("achievement_id").eq("user_id", userId),
    sb.from("attempts").select("id,challenge_id,answer,correct,created_at").eq("user_id", userId).order("created_at"),
    sb.from("streak_logs").select("activity_date").eq("user_id", userId),
    sb.from("xp_logs").select("amount,reason,created_at").eq("user_id", userId).order("created_at"),
  ]);
  for (const result of [p, prog, ev, ach, att, streak, xp]) {
    if (result.error) throw result.error;
  }
  const profile = p.data as ProfileRow | null;
  if (!profile) return null;

  const state = createInitialState({
    id: profile.id,
    name: profile.name ?? "Agente",
    email: profile.email ?? "",
    role: profile.role,
    createdAt: profile.created_at,
    avatarUrl: profile.avatar_url,
  });
  state.profile.xp = profile.xp;
  state.profile.level = profile.level;
  state.profile.lives = profile.lives;
  state.profile.currentStreak = profile.current_streak;
  state.profile.longestStreak = profile.longest_streak;
  state.profile.lastActivityDate = profile.last_activity_date;
  state.caseClosedAt = profile.case_closed_at;

  for (const row of (prog.data ?? []) as ProgressRow[]) {
    const rp: RoomProgress = {
      status: row.status,
      errors: row.errors,
      startedAt: row.started_at ?? undefined,
      completedAt: row.completed_at ?? undefined,
      duration: row.duration ?? undefined,
    };
    state.rooms[row.room_id] = rp;
  }
  state.evidences = ((ev.data ?? []) as { evidence_id: string }[]).map((r) => r.evidence_id);
  state.achievements = ((ach.data ?? []) as { achievement_id: string }[]).map((r) => r.achievement_id);
  state.attempts = ((att.data ?? []) as AttemptRow[]).map(
    (r): Attempt => ({ id: r.id, challengeId: r.challenge_id, answer: r.answer, correct: r.correct, createdAt: r.created_at }),
  );
  state.activityDays = ((streak.data ?? []) as { activity_date: string }[]).map((r) => r.activity_date);
  state.xpLog = ((xp.data ?? []) as { amount: number; reason: string; created_at: string }[]).map((r) => ({
    amount: r.amount,
    reason: r.reason,
    createdAt: r.created_at,
  }));
  return normalizeStreak(state);
}

/** Persiste a diferença entre dois estados (somente servidor, com service role). */
export async function persistDiff(admin: SupabaseClient, userId: string, before: GameState, after: GameState): Promise<void> {
  const newAttempts = after.attempts.slice(before.attempts.length);
  if (newAttempts.length) {
    await admin.from("attempts").insert(
      newAttempts.map((a) => ({ user_id: userId, challenge_id: a.challengeId, answer: a.answer, correct: a.correct, created_at: a.createdAt })),
    ).throwOnError();
  }

  await admin
    .from("profiles")
    .update({
      xp: after.profile.xp,
      level: after.profile.level,
      lives: after.profile.lives,
      current_streak: after.profile.currentStreak,
      longest_streak: after.profile.longestStreak,
      last_activity_date: after.profile.lastActivityDate,
      case_closed_at: after.caseClosedAt ?? null,
    })
    .eq("id", userId).throwOnError();

  const changedRooms = Object.entries(after.rooms).filter(([id, r]) => JSON.stringify(before.rooms[id]) !== JSON.stringify(r));
  if (changedRooms.length) {
    await admin.from("progress").upsert(
      changedRooms.map(([roomId, r]) => ({
        user_id: userId,
        room_id: roomId,
        challenge_id: getRoom(roomId)?.challengeId ?? null,
        status: r.status,
        errors: r.errors,
        started_at: r.startedAt ?? null,
        completed_at: r.completedAt ?? null,
        duration: r.duration ?? null,
      })),
      { onConflict: "user_id,room_id" },
    ).throwOnError();
  }

  const newEv = after.evidences.filter((e) => !before.evidences.includes(e));
  if (newEv.length) await admin.from("user_evidences").insert(newEv.map((evidence_id) => ({ user_id: userId, evidence_id }))).throwOnError();

  const newAch = after.achievements.filter((a) => !before.achievements.includes(a));
  if (newAch.length) await admin.from("user_achievements").insert(newAch.map((achievement_id) => ({ user_id: userId, achievement_id }))).throwOnError();

  const newXp = after.xpLog.slice(before.xpLog.length);
  if (newXp.length) {
    await admin.from("xp_logs").insert(newXp.map((x) => ({ user_id: userId, amount: x.amount, reason: x.reason, created_at: x.createdAt }))).throwOnError();
  }

  const newDays = after.activityDays.filter((d) => !before.activityDays.includes(d));
  if (newDays.length) {
    await admin
      .from("streak_logs")
      .upsert(newDays.map((activity_date) => ({ user_id: userId, activity_date })), { onConflict: "user_id,activity_date" }).throwOnError();
  }
}

export { summarizeClient as summarize } from "@/lib/summary";
