"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/hawkins/AuthFrame";
import { PasswordField } from "@/components/hawkins/PasswordField";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEMO_EMAIL_KEY, DEMO_NAME_KEY } from "@/hooks/useHawkins";
import { playSound } from "@/hooks/useSound";

function friendlyAuthError(msg: string): string {
  if (/invalid login/i.test(msg)) return "Credenciais não reconhecidas. Verifique e-mail e senha.";
  if (/email not confirmed/i.test(msg)) return "E-mail ainda não confirmado. Verifique sua caixa de entrada.";
  return "Não foi possível acessar o sistema agora. Tente novamente.";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enterDemo = async (role: "aluno" | "professor", name?: string, mail?: string) => {
    setError(null);
    setLoading(true);
    try {
      if (name) localStorage.setItem(DEMO_NAME_KEY, name);
      if (mail) localStorage.setItem(DEMO_EMAIL_KEY, mail);
      const response = await fetch("/api/auth/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      if (!response.ok) throw new Error("Demo unavailable");
      playSound("success");
      router.push(role === "professor" ? "/professor/dashboard" : "/aluno/dashboard");
      router.refresh();
    } catch {
      setError("Não foi possível iniciar a demonstração. Tente novamente.");
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes("@") || password.length < 6) {
      setError("Informe um e-mail válido e uma senha com pelo menos 6 caracteres.");
      return;
    }
    if (!isSupabaseConfigured) {
      const role = email.toLowerCase().startsWith("professor") ? "professor" : "aluno";
      const stored = localStorage.getItem(DEMO_NAME_KEY);
      await enterDemo(role, stored ?? email.split("@")[0], email);
      return;
    }
    setLoading(true);
    try {
      const sb = getBrowserSupabase();
      if (!sb) throw new Error("Auth unavailable");
      const { data, error: err } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (err || !data.user) {
        playSound("error");
        setError(friendlyAuthError(err?.message ?? ""));
        setLoading(false);
        return;
      }
      const { data: profile } = await sb.from("profiles").select("role").eq("id", data.user.id).single();
      playSound("success");
      router.push((profile as { role?: string } | null)?.role === "professor" ? "/professor/dashboard" : "/aluno/dashboard");
      router.refresh();
    } catch {
      setError("Não foi possível conectar. Verifique sua conexão e tente novamente.");
      setLoading(false);
    }
  };

  return (
    <AuthFrame subtitle="ACESSO AO LABORATÓRIO" mode="login">
      <form onSubmit={onSubmit} className="space-y-5" aria-busy={loading}>
        <label className="block">
          <span className="mb-2 block font-mono text-[11px] tracking-[0.18em] text-ash">E-MAIL</span>
          <input className="input-term" name="email" type="email" autoComplete="email" required disabled={loading} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
        </label>
        <PasswordField value={password} onChange={setPassword} disabled={loading} />
        {error && (
          <p role="alert" className="border border-flare/40 bg-rust/20 px-3 py-2 font-mono text-xs text-flare">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "VERIFICANDO CREDENCIAIS..." : "ACESSAR SISTEMA"}
        </button>
      </form>

      {!isSupabaseConfigured && (
        <div className="mt-6 border-t border-bone/10 pt-5">
          <p className="mb-3 text-center text-xs text-ash">Conheça a experiência em modo demonstração</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" className="btn-ghost !px-3 !py-2 !text-[11px]" disabled={loading} onClick={() => enterDemo("aluno")}>
              ENTRAR COMO ALUNO
            </button>
            <button type="button" className="btn-ghost !px-3 !py-2 !text-[11px]" disabled={loading} onClick={() => enterDemo("professor", "Prof. Demo", "professor@hawkins.demo")}>
              ENTRAR COMO PROFESSOR
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 text-center font-mono text-xs text-ash">
        Novo integrante?{" "}
        <Link href="/cadastro" className="underline underline-offset-4 hover:opacity-100">
          Solicitar credencial
        </Link>
      </p>
    </AuthFrame>
  );
}
