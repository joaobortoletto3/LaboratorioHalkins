import "server-only";
import type { Difficulty, TeacherChallenge } from "@/types";

export interface ChallengeRow {
  id: string;
  room_id: string;
  title: string;
  story: string | null;
  question: string;
  content: string | null;
  type: "numeric" | "code";
  difficulty: Difficulty;
  xp_reward: number;
  hint: string | null;
  correct_answer: string;
  tolerance: number;
  evidence_id: string | null;
  next_room_id: string | null;
  order_index: number;
  active: boolean;
}

export function fromRow(r: ChallengeRow): TeacherChallenge {
  return {
    id: r.id,
    roomId: r.room_id,
    title: r.title,
    story: r.story ?? "",
    question: r.question,
    content: r.content ?? "",
    difficulty: r.difficulty,
    xpReward: r.xp_reward,
    hint: r.hint ?? "",
    correctAnswer: r.correct_answer,
    tolerance: Number(r.tolerance) || 0,
    evidenceId: r.evidence_id ?? "",
    nextRoomId: r.next_room_id ?? "",
    active: r.active,
    orderIndex: r.order_index,
  };
}

export function toRow(c: TeacherChallenge): ChallengeRow {
  return {
    id: c.id,
    room_id: c.roomId,
    title: c.title,
    story: c.story || null,
    question: c.question,
    content: c.content || null,
    type: /^[0-9.,\s-]+$/.test(c.correctAnswer) ? "numeric" : "code",
    difficulty: c.difficulty,
    xp_reward: c.xpReward,
    hint: c.hint || null,
    correct_answer: c.correctAnswer,
    tolerance: c.tolerance,
    evidence_id: c.evidenceId || null,
    next_room_id: c.nextRoomId || null,
    order_index: c.orderIndex,
    active: c.active,
  };
}

const DIFFS: Difficulty[] = ["facil", "intermediario", "dificil"];

export function parseChallengeInput(raw: unknown): TeacherChallenge | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const s = (k: string) => (typeof o[k] === "string" ? (o[k] as string).trim() : "");
  const n = (k: string, d: number) => (typeof o[k] === "number" && Number.isFinite(o[k]) ? (o[k] as number) : d);
  const c: TeacherChallenge = {
    id: s("id") || `c-${Date.now().toString(36)}`,
    roomId: s("roomId"),
    title: s("title").slice(0, 120),
    story: s("story").slice(0, 4000),
    question: s("question").slice(0, 1000),
    content: s("content").slice(0, 200),
    difficulty: DIFFS.includes(o.difficulty as Difficulty) ? (o.difficulty as Difficulty) : "intermediario",
    xpReward: Math.max(0, Math.min(500, n("xpReward", 20))),
    hint: s("hint").slice(0, 1000),
    correctAnswer: s("correctAnswer").slice(0, 64),
    tolerance: Math.max(0, n("tolerance", 0)),
    evidenceId: s("evidenceId"),
    nextRoomId: s("nextRoomId"),
    active: o.active !== false,
    orderIndex: Math.round(n("orderIndex", 99)),
  };
  if (!c.roomId || !c.title || !c.question || !c.correctAnswer) return null;
  return c;
}
