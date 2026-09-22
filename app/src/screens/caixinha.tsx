import React from 'react';
import * as S from '../lib/store';
import { useStore } from '../lib/store';
import {
  Button, Field, Input, MoneyInput, Card, CardTitle, EmptyState, Row, KindSwitch,
  TopBar, FAB, tokens,
} from '../components/ui';

const { ink, ink2, muted, paper, paper2, green, red } = tokens;

interface ScreenProps {
  onNavigate: (tab: string) => void;
  onOpenModal: () => void;
}

function CreateCaixinha() {
  const { actions } = useStore();
  const [desc, setDesc] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const create = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    await actions.createCaixinha(desc.trim());
    setLoading(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 28, textAlign: 'center', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ fontSize: 40 }}>🐷</div>
      <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>Crie sua caixinha</div>
      <div style={{ fontSize: 13, color: muted, maxWidth: 380, lineHeight: 1.5 }}>
        Um lugar pra guardar dinheiro à parte — aporte ou retire qualquer valor quando quiser. Diga pra que serve essa reserva.
      </div>
      <div style={{ width: '100%', maxWidth: 340 }}>
        <Input value={desc} onChange={setDesc} placeholder="Ex: viagem de fim de ano, emergência…" onEnter={create} />
      </div>
      <Button onClick={create} disabled={loading || !desc.trim()} tone={green}>{loading ? 'criando…' : 'Criar caixinha →'}</Button>
    </div>
  );
}

export function CaixinhaScreen({ onNavigate, onOpenModal }: ScreenProps) {
  const { state, actions } = useStore();
  const { month } = state.ui;

  const [editingDesc, setEditingDesc] = React.useState(false);
  const [descDraft, setDescDraft] = React.useState('');
  const [kind, setKind] = React.useState<'aporte' | 'retirada'>('aporte');
  const [amount, setAmount] = React.useState('');
  const [note, setNote] = React.useState('');
  const [date, setDate] = React.useState(() => S.todayISO());

  const movements = state.caixinhaMovements;
  const balance = movements.reduce((s, m) => s + Number(m.amount), 0);
  const monthMovs = movements.filter(m => S.monthOf(m.date) === month).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const monthIn = monthMovs.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0);
  const monthOut = monthMovs.filter(m => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0);

  if (!state.caixinha) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: paper, overflow: 'hidden' }}>
        <TopBar activeTab="Caixinha" onNavigate={onNavigate} />
        <div style={{ flex: 1, minHeight: 0 }}><CreateCaixinha /></div>
      </div>
    );
  }

  const saveDesc = () => {
    if (!state.caixinha) return;
    actions.updateCaixinhaDescription(state.caixinha.id, descDraft.trim());
    setEditingDesc(false);
  };

  const add = () => {
    if (!state.caixinha || !(Number(amount) > 0)) return;
    const signed = kind === 'aporte' ? Number(amount) : -Number(amount);
    actions.addCaixinhaMovement({ caixinhaId: state.caixinha.id, amount: signed, description: note.trim(), date });
    setAmount(''); setNote('');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: paper, overflow: 'hidden' }}>
      <TopBar activeTab="Caixinha" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <Card style={{ background: ink, color: paper, border: `1.5px solid ${ink}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>saldo da caixinha</div>
                <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em', marginTop: 4 }}>{S.fmt(balance)}</div>
                {editingDesc ? (
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, maxWidth: 400 }}>
                    <Input value={descDraft} onChange={setDescDraft} onEnter={saveDesc} style={{ background: paper, fontSize: 12.5 }} />
                    <Button size="sm" tone={green} onClick={saveDesc}>salvar</Button>
                    <Button size="sm" variant="ghost" style={{ color: paper }} onClick={() => setEditingDesc(false)}>cancelar</Button>
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {state.caixinha.description || 'sem descrição'}
                    <span onClick={() => { setDescDraft(state.caixinha!.description); setEditingDesc(true); }} style={{ cursor: 'pointer', opacity: 0.7 }} title="Editar descrição">✏️</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle sub="qualquer valor, a qualquer momento" right={<KindSwitch value={kind} onChange={v => setKind(v as 'aporte' | 'retirada')} size="md" options={[
              { key: 'aporte', label: 'Aportar', icon: '↑' }, { key: 'retirada', label: 'Retirar', icon: '↓' },
            ]} />}>Movimentar</CardTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr auto', gap: 8, alignItems: 'end' }}>
              <Field label="valor"><MoneyInput value={amount} onChange={setAmount} onEnter={add} accent={kind === 'aporte' ? green : red} /></Field>
              <Field label="descrição (opcional)"><Input value={note} onChange={setNote} placeholder="do que se trata…" onEnter={add} /></Field>
              <Field label="data"><Input type="date" value={date} onChange={setDate} /></Field>
              <Button onClick={add} disabled={!(Number(amount) > 0)} tone={kind === 'aporte' ? green : red} style={{ height: 38 }}>
                {kind === 'aporte' ? '+ aportar' : '− retirar'}
              </Button>
            </div>
          </Card>

          <Card style={{ flex: 1, minHeight: 200, display: 'flex', flexDirection: 'column' }}>
            <CardTitle sub={`${monthMovs.length} movimentos em ${S.monthLabel(month).toLowerCase()}`}>Movimentos do mês</CardTitle>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {monthMovs.length === 0 ? (
                <EmptyState icon="🐷" title="Nada ainda esse mês" hint="Use o formulário acima para aportar ou retirar." />
              ) : monthMovs.map((m, i) => (
                <Row key={m.id} last={i === monthMovs.length - 1} onDelete={() => actions.delCaixinhaMovement(m.id)}>
                  <div style={{ display: 'grid', gridTemplateColumns: '10px 1fr 62px 96px', alignItems: 'center', gap: 9, padding: '8px 26px 8px 2px', fontSize: 12.5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: m.amount >= 0 ? green : red }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{m.description || (m.amount >= 0 ? 'Aporte' : 'Retirada')}</span>
                    <span style={{ color: muted, fontSize: 11 }}>{S.dayLabel(m.date)}</span>
                    <span style={{ textAlign: 'right', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', color: m.amount >= 0 ? green : red }}>
                      {m.amount >= 0 ? '+' : '−'} {S.fmt(Math.abs(m.amount))}
                    </span>
                  </div>
                </Row>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'auto', paddingBottom: 56 }}>
          <Card pad={12}>
            <CardTitle sub={S.monthLabel(month)}>Resumo do mês</CardTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              <div style={{ padding: 9, border: `1.3px solid ${ink2}2a`, borderRadius: 8, background: paper2 }}>
                <div style={{ fontSize: 9, color: muted, letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 700 }}>aportado</div>
                <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: green, marginTop: 3 }}>{S.fmt(monthIn)}</div>
              </div>
              <div style={{ padding: 9, border: `1.3px solid ${ink2}2a`, borderRadius: 8, background: paper2 }}>
                <div style={{ fontSize: 9, color: muted, letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 700 }}>retirado</div>
                <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: red, marginTop: 3 }}>{S.fmt(monthOut)}</div>
              </div>
            </div>
          </Card>

          <Card pad={12} style={{ flex: 1, minHeight: 170, display: 'flex', flexDirection: 'column' }}>
            <CardTitle sub="todo o histórico">Todos os movimentos</CardTitle>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {movements.length === 0 ? <EmptyState icon="🐷" title="Ainda sem movimentos" /> :
                [...movements].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map((m, i, arr) => (
                  <Row key={m.id} last={i === arr.length - 1}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8, padding: '7px 2px', fontSize: 12 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.description || (m.amount >= 0 ? 'Aporte' : 'Retirada')}
                        <span style={{ color: muted, fontSize: 10, marginLeft: 6 }}>{S.dayLabel(m.date)}</span>
                      </span>
                      <span style={{ fontWeight: 700, whiteSpace: 'nowrap', color: m.amount >= 0 ? green : red }}>{m.amount >= 0 ? '+' : '−'} {S.fmt(Math.abs(m.amount))}</span>
                    </div>
                  </Row>
                ))}
            </div>
          </Card>
        </div>
      </div>
      <FAB onClick={onOpenModal} />
    </div>
  );
}
