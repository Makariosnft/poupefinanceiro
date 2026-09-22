-- Manual one-time corrections to a person's accumulated balance (e.g.
-- money that was left over in their account but never logged as an
-- "entrada"/"comum" pair). Applied to the running cumulative total from
-- that month onward, same idea as the card invoice-month override.

create table balance_adjustments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  month text not null, -- YYYY-MM
  amount numeric not null,
  note text,
  created_at timestamptz not null default now()
);

alter table balance_adjustments enable row level security;

create policy "members can read balance_adjustments" on balance_adjustments for select using (is_account_member(account_id));
create policy "members can write balance_adjustments" on balance_adjustments for insert with check (is_account_member(account_id));
create policy "members can delete balance_adjustments" on balance_adjustments for delete using (is_account_member(account_id));

alter table balance_adjustments replica identity full;
alter publication supabase_realtime add table balance_adjustments;
