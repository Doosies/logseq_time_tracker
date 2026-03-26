import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const root = style({
    position: 'relative',
    width: '100%',
    maxWidth: '280px',
});

export const trigger = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '8px 12px',
    borderRadius: theme_vars.radius.sm,
    border: `1px solid ${theme_vars.color.border}`,
    backgroundColor: theme_vars.color.background,
    fontSize: theme_vars.font.size.sm,
    cursor: 'pointer',
    textAlign: 'left',
    color: theme_vars.color.text,
    ':focus-visible': {
        outline: `2px solid ${theme_vars.color.primary}`,
        outlineOffset: '2px',
    },
});

export const panel = style({
    position: 'absolute',
    zIndex: theme_vars.z_index.popover,
    top: '100%',
    left: 0,
    marginTop: '4px',
    padding: '10px',
    borderRadius: theme_vars.radius.sm,
    border: `1px solid ${theme_vars.color.border}`,
    backgroundColor: theme_vars.color.background,
    boxShadow: theme_vars.shadow.md,
});

export const header = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
});

export const nav_button = style({
    padding: '4px 10px',
    borderRadius: theme_vars.radius.sm,
    border: `1px solid ${theme_vars.color.border}`,
    backgroundColor: theme_vars.color.surface,
    cursor: 'pointer',
    fontSize: theme_vars.font.size.sm,
    color: theme_vars.color.text,
    ':disabled': {
        opacity: 0.4,
        cursor: 'not-allowed',
    },
});

export const month_label = style({
    fontSize: theme_vars.font.size.sm,
    fontWeight: theme_vars.font.weight.bold,
    color: theme_vars.color.text,
});

export const weekdays = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
    marginBottom: '4px',
    fontSize: theme_vars.font.size.xs,
    color: theme_vars.color.text_secondary,
    textAlign: 'center',
});

export const grid = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
    outline: 'none',
});

export const day_cell = style({
    padding: '6px 0',
    borderRadius: theme_vars.radius.sm,
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    textAlign: 'center',
    color: theme_vars.color.text,
    ':focus-visible': {
        outline: `2px solid ${theme_vars.color.primary}`,
        outlineOffset: '1px',
    },
});

export const day_outside_month = style({
    color: theme_vars.color.text_secondary,
});

export const day_disabled = style({
    opacity: 0.35,
    cursor: 'not-allowed',
    pointerEvents: 'none',
});

export const day_selected = style({
    backgroundColor: theme_vars.color.primary,
    color: theme_vars.color.background,
    fontWeight: theme_vars.font.weight.bold,
});

export const day_today = style({
    borderColor: theme_vars.color.primary_hover,
});
