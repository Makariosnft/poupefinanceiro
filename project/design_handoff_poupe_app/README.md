# Handoff: Poupê — App Financeiro (Davi & Eduarda)

## Overview
Poupê is a desktop web app for a couple (Davi & Eduarda) to manage shared finances: quick expense/income entry, fixed bills, installment purchases, one-off monthly spending, category/person reports, an AI-generated monthly "financial health score", an AI debt payoff planner, and an AI savings-goal simulator. This bundle covers first-run auth + onboarding, the main dashboard, and 7 feature screens, all navigable in a single clickable prototype.

## About the Design Files
The files in `prototype/` are **design references built in HTML/React (Babel, in-browser JSX)** — they demonstrate layout, navigation, copy, states, and interaction, but are **not production code to copy as-is**. Recreate this design in the target codebase's existing stack (React/Next, Vue, mobile, etc.) using its established component library, state management, and data layer. If the target project has no existing frontend yet, React is a safe default (the prototype is already React-shaped) but pick whatever fits the codebase.

Open `prototype/Poupê - Protótipo.html` directly in a browser to click through the whole flow. It has NO backend — all data is hardcoded mock data in the JSX files, and the only persisted state is in-memory React state (screen/tab navigation, onboarding step, modal open/close, debt-strategy toggle, goal-scenario toggle).

## Fidelity
**High-fidelity for interaction/structure, low-fidelity for illustration polish.** Layout, spacing, copy, navigation flow, color-coding logic, and component behavior are final. Treat colors/typography below as the real design tokens. The hand-drawn "Note" annotations (small red callout text) seen in some source files are internal design-review scribbles — they are hidden in the prototype (`[data-dev-note]{display:none}`) and should be ignored/deleted entirely, not implemented.

## Screenshots
`screenshots/` contains a PNG per screen for quick visual reference without opening the HTML: `00-login`, `00b`–`04b` (onboarding steps: welcome, people, categories, payment-types, done), `01-lancamentos` through `08-relatorios`. These are supplementary — the HTML prototype is the source of truth for exact spacing/behavior.

## Files
- `prototype/Poupê - Protótipo.html` — the shell: React/Babel setup, routing state machine (login → onboarding → app), the quick-add modal, and the `TAB_COMPONENTS` map wiring tabs to screens. **Start here to understand app structure.**
- `prototype/wireframes.jsx` — shared primitives (Box, Pill, KindSwitch, TopBar, FAB, Note) + 4 dashboard layout explorations (`VarDashboard` is the one wired live as "Lançamentos"; `VarSheet` is wired as "Fixos"; `VarWidgets` and `VarTimeline` are alternate explorations not wired into the live prototype — reference only, skip unless asked).
- `prototype/features-extra.jsx` — Diagnóstico (AI health score) + Dívidas (debt payoff planner) screens, plus their shared `FTopBar`.
- `prototype/goals.jsx` — Metas (AI savings goal simulator) screen + `GTopBar`.
- `prototype/extra2.jsx` — Login screen, Parcelamentos (installments) full dashboard, Gastos do mês (one-off monthly spend) screen, + `PTopBar`.
- `prototype/onboarding.jsx` — 5-step first-run onboarding (Welcome, People, Categories, Payment Types, Done).
- `prototype/assets/poupe-logo-trim.png` — trimmed transparent logo (piggy-bank mark + wordmark). Height ~99px, use `object-fit: contain` when scaling.

## Screens / Views

### 1. Login
**Purpose:** Email/password or social sign-in (Google, Apple, Microsoft).
**Layout:** Full-bleed 2-column split, `grid-template-columns: 1fr 1fr`, no page chrome.
- **Left panel:** dark ink background (`#1a1815`) with two soft radial-gradient accents (green top-left, blue bottom-right, both ~44/33% opacity, 45% spread). Vertically centered content block (logo 50px tall, headline, subcopy) sits slightly above true center (flex column `justify-content: center`, content block above a `marginTop: 40` copyright row so the pair centers as a group, biasing the headline upward). Copyright row pinned via that margin, not `justify-content: space-between` (that was tried and rejected — caused the block to sit too high with dead space below).
- **Right panel:** white/paper background, form centered `max-width: 380px`, `justify-content: flex-start` (NOT center — centering with overflow silently clips top/bottom content on short viewports; anchor to top and let it scroll instead).
- Both panels: `overflow: auto; min-height: 0` so on short viewports content scrolls instead of clipping.
**Components:**
- 3 social buttons, full width, 1.4px border `#4a463f55`, 9px radius, 12px/16px padding, icon glyph + label, hover should darken border (not implemented in prototype — add for real build).
- Divider row: "OU COM E-MAIL" centered between two 1px hairlines, 11px uppercase muted label.
- Email + password fields: bordered boxes (not native inputs in prototype — use real `<input>` in production), 8px radius, 11px/12px padding.
- "esqueci a senha" link top-right of password label, blue (`#3a6a8a`).
- Primary CTA "Entrar →": full width, ink background, paper text, 9px radius, `box-shadow: 0 3px 0 rgba(0,0,0,0.15)` (hard drop-shadow "pressed button" look — reuse this shadow style for ALL primary CTAs app-wide).
- Footer link "Criar conta grátis" bold, inline with "Não tem conta?" muted text.

### 2. Onboarding (5 steps, sequential, no skip logic wired beyond "voltar")
Shared shell `OnbShell`: header row with logo (24px) + step counter ("passo X de Y") + animated dot progress (active dot is a 22px pill, others 6px dots) + "pular →" text (visual only in prototype, wire to skip-to-end in production). Body: eyebrow label (11px, blue, uppercase, letter-spacing 0.14em) → large headline (Montserrat 800, -0.025em tracking, 38px) → subcopy (15px, ink2) → content. Footer: back link (left) + CTA button (right, `NavFooter` component).

- **Step 0 — Welcome:** centered hero, 80px logo, 56px headline with one word in green accent, 3 value-prop cards in a row (`grid-template-columns: repeat(3,1fr)`), single CTA "Começar →" with hard-shadow button style, micro-copy below ("leva uns 2 minutos...").
- **Step 1 — Quem usa o app:** 2-up person cards (colored circular avatar initial, name, "VOCÊ" tag on the primary user), dashed "add person" card spanning both columns, blue info callout about invite-by-email.
- **Step 2 — Categorias:** pre-selected category chips (icon circle + name + remove ×), a second "hidden suggestions" row with a `+` to re-add, dashed "add new category" inline chip, AI tip callout at the bottom. **Pre-stipulated categories (10 shown selected, 2 hidden by default — all editable/removable):** Contas, Mercado, Combustível, Carro, Beleza, Academia, Assinatura, Igreja, Fins de semana, Saúde (these 10 selected) + Roupa, Padaria (hidden/removed by default, one tap to re-add). See Design Tokens for each category's color.
- **Step 3 — Tipos de pagamento:** base payment types as big chips: **Dinheiro, PIX, Boleto, Débito** (all pre-selected) + a distinct "Cartão" chip (always ink-filled, shows "N ativos ▾") that expands into a bank-card sub-panel below. That panel lists active cards as colored card-shaped tiles (bank name, "fecha dia N / vence dia N", × to remove) — **pre-stipulated cards: Nubank (#8a3ffc, active), C6 Bank (#1a1a1a, active)** — plus a dashed "new card" tile and a row of one-tap "suggested banks to add": Banco do Brasil (#fbc630), Caixa (#0066b3), Itaú (#ec7000), Inter (#ff7a00). **The user can add any bank name freely** — these 6 are presets, not an exhaustive list.
- **Step 4 — Pronto:** big green checkmark circle, personalized headline ("Tudo pronto, Davi!"), a recap card summarizing chosen people/categories/payment methods, final CTA "Ir para o app →".

### 3. Lançamentos (main dashboard / home tab)
**Layout:** `grid-template-columns: 1.4fr 1fr`, `gap: 18px`, `padding: 20px`, full height minus header.
**Left column** (flex column, `overflow: auto`, fills 100% height):
- **"Lançar gasto" card:** inline quick-add row — description input, R$ input, categoria/tipo/quem dropdowns, "add" button (ink, hard-shadow) — all in one grid row, no modal for this primary flow. `KindSwitch` (Comum / Fixo / Parcelamento segmented control) sits in the card's title-right slot. Below: "últimos" quick-repeat chips (last-used categories, click to prefill — not wired in prototype, wire in production).
- **"Lançar entrada" card:** same inline-row pattern for income; title-right slot has a Salário/Extra segmented toggle (green accent) instead of KindSwitch; CTA is green "+ entrada" (vs ink "add") to visually distinguish income from expense.
- **"Gastos comuns" card:** scrollable recent-transactions list, columns `12px(dot) | 1.6fr(desc) | 0.9fr(when) | 1fr(category) | 0.7fr(who) | 0.8fr(tipo) | 90px(value, right-aligned, nowrap)`. Category dot uses the category's color.

**Right column** (flex column, `height:100%`, `overflow:auto`, `paddingBottom:60` to clear the FAB):
- **Saldo card** (`paper2` tinted bg): big balance number (44px), income/expense one-liner, small donut (73%) top-right, thin progress bar "usado do mês" below.
- **"Próximos vencimentos" card:** `flex:1` (fills all remaining vertical space — this was deliberately expanded after removing the "Por categoria" card that used to sit below it). Rows use FIXED grid columns `84px | 1fr | 52px | 52px | 66px` for day/desc/tipo/who/value — **every cell must have `whiteSpace:nowrap; overflow:hidden; textOverflow:ellipsis`**, this was a real bug (text bled into neighboring columns without it). Urgency color-codes the "when" label: red `#b04a3a` = today/urgent, orange `#c97a3a` = "em breve" (soon), muted gray = ok/later.
- ~~"Por categoria" card~~ — **removed by explicit request**; do not include a per-category budget-vs-actual card on this screen (it exists elsewhere, see Relatórios).

**FAB:** black circle, 56px, bottom-right `24/24` offset, `+` glyph, hard-shadow (`0 4px 0 rgba(0,0,0,.18), 0 8px 20px rgba(0,0,0,.15)`). Opens the quick-add modal (see below) from anywhere in the app — implemented once in the shell, not per-screen.

### 4. Fixos (VarSheet — spreadsheet-style)
Full data-table with a sticky-feeling header row (checkbox, Descrição, dia, Pessoa, Tipo, Categoria, Valor), zebra striping, inline checkbox to mark paid (checked rows show strikethrough + 55% opacity), a dashed "+ nova linha…" affordance at the list end, and a totals footer row. Sub-toolbar above the table: big "AGOSTO" wordmark + counts, filter pills (todos/a pagar/pagos), group-by pills (pessoa/tipo). Right rail: "Alertas de prazo" (urgency list), "Saídas por tipo" (payment-method breakdown bars), "Davi vs Eduarda" (two donut avatars).

### 5. Parcelamentos (installments — full dashboard, own tab)
3 KPI cards on top: comprometido/mês, ainda falta pagar, quita primeiro (name + count). Below: main list of active installment purchases — each row shows name/category-dot/person/bank, a progress bar with **"current/total" fraction (e.g. "6/12x")**, the fixed installment amount, remaining balance, and next due date. Right rail: vertical timeline sorted by soonest-to-finish, and a per-person monthly-commitment breakdown.
**Critical requirement:** when creating/editing an installment-type expense, the entry form must ask **which installment number is currently being paid** (e.g. "6 de 12") — see the Quick-Add Modal section below; this is what auto-derives progress and remaining balance.

### 6. Gastos do mês (one-off monthly spend, own tab — distinct from Fixos/Parcelamentos)
Purpose: isolate **non-recurring, "comum"-type** spending for the active month only, so irregular/one-time costs (gifts, travel, medical) don't get lost inside routine totals. Hero: total avulso + vs-previous-month delta. Left: full itemized list. Right: category breakdown bars + an explainer callout ("Fixos e parcelamentos já são previsíveis. Esta aba mostra só o imprevisível...") + a smart-suggestion note ("se uma categoria avulsa se repetir 3 meses seguidos, o Poupê sugere transformá-la em fixo").

### 7. Diagnóstico (AI monthly financial health score)
**Hero card** (2-col grid `190px | 1fr`): left cell is the **`ScoreGauge`** — a semi-circle SVG gauge (0–10 scale, colored zone red<4/amber<7/green≥7, tick marks every unit with heavier ticks every 5) with the score printed in the middle (40px, weight 800) and "/10" below. **Every visual property of the gauge (stroke width, tick length, font sizes, vertical offsets) is computed as `value * (size/220)` — i.e. proportional to the `size` prop** — this was a real bug: hardcoded pixel values looked broken when the gauge was resized down. Right cell: AI badge + timestamp, bold takeaway headline, explainer paragraph, 3 action buttons (`whiteSpace:nowrap` required — text wrapped inside the pills otherwise) — solid "Ver relatório completo", outlined "compartilhar", dashed "Refazer diagnóstico".
**"Prioridades" card:** numbered list (colored circular badge 1/2/3), urgency tag (URGENTE/ESSE MÊS/OBSERVE), title + explanation, right-aligned "impacto" (+1.2 pontos etc).
**Right rail:** "Histórico" sparkline (6-month trend, last point highlighted green), **"Composição da nota"** (6 weighted sub-scores, each a labeled progress bar) — this card needs `flex:1` but with a **guaranteed `min-height` (210px used here)**, not `min-height:0`, or its rows silently collapse to zero height when siblings + the card above are tall (real bug found and fixed this way — don't let a `flex:1` list-card have `min-height:0` if the list must always show its full row count). Bottom: dark shareable-card mockup ("minha nota financeira", score badge, "↗ post" button) — this is the deliberate virality/gamification hook, keep it visually similar to a social share card.

### 8. Dívidas (AI debt payoff planner)
Header row: total-debt-remaining KPI (with %-paid bar) + "livre em N meses" projection, next to a **strategy switch card** — toggle between **Avalanche** (highest interest rate first) and **Bola de neve** (smallest balance first), AI-badge + one-line rationale that updates with the toggle (interest saved figure changes: ~R$2.140 avalanche vs less for snowball). Toggling **must** re-sort the debt list and change the timeline/months-to-freedom numbers (implemented via `React.useState` + `.sort()` in the prototype — implement equivalent reactive re-derivation in production, not two static datasets).
Debt list: each row numbered by payoff order, the #1 row gets a **"FOCO AGORA" badge** absolutely positioned at `top:-8` overlapping the card's top border — **the scrollable list container needs `paddingTop` (10px used) to compensate, or that badge gets clipped by the scroll boundary** (real bug, fixed this way). Shows rate badge (color-coded: ≥10%=red, >0%=amber, 0%=green "sem juros"), progress bar, remaining balance, minimum payment.
Right column: vertical timeline of payoff milestones ending in a green checkmark "Livre de dívidas" goal marker, plus a dark-green weekly check-in streak card (gamified retention hook — "5 semanas seguidas no plano").

### 9. Metas (AI savings-goal simulator)
Left rail: goal list (icon, name, target amount, thin progress bar, %), active goal highlighted, dashed "+ nova meta" card.
Center: active-goal hero (current/target amount, big % progress bar, projected months-to-goal that changes with scenario), an SVG line chart plotting 3 overlaid projection lines (solid = current pace, dashed green = "with AI cuts", dotted gold = "turbo mode") all converging on the R$50k target line, then 3 clickable scenario cards below the chart (**clicking a card updates `mode` state → hero numbers, chart emphasis, and "meses mais rápido" comparison all re-derive** — implement as reactive computation from an `aporte` (monthly contribution) value per scenario, not static text).
Right rail: editable parameter list (renda mensal, gastos mensais, sobra [computed/read-only, dashed border to distinguish], aporte na meta, objetivo) and an AI "cortes sugeridos" list (5 concrete spending-cut suggestions, each showing current spend struck through + suggested reduction + monthly savings), ending in a green summary bar with total savings + "aplicar tudo →" CTA.

### 10. Relatórios
Placeholder only ("em construção") — not designed yet, holds the tab's place in navigation. Build per future spec.

## Shared Chrome (appears identically on every app screen — NOT per-screen, implement once)
- **Top bar:** logo (24px height) + 8 tabs (Lançamentos, Gastos do mês, Fixos, Parcelamentos, Diagnóstico, Dívidas, Metas, Relatórios) + person filter (Todos/Davi/Eduarda pills, full names always spelled out — do not abbreviate to initials, that was tried and reverted) + search icon. **This bar must be pixel-identical across every screen** — a real bug in this project was 4 different topbar components (`TopBar`, `FTopBar`, `GTopBar`, `PTopBar` — one per file) silently drifting apart in padding/gap/font-size over iterative edits, making the header visibly resize when switching tabs. **In production, this must be ONE shared component, not copy-pasted per screen.**
  - Tab font-weight is **constant (600)** regardless of active/inactive — do not bold the active tab, use `border-bottom: 2.5px solid` + color change only (bolding changes text width → causes layout shift on click, a real bug found here).
  - All 8 tabs must render on one line, no wrap, `whiteSpace:nowrap`; give the row `overflow-x:auto` as a safety fallback but tune spacing so it's never actually needed at the target viewport.
- **Month timeline:** Jan–Dez row below the tabs, active month (Ago) marked with a small dot + heavier top-border + ink color, others muted gray with a hairline top-border. **Font-weight here is also constant (600)** for the same reason as tabs — do not bold the active month.
- **Quick-Add Modal** (opened by the FAB, works from any screen): title "Novo lançamento" + `KindSwitch` (Comum/Fixo/Parcelamento) at top — **switching the kind must change the form fields below**: Comum shows date; Fixo shows "dia do mês"; **Parcelamento shows an extra required field: "qual parcela está pagando agora?" as two side-by-side number inputs ("current" / "total", e.g. "6" de "12"), styled with a green accent border+background to draw attention** — this is a specific, explicit product requirement, not optional. Below that: categoria chips, quem (person toggle), tipo/cartão dropdown. Footer: keyboard-shortcut hint (⌘↵) + solid "salvar" button.

## Design Tokens

### Colors
- **Ink (primary text/ui):** `#1a1815`
- **Ink 2 (secondary text/borders):** `#4a463f`
- **Muted (tertiary text):** `#8a857a`
- **Paper (background):** `#fbf8f1`
- **Paper 2 (tinted panel bg):** `#f3eee2`
- **Canvas bg (outside the app frame):** `#e9e3d6`
- **Semantic accents:** green `#2f5a48` (positive/income/success), red `#b04a3a` (urgent/debt/over-budget), amber `#c97a3a` (warning/soon), blue `#3a6a8a` (AI/info/links), gold `#d4a24a` (score/highlight)
- **Category colors** (used as dot/chip accents everywhere): Contas `#b04a3a`, Mercado `#7a8a3a`, Combustível `#3a6a8a`, Carro `#2f5a48`, Beleza `#c79bb0`, Academia `#7a6ca8`, Assinatura `#d4a24a`, Igreja `#5a8a9a`, Fins de semana `#c97a3a`, Saúde `#8a9a5a`, Roupa `#a86a6a`, Viagem `#c44a4a`, Padaria `#d4b48a`, Eletrônico `#5a5a8a`
- **Bank/card colors** (for the payment-method system): Nubank `#8a3ffc`, C6 Bank `#1a1a1a`, Banco do Brasil `#fbc630`, Caixa `#0066b3`, Itaú `#ec7000`, Inter `#ff7a00`
- Links: use blue `#3a6a8a` default / a darker shade on hover — not yet defined in the prototype since no `<a>` tags are used, but apply the app's blue accent consistently if real links are added.

### Typography
- **Font:** Montserrat (300/400/500/600/700/800), loaded via Google Fonts. No secondary/display font — this app deliberately moved away from a handwritten/sketch font (Caveat/Kalam) used in early wireframes to this single, more "moderna" (modern) sans-serif per explicit user request partway through the project.
- Display numbers (balances, scores, gauge value): weight 800, tight tracking (`letter-spacing: -0.02em` to `-0.04em` depending on size).
- Headlines: weight 700–800, `-0.01em` to `-0.03em` tracking depending on size.
- Body: weight 400–500, no letter-spacing adjustment.
- Labels/eyebrows: 9–11px, uppercase, `letter-spacing: 0.05em–0.18em`, muted color.
- Minimum readable size used anywhere: 9.5px (tiny person-filter pills) — don't go smaller; 11–13px is the common body range.

### Spacing / Radius / Shadow
- Card border: `1.4–1.5px solid` ink or ink2 (never a plain 1px, and never a colored/tinted border for structural cards — only category-accent cards like bank tiles use color borders).
- Card radius: 6–12px depending on size (small chips 6px, cards 8–10px, big feature tiles 10–12px).
- Primary button shadow (hard "pressed" look, reuse everywhere a primary CTA appears): `0 3px 0 rgba(0,0,0,0.15)` to `0 4px 0 rgba(0,0,0,0.12)` + a soft ambient shadow on the FAB specifically: `0 4px 0 rgba(0,0,0,.18), 0 8px 20px rgba(0,0,0,.15)`.
- Dashed borders (`1.4px dashed`) consistently mean "empty/add/placeholder" affordances (add category, add card, add goal, computed/read-only field) — keep this convention in production.

## Interactions & Behavior
- **Navigation:** Login → 5-step Onboarding (forward/back, no data actually persisted between steps in the prototype — wire real state in production) → main App with 8 tabs. A "↺ reiniciar protótipo" control (dev-only, remove in production) resets to Login.
- **Tab switching:** instant, no transition animation in the prototype; consider a subtle fade/slide in production but keep it fast (<150ms).
- **FAB → modal:** click opens, backdrop click or ✕ closes; `KindSwitch` selection reactively swaps visible fields (see Quick-Add Modal above).
- **Dívidas strategy toggle & Metas scenario cards:** both are the two places in this app where clicking visibly recomputes downstream numbers/sort order — treat these as the reference examples for "make it actually reactive, not three pre-baked screenshots."
- **Checkboxes (Fixos table):** toggling paid/unpaid should strike through the description and dim the row — implemented via conditional style in the prototype, wire to real state/mutation in production.
- No animations/transitions were specified beyond the above; keep motion minimal and functional (this app's visual language is calm/utilitarian, not flashy).

## State Management (for production planning)
Minimum state needed per the modeled flows:
- `authSession` (login state)
- `onboardingStep`, and persisted results of onboarding: selected people, selected/removed categories (with custom additions), selected payment types + custom bank list (each with closing/due day)
- `activeTab`, `activeMonth`, `activePersonFilter`
- Transactions: each needs `{ description, amount, category, paymentType, person, date, kind: 'comum'|'fixo'|'parcelamento', ...(if parcelamento: currentInstallment, totalInstallments, bank) ...(if fixo: dayOfMonth) }`
- Debts: `{ name, totalOwed, paid, interestRate, minPayment, person }` + a derived, recomputed-on-toggle `strategy: 'avalanche'|'snowball'` sort/timeline
- Goals: `{ name, targetAmount, currentAmount, icon, color }` + scenario simulator inputs (income, expenses, contribution) that derive months-to-goal and the 3 chart lines
- Monthly diagnostic score: likely server-computed (AI), cached per month, with a breakdown object of the 6 sub-scores

## Assets
- `assets/poupe-logo-trim.png` — the only real asset. It's the user-provided "Poupê" logo (piggy bank mark + wordmark), background-trimmed to transparent via canvas alpha processing. Use at `height: 24px` in app chrome, `height: 50px` on the login screen's brand panel, `height: 80px` on the onboarding welcome screen. Always `object-fit: contain`, never stretch.
- No other images/icons — all icons in this design are inline emoji (🏠🛟✈🚗👥🏷💳 etc.) or hand-drawn inline SVG (donuts, gauges, sparklines, timelines). If the target design system disallows emoji, swap for an equivalent icon font/library consistently across all screens.
