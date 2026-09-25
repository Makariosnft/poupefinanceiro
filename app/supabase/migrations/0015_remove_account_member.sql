-- Lets the account owner revoke another member's access (e.g. after a
-- breakup). Only the owner can call this, only on their own account, and
-- the owner can't remove themselves (an account always needs an owner).
-- Historical transactions/people stay untouched — this only revokes login
-- access, it doesn't delete financial history.

create or replace function remove_account_member(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_caller_role text;
  v_target_account_id uuid;
begin
  select account_id, role into v_account_id, v_caller_role
    from account_members where user_id = auth.uid();

  if v_caller_role is distinct from 'owner' then
    raise exception 'only the account owner can remove members';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'the owner cannot remove themselves';
  end if;

  select account_id into v_target_account_id
    from account_members where user_id = p_user_id;

  if v_target_account_id is distinct from v_account_id then
    raise exception 'that user is not a member of your account';
  end if;

  delete from account_members where account_id = v_account_id and user_id = p_user_id;
end;
$$;

grant execute on function remove_account_member(uuid) to authenticated;
