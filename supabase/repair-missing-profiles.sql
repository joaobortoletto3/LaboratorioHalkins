-- Execute no SQL Editor se uma conta existe em Authentication > Users,
-- mas não possui linha em public.profiles. Preserva todos os perfis existentes.
begin;

insert into public.profiles (id, name, email, role, created_at)
select u.id,
       coalesce(nullif(u.raw_user_meta_data->>'name', ''), split_part(u.email, '@', 1), 'Agente'),
       u.email,
       'aluno'::public.app_role,
       u.created_at
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- Garante a criação do perfil para os próximos cadastros.
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

commit;
