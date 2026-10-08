"use client";

import { useEffect, useState } from "react";
import { Gauge, Layers, ListChecks, Puzzle, Settings, Trophy, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/layout/AppShell";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const NAV: NavItem[] = [
  { href: "/professor/dashboard", label: "Central de Controle", icon: Gauge },
  { href: "/professor/alunos", label: "Alunos", icon: Users },
  { href: "/professor/desafios", label: "Desafios", icon: Puzzle },
  { href: "/professor/questoes-complementares", label: "Questões Complementares", icon: ListChecks },
  { href: "/professor/setores", label: "Setores", icon: Layers },
  { href: "/professor/ranking", label: "Ranking", icon: Trophy },
  { href: "/professor/configuracoes", label: "Configurações", icon: Settings },
];

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState("SUPERVISOR");
  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    void sb.auth.getUser().then(({ data }) => {
      const n = (data.user?.user_metadata as { name?: string } | undefined)?.name;
      if (n) setName(n.toUpperCase());
    });
  }, []);

  const signOut = async () => {
    const sb = getBrowserSupabase();
    if (sb) await sb.auth.signOut();
    await fetch("/api/auth/demo", { method: "DELETE" }).catch(() => undefined);
    window.location.href = "/login";
  };

  return (
    <AppShell
      nav={NAV}
      roleLabel="CENTRO DE COMANDO · PROFESSOR"
      onSignOut={signOut}
      demo={!isSupabaseConfigured}
      sidebarExtra={
        <div>
          <p className="label">SUPERVISOR</p>
          <p className="mt-1 truncate font-mono text-sm text-bone">{name}</p>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
