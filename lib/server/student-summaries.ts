import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GameState, RoomStatus, StudentSummary } from "@/types";
import { createInitialState, normalizeStreak } from "@/lib/game";
import { addDays } from "@/lib/dates";
import { summarizeClient } from "@/lib/summary";

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
}
interface Progress { user_id: string; room_id: string; status: RoomStatus }
interface Attempt { user_id: string; id: string; challenge_id: string; correct: boolean; created_at: string }
interface Xp { user_id: string; amount: number; created_at: string }

// Page every table so large classes do not silently lose rows at the API limit.
async function readRows<T>(sb: SupabaseClient, table: string, columns: string, since?: string): Promise<T[]> {
  const rows: T[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    let query = sb.from(table).select(columns).order("id").range(offset, offset + pageSize - 1);
    if (table === "profiles") query = query.eq("role", "aluno");
    if (since) query = query.gte("created_at", since);
    const { data, error } = await query;
    if (error) throw error;
    const page = (data ?? []) as unknown as T[];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

/** Fetch only the four datasets needed by the overview, shared across students. */
export async function buildStudentSummaries(sb: SupabaseClient): Promise<StudentSummary[]> {
  const weekAgo = addDays(new Date(), -7).toISOString();
  const [profiles, progress, attempts, xp] = await Promise.all([
    readRows<Profile>(sb, "profiles", "id,name,email,xp,level,current_streak,longest_streak,last_activity_date,created_at"),
    readRows<Progress>(sb, "progress", "user_id,room_id,status"),
    readRows<Attempt>(sb, "attempts", "user_id,id,challenge_id,correct,created_at"),
    readRows<Xp>(sb, "xp_logs", "user_id,amount,created_at", weekAgo),
  ]);
  const states = new Map<string, GameState>();
  for (const profile of profiles) {
    const state = createInitialState({ id: profile.id, name: profile.name ?? "Agente", email: profile.email ?? "", createdAt: profile.created_at });
    Object.assign(state.profile, {
      xp: profile.xp, level: profile.level, currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak, lastActivityDate: profile.last_activity_date,
    });
    states.set(profile.id, state);
  }
  for (const row of progress) {
    const state = states.get(row.user_id);
    if (state) state.rooms[row.room_id] = { status: row.status, errors: 0 };
  }
  // The summary uses the latest attempt for lastActivity, including training.
  attempts.sort((a, b) => a.created_at.localeCompare(b.created_at));
  for (const row of attempts) {
    states.get(row.user_id)?.attempts.push({ id: row.id, challengeId: row.challenge_id, answer: "", correct: row.correct, createdAt: row.created_at });
  }
  for (const row of xp) {
    states.get(row.user_id)?.xpLog.push({ amount: row.amount, reason: "", createdAt: row.created_at });
  }
  return [...states.values()].map((state) => summarizeClient(normalizeStreak(state)));
}
