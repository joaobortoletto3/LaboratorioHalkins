import "server-only";

/**
 * Gabarito do MODO DEMONSTRAÇÃO.
 * Este arquivo importa "server-only": o build do Next.js falha se algum componente do
 * navegador tentar importá-lo. Em produção (Supabase) as respostas ficam na coluna
 * challenges.correct_answer, que não é legível pelos alunos.
 */
export interface AnswerKey {
  answer: string;
  tolerance: number;
  type: "numeric" | "code";
}

export const DEMO_ANSWER_KEY: Record<string, AnswerKey> = {
  "c-01": { answer: "50", tolerance: 0, type: "numeric" },
  "c-02": { answer: "101", tolerance: 0, type: "numeric" },
  "c-03": { answer: "576", tolerance: 0, type: "numeric" },
  "c-04": { answer: "1296", tolerance: 0, type: "numeric" },
  "c-05": { answer: "24", tolerance: 0, type: "numeric" },
  "c-06": { answer: "4800", tolerance: 0, type: "numeric" },
  "f-011": { answer: "5010112967B", tolerance: 0, type: "code" },
  "t-01": { answer: "64", tolerance: 0, type: "numeric" },
  "t-02": { answer: "45", tolerance: 0, type: "numeric" },
  "t-03": { answer: "60", tolerance: 0, type: "numeric" },
};

/** Existing demo dossiers may contain a mix of the previous and current story. */
export const DEMO_FINAL_KEYS: AnswerKey[] = ["480", "50"].flatMap((reserve) =>
  ["352", "101"].flatMap((surface) =>
    ["228", "1296"].map((experiment) => ({ answer: `${reserve}${surface}${experiment}7B`, tolerance: 0, type: "code" as const })),
  ),
);
