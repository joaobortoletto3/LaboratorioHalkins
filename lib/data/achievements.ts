import type { Achievement } from "@/types";

export const ACHIEVEMENTS: Achievement[] = [
  { id: "primeiro-contato", title: "PRIMEIRO CONTATO", description: "Complete o primeiro desafio.", icon: "radio" },
  { id: "agente-hawkins", title: "AGENTE HAWKINS", description: "Complete três setores.", icon: "shield" },
  { id: "sem-medo", title: "SEM MEDO", description: "Complete um desafio difícil.", icon: "zap" },
  { id: "precisao-absoluta", title: "PRECISÃO ABSOLUTA", description: "Conclua um setor sem erros.", icon: "target" },
  { id: "do-outro-lado", title: "DO OUTRO LADO", description: "Acesse o setor dimensional.", icon: "eye" },
  { id: "portal-fechado", title: "PORTAL FECHADO", description: "Conclua o caso.", icon: "lock" },
  { id: "em-chamas", title: "EM CHAMAS", description: "Mantenha 7 dias de ofensiva.", icon: "flame" },
];

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
