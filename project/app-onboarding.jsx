/* global React */
// Poupê — Login + Onboarding funcionais (editam o store de verdade).

const S3 = window.PoupeStore, U3 = window.PoupeUI;
const { Button: B, IconBtn: IB, Field: F, Input: I, MoneyInput: M, Select: Se, Chip: C, Card: Ca, Bar: Ba } = U3;
const T = U3.tokens;
const LOGO3 = U3.LOGO;

const PALETTE = ['#b04a3a', '#7a8a3a', '#3a6a8a', '#2f5a48', '#c79bb0', '#7a6ca8', '#d4a24a', '#5a8a9a', '#c97a3a', '#8a9a5a', '#a86a6a', '#c44a4a', '#d4b48a', '#5a5a8a', '#a85a8a', '#8a6a4a'];
const BANK_PRESETS = [
  { name: 'Nubank', color: '#8a3ffc' }, { name: 'C6 Bank', color: '#1a1a1a' },
  { name: 'Banco do Brasil', color: '#fbc630' }, { name: 'Caixa', color: '#0066b3' },
  { name: 'Itaú', color: '#ec7000' }, { name: 'Inter', color: '#ff7a00' },
  { name: 'Bradesco', color: '#cc092f' }, { name: 'Santander', color: '#ec0000' },
];

// ── Login ──────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = React.useState('davi@email.com');
  const [pass, setPass] = React.useState('••••••••');
  const [mode, setMode] = React.useState('entrar');
  const [loading, setLoading] = React.useState(null);

  const go = (via) => {
    setLoading(via);
    setTimeout(() => { setLoading(null); onLogin(); }, via === 'email' ? 450 : 700);
  };

  const Social = ({ icon, label, id }) => (
    <button type="button" onClick={() => go(id)} disabled={!!loading}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '11px 12px', border: `1.4px solid ${T.ink2}55`, borderRadius: 9, background: T.paper,
        fontSize: 13, fontWeight: 600, color: T.ink, cursor: loading ? 'wait' : 'pointer',
        fontFamily: 'Montserrat, sans-serif', transition: 'border-color .15s, background .15s, transform .12s',
        opacity: loading && loading !== id ? 0.5 : 1, whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = T.ink; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${T.ink2}55`; e.currentTarget.style.transform = 'translateY(0)'; }}>
      <span style={{ fontSize: 15, fontWeight: 800 }}>{icon}</span>
      {loading === id ? 'entrando…' : label}
    </button>
  );

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', fontFamily: 'Montserrat, sans-serif', overflow: 'hidden' }}>
      <div style={{
        background: T.ink, color: T.paper, padding: 44, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', overflow: 'auto', minHeight: 0,
        backgroundImage: 'radial-gradient(circle at 85% 12%, rgba(47,90,72,.38) 0%, transparent 46%), radial-gradient(circle at 8% 92%, rgba(58,106,138,.28) 0%, transparent 46%)',
      }}>
        <div>
          <img src={LOGO3} alt="Poupê" style={{ height: 50, width: 'auto', objectFit: 'contain', display: 'block', filter: 'invert(1) brightness(2)', marginBottom: 26 }} />
          <div style={{ fontWeight: 800, fontSize: 33, letterSpacing: '-0.028em', lineHeight: 1.15, maxWidth: 400 }}>
            Suas finanças, organizadas a dois.
          </div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 14, maxWidth: 370, lineHeight: 1.55 }}>
            Lance gastos em segundos, acompanhe fixos, parcelas, dívidas e metas — tudo num só lugar, pra você e quem divide a vida com você.
          </div>
          <div style={{ display: 'flex', gap: 18, fontSize: 11.5, opacity: 0.55, marginTop: 40 }}>
            <span>© 2026 Poupê</span><span>Privacidade</span><span>Termos</span>
          </div>
        </div>
      </div>

      <div style={{ background: T.paper, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '44px 44px', overflow: 'auto', minHeight: 0 }}>
        <div style={{ width: '100%', maxWidth: 372, marginTop: 'auto', marginBottom: 'auto' }}>
          <div style={{ fontWeight: 800, fontSize: 25, letterSpacing: '-0.022em' }}>{mode === 'entrar' ? 'Bem-vindo de volta' : 'Criar sua conta'}</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 6 }}>
            {mode === 'entrar' ? 'Entre para continuar organizando suas finanças' : 'Comece grátis — leva menos de um minuto'}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            <Social icon="G" label="Google" id="google" />
            <Social icon="" label="Apple" id="apple" />
          </div>
          <div style={{ marginTop: 8 }}><Social icon="⊞" label="Continuar com Microsoft" id="ms" /></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: `${T.ink2}2e` }} />
            <span style={{ fontSize: 10.5, color: T.muted, letterSpacing: '0.07em', textTransform: 'uppercase' }}>ou com e-mail</span>
            <div style={{ flex: 1, height: 1, background: `${T.ink2}2e` }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <F label="e-mail"><I type="email" value={email} onChange={setEmail} placeholder="voce@email.com" onEnter={() => go('email')} /></F>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <span style={{ fontSize: 10.5, color: T.muted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>senha</span>
                <span style={{ fontSize: 11, color: T.blue, cursor: 'pointer' }}>esqueci a senha</span>
              </div>
              <I type="password" value={pass} onChange={setPass} onEnter={() => go('email')} />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <B full size="lg" onClick={() => go('email')} disabled={!!loading}>
              {loading === 'email' ? 'entrando…' : mode === 'entrar' ? 'Entrar →' : 'Criar conta →'}
            </B>
          </div>

          <div style={{ textAlign: 'center', fontSize: 13, color: T.muted, marginTop: 18 }}>
            {mode === 'entrar' ? 'Não tem conta? ' : 'Já tem conta? '}
            <span onClick={() => setMode(mode === 'entrar' ? 'criar' : 'entrar')} style={{ color: T.ink, fontWeight: 700, cursor: 'pointer', borderBottom: `1.5px solid ${T.ink}` }}>
              {mode === 'entrar' ? 'Criar conta grátis' : 'Entrar'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Casca do onboarding ────────────────────────────────────────────
function Shell({ step, total, eyebrow, title, sub, children, onNext, onBack, onSkip, nextLabel = 'continuar', nextTone, nextDisabled, hint }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', background: T.paper, color: T.ink,
      fontFamily: 'Montserrat, sans-serif', overflow: 'hidden',
      backgroundImage: 'radial-gradient(circle at 92% -8%, rgba(47,90,72,.07) 0%, transparent 42%), radial-gradient(circle at -8% 108%, rgba(58,106,138,.06) 0%, transparent 42%)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', borderBottom: `1px dashed ${T.ink2}2e`, flexShrink: 0 }}>
        <img src={LOGO3} alt="Poupê" style={{ height: 26, width: 'auto', objectFit: 'contain', display: 'block' }} />
        {step !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 10.5, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>passo {step + 1} de {total}</span>
            <div style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
              {Array.from({ length: total }, (_, i) => (
                <span key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 99, background: i <= step ? T.ink : '#00000020', transition: 'all .25s cubic-bezier(.2,.8,.3,1)' }} />
              ))}
            </div>
            {onSkip && <span onClick={onSkip} style={{ fontSize: 12, color: T.muted, cursor: 'pointer', marginLeft: 6 }}>pular →</span>}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '26px 48px' }}>
        {eyebrow && <div style={{ fontSize: 10.5, color: T.blue, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 9 }}>{eyebrow}</div>}
        {title && <div style={{ fontWeight: 800, letterSpacing: '-0.026em', fontSize: 34, lineHeight: 1.1, maxWidth: 620 }}>{title}</div>}
        {sub && <div style={{ fontSize: 14.5, color: T.ink2, marginTop: 11, lineHeight: 1.55, maxWidth: 560 }}>{sub}</div>}
        <div style={{ marginTop: 24 }}>{children}</div>
      </div>

      <div style={{ padding: '15px 28px', borderTop: `1px dashed ${T.ink2}2e`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
        {onBack ? <B variant="ghost" onClick={onBack}>← voltar</B> : <span />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {hint && <span style={{ fontSize: 11.5, color: T.muted }}>{hint}</span>}
          <B onClick={onNext} tone={nextTone} disabled={nextDisabled} size="md">{nextLabel} →</B>
        </div>
      </div>
    </div>
  );
}

// ── Passo 0: boas-vindas ───────────────────────────────────────────
function Welcome({ onNext }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.paper, fontFamily: 'Montserrat, sans-serif', overflow: 'auto' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20, padding: '40px 28px' }}>
        <img src={LOGO3} alt="Poupê" style={{ height: 74, width: 'auto', objectFit: 'contain', display: 'block' }} />
        <div style={{ fontSize: 11.5, color: T.blue, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>Boas-vindas</div>
        <div style={{ fontWeight: 800, letterSpacing: '-0.032em', fontSize: 48, lineHeight: 1.03, maxWidth: 700 }}>
          Vamos organizar suas <span style={{ color: T.green }}>finanças</span> juntos.
        </div>
        <div style={{ fontSize: 15.5, color: T.ink2, maxWidth: 520, lineHeight: 1.55 }}>
          Em 4 passos rápidos a gente personaliza o app para <b>como você gasta</b> — sem categorias genéricas, sem forma de pagamento que você não usa.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 10, maxWidth: 660, width: '100%' }}>
          {[['👥', 'Quem usa', 'Sozinho, casal ou família'], ['🏷️', 'Suas categorias', 'Edite e crie as suas'], ['💳', 'Seus pagamentos', 'PIX, cartões, boletos…']].map(([e, t, s]) => (
            <div key={t} style={{ padding: '15px 13px', border: `1.4px solid ${T.ink2}33`, borderRadius: 11, background: T.paper, textAlign: 'left' }}>
              <div style={{ fontSize: 21, marginBottom: 6 }}>{e}</div>
              <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '-0.005em' }}>{t}</div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3 }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <B size="lg" onClick={onNext}>Começar →</B>
          <span style={{ fontSize: 11.5, color: T.muted }}>leva uns 2 minutos · você pode mudar tudo depois</span>
        </div>
      </div>
    </div>
  );
}

// ── Passo 1: pessoas ───────────────────────────────────────────────
function People({ onNext, onBack, onSkip }) {
  const { state, actions } = S3.useStore();
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState(PALETTE[2]);
  const add = () => { if (!name.trim()) return; actions.addPerson(name.trim(), color); setName(''); setColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]); };

  return (
    <Shell step={0} total={4} eyebrow="01 · quem usa" title="Quem vai usar o Poupê?" onNext={onNext} onBack={onBack} onSkip={onSkip}
      sub="Pode ser só você, um casal ou a família toda. Cada pessoa vira um filtro nos lançamentos."
      nextLabel="continuar para categorias" hint={`${state.people.length} pessoa${state.people.length > 1 ? 's' : ''}`} nextDisabled={state.people.length === 0}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxWidth: 640 }}>
        {state.people.map((p, i) => (
          <div key={p.id} style={{ padding: 14, border: `1.6px solid ${T.ink}`, borderRadius: 12, background: T.paper, display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 50, height: 50, borderRadius: 99, background: p.color, color: T.paper, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 21, flexShrink: 0 }}>{p.name[0].toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15.5, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                {i === 0 && <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 99, background: T.ink, color: T.paper, flexShrink: 0 }}>você</span>}
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 7 }}>
                {PALETTE.slice(0, 8).map(c => (
                  <span key={c} onClick={() => actions.delPerson(p.id) || actions.addPerson(p.name, c)}
                    title="trocar cor" style={{ width: 13, height: 13, borderRadius: 99, background: c, cursor: 'pointer', border: p.color === c ? `2px solid ${T.ink}` : 'none', transition: 'transform .12s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                ))}
              </div>
            </div>
            {state.people.length > 1 && <IB onClick={() => actions.delPerson(p.id)} title="Remover" tone={T.red}>×</IB>}
          </div>
        ))}

        <div style={{ padding: 14, border: `1.6px dashed ${T.ink2}`, borderRadius: 12, gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 50, height: 50, borderRadius: 99, background: color, color: T.paper, display: 'grid', placeItems: 'center', fontSize: 21, fontWeight: 800, flexShrink: 0, opacity: name ? 1 : 0.35 }}>
            {name ? name[0].toUpperCase() : '+'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <I value={name} onChange={setName} placeholder="Nome de quem mais lança gastos…" onEnter={add} />
            <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
              {PALETTE.slice(0, 10).map(c => (
                <span key={c} onClick={() => setColor(c)} style={{ width: 15, height: 15, borderRadius: 99, background: c, cursor: 'pointer', border: color === c ? `2px solid ${T.ink}` : 'none', transition: 'transform .12s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.18)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              ))}
            </div>
          </div>
          <B onClick={add} disabled={!name.trim()} variant="outline">adicionar</B>
        </div>
      </div>

      <div style={{ marginTop: 18, padding: '12px 14px', background: `${T.blue}0e`, border: `1px dashed ${T.blue}55`, borderRadius: 9, display: 'flex', alignItems: 'center', gap: 10, maxWidth: 640 }}>
        <span style={{ fontSize: 17 }}>👫</span>
        <div style={{ fontSize: 12.5, color: T.ink2, lineHeight: 1.45 }}>
          <b>Mais de uma pessoa?</b> Cada um lança do seu jeito e os dois veem tudo — com filtro por pessoa em qualquer tela.
        </div>
      </div>
    </Shell>
  );
}

// ── Passo 2: categorias ────────────────────────────────────────────
function Categories({ onNext, onBack, onSkip }) {
  const { state, actions } = S3.useStore();
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState(PALETTE[0]);
  const [removed, setRemoved] = React.useState([]);

  const add = () => {
    if (!name.trim()) return;
    actions.addCategory(name.trim(), color);
    setName(''); setColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
  };
  const remove = c => { setRemoved(r => [...r, c]); actions.delCategory(c.id); };
  const restore = c => { setRemoved(r => r.filter(x => x.id !== c.id)); actions.addCategory(c.name, c.color); };

  return (
    <Shell step={1} total={4} eyebrow="02 · categorias" title="Como você organiza seus gastos?" onNext={onNext} onBack={onBack} onSkip={onSkip}
      sub="Sugerimos categorias comuns. Tire o que não usa, mantenha o que faz sentido e crie as suas."
      nextLabel="continuar para pagamentos" hint={`${state.categories.length} ativas`} nextDisabled={state.categories.length === 0}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 780 }}>
        <div>
          <div style={{ fontSize: 10.5, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 9 }}>suas categorias</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {state.categories.map(c => (
              <span key={c.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px 6px 7px',
                border: `1.4px solid ${c.color}`, borderRadius: 99, background: `${c.color}12`,
                fontSize: 12.5, fontWeight: 600,
              }}>
                <span style={{ width: 19, height: 19, borderRadius: 99, background: c.color, flexShrink: 0 }} />
                {c.name}
                <span onClick={() => remove(c)} style={{ marginLeft: 1, opacity: 0.5, cursor: 'pointer', fontSize: 14 }}>×</span>
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: 13, border: `1.5px dashed ${T.ink2}`, borderRadius: 11, background: T.paper }}>
          <div style={{ fontSize: 10.5, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>criar nova categoria</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: 24, height: 24, borderRadius: 99, background: color, flexShrink: 0 }} />
            <I value={name} onChange={setName} placeholder="Pets, Filhos, Casa…" onEnter={add} style={{ flex: 1, minWidth: 160 }} />
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {PALETTE.map(c => (
                <span key={c} onClick={() => setColor(c)} style={{ width: 16, height: 16, borderRadius: 99, background: c, cursor: 'pointer', border: color === c ? `2px solid ${T.ink}` : 'none', transition: 'transform .12s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              ))}
            </div>
            <B onClick={add} disabled={!name.trim()}>+ adicionar</B>
          </div>
        </div>

        {removed.length > 0 && (
          <div>
            <div style={{ fontSize: 10.5, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 9 }}>você ocultou</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {removed.map(c => (
                <span key={c.id} onClick={() => restore(c)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px 6px 7px',
                  border: `1.4px dashed ${T.ink2}55`, borderRadius: 99, fontSize: 12.5, color: T.muted, cursor: 'pointer', transition: 'all .15s',
                }}>
                  <span style={{ width: 19, height: 19, borderRadius: 99, background: `${c.color}55`, flexShrink: 0 }} />
                  {c.name}<span style={{ color: T.green, fontWeight: 800, fontSize: 13 }}>+</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '12px 14px', background: `${T.blue}0e`, border: `1px dashed ${T.blue}55`, borderRadius: 9, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ padding: '2px 7px', background: T.blue, color: T.paper, borderRadius: 99, fontSize: 8.5, fontWeight: 800, letterSpacing: '0.08em', flexShrink: 0, marginTop: 1 }}>IA</span>
          <div style={{ fontSize: 12.5, color: T.ink2, lineHeight: 1.45 }}>
            <b>Dica:</b> casais costumam adicionar "Pets", "Filhos" e "Casa". Categorias que se repetem todo mês podem virar <b>gastos fixos</b> depois.
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ── Passo 3: formas de pagamento ───────────────────────────────────
function PaymentTypes({ onNext, onBack, onSkip }) {
  const { state, actions } = S3.useStore();
  const [cardName, setCardName] = React.useState('');
  const [cardColor, setCardColor] = React.useState('#8a3ffc');
  const [closing, setClosing] = React.useState('15');
  const [due, setDue] = React.useState('22');

  const base = state.paymentTypes.filter(t => t.kind === 'base');
  const cards = state.paymentTypes.filter(t => t.kind === 'card');
  const missingBase = ['Dinheiro', 'PIX', 'Boleto', 'Débito'].filter(n => !base.some(b => b.name === n));
  const presetsLeft = BANK_PRESETS.filter(p => !cards.some(c => c.name === p.name));

  const addCard = (name, color) => {
    const n = (name || cardName).trim(); if (!n) return;
    actions.addPaymentType({ name: n, kind: 'card', color: color || cardColor, closing: Number(closing) || 15, due: Number(due) || 22 });
    setCardName('');
  };

  return (
    <Shell step={2} total={4} eyebrow="03 · pagamentos" title="Como você costuma pagar?" onNext={onNext} onBack={onBack} onSkip={onSkip}
      sub="Marque tudo que usa. Para cartão, adicione cada banco — eles aparecem no menu de lançamento."
      nextLabel="finalizar" hint={`${base.length} formas · ${cards.length} cartões`} nextDisabled={state.paymentTypes.length === 0}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 800 }}>
        <div>
          <div style={{ fontSize: 10.5, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 9 }}>formas de pagamento</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {base.map(t => (
              <span key={t.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 13px 9px 10px',
                border: `1.5px solid ${t.color}`, borderRadius: 10, background: `${t.color}12`, fontSize: 13.5, fontWeight: 600,
              }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: t.color, color: T.paper, display: 'grid', placeItems: 'center', fontSize: 12 }}>
                  {t.name === 'Dinheiro' ? '💵' : t.name === 'PIX' ? '⚡' : t.name === 'Boleto' ? '🧾' : '🏧'}
                </span>
                {t.name}
                <span onClick={() => actions.delPaymentType(t.id)} style={{ opacity: 0.5, cursor: 'pointer', fontSize: 14, marginLeft: 1 }}>×</span>
              </span>
            ))}
            {missingBase.map(n => (
              <span key={n} onClick={() => actions.addPaymentType({ name: n, kind: 'base', color: T.ink2 })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 13px', border: `1.4px dashed ${T.ink2}66`, borderRadius: 10, fontSize: 13, color: T.muted, cursor: 'pointer' }}>
                {n}<span style={{ color: T.green, fontWeight: 800 }}>+</span>
              </span>
            ))}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 13px 9px 10px',
              border: `1.5px solid ${T.ink}`, borderRadius: 10, background: T.ink, color: T.paper, fontSize: 13.5, fontWeight: 700,
              boxShadow: '0 2px 0 rgba(0,0,0,.15)',
            }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, background: T.paper, color: T.ink, display: 'grid', placeItems: 'center', fontSize: 12 }}>💳</span>
              Cartão <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>{cards.length} ativos ▾</span>
            </span>
          </div>
        </div>

        <div style={{ padding: 15, border: `1.5px solid ${T.ink}`, borderRadius: 12, background: T.paper2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 11, gap: 10, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10.5, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>seus cartões</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>cada cartão vira uma opção no menu de pagamento</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
            {cards.map(c => (
              <div key={c.id} style={{ position: 'relative', padding: '13px 13px 11px', borderRadius: 10, background: c.color, color: T.paper, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -22, right: -22, width: 86, height: 86, borderRadius: 99, background: 'rgba(255,255,255,.09)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 9, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase' }}>cartão</div>
                    <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.015em', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  </div>
                  <span onClick={() => actions.delPaymentType(c.id)} style={{ fontSize: 15, opacity: 0.7, cursor: 'pointer', flexShrink: 0 }}>×</span>
                </div>
                <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 10.5, opacity: 0.85, position: 'relative' }}>
                  <span>fecha dia <b>{c.closing}</b></span><span>vence dia <b>{c.due}</b></span>
                </div>
              </div>
            ))}

            <div style={{ padding: 12, border: `1.5px dashed ${T.ink2}`, borderRadius: 10, background: T.paper, display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                <span style={{ width: 18, height: 18, borderRadius: 5, background: cardColor, flexShrink: 0 }} />
                <I value={cardName} onChange={setCardName} placeholder="Nome do banco…" onEnter={() => addCard()} style={{ padding: '7px 9px', fontSize: 12.5 }} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <I type="number" value={closing} onChange={setClosing} style={{ padding: '6px 8px', fontSize: 11.5 }} />
                <I type="number" value={due} onChange={setDue} style={{ padding: '6px 8px', fontSize: 11.5 }} />
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {['#8a3ffc', '#1a1a1a', '#fbc630', '#0066b3', '#ec7000', '#ff7a00', '#cc092f'].map(c => (
                  <span key={c} onClick={() => setCardColor(c)} style={{ width: 14, height: 14, borderRadius: 4, background: c, cursor: 'pointer', border: cardColor === c ? `2px solid ${T.ink}` : 'none' }} />
                ))}
              </div>
              <B size="sm" full onClick={() => addCard()} disabled={!cardName.trim()}>+ adicionar cartão</B>
            </div>
          </div>

          {presetsLeft.length > 0 && (
            <div style={{ marginTop: 13 }}>
              <div style={{ fontSize: 10.5, color: T.muted, marginBottom: 6 }}>sugestões — clique para adicionar</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {presetsLeft.map(p => (
                  <span key={p.name} onClick={() => addCard(p.name, p.color)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', border: `1.3px dashed ${T.ink2}55`, borderRadius: 99, fontSize: 11.5, color: T.ink2, cursor: 'pointer', transition: 'all .15s' }}>
                    <span style={{ width: 11, height: 11, borderRadius: 3, background: p.color }} />{p.name}
                    <span style={{ color: T.green, fontWeight: 800, fontSize: 12 }}>+</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

// ── Passo 4: pronto ────────────────────────────────────────────────
function Done({ onNext, onBack }) {
  const { state } = S3.useStore();
  const cards = state.paymentTypes.filter(t => t.kind === 'card');
  const base = state.paymentTypes.filter(t => t.kind === 'base');

  return (
    <Shell step={3} total={4} onNext={onNext} onBack={onBack} nextLabel="Ir para o app" nextTone={T.green}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <div style={{ width: 78, height: 78, borderRadius: 99, background: T.green, color: T.paper, display: 'grid', placeItems: 'center', fontSize: 38, fontWeight: 800, boxShadow: '0 6px 0 rgba(47,90,72,.25)' }}>✓</div>
        <div style={{ fontWeight: 800, letterSpacing: '-0.026em', fontSize: 38, lineHeight: 1.08 }}>
          Tudo pronto, <span style={{ color: T.green }}>{state.people[0] ? state.people[0].name : 'você'}</span>!
        </div>
        <div style={{ fontSize: 14.5, color: T.ink2, maxWidth: 500, lineHeight: 1.55 }}>
          Seu Poupê está personalizado e já vem com alguns lançamentos de exemplo para você explorar. Bora lançar o primeiro gasto de verdade?
        </div>

        <div style={{ marginTop: 6, padding: 17, border: `1.5px solid ${T.ink}`, borderRadius: 12, background: T.paper, maxWidth: 560, width: '100%', textAlign: 'left' }}>
          <div style={{ fontSize: 10.5, color: T.muted, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 11 }}>o que você configurou</div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '11px 14px', fontSize: 12.5, alignItems: 'start' }}>
            <div style={{ color: T.muted }}>pessoas</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {state.people.map(p => (
                <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px 2px 3px', border: `1px solid ${T.ink2}55`, borderRadius: 99, fontSize: 11.5 }}>
                  <span style={{ width: 17, height: 17, borderRadius: 99, background: p.color, color: T.paper, display: 'grid', placeItems: 'center', fontSize: 9.5, fontWeight: 700 }}>{p.name[0].toUpperCase()}</span>{p.name}
                </span>
              ))}
            </div>
            <div style={{ color: T.muted }}>categorias</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {state.categories.slice(0, 9).map(c => (
                <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, padding: '2px 8px', border: `1px solid ${c.color}55`, borderRadius: 99, background: `${c.color}10` }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: c.color }} />{c.name}
                </span>
              ))}
              {state.categories.length > 9 && <span style={{ fontSize: 10.5, padding: '2px 6px', color: T.muted }}>+{state.categories.length - 9}</span>}
            </div>
            <div style={{ color: T.muted }}>pagamentos</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {base.map(t => <span key={t.id} style={{ fontSize: 10.5, padding: '2px 8px', border: `1px solid ${T.ink2}33`, borderRadius: 99 }}>{t.name}</span>)}
              {cards.map(c => <span key={c.id} style={{ fontSize: 10.5, padding: '2px 8px', border: `1px solid ${c.color}55`, borderRadius: 99, background: `${c.color}12` }}>💳 {c.name}</span>)}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

window.PoupeOnb = { Login, Welcome, People, Categories, PaymentTypes, Done };
