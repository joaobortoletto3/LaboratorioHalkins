"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Lock, Radio, Skull } from "lucide-react";
import type { Room, RoomStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<RoomStatus, string> = {
  bloqueado: "BLOQUEADO",
  disponivel: "DISPONÍVEL",
  em_andamento: "EM ANDAMENTO",
  concluido: "CONCLUÍDO",
};

export function SectorNode({ room, status, side, index }: { room: Room; status: RoomStatus; side: "left" | "right"; index: number }) {
  const locked = status === "bloqueado";
  const current = status === "disponivel" || status === "em_andamento";
  const done = status === "concluido";
  const dark = room.theme === "underground" || room.theme === "portal";

  const node = (
    <div
      className={cn(
        "relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 transition sm:h-24 sm:w-24",
        locked && "border-blood/30 bg-void/80",
        current && "pulse-red border-flare bg-rust/40",
        done && "border-term bg-term/10 shadow-term",
      )}
    >
      {locked && <Lock className="h-7 w-7 text-blood" />}
      {current && (dark ? <Skull className="h-8 w-8 text-flare" /> : <Radio className="h-8 w-8 text-flare" />)}
      {done && <Check className="h-9 w-9 text-term" />}
      <span className="absolute -top-2 rounded-sm border border-bone/20 bg-void px-1.5 font-mono text-[9px] tracking-[0.15em] text-ash">
        {String(room.order).padStart(2, "0")}
      </span>
    </div>
  );

  const card = (
    <div className={cn("panel max-w-[15rem] p-3 text-left sm:max-w-xs sm:p-4", side === "right" && "sm:text-right", dark && "border-blood/30 bg-[#0b0405]/90")}>
      <p className="label">{room.sector}</p>
      <p className="mt-1 font-serif text-base text-bone sm:text-lg">{room.name}</p>
      <p className="mt-1 hidden text-xs text-ash sm:block">{room.description}</p>
      <p className={cn("mt-2 font-mono text-[10px] tracking-[0.25em]", locked && "text-blood", current && "text-flare", done && "text-term")}>{STATUS_LABEL[status]}</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05 }}
      className={cn("relative z-10 flex items-center gap-4", side === "right" ? "sm:flex-row-reverse" : "")}
    >
      {locked ? (
        <div aria-disabled className="cursor-not-allowed">
          {node}
        </div>
      ) : (
        <Link href={`/aluno/sala/${room.id}`} aria-label={`Abrir ${room.name}`} className="transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare">
          {node}
        </Link>
      )}
      {locked ? card : <Link href={`/aluno/sala/${room.id}`}>{card}</Link>}
    </motion.div>
  );
}
