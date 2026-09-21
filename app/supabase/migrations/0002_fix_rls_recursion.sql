-- Fixes infinite-recursion risk in RLS policies that queried
-- account_members from within a policy defined on account_members itself
-- (and, less critically, tidies the other data-table policies to use the
-- same safe check). SECURITY DEFINER bypasses RLS for the inner lookup,
-- breaking the recursion.

create or replace function is_account_member(p_account_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from account_members
    where account_id = p_account_id and user_id = auth.uid()
  );
$$;

grant execute on function is_account_member(uuid) to authenticated;

drop policy if exists "members can see their account" on accounts;
create policy "members can see their account"
  on accounts for select
  using (is_account_member(id));

drop policy if exists "members can see their membership rows" on account_members;
create policy "members can see their membership rows"
  on account_members for select
  using (is_account_member(account_id));

do $$
declare
  t text;
begin
  foreach t in array array['people', 'categories', 'payment_types', 'transactions', 'debts', 'goals']
  loop
    execute format('drop policy if exists "members can read %1$s" on %1$s;', t);
    execute format(
      'create policy "members can read %1$s" on %1$s for select
         using (is_account_member(account_id));',
      t
    );
    execute format('drop policy if exists "members can write %1$s" on %1$s;', t);
    execute format(
      'create policy "members can write %1$s" on %1$s for insert
         with check (is_account_member(account_id));',
      t
    );
    execute format('drop policy if exists "members can update %1$s" on %1$s;', t);
    execute format(
      'create policy "members can update %1$s" on %1$s for update
         using (is_account_member(account_id))
         with check (is_account_member(account_id));',
      t
    );
    execute format('drop policy if exists "members can delete %1$s" on %1$s;', t);
    execute format(
      'create policy "members can delete %1$s" on %1$s for delete
         using (is_account_member(account_id));',
      t
    );
  end loop;
end $$;
