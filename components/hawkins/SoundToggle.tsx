"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/hooks/useSound";

export function SoundToggle({ className = "" }: { className?: string }) {
  const { enabled, toggle } = useSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      className={`inline-flex items-center gap-2 border border-bone/15 px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-ash transition hover:border-flare hover:text-flare ${className}`}
    >
      {enabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      SOM {enabled ? "ON" : "OFF"}
    </button>
  );
}
