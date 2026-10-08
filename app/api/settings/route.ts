import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSupabase } from "@/lib/supabase/server";
import { requireProfessor } from "@/lib/server/teacher-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured) return NextResponse.json({ mode: "demo" });
  const guard = await requireProfessor();
  if (guard instanceof NextResponse) return guard;
  const { data } = await getAdminSupabase().from("settings").select("key,value");
  const settings: Record<string, string> = {};
  for (const r of (data ?? []) as { key: string; value: string }[]) settings[r.key] = r.value;
  return NextResponse.json({ mode: "supabase", settings });
}

export async function PUT(req: Request) {
  if (!isSupabaseConfigured) return NextResponse.json({ mode: "demo" });
  const guard = await requireProfessor();
  if (guard instanceof NextResponse) return guard;
  const body = (await req.json().catch(() => null)) as { settings?: Record<string, string> } | null;
  if (!body?.settings) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const rows = Object.entries(body.settings).map(([key, value]) => ({ key, value: String(value).slice(0, 200) }));
  const { error } = await getAdminSupabase().from("settings").upsert(rows, { onConflict: "key" });
  if (error) return NextResponse.json({ error: "Não foi possível salvar as configurações." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
