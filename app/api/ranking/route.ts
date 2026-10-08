import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface RankingRow {
  id: string;
  name: string;
  level: number;
  xp: number;
  weeklyXp: number;
  streak: number;
}

export async function GET() {
  if (!isSupabaseConfigured) return NextResponse.json({ mode: "demo" });
  const sb = getServerSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data, error } = await sb.rpc("weekly_ranking");
  if (error) return NextResponse.json({ error: "Ranking indisponível." }, { status: 500 });
  const rows: RankingRow[] = ((data ?? []) as { id: string; name: string; level: number; xp: number; weekly_xp: number; current_streak: number }[]).map(
    (r) => ({ id: r.id, name: r.name, level: r.level, xp: r.xp, weeklyXp: r.weekly_xp, streak: r.current_streak }),
  );
  return NextResponse.json({ mode: "supabase", rows, me: auth.user.id });
}
