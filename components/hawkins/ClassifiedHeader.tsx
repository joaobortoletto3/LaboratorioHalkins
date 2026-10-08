/** Cabeçalho padrão das páginas internas. */
export function HawkinsHeader({ code, title, subtitle, children }: { code: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-bone/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="label mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-flare" /> {code}
        </p>
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-bone sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-base leading-relaxed text-ash">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}
