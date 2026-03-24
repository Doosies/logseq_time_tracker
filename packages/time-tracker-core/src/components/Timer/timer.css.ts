import { style } from '@vanilla-extract/css';

export const timer_container = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
});

export const timer_display = style({
    fontSize: '2rem',
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'monospace',
});

export const timer_info = style({
    fontSize: '0.875rem',
    color: '#666',
});

export const timer_buttons = style({
    display: 'flex',
    gap: '8px',
});

export const button_base = style({
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
});

export const button_start = style([button_base, { backgroundColor: '#22c55e', color: 'white' }]);
export const button_pause = style([button_base, { backgroundColor: '#f59e0b', color: 'white' }]);
export const button_resume = style([button_base, { backgroundColor: '#3b82f6', color: 'white' }]);
export const button_stop = style([button_base, { backgroundColor: '#ef4444', color: 'white' }]);
export const button_cancel = style([button_base, { backgroundColor: '#6b7280', color: 'white' }]);
export const button_switch = style([button_base, { backgroundColor: '#8b5cf6', color: 'white' }]);
