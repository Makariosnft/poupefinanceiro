import React from 'react';
import * as S from '../lib/store';
import { useStore } from '../lib/store';
import {
  Button, IconBtn, Field, Input, MoneyInput, Select, Chip, Card, CardTitle, Bar, Donut,
  KindSwitch, TopBar, FAB, EmptyState, Row, Modal, PersonSpendCard, useIsMobile, tokens,
} from '../components/ui';
import type { AppState, Transaction, TxKind } from '../lib/types';

const { ink, ink2, muted, paper, paper2, green, red, amber, blue, gold } = tokens;

// Lançamentos "comum"/"entrada" sempre datam dentro do mês que está sendo visualizado
// (dia de hoje se for o mês atual de verdade, dia 1 caso contrário) — não a data real do sistema.
function dateInMonth(month: string) {
  const today = S.todayISO();
  const day = month === S.thisMonth() ? today.slice(8, 10) : '01';
  return `${month}-${day}`;
}

// ── Formulário de lançamento (reutilizado inline e no modal) ───────
function useTxForm(defaultKind: TxKind = 'comum') {
  const { state } = useStore();
  const month = state.ui.month;
  const [kind, setKind] = React.useState<TxKind>(defaultKind);
  const [desc, setDesc] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [typeId, setTypeId] = React.useState('');
  const [personId, setPersonId] = React.useState(state.people[0]?.id || '');
  const [day, setDay] = React.useState('5');
  const [curInst, setCurInst] = React.useState('1');
  const [totInst, setTotInst] = React.useState('12');
  const [date, setDate] = React.useState(() => dateInMonth(month));

  // Segue o mês visualizado na tela, para o lançamento cair no mês certo mesmo sem o campo de data visível.
  React.useEffect(() => { setDate(dateInMonth(month)); }, [month]);

  const valid = Boolean(desc.trim() && Number(amount) > 0 && categoryId && typeId && personId);

  const reset = () => { setDesc(''); setAmount(''); setCurInst('1'); setDate(dateInMonth(month)); };

  const build = (month: string) => {
    const base = { desc: desc.trim(), amount: Number(amount), categoryId, typeId, personId };
    if (kind === 'fixo') {
      return { ...base, kind: 'fixo' as const, dayOfMonth: Number(day), date: `${month}-${String(Math.min(28, Number(day) || 1)).padStart(2, '0')}`, paidMonths: [] };
    }
    if (kind === 'parcelamento') {
      const n = Math.max(1, Number(curInst) || 1);
      return { ...base, kind: 'parcelamento' as const, totalInstallments: Math.max(n, Number(totInst) || n), startMonth: S.addMonths(month, -(n - 1)), date };
    }
    return { ...base, kind: 'comum' as const, date };
  };

  return {
    kind, setKind, desc, setDesc, amount, setAmount, categoryId, setCategoryId, typeId, setTypeId,
    personId, setPersonId, day, setDay, curInst, setCurInst, totInst, setTotInst, date, setDate, valid, reset, build,
  };
}
type TxForm = ReturnType<typeof useTxForm>;

function catOptions(state: AppState) {
  return state.categories.map(c => ({ value: c.id, label: c.name })).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}
function typeOptions(state: AppState) { return state.paymentTypes.map(t => ({ value: t.id, label: t.kind === 'card' ? `💳 ${t.name}` : t.name })); }
// Entradas não têm seletor de categoria (é sempre salário/renda extra) — usa a categoria "Salário" automaticamente.
function incomeCategoryId(state: AppState) { return state.categories.find(c => /sal[aá]rio/i.test(c.name))?.id || state.categories[0]?.id || ''; }
function personOptions(state: AppState) { return state.people.map(p => ({ value: p.id, label: p.name })); }

// Campos extras conforme o tipo (fixo → dia; parcelamento → qual parcela)
function KindExtraFields({ f }: { f: TxForm }) {
  if (f.kind === 'fixo') {
    return (
      <Field label="dia do vencimento">
        <Input type="number" value={f.day} onChange={f.setDay} accent={amber} />
      </Field>
    );
  }
  if (f.kind === 'parcelamento') {
    const cur = Math.max(1, Number(f.curInst) || 1), tot = Math.max(cur, Number(f.totInst) || cur);
    return (
      <div style={{ padding: '10px 12px', border: `1.6px solid ${green}`, borderRadius: 9, background: `${green}0e`, gridColumn: '1 / -1' }}>
        <div style={{ fontSize: 10.5, color: green, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 7 }}>
          qual parcela está pagando agora?
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Input type="number" min="1" value={f.curInst} onChange={f.setCurInst} accent={green} style={{ textAlign: 'center', fontWeight: 700, fontSize: 16 }} />
          <span style={{ color: ink2, fontWeight: 600, fontSize: 12 }}>de</span>
          <Input type="number" min="1" value={f.totInst} onChange={f.setTotInst} accent={green} style={{ textAlign: 'center', fontWeight: 700, fontSize: 16 }} />
          <div style={{ flex: 1, minWidth: 90 }}>
            <Bar pct={(cur / tot) * 100} color={green} height={6} />
            <div style={{ fontSize: 10, color: muted, marginTop: 4 }}>faltam {Math.max(0, tot - cur)} após essa</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Field label="data">
      <Input type="date" value={f.date} onChange={f.setDate} />
    </Field>
  );
}

// ── Modal de lançamento (FAB) ──────────────────────────────────────
export function QuickAddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, actions } = useStore();
  const f = useTxForm('comum');
  const [tab, setTab] = React.useState<'gasto' | 'entrada'>('gasto');

  const valid = tab === 'entrada'
    ? Boolean(f.desc.trim() && Number(f.amount) > 0 && f.personId)
    : f.valid;

  const save = () => {
    if (!valid) return;
    if (tab === 'entrada') actions.addTx({ kind: 'entrada', desc: f.desc.trim(), amount: Number(f.amount), categoryId: incomeCategoryId(state), typeId: f.typeId || state.paymentTypes[0]?.id || '', personId: f.personId, date: f.date, incomeKind: 'Salário' });
    else actions.addTx(f.build(state.ui.month));
    f.reset(); onClose();
  };

  React.useEffect(() => { if (open) f.reset(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);

  return (
    <Modal open={open} onClose={onClose} title={tab === 'entrada' ? 'Nova entrada' : 'Novo lançamento'} width={480}
      footer={<>
        <span style={{ fontSize: 11, color: muted, marginRight: 'auto' }}>Esc para fechar</span>
        <Button variant="ghost" onClick={onClose}>cancelar</Button>
        <Button onClick={save} disabled={!valid} tone={tab === 'entrada' ? green : ink}>salvar</Button>
      </>}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <Chip active={tab === 'gasto'} onClick={() => setTab('gasto')} style={{ padding: '7px 16px', fontSize: 13 }}>↓ Gasto</Chip>
        <Chip active={tab === 'entrada'} color={green} onClick={() => setTab('entrada')} style={{ padding: '7px 16px', fontSize: 13 }}>↑ Entrada</Chip>
      </div>

      {tab === 'gasto' && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10.5, color: muted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>tipo de gasto</div>
          <KindSwitch value={f.kind} onChange={v => f.setKind(v as TxKind)} size="md" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="descrição" style={{ gridColumn: '1 / -1' }}>
          <Input value={f.desc} onChange={f.setDesc} placeholder={tab === 'entrada' ? 'Salário, freela…' : 'Mercado do mês…'} onEnter={save} />
        </Field>
        <Field label={f.kind === 'parcelamento' && tab === 'gasto' ? 'valor da parcela' : 'valor'}>
          <MoneyInput value={f.amount} onChange={f.setAmount} onEnter={save} accent={tab === 'entrada' ? green : ink} />
        </Field>
        {tab === 'gasto' ? <KindExtraFields f={f} /> : <Field label="data"><Input type="date" value={f.date} onChange={f.setDate} /></Field>}
        {tab === 'gasto' && (
          <Field label="categoria">
            <Select value={f.categoryId} onChange={f.setCategoryId} options={catOptions(state)} placeholder="escolher…" />
          </Field>
        )}
        <Field label="forma de pagamento" style={tab === 'entrada' ? { gridColumn: '1 / -1' } : undefined}>
          <Select value={f.typeId} onChange={f.setTypeId} options={typeOptions(state)} placeholder="escolher…" />
        </Field>
        <Field label="quem" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {state.people.map(p => (
              <Chip key={p.id} active={f.personId === p.id} color={p.color} onClick={() => f.setPersonId(p.id)} style={{ flex: 1, justifyContent: 'center', padding: '8px 0' }}>{p.name}</Chip>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

interface ScreenProps {
  onNavigate: (tab: string) => void;
  onOpenModal: () => void;
}

// ── Tela: Lançamentos ──────────────────────────────────────────────
export function Lancamentos({ onNavigate, onOpenModal }: ScreenProps) {
  const { state, actions } = useStore();
  const isMobile = useIsMobile();
  const { month, personId } = state.ui;
  const t = S.totalsFor(state, month, personId);
  const prev = S.totalsFor(state, S.addMonths(month, -1), personId);
  const ups = S.upcoming(state, month, personId).slice(0, 7);
  const invoices = S.cardInvoices(state, month);

  const g = useTxForm('comum');
  const inc = useTxForm('comum');
  const [incKind, setIncKind] = React.useState('Salário');

  const catName = (id: string) => state.categories.find(c => c.id === id)?.name || '—';
  const catColor = (id: string) => state.categories.find(c => c.id === id)?.color || muted;
  const typeName = (id: string) => state.paymentTypes.find(x => x.id === id)?.name || '—';
  const personName = (id: string) => state.people.find(p => p.id === id)?.name || '—';

  const saveGasto = () => { if (!g.valid) return; actions.addTx(g.build(month)); g.reset(); };
  const incValid = Boolean(inc.desc.trim() && Number(inc.amount) > 0 && inc.personId);
  const saveEntrada = () => {
    if (!incValid) return;
    actions.addTx({ kind: 'entrada', desc: inc.desc.trim(), amount: Number(inc.amount), categoryId: incomeCategoryId(state), typeId: inc.typeId || state.paymentTypes[0].id, personId: inc.personId, date: inc.date, incomeKind: incKind as 'Salário' | 'Extra' });
    inc.reset();
  };

  const recent = t.items.comuns.slice(0, 8);
  const spentPct = t.income ? (t.expenses / t.income) * 100 : 0;

  return (
    <div style={{ height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '100%' : undefined, display: 'flex', flexDirection: 'column', background: paper, overflow: isMobile ? 'visible' : 'hidden' }}>
      <TopBar activeTab="Lançamentos" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.45fr 1fr', gap: 16, padding: 16 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'auto', paddingRight: 2 }}>
          <Card>
            <CardTitle sub="preencha e tecle Enter — entra na hora" right={<KindSwitch value={g.kind} onChange={v => g.setKind(v as TxKind)} />}>Lançar gasto</CardTitle>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1.8fr .9fr 1fr 1fr .9fr auto', gap: 8, alignItems: 'end' }}>
              <Field label="descrição"><Input value={g.desc} onChange={g.setDesc} placeholder="o que foi?" onEnter={saveGasto} /></Field>
              <Field label="valor"><MoneyInput value={g.amount} onChange={g.setAmount} onEnter={saveGasto} accent={ink} /></Field>
              <Field label="categoria"><Select value={g.categoryId} onChange={g.setCategoryId} options={catOptions(state)} placeholder="—" /></Field>
              <Field label="pagamento"><Select value={g.typeId} onChange={g.setTypeId} options={typeOptions(state)} placeholder="—" /></Field>
              <Field label="quem"><Select value={g.personId} onChange={g.setPersonId} options={personOptions(state)} placeholder="—" /></Field>
              <Button onClick={saveGasto} disabled={!g.valid} style={{ height: 38 }}>add</Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginTop: 10 }}>
              <KindExtraFields f={g} />
            </div>
          </Card>

          <Card>
            <CardTitle sub="salário, extra, freela…" right={
              <KindSwitch value={incKind} onChange={setIncKind} options={[{ key: 'Salário', label: 'Salário' }, { key: 'Extra', label: 'Extra' }]} />
            }>Lançar entrada</CardTitle>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '2.4fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
              <Field label="descrição"><Input value={inc.desc} onChange={inc.setDesc} placeholder="de onde veio?" onEnter={saveEntrada} accent={green} /></Field>
              <Field label="valor"><MoneyInput value={inc.amount} onChange={inc.setAmount} onEnter={saveEntrada} accent={green} /></Field>
              <Field label="quem"><Select value={inc.personId} onChange={inc.setPersonId} options={personOptions(state)} placeholder="—" accent={green} /></Field>
              <Button onClick={saveEntrada} disabled={!incValid} tone={green} style={{ height: 38 }}>+ entrada</Button>
            </div>
          </Card>

          <Card style={{ flex: 1, minHeight: 200, display: 'flex', flexDirection: 'column' }}>
            <CardTitle sub={`${t.counts.comum} lançamentos avulsos em ${S.monthLabel(month).toLowerCase()}`}
              right={<Button variant="ghost" size="sm" onClick={() => onNavigate('Gastos do mês')}>ver tudo →</Button>}>Gastos comuns</CardTitle>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {recent.length === 0 ? (
                <EmptyState icon="🧾" title="Nenhum gasto avulso ainda" hint="Use o formulário acima para lançar o primeiro." />
              ) : recent.map((tx, i) => (
                <Row key={tx.id} last={i === recent.length - 1} onDelete={() => actions.delTx(tx.id)}>
                  <div style={{ display: 'grid', gridTemplateColumns: '10px 1.7fr 62px 1fr 72px 64px 92px', alignItems: 'center', gap: 9, padding: '8px 26px 8px 2px', fontSize: 12.5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: catColor(tx.categoryId) }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{tx.desc}</span>
                    <span style={{ color: muted, fontSize: 11 }}>{S.dayLabel(tx.date)}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{catName(tx.categoryId)}</span>
                    <span style={{ color: muted, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{personName(tx.personId)}</span>
                    <span style={{ color: muted, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{typeName(tx.typeId)}</span>
                    <span style={{ textAlign: 'right', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>{S.fmt(tx.amount)}</span>
                  </div>
                </Row>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: isMobile ? 'visible' : 'auto', paddingBottom: 56 }}>
          <Card style={{ background: paper2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>saldo de {S.MONTHS_FULL[Number(month.slice(5, 7)) - 1].toLowerCase()}</div>
                <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 4, color: t.balance >= 0 ? ink : red }}>{S.fmt0(t.balance)}</div>
                <div style={{ fontSize: 11.5, color: muted, marginTop: 6 }}>
                  entradas <b style={{ color: green }}>{S.fmt0(t.income)}</b> · gastos <b style={{ color: red }}>{S.fmt0(t.expenses)}</b>
                </div>
              </div>
              <Donut pct={Math.min(100, spentPct)} size={62} color={spentPct > 90 ? red : spentPct > 70 ? amber : green} />
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: muted, marginBottom: 4 }}>
                <span>usado da renda</span><span>{S.fmt0(t.expenses)} / {S.fmt0(t.income)}</span>
              </div>
              <Bar pct={spentPct} color={spentPct > 90 ? red : spentPct > 70 ? amber : green} />
              <div style={{ fontSize: 10.5, color: muted, marginTop: 6 }}>
                mês anterior: {S.fmt0(prev.balance)} · {t.balance >= prev.balance ? <span style={{ color: green, fontWeight: 700 }}>↑ melhor</span> : <span style={{ color: red, fontWeight: 700 }}>↓ pior</span>}
              </div>
            </div>
          </Card>

          <Card style={{ flex: 1, minHeight: 190, display: 'flex', flexDirection: 'column' }}>
            <CardTitle sub={`${ups.filter(u => u.urg !== 'ok').length} exigem atenção`}>Próximos vencimentos</CardTitle>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {ups.length === 0 ? <EmptyState icon="✓" title="Nada a vencer" hint="Todos os fixos do mês já estão pagos." /> :
                ups.map((u, i) => {
                  const c = u.urg === 'atrasado' || u.urg === 'urgente' ? red : u.urg === 'breve' ? amber : muted;
                  return (
                    <Row key={u.id + u.kind} last={i === ups.length - 1}>
                      <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr 54px 56px 78px', gap: 7, alignItems: 'center', padding: '7px 2px', fontSize: 12.5 }}>
                        <span style={{ color: c, fontWeight: 600, fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>● {u.when}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.desc}</span>
                        <span style={{ color: muted, fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{typeName(u.typeId)}</span>
                        <span style={{ color: muted, fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{personName(u.personId)}</span>
                        <span style={{ textAlign: 'right', fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap' }}>{S.fmt0(u.amount)}</span>
                      </div>
                    </Row>
                  );
                })}
            </div>
          </Card>

          {invoices.length > 0 && (
            <Card>
              <CardTitle sub="marque quando pagar a fatura toda">Faturas do cartão</CardTitle>
              <div>
                {invoices.map((inv, i) => (
                  <Row key={inv.type.id} last={i === invoices.length - 1}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 2px', fontSize: 12.5 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.type.name}</div>
                        <div style={{ fontSize: 10.5, color: muted, marginTop: 1 }}>{inv.count} lançamentos · vence {S.dayLabel(inv.dueDate)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: inv.paid ? muted : ink, textDecoration: inv.paid ? 'line-through' : 'none' }}>{S.fmt(inv.total)}</span>
                        <Button
                          variant={inv.paid ? 'primary' : 'outline'}
                          tone={inv.paid ? green : undefined}
                          size="sm"
                          onClick={() => actions.toggleCardInvoicePaid(inv.type.id, month)}
                        >
                          {inv.paid ? 'paga ✓' : 'marcar paga'}
                        </Button>
                      </div>
                    </div>
                  </Row>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
      <FAB onClick={onOpenModal} />
    </div>
  );
}

// ── Tela: Gastos do mês ────────────────────────────────────────────
export function GastosDoMes({ onNavigate, onOpenModal }: ScreenProps) {
  const { state, actions } = useStore();
  const isMobile = useIsMobile();
  const { month, personId } = state.ui;
  const t = S.totalsFor(state, month, personId);
  const prev = S.totalsFor(state, S.addMonths(month, -1), personId);
  const [q, setQ] = React.useState('');
  const [catFilter, setCatFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [personFilter, setPersonFilter] = React.useState('');

  const catName = (id: string) => state.categories.find(c => c.id === id)?.name || '—';
  const catColor = (id: string) => state.categories.find(c => c.id === id)?.color || muted;
  const typeName = (id: string) => state.paymentTypes.find(x => x.id === id)?.name || '—';
  const personName = (id: string) => state.people.find(p => p.id === id)?.name || '—';
  const invoiceInfo = (tx: Transaction) => S.cardInvoiceInfo(tx, state.paymentTypes.find(x => x.id === tx.typeId));

  let list = t.items.comuns;
  if (q.trim()) list = list.filter(x => x.desc.toLowerCase().includes(q.toLowerCase()));
  if (catFilter) list = list.filter(x => x.categoryId === catFilter);
  if (typeFilter) list = list.filter(x => x.typeId === typeFilter);
  if (personFilter) list = list.filter(x => x.personId === personFilter);
  const filtersActive = Boolean(q.trim() || catFilter || typeFilter || personFilter);
  const listTotal = list.reduce((s, x) => s + Number(x.amount), 0);

  const cats: Record<string, number> = {};
  t.items.comuns.forEach(x => { cats[x.categoryId] = (cats[x.categoryId] || 0) + Number(x.amount); });
  const catRows = Object.entries(cats).map(([id, v]) => ({ id, v, cat: state.categories.find(c => c.id === id) || { id, name: '—', color: muted } })).sort((a, b) => b.v - a.v);
  const delta = t.comum - prev.comum;

  return (
    <div style={{ height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '100%' : undefined, display: 'flex', flexDirection: 'column', background: paper, overflow: isMobile ? 'visible' : 'hidden' }}>
      <TopBar activeTab="Gastos do mês" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: 16, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
              <div>
                <div style={{ fontSize: 10, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>gastos avulsos de {S.monthLabel(month).toLowerCase()}</div>
                <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: '-0.025em', marginTop: 4 }}>{S.fmt(t.comum)}</div>
                <div style={{ fontSize: 11.5, color: muted, marginTop: 5 }}>{t.counts.comum} lançamentos · não inclui fixos nem parcelas</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>vs mês anterior</div>
                <div style={{ fontWeight: 700, fontSize: 17, marginTop: 4, color: delta > 0 ? red : green }}>{delta > 0 ? '↑' : '↓'} {S.fmt0(Math.abs(delta))}</div>
              </div>
            </div>
          </Card>

          <Card style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CardTitle sub="somente lançamentos do tipo Comum">Lançamentos comuns</CardTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
              <Input value={q} onChange={setQ} placeholder="buscar…" style={{ flex: '1 1 110px', minWidth: 100, padding: '6px 10px', fontSize: 12 }} />
              <Select value={catFilter} onChange={setCatFilter} options={catOptions(state)} placeholder="categoria" style={{ flex: '1 1 120px', minWidth: 110 }} />
              <Select value={typeFilter} onChange={setTypeFilter} options={typeOptions(state)} placeholder="pagamento" style={{ flex: '1 1 120px', minWidth: 110 }} />
              <Select value={personFilter} onChange={setPersonFilter} options={personOptions(state)} placeholder="pessoa" style={{ flex: '1 1 100px', minWidth: 100 }} />
              {filtersActive && (
                <Button variant="ghost" size="sm" onClick={() => { setQ(''); setCatFilter(''); setTypeFilter(''); setPersonFilter(''); }}>limpar</Button>
              )}
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {list.length === 0 ? <EmptyState icon="🔍" title="Nada encontrado" hint="Ajuste a busca ou os filtros." /> :
                list.map((tx, i) => {
                  const info = invoiceInfo(tx);
                  return (
                    <Row key={tx.id} last={i === list.length - 1} onDelete={() => actions.delTx(tx.id)}>
                      <div style={{ display: 'grid', gridTemplateColumns: '10px 1.7fr 62px 1fr 72px 66px 96px', alignItems: 'center', gap: 9, padding: '8px 26px 8px 2px', fontSize: 12.5 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 99, background: catColor(tx.categoryId) }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{tx.desc}</span>
                        <span style={{ color: muted, fontSize: 11 }}>{S.dayLabel(tx.date)}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{catName(tx.categoryId)}</span>
                        <span style={{ color: muted, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{personName(tx.personId)}</span>
                        <span style={{ color: muted, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {typeName(tx.typeId)}
                          {info && (
                            <span
                              onClick={() => actions.setInvoiceMonth(tx.id, info.overridden ? null : info.alt)}
                              title={info.overridden ? 'Fatura ajustada manualmente — clique pra voltar ao automático' : 'Essa compra caiu na fatura errada? clique pra mover'}
                              style={{ display: 'block', fontSize: 9.5, color: info.overridden ? amber : muted, cursor: 'pointer', textDecoration: 'underline', marginTop: 1 }}
                            >
                              fatura {S.monthShort(info.effective)}{info.overridden ? ' ✎' : ''}
                            </span>
                          )}
                        </span>
                        <span style={{ textAlign: 'right', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>{S.fmt(tx.amount)}</span>
                      </div>
                    </Row>
                  );
                })}
            </div>
            <div style={{ borderTop: `1.5px solid ${ink}`, marginTop: 8, paddingTop: 9, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
              <span>{list.length === t.items.comuns.length ? 'Total' : `Total filtrado (${list.length})`}</span><span>{S.fmt(listTotal)}</span>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: isMobile ? 'visible' : 'auto', paddingBottom: 56 }}>
          <Card style={{ maxHeight: 300, display: 'flex', flexDirection: 'column' }}>
            <CardTitle sub="clique para filtrar a lista">Por categoria</CardTitle>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {catRows.length === 0 ? <EmptyState icon="📊" title="Sem dados" /> : catRows.map(r => (
                <div key={r.id} onClick={() => setCatFilter(catFilter === r.id ? '' : r.id)}
                  style={{ marginBottom: 9, cursor: 'pointer', opacity: catFilter && catFilter !== r.id ? 0.45 : 1, transition: 'opacity .15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                    <span><span style={{ width: 8, height: 8, borderRadius: 99, background: r.cat.color, display: 'inline-block', marginRight: 6 }} />{r.cat.name}</span>
                    <span style={{ fontWeight: 700 }}>{S.fmt(r.v)}</span>
                  </div>
                  <Bar pct={(r.v / (catRows[0]?.v || 1)) * 100} color={r.cat.color} height={5} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle sub="comum vs fixo vs parcelas">Composição do mês</CardTitle>
            <div style={{ display: 'flex', height: 15, borderRadius: 99, overflow: 'hidden', border: `1px solid ${ink2}44` }}>
              <div style={{ flex: Math.max(t.comum, 1), background: ink, transition: 'flex .4s' }} />
              <div style={{ flex: Math.max(t.fixo, 1), background: amber, transition: 'flex .4s' }} />
              <div style={{ flex: Math.max(t.parcela, 1), background: blue, transition: 'flex .4s' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10, fontSize: 12 }}>
              {([['Comum (avulso)', t.comum, ink], ['Fixo', t.fixo, amber], ['Parcelamentos', t.parcela, blue]] as const).map(([n, v, c]) => (
                <div key={n} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><span style={{ width: 8, height: 8, borderRadius: 99, background: c, display: 'inline-block', marginRight: 6 }} />{n}</span>
                  <span style={{ fontWeight: 700 }}>{S.fmt0(v)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 11, padding: '9px 11px', background: `${blue}0f`, border: `1px dashed ${blue}66`, borderRadius: 7, fontSize: 11.5, color: ink2, lineHeight: 1.45 }}>
              Gastos avulsos são <b>{t.expenses ? Math.round((t.comum / t.expenses) * 100) : 0}%</b> do mês — o resto já está comprometido em fixos e parcelas.
            </div>
          </Card>
        </div>
      </div>
      <FAB onClick={onOpenModal} />
    </div>
  );
}

// ── Tela: Ganhos do mês ────────────────────────────────────────────
export function GanhosDoMes({ onNavigate, onOpenModal }: ScreenProps) {
  const { state, actions } = useStore();
  const isMobile = useIsMobile();
  const { month, personId } = state.ui;
  const t = S.totalsFor(state, month, personId);
  const prev = S.totalsFor(state, S.addMonths(month, -1), personId);

  const typeName = (id: string) => state.paymentTypes.find(x => x.id === id)?.name || '—';
  const personName = (id: string) => state.people.find(p => p.id === id)?.name || '—';
  const personColor = (id: string) => state.people.find(p => p.id === id)?.color || muted;

  const list = t.items.entradas;
  const delta = t.income - prev.income;

  const byKind: Record<string, number> = {};
  list.forEach(x => { const k = x.incomeKind || 'Salário'; byKind[k] = (byKind[k] || 0) + Number(x.amount); });
  const kindRows = Object.entries(byKind).sort((a, b) => b[1] - a[1]);

  const byPersonRows = state.people.map(p => ({ person: p, value: list.filter(x => x.personId === p.id).reduce((s, x) => s + Number(x.amount), 0) }));
  const maxPersonRow = Math.max(1, ...byPersonRows.map(r => r.value));

  return (
    <div style={{ height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '100%' : undefined, display: 'flex', flexDirection: 'column', background: paper, overflow: isMobile ? 'visible' : 'hidden' }}>
      <TopBar activeTab="Ganhos do mês" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: 16, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
              <div>
                <div style={{ fontSize: 10, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>ganhos de {S.monthLabel(month).toLowerCase()}</div>
                <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: '-0.025em', marginTop: 4, color: green }}>{S.fmt(t.income)}</div>
                <div style={{ fontSize: 11.5, color: muted, marginTop: 5 }}>{list.length} entradas nesse mês</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>vs mês anterior</div>
                <div style={{ fontWeight: 700, fontSize: 17, marginTop: 4, color: delta >= 0 ? green : red }}>{delta >= 0 ? '↑' : '↓'} {S.fmt0(Math.abs(delta))}</div>
              </div>
            </div>
          </Card>

          <Card style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CardTitle sub="salário, extra, freela… — clique no × para remover">Entradas do mês</CardTitle>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {list.length === 0 ? <EmptyState icon="💰" title="Nenhum ganho lançado ainda" hint="Use o card 'Lançar entrada' em Lançamentos para registrar o primeiro." /> :
                list.map((tx, i) => (
                  <Row key={tx.id} last={i === list.length - 1} onDelete={() => actions.delTx(tx.id)}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 62px 1fr 80px 72px 96px', alignItems: 'center', gap: 9, padding: '8px 26px 8px 2px', fontSize: 12.5 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{tx.desc}</span>
                      <span style={{ color: muted, fontSize: 11 }}>{S.dayLabel(tx.date)}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{personName(tx.personId)}</span>
                      <Chip color={tx.incomeKind === 'Extra' ? gold : green} style={{ fontSize: 10.5, padding: '2px 8px' }}>{tx.incomeKind || 'Salário'}</Chip>
                      <span style={{ color: muted, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{typeName(tx.typeId)}</span>
                      <span style={{ textAlign: 'right', fontWeight: 700, fontSize: 13, color: green, whiteSpace: 'nowrap' }}>{S.fmt(tx.amount)}</span>
                    </div>
                  </Row>
                ))}
            </div>
            <div style={{ borderTop: `1.5px solid ${ink}`, marginTop: 8, paddingTop: 9, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
              <span>Total</span><span style={{ color: green }}>{S.fmt(t.income)}</span>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: isMobile ? 'visible' : 'auto', paddingBottom: 56 }}>
          <Card style={{ flex: 1, minHeight: 140 }}>
            <CardTitle sub="salário vs extra">Por tipo</CardTitle>
            {kindRows.length === 0 ? <EmptyState icon="📊" title="Sem dados" /> : kindRows.map(([k, v]) => (
              <div key={k} style={{ marginBottom: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                  <span><span style={{ width: 8, height: 8, borderRadius: 99, background: k === 'Extra' ? gold : green, display: 'inline-block', marginRight: 6 }} />{k}</span>
                  <span style={{ fontWeight: 700 }}>{S.fmt(v)}</span>
                </div>
                <Bar pct={(v / (t.income || 1)) * 100} color={k === 'Extra' ? gold : green} height={5} />
              </div>
            ))}
          </Card>

          <Card>
            <CardTitle sub="quem trouxe mais esse mês">Por pessoa</CardTitle>
            {byPersonRows.map(r => (
              <div key={r.person.id} style={{ marginBottom: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span><span style={{ width: 8, height: 8, borderRadius: 99, background: personColor(r.person.id), display: 'inline-block', marginRight: 6 }} />{r.person.name}</span>
                  <span style={{ fontWeight: 700 }}>{S.fmt0(r.value)}</span>
                </div>
                <Bar pct={(r.value / maxPersonRow) * 100} color={personColor(r.person.id)} height={5} />
              </div>
            ))}
          </Card>
        </div>
      </div>
      <FAB onClick={onOpenModal} />
    </div>
  );
}

// ── Tela: Fixos ────────────────────────────────────────────────────
export function Fixos({ onNavigate, onOpenModal }: ScreenProps) {
  const { state, actions } = useStore();
  const isMobile = useIsMobile();
  const { month, personId } = state.ui;
  const t = S.totalsFor(state, month, personId);
  const [filter, setFilter] = React.useState('todos');
  const [adding, setAdding] = React.useState(false);
  const f = useTxForm('fixo');

  const catName = (id: string) => state.categories.find(c => c.id === id)?.name || '—';
  const catColor = (id: string) => state.categories.find(c => c.id === id)?.color || muted;
  const typeName = (id: string) => state.paymentTypes.find(x => x.id === id)?.name || '—';
  const personName = (id: string) => state.people.find(p => p.id === id)?.name || '—';

  const all = t.items.fixos;
  const rows = filter === 'todos' ? all : filter === 'pagos' ? all.filter(r => r.paid) : all.filter(r => !r.paid);
  const paidTotal = all.filter(r => r.paid).reduce((s, r) => s + Number(r.amount), 0);
  const openTotal = all.filter(r => !r.paid).reduce((s, r) => s + Number(r.amount), 0);

  const addFixo = () => { if (!f.valid) return; actions.addTx({ ...f.build(month), kind: 'fixo' }); f.reset(); setAdding(false); };

  const people = S.byPerson(state, month);

  return (
    <div style={{ height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '100%' : undefined, display: 'flex', flexDirection: 'column', background: paper, overflow: isMobile ? 'visible' : 'hidden' }}>
      <TopBar activeTab="Fixos" onNavigate={onNavigate} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 18px', borderBottom: `1px solid ${ink2}2a`, background: paper2, flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{S.MONTHS_FULL[Number(month.slice(5, 7)) - 1]}</span>
        <span style={{ color: muted, fontSize: 11.5 }}>{all.length} fixos · {all.filter(r => !r.paid).length} a pagar</span>
        <div style={{ flex: 1 }} />
        {['todos', 'a pagar', 'pagos'].map(x => <Chip key={x} active={filter === x} onClick={() => setFilter(x)}>{x}</Chip>)}
        <Button size="sm" variant="outline" onClick={() => setAdding(a => !a)}>{adding ? '× cancelar' : '+ novo fixo'}</Button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.65fr 1fr', gap: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: isMobile ? undefined : 0, borderRight: isMobile ? undefined : `1.5px solid ${ink}` }}>
          {adding && (
            <div style={{ padding: 12, borderBottom: `1.5px solid ${ink}`, background: `${green}0a` }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1.6fr .9fr .6fr 1fr 1fr .9fr auto', gap: 8, alignItems: 'end' }}>
                <Field label="descrição"><Input value={f.desc} onChange={f.setDesc} placeholder="Aluguel…" onEnter={addFixo} accent={green} /></Field>
                <Field label="valor"><MoneyInput value={f.amount} onChange={f.setAmount} onEnter={addFixo} /></Field>
                <Field label="dia"><Input type="number" value={f.day} onChange={f.setDay} /></Field>
                <Field label="categoria"><Select value={f.categoryId} onChange={f.setCategoryId} options={catOptions(state)} placeholder="—" /></Field>
                <Field label="pagamento"><Select value={f.typeId} onChange={f.setTypeId} options={typeOptions(state)} placeholder="—" /></Field>
                <Field label="quem"><Select value={f.personId} onChange={f.setPersonId} options={personOptions(state)} placeholder="—" /></Field>
                <Button onClick={addFixo} disabled={!f.valid} tone={green} style={{ height: 38 }}>salvar</Button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '38px 1fr 46px 82px 84px 108px 94px 34px', gap: 6, padding: '8px 12px', borderBottom: `1.5px solid ${ink}`, background: paper2, fontSize: 10.5, fontWeight: 700, color: ink2, letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>
            <span>✓</span><span>Descrição</span><span style={{ textAlign: 'center' }}>Dia</span><span>Pessoa</span><span>Pagamento</span><span>Categoria</span><span style={{ textAlign: 'right' }}>Valor</span><span />
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {rows.length === 0 ? <EmptyState icon="📋" title="Nenhum fixo aqui" hint="Ajuste o filtro ou cadastre um novo." /> :
              rows.map((r, i) => (
                <div key={r.id} style={{
                  display: 'grid', gridTemplateColumns: '38px 1fr 46px 82px 84px 108px 94px 34px', gap: 6, alignItems: 'center',
                  padding: '8px 12px', borderBottom: `1px solid ${ink2}1f`, fontSize: 12.5,
                  background: i % 2 ? '#00000005' : 'transparent', opacity: r.paid ? 0.55 : 1, transition: 'opacity .2s',
                }}>
                  <button type="button" onClick={() => actions.toggleFixoPaid(r.id, month)} title={r.paid ? 'Marcar como não pago' : 'Marcar como pago'}
                    style={{
                      width: 17, height: 17, borderRadius: 4, border: `1.5px solid ${r.paid ? green : ink2}`, cursor: 'pointer',
                      background: r.paid ? green : 'transparent', color: paper, display: 'grid', placeItems: 'center',
                      fontSize: 11, fontWeight: 800, transition: 'all .18s', padding: 0,
                    }}>{r.paid ? '✓' : ''}</button>
                  <span style={{ textDecoration: r.paid ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{r.desc}</span>
                  <span style={{ textAlign: 'center', color: muted, fontSize: 11 }}>{r.dayOfMonth}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11.5 }}>{personName(r.personId)}</span>
                  <span style={{ color: muted, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{typeName(r.typeId)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: catColor(r.categoryId), flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11.5 }}>{catName(r.categoryId)}</span>
                  </span>
                  <span style={{ textAlign: 'right', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>{S.fmt(r.amount)}</span>
                  <IconBtn onClick={() => actions.delTx(r.id)} title="Excluir fixo" tone={red} size={22}>×</IconBtn>
                </div>
              ))}
          </div>

          <div style={{ borderTop: `1.5px solid ${ink}`, padding: '10px 14px', background: paper2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: muted }}>pago <b style={{ color: green }}>{S.fmt0(paidTotal)}</b> · falta <b style={{ color: openTotal > 0 ? red : green }}>{S.fmt0(openTotal)}</b></span>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>Total {S.fmt(t.fixo)}</span>
          </div>
        </div>

        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12, overflow: isMobile ? 'visible' : 'auto', minHeight: 0, paddingBottom: 56 }}>
          <Card pad={12}>
            <CardTitle sub="progresso do mês">Pagamento dos fixos</CardTitle>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
              <span>pagos</span><span style={{ fontWeight: 700 }}>{all.filter(r => r.paid).length} / {all.length}</span>
            </div>
            <Bar pct={all.length ? (all.filter(r => r.paid).length / all.length) * 100 : 0} color={green} />
          </Card>

          <PersonSpendCard rows={people} />
        </div>
      </div>
      <FAB onClick={onOpenModal} />
    </div>
  );
}

// ── Tela: Parcelamentos ────────────────────────────────────────────
export function Parcelamentos({ onNavigate, onOpenModal }: ScreenProps) {
  const { state, actions } = useStore();
  const isMobile = useIsMobile();
  const { month, personId } = state.ui;
  const t = S.totalsFor(state, month, personId);
  const [adding, setAdding] = React.useState(false);
  const f = useTxForm('parcelamento');

  const catColor = (id: string) => state.categories.find(c => c.id === id)?.color || muted;
  const typeName = (id: string) => state.paymentTypes.find(x => x.id === id)?.name || '—';
  const personName = (id: string) => state.people.find(p => p.id === id)?.name || '—';

  const rows = t.items.parcelas;
  type ParcelaRow = typeof rows[number];
  const [editing, setEditing] = React.useState<ParcelaRow | null>(null);
  const [ef, setEf] = React.useState({ desc: '', amount: '', categoryId: '', typeId: '', personId: '', curInst: '1', totInst: '12' });

  const openEdit = (r: ParcelaRow) => {
    setEditing(r);
    setEf({ desc: r.desc, amount: String(r.amount), categoryId: r.categoryId, typeId: r.typeId, personId: r.personId, curInst: String(r.installment), totInst: String(r.totalInstallments) });
  };
  const efValid = Boolean(ef.desc.trim() && Number(ef.amount) > 0 && ef.categoryId && ef.typeId && ef.personId);
  const saveEdit = () => {
    if (!editing || !efValid) return;
    const cur = Math.max(1, Number(ef.curInst) || 1);
    const tot = Math.max(cur, Number(ef.totInst) || cur);
    actions.updateTx(editing.id, {
      desc: ef.desc.trim(), amount: Number(ef.amount), categoryId: ef.categoryId, typeId: ef.typeId, personId: ef.personId,
      totalInstallments: tot, startMonth: S.addMonths(month, -(cur - 1)),
    });
    setEditing(null);
  };
  const monthly = rows.reduce((s, r) => s + Number(r.amount), 0);
  const remaining = rows.reduce((s, r) => s + Number(r.amount) * (r.totalInstallments! - r.installment + 1), 0);
  const soonest = rows[0];

  const add = () => { if (!f.valid) return; actions.addTx({ ...f.build(month), kind: 'parcelamento' }); f.reset(); setAdding(false); };

  const perPerson = state.people.map(p => ({ person: p, value: rows.filter(r => r.personId === p.id).reduce((s, r) => s + Number(r.amount), 0) }));

  return (
    <div style={{ height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '100%' : undefined, display: 'flex', flexDirection: 'column', background: paper, overflow: isMobile ? 'visible' : 'hidden' }}>
      <TopBar activeTab="Parcelamentos" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: 16, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 10 }}>
            <Card pad={12}>
              <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>compromisso mensal</div>
              <div style={{ fontWeight: 800, fontSize: 23, letterSpacing: '-0.025em', marginTop: 4 }}>{S.fmt0(monthly)}</div>
              <div style={{ fontSize: 10.5, color: muted, marginTop: 3 }}>{rows.length} ativos</div>
            </Card>
            <Card pad={12}>
              <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>ainda falta pagar</div>
              <div style={{ fontWeight: 800, fontSize: 23, letterSpacing: '-0.025em', marginTop: 4, color: amber }}>{S.fmt0(remaining)}</div>
              <div style={{ fontSize: 10.5, color: muted, marginTop: 3 }}>somando todas as parcelas</div>
            </Card>
            <Card pad={12}>
              <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>quita primeiro</div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{soonest ? soonest.desc : '—'}</div>
              <div style={{ fontSize: 10.5, color: green, marginTop: 3, fontWeight: 600 }}>{soonest ? `faltam ${soonest.totalInstallments! - soonest.installment}x` : ''}</div>
            </Card>
          </div>

          <Card style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CardTitle sub="ordenado por quem termina primeiro"
              right={<Button size="sm" variant="outline" onClick={() => setAdding(a => !a)}>{adding ? '× cancelar' : '+ novo'}</Button>}>Parcelamentos ativos</CardTitle>

            {adding && (
              <div style={{ padding: 12, marginBottom: 10, border: `1.5px solid ${green}`, borderRadius: 9, background: `${green}0a` }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1.6fr .9fr 1fr 1fr .9fr auto', gap: 8, alignItems: 'end' }}>
                  <Field label="descrição"><Input value={f.desc} onChange={f.setDesc} placeholder="iPhone 15…" onEnter={add} accent={green} /></Field>
                  <Field label="valor da parcela"><MoneyInput value={f.amount} onChange={f.setAmount} onEnter={add} /></Field>
                  <Field label="categoria"><Select value={f.categoryId} onChange={f.setCategoryId} options={catOptions(state)} placeholder="—" /></Field>
                  <Field label="pagamento"><Select value={f.typeId} onChange={f.setTypeId} options={typeOptions(state)} placeholder="—" /></Field>
                  <Field label="quem"><Select value={f.personId} onChange={f.setPersonId} options={personOptions(state)} placeholder="—" /></Field>
                  <Button onClick={add} disabled={!f.valid} tone={green} style={{ height: 38 }}>salvar</Button>
                </div>
                <div style={{ marginTop: 10 }}><KindExtraFields f={{ ...f, kind: 'parcelamento' }} /></div>
              </div>
            )}

            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rows.length === 0 ? <EmptyState icon="💳" title="Nenhum parcelamento ativo" hint="Cadastre um parcelamento e informe qual parcela você está pagando." /> :
                rows.map(r => {
                  const pct = (r.installment / r.totalInstallments!) * 100;
                  const left = r.totalInstallments! - r.installment;
                  const color = catColor(r.categoryId);
                  return (
                    <div key={r.id} style={{ padding: '10px 12px', border: `1.4px solid ${color}55`, borderRadius: 9, background: `${color}0a`, position: 'relative' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 86px 96px 56px', gap: 10, alignItems: 'center' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                            <span style={{ width: 8, height: 8, borderRadius: 99, background: color, flexShrink: 0 }} />
                            <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.01em' }}>{r.desc}</span>
                            <span style={{ fontSize: 10.5, color: muted }}>{personName(r.personId)} · {typeName(r.typeId)}</span>
                            {left === 0 && <span style={{ padding: '1px 7px', background: green, color: paper, borderRadius: 99, fontSize: 9, fontWeight: 800, letterSpacing: '0.05em' }}>ÚLTIMA</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7 }}>
                            <div style={{ flex: 1 }}><Bar pct={pct} color={color} height={5} /></div>
                            <span style={{ fontSize: 11, color: muted, whiteSpace: 'nowrap', fontWeight: 600 }}>{r.installment}/{r.totalInstallments}x</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', borderLeft: `1px dashed ${ink2}33`, paddingLeft: 10 }}>
                          <div style={{ fontSize: 9, color: muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>parcela</div>
                          <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>{S.fmt0(r.amount)}</div>
                        </div>
                        <div style={{ textAlign: 'right', borderLeft: `1px dashed ${ink2}33`, paddingLeft: 10 }}>
                          <div style={{ fontSize: 9, color: muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>falta</div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: amber, whiteSpace: 'nowrap' }}>{S.fmt0(r.amount * (r.totalInstallments! - r.installment))}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <IconBtn onClick={() => openEdit(r)} title="Editar" size={22}>✏️</IconBtn>
                          <IconBtn onClick={() => actions.delTx(r.id)} title="Excluir" tone={red} size={22}>×</IconBtn>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: isMobile ? 'visible' : 'auto', paddingBottom: 56 }}>
          <Card pad={12} style={{ maxHeight: 260, display: 'flex', flexDirection: 'column' }}>
            <CardTitle sub="quando cada um termina">Linha de chegada</CardTitle>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {rows.length === 0 ? <EmptyState icon="🏁" title="Nada em andamento" /> :
                rows.map((r, i) => {
                  const left = r.totalInstallments! - r.installment;
                  return (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < rows.length - 1 ? `1px dashed ${ink2}33` : 'none', fontSize: 12 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 99, background: catColor(r.categoryId), display: 'inline-block', marginRight: 6 }} />{r.desc}
                      </span>
                      <span style={{ color: left <= 1 ? green : muted, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {left === 0 ? 'acaba agora' : `+${left}x · ${S.monthShort(S.addMonths(month, left))}`}
                      </span>
                    </div>
                  );
                })}
            </div>
          </Card>

          <PersonSpendCard rows={perPerson} sub="compromisso mensal" />
        </div>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar parcelamento" width={480}
        footer={<>
          <Button variant="ghost" onClick={() => setEditing(null)}>cancelar</Button>
          <Button onClick={saveEdit} disabled={!efValid} tone={green}>salvar alterações</Button>
        </>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="descrição" style={{ gridColumn: '1 / -1' }}>
            <Input value={ef.desc} onChange={v => setEf(s => ({ ...s, desc: v }))} placeholder="iPhone 15…" accent={green} />
          </Field>
          <Field label="valor da parcela">
            <MoneyInput value={ef.amount} onChange={v => setEf(s => ({ ...s, amount: v }))} />
          </Field>
          <Field label="categoria">
            <Select value={ef.categoryId} onChange={v => setEf(s => ({ ...s, categoryId: v }))} options={catOptions(state)} placeholder="—" />
          </Field>
          <Field label="forma de pagamento">
            <Select value={ef.typeId} onChange={v => setEf(s => ({ ...s, typeId: v }))} options={typeOptions(state)} placeholder="—" />
          </Field>
          <Field label="quem">
            <Select value={ef.personId} onChange={v => setEf(s => ({ ...s, personId: v }))} options={personOptions(state)} placeholder="—" />
          </Field>
          <div style={{ padding: '10px 12px', border: `1.6px solid ${green}`, borderRadius: 9, background: `${green}0e`, gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 10.5, color: green, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 7 }}>
              qual parcela está pagando agora?
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Input type="number" min="1" value={ef.curInst} onChange={v => setEf(s => ({ ...s, curInst: v }))} accent={green} style={{ textAlign: 'center', fontWeight: 700, fontSize: 16 }} />
              <span style={{ color: ink2, fontWeight: 600, fontSize: 12 }}>de</span>
              <Input type="number" min="1" value={ef.totInst} onChange={v => setEf(s => ({ ...s, totInst: v }))} accent={green} style={{ textAlign: 'center', fontWeight: 700, fontSize: 16 }} />
            </div>
          </div>
        </div>
      </Modal>

      <FAB onClick={onOpenModal} />
    </div>
  );
}
