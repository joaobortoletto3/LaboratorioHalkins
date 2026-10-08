import { Heart } from "lucide-react";
import { MAX_LIVES } from "@/lib/game";

export function LivesCounter({ lives, size = "md" }: { lives: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-1" aria-label={`${lives} de ${MAX_LIVES} vidas`}>
      {Array.from({ length: MAX_LIVES }, (_, i) => (
        <Heart key={i} className={`${cls} transition ${i < lives ? "fill-flare text-flare drop-shadow-[0_0_6px_rgba(255,27,27,0.7)]" : "text-bone/15"}`} />
      ))}
    </div>
  );
}
