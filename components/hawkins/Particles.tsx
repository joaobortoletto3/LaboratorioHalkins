"use client";

import { useEffect, useState } from "react";

interface P {
  left: number;
  top: number;
  size: number;
  dur: number;
  delay: number;
  dx: number;
  ash: boolean;
}

/** Partículas vermelhas flutuantes (cinzas do Mundo Invertido). */
export function Particles({ count = 30, ashRatio = 0.3, className = "" }: { count?: number; ashRatio?: number; className?: string }) {
  const [items, setItems] = useState<P[]>([]);
  useEffect(() => {
    const n = window.innerWidth < 640 ? Math.ceil(count / 2) : count;
    setItems(
      Array.from({ length: n }, () => ({
        left: Math.random() * 100,
        top: 60 + Math.random() * 50,
        size: 1 + Math.random() * 2.5,
        dur: 14 + Math.random() * 18,
        delay: -Math.random() * 30,
        dx: (Math.random() - 0.5) * 120,
        ash: Math.random() < ashRatio,
      })),
    );
  }, [count, ashRatio]);
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {items.map((p, i) => (
        <span
          key={i}
          className={`particle ${p.ash ? "ash" : ""}`}
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              "--dx": `${p.dx}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
