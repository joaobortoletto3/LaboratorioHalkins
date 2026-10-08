"use client";

import { useHawkins } from "@/hooks/useHawkins";
import { EVIDENCES } from "@/lib/data/evidences";
import { getRoom } from "@/lib/data/rooms";
import { correctAnswerFor } from "@/lib/game";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { EvidenceCard } from "@/components/evidence/EvidenceCard";

export default function EvidenciasPage() {
  const { state } = useHawkins();
  if (!state) return null;
  return (
    <div>
      <HawkinsHeader code="ARQUIVO CONFIDENCIAL — CAIXA 011" title="Evidências" subtitle="Documentos, fitas e registros recuperados durante a investigação. Alguns guardam os valores que você calculou.">
        <p className="font-mono text-sm text-bone">
          {state.evidences.length} / {EVIDENCES.length} RECUPERADAS
        </p>
      </HawkinsHeader>
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {EVIDENCES.map((ev, i) => {
          const room = getRoom(ev.roomId);
          const recorded = room && ev.id !== "ev-006" && ev.id !== "ev-007" ? correctAnswerFor(state, room.challengeId) : undefined;
          return <EvidenceCard key={ev.id} evidence={ev} unlocked={state.evidences.includes(ev.id)} recorded={recorded} index={i} />;
        })}
      </div>
    </div>
  );
}
