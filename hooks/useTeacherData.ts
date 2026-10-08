"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudentDetail, StudentSummary, TeacherChallenge, TeacherRoom } from "@/types";
import { CHALLENGES, ROOMS } from "@/lib/data/rooms";

type Mode = "loading" | "demo" | "supabase";

export function useStudents() {
  const [mode, setMode] = useState<Mode>("loading");
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/teacher/overview", { cache: "no-store" });
        const json = (await res.json()) as { mode?: "demo" | "supabase"; students?: StudentSummary[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Falha ao carregar alunos");
        if (json.mode === "supabase") {
          setMode("supabase");
          if (json.students) setStudents(json.students);
          else setError(json.error ?? "Não foi possível carregar os alunos.");
        } else if (json.mode === "demo") {
          setMode("demo");
          setStudents([]);
        } else {
          throw new Error("Resposta inválida ao carregar alunos.");
        }
      } catch (err) {
        setMode("supabase");
        setError(err instanceof Error ? err.message : "Não foi possível carregar os alunos. Tente novamente.");
      }
    })();
  }, []);
  return { mode, students, error };
}

export function useStudent(id: string) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/teacher/students/${encodeURIComponent(id)}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Falha ao carregar aluno.");
        const json = (await res.json()) as { mode?: string; student?: StudentDetail; error?: string };
        if (json.mode === "supabase") {
          if (json.student) setStudent(json.student);
          else setError(json.error ?? "Agente não encontrado.");
        } else {
          setError("Aluno não encontrado. O modo demonstração não possui alunos cadastrados.");
        }
      } catch {
        setError("Não foi possível carregar o agente.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);
  return { student, loading, error };
}

const DEMO_CH_KEY = "hawkins_teacher_challenges_v1";
const DEMO_ROOMS_KEY = "hawkins_teacher_rooms_v1";

function defaultDemoChallenges(): TeacherChallenge[] {
  return CHALLENGES.map((c, i) => ({
    id: c.id,
    roomId: c.roomId,
    title: c.title,
    story: [...(ROOMS.find((r) => r.id === c.roomId)?.story ?? []), ...c.story].join("\n"),
    question: c.question,
    content: c.formulaHint,
    difficulty: c.difficulty,
    xpReward: c.xpReward,
    hint: c.hint,
    correctAnswer: "", // gabarito nunca vai ao navegador
    tolerance: 0,
    evidenceId: c.evidenceId ?? "",
    nextRoomId: ROOMS[ROOMS.findIndex((r) => r.id === c.roomId) + 1]?.id ?? "",
    active: true,
    orderIndex: i + 1,
  }));
}

export function useTeacherChallenges() {
  const [mode, setMode] = useState<Mode>("loading");
  const [items, setItems] = useState<TeacherChallenge[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/teacher/challenges", { cache: "no-store" });
      const json = (await res.json()) as { mode?: string; challenges?: TeacherChallenge[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Erro ao carregar desafios.");
      if (json.mode === "supabase") {
        setMode("supabase");
        if (json.challenges) setItems(json.challenges);
        else setError(json.error ?? "Erro ao carregar desafios.");
        return;
      }
      if (json.mode !== "demo") throw new Error("Resposta inválida ao carregar desafios.");
      setMode("demo");
      try {
        const raw = localStorage.getItem(DEMO_CH_KEY);
        setItems(raw ? (JSON.parse(raw) as TeacherChallenge[]) : defaultDemoChallenges());
      } catch {
        setItems(defaultDemoChallenges());
      }
    } catch (err) {
      setMode("supabase");
      setError(err instanceof Error ? err.message : "Não foi possível carregar os desafios. Tente novamente.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const persistDemo = (next: TeacherChallenge[]) => {
    localStorage.setItem(DEMO_CH_KEY, JSON.stringify(next));
    setItems(next);
  };

  const save = useCallback(
    async (c: TeacherChallenge, isNew: boolean) => {
      if (mode === "loading" || error) throw new Error(error ?? "Aguarde o carregamento dos desafios.");
      if (mode === "supabase") {
        const res = await fetch(isNew ? "/api/teacher/challenges" : `/api/teacher/challenges/${c.id}`, {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(c),
        });
        if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Erro ao salvar.");
        await load();
        return;
      }
      const raw = localStorage.getItem(DEMO_CH_KEY);
      const list = raw ? (JSON.parse(raw) as TeacherChallenge[]) : defaultDemoChallenges();
      persistDemo(isNew ? [...list, c] : list.map((x) => (x.id === c.id ? c : x)));
    },
    [mode, load, error],
  );

  const remove = useCallback(
    async (id: string) => {
      if (mode === "supabase") {
        const res = await fetch(`/api/teacher/challenges/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Erro ao excluir.");
        await load();
        return;
      }
      persistDemo(items.filter((x) => x.id !== id));
    },
    [mode, items, load],
  );

  const reorder = useCallback(
    async (next: TeacherChallenge[]) => {
      const withOrder = next.map((c, i) => ({ ...c, orderIndex: i + 1 }));
      if (mode === "supabase") {
        setItems(withOrder);
        await Promise.all(
          withOrder.map((c) =>
            fetch(`/api/teacher/challenges/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) }),
          ),
        );
        return;
      }
      persistDemo(withOrder);
    },
    [mode],
  );

  return { mode, items, error, save, remove, reorder, reload: load };
}

function defaultDemoRooms(): TeacherRoom[] {
  return ROOMS.map((r) => ({
    id: r.id,
    name: r.name,
    sector: r.sector,
    description: r.description,
    difficulty: r.difficulty,
    orderIndex: r.order,
    status: "ativo",
  }));
}

export function useTeacherRooms() {
  const [mode, setMode] = useState<Mode>("loading");
  const [rooms, setRooms] = useState<TeacherRoom[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/teacher/rooms", { cache: "no-store" });
        const json = (await res.json()) as { mode?: string; rooms?: TeacherRoom[] };
        if (json.mode === "supabase" && json.rooms) {
          setMode("supabase");
          setRooms(json.rooms);
          return;
        }
      } catch {
        /* demo */
      }
      setMode("demo");
      try {
        const raw = localStorage.getItem(DEMO_ROOMS_KEY);
        setRooms(raw ? (JSON.parse(raw) as TeacherRoom[]) : defaultDemoRooms());
      } catch {
        setRooms(defaultDemoRooms());
      }
    })();
  }, []);

  const saveAll = useCallback(
    async (next: TeacherRoom[]) => {
      const ordered = next.map((r, i) => ({ ...r, orderIndex: i + 1 }));
      setRooms(ordered);
      if (mode === "supabase") {
        const res = await fetch("/api/teacher/rooms", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rooms: ordered }) });
        if (!res.ok) throw new Error("Não foi possível salvar os setores.");
      } else {
        localStorage.setItem(DEMO_ROOMS_KEY, JSON.stringify(ordered));
      }
    },
    [mode],
  );
  return { mode, rooms, saveAll };
}
