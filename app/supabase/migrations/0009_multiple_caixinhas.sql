-- Allow more than one caixinha per account.
alter table caixinha drop constraint if exists caixinha_account_id_key;
