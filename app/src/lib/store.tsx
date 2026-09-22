import React from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Account, AppState, Caixinha, CaixinhaMovement, Category, Debt, Goal, PaymentType, Person, Toast, Transaction } from './types';
import {
  CAIXINHA_MAP, CAIXINHA_MOVEMENTS_MAP, CATEGORIES_MAP, DATA_TABLES, DEBTS_MAP, GOALS_MAP, PAYMENT_TYPES_MAP, PEOPLE_MAP, TX_MAP,
  caixinhaFromRow, caixinhaMovementsFromRow, categoriesFromRow, debtsFromRow, goalsFromRow, patchToRow, paymentTypesFromRow, peopleFromRow, txFromRow,
} from './sync';

const UI_LS_KEY = 'poupe.ui.v1';
export const uid = () => Math.random().toString(36).slice(2, 9);
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : uid() + uid());

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
export const fmt0 = fmt;
export const dayLabel = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS_PT[Number(iso.slice(5, 7)) - 1].toLowerCase()}`;

function loadUiPrefs() {
  try {
    const raw = localStorage.getItem(UI_LS_KEY);
    if (!raw) return { month: thisMonth(), personId: 'all' };
    const s = JSON.parse(raw);
    return { month: s.month || thisMonth(), personId: s.personId || 'all' };
  } catch {
    return { month: thisMonth(), personId: 'all' };
  }
}

// ── Contexto ───────────────────────────────────────────────────────
interface StoreCtxValue {
  state: AppState;
  actions: ReturnType<typeof buildActions>;
  toast: (msg: string, tone?: Toast['tone']) => void;
  toasts: Toast[];
  lastSaved: number;
}

const StoreCtx = React.createContext<StoreCtxValue | null>(null);

const SAVE_ERROR_MSG = 'Não foi possível salvar — verifique sua internet e tente de novo. Se sumir da tela, refaça o lançamento.';

function makeCrud<T extends { id: string }>(
  table: string,
  setList: React.Dispatch<React.SetStateAction<T[]>>,
  map: Record<string, string>,
  accountIdRef: React.MutableRefObject<string | null>,
  toast: (msg: string, tone?: Toast['tone']) => void,
  markSaved: () => void,
) {
  return {
    add: (item: Omit<T, 'id'>, id = newId()) => {
      const accountId = accountIdRef.current;
      if (!accountId) { toast('Sua conta ainda está carregando — aguarde um instante e tente de novo.', 'error'); return null; }
      const full = { id, ...item } as T;
      setList(l => [full, ...l]);
      supabase.from(table).insert({ id, account_id: accountId, ...patchToRow(full, map) }).then(({ error }) => {
        if (error) { console.error(error); setList(l => l.filter(x => x.id !== id)); toast(SAVE_ERROR_MSG, 'error'); }
        else markSaved();
      });
      return full;
    },
    update: (id: string, patch: Partial<T>) => {
      let prev: T | undefined;
      setList(l => { prev = l.find(x => x.id === id); return l.map(x => (x.id === id ? { ...x, ...patch } : x)); });
      supabase.from(table).update(patchToRow(patch, map)).eq('id', id).then(({ error }) => {
        if (error) {
          console.error(error);
          if (prev) { const snapshot = prev; setList(l => l.map(x => (x.id === id ? snapshot : x))); }
          toast(SAVE_ERROR_MSG, 'error');
        } else markSaved();
      });
    },
    remove: (id: string) => {
      let removed: T | undefined;
      setList(l => { removed = l.find(x => x.id === id); return l.filter(x => x.id !== id); });
      supabase.from(table).delete().eq('id', id).then(({ error }) => {
        if (error && removed) { console.error(error); setList(l => [removed as T, ...l]); toast(SAVE_ERROR_MSG, 'error'); }
        else if (!error) markSaved();
      });
    },
  };
}

function buildActions(
  lists: {
    setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    setPaymentTypes: React.Dispatch<React.SetStateAction<PaymentType[]>>;
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    setDebts: React.Dispatch<React.SetStateAction<Debt[]>>;
    setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
    setCaixinhas: React.Dispatch<React.SetStateAction<Caixinha[]>>;
    setCaixinhaMovements: React.Dispatch<React.SetStateAction<CaixinhaMovement[]>>;
  },
  accountIdRef: React.MutableRefObject<string | null>,
  setUi: React.Dispatch<React.SetStateAction<AppState['ui']>>,
  setAccount: React.Dispatch<React.SetStateAction<Account | null>>,
  toast: (msg: string, tone?: Toast['tone']) => void,
  markSaved: () => void,
) {
  const people = makeCrud<Person>('people', lists.setPeople, PEOPLE_MAP, accountIdRef, toast, markSaved);
  const categories = makeCrud<Category>('categories', lists.setCategories, CATEGORIES_MAP, accountIdRef, toast, markSaved);
  const paymentTypes = makeCrud<PaymentType>('payment_types', lists.setPaymentTypes, PAYMENT_TYPES_MAP, accountIdRef, toast, markSaved);
  const transactions = makeCrud<Transaction>('transactions', lists.setTransactions, TX_MAP, accountIdRef, toast, markSaved);
  const debts = makeCrud<Debt>('debts', lists.setDebts, DEBTS_MAP, accountIdRef, toast, markSaved);
  const goals = makeCrud<Goal>('goals', lists.setGoals, GOALS_MAP, accountIdRef, toast, markSaved);
  const caixinhas = makeCrud<Caixinha>('caixinha', lists.setCaixinhas, CAIXINHA_MAP, accountIdRef, toast, markSaved);
  const caixinhaMovements = makeCrud<CaixinhaMovement>('caixinha_movements', lists.setCaixinhaMovements, CAIXINHA_MOVEMENTS_MAP, accountIdRef, toast, markSaved);

  return {
    setMonth: (m: string) => setUi(u => ({ ...u, month: m })),
    setPerson: (id: string) => setUi(u => ({ ...u, personId: id })),

    signUp: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        const blocked = /signup_not_allowed|database error saving new user/i.test(error.message);
        toast(blocked ? 'Esse e-mail ainda não foi liberado para testar o Poupê. Peça pra quem te convidou liberar seu acesso.' : error.message, 'error');
        return;
      }
      if (!data.session) toast('Verifique seu e-mail para confirmar a conta.', 'warn');
    },
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast('E-mail ou senha inválidos.', 'error');
    },
    signOut: async () => { await supabase.auth.signOut(); },

    listMembers: async () => {
      const { data, error } = await supabase.rpc('list_account_members');
      if (error) { console.error(error); toast('Não deu pra carregar os membros da conta.', 'error'); return []; }
      return (data || []) as { user_id: string; email: string; role: string; created_at: string }[];
    },
    resetPasswordForEmail: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      if (error) { toast(error.message, 'error'); return false; }
      toast('Link de redefinição enviado — confira seu e-mail.');
      return true;
    },
    updatePassword: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) { toast(error.message, 'error'); return false; }
      toast('Senha atualizada.');
      return true;
    },
    finishPasswordRecovery: () => setUi(u => ({ ...u, passwordRecovery: false })),

    createAccount: async (name: string) => {
      const { data, error } = await supabase.rpc('create_account', { p_name: name });
      const row = data && data[0];
      if (error || !row) { console.error(error); toast(error?.message || 'Erro ao criar conta.', 'error'); return null; }
      setAccount({ id: row.account_id, name, inviteCode: row.invite_code });
      setUi(u => ({ ...u, accountId: row.account_id }));
      return row.account_id as string;
    },
    joinAccount: async (code: string) => {
      const { data, error } = await supabase.rpc('join_account_by_code', { p_code: code.trim() });
      if (error || !data) { console.error(error); toast(error?.message || 'Código de convite inválido.', 'error'); return null; }
      setUi(u => ({ ...u, accountId: data as string }));
      return data as string;
    },

    addTx: (t: Omit<Transaction, 'id'>) => {
      transactions.add(t);
      toast(t.kind === 'entrada' ? 'Entrada registrada' : 'Lançamento salvo');
    },
    delTx: (id: string) => { transactions.remove(id); toast('Lançamento removido', 'warn'); },
    updateTx: (id: string, patch: Partial<Transaction>) => transactions.update(id, patch),

    toggleFixoPaid: (id: string, month: string) => {
      lists.setTransactions(l => {
        const t = l.find(x => x.id === id);
        if (!t) return l;
        const pm = t.paidMonths || [];
        const next = pm.includes(month) ? pm.filter(m => m !== month) : [...pm, month];
        transactions.update(id, { paidMonths: next });
        return l;
      });
    },

    addCategory: (name: string, color: string) => { categories.add({ name, color }); toast(`Categoria "${name}" criada`); },
    updateCategory: (id: string, patch: Partial<Category>) => categories.update(id, patch),
    delCategory: (id: string) => categories.remove(id),
    addPaymentType: (t: Omit<PaymentType, 'id'>) => { paymentTypes.add(t); toast(`${t.name} adicionado`); },
    updatePaymentType: (id: string, patch: Partial<PaymentType>) => paymentTypes.update(id, patch),
    delPaymentType: (id: string) => paymentTypes.remove(id),
    addPerson: (name: string, color: string) => { people.add({ name, color }); toast(`${name} adicionado(a)`); },
    delPerson: (id: string) => {
      people.remove(id);
      setUi(u => (u.personId === id ? { ...u, personId: 'all' } : u));
    },

    addDebt: (d: Omit<Debt, 'id' | 'color' | 'paid'> & Partial<Pick<Debt, 'color' | 'paid'>>) => {
      debts.add({ color: '#b04a3a', paid: 0, ...d } as Omit<Debt, 'id'>);
      toast('Dívida adicionada');
    },
    delDebt: (id: string) => { debts.remove(id); toast('Dívida removida', 'warn'); },
    payDebt: (id: string, amount: number) => {
      lists.setDebts(l => {
        const d = l.find(x => x.id === id);
        if (!d) return l;
        debts.update(id, { paid: Math.min(d.total, d.paid + amount) });
        return l;
      });
      toast(`Pagamento de ${fmt0(amount)} registrado`);
    },

    addGoal: (g: Omit<Goal, 'id' | 'current' | 'color' | 'emoji' | 'personId'> & Partial<Pick<Goal, 'current' | 'color' | 'emoji' | 'personId'>>) => {
      goals.add({ current: 0, color: '#2f5a48', emoji: '🎯', ...g } as Omit<Goal, 'id'>);
      toast('Meta criada');
    },
    updateGoal: (id: string, patch: Partial<Goal>) => { goals.update(id, patch); toast('Meta atualizada'); },
    delGoal: (id: string) => { goals.remove(id); toast('Meta removida', 'warn'); },
    contributeGoal: (id: string, amount: number) => {
      lists.setGoals(l => {
        const g = l.find(x => x.id === id);
        if (!g) return l;
        goals.update(id, { current: Math.min(g.target, g.current + amount) });
        return l;
      });
      toast(`Aporte de ${fmt0(amount)} feito`);
    },
    setActiveGoal: (id: string) => setUi(u => ({ ...u, activeGoalId: id })),

    deleteMonth: (month: string) => {
      lists.setTransactions(l => l.filter(t => monthOf(t.date) !== month));
      const accountId = accountIdRef.current;
      if (accountId) supabase.from('transactions').delete().eq('account_id', accountId).gte('date', `${month}-01`).lt('date', `${addMonths(month, 1)}-01`).then(({ error }) => {
        if (error) { console.error(error); toast('Erro ao apagar — pode ter ficado algo pra trás. Recarregue a página.', 'error'); }
      });
      toast('Lançamentos do mês apagados', 'warn');
    },
    deleteYear: (year: string) => {
      lists.setTransactions(l => l.filter(t => t.date.slice(0, 4) !== year));
      const accountId = accountIdRef.current;
      if (accountId) supabase.from('transactions').delete().eq('account_id', accountId).gte('date', `${year}-01-01`).lte('date', `${year}-12-31`).then(({ error }) => {
        if (error) { console.error(error); toast('Erro ao apagar — pode ter ficado algo pra trás. Recarregue a página.', 'error'); }
      });
      toast('Lançamentos do ano apagados', 'warn');
    },

    createCaixinha: (description: string) => {
      const c = caixinhas.add({ description });
      toast('Caixinha criada');
      return c?.id ?? null;
    },
    updateCaixinhaDescription: (id: string, description: string) => caixinhas.update(id, { description }),
    delCaixinha: (id: string) => { caixinhas.remove(id); toast('Caixinha removida', 'warn'); },
    addCaixinhaMovement: (m: Omit<CaixinhaMovement, 'id'>) => {
      caixinhaMovements.add(m);
      toast(m.amount >= 0 ? 'Aporte registrado' : 'Retirada registrada');
    },
    delCaixinhaMovement: (id: string) => { caixinhaMovements.remove(id); toast('Movimento removido', 'warn'); },
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const uiPrefs = React.useMemo(loadUiPrefs, []);
  const [ui, setUi] = React.useState<AppState['ui']>({
    month: uiPrefs.month, personId: uiPrefs.personId, activeGoalId: null,
    authed: false, authLoading: true, accountId: null, accountChecked: false, passwordRecovery: false,
  });
  const [account, setAccount] = React.useState<Account | null>(null);
  const [people, setPeople] = React.useState<Person[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [paymentTypes, setPaymentTypes] = React.useState<PaymentType[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [debts, setDebts] = React.useState<Debt[]>([]);
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [caixinhas, setCaixinhas] = React.useState<Caixinha[]>([]);
  const [caixinhaMovements, setCaixinhaMovements] = React.useState<CaixinhaMovement[]>([]);
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [lastSaved, setLastSaved] = React.useState(0);

  const accountIdRef = React.useRef<string | null>(null);
  React.useEffect(() => { accountIdRef.current = ui.accountId; }, [ui.accountId]);

  React.useEffect(() => {
    try { localStorage.setItem(UI_LS_KEY, JSON.stringify({ month: ui.month, personId: ui.personId })); } catch { /* ignore */ }
  }, [ui.month, ui.personId]);

  const toast = React.useCallback((msg: string, tone: Toast['tone'] = 'ok') => {
    const id = uid();
    setToasts(t => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  }, []);

  const markSaved = React.useCallback(() => setLastSaved(Date.now()), []);

  const actions = React.useMemo(
    () => buildActions(
      { setPeople, setCategories, setPaymentTypes, setTransactions, setDebts, setGoals, setCaixinhas, setCaixinhaMovements },
      accountIdRef, setUi, setAccount, toast, markSaved,
    ),
    [toast, markSaved],
  );

  // Sessão de autenticação
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUi(u => ({ ...u, authed: !!data.session, authLoading: false }));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUi(u => ({ ...u, authed: !!session, authLoading: false, passwordRecovery: event === 'PASSWORD_RECOVERY' ? true : u.passwordRecovery }));
      if (!session) {
        setUi(u => ({ ...u, accountId: null, accountChecked: false }));
        setAccount(null);
        setPeople([]); setCategories([]); setPaymentTypes([]); setTransactions([]); setDebts([]); setGoals([]);
        setCaixinhas([]); setCaixinhaMovements([]);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Descobrir a conta (casal) do usuário logado
  React.useEffect(() => {
    if (!ui.authed || ui.accountId || ui.accountChecked) return;
    let cancelled = false;
    (async () => {
      const { data: accountId, error } = await supabase.rpc('my_account_id');
      if (cancelled) return;
      if (error) { console.error(error); toast('Não deu pra carregar sua conta. Recarregue a página.', 'error'); setUi(u => ({ ...u, accountChecked: true })); return; }
      setUi(u => ({ ...u, accountId: (accountId as string) || null, accountChecked: true }));
    })();
    return () => { cancelled = true; };
  }, [ui.authed, ui.accountId, ui.accountChecked]);

  // Carregar dados da conta + assinar mudanças em tempo real
  React.useEffect(() => {
    const accountId = ui.accountId;
    if (!accountId) return;
    let cancelled = false;

    (async () => {
      const { data: acc } = await supabase.from('accounts').select('id,name,invite_code').eq('id', accountId).maybeSingle();
      if (!cancelled && acc) setAccount({ id: acc.id, name: acc.name, inviteCode: acc.invite_code });

      const [p, c, pt, tx, d, g, cx, cm] = await Promise.all([
        supabase.from('people').select('*').eq('account_id', accountId),
        supabase.from('categories').select('*').eq('account_id', accountId),
        supabase.from('payment_types').select('*').eq('account_id', accountId),
        supabase.from('transactions').select('*').eq('account_id', accountId),
        supabase.from('debts').select('*').eq('account_id', accountId),
        supabase.from('goals').select('*').eq('account_id', accountId),
        supabase.from('caixinha').select('*').eq('account_id', accountId),
        supabase.from('caixinha_movements').select('*').eq('account_id', accountId),
      ]);
      if (cancelled) return;
      const loadError = [p, c, pt, tx, d, g, cx, cm].find(r => r.error)?.error;
      if (loadError) {
        console.error(loadError);
        toast('Erro ao carregar seus dados — isso não significa que foram perdidos. Recarregue a página; se persistir, avise.', 'error');
        return;
      }
      const peopleList = (p.data || []).map(peopleFromRow);
      setPeople(peopleList);
      setUi(u => (u.personId !== 'all' && !peopleList.some(pp => pp.id === u.personId) ? { ...u, personId: 'all' } : u));
      setCategories((c.data || []).map(categoriesFromRow));
      setPaymentTypes((pt.data || []).map(paymentTypesFromRow));
      setTransactions((tx.data || []).map(txFromRow));
      setDebts((d.data || []).map(debtsFromRow));
      setGoals((g.data || []).map(goalsFromRow));
      setCaixinhas((cx.data || []).map(caixinhaFromRow));
      setCaixinhaMovements((cm.data || []).map(caixinhaMovementsFromRow));
    })();

    const applyChange = <T extends { id: string }>(
      setList: React.Dispatch<React.SetStateAction<T[]>>,
      fromRow: (r: any) => T,
    ) => (payload: any) => {
      if (payload.eventType === 'DELETE') {
        setList(l => l.filter(x => x.id !== payload.old.id));
        return;
      }
      const item = fromRow(payload.new);
      setList(l => {
        const idx = l.findIndex(x => x.id === item.id);
        if (idx === -1) return [item, ...l];
        const copy = l.slice(); copy[idx] = item; return copy;
      });
    };

    const channel: RealtimeChannel = supabase.channel(`account-${accountId}`);
    const wire = (table: typeof DATA_TABLES[number], setList: any, fromRow: any) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `account_id=eq.${accountId}` }, applyChange(setList, fromRow));
    };
    wire('people', setPeople, peopleFromRow);
    wire('categories', setCategories, categoriesFromRow);
    wire('payment_types', setPaymentTypes, paymentTypesFromRow);
    wire('transactions', setTransactions, txFromRow);
    wire('debts', setDebts, debtsFromRow);
    wire('goals', setGoals, goalsFromRow);
    wire('caixinha', setCaixinhas, caixinhaFromRow);
    wire('caixinha_movements', setCaixinhaMovements, caixinhaMovementsFromRow);
    channel.subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [ui.accountId]);

  const state = React.useMemo<AppState>(
    () => ({ people, categories, paymentTypes, transactions, debts, goals, caixinhas, caixinhaMovements, account, ui }),
    [people, categories, paymentTypes, transactions, debts, goals, caixinhas, caixinhaMovements, account, ui],
  );
  const value = React.useMemo(() => ({ state, actions, toast, toasts, lastSaved }), [state, actions, toast, toasts, lastSaved]);

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
