/* global React */
// Onboarding flow — first-run welcome + briefing
// 5 steps shown as 5 artboards: Welcome → People → Categories → Payment types → Done

const O_ink = '#1a1815';
const O_ink2 = '#4a463f';
const O_muted = '#8a857a';
const O_paper = '#fbf8f1';
const O_paper2 = '#f3eee2';
const O_green = '#2f5a48';
const O_red = '#b04a3a';
const O_blue = '#3a6a8a';

// Default suggested categories (elegant palette from app)
const SUGGESTED_CATS = [
  { name: 'Contas',         c: '#b04a3a', icon: '⚡' },
  { name: 'Mercado',        c: '#7a8a3a', icon: '🛒' },
  { name: 'Combustível',    c: '#3a6a8a', icon: '⛽' },
  { name: 'Carro',          c: '#2f5a48', icon: '🚗' },
  { name: 'Beleza',         c: '#c79bb0', icon: '✂' },
  { name: 'Academia',       c: '#7a6ca8', icon: '🏋' },
  { name: 'Assinatura',     c: '#d4a24a', icon: '↻' },
  { name: 'Igreja',         c: '#5a8a9a', icon: '⛪' },
  { name: 'Fins de semana', c: '#c97a3a', icon: '🍕' },
  { name: 'Saúde',          c: '#8a9a5a', icon: '+' },
  { name: 'Roupa',          c: '#a86a6a', icon: '👕' },
  { name: 'Padaria',        c: '#d4b48a', icon: '🥐' },
];

// Helper: step progress dots
function StepDots({ step, total = 5 }) {
  return (
    <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} style={{
          width: i === step ? 22 : 6,
          height: 6, borderRadius: 99,
          background: i <= step ? O_ink : '#00000022',
          transition: 'all .2s',
        }} />
      ))}
    </div>
  );
}

// Shared shell — logo + dots + title + content + footer buttons
function OnbShell({ step, totalSteps = 5, eyebrow, title, sub, children, footer }) {
  return (
    <div style={{
      height: '100%', background: O_paper, color: O_ink,
      fontFamily: 'Montserrat, sans-serif',
      display: 'flex', flexDirection: 'column',
      backgroundImage: 'radial-gradient(circle at 90% -10%, #2f5a4810 0%, transparent 40%), radial-gradient(circle at -10% 110%, #3a6a8a0d 0%, transparent 40%)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', borderBottom: `1px dashed ${O_ink2}33` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={window.__resources.poupeLogo} alt="Poupê" style={{ height: 26, display: 'block' }} />
        </div>
        {step !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: O_muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>passo {step + 1} de {totalSteps}</span>
            <StepDots step={step} total={totalSteps} />
            {step < totalSteps - 1 && <span style={{ fontSize: 12, color: O_muted, marginLeft: 12 }}>pular →</span>}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 64px', minHeight: 0, overflow: 'auto' }}>
        {eyebrow && (
          <div style={{ fontSize: 11, color: O_blue, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
            {eyebrow}
          </div>
        )}
        {title && (
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', fontSize: 38, lineHeight: 1.05, color: O_ink, maxWidth: 640 }}>
            {title}
          </div>
        )}
        {sub && (
          <div style={{ fontSize: 15, color: O_ink2, marginTop: 12, lineHeight: 1.5, maxWidth: 580 }}>
            {sub}
          </div>
        )}
        <div style={{ marginTop: 28, flex: 1 }}>{children}</div>
      </div>

      {/* Footer */}
      {footer && (
        <div style={{ padding: '20px 32px', borderTop: `1px dashed ${O_ink2}33`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {footer}
        </div>
      )}
    </div>
  );
}

function NavFooter({ back = 'voltar', next = 'continuar', hint, primary = O_ink, onNext, onBack }) {
  return (
    <>
      <span onClick={onBack} style={{ fontSize: 13, color: O_muted, display: 'flex', alignItems: 'center', gap: 6, cursor: onBack ? 'pointer' : 'default' }}>
        {back && <><span style={{ padding: '4px 0' }}>← {back}</span></>}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {hint && <span style={{ fontSize: 12, color: O_muted }}>{hint}</span>}
        <span onClick={onNext} style={{
          padding: '11px 24px', background: primary, color: O_paper,
          borderRadius: 8, fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700, fontSize: 14, letterSpacing: '-0.005em',
          display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        }}>{next} <span>→</span></span>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 0 — WELCOME
// ═══════════════════════════════════════════════════════════════════
function OnbWelcome({ onNext } = {}) {
  return (
    <OnbShell step={null}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 24, padding: '40px 20px' }}>
        <img src={window.__resources.poupeLogo} alt="Poupê" style={{ height: 80, display: 'block' }} />
        <div style={{ fontSize: 12, color: O_blue, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>
          Boas-vindas
        </div>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, letterSpacing: '-0.03em', fontSize: 56, lineHeight: 1.0, maxWidth: 720 }}>
          Vamos organizar suas <span style={{ color: O_green }}>finanças</span> juntos.
        </div>
        <div style={{ fontSize: 16, color: O_ink2, maxWidth: 540, lineHeight: 1.55 }}>
          Em 4 passos rápidos a gente personaliza o app pra <b>como você gasta</b> —
          sem categorias genéricas, sem tipo de pagamento que você não usa.
        </div>

        {/* 3 quick value props */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 18, maxWidth: 720, width: '100%' }}>
          {[
            ['👥', 'Quem usa', 'Sozinho, casal ou família'],
            ['🏷', 'Suas categorias', 'Edite e adicione livre'],
            ['💳', 'Seus pagamentos', 'PIX, cartões, boletos…'],
          ].map(([emoji, t, s], i) => (
            <div key={i} style={{
              padding: '16px 14px', border: `1.4px solid ${O_ink2}44`, borderRadius: 10,
              background: O_paper, textAlign: 'left',
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.005em' }}>{t}</div>
              <div style={{ fontSize: 12, color: O_muted, marginTop: 3 }}>{s}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 16 }}>
          <span onClick={onNext} style={{
            padding: '14px 40px', background: O_ink, color: O_paper,
            borderRadius: 10, fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em',
            display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            boxShadow: '0 4px 0 rgba(0,0,0,0.12)',
          }}>Começar →</span>
          <span style={{ fontSize: 12, color: O_muted }}>leva uns 2 minutos · você pode mudar tudo depois</span>
        </div>
      </div>
    </OnbShell>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 1 — QUEM USA O APP
// ═══════════════════════════════════════════════════════════════════
function OnbPeople({ onNext, onBack } = {}) {
  const people = [
    { name: 'Davi',    color: '#3a6a8a', main: true,  initial: 'D' },
    { name: 'Eduarda', color: '#c79bb0', main: false, initial: 'E' },
  ];

  return (
    <OnbShell
      step={0}
      eyebrow="01 · quem usa"
      title="Quem vai usar o Poupê?"
      sub="Pode ser só você, um casal ou a família toda. Cada pessoa vira um filtro nos lançamentos."
      footer={<NavFooter back={null} next="continuar para categorias" hint="2 pessoas adicionadas" onNext={onNext} />}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, maxWidth: 640 }}>
        {people.map((p, i) => (
          <div key={i} style={{
            padding: 16, border: `1.6px solid ${O_ink}`, borderRadius: 12,
            background: O_paper, display: 'flex', alignItems: 'center', gap: 14, position: 'relative',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 99,
              background: p.color, color: O_paper,
              display: 'grid', placeItems: 'center',
              fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em',
            }}>{p.initial}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>{p.name}</span>
                {p.main && <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '2px 7px', borderRadius: 99, background: O_ink, color: O_paper,
                }}>você</span>}
              </div>
              <div style={{ fontSize: 11, color: O_muted, marginTop: 4 }}>
                cor de identificação · clique pra trocar
              </div>
            </div>
            {!p.main && <span style={{ color: O_muted, fontSize: 18, cursor: 'pointer' }}>×</span>}
          </div>
        ))}

        {/* Add person card */}
        <div style={{
          padding: 16, border: `1.6px dashed ${O_ink2}`, borderRadius: 12,
          background: 'transparent', display: 'flex', alignItems: 'center', gap: 14,
          color: O_muted, gridColumn: 'span 2',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 99, border: `1.5px dashed ${O_ink2}`,
            display: 'grid', placeItems: 'center', fontSize: 26, color: O_ink2,
          }}>+</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: O_ink2 }}>Adicionar mais alguém</div>
            <div style={{ fontSize: 12, marginTop: 3 }}>filho, mãe, sócio… quem mais lança gastos junto</div>
          </div>
        </div>
      </div>

      {/* Compartilhamento hint */}
      <div style={{
        marginTop: 20, padding: '12px 14px',
        background: `${O_blue}10`, border: `1px dashed ${O_blue}66`, borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 10, maxWidth: 640,
      }}>
        <span style={{ fontSize: 18 }}>👫</span>
        <div style={{ fontSize: 12.5, color: O_ink2, lineHeight: 1.4 }}>
          <b>Mais de uma pessoa?</b> O Poupê envia um convite por e-mail e cada um lança do seu jeito.
          Os dois veem tudo, mas você pode filtrar por pessoa.
        </div>
      </div>
    </OnbShell>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 2 — CATEGORIAS
// ═══════════════════════════════════════════════════════════════════
function OnbCategories({ onNext, onBack } = {}) {
  const selected = SUGGESTED_CATS.slice(0, 10); // first 10 selected
  const removed = SUGGESTED_CATS.slice(10);

  return (
    <OnbShell
      step={1}
      eyebrow="02 · categorias"
      title="Como você organiza seus gastos?"
      sub="Sugerimos algumas categorias comuns. Tire o que você não usa, mantenha o que faz sentido, e crie as suas."
      footer={<NavFooter next="continuar para tipos" hint="10 selecionadas · 2 ocultas" onNext={onNext} onBack={onBack} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Selected */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: O_muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
              suas categorias
            </div>
            <div style={{ fontSize: 11, color: O_muted }}>arraste para reordenar</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selected.map((cat, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '7px 12px 7px 10px',
                border: `1.4px solid ${cat.c}`,
                borderRadius: 99,
                background: `${cat.c}12`,
                fontSize: 13, fontWeight: 600, color: O_ink,
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 99,
                  background: cat.c, color: O_paper,
                  display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700,
                }}>{cat.icon}</span>
                {cat.name}
                <span style={{ color: O_muted, fontSize: 14, marginLeft: 2, cursor: 'pointer', opacity: 0.6 }}>×</span>
              </div>
            ))}

            {/* Add new — inline input style */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px 6px 10px',
              border: `1.4px dashed ${O_ink2}`,
              borderRadius: 99,
              background: O_paper,
              fontSize: 13,
            }}>
              {/* Color swatch picker preview */}
              <span style={{ display: 'inline-flex', gap: 3 }}>
                <span style={{ width: 12, height: 12, borderRadius: 99, background: '#6a8a8a' }} />
              </span>
              <span style={{ color: O_muted }}>nome da categoria…</span>
              <span style={{
                padding: '3px 9px', background: O_ink, color: O_paper, borderRadius: 99,
                fontSize: 11, fontWeight: 700, marginLeft: 2,
              }}>+ adicionar</span>
            </div>
          </div>
        </div>

        {/* Removed/Hidden */}
        <div>
          <div style={{ fontSize: 12, color: O_muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
            sugestões que você ocultou
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {removed.map((cat, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '7px 12px 7px 10px',
                border: `1.4px dashed ${O_ink2}55`,
                borderRadius: 99,
                background: 'transparent',
                fontSize: 13, color: O_muted, opacity: 0.7,
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 99,
                  background: `${cat.c}55`, color: O_paper,
                  display: 'grid', placeItems: 'center', fontSize: 11,
                }}>{cat.icon}</span>
                {cat.name}
                <span style={{ color: O_green, fontSize: 14, marginLeft: 2, cursor: 'pointer', fontWeight: 700 }}>+</span>
              </div>
            ))}
          </div>
        </div>

        {/* IA suggestion */}
        <div style={{
          marginTop: 6, padding: '12px 14px',
          background: `${O_blue}10`, border: `1px dashed ${O_blue}66`, borderRadius: 8,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{
            padding: '2px 7px', background: O_blue, color: O_paper, borderRadius: 99,
            fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', flexShrink: 0, marginTop: 1,
          }}>IA</span>
          <div style={{ fontSize: 12.5, color: O_ink2, lineHeight: 1.4 }}>
            <b>Dica:</b> casais costumam adicionar "Pets", "Filhos" e "Casa" como categorias próprias.
            Você pode também marcar uma categoria como <b>fixa do mês</b> (ex: Aluguel, Energia) que ela aparece sempre nos vencimentos.
          </div>
        </div>
      </div>
    </OnbShell>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 3 — TIPO DE PAGAMENTO (com cartões personalizáveis)
// ═══════════════════════════════════════════════════════════════════
function OnbPaymentTypes({ onNext, onBack } = {}) {
  // Pre-stipulated payment types
  const types = [
    { name: 'Dinheiro', icon: '💵', c: '#7a8a3a', selected: true },
    { name: 'PIX',      icon: '⚡',  c: '#2f5a48', selected: true },
    { name: 'Boleto',   icon: '🧾', c: '#5a8a9a', selected: true },
    { name: 'Débito',   icon: '🏧', c: '#3a6a8a', selected: true },
  ];

  // Cards (sub-types of "Cartão")
  const cards = [
    { name: 'Nubank',            color: '#8a3ffc', selected: true,  closing: 18, due: 25 },
    { name: 'C6 Bank',           color: '#1a1a1a', selected: true,  closing: 15, due: 22 },
    { name: 'Banco do Brasil',   color: '#fbc630', selected: false, closing: 10, due: 17 },
    { name: 'Caixa',             color: '#0066b3', selected: false, closing: 5,  due: 12 },
    { name: 'Itaú',              color: '#ec7000', selected: false, closing: 20, due: 27 },
    { name: 'Inter',             color: '#ff7a00', selected: false, closing: 25, due: 2  },
  ];

  const PaymentChip = ({ t, big }) => (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: big ? '9px 14px 9px 11px' : '7px 12px 7px 10px',
      border: `1.5px solid ${t.selected ? t.c : O_ink2 + '55'}`,
      borderRadius: 10,
      background: t.selected ? `${t.c}12` : 'transparent',
      fontSize: big ? 14 : 13,
      fontWeight: t.selected ? 600 : 500,
      color: t.selected ? O_ink : O_muted,
    }}>
      <span style={{
        width: big ? 26 : 22, height: big ? 26 : 22, borderRadius: 7,
        background: t.selected ? t.c : `${t.c}33`,
        color: O_paper, display: 'grid', placeItems: 'center', fontSize: big ? 13 : 11,
      }}>{t.icon}</span>
      {t.name}
      <span style={{ color: O_muted, fontSize: 14, marginLeft: 2, cursor: 'pointer', opacity: 0.6 }}>
        {t.selected ? '×' : '+'}
      </span>
    </div>
  );

  return (
    <OnbShell
      step={2}
      eyebrow="03 · pagamentos"
      title="Como você costuma pagar?"
      sub="Marque tudo que usa. Pra cartão, adicione cada banco — vai aparecer no menu de lançamento."
      footer={<NavFooter next="continuar para os fixos" hint="4 tipos · 2 cartões" onNext={onNext} onBack={onBack} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Base types */}
        <div>
          <div style={{ fontSize: 12, color: O_muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
            formas de pagamento
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {types.map((t, i) => <PaymentChip key={i} t={t} big />)}

            {/* Cartão — sempre presente, expande */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 14px 9px 11px',
              border: `1.5px solid ${O_ink}`,
              borderRadius: 10,
              background: O_ink, color: O_paper,
              fontSize: 14, fontWeight: 700,
              boxShadow: '0 2px 0 rgba(0,0,0,0.15)',
            }}>
              <span style={{
                width: 26, height: 26, borderRadius: 7,
                background: O_paper, color: O_ink,
                display: 'grid', placeItems: 'center', fontSize: 13,
              }}>💳</span>
              Cartão
              <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>2 ativos ▾</span>
            </div>
          </div>
        </div>

        {/* Expanded cards section */}
        <div style={{
          padding: 16, border: `1.5px solid ${O_ink}`, borderRadius: 12,
          background: O_paper2,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: O_muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                seus cartões
              </div>
              <div style={{ fontSize: 11, color: O_muted, marginTop: 2 }}>
                cada cartão vira uma opção no menu de pagamento
              </div>
            </div>
            <span style={{
              padding: '5px 11px', background: O_ink, color: O_paper, borderRadius: 7,
              fontSize: 11, fontWeight: 700, letterSpacing: '-0.005em',
            }}>+ novo cartão</span>
          </div>

          {/* Cards list — active ones */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {cards.filter(c => c.selected).map((card, i) => (
              <div key={i} style={{
                position: 'relative',
                padding: '14px 14px 12px',
                borderRadius: 10,
                background: card.color, color: O_paper,
                overflow: 'hidden',
              }}>
                {/* faux card pattern */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                  <div>
                    <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase' }}>cartão</div>
                    <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.015em', marginTop: 2 }}>{card.name}</div>
                  </div>
                  <span style={{ fontSize: 16, opacity: 0.7, cursor: 'pointer' }}>×</span>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 11, opacity: 0.85, position: 'relative' }}>
                  <span>fecha dia <b>{card.closing}</b></span>
                  <span>vence dia <b>{card.due}</b></span>
                </div>
              </div>
            ))}

            {/* Add new card placeholder */}
            <div style={{
              padding: 14,
              border: `1.5px dashed ${O_ink2}`, borderRadius: 10,
              background: O_paper, color: O_muted,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 90,
            }}>
              <div>
                <div style={{ fontSize: 10, color: O_muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>novo cartão</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: O_ink2, marginTop: 4 }}>Nome do banco…</div>
              </div>
              <div style={{ fontSize: 11, color: O_muted }}>+ adicionar</div>
            </div>
          </div>

          {/* Suggested banks */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: O_muted, marginBottom: 6 }}>sugestões — clique pra adicionar</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cards.filter(c => !c.selected).map((card, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px',
                  border: `1.3px dashed ${O_ink2}66`, borderRadius: 99,
                  background: 'transparent', color: O_ink2,
                  fontSize: 12,
                }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: card.color }} />
                  {card.name}
                  <span style={{ color: O_green, fontWeight: 700, fontSize: 13 }}>+</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </OnbShell>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 4 — DONE
// ═══════════════════════════════════════════════════════════════════
function OnbDone({ onNext, onBack } = {}) {
  return (
    <OnbShell step={3} totalSteps={4}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 18, padding: '20px 20px' }}>
        {/* Big check */}
        <div style={{
          width: 88, height: 88, borderRadius: 99,
          background: O_green, color: O_paper,
          display: 'grid', placeItems: 'center',
          fontSize: 44, fontWeight: 800,
          boxShadow: '0 6px 0 rgba(47,90,72,0.25)',
        }}>✓</div>

        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', fontSize: 42, lineHeight: 1.05, maxWidth: 720 }}>
          Tudo pronto, <span style={{ color: O_green }}>Davi</span>!
        </div>
        <div style={{ fontSize: 15, color: O_ink2, maxWidth: 540, lineHeight: 1.55 }}>
          Seu Poupê está personalizado. Bora lançar o primeiro gasto?
        </div>

        {/* Summary card */}
        <div style={{
          marginTop: 10,
          padding: 18,
          border: `1.5px solid ${O_ink}`, borderRadius: 12,
          background: O_paper, maxWidth: 560, width: '100%', textAlign: 'left',
        }}>
          <div style={{ fontSize: 11, color: O_muted, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
            o que você configurou
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '12px 16px', fontSize: 13 }}>
            <div style={{ color: O_muted }}>pessoas</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px 2px 4px', border: `1px solid ${O_ink2}66`, borderRadius: 99, fontSize: 12 }}>
                <span style={{ width: 18, height: 18, borderRadius: 99, background: '#3a6a8a', color: O_paper, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>D</span>
                Davi
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px 2px 4px', border: `1px solid ${O_ink2}66`, borderRadius: 99, fontSize: 12 }}>
                <span style={{ width: 18, height: 18, borderRadius: 99, background: '#c79bb0', color: O_paper, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>E</span>
                Eduarda
              </span>
            </div>

            <div style={{ color: O_muted }}>categorias</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {SUGGESTED_CATS.slice(0, 10).map((cat, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '2px 8px', border: `1px solid ${cat.c}55`, borderRadius: 99, background: `${cat.c}10` }}>
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: cat.c }} />
                  {cat.name}
                </span>
              ))}
              <span style={{ fontSize: 11, padding: '2px 8px', color: O_muted }}>+10</span>
            </div>

            <div style={{ color: O_muted }}>pagamentos</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {['Dinheiro', 'PIX', 'Boleto', 'Débito'].map((t, i) => (
                <span key={i} style={{ fontSize: 11, padding: '2px 8px', border: `1px solid ${O_ink2}33`, borderRadius: 99 }}>{t}</span>
              ))}
              <span style={{ fontSize: 11, padding: '2px 8px', border: `1px solid #8a3ffc55`, borderRadius: 99, background: '#8a3ffc12' }}>💳 Nubank</span>
              <span style={{ fontSize: 11, padding: '2px 8px', border: `1px solid #1a1a1a55`, borderRadius: 99, background: '#1a1a1a10' }}>💳 C6 Bank</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
          <span onClick={onBack} style={{ fontSize: 13, color: O_muted, padding: '11px 18px', cursor: 'pointer' }}>← revisar</span>
          <span onClick={onNext} style={{
            padding: '14px 32px', background: O_ink, color: O_paper,
            borderRadius: 10, fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700, fontSize: 15, letterSpacing: '-0.005em',
            display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            boxShadow: '0 4px 0 rgba(0,0,0,0.12)',
          }}>Ir para o app →</span>
        </div>
      </div>
    </OnbShell>
  );
}

Object.assign(window, {
  OnbWelcome, OnbPeople, OnbCategories, OnbPaymentTypes, OnbDone,
});
