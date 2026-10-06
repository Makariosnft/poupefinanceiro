-- Aportes/retiradas na caixinha passam a poder ser atribuídos a uma pessoa,
-- pra poder descontar do saldo do mês dela (ver store.tsx: totalsFor).
-- Movimentos antigos ficam com person_id nulo — contam só no total da casa,
-- não no saldo individual de ninguém.

alter table caixinha_movements add column if not exists person_id uuid references people(id) on delete set null;
