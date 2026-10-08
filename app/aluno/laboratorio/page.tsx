"use client";

import { useHawkins } from "@/hooks/useHawkins";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { LaboratoryMap } from "@/components/laboratory/LaboratoryMap";
import { computeStats } from "@/lib/game";

export default function LaboratorioPage() {
  const { state } = useHawkins();
  if (!state) return null;
  const stats = computeStats(state);
  return (
    <div>
      <HawkinsHeader code="PLANTA CONFIDENCIAL — NÍVEIS 1 A 3" title="Mapa do Laboratório" subtitle="Avance pelos setores resolvendo os desafios. Cada setor concluído libera o próximo.">
        <div className="flex gap-4 font-mono text-[10px] tracking-[0.2em] text-ash">
          <span>
            <span className="text-term">●</span> CONCLUÍDO
          </span>
          <span>
            <span className="text-flare">●</span> ATUAL
          </span>
          <span>
            <span className="text-blood">●</span> BLOQUEADO
          </span>
          <span className="text-bone">{stats.completedRooms}/7</span>
        </div>
      </HawkinsHeader>
      <LaboratoryMap state={state} />
    </div>
  );
}
