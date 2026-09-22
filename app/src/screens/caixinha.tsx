import React from 'react';
import * as S from '../lib/store';
import { useStore } from '../lib/store';
import {
  Button, Field, Input, MoneyInput, Card, CardTitle, EmptyState, Row, KindSwitch,
  TopBar, IconBtn, FAB, tokens,
} from '../components/ui';
import type { Caixinha } from '../lib/types';

const { ink, ink2, muted, paper, paper2, green, red } = tokens;

interface ScreenProps {
  onNavigate: (tab: string) => void;
  onOpenModal: () => void;
}

const JAR_COLORS = ['#2f5a48', '#3a6a8a', '#c97a3a', '#7a6ca8', '#b04a3a', '#5a8a9a', '#8a9a5a', '#c79bb0'];
const jarColor = (id: string) => JAR_COLORS[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % JAR_COLORS.length];

// ── Grade: todas as caixinhas ────────────────────────────────────────
function CaixinhaGrid({ onOpen, onNavigate, onOpenModal }: { onOpen: (id: string) => void; onNavigate: (tab: string) => void; onOpenModal: () => void }) {
  const { state, actions } = useStore();
  const [adding, setAdding] = React.useState(false);
  const [name, setName] = React.useState('');

  const balanceOf = (id: string) => state.caixinhaMovements.filter(m => m.caixinhaId === id).reduce((s, m) => s + Number(m.amount), 0);

  const create = () => {
    if (!name.trim()) return;
    const id = actions.createCaixinha(name.trim());
    setName(''); setAdding(false);
    if (id) onOpen(id);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: paper, overflow: 'hidden' }}>
      <TopBar activeTab="Caixinha" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 4 }}>Caixinhas</div>
        <div style={{ fontSize: 12.5, color: muted, marginBottom: 18 }}>Reservas separadas do saldo do mês — clique numa pra ver os detalhes e movimentar.</div>

        {state.caixinhas.length === 0 && !adding ? (
          <EmptyState icon="🐷" title="Nenhuma caixinha ainda" hint="Crie uma pra guardar dinheiro à parte, com uma descrição do que é." action={<Button tone={green} onClick={() => setAdding(true)}>+ criar caixinha</Button>} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {state.caixinhas.map(c => {
              const bal = balanceOf(c.id);
              const color = jarColor(c.id);
              return (
                <div key={c.id} onClick={() => onOpen(c.id)} style={{
                  cursor: 'pointer', padding: 16, borderRadius: 13, border: `1.6px solid ${color}`,
                  background: `${color}0e`, position: 'relative', transition: 'transform .12s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <span onClick={e => { e.stopPropagation(); actions.delCaixinha(c.id); }} title="Remover"
                    style={{ position: 'absolute', top: 10, right: 10, opacity: 0.5, cursor: 'pointer', fontSize: 15 }}>×</span>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>🐷</div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: '-0.01em', paddingRight: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description || 'Sem nome'}</div>
                  <div style={{ fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em', color, marginTop: 6 }}>{S.fmt(bal)}</div>
                </div>
              );
            })}

            {adding ? (
              <div style={{ padding: 16, borderRadius: 13, border: `1.6px dashed ${ink2}`, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                <Input value={name} onChange={setName} placeholder="Nome da caixinha…" onEnter={create} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button size="sm" tone={green} onClick={create} disabled={!name.trim()}>criar</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setName(''); }}>cancelar</Button>
                </div>
              </div>
            ) : (
              <div onClick={() => setAdding(true)} style={{
                cursor: 'pointer', padding: 16, borderRadius: 13, border: `1.6px dashed ${ink2}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: muted, minHeight: 110,
              }}>
                <span style={{ fontSize: 22 }}>+</span>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>nova caixinha</span>
              </div>
            )}
          </div>
        )}
      </div>
      <FAB onClick={onOpenModal} />
    </div>
  );
}

// ── Detalhe de uma caixinha ───────────────────────────────────────────
function CaixinhaDetail({ caixinha, onBack, onOpenModal }: { caixinha: Caixinha; onBack: () => void; onOpenModal: () => void }) {
  const { state, actions } = useStore();
  const { month } = state.ui;

  const [editingDesc, setEditingDesc] = React.useState(false);
  const [descDraft, setDescDraft] = React.useState('');
  const [kind, setKind] = React.useState<'aporte' | 'retirada'>('aporte');
  const [amount, setAmount] = React.useState('');
  const [note, setNote] = React.useState('');
  const [date, setDate] = React.useState(() => S.todayISO());

  const movements = state.caixinhaMovements.filter(m => m.caixinhaId === caixinha.id);
  const balance = movements.reduce((s, m) => s + Number(m.amount), 0);
  const monthMovs = movements.filter(m => S.monthOf(m.date) === month).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const monthIn = monthMovs.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0);
  const monthOut = monthMovs.filter(m => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0);
  const color = jarColor(caixinha.id);

  const saveDesc = () => { actions.updateCaixinhaDescription(caixinha.id, descDraft.trim()); setEditingDesc(false); };
  const add = () => {
    if (!(Number(amount) > 0)) return;
    const signed = kind === 'aporte' ? Number(amount) : -Number(amount);
    actions.addCaixinhaMovement({ caixinhaId: caixinha.id, amount: signed, description: note.trim(), date });
    setAmount(''); setNote('');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: paper, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: `1.5px solid ${ink}`, flexShrink: 0 }}>
        <IconBtn onClick={onBack} title="Voltar pras caixinhas">←</IconBtn>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em' }}>Caixinha</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <Card style={{ background: color, color: paper, border: `1.5px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 10, opacity: 0.75, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>saldo da caixinha</div>
                <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em', marginTop: 4 }}>{S.fmt(balance)}</div>
                {editingDesc ? (
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, maxWidth: 400 }}>
                    <Input value={descDraft} onChange={setDescDraft} onEnter={saveDesc} style={{ background: paper, fontSize: 12.5 }} />
                    <Button size="sm" tone={green} onClick={saveDesc}>salvar</Button>
                    <Button size="sm" variant="ghost" style={{ color: paper }} onClick={() => setEditingDesc(false)}>cancelar</Button>
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {caixinha.description || 'sem descrição'}
                    <span onClick={() => { setDescDraft(caixinha.description); setEditingDesc(true); }} style={{ cursor: 'pointer', opacity: 0.85 }} title="Editar descrição">✏️</span>
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

export function CaixinhaScreen({ onNavigate, onOpenModal }: ScreenProps) {
  const { state } = useStore();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = state.caixinhas.find(c => c.id === selectedId) || null;

  if (selected) return <CaixinhaDetail caixinha={selected} onBack={() => setSelectedId(null)} onOpenModal={onOpenModal} />;
  return <CaixinhaGrid onOpen={setSelectedId} onNavigate={onNavigate} onOpenModal={onOpenModal} />;
}
