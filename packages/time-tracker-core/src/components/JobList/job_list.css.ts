import { style } from '@vanilla-extract/css';

export const job_list_container = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '8px',
    listStyle: 'none',
    margin: 0,
});

export const job_list_row = style({
    listStyle: 'none',
});

export const job_item = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: '1px solid #e5e7eb',
    backgroundColor: 'transparent',
    textAlign: 'left',
    font: 'inherit',
    boxSizing: 'border-box',
    ':hover': {
        backgroundColor: '#f3f4f6',
    },
});

export const job_item_selected = style({
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
});

export const job_title = style({
    fontWeight: 500,
});

export const status_badge = style({
    fontSize: '0.75rem',
    padding: '2px 8px',
    borderRadius: '9999px',
});
