import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { DEMO_ROLE_COOKIE, SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config";

/** Protege /aluno e /professor (RNF02) e mantém a sessão Supabase atualizada (RNF07). */
export async function middleware(req: NextRequest) {
  const url = SUPABASE_URL;
  const anon = SUPABASE_ANON_KEY;
  const path = req.nextUrl.pathname;
  const isStudent = path.startsWith("/aluno");
  const isTeacher = path.startsWith("/professor");

  const redirectTo = (to: string) => {
    const u = req.nextUrl.clone();
    u.pathname = to;
    u.search = "";
    return NextResponse.redirect(u);
  };

  // ----- MODO DEMO -----
  if (!url || !anon) {
    const role = req.cookies.get(DEMO_ROLE_COOKIE)?.value;
    if ((isStudent || isTeacher) && !role) return redirectTo("/login");
    if (isTeacher && role !== "professor") return redirectTo("/aluno/dashboard");
    if (isStudent && role === "professor") return redirectTo("/professor/dashboard");
    return NextResponse.next();
  }

  // ----- MODO SUPABASE -----
  let res = NextResponse.next({ request: { headers: req.headers } });
  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        req.cookies.set({ name, value, ...options });
        res = NextResponse.next({ request: { headers: req.headers } });
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        req.cookies.set({ name, value: "", ...options });
        res = NextResponse.next({ request: { headers: req.headers } });
        res.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!isStudent && !isTeacher) return res;
  if (!data.user) return redirectTo("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  const role = (profile as { role?: string } | null)?.role ?? "aluno";
  if (isTeacher && role !== "professor") return redirectTo("/aluno/dashboard");
  if (isStudent && role === "professor") return redirectTo("/professor/dashboard");
  return res;
}

export const config = {
  matcher: ["/aluno/:path*", "/professor/:path*"],
};
