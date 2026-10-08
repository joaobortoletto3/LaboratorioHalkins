const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Run the project's TypeScript directly without adding a test runtime dependency.
const root = path.resolve(__dirname, "..");
const modules = new Map();
function load(relative) {
  const filename = path.join(root, relative + ".ts");
  if (modules.has(filename)) return modules.get(filename);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (id) => id === "server-only" ? {} : id.startsWith("@/") ? load(id.slice(2)) : require(id);
  new Function("require", "module", "exports", output)(localRequire, module, module.exports);
  modules.set(filename, module.exports);
  return module.exports;
}
const { buildStudentSummaries } = load("lib/server/student-summaries");
const { buildState } = load("lib/server/state");
const { summarizeClient } = load("lib/summary");
const { dayKey, addDays } = load("lib/dates");

function client(tables, failTable) {
  const calls = [];
  return {
    calls,
    from(table) {
      let rows = [...(tables[table] ?? [])];
      let single = false;
      let range;
      const query = {
        select(columns) { calls.push({ table, columns }); return query; },
        eq(key, value) { rows = rows.filter((row) => row[key] === value); return query; },
        gte(key, value) { rows = rows.filter((row) => row[key] >= value); return query; },
        order(key) { rows.sort((a, b) => String(a[key]).localeCompare(String(b[key]))); return query; },
        range(start, end) { range = [start, end]; return query; },
        single() { single = true; return query; },
        then(resolve, reject) {
          if (range) rows = rows.slice(range[0], range[1] + 1);
          return Promise.resolve({ data: single ? rows[0] ?? null : rows, error: table === failTable ? new Error("Database unavailable") : null }).then(resolve, reject);
        },
      };
      return query;
    },
  };
}

function fixture(count = 30) {
  const now = new Date();
  const recent = addDays(now, -1).toISOString();
  const old = addDays(now, -10).toISOString();
  const profiles = Array.from({ length: count }, (_, i) => ({
    id: `student-${i}`, name: i ? `Student ${i}` : null, email: `student-${i}@example.org`, role: "aluno",
    xp: 75, level: 2, lives: 5, current_streak: 3, longest_streak: 5,
    last_activity_date: i % 2 ? dayKey() : dayKey(addDays(now, -10)), created_at: old, case_closed_at: null,
  }));
  return {
    profiles: [...profiles, { ...profiles[0], id: "teacher", role: "professor" }],
    progress: profiles.map((p, i) => ({ id: `progress-${i}`, user_id: p.id, room_id: "sala-01", status: "concluido", errors: 1 })),
    attempts: profiles.flatMap((p, i) => [
      { id: `a-${i}`, user_id: p.id, challenge_id: "c-01", correct: false, answer: "0", created_at: old },
      { id: `b-${i}`, user_id: p.id, challenge_id: "c-01", correct: true, answer: "1", created_at: recent },
      { id: `c-${i}`, user_id: p.id, challenge_id: "t-01", correct: true, answer: "2", created_at: now.toISOString() },
    ]),
    xp_logs: profiles.flatMap((p, i) => [
      { id: `old-${i}`, user_id: p.id, amount: 100, reason: "old", created_at: old },
      { id: `new-${i}`, user_id: p.id, amount: 75, reason: "recent", created_at: recent },
    ]),
  };
}

test("overview matches full states while using four queries for 30 students", async () => {
  const data = fixture();
  const sb = client(data);
  const actual = await buildStudentSummaries(sb);
  const expected = await Promise.all(data.profiles.filter((p) => p.role === "aluno").sort((a, b) => a.id.localeCompare(b.id)).map(async (p) => summarizeClient(await buildState(client(data), p.id))));
  assert.deepEqual(actual, expected);
  assert.equal(sb.calls.length, 4);
  assert.equal(actual[0].attempts, 2);
  assert.equal(actual[0].weeklyXp, 75);
  assert.equal(actual[0].streak, 0);
  assert.ok(!sb.calls.find((call) => call.table === "attempts").columns.split(",").includes("answer"));
});

test("paginates more than 500 attempts without losing statistics", async () => {
  const data = fixture(1);
  const original = data.attempts[0];
  data.attempts = Array.from({ length: 1001 }, (_, i) => ({ ...original, id: `attempt-${i}`, correct: i % 2 === 0 }));
  const sb = client(data);
  const [summary] = await buildStudentSummaries(sb);
  assert.equal(summary.attempts, 1001);
  assert.equal(summary.correct, 501);
  assert.equal(sb.calls.filter((call) => call.table === "attempts").length, 3);
});

test("empty class returns no students", async () => {
  assert.deepEqual(await buildStudentSummaries(client({})), []);
});

test("database errors fail the overview instead of returning partial statistics", async () => {
  await assert.rejects(buildStudentSummaries(client(fixture(), "attempts")), /Database unavailable/);
});
