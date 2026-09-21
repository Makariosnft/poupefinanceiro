-- Invite codes are generated lowercase (from gen_random_uuid()) but the
-- join screen uppercases whatever the user types before submitting, so
-- the exact-match lookup in join_account_by_code never found a real
-- code. Compare case-insensitively instead of relying on casing to line up.

create or replace function join_account_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
begin
  if exists (select 1 from account_members where user_id = auth.uid()) then
    raise exception 'user already belongs to an account';
  end if;
  select id into v_account_id from accounts where upper(invite_code) = upper(p_code);
  if v_account_id is null then
    raise exception 'invite code not found';
  end if;
  insert into account_members (account_id, user_id, role) values (v_account_id, auth.uid(), 'member');
  return v_account_id;
end;
$$;
