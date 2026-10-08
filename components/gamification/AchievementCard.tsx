import { Eye, Flame, Lock, Radio, Shield, Target, Zap, type LucideIcon } from "lucide-react";
import type { Achievement } from "@/types";

const ICONS: Record<Achievement["icon"], LucideIcon> = { radio: Radio, shield: Shield, flame: Flame, target: Target, eye: Eye, lock: Lock, zap: Zap };

export function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  const Icon = ICONS[achievement.icon];
  return (
    <div className={`panel corner flex items-start gap-4 p-5 transition ${unlocked ? "border-blood/40" : "opacity-55 grayscale"}`}>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center border ${unlocked ? "border-flare bg-rust/30 text-flare shadow-glow-sm" : "border-bone/15 text-ash"}`}>
        {unlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
      </div>
      <div>
        <p className="font-mono text-sm font-semibold tracking-[0.15em] text-bone">{achievement.title}</p>
        <p className="mt-1 text-sm text-ash">{achievement.description}</p>
        <p className={`mt-2 font-mono text-[10px] tracking-[0.25em] ${unlocked ? "text-term" : "text-ash/60"}`}>{unlocked ? "DESBLOQUEADA" : "BLOQUEADA"}</p>
      </div>
    </div>
  );
}
