"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useHawkins } from "@/hooks/useHawkins";
import { HawkinsHeader } from "@/components/hawkins/ClassifiedHeader";
import { formatDateTime } from "@/lib/dates";
import type { Note } from "@/types";

const COLORS: { id: Note["color"]; label: string; cls: string }[] = [
  { id: "paper", label: "Papel", cls: "paper" },
  { id: "yellow", label: "Post-it", cls: "bg-[#f3d55b] text-[#1d1a14] shadow-[0_12px_30px_rgba(0,0,0,0.5)]" },
  { id: "red", label: "Urgente", cls: "bg-[#e8a39b] text-[#1d1a14] shadow-[0_12px_30px_rgba(0,0,0,0.5)]" },
  { id: "blue", label: "Planta", cls: "bg-[#a9c4ec] text-[#0b1730] shadow-[0_12px_30px_rgba(0,0,0,0.5)]" },
];

const cls = (c: Note["color"]) => COLORS.find((x) => x.id === c)?.cls ?? "paper";

export default function AnotacoesPage() {
  const { notes, saveNote, deleteNote } = useHawkins();
  const [editing, setEditing] = useState<Partial<Note> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!editing) return;
    if (!editing.title?.trim() && !editing.content?.trim()) {
      setError("Escreva um título ou conteúdo antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      await saveNote({ id: editing.id, title: editing.title?.trim() || "Sem título", content: editing.content ?? "", color: editing.color ?? "paper" });
      setEditing(null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Apagar esta anotação permanentemente?")) return;
    try {
      await deleteNote(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível apagar.");
    }
  };

  return (
    <div>
      <HawkinsHeader code="CADERNO DO INVESTIGADOR" title="Anotações" subtitle="Registre pistas, cálculos e suspeitas. Tudo fica salvo no seu dossiê.">
        <button className="btn-primary" onClick={() => setEditing({ color: "paper", title: "", content: "" })}>
          <Plus className="h-4 w-4" /> NOVA ANOTAÇÃO
        </button>
      </HawkinsHeader>

      {error && !editing && <p className="mb-4 border border-flare/40 bg-rust/20 p-3 text-sm text-flare">{error}</p>}

      {notes.length === 0 ? (
        <div className="paper paper-lined mx-auto max-w-lg rotate-[-1deg] p-8 text-center">
          <p className="typewriter text-lg">Caderno vazio.</p>
          <p className="typewriter mt-2 text-sm text-[#5a5143]">Comece anotando as medidas da primeira sala. Todo detalhe importa.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((n, i) => (
            <motion.article
              key={n.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }}
              className={`${cls(n.color)} relative flex min-h-[200px] flex-col p-5`}
            >
              <h3 className="typewriter text-base font-semibold">{n.title}</h3>
              <p className="typewriter mt-2 flex-1 whitespace-pre-wrap text-sm leading-relaxed">{n.content}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="typewriter text-[10px] opacity-60">{formatDateTime(n.updatedAt)}</span>
                <div className="flex gap-2">
                  <button aria-label="Editar" onClick={() => setEditing(n)} className="p-1 opacity-70 hover:opacity-100">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button aria-label="Apagar" onClick={() => onDelete(n.id)} className="p-1 text-[#a01010] opacity-70 hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-void/85 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className={`${cls(editing.color ?? "paper")} paper-lined relative w-full max-w-lg p-6`}>
              <button onClick={() => setEditing(null)} aria-label="Fechar" className="absolute right-3 top-3 p-1">
                <X className="h-5 w-5" />
              </button>
              <p className="typewriter text-[10px] tracking-[0.3em] opacity-70">{editing.id ? "EDITAR REGISTRO" : "NOVO REGISTRO"}</p>
              <input
                className="typewriter mt-3 w-full border-b border-current/30 bg-transparent py-2 text-lg font-semibold outline-none placeholder:opacity-50"
                placeholder="Título"
                value={editing.title ?? ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                maxLength={120}
              />
              <textarea
                className="typewriter mt-3 h-48 w-full resize-none bg-transparent text-sm leading-7 outline-none placeholder:opacity-50"
                placeholder="Pistas, medidas, cálculos..."
                value={editing.content ?? ""}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                maxLength={5000}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setEditing({ ...editing, color: c.id })}
                    className={`typewriter border px-2 py-1 text-[11px] ${editing.color === c.id ? "border-current" : "border-current/20 opacity-60"}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {error && <p className="typewriter mt-3 text-xs text-[#a01010]">{error}</p>}
              <button onClick={onSave} disabled={saving} className="typewriter mt-5 w-full bg-[#1d1a14] py-3 text-sm tracking-[0.25em] text-[#e8dfc8] disabled:opacity-50">
                {saving ? "SALVANDO..." : "SALVAR"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
