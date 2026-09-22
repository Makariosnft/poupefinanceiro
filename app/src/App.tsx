import React from 'react';
import { StoreProvider, useStore } from './lib/store';
import { Toaster, SaveIndicator } from './components/ui';
import { Lancamentos, GastosDoMes, GanhosDoMes, Fixos, Parcelamentos, QuickAddModal } from './screens/transactions';
import { Dividas, Metas, Relatorios } from './screens/insights';
import { CaixinhaScreen } from './screens/caixinha';
import {
  Login, AccountChoice, CreateAccountScreen, JoinAccountScreen, ResetPasswordScreen,
  People, Categories, PaymentTypes, Done, type OnbStepProps,
} from './screens/onboarding';
import { Settings } from './screens/settings';

const SCREENS: Record<string, React.ComponentType<{ onNavigate: (t: string) => void; onOpenModal: () => void }>> = {
  'Lançamentos': Lancamentos,
  'Ganhos do mês': GanhosDoMes,
  'Gastos do mês': GastosDoMes,
  'Fixos': Fixos,
  'Parcelamentos': Parcelamentos,
  'Dívidas': Dividas,
  'Metas': Metas,
  'Caixinha': CaixinhaScreen,
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
    if (initialized.current || state.ui.authLoading || !state.ui.authed || !state.ui.accountChecked) return;
    initialized.current = true;
    setScreen(state.ui.accountId ? 'app' : 'choice');
  }, [state.ui.authLoading, state.ui.authed, state.ui.accountChecked, state.ui.accountId]);

  React.useEffect(() => {
    if (!state.ui.authed) { initialized.current = false; setScreen(null); }
  }, [state.ui.authed]);

  let body: React.ReactNode;
  if (state.ui.passwordRecovery) {
    body = <ResetPasswordScreen />;
  } else if (state.ui.authLoading) {
    body = <Splash />;
  } else if (!state.ui.authed) {
    body = <Login />;
  } else if (!state.ui.accountChecked || screen === null) {
    body = <Splash />;
  } else if (screen === 'choice') {
    body = <AccountChoice onCreate={() => setScreen('create')} onJoin={() => setScreen('join')} />;
  } else if (screen === 'join') {
    body = <JoinAccountScreen onBack={() => setScreen('choice')} onJoined={() => setScreen('app')} />;
  } else if (screen === 'create') {
    body = (
      <CreateAccountScreen
        onBack={() => setScreen('choice')}
        onCreated={() => { setScreen('wizard'); setOnbStep(0); }}
      />
    );
  } else if (screen === 'wizard') {
    const Step = WIZARD_STEPS[onbStep];
    const isLast = onbStep === WIZARD_STEPS.length - 1;
    body = (
      <Step
        onNext={() => (isLast ? setScreen('app') : setOnbStep(s => s + 1))}
        onBack={onbStep > 0 ? () => setOnbStep(s => s - 1) : undefined}
        onSkip={onbStep > 0 && !isLast ? () => setScreen('app') : undefined}
      />
    );
  } else {
    const Screen = SCREENS[tab] || Lancamentos;
    body = (
      <>
        <Screen onNavigate={setTab} onOpenModal={() => setModalOpen(true)} />
        <QuickAddModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {body}
      <Toaster toasts={toasts} />
      <SaveIndicator />
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
