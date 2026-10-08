import { NextResponse } from "next/server";
import { DEMO_ROLE_COOKIE, isSupabaseConfigured } from "@/lib/supabase/config";

/** Sessão do MODO DEMONSTRAÇÃO (apenas quando o Supabase não está configurado). */
export async function POST(req: Request) {
  if (isSupabaseConfigured) return NextResponse.json({ error: "Modo demo desativado." }, { status: 403 });
  const { role } = (await req.json().catch(() => ({}))) as { role?: string };
  const value = role === "professor" ? "professor" : "aluno";
  const res = NextResponse.json({ ok: true, role: value });
  res.cookies.set(DEMO_ROLE_COOKIE, value, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DEMO_ROLE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
