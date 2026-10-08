"use client";

import { useState } from "react";
import { LIBRARY } from "@/lib/data/library";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { GeometryViewer } from "@/components/geometry/GeometryViewer";
import { cn } from "@/lib/utils";

export default function BibliotecaPage() {
  const [active, setActive] = useState(LIBRARY[0].id);
  const entry = LIBRARY.find((e) => e.id === active) ?? LIBRARY[0];
  return (
    <div>
      <HawkinsHeader code="HAWKINS RESEARCH ARCHIVE" title="Arquivo de Pesquisa" subtitle="Fichas técnicas dos sólidos geométricos estudados no laboratório. Consulte antes de enviar um código." />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {LIBRARY.map((e) => (
          <button
            key={e.id}
            onClick={() => setActive(e.id)}
            className={cn(
              "shrink-0 border px-4 py-2 font-mono text-xs tracking-[0.2em] transition",
              active === e.id ? "border-flare bg-blood/15 text-bone" : "border-bone/10 text-ash hover:border-blood/50 hover:text-bone",
            )}
          >
            {e.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <GeometryViewer key={entry.id} shape={entry.shape} height={360} labels={false} />
          <p className="mt-2 font-mono text-[10px] tracking-[0.3em] text-ash">MODELO 3D · {entry.codename}</p>
        </div>
        <div className="space-y-4">
          <div className="panel corner p-5">
            <p className="label">FICHA TÉCNICA</p>
            <h2 className="mt-1 font-serif text-3xl text-bone">{entry.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ash">{entry.explanation}</p>
          </div>
          <div className="crt p-5">
            <p className="crt-text mb-3 font-mono text-[10px] tracking-[0.3em] opacity-70">FÓRMULAS</p>
            <ul className="space-y-2">
              {entry.formulas.map((f) => (
                <li key={f.label} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-term/10 pb-2">
                  <span className="font-mono text-xs text-term/70">{f.label}</span>
                  <span className="crt-text font-mono text-lg">{f.formula}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="paper p-5">
            <p className="typewriter text-[10px] tracking-[0.3em] text-[#6b1010]">EXEMPLO RESOLVIDO</p>
            <p className="typewriter mt-2 text-sm leading-relaxed">{entry.example}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
