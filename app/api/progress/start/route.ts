import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSupabase, getServerSupabase } from "@/lib/supabase/server";
import { buildState, persistDiff } from "@/lib/server/state";
import { markRoomStarted } from "@/lib/game";

export const dynamic = "force-dynamic";

/** Registra o início de uma sala (RF06). */
export async function POST(req: Request) {
  if (!isSupabaseConfigured) return NextResponse.json({ ok: true, mode: "demo" });
  const { roomId } = (await req.json().catch(() => ({}))) as { roomId?: string };
  if (!roomId) return NextResponse.json({ error: "Sala inválida." }, { status: 400 });
  try {
    const sb = getServerSupabase();
    const { data } = await sb.auth.getUser();
    if (!data.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const admin = getAdminSupabase();
    const before = await buildState(admin, data.user.id);
    if (!before) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
    const after = markRoomStarted(before, roomId);
    if (after !== before) await persistDiff(admin, data.user.id, before, after);
    return NextResponse.json({ ok: true, state: after });
  } catch {
    return NextResponse.json({ error: "Não foi possível registrar o início do setor." }, { status: 500 });
  }
}
