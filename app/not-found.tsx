import Link from "next/link";
import { VHSOverlay } from "@/components/hawkins/VHSOverlay";
import { Particles } from "@/components/hawkins/Particles";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-void px-6 text-center">
      <Particles count={20} />
      <VHSOverlay />
      <div className="relative z-10">
        <p className="font-mono text-xs tracking-[0.4em] text-ash">ERRO 404</p>
        <h1 className="glitch title-solid mt-4 text-5xl sm:text-7xl" data-text="SIGNAL LOST">
          SIGNAL LOST
        </h1>
        <p className="crt-text mt-6 font-mono text-sm tracking-[0.3em]">LOCATION UNKNOWN</p>
        <p className="mt-2 font-mono text-xs tracking-[0.3em] text-ash">RETURN TO HAWKINS</p>
        <Link href="/aluno/laboratorio" className="btn-primary mt-10">
          VOLTAR AO LABORATÓRIO
        </Link>
      </div>
    </main>
  );
}
