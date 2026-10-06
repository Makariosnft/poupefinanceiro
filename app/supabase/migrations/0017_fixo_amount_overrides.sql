-- Per-month amount override for a "fixo" (recurring) transaction — bills
-- like energy/water that recur every month but with a different amount
-- each time. The base transaction's own `amount` stays as the default;
-- an override here replaces it for that one month only, without
-- touching other months' history.

create table fixo_amount_overrides (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  transaction_id uuid not null references transactions(id) on delete cascade,
  month text not null, -- YYYY-MM
  amount numeric not null,
  created_at timestamptz not null default now(),
  unique (transaction_id, month)
);

alter table fixo_amount_overrides enable row level security;

create policy "members can read fixo_amount_overrides" on fixo_amount_overrides for select using (is_account_member(account_id));
create policy "members can write fixo_amount_overrides" on fixo_amount_overrides for insert with check (is_account_member(account_id));
create policy "members can update fixo_amount_overrides" on fixo_amount_overrides for update using (is_account_member(account_id)) with check (is_account_member(account_id));
create policy "members can delete fixo_amount_overrides" on fixo_amount_overrides for delete using (is_account_member(account_id));

alter table fixo_amount_overrides replica identity full;
alter publication supabase_realtime add table fixo_amount_overrides;
