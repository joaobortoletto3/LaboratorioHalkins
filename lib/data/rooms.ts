import type { Challenge, Room } from "@/types";

/**
 * Dados PÚBLICOS das salas e desafios.
 * As respostas corretas NÃO ficam aqui: elas vivem apenas no servidor
 * (lib/server/answers.ts no modo demo, ou na coluna protegida challenges.correct_answer no Supabase).
 */

export const ROOMS: Room[] = [
  {
    id: "sala-01",
    order: 1,
    sector: "SETOR A",
    name: "Sala de Controle",
    subtitle: "Reator de emergência",
    description: "O coração elétrico do laboratório. Um único terminal ainda responde.",
    story: [
      "A energia do setor principal foi desligada.",
      "Um terminal continua funcionando utilizando energia de emergência.",
      "Ao lado do terminal existe um tanque cilíndrico que alimenta o reator auxiliar. A tela exige a capacidade exata do tanque.",
    ],
    difficulty: "intermediario",
    theme: "control",
    shape: { kind: "cylinder", dims: { r: 4, h: 10 }, labels: ["r = 4 cm", "h = 10 cm"] },
    challengeId: "c-01",
    terminalLines: ["HAWKINS NATIONAL LABORATORY // AUX POWER", "SYSTEM LOCKED", "ENTER REACTOR CAPACITY_"],
  },
  {
    id: "sala-02",
    order: 2,
    sector: "SETOR B",
    name: "Depósito Experimental",
    subtitle: "Carga contaminada",
    description: "Caixas de transporte lacradas. Uma delas pulsa com uma substância escura.",
    story: [
      "Uma caixa utilizada para transportar equipamentos apresenta sinais de contaminação.",
      "O lacre magnético só libera o compartimento interno quando recebe a área externa total da caixa — o sistema usa esse valor para calibrar o campo de vedação.",
    ],
    difficulty: "intermediario",
    theme: "storage",
    shape: { kind: "box", dims: { w: 8, d: 8, h: 7 }, labels: ["8 cm", "8 cm", "7 cm"] },
    challengeId: "c-02",
    terminalLines: ["CONTAINER #B-0447", "SEAL STATUS: MAGNETIC LOCK", "INPUT SURFACE CALIBRATION_"],
  },
  {
    id: "sala-03",
    order: 3,
    sector: "SETOR C",
    name: "Tanque de Isolamento",
    subtitle: "Privação sensorial",
    description: "Água salgada, escuridão total e um recipiente que guarda mais do que líquido.",
    story: [
      "A sala está gelada. Uma luz azul fraca reflete no recipiente de isolamento.",
      "O monitor ainda mostra: SUBJECT CONNECTION: LOST.",
      "O recipiente é formado por um cilindro com uma semiesfera acoplada no topo. Para reativar a conexão, o sistema pede o volume total de solução salina.",
    ],
    difficulty: "dificil",
    theme: "tank",
    shape: { kind: "capsule", dims: { r: 3, h: 6 }, labels: ["r = 3 m", "h cilindro = 6 m"] },
    challengeId: "c-03",
    terminalLines: ["ISOLATION TANK // UNIT 3", "SUBJECT CONNECTION: LOST", "SALINE VOLUME REQUIRED_"],
  },
  {
    id: "sala-04",
    order: 4,
    sector: "SETOR D",
    name: "Câmara de Testes",
    subtitle: "Máquina experimental",
    description: "Uma máquina geométrica ainda vibra. Ninguém sabe o que ela amplifica.",
    story: [
      "No centro da câmara existe uma máquina experimental composta por duas partes geométricas.",
      "A base é um prisma de base quadrada. Sobre ela, encaixada perfeitamente, existe uma pirâmide de mesma base.",
      "O relatório do experimento só é liberado com o volume total da máquina. Gire o modelo e analise o objeto.",
    ],
    difficulty: "dificil",
    theme: "test",
    shape: { kind: "prism-pyramid", dims: { a: 6, h: 5, hp: 4 }, labels: ["base 6 × 6 cm", "prisma h = 5 cm", "pirâmide h = 4 cm"] },
    challengeId: "c-04",
    terminalLines: ["TEST CHAMBER // EXPERIMENT 011", "AMPLIFIER: UNSTABLE", "INPUT MACHINE VOLUME_"],
  },
  {
    id: "sala-05",
    order: 5,
    sector: "SETOR E",
    name: "Sala de Observação",
    subtitle: "Sensor esférico",
    description: "Um observatório dimensional apontado para baixo. Para o subsolo.",
    story: [
      "Através do vidro, um sensor esférico flutua preso por cabos.",
      "Ele mede flutuações dimensionais preenchendo-se com gás ionizado. Para religá-lo é necessário informar o volume do sensor.",
    ],
    difficulty: "intermediario",
    theme: "observation",
    shape: { kind: "sphere", dims: { r: 3 }, labels: ["r = 3 cm"] },
    challengeId: "c-05",
    terminalLines: ["OBSERVATION DECK // SENSOR S-5", "DIMENSIONAL MONITOR: OFFLINE", "INPUT SENSOR VOLUME_"],
  },
  {
    id: "sala-06",
    order: 6,
    sector: "SETOR SUBTERRÂNEO",
    name: "Setor Subterrâneo",
    subtitle: "Onde o laboratório termina",
    description: "As paredes estão vivas. Raízes escuras atravessam o concreto.",
    story: [
      "O ar fica pesado. Partículas flutuam como cinzas. Raízes atravessam as paredes.",
      "Um painel de contenção pede a energia de estabilização. As anotações do cientista dizem:",
      "“A energia de contenção é a capacidade do reator, menos o que o tanque de isolamento absorve, mais o que o sensor esférico devolve.”",
      "Os valores estão nos registros que você já recuperou.",
    ],
    difficulty: "dificil",
    theme: "underground",
    shape: { kind: "portal", dims: { r: 3 } },
    challengeId: "c-06",
    terminalLines: ["CONTAINMENT PANEL // SUB-LEVEL", "WARNING: ORGANIC GROWTH DETECTED", "INPUT STABILIZATION ENERGY_"],
  },
  {
    id: "portal",
    order: 7,
    sector: "PORTAL",
    name: "Portal Dimensional",
    subtitle: "Protocolo 011",
    description: "A ruptura. A passagem que nunca deveria ter sido aberta.",
    story: [
      "Uma rachadura vermelha se abre na parede de concreto.",
      "Entre as raízes, um último documento do cientista desaparecido.",
    ],
    difficulty: "dificil",
    theme: "portal",
    shape: { kind: "portal", dims: { r: 3 } },
    challengeId: "f-011",
    terminalLines: ["UNKNOWN DIMENSIONAL SIGNAL", "PORTAL STABILITY: 23%", "ENTER FINAL SEQUENCE_"],
  },
];

export const CHALLENGES: Challenge[] = [
  {
    id: "c-01",
    roomId: "sala-01",
    title: "Capacidade do Reator",
    story: ["O tanque cilíndrico abastece o reator auxiliar."],
    question: "Qual é o volume do tanque?",
    data: [
      { label: "Raio", value: "4 cm" },
      { label: "Altura", value: "10 cm" },
      { label: "π", value: "3" },
    ],
    formulaHint: "V = π · r² · h",
    hint: "Primeiro eleve o raio ao quadrado. Depois multiplique por π e pela altura.",
    difficulty: "intermediario",
    xpReward: 20,
    evidenceId: "ev-001",
    type: "numeric",
    unit: "cm³",
    inputLabel: "ENTER REACTOR CAPACITY",
  },
  {
    id: "c-02",
    roomId: "sala-02",
    title: "Calibração do Lacre",
    story: ["A caixa é um paralelepípedo reto-retângulo."],
    question: "Qual é a área total externa da caixa?",
    data: [
      { label: "Comprimento", value: "8 cm" },
      { label: "Largura", value: "8 cm" },
      { label: "Altura", value: "7 cm" },
    ],
    formulaHint: "A = 2(ab + ac + bc)",
    hint: "A caixa tem 6 faces, que formam 3 pares iguais. Some as áreas de um par de cada tipo e dobre.",
    difficulty: "intermediario",
    xpReward: 20,
    evidenceId: "ev-002",
    type: "numeric",
    unit: "cm²",
    inputLabel: "INPUT SURFACE CALIBRATION",
  },
  {
    id: "c-03",
    roomId: "sala-03",
    title: "Volume de Solução Salina",
    story: ["Cilindro + semiesfera de mesmo raio."],
    question: "Qual é o volume total do recipiente de isolamento?",
    data: [
      { label: "Raio (cilindro e semiesfera)", value: "3 m" },
      { label: "Altura do cilindro", value: "6 m" },
      { label: "π", value: "3" },
    ],
    formulaHint: "V = π·r²·h + (2/3)·π·r³",
    hint: "Calcule as duas partes separadamente. A semiesfera tem metade do volume de uma esfera (4/3·π·r³).",
    difficulty: "dificil",
    xpReward: 30,
    evidenceId: "ev-003",
    type: "numeric",
    unit: "m³",
    inputLabel: "SALINE VOLUME REQUIRED",
  },
  {
    id: "c-04",
    roomId: "sala-04",
    title: "Volume da Máquina Experimental",
    story: ["Prisma de base quadrada + pirâmide de mesma base."],
    question: "Qual é o volume total da máquina?",
    data: [
      { label: "Aresta da base quadrada", value: "6 cm" },
      { label: "Altura do prisma", value: "5 cm" },
      { label: "Altura da pirâmide", value: "4 cm" },
    ],
    formulaHint: "V prisma = Ab·h   |   V pirâmide = (Ab·h)/3",
    hint: "As duas partes compartilham a mesma área da base. A pirâmide ocupa um terço de um prisma de mesma base e altura.",
    difficulty: "dificil",
    xpReward: 30,
    evidenceId: "ev-004",
    type: "numeric",
    unit: "cm³",
    inputLabel: "INPUT MACHINE VOLUME",
  },
  {
    id: "c-05",
    roomId: "sala-05",
    title: "Volume do Sensor Esférico",
    story: ["O sensor é uma esfera perfeita."],
    question: "Qual é o volume do sensor esférico?",
    data: [
      { label: "Raio", value: "3 cm" },
      { label: "π", value: "3" },
    ],
    formulaHint: "V = (4/3) · π · r³",
    hint: "Eleve o raio ao cubo antes de multiplicar.",
    difficulty: "intermediario",
    xpReward: 20,
    evidenceId: "ev-005",
    type: "numeric",
    unit: "cm³",
    inputLabel: "INPUT SENSOR VOLUME",
  },
  {
    id: "c-06",
    roomId: "sala-06",
    title: "Energia de Contenção",
    story: ["Combine os registros recuperados nas salas anteriores."],
    question: "Qual é a energia de estabilização necessária?",
    data: [
      { label: "Capacidade do reator", value: "Registro da Sala de Controle" },
      { label: "Absorção do tanque", value: "Registro do Tanque de Isolamento" },
      { label: "Retorno do sensor", value: "Registro da Sala de Observação" },
    ],
    formulaHint: "E = reator − tanque + sensor",
    hint: "Abra o arquivo de evidências: cada documento guarda o valor que você calculou naquela sala.",
    difficulty: "dificil",
    xpReward: 30,
    evidenceId: "ev-006",
    type: "numeric",
    inputLabel: "INPUT STABILIZATION ENERGY",
  },
  {
    id: "f-011",
    roomId: "portal",
    title: "Protocolo 011",
    story: ["Volume.", "Superfície.", "Experimento.", "Identificação."],
    question: "Qual é a sequência final que fecha o portal?",
    data: [],
    formulaHint: "Cada palavra corresponde a um registro marcado nas suas evidências.",
    hint: "Procure nas evidências os carimbos com as palavras do documento. Use a ordem em que elas aparecem.",
    difficulty: "dificil",
    xpReward: 100,
    evidenceId: "ev-007",
    type: "code",
    inputLabel: "ENTER FINAL SEQUENCE",
  },
];

/** Protocolo de treinamento — exercícios de revisão para recuperar vidas. */
export const TRAINING_CHALLENGES: Challenge[] = [
  {
    id: "t-01",
    roomId: "treinamento",
    title: "Simulação: Cubo de Contenção",
    story: ["Um cubo de chumbo usado para guardar amostras."],
    question: "Qual é o volume de um cubo de aresta 4 cm?",
    data: [{ label: "Aresta", value: "4 cm" }],
    formulaHint: "V = a³",
    hint: "Multiplique a aresta por ela mesma três vezes.",
    difficulty: "facil",
    xpReward: 5,
    type: "numeric",
    unit: "cm³",
    inputLabel: "INPUT VOLUME",
  },
  {
    id: "t-02",
    roomId: "treinamento",
    title: "Simulação: Cone de Ventilação",
    story: ["Um duto cônico do sistema de ventilação."],
    question: "Qual é o volume de um cone com raio 3 m e altura 5 m (π = 3)?",
    data: [
      { label: "Raio", value: "3 m" },
      { label: "Altura", value: "5 m" },
      { label: "π", value: "3" },
    ],
    formulaHint: "V = (π · r² · h) / 3",
    hint: "O cone ocupa um terço do cilindro de mesma base e altura.",
    difficulty: "facil",
    xpReward: 5,
    type: "numeric",
    unit: "m³",
    inputLabel: "INPUT VOLUME",
  },
  {
    id: "t-03",
    roomId: "treinamento",
    title: "Simulação: Antena Piramidal",
    story: ["Uma antena com formato de pirâmide de base quadrada."],
    question: "Qual é o volume de uma pirâmide de base quadrada com aresta 6 cm e altura 5 cm?",
    data: [
      { label: "Aresta da base", value: "6 cm" },
      { label: "Altura", value: "5 cm" },
    ],
    formulaHint: "V = (Ab · h) / 3",
    hint: "Calcule a área da base quadrada primeiro.",
    difficulty: "facil",
    xpReward: 5,
    type: "numeric",
    unit: "cm³",
    inputLabel: "INPUT VOLUME",
  },
];

export const ALL_CHALLENGES: Challenge[] = [...CHALLENGES, ...TRAINING_CHALLENGES];

export function getRoom(id: string): Room | undefined {
  return ROOMS.find((r) => r.id === id);
}

export function getChallenge(id: string): Challenge | undefined {
  return ALL_CHALLENGES.find((c) => c.id === id);
}

export function getRoomChallenge(roomId: string): Challenge | undefined {
  const room = getRoom(roomId);
  return room ? getChallenge(room.challengeId) : undefined;
}

export function nextRoom(roomId: string): Room | undefined {
  const room = getRoom(roomId);
  if (!room) return undefined;
  return ROOMS.find((r) => r.order === room.order + 1);
}
