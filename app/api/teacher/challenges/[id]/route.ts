import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSupabase } from "@/lib/supabase/server";
import { requireProfessor } from "@/lib/server/teacher-guard";
import { parseChallengeInput, toRow } from "@/lib/server/challenge-mapper";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured) return NextResponse.json({ mode: "demo" });
  const guard = await requireProfessor();
  if (guard instanceof NextResponse) return guard;
  const input = parseChallengeInput({ ...((await req.json().catch(() => ({}))) as object), id: params.id });
  if (!input) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const row = toRow(input);
  const { error } = await getAdminSupabase().from("challenges").update(row).eq("id", params.id);
  if (error) return NextResponse.json({ error: "Não foi possível atualizar o desafio." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured) return NextResponse.json({ mode: "demo" });
  const guard = await requireProfessor();
  if (guard instanceof NextResponse) return guard;
  const { error } = await getAdminSupabase().from("challenges").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: "Não foi possível excluir. Desafios com tentativas registradas devem ser desativados." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
