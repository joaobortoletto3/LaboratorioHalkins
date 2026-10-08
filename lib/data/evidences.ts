import type { Evidence } from "@/types";

export const EVIDENCES: Evidence[] = [
  {
    id: "ev-001",
    code: "EVIDÊNCIA 001",
    title: "CARTÃO HNL-07",
    subtitle: "CLASSIFIED",
    description: "Cartão de acesso magnético encontrado preso ao terminal da Sala de Controle.",
    content:
      "Cartão de nível 07 pertencente ao Dr. M. Ellison. No verso, escrito à mão: “A capacidade do reator é a primeira chave.”",
    stamp: "CLASSIFIED",
    tag: "VOLUME",
    rare: false,
    roomId: "sala-01",
  },
  {
    id: "ev-002",
    code: "EVIDÊNCIA 002",
    title: "MANIFESTO DE CARGA B-0447",
    subtitle: "RECOVERED FROM SECTOR B",
    description: "Documento lacrado dentro da caixa contaminada do Depósito Experimental.",
    content:
      "“Revestimento externo calibrado. Toda a superfície da caixa foi tratada contra a substância. Não abrir fora do setor.”",
    stamp: "CONFIDENTIAL",
    tag: "SUPERFÍCIE",
    rare: false,
    roomId: "sala-02",
  },
  {
    id: "ev-003",
    code: "EVIDÊNCIA 003",
    title: "FITA DE ÁUDIO #3",
    subtitle: "RECOVERED FROM ISOLATION TANK",
    description: "Fita cassete com a etiqueta derretida. A gravação está parcialmente corrompida.",
    content:
      "[CHIADO] “...a cobaia diz ouvir alguém do outro lado... ela descreveu um corredor igual ao nosso, mas escuro... coberto de raízes...” [FIM DA GRAVAÇÃO]",
    stamp: "RESTRICTED ACCESS",
    rare: true,
    roomId: "sala-03",
  },
  {
    id: "ev-004",
    code: "EVIDÊNCIA 004",
    title: "RELATÓRIO DE TESTE",
    subtitle: "EXPERIMENT 011",
    description: "Relatório técnico ejetado pela máquina da Câmara de Testes.",
    content:
      "“O amplificador geométrico atingiu volume operacional. Às 03:11 a leitura dimensional ultrapassou o limite. Recomendo o encerramento imediato do Experimento 011.”",
    stamp: "TOP SECRET",
    tag: "EXPERIMENTO",
    rare: false,
    roomId: "sala-04",
  },
  {
    id: "ev-005",
    code: "EVIDÊNCIA 005",
    title: "COORDENADAS DIMENSIONAIS",
    subtitle: "OBSERVATION DECK LOG",
    description: "Impressão contínua do sensor esférico, com coordenadas apontando para o subsolo.",
    content: "LAT 39.9°N  //  PROF. −40m  //  ORIGEM DO SINAL: SUB-NÍVEL 3. “Não é um eco. Algo responde.”",
    stamp: "CLASSIFIED",
    rare: false,
    roomId: "sala-05",
  },
  {
    id: "ev-006",
    code: "EVIDÊNCIA 006",
    title: "CRACHÁ DO CIENTISTA",
    subtitle: "IDENTIFICATION: 7B",
    description: "Crachá chamuscado preso nas raízes do Setor Subterrâneo.",
    content: "DR. MARCUS ELLISON — PESQUISADOR CHEFE — IDENTIFICAÇÃO: 7B. “Se ele está aqui, eu estou do outro lado.”",
    stamp: "RESTRICTED ACCESS",
    tag: "IDENTIFICAÇÃO",
    rare: true,
    roomId: "sala-06",
  },
  {
    id: "ev-007",
    code: "EVIDÊNCIA 007",
    title: "ÚLTIMA TRANSMISSÃO",
    subtitle: "SOURCE: UNKNOWN",
    description: "Sinal de rádio captado no instante em que o portal se fechou.",
    content:
      "“Se você encontrou isso, o experimento não acabou. Apenas conseguimos fechar o primeiro portal.” — M.E.",
    stamp: "TOP SECRET",
    rare: true,
    roomId: "portal",
  },
];

export function getEvidence(id: string): Evidence | undefined {
  return EVIDENCES.find((e) => e.id === id);
}
