"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Vines } from "./Vines";

/**
 * Pequenos flashes que revelam uma versão corrompida da interface (Mundo Invertido).
 * intensity 0..1 controla a frequência. Nunca bloqueia cliques.
 */
export function UpsideFlash({ intensity = 0.3 }: { intensity?: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (intensity <= 0) return;
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const wait = (22 - intensity * 14) * 1000 + Math.random() * 6000;
      t = setTimeout(() => {
        setOn(true);
        setTimeout(() => setOn(false), 700 + intensity * 600);
        schedule();
      }, wait);
    };
    schedule();
    return () => clearTimeout(t);
  }, [intensity]);

  return (
    <AnimatePresence>
      {on && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[65]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0.3, 0.75, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(115,0,0,0.35),rgba(5,5,7,0.6))] mix-blend-multiply" />
          <Vines opacity={0.9} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
