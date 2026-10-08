const assert = require("node:assert/strict");
const { test, before, after, beforeEach } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const { PGlite } = require("@electric-sql/pglite");
const ts = require("typescript");

const sql = fs.readFileSync(path.join(__dirname, "../supabase/complementary-questions.sql"), "utf8");
const studentId = "00000000-0000-0000-0000-000000000011";
let db;

before(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create table profiles (
      id uuid primary key, role text default 'aluno', xp integer default 0, level integer default 1,
      lives integer default 5, current_streak integer default 0, longest_streak integer default 0,
      last_activity_date date
    );
    create table challenges (id text primary key, title text, xp_reward integer, active boolean default true);
    create table attempts (user_id uuid references profiles, challenge_id text references challenges, answer text, correct boolean);
    create table xp_logs (user_id uuid references profiles, amount integer, reason text);
    create table streak_logs (user_id uuid references profiles, activity_date date, unique(user_id, activity_date));
    create table achievements (id text primary key);
    create table user_achievements (user_id uuid references profiles, achievement_id text references achievements, unique(user_id, achievement_id));
    grant all on all tables in schema public to service_role;
    insert into achievements values ('em-chamas');
  `);
  await db.exec(sql);
});
after(async () => { if (db) await db.close(); });
beforeEach(async () => {
  await db.exec("reset role; truncate user_achievements, streak_logs, xp_logs, attempts, challenges, profiles;");
  await db.query("insert into profiles (id, lives) values ($1, 0)", [studentId]);
  await db.exec("insert into challenges (id, title, xp_reward) values ('extra-1', 'Volume do cubo', 30), ('extra-2', 'Área', 20)");
});

async function answer(correct = true, id = "extra-1") {
  const result = await db.query("select public.record_complementary_answer($1, $2, $3, $4) as outcome", [studentId, id, "64", correct]);
  return result.rows[0].outcome;
}
async function profile() { return (await db.query("select * from profiles where id = $1", [studentId])).rows[0]; }
async function count(table) { return (await db.query(`select count(*)::int as count from ${table}`)).rows[0].count; }

test("first correct answer grants teacher XP and restores one heart from zero", async () => {
  const outcome = await answer();
  const p = await profile();
  assert.equal(p.xp, 30);
  assert.equal(p.lives, 1);
  assert.equal(p.current_streak, 1);
  assert.equal(await count("attempts"), 1);
  assert.equal(await count("xp_logs"), 1);
  assert.equal(await count("streak_logs"), 1);
  assert.ok(outcome.events.some((e) => e.type === "life"));
  assert.equal(outcome.events.find((e) => e.type === "xp").amount, 30);
});

test("wrong answers preserve hearts and XP and permit a later correct answer", async () => {
  await answer(false);
  assert.equal((await profile()).lives, 0);
  assert.equal((await profile()).xp, 0);
  assert.equal(await count("xp_logs"), 0);
  await answer(true);
  assert.equal((await profile()).lives, 1);
  assert.equal((await profile()).xp, 30);
  assert.equal(await count("attempts"), 2);
});

test("repeated submissions grant a reward only once", async () => {
  const outcomes = await Promise.all([answer(), answer(), answer(false)]);
  assert.equal(outcomes.filter((o) => !o.alreadyCompleted).length, 1);
  assert.equal((await profile()).xp, 30);
  assert.equal((await profile()).lives, 1);
  assert.equal(await count("attempts"), 1);
  assert.equal(await count("xp_logs"), 1);
});

test("different questions grant independent rewards and respect the heart cap", async () => {
  await db.exec("update profiles set lives = 4");
  await answer();
  const second = await answer(true, "extra-2");
  assert.equal((await profile()).lives, 5);
  assert.equal((await profile()).xp, 50);
  assert.ok(!second.events.some((e) => e.type === "life"));
  assert.equal(await count("streak_logs"), 1);
});

test("XP updates the level and a seventh consecutive day unlocks the streak achievement", async () => {
  await db.exec("update profiles set xp = 90, current_streak = 6, longest_streak = 6, last_activity_date = (now() at time zone 'America/Sao_Paulo')::date - 1");
  const outcome = await answer();
  assert.equal((await profile()).level, 2);
  assert.equal((await profile()).current_streak, 7);
  assert.equal(await count("user_achievements"), 1);
  assert.ok(outcome.events.some((e) => e.type === "levelup" && e.level === 2));
  assert.ok(outcome.events.some((e) => e.type === "achievement"));
});

test("inactive questions and professor profiles cannot receive rewards", async () => {
  await db.exec("update challenges set active = false where id = 'extra-1'");
  await assert.rejects(answer(), /Desafio indisponível/);
  await db.exec("update challenges set active = true; update profiles set role = 'professor'");
  await assert.rejects(answer(), /Perfil de aluno não encontrado/);
  assert.equal(await count("attempts"), 0);
});

test("students and anonymous users cannot call the reward function; service role can", async () => {
  await db.exec("set role authenticated");
  await assert.rejects(answer(), /permission denied/);
  await db.exec("set role anon");
  await assert.rejects(answer(), /permission denied/);
  await db.exec("set role service_role");
  await answer();
  await db.exec("reset role");
  assert.equal((await profile()).xp, 30);
});

test("failure rolls back the attempt, profile update and XP log together", async () => {
  await db.exec("delete from achievements; update profiles set current_streak = 6, longest_streak = 6, last_activity_date = (now() at time zone 'America/Sao_Paulo')::date - 1");
  await assert.rejects(answer(), /foreign key constraint/);
  assert.equal((await profile()).xp, 0);
  assert.equal((await profile()).lives, 0);
  assert.equal(await count("attempts"), 0);
  assert.equal(await count("xp_logs"), 0);
  await db.exec("insert into achievements values ('em-chamas')");
});

test("upgrade script can be safely executed again", async () => {
  await db.exec(sql);
  await answer();
  assert.equal((await profile()).xp, 30);
});

function loadTs(relative, overrides = {}, cache = new Map()) {
  const filename = path.resolve(__dirname, "..", relative + ".ts");
  if (cache.has(filename)) return cache.get(filename);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (id) => {
    if (id in overrides) return overrides[id];
    if (id === "server-only") return {};
    if (id.startsWith("@/")) return loadTs(id.slice(2), overrides, cache);
    if (id.startsWith(".")) return loadTs(path.relative(path.resolve(__dirname, ".."), path.resolve(path.dirname(filename), id)), overrides, cache);
    return require(id);
  };
  new Function("require", "module", "exports", output)(localRequire, module, module.exports);
  cache.set(filename, module.exports);
  return module.exports;
}

function apiFixture({ authenticated = true, rpcError } = {}) {
  const selected = [];
  const admin = {
    auth: { getUser: async () => ({ data: { user: authenticated ? { id: studentId } : null } }) },
    from(table) {
      assert.equal(table, "challenges");
      let columns, id, active;
      const query = {
        select(value) { columns = value; selected.push(value); return query; },
        eq(key, value) { if (key === "id") id = value; if (key === "active") active = value; return query; },
        order() { return query; },
        async rows() {
          let rows = (await db.query("select * from challenges")).rows.map((r) => ({ ...r,
            story: "Calcule o volume", question: "Qual o volume de um cubo com aresta 4?", content: "V = a³", hint: "Eleve a aresta ao cubo",
            difficulty: "dificil", type: "numeric", correct_answer: "64", tolerance: 0,
          }));
          if (id !== undefined) rows = rows.filter((r) => r.id === id);
          if (active !== undefined) rows = rows.filter((r) => r.active === active);
          return rows.map((r) => Object.fromEntries(columns.split(",").map((key) => [key, r[key]])));
        },
        async single() { return { data: (await query.rows())[0] ?? null, error: null }; },
        then(resolve, reject) { return query.rows().then((data) => ({ data, error: null })).then(resolve, reject); },
      };
      return query;
    },
    async rpc(name, params) {
      assert.equal(name, "record_complementary_answer");
      if (rpcError) return { data: null, error: rpcError };
      const result = await db.query("select public.record_complementary_answer($1,$2,$3,$4) as outcome", [params.p_user_id, params.p_challenge_id, params.p_answer, params.p_correct]);
      return { data: result.rows[0].outcome, error: null };
    },
  };
  const { createInitialState } = loadTs("lib/game");
  const overrides = {
    "@/lib/supabase/config": { isSupabaseConfigured: true },
    "@/lib/supabase/server": { getAdminSupabase: () => admin, getServerSupabase: () => admin, SupabaseConfigurationError: class extends Error {} },
    "@/lib/server/state": {
      async buildState() {
        const row = await profile();
        const state = createInitialState({ id: studentId, name: "Aluno", email: "aluno@example.org" });
        Object.assign(state.profile, { xp: row.xp, lives: row.lives, level: row.level, role: row.role });
        state.attempts = (await db.query("select * from attempts")).rows.map((a) => ({ challengeId: a.challenge_id, correct: a.correct, answer: a.answer }));
        return state;
      },
      persistDiff() { throw new Error("Complementary rewards must use the atomic transaction"); },
    },
  };
  const validate = loadTs("app/api/validate/route", overrides);
  const listing = loadTs("app/api/student/challenges/route", overrides);
  return { selected, listing, validate, request: (answer) => new Request("http://localhost/api/validate", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ challengeId: "extra-1", answer }),
  }) };
}

test("student API lists only active complementary questions without answer keys", async () => {
  await db.exec("update challenges set active = false where id = 'extra-2'; insert into challenges (id,title,xp_reward) values ('c-01','Original',10)");
  const api = apiFixture();
  const response = await api.listing.GET();
  const json = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(json.challenges.map((c) => c.id), ["extra-1"]);
  assert.equal(json.challenges[0].roomId, "complementares");
  assert.equal(json.challenges[0].xpReward, 30);
  assert.equal(json.challenges[0].type, "numeric");
  assert.ok(!JSON.stringify(json).includes("correct_answer"));
  assert.ok(!api.selected.some((s) => /correct_answer|tolerance/.test(s)));
});

test("validation API awards and returns saved XP, hearts and completion from zero hearts", async () => {
  const api = apiFixture();
  const wrong = await (await api.validate.POST(api.request("63"))).json();
  assert.equal(wrong.correct, false);
  assert.equal(wrong.state.profile.lives, 0);
  const response = await api.validate.POST(api.request("64"));
  const json = await response.json();
  assert.equal(response.status, 200);
  assert.equal(json.correct, true);
  assert.equal(json.state.profile.xp, 30);
  assert.equal(json.state.profile.lives, 1);
  assert.ok(json.state.attempts.some((a) => a.challengeId === "extra-1" && a.correct));
  assert.ok(json.message.includes("1 coração"));
  const repeated = await (await api.validate.POST(api.request("64"))).json();
  assert.equal(repeated.state.profile.xp, 30);
  assert.equal(repeated.events.length, 0);
});

test("student APIs reject expired sessions without granting rewards", async () => {
  const api = apiFixture({ authenticated: false });
  assert.equal((await api.listing.GET()).status, 401);
  assert.equal((await api.validate.POST(api.request("64"))).status, 401);
  assert.equal(await count("attempts"), 0);
});

test("missing database upgrade returns an actionable error without changing rewards", async () => {
  const api = apiFixture({ rpcError: { code: "PGRST202" } });
  const response = await api.validate.POST(api.request("64"));
  assert.equal(response.status, 503);
  assert.ok((await response.json()).error.includes("complementary-questions.sql"));
  assert.equal((await profile()).xp, 0);
});
