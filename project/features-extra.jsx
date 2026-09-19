/* global React */
// New features: Diagnóstico financeiro com IA + Controlador de dívidas

const F_ink = '#1a1815';
const F_ink2 = '#4a463f';
const F_muted = '#8a857a';
const F_paper = '#fbf8f1';
const F_paper2 = '#f3eee2';

// Accent colors used by these features
const F_accentGreen = '#2f5a48';  // good / income / progress
const F_accentRed   = '#b04a3a';  // urgent / debt
const F_accentAmber = '#c97a3a';  // warning
const F_accentBlue  = '#3a6a8a';  // AI / info
const F_accentGold  = '#d4a24a';  // score highlight

function FBox({ children, style = {}, ...rest }) {
  return (
    <div style={{
      border: `1.5px solid ${F_ink}`,
      borderRadius: 8,
      padding: 14,
      background: F_paper,
      ...style,
    }} {...rest}>{children}</div>
  );
}

function FTitle({ children, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
      <div>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 18, color: F_ink, lineHeight: 1 }}>
          {children}
        </div>
        {sub && <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: F_muted, marginTop: 5 }}>{sub}</div>}
        <svg width={Math.min(140, String(children).length * 9)} height="5" style={{ display: 'block', marginTop: 3 }}>
          <path d={`M 1 2.5 Q ${Math.min(140, String(children).length * 9)*0.3} 0 ${Math.min(140, String(children).length * 9)*0.5} 2.5 T ${Math.min(140, String(children).length * 9)-1} 2.5`} stroke={F_ink} strokeWidth="1.4" fill="none" />
        </svg>
      </div>
      {right}
    </div>
  );
}

function FBar({ pct, color = F_ink, height = 8, bg = '#0000000d' }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ height, background: bg, border: `1px solid ${F_ink2}55`, borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ width: `${p}%`, height: '100%', background: color, borderRadius: 99 }} />
    </div>
  );
}

// AI badge — used to label AI-generated insights
function AIBadge({ small }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: small ? '2px 7px' : '3px 9px',
      background: F_accentBlue, color: F_paper, borderRadius: 99,
      fontFamily: 'Montserrat, sans-serif', fontSize: small ? 9 : 10,
      fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase',
    }}>
      <svg width="9" height="9" viewBox="0 0 12 12"><path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="currentColor" /></svg>
      IA
    </span>
  );
}

// Top bar local copy — keeps tabs in sync without re-importing
function FTopBar({ activeTab, activePerson = 'Todos', month = 'Ago', onNavigate }) {
  const tabs = ['Lançamentos', 'Gastos do mês', 'Fixos', 'Parcelamentos', 'Diagnóstico', 'Dívidas', 'Metas', 'Relatórios'];
  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return (
    <div style={{ borderBottom: `1.5px solid ${F_ink}`, background: F_paper }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 10px', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={window.__resources.poupeLogo} alt="Poupê" style={{ height: 24, display: 'block' }} />
        </div>
        <nav style={{ display: 'flex', gap: 3, marginLeft: 4, flexShrink: 1, minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {tabs.map(t => (
            <div key={t} onClick={() => onNavigate && onNavigate(t)} style={{
              padding: '5px 3px', cursor: onNavigate ? 'pointer' : 'default', whiteSpace: 'nowrap',
              fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 600,
              color: t === activeTab ? F_ink : F_ink2,
              borderBottom: t === activeTab ? `2.5px solid ${F_ink}` : '2.5px solid transparent',
              marginBottom: -1,
            }}>{t}</div>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: F_muted }}>quem:</span>
          {['Todos', 'Davi', 'Eduarda'].map(p => (
            <span key={p} style={{
              padding: '2px 5px',
              border: `1.4px solid ${p === activePerson ? F_ink : F_ink2}`,
              borderRadius: 99,
              background: p === activePerson ? F_ink : 'transparent',
              color: p === activePerson ? F_paper : F_ink,
              fontFamily: 'Montserrat, sans-serif', fontSize: 9.5,
            }}>{p}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', padding: '0 10px 8px', alignItems: 'center' }}>
        {MESES.map(m => {
          const active = m === month;
          return (
            <div key={m} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
              <div style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: 12,
                color: active ? F_ink : F_muted, fontWeight: 600,
                padding: '4px 0',
                borderTop: active ? `2.5px solid ${F_ink}` : `1px solid #00000022`,
                position: 'relative',
              }}>
                {m}
                {active && <span style={{ position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: 99, background: F_ink }} />}
              </div>
            </div>
          );
        })}
        <div style={{ paddingLeft: 12, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 18, color: F_ink }}>2025</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DIAGNÓSTICO FINANCEIRO COM IA
// ═══════════════════════════════════════════════════════════════════
function VarDiagnostico({ onNavigate } = {}) {
  const score = 6.2;
  const prevScore = 5.4;
  const delta = score - prevScore;

  // Big score gauge (semi-circle)
  const ScoreGauge = ({ value = 6.2, size = 220 }) => {
    const scale = size / 220;
    const strokeW = 14 * scale;
    const r = size / 2 - strokeW;
    const cx = size / 2, cy = size / 2 + 10 * scale;
    const start = Math.PI, end = 2 * Math.PI; // top semi-circle
    const arcLen = end - start;
    const valueAngle = start + arcLen * (value / 10);
    const arc = (a1, a2) => {
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      const large = a2 - a1 > Math.PI ? 1 : 0;
      return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
    };
    // Tick marks
    const tickLen = 4 * scale;
    const ticks = [];
    for (let i = 0; i <= 10; i++) {
      const a = start + arcLen * (i / 10);
      const x1 = cx + (r + tickLen) * Math.cos(a), y1 = cy + (r + tickLen) * Math.sin(a);
      const x2 = cx + (r - tickLen) * Math.cos(a), y2 = cy + (r - tickLen) * Math.sin(a);
      ticks.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={F_ink2} strokeWidth={i % 5 === 0 ? 1.5 : 0.8} opacity={i % 5 === 0 ? 1 : 0.5} />);
    }
    // Color zones
    const zone = value < 4 ? F_accentRed : value < 7 ? F_accentAmber : F_accentGreen;
    return (
      <svg width={size} height={size / 2 + 30 * scale} viewBox={`0 0 ${size} ${size / 2 + 30 * scale}`}>
        <path d={arc(start, end)} stroke="#00000015" strokeWidth={strokeW} fill="none" strokeLinecap="round" />
        <path d={arc(start, valueAngle)} stroke={zone} strokeWidth={strokeW} fill="none" strokeLinecap="round" />
        {ticks}
        <text x={cx} y={cy - 8 * scale} textAnchor="middle" fontFamily="Montserrat, sans-serif"
              fontWeight="800" fontSize={40 * scale} fill={F_ink} letterSpacing="-0.04em">
          {value.toFixed(1)}
        </text>
        <text x={cx} y={cy + 14 * scale} textAnchor="middle" fontFamily="Montserrat, sans-serif"
              fontWeight="500" fontSize={10 * scale} fill={F_muted} letterSpacing="0.1em">
          / 10
        </text>
      </svg>
    );
  };

  // History sparkline
  const history = [
    { m: 'Mar', v: 4.8 }, { m: 'Abr', v: 5.1 }, { m: 'Mai', v: 5.3 },
    { m: 'Jun', v: 4.9 }, { m: 'Jul', v: 5.4 }, { m: 'Ago', v: 6.2 },
  ];
  const sparkW = 280, sparkH = 60;
  const points = history.map((h, i) => {
    const x = (i / (history.length - 1)) * sparkW;
    const y = sparkH - (h.v / 10) * sparkH;
    return [x, y];
  });
  const sparkPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  // Score breakdown
  const breakdown = [
    { k: 'Reserva de emergência',  v: 4.0, c: F_accentRed,   note: 'só 0,3 mês coberto' },
    { k: 'Controle de gastos',     v: 7.2, c: F_accentGreen, note: 'dentro do esperado' },
    { k: 'Endividamento',          v: 5.0, c: F_accentAmber, note: '32% da renda' },
    { k: 'Hábito de poupar',       v: 7.5, c: F_accentGreen, note: '15% guardado' },
    { k: 'Investimentos',          v: 6.8, c: F_accentGold,  note: 'diversificado' },
    { k: 'Planejamento',           v: 7.5, c: F_accentGreen, note: 'budget ativo' },
  ];

  // AI priorities
  const priorities = [
    {
      tag: 'urgente',
      tagColor: F_accentRed,
      title: 'Aumente a reserva pra 3 meses de gastos',
      body: 'Hoje vocês têm R$ 1.950 reservados — só cobre 9 dias. Coloque R$ 600/mês na caixinha por 6 meses para chegar a R$ 5.550.',
      impact: '+1.2 pontos',
    },
    {
      tag: 'esse mês',
      tagColor: F_accentAmber,
      title: 'Renegocie o financiamento do carro',
      body: 'A taxa atual (2.4% a.m.) está acima da média. Simule no banco — uma queda pra 1.6% libera R$ 180/mês.',
      impact: '+0.6 ponto',
    },
    {
      tag: 'observe',
      tagColor: F_muted,
      title: 'Categoria "Fim de semana" subiu 35%',
      body: 'Em julho foram R$ 354, em agosto já R$ 480. Defina um teto de R$ 400 e revise quinta-feira.',
      impact: '+0.3 ponto',
    },
  ];

  return (
    <div style={{ position: 'relative', height: '100%', background: F_paper, color: F_ink, fontFamily: 'Montserrat, sans-serif', overflow: 'hidden' }}>
      <FTopBar activeTab="Diagnóstico" onNavigate={onNavigate} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 18, padding: 20, height: 'calc(100% - 96px)', overflow: 'hidden' }}>
        {/* LEFT — score + history + priorities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, overflow: 'auto' }}>
          {/* Score hero */}
          <FBox style={{ padding: 0, overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', alignItems: 'center' }}>
              <div style={{ padding: '14px 10px 10px', borderRight: `1px dashed ${F_ink2}44`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 9, color: F_muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>sua nota de agosto</div>
                <ScoreGauge value={score} size={150} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: F_muted }}>vs jul</span>
                  <span style={{
                    color: F_accentGreen, fontWeight: 700, fontSize: 12,
                  }}>↑ +{delta.toFixed(1)}</span>
                </div>
              </div>
              <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AIBadge />
                  <span style={{ fontSize: 11, color: F_muted }}>analisado em 23 ago, 09:14</span>
                </div>
                <div style={{ fontWeight: 700, letterSpacing: '-0.015em', fontSize: 16, marginTop: 8, lineHeight: 1.2 }}>
                  Vocês estão melhorando — mas a reserva é o ponto frágil.
                </div>
                <div style={{ fontSize: 12, color: F_ink2, lineHeight: 1.4, marginTop: 6 }}>
                  Gastos sob controle e hábito de poupar consistente. O risco está na
                  reserva de emergência: 9 dias de cobertura é abaixo do recomendado.
                  Resolvendo isso, sua nota deve passar de <b>7,5 em outubro</b>.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <span style={{ padding: '5px 10px', background: F_ink, color: F_paper, borderRadius: 6, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>Ver relatório completo →</span>
                  <span style={{ padding: '5px 10px', border: `1.4px solid ${F_ink}`, borderRadius: 6, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>↗ compartilhar</span>
                  <span style={{ padding: '5px 10px', border: `1.4px dashed ${F_ink2}`, borderRadius: 6, fontSize: 11, color: F_ink2, whiteSpace: 'nowrap' }}>Refazer diagnóstico</span>
                </div>
              </div>
            </div>
          </FBox>

          {/* AI Priorities */}
          <FBox style={{ flex: 1 }}>
            <FTitle sub="o que mexer pra subir a nota mês que vem" right={<AIBadge />}>Prioridades</FTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {priorities.map((p, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 12,
                  padding: '12px 14px',
                  border: `1.4px solid ${F_ink2}44`, borderRadius: 8,
                  background: '#fff8',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 99,
                    background: p.tagColor, color: F_paper,
                    display: 'grid', placeItems: 'center',
                    fontWeight: 800, fontSize: 13,
                  }}>{i + 1}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: p.tagColor,
                      }}>{p.tag}</span>
                      <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>{p.title}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: F_ink2, marginTop: 4, lineHeight: 1.45 }}>{p.body}</div>
                  </div>
                  <div style={{ alignSelf: 'center', textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: F_muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>impacto</div>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: F_accentGreen }}>{p.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </FBox>
        </div>

        {/* RIGHT — breakdown + history + share */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, overflow: 'auto' }}>
          {/* History */}
          <FBox>
            <FTitle sub="6 meses · ainda subindo">Histórico</FTitle>
            <svg width={sparkW} height={sparkH + 26} style={{ display: 'block' }}>
              {/* Grid baseline */}
              <line x1="0" y1={sparkH - 0.5} x2={sparkW} y2={sparkH - 0.5} stroke={F_ink2} opacity="0.2" strokeDasharray="2 3" />
              <line x1="0" y1={sparkH * 0.5 - 0.5} x2={sparkW} y2={sparkH * 0.5 - 0.5} stroke={F_ink2} opacity="0.15" strokeDasharray="2 3" />
              {/* Path */}
              <path d={sparkPath} stroke={F_ink} strokeWidth="1.8" fill="none" />
              <path d={`${sparkPath} L ${sparkW} ${sparkH} L 0 ${sparkH} Z`} fill={F_ink} opacity="0.06" />
              {/* Dots + labels */}
              {points.map((p, i) => {
                const h = history[i];
                const last = i === points.length - 1;
                return (
                  <g key={i}>
                    <circle cx={p[0]} cy={p[1]} r={last ? 5 : 3} fill={last ? F_accentGreen : F_paper} stroke={last ? F_paper : F_ink} strokeWidth={last ? 2 : 1.4} />
                    <text x={p[0]} y={sparkH + 14} textAnchor="middle" fontSize="10" fill={F_muted} fontFamily="Montserrat, sans-serif">{h.m}</text>
                    <text x={p[0]} y={p[1] - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill={last ? F_accentGreen : F_ink2} fontFamily="Montserrat, sans-serif">{h.v.toFixed(1)}</text>
                  </g>
                );
              })}
            </svg>
          </FBox>

          {/* Breakdown */}
          <FBox style={{ flex: 1, minHeight: 210, overflow: 'auto' }}>
            <FTitle sub="6 dimensões avaliadas">Composição da nota</FTitle>
            {breakdown.map((b, i) => (
              <div key={i} style={{ marginBottom: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 12 }}>
                  <span style={{ fontWeight: 500 }}>{b.k} <span style={{ color: F_muted, fontSize: 10.5 }}>· {b.note}</span></span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: b.c }}>{b.v.toFixed(1)}</span>
                </div>
                <FBar pct={b.v * 10} color={b.c} height={5} />
              </div>
            ))}
          </FBox>

          {/* Shareable card preview */}
          <FBox style={{ padding: 12, background: F_ink, color: F_paper, border: `1.5px solid ${F_ink}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 8,
                background: F_accentGreen, display: 'grid', placeItems: 'center',
                fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 24, letterSpacing: '-0.04em',
              }}>6.2</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase' }}>minha nota financeira</div>
                <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', marginTop: 3 }}>Agosto · subiu 0,8 pontos</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>poupê · davi & eduarda</div>
              </div>
              <div style={{ padding: '6px 10px', background: F_paper, color: F_ink, borderRadius: 6, fontSize: 11, fontWeight: 700 }}>↗ post</div>
            </div>
          </FBox>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONTROLADOR DE DÍVIDAS COM PLANO DE QUITAÇÃO
// ═══════════════════════════════════════════════════════════════════
function VarDividas({ onNavigate } = {}) {
  const [strategy, setStrategy] = React.useState('avalanche');

  // Debts — both strategies will reorder these
  const debts = [
    { name: 'Cartão Nubank',     total: 4_200, paid: 1_260, rate: 13.2, min: 380, who: 'Davi',    accent: '#b04a3a' },
    { name: 'Financiamento carro', total: 18_900, paid: 6_800, rate: 2.4,  min: 720, who: 'Davi',    accent: '#c97a3a' },
    { name: 'Cartão C6',         total: 1_850, paid: 950,  rate: 11.8, min: 220, who: 'Eduarda', accent: '#a86a6a' },
    { name: 'Empréstimo família',  total: 3_000, paid: 1_500, rate: 0,    min: 150, who: 'Davi',    accent: '#7a6ca8' },
    { name: 'Crediário sofá',    total: 1_200, paid: 300,  rate: 4.5,  min: 100, who: 'Eduarda', accent: '#8a6a4a' },
  ];

  const totalDebt = debts.reduce((s, d) => s + (d.total - d.paid), 0);
  const totalPaid = debts.reduce((s, d) => s + d.paid, 0);
  const totalAll  = debts.reduce((s, d) => s + d.total, 0);

  // Order by strategy
  const ordered = [...debts].sort((a, b) => {
    if (strategy === 'avalanche') return b.rate - a.rate;          // highest interest first
    return (a.total - a.paid) - (b.total - b.paid);                 // smallest balance first
  });

  // Timeline / cronograma (mock: 14 months)
  const timeline = strategy === 'avalanche'
    ? [
        { month: 'Set/25', label: 'Hoje',              kind: 'now' },
        { month: 'Nov/25', label: 'Quita Nubank',      kind: 'milestone', color: '#b04a3a' },
        { month: 'Mar/26', label: 'Quita C6',          kind: 'milestone', color: '#a86a6a' },
        { month: 'Jul/26', label: 'Quita sofá',        kind: 'milestone', color: '#8a6a4a' },
        { month: 'Out/26', label: 'Quita família',     kind: 'milestone', color: '#7a6ca8' },
        { month: 'Mar/27', label: 'Quita carro',       kind: 'milestone', color: '#c97a3a' },
        { month: 'Abr/27', label: 'Livre de dívidas',  kind: 'goal' },
      ]
    : [
        { month: 'Set/25', label: 'Hoje',              kind: 'now' },
        { month: 'Out/25', label: 'Quita sofá',        kind: 'milestone', color: '#8a6a4a' },
        { month: 'Nov/25', label: 'Quita C6',          kind: 'milestone', color: '#a86a6a' },
        { month: 'Mar/26', label: 'Quita Nubank',      kind: 'milestone', color: '#b04a3a' },
        { month: 'Ago/26', label: 'Quita família',     kind: 'milestone', color: '#7a6ca8' },
        { month: 'Mai/27', label: 'Quita carro',       kind: 'milestone', color: '#c97a3a' },
        { month: 'Jun/27', label: 'Livre de dívidas',  kind: 'goal' },
      ];

  // Total-debt-down chart
  const trail = [
    { m: 'Mar', v: 32400 }, { m: 'Abr', v: 31200 }, { m: 'Mai', v: 29800 },
    { m: 'Jun', v: 28100 }, { m: 'Jul', v: 26400 }, { m: 'Ago', v: 24500 },
    // projected
    { m: 'Set', v: 22500, p: 1 }, { m: 'Out', v: 20300, p: 1 },
    { m: 'Nov', v: 18000, p: 1 }, { m: 'Dez', v: 15600, p: 1 },
  ];

  return (
    <div style={{ position: 'relative', height: '100%', background: F_paper, color: F_ink, fontFamily: 'Montserrat, sans-serif', overflow: 'hidden' }}>
      <FTopBar activeTab="Dívidas" onNavigate={onNavigate} />

      <div style={{ padding: 20, height: 'calc(100% - 96px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* HEADER — Total debt + strategy switch */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
          <FBox style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, color: F_muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>dívida total restante</div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, letterSpacing: '-0.03em', fontSize: 38, marginTop: 4, color: F_accentRed, lineHeight: 1 }}>
                  R$ {totalDebt.toLocaleString('pt-BR')}
                </div>
                <div style={{ fontSize: 12, color: F_muted, marginTop: 6 }}>
                  pago: <b style={{ color: F_ink }}>R$ {totalPaid.toLocaleString('pt-BR')}</b> de R$ {totalAll.toLocaleString('pt-BR')}
                </div>
                <div style={{ marginTop: 8, maxWidth: 360 }}>
                  <FBar pct={(totalPaid / totalAll) * 100} color={F_accentGreen} height={8} />
                  <div style={{ fontSize: 11, color: F_muted, marginTop: 4 }}>{Math.round((totalPaid / totalAll) * 100)}% quitado</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: F_muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>livre em</div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', color: F_accentGreen, lineHeight: 1, marginTop: 4 }}>
                  {strategy === 'avalanche' ? '19' : '21'} <span style={{ fontSize: 14, color: F_muted, fontWeight: 500 }}>meses</span>
                </div>
                <div style={{ fontSize: 11, color: F_muted, marginTop: 4 }}>≈ {strategy === 'avalanche' ? 'abr/2027' : 'jun/2027'}</div>
                <div style={{ fontSize: 10, color: F_accentGreen, fontWeight: 600, marginTop: 6 }}>
                  ↓ economiza R$ {strategy === 'avalanche' ? '2.140' : '780'} em juros
                </div>
              </div>
            </div>
          </FBox>

          {/* Strategy switch + AI recommendation */}
          <FBox style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <AIBadge small />
              <span style={{ fontSize: 10, color: F_muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>estratégia recomendada</span>
            </div>
            <div style={{
              display: 'inline-flex', border: `1.4px solid ${F_ink}`, borderRadius: 8, padding: 2, background: F_paper, marginBottom: 10,
            }}>
              {[
                { k: 'avalanche', label: 'Avalanche', sub: 'maior juro 1º' },
                { k: 'bolaneve',  label: 'Bola de neve', sub: 'menor saldo 1º' },
              ].map(s => {
                const on = strategy === s.k;
                return (
                  <span key={s.k} onClick={() => setStrategy(s.k)} style={{
                    padding: '8px 12px', borderRadius: 6,
                    background: on ? F_ink : 'transparent',
                    color: on ? F_paper : F_ink2,
                    fontWeight: on ? 700 : 500, fontSize: 12, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2,
                  }}>
                    {s.label}
                    <span style={{ fontSize: 9, fontWeight: 500, opacity: on ? 0.7 : 0.55, marginTop: 2 }}>{s.sub}</span>
                  </span>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: F_ink2, lineHeight: 1.45 }}>
              {strategy === 'avalanche'
                ? <>A IA recomenda <b>avalanche</b> pra vocês: o cartão Nubank custa <b>13,2% a.m.</b> em juros — atacar ele primeiro poupa R$ 2.140 ao longo do plano.</>
                : <>A <b>bola de neve</b> dá vitórias rápidas: o crediário do sofá quita em 1 mês. Motivacional, mas custa R$ 1.360 a mais em juros que a avalanche.</>}
            </div>
          </FBox>
        </div>

        {/* MAIN — debts list + timeline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, flex: 1, minHeight: 0 }}>
          {/* Debts list ordered by strategy */}
          <FBox style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <FTitle
              sub={`ordem ${strategy === 'avalanche' ? 'por taxa de juros' : 'por menor saldo'} · arraste para reordenar`}
              right={<span style={{ fontSize: 11, color: F_muted }}>5 dívidas</span>}
            >Plano de quitação</FTitle>
            <div style={{ overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10, marginTop: -10 }}>
              {ordered.map((d, i) => {
                const remaining = d.total - d.paid;
                const pct = (d.paid / d.total) * 100;
                const isFocus = i === 0;
                return (
                  <div key={d.name} style={{
                    padding: '10px 12px',
                    border: `${isFocus ? '1.8px' : '1.4px'} solid ${isFocus ? d.accent : F_ink2 + '55'}`,
                    borderRadius: 8,
                    background: isFocus ? d.accent + '0d' : '#fff8',
                    position: 'relative',
                  }}>
                    {isFocus && (
                      <span style={{
                        position: 'absolute', top: -8, left: 10,
                        padding: '2px 8px', borderRadius: 99,
                        background: d.accent, color: F_paper,
                        fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                      }}>foco agora</span>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto auto', gap: 10, alignItems: 'center' }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 99,
                        background: d.accent, color: F_paper,
                        display: 'grid', placeItems: 'center',
                        fontSize: 11, fontWeight: 800,
                      }}>{i + 1}</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>{d.name}</span>
                          <span style={{ fontSize: 11, color: F_muted }}>{d.who}</span>
                          <span style={{
                            padding: '1px 6px', background: d.rate >= 10 ? F_accentRed + '22' : d.rate > 0 ? F_accentAmber + '22' : F_accentGreen + '22',
                            color: d.rate >= 10 ? F_accentRed : d.rate > 0 ? F_accentAmber : F_accentGreen,
                            fontSize: 10, fontWeight: 700, borderRadius: 3,
                          }}>{d.rate === 0 ? 'sem juros' : `${d.rate}% a.m.`}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <div style={{ flex: 1 }}>
                            <FBar pct={pct} color={d.accent} height={5} />
                          </div>
                          <span style={{ fontSize: 11, color: F_muted, minWidth: 30, textAlign: 'right' }}>{Math.round(pct)}%</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                          R$ {remaining.toLocaleString('pt-BR')}
                        </div>
                        <div style={{ fontSize: 10, color: F_muted, marginTop: 2 }}>de {d.total.toLocaleString('pt-BR')}</div>
                      </div>
                      <div style={{ textAlign: 'right', borderLeft: `1px dashed ${F_ink2}44`, paddingLeft: 10 }}>
                        <div style={{ fontSize: 10, color: F_muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>parcela</div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: F_ink, whiteSpace: 'nowrap' }}>R$ {d.min}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Add new */}
            <div style={{
              marginTop: 8, padding: '8px 12px',
              border: `1.4px dashed ${F_ink2}`, borderRadius: 8,
              fontSize: 12, color: F_muted, display: 'flex', alignItems: 'center', gap: 6,
            }}>＋ adicionar dívida</div>
          </FBox>

          {/* Timeline + chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
            <FBox style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <FTitle sub="marcos até ficar livre">Cronograma</FTitle>
              <div style={{ position: 'relative', paddingLeft: 24, flex: 1, overflow: 'auto' }}>
                <div style={{ position: 'absolute', left: 8, top: 4, bottom: 4, width: 1.5, background: F_ink2, opacity: 0.35 }} />
                {timeline.map((m, i) => {
                  const isNow = m.kind === 'now';
                  const isGoal = m.kind === 'goal';
                  return (
                    <div key={i} style={{ position: 'relative', paddingBottom: i < timeline.length - 1 ? 14 : 0 }}>
                      <div style={{
                        position: 'absolute', left: -22, top: 2,
                        width: isGoal ? 18 : 14, height: isGoal ? 18 : 14,
                        borderRadius: 99,
                        background: isNow ? F_paper : isGoal ? F_accentGreen : m.color,
                        border: `2px solid ${isNow ? F_ink : isGoal ? F_accentGreen : m.color}`,
                        display: 'grid', placeItems: 'center',
                      }}>
                        {isGoal && <span style={{ color: F_paper, fontSize: 10, fontWeight: 800 }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 10, color: F_muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{m.month}</div>
                      <div style={{
                        fontWeight: isGoal ? 800 : isNow ? 700 : 600,
                        fontSize: isGoal ? 16 : 13, letterSpacing: '-0.01em', marginTop: 2,
                        color: isGoal ? F_accentGreen : F_ink,
                      }}>
                        {m.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </FBox>

            {/* Weekly check-in */}
            <FBox style={{ padding: 12, background: F_accentGreen, color: F_paper, border: `1.5px solid ${F_accentGreen}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.75, letterSpacing: '0.12em', textTransform: 'uppercase' }}>check-in semanal</div>
                  <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', marginTop: 4 }}>Você quitou R$ 540 essa semana 🎉</div>
                  <div style={{ fontSize: 11, opacity: 0.8, marginTop: 3 }}>5 semanas seguidas no plano</div>
                </div>
                <div style={{
                  width: 56, height: 56, borderRadius: 99,
                  background: F_paper, color: F_accentGreen,
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em',
                }}>5</div>
              </div>
            </FBox>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  VarDiagnostico, VarDividas,
});
