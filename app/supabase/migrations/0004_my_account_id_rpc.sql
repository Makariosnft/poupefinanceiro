-- Bootstrap lookup ("which account do I belong to?") as a SECURITY
-- DEFINER RPC instead of a direct SELECT on account_members through
-- PostgREST. Sidesteps any doubt about whether the account_members
-- select policy is being applied as expected for this critical path.

create or replace function my_account_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select account_id from account_members where user_id = auth.uid() order by created_at asc limit 1;
$$;

grant execute on function my_account_id() to authenticated;
