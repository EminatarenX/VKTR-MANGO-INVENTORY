-- =========================================================================
-- Multi-tenancy por company_id
--
-- Este archivo agrupa la migracion completa para introducir el concepto de
-- empresa (companies) en el proyecto. Pegar y ejecutar en el SQL Editor de
-- Supabase, idealmente bloque por bloque para verificar.
--
-- IMPORTANTE: Antes de ejecutar el bloque 1.4 (NOT NULL), reemplaza
-- los valores marcados como :company_id y el UUID del usuario duenio.
-- =========================================================================


-- -------------------------------------------------------------------------
-- 1.1 Crear tablas companies y user_profiles
-- -------------------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists user_profiles_company_idx
  on public.user_profiles(company_id);


-- -------------------------------------------------------------------------
-- 1.2 Agregar company_id (nullable temporal) a tablas existentes
-- -------------------------------------------------------------------------
alter table public.products
  add column if not exists company_id uuid
  references public.companies(id) on delete cascade;

alter table public.inventory_movements
  add column if not exists company_id uuid
  references public.companies(id) on delete cascade;


-- -------------------------------------------------------------------------
-- 1.3 Crear empresa y backfill del usuario actual
--
-- Hacerlo en un bloque DO para evitar tener que copiar/pegar UUIDs
-- manualmente. Idempotente: si ya existe la empresa o el user_profile,
-- no falla, y solo actualiza filas con company_id NULL.
--
-- Si tu UUID de usuario es distinto, cambia v_user_id abajo.
-- -------------------------------------------------------------------------
do $$
declare
  v_company_id uuid;
  v_user_id uuid := '5a29ea6b-a52a-43fb-b7c8-09cfce48ae68';
  v_company_name text := 'Mango Inc';
begin
  -- 1) Buscar o crear la empresa por nombre.
  select id into v_company_id
    from public.companies
   where name = v_company_name
   limit 1;

  if v_company_id is null then
    insert into public.companies (name)
    values (v_company_name)
    returning id into v_company_id;
  end if;

  raise notice 'company_id = %', v_company_id;

  -- 2) Asegurar el user_profile (no falla si ya existe).
  insert into public.user_profiles (user_id, company_id)
  values (v_user_id, v_company_id)
  on conflict (user_id) do nothing;

  -- 3) Backfill de products y inventory_movements solo donde
  --    aun no haya company_id, filtrando por el user dueño.
  update public.products
     set company_id = v_company_id
   where user_id = v_user_id
     and company_id is null;

  update public.inventory_movements
     set company_id = v_company_id
   where user_id = v_user_id
     and company_id is null;
end
$$;


-- -------------------------------------------------------------------------
-- 1.3-bis  Limpiar filas huerfanas (company_id NULL) antes de NOT NULL
--
-- Si despues de 1.3 quedan filas con company_id NULL, decide que hacer:
--
--   Opcion A) Asignar TODAS las filas restantes a Mango Inc (recomendado en
--             ambientes de desarrollo donde todo el contenido es tuyo).
--             Tambien crea user_profiles para esos user_ids para que la
--             RLS deje verlos, asignandolos a la misma company.
--
--   Opcion B) Borrar las filas huerfanas (NO recomendado si hay datos
--             de produccion).
--
-- Descomenta SOLO la opcion que quieras.
-- -------------------------------------------------------------------------

-- ----- Opcion A: asignar todo a Mango Inc -----
-- do $$
-- declare
--   v_company_id uuid;
-- begin
--   select id into v_company_id from public.companies where name = 'Mango Inc' limit 1;
--   if v_company_id is null then
--     raise exception 'No existe la company Mango Inc; corre primero el bloque 1.3.';
--   end if;
--
--   -- Asegura user_profile para cada user_id duenio actual.
--   insert into public.user_profiles (user_id, company_id)
--   select distinct p.user_id, v_company_id
--     from public.products p
--    where p.user_id is not null
--      and p.company_id is null
--   on conflict (user_id) do nothing;
--
--   insert into public.user_profiles (user_id, company_id)
--   select distinct m.user_id, v_company_id
--     from public.inventory_movements m
--    where m.user_id is not null
--      and m.company_id is null
--   on conflict (user_id) do nothing;
--
--   update public.products
--      set company_id = v_company_id
--    where company_id is null;
--
--   update public.inventory_movements
--      set company_id = v_company_id
--    where company_id is null;
-- end
-- $$;

-- ----- Opcion B: borrar huerfanas -----
-- delete from public.inventory_movements where company_id is null;
-- delete from public.products where company_id is null;


-- -------------------------------------------------------------------------
-- 1.4 Marcar company_id como NOT NULL e indices
--
-- Solo correr DESPUES del backfill 1.3 (y 1.3-bis si aplica).
-- -------------------------------------------------------------------------
alter table public.products alter column company_id set not null;
alter table public.inventory_movements alter column company_id set not null;

create index if not exists products_company_idx
  on public.products(company_id);

create index if not exists inv_mov_company_ts_idx
  on public.inventory_movements(company_id, timestamp desc);


-- -------------------------------------------------------------------------
-- 1.5 Reemplazar indices unicos y RLS
-- -------------------------------------------------------------------------

-- Unique de products: pasa de (user_id, name) a (company_id, name)
drop index if exists public.products_user_name_unique;

create unique index if not exists products_company_name_unique
  on public.products(company_id, name);


-- Helper SECURITY DEFINER para evitar recursion en RLS.
create or replace function public.current_company_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select company_id from public.user_profiles where user_id = auth.uid()
$$;

revoke all on function public.current_company_id() from public;
grant execute on function public.current_company_id() to authenticated;


-- POLICIES products
drop policy if exists products_select_own on public.products;
drop policy if exists products_insert_own on public.products;
drop policy if exists products_update_own on public.products;
drop policy if exists products_delete_own on public.products;

create policy products_company_select on public.products for select
  using (company_id = public.current_company_id());

create policy products_company_insert on public.products for insert
  with check (company_id = public.current_company_id());

create policy products_company_update on public.products for update
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

create policy products_company_delete on public.products for delete
  using (company_id = public.current_company_id());


-- POLICIES inventory_movements
drop policy if exists movements_select_own on public.inventory_movements;
drop policy if exists movements_insert_own on public.inventory_movements;
drop policy if exists movements_delete_own on public.inventory_movements;

create policy movements_company_select on public.inventory_movements for select
  using (company_id = public.current_company_id());

create policy movements_company_insert on public.inventory_movements for insert
  with check (company_id = public.current_company_id());

create policy movements_company_delete on public.inventory_movements for delete
  using (company_id = public.current_company_id());


-- RLS para user_profiles y companies
alter table public.user_profiles enable row level security;
alter table public.companies enable row level security;

drop policy if exists user_profiles_self on public.user_profiles;
create policy user_profiles_self on public.user_profiles for select
  using (user_id = auth.uid());

drop policy if exists companies_member_select on public.companies;
create policy companies_member_select on public.companies for select
  using (id = public.current_company_id());
