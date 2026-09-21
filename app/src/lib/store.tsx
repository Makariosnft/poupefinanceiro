import React from 'react';
import type { AppState, Category, Debt, Goal, PaymentType, Toast, Transaction } from './types';

const LS_KEY = 'poupe.state.v1';
export const uid = () => Math.random().toString(36).slice(2, 9);

export const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const MONTHS_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const pad = (n: number) => String(n).padStart(2, '0');
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const monthOf = (iso: string) => iso.slice(0, 7);
export const thisMonth = () => todayISO().slice(0, 7);
export const monthDiff = (a: string, b: string) => {
  const [ay, am] = a.split('-').map(Number);
  const [by, bm] = b.split('-').map(Number);
  return (by - ay) * 12 + (bm - am);
};
export const addMonths = (m: string, n: number) => {
  const [y, mo] = m.split('-').map(Number);
  const t = y * 12 + (mo - 1) + n;
  return `${Math.floor(t / 12)}-${pad((t % 12) + 1)}`;
};
export const monthLabel = (m: string) => `${MONTHS_FULL[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;
export const monthShort = (m: string) => `${MONTHS_PT[Number(m.slice(5, 7)) - 1]}/${m.slice(2, 4)}`;
export const fmt = (n: number) =>
  'R$ ' + (n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmt0 = (n: number) => 'R$ ' + Math.round(n || 0).toLocaleString('pt-BR');
export const dayLabel = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS_PT[Number(iso.slice(5, 7)) - 1].toLowerCase()}`;

// ── Seed ───────────────────────────────────────────────────────────
function seed(): AppState {
  const M = thisMonth();
  const prev = addMonths(M, -1);
  const P = { davi: uid(), edu: uid() };
  const C: Record<string, string> = {};
  const catDefs: [string, string][] = [
    ['Contas', '#b04a3a'], ['Mercado', '#7a8a3a'], ['Combustível', '#3a6a8a'], ['Carro', '#2f5a48'],
    ['Beleza', '#c79bb0'], ['Academia', '#7a6ca8'], ['Assinatura', '#d4a24a'], ['Igreja', '#5a8a9a'],
    ['Fins de semana', '#c97a3a'], ['Saúde', '#8a9a5a'], ['Roupa', '#a86a6a'], ['Viagem', '#c44a4a'],
    ['Padaria', '#d4b48a'], ['Eletrônico', '#5a5a8a'], ['Presente', '#a85a8a'], ['Salário', '#2f5a48'],
  ];
  catDefs.forEach(([n]) => { C[n] = uid(); });
  const cats: Category[] = catDefs.map(([name, color]) => ({ id: C[name], name, color }));

  const T: Record<string, string> = {};
  const typeDefs: [string, 'base' | 'card', string][] = [
    ['Dinheiro', 'base', '#7a8a3a'], ['PIX', 'base', '#2f5a48'], ['Boleto', 'base', '#5a8a9a'],
    ['Débito', 'base', '#3a6a8a'], ['Nubank', 'card', '#8a3ffc'], ['C6 Bank', 'card', '#1a1a1a'],
  ];
  typeDefs.forEach(([n]) => { T[n] = uid(); });
  const types: PaymentType[] = [
    { id: T['Dinheiro'], name: 'Dinheiro', kind: 'base', color: '#7a8a3a' },
    { id: T['PIX'], name: 'PIX', kind: 'base', color: '#2f5a48' },
    { id: T['Boleto'], name: 'Boleto', kind: 'base', color: '#5a8a9a' },
    { id: T['Débito'], name: 'Débito', kind: 'base', color: '#3a6a8a' },
    { id: T['Nubank'], name: 'Nubank', kind: 'card', color: '#8a3ffc', closing: 18, due: 25 },
    { id: T['C6 Bank'], name: 'C6 Bank', kind: 'card', color: '#1a1a1a', closing: 15, due: 22 },
  ];

  const d = (n: number) => `${M}-${pad(n)}`;
  const tx: Transaction[] = [];
  const push = (o: Omit<Transaction, 'id'>) => tx.push({ id: uid(), ...o });

  push({ kind: 'entrada', desc: 'Salário Davi', amount: 5200, categoryId: C['Salário'], typeId: T['PIX'], personId: P.davi, date: d(5), incomeKind: 'Salário' });
  push({ kind: 'entrada', desc: 'Salário Eduarda', amount: 3700, categoryId: C['Salário'], typeId: T['PIX'], personId: P.edu, date: d(5), incomeKind: 'Salário' });
  push({ kind: 'entrada', desc: 'Freela fotos', amount: 450, categoryId: C['Salário'], typeId: T['PIX'], personId: P.edu, date: d(12), incomeKind: 'Extra' });

  const fx = (desc: string, amount: number, day: number, cat: string, type: string, person: string, paid: boolean) =>
    push({ kind: 'fixo', desc, amount, dayOfMonth: day, categoryId: cat, typeId: type, personId: person, date: `${M}-${pad(day)}`, paidMonths: paid ? [M] : [] });
  fx('Aluguel', 1800, 5, C['Contas'], T['Boleto'], P.davi, true);
  fx('Água', 78, 5, C['Contas'], T['Boleto'], P.davi, true);
  fx('Energia', 187, 12, C['Contas'], T['Boleto'], P.davi, false);
  fx('Internet', 99, 15, C['Contas'], T['Boleto'], P.davi, false);
  fx('Multisports', 170, 5, C['Academia'], T['PIX'], P.davi, true);
  fx('Dízimo Davi', 250, 5, C['Igreja'], T['PIX'], P.davi, true);
  fx('Dízimo Eduarda', 250, 28, C['Igreja'], T['PIX'], P.edu, false);
  fx('iCloud', 14.9, 25, C['Assinatura'], T['Nubank'], P.davi, false);
  fx('Smiles', 49, 25, C['Assinatura'], T['C6 Bank'], P.davi, false);

  const pc = (desc: string, amount: number, start: string, total: number, cat: string, type: string, person: string) =>
    push({ kind: 'parcelamento', desc, amount, startMonth: start, totalInstallments: total, categoryId: cat, typeId: type, personId: person, date: `${start}-10` });
  pc('iPhone 15', 320, addMonths(M, -5), 12, C['Eletrônico'], T['Nubank'], P.davi);
  pc('Sofá retrátil', 199, addMonths(M, -2), 10, C['Roupa'], T['C6 Bank'], P.edu);
  pc('Viagem RJ', 450, addMonths(M, -1), 4, C['Viagem'], T['Nubank'], P.davi);
  pc('Notebook Dell', 280, addMonths(M, -8), 10, C['Eletrônico'], T['C6 Bank'], P.edu);
  pc('Curso de inglês', 190, M, 6, C['Assinatura'], T['PIX'], P.edu);

  const cm = (desc: string, amount: number, day: number, cat: string, type: string, person: string) =>
    push({ kind: 'comum', desc, amount, categoryId: cat, typeId: type, personId: person, date: d(day) });
  cm('Mercado do mês', 642.3, 3, C['Mercado'], T['Nubank'], P.edu);
  cm('Posto Shell', 220, 4, C['Combustível'], T['C6 Bank'], P.davi);
  cm('Cinema', 64, 6, C['Fins de semana'], T['PIX'], P.davi);
  cm('Farmácia', 38.9, 7, C['Saúde'], T['Débito'], P.edu);
  cm('Padaria da esquina', 28.5, 8, C['Padaria'], T['PIX'], P.edu);
  cm('Uber', 22, 9, C['Carro'], T['PIX'], P.davi);
  cm('Presente aniversário', 120, 10, C['Presente'], T['Nubank'], P.davi);
  cm('Café Cabral', 18, 11, C['Padaria'], T['PIX'], P.davi);
  cm('Roupa nova', 189.9, 12, C['Roupa'], T['Nubank'], P.edu);
  cm('Capinha celular', 45, 13, C['Eletrônico'], T['PIX'], P.davi);

  const pd = (n: number) => `${prev}-${pad(n)}`;
  push({ kind: 'entrada', desc: 'Salário Davi', amount: 5200, categoryId: C['Salário'], typeId: T['PIX'], personId: P.davi, date: pd(5), incomeKind: 'Salário' });
  push({ kind: 'entrada', desc: 'Salário Eduarda', amount: 3700, categoryId: C['Salário'], typeId: T['PIX'], personId: P.edu, date: pd(5), incomeKind: 'Salário' });
  ([
    ['Mercado do mês', 598, 3, 'Mercado', 'Nubank', 'edu'],
    ['Posto Shell', 240, 5, 'Combustível', 'C6 Bank', 'davi'],
    ['Restaurante', 186, 9, 'Fins de semana', 'Nubank', 'davi'],
    ['Farmácia', 74, 14, 'Saúde', 'Débito', 'edu'],
    ['Padaria', 96, 18, 'Padaria', 'PIX', 'edu'],
  ] as [string, number, number, string, string, 'davi' | 'edu'][]).forEach(([desc, amount, day, cat, type, who]) =>
    push({ kind: 'comum', desc, amount, categoryId: C[cat], typeId: T[type], personId: P[who], date: pd(day) }));

  return {
    people: [{ id: P.davi, name: 'Davi', color: '#3a6a8a' }, { id: P.edu, name: 'Eduarda', color: '#c79bb0' }],
    categories: cats,
    paymentTypes: types,
    transactions: tx,
    debts: [
      { id: uid(), name: 'Cartão Nubank', total: 4200, paid: 1260, rate: 13.2, min: 380, personId: P.davi, color: '#b04a3a' },
      { id: uid(), name: 'Financiamento carro', total: 18900, paid: 6800, rate: 2.4, min: 720, personId: P.davi, color: '#c97a3a' },
      { id: uid(), name: 'Cartão C6', total: 1850, paid: 950, rate: 11.8, min: 220, personId: P.edu, color: '#a86a6a' },
      { id: uid(), name: 'Empréstimo família', total: 3000, paid: 1500, rate: 0, min: 150, personId: P.davi, color: '#7a6ca8' },
      { id: uid(), name: 'Crediário sofá', total: 1200, paid: 300, rate: 4.5, min: 100, personId: P.edu, color: '#8a6a4a' },
    ],
    goals: [
      { id: uid(), name: 'Apto na praia', emoji: '🏠', target: 50000, current: 12300, color: '#2f5a48' },
      { id: uid(), name: 'Reserva 6 meses', emoji: '🛟', target: 39312, current: 1950, color: '#3a6a8a' },
      { id: uid(), name: 'Viagem Europa', emoji: '✈️', target: 18000, current: 4200, color: '#d4a24a' },
    ],
    ui: { month: M, personId: 'all', activeGoalId: null, authed: false, onboarded: false },
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seed();
    const s = JSON.parse(raw);
    if (!s || !s.transactions || !s.people) return seed();
    if (!s.ui) s.ui = { month: thisMonth(), personId: 'all', activeGoalId: null, authed: false, onboarded: false };
    if (s.ui.authed === undefined) s.ui.authed = false;
    if (s.ui.onboarded === undefined) s.ui.onboarded = false;
    return s;
  } catch {
    return seed();
  }
}

// ── Contexto ───────────────────────────────────────────────────────
interface StoreCtxValue {
  state: AppState;
  actions: ReturnType<typeof buildActions>;
  toast: (msg: string, tone?: Toast['tone']) => void;
  toasts: Toast[];
}

const StoreCtx = React.createContext<StoreCtxValue | null>(null);

function buildActions(
  up: (fn: (s: AppState) => AppState) => void,
  toast: (msg: string, tone?: Toast['tone']) => void,
) {
  return {
    setMonth: (m: string) => up(s => ({ ...s, ui: { ...s.ui, month: m } })),
    setPerson: (id: string) => up(s => ({ ...s, ui: { ...s.ui, personId: id } })),

    login: () => up(s => ({ ...s, ui: { ...s.ui, authed: true } })),
    logout: () => up(s => ({ ...s, ui: { ...s.ui, authed: false } })),
    completeOnboarding: () => up(s => ({ ...s, ui: { ...s.ui, onboarded: true } })),

    addTx: (t: Omit<Transaction, 'id'>) => {
      up(s => ({ ...s, transactions: [{ id: uid(), ...t }, ...s.transactions] }));
      toast(t.kind === 'entrada' ? 'Entrada registrada' : 'Lançamento salvo');
    },
    delTx: (id: string) => {
      up(s => ({ ...s, transactions: s.transactions.filter(t => t.id !== id) }));
      toast('Lançamento removido', 'warn');
    },
    updateTx: (id: string, patch: Partial<Transaction>) =>
      up(s => ({ ...s, transactions: s.transactions.map(t => (t.id === id ? { ...t, ...patch } : t)) })),

    toggleFixoPaid: (id: string, month: string) =>
      up(s => ({
        ...s,
        transactions: s.transactions.map(t => {
          if (t.id !== id) return t;
          const pm = t.paidMonths || [];
          return { ...t, paidMonths: pm.includes(month) ? pm.filter(m => m !== month) : [...pm, month] };
        }),
      })),

    addCategory: (name: string, color: string) => {
      up(s => ({ ...s, categories: [...s.categories, { id: uid(), name, color }] }));
      toast(`Categoria "${name}" criada`);
    },
    delCategory: (id: string) => up(s => ({ ...s, categories: s.categories.filter(c => c.id !== id) })),
    addPaymentType: (t: Omit<PaymentType, 'id'>) => {
      up(s => ({ ...s, paymentTypes: [...s.paymentTypes, { id: uid(), ...t }] }));
      toast(`${t.name} adicionado`);
    },
    delPaymentType: (id: string) => up(s => ({ ...s, paymentTypes: s.paymentTypes.filter(t => t.id !== id) })),
    addPerson: (name: string, color: string) => {
      up(s => ({ ...s, people: [...s.people, { id: uid(), name, color }] }));
      toast(`${name} adicionado(a)`);
    },
    delPerson: (id: string) => up(s => ({ ...s, people: s.people.filter(p => p.id !== id) })),

    addDebt: (d: Omit<Debt, 'id' | 'color' | 'paid'> & Partial<Pick<Debt, 'color' | 'paid'>>) => {
      up(s => ({ ...s, debts: [...s.debts, { id: uid(), color: '#b04a3a', paid: 0, ...d }] }));
      toast('Dívida adicionada');
    },
    delDebt: (id: string) => {
      up(s => ({ ...s, debts: s.debts.filter(d => d.id !== id) }));
      toast('Dívida removida', 'warn');
    },
    payDebt: (id: string, amount: number) => {
      up(s => ({ ...s, debts: s.debts.map(d => (d.id === id ? { ...d, paid: Math.min(d.total, d.paid + amount) } : d)) }));
      toast(`Pagamento de ${fmt0(amount)} registrado`);
    },

    addGoal: (g: Omit<Goal, 'id' | 'current' | 'color' | 'emoji' | 'personId'> & Partial<Pick<Goal, 'current' | 'color' | 'emoji' | 'personId'>>) => {
      up(s => ({ ...s, goals: [...s.goals, { id: uid(), current: 0, color: '#2f5a48', emoji: '🎯', ...g }] }));
      toast('Meta criada');
    },
    updateGoal: (id: string, patch: Partial<Goal>) => {
      up(s => ({ ...s, goals: s.goals.map(g => (g.id === id ? { ...g, ...patch } : g)) }));
      toast('Meta atualizada');
    },
    delGoal: (id: string) => {
      up(s => ({ ...s, goals: s.goals.filter(g => g.id !== id) }));
      toast('Meta removida', 'warn');
    },
    contributeGoal: (id: string, amount: number) => {
      up(s => ({ ...s, goals: s.goals.map(g => (g.id === id ? { ...g, current: Math.min(g.target, g.current + amount) } : g)) }));
      toast(`Aporte de ${fmt0(amount)} feito`);
    },
    setActiveGoal: (id: string) => up(s => ({ ...s, ui: { ...s.ui, activeGoalId: id } })),

    deleteMonth: (month: string) => {
      up(s => ({ ...s, transactions: s.transactions.filter(t => monthOf(t.date) !== month) }));
      toast('Lançamentos do mês apagados', 'warn');
    },
    deleteYear: (year: string) => {
      up(s => ({ ...s, transactions: s.transactions.filter(t => t.date.slice(0, 4) !== year) }));
      toast('Lançamentos do ano apagados', 'warn');
    },

    reset: () => { up(() => seed()); toast('Dados restaurados'); },
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppState>(load);
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore quota errors */ }
  }, [state]);

  const toast = React.useCallback((msg: string, tone: Toast['tone'] = 'ok') => {
    const id = uid();
    setToasts(t => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  }, []);

  const up = React.useCallback((fn: (s: AppState) => AppState) => setState(s => fn(s)), []);
  const actions = React.useMemo(() => buildActions(up, toast), [up, toast]);
  const value = React.useMemo(() => ({ state, actions, toast, toasts }), [state, actions, toast, toasts]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => {
  const ctx = React.useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};

// ── Seletores ──────────────────────────────────────────────────────
export interface ExpandedMonth {
  comuns: Transaction[];
  entradas: Transaction[];
  fixos: (Transaction & { paid: boolean; dueDate: string })[];
  parcelas: (Transaction & { installment: number })[];
}

export function expandMonth(state: AppState, month: string, personId = 'all'): ExpandedMonth {
  const inPerson = (t: Transaction) => personId === 'all' || t.personId === personId;
  const out: ExpandedMonth = { comuns: [], entradas: [], fixos: [], parcelas: [] };
  state.transactions.forEach(t => {
    if (!inPerson(t)) return;
    if (t.kind === 'comum' && monthOf(t.date) === month) out.comuns.push(t);
    else if (t.kind === 'entrada' && monthOf(t.date) === month) out.entradas.push(t);
    else if (t.kind === 'fixo') {
      if (monthDiff(monthOf(t.date), month) >= 0) {
        out.fixos.push({
          ...t,
          paid: (t.paidMonths || []).includes(month),
          dueDate: `${month}-${pad(Math.min(t.dayOfMonth || 1, 28))}`,
        });
      }
    } else if (t.kind === 'parcelamento') {
      const n = monthDiff(t.startMonth!, month) + 1;
      if (n >= 1 && n <= (t.totalInstallments || 0)) out.parcelas.push({ ...t, installment: n });
    }
  });
  const byDate = (a: Transaction, b: Transaction) => (b.date || '').localeCompare(a.date || '');
  out.comuns.sort(byDate);
  out.entradas.sort(byDate);
  out.fixos.sort((a, b) => (a.dayOfMonth || 0) - (b.dayOfMonth || 0));
  out.parcelas.sort((a, b) => (a.totalInstallments! - a.installment) - (b.totalInstallments! - b.installment));
  return out;
}

export function totalsFor(state: AppState, month: string, personId = 'all') {
  const m = expandMonth(state, month, personId);
  const sum = (arr: { amount: number }[]) => arr.reduce((s, t) => s + Number(t.amount || 0), 0);
  const income = sum(m.entradas);
  const comum = sum(m.comuns), fixo = sum(m.fixos), parcela = sum(m.parcelas);
  const expenses = comum + fixo + parcela;
  return {
    income, comum, fixo, parcela, expenses, balance: income - expenses,
    counts: { comum: m.comuns.length, fixo: m.fixos.length, parcela: m.parcelas.length, entrada: m.entradas.length },
    items: m,
  };
}

export function byCategory(state: AppState, month: string, personId = 'all') {
  const { items } = totalsFor(state, month, personId);
  const map: Record<string, number> = {};
  [...items.comuns, ...items.fixos, ...items.parcelas].forEach(t => {
    map[t.categoryId] = (map[t.categoryId] || 0) + Number(t.amount || 0);
  });
  return Object.entries(map)
    .map(([id, value]) => ({ cat: state.categories.find(c => c.id === id) || { id, name: '—', color: '#8a857a' }, value }))
    .sort((a, b) => b.value - a.value);
}

export function byPerson(state: AppState, month: string) {
  return state.people.map(p => ({ person: p, value: totalsFor(state, month, p.id).expenses }));
}

export function byType(state: AppState, month: string, personId = 'all') {
  const { items } = totalsFor(state, month, personId);
  const map: Record<string, number> = {};
  [...items.comuns, ...items.fixos, ...items.parcelas].forEach(t => { map[t.typeId] = (map[t.typeId] || 0) + Number(t.amount || 0); });
  return Object.entries(map)
    .map(([id, value]) => ({ type: state.paymentTypes.find(t => t.id === id) || { id, name: '—', color: '#8a857a', kind: 'base' as const }, value }))
    .sort((a, b) => b.value - a.value);
}

export function upcoming(state: AppState, month: string, personId = 'all') {
  const { items } = totalsFor(state, month, personId);
  const today = todayISO();
  const rows: { id: string; kind: 'fixo' | 'parcela'; desc: string; amount: number; date: string; typeId: string; personId: string }[] = [];
  items.fixos.filter(f => !f.paid).forEach(f => rows.push({ id: f.id, kind: 'fixo', desc: f.desc, amount: f.amount, date: f.dueDate, typeId: f.typeId, personId: f.personId }));
  items.parcelas.forEach(p => rows.push({ id: p.id, kind: 'parcela', desc: `${p.desc} (${p.installment}/${p.totalInstallments})`, amount: p.amount, date: `${month}-${pad(10)}`, typeId: p.typeId, personId: p.personId }));
  return rows
    .map(r => {
      const diff = Math.round((new Date(r.date + 'T00:00:00').getTime() - new Date(today + 'T00:00:00').getTime()) / 86400000);
      const when = diff < 0 ? `atrasado ${Math.abs(diff)}d` : diff === 0 ? 'hoje' : diff === 1 ? 'amanhã' : `em ${diff} dias`;
      const urg = diff < 0 ? 'atrasado' : diff <= 0 ? 'urgente' : diff <= 5 ? 'breve' : 'ok';
      return { ...r, diff, when, urg };
    })
    .sort((a, b) => a.diff - b.diff);
}

export function healthScore(state: AppState, month: string) {
  const t = totalsFor(state, month);
  const prev = totalsFor(state, addMonths(month, -1));
  const income = t.income || 1;
  const clamp = (v: number, a = 0, b = 10) => Math.max(a, Math.min(b, v));

  const savingsRate = t.balance / income;
  const reserve = (state.goals.find(g => /reserva/i.test(g.name)) || { current: 0 }).current;
  const monthlyNeed = t.expenses || 1;
  const reserveMonths = reserve / monthlyNeed;
  const debtMin = state.debts.reduce((s, d) => s + d.min, 0);
  const committed = (t.fixo + t.parcela + debtMin) / income;

  const dims = [
    { k: 'Reserva de emergência', v: clamp((reserveMonths / 6) * 10), note: `${reserveMonths.toFixed(1)} mês de cobertura` },
    { k: 'Controle de gastos', v: clamp(10 - Math.max(0, t.expenses / income - 0.7) * 25), note: `${Math.round((t.expenses / income) * 100)}% da renda` },
    { k: 'Endividamento', v: clamp(10 - (debtMin / income) * 30), note: `${Math.round((debtMin / income) * 100)}% comprometido` },
    { k: 'Hábito de poupar', v: clamp(savingsRate * 40), note: `${Math.round(savingsRate * 100)}% guardado` },
    { k: 'Comprometimento fixo', v: clamp(10 - Math.max(0, committed - 0.5) * 20), note: `${Math.round(committed * 100)}% já comprometido` },
    { k: 'Evolução mensal', v: clamp(5 + (t.balance - prev.balance) / (income * 0.1)), note: t.balance >= prev.balance ? 'melhor que o mês passado' : 'pior que o mês passado' },
  ].map(d => ({ ...d, v: Number(d.v.toFixed(1)), color: d.v < 4 ? '#b04a3a' : d.v < 7 ? '#c97a3a' : '#2f5a48' }));

  const score = Number((dims.reduce((s, d) => s + d.v, 0) / dims.length).toFixed(1));
  return { score, dims, reserveMonths, savingsRate, committed, totals: t, prevTotals: prev };
}

export function scoreHistory(state: AppState, month: string, n = 6) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const m = addMonths(month, -i);
    out.push({ month: m, label: MONTHS_PT[Number(m.slice(5, 7)) - 1], value: healthScore(state, m).score });
  }
  return out;
}
