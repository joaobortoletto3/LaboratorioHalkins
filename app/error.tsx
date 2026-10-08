"use client";

import { useEffect } from "react";
import { VHSOverlay } from "@/components/hawkins/VHSOverlay";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center bg-void px-6 text-center">
      <VHSOverlay />
      <div className="relative z-10">
        <h1 className="glitch title-solid text-5xl" data-text="SYSTEM FAILURE">
          SYSTEM FAILURE
        </h1>
        <p className="mt-4 text-ash">Não foi possível acessar este setor.</p>
        <button onClick={reset} className="btn-primary mt-8">
          TRY AGAIN
        </button>
      </div>
    </main>
  );
}
