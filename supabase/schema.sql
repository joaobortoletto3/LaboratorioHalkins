-- =====================================================================
-- LABORATÓRIO HAWKINS — SCHEMA (Supabase / PostgreSQL)
-- Execute no SQL Editor do Supabase ANTES do seed.sql
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
do $$ begin create type public.app_role as enum ('aluno','professor'); exception when duplicate_object then null; end $$;
do $$ begin create type public.difficulty as enum ('facil','intermediario','dificil'); exception when duplicate_object then null; end $$;
do $$ begin create type public.room_status as enum ('bloqueado','disponivel','em_andamento','concluido'); exception when duplicate_object then null; end $$;

-- ---------- TABELAS ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  avatar_url text,
  role public.app_role not null default 'aluno',
  xp integer not null default 0,
  level integer not null default 1,
  lives integer not null default 5,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  case_closed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.laboratories (
  id text primary key,
  name text not null,
  subtitle text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id text primary key,
  laboratory_id text references public.laboratories(id) on delete cascade,
  name text not null,
  description text,
  story text,
  order_index integer not null,
  difficulty public.difficulty not null default 'intermediario',
  sector text not null,
  status text not null default 'ativo' check (status in ('ativo','inativo'))
);

create table if not exists public.evidences (
  id text primary key,
  room_id text references public.rooms(id) on delete set null,
  code text not null,
  title text not null,
  subtitle text,
  description text,
  content text,
  stamp text,
  tag text,
  rare boolean not null default false
);

create table if not exists public.challenges (
  id text primary key,
  room_id text not null references public.rooms(id) on delete cascade,
  title text not null,
  story text,
  question text not null,
  content text,
  type text not null default 'numeric' check (type in ('numeric','code')),
  difficulty public.difficulty not null default 'intermediario',
  xp_reward integer not null default 20,
  hint text,
  correct_answer text not null,          -- NUNCA legível por alunos (ver grants abaixo)
  tolerance numeric not null default 0,  -- NUNCA legível por alunos
  evidence_id text references public.evidences(id) on delete set null,
  next_room_id text references public.rooms(id) on delete set null,
  order_index integer not null default 0,
  active boolean not null default true
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id text not null references public.challenges(id) on delete cascade,
  answer text not null,
  correct boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  room_id text not null references public.rooms(id) on delete cascade,
  challenge_id text references public.challenges(id) on delete set null,
  status public.room_status not null default 'bloqueado',
  started_at timestamptz,
  completed_at timestamptz,
  errors integer not null default 0,
  duration integer,
  unique (user_id, room_id)
);

create table if not exists public.user_evidences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  evidence_id text not null references public.evidences(id) on delete cascade,
  found_at timestamptz not null default now(),
  unique (user_id, evidence_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  color text not null default 'paper' check (color in ('paper','yellow','red','blue')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.xp_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create table if not exists public.streak_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  unique (user_id, activity_date)
);

create table if not exists public.settings (
  key text primary key,
  value text not null
);

create table if not exists public.library_entries (
  id text primary key,
  name text not null,
  formula text not null,
  explanation text not null,
  example text not null
);

-- ---------- FUNÇÃO DE PAPEL (security definer evita recursão em RLS) ----------
create or replace function public.is_professor(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = _uid and role = 'professor')
$$;

-- ---------- PERFIL AUTOMÁTICO NO CADASTRO (sempre ALUNO) ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email, 'aluno')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- RANKING SEMANAL ----------
create or replace function public.weekly_ranking()
returns table (id uuid, name text, level integer, xp integer, weekly_xp integer, current_streak integer)
language sql stable security definer set search_path = public as $$
  select p.id, coalesce(p.name,'Agente'), p.level, p.xp,
         coalesce((select sum(x.amount)::int from public.xp_logs x where x.user_id = p.id and x.created_at >= now() - interval '7 days'), 0),
         p.current_streak
  from public.profiles p
  where p.role = 'aluno'
  order by 5 desc, p.xp desc
  limit 100
$$;

-- ---------- GRANTS ----------
grant usage on schema public to anon, authenticated;

grant select on public.profiles to authenticated;
grant update (name, avatar_url) on public.profiles to authenticated;   -- aluno NÃO altera xp/role/vidas
grant select on public.laboratories, public.rooms, public.evidences, public.achievements, public.library_entries to authenticated;
-- Somente colunas seguras de challenges (sem correct_answer / tolerance):
grant select (id, room_id, title, story, question, content, type, difficulty, xp_reward, hint, evidence_id, next_room_id, order_index, active) on public.challenges to authenticated;
grant select on public.attempts, public.progress, public.user_evidences, public.xp_logs, public.user_achievements, public.streak_logs to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select on public.settings to authenticated;
grant execute on function public.weekly_ranking() to authenticated;
grant execute on function public.is_professor(uuid) to authenticated;
grant all on all tables in schema public to service_role;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.laboratories enable row level security;
alter table public.rooms enable row level security;
alter table public.evidences enable row level security;
alter table public.challenges enable row level security;
alter table public.attempts enable row level security;
alter table public.progress enable row level security;
alter table public.user_evidences enable row level security;
alter table public.notes enable row level security;
alter table public.xp_logs enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.streak_logs enable row level security;
alter table public.settings enable row level security;
alter table public.library_entries enable row level security;

-- perfis
drop policy if exists "perfil próprio ou professor" on public.profiles;
create policy "perfil próprio ou professor" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_professor(auth.uid()));
drop policy if exists "editar próprio perfil" on public.profiles;
create policy "editar próprio perfil" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- conteúdo público para usuários autenticados
drop policy if exists "leitura laboratorios" on public.laboratories;
create policy "leitura laboratorios" on public.laboratories for select to authenticated using (true);
drop policy if exists "leitura salas" on public.rooms;
create policy "leitura salas" on public.rooms for select to authenticated using (true);
drop policy if exists "leitura evidencias" on public.evidences;
create policy "leitura evidencias" on public.evidences for select to authenticated using (true);
drop policy if exists "leitura desafios ativos" on public.challenges;
create policy "leitura desafios ativos" on public.challenges for select to authenticated using (active or public.is_professor(auth.uid()));
drop policy if exists "leitura conquistas" on public.achievements;
create policy "leitura conquistas" on public.achievements for select to authenticated using (true);
drop policy if exists "leitura biblioteca" on public.library_entries;
create policy "leitura biblioteca" on public.library_entries for select to authenticated using (true);
drop policy if exists "leitura settings" on public.settings;
create policy "leitura settings" on public.settings for select to authenticated using (true);

-- dados do aluno: somente o próprio (professor lê todos). Escrita apenas pelo servidor (service_role).
do $$
declare t text;
begin
  foreach t in array array['attempts','progress','user_evidences','xp_logs','user_achievements','streak_logs'] loop
    execute format('drop policy if exists "proprio ou professor" on public.%I', t);
    execute format('create policy "proprio ou professor" on public.%I for select to authenticated using (user_id = auth.uid() or public.is_professor(auth.uid()))', t);
  end loop;
end $$;

-- anotações: CRUD apenas do dono
drop policy if exists "notas do dono" on public.notes;
create policy "notas do dono" on public.notes for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Execute no SQL Editor para atualizar um banco que já usa schema.sql.
-- Recompensas atômicas: envios simultâneos não duplicam XP nem corações.
create index if not exists attempts_complementary_correct_idx
  on public.attempts (user_id, challenge_id) where correct;

create or replace function public.record_complementary_answer(
  p_user_id uuid, p_challenge_id text, p_answer text, p_correct boolean
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  student public.profiles%rowtype;
  challenge public.challenges%rowtype;
  activity_day date := (now() at time zone 'America/Sao_Paulo')::date;
  reward integer;
  new_level integer;
  new_streak integer;
  events jsonb := '[]'::jsonb;
begin
  select * into student from public.profiles where id = p_user_id for update;
  if not found or student.role <> 'aluno' then
    raise exception 'Perfil de aluno não encontrado';
  end if;
  select * into challenge from public.challenges where id = p_challenge_id and active for share;
  if not found then raise exception 'Desafio indisponível'; end if;
  if exists (select 1 from public.attempts where user_id = p_user_id and challenge_id = p_challenge_id and correct) then
    return jsonb_build_object('alreadyCompleted', true, 'events', events);
  end if;

  insert into public.attempts (user_id, challenge_id, answer, correct)
  values (p_user_id, p_challenge_id, p_answer, p_correct);
  if not p_correct then
    return jsonb_build_object('alreadyCompleted', false, 'events', events);
  end if;

  reward := greatest(0, least(500, challenge.xp_reward));
  new_level := 1;
  while new_level < 25 and student.xp + reward >= 50 * new_level * (new_level + 1) loop
    new_level := new_level + 1;
  end loop;
  new_streak := case
    when student.last_activity_date = activity_day then student.current_streak
    when student.last_activity_date = activity_day - 1 then student.current_streak + 1
    else 1 end;
  update public.profiles set
    xp = student.xp + reward, level = new_level, lives = least(5, student.lives + 1),
    current_streak = new_streak, longest_streak = greatest(student.longest_streak, new_streak),
    last_activity_date = activity_day
  where id = p_user_id;
  insert into public.xp_logs (user_id, amount, reason)
  values (p_user_id, reward, 'Questão complementar: ' || challenge.title);
  insert into public.streak_logs (user_id, activity_date)
  values (p_user_id, activity_day) on conflict (user_id, activity_date) do nothing;

  events := events || jsonb_build_array(jsonb_build_object('type', 'xp', 'amount', reward, 'label', 'Questão complementar: ' || challenge.title));
  if student.lives < 5 then
    events := events || jsonb_build_array(jsonb_build_object('type', 'life', 'label', 'Coração recuperado por questão complementar'));
  end if;
  if new_level > student.level then
    events := events || jsonb_build_array(jsonb_build_object('type', 'levelup', 'level', new_level));
  end if;
  if greatest(student.longest_streak, new_streak) >= 7 then
    insert into public.user_achievements (user_id, achievement_id)
    values (p_user_id, 'em-chamas') on conflict (user_id, achievement_id) do nothing;
    if found then
      events := events || jsonb_build_array(jsonb_build_object('type', 'achievement', 'achievementId', 'em-chamas'));
    end if;
  end if;
  return jsonb_build_object('alreadyCompleted', false, 'events', events);
end;
$$;

-- O servidor valida o gabarito antes de chamar esta função.
-- Alunos e visitantes não podem executar a função nem informar p_correct.
revoke all on function public.record_complementary_answer(uuid, text, text, boolean) from public, anon, authenticated;
grant execute on function public.record_complementary_answer(uuid, text, text, boolean) to service_role;
