-- Poupê schema: accounts (households), membership, and app data.
-- Every data table is scoped by account_id and protected by RLS so a user
-- can only see/write rows belonging to an account they're a member of.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Accounts (a "casal"/household) and membership
-- ---------------------------------------------------------------------

create table accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create table account_members (
  account_id uuid not null references accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (account_id, user_id)
);

alter table accounts enable row level security;
alter table account_members enable row level security;

create policy "members can see their account"
  on accounts for select
  using (id in (select account_id from account_members where user_id = auth.uid()));

create policy "members can see their membership rows"
  on account_members for select
  using (account_id in (select account_id from account_members where user_id = auth.uid()));

-- Accounts and memberships are only ever created via the SECURITY DEFINER
-- RPCs below, so no direct insert/update/delete policies are needed here.

-- ---------------------------------------------------------------------
-- App data tables
-- ---------------------------------------------------------------------

create table people (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  name text not null,
  color text not null
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  name text not null,
  color text not null
);

create table payment_types (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('base', 'card')),
  color text not null,
  closing int,
  due int
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  kind text not null check (kind in ('comum', 'fixo', 'parcelamento', 'entrada')),
  description text not null,
  amount numeric not null,
  category_id uuid references categories(id) on delete set null,
  type_id uuid references payment_types(id) on delete set null,
  person_id uuid references people(id) on delete set null,
  date date not null,
  day_of_month int,
  paid_months text[],
  start_month text,
  total_installments int,
  income_kind text check (income_kind in ('Salário', 'Extra')),
  created_at timestamptz not null default now()
);

create table debts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  name text not null,
  total numeric not null,
  paid numeric not null default 0,
  rate numeric not null default 0,
  min numeric not null default 0,
  person_id uuid references people(id) on delete set null,
  color text not null
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  name text not null,
  emoji text not null default '',
  target numeric not null,
  current numeric not null default 0,
  color text not null,
  person_id uuid references people(id) on delete set null
);

alter table people enable row level security;
alter table categories enable row level security;
alter table payment_types enable row level security;
alter table transactions enable row level security;
alter table debts enable row level security;
alter table goals enable row level security;

-- Same read/write policy shape for every data table: full access iff the
-- caller is a member of the row's account.
do $$
declare
  t text;
begin
  foreach t in array array['people', 'categories', 'payment_types', 'transactions', 'debts', 'goals']
  loop
    execute format(
      'create policy "members can read %1$s" on %1$s for select
         using (account_id in (select account_id from account_members where user_id = auth.uid()));',
      t
    );
    execute format(
      'create policy "members can write %1$s" on %1$s for insert
         with check (account_id in (select account_id from account_members where user_id = auth.uid()));',
      t
    );
    execute format(
      'create policy "members can update %1$s" on %1$s for update
         using (account_id in (select account_id from account_members where user_id = auth.uid()))
         with check (account_id in (select account_id from account_members where user_id = auth.uid()));',
      t
    );
    execute format(
      'create policy "members can delete %1$s" on %1$s for delete
         using (account_id in (select account_id from account_members where user_id = auth.uid()));',
      t
    );
  end loop;
end $$;

-- Realtime: broadcast row changes on the data tables to subscribed clients.
alter publication supabase_realtime add table people, categories, payment_types, transactions, debts, goals;

-- ---------------------------------------------------------------------
-- RPCs: creating and joining an account (bypass RLS deliberately, scoped
-- to the calling user via auth.uid())
-- ---------------------------------------------------------------------

create or replace function create_account(p_name text)
returns table (account_id uuid, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_code text;
begin
  v_code := substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  insert into accounts (name, invite_code) values (p_name, v_code) returning id into v_account_id;
  insert into account_members (account_id, user_id, role) values (v_account_id, auth.uid(), 'owner');
  return query select v_account_id, v_code;
end;
$$;

create or replace function join_account_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
begin
  select id into v_account_id from accounts where invite_code = p_code;
  if v_account_id is null then
    raise exception 'invite code not found';
  end if;
  insert into account_members (account_id, user_id, role)
    values (v_account_id, auth.uid(), 'member')
    on conflict (account_id, user_id) do nothing;
  return v_account_id;
end;
$$;

grant execute on function create_account(text) to authenticated;
grant execute on function join_account_by_code(text) to authenticated;
