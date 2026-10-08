import type { Challenge, Difficulty } from "@/types";
import { CHALLENGES, TRAINING_CHALLENGES } from "@/lib/data/rooms";

const builtInIds = new Set([...CHALLENGES, ...TRAINING_CHALLENGES].map((c) => c.id));

export function isComplementaryChallenge(id: string): boolean {
  return !builtInIds.has(id);
}

/** Public fields only: never copy the teacher's answer key to student cards. */
export function complementaryChallenge(c: {
  id: string; title: string; story: string; question: string; content: string;
  hint: string; difficulty: Difficulty; xpReward: number; type?: "numeric" | "code";
}): Challenge {
  return {
    id: c.id, roomId: "complementares", title: c.title,
    story: c.story.split("\n").filter(Boolean), question: c.question,
    data: [], formulaHint: c.content, hint: c.hint,
    difficulty: c.difficulty, xpReward: c.xpReward,
    type: c.type ?? "code", inputLabel: "Informe sua resposta",
  };
}
