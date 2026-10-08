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
  "c-01": { answer: "480", tolerance: 0, type: "numeric" },
  "c-02": { answer: "352", tolerance: 0, type: "numeric" },
  "c-03": { answer: "216", tolerance: 0, type: "numeric" },
  "c-04": { answer: "228", tolerance: 0, type: "numeric" },
  "c-05": { answer: "108", tolerance: 0, type: "numeric" },
  "c-06": { answer: "372", tolerance: 0, type: "numeric" },
  "f-011": { answer: "4803522287B", tolerance: 0, type: "code" },
  "t-01": { answer: "64", tolerance: 0, type: "numeric" },
  "t-02": { answer: "45", tolerance: 0, type: "numeric" },
  "t-03": { answer: "60", tolerance: 0, type: "numeric" },
};
