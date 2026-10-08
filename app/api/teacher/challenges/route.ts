import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSupabase } from "@/lib/supabase/server";
import { requireProfessor } from "@/lib/server/teacher-guard";
import { fromRow, parseChallengeInput, toRow, type ChallengeRow } from "@/lib/server/challenge-mapper";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured) return NextResponse.json({ mode: "demo" });
  const guard = await requireProfessor();
  if (guard instanceof NextResponse) return guard;
  const { data, error } = await getAdminSupabase().from("challenges").select("*").order("order_index");
  if (error) return NextResponse.json({ error: "Não foi possível carregar os desafios." }, { status: 500 });
  return NextResponse.json({ mode: "supabase", challenges: ((data ?? []) as ChallengeRow[]).map(fromRow) });
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured) return NextResponse.json({ mode: "demo" });
  const guard = await requireProfessor();
  if (guard instanceof NextResponse) return guard;
  const input = parseChallengeInput(await req.json().catch(() => null));
  if (!input) return NextResponse.json({ error: "Preencha título, sala, pergunta e resposta." }, { status: 400 });
  const { error } = await getAdminSupabase().from("challenges").insert(toRow(input));
  if (error) return NextResponse.json({ error: "Não foi possível salvar o desafio." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
