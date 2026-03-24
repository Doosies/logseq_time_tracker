import { style } from '@vanilla-extract/css';

export const toast_container = style({
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 2000,
    maxWidth: '360px',
});

export const toast_item = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    fontSize: '0.875rem',
    color: 'white',
});

export const toast_success = style({ backgroundColor: '#22c55e' });
export const toast_error = style({ backgroundColor: '#ef4444' });
export const toast_warning = style({ backgroundColor: '#f59e0b' });
export const toast_info = style({ backgroundColor: '#3b82f6' });

export const toast_message = style({
    flex: 1,
    marginRight: '8px',
});

export const toast_close = style({
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1.125rem',
    padding: '0 4px',
    opacity: 0.8,
    ':hover': {
        opacity: 1,
    },
});
