"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { PortalEffect } from "./PortalEffect";
import { SoundToggle } from "./SoundToggle";
import { playSound } from "@/hooks/useSound";

const DURATION = 11000;
const CUTS = [
  { time: 0, label: "HAWKINS, INDIANA · 02:17 AM", title: "O sinal voltou.", subtitle: "Transmissão interceptada · Setor subterrâneo" },
  { time: 2700, label: "REGISTRO DE SEGURANÇA // 011", title: "A contenção falhou.", subtitle: "“Se alguém estiver ouvindo… não temos muito tempo.”" },
  { time: 5700, label: "ANOMALIA DIMENSIONAL DETECTADA", title: "Algo está do outro lado.", subtitle: "“Recupere os arquivos. Descubra como fechar a ruptura.”" },
  { time: 8500, label: "PROTOCOLO DE INVESTIGAÇÃO ATIVADO", title: "Sua missão começa agora.", subtitle: "Sete setores. Um incidente. A verdade espera por você." },
];

/** Skippable opening before navigation or the first mission. Native dialog handles focus. */
export function MissionCinematic({ onComplete }: { onComplete: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const complete = useRef(onComplete);
  const finished = useRef(false);
  const reducedMotion = useReducedMotion();
  const [elapsed, setElapsed] = useState(0);
  complete.current = onComplete;
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    complete.current();
  };

  useEffect(() => {
    const node = dialog.current;
    const focused = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node?.showModal();
    skip.current?.focus();
    playSound("rift");
    return () => { node?.close(); document.body.style.overflow = overflow; focused?.focus(); };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let previous = performance.now();
    let time = 0;
    let lastCut = 0;
    const timer = window.setInterval(() => {
      const now = performance.now();
      if (!document.hidden) time += Math.min(now - previous, 350);
      previous = now;
      setElapsed(Math.min(time, DURATION));
      const cut = CUTS.reduce((idx, c, i) => time >= c.time ? i : idx, 0);
      if (cut !== lastCut) { lastCut = cut; playSound(cut === 2 ? "thunder" : "static"); }
      if (time >= DURATION && !finished.current) { finished.current = true; complete.current(); }
    }, 100);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const cut = reducedMotion ? CUTS[3] : [...CUTS].reverse().find((c) => elapsed >= c.time) ?? CUTS[0];
  return <dialog ref={dialog} className={`mission-cinematic ${reducedMotion ? "mission-cinematic--still" : ""}`} aria-labelledby="mission-cinematic-title" aria-describedby="mission-cinematic-description" onCancel={(e) => { e.preventDefault(); finish(); }}>
    <div className="mission-cinematic-scene"><PortalEffect cinematic progress={elapsed / DURATION} /></div>
    <div className="mission-cinematic-shade" /><div className="mission-letterbox mission-letterbox--top" /><div className="mission-letterbox mission-letterbox--bottom" />
    <div className="mission-cinematic-top"><span>HNL / ARQUIVO 011 <span className="mission-recording">● REC</span></span><SoundToggle /></div>
    <div className="mission-cinematic-copy" key={cut.time}>
      <p className="mission-cinematic-label">{cut.label}</p>
      <h1 id="mission-cinematic-title">{cut.title}</h1>
      <p id="mission-cinematic-description">{cut.subtitle}</p>
    </div>
    <div className="mission-cinematic-bottom"><span className="mission-timecode">{reducedMotion ? "BRIEFING DA MISSÃO" : `00:00:${String(Math.floor(elapsed / 1000)).padStart(2, "0")} // TRANSMISSÃO 011`}</span>
      <button ref={skip} type="button" onClick={finish} className="btn-ghost !border-bone/30 !bg-black/40 !text-xs">{reducedMotion ? "ENTRAR NA MISSÃO →" : "PULAR ABERTURA →"}</button>
    </div>
    <div className="mission-cinematic-progress" style={{ transform: `scaleX(${reducedMotion ? 1 : elapsed / DURATION})` }} />
  </dialog>;
}
