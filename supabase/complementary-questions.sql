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
