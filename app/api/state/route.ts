import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";
import { buildState } from "@/lib/server/state";
import type { StateResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured) return NextResponse.json<StateResponse>({ mode: "demo" });
  try {
    const sb = getServerSupabase();
    const { data } = await sb.auth.getUser();
    if (!data.user) return NextResponse.json<StateResponse>({ mode: "supabase", error: "unauthorized" }, { status: 401 });
    const state = await buildState(sb, data.user.id);
    if (!state) return NextResponse.json<StateResponse>({ mode: "supabase", error: "profile_not_found" }, { status: 404 });
    return NextResponse.json<StateResponse>({ mode: "supabase", state }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json<StateResponse>({ mode: "supabase", error: "server_error" }, { status: 500 });
  }
}
