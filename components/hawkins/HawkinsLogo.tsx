import { cn } from "@/lib/utils";

/** Logotipo tipográfico original "LABORATÓRIO HAWKINS" inspirado em cartazes de terror dos anos 80. */
export function HawkinsLogo({ size = "lg", className }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sizes = {
    sm: { top: "text-[10px]", main: "text-xl", line: "h-px" },
    md: { top: "text-sm", main: "text-3xl", line: "h-px" },
    lg: { top: "text-xl sm:text-2xl", main: "text-5xl sm:text-7xl", line: "h-[2px]" },
    xl: { top: "text-2xl sm:text-4xl", main: "text-6xl sm:text-8xl lg:text-9xl", line: "h-[2px]" },
  }[size];
  return (
    <div className={cn("inline-flex select-none flex-col items-center", className)} aria-label="Laboratório Hawkins">
      <div className="flex w-full items-center gap-3">
        <span className={cn("flex-1 bg-flare shadow-glow", sizes.line)} />
        <span className={cn("title-outline tracking-[0.18em]", sizes.top)}>LABORATÓRIO</span>
        <span className={cn("flex-1 bg-flare shadow-glow", sizes.line)} />
      </div>
      <span className={cn("title-outline leading-none", sizes.main)}>
        <span className="text-[1.15em]">H</span>AWKIN<span className="text-[1.15em]">S</span>
      </span>
      <span className={cn("mt-1 w-[86%] bg-flare shadow-glow", sizes.line)} />
    </div>
  );
}
