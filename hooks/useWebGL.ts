"use client";

import { useEffect, useState } from "react";

let supported: boolean | undefined;

/** Detecta suporte a WebGL. null = verificando. */
export function useWebGL(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    if (supported !== undefined) {
      setOk(supported);
      return;
    }
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      supported = Boolean(gl);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      setOk(supported);
    } catch {
      supported = false;
      setOk(false);
    }
  }, []);
  return ok;
}
