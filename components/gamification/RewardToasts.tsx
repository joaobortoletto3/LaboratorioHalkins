"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, FileText, Heart, Sparkles, Unlock, Zap } from "lucide-react";
import { useHawkins } from "@/hooks/useHawkins";
import { getEvidence } from "@/lib/data/evidences";
import { getAchievement } from "@/lib/data/achievements";
import { getRoom } from "@/lib/data/rooms";
import { levelTitle } from "@/lib/levels";
import type { GameEvent } from "@/types";

function describe(e: GameEvent): { icon: React.ReactNode; title: string; text: string } {
  switch (e.type) {
    case "xp":
      return { icon: <Zap className="h-5 w-5 text-alert" />, title: `+${e.amount} XP`, text: e.label };
    case "evidence":
      return { icon: <FileText className="h-5 w-5 text-flare" />, title: "EVIDÊNCIA COLETADA", text: getEvidence(e.evidenceId)?.title ?? "" };
    case "achievement":
      return { icon: <Award className="h-5 w-5 text-alert" />, title: "CONQUISTA DESBLOQUEADA", text: getAchievement(e.achievementId)?.title ?? "" };
    case "levelup":
      return { icon: <Sparkles className="h-5 w-5 text-term" />, title: `NÍVEL ${String(e.level).padStart(2, "0")}`, text: levelTitle(e.level) };
    case "unlock":
      return { icon: <Unlock className="h-5 w-5 text-term" />, title: "NOVO SETOR LIBERADO", text: getRoom(e.roomId)?.name ?? "" };
    case "life":
      return { icon: <Heart className="h-5 w-5 fill-flare text-flare" />, title: "+1 VIDA", text: e.label };
  }
}

/** Notificações animadas de XP, evidências, conquistas, nível e desbloqueios. */
export function RewardToasts() {
  const { events, dismissEvent } = useHawkins();
  const current = events[0];
  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismissEvent, 2600);
    return () => clearTimeout(t);
  }, [current, dismissEvent]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] w-[min(340px,calc(100vw-2rem))]">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={`${events.length}-${JSON.stringify(current)}`}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className="panel-red pointer-events-auto flex items-center gap-3 p-4"
            role="status"
          >
            {describe(current).icon}
            <div>
              <p className="font-mono text-xs font-semibold tracking-[0.2em] text-bone">{describe(current).title}</p>
              <p className="text-xs text-ash">{describe(current).text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
