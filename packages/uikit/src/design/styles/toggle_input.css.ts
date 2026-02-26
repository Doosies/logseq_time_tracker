import { style } from '@vanilla-extract/css';
import { theme_vars } from '../theme/contract.css';

export const toggle_input_container = style({
    display: 'flex',
    alignItems: 'center',
    gap: theme_vars.space.xs,
    height: '28px',
    flex: 1,
    minWidth: 0,
});

export const toggle_icon = style({
    cursor: 'pointer',
    fontSize: theme_vars.font.size.sm,
    marginLeft: theme_vars.space.xs,
    color: theme_vars.color.text_secondary,
    transition: 'color 0.15s ease, transform 0.1s ease',
    ':hover': {
        color: theme_vars.color.primary,
        transform: 'scale(1.15)',
    },
    ':active': {
        transform: 'scale(0.9)',
    },
});

export const prefix_container = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 6px',
    border: `1px solid ${theme_vars.color.border}`,
    borderRadius: theme_vars.radius.sm,
    boxSizing: 'border-box',
    minWidth: '50px',
    height: '28px',
    textAlign: 'center',
    fontSize: theme_vars.font.size.sm,
    backgroundColor: theme_vars.color.background,
    whiteSpace: 'nowrap',
});
