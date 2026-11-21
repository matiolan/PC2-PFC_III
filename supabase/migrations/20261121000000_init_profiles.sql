-- PFC-13: tabla base de perfiles con RLS (se ajustará al caso práctico).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Perfil propio: lectura"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Perfil propio: actualización"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- El usuario solo puede editar su nombre: el rol no es modificable desde el cliente.
revoke update on public.profiles from authenticated, anon;
grant update (full_name, updated_at) on public.profiles to authenticated;

-- Crea el perfil al registrarse un usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
