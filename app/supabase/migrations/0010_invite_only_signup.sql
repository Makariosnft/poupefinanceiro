-- Restringe cadastro (auth.users) a e-mails liberados manualmente.
-- Usuários que já existem não são afetados (o gatilho só roda em INSERT).

create table if not exists public.allowed_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.allowed_emails enable row level security;
-- Sem policies: anon/authenticated (a chave usada pelo site) não leem nem escrevem
-- essa tabela. Só dá para editar via SQL Editor do Supabase (role postgres).

create or replace function public.check_allowed_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.allowed_emails where lower(email) = lower(new.email)) then
    raise exception 'signup_not_allowed';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_allowed_email on auth.users;
create trigger trg_check_allowed_email
  before insert on auth.users
  for each row execute function public.check_allowed_email();

-- Libere quem já está usando o site hoje (senão eles continuam logando normal,
-- já que o gatilho só afeta cadastro novo, mas é bom deixar registrado):
-- insert into public.allowed_emails (email) values ('email-do-davi@exemplo.com'), ('email-da-eduarda@exemplo.com');

-- Para liberar cada familiar que for testar, rode (um e-mail por vez ou em lote):
-- insert into public.allowed_emails (email) values ('email-do-familiar@exemplo.com');
