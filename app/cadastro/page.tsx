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

function signupErrorMessage(error: { code?: string; message: string; status?: number }): string {
  if (["user_already_exists", "email_exists"].includes(error.code ?? "") || /already registered/i.test(error.message)) {
    return "Este e-mail já possui credencial. Faça login.";
  }
  if (error.code === "over_email_send_rate_limit") return "O limite de envio de e-mails foi atingido. Aguarde antes de tentar novamente.";
  if (error.code === "over_request_rate_limit" || error.status === 429) return "Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.";
  if (error.code === "weak_password") return "A senha não atende aos requisitos de segurança. Use uma senha mais longa, com letras, números e símbolos.";
  if (error.code === "email_address_invalid") return "Este endereço de e-mail não é válido. Confira e tente novamente.";
  if (error.code === "signup_disabled" || error.code === "email_provider_disabled") return "O cadastro por e-mail está desativado. Entre em contato com a administração.";
  if (error.code === "email_address_not_authorized" || /error sending confirmation email/i.test(error.message)) return "Não foi possível enviar o e-mail de confirmação. Entre em contato com a administração.";
  if (/database error saving new user/i.test(error.message)) return "Não foi possível salvar sua conta no banco de dados. Entre em contato com a administração.";
  return "Não foi possível criar a credencial agora. Tente novamente mais tarde.";
}

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (name.trim().length < 2) return setError("Informe seu nome de agente.");
    if (!email.includes("@")) return setError("Informe um e-mail válido.");
    if (password.length < 6) return setError("A senha precisa ter pelo menos 6 caracteres.");
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        localStorage.setItem(DEMO_NAME_KEY, name.trim());
        localStorage.setItem(DEMO_EMAIL_KEY, email.trim());
        localStorage.removeItem("hawkins_state_v1");
        const response = await fetch("/api/auth/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "aluno" }) });
        if (!response.ok) throw new Error("Demo unavailable");
        playSound("success");
        router.push("/aluno/dashboard");
        router.refresh();
        return;
      }

      const sb = getBrowserSupabase();
      if (!sb) throw new Error("Auth unavailable");
      const { data, error: err } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() }, emailRedirectTo: `${window.location.origin}/login` },
      });
      setLoading(false);
      if (err) {
        playSound("error");
        if (process.env.NODE_ENV === "development") {
          console.error("Falha no cadastro Supabase:", { code: err.code, status: err.status, message: err.message });
        }
        setError(signupErrorMessage(err));
        return;
      }
      if (data.session) {
        router.push("/aluno/dashboard");
        router.refresh();
      } else {
        setInfo("Credencial criada. Confirme seu e-mail para ativar o acesso e depois faça login.");
      }
    } catch {
      setError("Não foi possível conectar. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame subtitle="NOVA CREDENCIAL DE AGENTE" mode="cadastro">
      <form onSubmit={onSubmit} className="space-y-5" aria-busy={loading}>
        {!isSupabaseConfigured && (
          <p role="status" className="rounded-xl border border-term/40 bg-term/10 px-3 py-2 text-sm text-term">
            Modo demonstração: nome e e-mail ficam apenas neste navegador. Nenhuma conta será criada no Supabase.
          </p>
        )}
        <label className="block">
          <span className="mb-2 block font-mono text-[11px] tracking-[0.18em] text-ash">NOME</span>
          <input className="input-term" name="name" required minLength={2} disabled={loading || !!info} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Como podemos chamar você?" />
        </label>
        <label className="block">
          <span className="mb-2 block font-mono text-[11px] tracking-[0.18em] text-ash">E-MAIL</span>
          <input className="input-term" name="email" type="email" required disabled={loading || !!info} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="seu@email.com" />
        </label>
        <PasswordField value={password} onChange={setPassword} newPassword disabled={loading || !!info} />
        <p className="rounded-xl border border-bone/10 bg-void/40 px-3 py-3 text-xs leading-5 text-ash">Sua credencial começa como <span className="text-bone">aluno</span>. Se você é professor, solicite a liberação do seu perfil à administração do projeto.</p>
        {error && (
          <p role="alert" className="border border-flare/40 bg-rust/20 px-3 py-2 font-mono text-xs text-flare">
            {error}
          </p>
        )}
        {info && <p role="status" className="rounded-xl border border-term/40 bg-term/10 px-3 py-2 text-sm text-term">{info}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading || !!info}>
          {info ? "CONFIRME SEU E-MAIL" : loading ? "REGISTRANDO..." : "CRIAR CREDENCIAL"}
        </button>
      </form>
      <p className="mt-6 text-center font-mono text-xs text-ash">
        Já possui acesso?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Acessar sistema
        </Link>
      </p>
    </AuthFrame>
  );
}
