import React from 'react';
import logo from '../assets/poupe-logo.png';
import { useStore } from '../lib/store';
import { Button, IconBtn, Field, Input, useIsMobile, tokens } from '../components/ui';

const { ink, ink2, muted, paper, paper2, green, blue } = tokens;

const PALETTE = ['#b04a3a', '#7a8a3a', '#3a6a8a', '#2f5a48', '#c79bb0', '#7a6ca8', '#d4a24a', '#5a8a9a', '#c97a3a', '#8a9a5a', '#a86a6a', '#c44a4a', '#d4b48a', '#5a5a8a', '#a85a8a', '#8a6a4a'];
const BANK_PRESETS = [
  { name: 'Nubank', color: '#8a3ffc' }, { name: 'C6 Bank', color: '#1a1a1a' },
  { name: 'Banco do Brasil', color: '#fbc630' }, { name: 'Caixa', color: '#0066b3' },
  { name: 'Itaú', color: '#ec7000' }, { name: 'Inter', color: '#ff7a00' },
  { name: 'Bradesco', color: '#cc092f' }, { name: 'Santander', color: '#ec0000' },
];

// ── Login ──────────────────────────────────────────────────────────
export function Login() {
  const { actions } = useStore();
  const isMobile = useIsMobile();
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [mode, setMode] = React.useState<'entrar' | 'criar'>('entrar');
  const [loading, setLoading] = React.useState(false);

  const go = async () => {
    if (!email.trim() || !pass) return;
    setLoading(true);
    if (mode === 'entrar') await actions.signIn(email.trim(), pass);
    else await actions.signUp(email.trim(), pass);
    setLoading(false);
  };

  return (
    <div style={{ height: '100%', display: isMobile ? 'block' : 'grid', gridTemplateColumns: isMobile ? undefined : '1fr 1fr', fontFamily: 'Montserrat, sans-serif', overflow: 'auto' }}>
      {!isMobile && (
        <div style={{
          background: ink, color: paper, padding: 44, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', overflow: 'auto', minHeight: 0,
          backgroundImage: 'radial-gradient(circle at 85% 12%, rgba(47,90,72,.38) 0%, transparent 46%), radial-gradient(circle at 8% 92%, rgba(58,106,138,.28) 0%, transparent 46%)',
        }}>
          <div>
            <img src={logo} alt="Poupê" style={{ height: 50, width: 'auto', objectFit: 'contain', display: 'block', filter: 'invert(1) brightness(2)', marginBottom: 26 }} />
            <div style={{ fontWeight: 800, fontSize: 33, letterSpacing: '-0.028em', lineHeight: 1.15, maxWidth: 400 }}>
              Suas finanças, organizadas em um só lugar.
            </div>
            <div style={{ fontSize: 14, opacity: 0.75, marginTop: 14, maxWidth: 370, lineHeight: 1.55 }}>
              Lance gastos e ganhos em segundos, acompanhe despesas, metas e investimentos - sozinho, a dois ou em família.
            </div>
            <div style={{ display: 'flex', gap: 18, fontSize: 11.5, opacity: 0.55, marginTop: 40 }}>
              <span>© 2026 Poupê</span><span>Privacidade</span><span>Termos</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: paper, display: 'flex', alignItems: isMobile ? 'center' : 'flex-start', justifyContent: 'center', padding: isMobile ? '32px 20px' : '44px 44px', minHeight: isMobile ? '100%' : 0 }}>
        <div style={{ width: '100%', maxWidth: 372, marginTop: 'auto', marginBottom: 'auto' }}>
          {isMobile && <img src={logo} alt="Poupê" style={{ height: 34, width: 'auto', objectFit: 'contain', display: 'block', marginBottom: 22 }} />}
          <div style={{ fontWeight: 800, fontSize: 25, letterSpacing: '-0.022em' }}>{mode === 'entrar' ? 'Bem-vindo de volta' : 'Criar sua conta'}</div>
          <div style={{ fontSize: 13, color: muted, marginTop: 6 }}>
            {mode === 'entrar' ? 'Entre para continuar organizando suas finanças' : 'Comece grátis — leva menos de um minuto'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 }}>
            <Field label="e-mail"><Input type="email" value={email} onChange={setEmail} placeholder="voce@email.com" onEnter={go} /></Field>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <span style={{ fontSize: 10.5, color: muted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>senha</span>
              </div>
              <Input type="password" value={pass} onChange={setPass} onEnter={go} />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <Button full size="lg" onClick={go} disabled={loading || !email.trim() || !pass}>
              {loading ? 'entrando…' : mode === 'entrar' ? 'Entrar →' : 'Criar conta →'}
            </Button>
          </div>

          <div style={{ textAlign: 'center', fontSize: 13, color: muted, marginTop: 18 }}>
            {mode === 'entrar' ? 'Não tem conta? ' : 'Já tem conta? '}
            <span onClick={() => setMode(mode === 'entrar' ? 'criar' : 'entrar')} style={{ color: ink, fontWeight: 700, cursor: 'pointer', borderBottom: `1.5px solid ${ink}` }}>
              {mode === 'entrar' ? 'Criar conta grátis' : 'Entrar'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Casca do onboarding ────────────────────────────────────────────
interface ShellProps {
  step: number | null;
  total?: number;
  eyebrow?: string;
  title?: string;
  sub?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextTone?: string;
  nextDisabled?: boolean;
  hint?: string;
}

function Shell({ step, total = 5, eyebrow, title, sub, children, onNext, onBack, onSkip, nextLabel = 'continuar', nextTone, nextDisabled, hint }: ShellProps) {
  const isMobile = useIsMobile();
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', background: paper, color: ink,
      fontFamily: 'Montserrat, sans-serif', overflow: 'hidden',
      backgroundImage: 'radial-gradient(circle at 92% -8%, rgba(47,90,72,.07) 0%, transparent 42%), radial-gradient(circle at -8% 108%, rgba(58,106,138,.06) 0%, transparent 42%)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '14px 16px' : '16px 28px', borderBottom: `1px dashed ${ink2}2e`, flexShrink: 0 }}>
        <img src={logo} alt="Poupê" style={{ height: 26, width: 'auto', objectFit: 'contain', display: 'block' }} />
        {step !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!isMobile && <span style={{ fontSize: 10.5, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>passo {step + 1} de {total}</span>}
            <div style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
              {Array.from({ length: total }, (_, i) => (
                <span key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 99, background: i <= step ? ink : '#00000020', transition: 'all .25s cubic-bezier(.2,.8,.3,1)' }} />
              ))}
            </div>
            {onSkip && <span onClick={onSkip} style={{ fontSize: 12, color: muted, cursor: 'pointer', marginLeft: 6 }}>pular →</span>}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: isMobile ? '20px 16px' : '26px 48px' }}>
        {eyebrow && <div style={{ fontSize: 10.5, color: blue, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 9 }}>{eyebrow}</div>}
        {title && <div style={{ fontWeight: 800, letterSpacing: '-0.026em', fontSize: isMobile ? 24 : 34, lineHeight: 1.1, maxWidth: 620 }}>{title}</div>}
        {sub && <div style={{ fontSize: 14.5, color: ink2, marginTop: 11, lineHeight: 1.55, maxWidth: 560 }}>{sub}</div>}
        <div style={{ marginTop: 24 }}>{children}</div>
      </div>

      <div style={{ padding: isMobile ? '12px 16px' : '15px 28px', borderTop: `1px dashed ${ink2}2e`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
        {onBack ? <Button variant="ghost" onClick={onBack}>← voltar</Button> : <span />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {hint && <span style={{ fontSize: 11.5, color: muted }}>{hint}</span>}
          <Button onClick={onNext} tone={nextTone} disabled={nextDisabled} size="md">{nextLabel} →</Button>
        </div>
      </div>
    </div>
  );
}

export interface OnbStepProps {
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
}

// ── Conta (casal): criar do zero ou entrar com código de convite ────
function AccountFrame({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: paper, fontFamily: 'Montserrat, sans-serif', overflow: 'auto' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20, padding: isMobile ? '32px 18px' : '40px 28px' }}>
        <img src={logo} alt="Poupê" style={{ height: isMobile ? 52 : 74, width: 'auto', objectFit: 'contain', display: 'block' }} />
        {children}
      </div>
    </div>
  );
}

export function AccountChoice({ onCreate, onJoin }: { onCreate: () => void; onJoin: () => void }) {
  return (
    <AccountFrame>
      <div style={{ fontSize: 11.5, color: blue, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>Boas-vindas</div>
      <div style={{ fontWeight: 800, letterSpacing: '-0.032em', fontSize: 'clamp(28px, 7vw, 48px)', lineHeight: 1.1, maxWidth: 700 }}>
        Vamos organizar suas <span style={{ color: green }}>finanças</span> juntos.
      </div>
      <div style={{ fontSize: 15.5, color: ink2, maxWidth: 520, lineHeight: 1.55 }}>
        O Poupê é feito pra duas pessoas dividirem a mesma vida financeira. Comece uma conta nova, ou entre com o código que a outra pessoa te mandou.
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div onClick={onCreate} style={{ cursor: 'pointer', width: '100%', maxWidth: 260, padding: '20px 18px', border: `1.6px solid ${ink}`, borderRadius: 13, background: paper, textAlign: 'left' }}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>🏡</div>
          <div style={{ fontWeight: 800, fontSize: 15.5 }}>Criar uma conta nova</div>
          <div style={{ fontSize: 12, color: muted, marginTop: 5, lineHeight: 1.45 }}>Você é o primeiro a entrar. Depois convida a outra pessoa com um código.</div>
        </div>
        <div onClick={onJoin} style={{ cursor: 'pointer', width: '100%', maxWidth: 260, padding: '20px 18px', border: `1.6px dashed ${ink2}`, borderRadius: 13, background: paper, textAlign: 'left' }}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>🔑</div>
          <div style={{ fontWeight: 800, fontSize: 15.5 }}>Entrar com um código</div>
          <div style={{ fontSize: 12, color: muted, marginTop: 5, lineHeight: 1.45 }}>Alguém já criou a conta e te passou um código de convite.</div>
        </div>
      </div>
    </AccountFrame>
  );
}

export function CreateAccountScreen({ onBack, onCreated }: { onBack: () => void; onCreated: () => void }) {
  const { state, actions, toast } = useStore();
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [code, setCode] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const id = await actions.createAccount(name.trim());
    setLoading(false);
    if (id) setCode(state.account?.inviteCode ?? null);
  };

  const copyInvite = async () => {
    const message = `Vem organizar as finanças comigo no Poupê! Acesse ${window.location.origin}, crie sua conta e entre com o código de convite: ${code}`;
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    catch { toast('Não deu pra copiar automaticamente — selecione o código manualmente', 'warn'); }
  };

  if (code) {
    return (
      <AccountFrame>
        <div style={{ fontSize: 11.5, color: green, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>Conta criada</div>
        <div style={{ fontWeight: 800, letterSpacing: '-0.028em', fontSize: 32, lineHeight: 1.1, maxWidth: 560 }}>Anote esse código pra convidar quem falta.</div>
        <div style={{ fontSize: 14, color: ink2, maxWidth: 460, lineHeight: 1.5 }}>Compartilhe com a outra pessoa — ela usa esse código na tela de login, em "entrar com um código".</div>
        <div style={{
          marginTop: 4, padding: '16px 28px', border: `1.6px solid ${ink}`, borderRadius: 12, background: paper2,
          fontSize: 30, fontWeight: 800, letterSpacing: '0.12em', fontFamily: 'monospace',
        }}>{code}</div>
        <Button variant="outline" onClick={copyInvite}>{copied ? 'copiado ✓' : 'copiar convite'}</Button>
        <Button size="lg" onClick={onCreated}>Continuar →</Button>
      </AccountFrame>
    );
  }

  return (
    <AccountFrame>
      <div style={{ fontSize: 11.5, color: blue, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>Nova conta</div>
      <div style={{ fontWeight: 800, letterSpacing: '-0.028em', fontSize: 32, lineHeight: 1.1, maxWidth: 560 }}>Como vamos chamar essa conta?</div>
      <div style={{ fontSize: 14, color: ink2, maxWidth: 440, lineHeight: 1.5 }}>Ex: "Davi & Eduarda" — só pra você reconhecer depois, se tiver mais de uma.</div>
      <div style={{ width: '100%', maxWidth: 340 }}>
        <Input value={name} onChange={setName} placeholder="Nome da conta" onEnter={create} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="ghost" onClick={onBack}>← voltar</Button>
        <Button onClick={create} disabled={loading || !name.trim()}>{loading ? 'criando…' : 'Criar conta →'}</Button>
      </div>
    </AccountFrame>
  );
}

export function JoinAccountScreen({ onBack, onJoined }: { onBack: () => void; onJoined: () => void }) {
  const { actions } = useStore();
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const join = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const id = await actions.joinAccount(code);
    setLoading(false);
    if (id) onJoined();
  };

  return (
    <AccountFrame>
      <div style={{ fontSize: 11.5, color: blue, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>Entrar com convite</div>
      <div style={{ fontWeight: 800, letterSpacing: '-0.028em', fontSize: 32, lineHeight: 1.1, maxWidth: 560 }}>Cole o código que você recebeu.</div>
      <div style={{ width: '100%', maxWidth: 300 }}>
        <Input value={code} onChange={v => setCode(v.toUpperCase())} placeholder="ex: A1B2C3D4" onEnter={join} style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 16, letterSpacing: '0.08em' }} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="ghost" onClick={onBack}>← voltar</Button>
        <Button onClick={join} disabled={loading || !code.trim()}>{loading ? 'entrando…' : 'Entrar →'}</Button>
      </div>
    </AccountFrame>
  );
}

// ── Campos: pessoas (reutilizado no onboarding e nas Configurações) ─
export function PeopleFields() {
  const { state, actions } = useStore();
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState(PALETTE[2]);
  const add = () => { if (!name.trim()) return; actions.addPerson(name.trim(), color); setName(''); setColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]); };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, maxWidth: 640 }}>
        {state.people.map((p, i) => (
          <div key={p.id} style={{ padding: 14, border: `1.6px solid ${ink}`, borderRadius: 12, background: paper, display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 50, height: 50, borderRadius: 99, background: p.color, color: paper, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 21, flexShrink: 0 }}>{p.name[0].toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15.5, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                {i === 0 && <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 99, background: ink, color: paper, flexShrink: 0 }}>você</span>}
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 7 }}>
                {PALETTE.slice(0, 8).map(c => (
                  <span key={c} onClick={() => { actions.delPerson(p.id); actions.addPerson(p.name, c); }}
                    title="trocar cor" style={{ width: 13, height: 13, borderRadius: 99, background: c, cursor: 'pointer', border: p.color === c ? `2px solid ${ink}` : 'none', transition: 'transform .12s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }} />
                ))}
              </div>
            </div>
            {state.people.length > 1 && <IconBtn onClick={() => actions.delPerson(p.id)} title="Remover" tone={tokens.red}>×</IconBtn>}
          </div>
        ))}

        <div style={{ padding: 14, border: `1.6px dashed ${ink2}`, borderRadius: 12, gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 50, height: 50, borderRadius: 99, background: color, color: paper, display: 'grid', placeItems: 'center', fontSize: 21, fontWeight: 800, flexShrink: 0, opacity: name ? 1 : 0.35 }}>
            {name ? name[0].toUpperCase() : '+'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Input value={name} onChange={setName} placeholder="Nome de quem mais lança gastos…" onEnter={add} />
            <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
              {PALETTE.slice(0, 10).map(c => (
                <span key={c} onClick={() => setColor(c)} style={{ width: 15, height: 15, borderRadius: 99, background: c, cursor: 'pointer', border: color === c ? `2px solid ${ink}` : 'none', transition: 'transform .12s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.18)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }} />
              ))}
            </div>
          </div>
          <Button onClick={add} disabled={!name.trim()} variant="outline">adicionar</Button>
        </div>
      </div>

      <div style={{ marginTop: 18, padding: '12px 14px', background: `${blue}0e`, border: `1px dashed ${blue}55`, borderRadius: 9, display: 'flex', alignItems: 'center', gap: 10, maxWidth: 640 }}>
        <span style={{ fontSize: 17 }}>👫</span>
        <div style={{ fontSize: 12.5, color: ink2, lineHeight: 1.45 }}>
          <b>Mais de uma pessoa?</b> Cada um lança do seu jeito e os dois veem tudo — com filtro por pessoa em qualquer tela.
        </div>
      </div>
    </>
  );
}

// ── Passo 1: pessoas (onboarding) ───────────────────────────────────
export function People({ onNext, onBack, onSkip }: OnbStepProps) {
  const { state } = useStore();
  return (
    <Shell step={0} total={4} eyebrow="01 · quem usa" title="Quem vai usar o Poupê?" onNext={onNext} onBack={onBack} onSkip={onSkip}
      sub="Pode ser só você, um casal ou a família toda. Cada pessoa vira um filtro nos lançamentos."
      nextLabel="continuar para categorias" hint={`${state.people.length} pessoa${state.people.length > 1 ? 's' : ''}`} nextDisabled={state.people.length === 0}>
      <PeopleFields />
    </Shell>
  );
}

// ── Campos: categorias (reutilizado no onboarding e nas Configurações) ─
export function CategoriesFields() {
  const { state, actions } = useStore();
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState(PALETTE[0]);
  const [removed, setRemoved] = React.useState<{ id: string; name: string; color: string }[]>([]);

  const add = () => {
    if (!name.trim()) return;
    actions.addCategory(name.trim(), color);
    setName(''); setColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
  };
  const remove = (c: { id: string; name: string; color: string }) => { setRemoved(r => [...r, c]); actions.delCategory(c.id); };
  const restore = (c: { id: string; name: string; color: string }) => { setRemoved(r => r.filter(x => x.id !== c.id)); actions.addCategory(c.name, c.color); };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 780 }}>
        <div>
          <div style={{ fontSize: 10.5, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 9 }}>suas categorias</div>
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

        <div style={{ padding: 13, border: `1.5px dashed ${ink2}`, borderRadius: 11, background: paper }}>
          <div style={{ fontSize: 10.5, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>criar nova categoria</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: 24, height: 24, borderRadius: 99, background: color, flexShrink: 0 }} />
            <Input value={name} onChange={setName} placeholder="Pets, Filhos, Casa…" onEnter={add} style={{ flex: 1, minWidth: 160 }} />
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {PALETTE.map(c => (
                <span key={c} onClick={() => setColor(c)} style={{ width: 16, height: 16, borderRadius: 99, background: c, cursor: 'pointer', border: color === c ? `2px solid ${ink}` : 'none', transition: 'transform .12s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }} />
              ))}
            </div>
            <Button onClick={add} disabled={!name.trim()}>+ adicionar</Button>
          </div>
        </div>

        {removed.length > 0 && (
          <div>
            <div style={{ fontSize: 10.5, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 9 }}>você ocultou</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {removed.map(c => (
                <span key={c.id} onClick={() => restore(c)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px 6px 7px',
                  border: `1.4px dashed ${ink2}55`, borderRadius: 99, fontSize: 12.5, color: muted, cursor: 'pointer', transition: 'all .15s',
                }}>
                  <span style={{ width: 19, height: 19, borderRadius: 99, background: `${c.color}55`, flexShrink: 0 }} />
                  {c.name}<span style={{ color: green, fontWeight: 800, fontSize: 13 }}>+</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '12px 14px', background: `${blue}0e`, border: `1px dashed ${blue}55`, borderRadius: 9, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ padding: '2px 7px', background: blue, color: paper, borderRadius: 99, fontSize: 8.5, fontWeight: 800, letterSpacing: '0.08em', flexShrink: 0, marginTop: 1 }}>IA</span>
          <div style={{ fontSize: 12.5, color: ink2, lineHeight: 1.45 }}>
            <b>Dica:</b> casais costumam adicionar "Pets", "Filhos" e "Casa". Categorias que se repetem todo mês podem virar <b>gastos fixos</b> depois.
          </div>
        </div>
      </div>
    </>
  );
}

// ── Passo 2: categorias (onboarding) ────────────────────────────────
export function Categories({ onNext, onBack, onSkip }: OnbStepProps) {
  const { state } = useStore();
  return (
    <Shell step={1} total={4} eyebrow="02 · categorias" title="Como você organiza seus gastos?" onNext={onNext} onBack={onBack} onSkip={onSkip}
      sub="Sugerimos categorias comuns. Tire o que não usa, mantenha o que faz sentido e crie as suas."
      nextLabel="continuar para pagamentos" hint={`${state.categories.length} ativas`} nextDisabled={state.categories.length === 0}>
      <CategoriesFields />
    </Shell>
  );
}

// ── Campos: formas de pagamento (reutilizado no onboarding e nas Configurações) ─
export function PaymentTypesFields() {
  const { state, actions } = useStore();
  const [cardName, setCardName] = React.useState('');
  const [cardColor, setCardColor] = React.useState('#8a3ffc');
  const [closing, setClosing] = React.useState('15');
  const [due, setDue] = React.useState('22');

  const base = state.paymentTypes.filter(t => t.kind === 'base');
  const cards = state.paymentTypes.filter(t => t.kind === 'card');
  const missingBase = ['Dinheiro', 'PIX', 'Boleto', 'Débito'].filter(n => !base.some(b => b.name === n));
  const presetsLeft = BANK_PRESETS.filter(p => !cards.some(c => c.name === p.name));

  const addCard = (name?: string, color?: string) => {
    const n = (name || cardName).trim(); if (!n) return;
    actions.addPaymentType({ name: n, kind: 'card', color: color || cardColor, closing: Number(closing) || 15, due: Number(due) || 22 });
    setCardName('');
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 800 }}>
        <div>
          <div style={{ fontSize: 10.5, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 9 }}>formas de pagamento</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {base.map(t => (
              <span key={t.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 13px 9px 10px',
                border: `1.5px solid ${t.color}`, borderRadius: 10, background: `${t.color}12`, fontSize: 13.5, fontWeight: 600,
              }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: t.color, color: paper, display: 'grid', placeItems: 'center', fontSize: 12 }}>
                  {t.name === 'Dinheiro' ? '💵' : t.name === 'PIX' ? '⚡' : t.name === 'Boleto' ? '🧾' : '🏧'}
                </span>
                {t.name}
                <span onClick={() => actions.delPaymentType(t.id)} style={{ opacity: 0.5, cursor: 'pointer', fontSize: 14, marginLeft: 1 }}>×</span>
              </span>
            ))}
            {missingBase.map(n => (
              <span key={n} onClick={() => actions.addPaymentType({ name: n, kind: 'base', color: ink2 })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 13px', border: `1.4px dashed ${ink2}66`, borderRadius: 10, fontSize: 13, color: muted, cursor: 'pointer' }}>
                {n}<span style={{ color: green, fontWeight: 800 }}>+</span>
              </span>
            ))}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 13px 9px 10px',
              border: `1.5px solid ${ink}`, borderRadius: 10, background: ink, color: paper, fontSize: 13.5, fontWeight: 700,
              boxShadow: '0 2px 0 rgba(0,0,0,.15)',
            }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, background: paper, color: ink, display: 'grid', placeItems: 'center', fontSize: 12 }}>💳</span>
              Cartão <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>{cards.length} ativos ▾</span>
            </span>
          </div>
        </div>

        <div style={{ padding: 15, border: `1.5px solid ${ink}`, borderRadius: 12, background: paper2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 11, gap: 10, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10.5, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>seus cartões</div>
              <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>cada cartão vira uma opção no menu de pagamento</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
            {cards.map(c => (
              <div key={c.id} style={{ position: 'relative', padding: '13px 13px 11px', borderRadius: 10, background: c.color, color: paper, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -22, right: -22, width: 86, height: 86, borderRadius: 99, background: 'rgba(255,255,255,.09)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 9, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase' }}>cartão</div>
                    <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.015em', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  </div>
                  <span onClick={() => actions.delPaymentType(c.id)} style={{ fontSize: 15, opacity: 0.7, cursor: 'pointer', flexShrink: 0 }}>×</span>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 12, fontSize: 10.5, opacity: 0.92, position: 'relative', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    fecha dia
                    <input type="number" min={1} max={31} value={c.closing ?? ''}
                      onChange={e => actions.updatePaymentType(c.id, { closing: Number(e.target.value) || undefined })}
                      style={{ width: 34, padding: '2px 4px', borderRadius: 5, border: 'none', background: 'rgba(255,255,255,.85)', color: ink, fontWeight: 700, fontSize: 10.5 }} />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    vence dia
                    <input type="number" min={1} max={31} value={c.due ?? ''}
                      onChange={e => actions.updatePaymentType(c.id, { due: Number(e.target.value) || undefined })}
                      style={{ width: 34, padding: '2px 4px', borderRadius: 5, border: 'none', background: 'rgba(255,255,255,.85)', color: ink, fontWeight: 700, fontSize: 10.5 }} />
                  </label>
                </div>
              </div>
            ))}

            <div style={{ padding: 12, border: `1.5px dashed ${ink2}`, borderRadius: 10, background: paper, display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                <span style={{ width: 18, height: 18, borderRadius: 5, background: cardColor, flexShrink: 0 }} />
                <Input value={cardName} onChange={setCardName} placeholder="Nome do banco…" onEnter={() => addCard()} style={{ padding: '7px 9px', fontSize: 12.5 }} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Input type="number" value={closing} onChange={setClosing} style={{ padding: '6px 8px', fontSize: 11.5 }} />
                <Input type="number" value={due} onChange={setDue} style={{ padding: '6px 8px', fontSize: 11.5 }} />
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {['#8a3ffc', '#1a1a1a', '#fbc630', '#0066b3', '#ec7000', '#ff7a00', '#cc092f'].map(c => (
                  <span key={c} onClick={() => setCardColor(c)} style={{ width: 14, height: 14, borderRadius: 4, background: c, cursor: 'pointer', border: cardColor === c ? `2px solid ${ink}` : 'none' }} />
                ))}
              </div>
              <Button size="sm" full onClick={() => addCard()} disabled={!cardName.trim()}>+ adicionar cartão</Button>
            </div>
          </div>

          {presetsLeft.length > 0 && (
            <div style={{ marginTop: 13 }}>
              <div style={{ fontSize: 10.5, color: muted, marginBottom: 6 }}>sugestões — clique pra preencher o nome e a cor, depois ajuste as datas e confirme abaixo</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {presetsLeft.map(p => (
                  <span key={p.name} onClick={() => { setCardName(p.name); setCardColor(p.color); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', border: `1.3px dashed ${ink2}55`, borderRadius: 99, fontSize: 11.5, color: ink2, cursor: 'pointer', transition: 'all .15s' }}>
                    <span style={{ width: 11, height: 11, borderRadius: 3, background: p.color }} />{p.name}
                    <span style={{ color: green, fontWeight: 800, fontSize: 12 }}>+</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Passo 3: formas de pagamento (onboarding) ───────────────────────
export function PaymentTypes({ onNext, onBack, onSkip }: OnbStepProps) {
  const { state } = useStore();
  const base = state.paymentTypes.filter(t => t.kind === 'base');
  const cards = state.paymentTypes.filter(t => t.kind === 'card');
  return (
    <Shell step={2} total={4} eyebrow="03 · pagamentos" title="Como você costuma pagar?" onNext={onNext} onBack={onBack} onSkip={onSkip}
      sub="Marque tudo que usa. Para cartão, adicione cada banco — eles aparecem no menu de lançamento."
      nextLabel="finalizar" hint={`${base.length} formas · ${cards.length} cartões`} nextDisabled={state.paymentTypes.length === 0}>
      <PaymentTypesFields />
    </Shell>
  );
}

// ── Passo 4: pronto ────────────────────────────────────────────────
export function Done({ onNext, onBack }: OnbStepProps) {
  const { state } = useStore();
  const cards = state.paymentTypes.filter(t => t.kind === 'card');
  const base = state.paymentTypes.filter(t => t.kind === 'base');

  return (
    <Shell step={3} total={4} onNext={onNext} onBack={onBack} nextLabel="Ir para o app" nextTone={green}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <div style={{ width: 78, height: 78, borderRadius: 99, background: green, color: paper, display: 'grid', placeItems: 'center', fontSize: 38, fontWeight: 800, boxShadow: '0 6px 0 rgba(47,90,72,.25)' }}>✓</div>
        <div style={{ fontWeight: 800, letterSpacing: '-0.026em', fontSize: 38, lineHeight: 1.08 }}>
          Tudo pronto, <span style={{ color: green }}>{state.people[0] ? state.people[0].name : 'você'}</span>!
        </div>
        <div style={{ fontSize: 14.5, color: ink2, maxWidth: 500, lineHeight: 1.55 }}>
          Seu Poupê está personalizado e já vem com alguns lançamentos de exemplo para você explorar. Bora lançar o primeiro gasto de verdade?
        </div>

        <div style={{ marginTop: 6, padding: 17, border: `1.5px solid ${ink}`, borderRadius: 12, background: paper, maxWidth: 560, width: '100%', textAlign: 'left' }}>
          <div style={{ fontSize: 10.5, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 11 }}>o que você configurou</div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '11px 14px', fontSize: 12.5, alignItems: 'start' }}>
            <div style={{ color: muted }}>pessoas</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {state.people.map(p => (
                <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px 2px 3px', border: `1px solid ${ink2}55`, borderRadius: 99, fontSize: 11.5 }}>
                  <span style={{ width: 17, height: 17, borderRadius: 99, background: p.color, color: paper, display: 'grid', placeItems: 'center', fontSize: 9.5, fontWeight: 700 }}>{p.name[0].toUpperCase()}</span>{p.name}
                </span>
              ))}
            </div>
            <div style={{ color: muted }}>categorias</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {state.categories.slice(0, 9).map(c => (
                <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, padding: '2px 8px', border: `1px solid ${c.color}55`, borderRadius: 99, background: `${c.color}10` }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: c.color }} />{c.name}
                </span>
              ))}
              {state.categories.length > 9 && <span style={{ fontSize: 10.5, padding: '2px 6px', color: muted }}>+{state.categories.length - 9}</span>}
            </div>
            <div style={{ color: muted }}>pagamentos</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {base.map(t => <span key={t.id} style={{ fontSize: 10.5, padding: '2px 8px', border: `1px solid ${ink2}33`, borderRadius: 99 }}>{t.name}</span>)}
              {cards.map(c => <span key={c.id} style={{ fontSize: 10.5, padding: '2px 8px', border: `1px solid ${c.color}55`, borderRadius: 99, background: `${c.color}12` }}>💳 {c.name}</span>)}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
