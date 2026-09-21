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
  'Resumo': Relatorios,
  'Configurações': Settings,
};

const WIZARD_STEPS: React.ComponentType<OnbStepProps>[] = [People, Categories, PaymentTypes, Done];

type Screen = 'choice' | 'create' | 'join' | 'wizard' | 'app';

function Splash() {
  return <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#8a857a', fontFamily: 'Montserrat, sans-serif' }}>carregando…</div>;
}

function AppShell() {
  const { state, toasts } = useStore();
  const [tab, setTab] = React.useState('Lançamentos');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [screen, setScreen] = React.useState<Screen | null>(null);
  const [onbStep, setOnbStep] = React.useState(0);
  const initialized = React.useRef(false);

  // Decide the starting screen once, right after we know whether this user
  // already belongs to an account (returning user -> app; brand new -> choice).
  // Later transitions are all explicit (see the screens below), so creating
  // an account mid-flow doesn't jump straight past the invite-code/wizard steps.
  React.useEffect(() => {
    if (initialized.current || state.ui.authLoading || !state.ui.authed || state.ui.accountLoading) return;
    initialized.current = true;
    setScreen(state.ui.accountId ? 'app' : 'choice');
  }, [state.ui.authLoading, state.ui.authed, state.ui.accountLoading, state.ui.accountId]);

  React.useEffect(() => {
    if (!state.ui.authed) initialized.current = false;
  }, [state.ui.authed]);

  if (state.ui.authLoading) return <Splash />;
  if (!state.ui.authed) return <Login />;
  if (state.ui.accountLoading || screen === null) return <Splash />;

  if (screen === 'choice') {
    return <AccountChoice onCreate={() => setScreen('create')} onJoin={() => setScreen('join')} />;
  }
  if (screen === 'join') {
    return <JoinAccountScreen onBack={() => setScreen('choice')} onJoined={() => setScreen('app')} />;
  }
  if (screen === 'create') {
    return (
      <CreateAccountScreen
        onBack={() => setScreen('choice')}
        onCreated={() => { setScreen('wizard'); setOnbStep(0); }}
      />
    );
  }
  if (screen === 'wizard') {
    const Step = WIZARD_STEPS[onbStep];
    const isLast = onbStep === WIZARD_STEPS.length - 1;
    return (
      <Step
        onNext={() => (isLast ? setScreen('app') : setOnbStep(s => s + 1))}
        onBack={onbStep > 0 ? () => setOnbStep(s => s - 1) : undefined}
        onSkip={onbStep > 0 && !isLast ? () => setScreen('app') : undefined}
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
