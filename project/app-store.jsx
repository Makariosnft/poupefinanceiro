/* global React */
// Poupê — camada de dados: modelo, persistência, ações e seletores derivados.

const LS_KEY = 'poupe.state.v2';
const uid = () => Math.random().toString(36).slice(2, 9);

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS_FULL = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const pad = n => String(n).padStart(2, '0');
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const monthOf = iso => iso.slice(0, 7);
const thisMonth = () => todayISO().slice(0, 7);
const monthDiff = (a, b) => { const [ay, am] = a.split('-').map(Number); const [by, bm] = b.split('-').map(Number); return (by - ay) * 12 + (bm - am); };
const addMonths = (m, n) => { const [y, mo] = m.split('-').map(Number); const t = (y * 12 + (mo - 1)) + n; return `${Math.floor(t / 12)}-${pad(t % 12 + 1)}`; };
const monthLabel = m => `${MONTHS_FULL[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;
const monthShort = m => `${MONTHS_PT[Number(m.slice(5, 7)) - 1]}/${m.slice(2, 4)}`;
const fmt = n => 'R$ ' + (n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = n => 'R$ ' + Math.round(n || 0).toLocaleString('pt-BR');
const dayLabel = iso => `${Number(iso.slice(8, 10))} ${MONTHS_PT[Number(iso.slice(5, 7)) - 1].toLowerCase()}`;

// ── Seed ───────────────────────────────────────────────────────────
function seed() {
  const M = thisMonth();
  const prev = addMonths(M, -1);
  const P = { davi: uid(), edu: uid() };
  const C = {};
  [
    ['Contas', '#b04a3a'], ['Mercado', '#7a8a3a'], ['Combustível', '#3a6a8a'], ['Carro', '#2f5a48'],
    ['Beleza', '#c79bb0'], ['Academia', '#7a6ca8'], ['Assinatura', '#d4a24a'], ['Igreja', '#5a8a9a'],
    ['Fins de semana', '#c97a3a'], ['Saúde', '#8a9a5a'], ['Roupa', '#a86a6a'], ['Viagem', '#c44a4a'],
    ['Padaria', '#d4b48a'], ['Eletrônico', '#5a5a8a'], ['Presente', '#a85a8a'], ['Salário', '#2f5a48'],
  ].forEach(([n]) => { C[n] = uid(); });
  const cats = [
    ['Contas', '#b04a3a'], ['Mercado', '#7a8a3a'], ['Combustível', '#3a6a8a'], ['Carro', '#2f5a48'],
    ['Beleza', '#c79bb0'], ['Academia', '#7a6ca8'], ['Assinatura', '#d4a24a'], ['Igreja', '#5a8a9a'],
    ['Fins de semana', '#c97a3a'], ['Saúde', '#8a9a5a'], ['Roupa', '#a86a6a'], ['Viagem', '#c44a4a'],
    ['Padaria', '#d4b48a'], ['Eletrônico', '#5a5a8a'], ['Presente', '#a85a8a'], ['Salário', '#2f5a48'],
  ].map(([name, color]) => ({ id: C[name], name, color }));

  const T = {};
  [['Dinheiro', 'base', '#7a8a3a'], ['PIX', 'base', '#2f5a48'], ['Boleto', 'base', '#5a8a9a'], ['Débito', 'base', '#3a6a8a'],
   ['Nubank', 'card', '#8a3ffc'], ['C6 Bank', 'card', '#1a1a1a']].forEach(([n]) => { T[n] = uid(); });
  const types = [
    { id: T['Dinheiro'], name: 'Dinheiro', kind: 'base', color: '#7a8a3a' },
    { id: T['PIX'], name: 'PIX', kind: 'base', color: '#2f5a48' },
    { id: T['Boleto'], name: 'Boleto', kind: 'base', color: '#5a8a9a' },
    { id: T['Débito'], name: 'Débito', kind: 'base', color: '#3a6a8a' },
    { id: T['Nubank'], name: 'Nubank', kind: 'card', color: '#8a3ffc', closing: 18, due: 25 },
    { id: T['C6 Bank'], name: 'C6 Bank', kind: 'card', color: '#1a1a1a', closing: 15, due: 22 },
  ];

  const d = n => `${M}-${pad(n)}`;
  const tx = [];
  const push = o => tx.push({ id: uid(), ...o });

  // Entradas
  push({ kind: 'entrada', desc: 'Salário Davi', amount: 5200, categoryId: C['Salário'], typeId: T['PIX'], personId: P.davi, date: d(5), incomeKind: 'Salário' });
  push({ kind: 'entrada', desc: 'Salário Eduarda', amount: 3700, categoryId: C['Salário'], typeId: T['PIX'], personId: P.edu, date: d(5), incomeKind: 'Salário' });
  push({ kind: 'entrada', desc: 'Freela fotos', amount: 450, categoryId: C['Salário'], typeId: T['PIX'], personId: P.edu, date: d(12), incomeKind: 'Extra' });

  // Fixos (templates, com meses pagos)
  const fx = (desc, amount, day, cat, type, person, paid) =>
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

  // Parcelamentos
  const pc = (desc, amount, start, total, cat, type, person) =>
    push({ kind: 'parcelamento', desc, amount, startMonth: start, totalInstallments: total, categoryId: cat, typeId: type, personId: person, date: `${start}-10` });
  pc('iPhone 15', 320, addMonths(M, -5), 12, C['Eletrônico'], T['Nubank'], P.davi);
  pc('Sofá retrátil', 199, addMonths(M, -2), 10, C['Roupa'], T['C6 Bank'], P.edu);
  pc('Viagem RJ', 450, addMonths(M, -1), 4, C['Viagem'], T['Nubank'], P.davi);
  pc('Notebook Dell', 280, addMonths(M, -8), 10, C['Eletrônico'], T['C6 Bank'], P.edu);
  pc('Curso de inglês', 190, M, 6, C['Assinatura'], T['PIX'], P.edu);

  // Comuns do mês
  const cm = (desc, amount, day, cat, type, person) =>
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

  // Mês anterior (para comparativos)
  const pd = n => `${prev}-${pad(n)}`;
  push({ id: uid(), kind: 'entrada', desc: 'Salário Davi', amount: 5200, categoryId: C['Salário'], typeId: T['PIX'], personId: P.davi, date: pd(5), incomeKind: 'Salário' });
  push({ id: uid(), kind: 'entrada', desc: 'Salário Eduarda', amount: 3700, categoryId: C['Salário'], typeId: T['PIX'], personId: P.edu, date: pd(5), incomeKind: 'Salário' });
  [['Mercado do mês', 598, 3, 'Mercado', 'Nubank', 'edu'], ['Posto Shell', 240, 5, 'Combustível', 'C6 Bank', 'davi'],
   ['Restaurante', 186, 9, 'Fins de semana', 'Nubank', 'davi'], ['Farmácia', 74, 14, 'Saúde', 'Débito', 'edu'],
   ['Padaria', 96, 18, 'Padaria', 'PIX', 'edu']].forEach(([desc, amount, day, cat, type, who]) =>
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
    ui: { month: M, personId: 'all', activeGoalId: null },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seed();
    const s = JSON.parse(raw);
    if (!s || !s.transactions || !s.people) return seed();
    return s;
  } catch (e) { return seed(); }
}

// ── Contexto ───────────────────────────────────────────────────────
const StoreCtx = React.createContext(null);

function StoreProvider({ children }) {
  const [state, setState] = React.useState(load);
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);

  const toast = React.useCallback((msg, tone = 'ok') => {
    const id = uid();
    setToasts(t => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  }, []);

  const up = fn => setState(s => fn(s));

  const actions = React.useMemo(() => ({
    setMonth: m => up(s => ({ ...s, ui: { ...s.ui, month: m } })),
    setPerson: id => up(s => ({ ...s, ui: { ...s.ui, personId: id } })),

    addTx: t => { up(s => ({ ...s, transactions: [{ id: uid(), ...t }, ...s.transactions] })); toast(t.kind === 'entrada' ? 'Entrada registrada' : 'Lançamento salvo'); },
    delTx: id => { up(s => ({ ...s, transactions: s.transactions.filter(t => t.id !== id) })); toast('Lançamento removido', 'warn'); },
    updateTx: (id, patch) => up(s => ({ ...s, transactions: s.transactions.map(t => t.id === id ? { ...t, ...patch } : t) })),

    toggleFixoPaid: (id, month) => up(s => ({
      ...s, transactions: s.transactions.map(t => {
        if (t.id !== id) return t;
        const pm = t.paidMonths || [];
        return { ...t, paidMonths: pm.includes(month) ? pm.filter(m => m !== month) : [...pm, month] };
      })
    })),

    addCategory: (name, color) => { up(s => ({ ...s, categories: [...s.categories, { id: uid(), name, color }] })); toast(`Categoria "${name}" criada`); },
    delCategory: id => up(s => ({ ...s, categories: s.categories.filter(c => c.id !== id) })),
    addPaymentType: t => { up(s => ({ ...s, paymentTypes: [...s.paymentTypes, { id: uid(), ...t }] })); toast(`${t.name} adicionado`); },
    delPaymentType: id => up(s => ({ ...s, paymentTypes: s.paymentTypes.filter(t => t.id !== id) })),
    addPerson: (name, color) => { up(s => ({ ...s, people: [...s.people, { id: uid(), name, color }] })); toast(`${name} adicionado(a)`); },
    delPerson: id => up(s => ({ ...s, people: s.people.filter(p => p.id !== id) })),

    addDebt: d => { up(s => ({ ...s, debts: [...s.debts, { id: uid(), color: '#b04a3a', paid: 0, ...d }] })); toast('Dívida adicionada'); },
    delDebt: id => { up(s => ({ ...s, debts: s.debts.filter(d => d.id !== id) })); toast('Dívida removida', 'warn'); },
    payDebt: (id, amount) => {
      up(s => ({ ...s, debts: s.debts.map(d => d.id === id ? { ...d, paid: Math.min(d.total, d.paid + amount) } : d) }));
      toast(`Pagamento de ${fmt0(amount)} registrado`);
    },

    addGoal: g => { up(s => ({ ...s, goals: [...s.goals, { id: uid(), current: 0, color: '#2f5a48', emoji: '🎯', ...g }] })); toast('Meta criada'); },
    delGoal: id => { up(s => ({ ...s, goals: s.goals.filter(g => g.id !== id) })); toast('Meta removida', 'warn'); },
    contributeGoal: (id, amount) => {
      up(s => ({ ...s, goals: s.goals.map(g => g.id === id ? { ...g, current: Math.min(g.target, g.current + amount) } : g) }));
      toast(`Aporte de ${fmt0(amount)} feito`);
    },
    setActiveGoal: id => up(s => ({ ...s, ui: { ...s.ui, activeGoalId: id } })),

    reset: () => { setState(seed()); toast('Dados restaurados'); },
  }), [toast]);

  const value = React.useMemo(() => ({ state, actions, toast, toasts }), [state, actions, toast, toasts]);
  return React.createElement(StoreCtx.Provider, { value }, children);
}

const useStore = () => React.useContext(StoreCtx);

// ── Seletores ──────────────────────────────────────────────────────
// Expande os lançamentos "vivos" de um mês: comuns + entradas do mês,
// fixos (sempre), parcelas cuja janela cobre o mês.
function expandMonth(state, month, personId = 'all') {
  const inPerson = t => personId === 'all' || t.personId === personId;
  const out = { comuns: [], entradas: [], fixos: [], parcelas: [] };
  state.transactions.forEach(t => {
    if (!inPerson(t)) return;
    if (t.kind === 'comum' && monthOf(t.date) === month) out.comuns.push(t);
    else if (t.kind === 'entrada' && monthOf(t.date) === month) out.entradas.push(t);
    else if (t.kind === 'fixo') {
      if (monthDiff(monthOf(t.date), month) >= 0) out.fixos.push({ ...t, paid: (t.paidMonths || []).includes(month), dueDate: `${month}-${pad(Math.min(t.dayOfMonth || 1, 28))}` });
    } else if (t.kind === 'parcelamento') {
      const n = monthDiff(t.startMonth, month) + 1;
      if (n >= 1 && n <= t.totalInstallments) out.parcelas.push({ ...t, installment: n });
    }
  });
  const byDate = (a, b) => (b.date || '').localeCompare(a.date || '');
  out.comuns.sort(byDate); out.entradas.sort(byDate);
  out.fixos.sort((a, b) => (a.dayOfMonth || 0) - (b.dayOfMonth || 0));
  out.parcelas.sort((a, b) => (a.totalInstallments - a.installment) - (b.totalInstallments - b.installment));
  return out;
}

function totalsFor(state, month, personId = 'all') {
  const m = expandMonth(state, month, personId);
  const sum = arr => arr.reduce((s, t) => s + Number(t.amount || 0), 0);
  const income = sum(m.entradas);
  const comum = sum(m.comuns), fixo = sum(m.fixos), parcela = sum(m.parcelas);
  const expenses = comum + fixo + parcela;
  return { income, comum, fixo, parcela, expenses, balance: income - expenses, counts: { comum: m.comuns.length, fixo: m.fixos.length, parcela: m.parcelas.length, entrada: m.entradas.length }, items: m };
}

function byCategory(state, month, personId = 'all') {
  const { items } = totalsFor(state, month, personId);
  const map = {};
  [...items.comuns, ...items.fixos, ...items.parcelas].forEach(t => {
    map[t.categoryId] = (map[t.categoryId] || 0) + Number(t.amount || 0);
  });
  return Object.entries(map)
    .map(([id, value]) => ({ cat: state.categories.find(c => c.id === id) || { name: '—', color: '#8a857a' }, value }))
    .sort((a, b) => b.value - a.value);
}

function byPerson(state, month) {
  return state.people.map(p => ({ person: p, value: totalsFor(state, month, p.id).expenses }));
}

function byType(state, month, personId = 'all') {
  const { items } = totalsFor(state, month, personId);
  const map = {};
  [...items.comuns, ...items.fixos, ...items.parcelas].forEach(t => { map[t.typeId] = (map[t.typeId] || 0) + Number(t.amount || 0); });
  return Object.entries(map)
    .map(([id, value]) => ({ type: state.paymentTypes.find(t => t.id === id) || { name: '—', color: '#8a857a' }, value }))
    .sort((a, b) => b.value - a.value);
}

// Vencimentos: fixos não pagos + parcelas do mês, ordenados por proximidade
function upcoming(state, month, personId = 'all') {
  const { items } = totalsFor(state, month, personId);
  const today = todayISO();
  const rows = [];
  items.fixos.filter(f => !f.paid).forEach(f => rows.push({ id: f.id, kind: 'fixo', desc: f.desc, amount: f.amount, date: f.dueDate, typeId: f.typeId, personId: f.personId }));
  items.parcelas.forEach(p => rows.push({ id: p.id, kind: 'parcela', desc: `${p.desc} (${p.installment}/${p.totalInstallments})`, amount: p.amount, date: `${month}-${pad(10)}`, typeId: p.typeId, personId: p.personId }));
  return rows.map(r => {
    const diff = Math.round((new Date(r.date + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000);
    const when = diff < 0 ? `atrasado ${Math.abs(diff)}d` : diff === 0 ? 'hoje' : diff === 1 ? 'amanhã' : `em ${diff} dias`;
    const urg = diff < 0 ? 'atrasado' : diff <= 0 ? 'urgente' : diff <= 5 ? 'breve' : 'ok';
    return { ...r, diff, when, urg };
  }).sort((a, b) => a.diff - b.diff);
}

// Score de saúde financeira derivado dos dados reais
function healthScore(state, month) {
  const t = totalsFor(state, month);
  const prev = totalsFor(state, addMonths(month, -1));
  const income = t.income || 1;
  const clamp = (v, a = 0, b = 10) => Math.max(a, Math.min(b, v));

  const savingsRate = t.balance / income;
  const reserve = (state.goals.find(g => /reserva/i.test(g.name)) || { current: 0 }).current;
  const monthlyNeed = t.expenses || 1;
  const reserveMonths = reserve / monthlyNeed;
  const debtRemaining = state.debts.reduce((s, d) => s + (d.total - d.paid), 0);
  const debtMin = state.debts.reduce((s, d) => s + d.min, 0);
  const committed = (t.fixo + t.parcela + debtMin) / income;

  const dims = [
    { k: 'Reserva de emergência', v: clamp(reserveMonths / 6 * 10), note: `${reserveMonths.toFixed(1)} mês de cobertura` },
    { k: 'Controle de gastos', v: clamp(10 - Math.max(0, (t.expenses / income - 0.7)) * 25), note: `${Math.round(t.expenses / income * 100)}% da renda` },
    { k: 'Endividamento', v: clamp(10 - (debtMin / income) * 30), note: `${Math.round(debtMin / income * 100)}% comprometido` },
    { k: 'Hábito de poupar', v: clamp(savingsRate * 40), note: `${Math.round(savingsRate * 100)}% guardado` },
    { k: 'Comprometimento fixo', v: clamp(10 - Math.max(0, committed - 0.5) * 20), note: `${Math.round(committed * 100)}% já comprometido` },
    { k: 'Evolução mensal', v: clamp(5 + (t.balance - prev.balance) / (income * 0.1)), note: t.balance >= prev.balance ? 'melhor que o mês passado' : 'pior que o mês passado' },
  ].map(d => ({ ...d, v: Number(d.v.toFixed(1)), color: d.v < 4 ? '#b04a3a' : d.v < 7 ? '#c97a3a' : '#2f5a48' }));

  const score = Number((dims.reduce((s, d) => s + d.v, 0) / dims.length).toFixed(1));
  return { score, dims, reserveMonths, debtRemaining, savingsRate, committed, totals: t, prevTotals: prev };
}

function scoreHistory(state, month, n = 6) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const m = addMonths(month, -i);
    out.push({ month: m, label: MONTHS_PT[Number(m.slice(5, 7)) - 1], value: healthScore(state, m).score });
  }
  return out;
}

window.PoupeStore = {
  StoreProvider, useStore, expandMonth, totalsFor, byCategory, byPerson, byType, upcoming,
  healthScore, scoreHistory, MONTHS_PT, MONTHS_FULL, fmt, fmt0, monthLabel, monthShort,
  addMonths, monthDiff, thisMonth, todayISO, monthOf, dayLabel, uid,
};
