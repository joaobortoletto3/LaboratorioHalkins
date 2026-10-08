"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordField({ value, onChange, newPassword = false, disabled = false }: { value: string; onChange: (value: string) => void; newPassword?: boolean; disabled?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor="password" className="mb-2 block font-mono text-[11px] tracking-[0.18em] text-ash">SENHA</label>
      <div className="relative">
        <input id="password" name="password" className="input-term !pr-14" type={visible ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={newPassword ? "new-password" : "current-password"} placeholder={newPassword ? "Crie uma senha" : "Digite sua senha"} minLength={6} required disabled={disabled} aria-describedby={newPassword ? "password-hint" : undefined} />
        <button type="button" onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-ash hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-flare" aria-label={visible ? "Ocultar senha" : "Mostrar senha"} aria-pressed={visible}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </div>
      {newPassword && <p id="password-hint" className="mt-2 text-xs text-ash">Use pelo menos 6 caracteres.</p>}
    </div>
  );
}
