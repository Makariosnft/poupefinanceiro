import React from 'react';
import * as S from '../lib/store';
import { useStore } from '../lib/store';
import {
  Button, IconBtn, Field, Input, MoneyInput, Select, Chip, Card, CardTitle, Bar,
  KindSwitch, TopBar, FAB, EmptyState, Row, Modal, PersonSpendCard, tokens,
} from '../components/ui';
import type { Debt, Goal } from '../lib/types';

const { ink, ink2, muted, paper, green, red, amber, blue, gold } = tokens;

function AIBadge({ small }: { small?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: small ? '2px 7px' : '3px 9px',
      background: blue, color: paper, borderRadius: 99, fontSize: small ? 9 : 10,
      fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      <svg width="9" height="9" viewBox="0 0 12 12"><path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="currentColor" /></svg>IA
    </span>
  );
}

// ── Medidor de nota (tudo proporcional a `size`) ───────────────────
function ScoreGauge({ value = 0, size = 210 }: { value?: number; size?: number }) {
  const u = size / 220;
  const r = size / 2 - 14 * u, cx = size / 2, cy = size / 2 + 10 * u;
  const start = Math.PI, arcLen = Math.PI;
  const [v, setV] = React.useState(0);
  React.useEffect(() => { const t = setTimeout(() => setV(value), 60); return () => clearTimeout(t); }, [value]);
  const arc = (a1: number, a2: number) => {
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    return `M ${x1} ${y1} A ${r} ${r} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${x2} ${y2}`;
  };
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const a = start + arcLen * (i / 10), big = i % 5 === 0;
    ticks.push(<line key={i} x1={cx + (r + 4 * u) * Math.cos(a)} y1={cy + (r + 4 * u) * Math.sin(a)}
      x2={cx + (r - 4 * u) * Math.cos(a)} y2={cy + (r - 4 * u) * Math.sin(a)}
      stroke={ink2} strokeWidth={(big ? 1.5 : 0.8) * u} opacity={big ? 1 : 0.45} />);
  }
  const zone = value < 4 ? red : value < 7 ? amber : green;
  return (
    <svg width={size} height={size / 2 + 30 * u} viewBox={`0 0 ${size} ${size / 2 + 30 * u}`}>
      <path d={arc(start, start + arcLen)} stroke="#00000015" strokeWidth={14 * u} fill="none" strokeLinecap="round" />
      <path d={arc(start, start + arcLen * (Math.max(0.001, v) / 10))} stroke={zone} strokeWidth={14 * u} fill="none" strokeLinecap="round"
        style={{ transition: 'd .7s' }} />
      {ticks}
      <text x={cx} y={cy - 8 * u} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize={56 * u} fill={ink} letterSpacing={-2 * u}>
        {value.toFixed(1)}
      </text>
      <text x={cx} y={cy + 14 * u} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="500" fontSize={11 * u} fill={muted} letterSpacing={1 * u}>/ 10</text>
    </svg>
  );
}

interface Priority { tag: string; color: string; title: string; body: string; impact: string; }

// ── Prioridades geradas a partir dos dados ─────────────────────────
function buildPriorities(h: ReturnType<typeof S.healthScore>, state: ReturnType<typeof useStore>['state'], month: string): Priority[] {
  const out: Priority[] = [];
  const inc = h.totals.income || 1;
  const cats = S.byCategory(state, month);
  if (h.reserveMonths < 3) {
    const need = h.totals.expenses * 3 - (state.goals.find(g => /reserva/i.test(g.name)) || { current: 0 }).current;
    out.push({
      tag: 'urgente', color: red, title: 'Aumente a reserva para 3 meses de gastos',
      body: `Hoje a reserva cobre ${h.reserveMonths.toFixed(1)} mês. Faltam ${S.fmt0(Math.max(0, need))} para chegar em 3 meses de tranquilidade.`,
      impact: `+${Math.min(2, (3 - h.reserveMonths) * 0.6).toFixed(1)} pts`,
    });
  }
  const highRate = [...state.debts].filter(d => d.total - d.paid > 0).sort((a, b) => b.rate - a.rate)[0];
  if (highRate && highRate.rate > 5) {
    out.push({
      tag: 'esse mês', color: amber, title: `Ataque a dívida mais cara: ${highRate.name}`,
      body: `Ela cobra ${highRate.rate}% ao mês sobre ${S.fmt0(highRate.total - highRate.paid)}. Priorizar essa dívida economiza mais que qualquer corte de gasto.`,
      impact: '+0.8 pts',
    });
  }
  if (cats[0]) {
    out.push({
      tag: 'observe', color: muted, title: `"${cats[0].cat.name}" é seu maior gasto`,
      body: `Foram ${S.fmt0(cats[0].value)} nesse mês — ${Math.round((cats[0].value / (h.totals.expenses || 1)) * 100)}% de tudo que saiu. Defina um teto e revise semanalmente.`,
      impact: '+0.4 pts',
    });
  }
  if (h.savingsRate < 0.1) {
    out.push({
      tag: 'urgente', color: red, title: 'Sua taxa de poupança está baixa',
      body: `Você guardou ${Math.round(h.savingsRate * 100)}% da renda. O ideal é pelo menos 15% — isso seria ${S.fmt0(inc * 0.15)} por mês.`,
      impact: '+1.0 pt',
    });
  }
  if (!out.length) out.push({ tag: 'parabéns', color: green, title: 'Tudo sob controle esse mês', body: 'Nenhum alerta crítico. Continue no ritmo e considere aumentar os aportes nas metas.', impact: 'manter' });
  return out.slice(0, 3);
}

interface ScreenProps {
  onNavigate: (tab: string) => void;
  onOpenModal: () => void;
}

// ── Ícone de meta: presets + campo livre (colar/digitar qualquer emoji) + nenhum ─
const GOAL_EMOJIS = ['🎯', '🏠', '✈️', '🚗', '🛟', '💍', '🎓', '💻', '🏖️', '🎮', '📷', '🐶', '👶', '🏥', '🎁', '💰', '🏦', '⛽', '📱', '🚲'];

function GoalIconField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="ícone">
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        <Chip active={value === ''} color={muted} onClick={() => onChange('')} style={{ fontSize: 12, padding: '5px 10px' }}>nenhum</Chip>
        {GOAL_EMOJIS.map(e => (
          <Chip key={e} active={value === e} color={green} onClick={() => onChange(e)} style={{ fontSize: 16, padding: '5px 10px' }}>{e}</Chip>
        ))}
      </div>
      <Input value={value} onChange={onChange} placeholder="ou cole/digite seu próprio emoji…" />
    </Field>
  );
}

// ── Tela: Diagnóstico ──────────────────────────────────────────────
export function Diagnostico({ onNavigate, onOpenModal }: ScreenProps) {
  const { state } = useStore();
  const month = state.ui.month;
  const h = React.useMemo(() => S.healthScore(state, month), [state, month]);
  const hist = React.useMemo(() => S.scoreHistory(state, month, 6), [state, month]);
  const prios = React.useMemo(() => buildPriorities(h, state, month), [h, state, month]);
  const prevScore = hist.length > 1 ? hist[hist.length - 2].value : h.score;
  const delta = h.score - prevScore;

  const sw = 270, sh = 58;
  const pts = hist.map((x, i) => [(i / Math.max(1, hist.length - 1)) * sw, sh - (x.value / 10) * sh]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: paper, overflow: 'hidden' }}>
      <TopBar activeTab="Diagnóstico" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 16, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'auto' }}>
          <Card pad={0} style={{ overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', alignItems: 'center' }}>
              <div style={{ padding: '16px 10px 12px', borderRight: `1px dashed ${ink2}33`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>nota de {S.MONTHS_PT[Number(month.slice(5, 7)) - 1].toLowerCase()}</div>
                <ScoreGauge value={h.score} size={186} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: -2 }}>
                  <span style={{ fontSize: 11, color: muted }}>vs mês anterior</span>
                  <span style={{ color: delta >= 0 ? green : red, fontWeight: 700, fontSize: 12.5 }}>{delta >= 0 ? '↑ +' : '↓ '}{Math.abs(delta).toFixed(1)}</span>
                </div>
              </div>
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <AIBadge />
                  <span style={{ fontSize: 11, color: muted }}>recalculado ao vivo com seus lançamentos</span>
                </div>
                <div style={{ fontWeight: 700, letterSpacing: '-0.015em', fontSize: 18, marginTop: 9, lineHeight: 1.3 }}>
                  {h.score >= 7 ? 'Finanças saudáveis — dá pra acelerar as metas.'
                    : h.score >= 5 ? 'No caminho certo, mas há um ponto frágil a resolver.'
                    : 'Atenção: o mês está apertado e pede ajuste.'}
                </div>
                <div style={{ fontSize: 12.5, color: ink2, lineHeight: 1.5, marginTop: 7 }}>
                  Você gastou <b>{S.fmt0(h.totals.expenses)}</b> de <b>{S.fmt0(h.totals.income)}</b> de renda
                  ({Math.round((h.totals.expenses / (h.totals.income || 1)) * 100)}%), com <b>{Math.round(h.committed * 100)}%</b> já comprometido
                  em fixos, parcelas e dívidas. Sua reserva cobre <b>{h.reserveMonths.toFixed(1)} mês</b> de despesas.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
                  <Button size="sm" onClick={() => onNavigate('Resumo')}>ver relatório completo →</Button>
                  <Button size="sm" variant="outline" onClick={() => onNavigate('Metas')}>simular metas</Button>
                  <Button size="sm" variant="dashed" onClick={() => onNavigate('Dívidas')}>plano de dívidas</Button>
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ flex: 1, minHeight: 200 }}>
            <CardTitle sub="o que mexer para subir a nota" right={<AIBadge small />}>Prioridades</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {prios.map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '26px 1fr auto', gap: 11, padding: '11px 12px', border: `1.4px solid ${ink2}33`, borderRadius: 9, background: '#ffffff88' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 99, background: p.color, color: paper, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12 }}>{i + 1}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: p.color }}>{p.tag}</span>
                      <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.01em' }}>{p.title}</span>
                    </div>
                    <div style={{ fontSize: 12, color: ink2, marginTop: 4, lineHeight: 1.45 }}>{p.body}</div>
                  </div>
                  <div style={{ alignSelf: 'center', textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>impacto</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: green, whiteSpace: 'nowrap' }}>{p.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'auto' }}>
          <Card pad={12} style={{ flexShrink: 0 }}>
            <CardTitle sub="6 meses de evolução">Histórico</CardTitle>
            <svg width="100%" viewBox={`0 0 ${sw} ${sh + 24}`} style={{ display: 'block' }}>
              <line x1="0" y1={sh - 0.5} x2={sw} y2={sh - 0.5} stroke={ink2} opacity="0.2" strokeDasharray="2 3" />
              <line x1="0" y1={sh * 0.5} x2={sw} y2={sh * 0.5} stroke={ink2} opacity="0.13" strokeDasharray="2 3" />
              <path d={`${path} L ${sw} ${sh} L 0 ${sh} Z`} fill={ink} opacity="0.06" />
              <path d={path} stroke={ink} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
              {pts.map((p, i) => {
                const last = i === pts.length - 1;
                return (
                  <g key={i}>
                    <circle cx={p[0]} cy={p[1]} r={last ? 4.5 : 2.8} fill={last ? green : paper} stroke={last ? paper : ink} strokeWidth={last ? 1.8 : 1.3} />
                    <text x={p[0]} y={sh + 13} textAnchor="middle" fontSize="9" fill={muted} fontFamily="Montserrat, sans-serif">{hist[i].label}</text>
                    <text x={p[0]} y={p[1] - 7} textAnchor="middle" fontSize="9" fontWeight="700" fill={last ? green : ink2} fontFamily="Montserrat, sans-serif">{hist[i].value.toFixed(1)}</text>
                  </g>
                );
              })}
            </svg>
          </Card>

          <Card pad={12} style={{ flex: 1, minHeight: 215, display: 'flex', flexDirection: 'column' }}>
            <CardTitle sub="6 dimensões avaliadas">Composição da nota</CardTitle>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {h.dims.map((d, i) => (
                <div key={i} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 11.5, gap: 8 }}>
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.k} <span style={{ color: muted, fontSize: 10 }}>· {d.note}</span>
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 12.5, color: d.color, flexShrink: 0 }}>{d.v.toFixed(1)}</span>
                  </div>
                  <Bar pct={d.v * 10} color={d.color} height={5} delay={i * 50} />
                </div>
              ))}
            </div>
          </Card>

          <Card pad={12} style={{ background: ink, color: paper, border: `1.5px solid ${ink}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 54, height: 54, borderRadius: 9, background: h.score >= 7 ? green : h.score >= 5 ? amber : red, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 21, letterSpacing: '-0.03em', flexShrink: 0 }}>{h.score.toFixed(1)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase' }}>minha nota financeira</div>
                <div style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.01em', marginTop: 2 }}>{S.monthLabel(month)} · {delta >= 0 ? `subiu ${delta.toFixed(1)}` : `caiu ${Math.abs(delta).toFixed(1)}`}</div>
                <div style={{ fontSize: 10.5, opacity: 0.7, marginTop: 1 }}>poupê · {state.people.map(p => p.name.toLowerCase()).join(' & ')}</div>
              </div>
              <Button size="sm" tone={paper} style={{ color: ink }} onClick={() => alert('Card de compartilhamento gerado!')}>↗ post</Button>
            </div>
          </Card>
        </div>
      </div>
      <FAB onClick={onOpenModal} />
    </div>
  );
}

// ── Simulação de quitação ──────────────────────────────────────────
interface Milestone { id: string; name: string; month: number; color: string; }
interface PayoffResult { months: number; milestones: Milestone[]; interest: number; order: (Debt & { rem: number })[]; budget: number; }

function simulatePayoff(debts: Debt[], strategy: 'avalanche' | 'bolaneve', extra = 0): PayoffResult {
  const live = debts.map(d => ({ ...d, rem: d.total - d.paid })).filter(d => d.rem > 0.01);
  if (!live.length) return { months: 0, milestones: [], interest: 0, order: [], budget: 0 };
  const order = [...live].sort((a, b) => (strategy === 'avalanche' ? b.rate - a.rate : a.rem - b.rem));
  const budget = live.reduce((s, d) => s + d.min, 0) + extra;
  const rem: Record<string, number> = {};
  live.forEach(d => { rem[d.id] = d.rem; });
  const milestones: Milestone[] = [];
  let interest = 0, month = 0;
  while (Object.values(rem).some(v => v > 0.01) && month < 480) {
    month++;
    order.forEach(d => { if (rem[d.id] > 0) { const i = rem[d.id] * (d.rate / 100); rem[d.id] += i; interest += i; } });
    let avail = budget;
    order.forEach(d => { if (rem[d.id] > 0 && avail > 0) { const p = Math.min(rem[d.id], d.min, avail); rem[d.id] -= p; avail -= p; } });
    for (const d of order) { if (avail <= 0) break; if (rem[d.id] > 0) { const p = Math.min(rem[d.id], avail); rem[d.id] -= p; avail -= p; } }
    order.forEach(d => { if (rem[d.id] <= 0.01 && !milestones.some(m => m.id === d.id)) { rem[d.id] = 0; milestones.push({ id: d.id, name: d.name, month, color: d.color }); } });
  }
  return { months: month, milestones, interest, order, budget };
}

// ── Tela: Dívidas ──────────────────────────────────────────────────
export function Dividas({ onNavigate, onOpenModal }: ScreenProps) {
  const { state, actions } = useStore();
  const [strategy, setStrategy] = React.useState<'avalanche' | 'bolaneve'>('avalanche');
  const [extra, setExtra] = React.useState(0);
  const [addOpen, setAddOpen] = React.useState(false);
  const [payFor, setPayFor] = React.useState<Debt | null>(null);
  const [payAmt, setPayAmt] = React.useState('');
  const [nd, setNd] = React.useState({ name: '', total: '', rate: '', min: '', personId: '' });

  const debts = state.debts;
  const totalRemaining = debts.reduce((s, d) => s + Math.max(0, d.total - d.paid), 0);
  const totalPaid = debts.reduce((s, d) => s + d.paid, 0);
  const totalAll = debts.reduce((s, d) => s + d.total, 0) || 1;

  const sim = React.useMemo(() => simulatePayoff(debts, strategy, extra), [debts, strategy, extra]);
  const other = React.useMemo(() => simulatePayoff(debts, strategy === 'avalanche' ? 'bolaneve' : 'avalanche', extra), [debts, strategy, extra]);
  const saves = Math.max(0, other.interest - sim.interest);

  const ordered = sim.order;
  const personName = (id: string) => state.people.find(p => p.id === id)?.name || '—';

  const doAdd = () => {
    if (!nd.name.trim() || !(Number(nd.total) > 0)) return;
    actions.addDebt({ name: nd.name.trim(), total: Number(nd.total), rate: Number(nd.rate) || 0, min: Number(nd.min) || Math.round(Number(nd.total) / 12), personId: nd.personId || state.people[0].id });
    setNd({ name: '', total: '', rate: '', min: '', personId: '' }); setAddOpen(false);
  };
  const doPay = () => { if (!payFor || !(Number(payAmt) > 0)) return; actions.payDebt(payFor.id, Number(payAmt)); setPayFor(null); setPayAmt(''); };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: paper, overflow: 'hidden' }}>
      <TopBar activeTab="Dívidas" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12, padding: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 12, flexShrink: 0 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>dívida total restante</div>
                <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em', marginTop: 3, color: totalRemaining > 0 ? red : green, lineHeight: 1.05 }}>{S.fmt0(totalRemaining)}</div>
                <div style={{ fontSize: 11.5, color: muted, marginTop: 5 }}>pago <b style={{ color: green }}>{S.fmt0(totalPaid)}</b> de {S.fmt0(totalAll)}</div>
                <div style={{ marginTop: 8, maxWidth: 340 }}>
                  <Bar pct={(totalPaid / totalAll) * 100} color={green} height={7} />
                  <div style={{ fontSize: 10.5, color: muted, marginTop: 4 }}>{Math.round((totalPaid / totalAll) * 100)}% quitado</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>livre em</div>
                <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', color: green, lineHeight: 1, marginTop: 3 }}>
                  {sim.months} <span style={{ fontSize: 12, color: muted, fontWeight: 500 }}>meses</span>
                </div>
                <div style={{ fontSize: 10.5, color: muted, marginTop: 3 }}>≈ {S.monthShort(S.addMonths(state.ui.month, sim.months))}</div>
                {saves > 1 && <div style={{ fontSize: 10, color: green, fontWeight: 700, marginTop: 5 }}>↓ economiza {S.fmt0(saves)} em juros</div>}
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <AIBadge small /><span style={{ fontSize: 9.5, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>estratégia</span>
            </div>
            <KindSwitch value={strategy} onChange={v => setStrategy(v as 'avalanche' | 'bolaneve')} size="md" options={[
              { key: 'avalanche', label: 'Avalanche', hint: 'maior juro primeiro' },
              { key: 'bolaneve', label: 'Bola de neve', hint: 'menor saldo primeiro' },
            ]} />
            <div style={{ fontSize: 11.5, color: ink2, lineHeight: 1.45, marginTop: 9 }}>
              {strategy === 'avalanche'
                ? <>A <b>avalanche</b> ataca o maior juro primeiro — matematicamente o caminho mais barato.</>
                : <>A <b>bola de neve</b> quita as menores primeiro — vitórias rápidas que mantêm a motivação.</>}
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ fontSize: 10.5, color: muted, fontWeight: 600, whiteSpace: 'nowrap' }}>aporte extra/mês</span>
              <input type="range" min="0" max="2000" step="50" value={extra} onChange={e => setExtra(Number(e.target.value))} style={{ flex: 1, accentColor: green, cursor: 'pointer' }} />
              <span style={{ fontWeight: 700, fontSize: 12.5, color: green, minWidth: 66, textAlign: 'right' }}>{S.fmt0(extra)}</span>
            </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 12, flex: 1, minHeight: 0 }}>
          <Card style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <CardTitle sub={`ordem ${strategy === 'avalanche' ? 'por taxa de juros' : 'por menor saldo'}`}
              right={<Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>+ dívida</Button>}>Plano de quitação</CardTitle>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {ordered.length === 0 ? <EmptyState icon="🎉" title="Sem dívidas!" hint="Você está livre. Bora focar nas metas." /> :
                ordered.map((d, i) => {
                  const rem = d.total - d.paid, pct = (d.paid / d.total) * 100, focus = i === 0;
                  const ms = sim.milestones.find(m => m.id === d.id);
                  return (
                    <div key={d.id} style={{ padding: '10px 12px', border: `${focus ? 1.8 : 1.4}px solid ${focus ? d.color : ink2 + '44'}`, borderRadius: 9, background: focus ? `${d.color}0e` : '#ffffff88', position: 'relative' }}>
                      {focus && <span style={{ position: 'absolute', top: -8, left: 10, padding: '2px 8px', borderRadius: 99, background: d.color, color: paper, fontSize: 8.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>foco agora</span>}
                      <div style={{ display: 'grid', gridTemplateColumns: '22px 1fr 92px 74px 30px', gap: 9, alignItems: 'center' }}>
                        <div style={{ width: 22, height: 22, borderRadius: 99, background: d.color, color: paper, display: 'grid', placeItems: 'center', fontSize: 10.5, fontWeight: 800 }}>{i + 1}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.01em' }}>{d.name}</span>
                            <span style={{ fontSize: 10.5, color: muted }}>{personName(d.personId)}</span>
                            <span style={{
                              padding: '1px 6px', borderRadius: 3, fontSize: 9.5, fontWeight: 700,
                              background: d.rate >= 10 ? `${red}22` : d.rate > 0 ? `${amber}22` : `${green}22`,
                              color: d.rate >= 10 ? red : d.rate > 0 ? amber : green,
                            }}>{d.rate === 0 ? 'sem juros' : `${d.rate}% a.m.`}</span>
                            {ms && <span style={{ fontSize: 9.5, color: muted }}>quita em {ms.month}m</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                            <div style={{ flex: 1 }}><Bar pct={pct} color={d.color} height={5} /></div>
                            <span style={{ fontSize: 10.5, color: muted, minWidth: 28, textAlign: 'right' }}>{Math.round(pct)}%</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap' }}>{S.fmt0(rem)}</div>
                          <div style={{ fontSize: 9.5, color: muted }}>mín {S.fmt0(d.min)}</div>
                        </div>
                        <Button size="sm" variant="outline" tone={d.color} onClick={() => { setPayFor(d); setPayAmt(String(d.min)); }}>pagar</Button>
                        <IconBtn onClick={() => actions.delDebt(d.id)} title="Remover" tone={red} size={22}>×</IconBtn>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
            <Card pad={12} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <CardTitle sub="marcos até ficar livre">Cronograma</CardTitle>
              <div style={{ position: 'relative', paddingLeft: 22, flex: 1, minHeight: 0, overflow: 'auto' }}>
                <div style={{ position: 'absolute', left: 7, top: 4, bottom: 4, width: 1.5, background: ink2, opacity: 0.3 }} />
                <div style={{ position: 'relative', paddingBottom: 13 }}>
                  <div style={{ position: 'absolute', left: -20, top: 2, width: 13, height: 13, borderRadius: 99, background: paper, border: `2px solid ${ink}` }} />
                  <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{S.monthShort(state.ui.month)}</div>
                  <div style={{ fontWeight: 700, fontSize: 12.5, marginTop: 1 }}>Hoje</div>
                </div>
                {sim.milestones.map(m => (
                  <div key={m.id} style={{ position: 'relative', paddingBottom: 13 }}>
                    <div style={{ position: 'absolute', left: -20, top: 2, width: 13, height: 13, borderRadius: 99, background: m.color, border: `2px solid ${m.color}` }} />
                    <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{S.monthShort(S.addMonths(state.ui.month, m.month))}</div>
                    <div style={{ fontWeight: 600, fontSize: 12.5, marginTop: 1 }}>Quita {m.name}</div>
                  </div>
                ))}
                {sim.months > 0 && (
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: -22, top: 0, width: 17, height: 17, borderRadius: 99, background: green, display: 'grid', placeItems: 'center' }}>
                      <span style={{ color: paper, fontSize: 9, fontWeight: 800 }}>✓</span>
                    </div>
                    <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{S.monthShort(S.addMonths(state.ui.month, sim.months))}</div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: green, letterSpacing: '-0.01em', marginTop: 1 }}>Livre de dívidas</div>
                  </div>
                )}
              </div>
            </Card>

            <Card pad={12} style={{ background: green, color: paper, border: `1.5px solid ${green}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 9, opacity: 0.75, letterSpacing: '0.12em', textTransform: 'uppercase' }}>orçamento do plano</div>
                  <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', marginTop: 3 }}>{S.fmt0(sim.budget || 0)} por mês</div>
                  <div style={{ fontSize: 10.5, opacity: 0.8, marginTop: 2 }}>mínimos + {S.fmt0(extra)} de aporte extra</div>
                </div>
                <div style={{ width: 50, height: 50, borderRadius: 99, background: paper, color: green, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 17, flexShrink: 0 }}>{sim.months}m</div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Nova dívida" width={420}
        footer={<><Button variant="ghost" onClick={() => setAddOpen(false)}>cancelar</Button><Button onClick={doAdd} disabled={!nd.name.trim() || !(Number(nd.total) > 0)}>adicionar</Button></>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="nome" style={{ gridColumn: '1 / -1' }}><Input value={nd.name} onChange={v => setNd({ ...nd, name: v })} placeholder="Cartão, financiamento…" /></Field>
          <Field label="valor total"><MoneyInput value={nd.total} onChange={v => setNd({ ...nd, total: v })} accent={red} /></Field>
          <Field label="juros % ao mês"><Input type="number" step="0.1" value={nd.rate} onChange={v => setNd({ ...nd, rate: v })} placeholder="0" /></Field>
          <Field label="parcela mínima"><MoneyInput value={nd.min} onChange={v => setNd({ ...nd, min: v })} /></Field>
          <Field label="quem"><Select value={nd.personId} onChange={v => setNd({ ...nd, personId: v })} options={state.people.map(p => ({ value: p.id, label: p.name }))} placeholder="—" /></Field>
        </div>
      </Modal>

      <Modal open={!!payFor} onClose={() => setPayFor(null)} title={`Pagar ${payFor ? payFor.name : ''}`} width={380}
        footer={<><Button variant="ghost" onClick={() => setPayFor(null)}>cancelar</Button><Button tone={green} onClick={doPay} disabled={!(Number(payAmt) > 0)}>registrar pagamento</Button></>}>
        {payFor && (
          <>
            <div style={{ fontSize: 12.5, color: ink2, marginBottom: 12 }}>
              Restam <b>{S.fmt0(payFor.total - payFor.paid)}</b> dessa dívida.
            </div>
            <Field label="valor do pagamento"><MoneyInput value={payAmt} onChange={setPayAmt} accent={green} onEnter={doPay} /></Field>
            <div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
              {[payFor.min, payFor.min * 2, payFor.total - payFor.paid].map((v, i) => (
                <Chip key={i} onClick={() => setPayAmt(String(Math.round(v)))}>{i === 2 ? 'quitar tudo' : S.fmt0(v)}</Chip>
              ))}
            </div>
          </>
        )}
      </Modal>

      <FAB onClick={onOpenModal} />
    </div>
  );
}

// ── Tela: Metas ────────────────────────────────────────────────────
export function Metas({ onNavigate, onOpenModal }: ScreenProps) {
  const { state, actions } = useStore();
  const month = state.ui.month;
  const t = S.totalsFor(state, month);
  const [mode, setMode] = React.useState<'atual' | 'cortes' | 'turbo'>('atual');
  const [addOpen, setAddOpen] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<Goal | null>(null);
  const [contribFor, setContribFor] = React.useState<Goal | null>(null);
  const [contribAmt, setContribAmt] = React.useState('');
  const [ng, setNg] = React.useState({ name: '', target: '', emoji: '🎯', personId: '', current: '' });

  const personFilter = state.ui.personId;
  const goals = state.goals.filter(g => personFilter === 'all' || !g.personId || g.personId === personFilter);
  const activeId = state.ui.activeGoalId || (goals[0] || {}).id;
  const goal = goals.find(g => g.id === activeId) || goals[0];
  const ownerName = (id?: string) => (id ? state.people.find(p => p.id === id)?.name : null) || 'Compartilhada';
  const personSelectOptions = [{ value: '', label: 'Compartilhada' }, ...state.people.map(p => ({ value: p.id, label: p.name }))];

  const surplus = Math.max(0, t.balance);
  const cuts = React.useMemo(() => {
    const rows = S.byCategory(state, month).filter(r => !/salário|contas/i.test(r.cat.name)).slice(0, 5);
    return rows.map(r => ({ name: r.cat.name, color: r.cat.color, cur: r.value, save: Math.round(r.value * 0.3) }));
  }, [state, month]);
  const totalSave = cuts.reduce((s, c) => s + c.save, 0);

  const scenarios = {
    atual: { aporte: Math.max(50, Math.round(surplus * 0.4)), label: 'Ritmo atual', sub: 'sem mexer em nada', color: ink },
    cortes: { aporte: Math.max(50, Math.round(surplus * 0.4) + totalSave), label: 'Com cortes da IA', sub: `+${S.fmt0(totalSave)}/mês economizados`, color: green },
    turbo: { aporte: Math.max(50, Math.round(surplus * 0.4) + totalSave + 500), label: 'Modo turbinado', sub: 'cortes + renda extra', color: gold },
  };
  const monthsFor = (a: number) => (goal ? Math.max(1, Math.ceil((goal.target - goal.current) / Math.max(1, a))) : 0);
  const active = scenarios[mode];
  const activeMonths = monthsFor(active.aporte);
  const baseMonths = monthsFor(scenarios.atual.aporte);

  const cw = 600, ch = 190, pL = 48, pR = 18, pT = 14, pB = 26;
  const iw = cw - pL - pR, ih = ch - pT - pB;
  const maxM = Math.max(baseMonths, 1);
  const xAt = (m: number) => pL + (Math.min(m, maxM) / maxM) * iw;
  const yAt = (v: number) => pT + ih - (v / (goal ? goal.target : 1)) * ih;
  const lineFor = (a: number) => {
    if (!goal) return '';
    const n = monthsFor(a);
    const p = [];
    for (let i = 0; i <= n; i++) p.push(`${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(Math.min(goal.target, goal.current + a * i))}`);
    return p.join(' ');
  };

  const doAdd = () => {
    if (!ng.name.trim() || !(Number(ng.target) > 0)) return;
    actions.addGoal({ name: ng.name.trim(), target: Number(ng.target), emoji: ng.emoji, personId: ng.personId || undefined, current: Math.max(0, Number(ng.current) || 0) });
    setNg({ name: '', target: '', emoji: '🎯', personId: '', current: '' }); setAddOpen(false);
  };
  const doContrib = () => { if (!contribFor || !(Number(contribAmt) > 0)) return; actions.contributeGoal(contribFor.id, Number(contribAmt)); setContribFor(null); setContribAmt(''); };

  const openAdd = () => { setNg({ name: '', target: '', emoji: '🎯', personId: '', current: '' }); setAddOpen(true); };
  const openEdit = (g: Goal) => { setEditingGoal(g); setNg({ name: g.name, target: String(g.target), emoji: g.emoji, personId: g.personId || '', current: String(g.current) }); };
  const doEdit = () => {
    if (!editingGoal || !ng.name.trim() || !(Number(ng.target) > 0)) return;
    actions.updateGoal(editingGoal.id, { name: ng.name.trim(), target: Number(ng.target), emoji: ng.emoji, personId: ng.personId || undefined, current: Math.max(0, Number(ng.current) || 0) });
    setEditingGoal(null); setNg({ name: '', target: '', emoji: '🎯', personId: '', current: '' });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: paper, overflow: 'hidden' }}>
      <TopBar activeTab="Metas" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '200px 1fr 290px', gap: 13, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minHeight: 0, overflow: 'auto' }}>
          <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '2px 2px' }}>suas metas</div>
          {goals.map(g => {
            const pct = (g.current / g.target) * 100, on = g.id === activeId;
            return (
              <div key={g.id} onClick={() => actions.setActiveGoal(g.id)}
                style={{ padding: 11, border: `${on ? 1.8 : 1.4}px solid ${on ? g.color : ink2 + '3a'}`, borderRadius: 10, background: on ? `${g.color}0e` : paper, cursor: 'pointer', transition: 'all .15s', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: g.color, color: paper, display: 'grid', placeItems: 'center', fontSize: 14, flexShrink: 0 }}>{g.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12.5, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</div>
                    <div style={{ fontSize: 9.5, color: muted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{S.fmt0(g.target)} · {ownerName(g.personId)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                    <IconBtn onClick={e => { e.stopPropagation(); openEdit(g); }} title="Editar" size={20}>✏️</IconBtn>
                    <IconBtn onClick={e => { e.stopPropagation(); actions.delGoal(g.id); }} title="Remover" tone={red} size={20}>×</IconBtn>
                  </div>
                </div>
                <div style={{ marginTop: 7 }}>
                  <Bar pct={pct} color={g.color} height={4} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 9.5, color: muted }}>
                    <span>{S.fmt0(g.current)}</span><span style={{ fontWeight: 700, color: on ? g.color : ink2 }}>{Math.round(pct)}%</span>
                  </div>
                </div>
                {on && <div style={{ marginTop: 8 }}><Button size="sm" full tone={g.color} onClick={e => { e.stopPropagation(); setContribFor(g); setContribAmt(String(scenarios.atual.aporte)); }}>+ aportar</Button></div>}
              </div>
            );
          })}
          <Button variant="dashed" full onClick={openAdd}>+ nova meta</Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, minHeight: 0, overflow: 'auto' }}>
          {!goal ? <EmptyState icon="🎯" title="Nenhuma meta ainda" hint="Crie sua primeira meta para simular quanto tempo leva." action={<Button onClick={openAdd}>criar meta</Button>} /> : <>
            <Card style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: goal.color, color: paper, display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0 }}>{goal.emoji}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>meta ativa</div>
                      <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginTop: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', lineHeight: 1 }}>{S.fmt0(goal.current)}</span>
                    <span style={{ fontSize: 12, color: muted }}>de {S.fmt0(goal.target)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 6 }}>
                    <div style={{ flex: 1 }}><Bar pct={(goal.current / goal.target) * 100} color={goal.color} height={7} /></div>
                    <span style={{ fontWeight: 700, fontSize: 12.5, color: goal.color }}>{Math.round((goal.current / goal.target) * 100)}%</span>
                  </div>
                </div>
                <div style={{ borderLeft: `1px dashed ${ink2}33`, paddingLeft: 14, textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>previsão</div>
                  <div style={{ fontWeight: 800, fontSize: 27, letterSpacing: '-0.03em', color: active.color, lineHeight: 1, marginTop: 3 }}>
                    {activeMonths} <span style={{ fontSize: 12, color: muted, fontWeight: 500 }}>meses</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: muted, marginTop: 3 }}>≈ {S.monthShort(S.addMonths(month, activeMonths))}</div>
                  {mode !== 'atual' && baseMonths > activeMonths && <div style={{ fontSize: 10, color: green, fontWeight: 700, marginTop: 5 }}>↓ {baseMonths - activeMonths} meses mais rápido</div>}
                </div>
              </div>
            </Card>

            <Card style={{ flex: 1, minHeight: 170, display: 'flex', flexDirection: 'column' }}>
              <CardTitle sub="acúmulo mês a mês até bater a meta" right={
                <div style={{ display: 'flex', gap: 8, fontSize: 10, color: muted, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {([['atual', ink, ''], ['cortes', green, '4 2'], ['turbo', gold, '2 2']] as const).map(([l, c, d]) => (
                    <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <svg width="13" height="3"><line x1="0" y1="1.5" x2="13" y2="1.5" stroke={c} strokeWidth="2" strokeDasharray={d} /></svg>{l}
                    </span>
                  ))}
                </div>
              }>Evolução até a meta</CardTitle>
              <div style={{ flex: 1, minHeight: 0, display: 'grid', placeItems: 'center' }}>
                <svg viewBox={`0 0 ${cw} ${ch}`} width="100%" style={{ maxHeight: 200 }}>
                  {[0, .25, .5, .75, 1].map(p => {
                    const y = pT + ih - p * ih;
                    return (
                      <g key={p}>
                        <line x1={pL} y1={y} x2={cw - pR} y2={y} stroke={ink2} opacity={p === 1 ? 0.35 : 0.13} strokeDasharray={p === 1 ? '4 3' : '2 3'} />
                        <text x={pL - 6} y={y + 3.5} textAnchor="end" fontSize="9" fill={muted} fontFamily="Montserrat, sans-serif">{p === 1 ? 'meta' : `${Math.round((p * goal.target) / 1000)}k`}</text>
                      </g>
                    );
                  })}
                  {[0, Math.round(maxM / 3), Math.round((maxM * 2) / 3), maxM].map((m, i) => (
                    <text key={i} x={xAt(m)} y={ch - 8} textAnchor="middle" fontSize="9" fill={muted} fontFamily="Montserrat, sans-serif">{m === 0 ? 'hoje' : `${m}m`}</text>
                  ))}
                  <path d={lineFor(scenarios.atual.aporte)} stroke={ink} strokeWidth={mode === 'atual' ? 2.6 : 1.6} fill="none" opacity={mode === 'atual' ? 1 : 0.45} strokeLinejoin="round" />
                  <path d={lineFor(scenarios.cortes.aporte)} stroke={green} strokeWidth={mode === 'cortes' ? 2.6 : 1.6} fill="none" strokeDasharray="5 3" opacity={mode === 'cortes' ? 1 : 0.45} />
                  <path d={lineFor(scenarios.turbo.aporte)} stroke={gold} strokeWidth={mode === 'turbo' ? 2.6 : 1.6} fill="none" strokeDasharray="3 3" opacity={mode === 'turbo' ? 1 : 0.45} />
                  <circle cx={xAt(activeMonths)} cy={yAt(goal.target)} r="5" fill={active.color} stroke={paper} strokeWidth="2" />
                  <circle cx={xAt(0)} cy={yAt(goal.current)} r="3.5" fill={ink} />
                  <text x={xAt(0) + 7} y={yAt(goal.current) - 6} fontSize="9" fontWeight="700" fill={ink} fontFamily="Montserrat, sans-serif">{S.fmt0(goal.current)}</text>
                </svg>
              </div>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9, flexShrink: 0 }}>
              {(Object.entries(scenarios) as [typeof mode, typeof scenarios['atual']][]).map(([key, s]) => {
                const on = mode === key, m = monthsFor(s.aporte);
                return (
                  <div key={key} onClick={() => setMode(key)}
                    style={{ padding: 11, border: `${on ? 1.8 : 1.4}px solid ${on ? s.color : ink2 + '3a'}`, borderRadius: 10, background: on ? `${s.color}0e` : paper, cursor: 'pointer', position: 'relative', transition: 'all .15s' }}>
                    {on && <span style={{ position: 'absolute', top: -8, right: 9, padding: '2px 7px', borderRadius: 99, background: s.color, color: paper, fontSize: 8.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>simulando</span>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 12.5, letterSpacing: '-0.01em' }}>{s.label}</span>
                      <span style={{ fontWeight: 800, fontSize: 14, color: s.color, letterSpacing: '-0.02em' }}>{m}m</span>
                    </div>
                    <div style={{ fontSize: 10.5, color: muted, marginTop: 2, lineHeight: 1.35 }}>{s.sub}</div>
                    <div style={{ marginTop: 7, fontSize: 10.5, color: ink2 }}>aporte <b style={{ color: s.color }}>{S.fmt0(s.aporte)}/mês</b></div>
                  </div>
                );
              })}
            </div>
          </>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, minHeight: 0, overflow: 'auto' }}>
          <Card pad={12} style={{ flexShrink: 0 }}>
            <CardTitle sub="calculado dos seus lançamentos">Parâmetros</CardTitle>
            {([
              ['renda mensal', S.fmt0(t.income), green, false],
              ['gastos mensais', S.fmt0(t.expenses), red, false],
              ['sobra', S.fmt0(t.balance), ink, true],
              ['aporte simulado', S.fmt0(active.aporte), blue, false],
              ['objetivo', goal ? S.fmt0(goal.target) : '—', green, false],
            ] as [string, string, string, boolean][]).map(([l, v, c, computed], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '7px 9px', marginBottom: 6, border: computed ? `1.4px dashed ${ink2}55` : `1.4px solid ${ink2}3a`, borderRadius: 7, background: computed ? '#f3eee2' : paper }}>
                <span style={{ fontSize: 10, color: muted, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{l}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: c, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{v}</span>
              </div>
            ))}
          </Card>

          <Card pad={12} style={{ flex: 1, minHeight: 150, display: 'flex', flexDirection: 'column' }}>
            <CardTitle sub={`economiza ${S.fmt0(totalSave)}/mês`} right={<AIBadge small />}>Cortes sugeridos</CardTitle>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {cuts.length === 0 ? <EmptyState icon="✂️" title="Sem sugestões" hint="Lance mais gastos para a IA analisar." /> :
                cuts.map((c, i) => (
                  <div key={i} style={{ padding: '8px 9px', border: `1.3px solid ${ink2}2a`, borderRadius: 7, background: '#ffffff88', display: 'grid', gridTemplateColumns: '4px 1fr auto', gap: 8, alignItems: 'center' }}>
                    <span style={{ width: 4, alignSelf: 'stretch', background: c.color, borderRadius: 99, minHeight: 26 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 11.5, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                      <div style={{ fontSize: 9.5, color: muted, marginTop: 2 }}>hoje {S.fmt0(c.cur)} · reduzir 30%</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: green, whiteSpace: 'nowrap' }}>−{S.fmt0(c.save)}</div>
                      <div style={{ fontSize: 8.5, color: muted }}>/mês</div>
                    </div>
                  </div>
                ))}
            </div>
            {cuts.length > 0 && (
              <div style={{ marginTop: 9, padding: '9px 11px', background: green, color: paper, borderRadius: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 9, opacity: 0.75, letterSpacing: '0.08em', textTransform: 'uppercase' }}>total economizado</div>
                  <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>{S.fmt0(totalSave)}/mês</div>
                </div>
                <Button size="sm" tone={paper} style={{ color: green }} onClick={() => setMode('cortes')}>simular →</Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Nova meta" width={400}
        footer={<><Button variant="ghost" onClick={() => setAddOpen(false)}>cancelar</Button><Button tone={green} onClick={doAdd} disabled={!ng.name.trim() || !(Number(ng.target) > 0)}>criar meta</Button></>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Field label="nome da meta"><Input value={ng.name} onChange={v => setNg({ ...ng, name: v })} placeholder="Viagem, carro novo…" accent={green} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="valor objetivo"><MoneyInput value={ng.target} onChange={v => setNg({ ...ng, target: v })} accent={green} /></Field>
            <Field label="já guardado (opcional)"><MoneyInput value={ng.current} onChange={v => setNg({ ...ng, current: v })} accent={green} /></Field>
          </div>
          <Field label="de quem é essa meta"><Select value={ng.personId} onChange={v => setNg({ ...ng, personId: v })} options={personSelectOptions} accent={green} /></Field>
          <GoalIconField value={ng.emoji} onChange={v => setNg({ ...ng, emoji: v })} />
        </div>
      </Modal>

      <Modal open={!!editingGoal} onClose={() => setEditingGoal(null)} title="Editar meta" width={400}
        footer={<><Button variant="ghost" onClick={() => setEditingGoal(null)}>cancelar</Button><Button tone={green} onClick={doEdit} disabled={!ng.name.trim() || !(Number(ng.target) > 0)}>salvar alterações</Button></>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Field label="nome da meta"><Input value={ng.name} onChange={v => setNg({ ...ng, name: v })} placeholder="Viagem, carro novo…" accent={green} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="valor objetivo"><MoneyInput value={ng.target} onChange={v => setNg({ ...ng, target: v })} accent={green} /></Field>
            <Field label="valor já guardado" hint="corrija se um aporte foi lançado errado"><MoneyInput value={ng.current} onChange={v => setNg({ ...ng, current: v })} accent={green} /></Field>
          </div>
          <Field label="de quem é essa meta"><Select value={ng.personId} onChange={v => setNg({ ...ng, personId: v })} options={personSelectOptions} accent={green} /></Field>
          <GoalIconField value={ng.emoji} onChange={v => setNg({ ...ng, emoji: v })} />
        </div>
      </Modal>

      <Modal open={!!contribFor} onClose={() => setContribFor(null)} title={`Aportar em ${contribFor ? contribFor.name : ''}`} width={380}
        footer={<><Button variant="ghost" onClick={() => setContribFor(null)}>cancelar</Button><Button tone={green} onClick={doContrib} disabled={!(Number(contribAmt) > 0)}>confirmar aporte</Button></>}>
        {contribFor && (
          <>
            <div style={{ fontSize: 12.5, color: ink2, marginBottom: 12 }}>
              Faltam <b>{S.fmt0(contribFor.target - contribFor.current)}</b> para bater essa meta.
            </div>
            <Field label="valor do aporte"><MoneyInput value={contribAmt} onChange={setContribAmt} accent={green} onEnter={doContrib} /></Field>
            <div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
              {[100, 500, scenarios.atual.aporte].map((v, i) => <Chip key={i} onClick={() => setContribAmt(String(v))}>{S.fmt0(v)}</Chip>)}
            </div>
          </>
        )}
      </Modal>

      <FAB onClick={onOpenModal} />
    </div>
  );
}

// ── Tela: Relatórios ───────────────────────────────────────────────
export function Relatorios({ onNavigate, onOpenModal }: ScreenProps) {
  const { state } = useStore();
  const { month, personId } = state.ui;
  const [view, setView] = React.useState<'categoria' | 'pagamento' | 'pessoa'>('categoria');

  const months = React.useMemo(() => {
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const m = S.addMonths(month, -i);
      const tm = S.totalsFor(state, m, personId);
      out.push({ m, label: S.MONTHS_PT[Number(m.slice(5, 7)) - 1], ...tm });
    }
    return out;
  }, [state, month, personId]);
  const maxBar = Math.max(1, ...months.map(x => Math.max(x.income, x.expenses)));

  const t = S.totalsFor(state, month, personId);
  const cats = S.byCategory(state, month, personId);
  const types = S.byType(state, month, personId);
  const people = S.byPerson(state, month);
  const topExpenses = [...t.items.comuns, ...t.items.fixos, ...t.items.parcelas].sort((a, b) => b.amount - a.amount).slice(0, 8);
  const catName = (id: string) => state.categories.find(c => c.id === id)?.name || '—';
  const catColor = (id: string) => state.categories.find(c => c.id === id)?.color || muted;

  const rows = view === 'categoria' ? cats.map(r => ({ label: r.cat.name, color: r.cat.color, value: r.value, expected: r.cat.expectedAmount }))
    : view === 'pagamento' ? types.map(r => ({ label: r.type.name, color: r.type.color, value: r.value, expected: undefined as number | undefined }))
    : people.map(r => ({ label: r.person.name, color: r.person.color, value: r.value, expected: undefined as number | undefined }));
  const rowsTotal = rows.reduce((s, r) => s + r.value, 0) || 1;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: paper, overflow: 'hidden' }}>
      <TopBar activeTab="Resumo" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <Card style={{ flexShrink: 0 }}>
            <CardTitle sub="entradas vs gastos nos últimos 6 meses">Evolução mensal</CardTitle>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 130, paddingTop: 6 }}>
              {months.map(x => {
                const on = x.m === month;
                return (
                  <div key={x.m} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 0 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 3, width: '100%', justifyContent: 'center' }}>
                      <div title={`entradas ${S.fmt0(x.income)}`} style={{ width: '38%', height: `${(x.income / maxBar) * 100}%`, background: green, borderRadius: '3px 3px 0 0', opacity: on ? 1 : 0.5, transition: 'height .5s, opacity .2s', minHeight: 2 }} />
                      <div title={`gastos ${S.fmt0(x.expenses)}`} style={{ width: '38%', height: `${(x.expenses / maxBar) * 100}%`, background: red, borderRadius: '3px 3px 0 0', opacity: on ? 1 : 0.5, transition: 'height .5s, opacity .2s', minHeight: 2 }} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: on ? 700 : 500, color: on ? ink : muted }}>{x.label}</div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: x.balance >= 0 ? green : red }}>{x.balance >= 0 ? '+' : ''}{Math.round(x.balance / 100) / 10}k</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CardTitle sub={`${S.monthLabel(month)} · ${rows.length} linhas`} right={
              <div style={{ display: 'flex', gap: 6 }}>
                {(['categoria', 'pagamento', 'pessoa'] as const).map(v => <Chip key={v} active={view === v} onClick={() => setView(v)}>{v}</Chip>)}
              </div>
            }>{view === 'categoria' ? 'Gastos por categoria' : `Quebra por ${view}`}</CardTitle>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {rows.length === 0 ? <EmptyState icon="📊" title="Sem dados nesse mês" hint="Lance alguns gastos para ver o relatório." /> :
                rows.map((r, i) => {
                  const over = r.expected != null && r.value > r.expected;
                  return (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 12.5, marginBottom: 3, gap: 10 }}>
                        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ width: 8, height: 8, borderRadius: 99, background: r.color, display: 'inline-block', marginRight: 7 }} />{r.label}
                          {over && <span style={{ marginLeft: 6, fontSize: 9.5, fontWeight: 800, color: red, letterSpacing: '0.04em', textTransform: 'uppercase' }}>acima do esperado</span>}
                        </span>
                        <span style={{ display: 'flex', gap: 10, flexShrink: 0, alignItems: 'baseline' }}>
                          <span style={{ color: muted, fontSize: 11 }}>{Math.round((r.value / rowsTotal) * 100)}%</span>
                          {r.expected != null && <span style={{ color: muted, fontSize: 10.5 }}>/ {S.fmt(r.expected)}</span>}
                          <span style={{ fontWeight: 700, color: over ? red : ink }}>{S.fmt(r.value)}</span>
                        </span>
                      </div>
                      <Bar pct={(r.value / (rows[0]?.value || 1)) * 100} color={over ? red : r.color} height={6} delay={i * 40} />
                    </div>
                  );
                })}
            </div>
            <div style={{ borderTop: `1.5px solid ${ink}`, marginTop: 8, paddingTop: 9, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15 }}>
              <span>Total</span><span>{S.fmt(rowsTotal)}</span>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'auto', paddingBottom: 56 }}>
          <Card pad={12} style={{ flexShrink: 0 }}>
            <CardTitle sub="resumo do mês">Números do mês</CardTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {([['entradas', t.income, green], ['gastos', t.expenses, red], ['saldo', t.balance, t.balance >= 0 ? green : red], ['comprometido', t.fixo + t.parcela, amber]] as [string, number, string][]).map(([l, v, c]) => (
                <div key={l} style={{ padding: 9, border: `1.3px solid ${ink2}2a`, borderRadius: 8, background: '#f3eee2' }}>
                  <div style={{ fontSize: 9, color: muted, letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 700 }}>{l}</div>
                  <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.025em', color: c, marginTop: 3 }}>{S.fmt0(v)}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card pad={12} style={{ flexShrink: 0 }}>
            <CardTitle sub="do mês inteiro">Saídas por pagamento</CardTitle>
            {types.length === 0 ? <EmptyState icon="💳" title="Sem dados" /> : types.slice(0, 6).map(r => (
              <div key={r.type.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span><span style={{ width: 8, height: 8, borderRadius: 99, background: r.type.color, display: 'inline-block', marginRight: 6 }} />{r.type.name}</span>
                  <span style={{ fontWeight: 700 }}>{S.fmt(r.value)}</span>
                </div>
                <Bar pct={(r.value / (types[0]?.value || 1)) * 100} color={r.type.color} height={5} />
              </div>
            ))}
          </Card>

          <PersonSpendCard rows={people} />

          <Card pad={12} style={{ flex: 1, minHeight: 170, display: 'flex', flexDirection: 'column' }}>
            <CardTitle sub="onde mais saiu dinheiro">Maiores gastos</CardTitle>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {topExpenses.length === 0 ? <EmptyState icon="💸" title="Sem gastos nesse mês" /> :
                topExpenses.map((x, i) => (
                  <Row key={x.id + i} last={i === topExpenses.length - 1}>
                    <div style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto', gap: 8, alignItems: 'center', padding: '7px 2px', fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: catColor(x.categoryId) }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {x.desc}{'installment' in x ? ` (${x.installment}/${x.totalInstallments})` : ''}
                        <span style={{ color: muted, fontSize: 10, marginLeft: 6 }}>{catName(x.categoryId)}</span>
                      </span>
                      <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{S.fmt0(x.amount)}</span>
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
