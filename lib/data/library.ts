import type { ShapeSpec } from "@/types";

export interface LibraryEntry {
  id: string;
  name: string;
  codename: string;
  shape: ShapeSpec;
  formulas: { label: string; formula: string }[];
  explanation: string;
  example: string;
}

export const LIBRARY: LibraryEntry[] = [
  {
    id: "cubo",
    name: "CUBO",
    codename: "CUBE",
    shape: { kind: "cube", dims: { a: 4 } },
    formulas: [
      { label: "Volume", formula: "V = a³" },
      { label: "Área total", formula: "A = 6a²" },
      { label: "Diagonal", formula: "d = a√3" },
    ],
    explanation: "Sólido com 6 faces quadradas congruentes, 12 arestas iguais e 8 vértices. Todas as dimensões medem a.",
    example: "Um cubo de aresta 2 m tem volume 2³ = 8 m³ e área total 6 · 2² = 24 m².",
  },
  {
    id: "paralelepipedo",
    name: "PARALELEPÍPEDO",
    codename: "RECTANGULAR PRISM",
    shape: { kind: "box", dims: { w: 6, d: 4, h: 3 } },
    formulas: [
      { label: "Volume", formula: "V = a · b · c" },
      { label: "Área total", formula: "A = 2(ab + ac + bc)" },
      { label: "Diagonal", formula: "d = √(a² + b² + c²)" },
    ],
    explanation: "Prisma cujas 6 faces são retângulos. As faces opostas são iguais, formando 3 pares.",
    example: "Uma caixa 5 × 2 × 3 cm tem volume 30 cm³ e área 2(10 + 15 + 6) = 62 cm².",
  },
  {
    id: "prisma",
    name: "PRISMA",
    codename: "PRISM",
    shape: { kind: "prism", dims: { r: 3, h: 5 } },
    formulas: [
      { label: "Volume", formula: "V = Ab · h" },
      { label: "Área total", formula: "A = 2Ab + Al" },
    ],
    explanation: "Sólido com duas bases poligonais paralelas e congruentes ligadas por faces laterais retangulares.",
    example: "Prisma triangular com base de área 10 cm² e altura 4 cm tem volume 40 cm³.",
  },
  {
    id: "cilindro",
    name: "CILINDRO",
    codename: "CYLINDER",
    shape: { kind: "cylinder", dims: { r: 3, h: 6 } },
    formulas: [
      { label: "Volume", formula: "V = π r² h" },
      { label: "Área lateral", formula: "Al = 2π r h" },
      { label: "Área total", formula: "A = 2π r (r + h)" },
    ],
    explanation: "Sólido de duas bases circulares paralelas. Seu volume é a área da base (πr²) multiplicada pela altura.",
    example: "Cilindro com r = 2 m e h = 5 m (π = 3): V = 3 · 4 · 5 = 60 m³.",
  },
  {
    id: "cone",
    name: "CONE",
    codename: "CONE",
    shape: { kind: "cone", dims: { r: 3, h: 6 } },
    formulas: [
      { label: "Volume", formula: "V = (π r² h) / 3" },
      { label: "Geratriz", formula: "g² = r² + h²" },
      { label: "Área total", formula: "A = π r (r + g)" },
    ],
    explanation: "Sólido com uma base circular e um vértice. Ocupa um terço do cilindro de mesma base e altura.",
    example: "Cone com r = 2 cm e h = 6 cm (π = 3): V = 3 · 4 · 6 / 3 = 24 cm³.",
  },
  {
    id: "piramide",
    name: "PIRÂMIDE",
    codename: "PYRAMID",
    shape: { kind: "pyramid", dims: { a: 5, h: 5 } },
    formulas: [
      { label: "Volume", formula: "V = (Ab · h) / 3" },
      { label: "Área total", formula: "A = Ab + Al" },
    ],
    explanation: "Sólido com uma base poligonal e faces laterais triangulares que se encontram no vértice.",
    example: "Pirâmide de base quadrada com aresta 3 m e altura 4 m: V = 9 · 4 / 3 = 12 m³.",
  },
  {
    id: "esfera",
    name: "ESFERA",
    codename: "SPHERE",
    shape: { kind: "sphere", dims: { r: 3 } },
    formulas: [
      { label: "Volume", formula: "V = (4/3) π r³" },
      { label: "Área da superfície", formula: "A = 4π r²" },
      { label: "Semiesfera", formula: "V = (2/3) π r³" },
    ],
    explanation: "Conjunto de pontos equidistantes de um centro. A semiesfera é exatamente metade da esfera.",
    example: "Esfera de raio 2 cm (π = 3): V = 4/3 · 3 · 8 = 32 cm³.",
  },
];
