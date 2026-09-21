export type TxKind = 'comum' | 'fixo' | 'parcelamento' | 'entrada';

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface PaymentType {
  id: string;
  name: string;
  kind: 'base' | 'card';
  color: string;
  closing?: number;
  due?: number;
}

export interface Transaction {
  id: string;
  kind: TxKind;
  desc: string;
  amount: number;
  categoryId: string;
  typeId: string;
  personId: string;
  date: string; // YYYY-MM-DD
  // fixo
  dayOfMonth?: number;
  paidMonths?: string[];
  // parcelamento
  startMonth?: string; // YYYY-MM
  totalInstallments?: number;
  // entrada
  incomeKind?: 'Salário' | 'Extra';
}

export interface Debt {
  id: string;
  name: string;
  total: number;
  paid: number;
  rate: number;
  min: number;
  personId: string;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  target: number;
  current: number;
  color: string;
  personId?: string; // dono da meta — vazio/undefined = compartilhada entre todos
}

export interface UIState {
  month: string; // YYYY-MM
  personId: string; // 'all' | Person id
  activeGoalId: string | null;
  authed: boolean;
  authLoading: boolean;
  accountId: string | null;
  accountChecked: boolean; // true once we've determined accountId (found or not) for the current session
}

export interface Account {
  id: string;
  name: string;
  inviteCode: string;
}

export interface AppState {
  people: Person[];
  categories: Category[];
  paymentTypes: PaymentType[];
  transactions: Transaction[];
  debts: Debt[];
  goals: Goal[];
  account: Account | null;
  ui: UIState;
}

export interface Toast {
  id: string;
  msg: string;
  tone: 'ok' | 'warn' | 'error';
}
