import { style } from '@vanilla-extract/css';

export const empty_container = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    textAlign: 'center',
    color: '#6b7280',
});

export const empty_icon = style({
    fontSize: '2rem',
    marginBottom: '8px',
});

export const empty_text = style({
    fontSize: '0.875rem',
    marginBottom: '16px',
});

export const empty_button = style({
    padding: '8px 16px',
    backgroundColor: '#1d4ed8',
    color: 'white',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
});
