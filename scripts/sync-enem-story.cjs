const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const cache = new Map();
function load(relative) {
  const filename = path.join(root, relative + ".ts");
  if (cache.has(filename)) return cache.get(filename);
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", code)((id) => id === "server-only" ? {} : id.startsWith("@/") ? load(id.slice(2)) : require(id), module, module.exports);
  cache.set(filename, module.exports);
  return module.exports;
}
const { CHALLENGES, TRAINING_CHALLENGES, ROOMS } = load("lib/data/rooms");
const { EVIDENCES } = load("lib/data/evidences");
const { DEMO_ANSWER_KEY } = load("lib/server/answers");
const quote = (value) => value == null ? "null" : typeof value === "number" || typeof value === "boolean" ? String(value) : "'" + value.replaceAll("'", "''").replaceAll("\n", " ") + "'";
const row = (values) => "(" + values.map(quote).join(",") + ")";
const challengeRows = CHALLENGES.map((c, i) => row([
  c.id, c.roomId, c.title, c.story.join("\n"), c.question, c.formulaHint,
  c.type, c.difficulty, c.xpReward, c.hint, DEMO_ANSWER_KEY[c.id].answer,
  DEMO_ANSWER_KEY[c.id].tolerance, c.evidenceId ?? null, ROOMS[i + 1]?.id ?? null, i + 1, true,
]));
const challengeConflict = "on conflict (id) do update set title=excluded.title, story=excluded.story, question=excluded.question, content=excluded.content, type=excluded.type, difficulty=excluded.difficulty, xp_reward=excluded.xp_reward, hint=excluded.hint, correct_answer=excluded.correct_answer, tolerance=excluded.tolerance, evidence_id=excluded.evidence_id, next_room_id=excluded.next_room_id;";
const insertChallenges = "insert into public.challenges (id, room_id, title, story, question, content, type, difficulty, xp_reward, hint, correct_answer, tolerance, evidence_id, next_room_id, order_index, active) values\n" + challengeRows.join(",\n") + "\n" + challengeConflict;
const roomUpdates = ROOMS.map((r) => `update public.rooms set story=${quote(r.story.join("\n"))}, description=${quote(r.description)}, difficulty=${quote(r.difficulty)} where id=${quote(r.id)};`).join("\n");
const evidenceUpdates = EVIDENCES.map((e) => `update public.evidences set content=${quote(e.content)}, tag=${quote(e.tag ?? null)} where id=${quote(e.id)};`).join("\n");
fs.writeFileSync(path.join(root, "supabase/enem-story.sql"), "-- Gerado por node scripts/sync-enem-story.cjs. Execute no SQL Editor de um banco já configurado.\n-- Atualiza somente a história; preserva questões complementares, tentativas, XP e progresso.\nbegin;\n" + roomUpdates + "\n" + evidenceUpdates + "\n" + insertChallenges + "\ncommit;\n", "utf8");

const seedPath = path.join(root, "supabase/seed.sql");
let seed = fs.readFileSync(seedPath, "utf8");
const trainingRows = TRAINING_CHALLENGES.map((c, i) => row([c.id, c.roomId, c.title, c.story.join("\n"), c.question, c.formulaHint, c.type, c.difficulty, c.xpReward, c.hint, DEMO_ANSWER_KEY[c.id].answer, DEMO_ANSWER_KEY[c.id].tolerance, null, null, 90 + i, true]));
const seedChallenges = insertChallenges.replace(challengeRows.join(",\n"), [...challengeRows, ...trainingRows].join(",\n"));
seed = seed.replace(/insert into public\.challenges\b[\s\S]*?on conflict \(id\) do update[^;]*;/, seedChallenges);
const roomRows = ROOMS.map((r) => row([r.id, "hnl", r.name, r.description, r.story.join("\n"), r.order, r.difficulty, r.sector, "ativo"]));
roomRows.push(row(["treinamento", "hnl", "Protocolo de Treinamento", "Simulações de revisão.", "Recupere tentativas.", 99, "facil", "TREINAMENTO", "ativo"]));
seed = seed.replace(/insert into public\.rooms\b[\s\S]*?on conflict \(id\) do update[^;]*;/, "insert into public.rooms (id, laboratory_id, name, description, story, order_index, difficulty, sector, status) values\n" + roomRows.join(",\n") + "\non conflict (id) do update set name=excluded.name, story=excluded.story, description=excluded.description, difficulty=excluded.difficulty, order_index=excluded.order_index;");
const evidenceRows = EVIDENCES.map((e) => row([e.id, e.roomId, e.code, e.title, e.subtitle, e.description, e.content, e.stamp, e.tag ?? null, e.rare]));
seed = seed.replace(/insert into public\.evidences\b[\s\S]*?on conflict \(id\) do update[^;]*;/, "insert into public.evidences (id, room_id, code, title, subtitle, description, content, stamp, tag, rare) values\n" + evidenceRows.join(",\n") + "\non conflict (id) do update set title=excluded.title, content=excluded.content, tag=excluded.tag;");
fs.writeFileSync(seedPath, seed, "utf8");
console.log("Seed e atualização da história sincronizados com os seis desafios ENEM e o protocolo final.");
