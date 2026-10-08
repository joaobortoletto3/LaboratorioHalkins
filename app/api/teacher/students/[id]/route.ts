import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSupabase } from "@/lib/supabase/server";
import { requireProfessor } from "@/lib/server/teacher-guard";
import { buildState, summarize } from "@/lib/server/state";
import type { StudentDetail } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured) return NextResponse.json({ mode: "demo" });
  const guard = await requireProfessor();
  if (guard instanceof NextResponse) return guard;
  try {
    const state = await buildState(getAdminSupabase(), params.id);
    if (!state) return NextResponse.json({ error: "Agente não encontrado." }, { status: 404 });
    const detail: StudentDetail = { ...summarize(state), state };
    return NextResponse.json({ mode: "supabase", student: detail });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar o agente." }, { status: 500 });
  }
}
