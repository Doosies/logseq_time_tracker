import { style } from '@vanilla-extract/css';

export const root = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
});

export const field_wrap = style({
    marginBottom: '4px',
});

export const error_text = style({
    fontSize: '0.75rem',
    color: '#dc2626',
    marginTop: '4px',
    marginLeft: '2px',
});
