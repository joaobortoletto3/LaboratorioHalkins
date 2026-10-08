import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUserId, isProfessor } from "@/lib/supabase/server";

/** Garante que o chamador está autenticado e possui role "professor". */
export async function requireProfessor(): Promise<{ userId: string } | NextResponse> {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
  if (!(await isProfessor(userId))) return NextResponse.json({ error: "Acesso restrito a professores." }, { status: 403 });
  return { userId };
}
