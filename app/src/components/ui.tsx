import React from 'react';
import logo from '../assets/poupe-logo.png';
import { useStore, MONTHS_PT, addMonths, monthLabel, fmt } from '../lib/store';
import type { Toast, Person } from '../lib/types';

export const ink = '#1a1815';
export const ink2 = '#4a463f';
export const muted = '#8a857a';
export const paper = '#fbf8f1';
export const paper2 = '#f3eee2';
export const green = '#2f5a48';
export const red = '#b04a3a';
export const amber = '#c97a3a';
export const blue = '#3a6a8a';
export const gold = '#d4a24a';
export const tokens = { ink, ink2, muted, paper, paper2, green, red, amber, blue, gold };
export const LOGO = logo;

// ── Botão ──────────────────────────────────────────────────────────
interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'dashed';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  full?: boolean;
  tone?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit';
  title?: string;
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, full, tone, style = {}, type = 'button', title }: ButtonProps) {
  const [h, setH] = React.useState(false);
  const [a, setA] = React.useState(false);
  const accent = tone || ink;
  const pads = { sm: '6px 12px', md: '9px 18px', lg: '12px 26px' }[size];
  const fs = { sm: 12, md: 13.5, lg: 15 }[size];
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: pads, fontSize: fs, fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
    letterSpacing: '-0.01em', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
    width: full ? '100%' : undefined, opacity: disabled ? 0.45 : 1,
    transition: 'transform .12s cubic-bezier(.2,.8,.3,1), box-shadow .12s, background .15s, border-color .15s, color .15s',
    transform: a && !disabled ? 'translateY(2px)' : h && !disabled ? 'translateY(-1px)' : 'translateY(0)',
    whiteSpace: 'nowrap', userSelect: 'none', border: '1.5px solid transparent', lineHeight: 1.2,
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: accent, color: paper, borderColor: accent, boxShadow: disabled ? 'none' : a ? `0 1px 0 rgba(0,0,0,.2)` : `0 ${h ? 4 : 3}px 0 rgba(0,0,0,.16)` },
    outline: { background: h ? `${accent}12` : 'transparent', color: accent, borderColor: accent },
    ghost: { background: h ? '#00000008' : 'transparent', color: ink2, borderColor: 'transparent' },
    dashed: { background: h ? '#00000006' : 'transparent', color: ink2, borderColor: ink2, borderStyle: 'dashed' },
  };
  return (
    <button type={type} title={title} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => { setH(false); setA(false); }}
      onMouseDown={() => setA(true)} onMouseUp={() => setA(false)}
      style={{ ...base, ...variants[variant], ...style }}>{children}</button>
  );
}

// ── Botão de ícone ─────────────────────────────────────────────────
interface IconBtnProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  tone?: string;
  size?: number;
}

export function IconBtn({ children, onClick, title, tone = muted, size = 26 }: IconBtnProps) {
  const [h, setH] = React.useState(false);
  return (
    <button type="button" title={title} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: size, height: size, borderRadius: 7, border: 'none', cursor: 'pointer',
        background: h ? `${tone}1c` : 'transparent', color: h ? tone : muted,
        display: 'grid', placeItems: 'center', fontSize: size * 0.5, lineHeight: 1,
        transition: 'background .15s, color .15s, transform .12s', transform: h ? 'scale(1.08)' : 'scale(1)',
        fontFamily: 'Montserrat, sans-serif', padding: 0, flexShrink: 0,
      }}>{children}</button>
  );
}

// ── Campo / Input ──────────────────────────────────────────────────
interface FieldProps {
  label?: string;
  children: React.ReactNode;
  hint?: string;
  style?: React.CSSProperties;
}

export function Field({ label, children, hint, style = {} }: FieldProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0, ...style }}>
      {label && <span style={{ fontSize: 10.5, color: muted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>}
      {children}
      {hint && <span style={{ fontSize: 10.5, color: muted }}>{hint}</span>}
    </label>
  );
}

const fieldBase: React.CSSProperties = {
  fontFamily: 'Montserrat, sans-serif', fontSize: 13.5, fontWeight: 500, color: ink,
  background: paper, border: `1.5px solid ${ink2}55`, borderRadius: 8, padding: '9px 11px',
  outline: 'none', width: '100%', transition: 'border-color .15s, box-shadow .15s, background .15s', minWidth: 0,
};

interface InputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  onEnter?: () => void;
  accent?: string;
  style?: React.CSSProperties;
  min?: string | number;
  step?: string | number;
}

export function Input({ value, onChange, placeholder, type = 'text', onEnter, accent = ink, style = {}, ...rest }: InputProps) {
  const [f, setF] = React.useState(false);
  return (
    <input {...rest} type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      onKeyDown={e => { if (e.key === 'Enter' && onEnter) { e.preventDefault(); onEnter(); } }}
      style={{ ...fieldBase, borderColor: f ? accent : `${ink2}55`, boxShadow: f ? `0 0 0 3px ${accent}1f` : 'none', ...style }} />
  );
}

interface MoneyInputProps {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  accent?: string;
  style?: React.CSSProperties;
}

export function MoneyInput({ value, onChange, onEnter, accent = green, style = {} }: MoneyInputProps) {
  const [f, setF] = React.useState(false);
  return (
    <div style={{ position: 'relative', minWidth: 0, ...style }}>
      <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: muted, fontWeight: 600, pointerEvents: 'none' }}>R$</span>
      <input type="number" step="0.01" min="0" value={value} placeholder="0,00"
        onChange={e => onChange(e.target.value)}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        onKeyDown={e => { if (e.key === 'Enter' && onEnter) { e.preventDefault(); onEnter(); } }}
        style={{ ...fieldBase, paddingLeft: 32, fontWeight: 700, borderColor: f ? accent : `${ink2}55`, boxShadow: f ? `0 0 0 3px ${accent}1f` : 'none' }} />
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  accent?: string;
  style?: React.CSSProperties;
}

export function Select({ value, onChange, options, placeholder, accent = ink, style = {} }: SelectProps) {
  const [f, setF] = React.useState(false);
  return (
    <div style={{ position: 'relative', minWidth: 0, ...style }}>
      <select value={value || ''} onChange={e => onChange(e.target.value)}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          ...fieldBase, appearance: 'none', paddingRight: 28, cursor: 'pointer',
          borderColor: f ? accent : `${ink2}55`, boxShadow: f ? `0 0 0 3px ${accent}1f` : 'none',
          color: value ? ink : muted,
        }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 9, color: muted }}>▼</span>
    </div>
  );
}

// ── Chips ──────────────────────────────────────────────────────────
interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  color?: string;
  onClick?: (e: React.MouseEvent) => void;
  onRemove?: () => void;
  dashed?: boolean;
  style?: React.CSSProperties;
}

export function Chip({ children, active, color, onClick, onRemove, dashed, style = {} }: ChipProps) {
  const [h, setH] = React.useState(false);
  const c = color || ink;
  return (
    <span onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px',
        border: `1.4px ${dashed ? 'dashed' : 'solid'} ${active ? c : h && onClick ? `${c}aa` : `${ink2}55`}`,
        borderRadius: 999, background: active ? c : h && onClick ? `${c}0f` : 'transparent',
        color: active ? paper : ink, fontSize: 12, fontWeight: active ? 600 : 500,
        fontFamily: 'Montserrat, sans-serif', cursor: onClick ? 'pointer' : 'default',
        transition: 'all .15s', whiteSpace: 'nowrap', userSelect: 'none', ...style,
      }}>
      {color && !active && <span style={{ width: 8, height: 8, borderRadius: 99, background: color, flexShrink: 0 }} />}
      {children}
      {onRemove && <span onClick={e => { e.stopPropagation(); onRemove(); }} style={{ marginLeft: 2, opacity: 0.55, cursor: 'pointer', fontSize: 13 }}>×</span>}
    </span>
  );
}

// ── Cartão ─────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  pad?: number;
}

export function Card({ children, style = {}, pad = 14 }: CardProps) {
  return <div style={{ border: `1.5px solid ${ink}`, borderRadius: 10, padding: pad, background: paper, ...style }}>{children}</div>;
}

interface CardTitleProps {
  children: string;
  sub?: string;
  right?: React.ReactNode;
}

export function CardTitle({ children, sub, right }: CardTitleProps) {
  const w = Math.min(150, String(children).length * 9);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10, gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, letterSpacing: '-0.015em', fontSize: 17, lineHeight: 1.1 }}>{children}</div>
        {sub && <div style={{ fontSize: 11.5, color: muted, marginTop: 4 }}>{sub}</div>}
        <svg width={w} height="5" style={{ display: 'block', marginTop: 3 }}>
          <path d={`M 1 2.5 Q ${w * 0.3} 0 ${w * 0.5} 2.5 T ${w - 1} 2.5`} stroke={ink} strokeWidth="1.4" fill="none" />
        </svg>
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

// ── Barras e gráficos ──────────────────────────────────────────────
interface BarProps {
  pct: number;
  color?: string;
  height?: number;
  delay?: number;
}

export function Bar({ pct, color = ink, height = 7, delay = 0 }: BarProps) {
  const [w, setW] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setW(Math.max(0, Math.min(100, pct))), 30 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ height, background: '#0000000d', border: `1px solid ${ink2}2a`, borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ width: `${w}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .6s cubic-bezier(.2,.8,.3,1)' }} />
    </div>
  );
}

interface DonutProps {
  pct?: number;
  size?: number;
  color?: string;
  label?: string;
  stroke?: number;
}

export function Donut({ pct = 0, size = 64, color = ink, label, stroke = 6 }: DonutProps) {
  const r = size / 2 - stroke, c = 2 * Math.PI * r;
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setP(Math.max(0, Math.min(100, pct))), 40);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#00000015" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${(p / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray .7s cubic-bezier(.2,.8,.3,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: size * 0.26, letterSpacing: '-0.02em' }}>
        {label ?? `${Math.round(pct)}%`}
      </div>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, footer, width = 460 }: ModalProps) {
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (open) { const t = setTimeout(() => setShown(true), 10); return () => clearTimeout(t); }
    setShown(false);
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60, display: 'grid', placeItems: 'center', padding: 20,
      background: shown ? 'rgba(20,18,15,0.42)' : 'rgba(20,18,15,0)', backdropFilter: shown ? 'blur(2px)' : 'none',
      transition: 'background .2s, backdrop-filter .2s',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width, maxWidth: '100%', maxHeight: '100%', overflow: 'auto', background: paper,
        border: `1.5px solid ${ink}`, borderRadius: 12, padding: 20,
        boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
        opacity: shown ? 1 : 0, transform: shown ? 'translateY(0) scale(1)' : 'translateY(12px) scale(.97)',
        transition: 'opacity .22s cubic-bezier(.2,.8,.3,1), transform .22s cubic-bezier(.2,.8,.3,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>{title}</div>
          <IconBtn onClick={onClose} title="Fechar (Esc)">✕</IconBtn>
        </div>
        <div style={{ marginTop: 14 }}>{children}</div>
        {footer && <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>{footer}</div>}
      </div>
    </div>
  );
}

// ── Toasts ─────────────────────────────────────────────────────────
export function Toaster({ toasts }: { toasts: Toast[] }) {
  return (
    <div style={{ position: 'absolute', bottom: 18, left: 18, zIndex: 80, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => <ToastItem key={t.id} {...t} />)}
    </div>
  );
}

function ToastItem({ msg, tone }: Toast) {
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => { const x = setTimeout(() => setShown(true), 10); return () => clearTimeout(x); }, []);
  const bg = tone === 'warn' ? amber : tone === 'error' ? red : green;
  return (
    <div style={{
      background: bg, color: paper, padding: '9px 15px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
      boxShadow: '0 8px 24px rgba(0,0,0,0.22)', display: 'flex', alignItems: 'center', gap: 8,
      opacity: shown ? 1 : 0, transform: shown ? 'translateX(0)' : 'translateX(-14px)',
      transition: 'opacity .25s, transform .25s cubic-bezier(.2,.8,.3,1)',
    }}>
      <span style={{ fontSize: 13 }}>{tone === 'warn' ? '⚠' : '✓'}</span>{msg}
    </div>
  );
}

// ── Segmentado (Comum / Fixo / Parcelamento) ───────────────────────
export interface KindOption {
  key: string;
  label: string;
  icon?: string;
  hint?: string;
}

interface KindSwitchProps {
  value: string;
  onChange: (v: string) => void;
  size?: 'sm' | 'md';
  options?: KindOption[];
}

export function KindSwitch({ value, onChange, size = 'sm', options }: KindSwitchProps) {
  const opts: KindOption[] = options || [
    { key: 'comum', label: 'Comum', icon: '•', hint: 'gasto avulso' },
    { key: 'fixo', label: 'Fixo', icon: '↻', hint: 'repete todo mês' },
    { key: 'parcelamento', label: 'Parcelamento', icon: '∥', hint: 'dividido em parcelas' },
  ];
  const pad = size === 'sm' ? '5px 10px' : '8px 14px';
  const fs = size === 'sm' ? 11.5 : 13;
  return (
    <div style={{ display: 'inline-flex', border: `1.4px solid ${ink}`, borderRadius: 9, padding: 2, background: paper, gap: 2 }}>
      {opts.map(o => {
        const on = o.key === value;
        return (
          <button key={o.key} type="button" title={o.hint} onClick={() => onChange(o.key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: pad, borderRadius: 7, border: 'none',
              background: on ? ink : 'transparent', color: on ? paper : ink2,
              fontFamily: 'Montserrat, sans-serif', fontSize: fs, fontWeight: 600, cursor: 'pointer',
              transition: 'background .18s, color .18s', whiteSpace: 'nowrap',
            }}>
            {o.icon && <span style={{ opacity: on ? 1 : 0.5 }}>{o.icon}</span>}{o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Chrome: barra superior + linha do tempo de meses ───────────────
export const TABS = ['Lançamentos', 'Ganhos do mês', 'Gastos do mês', 'Fixos', 'Parcelamentos', 'Dívidas', 'Metas', 'Caixinha', 'Resumo'];

export function TopBar({ activeTab, onNavigate }: { activeTab: string; onNavigate: (tab: string) => void }) {
  const { state, actions } = useStore();
  const month = state.ui.month;
  const year = month.slice(0, 4);
  const activeIdx = Number(month.slice(5, 7)) - 1;

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState<null | 'month' | 'year'>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  const monthCount = state.transactions.filter(t => t.date.slice(0, 7) === month).length;
  const yearCount = state.transactions.filter(t => t.date.slice(0, 4) === year).length;

  return (
    <div style={{ borderBottom: `1.5px solid ${ink}`, background: paper, flexShrink: 0 }}>
      {/* Logo + linha do tempo de meses */}
      <div style={{ display: 'flex', padding: '11px 18px 7px', alignItems: 'center', gap: 14 }}>
        <img src={LOGO} alt="Poupê" style={{ height: 24, width: 'auto', objectFit: 'contain', display: 'block', flexShrink: 0 }} />
        <IconBtn onClick={() => actions.setMonth(addMonths(month, -12))} title="Ano anterior">‹</IconBtn>
        {MONTHS_PT.map((m, i) => {
          const on = i === activeIdx;
          return (
            <button key={m} type="button" onClick={() => actions.setMonth(`${year}-${String(i + 1).padStart(2, '0')}`)}
              style={{
                flex: 1, textAlign: 'center', border: 'none', background: 'transparent', cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif', fontSize: 11.5, fontWeight: 600,
                color: on ? ink : muted, padding: '5px 0', position: 'relative',
                borderTop: on ? `2.5px solid ${ink}` : '1px solid #00000022',
                transition: 'color .15s, border-color .15s', minWidth: 0,
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.color = ink2; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.color = muted; }}>
              {m}
              {on && <span style={{ position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: 99, background: ink }} />}
            </button>
          );
        })}
        <IconBtn onClick={() => actions.setMonth(addMonths(month, 12))} title="Próximo ano">›</IconBtn>
        <div style={{ paddingLeft: 8, fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', flexShrink: 0 }}>{year}</div>
      </div>

      {/* Abas + filtro de pessoa */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 18px 9px', gap: 14 }}>
        <nav style={{ display: 'flex', gap: 2, flex: 1, minWidth: 0, overflowX: 'auto' }}>
          {TABS.map(t => {
            const on = t === activeTab;
            return (
              <button key={t} type="button" onClick={() => onNavigate(t)}
                style={{
                  padding: '6px 11px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontFamily: 'Montserrat, sans-serif', fontSize: 12.5, fontWeight: 600,
                  color: on ? ink : ink2, borderBottom: `2.5px solid ${on ? ink : 'transparent'}`,
                  marginBottom: -1, whiteSpace: 'nowrap', transition: 'color .15s, border-color .15s', flexShrink: 0,
                }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.color = ink; }}
                onMouseLeave={e => { if (!on) e.currentTarget.style.color = ink2; }}>
                {t}
              </button>
            );
          })}
        </nav>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: muted }}>quem:</span>
          <Chip active={state.ui.personId === 'all'} onClick={() => actions.setPerson('all')}>Todos</Chip>
          {state.people.map(p => (
            <Chip key={p.id} active={state.ui.personId === p.id} color={p.color} onClick={() => actions.setPerson(p.id)}>{p.name}</Chip>
          ))}
          <IconBtn onClick={() => onNavigate('Configurações')} title="Configurações">⚙️</IconBtn>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <IconBtn onClick={() => setMenuOpen(o => !o)} title="Apagar dados" tone={red}>🗑</IconBtn>
            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 6, zIndex: 50,
                background: paper, border: `1.4px solid ${ink}`, borderRadius: 8, minWidth: 190,
                boxShadow: '0 10px 26px rgba(0,0,0,.18)', overflow: 'hidden',
              }}>
                {[
                  { key: 'month' as const, label: `Apagar dados de ${monthLabel(month)}` },
                  { key: 'year' as const, label: `Apagar dados de ${year}` },
                ].map(o => (
                  <button key={o.key} type="button" onClick={() => { setMenuOpen(false); setConfirm(o.key); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', border: 'none',
                      background: 'transparent', color: red, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${red}12`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={confirm === 'month'} onClose={() => setConfirm(null)} title={`Apagar dados de ${monthLabel(month)}?`} width={420}
        footer={<>
          <Button variant="ghost" onClick={() => setConfirm(null)}>cancelar</Button>
          <Button tone={red} onClick={() => { actions.deleteMonth(month); setConfirm(null); }} disabled={monthCount === 0}>apagar tudo</Button>
        </>}>
        <div style={{ fontSize: 13, color: ink2, lineHeight: 1.5 }}>
          {monthCount === 0
            ? <>Não há lançamentos em {monthLabel(month)} para apagar.</>
            : <>Isso vai apagar definitivamente <b>{monthCount} lançamento{monthCount > 1 ? 's' : ''}</b> com data em {monthLabel(month)} — comuns, entradas, fixos e parcelamentos cadastrados nesse mês. Essa ação não pode ser desfeita.</>}
        </div>
      </Modal>

      <Modal open={confirm === 'year'} onClose={() => setConfirm(null)} title={`Apagar dados de ${year}?`} width={420}
        footer={<>
          <Button variant="ghost" onClick={() => setConfirm(null)}>cancelar</Button>
          <Button tone={red} onClick={() => { actions.deleteYear(year); setConfirm(null); }} disabled={yearCount === 0}>apagar tudo</Button>
        </>}>
        <div style={{ fontSize: 13, color: ink2, lineHeight: 1.5 }}>
          {yearCount === 0
            ? <>Não há lançamentos em {year} para apagar.</>
            : <>Isso vai apagar definitivamente <b>{yearCount} lançamento{yearCount > 1 ? 's' : ''}</b> com data em {year} — comuns, entradas, fixos e parcelamentos cadastrados nesse ano inteiro. Essa ação não pode ser desfeita.</>}
        </div>
      </Modal>
    </div>
  );
}

// ── FAB ────────────────────────────────────────────────────────────
export function FAB({ onClick }: { onClick: () => void }) {
  const [h, setH] = React.useState(false);
  return (
    <button type="button" onClick={onClick} title="Novo lançamento"
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        position: 'absolute', right: 22, bottom: 22, width: 54, height: 54, borderRadius: 99,
        background: ink, color: paper, border: 'none', fontSize: 26, cursor: 'pointer', zIndex: 30,
        display: 'grid', placeItems: 'center', paddingBottom: 3,
        boxShadow: h ? '0 6px 0 rgba(0,0,0,.2), 0 14px 32px rgba(0,0,0,.24)' : '0 4px 0 rgba(0,0,0,.18), 0 8px 20px rgba(0,0,0,.15)',
        transform: h ? 'translateY(-2px) rotate(90deg)' : 'translateY(0) rotate(0)',
        transition: 'transform .22s cubic-bezier(.2,.8,.3,1), box-shadow .2s',
      }}>+</button>
  );
}

// ── Estado vazio ───────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: string;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '∅', title, hint, action }: EmptyStateProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '28px 16px', textAlign: 'center', color: muted }}>
      <div style={{ fontSize: 26, opacity: 0.5 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: ink2 }}>{title}</div>
      {hint && <div style={{ fontSize: 12, maxWidth: 260, lineHeight: 1.45 }}>{hint}</div>}
      {action}
    </div>
  );
}

// ── Linha com hover (listas) ───────────────────────────────────────
interface RowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  style?: React.CSSProperties;
  last?: boolean;
}

export function Row({ children, onDelete, style = {}, last }: RowProps) {
  const [h, setH] = React.useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        position: 'relative', borderBottom: last ? 'none' : `1px dashed ${ink2}40`,
        background: h ? '#00000006' : 'transparent', transition: 'background .15s',
        borderRadius: 4, ...style,
      }}>
      {children}
      {onDelete && (
        <span style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', opacity: h ? 1 : 0, transition: 'opacity .15s', pointerEvents: h ? 'auto' : 'none' }}>
          <IconBtn onClick={onDelete} title="Excluir" tone={red} size={22}>×</IconBtn>
        </span>
      )}
    </div>
  );
}

// ── Cartão padrão "Gasto por pessoa" (Fixos, Parcelamentos, Resumo) ─
export function PersonSpendCard({ rows, sub = 'gasto total do mês' }: { rows: { person: Person; value: number }[]; sub?: string }) {
  const max = Math.max(1, ...rows.map(r => r.value));
  return (
    <Card pad={12}>
      <CardTitle sub={sub}>Gasto por pessoa</CardTitle>
      {rows.length === 0 ? <EmptyState icon="👥" title="Sem dados" /> : rows.map(r => (
        <div key={r.person.id} style={{ marginBottom: 9 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span><span style={{ width: 8, height: 8, borderRadius: 99, background: r.person.color, display: 'inline-block', marginRight: 6 }} />{r.person.name}</span>
            <span style={{ fontWeight: 700 }}>{fmt(r.value)}</span>
          </div>
          <Bar pct={(r.value / max) * 100} color={r.person.color} height={5} />
        </div>
      ))}
    </Card>
  );
}

// ── Transição de tela ──────────────────────────────────────────────
export function ScreenFade({ k, children }: { k: string; children: React.ReactNode }) {
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => { setShown(false); const t = setTimeout(() => setShown(true), 15); return () => clearTimeout(t); }, [k]);
  return (
    <div style={{
      height: '100%', opacity: shown ? 1 : 0, transform: shown ? 'translateY(0)' : 'translateY(6px)',
      transition: 'opacity .22s ease, transform .22s cubic-bezier(.2,.8,.3,1)',
    }}>{children}</div>
  );
}
