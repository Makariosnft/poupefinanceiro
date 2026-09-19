/* global React */
// Poupê — telas de análise: Diagnóstico (IA), Dívidas, Metas, Relatórios.

const S2 = window.PoupeStore, U2 = window.PoupeUI;
const { Button: Btn, IconBtn: IBtn, Field: Fld, Input: Inp, MoneyInput: Money, Select: Sel, Chip: Cp, Card: Cd, CardTitle: CdT, Bar: Br, Donut: Dn, KindSwitch: KSw, TopBar: TBar, FAB: Fab, EmptyState: Empty, Row: Rw, Modal: Mdl } = U2;
const K = U2.tokens;

function AIBadge({ small }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: small ? '2px 7px' : '3px 9px',
      background: K.blue, color: K.paper, borderRadius: 99, fontSize: small ? 9 : 10,
      fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      <svg width="9" height="9" viewBox="0 0 12 12"><path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="currentColor" /></svg>IA
    </span>
  );
}

// ── Medidor de nota (tudo proporcional a `size`) ───────────────────
function ScoreGauge({ value = 0, size = 210 }) {
  const u = size / 220;
  const r = size / 2 - 14 * u, cx = size / 2, cy = size / 2 + 10 * u;
  const start = Math.PI, arcLen = Math.PI;
  const [v, setV] = React.useState(0);
  React.useEffect(() => { const t = setTimeout(() => setV(value), 60); return () => clearTimeout(t); }, [value]);
  const arc = (a1, a2) => {
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    return `M ${x1} ${y1} A ${r} ${r} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${x2} ${y2}`;
  };
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const a = start + arcLen * (i / 10), big = i % 5 === 0;
    ticks.push(<line key={i} x1={cx + (r + 4 * u) * Math.cos(a)} y1={cy + (r + 4 * u) * Math.sin(a)}
      x2={cx + (r - 4 * u) * Math.cos(a)} y2={cy + (r - 4 * u) * Math.sin(a)}
      stroke={K.ink2} strokeWidth={(big ? 1.5 : 0.8) * u} opacity={big ? 1 : 0.45} />);
  }
  const zone = value < 4 ? K.red : value < 7 ? K.amber : K.green;
  return (
    <svg width={size} height={size / 2 + 30 * u} viewBox={`0 0 ${size} ${size / 2 + 30 * u}`}>
      <path d={arc(start, start + arcLen)} stroke="#00000015" strokeWidth={14 * u} fill="none" strokeLinecap="round" />
      <path d={arc(start, start + arcLen * (Math.max(0.001, v) / 10))} stroke={zone} strokeWidth={14 * u} fill="none" strokeLinecap="round"
        style={{ transition: 'd .7s' }} />
      {ticks}
      <text x={cx} y={cy - 8 * u} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize={56 * u} fill={K.ink} letterSpacing={-2 * u}>
        {value.toFixed(1)}
      </text>
      <text x={cx} y={cy + 14 * u} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="500" fontSize={11 * u} fill={K.muted} letterSpacing={1 * u}>/ 10</text>
    </svg>
  );
}

// ── Prioridades geradas a partir dos dados ─────────────────────────
function buildPriorities(h, state, month) {
  const out = [];
  const inc = h.totals.income || 1;
  const cats = S2.byCategory(state, month);
  if (h.reserveMonths < 3) {
    const need = h.totals.expenses * 3 - (state.goals.find(g => /reserva/i.test(g.name)) || { current: 0 }).current;
    out.push({ tag: 'urgente', color: K.red, title: 'Aumente a reserva para 3 meses de gastos',
      body: `Hoje a reserva cobre ${h.reserveMonths.toFixed(1)} mês. Faltam ${S2.fmt0(Math.max(0, need))} para chegar em 3 meses de tranquilidade.`,
      impact: `+${Math.min(2, (3 - h.reserveMonths) * 0.6).toFixed(1)} pts` });
  }
  const highRate = [...state.debts].filter(d => d.total - d.paid > 0).sort((a, b) => b.rate - a.rate)[0];
  if (highRate && highRate.rate > 5) {
    out.push({ tag: 'esse mês', color: K.amber, title: `Ataque a dívida mais cara: ${highRate.name}`,
      body: `Ela cobra ${highRate.rate}% ao mês sobre ${S2.fmt0(highRate.total - highRate.paid)}. Priorizar essa dívida economiza mais que qualquer corte de gasto.`,
      impact: '+0.8 pts' });
  }
  if (cats[0]) {
    out.push({ tag: 'observe', color: K.muted, title: `"${cats[0].cat.name}" é seu maior gasto`,
      body: `Foram ${S2.fmt0(cats[0].value)} nesse mês — ${Math.round(cats[0].value / (h.totals.expenses || 1) * 100)}% de tudo que saiu. Defina um teto e revise semanalmente.`,
      impact: '+0.4 pts' });
  }
  if (h.savingsRate < 0.1) {
    out.push({ tag: 'urgente', color: K.red, title: 'Sua taxa de poupança está baixa',
      body: `Você guardou ${Math.round(h.savingsRate * 100)}% da renda. O ideal é pelo menos 15% — isso seria ${S2.fmt0(inc * 0.15)} por mês.`,
      impact: '+1.0 pt' });
  }
  if (!out.length) out.push({ tag: 'parabéns', color: K.green, title: 'Tudo sob controle esse mês', body: 'Nenhum alerta crítico. Continue no ritmo e considere aumentar os aportes nas metas.', impact: 'manter' });
  return out.slice(0, 3);
}

// ── Tela: Diagnóstico ──────────────────────────────────────────────
function Diagnostico({ onNavigate, onOpenModal }) {
  const { state } = S2.useStore();
  const month = state.ui.month;
  const h = React.useMemo(() => S2.healthScore(state, month), [state, month]);
  const hist = React.useMemo(() => S2.scoreHistory(state, month, 6), [state, month]);
  const prios = React.useMemo(() => buildPriorities(h, state, month), [h, state, month]);
  const prevScore = hist.length > 1 ? hist[hist.length - 2].value : h.score;
  const delta = h.score - prevScore;

  const sw = 270, sh = 58;
  const pts = hist.map((x, i) => [(i / Math.max(1, hist.length - 1)) * sw, sh - (x.value / 10) * sh]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: K.paper, overflow: 'hidden' }}>
      <TBar activeTab="Diagnóstico" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 16, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'auto' }}>
          <Cd pad={0} style={{ overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', alignItems: 'center' }}>
              <div style={{ padding: '16px 10px 12px', borderRight: `1px dashed ${K.ink2}33`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 9.5, color: K.muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>nota de {S2.MONTHS_PT[Number(month.slice(5, 7)) - 1].toLowerCase()}</div>
                <ScoreGauge value={h.score} size={186} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: -2 }}>
                  <span style={{ fontSize: 11, color: K.muted }}>vs mês anterior</span>
                  <span style={{ color: delta >= 0 ? K.green : K.red, fontWeight: 700, fontSize: 12.5 }}>{delta >= 0 ? '↑ +' : '↓ '}{Math.abs(delta).toFixed(1)}</span>
                </div>
              </div>
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <AIBadge />
                  <span style={{ fontSize: 11, color: K.muted }}>recalculado ao vivo com seus lançamentos</span>
                </div>
                <div style={{ fontWeight: 700, letterSpacing: '-0.015em', fontSize: 18, marginTop: 9, lineHeight: 1.3 }}>
                  {h.score >= 7 ? 'Finanças saudáveis — dá pra acelerar as metas.'
                    : h.score >= 5 ? 'No caminho certo, mas há um ponto frágil a resolver.'
                    : 'Atenção: o mês está apertado e pede ajuste.'}
                </div>
                <div style={{ fontSize: 12.5, color: K.ink2, lineHeight: 1.5, marginTop: 7 }}>
                  Você gastou <b>{S2.fmt0(h.totals.expenses)}</b> de <b>{S2.fmt0(h.totals.income)}</b> de renda
                  ({Math.round(h.totals.expenses / (h.totals.income || 1) * 100)}%), com <b>{Math.round(h.committed * 100)}%</b> já comprometido
                  em fixos, parcelas e dívidas. Sua reserva cobre <b>{h.reserveMonths.toFixed(1)} mês</b> de despesas.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
                  <Btn size="sm" onClick={() => onNavigate('Relatórios')}>ver relatório completo →</Btn>
                  <Btn size="sm" variant="outline" onClick={() => onNavigate('Metas')}>simular metas</Btn>
                  <Btn size="sm" variant="dashed" onClick={() => onNavigate('Dívidas')}>plano de dívidas</Btn>
                </div>
              </div>
            </div>
          </Cd>

          <Cd style={{ flex: 1, minHeight: 200 }}>
            <CdT sub="o que mexer para subir a nota" right={<AIBadge small />}>Prioridades</CdT>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {prios.map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '26px 1fr auto', gap: 11, padding: '11px 12px', border: `1.4px solid ${K.ink2}33`, borderRadius: 9, background: '#ffffff88' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 99, background: p.color, color: K.paper, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12 }}>{i + 1}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: p.color }}>{p.tag}</span>
                      <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.01em' }}>{p.title}</span>
                    </div>
                    <div style={{ fontSize: 12, color: K.ink2, marginTop: 4, lineHeight: 1.45 }}>{p.body}</div>
                  </div>
                  <div style={{ alignSelf: 'center', textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: K.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>impacto</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: K.green, whiteSpace: 'nowrap' }}>{p.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </Cd>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'auto' }}>
          <Cd pad={12} style={{ flexShrink: 0 }}>
            <CdT sub="6 meses de evolução">Histórico</CdT>
            <svg width="100%" viewBox={`0 0 ${sw} ${sh + 24}`} style={{ display: 'block' }}>
              <line x1="0" y1={sh - 0.5} x2={sw} y2={sh - 0.5} stroke={K.ink2} opacity="0.2" strokeDasharray="2 3" />
              <line x1="0" y1={sh * 0.5} x2={sw} y2={sh * 0.5} stroke={K.ink2} opacity="0.13" strokeDasharray="2 3" />
              <path d={`${path} L ${sw} ${sh} L 0 ${sh} Z`} fill={K.ink} opacity="0.06" />
              <path d={path} stroke={K.ink} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
              {pts.map((p, i) => {
                const last = i === pts.length - 1;
                return (
                  <g key={i}>
                    <circle cx={p[0]} cy={p[1]} r={last ? 4.5 : 2.8} fill={last ? K.green : K.paper} stroke={last ? K.paper : K.ink} strokeWidth={last ? 1.8 : 1.3} />
                    <text x={p[0]} y={sh + 13} textAnchor="middle" fontSize="9" fill={K.muted} fontFamily="Montserrat, sans-serif">{hist[i].label}</text>
                    <text x={p[0]} y={p[1] - 7} textAnchor="middle" fontSize="9" fontWeight="700" fill={last ? K.green : K.ink2} fontFamily="Montserrat, sans-serif">{hist[i].value.toFixed(1)}</text>
                  </g>
                );
              })}
            </svg>
          </Cd>

          <Cd pad={12} style={{ flex: 1, minHeight: 215, display: 'flex', flexDirection: 'column' }}>
            <CdT sub="6 dimensões avaliadas">Composição da nota</CdT>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {h.dims.map((d, i) => (
                <div key={i} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 11.5, gap: 8 }}>
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.k} <span style={{ color: K.muted, fontSize: 10 }}>· {d.note}</span>
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 12.5, color: d.color, flexShrink: 0 }}>{d.v.toFixed(1)}</span>
                  </div>
                  <Br pct={d.v * 10} color={d.color} height={5} delay={i * 50} />
                </div>
              ))}
            </div>
          </Cd>

          <Cd pad={12} style={{ background: K.ink, color: K.paper, border: `1.5px solid ${K.ink}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 54, height: 54, borderRadius: 9, background: h.score >= 7 ? K.green : h.score >= 5 ? K.amber : K.red, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 21, letterSpacing: '-0.03em', flexShrink: 0 }}>{h.score.toFixed(1)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase' }}>minha nota financeira</div>
                <div style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.01em', marginTop: 2 }}>{S2.monthLabel(month)} · {delta >= 0 ? `subiu ${delta.toFixed(1)}` : `caiu ${Math.abs(delta).toFixed(1)}`}</div>
                <div style={{ fontSize: 10.5, opacity: 0.7, marginTop: 1 }}>poupê · {state.people.map(p => p.name.toLowerCase()).join(' & ')}</div>
              </div>
              <Btn size="sm" variant="primary" tone={K.paper} style={{ color: K.ink }} onClick={() => alert('Card de compartilhamento gerado!')}>↗ post</Btn>
            </div>
          </Cd>
        </div>
      </div>
      <Fab onClick={onOpenModal} />
    </div>
  );
}

// ── Simulação de quitação ──────────────────────────────────────────
function simulatePayoff(debts, strategy, extra = 0) {
  const live = debts.map(d => ({ ...d, rem: d.total - d.paid })).filter(d => d.rem > 0.01);
  if (!live.length) return { months: 0, milestones: [], interest: 0, order: [] };
  const order = [...live].sort((a, b) => strategy === 'avalanche' ? b.rate - a.rate : a.rem - b.rem);
  const budget = live.reduce((s, d) => s + d.min, 0) + extra;
  const rem = {}; live.forEach(d => { rem[d.id] = d.rem; });
  const milestones = []; let interest = 0, month = 0;
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
function Dividas({ onNavigate, onOpenModal }) {
  const { state, actions } = S2.useStore();
  const [strategy, setStrategy] = React.useState('avalanche');
  const [extra, setExtra] = React.useState(0);
  const [addOpen, setAddOpen] = React.useState(false);
  const [payFor, setPayFor] = React.useState(null);
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
  const personName = id => (state.people.find(p => p.id === id) || {}).name || '—';

  const doAdd = () => {
    if (!nd.name.trim() || !(Number(nd.total) > 0)) return;
    actions.addDebt({ name: nd.name.trim(), total: Number(nd.total), rate: Number(nd.rate) || 0, min: Number(nd.min) || Math.round(Number(nd.total) / 12), personId: nd.personId || state.people[0].id });
    setNd({ name: '', total: '', rate: '', min: '', personId: '' }); setAddOpen(false);
  };
  const doPay = () => { if (!(Number(payAmt) > 0)) return; actions.payDebt(payFor.id, Number(payAmt)); setPayFor(null); setPayAmt(''); };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: K.paper, overflow: 'hidden' }}>
      <TBar activeTab="Dívidas" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12, padding: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 12, flexShrink: 0 }}>
          <Cd>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9.5, color: K.muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>dívida total restante</div>
                <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em', marginTop: 3, color: totalRemaining > 0 ? K.red : K.green, lineHeight: 1.05 }}>{S2.fmt0(totalRemaining)}</div>
                <div style={{ fontSize: 11.5, color: K.muted, marginTop: 5 }}>pago <b style={{ color: K.green }}>{S2.fmt0(totalPaid)}</b> de {S2.fmt0(totalAll)}</div>
                <div style={{ marginTop: 8, maxWidth: 340 }}>
                  <Br pct={(totalPaid / totalAll) * 100} color={K.green} height={7} />
                  <div style={{ fontSize: 10.5, color: K.muted, marginTop: 4 }}>{Math.round(totalPaid / totalAll * 100)}% quitado</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 9.5, color: K.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>livre em</div>
                <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', color: K.green, lineHeight: 1, marginTop: 3 }}>
                  {sim.months} <span style={{ fontSize: 12, color: K.muted, fontWeight: 500 }}>meses</span>
                </div>
                <div style={{ fontSize: 10.5, color: K.muted, marginTop: 3 }}>≈ {S2.monthShort(S2.addMonths(state.ui.month, sim.months))}</div>
                {saves > 1 && <div style={{ fontSize: 10, color: K.green, fontWeight: 700, marginTop: 5 }}>↓ economiza {S2.fmt0(saves)} em juros</div>}
              </div>
            </div>
          </Cd>

          <Cd>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <AIBadge small /><span style={{ fontSize: 9.5, color: K.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>estratégia</span>
            </div>
            <KSw value={strategy} onChange={setStrategy} size="md" options={[
              { key: 'avalanche', label: 'Avalanche', hint: 'maior juro primeiro' },
              { key: 'bolaneve', label: 'Bola de neve', hint: 'menor saldo primeiro' },
            ]} />
            <div style={{ fontSize: 11.5, color: K.ink2, lineHeight: 1.45, marginTop: 9 }}>
              {strategy === 'avalanche'
                ? <>A <b>avalanche</b> ataca o maior juro primeiro — matematicamente o caminho mais barato.</>
                : <>A <b>bola de neve</b> quita as menores primeiro — vitórias rápidas que mantêm a motivação.</>}
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ fontSize: 10.5, color: K.muted, fontWeight: 600, whiteSpace: 'nowrap' }}>aporte extra/mês</span>
              <input type="range" min="0" max="2000" step="50" value={extra} onChange={e => setExtra(Number(e.target.value))} style={{ flex: 1, accentColor: K.green, cursor: 'pointer' }} />
              <span style={{ fontWeight: 700, fontSize: 12.5, color: K.green, minWidth: 66, textAlign: 'right' }}>{S2.fmt0(extra)}</span>
            </div>
          </Cd>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 12, flex: 1, minHeight: 0 }}>
          <Cd style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <CdT sub={`ordem ${strategy === 'avalanche' ? 'por taxa de juros' : 'por menor saldo'}`}
              right={<Btn size="sm" variant="outline" onClick={() => setAddOpen(true)}>+ dívida</Btn>}>Plano de quitação</CdT>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {ordered.length === 0 ? <Empty icon="🎉" title="Sem dívidas!" hint="Você está livre. Bora focar nas metas." /> :
                ordered.map((d, i) => {
                  const rem = d.total - d.paid, pct = (d.paid / d.total) * 100, focus = i === 0;
                  const ms = sim.milestones.find(m => m.id === d.id);
                  return (
                    <div key={d.id} style={{ padding: '10px 12px', border: `${focus ? 1.8 : 1.4}px solid ${focus ? d.color : K.ink2 + '44'}`, borderRadius: 9, background: focus ? `${d.color}0e` : '#ffffff88', position: 'relative' }}>
                      {focus && <span style={{ position: 'absolute', top: -8, left: 10, padding: '2px 8px', borderRadius: 99, background: d.color, color: K.paper, fontSize: 8.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>foco agora</span>}
                      <div style={{ display: 'grid', gridTemplateColumns: '22px 1fr 92px 74px 30px', gap: 9, alignItems: 'center' }}>
                        <div style={{ width: 22, height: 22, borderRadius: 99, background: d.color, color: K.paper, display: 'grid', placeItems: 'center', fontSize: 10.5, fontWeight: 800 }}>{i + 1}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.01em' }}>{d.name}</span>
                            <span style={{ fontSize: 10.5, color: K.muted }}>{personName(d.personId)}</span>
                            <span style={{ padding: '1px 6px', borderRadius: 3, fontSize: 9.5, fontWeight: 700,
                              background: d.rate >= 10 ? `${K.red}22` : d.rate > 0 ? `${K.amber}22` : `${K.green}22`,
                              color: d.rate >= 10 ? K.red : d.rate > 0 ? K.amber : K.green }}>{d.rate === 0 ? 'sem juros' : `${d.rate}% a.m.`}</span>
                            {ms && <span style={{ fontSize: 9.5, color: K.muted }}>quita em {ms.month}m</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                            <div style={{ flex: 1 }}><Br pct={pct} color={d.color} height={5} /></div>
                            <span style={{ fontSize: 10.5, color: K.muted, minWidth: 28, textAlign: 'right' }}>{Math.round(pct)}%</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap' }}>{S2.fmt0(rem)}</div>
                          <div style={{ fontSize: 9.5, color: K.muted }}>mín {S2.fmt0(d.min)}</div>
                        </div>
                        <Btn size="sm" variant="outline" tone={d.color} onClick={() => { setPayFor(d); setPayAmt(String(d.min)); }}>pagar</Btn>
                        <IBtn onClick={() => actions.delDebt(d.id)} title="Remover" tone={K.red} size={22}>×</IBtn>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Cd>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
            <Cd pad={12} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <CdT sub="marcos até ficar livre">Cronograma</CdT>
              <div style={{ position: 'relative', paddingLeft: 22, flex: 1, minHeight: 0, overflow: 'auto' }}>
                <div style={{ position: 'absolute', left: 7, top: 4, bottom: 4, width: 1.5, background: K.ink2, opacity: 0.3 }} />
                <div style={{ position: 'relative', paddingBottom: 13 }}>
                  <div style={{ position: 'absolute', left: -20, top: 2, width: 13, height: 13, borderRadius: 99, background: K.paper, border: `2px solid ${K.ink}` }} />
                  <div style={{ fontSize: 9.5, color: K.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{S2.monthShort(state.ui.month)}</div>
                  <div style={{ fontWeight: 700, fontSize: 12.5, marginTop: 1 }}>Hoje</div>
                </div>
                {sim.milestones.map((m, i) => (
                  <div key={m.id} style={{ position: 'relative', paddingBottom: 13 }}>
                    <div style={{ position: 'absolute', left: -20, top: 2, width: 13, height: 13, borderRadius: 99, background: m.color, border: `2px solid ${m.color}` }} />
                    <div style={{ fontSize: 9.5, color: K.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{S2.monthShort(S2.addMonths(state.ui.month, m.month))}</div>
                    <div style={{ fontWeight: 600, fontSize: 12.5, marginTop: 1 }}>Quita {m.name}</div>
                  </div>
                ))}
                {sim.months > 0 && (
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: -22, top: 0, width: 17, height: 17, borderRadius: 99, background: K.green, display: 'grid', placeItems: 'center' }}>
                      <span style={{ color: K.paper, fontSize: 9, fontWeight: 800 }}>✓</span>
                    </div>
                    <div style={{ fontSize: 9.5, color: K.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{S2.monthShort(S2.addMonths(state.ui.month, sim.months))}</div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: K.green, letterSpacing: '-0.01em', marginTop: 1 }}>Livre de dívidas</div>
                  </div>
                )}
              </div>
            </Cd>

            <Cd pad={12} style={{ background: K.green, color: K.paper, border: `1.5px solid ${K.green}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 9, opacity: 0.75, letterSpacing: '0.12em', textTransform: 'uppercase' }}>orçamento do plano</div>
                  <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', marginTop: 3 }}>{S2.fmt0(sim.budget || 0)} por mês</div>
                  <div style={{ fontSize: 10.5, opacity: 0.8, marginTop: 2 }}>mínimos + {S2.fmt0(extra)} de aporte extra</div>
                </div>
                <div style={{ width: 50, height: 50, borderRadius: 99, background: K.paper, color: K.green, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 17, flexShrink: 0 }}>{sim.months}m</div>
              </div>
            </Cd>
          </div>
        </div>
      </div>

      <Mdl open={addOpen} onClose={() => setAddOpen(false)} title="Nova dívida" width={420}
        footer={<><Btn variant="ghost" onClick={() => setAddOpen(false)}>cancelar</Btn><Btn onClick={doAdd} disabled={!nd.name.trim() || !(Number(nd.total) > 0)}>adicionar</Btn></>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Fld label="nome" style={{ gridColumn: '1 / -1' }}><Inp value={nd.name} onChange={v => setNd({ ...nd, name: v })} placeholder="Cartão, financiamento…" /></Fld>
          <Fld label="valor total"><Money value={nd.total} onChange={v => setNd({ ...nd, total: v })} accent={K.red} /></Fld>
          <Fld label="juros % ao mês"><Inp type="number" step="0.1" value={nd.rate} onChange={v => setNd({ ...nd, rate: v })} placeholder="0" /></Fld>
          <Fld label="parcela mínima"><Money value={nd.min} onChange={v => setNd({ ...nd, min: v })} /></Fld>
          <Fld label="quem"><Sel value={nd.personId} onChange={v => setNd({ ...nd, personId: v })} options={state.people.map(p => ({ value: p.id, label: p.name }))} placeholder="—" /></Fld>
        </div>
      </Mdl>

      <Mdl open={!!payFor} onClose={() => setPayFor(null)} title={`Pagar ${payFor ? payFor.name : ''}`} width={380}
        footer={<><Btn variant="ghost" onClick={() => setPayFor(null)}>cancelar</Btn><Btn tone={K.green} onClick={doPay} disabled={!(Number(payAmt) > 0)}>registrar pagamento</Btn></>}>
        {payFor && (
          <>
            <div style={{ fontSize: 12.5, color: K.ink2, marginBottom: 12 }}>
              Restam <b>{S2.fmt0(payFor.total - payFor.paid)}</b> dessa dívida.
            </div>
            <Fld label="valor do pagamento"><Money value={payAmt} onChange={setPayAmt} accent={K.green} onEnter={doPay} /></Fld>
            <div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
              {[payFor.min, payFor.min * 2, payFor.total - payFor.paid].map((v, i) => (
                <Cp key={i} onClick={() => setPayAmt(String(Math.round(v)))}>{i === 2 ? 'quitar tudo' : S2.fmt0(v)}</Cp>
              ))}
            </div>
          </>
        )}
      </Mdl>

      <Fab onClick={onOpenModal} />
    </div>
  );
}

// ── Tela: Metas ────────────────────────────────────────────────────
function Metas({ onNavigate, onOpenModal }) {
  const { state, actions } = S2.useStore();
  const month = state.ui.month;
  const t = S2.totalsFor(state, month);
  const [mode, setMode] = React.useState('atual');
  const [addOpen, setAddOpen] = React.useState(false);
  const [contribFor, setContribFor] = React.useState(null);
  const [contribAmt, setContribAmt] = React.useState('');
  const [ng, setNg] = React.useState({ name: '', target: '', emoji: '🎯' });

  const goals = state.goals;
  const activeId = state.ui.activeGoalId || (goals[0] || {}).id;
  const goal = goals.find(g => g.id === activeId) || goals[0];

  const surplus = Math.max(0, t.balance);
  const cuts = React.useMemo(() => {
    const rows = S2.byCategory(state, month).filter(r => !/salário|contas/i.test(r.cat.name)).slice(0, 5);
    return rows.map(r => ({ name: r.cat.name, color: r.cat.color, cur: r.value, save: Math.round(r.value * 0.3) }));
  }, [state, month]);
  const totalSave = cuts.reduce((s, c) => s + c.save, 0);

  const scenarios = {
    atual: { aporte: Math.max(50, Math.round(surplus * 0.4)), label: 'Ritmo atual', sub: 'sem mexer em nada', color: K.ink },
    cortes: { aporte: Math.max(50, Math.round(surplus * 0.4) + totalSave), label: 'Com cortes da IA', sub: `+${S2.fmt0(totalSave)}/mês economizados`, color: K.green },
    turbo: { aporte: Math.max(50, Math.round(surplus * 0.4) + totalSave + 500), label: 'Modo turbinado', sub: 'cortes + renda extra', color: K.gold },
  };
  const monthsFor = a => goal ? Math.max(1, Math.ceil((goal.target - goal.current) / Math.max(1, a))) : 0;
  const active = scenarios[mode];
  const activeMonths = monthsFor(active.aporte);
  const baseMonths = monthsFor(scenarios.atual.aporte);

  const cw = 600, ch = 190, pL = 48, pR = 18, pT = 14, pB = 26;
  const iw = cw - pL - pR, ih = ch - pT - pB;
  const maxM = Math.max(baseMonths, 1);
  const xAt = m => pL + (Math.min(m, maxM) / maxM) * iw;
  const yAt = v => pT + ih - (v / (goal ? goal.target : 1)) * ih;
  const lineFor = a => {
    const n = monthsFor(a); const pts = [];
    for (let i = 0; i <= n; i++) pts.push(`${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(Math.min(goal.target, goal.current + a * i))}`);
    return pts.join(' ');
  };

  const doAdd = () => {
    if (!ng.name.trim() || !(Number(ng.target) > 0)) return;
    actions.addGoal({ name: ng.name.trim(), target: Number(ng.target), emoji: ng.emoji || '🎯' });
    setNg({ name: '', target: '', emoji: '🎯' }); setAddOpen(false);
  };
  const doContrib = () => { if (!(Number(contribAmt) > 0)) return; actions.contributeGoal(contribFor.id, Number(contribAmt)); setContribFor(null); setContribAmt(''); };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: K.paper, overflow: 'hidden' }}>
      <TBar activeTab="Metas" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '200px 1fr 290px', gap: 13, padding: 16 }}>
        {/* Rail de metas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minHeight: 0, overflow: 'auto' }}>
          <div style={{ fontSize: 9.5, color: K.muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '2px 2px' }}>suas metas</div>
          {goals.map(g => {
            const pct = (g.current / g.target) * 100, on = g.id === activeId;
            return (
              <div key={g.id} onClick={() => actions.setActiveGoal(g.id)}
                style={{ padding: 11, border: `${on ? 1.8 : 1.4}px solid ${on ? g.color : K.ink2 + '3a'}`, borderRadius: 10, background: on ? `${g.color}0e` : K.paper, cursor: 'pointer', transition: 'all .15s', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: g.color, color: K.paper, display: 'grid', placeItems: 'center', fontSize: 14, flexShrink: 0 }}>{g.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12.5, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</div>
                    <div style={{ fontSize: 9.5, color: K.muted, marginTop: 1 }}>{S2.fmt0(g.target)}</div>
                  </div>
                  <IBtn onClick={e => { e.stopPropagation(); actions.delGoal(g.id); }} title="Remover" tone={K.red} size={20}>×</IBtn>
                </div>
                <div style={{ marginTop: 7 }}>
                  <Br pct={pct} color={g.color} height={4} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 9.5, color: K.muted }}>
                    <span>{S2.fmt0(g.current)}</span><span style={{ fontWeight: 700, color: on ? g.color : K.ink2 }}>{Math.round(pct)}%</span>
                  </div>
                </div>
                {on && <div style={{ marginTop: 8 }}><Btn size="sm" full tone={g.color} onClick={e => { e.stopPropagation(); setContribFor(g); setContribAmt(String(scenarios.atual.aporte)); }}>+ aportar</Btn></div>}
              </div>
            );
          })}
          <Btn variant="dashed" full onClick={() => setAddOpen(true)}>+ nova meta</Btn>
        </div>

        {/* Centro */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, minHeight: 0, overflow: 'auto' }}>
          {!goal ? <Empty icon="🎯" title="Nenhuma meta ainda" hint="Crie sua primeira meta para simular quanto tempo leva." action={<Btn onClick={() => setAddOpen(true)}>criar meta</Btn>} /> : <>
            <Cd style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: goal.color, color: K.paper, display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0 }}>{goal.emoji}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 9.5, color: K.muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>meta ativa</div>
                      <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginTop: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', lineHeight: 1 }}>{S2.fmt0(goal.current)}</span>
                    <span style={{ fontSize: 12, color: K.muted }}>de {S2.fmt0(goal.target)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 6 }}>
                    <div style={{ flex: 1 }}><Br pct={(goal.current / goal.target) * 100} color={goal.color} height={7} /></div>
                    <span style={{ fontWeight: 700, fontSize: 12.5, color: goal.color }}>{Math.round(goal.current / goal.target * 100)}%</span>
                  </div>
                </div>
                <div style={{ borderLeft: `1px dashed ${K.ink2}33`, paddingLeft: 14, textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 9.5, color: K.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>previsão</div>
                  <div style={{ fontWeight: 800, fontSize: 27, letterSpacing: '-0.03em', color: active.color, lineHeight: 1, marginTop: 3 }}>
                    {activeMonths} <span style={{ fontSize: 12, color: K.muted, fontWeight: 500 }}>meses</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: K.muted, marginTop: 3 }}>≈ {S2.monthShort(S2.addMonths(month, activeMonths))}</div>
                  {mode !== 'atual' && baseMonths > activeMonths && <div style={{ fontSize: 10, color: K.green, fontWeight: 700, marginTop: 5 }}>↓ {baseMonths - activeMonths} meses mais rápido</div>}
                </div>
              </div>
            </Cd>

            <Cd style={{ flex: 1, minHeight: 170, display: 'flex', flexDirection: 'column' }}>
              <CdT sub="acúmulo mês a mês até bater a meta" right={
                <div style={{ display: 'flex', gap: 8, fontSize: 10, color: K.muted, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {[['atual', K.ink, ''], ['cortes', K.green, '4 2'], ['turbo', K.gold, '2 2']].map(([l, c, d]) => (
                    <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <svg width="13" height="3"><line x1="0" y1="1.5" x2="13" y2="1.5" stroke={c} strokeWidth="2" strokeDasharray={d} /></svg>{l}
                    </span>
                  ))}
                </div>
              }>Evolução até a meta</CdT>
              <div style={{ flex: 1, minHeight: 0, display: 'grid', placeItems: 'center' }}>
                <svg viewBox={`0 0 ${cw} ${ch}`} width="100%" style={{ maxHeight: 200 }}>
                  {[0, .25, .5, .75, 1].map(p => {
                    const y = pT + ih - p * ih;
                    return (
                      <g key={p}>
                        <line x1={pL} y1={y} x2={cw - pR} y2={y} stroke={K.ink2} opacity={p === 1 ? 0.35 : 0.13} strokeDasharray={p === 1 ? '4 3' : '2 3'} />
                        <text x={pL - 6} y={y + 3.5} textAnchor="end" fontSize="9" fill={K.muted} fontFamily="Montserrat, sans-serif">{p === 1 ? 'meta' : `${Math.round(p * goal.target / 1000)}k`}</text>
                      </g>
                    );
                  })}
                  {[0, Math.round(maxM / 3), Math.round(maxM * 2 / 3), maxM].map((m, i) => (
                    <text key={i} x={xAt(m)} y={ch - 8} textAnchor="middle" fontSize="9" fill={K.muted} fontFamily="Montserrat, sans-serif">{m === 0 ? 'hoje' : `${m}m`}</text>
                  ))}
                  <path d={lineFor(scenarios.atual.aporte)} stroke={K.ink} strokeWidth={mode === 'atual' ? 2.6 : 1.6} fill="none" opacity={mode === 'atual' ? 1 : 0.45} strokeLinejoin="round" />
                  <path d={lineFor(scenarios.cortes.aporte)} stroke={K.green} strokeWidth={mode === 'cortes' ? 2.6 : 1.6} fill="none" strokeDasharray="5 3" opacity={mode === 'cortes' ? 1 : 0.45} />
                  <path d={lineFor(scenarios.turbo.aporte)} stroke={K.gold} strokeWidth={mode === 'turbo' ? 2.6 : 1.6} fill="none" strokeDasharray="3 3" opacity={mode === 'turbo' ? 1 : 0.45} />
                  <circle cx={xAt(activeMonths)} cy={yAt(goal.target)} r="5" fill={active.color} stroke={K.paper} strokeWidth="2" />
                  <circle cx={xAt(0)} cy={yAt(goal.current)} r="3.5" fill={K.ink} />
                  <text x={xAt(0) + 7} y={yAt(goal.current) - 6} fontSize="9" fontWeight="700" fill={K.ink} fontFamily="Montserrat, sans-serif">{S2.fmt0(goal.current)}</text>
                </svg>
              </div>
            </Cd>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9, flexShrink: 0 }}>
              {Object.entries(scenarios).map(([key, s]) => {
                const on = mode === key, m = monthsFor(s.aporte);
                return (
                  <div key={key} onClick={() => setMode(key)}
                    style={{ padding: 11, border: `${on ? 1.8 : 1.4}px solid ${on ? s.color : K.ink2 + '3a'}`, borderRadius: 10, background: on ? `${s.color}0e` : K.paper, cursor: 'pointer', position: 'relative', transition: 'all .15s' }}>
                    {on && <span style={{ position: 'absolute', top: -8, right: 9, padding: '2px 7px', borderRadius: 99, background: s.color, color: K.paper, fontSize: 8.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>simulando</span>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 12.5, letterSpacing: '-0.01em' }}>{s.label}</span>
                      <span style={{ fontWeight: 800, fontSize: 14, color: s.color, letterSpacing: '-0.02em' }}>{m}m</span>
                    </div>
                    <div style={{ fontSize: 10.5, color: K.muted, marginTop: 2, lineHeight: 1.35 }}>{s.sub}</div>
                    <div style={{ marginTop: 7, fontSize: 10.5, color: K.ink2 }}>aporte <b style={{ color: s.color }}>{S2.fmt0(s.aporte)}/mês</b></div>
                  </div>
                );
              })}
            </div>
          </>}
        </div>

        {/* Direita */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, minHeight: 0, overflow: 'auto' }}>
          <Cd pad={12} style={{ flexShrink: 0 }}>
            <CdT sub="calculado dos seus lançamentos">Parâmetros</CdT>
            {[
              ['renda mensal', S2.fmt0(t.income), K.green],
              ['gastos mensais', S2.fmt0(t.expenses), K.red],
              ['sobra', S2.fmt0(t.balance), K.ink, true],
              ['aporte simulado', S2.fmt0(active.aporte), K.blue],
              ['objetivo', goal ? S2.fmt0(goal.target) : '—', K.green],
            ].map(([l, v, c, computed], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '7px 9px', marginBottom: 6, border: computed ? `1.4px dashed ${K.ink2}55` : `1.4px solid ${K.ink2}3a`, borderRadius: 7, background: computed ? K.paper2 : K.paper }}>
                <span style={{ fontSize: 10, color: K.muted, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{l}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: c, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{v}</span>
              </div>
            ))}
          </Cd>

          <Cd pad={12} style={{ flex: 1, minHeight: 150, display: 'flex', flexDirection: 'column' }}>
            <CdT sub={`economiza ${S2.fmt0(totalSave)}/mês`} right={<AIBadge small />}>Cortes sugeridos</CdT>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {cuts.length === 0 ? <Empty icon="✂️" title="Sem sugestões" hint="Lance mais gastos para a IA analisar." /> :
                cuts.map((c, i) => (
                  <div key={i} style={{ padding: '8px 9px', border: `1.3px solid ${K.ink2}2a`, borderRadius: 7, background: '#ffffff88', display: 'grid', gridTemplateColumns: '4px 1fr auto', gap: 8, alignItems: 'center' }}>
                    <span style={{ width: 4, alignSelf: 'stretch', background: c.color, borderRadius: 99, minHeight: 26 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 11.5, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                      <div style={{ fontSize: 9.5, color: K.muted, marginTop: 2 }}>hoje {S2.fmt0(c.cur)} · reduzir 30%</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: K.green, whiteSpace: 'nowrap' }}>−{S2.fmt0(c.save)}</div>
                      <div style={{ fontSize: 8.5, color: K.muted }}>/mês</div>
                    </div>
                  </div>
                ))}
            </div>
            {cuts.length > 0 && (
              <div style={{ marginTop: 9, padding: '9px 11px', background: K.green, color: K.paper, borderRadius: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 9, opacity: 0.75, letterSpacing: '0.08em', textTransform: 'uppercase' }}>total economizado</div>
                  <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>{S2.fmt0(totalSave)}/mês</div>
                </div>
                <Btn size="sm" tone={K.paper} style={{ color: K.green }} onClick={() => setMode('cortes')}>simular →</Btn>
              </div>
            )}
          </Cd>
        </div>
      </div>

      <Mdl open={addOpen} onClose={() => setAddOpen(false)} title="Nova meta" width={400}
        footer={<><Btn variant="ghost" onClick={() => setAddOpen(false)}>cancelar</Btn><Btn tone={K.green} onClick={doAdd} disabled={!ng.name.trim() || !(Number(ng.target) > 0)}>criar meta</Btn></>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Fld label="nome da meta"><Inp value={ng.name} onChange={v => setNg({ ...ng, name: v })} placeholder="Viagem, carro novo…" accent={K.green} /></Fld>
          <Fld label="valor objetivo"><Money value={ng.target} onChange={v => setNg({ ...ng, target: v })} accent={K.green} /></Fld>
          <Fld label="ícone">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['🎯', '🏠', '✈️', '🚗', '🛟', '💍', '🎓', '💻'].map(e => (
                <Cp key={e} active={ng.emoji === e} color={K.green} onClick={() => setNg({ ...ng, emoji: e })} style={{ fontSize: 16, padding: '5px 10px' }}>{e}</Cp>
              ))}
            </div>
          </Fld>
        </div>
      </Mdl>

      <Mdl open={!!contribFor} onClose={() => setContribFor(null)} title={`Aportar em ${contribFor ? contribFor.name : ''}`} width={380}
        footer={<><Btn variant="ghost" onClick={() => setContribFor(null)}>cancelar</Btn><Btn tone={K.green} onClick={doContrib} disabled={!(Number(contribAmt) > 0)}>confirmar aporte</Btn></>}>
        {contribFor && (
          <>
            <div style={{ fontSize: 12.5, color: K.ink2, marginBottom: 12 }}>
              Faltam <b>{S2.fmt0(contribFor.target - contribFor.current)}</b> para bater essa meta.
            </div>
            <Fld label="valor do aporte"><Money value={contribAmt} onChange={setContribAmt} accent={K.green} onEnter={doContrib} /></Fld>
            <div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
              {[100, 500, scenarios.atual.aporte].map((v, i) => <Cp key={i} onClick={() => setContribAmt(String(v))}>{S2.fmt0(v)}</Cp>)}
            </div>
          </>
        )}
      </Mdl>

      <Fab onClick={onOpenModal} />
    </div>
  );
}

// ── Tela: Relatórios ───────────────────────────────────────────────
function Relatorios({ onNavigate, onOpenModal }) {
  const { state } = S2.useStore();
  const { month, personId } = state.ui;
  const [view, setView] = React.useState('categoria');

  const months = React.useMemo(() => {
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const m = S2.addMonths(month, -i);
      const t = S2.totalsFor(state, m, personId);
      out.push({ m, label: S2.MONTHS_PT[Number(m.slice(5, 7)) - 1], ...t });
    }
    return out;
  }, [state, month, personId]);
  const maxBar = Math.max(1, ...months.map(x => Math.max(x.income, x.expenses)));

  const t = S2.totalsFor(state, month, personId);
  const cats = S2.byCategory(state, month, personId);
  const types = S2.byType(state, month, personId);
  const people = S2.byPerson(state, month);
  const topExpenses = [...t.items.comuns, ...t.items.fixos, ...t.items.parcelas].sort((a, b) => b.amount - a.amount).slice(0, 8);
  const catName = id => (state.categories.find(c => c.id === id) || {}).name || '—';
  const catColor = id => (state.categories.find(c => c.id === id) || {}).color || K.muted;

  const rows = view === 'categoria' ? cats.map(r => ({ label: r.cat.name, color: r.cat.color, value: r.value }))
    : view === 'pagamento' ? types.map(r => ({ label: r.type.name, color: r.type.color, value: r.value }))
    : people.map(r => ({ label: r.person.name, color: r.person.color, value: r.value }));
  const rowsTotal = rows.reduce((s, r) => s + r.value, 0) || 1;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: K.paper, overflow: 'hidden' }}>
      <TBar activeTab="Relatórios" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <Cd style={{ flexShrink: 0 }}>
            <CdT sub="entradas vs gastos nos últimos 6 meses">Evolução mensal</CdT>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 130, paddingTop: 6 }}>
              {months.map(x => {
                const on = x.m === month;
                return (
                  <div key={x.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 0 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 3, width: '100%', justifyContent: 'center' }}>
                      <div title={`entradas ${S2.fmt0(x.income)}`} style={{ width: '38%', height: `${(x.income / maxBar) * 100}%`, background: K.green, borderRadius: '3px 3px 0 0', opacity: on ? 1 : 0.5, transition: 'height .5s, opacity .2s', minHeight: 2 }} />
                      <div title={`gastos ${S2.fmt0(x.expenses)}`} style={{ width: '38%', height: `${(x.expenses / maxBar) * 100}%`, background: K.red, borderRadius: '3px 3px 0 0', opacity: on ? 1 : 0.5, transition: 'height .5s, opacity .2s', minHeight: 2 }} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: on ? 700 : 500, color: on ? K.ink : K.muted }}>{x.label}</div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: x.balance >= 0 ? K.green : K.red }}>{x.balance >= 0 ? '+' : ''}{Math.round(x.balance / 100) / 10}k</div>
                  </div>
                );
              })}
            </div>
          </Cd>

          <Cd style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CdT sub={`${S2.monthLabel(month)} · ${rows.length} linhas`} right={
              <div style={{ display: 'flex', gap: 6 }}>
                {['categoria', 'pagamento', 'pessoa'].map(v => <Cp key={v} active={view === v} onClick={() => setView(v)}>{v}</Cp>)}
              </div>
            }>Quebra por {view}</CdT>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {rows.length === 0 ? <Empty icon="📊" title="Sem dados nesse mês" hint="Lance alguns gastos para ver o relatório." /> :
                rows.map((r, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 12.5, marginBottom: 3, gap: 10 }}>
                      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ width: 8, height: 8, borderRadius: 99, background: r.color, display: 'inline-block', marginRight: 7 }} />{r.label}
                      </span>
                      <span style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                        <span style={{ color: K.muted, fontSize: 11 }}>{Math.round(r.value / rowsTotal * 100)}%</span>
                        <span style={{ fontWeight: 700 }}>{S2.fmt(r.value)}</span>
                      </span>
                    </div>
                    <Br pct={(r.value / (rows[0]?.value || 1)) * 100} color={r.color} height={6} delay={i * 40} />
                  </div>
                ))}
            </div>
            <div style={{ borderTop: `1.5px solid ${K.ink}`, marginTop: 8, paddingTop: 9, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15 }}>
              <span>Total</span><span>{S2.fmt(rowsTotal)}</span>
            </div>
          </Cd>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'auto', paddingBottom: 56 }}>
          <Cd pad={12} style={{ flexShrink: 0 }}>
            <CdT sub="resumo do mês">Números do mês</CdT>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {[['entradas', t.income, K.green], ['gastos', t.expenses, K.red], ['saldo', t.balance, t.balance >= 0 ? K.green : K.red], ['comprometido', t.fixo + t.parcela, K.amber]].map(([l, v, c]) => (
                <div key={l} style={{ padding: 9, border: `1.3px solid ${K.ink2}2a`, borderRadius: 8, background: K.paper2 }}>
                  <div style={{ fontSize: 9, color: K.muted, letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 700 }}>{l}</div>
                  <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.025em', color: c, marginTop: 3 }}>{S2.fmt0(v)}</div>
                </div>
              ))}
            </div>
          </Cd>

          <Cd pad={12} style={{ flex: 1, minHeight: 170, display: 'flex', flexDirection: 'column' }}>
            <CdT sub="onde mais saiu dinheiro">Maiores gastos</CdT>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {topExpenses.length === 0 ? <Empty icon="💸" title="Sem gastos nesse mês" /> :
                topExpenses.map((x, i) => (
                  <Rw key={x.id + i} last={i === topExpenses.length - 1}>
                    <div style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto', gap: 8, alignItems: 'center', padding: '7px 2px', fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: catColor(x.categoryId) }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {x.desc}{x.installment ? ` (${x.installment}/${x.totalInstallments})` : ''}
                        <span style={{ color: K.muted, fontSize: 10, marginLeft: 6 }}>{catName(x.categoryId)}</span>
                      </span>
                      <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{S2.fmt0(x.amount)}</span>
                    </div>
                  </Rw>
                ))}
            </div>
          </Cd>
        </div>
      </div>
      <Fab onClick={onOpenModal} />
    </div>
  );
}

window.PoupeInsights = { Diagnostico, Dividas, Metas, Relatorios, AIBadge, ScoreGauge };
