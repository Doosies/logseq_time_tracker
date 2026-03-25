import { style } from '@vanilla-extract/css';

export const full_view_root = style({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    gap: '12px',
});

export const full_layout = style({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: '12px',
    minHeight: '200px',
    minWidth: 0,
});

export const sidebar = style({
    flex: '0 0 40%',
    minWidth: 0,
    maxWidth: '320px',
    overflowY: 'auto',
});

export const main_column = style({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
});

export const tablist = style({
    display: 'flex',
    gap: '4px',
    borderBottom: '1px solid var(--tt-border, rgba(0, 0, 0, 0.12))',
    marginBottom: '8px',
});

export const tab_button = style({
    padding: '8px 12px',
    fontSize: '0.875rem',
    border: 'none',
    borderBottom: '2px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
    color: 'inherit',
    marginBottom: '-1px',
    selectors: {
        '&[aria-selected="true"]': {
            borderBottomColor: 'var(--tt-accent, #3b82f6)',
            fontWeight: 600,
        },
    },
});

export const tab_panel = style({
    flex: 1,
    minWidth: 0,
});

export const add_job_area = style({
    paddingTop: '8px',
});

export const add_job_btn = style({
    width: '100%',
    padding: '8px',
    border: '1px dashed var(--tt-border, rgba(0, 0, 0, 0.2))',
    borderRadius: '4px',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: 'inherit',
});

export const section_label = style({
    fontSize: '0.75rem',
    fontWeight: 600,
    opacity: 0.7,
    marginBottom: '6px',
});

export const settings_block = style({
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid var(--tt-border, rgba(0, 0, 0, 0.08))',
});

export const placeholder_block = style({
    fontSize: '0.8rem',
    opacity: 0.65,
    padding: '12px 0',
});
