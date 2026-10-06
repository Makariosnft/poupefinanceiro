-- Permite marcar um movimento de caixinha como "já existia antes" (ex.: um
-- saldo que a pessoa já tinha guardado antes de começar a usar o app) —
-- esse valor entra na caixinha e no histórico normalmente, mas não
-- desconta/soma no saldo do mês (ver store.tsx: caixinhaNetFor).

alter table caixinha_movements add column if not exists exclude_from_balance boolean not null default false;
