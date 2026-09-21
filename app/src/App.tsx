import React from 'react';
import { StoreProvider, useStore } from './lib/store';
import { Toaster } from './components/ui';
import { Lancamentos, GastosDoMes, GanhosDoMes, Fixos, Parcelamentos, QuickAddModal } from './screens/transactions';
import { Diagnostico, Dividas, Metas, Relatorios } from './screens/insights';
import {
  Login, AccountChoice, CreateAccountScreen, JoinAccountScreen,
  People, Categories, PaymentTypes, Done, type OnbStepProps,
} from './screens/onboarding';
import { Settings } from './screens/settings';

const SCREENS: Record<string, React.ComponentType<{ onNavigate: (t: string) => void; onOpenModal: () => void }>> = {
  'Lançamentos': Lancamentos,
  'Ganhos do mês': GanhosDoMes,
  'Gastos do mês': GastosDoMes,
  'Fixos': Fixos,
  'Parcelamentos': Parcelamentos,
  'Diagnóstico': Diagnostico,
  'Dívidas': Dividas,
  'Metas': Metas,
  'Relatórios': Relatorios,
  'Configurações': Settings,
};

const WIZARD_STEPS: React.ComponentType<OnbStepProps>[] = [People, Categories, PaymentTypes, Done];

function Splash() {
  return <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#8a857a', fontFamily: 'Montserrat, sans-serif' }}>carregando…</div>;
}

function AppShell() {
  const { state, toasts } = useStore();
  const [tab, setTab] = React.useState('Lançamentos');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [onbMode, setOnbMode] = React.useState<'choice' | 'create' | 'join' | 'wizard'>('choice');
  const [onbStep, setOnbStep] = React.useState(0);

  if (state.ui.authLoading) return <Splash />;
  if (!state.ui.authed) return <Login />;
  if (state.ui.accountLoading) return <Splash />;

  if (!state.ui.accountId || onbMode === 'wizard') {
    if (!state.ui.accountId) {
      if (onbMode === 'join') return <JoinAccountScreen onBack={() => setOnbMode('choice')} />;
      if (onbMode === 'create') {
        return (
          <CreateAccountScreen
            onBack={() => setOnbMode('choice')}
            onCreated={() => { setOnbMode('wizard'); setOnbStep(0); }}
          />
        );
      }
      return <AccountChoice onCreate={() => setOnbMode('create')} onJoin={() => setOnbMode('join')} />;
    }

    const Step = WIZARD_STEPS[onbStep];
    const isLast = onbStep === WIZARD_STEPS.length - 1;
    return (
      <Step
        onNext={() => (isLast ? setOnbMode('choice') : setOnbStep(s => s + 1))}
        onBack={onbStep > 0 ? () => setOnbStep(s => s - 1) : undefined}
        onSkip={onbStep > 0 && !isLast ? () => setOnbMode('choice') : undefined}
      />
    );
  }

  const Screen = SCREENS[tab] || Lancamentos;
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Screen onNavigate={setTab} onOpenModal={() => setModalOpen(true)} />
      <QuickAddModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Toaster toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
