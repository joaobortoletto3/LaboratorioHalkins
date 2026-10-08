import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";
import { complementaryChallenge, isComplementaryChallenge } from "@/lib/complementary";
import type { Difficulty } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured) return NextResponse.json({ mode: "demo", challenges: [] });
  try {
    const sb = getServerSupabase();
    const { data: auth, error: authError } = await sb.auth.getUser();
    if (authError || !auth.user) return NextResponse.json({ error: "Faça login para acessar as questões." }, { status: 401 });
    const { data, error } = await sb.from("challenges")
      .select("id,title,story,question,content,hint,difficulty,xp_reward,type")
      .eq("active", true).order("order_index").order("id");
    if (error) throw error;
    const rows = (data ?? []) as {
      id: string; title: string; story: string | null; question: string; content: string | null;
      hint: string | null; difficulty: Difficulty; xp_reward: number; type: "numeric" | "code";
    }[];
    return NextResponse.json({ mode: "supabase", challenges: rows.filter((c) => isComplementaryChallenge(c.id)).map((c) => complementaryChallenge({
      ...c, story: c.story ?? "", content: c.content ?? "", hint: c.hint ?? "", xpReward: c.xp_reward,
    })) });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar as questões complementares. Tente novamente." }, { status: 500 });
  }
}
