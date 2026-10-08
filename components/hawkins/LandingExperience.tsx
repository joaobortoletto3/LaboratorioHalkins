"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { HawkinsLogo } from "./HawkinsLogo";
import { Particles } from "./Particles";
import { VHSOverlay } from "./VHSOverlay";
import { UpsideFlash } from "./UpsideFlash";
import { SoundToggle } from "./SoundToggle";
import { Vines } from "./Vines";
import { playSound } from "@/hooks/useSound";

export function LandingExperience() {
  const router = useRouter();
  const [access, setAccess] = useState<null | "connecting" | "granted">(null);
  const [invaded, setInvaded] = useState(false);

  useEffect(() => {
    const t3 = setTimeout(() => setInvaded(true), 7000);
    const t4 = setTimeout(() => setInvaded(false), 10500);
    return () => [t3, t4].forEach(clearTimeout);
  }, []);

  const enter = (target: "/login" | "/cadastro") => {
    setAccess("granted");
    playSound("success");
    router.push(target);
  };

  return (
    <main className="relative flex min-h-[100svh] flex-col overflow-hidden bg-void">
      {/* fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(115,0,0,0.35),transparent_60%)]" />
      <motion.div className="absolute inset-0" animate={{ opacity: invaded ? 1 : 0 }} transition={{ duration: 2.5 }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(90,0,0,0.35),rgba(5,5,7,0.9))]" />
        <Vines opacity={0.8} />
      </motion.div>
      <div className="fog" />
      <Particles count={45} />
      <VHSOverlay />
      <UpsideFlash intensity={0.2} />

      {/* topo */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-10">
        <Link href="/" aria-label="Voltar à apresentação do projeto" className="font-mono text-[10px] tracking-[0.35em] text-ash hover:text-bone">HNL // ARQUIVO 011</Link>
        <SoundToggle />
      </div>

      {/* conteúdo */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center">

          <motion.span
            className="mb-10 block h-[2px] bg-flare shadow-glow"
            initial={{ width: 0 }}
            animate={{ width: "min(560px, 80vw)" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="mb-6 flex flex-col items-center gap-2">
              <span className="border border-flare/70 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.45em] text-flare">CLASSIFIED</span>
              <span className="font-mono text-[10px] tracking-[0.35em] text-ash sm:text-xs">HAWKINS NATIONAL LABORATORY</span>
              <span className="font-mono text-[10px] tracking-[0.35em] text-ash/70">DEPARTMENT OF ENERGY</span>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flicker">
              <HawkinsLogo size="xl" />
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mt-6 font-mono text-xs tracking-[0.35em] text-ash">
              ARQUIVO 011 — INCIDENTE DIMENSIONAL
            </motion.p>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="chroma mt-10 font-serif text-3xl italic text-bone sm:text-5xl"
            >
              “Algo foi aberto.”
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="mt-5 max-w-xl text-sm leading-relaxed text-ash sm:text-base">
              O laboratório foi abandonado. Os arquivos foram bloqueados. Descubra o que aconteceu antes que seja tarde demais.
            </motion.p>

            <motion.div initial={false} className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <button className="btn-primary pulse-red" disabled={!!access} onClick={() => enter("/login")}>
                ENTRAR NO LABORATÓRIO
              </button>
              <button className="btn-ghost" disabled={!!access} onClick={() => enter("/cadastro")}>
                ACESSAR ARQUIVO
              </button>
            </motion.div>
      </section>

      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-bone/5 px-5 py-3 font-mono text-[9px] tracking-[0.3em] text-ash/50 sm:px-10">
        <span>PROPRIEDADE DO GOVERNO — ACESSO MONITORADO</span>
        <span>EXPERIÊNCIA EDUCACIONAL DE GEOMETRIA ESPACIAL</span>
      </footer>

      {/* transição de acesso */}
      <AnimatePresence>
        {access && (
          <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-void" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="crt w-[min(520px,90vw)] p-8 font-mono">
              <p className="crt-text text-sm tracking-[0.25em]">
                ACCESSING HAWKINS NETWORK...<span className="blink">▌</span>
              </p>
              <div className="mt-4 h-1 w-full bg-term/10">
                <motion.div className="h-full bg-term" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.4 }} />
              </div>
              {access === "granted" && (
                <motion.p initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="crt-text mt-6 text-2xl font-semibold tracking-[0.3em]">
                  ACCESS GRANTED
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
