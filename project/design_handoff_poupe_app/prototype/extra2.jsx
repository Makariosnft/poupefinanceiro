/* global React */
// Login page + Parcelamentos (full page) + Gastos do mês (full page)

const P_ink = '#1a1815';
const P_ink2 = '#4a463f';
const P_muted = '#8a857a';
const P_paper = '#fbf8f1';
const P_paper2 = '#f3eee2';
const P_green = '#2f5a48';
const P_red = '#b04a3a';
const P_amber = '#c97a3a';
const P_blue = '#3a6a8a';
const P_gold = '#d4a24a';

const CATS2 = {
  Contas: '#b04a3a', Mercado: '#7a8a3a', Combustivel: '#3a6a8a', Carro: '#2f5a48',
  Beleza: '#c79bb0', Academia: '#7a6ca8', Assinatura: '#d4a24a', Igreja: '#5a8a9a',
  FimDeSemana: '#c97a3a', Saude: '#8a9a5a', Roupa: '#a86a6a', Viagem: '#c44a4a',
  Padaria: '#d4b48a', Eletronico: '#5a5a8a',
};

function PBox({ children, style = {}, ...rest }) {
  return <div style={{ border: `1.5px solid ${P_ink}`, borderRadius: 8, padding: 14, background: P_paper, ...style }} {...rest}>{children}</div>;
}
function PTitle({ children, sub, right }) {
  const w = Math.min(150, String(children).length * 9);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10, gap: 12 }}>
      <div>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 17, color: P_ink, lineHeight: 1 }}>{children}</div>
        {sub && <div style={{ fontSize: 12, color: P_muted, marginTop: 5 }}>{sub}</div>}
        <svg width={w} height="5" style={{ display: 'block', marginTop: 3 }}><path d={`M 1 2.5 Q ${w*0.3} 0 ${w*0.5} 2.5 T ${w-1} 2.5`} stroke={P_ink} strokeWidth="1.4" fill="none" /></svg>
      </div>
      {right}
    </div>
  );
}
function PBar({ pct, color = P_ink, height = 7 }) {
  const p = Math.max(0, Math.min(100, pct));
  return <div style={{ height, background: '#0000000d', border: `1px solid ${P_ink2}33`, borderRadius: 99, overflow: 'hidden' }}><div style={{ width: `${p}%`, height: '100%', background: color }} /></div>;
}

function PTopBar({ activeTab = 'Parcelamentos', onNavigate }) {
  const tabs = ['Lançamentos', 'Gastos do mês', 'Fixos', 'Parcelamentos', 'Diagnóstico', 'Dívidas', 'Metas', 'Relatórios'];
  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return (
    <div style={{ borderBottom: `1.5px solid ${P_ink}`, background: P_paper }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 10px', gap: 6 }}>
        <img src="assets/poupe-logo-trim.png" alt="Poupê" style={{ height: 24, display: 'block' }} />
        <nav style={{ display: 'flex', gap: 3, marginLeft: 4, flexShrink: 1, minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none', flexWrap: 'nowrap' }}>
          {tabs.map(t => (
            <div key={t} onClick={() => onNavigate && onNavigate(t)} style={{ padding: '5px 3px', cursor: onNavigate ? 'pointer' : 'default', fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 600, color: t === activeTab ? P_ink : P_ink2, borderBottom: t === activeTab ? `2.5px solid ${P_ink}` : '2.5px solid transparent', marginBottom: -1, whiteSpace: 'nowrap' }}>{t}</div>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: P_muted }}>quem:</span>
          {['Todos', 'Davi', 'Eduarda'].map(p => (
            <span key={p} style={{ padding: '2px 5px', border: `1.4px solid ${p === 'Todos' ? P_ink : P_ink2}`, borderRadius: 99, background: p === 'Todos' ? P_ink : 'transparent', color: p === 'Todos' ? P_paper : P_ink, fontFamily: 'Montserrat, sans-serif', fontSize: 9.5 }}>{p}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', padding: '0 10px 8px', alignItems: 'center' }}>
        {MESES.map(m => {
          const active = m === 'Ago';
          return (
            <div key={m} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: active ? P_ink : P_muted, fontWeight: 600, padding: '4px 0', borderTop: active ? `2.5px solid ${P_ink}` : '1px solid #00000022', position: 'relative' }}>
                {m}
                {active && <span style={{ position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: 99, background: P_ink }} />}
              </div>
            </div>
          );
        })}
        <div style={{ paddingLeft: 12, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 18, color: P_ink }}>2025</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════
function VarLogin({ onLogin } = {}) {
  const SocialBtn = ({ label, icon }) => (
    <div onClick={onLogin} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      padding: '12px 16px', border: `1.5px solid ${P_ink2}55`, borderRadius: 9,
      fontWeight: 600, fontSize: 14, color: P_ink, background: P_paper, cursor: 'pointer',
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>{label}
    </div>
  );
  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', fontFamily: 'Montserrat, sans-serif', overflow: 'hidden', minHeight: 0 }}>
      {/* Left brand panel */}
      <div style={{
        background: P_ink, color: P_paper, padding: 40,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28,
        overflow: 'auto', minHeight: 0,
        backgroundImage: `radial-gradient(circle at 15% 15%, ${P_green}44 0%, transparent 45%), radial-gradient(circle at 85% 90%, ${P_blue}33 0%, transparent 45%)`,
      }}>
        <div>
          <img src="assets/poupe-logo-trim.png" alt="Poupê" style={{ height: 50, display: 'block', objectFit: 'contain', filter: 'invert(1) brightness(2)', marginBottom: 18 }} />
          <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: '-0.025em', lineHeight: 1.12, maxWidth: 420 }}>
            Suas finanças, organizadas a dois.
          </div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 14, maxWidth: 380, lineHeight: 1.5 }}>
            Lance gastos, acompanhe fixos e dívidas, e receba diagnósticos com IA — tudo num só lugar pro seu casal ou família.
          </div>
        </div>
        <div style={{ marginTop: 40, display: 'flex', gap: 18, fontSize: 12, opacity: 0.6 }}>
          <span>© 2025 Poupê</span><span>Privacidade</span><span>Termos</span>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ background: P_paper, padding: '40px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflow: 'auto', minHeight: 0 }}>
        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
          <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em' }}>Entrar</div>
          <div style={{ fontSize: 13, color: P_muted, marginTop: 6 }}>Bem-vindo de volta. Vamos conferir o mês?</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
            <SocialBtn label="Continuar com Google" icon="G" />
            <SocialBtn label="Continuar com Apple" icon="" />
            <SocialBtn label="Continuar com Microsoft" icon="⊞" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: `${P_ink2}33` }} />
            <span style={{ fontSize: 11, color: P_muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>ou com e-mail</span>
            <div style={{ flex: 1, height: 1, background: `${P_ink2}33` }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: P_muted, marginBottom: 5 }}>e-mail</div>
              <div style={{ border: `1.4px solid ${P_ink2}55`, borderRadius: 8, padding: '11px 12px', color: P_muted, fontSize: 14 }}>davi@email.com</div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, color: P_muted, marginBottom: 5 }}>senha</div>
                <span style={{ fontSize: 11, color: P_blue }}>esqueci a senha</span>
              </div>
              <div style={{ border: `1.4px solid ${P_ink2}55`, borderRadius: 8, padding: '11px 12px', color: P_muted, fontSize: 14 }}>••••••••</div>
            </div>
          </div>

          <div onClick={onLogin} style={{ marginTop: 20, padding: '13px 0', textAlign: 'center', background: P_ink, color: P_paper, borderRadius: 9, fontWeight: 700, fontSize: 14, boxShadow: '0 3px 0 rgba(0,0,0,0.15)', cursor: 'pointer' }}>
            Entrar →
          </div>

          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: P_muted }}>
            Não tem conta? <span style={{ color: P_ink, fontWeight: 700 }}>Criar conta grátis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PARCELAMENTOS — full dashboard page
// ═══════════════════════════════════════════════════════════════════
function VarParcelamentos({ onNavigate } = {}) {
  const items = [
    { name: 'iPhone 15',        cat: 'Eletronico', who: 'Davi',    current: 6,  total: 12, installment: 320,  bank: 'Nubank',  nextDate: '05 set' },
    { name: 'Sofá retrátil',    cat: 'Roupa',      who: 'Eduarda', current: 3,  total: 10, installment: 199,  bank: 'C6',      nextDate: '10 set' },
    { name: 'Viagem RJ',        cat: 'Viagem',     who: 'Davi',    current: 2,  total: 4,  installment: 450,  bank: 'Nubank',  nextDate: '12 set' },
    { name: 'Notebook Eduarda', cat: 'Eletronico', who: 'Eduarda', current: 9,  total: 10, installment: 280,  bank: 'Itaú',    nextDate: '08 set' },
    { name: 'Colchão casal',    cat: 'Roupa',      who: 'Davi',    current: 1,  total: 6,  installment: 210,  bank: 'C6',      nextDate: '15 set' },
  ].map(i => ({ ...i, remaining: i.installment * (i.total - i.current), totalValue: i.installment * i.total }));

  const monthlyTotal = items.reduce((s, i) => s + i.installment, 0);
  const remainingTotal = items.reduce((s, i) => s + i.remaining, 0);
  const endingSoon = [...items].sort((a, b) => (a.total - a.current) - (b.total - b.current))[0];

  return (
    <div style={{ position: 'relative', height: '100%', background: P_paper, color: P_ink, fontFamily: 'Montserrat, sans-serif', overflow: 'hidden' }}>
      <PTopBar activeTab="Parcelamentos" onNavigate={onNavigate} />
      <div style={{ padding: 20, height: 'calc(100% - 96px)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          {/* Hero totals */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <PBox style={{ padding: 14 }}>
              <div style={{ fontSize: 10, color: P_muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>comprometido/mês</div>
              <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginTop: 4 }}>R$ {monthlyTotal.toLocaleString('pt-BR')}</div>
            </PBox>
            <PBox style={{ padding: 14 }}>
              <div style={{ fontSize: 10, color: P_muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>ainda falta pagar</div>
              <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginTop: 4, color: P_amber }}>R$ {remainingTotal.toLocaleString('pt-BR')}</div>
            </PBox>
            <PBox style={{ padding: 14 }}>
              <div style={{ fontSize: 10, color: P_muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>quita primeiro</div>
              <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em', marginTop: 4, color: P_green }}>{endingSoon.name}</div>
              <div style={{ fontSize: 11, color: P_muted, marginTop: 2 }}>faltam {endingSoon.total - endingSoon.current}x</div>
            </PBox>
          </div>

          {/* List */}
          <PBox style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <PTitle sub="5 parcelamentos ativos · ordenados por parcela atual" right={<span style={{ fontSize: 11, color: P_muted }}>+ novo parcelamento</span>}>Parcelamentos ativos</PTitle>
            <div style={{ overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {items.map((it, i) => {
                const pct = (it.current / it.total) * 100;
                return (
                  <div key={i} style={{ padding: '10px 12px', border: `1.4px solid ${P_ink2}44`, borderRadius: 8, background: '#fff8' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr auto auto auto', gap: 14, alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 99, background: CATS2[it.cat] }} />
                          <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.005em' }}>{it.name}</span>
                          <span style={{ fontSize: 10, color: P_muted }}>{it.who} · {it.bank}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <div style={{ flex: 1, maxWidth: 220 }}><PBar pct={pct} color={CATS2[it.cat]} height={5} /></div>
                          <span style={{ fontSize: 11, color: P_muted, whiteSpace: 'nowrap' }}>{it.current}/{it.total}x</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 9, color: P_muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>parcela</div>
                        <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>R$ {it.installment}</div>
                      </div>
                      <div style={{ textAlign: 'right', borderLeft: `1px dashed ${P_ink2}44`, paddingLeft: 12 }}>
                        <div style={{ fontSize: 9, color: P_muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>falta</div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: P_amber, whiteSpace: 'nowrap' }}>R$ {it.remaining.toLocaleString('pt-BR')}</div>
                      </div>
                      <div style={{ textAlign: 'right', borderLeft: `1px dashed ${P_ink2}44`, paddingLeft: 12 }}>
                        <div style={{ fontSize: 9, color: P_muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>próx.</div>
                        <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{it.nextDate}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </PBox>
        </div>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          <PBox style={{ padding: 14 }}>
            <PTitle sub="quando cada um termina">Linha do tempo</PTitle>
            <div style={{ position: 'relative', paddingLeft: 20 }}>
              <div style={{ position: 'absolute', left: 6, top: 4, bottom: 4, width: 1.5, background: P_ink2, opacity: 0.3 }} />
              {[...items].sort((a, b) => (a.total - a.current) - (b.total - b.current)).map((it, i) => (
                <div key={i} style={{ position: 'relative', paddingBottom: i < items.length - 1 ? 12 : 0 }}>
                  <div style={{ position: 'absolute', left: -16, top: 2, width: 11, height: 11, borderRadius: 99, background: CATS2[it.cat], border: `2px solid ${P_paper}` }} />
                  <div style={{ fontSize: 10, color: P_muted, letterSpacing: '0.04em' }}>faltam {it.total - it.current}x</div>
                  <div style={{ fontWeight: 600, fontSize: 12.5 }}>{it.name}</div>
                </div>
              ))}
            </div>
          </PBox>
          <PBox style={{ padding: 14, flex: 1 }}>
            <PTitle sub="quem está pagando mais">Por pessoa</PTitle>
            {['Davi', 'Eduarda'].map((who, i) => {
              const v = items.filter(it => it.who === who).reduce((s, it) => s + it.installment, 0);
              const pct = (v / monthlyTotal) * 100;
              const color = who === 'Davi' ? P_blue : '#c79bb0';
              return (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                    <span style={{ fontWeight: 600 }}>{who}</span><span style={{ fontWeight: 700 }}>R$ {v}/mês</span>
                  </div>
                  <PBar pct={pct} color={color} />
                </div>
              );
            })}
          </PBox>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GASTOS DO MÊS — only "comum" (one-off, non-recurring) expenses
// ═══════════════════════════════════════════════════════════════════
function VarGastosDoMes({ onNavigate } = {}) {
  const items = [
    { desc: 'Cinema em família',   cat: 'FimDeSemana', who: 'Davi',    tipo: 'PIX',    val: 64,    date: '22 ago' },
    { desc: 'Presente aniversário', cat: 'Presente',    who: 'Eduarda', tipo: 'Nubank', val: 120,   date: '19 ago' },
    { desc: 'Farmácia',            cat: 'Saude',        who: 'Eduarda', tipo: 'Débito', val: 38.9,  date: '21 ago' },
    { desc: 'Consulta dentista',   cat: 'Saude',        who: 'Davi',    tipo: 'PIX',    val: 180,   date: '14 ago' },
    { desc: 'Camisa nova',         cat: 'Roupa',        who: 'Davi',    tipo: 'C6',     val: 89.9,  date: '11 ago' },
    { desc: 'Uber aeroporto',      cat: 'Carro',        who: 'Eduarda', tipo: 'PIX',    val: 54,    date: '09 ago' },
    { desc: 'Curso online',        cat: 'Cursos',       who: 'Davi',    tipo: 'Nubank', val: 97,    date: '05 ago' },
  ];
  const withColor = items.map(i => ({ ...i, c: CATS2[i.cat] || '#8a857a' }));
  const total = items.reduce((s, i) => s + i.val, 0);

  // group by category for the breakdown
  const byCat = {};
  items.forEach(i => { byCat[i.cat] = (byCat[i.cat] || 0) + i.val; });
  const catList = Object.entries(byCat).sort((a, b) => b[1] - a[1]);

  const prevTotal = 812; // comparação com mês anterior (mock)
  const delta = total - prevTotal;

  return (
    <div style={{ position: 'relative', height: '100%', background: P_paper, color: P_ink, fontFamily: 'Montserrat, sans-serif', overflow: 'hidden' }}>
      <PTopBar activeTab="Gastos do mês" onNavigate={onNavigate} />
      <div style={{ padding: 20, height: 'calc(100% - 96px)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          <PBox style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, color: P_muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>gastos avulsos de agosto</div>
                <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', marginTop: 4 }}>R$ {total.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: P_muted, marginTop: 6 }}>
                  só o que <b>não é fixo nem parcelado</b> — coisas pontuais desse mês
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: P_muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>vs julho</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: delta > 0 ? P_red : P_green, marginTop: 4 }}>
                  {delta > 0 ? '↑' : '↓'} R$ {Math.abs(delta).toFixed(0)}
                </div>
              </div>
            </div>
          </PBox>

          <PBox style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <PTitle sub={`${items.length} lançamentos avulsos em agosto`} right={<span style={{ fontSize: 11, color: P_muted }}>ordenar por data ▾</span>}>Só esse mês</PTitle>
            <div style={{ overflow: 'auto', flex: 1 }}>
              {withColor.map((it, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '12px 1.7fr 60px 1fr 70px 90px', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < items.length - 1 ? `1px dashed ${P_ink2}44` : 'none', fontSize: 13 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: it.c }} />
                  <span>{it.desc}</span>
                  <span style={{ color: P_muted, fontSize: 11 }}>{it.date}</span>
                  <span>{it.who}</span>
                  <span style={{ color: P_muted, fontSize: 11 }}>{it.tipo}</span>
                  <span style={{ textAlign: 'right', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>R$ {it.val.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </PBox>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          <PBox style={{ padding: 14 }}>
            <PTitle sub="onde foi o dinheiro avulso">Por categoria</PTitle>
            {catList.map(([cat, v], i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: CATS2[cat] || '#8a857a', marginRight: 6 }} />{cat}</span>
                  <span style={{ fontWeight: 700 }}>R$ {v.toFixed(0)}</span>
                </div>
                <PBar pct={(v / total) * 100} color={CATS2[cat] || '#8a857a'} height={5} />
              </div>
            ))}
          </PBox>

          <PBox style={{ padding: 14, flex: 1 }}>
            <PTitle sub="lembrete simples">Por que separar isso?</PTitle>
            <div style={{ fontSize: 12.5, color: P_ink2, lineHeight: 1.55 }}>
              Fixos e parcelamentos já são previsíveis. Esta aba mostra só o <b>imprevisível</b> —
              o que ajuda a enxergar rápido se algum mês teve gasto fora da curva
              (viagem, presente, emergência) sem misturar com o que é rotina.
            </div>
            <div style={{ marginTop: 12, padding: '10px 12px', border: `1px dashed ${P_blue}66`, background: `${P_blue}0d`, borderRadius: 7, fontSize: 12, color: P_ink2 }}>
              <b>Dica:</b> se uma categoria avulsa se repetir 3 meses seguidos, o Poupê sugere transformá-la em fixo.
            </div>
          </PBox>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VarLogin, VarParcelamentos, VarGastosDoMes });
