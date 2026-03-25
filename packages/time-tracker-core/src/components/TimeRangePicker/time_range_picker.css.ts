import { style } from '@vanilla-extract/css';

export const root = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '320px',
});

export const row = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
});

export const label = style({
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#374151',
});

export const time_row = style({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
});

export const time_input = style({
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '0.875rem',
    minWidth: '120px',
});

export const error = style({
    fontSize: '0.75rem',
    color: '#b91c1c',
});

export const root_invalid = style({
    outline: '1px solid #fca5a5',
    outlineOffset: '4px',
    borderRadius: '6px',
    padding: '8px',
});
