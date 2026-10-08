import { levelTitle } from "@/lib/levels";

export function LevelBadge({ level, showTitle = true }: { level: number; showTitle?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center border border-flare/60 bg-rust/20 font-mono text-lg font-semibold text-bone shadow-glow-sm [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]">
        {String(level).padStart(2, "0")}
      </div>
      {showTitle && (
        <div>
          <p className="label">NÍVEL</p>
          <p className="font-mono text-sm font-semibold tracking-[0.15em] text-bone">{levelTitle(level)}</p>
        </div>
      )}
    </div>
  );
}
