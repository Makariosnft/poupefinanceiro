/* global React */
// Simulador de metas financeiras com IA

const G_ink = '#1a1815';
const G_ink2 = '#4a463f';
const G_muted = '#8a857a';
const G_paper = '#fbf8f1';
const G_paper2 = '#f3eee2';
const G_green = '#2f5a48';
const G_red = '#b04a3a';
const G_amber = '#c97a3a';
const G_blue = '#3a6a8a';
const G_gold = '#d4a24a';

function GBox({ children, style = {}, ...rest }) {
  return (
    <div style={{
      border: `1.5px solid ${G_ink}`, borderRadius: 8, padding: 14, background: G_paper, ...style,
    }} {...rest}>{children}</div>
  );
}

function GTitle({ children, sub, right }) {
  const w = Math.min(140, String(children).length * 9);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10, gap: 12 }}>
      <div>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 17, color: G_ink, lineHeight: 1 }}>
          {children}
        </div>
        {sub && <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: G_muted, marginTop: 5 }}>{sub}</div>}
        <svg width={w} height="5" style={{ display: 'block', marginTop: 3 }}>
          <path d={`M 1 2.5 Q ${w*0.3} 0 ${w*0.5} 2.5 T ${w-1} 2.5`} stroke={G_ink} strokeWidth="1.4" fill="none" />
        </svg>
      </div>
      {right}
    </div>
  );
}

function GAIBadge({ small }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: small ? '2px 7px' : '3px 9px',
      background: G_blue, color: G_paper, borderRadius: 99,
      fontFamily: 'Montserrat, sans-serif', fontSize: small ? 9 : 10,
      fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase',
    }}>
      <svg width="9" height="9" viewBox="0 0 12 12"><path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="currentColor" /></svg>
      IA
    </span>
  );
}

function GTopBar({ activeTab = 'Metas', onNavigate }) {
  const tabs = ['Lançamentos', 'Gastos do mês', 'Fixos', 'Parcelamentos', 'Diagnóstico', 'Dívidas', 'Metas', 'Relatórios'];
  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return (
    <div style={{ borderBottom: `1.5px solid ${G_ink}`, background: G_paper }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 10px', gap: 6 }}>
        <img src={window.__resources.poupeLogo} alt="Poupê" style={{ height: 24, display: 'block' }} />
        <nav style={{ display: 'flex', gap: 3, marginLeft: 4, flexShrink: 1, minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {tabs.map(t => (
            <div key={t} onClick={() => onNavigate && onNavigate(t)} style={{
              padding: '5px 3px', cursor: onNavigate ? 'pointer' : 'default', whiteSpace: 'nowrap',
              fontFamily: 'Montserrat, sans-serif', fontSize: 11,
              fontWeight: 600,
              color: t === activeTab ? G_ink : G_ink2,
              borderBottom: t === activeTab ? `2.5px solid ${G_ink}` : '2.5px solid transparent',
              marginBottom: -1,
            }}>{t}</div>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: G_muted }}>quem:</span>
          {['Todos', 'Davi', 'Eduarda'].map(p => (
            <span key={p} style={{
              padding: '2px 5px',
              border: `1.4px solid ${p === 'Todos' ? G_ink : G_ink2}`,
              borderRadius: 99,
              background: p === 'Todos' ? G_ink : 'transparent',
              color: p === 'Todos' ? G_paper : G_ink,
              fontFamily: 'Montserrat, sans-serif', fontSize: 9.5,
            }}>{p}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', padding: '0 10px 8px', alignItems: 'center' }}>
        {MESES.map(m => {
          const active = m === 'Ago';
          return (
            <div key={m} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
              <div style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: 12,
                color: active ? G_ink : G_muted, fontWeight: 600,
                padding: '4px 0',
                borderTop: active ? `2.5px solid ${G_ink}` : `1px solid #00000022`,
                position: 'relative',
              }}>
                {m}
                {active && <span style={{ position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: 99, background: G_ink }} />}
              </div>
            </div>
          );
        })}
        <div style={{ paddingLeft: 12, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 18, color: G_ink }}>2025</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SIMULADOR DE METAS
// ═══════════════════════════════════════════════════════════════════
function VarMetas({ onNavigate } = {}) {
  const [mode, setMode] = React.useState('atual'); // 'atual' | 'cortes' | 'turbinado'

  // Goal data
  const target = 50000;
  const current = 12300;
  const incomeTotal = 8900;
  const expensesTotal = 6552;
  const surplus = incomeTotal - expensesTotal; // 2348

  // Scenarios
  const scenarios = {
    atual:     { aporte: 850,  months: 44, label: 'Ritmo atual',       sub: 'sem mexer em nada', color: G_ink,   targetDate: 'abr/2029' },
    cortes:    { aporte: 1299, months: 29, label: 'Com cortes da IA',  sub: '+ R$ 449/mês economizados', color: G_green, targetDate: 'jan/2028' },
    turbinado: { aporte: 1799, months: 21, label: 'Modo turbinado',    sub: 'cortes + extra freela R$ 500', color: G_gold,  targetDate: 'mai/2027' },
  };

  const active = scenarios[mode];

  // Build evolution chart points for 3 scenarios
  const buildPoints = (aporte) => {
    const months = Math.ceil((target - current) / aporte);
    const pts = [];
    for (let i = 0; i <= months; i++) {
      pts.push({ month: i, value: Math.min(target, current + aporte * i) });
    }
    return pts;
  };

  const maxMonths = scenarios.atual.months;
  const chartW = 640, chartH = 220;
  const padL = 50, padR = 24, padT = 20, padB = 32;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const xAt = (m) => padL + (m / maxMonths) * innerW;
  const yAt = (v) => padT + innerH - (v / target) * innerH;

  const lineFor = (aporte, dashed) => {
    const pts = buildPoints(aporte);
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(p.month)} ${yAt(p.value)}`).join(' ');
    return d;
  };

  const cutsList = [
    { cat: 'Assinatura', c: '#d4a24a', name: 'Streaming duplicados (Netflix + Globoplay)', cur: 79.80, suggested: 'manter só 1', save: 39.90 },
    { cat: 'FimDeSemana', c: '#c97a3a', name: 'iFood nos finais de semana', cur: 380, suggested: 'reduzir pra 50%', save: 190 },
    { cat: 'Padaria', c: '#d4b48a', name: 'Padaria 5x/semana', cur: 220, suggested: 'cortar pra 2x', save: 132 },
    { cat: 'Beleza', c: '#c79bb0', name: 'Salão a cada 3 sem', cur: 280, suggested: 'espaçar pra 4 sem', save: 70 },
    { cat: 'Combustivel', c: '#3a6a8a', name: 'Uber em vez de levar carro', cur: 320, suggested: 'híbrido', save: 80 },
  ];
  const totalSave = cutsList.reduce((s, c) => s + c.save, 0);

  // Goals quick list
  const goals = [
    { name: 'Apto na praia',         emoji: '🏠', target: 50000, current: 12300, color: G_green, active: true },
    { name: 'Reserva 6 meses',       emoji: '🛟', target: 39312, current: 1950,  color: G_blue,  active: false },
    { name: 'Viagem Europa',         emoji: '✈',  target: 18000, current: 4200,  color: G_gold,  active: false },
    { name: 'Trocar de carro',       emoji: '🚗', target: 28000, current: 0,     color: G_amber, active: false },
  ];

  return (
    <div style={{ position: 'relative', height: '100%', background: G_paper, color: G_ink, fontFamily: 'Montserrat, sans-serif', overflow: 'hidden' }}>
      <GTopBar onNavigate={onNavigate} />

      <div style={{ padding: 18, height: 'calc(100% - 96px)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '220px 1fr 320px', gap: 14 }}>
        {/* ───── LEFT RAIL — goal list ───── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, overflow: 'auto' }}>
          <div style={{ fontSize: 10, color: G_muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '2px 4px' }}>
            suas metas
          </div>
          {goals.map((g, i) => {
            const pct = (g.current / g.target) * 100;
            return (
              <div key={i} style={{
                padding: 12,
                border: `${g.active ? '1.8px' : '1.4px'} solid ${g.active ? g.color : G_ink2 + '44'}`,
                borderRadius: 10,
                background: g.active ? `${g.color}10` : G_paper,
                position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: g.color, color: G_paper,
                    display: 'grid', placeItems: 'center', fontSize: 15,
                  }}>{g.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                    <div style={{ fontSize: 10, color: G_muted, marginTop: 1 }}>R$ {(g.target/1000).toFixed(0)}k</div>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 4, background: '#0000000d', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: g.color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: G_muted }}>
                    <span>R$ {g.current.toLocaleString('pt-BR')}</span>
                    <span style={{ fontWeight: 700, color: g.active ? g.color : G_ink2 }}>{Math.round(pct)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{
            padding: 12, border: `1.4px dashed ${G_ink2}`, borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 8,
            color: G_muted, fontSize: 12,
          }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, border: `1.3px dashed ${G_ink2}`, display: 'grid', placeItems: 'center', fontSize: 14, color: G_ink2 }}>+</span>
            nova meta
          </div>
        </div>

        {/* ───── MAIN ───── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'auto' }}>
          {/* Goal hero */}
          <GBox style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 8, background: G_green, color: G_paper, display: 'grid', placeItems: 'center', fontSize: 17 }}>🏠</span>
                  <div>
                    <div style={{ fontSize: 10, color: G_muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>meta ativa</div>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginTop: 2 }}>
                      Apto na praia
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 12 }}>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 36, letterSpacing: '-0.03em', lineHeight: 1 }}>R$ 12.300</span>
                  <span style={{ fontSize: 13, color: G_muted }}>de R$ 50.000</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <div style={{ flex: 1, height: 7, background: '#0000000d', border: `1px solid ${G_ink2}33`, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: '24.6%', height: '100%', background: G_green }} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: G_green }}>24,6%</span>
                </div>
              </div>

              <div style={{ borderLeft: `1px dashed ${G_ink2}44`, paddingLeft: 16, textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: G_muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>previsão {mode === 'atual' ? 'atual' : mode === 'cortes' ? 'com cortes' : 'turbinada'}</div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', color: active.color, lineHeight: 1, marginTop: 4 }}>
                  {active.months} <span style={{ fontSize: 13, color: G_muted, fontWeight: 500 }}>meses</span>
                </div>
                <div style={{ fontSize: 11, color: G_muted, marginTop: 4 }}>≈ {active.targetDate}</div>
                {mode !== 'atual' && (
                  <div style={{ fontSize: 11, color: G_green, fontWeight: 700, marginTop: 6 }}>
                    ↓ {scenarios.atual.months - active.months} meses mais rápido
                  </div>
                )}
              </div>
            </div>
          </GBox>

          {/* Chart */}
          <GBox style={{ padding: 14, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <GTitle
              sub="acúmulo mês a mês até bater a meta"
              right={
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: G_muted, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <svg width="14" height="3"><line x1="0" y1="1.5" x2="14" y2="1.5" stroke={G_ink} strokeWidth="2" /></svg>
                    atual
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <svg width="14" height="3"><line x1="0" y1="1.5" x2="14" y2="1.5" stroke={G_green} strokeWidth="2" strokeDasharray="3 2" /></svg>
                    cortes
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <svg width="14" height="3"><line x1="0" y1="1.5" x2="14" y2="1.5" stroke={G_gold} strokeWidth="2" strokeDasharray="2 2" /></svg>
                    turbinado
                  </span>
                </div>
              }
            >Evolução até a meta</GTitle>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" style={{ maxHeight: 240 }}>
                {/* Grid + Y axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map(p => {
                  const y = padT + innerH - p * innerH;
                  return (
                    <g key={p}>
                      <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke={G_ink2} opacity={p === 1 ? 0.4 : 0.15} strokeDasharray={p === 1 ? '4 3' : '2 3'} />
                      <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="10" fill={G_muted} fontFamily="Montserrat, sans-serif">
                        {p === 1 ? 'meta' : `${Math.round(p * target / 1000)}k`}
                      </text>
                    </g>
                  );
                })}
                {/* X axis ticks */}
                {[0, 12, 24, 36, 44].map(m => (
                  <g key={m}>
                    <line x1={xAt(m)} y1={padT + innerH} x2={xAt(m)} y2={padT + innerH + 4} stroke={G_ink2} opacity="0.5" />
                    <text x={xAt(m)} y={chartH - 8} textAnchor="middle" fontSize="10" fill={G_muted} fontFamily="Montserrat, sans-serif">
                      {m === 0 ? 'hoje' : `${m}m`}
                    </text>
                  </g>
                ))}

                {/* Target line annotation */}
                <text x={chartW - padR - 4} y={yAt(target) - 5} textAnchor="end" fontSize="9" fill={G_red} fontWeight="700" fontFamily="Montserrat, sans-serif">
                  R$ 50.000
                </text>

                {/* Atual scenario — primary line */}
                <path d={lineFor(scenarios.atual.aporte)} stroke={G_ink} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d={`${lineFor(scenarios.atual.aporte)} L ${xAt(scenarios.atual.months)} ${yAt(0)} L ${xAt(0)} ${yAt(0)} Z`} fill={G_ink} opacity="0.05" />

                {/* Cortes scenario */}
                <path d={lineFor(scenarios.cortes.aporte)} stroke={G_green} strokeWidth="2" fill="none" strokeDasharray="5 3" />

                {/* Turbinado scenario */}
                <path d={lineFor(scenarios.turbinado.aporte)} stroke={G_gold} strokeWidth="2" fill="none" strokeDasharray="3 3" />

                {/* End dots */}
                <circle cx={xAt(scenarios.atual.months)} cy={yAt(target)} r="5" fill={G_paper} stroke={G_ink} strokeWidth="2" />
                <circle cx={xAt(scenarios.cortes.months)} cy={yAt(target)} r="5" fill={G_green} stroke={G_paper} strokeWidth="2" />
                <circle cx={xAt(scenarios.turbinado.months)} cy={yAt(target)} r="5" fill={G_gold} stroke={G_paper} strokeWidth="2" />

                {/* Current dot */}
                <circle cx={xAt(0)} cy={yAt(current)} r="4" fill={G_ink} />
                <text x={xAt(0) + 8} y={yAt(current) - 6} fontSize="10" fontWeight="700" fill={G_ink} fontFamily="Montserrat, sans-serif">
                  R$ {(current/1000).toFixed(1)}k
                </text>

                {/* Milestone markers */}
                {[12, 24, 36].map(m => {
                  const v = current + scenarios.atual.aporte * m;
                  return (
                    <g key={m}>
                      <circle cx={xAt(m)} cy={yAt(v)} r="2.5" fill={G_ink} />
                      <text x={xAt(m)} y={yAt(v) - 8} textAnchor="middle" fontSize="9" fill={G_ink2} fontFamily="Montserrat, sans-serif">
                        R$ {(v/1000).toFixed(0)}k
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </GBox>

          {/* Scenarios switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { key: 'atual',     ...scenarios.atual },
              { key: 'cortes',    ...scenarios.cortes },
              { key: 'turbinado', ...scenarios.turbinado },
            ].map((s, i) => {
              const on = mode === s.key;
              return (
                <div key={s.key} onClick={() => setMode(s.key)} style={{
                  padding: 12,
                  border: `${on ? '1.8px' : '1.4px'} solid ${on ? s.color : G_ink2 + '44'}`,
                  borderRadius: 10,
                  background: on ? `${s.color}10` : G_paper,
                  cursor: 'pointer',
                  position: 'relative',
                }}>
                  {on && (
                    <span style={{ position: 'absolute', top: -8, right: 10, padding: '2px 7px', borderRadius: 99, background: s.color, color: G_paper, fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      simulando
                    </span>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em' }}>{s.label}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 15, color: s.color, letterSpacing: '-0.02em' }}>
                      {s.months}m
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: G_muted, marginTop: 2, lineHeight: 1.35 }}>{s.sub}</div>
                  <div style={{ marginTop: 8, fontSize: 11, color: G_ink2 }}>
                    aporte: <b style={{ color: s.color }}>R$ {s.aporte}/mês</b>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ───── RIGHT — Inputs + AI cuts ───── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'auto' }}>
          {/* Inputs */}
          <GBox style={{ padding: 14 }}>
            <GTitle sub="ajuste e o gráfico recalcula">Parâmetros</GTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                { label: 'renda mensal',       value: 'R$ 8.900',  color: G_green },
                { label: 'gastos mensais',     value: 'R$ 6.552',  color: G_red },
                { label: 'sobra',              value: 'R$ 2.348',  color: G_ink, computed: true },
                { label: 'aporte na meta',     value: `R$ ${active.aporte}`, color: G_blue },
                { label: 'objetivo',           value: 'R$ 50.000', color: G_green },
              ].map((f, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8,
                  padding: '8px 10px',
                  border: f.computed ? `1.4px dashed ${G_ink2}66` : `1.4px solid ${G_ink2}55`,
                  borderRadius: 7,
                  background: f.computed ? `${G_paper2}` : G_paper,
                }}>
                  <span style={{ fontSize: 11, color: G_muted, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{f.label}</span>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: f.color, letterSpacing: '-0.01em' }}>{f.value}</span>
                </div>
              ))}
            </div>
          </GBox>

          {/* AI Cuts */}
          <GBox style={{ padding: 14, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <GTitle sub={`economiza R$ ${totalSave.toFixed(0)}/mês`} right={<GAIBadge small />}>Cortes sugeridos</GTitle>
            <div style={{ overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cutsList.map((c, i) => (
                <div key={i} style={{
                  padding: '9px 10px',
                  border: `1.3px solid ${G_ink2}33`,
                  borderRadius: 7,
                  background: '#fff8',
                  display: 'grid', gridTemplateColumns: '6px 1fr auto', gap: 9, alignItems: 'center',
                }}>
                  <span style={{ width: 4, height: '100%', background: c.c, borderRadius: 99, minHeight: 28 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: '-0.005em', lineHeight: 1.25 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: G_muted, marginTop: 2 }}>
                      hoje <span style={{ textDecoration: 'line-through' }}>R$ {c.cur.toFixed(0)}</span> · {c.suggested}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 13, color: G_green, whiteSpace: 'nowrap' }}>
                      −R$ {c.save.toFixed(0)}
                    </div>
                    <div style={{ fontSize: 9, color: G_muted, letterSpacing: '0.05em' }}>/mês</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 10, padding: '10px 12px',
              background: G_green, color: G_paper, borderRadius: 7,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 10, opacity: 0.75, letterSpacing: '0.08em', textTransform: 'uppercase' }}>total economizado</div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>R$ {totalSave}/mês</div>
              </div>
              <span style={{ padding: '6px 11px', background: G_paper, color: G_green, borderRadius: 6, fontSize: 11, fontWeight: 700 }}>aplicar tudo →</span>
            </div>
          </GBox>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VarMetas });
