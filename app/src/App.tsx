import React from 'react';
import { StoreProvider, useStore } from './lib/store';
import { Toaster } from './components/ui';
import { Lancamentos, GastosDoMes, GanhosDoMes, Fixos, Parcelamentos, QuickAddModal } from './screens/transactions';
import { Diagnostico, Dividas, Metas, Relatorios } from './screens/insights';
import { Login, Welcome, People, Categories, PaymentTypes, Done, type OnbStepProps } from './screens/onboarding';
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

const ONB_STEPS: React.ComponentType<OnbStepProps>[] = [Welcome, People, Categories, PaymentTypes, Done];

function AppShell() {
  const { state, actions, toasts } = useStore();
  const [stage, setStage] = React.useState<'login' | 'onboarding' | 'app'>(() => (
    !state.ui.authed ? 'login' : !state.ui.onboarded ? 'onboarding' : 'app'
  ));
  const [onbStep, setOnbStep] = React.useState(0);
  const [tab, setTab] = React.useState('Lançamentos');
  const [modalOpen, setModalOpen] = React.useState(false);

  if (stage === 'login') {
    return <Login onLogin={() => { actions.login(); setStage('onboarding'); }} />;
  }

  if (stage === 'onboarding') {
    const Step = ONB_STEPS[onbStep];
    const isLast = onbStep === ONB_STEPS.length - 1;
    const finish = () => { actions.completeOnboarding(); setStage('app'); };
    return (
      <Step
        onNext={() => (isLast ? finish() : setOnbStep(s => s + 1))}
        onBack={() => (onbStep > 0 ? setOnbStep(s => s - 1) : setStage('login'))}
        onSkip={onbStep > 0 && !isLast ? finish : undefined}
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
