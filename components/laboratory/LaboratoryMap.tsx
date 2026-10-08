"use client";

import { DoorOpen } from "lucide-react";
import type { GameState } from "@/types";
import { ROOMS } from "@/lib/data/rooms";
import { SectorNode } from "./SectorNode";
import { Vines } from "@/components/hawkins/Vines";

/** Mapa vertical do laboratório no estilo planta confidencial (trilha de progressão). */
export function LaboratoryMap({ state }: { state: GameState }) {
  return (
    <div className="blueprint relative overflow-hidden border border-cold/40 px-4 py-10 sm:px-10">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-rust/30 to-transparent" />
      <Vines opacity={0.35} className="top-auto h-1/2" />
      <div className="pointer-events-none absolute right-4 top-4 hidden text-right font-mono text-[9px] leading-relaxed tracking-[0.2em] text-cold sm:block">
        HAWKINS NATIONAL LABORATORY
        <br />
        FLOOR PLAN — REV. 011
        <br />
        CLASSIFIED
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col gap-10">
        {/* linha conectora */}
        <svg className="pointer-events-none absolute left-10 top-0 h-full w-1 sm:left-1/2 sm:-translate-x-1/2" preserveAspectRatio="none" viewBox="0 0 2 100">
          <line x1="1" y1="0" x2="1" y2="100" stroke="#0D47A1" strokeWidth="2" vectorEffect="non-scaling-stroke" className="dash-flow" />
        </svg>

        <div className="relative z-10 flex items-center gap-4 sm:justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-cold bg-cold/20 shadow-cold">
            <DoorOpen className="h-8 w-8 text-bone" />
          </div>
          <div>
            <p className="label">PONTO DE PARTIDA</p>
            <p className="font-serif text-lg">Entrada</p>
          </div>
        </div>

        {ROOMS.map((room, i) => (
          <div key={room.id} className={`flex ${i % 2 === 0 ? "sm:justify-start" : "sm:justify-end"} sm:px-[8%]`}>
            <SectorNode room={room} status={state.rooms[room.id]?.status ?? "bloqueado"} side={i % 2 === 0 ? "left" : "right"} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
