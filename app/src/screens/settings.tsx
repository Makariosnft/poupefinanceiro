import React from 'react';
import { TopBar, Chip, tokens } from '../components/ui';
import { PeopleFields, CategoriesFields, PaymentTypesFields } from './onboarding';

const { ink, muted, paper } = tokens;

interface ScreenProps {
  onNavigate: (tab: string) => void;
  onOpenModal: () => void;
}

const SUBTABS = [
  { key: 'pessoas', label: 'Pessoas' },
  { key: 'categorias', label: 'Categorias' },
  { key: 'pagamentos', label: 'Pagamentos' },
] as const;
type SubTab = typeof SUBTABS[number]['key'];

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
      </div>
    </div>
  );
}
