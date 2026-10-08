"use client";

import { useEffect, useState } from "react";
import type { GameState } from "@/types";
import { summarizeClient } from "@/lib/summary";

export interface RankingEntry {
  id: string;
  name: string;
  level: number;
  xp: number;
  weeklyXp: number;
  streak: number;
}

/** Ranking semanal sem participantes fictícios. */
export function useRanking(me?: GameState | null) {
  const [rows, setRows] = useState<RankingEntry[]>([]);
  const [meId, setMeId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch("/api/ranking", { cache: "no-store" });
        if (!res.ok) throw new Error("Ranking indisponível");
        const json = (await res.json()) as { mode?: string; rows?: RankingEntry[]; me?: string };
        if (cancelled) return;
        if (json.mode === "supabase" && json.rows) {
          setDemo(false);
          setRows(json.rows);
          setMeId(json.me);
          setLoading(false);
          return;
        }
        if (json.mode !== "demo") throw new Error("Ranking indisponível");
      } catch {
        if (cancelled) return;
        setRows([]);
        setMeId(undefined);
        setError("Não foi possível carregar o ranking. Verifique sua conexão ou entre novamente.");
        setLoading(false);
        return;
      }
      if (cancelled) return;
      setDemo(true);
      const list: RankingEntry[] = [];
      if (me) {
        const s = summarizeClient(me);
        list.push({ id: s.id, name: s.name, level: s.level, xp: s.xp, weeklyXp: s.weeklyXp, streak: s.streak });
        setMeId(s.id);
      }
      setRows(list.sort((a, b) => b.weeklyXp - a.weeklyXp || b.xp - a.xp));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [me]);
  return { rows, meId, loading, error, demo };
}
