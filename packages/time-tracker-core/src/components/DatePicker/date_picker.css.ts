import { style } from '@vanilla-extract/css';

export const root = style({
    position: 'relative',
    width: '100%',
    maxWidth: '280px',
});

export const trigger = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textAlign: 'left',
    ':focus-visible': {
        outline: '2px solid #3b82f6',
        outlineOffset: '2px',
    },
});

export const panel = style({
    position: 'absolute',
    zIndex: 50,
    top: '100%',
    left: 0,
    marginTop: '4px',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
});

export const header = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
});

export const nav_button = style({
    padding: '4px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
    fontSize: '0.875rem',
    ':disabled': {
        opacity: 0.4,
        cursor: 'not-allowed',
    },
});

export const month_label = style({
    fontSize: '0.875rem',
    fontWeight: 600,
});

export const weekdays = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
    marginBottom: '4px',
    fontSize: '0.6875rem',
    color: '#6b7280',
    textAlign: 'center',
});

export const grid = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
    outline: 'none',
});

export const day_cell = style({
    padding: '6px 0',
    borderRadius: '4px',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    textAlign: 'center',
    ':focus-visible': {
        outline: '2px solid #3b82f6',
        outlineOffset: '1px',
    },
});

export const day_outside_month = style({
    color: '#bbb',
});

export const day_disabled = style({
    opacity: 0.35,
    cursor: 'not-allowed',
    pointerEvents: 'none',
});

export const day_selected = style({
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontWeight: 600,
});

export const day_today = style({
    borderColor: '#93c5fd',
});
