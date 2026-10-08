"use client";

import { useEffect, useState } from "react";

const DEFAULT = ["CONNECTING TO HAWKINS NETWORK...", "DECRYPTING FILE...", "LOADING SECTOR...", "ANALYZING DIMENSIONAL SIGNAL..."];

export function ThemedLoader({ messages = DEFAULT, fullscreen = false }: { messages?: string[]; fullscreen?: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % messages.length), 900);
    return () => clearInterval(id);
  }, [messages.length]);
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-5 ${fullscreen ? "min-h-screen" : "min-h-[50vh]"}`}>
      <div className="relative h-14 w-14">
        <span className="absolute inset-0 rounded-full border border-blood/30" />
        <span className="absolute inset-0 animate-spin rounded-full border-t-2 border-flare" />
        <span className="absolute inset-[38%] rounded-full bg-flare shadow-glow" />
      </div>
      <p className="crt-text font-mono text-xs tracking-[0.3em] sm:text-sm">
        {messages[i]}
        <span className="blink">▌</span>
      </p>
    </div>
  );
}
