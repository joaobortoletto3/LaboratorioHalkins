"use client";

import { useHawkins } from "@/hooks/useHawkins";
import { initials } from "@/lib/utils";
import { XPBar } from "@/components/gamification/XPBar";
import { LivesCounter } from "@/components/gamification/LivesCounter";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { levelTitle } from "@/lib/levels";

export function StudentSidebarCard() {
  const { state } = useHawkins();
  if (!state) return <div className="h-24 animate-pulse bg-bone/5" />;
  const p = state.profile;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-flare/30 bg-rust/20 font-mono text-sm text-bone">{initials(p.name)}</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-bone">{p.name}</p>
          <p className="font-mono text-[10px] tracking-[0.2em] text-ash">
            NV {String(p.level).padStart(2, "0")} · {levelTitle(p.level)}
          </p>
        </div>
      </div>
      <XPBar xp={p.xp} compact />
      <div className="flex items-center justify-between">
        <StreakCounter days={p.currentStreak} compact />
        <LivesCounter lives={p.lives} size="sm" />
      </div>
    </div>
  );
}
