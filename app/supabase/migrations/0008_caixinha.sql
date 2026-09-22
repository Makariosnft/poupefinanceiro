-- One savings jar ("caixinha") per account, with a free-form ledger of
-- deposits/withdrawals (any amount, any time). Balance is derived from
-- the movements, not stored.

create table caixinha (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references accounts(id) on delete cascade,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table caixinha_movements (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  caixinha_id uuid not null references caixinha(id) on delete cascade,
  amount numeric not null,
  description text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table caixinha enable row level security;
alter table caixinha_movements enable row level security;

create policy "members can read caixinha" on caixinha for select using (is_account_member(account_id));
create policy "members can write caixinha" on caixinha for insert with check (is_account_member(account_id));
create policy "members can update caixinha" on caixinha for update using (is_account_member(account_id)) with check (is_account_member(account_id));
create policy "members can delete caixinha" on caixinha for delete using (is_account_member(account_id));

create policy "members can read caixinha_movements" on caixinha_movements for select using (is_account_member(account_id));
create policy "members can write caixinha_movements" on caixinha_movements for insert with check (is_account_member(account_id));
create policy "members can update caixinha_movements" on caixinha_movements for update using (is_account_member(account_id)) with check (is_account_member(account_id));
create policy "members can delete caixinha_movements" on caixinha_movements for delete using (is_account_member(account_id));

alter table caixinha replica identity full;
alter table caixinha_movements replica identity full;

alter publication supabase_realtime add table caixinha, caixinha_movements;
