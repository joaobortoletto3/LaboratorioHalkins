"use client";

import { Award, BookOpen, FileSearch, Home, Map, NotebookPen, Trophy, User } from "lucide-react";
import { HawkinsProvider, useHawkins } from "@/hooks/useHawkins";
import { AppShell, type NavItem } from "@/components/layout/AppShell";
import { StudentSidebarCard } from "@/components/layout/StudentSidebarCard";
import { RewardToasts } from "@/components/gamification/RewardToasts";
import { ThemedLoader } from "@/components/hawkins/ThemedLoader";
import { UpsideFlash } from "@/components/hawkins/UpsideFlash";
import { corruptionLevel } from "@/lib/game";

const NAV: NavItem[] = [
  { href: "/aluno/dashboard", label: "Início", icon: Home },
  { href: "/aluno/laboratorio", label: "Laboratório", icon: Map },
  { href: "/aluno/evidencias", label: "Evidências", icon: FileSearch },
  { href: "/aluno/anotacoes", label: "Anotações", icon: NotebookPen },
  { href: "/aluno/biblioteca", label: "Arquivo de Pesquisa", icon: BookOpen },
  { href: "/aluno/conquistas", label: "Conquistas", icon: Award },
  { href: "/aluno/ranking", label: "Ranking", icon: Trophy },
  { href: "/aluno/perfil", label: "Perfil", icon: User },
];

function Shell({ children }: { children: React.ReactNode }) {
  const { mode, state, signOut, error } = useHawkins();
  const corruption = corruptionLevel(state);
  return (
    <AppShell nav={NAV} roleLabel="AGENTE DE CAMPO" onSignOut={signOut} sidebarExtra={<StudentSidebarCard />} corruption={corruption} demo={mode === "demo"}>
      {corruption >= 0.5 && <UpsideFlash intensity={corruption * 0.6} />}
      {mode === "loading" || (!state && !error) ? (
        <ThemedLoader />
      ) : error ? (
        <div className="panel-red p-8 text-center">
          <p className="title-solid text-2xl">SYSTEM FAILURE</p>
          <p className="mt-2 text-ash">{error}</p>
          <button className="btn-primary mt-6" onClick={signOut}>
            VOLTAR AO LOGIN
          </button>
        </div>
      ) : (
        children
      )}
      <RewardToasts />
    </AppShell>
  );
}

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <HawkinsProvider>
      <Shell>{children}</Shell>
    </HawkinsProvider>
  );
}

