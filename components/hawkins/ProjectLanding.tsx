import Link from "next/link";
import { ArrowDown, ArrowRight, Box, Fingerprint, GraduationCap, ScanLine, ShieldCheck } from "lucide-react";
import { HawkinsLogo } from "./HawkinsLogo";
import { VHSOverlay } from "./VHSOverlay";

const steps = [
  { icon: ScanLine, title: "Explore o desconhecido", text: "Percorra os setores de um laboratório secreto e encontre as pistas do incidente dimensional." },
  { icon: Box, title: "Dê forma às respostas", text: "Investigue sólidos geométricos e resolva desafios de área e volume para avançar na missão." },
  { icon: ShieldCheck, title: "Conclua a investigação", text: "Reúna evidências, conquiste XP e use o que aprendeu para fechar o portal no Protocolo 011." },
];

export function ProjectLanding() {
  return (
    <main className="project-landing relative overflow-hidden bg-void">
      <VHSOverlay intensity="subtle" />
      <a href="#sobre" className="sr-only focus:not-sr-only focus:absolute focus:z-[80] focus:bg-void focus:p-4">Pular para o conteúdo</a>
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 border-b border-bone/10 px-6 py-6 lg:px-10">
        <Link href="/" aria-label="Laboratório Hawkins — início"><HawkinsLogo size="sm" /></Link>
        <nav aria-label="Navegação principal" className="flex items-center gap-6 text-sm">
          <a href="#sobre" className="hidden text-ash transition hover:text-bone sm:block">O projeto</a>
          <a href="#como-funciona" className="hidden text-ash transition hover:text-bone md:block">Como funciona</a>
          <Link href="/login" className="flex items-center gap-2 text-bone hover:text-flare">Já tenho acesso <ArrowRight size={16} /></Link>
        </nav>
      </header>
      <section id="sobre" className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-16 lg:grid-cols-[1.15fr_1fr] lg:px-10 lg:py-24">
        <div>
          <p className="dossier-label"><span className="inline-block h-1.5 w-1.5 rounded-full bg-flare" /> ARQUIVO 011 / PROJETO EDUCACIONAL</p>
          <h1 className="mt-7 font-serif text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">O mistério é real.<br />A chave é a <span className="text-flare">geometria.</span></h1>
          <p className="mt-7 max-w-lg text-base leading-relaxed text-ash sm:text-lg">Bem-vindo ao Laboratório Hawkins. Uma experiência educacional que transforma a Geometria Espacial em uma investigação cheia de descobertas.</p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ash">Explore ambientes, resolva desafios e conecte as evidências. Aqui, cada conceito aprendido aproxima você da solução do incidente dimensional.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/experiencia" className="btn-primary">Conhecer o laboratório <ArrowRight size={18} /></Link>
            <a href="#como-funciona" className="btn-ghost">Como funciona <ArrowDown size={16} /></a>
          </div>
          <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-ash">APRENDA. INVESTIGUE. DESCUBRA.</p>
        </div>
        <div className="dossier-visual relative" aria-label="Ilustração de um cubo geométrico no arquivo do incidente dimensional">
          <div className="flex justify-between border-b border-flare/20 px-5 py-4 font-mono text-[10px] tracking-[0.18em] text-ash"><span>HNL / ANÁLISE DIMENSIONAL</span><span className="text-flare">011</span></div>
          <div className="relative px-4 py-6">
            <svg viewBox="0 0 440 350" className="mx-auto w-full max-w-[440px]" fill="none" aria-hidden="true">
              <defs><radialGradient id="cube-glow"><stop stopColor="#d71920" stopOpacity=".24" /><stop offset="1" stopColor="#d71920" stopOpacity="0" /></radialGradient></defs>
              <circle cx="220" cy="175" r="170" fill="url(#cube-glow)" />
              <g stroke="#ff1b1b" strokeOpacity=".2"><circle cx="220" cy="175" r="145" /><ellipse cx="220" cy="175" rx="185" ry="62" transform="rotate(-25 220 175)" /><path d="M20 175H420M220 10V340" strokeDasharray="3 8" /></g>
              <g stroke="#ff3838" strokeWidth="1.5" strokeLinejoin="round"><path d="M220 65 325 125 325 245 220 305 115 245 115 125Z" fill="#d71920" fillOpacity=".04" /><path d="m115 125 105 60 105-60M220 185v120" /><path d="m220 65 0 120M115 245l105-60 105 60" strokeDasharray="5 6" strokeOpacity=".4" /></g>
              <g fill="#ff4949">{[[220,65],[325,125],[325,245],[220,305],[115,245],[115,125],[220,185]].map(([cx,cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" />)}</g>
              <g fill="#9ca3af" fontSize="10" fontFamily="var(--font-mono)"><text x="338" y="187">h</text><text x="160" y="292">a</text><text x="272" y="292">a</text><text x="28" y="38">FIG. 01</text><text x="305" y="328">V = a³</text></g>
            </svg>
            <span className="absolute bottom-7 left-5 -rotate-6 border border-flare/60 px-3 py-1 font-mono text-[10px] tracking-[0.25em] text-flare">CLASSIFICADO</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-flare/20 px-5 py-4 font-mono text-[9px] tracking-[0.15em] text-ash"><span>OBJETO: SÓLIDO GEOMÉTRICO</span><span className="text-bone">EM INVESTIGAÇÃO</span></div>
        </div>
      </section>
      <div className="relative z-10 border-y border-bone/10 bg-bone/[0.02]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-bone/10 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-10">
          {[["01", "Uma história para investigar"], ["02", "Geometria para experimentar"], ["03", "Conhecimento para avançar"]].map(([n, label]) => <p key={n} className="flex items-center gap-4 py-5 sm:justify-center"><span className="font-mono text-xs text-flare">{n}</span><span className="text-sm text-ash">{label}</span></p>)}
        </div>
      </div>
      <section id="como-funciona" className="relative z-10 mx-auto max-w-7xl scroll-mt-8 px-6 py-20 lg:px-10">
        <p className="dossier-label">O PROTOCOLO DE INVESTIGAÇÃO</p>
        <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end"><h2 className="font-serif text-4xl sm:text-5xl">Aprender faz parte da missão.</h2><p className="max-w-sm text-sm leading-relaxed text-ash">Uma jornada que conecta raciocínio, exploração e prática — um desafio de cada vez.</p></div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">{steps.map(({icon: Icon, title, text}, i) => <article key={title} className="corner relative border border-bone/10 bg-panel/40 p-7"><div className="flex items-center justify-between"><Icon size={25} strokeWidth={1.3} className="text-flare" /><span className="font-mono text-xs text-ash">0{i + 1} /</span></div><h3 className="mt-7 font-serif text-2xl">{title}</h3><p className="mt-3 text-sm leading-7 text-ash">{text}</p></article>)}</div>
      </section>
      <section className="relative z-10 mx-auto grid max-w-7xl gap-8 border-t border-bone/10 px-6 py-16 md:grid-cols-2 lg:px-10" aria-label="Para quem é o projeto">
        <article className="flex gap-5"><Fingerprint className="mt-1 shrink-0 text-flare" size={28} /><div><p className="dossier-label">PARA ALUNOS</p><h2 className="mt-3 font-serif text-3xl">Assuma o papel de investigador.</h2><p className="mt-3 max-w-md text-sm leading-7 text-ash">Visualize sólidos, teste seus conhecimentos e acompanhe seu progresso com evidências, conquistas e novos níveis.</p></div></article>
        <article className="flex gap-5"><GraduationCap className="mt-1 shrink-0 text-flare" size={28} /><div><p className="dossier-label">PARA PROFESSORES</p><h2 className="mt-3 font-serif text-3xl">Acompanhe cada descoberta.</h2><p className="mt-3 max-w-md text-sm leading-7 text-ash">Uma central para acompanhar os alunos, consultar resultados e organizar os desafios da investigação.</p></div></article>
      </section>
      <section className="relative z-10 border-y border-flare/20 bg-[radial-gradient(ellipse_at_bottom,rgba(115,0,0,0.25),transparent_75%)] px-6 py-20 text-center">
        <p className="dossier-label justify-center">SUA MISSÃO COMEÇA AQUI</p><h2 className="mt-5 font-serif text-4xl sm:text-5xl">Há um arquivo esperando por você.</h2><p className="mx-auto mt-5 max-w-lg text-ash">Conheça a história do incidente e prepare-se para entrar no Laboratório Hawkins.</p><Link href="/experiencia" className="btn-primary mt-8">Iniciar experiência <ArrowRight size={18} /></Link>
      </section>
      <footer className="relative z-10 mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-6 py-7 font-mono text-[10px] tracking-[0.15em] text-ash lg:px-10"><span>LABORATÓRIO HAWKINS / ARQUIVO 011</span><span>UMA EXPERIÊNCIA EDUCACIONAL DE GEOMETRIA ESPACIAL</span></footer>
    </main>
  );
}
