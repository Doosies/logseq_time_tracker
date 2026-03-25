import { style } from '@vanilla-extract/css';

export const field_block = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '12px',
});

export const label = style({
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#374151',
});

export const required_mark = style({
    color: '#dc2626',
});

export const input = style({
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    selectors: {
        '&:disabled': {
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
        },
        '&:focus': {
            outline: '2px solid #3b82f6',
            outlineOffset: '1px',
        },
    },
});

export const textarea = style([
    input,
    {
        resize: 'vertical',
        minHeight: '80px',
    },
]);

export const error_text = style({
    fontSize: '0.75rem',
    color: '#dc2626',
    marginTop: '2px',
});

export const row = style({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
});

export const chip_row = style({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
});

export const chip = style({
    padding: '6px 12px',
    borderRadius: '999px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    selectors: {
        '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.6,
        },
    },
});

export const chip_selected = style({
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
});

export const toggle_track = style({
    position: 'relative',
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    selectors: {
        '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.6,
        },
    },
});

export const toggle_on = style({
    backgroundColor: '#3b82f6',
});

export const toggle_off = style({
    backgroundColor: '#d1d5db',
});

export const toggle_thumb = style({
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    transition: 'transform 0.15s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
});

export const toggle_thumb_on = style({
    transform: 'translateX(20px)',
});

export const select = style([
    input,
    {
        cursor: 'pointer',
    },
]);

export const time_row = style({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
});

export const time_input = style([
    input,
    {
        width: 'auto',
        minWidth: '120px',
    },
]);

export const readonly_value = style({
    display: 'inline-block',
    minWidth: '8rem',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    fontSize: '0.875rem',
    color: '#374151',
});

export const toggle_state_label = style({
    fontSize: '0.8125rem',
    fontWeight: 400,
    color: '#4b5563',
});

export const radio_caption = style({
    fontSize: '0.8125rem',
    fontWeight: 400,
    color: '#374151',
});
