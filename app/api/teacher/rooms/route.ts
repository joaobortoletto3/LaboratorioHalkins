import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSupabase } from "@/lib/supabase/server";
import { requireProfessor } from "@/lib/server/teacher-guard";
import type { TeacherRoom } from "@/types";

export const dynamic = "force-dynamic";

interface RoomRow {
  id: string;
  name: string;
  sector: string;
  description: string | null;
  difficulty: TeacherRoom["difficulty"];
  order_index: number;
  status: TeacherRoom["status"];
}

export async function GET() {
  if (!isSupabaseConfigured) return NextResponse.json({ mode: "demo" });
  const guard = await requireProfessor();
  if (guard instanceof NextResponse) return guard;
  const { data } = await getAdminSupabase().from("rooms").select("id,name,sector,description,difficulty,order_index,status").order("order_index");
  const rooms: TeacherRoom[] = ((data ?? []) as RoomRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    sector: r.sector,
    description: r.description ?? "",
    difficulty: r.difficulty,
    orderIndex: r.order_index,
    status: r.status,
  }));
  return NextResponse.json({ mode: "supabase", rooms });
}

export async function PUT(req: Request) {
  if (!isSupabaseConfigured) return NextResponse.json({ mode: "demo" });
  const guard = await requireProfessor();
  if (guard instanceof NextResponse) return guard;
  const body = (await req.json().catch(() => null)) as { rooms?: TeacherRoom[] } | null;
  if (!body?.rooms) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const admin = getAdminSupabase();
  for (const r of body.rooms) {
    await admin
      .from("rooms")
      .update({ difficulty: r.difficulty, order_index: r.orderIndex, status: r.status, description: r.description })
      .eq("id", r.id);
  }
  return NextResponse.json({ ok: true });
}
