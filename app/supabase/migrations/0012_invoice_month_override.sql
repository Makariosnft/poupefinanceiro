-- Manual override for which invoice ("fatura") a card purchase counts
-- towards, for the rare months where the real closing date shifts because
-- of a weekend/holiday and the fixed closing-day rule guesses wrong.
alter table transactions add column invoice_month_override text;
