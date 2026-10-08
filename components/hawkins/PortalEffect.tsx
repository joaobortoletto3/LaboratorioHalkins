"use client";

import { Component, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";

const PortalScene = dynamic(() => import("./PortalScene"), { ssr: false, loading: () => null });
const BOLTS = [
  "M100 33 L89 21 L94 16 L75 8 L65 2 M89 21 L72 24 L67 17",
  "M126 50 L146 38 L143 30 L164 24 L179 8 M146 38 L166 42 L180 35",
  "M132 79 L154 73 L162 80 L181 66 L199 70 M162 80 L173 94",
  "M121 123 L136 140 L132 149 L150 168 L145 193 M136 140 L155 143 L168 157",
  "M79 128 L61 143 L54 138 L37 158 L24 177 M61 143 L64 161 L55 178",
  "M67 89 L46 91 L38 79 L21 87 L2 79 M38 79 L34 63 L15 55",
  "M79 53 L58 41 L49 47 L32 29 L16 26 M58 41 L60 23 L47 8",
];
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

/** Shared breach: a 3D chamber with an SVG/CSS fallback when WebGL is unavailable. */
export function PortalEffect({ stability = 23, closing = false, size = 900, cinematic = false, progress = 0 }: {
  stability?: number; closing?: boolean; size?: number; cinematic?: boolean; progress?: number;
}) {
  const reducedMotion = useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [webgl, setWebgl] = useState(false);
  const glowId = useId().replace(/:/g, "");
  const scale = closing ? Math.max(0.001, stability / 100) : 1;
  useEffect(() => {
    const canvas = document.createElement("canvas");
    try {
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      setWebgl(Boolean(gl));
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { setWebgl(false); }
    let visible = true;
    const sync = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    if (host.current) observer.observe(host.current);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);
  return (
    <div ref={host} aria-hidden="true" className={`portal-chamber ${cinematic ? "portal-chamber--cinematic" : ""} ${active ? "" : "portal-chamber--paused"} ${reducedMotion ? "portal-chamber--still" : ""}`} style={{ maxWidth: cinematic ? undefined : size }}>
      <div className="portal-chamber-wall" />
      <motion.div className="portal-fallback" animate={{ scale, opacity: closing && stability === 0 ? 0 : 1 }} transition={{ duration: reducedMotion ? 0 : 1.1 }}>
        <div className="portal-fallback-halo" /><div className="portal-fallback-rift" /><div className="portal-fallback-core" />
      </motion.div>
      {webgl && <div className="portal-render"><SceneBoundary><PortalScene active={active} reducedMotion={Boolean(reducedMotion)} scale={scale} cinematic={cinematic} progress={progress} /></SceneBoundary></div>}
      <motion.div className="portal-lightning" animate={{ scale, opacity: closing && stability === 0 ? 0 : 1 }} transition={{ duration: reducedMotion ? 0 : 1.1 }}>
        {BOLTS.map((path, i) => <div key={path} className="portal-bolt" style={{ "--bolt-delay": `${i * -1.63}s`, "--bolt-duration": `${7.4 + i * 0.79}s` } as CSSProperties}>
          <svg viewBox="0 0 200 200" fill="none" preserveAspectRatio="none">
            <defs><filter id={`${glowId}-${i}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.3" /></filter></defs>
            <path d={path} stroke="#ff361e" strokeWidth="2.8" filter={`url(#${glowId}-${i})`} />
            <path d={path} stroke={i % 3 === 0 ? "#adc7ef" : "#ff9b78"} strokeWidth="0.85" /><path d={path} stroke="#fff4e9" strokeWidth="0.38" />
          </svg>
        </div>)}
      </motion.div>
      <div className="portal-ground-fog" /><div className="portal-lens" /><div className="portal-film-grain" />
      {!cinematic && <div className="portal-scene-caption"><span>CÂMARA DE CONTENÇÃO // 011</span><span>SINAL DIMENSIONAL ATIVO</span></div>}
    </div>
  );
}
