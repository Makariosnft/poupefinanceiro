-- Realtime DELETE (and UPDATE) events only include primary-key columns in
-- the "old" row by default. Our select policies need account_id to decide
-- whether a subscriber is allowed to see the change, so with only `id`
-- available Realtime can't authorize the event and silently drops it —
-- deletes never arrived live, only after a manual refetch (F5). REPLICA
-- IDENTITY FULL includes the whole old row, fixing that.

alter table people replica identity full;
alter table categories replica identity full;
alter table payment_types replica identity full;
alter table transactions replica identity full;
alter table debts replica identity full;
alter table goals replica identity full;
