import { style } from '@vanilla-extract/css';

export const inline_root = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '8px 0',
    fontSize: '0.875rem',
    minWidth: 0,
});

export const row = style({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
});

export const start_btn = style({
    padding: '8px 14px',
    fontSize: '0.875rem',
    borderRadius: '6px',
    border: '1px solid var(--tt-border, rgba(0, 0, 0, 0.15))',
    background: 'var(--tt-accent, #3b82f6)',
    color: 'var(--tt-on-accent, #fff)',
    cursor: 'pointer',
});

export const category_badge = style({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    fontSize: '0.75rem',
    borderRadius: '999px',
    border: '1px solid var(--tt-border, rgba(0, 0, 0, 0.12))',
    background: 'var(--tt-surface-muted, rgba(0, 0, 0, 0.04))',
    cursor: 'pointer',
    color: 'inherit',
});

export const active_block = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid var(--tt-border, rgba(0, 0, 0, 0.08))',
});

export const muted = style({
    fontSize: '0.75rem',
    opacity: 0.7,
});
