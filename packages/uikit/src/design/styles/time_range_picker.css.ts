import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const root = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '320px',
});

export const row = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
});

export const label = style({
    fontSize: theme_vars.font.size.xs,
    fontWeight: theme_vars.font.weight.bold,
    color: theme_vars.color.text,
});

export const time_row = style({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
});

export const time_input = style({
    padding: '6px 8px',
    borderRadius: theme_vars.radius.sm,
    border: `1px solid ${theme_vars.color.border}`,
    fontSize: theme_vars.font.size.sm,
    minWidth: '120px',
    backgroundColor: theme_vars.color.background,
    color: theme_vars.color.text,
});

export const error = style({
    fontSize: theme_vars.font.size.xs,
    color: theme_vars.color.error,
});

export const root_invalid = style({
    outline: `1px solid ${theme_vars.color.error}`,
    outlineOffset: '4px',
    borderRadius: theme_vars.radius.md,
    padding: '8px',
});
