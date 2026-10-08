"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { GameEvent, GameState, Note, StateResponse, ValidateResponse } from "@/types";
import { applyResult, createInitialState, markRoomStarted, normalizeStreak } from "@/lib/game";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { uid } from "@/lib/utils";
import { isComplementaryChallenge } from "@/lib/complementary";

const STATE_KEY = "hawkins_state_v1";
const NOTES_KEY = "hawkins_notes_v1";
export const DEMO_NAME_KEY = "hawkins_demo_name";
export const DEMO_EMAIL_KEY = "hawkins_demo_email";

export type SubmitStatus = "correct" | "incorrect" | "blocked" | "error";
export interface SubmitResult {
  status: SubmitStatus;
  title: string;
  message: string;
  events: GameEvent[];
}

interface HawkinsCtx {
  mode: "loading" | "demo" | "supabase";
  state: GameState | null;
  notes: Note[];
  events: GameEvent[];
  error: string | null;
  submitAnswer: (challengeId: string, answer: string) => Promise<SubmitResult>;
  startRoom: (roomId: string) => void;
  saveNote: (note: Pick<Note, "title" | "content" | "color"> & { id?: string }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  dismissEvent: () => void;
  resetDemo: () => void;
  signOut: () => Promise<void>;
}

const Ctx = createContext<HawkinsCtx | null>(null);

function loadDemoState(): GameState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return normalizeStreak(JSON.parse(raw) as GameState);
  } catch {
    /* estado corrompido: recria */
  }
  const name = localStorage.getItem(DEMO_NAME_KEY) || "Agente Demo";
  const email = localStorage.getItem(DEMO_EMAIL_KEY) || "agente@hawkins.demo";
  return createInitialState({ id: "demo-agent-011", name, email });
}

export function HawkinsProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<HawkinsCtx["mode"]>("loading");
  const [state, setState] = useState<GameState | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const stateRef = useRef<GameState | null>(null);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        const json = (await res.json()) as StateResponse;
        if (cancelled) return;
        if (json.mode === "supabase") {
          if (!json.state) {
            setError("Não foi possível carregar seu dossiê. Faça login novamente.");
            setMode("supabase");
            return;
          }
          setMode("supabase");
          setState(json.state);
          const sb = getBrowserSupabase();
          if (sb) {
            const { data } = await sb.from("notes").select("id,title,content,color,created_at,updated_at").order("updated_at", { ascending: false });
            setNotes(
              ((data ?? []) as { id: string; title: string; content: string; color: Note["color"]; created_at: string; updated_at: string }[]).map((n) => ({
                id: n.id,
                title: n.title,
                content: n.content,
                color: n.color,
                createdAt: n.created_at,
                updatedAt: n.updated_at,
              })),
            );
          }
        } else {
          setMode("demo");
          setState(loadDemoState());
          try {
            setNotes(JSON.parse(localStorage.getItem(NOTES_KEY) ?? "[]") as Note[]);
          } catch {
            setNotes([]);
          }
        }
      } catch {
        if (cancelled) return;
        setMode("demo");
        setState(loadDemoState());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode === "demo" && state) localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }, [mode, state]);
  useEffect(() => {
    if (mode === "demo") localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [mode, notes]);

  const submitAnswer = useCallback(
    async (challengeId: string, answer: string): Promise<SubmitResult> => {
      const current = stateRef.current;
      if (!current) return { status: "error", title: "SYSTEM FAILURE", message: "Dossiê ainda não carregado.", events: [] };
      if (!isComplementaryChallenge(challengeId) && !challengeId.startsWith("t-") && current.profile.lives <= 0) {
        return {
          status: "blocked",
          title: "TENTATIVAS ESGOTADAS",
          message: "Conclua o PROTOCOLO DE TREINAMENTO para recuperar tentativas.",
          events: [],
        };
      }
      try {
        const res = await fetch("/api/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId, answer }),
        });
        const json = (await res.json()) as ValidateResponse & { error?: string };
        if (!res.ok) return { status: "error", title: "SYSTEM FAILURE", message: json.error ?? "Tente novamente.", events: [] };
        let evts: GameEvent[] = [];
        if (mode === "supabase" && json.state) {
          setState(json.state);
          evts = json.events ?? [];
        } else if (!json.blocked) {
          const out = applyResult(current, challengeId, answer, json.correct);
          setState(out.state);
          evts = out.events;
        }
        if (evts.length) setEvents((e) => [...e, ...evts.filter((x) => isComplementaryChallenge(challengeId) || x.type !== "xp" || x.amount >= 20)]);
        return {
          status: json.blocked ? "blocked" : json.correct ? "correct" : "incorrect",
          title: json.title,
          message: json.message,
          events: evts,
        };
      } catch {
        return { status: "error", title: "SINAL PERDIDO", message: "Não foi possível falar com o servidor. Verifique sua conexão.", events: [] };
      }
    },
    [mode],
  );

  const startRoom = useCallback(
    (roomId: string) => {
      const current = stateRef.current;
      if (!current || current.rooms[roomId]?.status !== "disponivel") return;
      setState(markRoomStarted(current, roomId));
      if (mode === "supabase") {
        void fetch("/api/progress/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomId }) });
      }
    },
    [mode],
  );

  const saveNote = useCallback(
    async (input: Pick<Note, "title" | "content" | "color"> & { id?: string }) => {
      const now = new Date().toISOString();
      if (mode === "supabase") {
        const sb = getBrowserSupabase();
        const uidUser = stateRef.current?.profile.id;
        if (!sb || !uidUser) throw new Error("Sessão indisponível");
        if (input.id) {
          const { error: e } = await sb.from("notes").update({ title: input.title, content: input.content, color: input.color, updated_at: now }).eq("id", input.id);
          if (e) throw new Error("Não foi possível salvar a anotação.");
          setNotes((ns) => ns.map((n) => (n.id === input.id ? { ...n, ...input, updatedAt: now } : n)));
        } else {
          const { data, error: e } = await sb
            .from("notes")
            .insert({ user_id: uidUser, title: input.title, content: input.content, color: input.color })
            .select("id,created_at,updated_at")
            .single();
          if (e || !data) throw new Error("Não foi possível criar a anotação.");
          const row = data as { id: string; created_at: string; updated_at: string };
          setNotes((ns) => [{ id: row.id, title: input.title, content: input.content, color: input.color, createdAt: row.created_at, updatedAt: row.updated_at }, ...ns]);
        }
        return;
      }
      if (input.id) setNotes((ns) => ns.map((n) => (n.id === input.id ? { ...n, ...input, updatedAt: now } : n)));
      else setNotes((ns) => [{ id: uid(), title: input.title, content: input.content, color: input.color, createdAt: now, updatedAt: now }, ...ns]);
    },
    [mode],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (mode === "supabase") {
        const sb = getBrowserSupabase();
        if (!sb) return;
        const { error: e } = await sb.from("notes").delete().eq("id", id);
        if (e) throw new Error("Não foi possível apagar a anotação.");
      }
      setNotes((ns) => ns.filter((n) => n.id !== id));
    },
    [mode],
  );

  const resetDemo = useCallback(() => {
    if (mode !== "demo") return;
    localStorage.removeItem(STATE_KEY);
    setState(loadDemoState());
  }, [mode]);

  const signOut = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (sb) await sb.auth.signOut();
    await fetch("/api/auth/demo", { method: "DELETE" }).catch(() => undefined);
    window.location.href = "/login";
  }, []);

  const dismissEvent = useCallback(() => setEvents((e) => e.slice(1)), []);

  const value = useMemo<HawkinsCtx>(
    () => ({ mode, state, notes, events, error, submitAnswer, startRoom, saveNote, deleteNote, dismissEvent, resetDemo, signOut }),
    [mode, state, notes, events, error, submitAnswer, startRoom, saveNote, deleteNote, dismissEvent, resetDemo, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHawkins(): HawkinsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useHawkins deve ser usado dentro de <HawkinsProvider>");
  return ctx;
}
