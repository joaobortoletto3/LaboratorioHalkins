import "server-only";
import type { AnswerKey } from "./answers";

export function normalizeCode(v: string): string {
  return v.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function parseNumeric(v: string): number | null {
  const cleaned = v.trim().replace(/\s/g, "").replace(/(cm|m)[²³23]?$/i, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function checkAnswer(key: AnswerKey, raw: string): boolean {
  if (key.type === "code") return normalizeCode(raw) === normalizeCode(key.answer);
  const given = parseNumeric(raw);
  const expected = parseNumeric(key.answer);
  if (given === null || expected === null) return false;
  return Math.abs(given - expected) <= key.tolerance + 1e-9;
}

const WRONG: { title: string; message: string }[] = [
  {
    title: "ANÁLISE INCORRETA.",
    message: "O cálculo informado não corresponde à medida do objeto. Consulte o arquivo de geometria ou tente novamente.",
  },
  { title: "SINAL INCONSISTENTE.", message: "RECALCULANDO... O valor não estabiliza o sistema. TENTE NOVAMENTE." },
  {
    title: "LEITURA REJEITADA.",
    message: "O terminal não reconheceu este valor. Revise as medidas fornecidas e a fórmula do sólido.",
  },
  {
    title: "FALHA DE CALIBRAÇÃO.",
    message: "Os sensores registraram uma divergência. Verifique cada etapa do cálculo antes de enviar outro código.",
  },
];

const RIGHT: { title: string; message: string }[] = [
  { title: "ACCESS GRANTED", message: "Valor confirmado. O sistema reconheceu sua análise." },
  { title: "SIGNAL STABILIZED", message: "Cálculo validado pelo terminal. Novos registros foram liberados." },
];

export function feedback(correct: boolean, challengeId: string): { title: string; message: string } {
  if (challengeId === "f-011") {
    return correct
      ? { title: "SEQUENCE ACCEPTED", message: "INITIATING CONTAINMENT..." }
      : { title: "SEQUENCE REJECTED", message: "A ordem dos registros não estabiliza o portal. Releia o documento: cada palavra aponta para uma evidência." };
  }
  const pool = correct ? RIGHT : WRONG;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const BLOCKED = {
  title: "TENTATIVAS ESGOTADAS",
  message: "Seu acesso foi suspenso temporariamente. Conclua o PROTOCOLO DE TREINAMENTO para recuperar tentativas.",
};
