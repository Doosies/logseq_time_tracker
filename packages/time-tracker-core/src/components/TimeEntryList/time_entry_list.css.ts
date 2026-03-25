import { style } from '@vanilla-extract/css';

export const root = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
});

export const filters = style({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: '12px',
});

export const filter_field = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
});

export const filter_label = style({
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#6b7280',
});

export const list = style({
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
});

export const item = style({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fafafa',
});

export const item_main = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
    flex: '1 1 200px',
});

export const item_title = style({
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: '#111827',
});

export const item_meta = style({
    fontSize: '0.8125rem',
    color: '#6b7280',
});

export const item_time = style({
    fontSize: '0.8125rem',
    color: '#4b5563',
});

export const item_actions = style({
    display: 'flex',
    gap: '6px',
    flexShrink: 0,
});

export const action_button = style({
    padding: '6px 10px',
    fontSize: '0.8125rem',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    cursor: 'pointer',
    ':hover': {
        backgroundColor: '#f3f4f6',
    },
});

export const action_delete = style({
    color: '#b91c1c',
    borderColor: '#fecaca',
    ':hover': {
        backgroundColor: '#fef2f2',
    },
});

export const empty = style({
    padding: '24px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.875rem',
    border: '1px dashed #d1d5db',
    borderRadius: '8px',
});

export const duration_badge = style({
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'ui-monospace, monospace',
    fontSize: '0.8125rem',
    color: '#1d4ed8',
    fontWeight: 600,
});
