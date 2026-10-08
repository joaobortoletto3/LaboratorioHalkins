/** Camadas analógicas: scanlines, ruído VHS, barra de tracking e vinheta. Não interceptam cliques. */
export function VHSOverlay({ intensity = "normal" }: { intensity?: "subtle" | "normal" }) {
  return (
    <div aria-hidden>
      <div className="vignette" />
      <div className="scanlines" />
      <div className="vhs-noise" style={intensity === "subtle" ? { opacity: 0.03 } : undefined} />
      {intensity === "normal" && <div className="tracking-bar" />}
    </div>
  );
}
