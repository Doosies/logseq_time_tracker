import { style } from '@vanilla-extract/css';

export const root = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '720px',
});

export const section_title = style({
    fontSize: '1rem',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
});

export const list = style({
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
});

export const list_item = style({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
});

export const badge_system = style({
    fontSize: '0.6875rem',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
});

export const field_meta = style({
    flex: '1 1 200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
});

export const field_label = style({
    fontWeight: 600,
    fontSize: '0.875rem',
    color: '#111827',
});

export const field_sub = style({
    fontSize: '0.75rem',
    color: '#6b7280',
});

export const actions = style({
    display: 'flex',
    flexDirection: 'row',
    gap: '6px',
    alignItems: 'center',
});

export const icon_button = style({
    padding: '6px 10px',
    fontSize: '0.8125rem',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    cursor: 'pointer',
    selectors: {
        '&:disabled': {
            opacity: 0.45,
            cursor: 'not-allowed',
        },
    },
});

export const danger_button = style([
    icon_button,
    {
        borderColor: '#fecaca',
        color: '#b91c1c',
    },
]);

export const form_card = style({
    padding: '14px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
});

export const form_row = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
});

export const checkbox_row = style({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
});

export const form_label = style({
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#374151',
});

export const form_input = style({
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
});

export const form_actions = style({
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    marginTop: '6px',
});

export const primary_button = style({
    padding: '8px 14px',
    fontSize: '0.875rem',
    fontWeight: 600,
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#fff',
    cursor: 'pointer',
    selectors: {
        '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
        },
    },
});

export const error_banner = style({
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    fontSize: '0.8125rem',
});

export const muted = style({
    fontSize: '0.8125rem',
    color: '#6b7280',
});
