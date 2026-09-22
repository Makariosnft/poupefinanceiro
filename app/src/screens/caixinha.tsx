import React from 'react';
import * as S from '../lib/store';
import { useStore } from '../lib/store';
import {
  Button, IconBtn, Field, Input, MoneyInput, Card, CardTitle, EmptyState, Row, KindSwitch,
  TopBar, FAB, Modal, tokens,
} from '../components/ui';

const { ink2, muted, paper, paper2, green, red } = tokens;

interface ScreenProps {
  onNavigate: (tab: string) => void;
  onOpenModal: () => void;
}

const JAR_COLORS = ['#2f5a48', '#3a6a8a', '#c97a3a', '#7a6ca8', '#b04a3a', '#5a8a9a', '#8a9a5a', '#c79bb0'];
const jarColor = (id: string) => JAR_COLORS[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % JAR_COLORS.length];

export function CaixinhaScreen({ onNavigate, onOpenModal }: ScreenProps) {
  const { state, actions } = useStore();
  const { month } = state.ui;

  const caixinhas = state.caixinhas;
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const active = caixinhas.find(c => c.id === activeId) || caixinhas[0];

  const [addOpen, setAddOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [editingDesc, setEditingDesc] = React.useState(false);
  const [descDraft, setDescDraft] = React.useState('');
  const [kind, setKind] = React.useState<'aporte' | 'retirada'>('aporte');
  const [amount, setAmount] = React.useState('');
  const [note, setNote] = React.useState('');
  const [date, setDate] = React.useState(() => S.todayISO());

  const balanceOf = (id: string) => state.caixinhaMovements.filter(m => m.caixinhaId === id).reduce((s, m) => s + Number(m.amount), 0);

  const openAdd = () => { setNewName(''); setAddOpen(true); };
  const doAdd = () => {
    if (!newName.trim()) return;
    const id = actions.createCaixinha(newName.trim());
    setAddOpen(false);
    if (id) setActiveId(id);
  };

  const movements = active ? state.caixinhaMovements.filter(m => m.caixinhaId === active.id) : [];
  const balance = movements.reduce((s, m) => s + Number(m.amount), 0);
  const monthMovs = movements.filter(m => S.monthOf(m.date) === month).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const monthIn = monthMovs.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0);
  const monthOut = monthMovs.filter(m => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0);

  const saveDesc = () => { if (!active) return; actions.updateCaixinhaDescription(active.id, descDraft.trim()); setEditingDesc(false); };
  const addMov = () => {
    if (!active || !(Number(amount) > 0)) return;
    const signed = kind === 'aporte' ? Number(amount) : -Number(amount);
    actions.addCaixinhaMovement({ caixinhaId: active.id, amount: signed, description: note.trim(), date });
    setAmount(''); setNote('');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: paper, overflow: 'hidden' }}>
      <TopBar activeTab="Caixinha" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '200px 1fr 290px', gap: 13, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minHeight: 0, overflow: 'auto' }}>
          <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '2px 2px' }}>suas caixinhas</div>
          {caixinhas.map(c => {
            const on = c.id === (active && active.id);
            const color = jarColor(c.id);
            return (
              <div key={c.id} onClick={() => setActiveId(c.id)}
                style={{ padding: 11, border: `${on ? 1.8 : 1.4}px solid ${on ? color : ink2 + '3a'}`, borderRadius: 10, background: on ? `${color}0e` : paper, cursor: 'pointer', transition: 'all .15s', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: color, color: paper, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{(c.description || '?')[0].toUpperCase()}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12.5, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description || 'Sem nome'}</div>
                    <div style={{ fontSize: 10.5, color: muted, marginTop: 1 }}>{S.fmt0(balanceOf(c.id))}</div>
                  </div>
                  <IconBtn onClick={e => { e.stopPropagation(); actions.delCaixinha(c.id); if (activeId === c.id) setActiveId(null); }} title="Remover" tone={red} size={20}>×</IconBtn>
                </div>
              </div>
            );
          })}
          <Button variant="dashed" full onClick={openAdd}>+ nova caixinha</Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, minHeight: 0, overflow: 'auto' }}>
          {!active ? <EmptyState icon="◯" title="Nenhuma caixinha ainda" hint="Crie uma pra guardar dinheiro à parte, com uma descrição do que é." action={<Button tone={green} onClick={openAdd}>criar caixinha</Button>} /> : <>
            <Card style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>saldo da caixinha</div>
                  <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: '-0.025em', marginTop: 4 }}>{S.fmt(balance)}</div>
                  {editingDesc ? (
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, maxWidth: 400 }}>
                      <Input value={descDraft} onChange={setDescDraft} onEnter={saveDesc} />
                      <Button size="sm" tone={green} onClick={saveDesc}>salvar</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingDesc(false)}>cancelar</Button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12.5, color: muted, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {active.description || 'sem descrição'}
                      <span onClick={() => { setDescDraft(active.description); setEditingDesc(true); }} style={{ cursor: 'pointer' }} title="Editar descrição">✏️</span>
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
                <Field label="valor"><MoneyInput value={amount} onChange={setAmount} onEnter={addMov} accent={kind === 'aporte' ? green : red} /></Field>
                <Field label="descrição (opcional)"><Input value={note} onChange={setNote} placeholder="do que se trata…" onEnter={addMov} /></Field>
                <Field label="data"><Input type="date" value={date} onChange={setDate} /></Field>
                <Button onClick={addMov} disabled={!(Number(amount) > 0)} tone={kind === 'aporte' ? green : red} style={{ height: 38 }}>
                  {kind === 'aporte' ? '+ aportar' : '− retirar'}
                </Button>
              </div>
            </Card>

            <Card style={{ flex: 1, minHeight: 170, display: 'flex', flexDirection: 'column' }}>
              <CardTitle sub={`${monthMovs.length} movimentos em ${S.monthLabel(month).toLowerCase()}`}>Movimentos do mês</CardTitle>
              <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                {monthMovs.length === 0 ? (
                  <EmptyState icon="◯" title="Nada ainda esse mês" hint="Use o formulário acima para aportar ou retirar." />
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
          </>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, minHeight: 0, overflow: 'auto' }}>
          {active && <>
            <Card pad={12} style={{ flexShrink: 0 }}>
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
                {movements.length === 0 ? <EmptyState icon="◯" title="Ainda sem movimentos" /> :
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
          </>}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Nova caixinha" width={380}
        footer={<><Button variant="ghost" onClick={() => setAddOpen(false)}>cancelar</Button><Button tone={green} onClick={doAdd} disabled={!newName.trim()}>criar caixinha</Button></>}>
        <Field label="nome"><Input value={newName} onChange={setNewName} placeholder="Viagem, emergência…" onEnter={doAdd} accent={green} /></Field>
      </Modal>

      <FAB onClick={onOpenModal} />
    </div>
  );
}
