"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { useHawkins, type SubmitResult } from "@/hooks/useHawkins";
import { getRoom, getRoomChallenge } from "@/lib/data/rooms";
import { ChallengePanel } from "@/components/challenges/ChallengePanel";
import { SuccessOverlay } from "@/components/challenges/SuccessOverlay";
import { FinalProtocol } from "@/components/challenges/FinalProtocol";
import { RoomAtmosphere } from "@/components/laboratory/RoomAtmosphere";
import { HawkinsTerminal } from "@/components/hawkins/HawkinsTerminal";
import { GeometryViewer } from "@/components/geometry/GeometryViewer";
import { playSound } from "@/hooks/useSound";
import type { GameEvent } from "@/types";

export default function SalaPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { state, startRoom } = useHawkins();
  const room = getRoom(id);
  const challenge = getRoomChallenge(id);
  const [overlay, setOverlay] = useState<GameEvent[] | null>(null);
  const status = state?.rooms[id]?.status ?? "bloqueado";

  useEffect(() => {
    if (room && status === "disponivel") {
      startRoom(room.id);
      playSound("door");
    }
  }, [room, status, startRoom]);

  if (!room || !challenge) {
    return (
      <div className="panel-red p-10 text-center">
        <p className="title-solid text-3xl">SIGNAL LOST</p>
        <p className="mt-2 text-ash">Este setor não existe nos registros de Hawkins.</p>
        <Link href="/aluno/laboratorio" className="btn-primary mt-6">
          VOLTAR AO LABORATÓRIO
        </Link>
      </div>
    );
  }

  if (status === "bloqueado") {
    return (
      <div className="panel-red flex flex-col items-center p-10 text-center">
        <Lock className="h-10 w-10 text-blood" />
        <p className="title-solid mt-4 text-3xl">ACESSO NEGADO</p>
        <p className="mt-2 max-w-md text-ash">O {room.sector} — {room.name} permanece lacrado. Conclua o setor anterior para obter o cartão de acesso.</p>
        <Link href="/aluno/laboratorio" className="btn-primary mt-6">
          VOLTAR AO MAPA
        </Link>
      </div>
    );
  }

  if (room.theme === "portal") return <FinalProtocol room={room} challenge={challenge} />;

  const lighting = room.theme === "tank" || room.theme === "observation" ? "cold" : room.theme === "control" ? "green" : "red";
  const terminalTone = room.theme === "underground" ? "red" : "green";

  const onCorrect = (r: SubmitResult) => {
    if (room.id === "sala-05") playSound("alarm");
    setTimeout(() => setOverlay(r.events), 400);
  };

  return (
    <RoomAtmosphere theme={room.theme}>
      <Link href="/aluno/laboratorio" className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-ash hover:text-flare">
        <ArrowLeft className="h-3.5 w-3.5" /> MAPA DO LABORATÓRIO
      </Link>
      <header className="mb-6">
        <p className="label">
          {room.sector} · {room.subtitle.toUpperCase()}
        </p>
        <h1 className={`mt-1 font-serif text-3xl sm:text-5xl ${room.theme === "underground" ? "title-solid glitch" : "text-bone"}`} data-text={room.name}>
          {room.name}
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-2">
          <div className="panel space-y-3 p-5 text-[15px] leading-relaxed text-bone/90">
            {room.story.map((s, i) => (
              <p key={i} className={s.startsWith("“") ? "border-l-2 border-flare/60 pl-3 font-serif italic text-bone" : ""}>
                {s}
              </p>
            ))}
          </div>
          <HawkinsTerminal lines={room.terminalLines} tone={terminalTone} title={`TERMINAL · ${room.sector}`} />
          {room.theme === "tank" && (
            <div className="border border-cold/50 bg-cold/10 p-3 text-center font-mono text-xs tracking-[0.25em] text-[#8fb8ff]">
              MONITOR 03 — SUBJECT CONNECTION: <span className="blink text-flare">LOST</span>
            </div>
          )}
        </div>
        <div className="space-y-5 lg:col-span-3">
          {room.theme !== "underground" && <GeometryViewer shape={room.shape} lighting={lighting} height={320} autoRotate={room.theme !== "test"} />}
          {room.theme === "underground" && <UndergroundRecords />}
          <ChallengePanel challenge={challenge} completed={status === "concluido"} onCorrect={onCorrect} tone={terminalTone} />
        </div>
      </div>

      <SuccessOverlay open={overlay !== null} events={overlay ?? []} onClose={() => setOverlay(null)} warning={room.id === "sala-05"} />
    </RoomAtmosphere>
  );
}

function UndergroundRecords() {
  return (
    <div className="panel-red p-5">
      <p className="label mb-3">ANOTAÇÃO RASGADA — DR. M. ELLISON</p>
      <div className="paper relative rotate-[-1deg] p-5">
        <p className="typewriter text-sm leading-relaxed">
          Reator, tanque, sensor. Tudo estava ligado desde o início. O que um retém, o outro absorve, e o terceiro devolve.
          <br />
          Os números estão com você — confira o arquivo de evidências.
        </p>
        <span className="stamp absolute bottom-3 right-4 text-[10px] text-[#a01010]">RESTRICTED ACCESS</span>
      </div>
      <Link href="/aluno/evidencias" className="btn-ghost mt-4 w-full !py-2 !text-xs">
        ABRIR EVIDÊNCIAS
      </Link>
    </div>
  );
}
