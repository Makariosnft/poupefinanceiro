-- Lets a member see the e-mail, role and join date of everyone else in
-- their own account (for the "Membros" tab in Configurações). auth.users
-- isn't otherwise readable by authenticated clients, so this is scoped to
-- the caller's own account via is_account_member, same as every other
-- cross-table check in this schema.

create or replace function list_account_members()
returns table (user_id uuid, email text, role text, created_at timestamptz)
language sql
security definer
stable
set search_path = public
as $$
  select am.user_id, u.email, am.role, am.created_at
  from account_members am
  join auth.users u on u.id = am.user_id
  where is_account_member(am.account_id)
  order by am.created_at asc;
$$;

grant execute on function list_account_members() to authenticated;
