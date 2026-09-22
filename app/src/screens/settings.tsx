import React from 'react';
import { TopBar, Chip, Button, tokens } from '../components/ui';
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
] as const;
type SubTab = typeof SUBTABS[number]['key'];

function ContaFields() {
  const { state, actions, toast } = useStore();
  const [copied, setCopied] = React.useState(false);
  const code = state.account?.inviteCode || '';

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600); }
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
          <Button variant="outline" size="sm" onClick={copy}>{copied ? 'copiado ✓' : 'copiar'}</Button>
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
      </div>
    </div>
  );
}
