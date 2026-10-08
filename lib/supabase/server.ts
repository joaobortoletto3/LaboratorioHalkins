import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/** Cliente com a sessão do usuário (RLS aplicado). */
export function getServerSupabase(): SupabaseClient {
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          /* chamado em Server Component: ignorado */
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          /* ignorado */
        }
      },
    },
  });
}

/** Cliente administrativo (service role). Usar SOMENTE em rotas de servidor após verificar o chamador. */
export function getAdminSupabase(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada");
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function getCurrentUserId(): Promise<string | null> {
  const sb = getServerSupabase();
  const { data } = await sb.auth.getUser();
  return data.user?.id ?? null;
}

export async function isProfessor(userId: string): Promise<boolean> {
  const admin = getAdminSupabase();
  const { data } = await admin.from("profiles").select("role").eq("id", userId).single();
  return (data as { role?: string } | null)?.role === "professor";
}
