"use client";

import { motion } from "framer-motion";
import { Particles } from "./Particles";

/** Portal dimensional original: rachadura vermelha pulsante, anéis de energia e fumaça. stability 0..100 */
export function PortalEffect({ stability = 23, closing = false, size = 340 }: { stability?: number; closing?: boolean; size?: number }) {
  const scale = closing ? Math.max(0.02, stability / 100) : 1;
  return (
    <div className="relative mx-auto aspect-square w-full" style={{ maxWidth: size }} aria-hidden>
      <motion.div className="absolute inset-0" animate={{ scale, opacity: stability === 0 && closing ? 0 : 1 }} transition={{ duration: 1.2, ease: "easeInOut" }}>
        <div
          className="absolute inset-[6%] rounded-full opacity-70 blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(255,27,27,0.65), rgba(115,0,0,0.4) 45%, transparent 70%)", animation: "portalBreath 3.5s ease-in-out infinite" }}
        />
        <div
          className="absolute inset-[14%] rounded-full"
          style={{ background: "conic-gradient(from 0deg, transparent, rgba(255,27,27,0.55), transparent 30%, rgba(115,0,0,0.6), transparent 60%, rgba(255,80,60,0.5), transparent)", animation: "portalSpin 9s linear infinite", filter: "blur(6px)" }}
        />
        <div
          className="absolute inset-[24%] rounded-full"
          style={{ background: "conic-gradient(from 180deg, transparent, rgba(255,120,100,0.5), transparent 40%, rgba(215,25,32,0.6), transparent)", animation: "portalSpin 6s linear infinite reverse", filter: "blur(3px)" }}
        />
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
          <defs>
            <filter id="glowF">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#glowF)" stroke="#ff3b2b" fill="none" strokeLinecap="round">
            <path d="M100 30 L95 55 L104 70 L92 92 L106 112 L96 135 L103 152 L98 172" strokeWidth="3.2" />
            <path d="M95 55 L78 48 M104 70 L122 62 M92 92 L72 98 M106 112 L128 118 M96 135 L80 146 M103 152 L118 162" strokeWidth="1.4" />
          </g>
          <path d="M100 30 L95 55 L104 70 L92 92 L106 112 L96 135 L103 152 L98 172" stroke="#fff3ee" strokeWidth="0.9" fill="none" />
        </svg>
      </motion.div>
      <div className="fog" />
      <Particles count={40} ashRatio={0.4} />
    </div>
  );
}
