/** Numeric input shared by validation and the student's already verified records. */
export function parseNumeric(v: string): number | null {
  const cleaned = v.trim().replace(/\s/g, "")
    .replace(/(?:(?:cm|m)(?:\^?[23]|[²³])?|ml|l|kg|g)$/i, "")
    .replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
