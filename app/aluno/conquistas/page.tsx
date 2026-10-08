"use client";

import { useHawkins } from "@/hooks/useHawkins";
import { ACHIEVEMENTS } from "@/lib/data/achievements";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { AchievementCard } from "@/components/gamification/AchievementCard";

export default function ConquistasPage() {
  const { state } = useHawkins();
  if (!state) return null;
  return (
    <div>
      <HawkinsHeader code="CONDECORAÇÕES DE CAMPO" title="Conquistas" subtitle="Reconhecimentos concedidos pelo Departamento de Energia aos agentes de Hawkins.">
        <p className="font-mono text-sm text-bone">
          {state.achievements.length} / {ACHIEVEMENTS.length}
        </p>
      </HawkinsHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ACHIEVEMENTS.map((a) => (
          <AchievementCard key={a.id} achievement={a} unlocked={state.achievements.includes(a.id)} />
        ))}
      </div>
    </div>
  );
}
