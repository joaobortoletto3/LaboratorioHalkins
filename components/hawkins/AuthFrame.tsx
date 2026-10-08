import Link from "next/link";
import { ArrowLeft, Fingerprint, ShieldCheck } from "lucide-react";
import { VHSOverlay } from "./VHSOverlay";
import { Particles } from "./Particles";
import { HawkinsLogo } from "./HawkinsLogo";

export function AuthFrame({ subtitle, mode, children }: { subtitle: string; mode: "login" | "cadastro"; children: React.ReactNode }) {
  const registering = mode === "cadastro";
  return (
    <main className="auth-page relative flex min-h-[100svh] flex-col overflow-hidden bg-void">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_60%,rgba(115,0,0,0.2),transparent_60%)]" />
      <Particles count={18} /><VHSOverlay intensity="subtle" />
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-10">
        <Link href="/" aria-label="Laboratório Hawkins — início"><HawkinsLogo size="sm" /></Link>
        <Link href="/experiencia" className="flex items-center gap-2 text-xs text-ash hover:text-bone"><ArrowLeft size={15} /> Voltar ao laboratório</Link>
      </header>
      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 py-10 lg:grid-cols-2 lg:gap-24 lg:py-14">
        <section className="hidden lg:block">
          <p className="dossier-label">HAWKINS NATIONAL LABORATORY / 011</p>
          <h2 className="mt-8 font-serif text-6xl leading-[1.1]">{registering ? <>Toda descoberta<br />começa com<br /><span className="text-flare">uma pergunta.</span></> : <>O próximo<br />capítulo espera<br /><span className="text-flare">por você.</span></>}</h2>
          <p className="mt-7 max-w-sm leading-7 text-ash">{registering ? "Crie sua credencial e transforme a Geometria Espacial em uma jornada de investigação." : "Retome sua investigação. Os desafios, as evidências e os segredos do laboratório estão à sua espera."}</p>
          <div className="mt-12 flex max-w-sm items-start gap-4 border-t border-bone/10 pt-6"><ShieldCheck className="shrink-0 text-flare" size={22} /><p className="text-sm leading-6 text-ash">Explore os setores. Conecte as pistas.<br /><span className="text-bone">O conhecimento é sua melhor ferramenta.</span></p></div>
        </section>
        <section className="auth-card mx-auto w-full max-w-lg rounded-2xl border border-bone/10 bg-panel/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)] sm:p-9">
          <div className="mb-7 flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-flare/25 bg-blood/10 text-flare"><Fingerprint size={25} strokeWidth={1.4} /></span><span className="font-mono text-[9px] tracking-[0.2em] text-ash">IDENTIFICAÇÃO DE AGENTE</span></div>
          <p className="dossier-label">{subtitle}</p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl">{registering ? "Crie sua credencial." : "Bem-vindo de volta."}</h1>
          <p className="mt-3 text-sm leading-6 text-ash">{registering ? "Preencha seus dados para começar a investigação." : "Entre com seu e-mail e senha para continuar."}</p>
          <nav aria-label="Tipo de acesso" className="my-7 grid grid-cols-2 rounded-xl border border-bone/10 bg-void/60 p-1">
            <Link href="/login" aria-current={!registering ? "page" : undefined} className={`rounded-lg px-3 py-2.5 text-center text-sm transition ${!registering ? "bg-blood/20 text-bone" : "text-ash hover:text-bone"}`}>Entrar</Link>
            <Link href="/cadastro" aria-current={registering ? "page" : undefined} className={`rounded-lg px-3 py-2.5 text-center text-sm transition ${registering ? "bg-blood/20 text-bone" : "text-ash hover:text-bone"}`}>Criar conta</Link>
          </nav>
          {children}
        </section>
      </div>
      <footer className="relative z-10 px-6 py-6 text-center font-mono text-[9px] tracking-[0.2em] text-ash">ARQUIVO 011 / EXPERIÊNCIA EDUCACIONAL DE GEOMETRIA ESPACIAL</footer>
    </main>
  );
}
