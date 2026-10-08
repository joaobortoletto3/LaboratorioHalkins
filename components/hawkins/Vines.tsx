/** Raízes / vinhas dimensionais originais desenhadas em SVG. */
export function Vines({ opacity = 0.6, className = "" }: { opacity?: number; className?: string }) {
  const stroke = "#3a0606";
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} style={{ opacity }}>
      <svg className="absolute -left-10 top-0 h-[70%] w-[45%] min-w-[260px]" viewBox="0 0 300 500" fill="none" preserveAspectRatio="xMinYMin meet">
        <g stroke={stroke} strokeLinecap="round">
          <path d="M0 20 C 60 60, 40 140, 110 190 S 160 300, 120 380 S 160 470, 210 500" strokeWidth="9" />
          <path d="M110 190 C 160 180, 200 210, 240 190" strokeWidth="5" />
          <path d="M120 380 C 80 400, 60 440, 30 450" strokeWidth="4" />
          <path d="M60 100 C 90 110, 120 90, 150 110 S 190 150, 230 140" strokeWidth="3" />
          <path d="M150 260 C 190 270, 210 300, 260 300" strokeWidth="3" />
        </g>
        <g fill="#5a0a0a">
          <circle cx="240" cy="190" r="4" />
          <circle cx="230" cy="140" r="3" />
          <circle cx="260" cy="300" r="3" />
        </g>
      </svg>
      <svg className="absolute -right-10 bottom-0 h-[65%] w-[45%] min-w-[260px]" viewBox="0 0 300 500" fill="none" preserveAspectRatio="xMaxYMax meet">
        <g stroke={stroke} strokeLinecap="round">
          <path d="M300 480 C 240 440, 260 360, 190 310 S 140 200, 180 120 S 140 30, 90 0" strokeWidth="9" />
          <path d="M190 310 C 140 320, 100 290, 60 310" strokeWidth="5" />
          <path d="M180 120 C 220 100, 240 60, 270 50" strokeWidth="4" />
          <path d="M240 400 C 210 390, 180 410, 150 390 S 110 350, 70 360" strokeWidth="3" />
        </g>
        <g fill="#5a0a0a">
          <circle cx="60" cy="310" r="4" />
          <circle cx="70" cy="360" r="3" />
        </g>
      </svg>
    </div>
  );
}
