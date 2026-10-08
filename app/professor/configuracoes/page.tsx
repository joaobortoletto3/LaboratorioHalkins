"use client";

import { useEffect, useState } from "react";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { ThemedLoader } from "@/components/hawkins/ThemedLoader";

const DEFAULTS: Record<string, string> = {
  class_name: "Turma Hawkins 011",
  initial_lives: "5",
  pi_value: "3",
  show_hints: "true",
  effects_intensity: "normal",
};

const KEY = "hawkins_settings_v1";

export default function ConfiguracoesPage() {
  const [mode, setMode] = useState<"loading" | "demo" | "supabase">("loading");
  const [s, setS] = useState<Record<string, string>>(DEFAULTS);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const json = (await res.json()) as { mode?: string; settings?: Record<string, string> };
        if (json.mode === "supabase") {
          setMode("supabase");
          setS({ ...DEFAULTS, ...(json.settings ?? {}) });
          return;
        }
      } catch {
        /* demo */
      }
      setMode("demo");
      try {
        setS({ ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, string>) });
      } catch {
        setS(DEFAULTS);
      }
    })();
  }, []);

  const save = async () => {
    if (mode === "supabase") {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: s }) });
      setMsg(res.ok ? "Configurações salvas." : "Não foi possível salvar.");
    } else {
      localStorage.setItem(KEY, JSON.stringify(s));
      setMsg("Configurações salvas neste navegador (modo demo).");
    }
    setTimeout(() => setMsg(null), 2500);
  };

  if (mode === "loading") return <ThemedLoader />;
  const set = (k: string, v: string) => setS((p) => ({ ...p, [k]: v }));

  return (
    <div className="max-w-2xl">
      <HawkinsHeader code="PARÂMETROS DO SISTEMA" title="Configurações" subtitle="Preferências gerais da turma e da experiência." />
      <div className="panel corner space-y-5 p-6">
        <label className="block">
          <span className="label mb-1.5 block">Nome da turma</span>
          <input className="input" value={s.class_name} onChange={(e) => set("class_name", e.target.value)} />
        </label>
        <label className="block">
          <span className="label mb-1.5 block">Vidas iniciais</span>
          <input className="input" type="number" min={1} max={10} value={s.initial_lives} onChange={(e) => set("initial_lives", e.target.value)} />
        </label>
        <label className="block">
          <span className="label mb-1.5 block">Valor de π usado nos enunciados</span>
          <select className="input" value={s.pi_value} onChange={(e) => set("pi_value", e.target.value)}>
            <option value="3">3</option>
            <option value="3.14">3,14</option>
          </select>
        </label>
        <label className="flex items-center justify-between gap-3">
          <span className="label">Exibir pistas aos alunos</span>
          <input type="checkbox" className="h-5 w-5 accent-[#D71920]" checked={s.show_hints === "true"} onChange={(e) => set("show_hints", String(e.target.checked))} />
        </label>
        <label className="block">
          <span className="label mb-1.5 block">Intensidade dos efeitos visuais</span>
          <select className="input" value={s.effects_intensity} onChange={(e) => set("effects_intensity", e.target.value)}>
            <option value="suave">Suave</option>
            <option value="normal">Normal</option>
          </select>
        </label>
        {msg && <p className="border border-term/40 bg-term/10 p-3 font-mono text-xs text-term">{msg}</p>}
        <button className="btn-primary w-full" onClick={save}>
          SALVAR CONFIGURAÇÕES
        </button>
      </div>
    </div>
  );
}
