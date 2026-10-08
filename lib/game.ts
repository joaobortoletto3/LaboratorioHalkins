import type { ApplyOutcome, GameEvent, GameState, Profile, RoomProgress } from "@/types";
import { ROOMS, getChallenge, getRoom, nextRoom } from "@/lib/data/rooms";
import { getEvidence } from "@/lib/data/evidences";
import { levelFromXp } from "@/lib/levels";
import { addDays, dayKey } from "@/lib/dates";
import { uid } from "@/lib/utils";
import { parseNumeric } from "@/lib/numeric";

/** Lógica pura do jogo — compartilhada entre o modo demo (cliente) e o servidor (Supabase). Não contém respostas. */

export const MAX_LIVES = 5;

export const XP_RULES = {
  sector: 50,
  noErrors: 20,
  rareEvidence: 25,
  training: 5,
} as const;

export function initialRooms(): Record<string, RoomProgress> {
  const rooms: Record<string, RoomProgress> = {};
  ROOMS.forEach((r, i) => {
    rooms[r.id] = { status: i === 0 ? "disponivel" : "bloqueado", errors: 0 };
  });
  return rooms;
}

export function createInitialState(p: Partial<Profile> & { id: string; name: string; email: string }): GameState {
  return {
    profile: {
      id: p.id,
      name: p.name,
      email: p.email,
      avatarUrl: p.avatarUrl ?? null,
      role: p.role ?? "aluno",
      xp: 0,
      level: 1,
      lives: MAX_LIVES,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      createdAt: p.createdAt ?? new Date().toISOString(),
    },
    rooms: initialRooms(),
    evidences: [],
    achievements: [],
    attempts: [],
    activityDays: [],
    xpLog: [],
    caseClosedAt: null,
  };
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export function touchStreak(s: GameState, now: Date): void {
  const today = dayKey(now);
  const yesterday = dayKey(addDays(now, -1));
  const last = s.profile.lastActivityDate;
  if (last === today) return;
  s.profile.currentStreak = last === yesterday ? s.profile.currentStreak + 1 : 1;
  s.profile.longestStreak = Math.max(s.profile.longestStreak, s.profile.currentStreak);
  s.profile.lastActivityDate = today;
  if (!s.activityDays.includes(today)) s.activityDays.push(today);
}

/** Corrige a ofensiva quando o aluno passou mais de um dia sem atividade. */
export function normalizeStreak(s: GameState, now: Date = new Date()): GameState {
  const last = s.profile.lastActivityDate;
  if (!last) return s;
  const today = dayKey(now);
  const yesterday = dayKey(addDays(now, -1));
  if (last !== today && last !== yesterday && s.profile.currentStreak !== 0) {
    return { ...s, profile: { ...s.profile, currentStreak: 0 } };
  }
  return s;
}

function grant(s: GameState, id: string, events: GameEvent[]) {
  if (!s.achievements.includes(id)) {
    s.achievements.push(id);
    events.push({ type: "achievement", achievementId: id });
  }
}

export function checkAchievements(s: GameState, events: GameEvent[]): void {
  const completed = Object.entries(s.rooms).filter(([id, r]) => id !== "portal" && r.status === "concluido");
  if (completed.length >= 1) grant(s, "primeiro-contato", events);
  if (completed.length >= 3) grant(s, "agente-hawkins", events);
  if (completed.some(([id]) => getRoom(id)?.difficulty === "dificil")) grant(s, "sem-medo", events);
  if (completed.some(([, r]) => r.errors === 0)) grant(s, "precisao-absoluta", events);
  const under = s.rooms["sala-06"];
  if (under && under.status !== "bloqueado") grant(s, "do-outro-lado", events);
  if (s.rooms["portal"]?.status === "concluido") grant(s, "portal-fechado", events);
  if (s.profile.longestStreak >= 7) grant(s, "em-chamas", events);
}

export function markRoomStarted(prev: GameState, roomId: string, now = new Date()): GameState {
  const rp = prev.rooms[roomId];
  if (!rp || rp.status !== "disponivel") return prev;
  const s = clone(prev);
  s.rooms[roomId] = { ...rp, status: "em_andamento", startedAt: rp.startedAt ?? now.toISOString() };
  return s;
}

export function applyResult(prev: GameState, challengeId: string, answer: string, correct: boolean, now = new Date()): ApplyOutcome {
  const ch = getChallenge(challengeId);
  if (!ch) return { state: prev, events: [] };
  const s = clone(prev);
  const iso = now.toISOString();
  const events: GameEvent[] = [];
  const levelBefore = levelFromXp(s.profile.xp);

  s.attempts.push({ id: uid(), challengeId, answer, correct, createdAt: iso });

  const addXp = (amount: number, reason: string) => {
    s.profile.xp += amount;
    s.xpLog.push({ amount, reason, createdAt: iso });
    events.push({ type: "xp", amount, label: reason });
  };

  if (ch.roomId === "treinamento") {
    if (correct) {
      if (s.profile.lives < MAX_LIVES) {
        s.profile.lives += 1;
        events.push({ type: "life", label: "Tentativa restaurada" });
      }
      addXp(XP_RULES.training, "Protocolo de treinamento");
      touchStreak(s, now);
    }
  } else {
    const rp: RoomProgress = s.rooms[ch.roomId] ?? { status: "bloqueado", errors: 0 };
    if (!rp.startedAt) rp.startedAt = iso;

    if (!correct) {
      s.profile.lives = Math.max(0, s.profile.lives - 1);
      rp.errors += 1;
      if (rp.status === "disponivel") rp.status = "em_andamento";
      s.rooms[ch.roomId] = rp;
    } else if (rp.status !== "concluido") {
      rp.status = "concluido";
      rp.completedAt = iso;
      rp.duration = Math.max(1, Math.round((now.getTime() - new Date(rp.startedAt).getTime()) / 1000));
      s.rooms[ch.roomId] = rp;

      addXp(ch.xpReward, ch.roomId === "portal" ? "Desafio final: Protocolo 011" : `Desafio: ${ch.title}`);
      if (ch.roomId !== "portal") addXp(XP_RULES.sector, "Setor concluído");
      if (rp.errors === 0) addXp(XP_RULES.noErrors, "Sem nenhum erro");

      if (ch.evidenceId && !s.evidences.includes(ch.evidenceId)) {
        s.evidences.push(ch.evidenceId);
        events.push({ type: "evidence", evidenceId: ch.evidenceId });
        if (getEvidence(ch.evidenceId)?.rare) addXp(XP_RULES.rareEvidence, "Evidência rara");
      }

      const nr = nextRoom(ch.roomId);
      if (nr && s.rooms[nr.id]?.status === "bloqueado") {
        s.rooms[nr.id] = { ...s.rooms[nr.id], status: "disponivel" };
        events.push({ type: "unlock", roomId: nr.id });
      }
      if (ch.roomId === "portal") s.caseClosedAt = iso;
      touchStreak(s, now);
    }
  }

  const levelAfter = levelFromXp(s.profile.xp);
  s.profile.level = levelAfter;
  if (levelAfter > levelBefore) events.push({ type: "levelup", level: levelAfter });
  checkAchievements(s, events);
  return { state: s, events };
}

export function computeStats(s: GameState) {
  const real = s.attempts.filter((a) => !a.challengeId.startsWith("t-"));
  const correct = real.filter((a) => a.correct).length;
  const errors = real.length - correct;
  const completedRooms = ROOMS.filter((r) => s.rooms[r.id]?.status === "concluido").length;
  const totalTime = Object.values(s.rooms).reduce((acc, r) => acc + (r.duration ?? 0), 0);
  const current =
    ROOMS.find((r) => s.rooms[r.id]?.status === "em_andamento") ??
    ROOMS.find((r) => s.rooms[r.id]?.status === "disponivel") ??
    ROOMS[ROOMS.length - 1];
  return {
    attempts: real.length,
    correct,
    errors,
    accuracy: real.length ? Math.round((correct / real.length) * 100) : 0,
    completedRooms,
    progress: Math.round((completedRooms / ROOMS.length) * 100),
    totalTime,
    currentRoom: current,
  };
}

/** Nível de "corrupção" visual do Mundo Invertido (0 a 1) conforme o aluno avança. */
export function corruptionLevel(s: GameState | null): number {
  if (!s) return 0;
  const done = ROOMS.filter((r) => s.rooms[r.id]?.status === "concluido").length;
  if (s.caseClosedAt) return 0.15;
  return Math.min(1, done / 6);
}

export function correctAnswerFor(s: GameState, challengeId: string): string | undefined {
  const answer = s.attempts.find((a) => a.challengeId === challengeId && a.correct)?.answer;
  if (answer === undefined || getChallenge(challengeId)?.type !== "numeric") return answer;
  const numeric = parseNumeric(answer);
  return numeric === null ? answer : String(numeric);
}
