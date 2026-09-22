import React from 'react';
import { TopBar, Chip, Button, Field, Input, tokens } from '../components/ui';
import { useStore } from '../lib/store';
import { PeopleFields, CategoriesFields, PaymentTypesFields } from './onboarding';

const { ink, ink2, muted, paper, paper2, red } = tokens;

interface ScreenProps {
  onNavigate: (tab: string) => void;
  onOpenModal: () => void;
}

const SUBTABS = [
  { key: 'pessoas', label: 'Pessoas' },
  { key: 'categorias', label: 'Categorias' },
  { key: 'pagamentos', label: 'Pagamentos' },
  { key: 'conta', label: 'Convite' },
  { key: 'membros', label: 'Membros' },
] as const;
type SubTab = typeof SUBTABS[number]['key'];

function ContaFields() {
  const { state, toast } = useStore();
  const [copied, setCopied] = React.useState(false);
  const code = state.account?.inviteCode || '';

  const copy = async () => {
    const message = `Vem organizar as finanças comigo no Poupê! Acesse ${window.location.origin}, crie sua conta e entre com o código de convite: ${code}`;
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    catch { toast('Não deu pra copiar automaticamente — selecione o código manualmente', 'warn'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
      <div style={{ padding: 15, border: `1.5px solid ${ink}`, borderRadius: 12, background: paper2 }}>
        <div style={{ fontSize: 10.5, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>conta</div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{state.account?.name || '—'}</div>
        <div style={{ fontSize: 11.5, color: muted, marginTop: 10 }}>código de convite — envie pra quem falta entrar</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <div style={{
            padding: '9px 16px', border: `1.4px solid ${ink}`, borderRadius: 9, background: paper,
            fontSize: 18, fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'monospace',
          }}>{code}</div>
          <Button variant="outline" size="sm" onClick={copy}>{copied ? 'copiado ✓' : 'copiar convite'}</Button>
        </div>
      </div>
    </div>
  );
}

interface Member { user_id: string; email: string; role: string; created_at: string }

function MembersFields() {
  const { actions, toast } = useStore();
  const [members, setMembers] = React.useState<Member[] | null>(null);
  const [pass, setPass] = React.useState('');
  const [pass2, setPass2] = React.useState('');
  const [savingPass, setSavingPass] = React.useState(false);

  React.useEffect(() => { actions.listMembers().then(setMembers); }, [actions]);

  const changePassword = async () => {
    if (pass.length < 6) { toast('A senha precisa ter pelo menos 6 caracteres.', 'warn'); return; }
    if (pass !== pass2) { toast('As senhas não coincidem.', 'warn'); return; }
    setSavingPass(true);
    const ok = await actions.updatePassword(pass);
    setSavingPass(false);
    if (ok) { setPass(''); setPass2(''); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 520 }}>
      <div>
        <div style={{ fontSize: 10.5, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>quem tem acesso</div>
        {members === null ? (
          <div style={{ fontSize: 12.5, color: muted }}>carregando…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map(m => (
              <div key={m.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: `1.5px solid ${ink}`, borderRadius: 10, background: paper2 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{m.email}</span>
                <span style={{ fontSize: 10.5, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{m.role === 'owner' ? 'dono(a)' : 'membro'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ paddingTop: 6, borderTop: `1px dashed ${ink2}2e` }}>
        <div style={{ fontSize: 10.5, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>trocar senha</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="nova senha"><Input type="password" value={pass} onChange={setPass} /></Field>
          <Field label="confirmar nova senha"><Input type="password" value={pass2} onChange={setPass2} onEnter={changePassword} /></Field>
          <div><Button variant="outline" size="sm" onClick={changePassword} disabled={savingPass || !pass || !pass2}>{savingPass ? 'salvando…' : 'salvar nova senha'}</Button></div>
        </div>
      </div>

      <div style={{ paddingTop: 6, borderTop: `1px dashed ${ink2}2e` }}>
        <Button variant="outline" tone={red} onClick={() => actions.signOut()}>Sair da conta</Button>
      </div>
    </div>
  );
}

export function Settings({ onNavigate }: ScreenProps) {
  const [sub, setSub] = React.useState<SubTab>('pessoas');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: paper, overflow: 'hidden' }}>
      <TopBar activeTab="Configurações" onNavigate={onNavigate} />
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '20px 24px' }}>
        <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 4 }}>Configurações</div>
        <div style={{ fontSize: 12.5, color: muted, marginBottom: 16 }}>Ajuste pessoas, categorias e formas de pagamento a qualquer momento — igual no primeiro acesso.</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {SUBTABS.map(t => (
            <Chip key={t.key} active={sub === t.key} color={ink} onClick={() => setSub(t.key)} style={{ padding: '7px 16px', fontSize: 13 }}>{t.label}</Chip>
          ))}
        </div>
        {sub === 'pessoas' && <PeopleFields />}
        {sub === 'categorias' && <CategoriesFields />}
        {sub === 'pagamentos' && <PaymentTypesFields />}
        {sub === 'conta' && <ContaFields />}
        {sub === 'membros' && <MembersFields />}
      </div>
    </div>
  );
}
