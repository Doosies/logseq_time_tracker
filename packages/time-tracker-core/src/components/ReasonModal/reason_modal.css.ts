import { style } from '@vanilla-extract/css';

export const overlay = style({
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
});

export const modal = style({
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
});

export const modal_title = style({
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: '8px',
});

export const modal_description = style({
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '16px',
});

export const textarea = style({
    width: '100%',
    minHeight: '80px',
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

export const char_count = style({
    fontSize: '0.75rem',
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: '4px',
});

export const button_row = style({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '16px',
});

export const button_confirm = style({
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
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
});
