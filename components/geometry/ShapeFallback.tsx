import type { ShapeSpec } from "@/types";

/** Representação isométrica em SVG usada quando o navegador não suporta WebGL. */
export function ShapeFallback({ shape }: { shape: ShapeSpec }) {
  const stroke = "#ff1b1b";
  const fill = "rgba(115,0,0,0.25)";
  const common = { stroke, fill, strokeWidth: 1.6 } as const;
  const content = (() => {
    switch (shape.kind) {
      case "cube":
      case "box":
      case "prism":
        return (
          <g>
            <polygon points="60,70 130,50 170,75 100,95" {...common} />
            <polygon points="60,70 100,95 100,165 60,140" {...common} />
            <polygon points="100,95 170,75 170,145 100,165" {...common} />
          </g>
        );
      case "cylinder":
      case "capsule":
        return (
          <g>
            {shape.kind === "capsule" && <path d="M60 70 A55 55 0 0 1 170 70" {...common} />}
            <ellipse cx="115" cy="70" rx="55" ry="16" {...common} />
            <path d="M60 70 V150 A55 16 0 0 0 170 150 V70" {...common} />
          </g>
        );
      case "hollow-frustum":
        return (
          <g>
            <path d="M88 55 L50 150 A65 20 0 0 0 180 150 L142 55" {...common} />
            <ellipse cx="115" cy="55" rx="27" ry="9" {...common} />
            <ellipse cx="115" cy="55" rx="24" ry="7" fill="rgba(5,5,7,0.9)" stroke={stroke} />
            <path d="M91 55 V150 M139 55 V150" fill="none" stroke={stroke} strokeDasharray="4 4" />
            <ellipse cx="115" cy="150" rx="24" ry="7" fill="none" stroke={stroke} strokeDasharray="4 4" />
          </g>
        );
      case "cone":
        return (
          <g>
            <path d="M115 30 L60 150 A55 16 0 0 0 170 150 Z" {...common} />
            <ellipse cx="115" cy="150" rx="55" ry="16" fill="none" stroke={stroke} strokeDasharray="4 4" />
          </g>
        );
      case "pyramid":
      case "prism-pyramid":
        return (
          <g>
            {shape.kind === "prism-pyramid" && (
              <>
                <polygon points="60,110 100,130 100,175 60,155" {...common} />
                <polygon points="100,130 170,110 170,155 100,175" {...common} />
              </>
            )}
            <polygon points="115,30 60,110 100,130" {...common} />
            <polygon points="115,30 100,130 170,110" {...common} />
          </g>
        );
      case "sphere":
      case "hemisphere":
      case "portal":
        return (
          <g>
            <circle cx="115" cy="100" r="60" {...common} />
            <ellipse cx="115" cy="100" rx="60" ry="18" fill="none" stroke={stroke} strokeDasharray="4 4" />
          </g>
        );
    }
  })();
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <svg viewBox="0 0 230 200" className="h-[80%] max-h-64 w-auto">
        {content}
      </svg>
      <p className="font-mono text-[9px] tracking-[0.25em] text-ash">MODO DE VISUALIZAÇÃO SIMPLIFICADO</p>
    </div>
  );
}
