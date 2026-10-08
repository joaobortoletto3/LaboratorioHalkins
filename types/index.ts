export type Role = "aluno" | "professor";
export type Difficulty = "facil" | "intermediario" | "dificil";
export type RoomStatus = "bloqueado" | "disponivel" | "em_andamento" | "concluido";
export type RoomTheme = "control" | "storage" | "tank" | "test" | "observation" | "underground" | "portal";

export type ShapeKind =
  | "cube"
  | "box"
  | "cylinder"
  | "cone"
  | "sphere"
  | "hemisphere"
  | "pyramid"
  | "prism"
  | "capsule"
  | "prism-pyramid"
  | "hollow-frustum"
  | "portal";

export interface ShapeSpec {
  kind: ShapeKind;
  /** dimensões em unidades da cena (r, h, w, d, a...) */
  dims: Record<string, number>;
  labels?: string[];
}

export interface DataItem {
  label: string;
  value: string;
}

export interface Challenge {
  id: string;
  roomId: string;
  title: string;
  story: string[];
  question: string;
  data: DataItem[];
  formulaHint: string;
  hint: string;
  difficulty: Difficulty;
  xpReward: number;
  evidenceId?: string;
  type: "numeric" | "code";
  unit?: string;
  inputLabel: string;
  source?: {
    label: string;
    url: string;
    note: string;
  };
}

export interface Room {
  id: string;
  order: number;
  sector: string;
  name: string;
  subtitle: string;
  description: string;
  story: string[];
  difficulty: Difficulty;
  theme: RoomTheme;
  shape: ShapeSpec;
  challengeId: string;
  terminalLines: string[];
}

export interface Evidence {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  content: string;
  stamp: "CLASSIFIED" | "CONFIDENTIAL" | "RESTRICTED ACCESS" | "TOP SECRET";
  tag?: string;
  rare: boolean;
  roomId: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "radio" | "shield" | "flame" | "target" | "eye" | "lock" | "zap";
}

export interface RoomProgress {
  status: RoomStatus;
  errors: number;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
}

export interface Attempt {
  id: string;
  challengeId: string;
  answer: string;
  correct: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: "paper" | "yellow" | "red" | "blue";
  createdAt: string;
  updatedAt: string;
}

export interface XpLogEntry {
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: Role;
  xp: number;
  level: number;
  lives: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  createdAt: string;
}

export interface GameState {
  profile: Profile;
  rooms: Record<string, RoomProgress>;
  evidences: string[];
  achievements: string[];
  attempts: Attempt[];
  activityDays: string[];
  xpLog: XpLogEntry[];
  caseClosedAt?: string | null;
}

export type GameEvent =
  | { type: "xp"; amount: number; label: string }
  | { type: "evidence"; evidenceId: string }
  | { type: "achievement"; achievementId: string }
  | { type: "levelup"; level: number }
  | { type: "unlock"; roomId: string }
  | { type: "life"; label: string };

export interface ApplyOutcome {
  state: GameState;
  events: GameEvent[];
}

export interface ValidateResponse {
  correct: boolean;
  blocked?: boolean;
  title: string;
  message: string;
  state?: GameState;
  events?: GameEvent[];
}

export interface StateResponse {
  mode: "demo" | "supabase";
  state?: GameState;
  error?: string;
}

export interface StudentSummary {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  currentRoom: string;
  progress: number;
  errors: number;
  accuracy: number;
  attempts: number;
  correct: number;
  completedRooms: number;
  lastActivity: string | null;
  streak: number;
  longestStreak: number;
  createdAt: string;
  activeToday: boolean;
  weeklyXp: number;
}

export interface StudentDetail extends StudentSummary {
  state: GameState;
}

export interface TeacherChallenge {
  id: string;
  roomId: string;
  title: string;
  story: string;
  question: string;
  content: string;
  difficulty: Difficulty;
  xpReward: number;
  hint: string;
  correctAnswer: string;
  tolerance: number;
  evidenceId: string;
  nextRoomId: string;
  active: boolean;
  orderIndex: number;
}

export interface TeacherRoom {
  id: string;
  name: string;
  sector: string;
  description: string;
  difficulty: Difficulty;
  orderIndex: number;
  status: "ativo" | "inativo";
}
