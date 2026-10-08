const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { PGlite } = require("@electric-sql/pglite");

test("ENEM seed and upgrade run in PostgreSQL and preserve complementary questions and progress", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create table laboratories (id text primary key, name text, subtitle text, description text);
      create table rooms (id text primary key, laboratory_id text, name text, description text, story text, order_index int, difficulty text, sector text, status text);
      create table evidences (id text primary key, room_id text, code text, title text, subtitle text, description text, content text, stamp text, tag text, rare boolean);
      create table challenges (id text primary key, room_id text, title text, story text, question text, content text, type text, difficulty text, xp_reward int, hint text, correct_answer text, tolerance numeric, evidence_id text, next_room_id text, order_index int, active boolean);
      create table achievements (id text primary key, title text, description text, icon text);
      create table library_entries (id text primary key, name text, formula text, explanation text, example text);
      create table settings (key text primary key, value text);
      create table profiles (id text primary key, xp int);
      create table attempts (user_id text, challenge_id text, answer text, correct boolean);
      create table progress (user_id text, room_id text, status text);
    `);
    const root = path.resolve(__dirname, "..");
    await db.exec(fs.readFileSync(path.join(root, "supabase/seed.sql"), "utf8"));
    await db.exec("insert into challenges (id,title,correct_answer,xp_reward) values ('teacher-extra','Questão do professor','64',25); insert into profiles values ('student',100); insert into attempts values ('student','c-01','480',true); insert into progress values ('student','sala-01','concluido'); update challenges set correct_answer='480', question='Antiga' where id='c-01';");
    const upgrade = fs.readFileSync(path.join(root, "supabase/enem-story.sql"), "utf8");
    await db.exec(upgrade);
    await db.exec(upgrade);
    const keys = (await db.query("select id,correct_answer from challenges where id like 'c-%' order by id")).rows;
    assert.deepEqual(keys.map((r) => r.correct_answer), ["50", "101", "576", "1296", "24", "4800"]);
    assert.equal((await db.query("select title from challenges where id='teacher-extra'")).rows[0].title, "Questão do professor");
    assert.equal((await db.query("select xp from profiles")).rows[0].xp, 100);
    assert.equal((await db.query("select answer from attempts")).rows[0].answer, "480");
    assert.equal((await db.query("select status from progress")).rows[0].status, "concluido");
    assert.equal((await db.query("select correct_answer from challenges where id='t-01'")).rows[0].correct_answer, "64");
    assert.equal((await db.query("select tag from evidences where id='ev-001'")).rows[0].tag, "RESERVA");
    assert.equal((await db.query("select difficulty from rooms where id='sala-05'")).rows[0].difficulty, "dificil");
  } finally {
    await db.close();
  }
});
