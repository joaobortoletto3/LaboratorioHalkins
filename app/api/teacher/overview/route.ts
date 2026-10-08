import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSupabase } from "@/lib/supabase/server";
import { requireProfessor } from "@/lib/server/teacher-guard";
import { buildStudentSummaries } from "@/lib/server/student-summaries";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured) return NextResponse.json({ mode: "demo" });
  const guard = await requireProfessor();
  if (guard instanceof NextResponse) return guard;
  try {
    const admin = getAdminSupabase();
    const students = await buildStudentSummaries(admin);
    return NextResponse.json({ mode: "supabase", students });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar os dados da central." }, { status: 500 });
  }
}
