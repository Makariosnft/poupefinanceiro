/* global React */
// Wireframes for "App Financeiro" — desktop
// Low-fi, sketchy, b&w with a curated elegant accent palette for categories.

// ─── Shared palette + helpers ──────────────────────────────────────
const ink = '#1a1815';
const ink2 = '#4a463f';
const muted = '#8a857a';
const paper = '#fbf8f1';
const paper2 = '#f3eee2';
const line = '#1a1815';

// "Elegant" category palette (replaces the saturated spreadsheet colors)
const CATS = {
  Contas: { c: '#b04a3a', label: 'Contas' },
  Mercado: { c: '#7a8a3a', label: 'Mercado' },
  Combustivel: { c: '#3a6a8a', label: 'Combustível' },
  Carro: { c: '#2f5a48', label: 'Carro' },
  Beleza: { c: '#c79bb0', label: 'Beleza' },
  Academia: { c: '#7a6ca8', label: 'Academia' },
  Assinatura: { c: '#d4a24a', label: 'Assinatura' },
  Igreja: { c: '#5a8a9a', label: 'Igreja' },
  FimDeSemana: { c: '#c97a3a', label: 'Fins de semana' },
  Saude: { c: '#8a9a5a', label: 'Saúde' },
  Roupa: { c: '#a86a6a', label: 'Roupa' },
  Viagem: { c: '#c44a4a', label: 'Viagem' },
  Padaria: { c: '#d4b48a', label: 'Padaria' },
  Cursos: { c: '#5a5a8a', label: 'Cursos' },
  Celular: { c: '#8a6a4a', label: 'Celular' },
  Presente: { c: '#a85a8a', label: 'Presente' },
  PaiMae: { c: '#6a8a8a', label: 'Pai e Mãe' }
};

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Sketch box — a slightly wobbly bordered rect drawn in the sketch font
function Box({ children, style = {}, ...rest }) {
  return (
    <div style={{
      border: `1.5px solid ${line}`,
      borderRadius: 6,
      padding: '10px 12px',
      background: paper,
      ...style
    }} {...rest}>{children}</div>);

}

// Dashed placeholder
function DashedBox({ children, style = {}, height }) {
  return (
    <div style={{
      border: `1.5px dashed ${ink2}`,
      borderRadius: 6,
      padding: 10,
      background: 'transparent',
      color: muted,
      height,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Montserrat, sans-serif', fontSize: 13,
      ...style
    }}>{children}</div>);

}

// Pill / chip
function Pill({ children, active, color, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px',
      border: `1.4px solid ${active ? ink : ink2}`,
      borderRadius: 999,
      background: active ? ink : 'transparent',
      color: active ? paper : ink,
      fontFamily: 'Montserrat, sans-serif', fontSize: 12,
      ...style
    }}>
      {color && <span style={{ width: 8, height: 8, borderRadius: 99, background: color, display: 'inline-block' }} />}
      {children}
    </span>);

}

// Segmented switch — Comum / Fixo / Parcelamento
function KindSwitch({ active = 'Comum', size = 'sm', onSelect }) {
  const opts = [
  { key: 'Comum', icon: '•', hint: 'gasto avulso' },
  { key: 'Fixo', icon: '↻', hint: 'repete todo mês' },
  { key: 'Parcelamento', icon: '∥', hint: 'dividido em parcelas' }];

  const pad = size === 'sm' ? '5px 10px' : '8px 14px';
  const fs = size === 'sm' ? 12 : 13;
  return (
    <div style={{
      display: 'inline-flex',
      border: `1.4px solid ${ink}`, borderRadius: 8, padding: 2, background: paper
    }}>
      {opts.map((o, i) => {
        const on = o.key === active;
        return (
          <span key={o.key} title={o.hint} onClick={() => onSelect && onSelect(o.key)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: pad, borderRadius: 6,
            background: on ? ink : 'transparent',
            color: on ? paper : ink2,
            fontFamily: 'Montserrat, sans-serif', fontSize: fs, fontWeight: on ? 600 : 500,
            letterSpacing: '-0.005em', cursor: onSelect ? 'pointer' : 'default'
          }}>
            <span style={{ opacity: on ? 1 : 0.5 }}>{o.icon}</span>
            {o.key}
          </span>);

      })}
    </div>);

}

// Wobbly line under section title
function Underline({ w = 60 }) {
  return (
    <svg width={w} height="6" style={{ display: 'block', marginTop: 2 }}>
      <path d={`M 1 3 Q ${w * 0.3} 0 ${w * 0.5} 3 T ${w - 1} 3`} stroke={ink} strokeWidth="1.5" fill="none" />
    </svg>);

}

function SectionTitle({ children, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
      <div>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 22, fontWeight: 700, color: ink, lineHeight: 1 }}>
          {children}
        </div>
        {sub && <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: muted, marginTop: 4 }}>{sub}</div>}
        <Underline w={Math.min(160, String(children).length * 11)} />
      </div>
      {right}
    </div>);

}

// Progress bar
function Bar({ pct, color = ink, height = 8 }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ height, background: '#0000000d', border: `1px solid ${ink2}`, borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ width: `${p}%`, height: '100%', background: color }} />
    </div>);

}

// Tiny donut (svg)
function Donut({ pct = 65, size = 64, color = ink, label }) {
  const r = size / 2 - 6,c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#00000018" strokeWidth="6" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="6" fill="none"
        strokeDasharray={`${pct / 100 * c} ${c}`} strokeDashoffset={c / 4} transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 18, color: ink }}>{label ?? `${pct}%`}</div>
    </div>);

}

// Floating + button (consistent across variants)
function FAB({ style = {}, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 99,
      background: ink, color: paper, border: 'none', fontSize: 28, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em',
      boxShadow: '0 4px 0 rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.15)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 4,
      ...style
    }}>+</button>);

}

// ─── Shared chrome bits ────────────────────────────────────────────

// Top bar with tabs + person filter + month timeline
function TopBar({ activeTab = 'Lançamentos', activePerson = 'Todos', month = 'Ago', compact = false, onNavigate }) {
  const tabs = ['Lançamentos', 'Gastos do mês', 'Fixos', 'Parcelamentos', 'Diagnóstico', 'Dívidas', 'Metas', 'Relatórios'];
  return (
    <div style={{ borderBottom: `1.5px solid ${line}`, background: paper }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 10px', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="assets/poupe-logo-trim.png" alt="Poupê" style={{ height: 24, display: 'block' }} />
        </div>
        <nav style={{ display: 'flex', gap: 3, marginLeft: 4, flexShrink: 1, minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {tabs.map((t) =>
          <div key={t} onClick={() => onNavigate && onNavigate(t)} style={{
            padding: '5px 3px', cursor: onNavigate ? 'pointer' : 'default', whiteSpace: 'nowrap',
            fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 600,
            color: t === activeTab ? ink : ink2,
            borderBottom: t === activeTab ? `2.5px solid ${ink}` : '2.5px solid transparent',
            marginBottom: -1
          }}>{t}</div>
          )}
        </nav>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: muted }}>quem:</span>
          {['Todos', 'Davi', 'Eduarda'].map((p) => <Pill key={p} active={p === activePerson} style={{ fontSize: 9.5, padding: '2px 5px' }}>{p}</Pill>)}
        </div>
      </div>
      {/* Month timeline */}
      <div style={{ display: 'flex', gap: 0, padding: '0 10px 8px', alignItems: 'center' }}>
        {MESES.map((m, i) => {
          const active = m === month;
          return (
            <div key={m} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
              <div style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: 12,
                color: active ? ink : muted,
                fontWeight: 600,
                padding: '4px 0',
                borderTop: active ? `2.5px solid ${ink}` : `1px solid #00000022`,
                position: 'relative'
              }}>
                {m}
                {active &&
                <span style={{
                  position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
                  width: 6, height: 6, borderRadius: 99, background: ink
                }} />
                }
              </div>
            </div>);

        })}
        <div style={{ paddingLeft: 12, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 18, color: ink }}>2025</div>
      </div>
    </div>);

}

// Small annotation arrow + note (sketch overlay)
function Note({ x, y, text, w = 160, dir = 'right' }) {
  return (
    <div data-dev-note="1" style={{
      position: 'absolute', left: x, top: y, width: w,
      fontFamily: 'Montserrat, sans-serif', fontSize: 15, color: '#b04a3a',
      lineHeight: 1.1, pointerEvents: 'none', zIndex: 5
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
        {dir === 'left' && <svg width="22" height="14" style={{ flexShrink: 0, marginTop: 4 }}><path d="M 2 7 Q 10 0 20 7" stroke="#b04a3a" strokeWidth="1.4" fill="none" /><path d="M 2 7 L 6 4 M 2 7 L 6 10" stroke="#b04a3a" strokeWidth="1.4" fill="none" /></svg>}
        <span>{text}</span>
        {dir === 'right' && <svg width="22" height="14" style={{ flexShrink: 0, marginTop: 4 }}><path d="M 2 7 Q 12 0 20 7" stroke="#b04a3a" strokeWidth="1.4" fill="none" /><path d="M 20 7 L 16 4 M 20 7 L 16 10" stroke="#b04a3a" strokeWidth="1.4" fill="none" /></svg>}
      </div>
    </div>);

}

// ─── Variation 1: Dashboard + Quick Add hero ──────────────────────
function VarDashboard({ onNavigate, onOpenModal } = {}) {
  return (
    <div style={{ position: 'relative', height: '100%', background: paper, color: ink, fontFamily: 'Montserrat, sans-serif', overflow: 'hidden' }}>
      <TopBar activeTab="Lançamentos" onNavigate={onNavigate} />
      <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, height: 'calc(100% - 96px)' }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, height: '100%', overflow: 'auto' }}>
          {/* Quick add hero */}
          <Box style={{ padding: 16 }}>
            <SectionTitle sub="digite e enter — registra na hora" right={<KindSwitch active="Comum" />}>Lançar gasto</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1fr 0.7fr auto', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <DashedBox height={36} style={{ justifyContent: 'flex-start', paddingLeft: 12 }}>descrição…</DashedBox>
              <DashedBox height={36}>R$</DashedBox>
              <DashedBox height={36}>categoria ▾</DashedBox>
              <DashedBox height={36}>tipo ▾</DashedBox>
              <DashedBox height={36}>quem ▾</DashedBox>
              <div style={{ background: ink, color: paper, padding: '8px 14px', borderRadius: 6, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 14 }}>add</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: muted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>últimos:</span>
              <Pill color={CATS.Mercado.c}>Mercado</Pill> <Pill color={CATS.Combustivel.c}>Combustível</Pill> <Pill color={CATS.Padaria.c}>Padaria</Pill>
            </div>
          </Box>

          {/* Lançar entrada */}
          <Box style={{ padding: 16 }}>
            <SectionTitle
              sub="salário, extra, freela…"
              right={
                <div style={{ display: 'inline-flex', border: `1.4px solid ${ink}`, borderRadius: 8, padding: 2, background: paper }}>
                  {[['Salário', true], ['Extra', false]].map(([k, on]) => (
                    <span key={k} style={{
                      padding: '5px 12px', borderRadius: 6,
                      background: on ? '#2f5a48' : 'transparent',
                      color: on ? paper : ink2,
                      fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: on ? 600 : 500, letterSpacing: '-0.005em',
                    }}>{k}</span>
                  ))}
                </div>
              }
            >Lançar entrada</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr auto', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <DashedBox height={36} style={{ justifyContent: 'flex-start', paddingLeft: 12 }}>descrição da receita…</DashedBox>
              <DashedBox height={36}>R$</DashedBox>
              <DashedBox height={36}>quem ▾</DashedBox>
              <div style={{ background: '#2f5a48', color: paper, padding: '8px 14px', borderRadius: 6, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 14 }}>+ entrada</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: muted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>últimas:</span>
              <Pill color="#2f5a48">Salário Davi</Pill>
              <Pill color="#5a8a9a">Salário Eduarda</Pill>
              <Pill color="#d4a24a">Extra fotos</Pill>
            </div>
          </Box>

          {/* Recentes */}
          <Box style={{ padding: 16, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <SectionTitle sub="agosto — 14 lançamentos" right={<span style={{ fontSize: 12, color: muted }}>ver tudo →</span>}>Gastos comuns</SectionTitle>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              {[
              ['Padaria da esquina', 'hoje', 'Padaria', 'Eduarda', 'PIX', 28.50],
              ['Posto Shell', 'ontem', 'Combustivel', 'Davi', 'C6', 220],
              ['Mercado mês', '23 ago', 'Mercado', 'Eduarda', 'Nubank', 642.30],
              ['Cinema', '22 ago', 'FimDeSemana', 'Davi', 'PIX', 64],
              ['Farmácia', '21 ago', 'Saude', 'Eduarda', 'Débito', 38.90],
              ['Uber', '20 ago', 'Carro', 'Davi', 'PIX', 22],
              ['Café Cabral', '19 ago', 'Padaria', 'Davi', 'PIX', 18]].
              map(([desc, when, cat, who, tipo, val], i) =>
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '12px 1.6fr 70px 1fr 70px 70px 90px',
                alignItems: 'center', gap: 10, padding: '8px 0',
                borderBottom: i < 6 ? `1px dashed ${ink2}55` : 'none', fontSize: 13
              }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: CATS[cat].c }} />
                  <span>{desc}</span>
                  <span style={{ color: muted }}>{when}</span>
                  <span>{CATS[cat].label}</span>
                  <span style={{ color: muted }}>{who}</span>
                  <span style={{ color: muted, width: "60px" }}>{tipo}</span>
                  <span style={{ textAlign: 'right', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: "14px", whiteSpace: 'nowrap' }}>R$ {val.toFixed(2)}</span>
                </div>
              )}
            </div>
          </Box>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, height: '100%', overflow: 'auto', paddingBottom: 60 }}>
          {/* Saldo */}
          <Box style={{ padding: 16, background: paper2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: muted }}>saldo de agosto</div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 44, lineHeight: 1, color: ink, marginTop: 4 }}>R$ 2.348</div>
                <div style={{ fontSize: 12, color: muted, marginTop: 6 }}>
                  entradas <b style={{ color: ink }}>R$ 8.900</b> · gastos <b style={{ color: ink }}>R$ 6.552</b>
                </div>
              </div>
              <Donut pct={73} color={ink} label="73%" />
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: muted }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>usado do mês</span><span>R$ 6.552 / 9.000</span>
              </div>
              <Bar pct={73} color={ink} />
            </div>
          </Box>

          {/* Próximos vencimentos */}
          <Box style={{ padding: 16, flex: 1, minHeight: 0, overflow: 'auto' }}>
            <SectionTitle sub="6 vencendo nos próximos dias">Próximos vencimentos</SectionTitle>
            {[
            ['hoje', 'Aluguel', 'Boleto', 'Davi', 1800, 'urgente'],
            ['daqui a 2 dias', 'Energia', 'Boleto', 'Davi', 187, 'em breve'],
            ['daqui a 4 dias', 'Internet', 'Boleto', 'Davi', 99, 'em breve'],
            ['dia 25', 'iCloud', 'Nubank', 'Davi', 14.9, 'ok'],
            ['dia 25', 'Smiles', 'C6', 'Davi', 49, 'ok'],
            ['dia 31', 'Dízimo Edu', 'PIX', 'Eduarda', 250, 'ok']].
            map(([when, desc, tipo, who, val, urg], i) =>
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '84px 1fr 52px 52px 66px',
              gap: 6, alignItems: 'center', padding: '7px 0',
              borderBottom: i < 5 ? `1px dashed ${ink2}55` : 'none', fontSize: 13
            }}>
                <span style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 500,
                color: urg === 'urgente' ? '#b04a3a' : urg === 'em breve' ? '#c97a3a' : muted,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>● {when}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</span>
                <span style={{ color: muted, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tipo}</span>
                <span style={{ color: muted, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{who}</span>
                <span style={{ textAlign: 'right', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 13, whiteSpace: 'nowrap' }}>R$ {val}</span>
              </div>
            )}
          </Box>
        </div>
      </div>
      <FAB onClick={onOpenModal} />
      <Note x={520} y={114} w={170} text="entrada inline — sem modal" dir="left" />
    </div>);

}

// ─── Variation 2: Spreadsheet refined ─────────────────────────────
function VarSheet({ onNavigate, onOpenModal } = {}) {
  const rows = [
  ['Aluguel', 5, 'Davi', 'Boleto', 'Contas', 1800, true],
  ['Água', 5, 'Davi', 'Boleto', 'Contas', 78, true],
  ['Energia', 5, 'Davi', 'Boleto', 'Contas', 187, false],
  ['Internet', 5, 'Davi', 'Boleto', 'Contas', 99, false],
  ['ISSQN', 10, 'Eduarda', 'Boleto', 'Contas', 45, false],
  ['Multisports', 5, 'Davi', 'PIX', 'Academia', 170, true],
  ['Smiles', 25, 'Davi', 'C6', 'Assinatura', 49, false],
  ['iCloud', 25, 'Eduarda', 'Nubank', 'Assinatura', 14.90, false],
  ['Dízimo Davi', 5, 'Davi', 'PIX', 'Igreja', 250, true],
  ['Mensalidade MEI', '—', 'Eduarda', 'PIX', 'FimDeSemana', 130, false],
  ['Dízimo Eduarda', 31, 'Eduarda', 'PIX', 'Igreja', 250, false]];


  const Cell = ({ children, w, align = 'left', muted: m, color, mono }) =>
  <div style={{
    width: w, padding: '6px 8px', borderRight: `1px solid ${ink2}33`,
    fontSize: 12, color: m ? muted : ink, textAlign: align,
    fontFamily: mono ? 'Montserrat, sans-serif' : 'Montserrat, sans-serif',
    display: 'flex', alignItems: 'center', justifyContent: align === 'right' ? 'flex-end' : 'flex-start', gap: 6,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
  }}>
      {color && <span style={{ width: 8, height: 8, borderRadius: 99, background: color, flexShrink: 0 }} />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
    </div>;


  return (
    <div style={{ position: 'relative', height: '100%', background: paper, color: ink, fontFamily: 'Montserrat, sans-serif', overflow: 'hidden' }}>
      <TopBar activeTab="Fixos" compact onNavigate={onNavigate} />

      {/* Sub-toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: `1px solid ${ink2}33`, background: paper2 }}>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 28, color: ink, lineHeight: 1 }}>AGOSTO</span>
        <span style={{ color: muted, fontSize: 12 }}>11 fixos · 7 a pagar</span>
        <div style={{ flex: 1 }} />
        <Pill active>todos</Pill><Pill>a pagar</Pill><Pill>pagos</Pill>
        <span style={{ color: muted, fontSize: 12, marginLeft: 8 }}>agrupar por:</span>
        <Pill>pessoa</Pill><Pill active>—</Pill><Pill>tipo</Pill>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', height: 'calc(100% - 152px)' }}>
        {/* Sheet */}
        <div style={{ borderRight: `1.5px solid ${line}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${line}`, background: paper2, fontFamily: 'Montserrat, sans-serif', fontSize: 14, color: ink2 }}>
            <Cell w={36} align="center">✓</Cell>
            <Cell w={220}>Descrição</Cell>
            <Cell w={48} align="center">dia</Cell>
            <Cell w={84}>Pessoa</Cell>
            <Cell w={84}>Tipo</Cell>
            <Cell w={120}>Categoria</Cell>
            <Cell w={90} align="right">Valor</Cell>
          </div>
          {/* Body */}
          <div style={{ overflow: 'auto', flex: 1 }}>
            {rows.map(([desc, day, who, tipo, cat, val, paid], i) =>
            <div key={i} style={{
              display: 'flex', borderBottom: `1px solid ${ink2}22`,
              background: i % 2 ? '#0000000a' : 'transparent',
              opacity: paid ? 0.55 : 1
            }}>
                <Cell w={36} align="center">
                  <span style={{
                  width: 14, height: 14, border: `1.4px solid ${ink}`, borderRadius: 3,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: paid ? ink : 'transparent', color: paper, fontSize: 11
                }}>{paid ? '✓' : ''}</span>
                </Cell>
                <Cell w={220} style={{ textDecoration: paid ? 'line-through' : 'none' }}>{desc}</Cell>
                <Cell w={48} align="center" muted>{day}</Cell>
                <Cell w={84}>{who}</Cell>
                <Cell w={84} muted>{tipo}</Cell>
                <Cell w={120} color={CATS[cat]?.c}>{CATS[cat]?.label || cat}</Cell>
                <Cell w={90} align="right" mono>R$ {val.toFixed ? val.toFixed(2) : val}</Cell>
              </div>
            )}
            {/* New row */}
            <div style={{ display: 'flex', borderBottom: `1px dashed ${ink2}`, padding: '8px 8px', color: muted, fontSize: 12, fontFamily: 'Montserrat, sans-serif', fontSize: 14 }}>
              <span style={{ marginRight: 8 }}>＋</span> nova linha…
            </div>
          </div>
          {/* Totals */}
          <div style={{ display: 'flex', borderTop: `1.5px solid ${line}`, padding: '10px 12px', background: paper2, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 16, justifyContent: 'space-between' }}>
            <span>Total de Fixos</span><span>R$ 3.072,90</span>
          </div>
        </div>

        {/* Right rail: relatórios */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto' }}>
          <Box style={{ padding: 12 }}>
            <SectionTitle sub="3 vencendo essa semana">Alertas de prazo</SectionTitle>
            {[
            ['Energia', 'em 2 dias', '#b04a3a'],
            ['Internet', 'em 4 dias', '#c97a3a'],
            ['ISSQN', 'em 5 dias', '#c97a3a']].
            map(([n, t, c], i) =>
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, borderBottom: i < 2 ? `1px dashed ${ink2}44` : 'none' }}>
                <span>● {n}</span>
                <span style={{ color: c, fontFamily: 'Montserrat, sans-serif', fontSize: 15 }}>{t}</span>
              </div>
            )}
          </Box>

          <Box style={{ padding: 12 }}>
            <SectionTitle>Saídas por tipo</SectionTitle>
            {[
            ['PIX', 1480, '#7a8a3a'],
            ['Boleto', 2209, '#3a6a8a'],
            ['Nubank', 657, '#7a6ca8'],
            ['C6', 249, '#1a1a1a'],
            ['Débito', 38, '#c97a3a']].
            map(([k, v, c], i) => {
              const pct = v / 2500 * 100;
              return (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: c, marginRight: 6 }} />{k}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15 }}>R$ {v}</span>
                  </div>
                  <Bar pct={Math.min(100, pct)} color={c} height={5} />
                </div>);

            })}
          </Box>

          <Box style={{ padding: 12 }}>
            <SectionTitle>Davi vs Eduarda</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
              ['Davi', 3812, 58],
              ['Eduarda', 2740, 42]].
              map(([n, v, p], i) =>
              <div key={i} style={{ textAlign: 'center', padding: 8, border: `1.4px dashed ${ink2}`, borderRadius: 6 }}>
                  <Donut pct={p} color={i === 0 ? '#3a6a8a' : '#c79bb0'} size={56} label={`${p}%`} />
                  <div style={{ marginTop: 6, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 18 }}>{n}</div>
                  <div style={{ fontSize: 12, color: muted }}>R$ {v}</div>
                </div>
              )}
            </div>
          </Box>
        </div>
      </div>
      <FAB onClick={onOpenModal} />
      <Note x={32} y={158} w={200} dir="left" text="checkbox + linha riscada quando pago" />
    </div>);

}

// ─── Variation 3: Modular widgets dashboard ───────────────────────
function VarWidgets({ onNavigate, onOpenModal } = {}) {
  const W = ({ title, children, span = 1, color, style = {} }) =>
  <div style={{
    gridColumn: `span ${span}`,
    border: `1.5px solid ${line}`, borderRadius: 10, padding: 14, background: paper,
    display: 'flex', flexDirection: 'column', gap: 8, position: 'relative',
    ...style
  }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 18, color: ink, display: 'flex', alignItems: 'center', gap: 8 }}>
          {color && <span style={{ width: 10, height: 10, borderRadius: 99, background: color }} />}
          {title}
        </div>
        <span style={{ color: muted, fontSize: 14, fontFamily: 'Montserrat, sans-serif' }}>⋯</span>
      </div>
      {children}
    </div>;


  return (
    <div style={{ position: 'relative', height: '100%', background: paper2, color: ink, fontFamily: 'Montserrat, sans-serif', overflow: 'hidden' }}>
      <TopBar activeTab="Lançamentos" onNavigate={onNavigate} />
      <div style={{ padding: 18, height: 'calc(100% - 96px)', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 30, lineHeight: 1, color: ink }}>Bom dia, Davi 👋</div>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>terça, 27 de agosto · agosto ainda tem 4 dias</div>
          </div>
          <Pill style={{ fontSize: 13, padding: '6px 14px' }}>+ editar widgets</Pill>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {/* Big saldo */}
          <W title="Saldo de agosto" span={2} style={{ background: ink, color: paper, border: 'none' }}>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 56, lineHeight: 1 }}>R$ 2.348</div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>+ R$ 312 vs julho</div>
            <svg viewBox="0 0 200 50" style={{ marginTop: 6 }}>
              <path d="M 0 35 L 20 30 L 40 32 L 60 28 L 80 22 L 100 25 L 120 18 L 140 20 L 160 14 L 180 10 L 200 12"
              stroke={paper} strokeWidth="2" fill="none" />
            </svg>
          </W>

          {/* Vencimentos */}
          <W title="Próximos vencimentos" span={2}>
            {[
            ['Aluguel', 'hoje', 1800, '#b04a3a'],
            ['Energia', '+2 dias', 187, '#c97a3a'],
            ['Internet', '+4 dias', 99, '#c97a3a'],
            ['iCloud', 'dia 25', 14.9, muted]].
            map(([n, t, v, c], i) =>
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '5px 0', borderBottom: i < 3 ? `1px dashed ${ink2}44` : 'none', fontSize: 13
            }}>
                <span><span style={{ color: c, fontFamily: 'Montserrat, sans-serif', fontSize: 14 }}>{t}</span>  ·  {n}</span>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 16 }}>R$ {v}</span>
              </div>
            )}
          </W>

          {/* Donut categoria */}
          <W title="Maiores categorias">
            <div style={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
              <Donut pct={68} size={100} color={CATS.Contas.c} label="68%" />
            </div>
            <div style={{ fontSize: 11, color: muted, textAlign: 'center' }}>contas + mercado = 68%</div>
          </W>

          {/* Por pessoa */}
          <W title="Por pessoa">
            {[
            ['Davi', 3812, 58, CATS.Combustivel.c],
            ['Eduarda', 2740, 42, CATS.Beleza.c]].
            map(([n, v, p, c], i) =>
            <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>{n}</span><span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15 }}>R$ {v}</span>
                </div>
                <Bar pct={p} color={c} />
              </div>
            )}
          </W>

          {/* Investimentos */}
          <W title="Investimentos" color="#2f5a48">
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 28 }}>R$ 14.820</div>
            <div style={{ fontSize: 12, color: muted }}>caixinha + renda fixa</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              <div style={{ flex: 3, height: 8, background: '#2f5a48', borderRadius: 4 }} />
              <div style={{ flex: 2, height: 8, background: '#5a8a9a', borderRadius: 4 }} />
              <div style={{ flex: 1, height: 8, background: '#d4a24a', borderRadius: 4 }} />
            </div>
          </W>

          {/* Parcelamentos */}
          <W title="Parcelamentos">
            {[
            ['iPhone', '6/12', 320],
            ['Sofá', '3/10', 199],
            ['Viagem RJ', '2/4', 450]].
            map(([n, p, v], i) =>
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: i < 2 ? `1px dashed ${ink2}44` : 'none' }}>
                <span>{n}  <span style={{ color: muted, fontSize: 11 }}>{p}</span></span>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15 }}>R$ {v}</span>
              </div>
            )}
          </W>

          {/* Comando rápido */}
          <W title="Lançar rápido" span={2} color="#d4a24a">
            <KindSwitch active="Comum" />
            <DashedBox height={36} style={{ justifyContent: 'flex-start', paddingLeft: 12, marginTop: 4 }}>"45 mercado pix eduarda" ↵</DashedBox>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Pill color={CATS.Mercado.c}>Mercado</Pill>
              <Pill color={CATS.Padaria.c}>Padaria</Pill>
              <Pill color={CATS.Combustivel.c}>Combustível</Pill>
              <Pill color={CATS.FimDeSemana.c}>Fim de semana</Pill>
              <Pill>+ favoritos</Pill>
            </div>
          </W>

          {/* Cards categoria — meta */}
          <W title="Metas de gasto" span={2}>
            {[
            ['Mercado', 642, 650, CATS.Mercado.c],
            ['FimDeSemana', 480, 600, CATS.FimDeSemana.c],
            ['Combustivel', 220, 200, CATS.Combustivel.c]].
            map(([k, v, t, c], i) => {
              const pct = v / t * 100;
              return (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span>{CATS[k].label}</span>
                    <span style={{ color: v > t ? '#b04a3a' : muted, fontFamily: 'Montserrat, sans-serif', fontSize: 14 }}>R$ {v} / {t}</span>
                  </div>
                  <Bar pct={Math.min(100, pct)} color={c} height={6} />
                </div>);

            })}
          </W>
        </div>
      </div>
      <FAB onClick={onOpenModal} />
      <Note x={620} y={148} w={170} dir="right" text="widgets reordenáveis" />
    </div>);

}

// ─── Variation 4: Timeline / feed ─────────────────────────────────
function VarTimeline({ onNavigate, onOpenModal } = {}) {
  const days = [
  { day: 'hoje · ter 27/8', total: 46.50, items: [
    ['10:42', 'Padaria da esquina', 'Padaria', 'Eduarda', 'PIX', 28.5],
    ['08:15', 'Café', 'Padaria', 'Davi', 'PIX', 18]]
  },
  { day: 'ontem · seg 26/8', total: 242, items: [
    ['18:32', 'Posto Shell', 'Combustivel', 'Davi', 'C6', 220],
    ['12:10', 'Almoço', 'Padaria', 'Eduarda', 'PIX', 22]]
  },
  { day: 'sáb 24/8', total: 706.30, items: [
    ['19:00', 'Cinema', 'FimDeSemana', 'Davi', 'PIX', 64],
    ['14:23', 'Mercado mês', 'Mercado', 'Eduarda', 'Nubank', 642.3]]
  },
  { day: 'qui 22/8', total: 60.90, items: [
    ['09:00', 'Farmácia', 'Saude', 'Eduarda', 'Débito', 38.9],
    ['07:30', 'Uber', 'Carro', 'Davi', 'PIX', 22]]
  }];


  return (
    <div style={{ position: 'relative', height: '100%', background: paper, color: ink, fontFamily: 'Montserrat, sans-serif', overflow: 'hidden' }}>
      <TopBar activeTab="Lançamentos" onNavigate={onNavigate} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: 'calc(100% - 96px)' }}>
        {/* Timeline feed */}
        <div style={{ overflow: 'auto', padding: '18px 24px 60px', position: 'relative' }}>
          <SectionTitle sub="cada dia agrupa seus lançamentos">Agosto, do mais recente</SectionTitle>

          <div style={{ position: 'relative', paddingLeft: 26, marginTop: 16 }}>
            {/* Vertical spine */}
            <div style={{ position: 'absolute', left: 8, top: 6, bottom: 6, width: 1.5, background: ink2, opacity: 0.4 }} />

            {days.map((d, di) =>
            <div key={di} style={{ marginBottom: 24, position: 'relative' }}>
                {/* Node */}
                <div style={{ position: 'absolute', left: -22, top: 4, width: 16, height: 16, borderRadius: 99, background: paper, border: `2px solid ${ink}` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 22 }}>{d.day}</div>
                  <div style={{ color: muted, fontSize: 13 }}>total <b style={{ color: ink, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 18 }}>R$ {d.total.toFixed(2)}</b></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {d.items.map(([t, desc, cat, who, tipo, val], i) =>
                <Box key={i} style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 12, alignItems: 'center' }}>
                      <span style={{ color: muted, fontFamily: 'Montserrat, sans-serif', fontSize: 14 }}>{t}</span>
                      <div>
                        <div style={{ fontSize: 14 }}>{desc}</div>
                        <div style={{ fontSize: 11, color: muted, marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ width: 7, height: 7, borderRadius: 99, background: CATS[cat].c }} />
                          {CATS[cat].label} · {who} · {tipo}
                        </div>
                      </div>
                      <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 20 }}>R$ {val.toFixed(2)}</span>
                    </Box>
                )}
                </div>
              </div>
            )}

            {/* End marker */}
            <div style={{ position: 'absolute', left: -22, bottom: 0, width: 16, height: 16, borderRadius: 99, background: ink }} />
            <div style={{ color: muted, fontSize: 12, paddingTop: 4 }}>início de agosto</div>
          </div>
        </div>

        {/* Right rail: resumo + ações */}
        <div style={{ borderLeft: `1.5px solid ${line}`, padding: 18, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto', background: paper2 }}>
          <div>
            <div style={{ color: muted, fontSize: 12 }}>saldo de agosto</div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 38, lineHeight: 1, marginTop: 2 }}>R$ 2.348</div>
            <Bar pct={73} color={ink} />
            <div style={{ fontSize: 11, color: muted, marginTop: 4 }}>R$ 6.552 de R$ 9.000 esperado</div>
          </div>

          <Box style={{ padding: 12 }}>
            <SectionTitle sub="2 a pagar essa semana">Fixos do mês</SectionTitle>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span>pagos</span><span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 16 }}>4 / 11</span>
            </div>
            <Bar pct={36} color={ink} height={6} />
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12 }}>
              <div style={{ color: '#b04a3a' }}>● Aluguel — hoje</div>
              <div style={{ color: '#c97a3a' }}>● Energia — em 2 dias</div>
              <div style={{ color: muted }}>● Internet — em 4 dias</div>
            </div>
          </Box>

          <Box style={{ padding: 12 }}>
            <SectionTitle>Gastos por categoria</SectionTitle>
            {[
            ['Contas', 1300, CATS.Contas.c],
            ['Mercado', 642, CATS.Mercado.c],
            ['FimDeSemana', 480, CATS.FimDeSemana.c],
            ['Combustivel', 220, CATS.Combustivel.c],
            ['Saude', 38, CATS.Saude.c]].
            map(([k, v, c], i) => {
              const max = 1500;
              return (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span>{CATS[k].label}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14 }}>R$ {v}</span>
                  </div>
                  <Bar pct={v / max * 100} color={c} height={5} />
                </div>);

            })}
          </Box>

          <Box style={{ padding: 12 }}>
            <SectionTitle>Davi vs Eduarda</SectionTitle>
            <div style={{ display: 'flex', height: 14, borderRadius: 99, overflow: 'hidden', border: `1px solid ${ink2}` }}>
              <div style={{ flex: 58, background: '#3a6a8a' }} />
              <div style={{ flex: 42, background: '#c79bb0' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: muted, marginTop: 4 }}>
              <span>Davi · 58%</span><span>Eduarda · 42%</span>
            </div>
          </Box>
        </div>
      </div>
      <FAB onClick={onOpenModal} />
      <Note x={300} y={130} w={170} dir="left" text="agrupado por dia, tipo feed" />
    </div>);

}

// ─── Expose ────────────────────────────────────────────────────────
Object.assign(window, {
  VarDashboard, VarSheet, VarWidgets, VarTimeline, KindSwitch, TopBar
});