import { Flame } from "lucide-react";
import { WEEK_LABELS, currentWeek, dayKey } from "@/lib/dates";

export function StreakCounter({ days, compact = false }: { days: number; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Flame className={`${compact ? "h-4 w-4" : "h-6 w-6"} ${days > 0 ? "text-[#ff7a1a] drop-shadow-[0_0_8px_rgba(255,122,26,0.8)]" : "text-ash/40"}`} />
      <div>
        {!compact && <p className="label">OFENSIVA</p>}
        <p className={`${compact ? "text-sm" : "text-2xl"} font-semibold text-bone`}>
          {days} {days === 1 ? "dia" : "dias"}
        </p>
      </div>
    </div>
  );
}

export function StreakCalendar({ activityDays }: { activityDays: string[] }) {
  const week = currentWeek();
  const today = dayKey();
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {week.map((d, i) => {
        const key = dayKey(d);
        const done = activityDays.includes(key);
        const isToday = key === today;
        return (
          <div
            key={key}
            className={`flex flex-col items-center gap-1 border py-2 ${isToday ? "border-flare/60" : "border-bone/10"} ${done ? "bg-[#ff7a1a]/10" : "bg-void/40"}`}
          >
            <span className="font-mono text-[9px] tracking-[0.15em] text-ash">{WEEK_LABELS[i]}</span>
            <Flame className={`h-4 w-4 ${done ? "text-[#ff7a1a]" : "text-bone/10"}`} />
          </div>
        );
      })}
    </div>
  );
}
