import { style } from '@vanilla-extract/css';

export const toolbar_root = style({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
});

export const toolbar_trigger = style({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    minHeight: '36px',
    padding: '6px',
    border: '1px solid var(--tt-border, rgba(0, 0, 0, 0.12))',
    borderRadius: '6px',
    background: 'var(--tt-surface, transparent)',
    cursor: 'pointer',
    color: 'inherit',
});

export const toolbar_icon_only = style({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    minHeight: '36px',
    opacity: 0.7,
});

export const dropdown_panel = style({
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    zIndex: 50,
    minWidth: '260px',
    maxWidth: 'min(320px, 92vw)',
    padding: '12px',
    border: '1px solid var(--tt-border, rgba(0, 0, 0, 0.12))',
    borderRadius: '8px',
    background: 'var(--tt-panel-bg, var(--ls-primary-background-color, #fff))',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
});

export const dropdown_header = style({
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '8px',
    lineHeight: 1.3,
});

export const dropdown_sub = style({
    fontSize: '0.75rem',
    opacity: 0.75,
    marginBottom: '8px',
});

export const button_row = style({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '10px',
});

export const toolbar_btn = style({
    padding: '6px 10px',
    fontSize: '0.75rem',
    borderRadius: '4px',
    border: '1px solid var(--tt-border, rgba(0, 0, 0, 0.15))',
    background: 'var(--tt-surface, transparent)',
    cursor: 'pointer',
    color: 'inherit',
});

export const job_list_heading = style({
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    opacity: 0.65,
    margin: '8px 0 4px',
});

export const job_list = style({
    listStyle: 'none',
    margin: 0,
    padding: 0,
});

export const job_list_item = style({
    margin: 0,
    padding: 0,
});

export const job_list_button = style({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '6px 8px',
    marginBottom: '2px',
    fontSize: '0.8rem',
    border: 'none',
    borderRadius: '4px',
    background: 'transparent',
    cursor: 'pointer',
    color: 'inherit',
    selectors: {
        '&:hover': {
            background: 'var(--tt-hover, rgba(0, 0, 0, 0.06))',
        },
    },
});

export const inline_panel = style({
    padding: '12px',
});

export const full_view_btn = style({
    marginTop: '10px',
    width: '100%',
    padding: '8px',
    fontSize: '0.8rem',
    borderRadius: '6px',
    border: '1px dashed var(--tt-border, rgba(0, 0, 0, 0.2))',
    background: 'transparent',
    cursor: 'pointer',
    color: 'inherit',
});
