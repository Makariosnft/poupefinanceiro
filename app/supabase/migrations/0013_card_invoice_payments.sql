-- Marks a card's whole invoice ("fatura") as paid for a given month, so
-- every comum/parcelamento riding that invoice stops showing as atrasado
-- at once, instead of needing a paid-checkbox per purchase.

create table card_invoice_payments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  payment_type_id uuid not null references payment_types(id) on delete cascade,
  invoice_month text not null, -- YYYY-MM
  created_at timestamptz not null default now(),
  unique (payment_type_id, invoice_month)
);

alter table card_invoice_payments enable row level security;

create policy "members can read card_invoice_payments" on card_invoice_payments for select using (is_account_member(account_id));
create policy "members can write card_invoice_payments" on card_invoice_payments for insert with check (is_account_member(account_id));
create policy "members can delete card_invoice_payments" on card_invoice_payments for delete using (is_account_member(account_id));

alter table card_invoice_payments replica identity full;
alter publication supabase_realtime add table card_invoice_payments;
