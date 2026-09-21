import type { Category, Debt, Goal, PaymentType, Person, Transaction } from './types';

// Each data table has a camelCase (app) <-> snake_case (db) field map.
// `id` and `account_id` are handled separately, not part of these maps.

export const PEOPLE_MAP = { name: 'name', color: 'color' } as const;
export const CATEGORIES_MAP = { name: 'name', color: 'color' } as const;
export const PAYMENT_TYPES_MAP = { name: 'name', kind: 'kind', color: 'color', closing: 'closing', due: 'due' } as const;
export const TX_MAP = {
  kind: 'kind', desc: 'desc', amount: 'amount', categoryId: 'category_id', typeId: 'type_id',
  personId: 'person_id', date: 'date', dayOfMonth: 'day_of_month', paidMonths: 'paid_months',
  startMonth: 'start_month', totalInstallments: 'total_installments', incomeKind: 'income_kind',
} as const;
export const DEBTS_MAP = { name: 'name', total: 'total', paid: 'paid', rate: 'rate', min: 'min', personId: 'person_id', color: 'color' } as const;
export const GOALS_MAP = { name: 'name', emoji: 'emoji', target: 'target', current: 'current', color: 'color', personId: 'person_id' } as const;

const NUMERIC_FIELDS: Record<string, string[]> = {
  transactions: ['amount'],
  debts: ['total', 'paid', 'rate', 'min'],
  goals: ['target', 'current'],
};

type FieldMap = Record<string, string>;

export function patchToRow<T extends object>(patch: Partial<T>, map: FieldMap): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const k of Object.keys(patch) as (keyof T)[]) {
    const snake = map[k as string];
    if (!snake) continue;
    const v = (patch as any)[k];
    row[snake] = v === undefined ? null : v;
  }
  return row;
}

export function rowToModel<T extends { id: string }>(row: Record<string, any>, map: FieldMap, table: string): T {
  const out: Record<string, unknown> = { id: row.id };
  const numeric = NUMERIC_FIELDS[table] || [];
  for (const camel of Object.keys(map)) {
    const snake = map[camel];
    let v = row[snake];
    if (v === null) v = undefined;
    if (v !== undefined && numeric.includes(camel)) v = Number(v);
    out[camel] = v;
  }
  return out as T;
}

export const peopleFromRow = (r: Record<string, any>): Person => rowToModel(r, PEOPLE_MAP, 'people');
export const categoriesFromRow = (r: Record<string, any>): Category => rowToModel(r, CATEGORIES_MAP, 'categories');
export const paymentTypesFromRow = (r: Record<string, any>): PaymentType => rowToModel(r, PAYMENT_TYPES_MAP, 'payment_types');
export const txFromRow = (r: Record<string, any>): Transaction => rowToModel(r, TX_MAP, 'transactions');
export const debtsFromRow = (r: Record<string, any>): Debt => rowToModel(r, DEBTS_MAP, 'debts');
export const goalsFromRow = (r: Record<string, any>): Goal => rowToModel(r, GOALS_MAP, 'goals');

export const DATA_TABLES = ['people', 'categories', 'payment_types', 'transactions', 'debts', 'goals'] as const;
