-- Per-account currency, so households outside Brazil (or anyone who just
-- prefers another currency) see amounts formatted correctly everywhere.

alter table accounts add column if not exists currency text not null default 'BRL';

-- Any member (not just the owner) can update their own account's shared
-- settings — same philosophy as categories/payment types being editable
-- by anyone in the household.
create policy "members can update their account" on accounts for update
  using (is_account_member(id))
  with check (is_account_member(id));

-- Replaces the single-arg version with an overload that also takes a
-- currency; drop the old one first so PostgREST doesn't have two
-- candidates with the same name to choose between.
drop function if exists create_account(text);

create or replace function create_account(p_name text, p_currency text default 'BRL')
returns table (account_id uuid, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_code text;
begin
  if exists (select 1 from account_members where user_id = auth.uid()) then
    raise exception 'user already belongs to an account';
  end if;
  v_code := substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  insert into accounts (name, invite_code, currency) values (p_name, v_code, coalesce(p_currency, 'BRL')) returning id into v_account_id;
  insert into account_members (account_id, user_id, role) values (v_account_id, auth.uid(), 'owner');
  return query select v_account_id, v_code;
end;
$$;

grant execute on function create_account(text, text) to authenticated;
