-- A user should belong to at most one account (household) for now — the
-- app has no multi-account switcher. create_account previously let a user
-- create a second account if called again (e.g. a stray double-click),
-- which broke the "find my account" lookup on the client (more than one
-- row for that user_id). Guard both RPCs against that.

create or replace function create_account(p_name text)
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
  insert into accounts (name, invite_code) values (p_name, v_code) returning id into v_account_id;
  insert into account_members (account_id, user_id, role) values (v_account_id, auth.uid(), 'owner');
  return query select v_account_id, v_code;
end;
$$;

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
  select id into v_account_id from accounts where invite_code = p_code;
  if v_account_id is null then
    raise exception 'invite code not found';
  end if;
  insert into account_members (account_id, user_id, role) values (v_account_id, auth.uid(), 'member');
  return v_account_id;
end;
$$;
