export const MAX_LEVEL = 25;

export const LEVEL_TITLES: { min: number; title: string }[] = [
  { min: 1, title: "RECRUTA" },
  { min: 5, title: "AGENTE" },
  { min: 10, title: "INVESTIGADOR" },
  { min: 15, title: "ESPECIALISTA HAWKINS" },
  { min: 20, title: "PESQUISADOR DIMENSIONAL" },
  { min: 25, title: "AGENTE DE CONTENÇÃO" },
];

/** XP total necessário para alcançar o nível informado. */
export function xpForLevel(level: number): number {
  return 50 * (level - 1) * level;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level++;
  return level;
}

export function levelTitle(level: number): string {
  let title = LEVEL_TITLES[0].title;
  for (const t of LEVEL_TITLES) if (level >= t.min) title = t.title;
  return title;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const next = xpForLevel(Math.min(level + 1, MAX_LEVEL));
  const pct = level >= MAX_LEVEL ? 100 : Math.min(100, ((xp - floor) / (next - floor)) * 100);
  return { level, floor, next, pct, title: levelTitle(level) };
}

/** Nível de credencial exibido no painel (1 a 5). */
export function clearanceLevel(level: number): number {
  return Math.min(5, Math.max(1, Math.ceil(level / 2)));
}
