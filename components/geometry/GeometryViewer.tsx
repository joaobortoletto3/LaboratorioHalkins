"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Move3d } from "lucide-react";
import type { ShapeSpec } from "@/types";
import { useWebGL } from "@/hooks/useWebGL";
import { ShapeFallback } from "./ShapeFallback";

const GeometryScene = dynamic(() => import("./GeometryScene"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center font-mono text-[10px] tracking-[0.3em] text-ash">RENDERIZANDO MODELO...</div>,
});

export type Lighting = "red" | "cold" | "green";

/** Visualizador 3D interativo (girar/arrastar) com fallback em SVG quando WebGL não está disponível. */
export function GeometryViewer({
  shape,
  lighting = "red",
  height = 300,
  labels = true,
  autoRotate = true,
}: {
  shape: ShapeSpec;
  lighting?: Lighting;
  height?: number;
  labels?: boolean;
  autoRotate?: boolean;
}) {
  const webgl = useWebGL();
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setLoaded(true);
    });
    if (container.current) observer.observe(container.current);
    const onVisibility = () => setTabVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={container} className="relative w-full overflow-hidden border border-bone/10 bg-void/60" style={{ height }}>
      <div className="blueprint absolute inset-0 opacity-40" />
      <div className="relative h-full w-full">
        {webgl && loaded ? <GeometryScene shape={shape} lighting={lighting} autoRotate={autoRotate && !reducedMotion} active={visible && tabVisible} /> : <ShapeFallback shape={shape} />}
      </div>
      {labels && shape.labels && (
        <div className="pointer-events-none absolute left-3 top-3 space-y-1">
          {shape.labels.map((l) => (
            <span key={l} className="block w-fit border border-bone/15 bg-void/80 px-2 py-0.5 font-mono text-[10px] tracking-[0.15em] text-bone">
              {l}
            </span>
          ))}
        </div>
      )}
      {webgl && (
        <span className="pointer-events-none absolute bottom-2 right-3 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.25em] text-ash">
          <Move3d className="h-3 w-3" /> ARRASTE PARA GIRAR
        </span>
      )}
    </div>
  );
}
