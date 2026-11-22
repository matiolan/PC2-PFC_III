-- PFC-14: endurecimiento según el asesor de seguridad de Supabase.
-- 1) El trigger de alta de usuarios no debe ser invocable por la Data API:
--    se mueve al esquema privado.
-- 2) Las funciones internas de Supabase no deben ejecutarse desde anon/authenticated.
-- public_stats (solo agregados) y gestor_stats (valida el rol internamente)
-- se mantienen expuestas de forma intencional.

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  requested text := new.raw_user_meta_data ->> 'role';
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    left(new.raw_user_meta_data ->> 'full_name', 120),
    case when requested in ('comprador', 'emprendedor', 'trabajador') then requested else 'comprador' end
  );
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

drop function if exists public.handle_new_user();

do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;
