"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Terminal CRT com digitação linha a linha. */
export function HawkinsTerminal({
  lines,
  title = "HNL-TERMINAL",
  speed = 18,
  className,
  tone = "green",
  children,
}: {
  lines: string[];
  title?: string;
  speed?: number;
  className?: string;
  tone?: "green" | "red";
  children?: React.ReactNode;
}) {
  const [shown, setShown] = useState<string[]>([]);
  useEffect(() => {
    setShown([]);
    let li = 0;
    let ci = 0;
    let cur: string[] = [];
    const id = setInterval(() => {
      if (li >= lines.length) {
        clearInterval(id);
        return;
      }
      ci++;
      cur = [...cur.slice(0, li), lines[li].slice(0, ci)];
      setShown(cur);
      if (ci >= lines[li].length) {
        li++;
        ci = 0;
      }
    }, speed);
    return () => clearInterval(id);
  }, [lines, speed]);

  const color = tone === "green" ? "crt-text" : "text-flare [text-shadow:0_0_6px_rgba(255,27,27,0.6)]";
  return (
    <div className={cn("crt relative overflow-hidden rounded-sm", className)}>
      <div className="flex items-center justify-between border-b border-term/15 px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-term/60">
        <span>{title}</span>
        <span className="flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-flare blink" />
          <span>REC</span>
        </span>
      </div>
      <div className={cn("relative space-y-1 p-4 font-mono text-sm leading-relaxed sm:text-base", color)}>
        {shown.map((l, i) => (
          <p key={i}>
            {l}
            {i === shown.length - 1 && <span className="blink">▌</span>}
          </p>
        ))}
        {children}
      </div>
      <div className="crt-lines pointer-events-none absolute inset-0" />
    </div>
  );
}
