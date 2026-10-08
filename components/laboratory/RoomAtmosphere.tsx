import type { RoomTheme } from "@/types";
import { Particles } from "@/components/hawkins/Particles";
import { Vines } from "@/components/hawkins/Vines";

/** Ambientação visual de cada sala (névoa, luz, raízes). */
export function RoomAtmosphere({ theme, children }: { theme: RoomTheme; children: React.ReactNode }) {
  const bg: Record<RoomTheme, string> = {
    control: "bg-[radial-gradient(ellipse_at_top,rgba(53,255,105,0.06),transparent_60%)]",
    storage: "bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,204,0,0.05),transparent_55%)]",
    tank: "bg-[radial-gradient(ellipse_at_center,rgba(13,71,161,0.28),transparent_65%)]",
    test: "bg-[radial-gradient(ellipse_at_top,rgba(215,25,32,0.12),transparent_60%)]",
    observation: "bg-[radial-gradient(ellipse_at_top,rgba(13,71,161,0.18),transparent_60%)]",
    underground: "bg-[radial-gradient(ellipse_at_bottom,rgba(115,0,0,0.45),rgba(5,5,7,0.95)_70%)]",
    portal: "bg-[radial-gradient(ellipse_at_center,rgba(115,0,0,0.5),rgba(5,5,7,1)_70%)]",
  };
  const dark = theme === "underground" || theme === "portal";
  return (
    <div className="relative">
      <div className={`pointer-events-none fixed inset-0 lg:left-64 ${bg[theme]}`} aria-hidden>
        {(theme === "tank" || dark) && <div className={`fog ${theme === "tank" ? "cold" : ""}`} />}
        {dark && <Vines opacity={0.7} />}
        <Particles count={dark ? 50 : 14} ashRatio={dark ? 0.5 : 0.2} />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
