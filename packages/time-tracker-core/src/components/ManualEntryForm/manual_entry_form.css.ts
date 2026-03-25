import { style } from '@vanilla-extract/css';

export const form = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '480px',
});

export const field_group = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
});

export const label = style({
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#374151',
});

export const note_textarea = style({
    width: '100%',
    minHeight: '72px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    resize: 'vertical',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    ':focus': {
        outline: 'none',
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)',
    },
});

export const button_row = style({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '8px',
});

export const button_submit = style({
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
});

export const button_cancel = style({
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    fontSize: '0.875rem',
});
