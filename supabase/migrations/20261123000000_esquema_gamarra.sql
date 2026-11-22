-- PFC-18 / PFC-13 / PFC-15 / PFC-19 / PFC-26 / PFC-31 / PFC-35
-- Esquema de Gamarra Conecta: roles, galerías, negocios, ruta de formalización,
-- vitrina mayorista, bolsa de empleo, auditoría e indicadores.
-- Principios: RLS en todas las tablas, permisos explícitos por columna,
-- funciones auxiliares en un esquema privado (no expuesto por la Data API).

-- ---------------------------------------------------------------------------
-- 0. Esquema privado y utilidades
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Configuración (RMV configurable)
-- ---------------------------------------------------------------------------
create table public.app_settings (
  key text primary key,
  value numeric not null,
  description text,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
create policy "Configuración: lectura pública" on public.app_settings
  for select to anon, authenticated using (true);
revoke all on public.app_settings from anon, authenticated;
grant select on public.app_settings to anon, authenticated;

-- RMV vigente desde el 1 de octubre de 2026 (DS N.° 015-2026-TR).
insert into public.app_settings (key, value, description)
values ('rmv', 1230, 'Remuneración Mínima Vital en soles (DS 015-2026-TR)');

-- ---------------------------------------------------------------------------
-- 2. Galerías
-- ---------------------------------------------------------------------------
create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  address text not null check (char_length(address) <= 160),
  floors int not null default 1 check (floors between 1 and 20),
  description text check (char_length(description) <= 400),
  created_at timestamptz not null default now()
);
alter table public.galleries enable row level security;
create policy "Galerías: lectura pública" on public.galleries
  for select to anon, authenticated using (true);
revoke all on public.galleries from anon, authenticated;
grant select on public.galleries to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Perfiles y roles
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles alter column role set default 'comprador';
update public.profiles set role = 'comprador' where role not in ('comprador','emprendedor','trabajador','gestor');
alter table public.profiles
  add constraint profiles_role_check check (role in ('comprador', 'emprendedor', 'trabajador', 'gestor')),
  add column if not exists phone text check (phone is null or phone ~ '^9[0-9]{8}$'),
  add column if not exists gallery_id uuid references public.galleries (id) on delete set null;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

-- Funciones de autorización (security definer evita recursión de RLS).
create or replace function private.user_role()
returns text language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create or replace function private.is_gestor()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select role = 'gestor' from public.profiles where id = (select auth.uid())), false);
$$;

-- Galería que supervisa el gestor (null = gestor general de la asociación).
create or replace function private.gestor_gallery()
returns uuid language sql stable security definer set search_path = '' as $$
  select gallery_id from public.profiles where id = (select auth.uid()) and role = 'gestor';
$$;

grant usage on schema private to authenticated;
grant execute on function private.user_role(), private.is_gestor(), private.gestor_gallery() to authenticated;

-- El rol se elige al registrarse, pero nunca puede ser «gestor» (lo asigna la asociación).
create or replace function public.handle_new_user()
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

-- El gestor puede ver los perfiles (para mostrar quién subió cada evidencia).
create policy "Perfiles: lectura por gestor" on public.profiles
  for select to authenticated using ((select private.is_gestor()));

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Negocios
-- ---------------------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 3 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category text not null check (category in ('Damas', 'Caballeros', 'Niños', 'Deportivo', 'Telas e insumos', 'Accesorios', 'Uniformes', 'Ropa de hogar')),
  description text check (char_length(description) <= 500),
  location_type text not null check (location_type in ('galeria', 'via_publica')),
  gallery_id uuid references public.galleries (id) on delete set null,
  floor text check (char_length(floor) <= 10),
  stand text check (char_length(stand) <= 20),
  zone text check (char_length(zone) <= 80),
  whatsapp text not null check (whatsapp ~ '^9[0-9]{8}$'),
  level smallint not null default 0 check (level between 0 and 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ubicacion_valida check (
    (location_type = 'galeria' and gallery_id is not null and stand is not null)
    or (location_type = 'via_publica' and zone is not null)
  )
);
create index businesses_gallery_idx on public.businesses (gallery_id);
create index businesses_level_idx on public.businesses (level desc);
create trigger businesses_updated_at before update on public.businesses
  for each row execute function private.set_updated_at();

alter table public.businesses enable row level security;
create policy "Negocios: lectura pública" on public.businesses
  for select to anon, authenticated using (true);
create policy "Negocios: el emprendedor registra el suyo" on public.businesses
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and (select private.user_role()) = 'emprendedor');
create policy "Negocios: el dueño edita" on public.businesses
  for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

revoke all on public.businesses from anon, authenticated;
grant select on public.businesses to anon, authenticated;
-- El nivel nunca se escribe desde el cliente: lo calcula un trigger.
grant insert (owner_id, name, slug, category, description, location_type, gallery_id, floor, stand, zone, whatsapp)
  on public.businesses to authenticated;
grant update (name, category, description, location_type, gallery_id, floor, stand, zone, whatsapp)
  on public.businesses to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Evidencias de formalización
-- ---------------------------------------------------------------------------
create table public.formalization_evidence (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  level smallint not null check (level between 1 and 4),
  doc_type text not null check (doc_type in ('dni', 'ruc', 'licencia', 'planilla')),
  doc_number text not null check (char_length(doc_number) between 6 and 30),
  file_path text not null check (char_length(file_path) <= 300),
  status text not null default 'pendiente' check (status in ('pendiente', 'aprobada', 'observada')),
  review_note text check (char_length(review_note) <= 300),
  reviewer_id uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint tipo_por_nivel check (
    (level = 1 and doc_type = 'dni') or (level = 2 and doc_type = 'ruc')
    or (level = 3 and doc_type = 'licencia') or (level = 4 and doc_type = 'planilla')
  ),
  constraint formato_documento check (
    (doc_type = 'dni' and doc_number ~ '^[0-9]{8}$')
    or (doc_type = 'ruc' and doc_number ~ '^(10|20)[0-9]{9}$')
    or doc_type in ('licencia', 'planilla')
  )
);
create index evidence_business_idx on public.formalization_evidence (business_id);
create index evidence_status_idx on public.formalization_evidence (status);
create unique index evidence_un_pendiente_por_nivel
  on public.formalization_evidence (business_id, level) where status = 'pendiente';

alter table public.formalization_evidence enable row level security;

create or replace function private.owns_business(b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.businesses where id = b and owner_id = (select auth.uid()));
$$;

create or replace function private.gestor_can_review(b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p, public.businesses bz
    where p.id = (select auth.uid()) and p.role = 'gestor' and bz.id = b
      and (p.gallery_id is null or p.gallery_id = bz.gallery_id)
  );
$$;
grant execute on function private.owns_business(uuid), private.gestor_can_review(uuid) to authenticated;

create policy "Evidencias: el dueño ve las suyas" on public.formalization_evidence
  for select to authenticated using ((select private.owns_business(business_id)));
create policy "Evidencias: el gestor ve las de su ámbito" on public.formalization_evidence
  for select to authenticated using ((select private.gestor_can_review(business_id)));
create policy "Evidencias: el dueño sube la del siguiente nivel" on public.formalization_evidence
  for insert to authenticated
  with check (
    (select private.owns_business(business_id))
    and status = 'pendiente'
    and level = (select b.level + 1 from public.businesses b where b.id = business_id)
  );
create policy "Evidencias: el gestor revisa" on public.formalization_evidence
  for update to authenticated
  using ((select private.gestor_can_review(business_id)))
  with check ((select private.gestor_can_review(business_id)));

revoke all on public.formalization_evidence from anon, authenticated;
grant select on public.formalization_evidence to authenticated;
grant insert (business_id, level, doc_type, doc_number, file_path) on public.formalization_evidence to authenticated;
grant update (status, review_note) on public.formalization_evidence to authenticated;

-- Al revisar: registra revisor y fecha, exige nota si se observa y recalcula el nivel.
create or replace function private.on_evidence_review()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    if old.status <> 'pendiente' then
      raise exception 'La evidencia ya fue revisada';
    end if;
    if new.status = 'observada' and coalesce(trim(new.review_note), '') = '' then
      raise exception 'Indica el motivo de la observación';
    end if;
    new.reviewer_id := (select auth.uid());
    new.reviewed_at := now();
  end if;
  return new;
end;
$$;
create trigger evidence_before_review before update on public.formalization_evidence
  for each row execute function private.on_evidence_review();

create or replace function private.recalc_level()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  lvl smallint := 0;
begin
  -- Nivel = mayor nivel aprobado de forma consecutiva desde el 1.
  while exists (
    select 1 from public.formalization_evidence
    where business_id = new.business_id and level = lvl + 1 and status = 'aprobada'
  ) and lvl < 4 loop
    lvl := lvl + 1;
  end loop;
  update public.businesses set level = lvl where id = new.business_id and level <> lvl;
  return null;
end;
$$;
create trigger evidence_after_review after update of status on public.formalization_evidence
  for each row execute function private.recalc_level();

-- ---------------------------------------------------------------------------
-- 6. Productos (vitrina mayorista)
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (char_length(name) between 3 and 80),
  category text not null check (category in ('Damas', 'Caballeros', 'Niños', 'Deportivo', 'Telas e insumos', 'Accesorios', 'Uniformes', 'Ropa de hogar')),
  description text check (char_length(description) <= 400),
  price_unit numeric(10, 2) not null check (price_unit > 0 and price_unit < 100000),
  price_dozen numeric(10, 2) not null check (price_dozen > 0 and price_dozen < 1000000),
  min_order int not null default 12 check (min_order between 1 and 10000),
  image_url text check (image_url is null or image_url ~ '^(https://|/)'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_business_idx on public.products (business_id);
create index products_category_idx on public.products (category);
create index products_search_idx on public.products using gin (to_tsvector('spanish', name || ' ' || coalesce(description, '')));
create trigger products_updated_at before update on public.products
  for each row execute function private.set_updated_at();

alter table public.products enable row level security;
create policy "Productos: lectura pública de activos" on public.products
  for select to anon, authenticated using (active or (select private.owns_business(business_id)));
create policy "Productos: el dueño crea" on public.products
  for insert to authenticated with check ((select private.owns_business(business_id)));
create policy "Productos: el dueño edita" on public.products
  for update to authenticated
  using ((select private.owns_business(business_id))) with check ((select private.owns_business(business_id)));
create policy "Productos: el dueño elimina" on public.products
  for delete to authenticated using ((select private.owns_business(business_id)));

revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert (business_id, name, category, description, price_unit, price_dozen, min_order, image_url, active)
  on public.products to authenticated;
grant update (name, category, description, price_unit, price_dozen, min_order, image_url, active)
  on public.products to authenticated;
grant delete on public.products to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Bolsa de empleo
-- ---------------------------------------------------------------------------
create table public.job_offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  title text not null check (char_length(title) between 5 and 80),
  description text not null check (char_length(description) between 20 and 1000),
  salary numeric(10, 2) not null,
  schedule text not null check (char_length(schedule) between 3 and 80),
  contract_type text not null check (contract_type in ('Plazo indeterminado', 'Plazo fijo', 'Tiempo parcial', 'Prácticas')),
  vacancies int not null default 1 check (vacancies between 1 and 50),
  status text not null default 'abierta' check (status in ('abierta', 'cerrada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index offers_business_idx on public.job_offers (business_id);
create index offers_status_idx on public.job_offers (status);
create trigger offers_updated_at before update on public.job_offers
  for each row execute function private.set_updated_at();

-- Regla de negocio: el sueldo no puede ser menor a la RMV vigente (a tiempo parcial, a la mitad de la RMV).
create or replace function private.check_salary()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rmv numeric := (select value from public.app_settings where key = 'rmv');
begin
  if new.contract_type = 'Tiempo parcial' and new.salary < round(rmv / 2, 2) then
    raise exception 'El sueldo a tiempo parcial no puede ser menor a S/ %', round(rmv / 2, 2);
  elsif new.contract_type <> 'Tiempo parcial' and new.salary < rmv then
    raise exception 'El sueldo no puede ser menor a la RMV (S/ %)', rmv;
  end if;
  return new;
end;
$$;
create trigger offers_check_salary before insert or update of salary, contract_type on public.job_offers
  for each row execute function private.check_salary();

alter table public.job_offers enable row level security;
create policy "Ofertas: lectura pública de abiertas" on public.job_offers
  for select to anon, authenticated using (status = 'abierta' or (select private.owns_business(business_id)));
create policy "Ofertas: el dueño publica" on public.job_offers
  for insert to authenticated with check ((select private.owns_business(business_id)));
create policy "Ofertas: el dueño edita" on public.job_offers
  for update to authenticated
  using ((select private.owns_business(business_id))) with check ((select private.owns_business(business_id)));

revoke all on public.job_offers from anon, authenticated;
grant select on public.job_offers to anon, authenticated;
grant insert (business_id, title, description, salary, schedule, contract_type, vacancies)
  on public.job_offers to authenticated;
grant update (title, description, salary, schedule, contract_type, vacancies, status)
  on public.job_offers to authenticated;

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.job_offers (id) on delete cascade,
  worker_id uuid not null references public.profiles (id) on delete cascade,
  message text check (char_length(message) <= 500),
  status text not null default 'enviada' check (status in ('enviada', 'en_revision', 'seleccionada', 'descartada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (offer_id, worker_id)
);
create index applications_worker_idx on public.applications (worker_id);
create trigger applications_updated_at before update on public.applications
  for each row execute function private.set_updated_at();

create or replace function private.owns_offer(o uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.job_offers jo join public.businesses b on b.id = jo.business_id
    where jo.id = o and b.owner_id = (select auth.uid())
  );
$$;
create or replace function private.offer_is_open(o uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.job_offers where id = o and status = 'abierta');
$$;
grant execute on function private.owns_offer(uuid), private.offer_is_open(uuid) to authenticated;

alter table public.applications enable row level security;
create policy "Postulaciones: el trabajador ve las suyas" on public.applications
  for select to authenticated using (worker_id = (select auth.uid()));
create policy "Postulaciones: el empleador ve las de sus ofertas" on public.applications
  for select to authenticated using ((select private.owns_offer(offer_id)));
create policy "Postulaciones: el trabajador postula a ofertas abiertas" on public.applications
  for insert to authenticated
  with check (
    worker_id = (select auth.uid())
    and (select private.user_role()) = 'trabajador'
    and (select private.offer_is_open(offer_id))
  );
create policy "Postulaciones: el empleador cambia el estado" on public.applications
  for update to authenticated
  using ((select private.owns_offer(offer_id))) with check ((select private.owns_offer(offer_id)));

revoke all on public.applications from anon, authenticated;
grant select on public.applications to authenticated;
grant insert (offer_id, worker_id, message) on public.applications to authenticated;
grant update (status) on public.applications to authenticated;

-- El empleador puede ver nombre y teléfono de quienes postularon a sus ofertas.
create or replace function private.is_my_applicant(p uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.applications a
    join public.job_offers jo on jo.id = a.offer_id
    join public.businesses b on b.id = jo.business_id
    where a.worker_id = p and b.owner_id = (select auth.uid())
  );
$$;
grant execute on function private.is_my_applicant(uuid) to authenticated;
create policy "Perfiles: el empleador ve a sus postulantes" on public.profiles
  for select to authenticated using ((select private.is_my_applicant(id)));

-- ---------------------------------------------------------------------------
-- 8. Auditoría
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_created_idx on public.audit_log (created_at desc);
alter table public.audit_log enable row level security;
create policy "Auditoría: lectura por gestor" on public.audit_log
  for select to authenticated using ((select private.is_gestor()));
revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;

create or replace function private.audit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  act text;
  det jsonb := '{}'::jsonb;
  row_id uuid;
begin
  if tg_table_name = 'formalization_evidence' then
    if tg_op = 'INSERT' then
      act := 'evidencia_subida';
      det := jsonb_build_object('nivel', new.level, 'documento', new.doc_type, 'negocio', new.business_id);
    elsif new.status is distinct from old.status then
      act := 'evidencia_' || new.status;
      det := jsonb_build_object('nivel', new.level, 'documento', new.doc_type, 'negocio', new.business_id, 'nota', new.review_note);
    else
      return null;
    end if;
    row_id := new.id;
  elsif tg_table_name = 'businesses' then
    if tg_op = 'INSERT' then
      act := 'negocio_registrado';
    elsif new.level is distinct from old.level then
      act := 'nivel_actualizado';
      det := jsonb_build_object('de', old.level, 'a', new.level);
    else
      return null;
    end if;
    det := det || jsonb_build_object('nombre', new.name);
    row_id := new.id;
  elsif tg_table_name = 'job_offers' then
    act := case when tg_op = 'INSERT' then 'oferta_publicada' else 'oferta_' || new.status end;
    if tg_op = 'UPDATE' and new.status is not distinct from old.status then return null; end if;
    det := jsonb_build_object('titulo', new.title, 'sueldo', new.salary);
    row_id := new.id;
  elsif tg_table_name = 'applications' then
    if tg_op = 'INSERT' then
      act := 'postulacion_enviada';
    elsif new.status is distinct from old.status then
      act := 'postulacion_' || new.status;
    else
      return null;
    end if;
    det := jsonb_build_object('oferta', new.offer_id);
    row_id := new.id;
  end if;
  insert into public.audit_log (actor_id, action, entity, entity_id, details)
  values ((select auth.uid()), act, tg_table_name, row_id, det);
  return null;
end;
$$;

create trigger audit_evidence after insert or update on public.formalization_evidence
  for each row execute function private.audit();
create trigger audit_businesses after insert or update on public.businesses
  for each row execute function private.audit();
create trigger audit_offers after insert or update on public.job_offers
  for each row execute function private.audit();
create trigger audit_applications after insert or update on public.applications
  for each row execute function private.audit();

-- ---------------------------------------------------------------------------
-- 9. Indicadores
-- ---------------------------------------------------------------------------
-- Resumen público para la landing (solo agregados, sin datos personales).
create or replace function public.public_stats()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'negocios', (select count(*) from public.businesses),
    'formalizados', (select count(*) from public.businesses where level >= 2),
    'galerias', (select count(*) from public.galleries),
    'productos', (select count(*) from public.products where active),
    'ofertas', (select count(*) from public.job_offers where status = 'abierta'),
    'vacantes', (select coalesce(sum(vacancies), 0) from public.job_offers where status = 'abierta'),
    'sueldo_promedio', (select coalesce(round(avg(salary)), 0) from public.job_offers where status = 'abierta'),
    'rmv', (select value from public.app_settings where key = 'rmv')
  );
$$;
revoke all on function public.public_stats() from public;
grant execute on function public.public_stats() to anon, authenticated;

-- Panel del gestor: distribución por nivel, por galería y tiempos de verificación.
create or replace function public.gestor_stats()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  g uuid := private.gestor_gallery();
  result jsonb;
begin
  if not private.is_gestor() then
    raise exception 'Solo el gestor puede consultar los indicadores';
  end if;
  with scope as (
    select * from public.businesses b where g is null or b.gallery_id = g
  )
  select jsonb_build_object(
    'total', (select count(*) from scope),
    'por_nivel', (select jsonb_object_agg(l::text, coalesce(c, 0)) from generate_series(0, 4) l
                  left join (select level, count(*) c from scope group by level) x on x.level = l),
    'por_ubicacion', (select jsonb_build_object(
        'galeria', count(*) filter (where location_type = 'galeria'),
        'via_publica', count(*) filter (where location_type = 'via_publica')) from scope),
    'por_galeria', (select coalesce(jsonb_agg(row_to_json(t) order by t.negocios desc), '[]'::jsonb) from (
        select coalesce(gl.name, 'Vía pública') as galeria, count(*) as negocios,
               count(*) filter (where s.level >= 2) as formalizados,
               round(avg(s.level)::numeric, 1) as nivel_promedio
        from scope s left join public.galleries gl on gl.id = s.gallery_id
        group by gl.name) t),
    'evidencias_pendientes', (select count(*) from public.formalization_evidence e join scope s on s.id = e.business_id where e.status = 'pendiente'),
    'evidencias_aprobadas', (select count(*) from public.formalization_evidence e join scope s on s.id = e.business_id where e.status = 'aprobada'),
    'evidencias_observadas', (select count(*) from public.formalization_evidence e join scope s on s.id = e.business_id where e.status = 'observada'),
    'horas_promedio_revision', (select coalesce(round(avg(extract(epoch from (e.reviewed_at - e.created_at)) / 3600)::numeric, 1), 0)
        from public.formalization_evidence e join scope s on s.id = e.business_id where e.reviewed_at is not null),
    'ofertas_abiertas', (select count(*) from public.job_offers jo join scope s on s.id = jo.business_id where jo.status = 'abierta'),
    'vacantes', (select coalesce(sum(jo.vacancies), 0) from public.job_offers jo join scope s on s.id = jo.business_id where jo.status = 'abierta'),
    'postulaciones', (select count(*) from public.applications a join public.job_offers jo on jo.id = a.offer_id join scope s on s.id = jo.business_id),
    'seleccionados', (select count(*) from public.applications a join public.job_offers jo on jo.id = a.offer_id join scope s on s.id = jo.business_id where a.status = 'seleccionada'),
    'sueldo_promedio', (select coalesce(round(avg(jo.salary)), 0) from public.job_offers jo join scope s on s.id = jo.business_id where jo.status = 'abierta'),
    'rmv', (select value from public.app_settings where key = 'rmv')
  ) into result;
  return result;
end;
$$;
revoke all on function public.gestor_stats() from public, anon;
grant execute on function public.gestor_stats() to authenticated;

-- ---------------------------------------------------------------------------
-- 10. Almacenamiento
-- ---------------------------------------------------------------------------
-- Evidencias: bucket privado, 5 MB, PDF/JPG/PNG; carpeta = id del usuario.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidencias', 'evidencias', false, 5242880, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "Evidencias: subir en carpeta propia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'evidencias' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Evidencias: leer las propias" on storage.objects
  for select to authenticated
  using (bucket_id = 'evidencias' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Evidencias: el gestor lee" on storage.objects
  for select to authenticated
  using (bucket_id = 'evidencias' and (select private.is_gestor()));

-- Fotos de productos: bucket público de solo lectura, 2 MB, imágenes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Productos: subir en carpeta propia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'productos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Productos: borrar las propias" on storage.objects
  for delete to authenticated
  using (bucket_id = 'productos' and (storage.foldername(name))[1] = (select auth.uid())::text);
