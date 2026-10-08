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

test("state query errors fail validation instead of losing saved progress", async () => {
  await assert.rejects(buildState(client(fixture(1), "progress"), "student-0"), /Database unavailable/);
});

test("reactor accepts the water saving answer with decimal notation and litres", () => {
  const { checkAnswer } = load("lib/server/validate");
  const { DEMO_ANSWER_KEY } = load("lib/server/answers");
  for (const answer of ["50", "50,0", "50 L", "50l"]) {
    assert.equal(checkAnswer(DEMO_ANSWER_KEY["c-01"], answer), true);
  }
  assert.equal(checkAnswer(DEMO_ANSWER_KEY["c-01"], "200"), false);
});

// Independently solve each adapted ENEM problem using its public measurements.
function calculatedAnswers() {
  const { ALL_CHALLENGES } = load("lib/data/rooms");
  const datum = (id, index) => Number(ALL_CHALLENGES.find((c) => c.id === id).data[index].value.split(" ")[0].replace(",", "."));
  const projects = ALL_CHALLENGES.find((c) => c.id === "c-02").data.map((d) => d.value.replace(" m", "").split(" × ").map((v) => Number(v.replace(",", "."))));
  const [shortSide, longSide, pi] = [0, 1, 2].map((i) => datum("c-03", i));
  const coneHeight = datum("c-04", 0), coneRadius = datum("c-04", 1) / 2, smallRadius = datum("c-04", 2) / 2;
  const smallHeight = coneHeight * smallRadius / coneRadius;
  const conePi = datum("c-04", 4);
  const remainingVolume = conePi * coneRadius ** 2 * coneHeight / 3 - conePi * smallRadius ** 2 * smallHeight / 3 - conePi * smallRadius ** 2 * (coneHeight - smallHeight);
  const answers = {
    "c-01": datum("c-01", 4) - datum("c-01", 2) * datum("c-01", 0) ** 2 * datum("c-01", 1) * 1000 / (datum("c-01", 3) * datum("c-01", 5)),
    "c-02": Math.min(...projects.map(([h, w, l]) => w * l + 2 * h * (w + l))),
    "c-03": Math.max(pi * (shortSide / (2 * pi)) ** 2 * longSide, pi * (longSide / (2 * pi)) ** 2 * shortSide),
    "c-04": Math.round(remainingVolume * datum("c-04", 3) * 10) / 10,
    "c-05": datum("c-05", 3) / datum("c-05", 0) * (datum("c-05", 2) / datum("c-05", 1)) ** 3,
    "c-06": datum("c-06", 0) ** 2 * datum("c-06", 1) / ((4 / 3) * (datum("c-06", 2) / 2) ** 3),
    "t-01": datum("t-01", 0) ** 3,
    "t-02": datum("t-02", 2) * datum("t-02", 0) ** 2 * datum("t-02", 1) / 3,
    "t-03": datum("t-03", 0) ** 2 * datum("t-03", 1) / 3,
  };
  answers["f-011"] = `${answers["c-01"]}${answers["c-02"]}${answers["c-04"]}7B`.replace(/[^A-Z0-9]/g, "");
  return answers;
}

test("all ten questions have mathematically correct keys and reject incorrect answers", () => {
  const { ALL_CHALLENGES } = load("lib/data/rooms");
  const { DEMO_ANSWER_KEY } = load("lib/server/answers");
  const { checkAnswer } = load("lib/server/validate");
  const answers = calculatedAnswers();
  assert.equal(ALL_CHALLENGES.length, 10);
  assert.deepEqual(Object.keys(DEMO_ANSWER_KEY).sort(), ALL_CHALLENGES.map((c) => c.id).sort());
  for (const challenge of ALL_CHALLENGES) {
    const expected = answers[challenge.id];
    const key = DEMO_ANSWER_KEY[challenge.id];
    assert.equal(key.answer, String(expected), challenge.id);
    assert.equal(key.type, challenge.type, challenge.id);
    assert.equal(checkAnswer(key, String(expected)), true, challenge.id);
    if (challenge.type === "numeric") {
      for (const raw of [` ${expected} `, String(expected).replace(".", ","), Number(expected).toFixed(2), ...(challenge.unit ? [`${expected} ${challenge.unit}`, `${expected} ${challenge.unit.replace("³", "^3").replace("²", "^2")}`] : [])]) {
        assert.equal(checkAnswer(key, raw), true, `${challenge.id}: ${raw}`);
      }
      for (const raw of [String(expected + 1), String(expected - 1), "", "abc", "NaN", "Infinity", "0x" + expected.toString(16)]) {
        assert.equal(checkAnswer(key, raw), false, `${challenge.id}: ${raw}`);
      }
    } else {
      assert.equal(checkAnswer(key, "50-101-1296-7b"), true);
      assert.equal(checkAnswer(key, "1015012967B"), false);
      assert.equal(checkAnswer(key, "5010112967C"), false);
    }
  }
});

test("Supabase seed matches all ten verified answer keys", () => {
  const sql = fs.readFileSync(path.join(root, "supabase/seed.sql"), "utf8");
  const { DEMO_ANSWER_KEY } = load("lib/server/answers");
  for (const [id, key] of Object.entries(DEMO_ANSWER_KEY)) {
    const row = sql.split(/\r?\n/).find((line) => line.startsWith(`('${id}',`));
    assert.ok(row, `Missing ${id}`);
    const columns = row.match(/'(?:[^']|'')*'|\b\d+\b|\bnull\b|\btrue\b/g);
    assert.equal(columns[6], `'${key.type}'`, id);
    assert.equal(columns[10], `'${key.answer}'`, id);
    assert.equal(Number(columns[11]), key.tolerance, id);
  }
});

test("six story challenges cite official ENEM sources and keep detailed formulas in hints", () => {
  const { CHALLENGES, ROOMS } = load("lib/data/rooms");
  for (const challenge of CHALLENGES.filter((c) => c.type === "numeric")) {
    assert.ok(challenge.source.label.includes("ENEM"), challenge.id);
    assert.equal(new URL(challenge.source.url).hostname, "download.inep.gov.br");
    assert.ok(challenge.hint.length > challenge.formulaHint.length, challenge.id);
    assert.equal(ROOMS.find((r) => r.id === challenge.roomId).difficulty, challenge.difficulty);
  }
  assert.equal(CHALLENGES.filter((c) => c.source).length, 6);
});

test("verified records normalize litres, grams, decimal commas and trailing zeroes for the finale", () => {
  const { createInitialState, correctAnswerFor } = load("lib/game");
  const { checkAnswer } = load("lib/server/validate");
  const { DEMO_ANSWER_KEY, DEMO_FINAL_KEYS } = load("lib/server/answers");
  const state = createInitialState({ id: "test", name: "Aluno", email: "test@example.org" });
  state.attempts = [
    { challengeId: "c-01", answer: "50,00 L", correct: true },
    { challengeId: "c-02", answer: "101 m²", correct: true },
    { challengeId: "c-04", answer: "1296,000 g", correct: true },
  ];
  const sequence = ["c-01", "c-02", "c-04"].map((id) => correctAnswerFor(state, id)).join("") + "7B";
  assert.equal(checkAnswer(DEMO_ANSWER_KEY["f-011"], sequence), true);
  assert.ok(DEMO_FINAL_KEYS.some((key) => checkAnswer(key, "480-352-228-7B")));
  assert.ok(DEMO_FINAL_KEYS.some((key) => checkAnswer(key, "480-101-1296-7B")));
});

test("all correct sector answers unlock the next room and close the case", () => {
  const { ROOMS } = load("lib/data/rooms");
  const { createInitialState, applyResult, computeStats } = load("lib/game");
  const { checkAnswer } = load("lib/server/validate");
  const { DEMO_ANSWER_KEY } = load("lib/server/answers");
  const answers = calculatedAnswers();
  let state = createInitialState({ id: "test-student", name: "Aluno", email: "test@example.org" });
  for (const room of ROOMS) {
    assert.equal(state.rooms[room.id].status, "disponivel", room.id);
    const answer = String(answers[room.challengeId]);
    state = applyResult(state, room.challengeId, answer, checkAnswer(DEMO_ANSWER_KEY[room.challengeId], answer)).state;
    assert.equal(state.rooms[room.id].status, "concluido", room.id);
    assert.equal(state.profile.lives, 5);
  }
  assert.ok(state.caseClosedAt);
  assert.equal(computeStats(state).progress, 100);
  assert.equal(state.evidences.length, 7);
});

test("each training answer restores a life and awards training XP", () => {
  const { TRAINING_CHALLENGES } = load("lib/data/rooms");
  const { createInitialState, applyResult } = load("lib/game");
  const { checkAnswer } = load("lib/server/validate");
  const { DEMO_ANSWER_KEY } = load("lib/server/answers");
  for (const challenge of TRAINING_CHALLENGES) {
    const before = createInitialState({ id: "test-student", name: "Aluno", email: "test@example.org" });
    before.profile.lives = 0;
    const answer = String(calculatedAnswers()[challenge.id]);
    const { state } = applyResult(before, challenge.id, answer, checkAnswer(DEMO_ANSWER_KEY[challenge.id], answer));
    assert.equal(state.profile.lives, 1, challenge.id);
    assert.equal(state.profile.xp, 5, challenge.id);
    assert.equal(state.attempts[0].correct, true, challenge.id);
  }
});
